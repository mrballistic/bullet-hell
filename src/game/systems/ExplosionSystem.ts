import { GameState, ExplosionParticle } from '../../types/GameTypes'

export class ExplosionSystem {
  static createExplosion(x: number, y: number, particleCount: number, hue: number, type: 'asteroid' | 'bullet'): ExplosionParticle[] {
    const particles: ExplosionParticle[] = []
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.5
      const speed = 50 + Math.random() * 150 // Random speed between 50-200
      const size = type === 'asteroid' ? 3 + Math.random() * 4 : 2 + Math.random() * 3
      
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.5, // 0.5-1 second lifetime
        size,
        hue: hue + Math.random() * 30 - 15, // Slight hue variation
        type
      })
    }
    
    return particles
  }
  
  static update(state: GameState, deltaSeconds: number, _nowMs: number) {
    const { explosionParticles } = state
    
    for (let i = explosionParticles.length - 1; i >= 0; i--) {
      const particle = explosionParticles[i]
      
      // Update particle physics
      particle.x += particle.vx * deltaSeconds
      particle.y += particle.vy * deltaSeconds
      particle.life += deltaSeconds
      
      // Apply some drag
      particle.vx *= 0.98
      particle.vy *= 0.98
      
      // Remove dead particles
      if (particle.life > particle.maxLife) {
        explosionParticles.splice(i, 1)
      }
    }
  }
  
  static draw(ctx: CanvasRenderingContext2D, explosionParticles: ExplosionParticle[], nowMs: number) {
    for (const particle of explosionParticles) {
      const lifeRatio = particle.life / particle.maxLife
      const alpha = Math.max(0, 1 - lifeRatio)
      
      // Pulsing glow effect
      const pulse = Math.sin(nowMs / 100 + particle.hue) * 0.3 + 0.7
      
      // Set up glow
      ctx.shadowBlur = 10 * pulse
      ctx.shadowColor = `hsl(${particle.hue}, 100%, 50%)`
      
      // Draw particle
      ctx.fillStyle = `hsla(${particle.hue}, 100%, ${particle.type === 'asteroid' ? '60%' : '70%'}, ${alpha * pulse})`
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size * (1 - lifeRatio * 0.5), 0, Math.PI * 2)
      ctx.fill()
      
      // Add extra glow for asteroid particles
      if (particle.type === 'asteroid') {
        ctx.fillStyle = `hsla(${particle.hue}, 80%, 80%, ${alpha * 0.3 * pulse})`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 2 * (1 - lifeRatio * 0.5), 0, Math.PI * 2)
        ctx.fill()
      }
    }
    
    // Reset shadow
    ctx.shadowBlur = 0
    ctx.shadowColor = 'transparent'
  }
}
