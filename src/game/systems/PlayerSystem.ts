import { GameState } from '../../types/GameTypes'

export class PlayerSystem {
  static update(state: GameState, deltaSeconds: number, _nowMs: number) {
    const { player, input, width, height } = state
    
    // Calculate rotation to point toward mouse
    const dx = input.targetX - player.x
    const dy = input.targetY - player.y
    const targetRotation = Math.atan2(dy, dx) + Math.PI / 2 // Add PI/2 to point up toward mouse
    
    // Smooth rotation interpolation
    let rotationDiff = targetRotation - player.rotation
    // Handle angle wrapping for smooth rotation
    while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2
    while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2
    
    const rotationSmoothing = 1 - Math.exp(-10 * deltaSeconds) // Faster rotation smoothing
    player.rotation += rotationDiff * rotationSmoothing
    
    // Smooth lerp towards target position
    const smoothingFactor = 1 - Math.exp(-5 * deltaSeconds) // Exponential smoothing
    player.x += (input.targetX - player.x) * smoothingFactor
    player.y += (input.targetY - player.y) * smoothingFactor
    
    // Clamp to screen bounds
    player.x = Math.max(player.radius, Math.min(width - player.radius, player.x))
    player.y = Math.max(player.radius, Math.min(height - player.radius, player.y))
    
    // OLD COLLISION SYSTEM REMOVED - now handled by CollisionSystem with shield support
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
    
    // Rotate to point toward mouse
    ctx.rotate(player.rotation)
    
    // Add slight wobble based on time (subtle effect)
    const wobble = Math.sin(nowMs / 200) * 0.02
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
