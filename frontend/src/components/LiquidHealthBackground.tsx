import { useEffect, useRef } from 'react'

type BlobNode = {
  x: number
  y: number
  radius: number
  color: string
  speed: number
  seed: number
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  seed: number
}

interface Props {
  variant?: 'hero' | 'capabilities'
}

function makeBlobs(width: number, height: number, variant: Props['variant']) {
  const palette = variant === 'capabilities'
    ? ['rgba(255,130,12,0.32)', 'rgba(47,115,255,0.26)', 'rgba(112,171,52,0.22)', 'rgba(255,255,255,0.48)']
    : ['rgba(255,130,12,0.24)', 'rgba(47,115,255,0.22)', 'rgba(255,255,255,0.55)', 'rgba(112,171,52,0.18)']

  return Array.from({ length: 9 }, (_, index): BlobNode => ({
    x: width * (0.18 + Math.random() * 0.64),
    y: height * (0.18 + Math.random() * 0.64),
    radius: width * (0.08 + Math.random() * 0.12),
    color: palette[index % palette.length],
    speed: 0.003 + Math.random() * 0.004,
    seed: Math.random() * 1000,
  }))
}

function makeParticles(width: number, height: number, variant: Props['variant']) {
  const count = variant === 'capabilities' ? 180 : 240
  const palette = ['rgba(255,130,12,0.58)', 'rgba(47,115,255,0.5)', 'rgba(112,171,52,0.42)', 'rgba(255,255,255,0.7)']

  return Array.from({ length: count }, (_, index): Particle => {
    const angle = Math.random() * Math.PI * 2
    const ring = Math.sqrt(Math.random())
    return {
      x: width / 2 + Math.cos(angle) * width * 0.28 * ring,
      y: height * 0.5 + Math.sin(angle) * height * 0.25 * ring,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      size: 0.8 + Math.random() * 2.3,
      color: palette[index % palette.length],
      seed: Math.random() * 1000,
    }
  })
}

export default function LiquidHealthBackground({ variant = 'hero' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    let raf = 0
    let frame = 0
    let blobs: BlobNode[] = []
    let particles: Particle[] = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const ratio = window.devicePixelRatio || 1
      canvas.width = rect.width * ratio
      canvas.height = rect.height * ratio
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      blobs = makeBlobs(rect.width, rect.height, variant)
      particles = makeParticles(rect.width, rect.height, variant)
    }

    const drawBackground = (width: number, height: number) => {
      const gradient = context.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, variant === 'hero' ? '#fff7eb' : '#f6efe5')
      gradient.addColorStop(0.5, '#f4f0eb')
      gradient.addColorStop(1, variant === 'hero' ? '#edf3ff' : '#fffaf2')
      context.fillStyle = gradient
      context.fillRect(0, 0, width, height)

      context.globalAlpha = 0.32
      context.strokeStyle = 'rgba(33,33,33,0.045)'
      context.lineWidth = 1
      const grid = 86
      for (let x = 0; x < width + grid; x += grid) {
        context.beginPath()
        context.moveTo(x, 0)
        context.lineTo(x, height)
        context.stroke()
      }
      for (let y = 0; y < height + grid; y += grid) {
        context.beginPath()
        context.moveTo(0, y)
        context.lineTo(width, y)
        context.stroke()
      }
      context.globalAlpha = 1
    }

    const draw = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const centerX = width / 2
      const centerY = height * (variant === 'hero' ? 0.54 : 0.45)
      const breath = 1 + Math.sin(frame * 0.026) * 0.018 + Math.sin(frame * 0.052) * 0.008

      drawBackground(width, height)

      context.save()
      context.globalCompositeOperation = 'multiply'
      blobs.forEach(blob => {
        const x = blob.x + Math.sin(frame * blob.speed + blob.seed) * width * 0.05
        const y = blob.y + Math.cos(frame * blob.speed * 0.9 + blob.seed) * height * 0.04
        const radius = blob.radius * breath
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
        gradient.addColorStop(0, blob.color)
        gradient.addColorStop(0.54, blob.color.replace(/0\.\d+\)/, '0.12)'))
        gradient.addColorStop(1, 'rgba(255,255,255,0)')
        context.fillStyle = gradient
        context.beginPath()
        context.arc(x, y, radius, 0, Math.PI * 2)
        context.fill()
      })
      context.restore()

      context.save()
      context.translate(centerX, centerY)
      context.scale(breath, breath)
      context.translate(-centerX, -centerY)
      const orb = context.createRadialGradient(centerX - width * 0.08, centerY - height * 0.08, width * 0.04, centerX, centerY, width * 0.34)
      orb.addColorStop(0, 'rgba(255,255,255,0.84)')
      orb.addColorStop(0.34, 'rgba(255,130,12,0.18)')
      orb.addColorStop(0.62, 'rgba(47,115,255,0.16)')
      orb.addColorStop(1, 'rgba(255,255,255,0)')
      context.fillStyle = orb
      context.beginPath()
      context.ellipse(centerX, centerY, width * 0.34, height * 0.25, 0, 0, Math.PI * 2)
      context.fill()
      context.restore()

      particles.forEach(particle => {
        const pullX = (centerX - particle.x) * 0.00055
        const pullY = (centerY - particle.y) * 0.00055
        particle.vx += pullX + Math.sin(frame * 0.012 + particle.seed) * 0.004
        particle.vy += pullY + Math.cos(frame * 0.014 + particle.seed) * 0.004
        particle.vx *= 0.985
        particle.vy *= 0.985
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < -20 || particle.x > width + 20 || particle.y < -20 || particle.y > height + 20) {
          particle.x = centerX + (Math.random() - 0.5) * width * 0.52
          particle.y = centerY + (Math.random() - 0.5) * height * 0.42
        }

        const alpha = 0.28 + Math.sin(frame * 0.03 + particle.seed) * 0.18
        context.globalAlpha = Math.max(0.12, alpha)
        context.fillStyle = particle.color
        context.beginPath()
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
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
  }, [variant])

  return <canvas className="liquid-bg-canvas" ref={canvasRef} aria-hidden="true" />
}
