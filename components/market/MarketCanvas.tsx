"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMovement } from "@/hooks/useMovement";
import ShopStructure from "./ShopStructure";
import * as THREE from "three";

interface Shop {
  id: number;
  name: string;
  category: string;
  position_x: number;
  position_z: number;
}

interface MarketCanvasProps {
  shops: Shop[];
  onShopClick: (shop: Shop) => void;
  isNight?: boolean;
  nearShop: Shop | null;
  onNearShopChange: (shop: Shop | null) => void;
}

// ------------------------------------------------------------------
// PROCEDURAL TERRAIN TEXTURE GENERATOR
// Generates a beautiful village soil and grass texture offline.
// ------------------------------------------------------------------
function useProceduralTerrainTexture() {
  return useMemo(() => {
    if (typeof window === "undefined") return null;

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // 1. Dark dirt ground base
    ctx.fillStyle = "#1e1511";
    ctx.fillRect(0, 0, 512, 512);

    // 2. Add soil grains noise
    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = Math.random() * 1.5;
      ctx.fillStyle = Math.random() > 0.5 ? "#2f221a" : "#120a07";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Draw grass tufts
    for (let i = 0; i < 600; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.strokeStyle = Math.random() > 0.4 ? "#223e15" : "#152a0a";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 6, y - 8 - Math.random() * 10);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16);
    return texture;
  }, []);
}

// ------------------------------------------------------------------
// ENVIRONMENT VEGETATION: LOW-POLY TREES
// ------------------------------------------------------------------
function LowPolyTree({ position }: { position: [number, number, number] }) {
  const scale = useMemo(() => 0.8 + Math.random() * 0.4, []);
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.35, 3.0, 6]} />
        <meshStandardMaterial color="#4a2f1b" roughness={0.9} />
      </mesh>
      {/* Foliage */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <dodecahedronGeometry args={[1.5, 1]} />
        <meshStandardMaterial color="#196f3d" roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 4.4, 0]} castShadow>
        <dodecahedronGeometry args={[1.1, 1]} />
        <meshStandardMaterial color="#229954" roughness={0.8} flatShading />
      </mesh>
    </group>
  );
}

// ------------------------------------------------------------------
// DETAILED STREET LIGHT POST
// Projects a warm pool of light and a volumetric cone beam at night.
// ------------------------------------------------------------------
function StreetLight({ position, isNight = false }: { position: [number, number, number]; isNight?: boolean }) {
  const [x, y, z] = position;
  return (
    <group position={[x, 0, z]}>
      {/* Tall Iron Post */}
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.07, 0.12, 5.0, 8]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Post Bevel Collar */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.4, 8]} />
        <meshStandardMaterial color="#1a252f" metalness={0.7} />
      </mesh>
      {/* Horizontal Arm */}
      <mesh position={[0.35, 5.0, 0]} castShadow>
        <boxGeometry args={[0.9, 0.08, 0.08]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Lamp Cap */}
      <mesh position={[0.75, 4.85, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.18, 0.25, 8]} />
        <meshStandardMaterial color="#1a252f" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Glowing Warm Light Bulb */}
      <mesh position={[0.75, 4.7, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial 
          color="#ffea75" 
          emissive="#ffea75" 
          emissiveIntensity={isNight ? 3.5 : 0.2} 
        />
      </mesh>

      {/* Volumetric Warm Light Beam Cone */}
      {isNight && (
        <mesh position={[0.75, 2.35, 0]}>
          <cylinderGeometry args={[0.1, 1.8, 4.7, 16, 1, true]} />
          <meshBasicMaterial
            color="#ffeaa7"
            transparent
            opacity={0.09}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Downward Light source */}
      <pointLight
        position={[0.75, 4.5, 0]}
        intensity={isNight ? 15.0 : 0.0}
        distance={18}
        color="#ffeaa7"
        castShadow
        shadow-bias={-0.0015}
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
    </group>
  );
}

// ------------------------------------------------------------------
// MUD PUDDLES
// Highly reflective flat circular planes overlayed on pathways.
// ------------------------------------------------------------------
function MudPuddle({ position, args = [1.5, 1.5] }: { position: [number, number, number]; args?: [number, number] }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0.3]} position={position} receiveShadow>
      <planeGeometry args={args} />
      <meshStandardMaterial
        color="#100b08"
        roughness={0.03} 
        metalness={0.9}  
      />
    </mesh>
  );
}

// ------------------------------------------------------------------
// MARKET BUNTINGS (FESTIVE DECORATIVE FLAGS)
// ------------------------------------------------------------------
function Flag({ position, rotationY, color }: { position: [number, number, number]; rotationY: number; color: string }) {
  return (
    <mesh position={position} rotation={[0.3, rotationY, 0]}>
      <coneGeometry args={[0.07, 0.16, 3]} />
      <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.6} />
    </mesh>
  );
}

function MarketBuntings({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const flagsCount = 9;
  const flags = [];
  const colors = ["#e74c3c", "#f1c40f", "#2ecc71", "#3498db"];

  for (let i = 1; i < flagsCount; i++) {
    const pct = i / flagsCount;
    const x = start[0] + (end[0] - start[0]) * pct;
    const y = start[1] + (end[1] - start[1]) * pct - Math.sin(pct * Math.PI) * 0.35; 
    const z = start[2] + (end[2] - start[2]) * pct;
    const color = colors[i % colors.length];
    const angle = Math.atan2(end[0] - start[0], end[2] - start[2]) + Math.PI / 2;
    flags.push(
      <Flag key={i} position={[x, y - 0.1, z]} rotationY={angle} color={color} />
    );
  }

  return (
    <group>
      {/* String Wire */}
      <mesh position={[(start[0]+end[0])/2, 4.8, (start[2]+end[2])/2]}>
        <boxGeometry args={[Math.sqrt((start[0]-end[0])**2 + (start[2]-end[2])**2), 0.015, 0.015]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {flags}
    </group>
  );
}

// ------------------------------------------------------------------
// TWINKLING STAR PARTICLES
// ------------------------------------------------------------------
function TwinklingStars() {
  const count = 400;
  const pointsRef = useRef<THREE.Points>(null);

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 55 + Math.random() * 15;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = Math.abs(r * Math.sin(phi) * Math.sin(theta)) + 12; 
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return [pos];
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      const t = state.clock.getElapsedTime();
      (pointsRef.current.material as THREE.PointsMaterial).opacity = 0.4 + Math.sin(t * 3) * 0.3;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.16}
        sizeAttenuation={true}
        transparent
        opacity={0.8}
      />
    </points>
  );
}

// ------------------------------------------------------------------
// FIREFLIES (FLOATING LIGHT DUST)
// ------------------------------------------------------------------
function Fireflies() {
  const count = 120;
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, offsets] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const offs = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = 0.5 + Math.random() * 3.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
      offs[i] = Math.random() * Math.PI * 2;
    }
    return [pos, offs];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position;
    if (posAttr) {
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < count; i++) {
        arr[i * 3] += Math.sin(t + offsets[i]) * 0.008;
        arr[i * 3 + 1] += Math.cos(t * 1.2 + offsets[i]) * 0.006;
        arr[i * 3 + 2] += Math.cos(t * 0.8 + offsets[i]) * 0.008;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffeaa7"
        size={0.15}
        sizeAttenuation={true}
        transparent
        opacity={0.7}
      />
    </points>
  );
}

// ------------------------------------------------------------------
// FLYING BATS / NIGHT BIRDS
// ------------------------------------------------------------------
function FlyingBats() {
  const batsCount = 5;
  const bats = [];
  for (let i = 0; i < batsCount; i++) {
    bats.push(
      <FlyingBat 
        key={i} 
        offset={i * (Math.PI / 2.5)} 
        speed={1.0 + i * 0.15} 
        radius={22 + i * 1.5} 
        height={13 + i * 1.2} 
      />
    );
  }
  return <group>{bats}</group>;
}

function FlyingBat({ offset, speed, radius, height }: { offset: number; speed: number; radius: number; height: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      const angle = t * 0.16 * speed + offset;
      groupRef.current.position.x = Math.cos(angle) * radius;
      groupRef.current.position.y = height + Math.sin(t * speed) * 0.6;
      groupRef.current.position.z = Math.sin(angle) * radius;
      groupRef.current.rotation.y = -angle + Math.PI / 2;
    }

    const flap = Math.sin(t * 8.0 * speed) * 0.6;
    if (leftWingRef.current) leftWingRef.current.rotation.z = -flap;
    if (rightWingRef.current) rightWingRef.current.rotation.z = flap;
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[0.08, 0.06, 0.3]} />
        <meshStandardMaterial color="#1b1c1e" roughness={0.9} />
      </mesh>
      {/* Left wing */}
      <group position={[-0.04, 0, 0]} ref={leftWingRef}>
        <mesh position={[-0.2, 0, 0]}>
          <boxGeometry args={[0.35, 0.01, 0.2]} />
          <meshStandardMaterial color="#111213" />
        </mesh>
      </group>
      {/* Right wing */}
      <group position={[0.04, 0, 0]} ref={rightWingRef}>
        <mesh position={[0.2, 0, 0]}>
          <boxGeometry args={[0.35, 0.01, 0.2]} />
          <meshStandardMaterial color="#111213" />
        </mesh>
      </group>
    </group>
  );
}

// ------------------------------------------------------------------
// VILLAGE ANIMALS: COW AND DOG
// ------------------------------------------------------------------
function SpottedCow({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  const tailRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 3.5) * 0.22;
    }
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Body */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.7, 1.4]} />
        <meshStandardMaterial color="#f0f3f4" roughness={0.8} />
      </mesh>
      {/* Spots */}
      <mesh position={[0.36, 0.8, 0.2]}>
        <boxGeometry args={[0.02, 0.2, 0.3]} />
        <meshStandardMaterial color="#1c2833" />
      </mesh>
      <mesh position={[-0.36, 0.7, -0.3]}>
        <boxGeometry args={[0.02, 0.3, 0.4]} />
        <meshStandardMaterial color="#1c2833" />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.1, 0.6]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.4]} />
        <meshStandardMaterial color="#f0f3f4" roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.3, 0.8]} castShadow>
        <boxGeometry args={[0.38, 0.35, 0.45]} />
        <meshStandardMaterial color="#f0f3f4" roughness={0.8} />
      </mesh>
      {/* Snout */}
      <mesh position={[0, 1.2, 1.05]}>
        <boxGeometry args={[0.26, 0.18, 0.15]} />
        <meshStandardMaterial color="#f5b041" roughness={0.9} />
      </mesh>
      {/* Horns */}
      <mesh position={[-0.14, 1.5, 0.76]} rotation={[0.3, 0, -0.2]}>
        <coneGeometry args={[0.03, 0.22, 4]} />
        <meshStandardMaterial color="#bfc9ca" />
      </mesh>
      <mesh position={[0.14, 1.5, 0.76]} rotation={[0.3, 0, 0.2]}>
        <coneGeometry args={[0.03, 0.22, 4]} />
        <meshStandardMaterial color="#bfc9ca" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.25, 0.3, 0.5]} castShadow><cylinderGeometry args={[0.08, 0.06, 0.6, 6]} /><meshStandardMaterial color="#f0f3f4" /></mesh>
      <mesh position={[0.25, 0.3, 0.5]} castShadow><cylinderGeometry args={[0.08, 0.06, 0.6, 6]} /><meshStandardMaterial color="#f0f3f4" /></mesh>
      <mesh position={[-0.25, 0.3, -0.5]} castShadow><cylinderGeometry args={[0.08, 0.06, 0.6, 6]} /><meshStandardMaterial color="#f0f3f4" /></mesh>
      <mesh position={[0.25, 0.3, -0.5]} castShadow><cylinderGeometry args={[0.08, 0.06, 0.6, 6]} /><meshStandardMaterial color="#f0f3f4" /></mesh>
      {/* Tail */}
      <group ref={tailRef} position={[0, 0.9, -0.7]} rotation={[-0.3, 0, 0]}>
        <mesh position={[0, -0.3, 0]}><cylinderGeometry args={[0.025, 0.025, 0.6, 4]} /><meshStandardMaterial color="#1c2833" /></mesh>
      </group>
    </group>
  );
}

function GoldenDog({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  const tailRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 7.5) * 0.42;
    }
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Sitting body */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.3, 0.35, 0.55]} />
        <meshStandardMaterial color="#d35400" roughness={0.85} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.55, 0.2]} castShadow>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshStandardMaterial color="#d35400" roughness={0.85} />
      </mesh>
      {/* Snout */}
      <mesh position={[0, 0.5, 0.32]}><boxGeometry args={[0.1, 0.08, 0.08]} /><meshStandardMaterial color="#1a252f" /></mesh>
      {/* Ears */}
      <mesh position={[-0.09, 0.68, 0.16]} rotation={[0, 0, 0.2]}><boxGeometry args={[0.04, 0.1, 0.08]} /><meshStandardMaterial color="#a04000" /></mesh>
      <mesh position={[0.09, 0.68, 0.16]} rotation={[0, 0, -0.2]}><boxGeometry args={[0.04, 0.1, 0.08]} /><meshStandardMaterial color="#a04000" /></mesh>
      {/* Legs sitting */}
      <mesh position={[-0.12, 0.1, 0.18]} castShadow><cylinderGeometry args={[0.04, 0.04, 0.2, 6]} /><meshStandardMaterial color="#d35400" /></mesh>
      <mesh position={[0.12, 0.1, 0.18]} castShadow><cylinderGeometry args={[0.04, 0.04, 0.2, 6]} /><meshStandardMaterial color="#d35400" /></mesh>
      {/* Tail */}
      <group ref={tailRef} position={[0, 0.2, -0.28]} rotation={[-0.5, 0, 0]}>
        <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.02, 0.02, 0.3, 4]} /><meshStandardMaterial color="#d35400" /></mesh>
      </group>
    </group>
  );
}

// ------------------------------------------------------------------
// GENERAL MARKET DECORATIVE PROPS
// ------------------------------------------------------------------
function WoodenCart({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Flatbed */}
      <mesh castShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[1.5, 0.1, 2.2]} />
        <meshStandardMaterial color="#784212" roughness={0.9} />
      </mesh>
      {/* Wheels */}
      <mesh castShadow position={[-0.8, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.15, 8]} />
        <meshStandardMaterial color="#4d2808" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0.8, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.15, 8]} />
        <meshStandardMaterial color="#4d2808" roughness={0.9} />
      </mesh>
      {/* Shaft Handles */}
      <mesh castShadow position={[-0.2, 0.3, 1.2]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.08, 0.08, 1.5]} />
        <meshStandardMaterial color="#784212" />
      </mesh>
      <mesh castShadow position={[0.2, 0.3, 1.2]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.08, 0.08, 1.5]} />
        <meshStandardMaterial color="#784212" />
      </mesh>
    </group>
  );
}

function MarketCrates({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Crates stack */}
      <mesh castShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[0.6, 0.4, 0.6]} />
        <meshStandardMaterial color="#7e5109" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0.2, 0.2, -0.7]}>
        <boxGeometry args={[0.6, 0.4, 0.6]} />
        <meshStandardMaterial color="#5e3c07" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0.08, 0.6, -0.3]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.6, 0.4, 0.6]} />
        <meshStandardMaterial color="#9c6615" roughness={0.9} />
      </mesh>
    </group>
  );
}

function HangingLanternString({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const midX = (start[0] + end[0]) / 2;
  const midZ = (start[2] + end[2]) / 2;
  
  // Fairy lights along the line
  const fairyLightsCount = 6;
  const fairySpheres = [];
  for (let i = 1; i < fairyLightsCount; i++) {
    const pct = i / fairyLightsCount;
    const fx = start[0] + (end[0] - start[0]) * pct;
    const fz = start[2] + (end[2] - start[2]) * pct;
    const fy = 5.2 - Math.sin(pct * Math.PI) * 0.18;
    fairySpheres.push(
      <mesh key={i} position={[fx, fy - 0.05, fz]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#ffea75" emissive="#ffea75" emissiveIntensity={3.0} />
      </mesh>
    );
  }

  return (
    <group>
      {/* Connector String Wire */}
      <mesh position={[midX, 5.2, midZ]}>
        <boxGeometry args={[Math.sqrt((start[0]-end[0])**2 + (start[2]-end[2])**2), 0.02, 0.02]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Fairy Lights */}
      {fairySpheres}
      {/* Hanging Warm Light Sphere */}
      <mesh position={[midX, 4.8, midZ]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial color="#f7dc6f" emissive="#f7dc6f" emissiveIntensity={2.0} />
      </mesh>
      <pointLight position={[midX, 4.5, midZ]} color="#f7dc6f" intensity={1.5} distance={10} />
    </group>
  );
}

// ------------------------------------------------------------------
// PLAZA WOODEN BENCHES
// ------------------------------------------------------------------
function WoodenBench({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Seat panel */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.08, 0.55]} />
        <meshStandardMaterial color="#5c3a21" roughness={0.85} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.85, -0.24]} rotation={[0.1, 0, 0]} castShadow>
        <boxGeometry args={[1.6, 0.35, 0.06]} />
        <meshStandardMaterial color="#5c3a21" roughness={0.85} />
      </mesh>
      {/* Backrest metal supports */}
      <mesh position={[-0.6, 0.65, -0.22]}>
        <boxGeometry args={[0.04, 0.45, 0.04]} />
        <meshStandardMaterial color="#2d3e50" metalness={0.7} />
      </mesh>
      <mesh position={[0.6, 0.65, -0.22]}>
        <boxGeometry args={[0.04, 0.45, 0.04]} />
        <meshStandardMaterial color="#2d3e50" metalness={0.7} />
      </mesh>
      {/* Bench Legs */}
      <mesh position={[-0.7, 0.22, -0.2]} castShadow><boxGeometry args={[0.08, 0.44, 0.08]} /><meshStandardMaterial color="#1a252f" metalness={0.8} /></mesh>
      <mesh position={[0.7, 0.22, -0.2]} castShadow><boxGeometry args={[0.08, 0.44, 0.08]} /><meshStandardMaterial color="#1a252f" metalness={0.8} /></mesh>
      <mesh position={[-0.7, 0.22, 0.2]} castShadow><boxGeometry args={[0.08, 0.44, 0.08]} /><meshStandardMaterial color="#1a252f" metalness={0.8} /></mesh>
      <mesh position={[0.7, 0.22, 0.2]} castShadow><boxGeometry args={[0.08, 0.44, 0.08]} /><meshStandardMaterial color="#1a252f" metalness={0.8} /></mesh>
    </group>
  );
}

// ------------------------------------------------------------------
// POTTED PLANT / FLOWER PROP
// ------------------------------------------------------------------
function PottedPlant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Clay Pot */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.12, 0.4, 8]} />
        <meshStandardMaterial color="#b2593f" roughness={0.9} />
      </mesh>
      {/* Soil inside */}
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.04, 8]} />
        <meshStandardMaterial color="#301b0f" roughness={1.0} />
      </mesh>
      {/* Plant leaves */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <dodecahedronGeometry args={[0.22, 1]} />
        <meshStandardMaterial color="#27ae60" roughness={0.8} flatShading />
      </mesh>
      {/* Red flower bud */}
      <mesh position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.07, 6, 6]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.6} />
      </mesh>
    </group>
  );
}

// ------------------------------------------------------------------
// LOW-POLY NPC MODELS & ANIMATIONS
// ------------------------------------------------------------------
interface NPCProps {
  position: [number, number, number];
  type: "idle" | "walking" | "shopkeeper" | "carrier" | "kid";
  outfitColor?: string;
  waypoints?: [number, number][]; 
  speed?: number;
}

function NPCFarmer({ position, type, outfitColor = "#2471a3", waypoints = [], speed = 0.05 }: NPCProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);

  const currentWaypointIdx = useRef(0);
  const currentPos = useRef(new THREE.Vector3(...position));

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (!groupRef.current) return;

    if ((type === "walking" || type === "carrier" || type === "kid") && waypoints.length > 0) {
      const target = waypoints[currentWaypointIdx.current];
      const targetVec = new THREE.Vector3(target[0], position[1], target[1]);
      
      currentPos.current.lerp(targetVec, speed);
      groupRef.current.position.copy(currentPos.current);

      const angle = Math.atan2(targetVec.x - currentPos.current.x, targetVec.z - currentPos.current.z);
      if (Math.abs(targetVec.x - currentPos.current.x) > 0.1 || Math.abs(targetVec.z - currentPos.current.z) > 0.1) {
        groupRef.current.rotation.y = angle;
      } else {
        currentWaypointIdx.current = (currentWaypointIdx.current + 1) % waypoints.length;
      }

      const swingMultiplier = type === "kid" ? 9.5 : 6.5;
      const swing = Math.sin(t * swingMultiplier) * 0.45;
      if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;

      if (type === "carrier") {
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -1.0;
          leftArmRef.current.rotation.z = -0.3;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -1.0;
          rightArmRef.current.rotation.z = 0.3;
        }
      } else {
        if (leftArmRef.current) leftArmRef.current.rotation.x = -swing;
        if (rightArmRef.current) rightArmRef.current.rotation.x = swing;
      }
    } 
    else if (type === "shopkeeper") {
      const wave = Math.sin(t * 3.5) * 0.4 + 1.1;
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = wave;
        rightArmRef.current.rotation.x = Math.cos(t * 2.5) * 0.25;
      }
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 1.5) * 0.1;
      if (headRef.current) headRef.current.rotation.y = Math.sin(t * 1.2) * 0.2;
    } 
    else {
      const breath = Math.sin(t * 2.0) * 0.015;
      if (groupRef.current) groupRef.current.position.y = position[1] + breath;
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 1.8) * 0.08;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.cos(t * 1.8) * 0.08;
      if (headRef.current) headRef.current.rotation.y = Math.sin(t * 1.0) * 0.15;
    }
  });

  const scale = type === "kid" ? 0.62 : 1.0;

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Torso / Shirt */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.15, 0.7, 8]} />
        <meshStandardMaterial color={outfitColor} roughness={0.8} />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#fcd5b5" roughness={0.8} />
      </mesh>

      {/* Straw Hat */}
      <mesh position={[0, 1.42, 0]}>
        <coneGeometry args={[0.3, 0.12, 10]} />
        <meshStandardMaterial color="#d4ac0d" roughness={0.9} />
      </mesh>

      {/* Box carried in hands */}
      {type === "carrier" && (
        <mesh position={[0, 0.95, 0.32]} castShadow>
          <boxGeometry args={[0.4, 0.24, 0.3]} />
          <meshStandardMaterial color="#a04000" roughness={0.9} />
        </mesh>
      )}

      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-0.24, 0.9, 0]} rotation={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.05, 0.04, 0.5, 6]} />
        <meshStandardMaterial color={outfitColor} roughness={0.8} />
      </mesh>

      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[0.24, 0.9, 0]} rotation={[0, 0, -0.1]}>
        <cylinderGeometry args={[0.05, 0.04, 0.5, 6]} />
        <meshStandardMaterial color={outfitColor} roughness={0.8} />
      </mesh>

      {/* Left Leg */}
      <mesh ref={leftLegRef} position={[-0.1, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.6, 6]} />
        <meshStandardMaterial color="#212f3d" roughness={0.9} />
      </mesh>

      {/* Right Leg */}
      <mesh ref={rightLegRef} position={[0.1, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.6, 6]} />
        <meshStandardMaterial color="#212f3d" roughness={0.9} />
      </mesh>
    </group>
  );
}

// ------------------------------------------------------------------
// FIRST-PERSON CONTROLLER & PROXIMITY HOOK
// Handles WASD keys, looking with mouse drag, speed inertia, and head bob.
// ------------------------------------------------------------------
interface PlayerControlsProps {
  shops: Shop[];
  onNearShopChange: (shop: Shop | null) => void;
}

function PlayerControls({ shops, onNearShopChange }: PlayerControlsProps) {
  const movement = useMovement();
  const { camera, gl } = useThree();

  const velocity = useRef(new THREE.Vector3());
  const rotation = useRef({ yaw: 0, pitch: 0 });
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const walkCycle = useRef(0);

  const moveSpeed = 0.038;
  const damping = 0.85; 
  const boundaryLimit = 35;

  useEffect(() => {
    camera.position.y = 2.0;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;

      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      rotation.current.yaw -= deltaX * 0.0035;
      rotation.current.pitch = Math.max(
        -Math.PI / 4,
        Math.min(Math.PI / 4, rotation.current.pitch - deltaY * 0.003)
      );

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    const dom = gl.domElement;
    dom.addEventListener("pointerdown", handlePointerDown);
    dom.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      dom.removeEventListener("pointerdown", handlePointerDown);
      dom.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [camera, gl]);

  useFrame(() => {
    const forwardVec = new THREE.Vector3(
      -Math.sin(rotation.current.yaw),
      0,
      -Math.cos(rotation.current.yaw)
    ).normalize();

    const rightVec = new THREE.Vector3(
      Math.cos(rotation.current.yaw),
      0,
      -Math.sin(rotation.current.yaw)
    ).normalize();

    const accel = new THREE.Vector3();

    if (movement.forward) accel.addScaledVector(forwardVec, moveSpeed);
    if (movement.backward) accel.addScaledVector(forwardVec, -moveSpeed);
    if (movement.left) accel.addScaledVector(rightVec, -moveSpeed);
    if (movement.right) accel.addScaledVector(rightVec, moveSpeed);

    velocity.current.add(accel);
    velocity.current.multiplyScalar(damping);

    camera.position.add(velocity.current);

    const speedLen = new THREE.Vector2(velocity.current.x, velocity.current.z).length();
    if (speedLen > 0.01) {
      walkCycle.current += speedLen * 4.0;
      camera.position.y = 2.0 + Math.sin(walkCycle.current) * 0.07;
    } else {
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 2.0, 0.1);
    }

    camera.position.x = Math.max(-boundaryLimit, Math.min(boundaryLimit, camera.position.x));
    camera.position.z = Math.max(-boundaryLimit, Math.min(boundaryLimit, camera.position.z));

    const cameraRotation = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(rotation.current.pitch, rotation.current.yaw, 0, "YXZ")
    );
    camera.quaternion.slerp(cameraRotation, 0.15);

    let closest: Shop | null = null;
    let minDistance = 6.0;

    for (const shop of shops) {
      const dx = camera.position.x - shop.position_x;
      const dz = camera.position.z - shop.position_z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < minDistance) {
        minDistance = dist;
        closest = shop;
      }
    }

    onNearShopChange(closest);

    // Direct DOM Mutations on the High-Performance Radar Mini-Map
    const mapDot = document.getElementById("minimap-player-dot");
    if (mapDot) {
      const pctX = ((camera.position.x + 35) / 70) * 100;
      const pctZ = ((camera.position.z + 35) / 70) * 100;
      mapDot.style.left = `${pctX}%`;
      mapDot.style.top = `${pctZ}%`;
      mapDot.style.transform = `translate(-50%, -50%) rotate(${rotation.current.yaw * (180 / Math.PI)}deg)`;
    }
    const coordsText = document.getElementById("minimap-coords");
    if (coordsText) {
      coordsText.innerText = `X: ${camera.position.x.toFixed(1)} | Z: ${camera.position.z.toFixed(1)}`;
    }
  });

  return null;
}

// ------------------------------------------------------------------
// SMART MARKET NAVIGATION PATH (Glowing neon path to target shop)
// ------------------------------------------------------------------
function MarketNavigationPath({ targetX, targetZ }: { targetX: number; targetZ: number }) {
  const points = useMemo(() => {
    const count = 22;
    const pts = [];
    for (let i = 0; i <= count; i++) {
      const pct = i / count;
      const x = 0 + (targetX - 0) * pct;
      const z = 18 + (targetZ - 18) * pct;
      pts.push(new THREE.Vector3(x, 0.05, z));
    }
    return pts;
  }, [targetX, targetZ]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.children.forEach((child, idx) => {
        const opacity = 0.3 + Math.sin(t * 5.0 - idx * 0.4) * 0.4;
        (child as THREE.Mesh).scale.setScalar(0.7 + opacity * 0.5);
        if ((child as THREE.Mesh).material) {
          ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = Math.max(0.2, opacity);
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {points.map((pt, idx) => (
        <mesh key={idx} position={pt} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0, 0.18, 8]} />
          <meshBasicMaterial color="#00d084" transparent opacity={0.6} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// ------------------------------------------------------------------
// MAIN CANVAS CONTAINER
// Draws ground plane, dirt roads, ambient props, lights, and dome sky.
// ------------------------------------------------------------------
export default function MarketCanvas({
  shops,
  onShopClick,
  isNight = true,
  nearShop,
  onNearShopChange
}: MarketCanvasProps) {
  const terrainTexture = useProceduralTerrainTexture();
  const [targetShopId, setTargetShopId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const idStr = params.get("targetShopId");
      if (idStr) {
        setTargetShopId(parseInt(idStr));
      }
    }
  }, []);

  // Category colors mapping
  const getCategoryColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("seed")) return "#00d084"; // Agro green
    if (cat.includes("fertilizer")) return "#00b4d8"; // Cyan
    if (cat.includes("tool")) return "#f59e0b"; // Orange
    if (cat.includes("irrigation")) return "#a855f7"; // Purple
    if (cat.includes("feed")) return "#ec4899"; // Pink
    return "#10b981";
  };

  const ambientIntensity = isNight ? 0.22 : 0.55;
  const dirLightIntensity = isNight ? 0.38 : 1.15;

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        camera={{ position: [0, 2, 18], fov: 60 }}
        className="w-full h-full bg-[#020208]"
      >
        {/* Cinematic depth fog at night */}
        {isNight && <fogExp2 attach="fog" args={["#03020b", 0.012]} />}
        {!isNight && <fogExp2 attach="fog" args={["#110d0a", 0.008]} />}

        {/* Lights */}
        <ambientLight intensity={ambientIntensity} />
        
        {/* Sky / Ground hemisphere color reflection */}
        <hemisphereLight 
          args={[
            isNight ? "#413b5e" : "#ffeedd", 
            isNight ? "#14100e" : "#2f1f18", 
            isNight ? 0.65 : 0.95
          ]} 
        />
        
        {/* Sun/Moon lighting with custom soft shadow settings */}
        <directionalLight
          castShadow
          position={isNight ? [-12, 16, -8] : [18, 16, 12]}
          intensity={dirLightIntensity}
          color={isNight ? "#a5b4fc" : "#ffe4c4"} 
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={60}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          shadow-bias={-0.0005}
        />

        {/* Sunset/Night Sky Dome sphere */}
        <mesh scale={[-1, -1, -1]}>
          <sphereGeometry args={[75, 24, 24]} />
          <meshBasicMaterial
            side={THREE.BackSide}
            color={isNight ? "#03020c" : "#d35400"} 
          />
        </mesh>

        {/* Glowing Moon Sphere */}
        {isNight && (
          <group position={[-15, 22, -45]}>
            <mesh>
              <sphereGeometry args={[2.5, 16, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <pointLight intensity={3.5} distance={100} color="#a5b4fc" />
          </group>
        )}

        {/* Twinkling stars at night */}
        {isNight && <TwinklingStars />}

        {/* Floating Fireflies */}
        {isNight && <Fireflies />}

        {/* Flying Bats */}
        {isNight && <FlyingBats />}

        {/* Atmospheric Neon Point Lights */}
        {isNight && (
          <>
            <pointLight position={[-15, 3.5, -10]} intensity={1.8} distance={12} color="#00b4d8" />
            <pointLight position={[15, 3.5, -10]} intensity={1.8} distance={12} color="#00d084" />
            <pointLight position={[-20, 3.5, 15]} intensity={1.8} distance={12} color="#f59e0b" />
            <pointLight position={[20, 3.5, 15]} intensity={1.8} distance={12} color="#a855f7" />
            <pointLight position={[0, 3.5, -25]} intensity={1.8} distance={12} color="#ec4899" />
          </>
        )}

        {/* 1. Procedural ground floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          {terrainTexture ? (
            <meshStandardMaterial
              map={terrainTexture}
              roughness={0.9}
              metalness={0.05}
            />
          ) : (
            <meshStandardMaterial color="#1e1511" roughness={0.9} />
          )}
        </mesh>

        {/* Reflective Mud Puddles */}
        <MudPuddle position={[-5, 0.022, 6]} args={[2.0, 1.4]} />
        <MudPuddle position={[6, 0.022, -4]} args={[1.8, 1.8]} />
        <MudPuddle position={[-11, 0.022, -6]} args={[2.5, 1.5]} />
        <MudPuddle position={[13, 0.022, 8]} args={[1.5, 2.2]} />

        {/* 2. Dirt village roads crossing connecting the stalls */}
        {/* Central Plaza Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
          <ringGeometry args={[0, 6, 32]} />
          <meshStandardMaterial color="#30231b" roughness={0.9} />
        </mesh>

        {/* Road 1: Center to BioGrow Fertilizers [-15, 0, -10] */}
        <mesh rotation={[-Math.PI / 2, 0, Math.atan2(-10, -15)]} position={[-7.5, 0.015, -5]} receiveShadow>
          <planeGeometry args={[Math.sqrt(15**2 + 10**2), 3.2]} />
          <meshStandardMaterial color="#2d201a" roughness={0.95} />
        </mesh>

        {/* Road 2: Center to Astra Seeds [15, 0, -10] */}
        <mesh rotation={[-Math.PI / 2, 0, Math.atan2(-10, 15)]} position={[7.5, 0.015, -5]} receiveShadow>
          <planeGeometry args={[Math.sqrt(15**2 + 10**2), 3.2]} />
          <meshStandardMaterial color="#2d201a" roughness={0.95} />
        </mesh>

        {/* Road 3: Center to Kisan Equipments [-20, 0, 15] */}
        <mesh rotation={[-Math.PI / 2, 0, Math.atan2(15, -20)]} position={[-10, 0.015, 7.5]} receiveShadow>
          <planeGeometry args={[Math.sqrt(20**2 + 15**2), 3.2]} />
          <meshStandardMaterial color="#2d201a" roughness={0.95} />
        </mesh>

        {/* Road 4: Center to HydroFlow Systems [20, 0, 15] */}
        <mesh rotation={[-Math.PI / 2, 0, Math.atan2(15, 20)]} position={[10, 0.015, 7.5]} receiveShadow>
          <planeGeometry args={[Math.sqrt(20**2 + 15**2), 3.2]} />
          <meshStandardMaterial color="#2d201a" roughness={0.95} />
        </mesh>

        {/* Road 5: Center to NutriFeed Corner [0, 0, -25] */}
        <mesh rotation={[-Math.PI / 2, 0, Math.atan2(-25, 0)]} position={[0, 0.015, -12.5]} receiveShadow>
          <planeGeometry args={[25, 3.2]} />
          <meshStandardMaterial color="#2d201a" roughness={0.95} />
        </mesh>

        {/* 3. Vegetation border - low-poly trees */}
        <LowPolyTree position={[-25, 0, -20]} />
        <LowPolyTree position={[-32, 0, -5]} />
        <LowPolyTree position={[-28, 0, 8]} />
        <LowPolyTree position={[-30, 0, 25]} />
        
        <LowPolyTree position={[28, 0, -18]} />
        <LowPolyTree position={[32, 0, -2]} />
        <LowPolyTree position={[26, 0, 12]} />
        <LowPolyTree position={[29, 0, 28]} />

        <LowPolyTree position={[10, 0, -32]} />
        <LowPolyTree position={[-12, 0, -30]} />
        <LowPolyTree position={[0, 0, 32]} />
        <LowPolyTree position={[-15, 0, 32]} />
        <LowPolyTree position={[18, 0, 30]} />

        {/* 4. Rural decoration props */}
        {/* Carts */}
        <WoodenCart position={[-3, 0, 3]} rotationY={0.6} />
        <WoodenCart position={[5, 0, -3]} rotationY={-0.8} />

        {/* Wooden Benches */}
        <WoodenBench position={[-4.5, 0, 2]} rotationY={1.1} />
        <WoodenBench position={[4.5, 0, -2]} rotationY={-0.9} />

        {/* Potted Plants at Storefront entries */}
        <PottedPlant position={[-13.5, 0, -8]} />
        <PottedPlant position={[13.5, 0, -8]} />
        <PottedPlant position={[-18.5, 0, 17]} />
        <PottedPlant position={[18.5, 0, 17]} />
        <PottedPlant position={[-1.8, 0, -23]} />
        <PottedPlant position={[1.8, 0, -23]} />

        {/* Crates and sacks clusters */}
        <MarketCrates position={[3, 0, 4]} />
        <MarketCrates position={[-6, 0, -5]} />
        <MarketCrates position={[12, 0, 8]} />

        {/* Light poles running ambient hanging wires */}
        <mesh position={[-6, 0, -6]} castShadow><cylinderGeometry args={[0.08, 0.1, 5.0, 6]} /><meshStandardMaterial color="#4a2e1b" /></mesh>
        <mesh position={[6, 0, -6]} castShadow><cylinderGeometry args={[0.08, 0.1, 5.0, 6]} /><meshStandardMaterial color="#4a2e1b" /></mesh>
        <HangingLanternString start={[-6, 5, -6]} end={[6, 5, -6]} />
        <MarketBuntings start={[-6, 5, -6]} end={[6, 5, -6]} />

        <mesh position={[-6, 0, 6]} castShadow><cylinderGeometry args={[0.08, 0.1, 5.0, 6]} /><meshStandardMaterial color="#4a2e1b" /></mesh>
        <mesh position={[6, 0, 6]} castShadow><cylinderGeometry args={[0.08, 0.1, 5.0, 6]} /><meshStandardMaterial color="#4a2e1b" /></mesh>
        <HangingLanternString start={[-6, 5, 6]} end={[6, 5, 6]} />
        <MarketBuntings start={[-6, 5, 6]} end={[6, 5, 6]} />

        {/* 5. Realistic Street Lights (Lamps that cast pools of light over stalls & NPCs) */}
        {/* Central Plaza Lights */}
        <StreetLight position={[-4, 0, 4]} isNight={isNight} />
        <StreetLight position={[4, 0, -4]} isNight={isNight} />

        {/* Store Front Street Lights */}
        <StreetLight position={[-11, 0, -7]} isNight={isNight} />  
        <StreetLight position={[11, 0, -7]} isNight={isNight} />   
        <StreetLight position={[-16, 0, 11]} isNight={isNight} />   
        <StreetLight position={[16, 0, 11]} isNight={isNight} />    
        <StreetLight position={[0, 0, -20]} isNight={isNight} />    

        {/* 6. Village Spotted Cow and Golden Dog */}
        <SpottedCow position={[-9, 0, 2]} rotationY={0.9} />
        <GoldenDog position={[3, 0, -2]} rotationY={-0.6} />

        {/* 7. Animated NPCs */}
        {/* Shopkeepers standing directly behind or in front of counters */}
        <NPCFarmer position={[-15, 0, -8]} type="shopkeeper" outfitColor="#8e44ad" /> 
        <NPCFarmer position={[15, 0, -8]} type="shopkeeper" outfitColor="#27ae60" /> 
        <NPCFarmer position={[-20, 0, 17]} type="shopkeeper" outfitColor="#e67e22" /> 
        <NPCFarmer position={[20, 0, 17]} type="shopkeeper" outfitColor="#2980b9" /> 
        <NPCFarmer position={[0, 0, -23]} type="shopkeeper" outfitColor="#c0392b" /> 

        {/* Idle/chatting groups in the plaza */}
        <NPCFarmer position={[-2, 0, -1]} type="idle" outfitColor="#d35400" />
        <NPCFarmer position={[2, 0, -2]} type="idle" outfitColor="#16a085" />
        <NPCFarmer position={[0, 0, 1.5]} type="idle" outfitColor="#5b2c6f" />

        {/* Carriers carrying boxes/sacks back and forth */}
        <NPCFarmer 
          position={[-10, 0, -12]} 
          type="carrier" 
          outfitColor="#a04000" 
          waypoints={[[-12, -14], [-3, -15], [-12, -12]]} 
          speed={0.03} 
        />
        <NPCFarmer 
          position={[10, 0, 12]} 
          type="carrier" 
          outfitColor="#1f618d" 
          waypoints={[[14, 15], [3, 10], [12, 12]]} 
          speed={0.025} 
        />

        {/* Walking villagers pacing on paths */}
        <NPCFarmer 
          position={[-6, 0, 5]} 
          type="walking" 
          outfitColor="#2980b9" 
          waypoints={[[-12, 5], [3, 10], [-1, -3], [-8, 2]]} 
          speed={0.035} 
        />
        <NPCFarmer 
          position={[8, 0, -6]} 
          type="walking" 
          outfitColor="#7f8c8d" 
          waypoints={[[12, -8], [0, -15], [7, 2], [10, -5]]} 
          speed={0.028} 
        />

        {/* Running kids in the village square */}
        <NPCFarmer 
          position={[2, 0, 5]} 
          type="kid" 
          outfitColor="#e74c3c" 
          waypoints={[[2, 5], [5, 2], [2, -1], [-1, 2]]} 
          speed={0.045} 
        />

        {/* 8. Render Shop Stalls */}
        {shops.map((shop) => (
          <ShopStructure
            key={shop.id}
            id={shop.id}
            name={shop.name}
            category={shop.category}
            position={[shop.position_x, 0, shop.position_z]}
            color={getCategoryColor(shop.category)}
            isHighlighted={nearShop?.id === shop.id || targetShopId === shop.id}
            isRecommended={targetShopId === shop.id}
            onClick={() => onShopClick(shop)}
          />
        ))}

        {/* Smart Navigation Path guide */}
        {targetShopId && (() => {
          const targetShop = shops.find(s => s.id === targetShopId);
          return targetShop ? (
            <MarketNavigationPath 
              targetX={targetShop.position_x} 
              targetZ={targetShop.position_z} 
            />
          ) : null;
        })()}

        {/* First Person Controls script hook */}
        <PlayerControls 
          shops={shops} 
          onNearShopChange={onNearShopChange} 
        />
      </Canvas>

      {/* Center crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-10 flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-white/40 rounded-full border border-black/35" />
      </div>
    </div>
  );
}
