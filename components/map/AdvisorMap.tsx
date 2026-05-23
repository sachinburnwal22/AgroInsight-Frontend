"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface AdvisorMapProps {
  latitude: number;
  longitude: number;
  threatType: string | null;
  overlayType: "rain" | "heat" | "none";
}

// Helper to update map view dynamically when coordinates change
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 10);
  }, [lat, lng, map]);
  return null;
}

export default function AdvisorMap({ latitude, longitude, threatType, overlayType }: AdvisorMapProps) {
  // Setup standard leaflet marker icons
  const pinIcon = L.divIcon({
    className: "custom-leaflet-pin",
    html: `
      <div class="relative w-7 h-7">
        <span class="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping"></span>
        <div class="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-lg absolute top-1.5 left-1.5"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  // Color mapping based on active threat simulation
  const getThreatColor = () => {
    if (!threatType) return "#10b981"; // green
    const lower = threatType.toLowerCase();
    if (lower.includes("flood") || lower.includes("rain")) return "#3b82f6"; // blue
    if (lower.includes("heat")) return "#f59e0b"; // yellow/orange
    return "#ef4444"; // red
  };

  const threatColor = getThreatColor();

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      <MapContainer
        center={[latitude, longitude]}
        zoom={10}
        style={{ width: "100%", height: "100%", background: "#06060c" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        
        <RecenterMap lat={latitude} lng={longitude} />

        {/* User Location Marker */}
        <Marker position={[latitude, longitude]} icon={pinIcon}>
          <Popup>
            <div className="text-xs font-sans text-slate-800">
              <p className="font-bold">Your Location</p>
              <p className="font-mono mt-0.5">Lat: {latitude.toFixed(4)} | Lng: {longitude.toFixed(4)}</p>
            </div>
          </Popup>
        </Marker>

        {/* Dynamic Threat Zone Circle Overlay */}
        {threatType && (
          <Circle
            center={[latitude, longitude]}
            radius={8000} // 8km radius
            pathOptions={{
              color: threatColor,
              fillColor: threatColor,
              fillOpacity: 0.15,
              weight: 2,
              dashArray: "6, 6"
            }}
          />
        )}

        {/* Rain Heatmap Overlay */}
        {overlayType === "rain" && (
          <>
            <Circle center={[latitude + 0.05, longitude - 0.04]} radius={15000} pathOptions={{ color: "#3498db", fillColor: "#2980b9", fillOpacity: 0.25, weight: 0 }} />
            <Circle center={[latitude - 0.03, longitude + 0.07]} radius={12000} pathOptions={{ color: "#2980b9", fillColor: "#1f618d", fillOpacity: 0.2, weight: 0 }} />
            <Circle center={[latitude + 0.01, longitude + 0.01]} radius={25000} pathOptions={{ color: "#5dade2", fillColor: "#a9cce3", fillOpacity: 0.12, weight: 0 }} />
          </>
        )}

        {/* Heat Map Overlay */}
        {overlayType === "heat" && (
          <>
            <Circle center={[latitude + 0.02, longitude - 0.02]} radius={20000} pathOptions={{ color: "#e67e22", fillColor: "#d35400", fillOpacity: 0.22, weight: 0 }} />
            <Circle center={[latitude - 0.04, longitude + 0.04]} radius={16000} pathOptions={{ color: "#f39c12", fillColor: "#e67e22", fillOpacity: 0.25, weight: 0 }} />
            <Circle center={[latitude + 0.06, longitude + 0.06]} radius={28000} pathOptions={{ color: "#f1c40f", fillColor: "#f39c12", fillOpacity: 0.1, weight: 0 }} />
          </>
        )}
      </MapContainer>

      {/* Mini-legend inside map */}
      <div className="absolute bottom-4 left-4 z-[400] bg-[#07070f]/90 border border-white/10 rounded-xl p-3 text-[10px] font-mono leading-relaxed text-slate-300 backdrop-blur-md shadow-lg select-none">
        <h5 className="font-bold text-white uppercase text-[8px] tracking-wider mb-1.5">Map Overlays</h5>
        <div className="space-y-1">
          <p className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white/20"></span>
            <span>Live Location Pin</span>
          </p>
          {threatType && (
            <p className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full animate-pulse border border-white/20" style={{ backgroundColor: threatColor }}></span>
              <span className="text-white font-bold">{threatType} Radius</span>
            </p>
          )}
          {overlayType === "rain" && (
            <p className="flex items-center gap-1.5 text-[#3498db]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3498db]/40"></span>
              <span>Precipitation Cloud</span>
            </p>
          )}
          {overlayType === "heat" && (
            <p className="flex items-center gap-1.5 text-[#e67e22]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e67e22]/40"></span>
              <span>Thermal Heatwave Map</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
