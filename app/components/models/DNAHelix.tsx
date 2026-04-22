'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * A DNA-like double helix structure that spirals and pulses,
 * made of small glowing spheres connected by lines.
 */
const DNAHelix = ({ position = [0, 0, 0] as [number, number, number], height = 20, segments = 60 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef1 = useRef<THREE.InstancedMesh>(null);
  const meshRef2 = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (!meshRef1.current || !meshRef2.current) return;

    for (let i = 0; i < segments; i++) {
      const t = (i / segments) * Math.PI * 4; // 2 full turns
      const y = (i / segments) * height - height / 2;
      const radius = 1.5 + Math.sin(time * 0.5 + i * 0.1) * 0.3;

      // Strand 1
      const x1 = Math.cos(t + time * 0.3) * radius;
      const z1 = Math.sin(t + time * 0.3) * radius;
      dummy.position.set(x1, y, z1);
      const scale1 = 0.08 + 0.04 * Math.sin(time * 3 + i * 0.2);
      dummy.scale.setScalar(scale1);
      dummy.updateMatrix();
      meshRef1.current.setMatrixAt(i, dummy.matrix);

      // Strand 2 (offset by PI)
      const x2 = Math.cos(t + Math.PI + time * 0.3) * radius;
      const z2 = Math.sin(t + Math.PI + time * 0.3) * radius;
      dummy.position.set(x2, y, z2);
      const scale2 = 0.08 + 0.04 * Math.sin(time * 3 + i * 0.2 + Math.PI);
      dummy.scale.setScalar(scale2);
      dummy.updateMatrix();
      meshRef2.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef1.current.instanceMatrix.needsUpdate = true;
    meshRef2.current.instanceMatrix.needsUpdate = true;

    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <instancedMesh ref={meshRef1} args={[undefined, undefined, segments]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.8} />
      </instancedMesh>
      <instancedMesh ref={meshRef2} args={[undefined, undefined, segments]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#ff00aa" transparent opacity={0.8} />
      </instancedMesh>
    </group>
  );
};

export default DNAHelix;
