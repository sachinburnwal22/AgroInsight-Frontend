"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/utils";

interface Player {
  socketId: string;
  userId: number;
  username: string;
  x: number;
  z: number;
  rotationY: number;
  animation: 'idle' | 'walking';
}

interface ChatMessage {
  id: string;
  senderId: number;
  senderName: string;
  message: string;
  timestamp: string;
}

interface Invite {
  id: number;
  sender_id: number;
  receiver_id: number;
  status: string;
  sender: {
    id: number;
    name: string;
  };
}

interface MultiplayerContextType {
  socket: Socket | null;
  onlinePlayers: Player[];
  activeInvite: Invite | null;
  currentSession: any | null;
  chatMessages: ChatMessage[];
  lastInteraction: string | null;
  webrtcConnected: boolean;
  isMuted: boolean;
  sendInvite: (receiverId: number) => Promise<boolean>;
  respondToInvite: (inviteId: number, response: 'accepted' | 'rejected') => Promise<void>;
  sendMessage: (messageText: string) => void;
  emitMovement: (x: number, z: number, rotationY: number, animation: 'idle' | 'walking') => void;
  emitInteraction: (shopName: string) => void;
  leaveSession: () => Promise<void>;
  toggleMute: () => void;
  setOnlinePlayers: React.Dispatch<React.SetStateAction<Player[]>>;
}

const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined);

export const MultiplayerProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, token } = useAuth();
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlinePlayers, setOnlinePlayers] = useState<Player[]>([]);
  const [activeInvite, setActiveInvite] = useState<Invite | null>(null);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [lastInteraction, setLastInteraction] = useState<string | null>(null);
  
  // Voice call states
  const [webrtcConnected, setWebrtcConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // WebRTC references
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeRoomIdRef = useRef<string | null>(null);

  // Connect to Socket server when user logs in
  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:3001";
    const newSocket = io(socketUrl, { autoConnect: true });

    newSocket.on("connect", () => {
      console.log("Socket client connected:", newSocket.id);
      newSocket.emit("register_user", { userId: user.id, username: user.name });
    });

    // Handle invitation received in real-time
    newSocket.on("invitation_received", (invite: Invite) => {
      if (invite.receiver_id === user.id) {
        setActiveInvite(invite);
        toast.info(`🌾 ${invite.sender.name} invited you to explore AgriMarket!`, {
          duration: 10000,
          action: {
            label: "Review",
            onClick: () => {
              // Open notification alert
            }
          }
        });
      }
    });

    // Handle invitation response (for host)
    newSocket.on("invitation_accepted_notify", ({ session }) => {
      setCurrentSession(session);
      toast.success("Invitation accepted! Redirecting to AgriMarket...");
      router.push(`/market?roomId=${session.room_id}`);
    });

    newSocket.on("invitation_rejected_notify", ({ senderName }) => {
      toast.error(`${senderName} rejected your invitation.`);
    });

    // Multiplayer room synchronization events
    newSocket.on("current_players", (players: Player[]) => {
      setOnlinePlayers(players);
      if (players.length > 0) {
        initiatePeerConnection(newSocket, activeRoomIdRef.current || "", players[0].socketId);
      }
    });

    newSocket.on("player_joined", (player: Player) => {
      setOnlinePlayers((prev) => {
        if (prev.some((p) => p.socketId === player.socketId)) return prev;
        return [...prev, player];
      });
      toast.info(`${player.username} entered the market.`);
      initiatePeerConnection(newSocket, activeRoomIdRef.current || "", player.socketId);
    });

    newSocket.on("player_moved", (movementData: { socketId: string; x: number; z: number; rotationY: number; animation: 'idle' | 'walking' }) => {
      setOnlinePlayers((prev) =>
        prev.map((p) =>
          p.socketId === movementData.socketId
            ? { ...p, x: movementData.x, z: movementData.z, rotationY: movementData.rotationY, animation: movementData.animation }
            : p
        )
      );
    });

    newSocket.on("player_left", ({ socketId }) => {
      setOnlinePlayers((prev) => {
        const leavingPlayer = prev.find((p) => p.socketId === socketId);
        if (leavingPlayer) {
          toast.info(`${leavingPlayer.username} left the session.`);
        }
        return prev.filter((p) => p.socketId !== socketId);
      });
    });

    // Message events
    newSocket.on("chat_message_received", (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    // Interaction feedback events
    newSocket.on("player_interaction", ({ username, shopName }) => {
      setLastInteraction(`${username} opened ${shopName}`);
      setTimeout(() => setLastInteraction(null), 5000);
    });

    // WebRTC signaling relay events
    newSocket.on("webrtc_signal", async ({ signal, senderId }) => {
      try {
        if (signal.type === "offer") {
          await handleOfferReceived(newSocket, signal, senderId);
        } else if (signal.type === "answer") {
          await handleAnswerReceived(signal);
        } else if (signal.candidate) {
          await handleIceCandidateReceived(signal);
        }
      } catch (err) {
        console.warn("WebRTC Signaling Error", err);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Handle active room state based on URL parameters
  const searchParams = useSearchParams();
  const urlRoomId = searchParams.get("roomId");

  useEffect(() => {
    activeRoomIdRef.current = urlRoomId;
    if (!socket || !user || !urlRoomId) {
      if (currentSession && !urlRoomId) {
        // Exited session
        setCurrentSession(null);
        setOnlinePlayers([]);
        setChatMessages([]);
        closeWebRTC();
      }
      return;
    }

    // Join room session
    socket.emit("join_session", {
      roomId: urlRoomId,
      userId: user.id,
      username: user.name
    });

    setCurrentSession({
      room_id: urlRoomId,
      host_id: currentSession?.host_id,
      guest_id: currentSession?.guest_id || user.id
    });

    // Automatically trigger voice call setup
    setupVoiceCall(socket, urlRoomId);

    return () => {
      socket.emit("leave_session", { roomId: urlRoomId });
      closeWebRTC();
    };
  }, [socket, urlRoomId]);

  // Send an invitation
  const sendInvite = async (receiverId: number): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/invite/send`,
        { receiver_id: receiverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status === "success") {
        const invite = res.data.invite;
        // Notify user via socket if online
        if (socket && user) {
          socket.emit("send_invite", {
            inviteId: invite.id,
            senderId: user.id,
            senderName: user.name,
            receiverId: receiverId
          });
        }
        return true;
      }
    } catch (err) {
      toast.error("Failed to send invitation.");
    }
    return false;
  };

  // Respond to invitation (Accept / Reject)
  const respondToInvite = async (inviteId: number, response: 'accepted' | 'rejected') => {
    if (!token) return;
    const senderId = activeInvite?.sender_id;
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/invite/respond`,
        { invite_id: inviteId, response },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setActiveInvite(null);

      if (res.data.status === "success") {
        if (response === "accepted") {
          const session = res.data.session;
          setCurrentSession(session);
          
          if (socket && senderId) {
            socket.emit("respond_invite", {
              inviteId,
              response,
              senderId,
              receiverId: user?.id,
              receiverName: user?.name,
              session
            });
          }

          toast.success("Joined market co-explore session!");
          router.push(`/market?roomId=${session.room_id}`);
        } else {
          if (socket && senderId) {
            socket.emit("respond_invite", {
              inviteId,
              response,
              senderId,
              receiverId: user?.id,
              receiverName: user?.name
            });
          }
          toast.info("Invitation rejected.");
        }
      }
    } catch (err) {
      toast.error("Failed to process invitation.");
    }
  };

  // Send message
  const sendMessage = (messageText: string) => {
    if (!socket || !currentSession || !user) return;
    socket.emit("chat_message", {
      roomId: currentSession.room_id,
      senderId: user.id,
      senderName: user.name,
      message: messageText
    });
  };

  // Sync positions
  const emitMovement = (x: number, z: number, rotationY: number, animation: 'idle' | 'walking') => {
    if (!socket || !currentSession) return;
    socket.emit("player_move", {
      roomId: currentSession.room_id,
      x,
      z,
      rotationY,
      animation
    });
  };

  // Broadcast interaction
  const emitInteraction = (shopName: string) => {
    if (!socket || !currentSession || !user) return;
    socket.emit("interaction", {
      roomId: currentSession.room_id,
      username: user.name,
      shopName
    });
  };

  // Leave current session
  const leaveSession = async () => {
    if (!currentSession || !token) return;
    try {
      const roomId = currentSession.room_id;
      
      // Notify backend
      await axios.post(
        `${API_BASE_URL}/api/session/end`,
        { room_id: roomId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Notify socket
      if (socket) {
        socket.emit("leave_session", { roomId });
      }

      closeWebRTC();
      setCurrentSession(null);
      setOnlinePlayers([]);
      setChatMessages([]);
      router.push("/market");
      toast.info("Co-explore session ended.");
    } catch (err) {
      console.error(err);
      router.push("/market");
    }
  };

  // -------------------------------------------------------------
  // WebRTC VOICE CALLING P2P PROTOCOL
  // -------------------------------------------------------------
  const setupVoiceCall = async (currentSocket: Socket, roomId: string) => {
    try {
      // Create background audio tag if it doesn't exist
      if (typeof document !== "undefined" && !remoteAudioRef.current) {
        const audio = document.createElement("audio");
        audio.autoplay = true;
        audio.style.display = "none";
        document.body.appendChild(audio);
        remoteAudioRef.current = audio;
      }

      // Pre-request microphone stream for early permission prompt
      if (!localStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localStreamRef.current = stream;
      }
    } catch (err) {
      console.warn("Microphone access denied or audio device not found. Falling back to text chat only.", err);
      toast.warning("Mic access denied. Voice call disabled, text chat remains active.");
    }
  };

  const initiatePeerConnection = async (currentSocket: Socket, roomId: string, peerSocketId: string) => {
    try {
      if (peerConnectionRef.current) return; // Already initialized

      console.log(`WebRTC: Initiating peer connection with ${peerSocketId}`);

      // Ensure local stream is active
      if (!localStreamRef.current) {
        try {
          localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        } catch (err) {
          console.warn("Could not acquire microphone stream", err);
          return;
        }
      }

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });

      // Add local stream tracks to WebRTC connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // Listen for remote audio track
      pc.ontrack = (event) => {
        console.log("WebRTC: Remote audio track received");
        if (remoteAudioRef.current && event.streams[0]) {
          remoteAudioRef.current.srcObject = event.streams[0];
          setWebrtcConnected(true);
          toast.success("Voice connection established!");
        }
      };

      // Send local ICE candidates to peer
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          currentSocket.emit("webrtc_signal", {
            roomId,
            targetId: peerSocketId,
            signal: { candidate: event.candidate },
            senderId: currentSocket.id || ""
          });
        }
      };

      // Determine who is caller (lexicographically smaller socket ID)
      const isCaller = (currentSocket.id || "") < peerSocketId;

      if (isCaller) {
        console.log("WebRTC: Acting as caller, creating offer...");
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        currentSocket.emit("webrtc_signal", {
          roomId,
          targetId: peerSocketId,
          signal: pc.localDescription,
          senderId: currentSocket.id || ""
        });
      } else {
        console.log("WebRTC: Acting as callee, waiting for offer...");
      }

      peerConnectionRef.current = pc;
    } catch (err) {
      console.warn("Failed to instantiate RTCPeerConnection", err);
    }
  };

  const handleOfferReceived = async (currentSocket: Socket, offer: any, senderId: string) => {
    try {
      if (peerConnectionRef.current) return; // Already established

      console.log(`WebRTC: Offer received from ${senderId}, acting as callee...`);

      // Ensure local stream is active
      if (!localStreamRef.current) {
        try {
          localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        } catch (err) {
          console.warn("Could not acquire microphone stream on offer receipt", err);
          return;
        }
      }

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      pc.ontrack = (event) => {
        console.log("WebRTC: Remote audio track received (Guest)");
        if (remoteAudioRef.current && event.streams[0]) {
          remoteAudioRef.current.srcObject = event.streams[0];
          setWebrtcConnected(true);
          toast.success("Voice connection established!");
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          currentSocket.emit("webrtc_signal", {
            roomId: activeRoomIdRef.current || "",
            targetId: senderId,
            signal: { candidate: event.candidate },
            senderId: currentSocket.id || ""
          });
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      currentSocket.emit("webrtc_signal", {
        roomId: activeRoomIdRef.current || "",
        targetId: senderId,
        signal: pc.localDescription,
        senderId: currentSocket.id || ""
      });

      peerConnectionRef.current = pc;
    } catch (err) {
      console.warn("Error handling offer", err);
    }
  };

  const handleAnswerReceived = async (answer: any) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (err) {
      console.warn("Error handling answer", err);
    }
  };

  const handleIceCandidateReceived = async (signal: any) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    } catch (err) {
      console.warn("Error handling ice candidate", err);
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
      if (!isMuted) {
        toast.info("Microphone muted.");
      } else {
        toast.info("Microphone unmuted.");
      }
    }
  };

  const closeWebRTC = () => {
    setWebrtcConnected(false);
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
  };

  return (
    <MultiplayerContext.Provider
      value={{
        socket,
        onlinePlayers,
        activeInvite,
        currentSession,
        chatMessages,
        lastInteraction,
        webrtcConnected,
        isMuted,
        sendInvite,
        respondToInvite,
        sendMessage,
        emitMovement,
        emitInteraction,
        leaveSession,
        toggleMute,
        setOnlinePlayers
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
};

export const useMultiplayer = () => {
  const context = useContext(MultiplayerContext);
  if (context === undefined) {
    throw new Error("useMultiplayer must be used within a MultiplayerProvider");
  }
  return context;
};
