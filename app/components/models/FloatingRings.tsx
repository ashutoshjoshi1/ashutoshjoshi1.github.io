'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Abstract orbital rings with varying geometries and smooth motions.
 */
const FloatingRings = ({ position = [0, 0, 0] as [number, number, number] }) => {
  const groupRef = useRef<THREE.Group>(null);
  const rings = useMemo(() => [
    { radius: 5, tube: 0.025, color: '#00f0ff', speed: 0.2, tilt: 0.2, segments: 100 },
    { radius: 7, tube: 0.018, color: '#ff00aa', speed: -0.15, tilt: -0.5, segments: 80 },
    { radius: 9, tube: 0.012, color: '#8844ff', speed: 0.1, tilt: 0.8, segments: 120 },
    { radius: 4, tube: 0.03, color: '#44ffaa', speed: -0.25, tilt: 1.2, segments: 60 },
    { radius: 11, tube: 0.01, color: '#ff00aa', speed: 0.08, tilt: -0.3, segments: 140 },
    { radius: 6, tube: 0.02, color: '#0088ff', speed: 0.18, tilt: 0.6, segments: 90 },
    { radius: 13, tube: 0.008, color: '#00f0ff', speed: -0.06, tilt: -0.9, segments: 160 },
  ], []);

  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    ringRefs.current.forEach((ring, i) => {
      if (!ring) return;
      const config = rings[i];

      // Smooth orbital motion
      ring.rotation.x = config.tilt + time * config.speed * 0.4;
      ring.rotation.y = time * config.speed;
      ring.rotation.z = Math.sin(time * config.speed * 0.2 + i) * 0.3;

      // Smooth pulsing opacity
      const mat = ring.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.1 + 0.08 * Math.sin(time * 1.2 + i * 1.5);
    });

    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.015;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {rings.map((ring, i) => (
        <mesh
          key={i}
          ref={(el) => { ringRefs.current[i] = el; }}
        >
          <torusGeometry args={[ring.radius, ring.tube, 16, ring.segments]} />
          <meshBasicMaterial
            color={ring.color}
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};

export default FloatingRings;
