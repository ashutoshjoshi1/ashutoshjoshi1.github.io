'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * A morphing wireframe torus knot that slowly transforms
 * with a dual-layer effect for more visual depth.
 */
const MorphingTorus = ({ position = [0, 0, 0] as [number, number, number] }) => {
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const innerMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const outerMatRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (innerRef.current) {
      innerRef.current.rotation.x = time * 0.12;
      innerRef.current.rotation.y = time * 0.08;
      innerRef.current.rotation.z = Math.sin(time * 0.06) * 0.5;
      const breathe = 1 + Math.sin(time * 0.25) * 0.08;
      innerRef.current.scale.setScalar(breathe);
    }

    if (outerRef.current) {
      outerRef.current.rotation.x = -time * 0.06;
      outerRef.current.rotation.y = time * 0.1;
      outerRef.current.rotation.z = Math.cos(time * 0.04) * 0.3;
      const breathe = 1.15 + Math.sin(time * 0.2 + 1) * 0.1;
      outerRef.current.scale.setScalar(breathe);
    }

    // Color cycling
    if (innerMatRef.current) {
      const hue = (0.52 + Math.sin(time * 0.15) * 0.12);
      innerMatRef.current.color.setHSL(hue, 0.9, 0.55);
    }
    if (outerMatRef.current) {
      const hue = (0.85 + Math.sin(time * 0.12 + 2) * 0.1);
      outerMatRef.current.color.setHSL(hue, 0.9, 0.5);
    }
  });

  return (
    <group position={position}>
      {/* Inner torus knot */}
      <mesh ref={innerRef}>
        <torusKnotGeometry args={[3, 0.8, 128, 16, 2, 3]} />
        <meshBasicMaterial
          ref={innerMatRef}
          wireframe
          transparent
          opacity={0.12}
          color="#00f0ff"
          depthWrite={false}
        />
      </mesh>
      {/* Outer torus knot - counter-rotating for depth */}
      <mesh ref={outerRef}>
        <torusKnotGeometry args={[4, 0.5, 96, 12, 3, 5]} />
        <meshBasicMaterial
          ref={outerMatRef}
          wireframe
          transparent
          opacity={0.06}
          color="#ff00aa"
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export default MorphingTorus;
