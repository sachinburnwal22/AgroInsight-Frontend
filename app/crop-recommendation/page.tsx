"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import FloatingNavbar from "@/components/ui/FloatingNavbar";
import { 
  Sprout, 
  MapPin, 
  AlertTriangle, 
  Layers, 
  CheckCircle2, 
  CloudRain, 
  Thermometer, 
  Wind, 
  ShoppingBag, 
  ChevronRight, 
  Volume2, 
  Compass, 
  ShieldAlert, 
  CornerDownRight, 
  TrendingUp, 
  BrainCircuit,
  Info
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Dynamically import AdvisorMap to disable Server-Side Rendering (Leaflet relies on 'window' global)
const AdvisorMap = dynamic(() => import("@/components/map/AdvisorMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] flex items-center justify-center bg-black/60 rounded-3xl border border-white/10">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  ),
});

interface CropRec {
  crop_name: string;
  suitability_percentage: number;
  yield: string;
  season: string;
  reason: string;
  emoji: string;
}

interface ProductRec {
  product_name: string;
  category: string;
  reason: string;
  shop_product_name: string;
  price: number;
  stock: number;
  image: string;
  shop_id: number;
  shop_name: string;
  shop_position: { x: number; z: number };
}

export default function CropAdvisorPage() {
  const { token, user } = useAuth();

  // Location and Geolocation Permission State
  const [coords, setCoords] = useState({ lat: 18.5204, lng: 73.8567 }); // default Pune
  const [regionName, setRegionName] = useState(user?.region || "Maharashtra");
  const [trackingStatus, setTrackingStatus] = useState<"idle" | "tracking" | "success" | "denied">("idle");

  // Live Weather State
  const [weather, setWeather] = useState<any>({
    temp: 29.5,
    humidity: 58,
    wind_speed: 10.5,
    rain_chance: 8
  });

  // Threat alert / disaster warning State
  const [activeAlert, setActiveAlert] = useState<any>(null);
  const [loadingAlert, setLoadingAlert] = useState(false);
  const [activeSimulation, setActiveSimulation] = useState<string>("none");

  // Tab views State
  const [activeTab, setActiveTab] = useState<"crops" | "products" | "alert-guide">("crops");

  // Advisor parameters State
  const [soilType, setSoilType] = useState("Loamy");
  const [loadingCrops, setLoadingCrops] = useState(false);
  const [cropRecs, setCropRecs] = useState<CropRec[]>([]);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productRecs, setProductRecs] = useState<ProductRec[]>([]);

  // Map layer toggles
  const [mapOverlay, setMapOverlay] = useState<"rain" | "heat" | "none">("none");

  // Request browser notifications permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  // Browser Geolocation Permission handler
  const requestLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast.error("Browser Geolocation is not supported.");
      return;
    }

    setTrackingStatus("tracking");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        setCoords({ lat: latitude, lng: longitude });
        setTrackingStatus("success");
        toast.success(`Coordinates captured: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);

        // Update User region name (reverse geocode approximation based on latitude range)
        let resolvedRegion = "Central India";
        if (latitude > 28) resolvedRegion = "Punjab";
        else if (latitude > 24) resolvedRegion = "Uttar Pradesh";
        else if (latitude > 18) resolvedRegion = "Maharashtra";
        else resolvedRegion = "Karnataka";
        setRegionName(resolvedRegion);

        // Send to backend location update
        try {
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          await axios.post(
            "http://127.0.0.1:8000/api/location/update",
            { latitude, longitude, current_region: resolvedRegion },
            { headers }
          );
        } catch (err) {
          console.warn("Could not save user location coordinates in database.", err);
        }

        // Trigger updates based on new coordinates
        fetchLiveWeather(latitude, longitude);
        fetchWeatherAlerts(latitude, longitude, activeSimulation, resolvedRegion);
      },
      (err) => {
        console.warn("Geolocation permission denied", err);
        setTrackingStatus("denied");
        toast.error("Location permission denied. Using fallback coordinates.");
      }
    );
  };

  // Live Weather Fetcher
  const fetchLiveWeather = async (latitude: number, longitude: number) => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/weather/live", {
        params: { latitude, longitude }
      });
      if (res.data.status === "success" || res.data.status === "mock_success") {
        setWeather({
          temp: res.data.temp,
          humidity: res.data.humidity,
          wind_speed: res.data.wind_speed,
          rain_chance: res.data.rain_chance
        });
      }
    } catch (err) {
      console.error("Live weather fetch failed", err);
    }
  };

  // Weather Threat and AI advice Fetcher
  const fetchWeatherAlerts = async (latitude: number, longitude: number, simType: string, region: string) => {
    setLoadingAlert(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/weather/alerts", {
        params: {
          latitude,
          longitude,
          simulate: simType === "none" ? "" : simType,
          region,
          temp: weather.temp,
          wind_speed: weather.wind_speed,
          humidity: weather.humidity,
          rain_chance: weather.rain_chance
        }
      });

      if (res.data.status === "success") {
        const alertObj = res.data.alert_active ? res.data : null;
        setActiveAlert(alertObj);

        // Trigger sound warning and notification on threat discovery
        if (alertObj) {
          playWarningSound(alertObj.severity);
          sendBrowserNotification(alertObj.alert_type, alertObj.message);
          toast.warning(`DISASTER WARNING: ${alertObj.alert_type} detected.`);
          setActiveTab("alert-guide"); // Switch to guide tab automatically
        }
      }
    } catch (err) {
      console.error("Alerts lookup failed", err);
    } finally {
      setLoadingAlert(false);
    }
  };

  // Web Audio Warning Sound Synthesizer
  const playWarningSound = (severity: string) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (severity === "severe") {
        // Red alert alarm (double sharp beep)
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.01, audioCtx.currentTime + 0.18);

        osc.frequency.setValueAtTime(800, audioCtx.currentTime + 0.28);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime + 0.28);
        gain.gain.setValueAtTime(0.01, audioCtx.currentTime + 0.46);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } else {
        // Moderate alert (calm upward sweep)
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.01, audioCtx.currentTime + 0.3);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch (err) {
      console.warn("Failed to trigger alert synthesizer audio", err);
    }
  };

  // HTML5 push notification warning
  const sendBrowserNotification = (title: string, message: string) => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(`AgroInsight: ${title}`, {
          body: message,
          icon: "/favicon.ico"
        });
      }
    }
  };

  // Run crop advisor calculations
  const runCropAdvisor = async () => {
    setLoadingCrops(true);
    setCropRecs([]);
    setProductRecs([]);

    try {
      const res = await axios.get("http://127.0.0.1:8000/api/crop/recommendations", {
        params: {
          latitude: coords.lat,
          longitude: coords.lng,
          soil_type: soilType,
          region: regionName,
          temp: weather.temp,
          rainfall: weather.rain_chance > 60 ? 1200 : 750 // rainfall proxy
        }
      });

      if (res.data.status === "success") {
        setCropRecs(res.data.data);
        toast.success("AI Crop Recommendations Generated!");

        // Automatically fetch pesticides and matching products
        const cropNames = res.data.data.map((c: CropRec) => c.crop_name).join(",");
        fetchProductRecommendations(cropNames);
      }
    } catch (err) {
      console.error("AI recommendations query failed", err);
      toast.error("Failed to generate AI recommendations. Verify backend is running.");
    } finally {
      setLoadingCrops(false);
    }
  };

  // Pesticide & matching shops fetcher
  const fetchProductRecommendations = async (cropsList: string) => {
    setLoadingProducts(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/product/recommendations", {
        params: { crops: cropsList }
      });
      if (res.data.status === "success") {
        setProductRecs(res.data.data);
      }
    } catch (err) {
      console.error("Pesticides lookup failed", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Refresh alert state when simulation toggles
  const handleSimulationChange = (type: string) => {
    setActiveSimulation(type);
    if (type === "none") {
      setActiveAlert(null);
      toast.info("Disaster simulation deactivated.");
    } else {
      fetchWeatherAlerts(coords.lat, coords.lng, type, regionName);
    }
  };

  // Set default weather and location queries on load
  useEffect(() => {
    fetchLiveWeather(coords.lat, coords.lng);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#080816] text-foreground overflow-hidden">
      {/* Floating Navbar */}
      <FloatingNavbar />

      <main className="pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto flex flex-col space-y-8 relative z-10">
        
        {/* Futuristic Advisory Heading */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#05050e]/60 border border-white/5 p-6 rounded-3xl backdrop-blur-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          <div className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-mono font-bold tracking-widest text-primary uppercase">
                AI advisor center
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase font-mono">
              🛡️ Crop & <span className="text-primary">Safety</span> Advisor
            </h1>
            <p className="text-xs text-slate-400">
              Futuristic farming command center integrating live geolocation, threat alert monitors, and Gemini-guided crop diagnostics.
            </p>
          </div>

          {/* Location Access Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={requestLocation}
              disabled={trackingStatus === "tracking"}
              className={`px-4.5 py-3 rounded-2xl font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 select-none border transition-all cursor-pointer ${
                trackingStatus === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                  : "bg-primary hover:bg-primary/95 text-black border-transparent shadow-[0_0_15px_rgba(0,208,132,0.25)]"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>
                {trackingStatus === "tracking" ? "Tracking..." : trackingStatus === "success" ? "Location Logged" : "Request Live GPS"}
              </span>
            </button>
          </div>
        </div>

        {/* Extreme weather Warning banner if alert active */}
        <AnimatePresence>
          {activeAlert && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              className={`p-5 rounded-3xl border flex flex-col md:flex-row items-center gap-5 justify-between relative overflow-hidden backdrop-blur-2xl shadow-xl z-20 ${
                activeAlert.severity === "severe" 
                  ? "bg-rose-950/40 border-rose-500/40 shadow-rose-950/20" 
                  : "bg-amber-950/40 border-amber-500/40 shadow-amber-950/20"
              }`}
            >
              <div className="flex items-center gap-4 text-left">
                <div className={`p-4 rounded-2xl flex items-center justify-center ${
                  activeAlert.severity === "severe" ? "bg-rose-500/15 text-rose-400" : "bg-amber-500/15 text-amber-400"
                }`}>
                  <ShieldAlert className="w-8 h-8 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h4 className={`font-black text-sm tracking-widest font-mono uppercase ${
                    activeAlert.severity === "severe" ? "text-rose-400" : "text-amber-400"
                  }`}>
                    {activeAlert.alert_type} Active
                  </h4>
                  <p className="text-xs text-white/95 max-w-2xl leading-relaxed">
                    {activeAlert.message}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setActiveTab("alert-guide");
                  const element = document.getElementById("advisory-tabs");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`px-4.5 py-2.5 rounded-xl font-mono text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer select-none flex items-center gap-1 flex-shrink-0 ${
                  activeAlert.severity === "severe" 
                    ? "bg-rose-500 hover:bg-rose-600 border-rose-500 text-white" 
                    : "bg-amber-500 hover:bg-amber-600 border-amber-500 text-black"
                }`}
              >
                <span>Read AI Guide</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2-Column Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* LEFT AREA: Weather Feed, Map & Simulation (3/5 width) */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Live Weather Metrics Feed */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-[#05050e]/60 border border-white/5 rounded-2xl backdrop-blur-md flex items-center gap-3">
                <Thermometer className="w-5 h-5 text-[#ffea75]" />
                <div className="text-left font-mono">
                  <span className="text-[10px] text-slate-500 uppercase block leading-none">Temp</span>
                  <span className="text-base font-bold text-white">{weather.temp.toFixed(1)}°C</span>
                </div>
              </div>
              <div className="p-4 bg-[#05050e]/60 border border-white/5 rounded-2xl backdrop-blur-md flex items-center gap-3">
                <CloudRain className="w-5 h-5 text-[#3498db]" />
                <div className="text-left font-mono">
                  <span className="text-[10px] text-slate-500 uppercase block leading-none">Rain Chance</span>
                  <span className="text-base font-bold text-white">{weather.rain_chance}%</span>
                </div>
              </div>
              <div className="p-4 bg-[#05050e]/60 border border-white/5 rounded-2xl backdrop-blur-md flex items-center gap-3">
                <Wind className="w-5 h-5 text-emerald-400" />
                <div className="text-left font-mono">
                  <span className="text-[10px] text-slate-500 uppercase block leading-none">Wind Speed</span>
                  <span className="text-base font-bold text-white">{weather.wind_speed.toFixed(1)} km/h</span>
                </div>
              </div>
              <div className="p-4 bg-[#05050e]/60 border border-white/5 rounded-2xl backdrop-blur-md flex items-center gap-3">
                <Layers className="w-5 h-5 text-accent" />
                <div className="text-left font-mono">
                  <span className="text-[10px] text-slate-500 uppercase block leading-none">Humidity</span>
                  <span className="text-base font-bold text-white">{weather.humidity}%</span>
                </div>
              </div>
            </div>

            {/* Interactive Threat Simulator Control (Visual test overlay) */}
            <div className="p-6 bg-[#05050e]/60 border border-white/5 rounded-3xl backdrop-blur-2xl text-left space-y-4 relative">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <h4 className="font-mono text-xs font-black uppercase text-white tracking-widest">
                  Disaster Simulator
                </h4>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Click any condition below to simulate extreme weather threats, trigger browser warnings, play synthesized alert sweeps, and generate crop prevention guides.
              </p>
              
              <div className="flex flex-wrap gap-2.5">
                {[
                  { name: "clear", label: "Clear Sky", value: "none", color: "border-white/5 bg-white/5 text-slate-400" },
                  { name: "flood", label: "Flood Alert", value: "flood", color: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
                  { name: "cyclone", label: "Cyclone Alert", value: "cyclone", color: "border-rose-500/30 bg-rose-500/10 text-rose-400" },
                  { name: "heatwave", label: "Heatwave", value: "heatwave", color: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
                  { name: "drought", label: "Drought Warning", value: "drought", color: "border-amber-700/30 bg-amber-700/10 text-amber-500" }
                ].map((sim) => (
                  <button
                    key={sim.name}
                    onClick={() => handleSimulationChange(sim.value)}
                    className={`px-3 py-2 border rounded-xl font-mono text-[9px] font-bold uppercase transition-all select-none cursor-pointer hover:brightness-110 ${sim.color} ${
                      activeSimulation === sim.value ? "ring-2 ring-primary scale-[1.03]" : ""
                    }`}
                  >
                    {sim.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Map Layout Panel */}
            <div className="bg-[#05050e]/60 border border-white/5 rounded-3xl p-6 backdrop-blur-2xl flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-primary" />
                  <h4 className="font-mono text-xs font-black uppercase text-white tracking-widest">
                    Disaster Zone Map
                  </h4>
                </div>
                
                {/* Map Overlay Selector */}
                <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-lg p-1">
                  <button 
                    onClick={() => setMapOverlay("none")} 
                    className={`px-2 py-1 text-[8px] font-mono rounded cursor-pointer ${mapOverlay === "none" ? "bg-primary text-black" : "text-slate-400 hover:text-white"}`}
                  >
                    Off
                  </button>
                  <button 
                    onClick={() => setMapOverlay("rain")} 
                    className={`px-2 py-1 text-[8px] font-mono rounded cursor-pointer ${mapOverlay === "rain" ? "bg-primary text-black" : "text-slate-400 hover:text-white"}`}
                  >
                    Rain
                  </button>
                  <button 
                    onClick={() => setMapOverlay("heat")} 
                    className={`px-2 py-1 text-[8px] font-mono rounded cursor-pointer ${mapOverlay === "heat" ? "bg-primary text-black" : "text-slate-400 hover:text-white"}`}
                  >
                    Thermal
                  </button>
                </div>
              </div>

              {/* Dynamic Leaflet component container */}
              <div className="w-full h-[360px] md:h-[420px] rounded-3xl overflow-hidden relative z-0">
                <AdvisorMap 
                  latitude={coords.lat} 
                  longitude={coords.lng} 
                  threatType={activeAlert ? activeAlert.alert_type : null}
                  overlayType={mapOverlay}
                />
              </div>
            </div>

          </div>

          {/* RIGHT AREA: Crop recommendation parameters & tabbed advisor outputs (2/5 width) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Input params controller card */}
            <div className="p-6 bg-[#05050e]/60 border border-white/5 rounded-3xl backdrop-blur-2xl text-left space-y-5">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Sprout className="w-5 h-5 text-primary" />
                <h4 className="font-mono text-xs font-black uppercase text-white tracking-widest">
                  Advisor Configuration
                </h4>
              </div>

              {/* Selectors */}
              <div className="space-y-4 font-mono text-xs text-slate-300">
                <div className="space-y-2">
                  <label className="block font-bold text-slate-500 uppercase tracking-wider text-[9px]">Soil Class</label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="Clay">Clay Soil (Black Cotton)</option>
                    <option value="Loamy">Loamy Soil (Fertile Riverbeds)</option>
                    <option value="Sandy">Sandy Soil (Dry Coastal)</option>
                    <option value="Sandy-Loam">Sandy-Loam (Medium drain)</option>
                    <option value="Red">Red Soil (Iron-rich)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block font-bold text-slate-500 uppercase tracking-wider text-[9px]">Location Region</label>
                  <input
                    type="text"
                    value={regionName}
                    onChange={(e) => setRegionName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. Maharashtra"
                  />
                </div>
              </div>

              {/* Run button */}
              <button
                onClick={runCropAdvisor}
                disabled={loadingCrops}
                className="w-full py-4.5 bg-gradient-to-r from-primary to-accent text-background font-black uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(0,208,132,0.2)] hover:shadow-[0_0_30px_rgba(0,208,132,0.4)] transition-all select-none cursor-pointer disabled:opacity-50"
              >
                {loadingCrops ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Farm Metadata...</span>
                  </div>
                ) : (
                  <span>Query AI Advisor</span>
                )}
              </button>
            </div>

            {/* TAB OUTLET CARD */}
            <div id="advisory-tabs" className="bg-[#05050e]/60 border border-white/5 rounded-3xl p-6 backdrop-blur-2xl flex flex-col min-h-[460px] text-left">
              
              {/* Tabs selector */}
              <div className="flex border-b border-white/5 gap-4 mb-5">
                {[
                  { id: "crops", label: "Crops" },
                  { id: "products", label: "Supplies" },
                  { id: "alert-guide", label: "Safety Guide", badge: activeAlert ? "!" : null }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-2.5 font-mono text-[10px] font-black uppercase tracking-widest transition-all relative cursor-pointer select-none ${
                      activeTab === tab.id ? "text-primary font-extrabold" : "text-slate-500 hover:text-white"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="ml-1 px-1 bg-rose-500 text-white rounded font-sans text-[8px] animate-ping">
                        {tab.badge}
                      </span>
                    )}
                    {activeTab === tab.id && (
                      <motion.div layoutId="tab-underline" className="absolute bottom-0 inset-x-0 h-0.5 bg-primary" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Display Area */}
              <div className="flex-1 flex flex-col justify-start overflow-y-auto max-h-[380px] scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
                
                {/* 1. CROPS RECOMMENDATIONS LIST */}
                {activeTab === "crops" && (
                  <div className="space-y-4">
                    {cropRecs.length === 0 ? (
                      <div className="h-44 flex flex-col items-center justify-center text-center text-muted-foreground text-xs gap-1 opacity-70">
                        <BrainCircuit className="w-8 h-8 text-primary/30 animate-pulse mb-1" />
                        <span>No Crop recommendations loaded.</span>
                        <span>Select soil and click Query AI Advisor.</span>
                      </div>
                    ) : (
                      cropRecs.map((crop, idx) => (
                        <div key={crop.crop_name} className="p-4.5 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 group hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
                          {/* Percent Suitability Circle */}
                          <div className="w-14 h-14 rounded-full bg-black/40 border border-primary/20 flex flex-col items-center justify-center flex-shrink-0 relative">
                            <span className="text-xs font-black text-primary leading-none font-mono">{crop.suitability_percentage}%</span>
                            <span className="text-[7px] text-slate-500 uppercase tracking-widest font-mono mt-0.5">Fit</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-lg leading-none">{crop.emoji}</span>
                              <h4 className="font-extrabold text-sm text-white">{crop.crop_name}</h4>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                              {crop.reason}
                            </p>
                            <div className="flex gap-4 text-[9px] font-mono text-slate-500 mt-2 border-t border-white/5 pt-1.5">
                              <span>Season: <b className="text-slate-300">{crop.season}</b></span>
                              <span>Est Yield: <b className="text-slate-300">{crop.yield}</b></span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 2. MATCHED MARKET SUPPLIES */}
                {activeTab === "products" && (
                  <div className="space-y-4">
                    {loadingProducts ? (
                      <div className="h-44 flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Matching database items...</span>
                      </div>
                    ) : productRecs.length === 0 ? (
                      <div className="h-44 flex flex-col items-center justify-center text-center text-muted-foreground text-xs gap-1 opacity-70">
                        <ShoppingBag className="w-8 h-8 text-primary/30 animate-pulse mb-1" />
                        <span>No supply matching matches found.</span>
                        <span>Complete Crop recommendation query first.</span>
                      </div>
                    ) : (
                      productRecs.map((prod) => (
                        <div key={prod.product_name} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-3 group hover:border-accent/20 transition-all">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 text-left">
                              <span className="px-1.5 py-0.5 bg-accent/10 border border-accent/20 rounded font-mono text-[8px] font-bold text-accent uppercase tracking-wider">
                                {prod.category}
                              </span>
                              <h4 className="font-bold text-xs text-white truncate mt-1">{prod.product_name}</h4>
                            </div>
                            <span className="text-xs font-black text-primary">₹{prod.price}</span>
                          </div>
                          
                          <p className="text-[9px] text-slate-400 leading-normal">
                            {prod.reason}
                          </p>

                          <div className="h-[1px] bg-white/5" />

                          <div className="flex items-center justify-between">
                            <div className="flex flex-col text-left">
                              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">Available at shop</span>
                              <span className="text-[10px] font-extrabold text-white">🌾 {prod.shop_name}</span>
                            </div>

                            {/* Direct Navigate to 3D Stall Link */}
                            <Link href={`/market?targetShopId=${prod.shop_id}`} className="flex-shrink-0">
                              <button className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-[9px] font-mono font-bold uppercase transition-all select-none cursor-pointer flex items-center gap-0.5">
                                <span>Navigate 3D</span>
                                <CornerDownRight className="w-3 h-3" />
                              </button>
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 3. AI DISASTER PREVENTION MANUAL */}
                {activeTab === "alert-guide" && (
                  <div className="space-y-4">
                    {loadingAlert ? (
                      <div className="h-44 flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-3 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
                        <span className="text-[9px] font-mono text-rose-400 uppercase tracking-widest animate-pulse">Gemini threat mapping...</span>
                      </div>
                    ) : !activeAlert ? (
                      <div className="h-44 flex flex-col items-center justify-center text-center text-muted-foreground text-xs gap-1 opacity-70">
                        <Info className="w-8 h-8 text-slate-600 mb-1" />
                        <span>No threat alert guidelines active.</span>
                        <span>Use simulator panel to test.</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-rose-950/20 border border-rose-500/20 rounded-2xl text-left">
                          <h5 className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-black mb-1.5">
                            AI Disaster Diagnostics
                          </h5>
                          <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                            {activeAlert.ai_prevention_guide}
                          </p>
                        </div>

                        <div className="p-4 bg-blue-950/10 border border-blue-500/20 rounded-2xl text-left font-mono text-[9px] text-blue-400 uppercase tracking-widest">
                          🛡️ Advisory Locked // Synced GPS
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
