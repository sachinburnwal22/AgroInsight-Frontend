"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import FloatingNavbar from "@/components/ui/FloatingNavbar";
import MarketCanvas from "@/components/market/MarketCanvas";
import ProductModal from "@/components/market/ProductModal";
import CartDrawer from "@/components/market/CartDrawer";
import { 
  ShoppingBag, 
  Sun, 
  Moon, 
  Keyboard, 
  Compass, 
  Info,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  ArrowRight,
  User,
  ShoppingBag as CartIcon,
  Package,
  Users,
  Store,
  DollarSign,
  MapPin,
  Clock,
  X
} from "lucide-react";

interface Shop {
  id: number;
  name: string;
  category: string;
  description?: string;
  position_x: number;
  position_z: number;
}

const FALLBACK_SHOPS: Shop[] = [
  { id: 1, name: 'BioGrow Fertilizers', category: 'Fertilizer Store', description: 'Premium organic and chemical crop nutrients.', position_x: -15, position_z: -10 },
  { id: 2, name: 'Astra Seeds', category: 'Seed Store', description: 'Certified high-yield crop seeds.', position_x: 15, position_z: -10 },
  { id: 3, name: 'Kisan Equipments', category: 'Farming Tools', description: 'Durable hand tools and heavy machinery.', position_x: -20, position_z: 15 },
  { id: 4, name: 'HydroFlow Systems', category: 'Irrigation Equipment', description: 'Efficient water distribution equipment.', position_x: 20, position_z: 15 },
  { id: 5, name: 'NutriFeed Corner', category: 'Animal Feed Shop', description: 'Premium cattle, poultry, and fish feed.', position_x: 0, position_z: -25 }
];

// ------------------------------------------------------------------
// WEB AUDIO SYNTHESIZER
// Synthesizes looping ambient wind gusts and crickets in real-time.
// ------------------------------------------------------------------
let audioCtx: AudioContext | null = null;
let windNoise: AudioBufferSourceNode | null = null;
let windFilter: BiquadFilterNode | null = null;
let cricketOsc: OscillatorNode | null = null;
let cricketGain: GainNode | null = null;
let masterGain: GainNode | null = null;

function toggleAmbience(play: boolean) {
  if (typeof window === "undefined") return;

  if (play) {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.04, audioCtx.currentTime); 
        masterGain.connect(audioCtx.destination);
        
        const bufferSize = 2 * audioCtx.sampleRate;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        
        windNoise = audioCtx.createBufferSource();
        windNoise.buffer = noiseBuffer;
        windNoise.loop = true;
        
        windFilter = audioCtx.createBiquadFilter();
        windFilter.type = "lowpass";
        windFilter.Q.setValueAtTime(1.2, audioCtx.currentTime);
        
        windNoise.connect(windFilter);
        windFilter.connect(masterGain);
        windNoise.start();

        const windLFO = audioCtx.createOscillator();
        windLFO.type = "sine";
        windLFO.frequency.setValueAtTime(0.08, audioCtx.currentTime); 
        
        const windLFOGain = audioCtx.createGain();
        windLFOGain.gain.setValueAtTime(120, audioCtx.currentTime);
        
        windLFO.connect(windLFOGain);
        windLFOGain.connect(windFilter.frequency);
        windLFO.start();

        windFilter.frequency.setValueAtTime(250, audioCtx.currentTime);

        cricketOsc = audioCtx.createOscillator();
        cricketOsc.type = "sine";
        cricketOsc.frequency.setValueAtTime(3200, audioCtx.currentTime);
        
        cricketGain = audioCtx.createGain();
        cricketGain.gain.setValueAtTime(0, audioCtx.currentTime);
        
        cricketOsc.connect(cricketGain);
        cricketGain.connect(masterGain);
        cricketOsc.start();

        const cricketLFO = audioCtx.createOscillator();
        cricketLFO.type = "sawtooth";
        cricketLFO.frequency.setValueAtTime(10, audioCtx.currentTime); 
        
        const cricketLFOGain = audioCtx.createGain();
        cricketLFOGain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        
        cricketLFO.connect(cricketGain.gain);
        cricketLFO.start();
      } else if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
    } catch (err) {
      console.warn("Failed to initialize Web Audio Synthesizer", err);
    }
  } else {
    if (audioCtx && audioCtx.state === "running") {
      audioCtx.suspend();
    }
  }
}

export default function AgriMarketPage() {
  const { token } = useAuth();
  const { cartCount, fetchCart } = useCart();
  
  const [shops, setShops] = useState<Shop[]>(FALLBACK_SHOPS);
  const [loadingShops, setLoadingShops] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isNight, setIsNight] = useState(true);
  const [showControlsGuide, setShowControlsGuide] = useState(true);
  
  const [audioOn, setAudioOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Proximity detection state
  const [nearShop, setNearShop] = useState<Shop | null>(null);

  // Sync cart items on mount
  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token]);

  // Fetch shops from backend API
  useEffect(() => {
    const fetchShops = async () => {
      setLoadingShops(true);
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/shops");
        if (res.data.status === "success" && Array.isArray(res.data.data)) {
          setShops(res.data.data);
        }
      } catch (err) {
        console.warn("Failed to fetch shops from API. Using local seeds fallback.", err);
        setShops(FALLBACK_SHOPS);
      } finally {
        setLoadingShops(false);
      }
    };
    fetchShops();
  }, []);

  // Web Audio trigger hook
  useEffect(() => {
    toggleAmbience(audioOn);
    return () => {
      toggleAmbience(false);
    };
  }, [audioOn]);

  // Key listener for exploring (Press E key)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyE" && nearShop && !selectedShop && !isCartOpen) {
        setSelectedShop(nearShop);
      }
    };
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [nearShop, selectedShop, isCartOpen]);

  // Fullscreen controller
  const toggleFullscreen = () => {
    const frame = document.getElementById("canvas-frame");
    if (!frame) return;

    if (!document.fullscreenElement) {
      frame.requestFullscreen().then(() => {
        setIsFullscreen(true);
        setTimeout(() => {
          frame.focus();
        }, 100);
      }).catch(err => {
        console.error("Fullscreen entry rejected", err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <main className="min-h-screen pt-28 pb-16 px-4 md:px-8 relative overflow-hidden flex flex-col items-center">
      {/* Background decoration elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Navbar */}
      <FloatingNavbar />

      <div className="w-full max-w-7xl flex flex-col space-y-6 z-10 flex-1">
        {/* Immersive Header Card */}
        <div className="relative p-6 md:p-8 bg-[#06060f]/60 border border-white/5 rounded-3xl backdrop-blur-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          <div className="text-left space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-mono font-bold tracking-widest text-primary uppercase">
                Village Square
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase font-mono flex items-center gap-2">
              🌾 Agri<span className="text-primary">Market</span> 3D
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Step inside our realistic village square. Walk along dirt roads, observe ambient wildlife and local farmers, and explore rustic stalls loaded with farming supplies.
            </p>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex flex-wrap items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(true)}
              className="px-5 py-3.5 bg-gradient-to-r from-primary to-accent text-background font-black rounded-2xl flex items-center gap-2.5 shadow-[0_0_20px_rgba(0,208,132,0.25)] select-none cursor-pointer border border-white/10"
              id="hud-cart-button"
            >
              <div className="relative">
                <ShoppingBag className="w-4.5 h-4.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-rose-500 text-white font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-black animate-pulse">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs uppercase tracking-wider font-mono">Open Cart</span>
            </motion.button>
          </div>
        </div>

        {/* 3D Canvas Main Frame Container */}
        <div 
          id="canvas-frame"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.code === "KeyE" && nearShop && !selectedShop && !isCartOpen) {
              setSelectedShop(nearShop);
            }
          }}
          className="relative h-[650px] md:h-[720px] w-full border border-white/10 rounded-[2.5rem] overflow-hidden bg-black/90 shadow-2xl flex flex-col transition-all duration-300 focus:outline-none"
        >
          {/* Inject style for fullscreen viewport extension */}
          <style jsx global>{`
            #canvas-frame:fullscreen {
              width: 100vw !important;
              height: 100vh !important;
              border-radius: 0px !important;
              border: none !important;
            }
          `}</style>

          {/* Header Status Bar inside frame */}
          <div className="absolute top-0 inset-x-0 h-14 bg-black/75 border-b border-white/5 backdrop-blur-md z-20 flex items-center justify-between px-6">
            <div className="flex items-center gap-2.5 pointer-events-none">
              <span className="text-lg text-primary">🌾</span>
              <span className="text-sm font-black tracking-widest text-white uppercase font-sans">
                AgriMarket
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Wallet Cash Balance tag matching the mockup image */}
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#f39c12]/10 border border-[#f39c12]/30 rounded-xl text-[#f39c12] font-mono text-xs font-black shadow-[0_0_15px_rgba(243,156,18,0.15)]">
                <span>₹</span>
                <span>2,450</span>
              </div>

              {/* Sound Ambience Controller */}
              <button
                onClick={() => setAudioOn(!audioOn)}
                className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center gap-1.5 px-3 select-none ${
                  audioOn 
                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" 
                    : "bg-white/5 border-white/5 hover:bg-white/10 text-white"
                }`}
                title="Toggle Sound Ambience"
              >
                {audioOn ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[9px] font-mono uppercase">Audio ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[9px] font-mono uppercase">Muted</span>
                  </>
                )}
              </button>

              {/* Day/Night Control */}
              <button
                onClick={() => setIsNight(!isNight)}
                className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white cursor-pointer transition-all flex items-center gap-1.5 px-3 select-none"
                title="Toggle Sunset/Night Mode"
              >
                {isNight ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-accent" />
                    <span className="text-[9px] font-mono text-muted-foreground uppercase">Twilight</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[9px] font-mono text-muted-foreground uppercase">Sunset</span>
                  </>
                )}
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white cursor-pointer transition-all flex items-center gap-1.5 px-3 select-none"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-mono uppercase">Minimize</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-mono uppercase">Fullscreen</span>
                  </>
                )}
              </button>

              {/* Instructions toggler */}
              <button
                onClick={() => setShowControlsGuide(!showControlsGuide)}
                className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center gap-1.5 px-3 select-none ${
                  showControlsGuide 
                    ? "bg-primary/10 border-primary/25 text-primary" 
                    : "bg-white/5 border-white/5 hover:bg-white/10 text-white"
                }`}
                title="Toggle Movement Guide"
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span className="text-[9px] font-mono uppercase">Guide</span>
              </button>
            </div>
          </div>

          {/* Interactive 3D Canvas Box */}
          <div className="flex-1 w-full h-full relative">
            {loadingShops ? (
              <div className="absolute inset-0 z-10 bg-black flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-xs font-mono text-primary uppercase tracking-widest animate-pulse">
                  Calibrating 3D Coordinates...
                </span>
              </div>
            ) : (
              <MarketCanvas
                shops={shops}
                onShopClick={(shop) => setSelectedShop(shop)}
                isNight={isNight}
                nearShop={nearShop}
                onNearShopChange={(shop) => setNearShop(shop)}
              />
            )}

            {/* Visual joystick overlay on the bottom-left corner matching the image */}
            <div className="absolute bottom-8 left-8 z-20 w-24 h-24 rounded-full bg-black/60 border border-white/10 backdrop-blur-sm pointer-events-none flex items-center justify-center shadow-lg">
              <div className="w-14 h-14 rounded-full bg-[#0a0f0c] border border-white/5 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
                <div className="w-6 h-6 rounded-full bg-primary shadow-[0_0_15px_#00d084] animate-pulse" />
              </div>
            </div>

            {/* Floating E Interact Button in the bottom-right corner matching the mockup */}
            <button
              onClick={() => {
                if (nearShop && !selectedShop && !isCartOpen) {
                  setSelectedShop(nearShop);
                }
              }}
              disabled={!nearShop}
              className={`absolute bottom-8 right-8 z-20 flex flex-col items-center gap-1.5 p-0 bg-transparent border-none cursor-pointer focus:outline-none transition-all duration-300 ${
                nearShop 
                  ? "opacity-100 scale-100 hover:scale-105 active:scale-95" 
                  : "opacity-45 scale-95 cursor-not-allowed"
              }`}
              title={nearShop ? `Interact with ${nearShop.name}` : "Walk near a shop to interact"}
            >
              <div 
                className={`w-16 h-16 rounded-full bg-black/75 flex items-center justify-center border-2 shadow-lg transition-all duration-300 ${
                  nearShop 
                    ? "border-emerald-500 shadow-[0_0_20px_rgba(0,208,132,0.4)]" 
                    : "border-white/15 shadow-none"
                }`}
              >
                <div 
                  className={`w-11 h-11 rounded-full bg-[#0a0f0c] border flex items-center justify-center font-black font-mono text-xl transition-colors duration-300 ${
                    nearShop 
                      ? "border-emerald-500/30 text-[#00d084]" 
                      : "border-white/5 text-slate-500"
                  }`}
                >
                  E
                </div>
              </div>
              <span className="text-[9px] font-mono tracking-widest text-slate-400 font-bold uppercase select-none">
                Interact
              </span>
            </button>


            {/* Radar Style HUD Mini-Map (Top Right Overlay) */}
            <div className="absolute top-20 right-6 z-20 w-36 h-36 rounded-2xl bg-black/85 border border-white/10 backdrop-blur-md overflow-hidden flex flex-col shadow-2xl p-2 select-none">
              {/* Radar Grid Center */}
              <div className="relative w-full h-24 rounded-lg bg-[#050907]/90 border border-white/5 overflow-hidden">
                {/* Radial Sweep lines */}
                <div className="absolute inset-0 border border-emerald-500/10 rounded-full scale-75" />
                <div className="absolute inset-0 border border-emerald-500/10 rounded-full scale-50" />
                <div className="absolute inset-0 border border-emerald-500/10 rounded-full scale-25" />
                
                {/* Crosshairs */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-emerald-500/5" />
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-emerald-500/5" />

                {/* Shop Markers */}
                {/* 1. BioGrow (F) */}
                <div 
                  className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400 flex items-center justify-center text-[7px] font-bold text-black font-mono shadow-[0_0_8px_#00b4d8]"
                  style={{ left: "28.5%", top: "35.7%" }}
                  title="BioGrow Fertilizers"
                >
                  F
                </div>
                {/* 2. Astra Seeds (S) */}
                <div 
                  className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400 flex items-center justify-center text-[7px] font-bold text-black font-mono shadow-[0_0_8px_#00d084]"
                  style={{ left: "71.4%", top: "35.7%" }}
                  title="Astra Seeds"
                >
                  S
                </div>
                {/* 3. Kisan Tools (T) */}
                <div 
                  className="absolute w-2.5 h-2.5 rounded-full bg-amber-400 flex items-center justify-center text-[7px] font-bold text-black font-mono shadow-[0_0_8px_#f59e0b]"
                  style={{ left: "21.4%", top: "71.4%" }}
                  title="Kisan Equipments"
                >
                  T
                </div>
                {/* 4. HydroFlow (I) */}
                <div 
                  className="absolute w-2.5 h-2.5 rounded-full bg-purple-400 flex items-center justify-center text-[7px] font-bold text-black font-mono shadow-[0_0_8px_#a855f7]"
                  style={{ left: "78.5%", top: "71.4%" }}
                  title="HydroFlow Systems"
                >
                  I
                </div>
                {/* 5. NutriFeed (A) */}
                <div 
                  className="absolute w-2.5 h-2.5 rounded-full bg-pink-400 flex items-center justify-center text-[7px] font-bold text-black font-mono shadow-[0_0_8px_#ec4899]"
                  style={{ left: "50%", top: "14.2%" }}
                  title="NutriFeed Corner"
                >
                  A
                </div>

                {/* Blinking Player Dot Indicator (Directly mutated by three.js loop) */}
                <div 
                  id="minimap-player-dot"
                  className="absolute w-3.5 h-3.5 rounded-full flex items-center justify-center"
                  style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
                >
                  {/* Blinking wave */}
                  <span className="absolute inset-0 bg-primary/40 rounded-full animate-ping" />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full border border-black" />
                  <span className="absolute top-[-4px] left-[3px] w-1 h-1.5 border-l border-t border-primary rotate-45" /> 
                </div>
              </div>

              {/* Coordinates readouts */}
              <div className="flex-1 flex flex-col justify-center text-center font-mono text-[8px] leading-tight text-slate-400 pt-1.5 border-t border-white/5">
                <span className="font-semibold text-primary uppercase tracking-widest text-[7px]">GPS Matrix</span>
                <span id="minimap-coords">X: 0.0 | Z: 18.0</span>
              </div>
            </div>

            {/* Proximity Interaction Prompt Overlay (Press E to Explore) */}
            <AnimatePresence>
              {nearShop && (
                <motion.div
                  initial={{ opacity: 0, y: 20, x: "-50%" }}
                  animate={{ opacity: 1, y: 0, x: "-50%" }}
                  exit={{ opacity: 0, y: 20, x: "-50%" }}
                  className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 w-80 md:w-96 p-4.5 bg-[#06060e]/95 border border-primary/30 rounded-3xl backdrop-blur-md shadow-[0_0_40px_rgba(0,208,132,0.3)] flex items-center gap-4 text-left"
                >
                  {/* Glowing Key Button */}
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/30 font-extrabold font-mono text-sm animate-pulse shadow-[0_0_15px_rgba(0,208,132,0.1)]">
                    E
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[8px] font-mono text-primary tracking-widest uppercase block mb-0.5">
                      {nearShop.category}
                    </span>
                    <h5 className="font-bold text-xs text-white truncate">Explore {nearShop.name}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Press keyboard E or click right to enter</p>
                  </div>
                  <button 
                    onClick={() => setSelectedShop(nearShop)}
                    className="p-2.5 px-4 bg-primary hover:bg-primary/95 text-black font-extrabold text-[11px] rounded-xl transition-all cursor-pointer flex items-center gap-1 select-none shadow-[0_0_10px_rgba(0,208,132,0.2)]"
                  >
                    <span>Enter</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Redesigned Movement Guide matching the mockup image style */}
            <AnimatePresence>
              {showControlsGuide && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute top-18 left-6 z-20 w-44 p-4 bg-[#06060e]/85 border border-white/10 rounded-2xl backdrop-blur-md shadow-xl text-left"
                >
                  <h4 className="text-[10px] font-mono font-black uppercase text-[#888] tracking-widest mb-3 pb-1.5 border-b border-white/5">
                    Movement Guide
                  </h4>
                  
                  <div className="space-y-3.5 text-[10px] text-slate-300 font-sans">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded font-mono font-bold text-primary">W A S D</span>
                      <span className="text-[#888] font-semibold">Move</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded font-mono font-bold text-primary">DRAG</span>
                      <span className="text-[#888] font-semibold">Look Around</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded font-mono font-bold text-primary">KEY E</span>
                      <span className="text-[#888] font-semibold">Interact</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded font-mono font-bold text-primary">MAP</span>
                      <span className="text-[#888] font-semibold">Mini Map</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded font-mono font-bold text-primary">FULL</span>
                      <span className="text-[#888] font-semibold">Fullscreen</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Glassmorphic Bottom Navigation Dock matching the mockup */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center bg-[#07070f]/90 border border-white/10 p-2.5 px-6 rounded-full backdrop-blur-md shadow-2xl gap-5 md:gap-7 select-none">
              {/* Shops metric */}
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-white">Shops</span>
                <span className="px-1.5 py-0.5 bg-cyan-400/10 text-cyan-400 font-mono text-[9px] font-black rounded border border-cyan-400/20">
                  12
                </span>
              </div>

              <div className="w-[1px] h-4 bg-white/10" />

              {/* People Online metric */}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">People Online</span>
                <span className="px-1.5 py-0.5 bg-emerald-400/10 text-emerald-400 font-mono text-[9px] font-black rounded border border-emerald-400/20">
                  48
                </span>
              </div>

              <div className="w-[1px] h-4 bg-white/10" />

              {/* My Orders Button */}
              <button 
                onClick={() => setIsOrdersOpen(true)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer select-none"
              >
                <Package className="w-4 h-4 text-amber-400" />
                <span>My Orders</span>
              </button>

              <div className="w-[1px] h-4 bg-white/10" />

              {/* Bottom Cart Button */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer select-none"
              >
                <div className="relative">
                  <CartIcon className="w-4 h-4 text-[#ec4899]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-emerald-500 border border-black animate-ping" />
                  )}
                </div>
                <span>Cart</span>
                <span className="px-1.5 py-0.5 bg-[#ec4899]/10 text-[#ec4899] font-mono text-[9px] font-black rounded border border-[#ec4899]/20">
                  {cartCount}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Feature Showcase Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl text-left space-y-2 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-12 h-[1px] bg-primary" />
            <div className="text-xl">🛰️</div>
            <h4 className="font-bold text-sm text-white font-mono uppercase tracking-wider">Gemini satellite intelligence</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Each product shelf integrates an AI Recommendation board that queries satellite soil metadata based on your registered region.
            </p>
          </div>

          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl text-left space-y-2 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-12 h-[1px] bg-accent" />
            <div className="text-xl">💳</div>
            <h4 className="font-bold text-sm text-white font-mono uppercase tracking-wider">SECURE RAZORPAY CHECKOUT</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Simulate full checkout transactions using Razorpay's native sandbox interface or our built-in zero-credentials simulation client.
            </p>
          </div>

          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl text-left space-y-2 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-12 h-[1px] bg-primary" />
            <div className="text-xl">🌾</div>
            <h4 className="font-bold text-sm text-white font-mono uppercase tracking-wider">REALTIME STOCK DEDUCTION</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Order processing verifies stock availability, reserves quantities, and clears the cart on signature confirmation.
            </p>
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Product list drawer */}
      <AnimatePresence>
        {selectedShop && (
          <ProductModal
            shop={selectedShop}
            onClose={() => setSelectedShop(null)}
          />
        )}
      </AnimatePresence>

      {/* My Orders Mock Drawer Overlay (Slides out from right) */}
      <AnimatePresence>
        {isOrdersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOrdersOpen(false)}
              className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[450px] z-[160] bg-[#070710]/95 border-l border-white/10 p-6 flex flex-col backdrop-blur-2xl shadow-2xl text-foreground font-sans"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-500" />
                  <h3 className="text-xl font-black text-white">Your Orders</h3>
                </div>
                <button
                  onClick={() => setIsOrdersOpen(false)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white cursor-pointer border border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Orders List */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-white/10">
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-2 relative group hover:border-[#f39c12]/20 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-[#f39c12] font-black">#ORD-2026-928</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-black uppercase rounded">
                      Delivered
                    </span>
                  </div>
                  <div className="h-[1px] bg-white/5 my-1" />
                  <div className="space-y-1 text-xs text-slate-300">
                    <p className="flex justify-between"><span>Urea Fertilizer (50kg Bag)</span><span className="font-mono">x1</span></p>
                    <p className="flex justify-between"><span>Basmati Rice Seeds (5kg)</span><span className="font-mono">x2</span></p>
                  </div>
                  <div className="h-[1px] bg-white/5 my-1" />
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-[10px] text-muted-foreground font-mono uppercase">Total Paid</span>
                    <span className="text-sm font-black text-white">₹1,250.00</span>
                  </div>
                </div>

                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-2 relative group hover:border-[#f39c12]/20 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-[#f39c12] font-black">#ORD-2026-812</span>
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-mono font-black uppercase rounded">
                      Shipped
                    </span>
                  </div>
                  <div className="h-[1px] bg-white/5 my-1" />
                  <div className="space-y-1 text-xs text-slate-300">
                    <p className="flex justify-between"><span>Backpack Crop Sprayer (16L)</span><span className="font-mono">x1</span></p>
                  </div>
                  <div className="h-[1px] bg-white/5 my-1" />
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-[10px] text-muted-foreground font-mono uppercase">Total Paid</span>
                    <span className="text-sm font-black text-white">₹1,850.00</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-white/5 pt-6 text-center text-[10px] text-muted-foreground font-mono">
                SECURE_ORDER_DATABASE // SYNCED_ONLINE
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
