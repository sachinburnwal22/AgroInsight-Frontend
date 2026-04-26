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
      <div className="bg-card/60 border border-border rounded-2xl p-8 backdrop-blur-xl h-full flex flex-col items-center justify-center text-center">
        <MapIcon className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
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
      <div className="bg-card/60 border border-border rounded-2xl p-8 backdrop-blur-xl h-full flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full mb-4"
        />
        <p className="text-muted-foreground">Loading state insights...</p>
      </div>
    );
  }

  if (!regionData) {
    return (
      <div className="bg-card/60 border border-border rounded-2xl p-8 backdrop-blur-xl h-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center justify-center text-center h-full">
          <AlertCircle className="w-12 h-12 text-destructive/50 mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No Data Available
          </h3>
          <p className="text-muted-foreground text-sm">
            We currently do not have agricultural data for {selectedState}.
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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card/60 border border-border rounded-2xl p-6 backdrop-blur-xl h-full relative overflow-y-auto custom-scrollbar"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground mb-1">{name}</h2>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          {climate} · {rainfall_range} Rainfall
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-muted/40 rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase mb-2">
            <MapIcon className="w-4 h-4 text-primary" /> Avg Land
          </div>
          <p className="text-2xl font-bold text-foreground">
            {avgLandSize.toFixed(1)}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ha
            </span>
          </p>
        </div>

        <div className="bg-muted/40 rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase mb-2">
            <Droplet className="w-4 h-4 text-accent" /> Irrigation
          </div>
          <p className="text-2xl font-bold text-foreground">
            {avgIrrigation.toFixed(0)}%
          </p>
        </div>
      </div>

      {topCrop && (
        <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl p-5 mb-6 relative overflow-hidden group">
          <motion.div
            className="absolute -right-6 -top-6 text-primary/10 transition-transform duration-500 group-hover:scale-110"
            style={{ fontSize: "100px" }}
          >
            {topCrop.crop?.emoji || "🌾"}
          </motion.div>
          <div className="relative z-10">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              Top Crop
            </p>
            <h3 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
              {topCrop.crop?.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Covers {topCrop.area_percentage}% of agricultural area
            </p>
          </div>
        </div>
      )}

      {cropping_patterns && cropping_patterns.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-secondary" /> Crop Distribution
          </h4>
          <div className="space-y-3">
            {cropping_patterns.map((pattern: any, idx: number) => (
              <div key={idx} className="relative">
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-1">
                    <span>{pattern.crop?.emoji || "🌱"}</span>{" "}
                    {pattern.crop?.name}
                  </span>
                  <span className="text-muted-foreground font-medium">
                    {pattern.area_percentage}%
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pattern.area_percentage}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className={`h-full ${
                      idx === 0
                        ? "bg-primary"
                        : idx === 1
                        ? "bg-accent"
                        : "bg-secondary"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
