import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  tx: number
  ty: number
  seed: number
  size: number
  color: string
}

function buildParticles(width: number, height: number) {
  const centerX = width / 2
  const centerY = height * 0.5
  const torsoW = width * 0.34
  const torsoH = height * 0.48
  const chestY = height * 0.47
  const particles: Particle[] = []

  for (let i = 0; i < 620; i += 1) {
    const angle = Math.random() * Math.PI * 2
    const radius = Math.sqrt(Math.random())
    let tx = centerX + Math.cos(angle) * torsoW * radius
    let ty = centerY + Math.sin(angle) * torsoH * radius

    const shoulderSoftness = 1 - Math.max(0, (ty - centerY) / torsoH) * 0.35
    tx = centerX + (tx - centerX) * shoulderSoftness

    tx += (Math.random() - 0.5) * width * 0.09
    ty += (Math.random() - 0.5) * height * 0.08

    const isChest = Math.abs(ty - chestY) < height * 0.12 && Math.abs(tx - centerX) < width * 0.2
    const color = isChest
      ? Math.random() > 0.45 ? '#2f73ff' : '#ff820c'
      : Math.random() > 0.55 ? '#70ab34' : '#77c9bd'

    particles.push({
      x: centerX + (Math.random() - 0.5) * width * 0.08,
      y: chestY + (Math.random() - 0.5) * height * 0.08,
      tx,
      ty,
      seed: Math.random() * 1000,
      size: isChest ? 1.9 + Math.random() * 1.7 : 0.9 + Math.random() * 1.4,
      color,
    })
  }
  return particles
}

export default function ChestPointCloud() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    let frame = 0
    let raf = 0
    let particles: Particle[] = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const ratio = window.devicePixelRatio || 1
      canvas.width = rect.width * ratio
      canvas.height = rect.height * ratio
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      particles = buildParticles(rect.width, rect.height)
    }

    const draw = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const centerX = width / 2
      const chestY = height * 0.47
      const progress = Math.min(1, frame / 110)
      const eased = 1 - Math.pow(1 - progress, 3)

      context.clearRect(0, 0, width, height)

      const glow = context.createRadialGradient(centerX, chestY, 0, centerX, chestY, width * 0.44)
      glow.addColorStop(0, 'rgba(47, 115, 255, 0.14)')
      glow.addColorStop(0.32, 'rgba(255, 130, 12, 0.08)')
      glow.addColorStop(1, 'rgba(255, 255, 255, 0)')
      context.fillStyle = glow
      context.fillRect(0, 0, width, height)

      particles.forEach(particle => {
        const wave = Math.sin(frame * 0.025 + particle.seed) * 4
        const x = particle.x + (particle.tx - particle.x) * eased + wave * 0.35
        const y = particle.y + (particle.ty - particle.y) * eased + Math.cos(frame * 0.021 + particle.seed) * 2
        const alpha = 0.18 + eased * 0.7 + Math.sin(frame * 0.03 + particle.seed) * 0.08

        context.globalAlpha = Math.max(0.1, Math.min(0.95, alpha))
        context.fillStyle = particle.color
        context.beginPath()
        context.arc(x, y, particle.size, 0, Math.PI * 2)
        context.fill()
      })

      context.globalAlpha = 1
      frame += 1
      raf = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas className="point-cloud-canvas" ref={canvasRef} aria-hidden="true" />
}
