import { GameState } from '../../types/GameTypes'

export class PlayerSystem {
  static update(state: GameState, deltaSeconds: number, nowMs: number) {
    const { player, input, width, height } = state
    
    // Smooth lerp towards target position
    const smoothingFactor = 1 - Math.exp(-5 * deltaSeconds) // Exponential smoothing
    player.x += (input.targetX - player.x) * smoothingFactor
    player.y += (input.targetY - player.y) * smoothingFactor
    
    // Clamp to screen bounds
    player.x = Math.max(player.radius, Math.min(width - player.radius, player.x))
    player.y = Math.max(player.radius, Math.min(height - player.radius, player.y))
    
    // Check collisions
    PlayerSystem.checkCollisions(state, nowMs)
  }

  private static checkCollisions(state: GameState, nowMs: number) {
    const { player, bullets } = state
    
    // Skip if invincible
    if (player.invincibleUntilMs > nowMs) return
    
    for (const bullet of bullets) {
      const dx = bullet.x - player.x
      const dy = bullet.y - player.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      // Check if bullet hits player (bullet radius 4 + player radius)
      if (distance < player.radius + 4) {
        PlayerSystem.handleHit(state, nowMs)
        break // Only handle one hit per frame
      }
    }
  }

  private static handleHit(state: GameState, nowMs: number) {
    const { player } = state
    
    // Increment deaths
    player.deaths++
    
    // Set invincibility (2 seconds)
    player.invincibleUntilMs = nowMs + 2000
    
    // Store hit time for visual effects
    player.lastHitMs = nowMs
  }

  static draw(ctx: CanvasRenderingContext2D, state: GameState, nowMs: number) {
    const { player } = state
    
    // Skip drawing if invincible and blinking
    const isInvincible = player.invincibleUntilMs > nowMs
    if (isInvincible && Math.floor(nowMs / 100) % 2 === 0) {
      return
    }
    
    // Save context state
    ctx.save()
    
    // Move to player position
    ctx.translate(player.x, player.y)
    
    // Add slight wobble based on time
    const wobble = Math.sin(nowMs / 200) * 0.05
    ctx.rotate(wobble)
    
    // Color shifting
    const hue = (nowMs / 30) % 360
    
    // Draw glowing triangle ship
    ctx.fillStyle = `hsl(${hue}, 100%, 60%)`
    ctx.strokeStyle = `hsl(${hue}, 100%, 80%)`
    ctx.lineWidth = 2
    ctx.shadowBlur = 20
    ctx.shadowColor = `hsl(${hue}, 100%, 50%)`
    
    ctx.beginPath()
    ctx.moveTo(0, -player.radius)
    ctx.lineTo(-player.radius * 0.8, player.radius * 0.8)
    ctx.lineTo(player.radius * 0.8, player.radius * 0.8)
    ctx.closePath()
    
    ctx.fill()
    ctx.stroke()
    
    // Restore context state
    ctx.restore()
  }
}
