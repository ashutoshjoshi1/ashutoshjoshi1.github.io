'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const HolographicParticles = ({ count = 800, radius = 30 }: { count?: number; radius?: number }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorArray = useMemo(() => {
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#00f0ff'),
      new THREE.Color('#ff00aa'),
      new THREE.Color('#8844ff'),
      new THREE.Color('#44ffaa'),
      new THREE.Color('#0088ff'),
    ];
    for (let i = 0; i < count; i++) {
      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    return colors;
  }, [count]);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.3 + Math.random() * 0.7);
      temp.push({
        position: new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        ),
        speed: 0.1 + Math.random() * 0.4,
        offset: Math.random() * Math.PI * 2,
        scale: 0.015 + Math.random() * 0.05,
      });
    }
    return temp;
  }, [count, radius]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    particles.forEach((particle, i) => {
      const { position, speed, offset, scale } = particle;

      // Smooth flowing motion with multiple sine waves
      const x = position.x + Math.sin(time * speed + offset) * 0.8 + Math.cos(time * speed * 0.3) * 0.3;
      const y = position.y + Math.cos(time * speed * 0.5 + offset) * 0.5 + Math.sin(time * 0.15) * 1.5;
      const z = position.z + Math.sin(time * speed * 0.4 + offset * 2) * 0.6;

      dummy.position.set(x, y, z);
      const pulseScale = scale * (0.4 + 0.6 * Math.sin(time * 1.5 + offset));
      dummy.scale.setScalar(Math.max(0.001, pulseScale));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshBasicMaterial
        transparent
        opacity={0.5}
        depthWrite={false}
        vertexColors
      />
      <instancedBufferAttribute attach="geometry-attributes-color" args={[colorArray, 3]} />
    </instancedMesh>
  );
};

export default HolographicParticles;
