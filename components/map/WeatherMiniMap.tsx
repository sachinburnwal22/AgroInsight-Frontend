"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon path issues in Next.js
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapController({ coords }: { coords: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.setView([coords.lat, coords.lng], 6, {
      animate: true,
      duration: 1
    });
  }, [coords, map]);
  return null;
}

export default function WeatherMiniMap({ 
  coords, 
  temp, 
  weatherRegion 
}: { 
  coords: { lat: number; lng: number }, 
  temp: number,
  weatherRegion: string 
}) {
  return (
    <div className="w-full h-64 rounded-xl overflow-hidden border border-white/10 shadow-inner my-4 z-0 relative">
      <MapContainer
        center={[coords.lat, coords.lng]}
        zoom={6}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={[coords.lat, coords.lng]}>
          <Popup className="custom-popup">
            <div className="font-bold text-lg">{weatherRegion}</div>
            <div className="text-primary text-xl">{temp}°C</div>
          </Popup>
        </Marker>
        <MapController coords={coords} />
      </MapContainer>
    </div>
  );
}
