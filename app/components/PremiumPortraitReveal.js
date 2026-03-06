'use client'

import { useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import styles from './PremiumPortraitReveal.module.css'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const lerp = (start, end, amount) => start + (end - start) * amount

export default function PremiumPortraitReveal({
  warriorSrc = '/images/warrior.jpg',
  revealSrc = '/images/ashu_warrior.jpg',
  warriorAlt = 'Warrior portrait',
  revealAlt = 'Ashutosh portrait',
  isDarkMode = false,
  className = '',
  imagePosition = '50% 50%',
}) {
  const cardRef = useRef(null)
  const rafRef = useRef(null)
  const coarseRef = useRef(false)
  const resetTimerRef = useRef(null)

  const motionRef = useRef({
    inside: false,
    hover: 0,
    hoverTarget: 0,
    x: 50,
    xTarget: 50,
    y: 50,
    yTarget: 50,
    tiltX: 0,
    tiltXTarget: 0,
    tiltY: 0,
    tiltYTarget: 0,
    shiftX: 0,
    shiftXTarget: 0,
    shiftY: 0,
    shiftYTarget: 0,
    reveal: 0,
    revealTarget: 0,
    l1x: 0,
    l1y: 0,
    l2x: 0,
    l2y: 0,
  })

  const writeCssVars = useCallback((m) => {
    if (!cardRef.current) return

    const reveal = m.reveal
    cardRef.current.style.setProperty('--hover', m.hover.toFixed(4))
    cardRef.current.style.setProperty('--mx', `${m.x.toFixed(2)}%`)
    cardRef.current.style.setProperty('--my', `${m.y.toFixed(2)}%`)
    cardRef.current.style.setProperty('--tilt-x', `${m.tiltX.toFixed(3)}deg`)
    cardRef.current.style.setProperty('--tilt-y', `${m.tiltY.toFixed(3)}deg`)
    cardRef.current.style.setProperty('--shift-x', `${m.shiftX.toFixed(2)}px`)
    cardRef.current.style.setProperty('--shift-y', `${m.shiftY.toFixed(2)}px`)
    cardRef.current.style.setProperty('--reveal-main', `${reveal.toFixed(2)}px`)
    cardRef.current.style.setProperty('--reveal-soft', `${(reveal * 1.44).toFixed(2)}px`)
    cardRef.current.style.setProperty('--reveal-l1', `${(reveal * 0.62).toFixed(2)}px`)
    cardRef.current.style.setProperty('--reveal-l2', `${(reveal * 0.5).toFixed(2)}px`)
    cardRef.current.style.setProperty('--l1x', `${m.l1x.toFixed(2)}px`)
    cardRef.current.style.setProperty('--l1y', `${m.l1y.toFixed(2)}px`)
    cardRef.current.style.setProperty('--l2x', `${m.l2x.toFixed(2)}px`)
    cardRef.current.style.setProperty('--l2y', `${m.l2y.toFixed(2)}px`)
  }, [])

  const animate = useCallback((time) => {
    const m = motionRef.current
    const t = time * 0.001

    if (coarseRef.current && !m.inside) {
      m.hoverTarget = 0.28 + Math.sin(t * 1.1) * 0.08
      m.xTarget = 50 + Math.cos(t * 0.7) * 11
      m.yTarget = 48 + Math.sin(t * 0.9) * 8
      m.tiltXTarget = Math.sin(t * 0.8) * 1.5
      m.tiltYTarget = Math.cos(t * 0.9) * 2
      m.shiftXTarget = Math.cos(t * 0.75) * 3
      m.shiftYTarget = Math.sin(t * 0.85) * 2
      m.revealTarget = 86 + Math.sin(t * 1.2) * 10
    }

    const easing = m.inside ? 0.2 : 0.12

    m.hover = lerp(m.hover, m.hoverTarget, easing)
    m.x = lerp(m.x, m.xTarget, easing)
    m.y = lerp(m.y, m.yTarget, easing)
    m.tiltX = lerp(m.tiltX, m.tiltXTarget, easing)
    m.tiltY = lerp(m.tiltY, m.tiltYTarget, easing)
    m.shiftX = lerp(m.shiftX, m.shiftXTarget, easing)
    m.shiftY = lerp(m.shiftY, m.shiftYTarget, easing)
    m.reveal = lerp(m.reveal, m.revealTarget, easing)

    const wave = m.reveal * 0.2 * (0.25 + m.hover * 0.75)
    m.l1x = Math.cos(t * 2.3) * wave
    m.l1y = Math.sin(t * 1.9) * wave * 0.86
    m.l2x = Math.sin(t * 2.8 + 1.2) * wave * 0.94
    m.l2y = Math.cos(t * 2.6 + 0.8) * wave * 0.78

    if (m.reveal < 0.5) {
      m.l1x = 0
      m.l1y = 0
      m.l2x = 0
      m.l2y = 0
    }

    writeCssVars(m)

    const settled =
      Math.abs(m.hover - m.hoverTarget) < 0.003 &&
      Math.abs(m.x - m.xTarget) < 0.03 &&
      Math.abs(m.y - m.yTarget) < 0.03 &&
      Math.abs(m.tiltX - m.tiltXTarget) < 0.03 &&
      Math.abs(m.tiltY - m.tiltYTarget) < 0.03 &&
      Math.abs(m.reveal - m.revealTarget) < 0.45

    if (m.inside || !settled || coarseRef.current || m.revealTarget > 0) {
      rafRef.current = requestAnimationFrame(animate)
      return
    }

    rafRef.current = null
  }, [writeCssVars])

  const start = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(animate)
  }, [animate])

  useEffect(() => {
    writeCssVars(motionRef.current)

    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(hover: none), (pointer: coarse)')

      const syncMode = () => {
        coarseRef.current = mq.matches
        if (mq.matches) {
          start()
        }
      }

      syncMode()

      if (mq.addEventListener) {
        mq.addEventListener('change', syncMode)
      } else {
        mq.addListener(syncMode)
      }

      return () => {
        if (mq.removeEventListener) {
          mq.removeEventListener('change', syncMode)
        } else {
          mq.removeListener(syncMode)
        }
      }
    }
  }, [start, writeCssVars])

  useEffect(() => () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current)
    }
  }, [])

  const setFromPointer = (event, revealRadius = 150) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1)
    const y = clamp((event.clientY - rect.top) / rect.height, 0, 1)
    const nx = x * 2 - 1
    const ny = y * 2 - 1

    const m = motionRef.current
    m.xTarget = x * 100
    m.yTarget = y * 100
    m.hoverTarget = 1
    m.tiltXTarget = -ny * 5
    m.tiltYTarget = nx * 6
    m.shiftXTarget = nx * 12
    m.shiftYTarget = ny * 8
    m.revealTarget = revealRadius
  }

  const onEnter = (event) => {
    motionRef.current.inside = true
    setFromPointer(event, 138)
    start()
  }

  const onMove = (event) => {
    motionRef.current.inside = true
    setFromPointer(event, 150)
    start()
  }

  const onLeave = () => {
    const m = motionRef.current
    m.inside = false
    m.hoverTarget = 0
    m.tiltXTarget = 0
    m.tiltYTarget = 0
    m.shiftXTarget = 0
    m.shiftYTarget = 0
    m.revealTarget = 0
    start()
  }

  const onTouchStart = (event) => {
    const touch = event.touches[0]
    if (!touch) return

    const rect = event.currentTarget.getBoundingClientRect()
    const fakeEvent = {
      currentTarget: event.currentTarget,
      clientX: touch.clientX,
      clientY: touch.clientY,
    }

    motionRef.current.inside = true
    setFromPointer(fakeEvent, 110)

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current)
    }

    resetTimerRef.current = setTimeout(() => {
      onLeave()
    }, 1000)

    start()
  }

  const classes = [styles.card, isDarkMode ? styles.modeDark : styles.modeLight, className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.wrap}>
      <div
        ref={cardRef}
        className={classes}
        onMouseEnter={onEnter}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onTouchStart={onTouchStart}
        aria-label="Interactive portrait reveal"
      >
        <div className={styles.baseLayer}>
          <Image
            src={revealSrc}
            alt={revealAlt}
            fill
            priority
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 58vw, 460px"
            className={styles.image}
            style={{ objectPosition: imagePosition }}
          />
        </div>

        <div className={styles.frontLayer}>
          <Image
            src={warriorSrc}
            alt={warriorAlt}
            fill
            priority
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 58vw, 460px"
            className={styles.image}
            style={{ objectPosition: imagePosition }}
          />
        </div>

        <div className={`${styles.revealLayer} ${styles.revealSoft}`}>
          <Image
            src={revealSrc}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 58vw, 460px"
            className={styles.image}
            style={{ objectPosition: imagePosition }}
          />
        </div>

        <div className={`${styles.revealLayer} ${styles.revealMain}`}>
          <Image
            src={revealSrc}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 58vw, 460px"
            className={styles.image}
            style={{ objectPosition: imagePosition }}
          />
        </div>

        <div className={`${styles.revealLayer} ${styles.revealL1}`}>
          <Image
            src={revealSrc}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 58vw, 460px"
            className={styles.image}
            style={{ objectPosition: imagePosition }}
          />
        </div>

        <div className={`${styles.revealLayer} ${styles.revealL2}`}>
          <Image
            src={revealSrc}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 58vw, 460px"
            className={styles.image}
            style={{ objectPosition: imagePosition }}
          />
        </div>

        <div className={styles.spotlight} />
        <div className={styles.noise} />
        <div className={styles.frame} />
      </div>
    </div>
  )
}
