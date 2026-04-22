'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * A meaningful tech constellation: a wireframe sphere (globe) at center
 * with orbiting labeled nodes representing tech domains,
 * connected by glowing lines — representing the user's engineering universe.
 */
const TechConstellation = ({ position = [0, 0, 0] as [number, number, number] }) => {
  const groupRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const sphereMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const nodes = useMemo(() => [
    { label: 'CLOUD', angle: 0, radius: 4.5, speed: 0.15, color: '#00f0ff', yOffset: 0.5 },
    { label: 'AI', angle: Math.PI * 0.4, radius: 3.8, speed: 0.2, color: '#ff00aa', yOffset: -0.3 },
    { label: 'REACT', angle: Math.PI * 0.8, radius: 4.2, speed: 0.12, color: '#44ffaa', yOffset: 0.8 },
    { label: 'PYTHON', angle: Math.PI * 1.2, radius: 5, speed: 0.18, color: '#8844ff', yOffset: -0.6 },
    { label: 'APIs', angle: Math.PI * 1.6, radius: 3.5, speed: 0.22, color: '#0088ff', yOffset: 0.2 },
  ], []);

  const nodeRefs = useRef<(THREE.Group | null)[]>([]);

  // Store node positions for connection lines
  const nodePositions = useRef<THREE.Vector3[]>(nodes.map(() => new THREE.Vector3()));

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Rotate main globe slowly
    if (sphereRef.current) {
      sphereRef.current.rotation.y = time * 0.08;
      sphereRef.current.rotation.x = Math.sin(time * 0.05) * 0.15;
    }

    // Color pulse on the globe
    if (sphereMatRef.current) {
      const hue = 0.52 + Math.sin(time * 0.2) * 0.05;
      sphereMatRef.current.color.setHSL(hue, 0.8, 0.5);
      sphereMatRef.current.opacity = 0.08 + 0.03 * Math.sin(time * 0.5);
    }

    // Orbit the nodes
    nodes.forEach((node, i) => {
      const nodeGroup = nodeRefs.current[i];
      if (!nodeGroup) return;

      const angle = node.angle + time * node.speed;
      const x = Math.cos(angle) * node.radius;
      const z = Math.sin(angle) * node.radius;
      const y = node.yOffset + Math.sin(time * 0.5 + i) * 0.4;

      nodeGroup.position.set(x, y, z);
      nodePositions.current[i].set(x, y, z);
    });

    // Slow rotation of the whole constellation
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Central wireframe globe */}
      <mesh ref={sphereRef}>
        <icosahedronGeometry args={[2.2, 2]} />
        <meshBasicMaterial
          ref={sphereMatRef}
          wireframe
          transparent
          opacity={0.1}
          color="#00f0ff"
          depthWrite={false}
        />
      </mesh>

      {/* Inner solid core glow */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Orbiting tech nodes */}
      {nodes.map((node, i) => (
        <group
          key={i}
          ref={(el) => { nodeRefs.current[i] = el; }}
        >
          {/* Node dot */}
          <mesh>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshBasicMaterial
              color={node.color}
              transparent
              opacity={0.8}
              depthWrite={false}
            />
          </mesh>
          {/* Outer ring around node */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.2, 0.01, 8, 32]} />
            <meshBasicMaterial color={node.color} transparent opacity={0.4} depthWrite={false} />
          </mesh>
          {/* Node label */}
          <Text
            font="./Vercetti-Regular.woff"
            fontSize={0.22}
            color={node.color}
            anchorX="center"
            anchorY="bottom"
            position={[0, 0.35, 0]}
            fillOpacity={0.7}
          >
            {node.label}
          </Text>
        </group>
      ))}

      {/* Outer orbit rings for visual structure */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4, 0.008, 8, 80]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.08} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2.5, 0.3, 0]}>
        <torusGeometry args={[4.5, 0.006, 8, 80]} />
        <meshBasicMaterial color="#ff00aa" transparent opacity={0.06} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 3, -0.5, 0.2]}>
        <torusGeometry args={[5, 0.005, 8, 80]} />
        <meshBasicMaterial color="#8844ff" transparent opacity={0.05} depthWrite={false} />
      </mesh>
    </group>
  );
};

export default TechConstellation;
