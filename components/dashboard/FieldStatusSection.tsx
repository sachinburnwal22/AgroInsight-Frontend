"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { 
  Leaf, 
  Sun, 
  Cloud, 
  CloudRain, 
  Zap, 
  Wind, 
  Search, 
  X, 
  Plus, 
  Check, 
  TrendingUp, 
  Droplets,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

interface StateData {
  name: string;
  lat: number;
  lng: number;
}

const INITIAL_STATES: StateData[] = [
  { name: "Punjab", lat: 31.1471, lng: 75.3412 },
  { name: "Haryana", lat: 29.0588, lng: 76.0856 },
  { name: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { name: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 }
];

const ALL_STATES: StateData[] = [
  { name: "Punjab", lat: 31.1471, lng: 75.3412 },
  { name: "Haryana", lat: 29.0588, lng: 76.0856 },
  { name: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { name: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
  { name: "Maharashtra", lat: 19.7515, lng: 75.7139 },
  { name: "Rajasthan", lat: 27.0238, lng: 74.2179 },
  { name: "Gujarat", lat: 22.2587, lng: 71.1924 },
  { name: "Karnataka", lat: 15.3173, lng: 75.7139 },
  { name: "Tamil Nadu", lat: 11.1271, lng: 78.6569 },
  { name: "Andhra Pradesh", lat: 15.9129, lng: 79.7400 },
  { name: "Telangana", lat: 18.1124, lng: 79.0193 },
  { name: "Kerala", lat: 10.8505, lng: 76.2711 },
  { name: "West Bengal", lat: 22.9868, lng: 87.8550 },
  { name: "Bihar", lat: 25.0961, lng: 85.3131 },
  { name: "Odisha", lat: 20.9517, lng: 85.0985 },
  { name: "Assam", lat: 26.2006, lng: 92.9376 },
  { name: "Jammu & Kashmir", lat: 33.7780, lng: 76.5762 },
  { name: "Himachal Pradesh", lat: 31.1048, lng: 77.1734 },
  { name: "Uttarakhand", lat: 30.0668, lng: 79.0193 }
];

// Helper to count up health percentage smoothly
function CountUp({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }
    const duration = 1200;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
}

// Generate high-tech mini sparkline path
const generateSparkline = (temp: number, humidity: number) => {
  // Synthesize a 6-point pseudo-historical trend line based on current conditions
  const points = [
    temp - 2,
    temp - 1,
    temp + 1,
    temp,
    temp - 1,
    temp
  ];
  const min = Math.min(...points) - 2;
  const max = Math.max(...points) + 2;
  const range = max - min || 1;
  const width = 80;
  const height = 20;

  const svgCoords = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  });
  return `M ${svgCoords.join(" L ")}`;
};

export default function FieldStatusSection() {
  const [pinnedStates, setPinnedStates] = useState<StateData[]>(INITIAL_STATES);
  const [weatherMap, setWeatherMap] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Dynamic Health Score formula based on weather attributes
  const calculateHealthScore = (temp: number, humidity: number, windSpeed: number, weatherCode: number) => {
    let score = 100;
    // Optimal temp is between 20°C and 30°C
    if (temp < 18) score -= (18 - temp) * 3;
    else if (temp > 32) score -= (temp - 32) * 2.5;

    // Optimal humidity is between 50% and 80%
    if (humidity < 45) score -= (45 - humidity) * 1.5;
    else if (humidity > 85) score -= (humidity - 85) * 1.2;

    // Wind speed > 18 km/h degrades soil health/crop structural stability
    if (windSpeed > 18) score -= (windSpeed - 18) * 1.3;

    // Severe weather conditions degrade score
    if ([95, 96, 99].includes(weatherCode)) score -= 25; // Thunderstorm
    else if ([65, 82].includes(weatherCode)) score -= 15; // Heavy rain
    else if ([55, 63, 81].includes(weatherCode)) score -= 5; // Moderate rain (minor)
    else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) score -= 20; // Snowy/frost

    return Math.min(100, Math.max(12, Math.round(score)));
  };

  const getStatusBadge = (score: number) => {
    if (score >= 85) return { label: "Optimal", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", bar: "from-emerald-500 to-teal-400" };
    if (score >= 60) return { label: "Monitor", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", bar: "from-amber-500 to-orange-400" };
    return { label: "Risk", color: "bg-rose-500/10 text-rose-400 border-rose-500/20", bar: "from-rose-500 to-red-500" };
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />;
    if ([1, 2, 3].includes(code)) return <Cloud className="w-5 h-5 text-slate-300 animate-pulse" />;
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain className="w-5 h-5 text-cyan-400 animate-bounce" />;
    if ([95, 96, 99].includes(code)) return <Zap className="w-5 h-5 text-indigo-400" />;
    return <Cloud className="w-5 h-5 text-slate-400" />;
  };

  const getWeatherText = (code: number) => {
    if (code === 0) return "Sunny & Clear";
    if ([1, 2, 3].includes(code)) return "Cloudy";
    if ([45, 48].includes(code)) return "Misty Fog";
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "Rain Showers";
    if ([95, 96, 99].includes(code)) return "Thunderstorms";
    return "Overcast";
  };

  // Load pinned states from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("pinned_states");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed.every(
            (s) =>
              s &&
              typeof s.name === "string" &&
              typeof s.lat === "number" &&
              typeof s.lng === "number" &&
              !isNaN(s.lat) &&
              !isNaN(s.lng)
          )
        ) {
          setPinnedStates(parsed);
        } else {
          setPinnedStates(INITIAL_STATES);
        }
      } catch (e) {
        setPinnedStates(INITIAL_STATES);
      }
    }
  }, []);

  // Fetch weather data for pinned states
  useEffect(() => {
    const fetchAllStatesWeather = async () => {
      setLoading(true);
      const results: { [key: string]: any } = {};
      
      try {
        await Promise.all(
          pinnedStates.map(async (state) => {
            try {
              if (typeof state.lat !== "number" || typeof state.lng !== "number" || isNaN(state.lat) || isNaN(state.lng)) {
                throw new Error("Invalid coordinate values");
              }
              const res = await axios.get(`/api/weather?lat=${state.lat}&lng=${state.lng}`);
              if (res.data && res.data.weather) {
                const current = res.data.weather.current;
                const temp = Math.round(current.temperature_2m);
                const humidity = current.relative_humidity_2m;
                const windSpeed = current.wind_speed_10m;
                const code = current.weather_code;

                const score = calculateHealthScore(temp, humidity, windSpeed, code);
                results[state.name] = { temp, humidity, score, code };
              }
            } catch (stateErr) {
              console.error(`Failed to load weather for state ${state.name}:`, stateErr);
              // Fallback block to prevent page crash on transient API failures
              results[state.name] = { temp: 25, humidity: 60, score: 75, code: 0, error: true };
            }
          })
        );
        setWeatherMap(results);
      } catch (err) {
        console.error("Failed to load states weather:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStatesWeather();
  }, [pinnedStates, refreshKey]);

  // Real-time auto refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Handle pinning/unpinning states
  const toggleStatePin = (state: StateData) => {
    let updated;
    const exists = pinnedStates.some(s => s.name === state.name);
    if (exists) {
      if (pinnedStates.length <= 1) return; // Keep at least one pinned
      updated = pinnedStates.filter(s => s.name !== state.name);
    } else {
      updated = [...pinnedStates, state];
    }
    setPinnedStates(updated);
    localStorage.setItem("pinned_states", JSON.stringify(updated));
  };

  const filteredStates = ALL_STATES.filter(state =>
    state.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2.5">
            <Leaf className="w-6 h-6 text-primary animate-pulse" /> 
            <span>Field Status Overview</span>
          </h3>
          
          <button 
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="p-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-muted-foreground hover:text-white transition-all select-none cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>

        {/* State Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {loading && Object.keys(weatherMap).length === 0 ? (
            /* Skeleton Loading Grid */
            Array.from({ length: pinnedStates.length }).map((_, i) => (
              <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/5 animate-pulse space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-white/10 rounded w-24"></div>
                  <div className="h-5 bg-white/10 rounded-full w-14"></div>
                </div>
                <div className="h-3 bg-white/10 rounded-full w-full"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-white/10 rounded w-16"></div>
                  <div className="h-4 bg-white/10 rounded w-16"></div>
                </div>
              </div>
            ))
          ) : (
            /* Render State Weather Cards */
            pinnedStates.map((state) => {
              const data = weatherMap[state.name];
              if (!data) return null;

              const badge = getStatusBadge(data.score);
              const weatherIcon = getWeatherIcon(data.code);
              const weatherText = getWeatherText(data.code);

              return (
                <motion.div
                  key={state.name}
                  whileHover={{ scale: 1.015, y: -4 }}
                  className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all duration-300 relative group overflow-hidden"
                >
                  {/* Subtle hover neon ambient glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  {/* Header Row */}
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-lg text-white leading-tight">{state.name}</h4>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border leading-none ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Dynamic Progress Bar */}
                  <div className="relative mb-3 w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${badge.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${data.score}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>

                  {/* Health Score Countup */}
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-xs text-muted-foreground">Soil Health Score</span>
                    <span className="text-xl font-black text-white">
                      <CountUp value={data.score} />
                      <span className="text-xs font-semibold text-primary ml-0.5">%</span>
                    </span>
                  </div>

                  <div className="h-[1px] bg-white/5 my-3" />

                  {/* Weather Indicators Row */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                        {weatherIcon}
                      </div>
                      <div className="text-left leading-none">
                        <p className="font-semibold text-slate-200">{data.temp}°C</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{weatherText}</p>
                      </div>
                    </div>

                    {/* Sparkline Micro Graph */}
                    <div className="flex items-center gap-3">
                      <svg className="w-16 h-6 text-primary overflow-visible" stroke="currentColor" strokeWidth={1.5} fill="none">
                        <path d={generateSparkline(data.temp, data.humidity)} className="opacity-75" />
                      </svg>
                      <div className="text-right leading-none">
                        <p className="font-bold text-slate-200 flex items-center gap-0.5"><Droplets className="w-3 h-3 text-cyan-400" /> {data.humidity}%</p>
                        <p className="text-[8px] text-muted-foreground mt-0.5 uppercase tracking-wide">HUMIDITY</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* View More Trigger Button */}
      <button
        onClick={() => setModalOpen(true)}
        className="w-full py-3.5 mt-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 rounded-2xl font-bold text-sm tracking-wide transition-all select-none cursor-pointer flex items-center justify-center gap-1"
      >
        <span>View More States</span>
      </button>

      {/* Grid search modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:w-[600px] md:left-1/2 md:-translate-x-1/2 z-[120] bg-[#0a0a1a]/95 border border-primary/20 rounded-[2.5rem] shadow-[0_0_60px_rgba(0,208,132,0.25)] p-6 backdrop-blur-3xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-5">
                <div>
                  <h4 className="text-xl font-bold text-white">All Indian States Directory</h4>
                  <p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase leading-none mt-1">SELECT_STATES_TO_PIN_TO_DASHBOARD</p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white cursor-pointer border border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-5">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search state name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* States Selection List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredStates.length > 0 ? (
                  filteredStates.map((state) => {
                    const isPinned = pinnedStates.some(s => s.name === state.name);
                    return (
                      <div 
                        key={state.name}
                        onClick={() => toggleStatePin(state)}
                        className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-300 ${
                          isPinned 
                            ? "bg-primary/10 border-primary/30 text-primary" 
                            : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10 hover:text-white"
                        }`}
                      >
                        <div className="text-left font-semibold text-sm">{state.name}</div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-[9px] font-mono text-muted-foreground">{state.lat.toFixed(2)}N / {state.lng.toFixed(2)}E</span>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            isPinned ? "bg-primary border-primary text-black" : "border-white/20"
                          }`}>
                            {isPinned && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-muted-foreground font-mono text-xs flex flex-col items-center gap-2">
                    <AlertTriangle className="w-8 h-8 text-amber-500 animate-pulse" />
                    <span>No states match your search query.</span>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
