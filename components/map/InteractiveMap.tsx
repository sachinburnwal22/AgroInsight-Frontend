"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface InteractiveMapProps {
  onStateClick: (stateName: string) => void;
  selectedState: string | null;
}

export default function InteractiveMap({
  onStateClick,
  selectedState,
}: InteractiveMapProps) {
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch("/data/india-states.json")
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Error loading GeoJSON", err));
  }, []);

  const onEachFeature = (feature: any, layer: any) => {
    const stateName = feature.properties.NAME_1;

    // Tooltip content
    layer.bindTooltip(
      `<strong>${stateName}</strong><br />Click for agricultural insights`,
      {
        direction: "top",
        sticky: true,
        className: "backdrop-blur-xl bg-background/90 border border-white/10 shadow-2xl rounded-xl p-3 text-sm font-medium text-foreground tracking-wide",
      }
    );

    layer.on({
      mouseover: (e: any) => {
        const target = e.target;
        target.setStyle({
          weight: 2,
          color: "#34d399",
          dashArray: "",
          fillOpacity: 0.8,
          fillColor: selectedState === stateName ? "#10b981" : "rgba(16, 185, 129, 0.3)",
        });
        target.bringToFront();
      },
      mouseout: (e: any) => {
        const target = e.target;
        target.setStyle({
          weight: 1,
          color: "rgba(255, 255, 255, 0.15)",
          fillOpacity: selectedState === stateName ? 0.9 : 0.4,
          fillColor: selectedState === stateName ? "#10b981" : "rgba(15, 23, 42, 0.6)",
        });
      },
      click: () => {
        onStateClick(stateName);
      },
    });
  };

  const geoJsonStyle = (feature: any) => {
    const isSelected = selectedState === feature.properties.NAME_1;
    return {
      fillColor: isSelected ? "#10b981" : "rgba(15, 23, 42, 0.6)",
      weight: 1,
      opacity: 1,
      color: isSelected ? "#34d399" : "rgba(255, 255, 255, 0.15)",
      fillOpacity: isSelected ? 0.9 : 0.4,
    };
  };

  if (!geoData) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-card/40 rounded-2xl border border-border">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[500px] rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(16,185,129,0.1)] relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 opacity-50 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none z-10" />
      <MapContainer
        center={[22.5937, 78.9629]}
        zoom={5}
        scrollWheelZoom={false}
        className="w-full h-full bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617]"
        zoomControl={false}
      >
        <GeoJSON
          key={selectedState || "initial"}
          data={geoData}
          style={geoJsonStyle}
          onEachFeature={onEachFeature}
        />
      </MapContainer>
    </div>
  );
}
