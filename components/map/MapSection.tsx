"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import InfoPanel from "./InfoPanel";

// Dynamically import InteractiveMap with ssr disabled
const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex items-center justify-center bg-card/40 rounded-2xl border border-border">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  ),
});

export default function MapSection() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [regionData, setRegionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch data when a state is clicked
  useEffect(() => {
    if (!selectedState) {
      setRegionData(null);
      return;
    }

    const fetchRegionData = async () => {
      setLoading(true);
      try {
        // Fetch all regions to match the name
        const res = await fetch("http://127.0.0.1:8000/api/regions");
        const json = await res.json();
        
        // Find the region matching the state name (case insensitive)
        const normalizedSelectedState = selectedState.toLowerCase() === 'orissa' ? 'odisha' : selectedState.toLowerCase();
        
        const matchedRegion = json.data.find(
          (r: any) => r.name.toLowerCase() === normalizedSelectedState || 
                      r.state.toLowerCase() === normalizedSelectedState
        );

        setRegionData(matchedRegion || null);
      } catch (err) {
        console.error("Failed to fetch region data:", err);
        setRegionData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRegionData();
  }, [selectedState]);

  return (
    <section className="mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center"
      >
        <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 flex items-center justify-center gap-4">
          <span className="text-5xl drop-shadow-lg">🗺️</span> 
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500">
            India Agricultural Map
          </span>
        </h2>
        <p className="text-muted-foreground/80 text-lg max-w-2xl mx-auto font-light leading-relaxed">
          Explore land holding, irrigation, and cropping patterns across different states. 
          <span className="text-foreground/80 font-medium ml-1">Click on any state</span> to view detailed insights.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-background/30 backdrop-blur-3xl p-4 lg:p-6 rounded-[2.5rem] border border-white/5 shadow-2xl h-auto">
        {/* Map Container - Takes up 2/3 of space on large screens */}
        <div className="lg:col-span-2 h-[500px] lg:h-[600px] relative z-0">
          <InteractiveMap
            selectedState={selectedState}
            onStateClick={(stateName) => setSelectedState(stateName)}
          />
        </div>

        {/* Side Panel - Takes up 1/3 of space */}
        <div className="lg:col-span-1 h-[500px] lg:h-[600px] z-10">
          <InfoPanel
            loading={loading}
            regionData={regionData}
            selectedState={selectedState}
            onClose={() => setSelectedState(null)}
          />
        </div>
      </div>
    </section>
  );
}
