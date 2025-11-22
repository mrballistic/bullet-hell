import { FlowParticle, GameState } from '../../types/GameTypes'

export class FlowFieldSystem {
  static initialize(count: number, width: number, height: number): FlowParticle[] {
    const particles: FlowParticle[] = []
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        life: Math.random() // Random starting life
      })
    }
    return particles
  }

  static getVectorField(x: number, y: number, width: number, height: number, timeMs: number): { vx: number; vy: number } {
    // Normalize coordinates to 0-1
    const nx = x / width
    const ny = y / height
    const t = timeMs / 1000 // Convert to seconds

    // Create a flowing vector field using sine/cosine functions
    const angle = Math.sin(nx * Math.PI * 2 + t) * Math.cos(ny * Math.PI * 2 - t * 0.7)
    const speed = 50 + Math.sin(nx * ny * Math.PI * 4 + t * 2) * 30

    return {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed
    }
  }

  static update(state: GameState, deltaSeconds: number, nowMs: number) {
    const { flowParticles, width, height } = state

    for (const particle of flowParticles) {
      // Get velocity from vector field
      const field = FlowFieldSystem.getVectorField(particle.x, particle.y, width, height, nowMs)
      
      // Update position
      particle.x += field.vx * deltaSeconds
      particle.y += field.vy * deltaSeconds

      // Decrease life
      particle.life -= deltaSeconds * 0.2 // Particles live ~5 seconds

      // Respawn if dead or out of bounds
      if (particle.life <= 0 || particle.x < 0 || particle.x > width || particle.y < 0 || particle.y > height) {
        particle.x = Math.random() * width
        particle.y = Math.random() * height
        particle.life = 1
      }
    }
  }

  static draw(ctx: CanvasRenderingContext2D, state: GameState, nowMs: number) {
    const { flowParticles } = state

    for (const particle of flowParticles) {
      // Color cycling based on time and position
      const hue = (nowMs / 50 + particle.x * 0.1 + particle.y * 0.1) % 360
      const alpha = particle.life * 0.6 // Fade with life

      ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha})`
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}
