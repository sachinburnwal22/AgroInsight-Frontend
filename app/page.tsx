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
import { motion } from "framer-motion";
import MapSection from "@/components/map/MapSection";
import Link from "next/link";
import axios from "axios";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";

const WeatherMiniMap = dynamic(
  () => import("@/components/map/WeatherMiniMap"),
  { ssr: false }
);

// Animated Counter Component
function AnimatedCounter({
  value,
  delay = 0,
}: {
  value: string | number;
  delay?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const numValue = parseInt(String(value));

  useEffect(() => {
    const duration = 1.5;
    const frameCount = 30;
    const increment = numValue / frameCount;
    let current = 0;
    let frame = 0;

    const interval = setInterval(
      () => {
        current += increment;
        frame++;
        if (frame >= frameCount) {
          setDisplayValue(numValue);
          clearInterval(interval);
        } else {
          setDisplayValue(Math.floor(current));
        }
      },
      (duration * 1000) / frameCount,
    );

    return () => clearInterval(interval);
  }, [numValue]);

  return <span>{displayValue}</span>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Gemini Quick Actions State
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [actionResponse, setActionResponse] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // Form states for Quick Actions
  const [formData, setFormData] = useState({
    region: "Maharashtra",
    crop: "Wheat",
    date: "",
    ph: "",
    moisture: "53",
    irrigationThreshold: "40",
    tempThreshold: "35",
    reportType: "Weekly Summary"
  });

  const [weatherData, setWeatherData] = useState<any>(null);

  const handleActionClick = (actionLabel: string) => {
    setActiveAction(actionLabel);
    setActionResponse(null);
    setWeatherData(null);
    setLoadingAction(false);
  };

  const submitAction = async (actionLabel: string) => {
    setLoadingAction(true);
    setActionResponse(null);

    try {
      let endpoint = "";
      let payload = {};

      switch (actionLabel) {
        case "Start Irrigation":
          endpoint = "/api/irrigation/start";
          payload = { 
            region: formData.region || "Global", 
            irrigation: formData.moisture || dashboardData?.quick_stats?.[0]?.value || 50,
            crop: formData.crop
          };
          break;
        case "Schedule Spraying":
          endpoint = "/api/spraying/schedule";
          payload = { crop: formData.crop, date: formData.date };
          break;
        case "Check Soil pH":
          endpoint = "/api/soil/analyze";
          payload = { ph: formData.ph };
          break;
        case "View Weather":
          endpoint = "/api/weather/view";
          payload = { region: formData.region };
          break;
        case "Generate Report":
          endpoint = "/api/report/generate";
          payload = { region: formData.region, report_type: formData.reportType, data: dashboardData };
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
      
      // Parse specific responses
      if (actionLabel === "Check Soil pH" && res.data.soil_type) {
        setActionResponse(`**Soil Type:** ${res.data.soil_type}\n\n**Recommendation:**\n${res.data.recommendation}\n\n**Suggested Crops:** ${(res.data.suggested_crops || []).join(", ")}`);
      } else if (actionLabel === "View Weather" && res.data.temp) {
        setWeatherData(res.data);
        setActionResponse(`**Temperature:** ${res.data.temp}°C\n**Humidity:** ${res.data.humidity}%\n**Wind Speed:** ${res.data.wind_speed} km/h\n**Rain Chance:** ${res.data.rain_chance}%\n\n**AI Advice:**\n${res.data.advice}`);
      } else if (actionLabel === "Generate Report" && res.data.summary) {
        setActionResponse(`**Summary:**\n${res.data.summary}\n\n**Issues:**\n${res.data.issues}\n\n**Recommendations:**\n${res.data.recommendations}`);
      } else if (res.data.ai_suggestion) {
        setActionResponse(res.data.ai_suggestion);
      } else {
        setActionResponse(res.data.message || JSON.stringify(res.data));
      }
    } catch (err: any) {
      setActionResponse("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setLoadingAction(false);
    }
  };

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/dashboard")
      .then((res) => res.json())
      .then((data) => setDashboardData(data.data))
      .catch((err) => console.error("Failed to fetch dashboard data", err));
  }, []);

  const iconMap: { [key: string]: any } = {
    Droplet,
    Thermometer,
    Leaf,
    Cloud,
    Sprout,
    Map
  };

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#0f0f2e] text-foreground overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-32 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"
          animate={{
            x: [0, 20, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      {/* Sidebar Menu with Overlay */}
      {sidebarOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSidebarOpen(false)}
          />

          <motion.div
            className="fixed left-0 top-0 bottom-0 z-40 w-72 bg-card border-r border-border shadow-2xl"
            initial={{ x: -288 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="h-20 flex items-center justify-between px-6 border-b border-border">
              <h3 className="text-lg font-bold text-primary">Menu</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-4 space-y-2">
              {[
                { label: "Dashboard", icon: BarChart3, href: "/" },
                {
                  label: "Cropping Patterns",
                  icon: Sprout,
                  href: "/cropping-patterns",
                },
                {
                  label: "Crop Recommendation",
                  icon: Leaf,
                  href: "/crop-recommendation",
                },
                { label: "Resources", icon: Book, href: "/resources" },
                { label: "Community", icon: Users, href: "/community" },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className="block w-full"
                    >
                      <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/50 hover:bg-muted text-foreground transition-all duration-300 group cursor-pointer hover:scale-105 active:scale-95">
                        <Icon className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
                        <span className="font-medium flex-1">{item.label}</span>
                        <ChevronDown className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
              <motion.div
                className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/40 rounded-lg p-4"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <p className="text-sm text-foreground font-semibold mb-2">
                  Pro Tip
                </p>
                <p className="text-xs text-muted-foreground">
                  Check out Cropping Patterns to learn about optimal crop
                  cultivation based on your region
                </p>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-transparent backdrop-blur-md bg-gradient-to-b from-background/40 to-transparent border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              whileHover={{
                scale: 1.1,
                backgroundColor: "rgba(var(--primary), 0.15)",
              }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 relative cursor-pointer flex items-center justify-center group"
              type="button"
            >
              <Menu className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
            </motion.button>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <motion.h1
                className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
              >
                AgroInsight
              </motion.h1>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex items-center gap-3 md:gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl px-4 py-2 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
            >
              <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search crops, fields..."
                className="bg-transparent text-sm placeholder-muted-foreground outline-none w-40 group-hover:placeholder-primary/60 transition-colors"
              />
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 hover:bg-accent/15 rounded-xl transition-all duration-300 relative cursor-pointer group"
            >
              <Bell className="w-5 h-5 text-accent group-hover:text-accent transition-colors" />
              <motion.span
                className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>

            <Link href={user ? "/profile" : "/login"}>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 20 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 hover:bg-primary/15 rounded-xl transition-all duration-300 cursor-pointer group hidden sm:flex"
              >
                {user && user.profile_image ? (
                  <img src={`http://127.0.0.1:8000${user.profile_image}`} alt="Profile" className="w-6 h-6 rounded-full object-cover border border-primary/30" />
                ) : (
                  <Settings className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-12 relative z-10">
        {/* Hero Section with Video */}
        <div className="relative h-screen -mt-20 mb-0 flex items-center justify-center overflow-hidden">
          {/* Video Background */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 600'%3E%3Crect fill='%230a0a0a' width='1200' height='600'/%3E%3C/svg%3E"
            >
              <source
                src="https://www.pexels.com/download/video/16795683/"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" />
          </motion.div>

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
              Monitor your crops in real-time, make data-driven decisions, and
              maximize your agricultural yield with AgroInsight's advanced
              analytics platform.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-primary to-accent text-background font-bold text-lg shadow-lg shadow-primary/50 hover:shadow-primary/80 transition-all duration-300"
              >
                Get Started
              </motion.button>
              <Link href="/cropping-patterns">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-lg border-2 border-primary text-primary font-bold text-lg hover:bg-primary/10 transition-all duration-300"
                >
                  Learn Cropping Patterns
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Dashboard Section Title */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2
              className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent"
              animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              Real-time Dashboard
            </motion.h2>
            <p className="text-lg text-muted-foreground">
              Monitor your agricultural operations with comprehensive metrics
              and insights
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {dashboardData ? dashboardData.quick_stats.map((stat: any, idx: number) => {
              const Icon = iconMap[stat.icon] || Droplet;
              const colorClasses = {
                primary:
                  "shadow-primary/30 hover:shadow-primary/50 border-primary/40",
                accent:
                  "shadow-accent/30 hover:shadow-accent/50 border-accent/40",
                secondary:
                  "shadow-secondary/30 hover:shadow-secondary/50 border-secondary/40",
              };

              return (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  onMouseEnter={() => setHoveredStat(idx)}
                  onMouseLeave={() => setHoveredStat(null)}
                  whileHover={{ scale: 1.08, y: -10 }}
                  className={`relative group bg-card/60 border rounded-2xl p-6 backdrop-blur-xl cursor-pointer transition-all duration-300 shadow-xl ${colorClasses[stat.color as keyof typeof colorClasses]} overflow-hidden`}
                >
                  {/* Animated Background Gradient */}
                  <motion.div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${
                      stat.color === "primary"
                        ? "from-primary/10 to-accent/10"
                        : stat.color === "accent"
                          ? "from-accent/10 to-primary/10"
                          : "from-secondary/10 to-primary/10"
                    }`}
                    animate={
                      hoveredStat === idx
                        ? {
                            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                          }
                        : {}
                    }
                    transition={{ duration: 3, repeat: Infinity }}
                  />

                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div
                      animate={
                        hoveredStat === idx
                          ? { rotate: 360, scale: 1.2 }
                          : { rotate: 0, scale: 1 }
                      }
                      transition={{ duration: 0.6 }}
                      className={`p-4 rounded-xl mb-4 inline-block bg-gradient-to-br ${
                        stat.color === "primary"
                          ? "from-primary/20 to-primary/5"
                          : stat.color === "accent"
                            ? "from-accent/20 to-accent/5"
                            : "from-secondary/20 to-secondary/5"
                      } border ${stat.color === "primary" ? "border-primary/40" : stat.color === "accent" ? "border-accent/40" : "border-secondary/40"}`}
                    >
                      <Icon className={`w-6 h-6 text-${stat.color}`} />
                    </motion.div>

                    {/* Label and Value */}
                    <p className="text-sm text-muted-foreground mb-1 font-medium">
                      {stat.label}
                    </p>
                    <motion.p
                      className={`text-4xl font-bold mb-3 text-${stat.color}`}
                      key={hoveredStat}
                    >
                      <AnimatedCounter value={stat.value} delay={idx * 0.1} />
                      {stat.value < 100 && "%"}
                    </motion.p>

                    {/* Trend Badge */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={
                        hoveredStat === idx
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0, y: 10 }
                      }
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-1 text-xs font-semibold text-primary"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>{stat.trend}</span>
                    </motion.div>
                  </div>

                  {/* Glow Effect */}
                  <motion.div
                    className={`absolute inset-0 rounded-2xl ${
                      stat.color === "primary"
                        ? "bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0"
                        : stat.color === "accent"
                          ? "bg-gradient-to-r from-accent/0 via-accent/0 to-accent/0"
                          : "bg-gradient-to-r from-secondary/0 via-secondary/0 to-secondary/0"
                    }`}
                    animate={
                      hoveredStat === idx
                        ? {
                            boxShadow: [
                              `0 0 20px 0 ${stat.color === "primary" ? "rgba(0, 208, 132, 0.3)" : stat.color === "accent" ? "rgba(0, 180, 216, 0.3)" : "rgba(123, 44, 191, 0.3)"}`,
                              `0 0 40px 10px ${stat.color === "primary" ? "rgba(0, 208, 132, 0.2)" : stat.color === "accent" ? "rgba(0, 180, 216, 0.2)" : "rgba(123, 44, 191, 0.2)"}`,
                              `0 0 20px 0 ${stat.color === "primary" ? "rgba(0, 208, 132, 0.3)" : stat.color === "accent" ? "rgba(0, 180, 216, 0.3)" : "rgba(123, 44, 191, 0.3)"}`,
                            ],
                          }
                        : {}
                    }
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              );
            }) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-4 flex justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full"
                />
              </div>
            )}
          </motion.div>

          {/* Field Status Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-12"
          >
            <motion.div
              variants={itemVariants}
              className="bg-card/60 border border-border rounded-2xl p-8 backdrop-blur-xl overflow-hidden relative group"
            >
              {/* Animated Background */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-br from-primary/20 to-accent/20 transition-opacity duration-500"
                animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
                transition={{ duration: 5, repeat: Infinity }}
              />

              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    🌱
                  </motion.span>
                  Field Status Overview
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {dashboardData ? dashboardData.field_status.slice(0, 6).map((field: any, idx: number) => (
                    <motion.div
                      key={field.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + idx * 0.15, duration: 0.6 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className={`p-6 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border border-border/50 hover:border-${field.color === "primary" ? "primary" : field.color === "accent" ? "accent" : "destructive"}/50 transition-all duration-300 group/card cursor-pointer`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <p className="font-bold text-lg">{field.name}</p>
                        <motion.span
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            field.color === "primary"
                              ? "bg-primary/20 text-primary"
                              : field.color === "accent"
                                ? "bg-accent/20 text-accent"
                                : "bg-destructive/20 text-destructive"
                          }`}
                        >
                          {field.status}
                        </motion.span>
                      </div>

                      {/* Progress Bar with Shimmer */}
                      <div className="relative mb-4">
                        <div className="w-full bg-muted/40 rounded-full h-3 overflow-hidden border border-border/30">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${
                              field.color === "primary"
                                ? "from-primary via-primary/60 to-accent"
                                : field.color === "accent"
                                  ? "from-accent via-accent/60 to-primary"
                                  : "from-destructive via-destructive/60 to-destructive/30"
                            } rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${field.progress}%` }}
                            transition={{
                              duration: 1.5,
                              ease: "easeOut",
                              delay: 0.2 + idx * 0.15,
                            }}
                            whileHover={{
                              boxShadow: `0 0 15px ${
                                field.color === "primary"
                                  ? "rgba(0, 208, 132, 0.6)"
                                  : field.color === "accent"
                                    ? "rgba(0, 180, 216, 0.6)"
                                    : "rgba(255, 107, 107, 0.6)"
                              }`,
                            }}
                          />
                        </div>
                        <motion.div
                          className={`absolute inset-0 rounded-full bg-gradient-to-r ${
                            field.color === "primary"
                              ? "from-primary/30 to-transparent"
                              : field.color === "accent"
                                ? "from-accent/30 to-transparent"
                                : "from-destructive/30 to-transparent"
                          } opacity-0 group-hover/card:opacity-100`}
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          style={{ width: "100%" }}
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                          Health Score
                        </p>
                        <motion.p
                          className={`font-bold text-lg text-${field.color === "primary" ? "primary" : field.color === "accent" ? "accent" : "destructive"}`}
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: idx * 0.2,
                          }}
                        >
                          {field.progress}%
                        </motion.p>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="col-span-1 md:col-span-3 flex justify-center py-12">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Interactive Map Section */}
          <MapSection />

          {/* Quick Actions Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-20"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-accent" />
                Quick Actions
              </h3>
            </motion.div>

            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Start Irrigation", icon: "💧", color: "primary" },
                { label: "Schedule Spraying", icon: "🌾", color: "accent" },
                { label: "Check Soil pH", icon: "🧪", color: "secondary" },
                { label: "View Weather", icon: "⛅", color: "primary" },
                { label: "Generate Report", icon: "📊", color: "accent" },
                { label: "Alert Settings", icon: "🔔", color: "destructive" },
              ].map((action, idx) => (
                <motion.button
                  onClick={() => handleActionClick(action.label)}
                  key={action.label}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative group p-4 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${
                    action.color === "primary"
                      ? "bg-gradient-to-r from-primary/30 to-primary/10 border border-primary/40 text-primary hover:shadow-lg hover:shadow-primary/40"
                      : action.color === "accent"
                        ? "bg-gradient-to-r from-accent/30 to-accent/10 border border-accent/40 text-accent hover:shadow-lg hover:shadow-accent/40"
                        : action.color === "secondary"
                          ? "bg-gradient-to-r from-secondary/30 to-secondary/10 border border-secondary/40 text-secondary hover:shadow-lg hover:shadow-secondary/40"
                          : "bg-gradient-to-r from-destructive/30 to-destructive/10 border border-destructive/40 text-destructive hover:shadow-lg hover:shadow-destructive/40"
                  }`}
                >
                  <motion.span
                    className="text-2xl mr-2"
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: idx * 0.1,
                    }}
                  >
                    {action.icon}
                  </motion.span>
                  <span className="relative z-10">{action.label}</span>

                  <motion.div
                    className={`absolute inset-0 rounded-xl ${
                      action.color === "primary"
                        ? "bg-primary/20"
                        : action.color === "accent"
                          ? "bg-accent/20"
                          : action.color === "secondary"
                            ? "bg-secondary/20"
                            : "bg-destructive/20"
                    }`}
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.button>
              ))}
            </motion.div>
          </motion.div>

          {/* Farming Tips Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-20"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <h2 className="text-3xl font-bold mb-2">
                Farming Tips & Best Practices
              </h2>
              <p className="text-muted-foreground">
                Learn sustainable farming techniques to maximize your crop yield
              </p>
            </motion.div>

            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Crop Rotation",
                  desc: "Rotate crops seasonally to reduce soil nutrient depletion and pest buildup",
                  tips: [
                    "Alternate legumes with cereals",
                    "Improve soil fertility naturally",
                    "Reduce pesticide use by 30%",
                  ],
                  emoji: "🔄",
                },
                {
                  title: "Water Management",
                  desc: "Optimize irrigation schedules based on soil moisture and weather patterns",
                  tips: [
                    "Drip irrigation saves 40% water",
                    "Monitor rainfall patterns",
                    "Schedule irrigation wisely",
                  ],
                  emoji: "💧",
                },
                {
                  title: "Soil Health",
                  desc: "Maintain soil pH and nutrients for sustainable long-term productivity",
                  tips: [
                    "Test soil every 2-3 years",
                    "Add organic compost regularly",
                    "Avoid continuous monoculture",
                  ],
                  emoji: "🌱",
                },
                {
                  title: "Pest Management",
                  desc: "Integrated pest management reduces chemical usage and costs",
                  tips: [
                    "Use natural predators",
                    "Companion planting works",
                    "Early detection is key",
                  ],
                  emoji: "🐛",
                },
                {
                  title: "Seasonal Planting",
                  desc: "Plant crops according to seasons and regional climate patterns",
                  tips: [
                    "Follow local rainfall patterns",
                    "Check government crop calendars",
                    "Plan 3-6 months ahead",
                  ],
                  emoji: "📅",
                },
                {
                  title: "Market Analysis",
                  desc: "Choose crops based on market demand and price trends",
                  tips: [
                    "Check MSP rates",
                    "Research buyer networks",
                    "Plan crop diversity",
                  ],
                  emoji: "📈",
                },
              ].map((tip, idx) => (
                <motion.div
                  key={tip.title}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className="bg-card/60 border border-border rounded-2xl p-6 backdrop-blur-xl overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-br from-primary/30 to-accent/30 transition-opacity duration-500"
                    animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
                    transition={{ duration: 5, repeat: Infinity }}
                  />

                  <div className="relative z-10">
                    <motion.div
                      className="text-4xl mb-3"
                      animate={{ rotate: [0, -5, 5, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: idx * 0.1,
                      }}
                    >
                      {tip.emoji}
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2">{tip.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {tip.desc}
                    </p>

                    <div className="space-y-2">
                      {tip.tips.map((item, i) => (
                        <motion.div
                          key={item}
                          className="flex items-start gap-2 text-sm"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.05 }}
                        >
                          <span className="text-primary font-bold">✓</span>
                          <span>{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Features Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-20"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <h2 className="text-3xl font-bold mb-2">
                Why Choose AgroInsight
              </h2>
              <p className="text-muted-foreground">
                Powerful features designed for modern farmers
              </p>
            </motion.div>

            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Real-time Monitoring",
                  desc: "Track soil moisture, temperature, and crop health 24/7 with IoT sensors",
                  icon: "📊",
                },
                {
                  title: "Weather Integration",
                  desc: "Get accurate weather forecasts tailored to your farm location",
                  icon: "🌤️",
                },
                {
                  title: "Crop Analytics",
                  desc: "Analyze yield patterns and optimize crop selection for maximum ROI",
                  icon: "📈",
                },
                {
                  title: "Expert Guidance",
                  desc: "Access personalized recommendations from agricultural experts",
                  icon: "👨‍🌾",
                },
                {
                  title: "Market Insights",
                  desc: "Monitor crop prices and market trends to maximize profits",
                  icon: "💰",
                },
                {
                  title: "Government Schemes",
                  desc: "Get updates on subsidies, MSP rates, and agricultural programs",
                  icon: "📋",
                },
              ].map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  whileHover={{ x: 10 }}
                  className="flex gap-4 p-6 bg-card/60 border border-border rounded-xl backdrop-blur-xl group hover:border-primary/40 transition-colors"
                >
                  <motion.div
                    className="text-4xl flex-shrink-0"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: idx * 0.15,
                    }}
                  >
                    {feature.icon}
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 border border-primary/40 rounded-3xl p-12 text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Farming?
            </h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of farmers using AgroInsight to increase yields,
              reduce costs, and make smarter farming decisions.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-primary to-accent text-background font-bold text-lg shadow-lg shadow-primary/50 hover:shadow-primary/80 transition-all duration-300"
            >
              Start Your Free Trial
            </motion.button>
          </motion.div>
        </div>
      </main>

      {/* Gemini AI Quick Action Modal */}
      {activeAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveAction(null)}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative w-full max-w-2xl bg-background/80 border border-white/10 rounded-3xl shadow-2xl p-8 backdrop-blur-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
            
            <button
              onClick={() => setActiveAction(null)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-6 flex items-center gap-3">
              <span className="text-3xl text-foreground">✨</span> AI Assistant: {activeAction}
            </h3>

            <div className="min-h-[150px] max-h-[60vh] overflow-y-auto custom-scrollbar relative pr-2">
              {/* Specialized Form Inputs */}
              {!loadingAction && !actionResponse && (
                <div className="mb-6 space-y-4">
                  {activeAction === "Start Irrigation" && (
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Select Region</label>
                        <select 
                          value={formData.region}
                          onChange={(e) => setFormData({...formData, region: e.target.value})}
                          className="w-full bg-background/50 border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary outline-none"
                        >
                          <option>Maharashtra</option>
                          <option>Punjab</option>
                          <option>Uttar Pradesh</option>
                          <option>Madhya Pradesh</option>
                          <option>Karnataka</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">Crop Type</label>
                          <select 
                            value={formData.crop}
                            onChange={(e) => setFormData({...formData, crop: e.target.value})}
                            className="w-full bg-background/50 border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary outline-none"
                          >
                            <option>Wheat</option>
                            <option>Rice</option>
                            <option>Cotton</option>
                            <option>Sugarcane</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">Current Soil Moisture (%)</label>
                          <input 
                            type="number"
                            value={formData.moisture}
                            onChange={(e) => setFormData({...formData, moisture: e.target.value})}
                            className="w-full bg-background/50 border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeAction === "Schedule Spraying" && (
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Select Crop</label>
                        <select 
                          value={formData.crop}
                          onChange={(e) => setFormData({...formData, crop: e.target.value})}
                          className="w-full bg-background/50 border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary outline-none"
                        >
                          <option>Wheat</option>
                          <option>Rice</option>
                          <option>Cotton</option>
                          <option>Sugarcane</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Select Date</label>
                        <input 
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                          className="w-full bg-background/50 border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {activeAction === "Check Soil pH" && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Enter Soil pH Value</label>
                      <input 
                        type="number"
                        step="0.1"
                        placeholder="e.g. 6.5"
                        value={formData.ph}
                        onChange={(e) => setFormData({...formData, ph: e.target.value})}
                        className="w-full bg-background/50 border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                  )}

                  {activeAction === "Alert Settings" && (
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Irrigation Threshold (%)</label>
                        <input 
                          type="number"
                          value={formData.irrigationThreshold}
                          onChange={(e) => setFormData({...formData, irrigationThreshold: e.target.value})}
                          className="w-full bg-background/50 border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Temperature Threshold (°C)</label>
                        <input 
                          type="number"
                          value={formData.tempThreshold}
                          onChange={(e) => setFormData({...formData, tempThreshold: e.target.value})}
                          className="w-full bg-background/50 border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {activeAction === "View Weather" && (
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Select Region</label>
                        <select 
                          value={formData.region}
                          onChange={(e) => setFormData({...formData, region: e.target.value})}
                          className="w-full bg-background/50 border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary outline-none"
                        >
                          <option>Maharashtra</option>
                          <option>Punjab</option>
                          <option>Uttar Pradesh</option>
                          <option>Madhya Pradesh</option>
                          <option>Karnataka</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {activeAction === "Generate Report" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Select Region</label>
                        <select 
                          value={formData.region}
                          onChange={(e) => setFormData({...formData, region: e.target.value})}
                          className="w-full bg-background/50 border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary outline-none"
                        >
                          <option>Global</option>
                          <option>Maharashtra</option>
                          <option>Punjab</option>
                          <option>Uttar Pradesh</option>
                          <option>Madhya Pradesh</option>
                          <option>Karnataka</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Report Type</label>
                        <select 
                          value={formData.reportType}
                          onChange={(e) => setFormData({...formData, reportType: e.target.value})}
                          className="w-full bg-background/50 border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary outline-none"
                        >
                          <option>Weekly Summary</option>
                          <option>Monthly Yield Forecast</option>
                          <option>Soil Health Analysis</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Submission Button for forms */}
                  {["Start Irrigation", "Schedule Spraying", "Check Soil pH", "Alert Settings", "View Weather", "Generate Report"].includes(activeAction) && (
                    <button
                      onClick={() => submitAction(activeAction)}
                      className="mt-4 w-full py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all"
                    >
                      Submit
                    </button>
                  )}
                </div>
              )}

              {loadingAction ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full mb-4"
                  />
                  <p className="animate-pulse">Analyzing...</p>
                </div>
              ) : actionResponse ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/5 p-6 rounded-2xl border border-white/5"
                >
                  {weatherData && weatherData.coords && (
                    <WeatherMiniMap 
                      coords={weatherData.coords} 
                      temp={weatherData.temp} 
                      weatherRegion={weatherData.region} 
                    />
                  )}
                  <div className="prose prose-invert max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap mt-4">
                    {actionResponse}
                  </div>
                </motion.div>
              ) : null}
            </div>

            {!loadingAction && actionResponse && (
              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setActiveAction(null)}
                  className="px-5 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Reset to form view if applicable
                    setActionResponse(null);
                    setWeatherData(null);
                  }}
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors text-sm font-medium shadow-lg shadow-primary/20"
                >
                  Make Another Request
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
