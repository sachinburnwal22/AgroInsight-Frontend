"use client";

import React from "react";
import { motion } from "framer-motion";
import { Leaf, Droplet, Sprout, Map as MapIcon, X, AlertCircle } from "lucide-react";

interface InfoPanelProps {
  loading: boolean;
  regionData: any;
  selectedState: string | null;
  onClose: () => void;
}

export default function InfoPanel({
  loading,
  regionData,
  selectedState,
  onClose,
}: InfoPanelProps) {
  if (!selectedState) {
    return (
      <div className="bg-background/40 border border-white/5 rounded-3xl p-8 backdrop-blur-2xl h-full flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <MapIcon className="w-20 h-20 text-muted-foreground/20 mb-6 drop-shadow-2xl" />
        </motion.div>
        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-3">
          Select a State
        </h3>
        <p className="text-muted-foreground text-sm">
          Click on any state on the map to view detailed agricultural insights.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-background/40 border border-white/5 rounded-3xl p-8 backdrop-blur-2xl h-full flex flex-col items-center justify-center shadow-2xl">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full mb-6"
        />
        <p className="text-muted-foreground/80 font-medium tracking-wide">Fetching regional data...</p>
      </div>
    );
  }

  if (!regionData) {
    return (
      <div className="bg-background/40 border border-white/5 rounded-3xl p-8 backdrop-blur-2xl h-full relative shadow-2xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-orange-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex flex-col items-center justify-center text-center h-full relative z-10">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <AlertCircle className="w-16 h-16 text-destructive/60 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]" />
          </motion.div>
          <h3 className="text-2xl font-bold text-foreground mb-3 tracking-wide">
            No Data Found
          </h3>
          <p className="text-muted-foreground/80 text-sm max-w-[80%] leading-relaxed">
            We currently do not have agricultural metrics for <span className="text-foreground font-semibold">{selectedState}</span>.
          </p>
        </div>
      </div>
    );
  }

  const {
    name,
    health_score,
    rainfall_range,
    climate,
    land_holding,
    irrigations,
    cropping_patterns,
  } = regionData;

  const avgLandSize = land_holding ? land_holding.avg_land_size : 0;
  const avgIrrigation =
    irrigations && irrigations.length > 0
      ? irrigations.reduce(
          (acc: number, curr: any) => acc + curr.coverage_percentage,
          0
        ) / irrigations.length
      : 0;

  const topCrop =
    cropping_patterns && cropping_patterns.length > 0
      ? cropping_patterns.reduce((prev: any, current: any) =>
          prev.area_percentage > current.area_percentage ? prev : current
        )
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-background/40 border border-white/5 rounded-3xl p-7 backdrop-blur-2xl h-full relative overflow-y-auto custom-scrollbar shadow-2xl"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all z-10"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="mb-8 pr-10">
        <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2 drop-shadow-sm">
          {name}
        </h2>
        <p className="text-sm font-medium text-muted-foreground/80 flex items-center gap-2">
          {climate} <span className="text-white/20">•</span> {rainfall_range} Rain
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/5 hover:bg-white/10 transition-colors duration-300 rounded-2xl p-5 border border-white/5 shadow-lg group">
          <div className="flex items-center gap-2 text-muted-foreground/80 text-xs font-bold uppercase tracking-wider mb-3">
            <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <MapIcon className="w-3.5 h-3.5" />
            </div>
            Avg Land
          </div>
          <p className="text-3xl font-black text-foreground drop-shadow-sm">
            {avgLandSize.toFixed(1)}
            <span className="text-sm font-semibold text-muted-foreground/60 ml-1">ha</span>
          </p>
        </div>

        <div className="bg-white/5 hover:bg-white/10 transition-colors duration-300 rounded-2xl p-5 border border-white/5 shadow-lg group">
          <div className="flex items-center gap-2 text-muted-foreground/80 text-xs font-bold uppercase tracking-wider mb-3">
            <div className="p-1.5 rounded-md bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
              <Droplet className="w-3.5 h-3.5" />
            </div>
            Irrigation
          </div>
          <p className="text-3xl font-black text-foreground drop-shadow-sm">
            {avgIrrigation.toFixed(0)}<span className="text-xl text-cyan-400 ml-0.5">%</span>
          </p>
        </div>
      </div>

      {topCrop && (
        <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/5 border border-emerald-500/20 rounded-2xl p-6 mb-8 relative overflow-hidden group shadow-[0_10px_30px_-15px_rgba(16,185,129,0.3)]">
          <motion.div
            className="absolute -right-4 -top-4 opacity-20 transition-transform duration-700 ease-out group-hover:scale-125 group-hover:rotate-12 group-hover:opacity-30"
            style={{ fontSize: "110px", filter: "blur(2px)" }}
          >
            {topCrop.crop?.emoji || "🌾"}
          </motion.div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] mb-2 drop-shadow-sm">
              Dominant Crop
            </p>
            <h3 className="text-3xl font-black text-foreground mb-1 flex items-center gap-3 drop-shadow-md">
              <span className="text-4xl drop-shadow-lg bg-white/10 p-2 rounded-xl border border-white/5">{topCrop.crop?.emoji || "🌱"}</span>
              {topCrop.crop?.name}
            </h3>
            <p className="text-sm font-medium text-emerald-100/70 mt-3 bg-emerald-500/10 inline-block px-3 py-1 rounded-full border border-emerald-500/20">
              Covers {topCrop.area_percentage}% of total agricultural area
            </p>
          </div>
        </div>
      )}

      {cropping_patterns && cropping_patterns.length > 0 && (
        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 shadow-lg">
          <h4 className="text-sm font-bold text-foreground mb-5 flex items-center gap-2 tracking-wide uppercase">
            <div className="p-1 rounded bg-indigo-500/20 text-indigo-400">
              <Leaf className="w-4 h-4" />
            </div>
            Crop Distribution
          </h4>
          <div className="space-y-4">
            {cropping_patterns.map((pattern: any, idx: number) => (
              <div key={idx} className="relative group/bar cursor-default">
                <div className="flex justify-between text-sm mb-1.5 px-1">
                  <span className="flex items-center gap-2 font-medium text-muted-foreground group-hover/bar:text-foreground transition-colors">
                    <span className="text-lg">{pattern.crop?.emoji || "🌱"}</span>{" "}
                    {pattern.crop?.name}
                  </span>
                  <span className="text-foreground font-bold tabular-nums">
                    {pattern.area_percentage}%
                  </span>
                </div>
                <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pattern.area_percentage}%` }}
                    transition={{ duration: 1.5, delay: 0.2 + idx * 0.15, ease: "easeOut" }}
                    className={`h-full rounded-full relative overflow-hidden ${
                      idx === 0
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                        : idx === 1
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                        : "bg-gradient-to-r from-indigo-500 to-purple-500"
                    }`}
                  >
                    <motion.div 
                      className="absolute inset-0 bg-white/30 w-1/2 rounded-full blur-sm"
                      animate={{ x: ["-100%", "300%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
