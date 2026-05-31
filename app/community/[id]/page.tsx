"use client";

import { useState, useEffect, use, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Image as ImageIcon, Heart, MessageSquare, 
  Sparkles, Loader2, MoreVertical, X, MapPin, 
  Users, MessageCircle, Newspaper, Trash2
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useMultiplayer } from "@/context/MultiplayerContext";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function CommunityFeed({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const communityId = resolvedParams.id;
  const { token, user } = useAuth();
  const { sendInvite } = useMultiplayer();
  
  const [activeTab, setActiveTab] = useState<'feed' | 'members' | 'chat'>('feed');
  const [sendingInviteMap, setSendingInviteMap] = useState<{[key: number]: boolean}>({});

  const handleSendInvite = async (memberId: number) => {
    setSendingInviteMap(prev => ({ ...prev, [memberId]: true }));
    const success = await sendInvite(memberId);
    setSendingInviteMap(prev => ({ ...prev, [memberId]: false }));
    if (success) {
      toast.success("Invitation sent in real-time!");
    }
  };
  
  // Community Details State
  const [community, setCommunity] = useState<any>(null);
  
  // Feed State
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [newPostPreview, setNewPostPreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState<number | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{[key: number]: string}>({});
  const [loadingAi, setLoadingAi] = useState<{[key: number]: boolean}>({});

  // Chat State
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newChatMessage, setNewChatMessage] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token) {
      fetchCommunityDetails();
      fetchPosts();
    }
  }, [token, communityId]);

  // Polling for Chat
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (token && activeTab === 'chat') {
      fetchChatMessages();
      interval = setInterval(fetchChatMessages, 3000);
    }
    return () => clearInterval(interval);
  }, [token, activeTab, communityId]);

  useEffect(() => {
    // Auto scroll chat
    if (activeTab === 'chat' && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, activeTab]);

  const fetchCommunityDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/communities/${communityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommunity(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/posts/${communityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data);
    } catch (error) {
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/community/${communityId}/chat`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatMessages(response.data);
    } catch (error) {
      console.error("Failed to load messages", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewPostImage(e.target.files[0]);
      setNewPostPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() && !newPostImage) return;

    setIsPosting(true);
    const formData = new FormData();
    formData.append("community_id", communityId);
    formData.append("content", newPostContent);
    if (newPostImage) {
      formData.append("image", newPostImage);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/posts`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      });
      setPosts([response.data, ...posts]);
      setNewPostContent("");
      setNewPostImage(null);
      setNewPostPreview(null);
      toast.success("Posted successfully!");
    } catch (error) {
      toast.error("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { liked } = response.data;
      
      setPosts(posts.map(post => {
        if (post.id === postId) {
          const isCurrentlyLiked = post.likes.some((l: any) => l.user_id === user?.id);
          let newLikes = [...post.likes];
          
          if (liked && !isCurrentlyLiked) {
            newLikes.push({ user_id: user?.id, post_id: postId });
          } else if (!liked && isCurrentlyLiked) {
            newLikes = newLikes.filter((l: any) => l.user_id !== user?.id);
          }
          
          return { ...post, likes: newLikes };
        }
        return post;
      }));
    } catch (error) {
      toast.error("Failed to like post");
    }
  };

  const handleComment = async (postId: number) => {
    if (!commentContent.trim()) return;
    setIsCommenting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/comments`, {
        post_id: postId,
        content: commentContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return { ...post, comments: [response.data, ...post.comments] };
        }
        return post;
      }));
      setCommentContent("");
    } catch (error) {
      toast.error("Failed to post comment");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(posts.filter(p => p.id !== postId));
      toast.success("Post deleted");
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return { ...post, comments: post.comments.filter((c: any) => c.id !== commentId) };
        }
        return post;
      }));
      toast.success("Comment deleted");
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  const getAiSuggestion = async (postId: number, content: string, region: string) => {
    setLoadingAi({ ...loadingAi, [postId]: true });
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/suggest`, {
        content,
        region
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAiSuggestions({ ...aiSuggestions, [postId]: response.data.suggestion });
    } catch (error) {
      toast.error("Failed to get AI suggestion");
    } finally {
      setLoadingAi({ ...loadingAi, [postId]: false });
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;
    setIsSendingChat(true);
    
    // Optimistic UI
    const tempMessage = {
      id: Date.now(),
      content: newChatMessage,
      user: user,
      created_at: new Date().toISOString()
    };
    setChatMessages([...chatMessages, tempMessage]);
    setNewChatMessage("");

    try {
      await axios.post(`${API_BASE_URL}/api/community/${communityId}/chat`, {
        content: tempMessage.content
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Will be refreshed by polling anyway, or we can await the response
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSendingChat(false);
    }
  };

  if (loading || !community) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      {/* Community Header Card */}
      <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 opacity-50" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{community.name}</h1>
          <div className="flex items-center justify-center gap-4 text-muted-foreground text-sm mb-4">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {community.region}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {community.users.length} Members</span>
          </div>
          <p className="text-white/80 max-w-2xl mx-auto">{community.description}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex p-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl mb-8 w-fit mx-auto">
        {[
          { id: 'feed', label: 'Feed', icon: Newspaper },
          { id: 'members', label: 'Members', icon: Users },
          { id: 'chat', label: 'Live Chat', icon: MessageCircle }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-white/10 text-white shadow-sm' 
                : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="relative min-h-[500px]">
        {/* FEED TAB */}
        {activeTab === 'feed' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            {/* Create Post Section */}
            <div className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8 shadow-xl">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent shrink-0 flex items-center justify-center font-bold text-black border-2 border-[#1a1a2e] overflow-hidden">
                  {user?.profile_image ? (
                    <img src={`${API_BASE_URL}${user.profile_image}`} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0) || "U"
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none min-h-[100px]"
                    placeholder="Share an insight or ask for advice..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />
                  
                  {newPostPreview && (
                    <div className="mt-4 relative rounded-xl overflow-hidden border border-white/10">
                      <img src={newPostPreview} alt="Preview" className="w-full max-h-[300px] object-cover" />
                      <button 
                        onClick={() => { setNewPostPreview(null); setNewPostImage(null); }}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <input type="file" id="post-image" className="hidden" onChange={handleImageChange} accept="image/*" />
                      <label htmlFor="post-image" className="p-2 text-primary hover:bg-primary/10 rounded-lg cursor-pointer transition-colors flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">Add Photo</span>
                      </label>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCreatePost}
                      disabled={isPosting || (!newPostContent.trim() && !newPostImage)}
                      className="px-6 py-2 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl flex items-center gap-2 disabled:opacity-50"
                    >
                      {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>Post</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-6">
              {posts.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                  <h3 className="text-xl font-medium text-white mb-2">No posts yet</h3>
                  <p className="text-muted-foreground">Be the first to start a discussion!</p>
                </div>
              ) : (
                posts.map(post => {
                  const isLiked = post.likes.some((l: any) => l.user_id === user?.id);
                  const isAiLoading = loadingAi[post.id];
                  const aiSuggestion = aiSuggestions[post.id];

                  return (
                    <motion.div key={post.id} className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                      <div className="p-6 pb-2 flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center font-bold text-white border border-white/10 overflow-hidden">
                            {post.user.profile_image ? (
                              <img src={`${API_BASE_URL}${post.user.profile_image}`} className="w-full h-full object-cover" />
                            ) : post.user.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-white leading-tight">{post.user.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {post.user.region}</span>
                              <span>•</span>
                              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>
                        {post.user_id === user?.id && (
                          <button 
                            onClick={() => handleDeletePost(post.id)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Delete Post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="p-6 pt-2">
                        <p className="text-white/90 whitespace-pre-wrap">{post.content}</p>
                        {post.image && (
                          <div className="mt-4 rounded-xl overflow-hidden border border-white/10">
                            <img src={`${API_BASE_URL}${post.image}`} className="w-full max-h-[500px] object-cover" />
                          </div>
                        )}
                      </div>

                      <div className="px-6 py-2">
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => getAiSuggestion(post.id, post.content, post.user.region)}
                          disabled={isAiLoading}
                          className="w-full py-3 bg-gradient-to-r from-accent/10 to-secondary/10 hover:from-accent/20 border border-accent/20 rounded-xl flex items-center justify-center gap-2 text-accent font-medium transition-all"
                        >
                          {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                          <span>{aiSuggestion ? 'Refresh AI Suggestion' : 'Get AI Suggestion'}</span>
                        </motion.button>
                        <AnimatePresence>
                          {aiSuggestion && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 p-5 bg-gradient-to-br from-accent/5 to-secondary/5 border border-accent/20 rounded-xl">
                              <h5 className="flex items-center gap-2 text-accent font-bold mb-2"><Sparkles className="w-4 h-4" /> Agro AI Insight</h5>
                              <p className="text-sm text-white/90">{aiSuggestion}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button onClick={() => handleLike(post.id)} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors ${isLiked ? 'text-rose-500 bg-rose-500/10' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}>
                            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                            <span className="font-medium text-sm">{post.likes.length}</span>
                          </button>
                          <button onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
                            <MessageSquare className="w-5 h-5" />
                            <span className="font-medium text-sm">{post.comments.length}</span>
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {activeCommentPost === post.id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border-t border-white/10 bg-black/20">
                            <div className="p-6">
                              <div className="flex gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-primary/20 shrink-0 flex items-center justify-center font-bold text-primary text-xs">
                                  {user?.name?.charAt(0) || "U"}
                                </div>
                                <div className="flex-1 flex gap-2">
                                  <input type="text" className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50" placeholder="Write a comment..." value={commentContent} onChange={(e) => setCommentContent(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleComment(post.id); }} />
                                  <button onClick={() => handleComment(post.id)} disabled={isCommenting || !commentContent.trim()} className="px-3 py-2 bg-primary/20 text-primary hover:bg-primary hover:text-black rounded-lg transition-colors disabled:opacity-50">
                                    <Send className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-4">
                                {post.comments.map((comment: any) => (
                                  <div key={comment.id} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/5 shrink-0 overflow-hidden">
                                      {comment.user.profile_image ? (
                                        <img src={`${API_BASE_URL}${comment.user.profile_image}`} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground text-xs">{comment.user.name.charAt(0)}</div>
                                      )}
                                    </div>
                                    <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-none p-3 border border-white/5">
                                      <div className="flex justify-between items-start mb-1">
                                        <div>
                                          <span className="font-bold text-white text-sm">{comment.user.name}</span>
                                          <span className="text-xs text-muted-foreground ml-2">{formatDistanceToNow(new Date(comment.created_at))}</span>
                                        </div>
                                        {comment.user_id === user?.id && (
                                          <button 
                                            onClick={() => handleDeleteComment(post.id, comment.id)}
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                            title="Delete Comment"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        )}
                                      </div>
                                      <p className="text-sm text-white/80">{comment.content}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* MEMBERS TAB */}
        {activeTab === 'members' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {community.users.map((member: any) => (
              <div key={member.id} className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full border-4 border-[#1a1a2e] shadow-lg mb-4 overflow-hidden bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                  {member.profile_image ? (
                    <img src={`${API_BASE_URL}${member.profile_image}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-white">{member.name.charAt(0)}</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white">{member.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" /> {member.region}
                </p>
                {member.id === user?.id ? (
                  <span className="mt-4 px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">You</span>
                ) : (
                  <button
                    onClick={() => handleSendInvite(member.id)}
                    disabled={sendingInviteMap[member.id]}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-primary to-accent hover:from-primary/95 text-black font-black text-[11px] rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,208,132,0.15)] disabled:opacity-50 select-none border border-white/10"
                  >
                    {sendingInviteMap[member.id] ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <span>Invite to AgriMarket</span>
                    )}
                  </button>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto h-[600px] flex flex-col bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/10 bg-black/20 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" /> Live Community Chat
                </h3>
                <p className="text-xs text-muted-foreground">Messages update in real-time</p>
              </div>
            </div>
            
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mb-4 opacity-20" />
                  <p>Start the conversation!</p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => {
                  const isMe = msg.user.id === user?.id;
                  const showHeader = idx === 0 || chatMessages[idx-1].user.id !== msg.user.id;
                  
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                      <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        {showHeader && !isMe && (
                          <span className="text-xs font-medium text-white/50 ml-1 mb-1">{msg.user.name}</span>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                          isMe 
                            ? 'bg-primary text-black rounded-tr-sm' 
                            : 'bg-white/10 text-white border border-white/10 rounded-tl-sm'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 bg-black/40 border-t border-white/10">
              <form onSubmit={handleSendChatMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSendingChat || !newChatMessage.trim()}
                  className="w-12 h-12 bg-primary hover:bg-primary/90 text-black rounded-xl flex items-center justify-center disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
