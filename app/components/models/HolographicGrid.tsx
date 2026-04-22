'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * An infinite-feeling holographic grid floor that pulses with energy lines,
 * creating a Tron-like/cyberpunk ground plane effect.
 */
const HolographicGrid = ({ position = [0, -12, 0] as [number, number, number] }) => {
  const gridRef = useRef<THREE.GridHelper>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (gridRef.current) {
      // Slow drift to create a sense of motion
      gridRef.current.position.z = (time * 0.5) % 2;

      // Subtle breathing
      const mat = gridRef.current.material as THREE.Material;
      if (mat) {
        mat.opacity = 0.12 + 0.04 * Math.sin(time * 0.5);
      }
    }

    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.03 + 0.015 * Math.sin(time * 0.3);
    }
  });

  return (
    <group position={position} rotation={[0, 0, 0]}>
      {/* Grid lines */}
      <gridHelper
        ref={gridRef}
        args={[100, 60, '#00f0ff', '#1a1a3a']}
        rotation={[0, 0, 0]}
        material-transparent={true}
        material-opacity={0.12}
        material-depthWrite={false}
      />

      {/* Glow plane underneath */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.03}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

export default HolographicGrid;
