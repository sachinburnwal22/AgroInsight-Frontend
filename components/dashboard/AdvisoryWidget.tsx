"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "@/lib/utils";
import { 
  ShieldAlert, 
  Sprout, 
  ShoppingBag, 
  Thermometer, 
  CloudRain, 
  Wind, 
  ArrowRight,
  ShieldCheck,
  MapPin
} from "lucide-react";
import Link from "next/link";

export default function AdvisoryWidget() {
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [alert, setAlert] = useState<any>(null);
  const [crops, setCrops] = useState<any[]>([]);

  useEffect(() => {
    // 1. Check coordinates and fetch info
    if (typeof window !== "undefined") {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ lat, lng });
          fetchWidgetData(lat, lng);
        },
        (err) => {
          // Fallback to Pune coordinates
          setCoords({ lat: 18.5204, lng: 73.8567 });
          fetchWidgetData(18.5204, 73.8567);
        }
      );
    }
  }, []);

  const fetchWidgetData = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      // Fetch live weather
      const wRes = await axios.get(`${API_BASE_URL}/api/weather/live`, {
        params: { latitude: lat, longitude: lng }
      });
      if (wRes.data.status === "success" || wRes.data.status === "mock_success") {
        setWeather(wRes.data);
      }

      // Fetch live alerts
      const aRes = await axios.get(`${API_BASE_URL}/api/weather/alerts`, {
        params: {
          latitude: lat,
          longitude: lng,
          temp: wRes.data.temp || 28.0,
          wind_speed: wRes.data.wind_speed || 12.0,
          humidity: wRes.data.humidity || 60,
          rain_chance: wRes.data.rain_chance || 10
        }
      });
      if (aRes.data.status === "success") {
        setAlert(aRes.data.alert_active ? aRes.data : null);
      }

      // Fetch crop suggestions
      const cRes = await axios.get(`${API_BASE_URL}/api/crop/recommendations`, {
        params: {
          latitude: lat,
          longitude: lng,
          soil_type: "Loamy",
          temp: wRes.data.temp || 28.0,
          rainfall: wRes.data.rain_chance > 60 ? 1100 : 750
        }
      });
      if (cRes.data.status === "success") {
        setCrops(cRes.data.data.slice(0, 2)); // take top 2
      }
    } catch (err) {
      console.warn("Failed to load widget advisory data", err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskMeterProps = () => {
    if (!alert) {
      return { label: "SAFE / LOW RISK", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", pct: 15 };
    }
    if (alert.severity === "severe") {
      return { label: "DANGER / SEVERE RISK", color: "text-rose-400", bg: "bg-rose-500/15 border-rose-500/25", pct: 90 };
    }
    return { label: "MONITOR / MODERATE RISK", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", pct: 55 };
  };

  const meter = getRiskMeterProps();

  if (loading) {
    return (
      <div className="p-6 bg-card/60 border border-white/5 rounded-3xl backdrop-blur-xl h-56 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">
          Loading AI Command Center...
        </span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#060613]/90 to-[#0e0e24]/90 border border-white/5 rounded-3xl p-6 backdrop-blur-2xl shadow-2xl text-left flex flex-col space-y-5">
      {/* Top tech lines */}
      <div className="absolute top-0 left-0 w-28 h-[1px] bg-gradient-to-r from-primary to-transparent" />
      <div className="absolute top-0 left-0 w-[1px] h-28 bg-gradient-to-b from-primary to-transparent" />

      {/* Widget Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-primary" />
          <h4 className="font-mono text-xs font-black uppercase text-white tracking-widest">
            Advisory Command Center
          </h4>
        </div>
        <Link href="/crop-recommendation">
          <button className="p-1 px-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 rounded-lg text-[9px] font-mono font-bold text-primary uppercase transition-all select-none cursor-pointer flex items-center gap-0.5">
            <span>Advisor Panel</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Risk meter dial */}
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">Disaster Risk Monitor</span>
            <div className={`p-3 border rounded-xl flex items-center justify-between backdrop-blur-sm ${meter.bg}`}>
              <div className="flex items-center gap-2">
                {alert ? <ShieldAlert className={`w-4 h-4 ${meter.color} animate-pulse`} /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                <span className={`text-[10px] font-mono font-black ${meter.color}`}>{meter.label}</span>
              </div>
              <span className="text-[9px] font-mono text-slate-400">{weather?.temp?.toFixed(1)}°C // GPS</span>
            </div>
          </div>

          {/* Visual Indicator Slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase">
              <span>Safe</span>
              <span>Monitor</span>
              <span>Danger</span>
            </div>
            <div className="h-2 w-full bg-black/45 rounded-full overflow-hidden border border-white/5 relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${meter.pct}%` }}
                className={`h-full rounded-full ${
                  meter.pct > 70 
                    ? "bg-rose-500 shadow-[0_0_10px_#ef4444]" 
                    : meter.pct > 40 
                      ? "bg-amber-500 shadow-[0_0_10px_#f59e0b]" 
                      : "bg-emerald-500 shadow-[0_0_10px_#10b981]"
                }`}
              />
            </div>
          </div>

          {/* Short alert advice if any active */}
          {alert && (
            <p className="text-[10px] text-rose-300 bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/10 leading-normal">
              {alert.message}
            </p>
          )}
        </div>

        {/* Crops checklist overview */}
        <div className="space-y-3 text-left">
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">Optimal Crop Fit</span>
          
          <div className="space-y-2.5">
            {crops.length === 0 ? (
              <p className="text-[10px] text-slate-500 font-mono">[No cached recommendations]</p>
            ) : (
              crops.map((crop) => (
                <div key={crop.crop_name} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{crop.emoji}</span>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-white">{crop.crop_name}</span>
                      <span className="text-[8px] text-slate-500 font-mono">Season: {crop.season}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-primary font-mono">{crop.suitability_percentage}%</span>
                    <span className="text-[7px] text-slate-500 uppercase tracking-widest block font-mono">Match</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
