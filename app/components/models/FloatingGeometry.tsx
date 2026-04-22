'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * A cluster of abstract geometric shapes (dodecahedrons, octahedrons, icosahedrons)
 * drifting slowly through space with rotations and subtle scale pulsing.
 */
const FloatingGeometry = ({ position = [0, 0, 0] as [number, number, number] }) => {
  const groupRef = useRef<THREE.Group>(null);

  const shapes = useMemo(() => {
    const items = [];
    const geometries = ['dodecahedron', 'octahedron', 'icosahedron', 'tetrahedron'] as const;
    const colors = ['#00f0ff', '#ff00aa', '#8844ff', '#44ffaa', '#ff6600', '#0088ff'];

    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const radius = 8 + Math.random() * 12;
      items.push({
        geometry: geometries[i % geometries.length],
        color: colors[i % colors.length],
        position: new THREE.Vector3(
          Math.cos(angle) * radius + (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 15,
          Math.sin(angle) * radius + (Math.random() - 0.5) * 5
        ),
        scale: 0.1 + Math.random() * 0.25,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.3,
          y: (Math.random() - 0.5) * 0.3,
          z: (Math.random() - 0.5) * 0.2,
        },
        floatSpeed: 0.2 + Math.random() * 0.5,
        floatOffset: Math.random() * Math.PI * 2,
        opacity: 0.15 + Math.random() * 0.25,
      });
    }
    return items;
  }, []);

  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const shape = shapes[i];

      // Indie floating motion
      mesh.position.y = shape.position.y + Math.sin(time * shape.floatSpeed + shape.floatOffset) * 1.5;
      mesh.position.x = shape.position.x + Math.sin(time * shape.floatSpeed * 0.3 + shape.floatOffset) * 0.5;

      // Smooth rotation
      mesh.rotation.x += shape.rotationSpeed.x * 0.01;
      mesh.rotation.y += shape.rotationSpeed.y * 0.01;
      mesh.rotation.z += shape.rotationSpeed.z * 0.01;

      // Breathing scale
      const breathe = shape.scale * (0.85 + 0.15 * Math.sin(time * 0.8 + shape.floatOffset));
      mesh.scale.setScalar(breathe);
    });

    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.01;
    }
  });

  const getGeometry = (type: string) => {
    switch (type) {
      case 'dodecahedron': return <dodecahedronGeometry args={[1, 0]} />;
      case 'octahedron': return <octahedronGeometry args={[1, 0]} />;
      case 'icosahedron': return <icosahedronGeometry args={[1, 0]} />;
      case 'tetrahedron': return <tetrahedronGeometry args={[1, 0]} />;
      default: return <dodecahedronGeometry args={[1, 0]} />;
    }
  };

  return (
    <group ref={groupRef} position={position}>
      {shapes.map((shape, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el; }}
          position={shape.position}
          scale={shape.scale}
        >
          {getGeometry(shape.geometry)}
          <meshBasicMaterial
            color={shape.color}
            wireframe
            transparent
            opacity={shape.opacity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};

export default FloatingGeometry;
