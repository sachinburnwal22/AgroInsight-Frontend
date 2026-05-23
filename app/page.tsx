"use client";

import {
  Droplet,
  Thermometer,
  Leaf,
  Cloud,
  Menu,
  TrendingUp,
  AlertCircle,
  Settings,
  Bell,
  Search,
  ChevronDown,
  X,
  BarChart3,
  Book,
  Sprout,
  Users,
  Map,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import axios from "axios";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import Particles from "@/components/ui/Particles";
import MapSection from "@/components/map/MapSection";
import FloatingNavbar from "@/components/ui/FloatingNavbar";
import FieldStatusSection from "@/components/dashboard/FieldStatusSection";
import FlowingMenu from "@/components/ui/FlowingMenu";
import ElectricBorder from "@/components/ui/ElectricBorder";

const WeatherMiniMap = dynamic(
  () => import("@/components/map/WeatherMiniMap"),
  { ssr: false }
);

const WeatherIntelligence = dynamic(
  () => import("@/components/map/WeatherIntelligence"),
  { ssr: false }
);

function AnimatedCounter({ value, delay = 0 }: { value: string | number; delay?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const numValue = parseInt(String(value));

  useEffect(() => {
    const duration = 1.5;
    const frameCount = 30;
    const increment = numValue / frameCount;
    let current = 0;
    let frame = 0;

    const interval = setInterval(() => {
      current += increment;
      frame++;
      if (frame >= frameCount) {
        setDisplayValue(numValue);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, (duration * 1000) / frameCount);

    return () => clearInterval(interval);
  }, [numValue]);

  return <span>{displayValue}</span>;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [actionResponse, setActionResponse] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);

  const [formData, setFormData] = useState({
    region: user?.region || "Global",
    moisture: "45",
    crop: "Wheat",
    ph: "6.5",
    date: new Date().toISOString().split('T')[0],
    reportType: "Weekly Summary",
    irrigationThreshold: "30",
    tempThreshold: "35"
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get("http://127.0.0.1:8000/api/dashboard", { headers });
        // The Laravel API wraps the payload in a 'data' key, so we need res.data.data
        setDashboardData(res.data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        setDashboardData({}); // Prevent infinite loading
      }
    };
    fetchDashboard();
  }, []);

  const handleActionClick = (actionLabel: string) => {
    setActiveAction(actionLabel);
    setActionResponse(null);
    setWeatherData(null);
  };

  const handleActionSubmit = async () => {
    setLoadingAction(true);
    setActionResponse(null);
    try {
      let endpoint = "";
      let payload = {};

      switch (activeAction) {
        case "Start Irrigation":
          endpoint = "/api/irrigation/start";
          payload = {
            region: formData.region,
            irrigation: formData.moisture || dashboardData?.quick_stats?.[0]?.value || 50,
            crop: formData.crop
          };
          break;
        case "Schedule Spraying":
          endpoint = "/api/spraying/schedule";
          payload = { date: formData.date, crop: formData.crop, region: formData.region };
          break;
        case "Check Soil pH":
          endpoint = "/api/soil/analyze";
          payload = { ph: formData.ph, region: formData.region };
          break;
        case "View Weather":
          endpoint = "/api/weather/view";
          payload = { region: formData.region };
          break;
        case "Generate Report":
          endpoint = "/api/report/generate";
          payload = { type: formData.reportType, region: formData.region };
          break;
        case "Alert Settings":
          endpoint = "/api/alerts";
          payload = {
            irrigation_threshold: formData.irrigationThreshold,
            temperature_threshold: formData.tempThreshold
          };
          break;
      }

      const res = await axios.post(`http://127.0.0.1:8000${endpoint}`, payload);

      if (activeAction === "Check Soil pH" && res.data.soil_type) {
        setActionResponse(`**Soil Type:** ${res.data.soil_type}\n\n**Recommendation:**\n${res.data.recommendation}\n\n**Suggested Crops:** ${(res.data.suggested_crops || []).join(", ")}`);
      } else if (activeAction === "View Weather") {
        setWeatherData(res.data);
        setActionResponse(res.data.summary);
      } else {
        setActionResponse(res.data.message || res.data.summary || "Action completed successfully.");
      }
    } catch (error) {
      setActionResponse("Failed to process request. Please check the backend connection.");
    } finally {
      setLoadingAction(false);
    }
  };

  const iconMap: { [key: string]: any } = {
    Droplet,
    Thermometer,
    Leaf,
    Cloud,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-[#0f0f2e] text-foreground overflow-hidden">
      {/* Navbar */}
      <FloatingNavbar />

      <main className="pt-20 pb-12 relative z-10">
        {/* Hero Section with Video & 3D Elements */}
        <div className="relative h-screen -mt-20 mb-0 flex items-center justify-center overflow-hidden">
          {/* Video Background */}
          <motion.div className="absolute inset-0 z-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}>
            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src="https://www.pexels.com/download/video/16795683/" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
          </motion.div>

          {/* 3D Floating Elements Overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Particles
              particleColors={["#00d084", "#00b4d8", "#7b2cbf"]}
              particleCount={120}
              particleSpread={10}
              speed={0.12}
              particleBaseSize={100}
              moveParticlesOnHover={true}
              alphaParticles={true}
              disableRotation={false}
            />
          </div>

          {/* Hero Content */}
          <motion.div
            className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {user && user.region && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-primary/30 backdrop-blur-md"
              >
                <span className="text-xl">🌾</span>
                <p className="text-white font-medium">Welcome, Farmer from {user.region}</p>
              </motion.div>
            )}
            <motion.h1
              className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Smart Agriculture Awaits
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Monitor your crops in real-time, make data-driven decisions, and maximize your agricultural yield with our advanced analytics platform.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Link href="#dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-lg bg-gradient-to-r from-primary to-accent text-background font-bold text-lg shadow-[0_0_20px_rgba(0,208,132,0.4)] hover:shadow-[0_0_30px_rgba(0,208,132,0.6)] transition-all duration-300"
                >
                  View Dashboard
                </motion.button>
              </Link>
              <Link href="/community">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-lg border-2 border-primary text-primary font-bold text-lg hover:bg-primary/10 transition-all duration-300 backdrop-blur-md"
                >
                  Join Community
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <div id="dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          {/* Quick Stats Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {dashboardData && dashboardData.quick_stats ? dashboardData.quick_stats.map((stat: any, idx: number) => {
              const Icon = iconMap[stat.icon] || Droplet;
              const colorClasses = {
                primary: "shadow-primary/30 hover:shadow-primary/50 border-primary/40",
                accent: "shadow-accent/30 hover:shadow-accent/50 border-accent/40",
                secondary: "shadow-secondary/30 hover:shadow-secondary/50 border-secondary/40",
              };

              return (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  onMouseEnter={() => setHoveredStat(idx)}
                  onMouseLeave={() => setHoveredStat(null)}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className={`relative group bg-card/60 border rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 shadow-xl ${colorClasses[stat.color as keyof typeof colorClasses]} overflow-hidden`}
                >
                  {/* Animated Glow BG */}
                  <motion.div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${stat.color === "primary" ? "from-primary/10 to-accent/10" : stat.color === "accent" ? "from-accent/10 to-primary/10" : "from-secondary/10 to-primary/10"}`}
                    animate={hoveredStat === idx ? { backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] } : {}}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <div className="relative z-10">
                    <motion.div
                      animate={hoveredStat === idx ? { rotate: 360, scale: 1.2 } : { rotate: 0, scale: 1 }}
                      transition={{ duration: 0.6 }}
                      className={`p-4 rounded-xl mb-4 inline-block bg-gradient-to-br ${stat.color === "primary" ? "from-primary/20 to-primary/5" : stat.color === "accent" ? "from-accent/20 to-accent/5" : "from-secondary/20 to-secondary/5"} border border-${stat.color}/40`}
                    >
                      <Icon className={`w-6 h-6 text-${stat.color}`} />
                    </motion.div>
                    <p className="text-sm text-muted-foreground mb-1 font-medium">{stat.label}</p>
                    <motion.p className={`text-4xl font-bold mb-3 text-${stat.color}`} key={hoveredStat}>
                      <AnimatedCounter value={stat.value} delay={idx * 0.1} />
                      {stat.value < 100 && "%"}
                    </motion.p>
                    <motion.div className="flex items-center gap-1 text-xs font-semibold text-primary">
                      <TrendingUp className="w-4 h-4" />
                      <span>{stat.trend}</span>
                    </motion.div>
                  </div>
                </motion.div>
              );
            }) : (
              <div className="col-span-full flex justify-center py-12">
                <Loader2Icon className="w-12 h-12 animate-spin text-primary" />
              </div>
            )}
          </motion.div>

          {/* Main Dashboard Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            {/* Left Column: Quick Actions */}
            <motion.div className="lg:col-span-1 space-y-6" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl font-bold flex items-center">
                <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mr-3">
                  <Cloud className="w-5 h-5 text-primary" />
                </span>
                Quick Actions
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {[
                  { label: "Start Irrigation", icon: "💧", color: "primary" },
                  { label: "Schedule Spraying", icon: "🌾", color: "accent" },
                  { label: "Check Soil pH", icon: "🧪", color: "secondary" },
                  { label: "View Weather", icon: "⛅", color: "primary" },
                  { label: "Generate Report", icon: "📊", color: "accent" },
                  { label: "Alert Settings", icon: "🔔", color: "destructive" },
                ].map((action, idx) => (
                  <motion.button
                    key={action.label}
                    onClick={() => handleActionClick(action.label)}
                    whileHover={{ scale: 1.05, x: 10 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative group p-4 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${action.color === "primary" ? "bg-gradient-to-r from-primary/30 to-primary/10 border border-primary/40 text-primary hover:shadow-[0_0_15px_rgba(0,208,132,0.4)]" : action.color === "accent" ? "bg-gradient-to-r from-accent/30 to-accent/10 border border-accent/40 text-accent hover:shadow-[0_0_15px_rgba(0,180,216,0.4)]" : action.color === "secondary" ? "bg-gradient-to-r from-secondary/30 to-secondary/10 border border-secondary/40 text-secondary hover:shadow-[0_0_15px_rgba(123,44,191,0.4)]" : "bg-gradient-to-r from-destructive/30 to-destructive/10 border border-destructive/40 text-destructive hover:shadow-[0_0_15px_rgba(255,107,107,0.4)]"}`}
                  >
                    <span className="text-2xl mr-3">{action.icon}</span>
                    <span className="relative z-10">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Right Column: Field Status */}
            <div className="lg:col-span-2">
              <FieldStatusSection />
            </div>
          </div>

          {/* Interactive Map Section */}
          <MapSection />

          {/* Farming Tips Section */}
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="mb-20">
            <h2 className="text-3xl font-bold mb-2">Farming Tips & Best Practices</h2>
            <p className="text-muted-foreground mb-8">Learn sustainable farming techniques to maximize your crop yield</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Crop Rotation", desc: "Rotate crops seasonally to reduce soil nutrient depletion and pest buildup", tips: ["Alternate legumes with cereals", "Improve soil fertility naturally", "Reduce pesticide use by 30%"], emoji: "🔄", color: "#3b82f6" },
                { title: "Water Management", desc: "Optimize irrigation schedules based on soil moisture and weather patterns", tips: ["Drip irrigation saves 40% water", "Monitor rainfall patterns", "Schedule irrigation wisely"], emoji: "💧", color: "#00b4d8" },
                { title: "Soil Health", desc: "Maintain soil pH and nutrients for sustainable long-term productivity", tips: ["Test soil every 2-3 years", "Add organic compost regularly", "Avoid continuous monoculture"], emoji: "🌱", color: "#10b981" },
                { title: "Pest Management", desc: "Integrated pest management reduces chemical usage and costs", tips: ["Use natural predators", "Companion planting works", "Early detection is key"], emoji: "🐛", color: "#a855f7" },
                { title: "Seasonal Planting", desc: "Plant crops according to seasons and regional climate patterns", tips: ["Follow local rainfall patterns", "Check government crop calendars", "Plan 3-6 months ahead"], emoji: "📅", color: "#f59e0b" },
                { title: "Market Analysis", desc: "Choose crops based on market demand and price trends", tips: ["Check MSP rates", "Research buyer networks", "Plan crop diversity"], emoji: "📈", color: "#6366f1" }
              ].map((tip, idx) => (
                <motion.div 
                  key={tip.title} 
                  variants={itemVariants} 
                  whileHover={{ y: -10 }}
                  className="h-full"
                >
                  <ElectricBorder
                    color={tip.color}
                    speed={1}
                    chaos={0.1}
                    borderRadius={24}
                  >
                    <div className="bg-card/90 border border-white/5 rounded-[24px] p-6 backdrop-blur-xl h-full flex flex-col justify-between">
                      <div>
                        <div className="text-4xl mb-3">{tip.emoji}</div>
                        <h3 className="text-xl font-bold mb-2 text-white">{tip.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{tip.desc}</p>
                      </div>
                      <div className="space-y-2 mt-auto">
                        {tip.tips.map((item, i) => (
                          <div key={item} className="flex items-start gap-2 text-sm text-white/80">
                            <span className="text-primary font-bold">✓</span> 
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ElectricBorder>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Features Section */}
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-20">
            <h2 className="text-3xl font-bold mb-2">Why Choose AgroInsight</h2>
            <p className="text-muted-foreground mb-8">Powerful features designed for modern farmers</p>
            <div className="relative w-full overflow-hidden">
              <FlowingMenu 
                items={[
                  { 
                    link: "#", 
                    text: "Real-Time Monitoring", 
                    image: "https://images.unsplash.com/photo-1563514220-ea979fda5a18?auto=format&fit=crop&w=600&q=80" 
                  },
                  { 
                    link: "#", 
                    text: "Weather Integration", 
                    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80" 
                  },
                  { 
                    link: "#", 
                    text: "Crop Analytics", 
                    image: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80" 
                  },
                  { 
                    link: "#", 
                    text: "Expert Guidance", 
                    image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80" 
                  },
                  { 
                    link: "#", 
                    text: "Market Insights", 
                    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80" 
                  },
                  { 
                    link: "#", 
                    text: "Government Schemes", 
                    image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=600&q=80" 
                  }
                ]} 
                marqueeBgColor="#00d084" 
                marqueeTextColor="#09090b" 
                borderColor="rgba(255, 255, 255, 0.08)"
                speed={12} 
              />
            </div>
          </motion.div>
        </div>
      </main>

      {/* AI Assistant Modal */}
      <AnimatePresence>
        {activeAction === "View Weather" && (
          <WeatherIntelligence onClose={() => setActiveAction(null)} />
        )}
        {activeAction && activeAction !== "View Weather" && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setActiveAction(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-[#0a0a1a]/90 border border-primary/30 rounded-3xl shadow-[0_0_50px_rgba(0,208,132,0.2)] p-8 backdrop-blur-2xl">
              <button onClick={() => setActiveAction(null)} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white"><X className="w-5 h-5" /></button>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-6 flex items-center gap-3"><span className="text-3xl text-foreground">✨</span> AI Assistant: {activeAction}</h3>
              
              <div className="min-h-[150px] max-h-[60vh] overflow-y-auto pr-2">
                {!loadingAction && !actionResponse && (
                  <div className="space-y-4">
                    {activeAction === "Start Irrigation" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-muted-foreground mb-1">Region</label>
                          <input type="text" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-primary" />
                        </div>
                        <div>
                          <label className="block text-sm text-muted-foreground mb-1">Soil Moisture (%)</label>
                          <input type="number" value={formData.moisture} onChange={e => setFormData({...formData, moisture: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-primary" />
                        </div>
                      </div>
                    )}
                    {activeAction === "Schedule Spraying" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-muted-foreground mb-1">Crop Type</label>
                          <input type="text" value={formData.crop} onChange={e => setFormData({...formData, crop: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-primary" />
                        </div>
                        <div>
                          <label className="block text-sm text-muted-foreground mb-1">Date</label>
                          <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-primary" />
                        </div>
                      </div>
                    )}
                    {activeAction === "Check Soil pH" && (
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1">Soil pH Value</label>
                        <input type="number" step="0.1" value={formData.ph} onChange={e => setFormData({...formData, ph: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-primary" />
                      </div>
                    )}
                    <button onClick={handleActionSubmit} className="w-full py-3 mt-4 rounded-xl bg-primary hover:bg-primary/90 text-black font-bold shadow-[0_0_20px_rgba(0,208,132,0.4)]">Execute AI Task</button>
                  </div>
                )}
                {loadingAction && (
                  <div className="h-[200px] flex flex-col items-center justify-center gap-4">
                    <Loader2Icon className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-primary font-medium animate-pulse">Gemini is processing your request...</p>
                  </div>
                )}
                {!loadingAction && actionResponse && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 p-6 rounded-2xl border border-primary/20">
                    <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{actionResponse}</p>
                    <button onClick={() => setActionResponse(null)} className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors">Start Over</button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Loader2Icon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
  );
}

function LogOutIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
  );
}
