'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * A luminous abstract nebula made of layered translucent planes
 * that slowly shift color and position, creating an aurora/gas-cloud feel.
 */
const AbstractNebula = ({ position = [0, 0, 0] as [number, number, number] }) => {
  const groupRef = useRef<THREE.Group>(null);

  const layers = useMemo(() => [
    { color: new THREE.Color('#00f0ff'), size: 18, opacity: 0.04, speed: 0.08, yOffset: 0, rotSpeed: 0.02 },
    { color: new THREE.Color('#8844ff'), size: 22, opacity: 0.035, speed: 0.06, yOffset: 2, rotSpeed: -0.015 },
    { color: new THREE.Color('#ff00aa'), size: 15, opacity: 0.03, speed: 0.1, yOffset: -1, rotSpeed: 0.025 },
    { color: new THREE.Color('#0066ff'), size: 20, opacity: 0.025, speed: 0.07, yOffset: 3, rotSpeed: -0.01 },
    { color: new THREE.Color('#ff44cc'), size: 16, opacity: 0.04, speed: 0.09, yOffset: -2, rotSpeed: 0.018 },
    { color: new THREE.Color('#44ffaa'), size: 14, opacity: 0.03, speed: 0.11, yOffset: 1.5, rotSpeed: -0.02 },
  ], []);

  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const layer = layers[i];

      // Gentle flowing motion
      mesh.position.y = layer.yOffset + Math.sin(time * layer.speed + i * 1.5) * 3;
      mesh.position.x = Math.sin(time * layer.speed * 0.7 + i * 2) * 4;
      mesh.position.z = Math.cos(time * layer.speed * 0.5 + i) * 2;

      // Slow rotation for organic feel
      mesh.rotation.x = time * layer.rotSpeed + i * 0.5;
      mesh.rotation.y = time * layer.rotSpeed * 0.7;
      mesh.rotation.z = Math.sin(time * 0.1 + i) * 0.3;

      // Breathing opacity
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = layer.opacity * (0.6 + 0.4 * Math.sin(time * 0.5 + i * 1.2));

      // Gentle scale pulsing
      const scale = 1 + Math.sin(time * 0.3 + i * 0.8) * 0.15;
      mesh.scale.setScalar(scale);
    });

    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.008;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {layers.map((layer, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el; }}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
        >
          <planeGeometry args={[layer.size, layer.size, 1]} />
          <meshBasicMaterial
            color={layer.color}
            transparent
            opacity={layer.opacity}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
};

export default AbstractNebula;
