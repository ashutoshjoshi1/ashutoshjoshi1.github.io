'use client';

import { useEffect, useRef } from 'react';
import { useScrollStore } from '@stores';

const TRACK_PATH = '/audio/gangstas-paradise-coolio-feat-lv.mp3';

const ScrollMusicPlayer = () => {
  const scrollProgress = useScrollStore((state) => state.scrollProgress);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    const audio = new Audio(TRACK_PATH);
    audio.preload = 'auto';
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
      hasStartedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (scrollProgress <= 0 || hasStartedRef.current || !audioRef.current) return;

    const tryStartPlayback = async () => {
      try {
        await audioRef.current?.play();
        hasStartedRef.current = true;
      } catch {
        // Ignore autoplay permission failures; we retry on later scroll updates.
      }
    };

    void tryStartPlayback();
  }, [scrollProgress]);

  return null;
};

export default ScrollMusicPlayer;
