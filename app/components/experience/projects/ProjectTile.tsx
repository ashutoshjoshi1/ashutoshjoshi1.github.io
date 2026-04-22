import { Edges, Text, TextProps } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from "three";

import { usePortalStore } from "@stores";
import { Project } from "@types";

interface ProjectTileProps {
  project: Project;
  index: number;
  position: [number, number, number];
  rotation: [number, number, number];
  activeId: number | null;
  onClick: () => void;
}

const ProjectTile = ({ project, index, position, rotation, activeId, onClick }: ProjectTileProps) => {
  const projectRef = useRef<THREE.Group>(null);
  const hoverAnimRef = useRef<gsap.core.Timeline | null>(null);
  const [hovered, setHovered] = useState(false);
  const isProjectSectionActive = usePortalStore((state) => state.activePortalId === "projects");

  const titleProps = useMemo(() => ({
    font: "./soria-font.ttf",
    color: "#00f0ff",
  }), []);

  const subtitleProps: Partial<TextProps> = useMemo(() => ({
    font: "./Vercetti-Regular.woff",
    color: "#e0e0ff",
    anchorX: "left",
    anchorY: "top",
  }), []);

  useEffect(() => {
    if (!projectRef.current) return;
    hoverAnimRef.current?.kill();

    const [mesh, title, dateGroup, textBox, button] = projectRef.current.children;

    hoverAnimRef.current = gsap.timeline({ defaults: { duration: 0.5, ease: 'power2.out' } });
    hoverAnimRef.current
      .to(projectRef.current.position, { z: hovered ? 1 : 0, duration: 0.3 }, 0)
      .to(projectRef.current.position, { y: hovered ? 0.3 : 0 }, 0)
      .to(projectRef.current.scale, {
        x: hovered ? 1.2 : 1,
        y: hovered ? 1.2 : 1,
        z: hovered ? 1.2 : 1,
      }, 0)
      .to(title.position, { y: hovered ? 0.5 : -0.55 }, 0)
      .to(textBox.position, { y: hovered ? 0.5 : 0 }, 0)
      .to(textBox, { fillOpacity: hovered ? 1 : 0, duration: 0.5 }, 0)
      .to(dateGroup.position, { y: hovered ? 2 : 1 }, 0)
      .to(mesh.scale, { y: hovered ? 1.8 : 1 }, 0)
      .to((mesh as THREE.Mesh).material, { opacity: hovered ? 0.95 : 0.8 }, 0)
      .to(mesh.position, { y: hovered ? 0.7 : 0 }, 0);

    if (project.url) {
      hoverAnimRef.current
        .to(button.scale, { y: hovered ? 1 : 0, x: hovered ? 1 : 0 }, 0)
        .to(button.position, { z: hovered ? 0.3 : -1 }, 0);
    }
  }, [hovered]);

  useEffect(() => {
    if (isMobile) {
      setHovered(activeId === index);
    }
  }, [isMobile, activeId]);

  useEffect(() => {
    if (projectRef.current) {
      gsap.to(projectRef.current.position, {
        y: isProjectSectionActive ? 0 : -10,
        duration: 1,
        delay: isProjectSectionActive ? index * 0.1 : 0,
      });
    }
  }, [isProjectSectionActive]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!project.url) return;
    const button = e.eventObject;
    gsap.to(button.position, { z: 0, duration: 0.1 })
      .then(() => gsap.to(button.position, { z: 0.3, duration: 0.3 }));
    setTimeout(() => window.open(project.url, '_blank'), 50);
  };

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={onClick}
      onPointerOver={() => !isMobile && isProjectSectionActive && setHovered(true)}
      onPointerOut={() => !isMobile && isProjectSectionActive && setHovered(false)}>
      <group ref={projectRef}>
        <mesh>
          <planeGeometry args={[3.2, 1.6, 1]} />
          <meshBasicMaterial color="#080818" transparent opacity={0.8}/>
          <Edges color="#00f0ff" lineWidth={1.5} />
        </mesh>
        <Text
          {...titleProps}
          position={[-1.4, -0.55, 0.101]}
          anchorX="left"
          anchorY="bottom"
          maxWidth={3}
          fontSize={0.5}>
          {project.title}
        </Text>
        <group position={[-0.9, 1, 0.01]}>
          <mesh>
            <planeGeometry args={[1.2, 0.28, 1]} />
            <meshBasicMaterial color="#ff00aa" opacity={0} wireframe />
            <Edges color="#ff00aa" lineWidth={1} />
          </mesh>
          <Text
            {...subtitleProps}
            color="#ff00aa"
            position={[-0.5, 0.12, 0]}
            fontSize={0.18}>
            {project.date.toUpperCase()}
          </Text>
        </group>
        <Text
          {...subtitleProps}
          maxWidth={2.8}
          position={[-1.4, 1.8, 0.1]}
          fontSize={0.14}>
          {project.subtext}
        </Text>
        {project.url && (
          <group
            position={[0.9, -0.45, -1]}
            scale={[0, 0, 1]}
            onClick={handleClick}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}>
            <mesh>
              <boxGeometry args={[0.9, 0.3, 0.15]} />
              <meshBasicMaterial color="#00f0ff" transparent opacity={0.8} />
              <Edges color="#00f0ff" lineWidth={1} />
            </mesh>
            <Text
              {...subtitleProps}
              color="#050510"
              position={[-0.32, 0.12, 0.15]}
              fontSize={0.18}>
              VIEW ↗
            </Text>
          </group>
        )}
      </group>
    </group>
  );
};

export default ProjectTile;