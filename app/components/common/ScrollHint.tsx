import gsap from "gsap";
import Image from "next/image";
import { useEffect, useState } from "react";

import { usePortalStore, useScrollStore } from "@stores";

export const ScrollHint = () => {
  const [hintText, setHintText] = useState('');
  const [showScrollHint, setShowScrollHint] = useState(false);
  const portal = usePortalStore((state) => state.activePortalId);
  const scrollProgress = useScrollStore((state) => state.scrollProgress);

  // Show 'Scroll' for Hero and work portals, 'Pan' for Projects portal.
  useEffect(() => {
    if (!portal) {
      if (scrollProgress === 0) {
        setHintText('SCROLL');
        setShowScrollHint(true);
      } else {
        setShowScrollHint(false);
      }
    } else {
      if (portal === 'work') {
        setHintText('SCROLL');
        setShowScrollHint(scrollProgress === 0);
      } else {
        setHintText('PAN');
        setShowScrollHint(true);
      }
    }
  }, [portal, scrollProgress]);

  useEffect(() => {
    if (showScrollHint) {
      gsap.to('.scroll-hint', {
        opacity: 1,
        duration: 1.5,
        delay: 1.5,
      });
    } else {
      gsap.killTweensOf('.scroll-hint');
      gsap.to('.scroll-hint', {
        opacity: 0,
        duration: 0.5,
      });
    }
  }, [showScrollHint]);

  const svgSrc = hintText === 'PAN' ? 'icons/chevrons-left-right.svg' : 'icons/chevrons-up-down.svg';

  return (
    <div className="fixed w-full bottom-5 scroll-hint" style={{ opacity: 0 }}>
      <div className="flex items-center justify-center animate-pulse gap-2">
        <Image src={svgSrc} width={18} height={18} alt="scroll hint" loading="lazy" />
        <span style={{
          color: '#00f0ff',
          fontSize: '0.75rem',
          letterSpacing: '0.3em',
          textShadow: '0 0 10px rgba(0, 240, 255, 0.4)',
          fontFamily: 'var(--font-vercetti)',
        }}>
          {hintText}
        </span>
      </div>
    </div>
  );
}
