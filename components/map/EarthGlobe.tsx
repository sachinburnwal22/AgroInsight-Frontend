"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function Globe() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group>
      {/* Inner glowing core */}
      <Sphere args={[2.4, 32, 32]}>
        <meshBasicMaterial color="#0f172a" />
      </Sphere>
      
      {/* Outer tech wireframe */}
      <Sphere ref={meshRef} args={[2.45, 64, 64]}>
        <meshStandardMaterial 
          color="#00D084" 
          wireframe 
          transparent 
          opacity={0.3} 
          emissive="#00D084"
          emissiveIntensity={0.5}
        />
      </Sphere>

      {/* Atmospheric glow */}
      <Sphere args={[2.7, 32, 32]}>
        <meshBasicMaterial 
          color="#00B4D8" 
          transparent 
          opacity={0.05} 
          side={THREE.BackSide} 
          blending={THREE.AdditiveBlending} 
        />
      </Sphere>
    </group>
  );
}

export default function EarthGlobe() {
  return (
    <div className="w-full h-[400px] cursor-grab active:cursor-grabbing bg-[#0f0f2e]">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00B4D8" />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={0.5} 
          maxPolarAngle={Math.PI / 2} 
          minPolarAngle={Math.PI / 3}
        />
        <Globe />
      </Canvas>
    </div>
  );
}
