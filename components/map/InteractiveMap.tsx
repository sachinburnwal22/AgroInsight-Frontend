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
        className: "bg-card text-foreground border border-border shadow-lg rounded-lg p-2 text-sm",
      }
    );

    layer.on({
      mouseover: (e: any) => {
        const target = e.target;
        target.setStyle({
          weight: 3,
          color: "#00d084",
          dashArray: "",
          fillOpacity: 0.7,
        });
        target.bringToFront();
      },
      mouseout: (e: any) => {
        const target = e.target;
        target.setStyle({
          weight: 1,
          color: "rgba(255, 255, 255, 0.4)",
          fillOpacity: selectedState === stateName ? 0.7 : 0.3,
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
      fillColor: isSelected ? "#00d084" : "#0f0f2e",
      weight: 1,
      opacity: 1,
      color: "rgba(255, 255, 255, 0.4)",
      fillOpacity: isSelected ? 0.7 : 0.3,
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
    <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-border shadow-2xl relative">
      <MapContainer
        center={[22.5937, 78.9629]}
        zoom={5}
        scrollWheelZoom={false}
        className="w-full h-full bg-[#0a0a1f]"
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
