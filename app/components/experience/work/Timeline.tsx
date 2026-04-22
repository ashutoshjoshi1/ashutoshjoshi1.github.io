import { Box, Edges, Line, Text, TextProps } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { usePortalStore } from "@stores";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from "three";

import { WORK_TIMELINE } from "@constants";
import { WorkTimelinePoint } from "@types";

const reusableLeft = new THREE.Vector3(-0.3, 0, -0.1);
const reusableRight = new THREE.Vector3(0.3, 0, -0.1);

const TimelinePoint = ({ point, diff }: { point: WorkTimelinePoint, diff: number }) => {
  const getPoint = useMemo(() => {
    switch (point.position) {
      case 'left': return reusableLeft;
      case 'right': return reusableRight;
      default: return new THREE.Vector3();
    }
  }, [point.position]);

  const textAlign = point.position === 'left' ? 'right' : 'left';

  const textProps: Partial<TextProps> = useMemo(() => ({
    font: "./Vercetti-Regular.woff",
    color: "#e0e0ff",
    anchorX: textAlign,
    fillOpacity: 2 - 2 * diff,
  }), [textAlign, diff]);

  const titleProps = useMemo(() => ({
    ...textProps,
    font: "./soria-font.ttf",
    fontSize: 0.6,
    maxWidth: 3,
    color: "#00f0ff",
  }), [textProps]);

  return (
    <group position={point.point} scale={isMobile ? 0.35 : 0.6}>
      <Box args={[0.15, 0.15, 0.15]} position={[0, 0, -0.1]} scale={[1 - diff, 1 - diff, 1 - diff]}>
        <meshBasicMaterial color="#ff00aa" wireframe />
        <Edges color="#ff00aa" lineWidth={1.5} />
      </Box>
      <group>
        <group position={getPoint}>
          <Text {...textProps} fontSize={0.25} position={[-diff / 2, 0.05, 0]} color="#ff00aa" anchorY="bottom">
            {point.year}
          </Text>
          <group position={[0, -0.25, 0]}>
            <Text {...titleProps} fontSize={0.45} maxWidth={2.8} position={[0, -diff / 2, 0]} anchorY="bottom">
              {point.title}
            </Text>
            <Text {...textProps} fontSize={0.18} position={[0, -0.2 - diff * 0.3, 0]} maxWidth={2.8} anchorY="top">
              {point.subtitle}
            </Text>
          </group>
        </group>
      </group>
    </group>
  );
};

const Timeline = ({ progress }: { progress: number }) => {
  const { camera } = useThree();
  const isActive = usePortalStore((state) => state.activePortalId === 'work');
  const timeline = useMemo(() => WORK_TIMELINE, []);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(timeline.map(p => p.point), false), [timeline]);
  const curvePoints = useMemo(() => curve.getPoints(500), [curve]);
  const visibleCurvePoints = useMemo(() => curvePoints.slice(0, Math.max(1, Math.ceil(progress * curvePoints.length))), [curvePoints, progress]);
  const visibleTimelinePoints = useMemo(() => timeline.slice(0, Math.max(1, Math.round(progress * (timeline.length - 1) + 1))), [timeline, progress]);

  const [visibleDashedCurvePoints, setVisibleDashedCurvePoints] = useState<THREE.Vector3[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useFrame((_, delta) => {
    if (isActive) {
      const position = curve.getPoint(progress);
      camera.position.x = THREE.MathUtils.damp(camera.position.x, (isMobile ? -1 : -2) + position.x, 3, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, -39 + position.z, 3, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, 13 - position.y, 3, delta);
    }
  });

  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    if (groupRef.current) {
      tl.to(groupRef.current.scale, {
        x: isActive ? 1 : 0,
        y: isActive ? 1 : 0,
        z: isActive ? 1 : 0,
        duration: 1,
        delay: isActive ? 0.4 : 0,
      });
      tl.to(groupRef.current.position, {
        y: isActive ? 0 : -2,
        duration: 1,
        delay: isActive ? 0.4 : 0,
      }, 0);
    }

    if (isActive) {
      let i = 0;
      clearInterval(intervalRef.current!);
      setTimeout(() => {
        intervalRef.current = setInterval(() => {
          const p = i++ / 100;
          setVisibleDashedCurvePoints(curvePoints.slice(0, Math.max(1, Math.ceil(p * curvePoints.length))));
          if (i > 100 && intervalRef.current) clearInterval(intervalRef.current);
        }, 10);
      }, 1000);
    } else {
      setVisibleDashedCurvePoints([]);
      clearInterval(intervalRef.current!);
    }

    return () => clearInterval(intervalRef.current!);
  }, [isActive]);

  return (
    <group position={[0, -0.1, -0.1]}>
      <Line points={visibleCurvePoints} color="#00f0ff" lineWidth={3} />
      {visibleDashedCurvePoints.length > 0 && (
        <Line
          points={visibleDashedCurvePoints}
          color="#ff00aa"
          lineWidth={0.5}
          dashed
          dashSize={0.25}
          gapSize={0.25}
        />
      )}
      <group ref={groupRef}>
        {visibleTimelinePoints.map((point, i) => {
          const diff = Math.min(2 * Math.max(i - (progress * (timeline.length - 1)), 0), 1);
          return <TimelinePoint point={point} key={i} diff={diff} />;
        })}
      </group>
    </group>
  );
};

export default Timeline;
