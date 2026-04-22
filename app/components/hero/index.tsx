'use client';

import { Text } from "@react-three/drei";
import { useProgress } from "@react-three/drei";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import StarsContainer from "../models/Stars";
import WindowModel from "../models/WindowModel";
import TextWindow from "./TextWindow";
import HolographicParticles from "../models/HolographicParticles";
import FloatingRings from "../models/FloatingRings";
import DNAHelix from "../models/DNAHelix";
import AbstractNebula from "../models/AbstractNebula";
import FloatingGeometry from "../models/FloatingGeometry";
import TechConstellation from "../models/TechConstellation";

const Hero = () => {
  const titleRef = useRef<THREE.Mesh>(null);
  const subtitleRef = useRef<THREE.Mesh>(null);
  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100 && titleRef.current) {
      gsap.fromTo(titleRef.current.position, {
        y: -10,
      }, {
        y: 2,
        duration: 2.5,
        ease: "power3.out",
      });
      gsap.fromTo(titleRef.current, {
        fillOpacity: 0,
      }, {
        fillOpacity: 1,
        duration: 2,
        delay: 0.8,
        ease: "power2.inOut",
      });
    }
    if (progress === 100 && subtitleRef.current) {
      gsap.fromTo(subtitleRef.current.position, {
        y: -12,
      }, {
        y: 0.5,
        duration: 2.5,
        delay: 0.2,
        ease: "power3.out",
      });
      gsap.fromTo(subtitleRef.current, {
        fillOpacity: 0,
      }, {
        fillOpacity: 0.7,
        duration: 2,
        delay: 1.2,
        ease: "power2.inOut",
      });
    }
  }, [progress]);

  const fontProps = {
    font: "./soria-font.ttf",
    fontSize: 1.4,
  };

  return (
    <>
      {/* Main title */}
      <Text
        position={[0, 2, -10]}
        {...fontProps}
        ref={titleRef}
        color="#00f0ff"
        fillOpacity={0}
      >
        ASHUTOSH JOSHI
      </Text>

      {/* Subtitle */}
      <Text
        position={[0, 0.5, -10]}
        font="./Vercetti-Regular.woff"
        fontSize={0.35}
        ref={subtitleRef}
        color="#ffffff"
        fillOpacity={0}
        letterSpacing={0.3}
      >
        SOFTWARE ENGINEER  ·  FULL-STACK  ·  AI  ·  CLOUD
      </Text>

      {/* Star field background */}
      <StarsContainer />

      {/* === MEANINGFUL CENTERPIECE: Tech Constellation === */}
      {/* A wireframe globe with orbiting tech-domain nodes */}
      <TechConstellation position={[0, -3, -8]} />

      {/* === ATMOSPHERIC BACKGROUND ELEMENTS === */}
      {/* Nebula glow far in the background */}
      <AbstractNebula position={[0, -5, -25]} />

      {/* Multi-color holographic particles scattered through space */}
      <HolographicParticles count={400} radius={50} />

      {/* Distant abstract orbital rings */}
      <FloatingRings position={[0, -5, -20]} />

      {/* DNA helixes far in background */}
      <DNAHelix position={[22, -10, -15]} height={25} segments={50} />
      <DNAHelix position={[-22, -8, -12]} height={20} segments={40} />

      {/* Scattered abstract geometry in the far field */}
      <FloatingGeometry position={[0, -5, -18]} />

      {/* Window section */}
      <group position={[0, -25, 5.69]}>
        <pointLight castShadow position={[1, 1, -2.5]} intensity={60} distance={10} color="#00f0ff" />
        <pointLight position={[-2, 0, -1]} intensity={30} distance={8} color="#ff00aa" />
        <pointLight position={[0, 2, 0]} intensity={15} distance={6} color="#8844ff" />
        <WindowModel receiveShadow/>
        <TextWindow/>
      </group>
    </>
  );
};

export default Hero;
