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
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <span className="text-primary text-4xl">🗺️</span> India Agricultural Map
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Explore land holding, irrigation, and cropping patterns across different states. 
          Click on any state to view detailed insights.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[600px]">
        {/* Map Container - Takes up 2/3 of space on large screens */}
        <div className="lg:col-span-2 h-[500px] lg:h-full relative z-0">
          <InteractiveMap
            selectedState={selectedState}
            onStateClick={(stateName) => setSelectedState(stateName)}
          />
        </div>

        {/* Side Panel - Takes up 1/3 of space */}
        <div className="lg:col-span-1 h-[500px] lg:h-full z-10">
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
