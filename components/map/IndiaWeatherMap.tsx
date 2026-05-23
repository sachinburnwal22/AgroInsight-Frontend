"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom Glowing Cybernetic Marker Icon using Leaflet DivIcon
const createGlowingIcon = (isRadarActive: boolean) => {
  return L.divIcon({
    className: "custom-glowing-marker",
    html: `
      <div class="relative flex items-center justify-center">
        <!-- Core Marker Dot -->
        <div class="absolute w-4.5 h-4.5 bg-primary rounded-full z-30 shadow-[0_0_10px_#00d084] border border-white/20"></div>
        <!-- Pulse Ring 1 -->
        <div class="absolute w-9 h-9 bg-primary/40 rounded-full animate-ping z-20"></div>
        <!-- Pulse Ring 2 -->
        <div class="absolute w-14 h-14 bg-accent/25 rounded-full ${isRadarActive ? 'animate-pulse' : ''} z-10"></div>
        <!-- Scanline sweeping radar ring -->
        ${isRadarActive ? `
          <div class="absolute w-24 h-24 rounded-full border border-primary/20 bg-primary/5 animate-[ping_3s_infinite] z-0"></div>
        ` : ''}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Custom Mini Marker for major cities
const createCityMarker = (temp: number) => {
  const color = temp >= 35 ? "#ef4444" : temp >= 30 ? "#f97316" : temp >= 25 ? "#10b981" : "#06b6d4";
  return L.divIcon({
    className: "custom-city-marker",
    html: `
      <div class="relative flex items-center justify-center group/marker">
        <div class="w-3.5 h-3.5 rounded-full border border-white/30 shadow-md transition-transform duration-300 group-hover/marker:scale-125" style="background-color: ${color}"></div>
        <div class="absolute -top-6 bg-black/85 text-[10px] text-white font-mono font-bold px-1.5 py-0.5 rounded border border-white/10 opacity-0 group-hover/marker:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          ${temp}°C
        </div>
      </div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

interface IndiaWeatherMapProps {
  coords: { lat: number; lng: number };
  onMapClick: (lat: number, lng: number) => void;
  radarActive: boolean;
  heatmapActive: boolean;
  onCityClick: (cityCoords: { lat: number; lng: number }) => void;
}

// Major cities in India with average summer coordinates and temperatures to act as preset pins
const presetCities = [
  { name: "New Delhi", state: "Delhi", coords: { lat: 28.6139, lng: 77.2090 }, temp: 39 },
  { name: "Mumbai", state: "Maharashtra", coords: { lat: 19.0760, lng: 72.8777 }, temp: 32 },
  { name: "Kolkata", state: "West Bengal", coords: { lat: 22.5726, lng: 88.3639 }, temp: 34 },
  { name: "Chennai", state: "Tamil Nadu", coords: { lat: 13.0827, lng: 80.2707 }, temp: 36 },
  { name: "Bengaluru", state: "Karnataka", coords: { lat: 12.9716, lng: 77.5946 }, temp: 29 },
  { name: "Guwahati", state: "Assam", coords: { lat: 26.1445, lng: 91.7362 }, temp: 31 },
  { name: "Srinagar", state: "Jammu & Kashmir", coords: { lat: 34.0837, lng: 74.7973 }, temp: 22 },
  { name: "Hyderabad", state: "Telangana", coords: { lat: 17.3850, lng: 78.4867 }, temp: 35 }
];

// Handles map click event and feeds coordinates back to parent
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

// Controls active zooming and centering when city is pinned
function MapCenterController({ coords }: { coords: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.setView([coords.lat, coords.lng], map.getZoom(), {
      animate: true,
      duration: 1.2
    });
  }, [coords, map]);
  return null;
}

export default function IndiaWeatherMap({
  coords,
  onMapClick,
  radarActive,
  heatmapActive,
  onCityClick
}: IndiaWeatherMapProps) {
  return (
    <div className="w-full h-full rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,208,132,0.15)] relative group z-0">
      {/* Visual cybernetic HUD frame overlay */}
      <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10 flex items-center justify-between px-6">
        <span className="text-[10px] font-mono tracking-widest text-primary font-bold">GRID_LOCATOR: {coords.lat.toFixed(4)}N / {coords.lng.toFixed(4)}E</span>
        <span className="text-[10px] font-mono tracking-widest text-muted-foreground">SCANNING_ARRAY_01</span>
      </div>

      <MapContainer
        center={[22.5937, 78.9629]}
        zoom={5}
        scrollWheelZoom={true}
        className="w-full h-full bg-[#020208]"
        zoomControl={false}
      >
        {/* Dark Matter Theme Basemap */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Heatmap Layer - Visual circles with temperature-gradient color indicators */}
        {heatmapActive && presetCities.map((city) => {
          const color = city.temp >= 35 ? "#ef4444" : city.temp >= 30 ? "#f97316" : city.temp >= 25 ? "#10b981" : "#06b6d4";
          return (
            <Circle
              key={`heat-${city.name}`}
              center={[city.coords.lat, city.coords.lng]}
              radius={180000} // ~180km radius visual warmth
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.18,
                color: color,
                weight: 1,
                opacity: 0.3
              }}
            />
          );
        })}

        {/* Major Cities Presets - Click to auto-pin city */}
        {presetCities.map((city) => (
          <Marker
            key={`city-${city.name}`}
            position={[city.coords.lat, city.coords.lng]}
            icon={createCityMarker(city.temp)}
            eventHandlers={{
              click: () => onCityClick(city.coords)
            }}
          >
            <Popup className="custom-popup-cyber">
              <div className="font-mono text-xs p-1">
                <p className="font-bold text-white leading-tight">{city.name}</p>
                <p className="text-muted-foreground text-[10px]">{city.state}</p>
                <p className="text-primary font-bold mt-1 text-sm">{city.temp}°C</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Active Pinned Location Marker */}
        <Marker 
          position={[coords.lat, coords.lng]} 
          icon={createGlowingIcon(radarActive)}
        />

        {/* Radar Expanding Sweep Ring Overlay */}
        {radarActive && (
          <Circle
            center={[coords.lat, coords.lng]}
            radius={250000} // 250km sweep
            pathOptions={{
              fillColor: "#00d084",
              fillOpacity: 0.03,
              color: "#00d084",
              weight: 1.5,
              dashArray: "5, 10",
              opacity: 0.4
            }}
          />
        )}

        {/* Controls */}
        <MapClickHandler onMapClick={onMapClick} />
        <MapCenterController coords={coords} />
      </MapContainer>
    </div>
  );
}
