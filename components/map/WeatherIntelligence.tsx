"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import axios from "axios";
import { 
  X, 
  MapPin, 
  Wind, 
  Droplets, 
  Thermometer, 
  Sun, 
  Compass, 
  CloudRain, 
  Activity, 
  Calendar, 
  TrendingUp, 
  Clock,
  Navigation,
  Layers,
  Zap,
  Info,
  AlertTriangle
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

// Dynamically import Leaflet map with SSR disabled to prevent window undefined errors in Next.js
const IndiaWeatherMap = dynamic(() => import("./IndiaWeatherMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/60 rounded-[2rem] border border-white/10 backdrop-blur-md">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
      <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase animate-pulse">Initializing Cyber-GPS Grid...</span>
    </div>
  ),
});

// Dynamic Weather Conditions Background Effects
function RainFX() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-slate-950/80">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,180,216,0.05),transparent)] animate-pulse" />
      {Array.from({ length: 40 }).map((_, i) => {
        const delay = Math.random() * 2;
        const duration = 0.5 + Math.random() * 0.5;
        const left = Math.random() * 100;
        const height = 15 + Math.random() * 15;
        return (
          <div
            key={i}
            className="absolute bg-gradient-to-b from-cyan-400/20 to-cyan-500/50 w-[1px] rounded-full animate-fall"
            style={{
              left: `${left}%`,
              top: `-50px`,
              height: `${height}px`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              animationIterationCount: "infinite",
              animationTimingFunction: "linear",
            }}
          />
        );
      })}
    </div>
  );
}

function SunnyFX() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-br from-[#0c0602] via-[#050b1a] to-[#020208]">
      <motion.div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.08)_0%,rgba(251,191,36,0.02)_60%,transparent_100%)] blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(253,224,71,0.02)_0%,transparent_50%)]" />
    </div>
  );
}

function CloudyFX() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-br from-[#0d1527] via-[#020208] to-[#0d1527]/85">
      <motion.div
        className="absolute top-1/4 -left-96 w-[550px] h-[250px] rounded-full bg-white/3 filter blur-[110px] pointer-events-none"
        animate={{ x: ["0vw", "120vw"] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-96 w-[650px] h-[300px] rounded-full bg-slate-400/3 filter blur-[130px] pointer-events-none"
        animate={{ x: ["0vw", "-120vw"] }}
        transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

function NightFX() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-br from-[#010103] via-[#020209] to-[#050516]">
      {Array.from({ length: 40 }).map((_, i) => {
        const delay = Math.random() * 4;
        const duration = 1.8 + Math.random() * 2;
        const left = Math.random() * 100;
        const top = Math.random() * 80;
        const size = 1 + Math.random() * 1.5;
        return (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-twinkle"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${size}px`,
              height: `${size}px`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              animationIterationCount: "infinite",
              opacity: 0.3,
            }}
          />
        );
      })}
      <div className="absolute -bottom-96 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-cyan-950/15 filter blur-[130px]" />
    </div>
  );
}

// Weather Animated Icons mapping
function SunnyIcon() {
  return (
    <svg className="w-16 h-16 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] animate-[spin_15s_linear_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="5" fill="currentColor" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414M16.95 16.95l1.414 1.414M7.05 7.05L5.636 5.636" />
    </svg>
  );
}

function CloudyIcon() {
  return (
    <svg className="w-16 h-16 text-slate-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15z" />
    </svg>
  );
}

function RainyIcon() {
  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-16 h-16 text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.2)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15z" />
      </svg>
      <div className="absolute left-5 top-12 flex gap-1.5">
        <span className="w-0.5 h-2.5 bg-cyan-400 rounded-full animate-bounce duration-500"></span>
        <span className="w-0.5 h-2.5 bg-cyan-400 rounded-full animate-bounce duration-700 delay-100"></span>
        <span className="w-0.5 h-2.5 bg-cyan-400 rounded-full animate-bounce duration-600 delay-200"></span>
      </div>
    </div>
  );
}

function ThunderstormIcon() {
  return (
    <div className="relative">
      <svg className="w-16 h-16 text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.2)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15z" />
      </svg>
      <svg className="absolute left-6 top-9 w-6 h-6 text-yellow-300 animate-pulse duration-300" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11 21h-1l1.5-6.5h-4.5l6.5-9h1l-1.5 6.5h4.5z" />
      </svg>
    </div>
  );
}

function FogIcon() {
  return (
    <div className="relative">
      <svg className="w-16 h-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15z" />
      </svg>
      <div className="absolute left-2.5 top-11 space-y-1.5 w-11 overflow-hidden">
        <div className="h-0.5 bg-slate-400/60 rounded-full w-8 animate-[slide_1.8s_infinite_linear]"></div>
        <div className="h-0.5 bg-slate-400/40 rounded-full w-10 translate-x-2 animate-[slide_2.2s_infinite_linear]"></div>
      </div>
    </div>
  );
}

function SnowyIcon() {
  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-16 h-16 text-blue-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15z" />
      </svg>
      <div className="absolute left-5 top-12 flex gap-2 text-white font-bold text-xs animate-[bounce_1.2s_infinite]">
        <span>*</span>
        <span>*</span>
        <span>*</span>
      </div>
    </div>
  );
}

interface WeatherIntelligenceProps {
  onClose: () => void;
}

export default function WeatherIntelligence({ onClose }: WeatherIntelligenceProps) {
  const [coords, setCoords] = useState({ lat: 28.6139, lng: 77.2090 }); // Default: New Delhi
  const [locationName, setLocationName] = useState({ city: "New Delhi", state: "Delhi" });
  const [activeTab, setActiveTab] = useState<"current" | "previous" | "forecast">("current");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Weather states
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [hourlyForecast, setHourlyForecast] = useState<any[]>([]);
  const [dailyForecast, setDailyForecast] = useState<any[]>([]);
  const [aqi, setAqi] = useState<number | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);

  // Cyber map overlays
  const [radarActive, setRadarActive] = useState(true);
  const [heatmapActive, setHeatmapActive] = useState(false);

  // Reverse geocoding using OSM Nominatim (Free, no key)
  const performGeocoding = async (lat: number, lng: number) => {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
        headers: { "Accept-Language": "en" }
      });
      const addr = res.data.address;
      const city = addr.city || addr.town || addr.village || addr.suburb || addr.state_district || "Unknown Region";
      const state = addr.state || addr.region || "India";
      setLocationName({ city, state });
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      setLocationName({ city: "Pinned Location", state: "India" });
    }
  };

  // Helper mapping Open-Meteo Weather Codes
  const getWeatherDetails = (code: number) => {
    if (code === 0) return { label: "Sunny & Clear", icon: "sunny", bg: "sunny" };
    if ([1, 2, 3].includes(code)) return { label: "Partly Cloudy", icon: "cloudy", bg: "cloudy" };
    if ([45, 48].includes(code)) return { label: "Foggy & Misty", icon: "fog", bg: "cloudy" };
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: "Rain Showers", icon: "rainy", bg: "rainy" };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: "Snowy Conditions", icon: "snowy", bg: "cloudy" };
    if ([95, 96, 99].includes(code)) return { label: "Thunderstorms", icon: "thunderstorm", bg: "rainy" };
    return { label: "Overcast Sky", icon: "cloudy", bg: "cloudy" };
  };

  // Format past dates YYYY-MM-DD
  const getHistoryDates = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 7);
    const end = new Date(today);
    end.setDate(today.getDate() - 1);
    const pad = (num: number) => String(num).padStart(2, "0");
    const format = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    return { start: format(start), end: format(end) };
  };

  // Auto location detection on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
          setCoords(userCoords);
        },
        (error) => {
          console.log("Geolocation permission blocked/failed. Defaulting to New Delhi coordinates.");
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchAllWeatherData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Query our server-side API proxy route (solves CORS and user-agent blocking)
        const res = await axios.get(`/api/weather?lat=${coords.lat}&lng=${coords.lng}`);
        const data = res.data;

        // Set Pinned Location Address Info
        if (data.location) {
          setLocationName(data.location);
        }

        // Parse Weather Data
        if (data.weather) {
          const weather = data.weather;
          const current = weather.current;
          
          setCurrentWeather({
            temp: Math.round(current.temperature_2m),
            feelsLike: Math.round(current.apparent_temperature),
            humidity: current.relative_humidity_2m,
            windSpeed: current.wind_speed_10m,
            pressure: current.pressure_msl,
            weatherCode: current.weather_code,
            isDay: current.is_day,
            sunrise: weather.daily.sunrise[0]?.split("T")[1] || "05:30",
            sunset: weather.daily.sunset[0]?.split("T")[1] || "18:45",
            uvIndex: weather.daily.uv_index_max[0] || 0
          });

          // Parse hourly forecast
          const now = new Date();
          const hourlyIndices = weather.hourly.time
            .map((t: string, idx: number) => ({ time: new Date(t), idx }))
            .filter((item: any) => item.time >= now)
            .slice(0, 24);

          const hourly = hourlyIndices.map((item: any) => ({
            time: item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            temp: Math.round(weather.hourly.temperature_2m[item.idx]),
            code: weather.hourly.weather_code[item.idx],
            humidity: weather.hourly.relative_humidity_2m[item.idx]
          }));
          setHourlyForecast(hourly);

          // Parse daily forecast (indices 7 to 13 correspond to today and the next 6 days)
          const dailyTimes = weather.daily.time.slice(7);
          const daily = dailyTimes.map((t: string, offsetIdx: number) => {
            const idx = offsetIdx + 7;
            const d = new Date(t);
            const dayName = d.toLocaleDateString([], { weekday: 'short' });
            const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
            return {
              day: dayName,
              date: dateStr,
              tempMax: Math.round(weather.daily.temperature_2m_max[idx]),
              tempMin: Math.round(weather.daily.temperature_2m_min[idx]),
              code: weather.daily.weather_code[idx]
            };
          });
          setDailyForecast(daily);
        }

        // Set AQI
        setAqi(data.aqi || 45);

        // Set History
        if (data.history) {
          setHistoryData(data.history);
        }
      } catch (err) {
        console.error("Error loading weather data from server proxy:", err);
        setError("Satellite communication sync failed. Please try pinning another region on the interactive map grid.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllWeatherData();
  }, [coords]);

  // Weather state helpers
  const weatherState = currentWeather ? getWeatherDetails(currentWeather.weatherCode) : { label: "Loading...", icon: "cloudy", bg: "cloudy" };
  const isNight = currentWeather ? !currentWeather.isDay : false;
  const activeBg = isNight ? "night" : weatherState.bg;

  const renderWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case "sunny": return <SunnyIcon />;
      case "cloudy": return <CloudyIcon />;
      case "rainy": return <RainyIcon />;
      case "thunderstorm": return <ThunderstormIcon />;
      case "fog": return <FogIcon />;
      case "snowy": return <SnowyIcon />;
      default: return <CloudyIcon />;
    }
  };

  const getAQIDetails = (aqiVal: number | null) => {
    if (aqiVal === null) return { text: "No Data", color: "text-muted-foreground", bg: "bg-white/5 border-white/5" };
    if (aqiVal <= 50) return { text: "Good", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };
    if (aqiVal <= 100) return { text: "Moderate", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" };
    if (aqiVal <= 150) return { text: "Unhealthy for Sensitive Groups", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" };
    return { text: "Hazardous / Poor", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" };
  };

  const aqiInfo = getAQIDetails(aqi);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-start p-4 md:p-6 overflow-hidden select-none font-sans"
    >
      {/* Inline styles for local CSS animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fall {
          to { transform: translateY(110vh); }
        }
        .animate-fall {
          animation-name: fall;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.25; transform: scale(0.85); }
          50% { opacity: 0.9; transform: scale(1.15); }
        }
        .animate-twinkle {
          animation-name: twinkle;
          animation-timing-function: ease-in-out;
        }
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .custom-popup-cyber .leaflet-popup-content-wrapper {
          background: rgba(10, 10, 20, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          border-radius: 0.75rem;
          backdrop-filter: blur(10px);
        }
        .custom-popup-cyber .leaflet-popup-tip {
          background: rgba(10, 10, 20, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}} />

      {/* Dynamic Background FX Layer */}
      {activeBg === "rainy" && <RainFX />}
      {activeBg === "sunny" && <SunnyFX />}
      {activeBg === "cloudy" && <CloudyFX />}
      {activeBg === "night" && <NightFX />}

      {/* Main Glassmorphic Wrapper */}
      <div className="relative w-full h-full max-w-7xl bg-[#030308]/60 border border-white/10 rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] backdrop-blur-3xl overflow-hidden flex flex-col z-10">
        
        {/* Header Section */}
        <header className="px-6 md:px-8 py-5 border-b border-white/5 flex items-center justify-between relative z-10 bg-black/25">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(0,208,132,0.2)]">
              <Compass className="w-5 h-5 text-primary animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Weather Intelligence System
              </h1>
              <p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase leading-none mt-1">
                RADAR_SCANNER // INTERACTIVE_MAP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Radar Sweep Toggle */}
            <button
              onClick={() => setRadarActive(!radarActive)}
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-mono tracking-wider transition-all select-none cursor-pointer ${
                radarActive
                  ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_10px_rgba(0,208,132,0.2)]"
                  : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${radarActive ? "animate-pulse text-primary" : ""}`} />
              RADAR_SWEEP: {radarActive ? "ON" : "OFF"}
            </button>

            {/* Heatmap Toggle */}
            <button
              onClick={() => setHeatmapActive(!heatmapActive)}
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-mono tracking-wider transition-all select-none cursor-pointer ${
                heatmapActive
                  ? "bg-red-500/10 border-red-500/40 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                  : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              HEATMAP: {heatmapActive ? "ON" : "OFF"}
            </button>

            {/* Exit Overlay Button */}
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.15)" }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/5 hover:bg-destructive/10 text-white cursor-pointer border border-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </header>

        {/* Content Body Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 overflow-hidden">
          
          {/* Map Side (Left 3/5 area) */}
          <div className="lg:col-span-3 p-4 md:p-6 flex flex-col justify-between h-[45vh] lg:h-full relative border-b lg:border-b-0 lg:border-r border-white/5">
            <div className="flex-1 min-h-0 relative">
              <IndiaWeatherMap
                coords={coords}
                onMapClick={(lat, lng) => setCoords({ lat, lng })}
                radarActive={radarActive}
                heatmapActive={heatmapActive}
                onCityClick={(cityCoords) => setCoords(cityCoords)}
              />
            </div>
            
            {/* Map Guidance HUD Footer */}
            <div className="mt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-2 text-[10px] text-muted-foreground font-mono">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary" />
                <span>Double click/drag to zoom. Tap anywhere on the map to query grid coordinates.</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444]" /> &gt;35°C</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10b981]" /> &lt;30°C</span>
              </div>
            </div>
          </div>

          {/* Weather Panel Side (Right 2/5 area) */}
          <div className="lg:col-span-2 flex flex-col overflow-hidden bg-black/15">
            {/* Tabs Selector Header */}
            <div className="flex border-b border-white/5 bg-black/10 p-2 gap-1.5 relative z-10">
              {[
                { id: "current", label: "Current", icon: Sun },
                { id: "previous", label: "History", icon: Calendar },
                { id: "forecast", label: "Forecast", icon: Clock }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all select-none cursor-pointer border ${
                      isActive 
                        ? "bg-white/10 border-white/10 text-white shadow-lg" 
                        : "bg-transparent border-transparent text-muted-foreground hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Weather Analytics Inner Content Panel */}
            <div className="flex-1 overflow-y-auto p-6 relative z-10 custom-scrollbar">
              <AnimatePresence mode="wait">
                {loading ? (
                  /* Cyber loading overlay */
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center py-16"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <Navigation className="w-6 h-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <p className="text-primary font-mono text-xs tracking-widest mt-6 animate-pulse uppercase">
                      QUERYING_ATMOSPHERE_GRID...
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-1">
                      LAT: {coords.lat.toFixed(4)} / LNG: {coords.lng.toFixed(4)}
                    </p>
                  </motion.div>
                ) : (
                  /* Tabs Content Wrapper */
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    {/* Active Location Display */}
                    <div className="flex items-start justify-between border-b border-white/5 pb-4">
                      <div>
                        <div className="flex items-center gap-2 text-white">
                          <MapPin className="w-4 h-4 text-primary" />
                          <h2 className="text-xl font-bold">{locationName.city}</h2>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{locationName.state}, India</p>
                      </div>
                      <div className="text-right font-mono text-[9px] text-muted-foreground uppercase leading-tight bg-white/5 border border-white/5 rounded px-2 py-1">
                        GPS_POS:<br />
                        {coords.lat.toFixed(3)}N / {coords.lng.toFixed(3)}E
                      </div>
                    </div>

                    {error ? (
                      <div className="p-8 bg-rose-500/5 border border-rose-500/10 rounded-[2rem] text-center space-y-4 flex flex-col items-center justify-center min-h-[300px]">
                        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 animate-pulse">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-rose-400 font-mono tracking-wider uppercase">SATELLITE_LINK_OFFLINE</h4>
                        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">{error}</p>
                      </div>
                    ) : (
                      <>
                        {/* TAB 1: Current Weather Display */}
                    {activeTab === "current" && currentWeather && (
                      <div className="space-y-6">
                        {/* Core Temperature Info Box */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] relative overflow-hidden group">
                          {/* Radial ambient glow tag */}
                          <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-primary/10 blur-xl pointer-events-none group-hover:bg-primary/25 transition-colors" />

                          <div className="space-y-2 relative z-10">
                            <span className="text-[10px] font-mono tracking-widest text-primary uppercase">[CURRENT_TEMP]</span>
                            <div className="flex items-start">
                              <span className="text-5xl md:text-6xl font-black text-white leading-none">{currentWeather.temp}</span>
                              <span className="text-xl font-bold text-primary ml-1 mt-0.5">°C</span>
                            </div>
                            <p className="text-sm font-medium text-slate-200">{weatherState.label}</p>
                            <p className="text-xs text-muted-foreground leading-none">Feels like {currentWeather.feelsLike}°C</p>
                          </div>

                          <div className="relative z-10">
                            {renderWeatherIcon(weatherState.icon)}
                          </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: "Humidity", value: `${currentWeather.humidity}%`, icon: Droplets, color: "text-blue-400" },
                            { label: "Wind Speed", value: `${currentWeather.windSpeed} km/h`, icon: Wind, color: "text-teal-400" },
                            { label: "UV Index", value: `${currentWeather.uvIndex} / 10`, icon: Thermometer, color: "text-amber-400" },
                            { label: "Barometer", value: `${currentWeather.pressure.toFixed(0)} hPa`, icon: Activity, color: "text-purple-400" }
                          ].map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                              <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl bg-white/5 border border-white/5 ${stat.color}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                  <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">{stat.label}</p>
                                  <p className="text-sm font-bold text-white mt-0.5">{stat.value}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Sunlight Times Info Panel */}
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 grid grid-cols-2 gap-4">
                          <div className="text-left">
                            <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">Sunrise</p>
                            <p className="text-base font-bold text-amber-300 mt-1 flex items-center gap-2">
                              <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
                              {currentWeather.sunrise}
                            </p>
                          </div>
                          <div className="text-left border-l border-white/10 pl-4">
                            <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">Sunset</p>
                            <p className="text-base font-bold text-slate-300 mt-1 flex items-center gap-2">
                              <Compass className="w-4 h-4 text-teal-400" />
                              {currentWeather.sunset}
                            </p>
                          </div>
                        </div>

                        {/* Air Quality Index (AQI) display */}
                        <div className={`border rounded-2xl p-4 flex items-center justify-between transition-colors duration-300 ${aqiInfo.bg}`}>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">Air Quality Index (AQI)</p>
                            <p className={`text-base font-bold mt-1 ${aqiInfo.color}`}>{aqiInfo.text}</p>
                          </div>
                          <div className="text-center bg-black/40 border border-white/10 rounded-full w-12 h-12 flex items-center justify-center font-mono font-bold text-white shadow-inner">
                            {aqi || "--"}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: Historical Weather Conditions Charts */}
                    {activeTab === "previous" && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 px-1">
                          <TrendingUp className="w-4.5 h-4.5 text-primary" />
                          <h3 className="text-sm font-bold text-white">7-Day Atmospheric History</h3>
                        </div>

                        {/* Temperature chart */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                          <p className="text-[10px] font-mono tracking-widest text-primary uppercase mb-4 px-2">[TEMPERATURE_TREND_C]</p>
                          <div className="h-48 w-full text-xs">
                            {historyData.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={historyData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                                  <defs>
                                    <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.01}/>
                                    </linearGradient>
                                    <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                                  <Tooltip 
                                    contentStyle={{ background: "rgba(10,10,20,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem" }} 
                                    labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                                  />
                                  <Area type="monotone" dataKey="tempMax" name="Max Temp" stroke="#ef4444" strokeWidth={1.5} fillOpacity={1} fill="url(#colorMax)" />
                                  <Area type="monotone" dataKey="tempMin" name="Min Temp" stroke="#3b82f6" strokeWidth={1.5} fillOpacity={1} fill="url(#colorMin)" />
                                </AreaChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="h-full flex items-center justify-center text-muted-foreground">Gathering historical sensors...</div>
                            )}
                          </div>
                        </div>

                        {/* Rainfall Chart */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                          <p className="text-[10px] font-mono tracking-widest text-accent uppercase mb-4 px-2">[PRECIPITATION_SUM_MM]</p>
                          <div className="h-44 w-full text-xs">
                            {historyData.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={historyData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                                  <Tooltip
                                    contentStyle={{ background: "rgba(10,10,20,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem" }}
                                    labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                                  />
                                  <Bar dataKey="rain" name="Rainfall" fill="#00b4d8" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="h-full flex items-center justify-center text-muted-foreground font-mono">Gathering pluviometric data...</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: Upcoming Forecast (Hourly & Daily) */}
                    {activeTab === "forecast" && (
                      <div className="space-y-6">
                        {/* 24-Hour Forecast (Horizontal Scroll) */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 px-1">
                            <Clock className="w-4.5 h-4.5 text-primary" />
                            <h3 className="text-sm font-bold text-white">24-Hour Chrono-Forecast</h3>
                          </div>
                          
                          <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {hourlyForecast.map((hour, i) => {
                              const iconName = getWeatherDetails(hour.code).icon;
                              return (
                                <div key={i} className="flex-shrink-0 bg-white/5 border border-white/5 rounded-2xl p-3 w-20 flex flex-col items-center justify-center text-center shadow-md">
                                  <span className="text-[10px] text-muted-foreground font-mono font-bold leading-none">{hour.time}</span>
                                  <div className="scale-65 my-1.5 flex items-center justify-center w-10 h-10">
                                    {renderWeatherIcon(iconName)}
                                  </div>
                                  <span className="text-sm font-black text-white leading-none">{hour.temp}°</span>
                                  <span className="text-[8px] text-cyan-400 font-mono font-bold mt-1">💧{hour.humidity}%</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 7-Day Forecast (Vertical List) */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 px-1">
                            <Calendar className="w-4.5 h-4.5 text-primary" />
                            <h3 className="text-sm font-bold text-white">7-Day Macro-Forecast</h3>
                          </div>

                          <div className="space-y-2.5">
                            {dailyForecast.map((day, i) => {
                              const details = getWeatherDetails(day.code);
                              return (
                                <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                                  <div className="w-16 flex flex-col text-left">
                                    <span className="text-sm font-bold text-white leading-none">{day.day}</span>
                                    <span className="text-[9px] text-muted-foreground font-mono mt-0.5">{day.date}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-3 w-24">
                                    <div className="scale-50 w-8 h-8 flex items-center justify-center">
                                      {renderWeatherIcon(details.icon)}
                                    </div>
                                    <span className="text-xs text-slate-200 truncate">{details.label}</span>
                                  </div>

                                  <div className="font-mono text-xs text-right w-16">
                                    <span className="text-white font-bold">{day.tempMax}°</span>
                                    <span className="text-muted-foreground mx-1">/</span>
                                    <span className="text-muted-foreground">{day.tempMin}°</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
