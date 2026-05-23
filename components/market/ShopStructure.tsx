"use client";

import React, { useState } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface ShopStructureProps {
  id: number;
  name: string;
  category: string;
  position: [number, number, number];
  color?: string;
  isHighlighted?: boolean;
  isRecommended?: boolean;
  onClick: () => void;
}

// 1. Seed sack prop
function SeedSack({ position, color = "#cca37a" }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      {/* Sack Body */}
      <mesh castShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.6, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* Sack Top fluff */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* Rope tie */}
      <mesh position={[0, 0.52, 0]}>
        <torusGeometry args={[0.17, 0.03, 4, 8]} />
        <meshStandardMaterial color="#5c3a24" roughness={1.0} />
      </mesh>
    </group>
  );
}

// 2. Crop/Fruit Crate prop
function CropCrate({ position, cropColor = "#e74c3c" }: { position: [number, number, number]; cropColor?: string }) {
  return (
    <group position={position}>
      {/* Crate Box */}
      <mesh castShadow position={[0, 0.15, 0]}>
        <boxGeometry args={[0.5, 0.3, 0.5]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.95} />
      </mesh>
      {/* Crops inside */}
      <group position={[0, 0.25, 0]}>
        <mesh position={[-0.12, 0, -0.12]}>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshStandardMaterial color={cropColor} roughness={0.6} />
        </mesh>
        <mesh position={[0.12, 0, -0.12]}>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshStandardMaterial color={cropColor} roughness={0.6} />
        </mesh>
        <mesh position={[-0.12, 0, 0.12]}>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshStandardMaterial color={cropColor} roughness={0.6} />
        </mesh>
        <mesh position={[0.12, 0, 0.12]}>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshStandardMaterial color={cropColor} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.09, 6, 6]} />
          <meshStandardMaterial color={cropColor} roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

// 3. Farming Tool Prop
function ToolDisplay({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0.1, -0.2, -0.5]}>
      {/* Handle */}
      <mesh castShadow position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.2, 6]} />
        <meshStandardMaterial color="#cfa070" roughness={0.8} />
      </mesh>
      {/* Tool Head (Spade blade) */}
      <mesh castShadow position={[0, 1.15, 0]}>
        <boxGeometry args={[0.18, 0.22, 0.02]} />
        <meshStandardMaterial color="#6f7c7d" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

// 4. Irrigation Valve/Tubes Prop
function ValveDisplay({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pipe */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
        <meshStandardMaterial color="#2d3e50" roughness={0.5} />
      </mesh>
      {/* Connector */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.16, 0.16, 0.16]} />
        <meshStandardMaterial color="#1a252f" roughness={0.5} />
      </mesh>
      {/* Circular Valve wheel */}
      <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.025, 6, 12]} />
        <meshStandardMaterial color="#e74c3c" metalness={0.3} />
      </mesh>
    </group>
  );
}

// 5. Hay Bale Prop
function HayBale({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Straw Block */}
      <mesh castShadow>
        <boxGeometry args={[0.65, 0.4, 0.4]} />
        <meshStandardMaterial color="#d4ac0d" roughness={1.0} />
      </mesh>
      {/* Straw Straps */}
      <mesh position={[-0.18, 0, 0.01]}>
        <boxGeometry args={[0.03, 0.42, 0.42]} />
        <meshStandardMaterial color="#78281f" roughness={0.9} />
      </mesh>
      <mesh position={[0.18, 0, 0.01]}>
        <boxGeometry args={[0.03, 0.42, 0.42]} />
        <meshStandardMaterial color="#78281f" roughness={0.9} />
      </mesh>
    </group>
  );
}

export default function ShopStructure({
  id,
  name,
  category,
  position,
  color = "#00d084",
  isHighlighted = false,
  isRecommended = false,
  onClick
}: ShopStructureProps) {
  const [hovered, setHovered] = useState(false);

  const activeHighlight = hovered || isHighlighted;

  // Get Shop Metadata matching the image mockup
  const getShopMetaData = (cat: string) => {
    const lowercase = cat.toLowerCase();
    if (lowercase.includes("seed")) {
      return {
        title: "SEED STORE",
        tagline: "Premium Quality Seeds",
        icon: "🌱"
      };
    }
    if (lowercase.includes("fertilizer")) {
      return {
        title: "FERTILIZER HUB",
        tagline: "Better Soil, Better Yield",
        icon: "🌾"
      };
    }
    if (lowercase.includes("tool")) {
      return {
        title: "TOOLS & EQUIPMENT",
        tagline: "Stronger Tools, Better Farming",
        icon: "🚜"
      };
    }
    if (lowercase.includes("irrigation")) {
      return {
        title: "IRRIGATION SOLUTIONS",
        tagline: "Smart Water, Smart Farming",
        icon: "💧"
      };
    }
    if (lowercase.includes("feed")) {
      return {
        title: "ORGANIC STORE",
        tagline: "Be Organic, Stay Healthy",
        icon: "🐄"
      };
    }
    return {
      title: name.toUpperCase(),
      tagline: "Agricultural Expo Store",
      icon: "🛍️"
    };
  };

  const meta = getShopMetaData(category);

  // Render category-specific visual models/props on the storefront counter
  const renderStallProps = () => {
    const cat = category.toLowerCase();
    if (cat.includes("seed")) {
      return (
        <group>
          {/* Display counter */}
          <mesh position={[0, 0.45, 1.8]} castShadow>
            <boxGeometry args={[2.8, 0.1, 0.8]} />
            <meshStandardMaterial color="#4a2e1b" roughness={0.9} />
          </mesh>
          <SeedSack position={[-0.8, 0.5, 1.7]} color="#d2b48c" />
          <SeedSack position={[-0.4, 0.5, 1.9]} color="#c29d70" />
          <CropCrate position={[0.5, 0.5, 1.8]} cropColor="#f39c12" />
        </group>
      );
    }
    if (cat.includes("fertilizer")) {
      return (
        <group>
          {/* Stack of Fertilizer Bags on the ground */}
          <SeedSack position={[-1.4, 0, 2.0]} color="#7f8c8d" />
          <SeedSack position={[-1.7, 0, 1.7]} color="#95a5a6" />
          <SeedSack position={[-1.5, 0.4, 1.85]} color="#7f8c8d" />
          <CropCrate position={[0.7, 0, 1.9]} cropColor="#2ecc71" />
        </group>
      );
    }
    if (cat.includes("tool")) {
      return (
        <group>
          {/* Tool shelf display counter */}
          <mesh position={[0, 0.5, 1.8]} castShadow>
            <boxGeometry args={[2.6, 0.1, 0.6]} />
            <meshStandardMaterial color="#303b3d" roughness={0.8} />
          </mesh>
          <ToolDisplay position={[-0.6, 0.5, 1.8]} />
          <ToolDisplay position={[0.3, 0.5, 1.7]} />
          <CropCrate position={[0.8, 0.5, 1.8]} cropColor="#7f8c8d" />
        </group>
      );
    }
    if (cat.includes("irrigation")) {
      return (
        <group>
          {/* Pump and Valve displays */}
          <mesh position={[0, 0.45, 1.8]} castShadow>
            <boxGeometry args={[2.8, 0.1, 0.8]} />
            <meshStandardMaterial color="#2d3748" roughness={0.8} />
          </mesh>
          <ValveDisplay position={[-0.7, 0.4, 1.8]} />
          <ValveDisplay position={[0.6, 0.4, 1.8]} />
        </group>
      );
    }
    if (cat.includes("feed")) {
      return (
        <group>
          {/* Pile of hay bales on the side */}
          <HayBale position={[-1.6, 0.2, 1.8]} rotationY={0.15} />
          <HayBale position={[-1.4, 0.2, 2.3]} rotationY={-0.3} />
          <HayBale position={[-1.5, 0.6, 2.0]} rotationY={0.05} />
          <CropCrate position={[0.8, 0, 2.0]} cropColor="#f1c40f" />
        </group>
      );
    }
    return null;
  };

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = "default";
      }}
    >
      {/* 1. Main Rustic Wooden Cabin Structure */}
      {/* Cabin Base Walls */}
      <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 2.5, 4]} />
        <meshStandardMaterial
          color={activeHighlight ? "#412a1c" : "#2d1c12"}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Front Door Frame Cutout (Dark entrance backing) */}
      <mesh position={[0, 1.0, 2.01]}>
        <planeGeometry args={[1.6, 2.0]} />
        <meshStandardMaterial color="#0b0704" roughness={1.0} />
      </mesh>

      {/* Wooden Support Beams (Horizontal cladding) */}
      <mesh position={[0, 2.3, 2.05]}>
        <boxGeometry args={[4.2, 0.15, 0.15]} />
        <meshStandardMaterial color="#1a110a" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.2, 2.05]}>
        <boxGeometry args={[4.2, 0.15, 0.15]} />
        <meshStandardMaterial color="#1a110a" roughness={0.95} />
      </mesh>

      {/* Slanted Clay Roof (Rural thatched look - Terracotta clay color) */}
      {/* Left Slanted Panel */}
      <mesh position={[-1.25, 2.9, 0]} rotation={[0, 0, -0.45]} castShadow>
        <boxGeometry args={[2.8, 0.2, 4.5]} />
        <meshStandardMaterial
          color={color}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      {/* Right Slanted Panel */}
      <mesh position={[1.25, 2.9, 0]} rotation={[0, 0, 0.45]} castShadow>
        <boxGeometry args={[2.8, 0.2, 4.5]} />
        <meshStandardMaterial
          color={color}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      {/* Roof ridge cap */}
      <mesh position={[0, 3.45, 0]} castShadow>
        <boxGeometry args={[0.3, 0.3, 4.6]} />
        <meshStandardMaterial color="#1a110a" roughness={0.9} />
      </mesh>

      {/* Store Entrance Straw/Dirt Door Mat */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 2.6]} receiveShadow>
        <planeGeometry args={[2.2, 1.2]} />
        <meshStandardMaterial color="#2c1e13" roughness={1.0} />
      </mesh>

      {/* Category-specific Props displayed at the storefront */}
      {renderStallProps()}

      {/* Hanging "20% OFF" sale banner (wooden poster card on side wall) */}
      <mesh position={[-2.02, 1.4, 0.6]} rotation={[0, -Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.8, 1.0, 0.03]} />
        <meshStandardMaterial color="#b03a2e" roughness={0.8} />
      </mesh>
      <Html position={[-2.05, 1.4, 0.6]} rotation={[0, -Math.PI / 2, 0]} transform distanceFactor={5}>
        <div className="text-center font-mono font-black select-none pointer-events-none text-white leading-none">
          <p className="text-[12px] tracking-widest text-[#f4d03f]">SALE</p>
          <h5 className="text-[18px] text-white font-extrabold mt-1">20%</h5>
          <p className="text-[9px] text-[#f4d03f] tracking-tight uppercase mt-0.5">OFF NOW</p>
        </div>
      </Html>

      {/* Glowing Lantern (Light Source hanging from roof) */}
      <mesh position={[0, 2.2, 2.3]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial 
          color="#ffb74d" 
          emissive={activeHighlight ? color : "#ffb74d"} 
          emissiveIntensity={activeHighlight ? 3.0 : 1.5} 
        />
      </mesh>
      <pointLight 
        position={[0, 2.0, 2.4]} 
        color={color} 
        intensity={activeHighlight ? 4.5 : 2.0} 
        distance={7} 
        castShadow
      />

      {/* 2. Hanging Neon signboard matching the image mockup */}
      <Html position={[0, 3.85, 0]} center distanceFactor={14}>
        {isRecommended && (
          <div className="mb-2.5 px-3.5 py-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full border border-emerald-300/40 text-center animate-pulse shadow-[0_0_15px_rgba(0,208,132,0.6)]">
            <span className="text-[9px] font-sans font-black tracking-widest text-black uppercase">
              ★ RECOMMENDED FOR YOU
            </span>
          </div>
        )}
        <div 
          style={{
            borderColor: color,
            boxShadow: activeHighlight ? `0 0 35px ${color}88` : `0 0 15px ${color}33`,
            transform: activeHighlight ? "scale(1.05)" : "scale(1.0)",
          }}
          className="bg-black/95 border-2 rounded-[1.2rem] p-3 px-5.5 backdrop-blur-2xl select-none pointer-events-none text-center whitespace-nowrap transition-all duration-350"
        >
          <div className="flex items-center gap-2 justify-center">
            <span className="text-lg leading-none">{meta.icon}</span>
            <h4 className="font-black text-sm md:text-base tracking-widest text-white">{meta.title}</h4>
          </div>
          <p className="text-[9px] font-mono font-bold tracking-wider text-muted-foreground mt-1 uppercase">
            {meta.tagline}
          </p>
          {activeHighlight && (
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent my-1.5" />
          )}
          {activeHighlight && (
            <p className="text-[9px] font-mono text-primary animate-pulse uppercase tracking-widest leading-none select-none font-black">
              [ ENTER ]
            </p>
          )}
        </div>
      </Html>
    </group>
  );
}
