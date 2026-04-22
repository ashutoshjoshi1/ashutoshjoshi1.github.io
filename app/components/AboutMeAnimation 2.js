'use client'

import { useEffect, useRef } from 'react'
import { useDarkMode } from '../context/DarkModeContext'

export default function AboutMeAnimation() {
  const { isDarkMode } = useDarkMode()
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const particlesRef = useRef([])
  const mouseRef = useRef({ x: null, y: null })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    let width = canvas.width = window.innerWidth
    let height = canvas.height = window.innerHeight

    const resize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      init()
    }

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }

    const handleMouseLeave = () => {
      mouseRef.current.x = null
      mouseRef.current.y = null
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    // Color palette based on mode
    const getColor = (opacity) => {
      if (isDarkMode) {
        return `rgba(34, 197, 94, ${opacity})`
      }
      return `rgba(6, 182, 212, ${opacity})`
    }

    const getSecondaryColor = (opacity) => {
      if (isDarkMode) {
        return `rgba(16, 185, 129, ${opacity})`
      }
      return `rgba(59, 130, 246, ${opacity})`
    }

    class Particle {
      constructor() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.vx = (Math.random() - 0.5) * 0.3
        this.vy = (Math.random() - 0.5) * 0.3
        this.radius = Math.random() * 1.5 + 0.5
        this.baseOpacity = Math.random() * 0.4 + 0.1
        this.opacity = this.baseOpacity
        this.pulseSpeed = Math.random() * 0.02 + 0.01
        this.pulseOffset = Math.random() * Math.PI * 2
      }

      update(time) {
        this.x += this.vx
        this.y += this.vy

        // Pulse effect
        this.opacity = this.baseOpacity + Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.1

        // Wrap around
        if (this.x < 0) this.x = width
        if (this.x > width) this.x = 0
        if (this.y < 0) this.y = height
        if (this.y > height) this.y = 0

        // Mouse interaction
        if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
          const dx = mouseRef.current.x - this.x
          const dy = mouseRef.current.y - this.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 200) {
            const force = (200 - distance) / 200
            this.opacity = Math.min(this.baseOpacity + force * 0.6, 0.8)
            // Gentle push away from mouse
            this.x -= dx * force * 0.01
            this.y -= dy * force * 0.01
          }
        }
      }

      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = getColor(this.opacity)
        ctx.fill()
      }
    }

    // Floating geometric shapes
    class FloatingShape {
      constructor() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.size = Math.random() * 30 + 20
        this.rotation = Math.random() * Math.PI * 2
        this.rotationSpeed = (Math.random() - 0.5) * 0.005
        this.vx = (Math.random() - 0.5) * 0.2
        this.vy = (Math.random() - 0.5) * 0.2
        this.opacity = Math.random() * 0.05 + 0.02
        this.type = Math.floor(Math.random() * 3) // 0: square, 1: triangle, 2: hexagon
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.rotation += this.rotationSpeed

        if (this.x < -50) this.x = width + 50
        if (this.x > width + 50) this.x = -50
        if (this.y < -50) this.y = height + 50
        if (this.y > height + 50) this.y = -50
      }

      draw() {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)
        ctx.strokeStyle = getSecondaryColor(this.opacity)
        ctx.lineWidth = 1

        if (this.type === 0) {
          // Square
          ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size)
        } else if (this.type === 1) {
          // Triangle
          ctx.beginPath()
          ctx.moveTo(0, -this.size / 2)
          ctx.lineTo(this.size / 2, this.size / 2)
          ctx.lineTo(-this.size / 2, this.size / 2)
          ctx.closePath()
          ctx.stroke()
        } else {
          // Hexagon
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i
            const x = Math.cos(angle) * this.size / 2
            const y = Math.sin(angle) * this.size / 2
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.closePath()
          ctx.stroke()
        }
        ctx.restore()
      }
    }

    const shapesRef = []

    const init = () => {
      const particleCount = Math.min(80, Math.floor((width * height) / 20000))
      particlesRef.current = []
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(new Particle())
      }

      // Add floating shapes
      shapesRef.length = 0
      for (let i = 0; i < 8; i++) {
        shapesRef.push(new FloatingShape())
      }
    }

    const drawConnections = () => {
      const particles = particlesRef.current
      const connectionDistance = 150
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.1
            
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = getColor(opacity)
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
    }

    let time = 0
    const animate = () => {
      time++
      ctx.clearRect(0, 0, width, height)
      
      // Draw floating shapes first (background)
      shapesRef.forEach(shape => {
        shape.update()
        shape.draw()
      })

      // Draw connections
      drawConnections()
      
      // Draw particles
      particlesRef.current.forEach(particle => {
        particle.update(time)
        particle.draw()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    init()
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationRef.current)
    }
  }, [isDarkMode])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  )
}
