import { GameState } from '../../types/GameTypes'

export class ShieldSystem {
  private static readonly MAX_SHIELD_PARTS = 3
  private static readonly REGENERATION_DELAY_MS = 5000 // 5 seconds

  static update(state: GameState, _deltaSeconds: number, nowMs: number) {
    const { player } = state
    
    // Check if shield should regenerate
    if (player.shield.parts < this.MAX_SHIELD_PARTS && !player.shield.isRegenerating) {
      const timeSinceDamage = nowMs - player.shield.lastDamageTimeMs
      if (timeSinceDamage >= this.REGENERATION_DELAY_MS) {
        player.shield.isRegenerating = true
      }
    }
    
    // Regenerate shield parts
    if (player.shield.isRegenerating && player.shield.parts < this.MAX_SHIELD_PARTS) {
      player.shield.parts = Math.min(this.MAX_SHIELD_PARTS, player.shield.parts + 1)
      player.shield.isRegenerating = false
    }
  }

  static damageShield(state: GameState, nowMs: number): boolean {
    const { player } = state
    
    if (player.shield.parts > 0) {
      player.shield.parts--
      player.shield.lastDamageTimeMs = nowMs
      player.shield.isRegenerating = false
      return true // Shield absorbed the hit
    }
    
    return false // Shield is depleted
  }

  static draw(ctx: CanvasRenderingContext2D, state: GameState, nowMs: number) {
    const { player } = state
    
    if (player.shield.parts === 0) return
    
    // Draw shield segments around player
    const segmentAngle = (Math.PI * 2) / this.MAX_SHIELD_PARTS
    const shieldRadius = player.radius + 15
    
    ctx.save()
    ctx.translate(player.x, player.y)
    
    for (let i = 0; i < this.MAX_SHIELD_PARTS; i++) {
      if (i < player.shield.parts) {
        const startAngle = i * segmentAngle - Math.PI / 2
        const endAngle = startAngle + segmentAngle * 0.8 // Leave small gaps
        
        // Pulsing effect
        const pulse = Math.sin(nowMs / 200 + i) * 0.1 + 0.9
        
        // Draw shield segment
        ctx.strokeStyle = `rgba(100, 200, 255, ${0.6 * pulse})`
        ctx.lineWidth = 3
        ctx.shadowColor = 'rgba(100, 200, 255, 0.8)'
        ctx.shadowBlur = 10
        
        ctx.beginPath()
        ctx.arc(0, 0, shieldRadius, startAngle, endAngle)
        ctx.stroke()
        
        // Draw segment endpoints
        ctx.fillStyle = `rgba(150, 220, 255, ${0.8 * pulse})`
        ctx.beginPath()
        ctx.arc(
          Math.cos(startAngle) * shieldRadius,
          Math.sin(startAngle) * shieldRadius,
          3, 0, Math.PI * 2
        )
        ctx.fill()
        
        ctx.beginPath()
        ctx.arc(
          Math.cos(endAngle) * shieldRadius,
          Math.sin(endAngle) * shieldRadius,
          3, 0, Math.PI * 2
        )
        ctx.fill()
      }
    }
    
    ctx.restore()
  }

  static isRegeneratingSoon(state: GameState, nowMs: number): boolean {
    const { player } = state
    if (player.shield.parts >= this.MAX_SHIELD_PARTS) return false
    
    const timeSinceDamage = nowMs - player.shield.lastDamageTimeMs
    const timeUntilRegeneration = this.REGENERATION_DELAY_MS - timeSinceDamage
    
    return timeUntilRegeneration <= 1000 && timeUntilRegeneration > 0
  }

  static getRegenerationTimeRemaining(state: GameState, nowMs: number): number {
    const { player } = state
    if (player.shield.parts >= this.MAX_SHIELD_PARTS) return 0
    
    const timeSinceDamage = nowMs - player.shield.lastDamageTimeMs
    return Math.max(0, this.REGENERATION_DELAY_MS - timeSinceDamage)
  }
}
