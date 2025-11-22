import { GameState } from '../../types/GameTypes'

export class ShieldSystem {
  private static readonly MAX_SHIELD_PARTS = 3
  private static readonly SECTION_RECOVERY_TIME_MS = 5000 // 5 seconds per section

  static update(state: GameState, _deltaSeconds: number, nowMs: number) {
    const { player } = state
    
    // Check if any damaged sections should recover
    let activeParts = 0
    for (let i = 0; i < this.MAX_SHIELD_PARTS; i++) {
      if (player.shield.sectionDamageTimes[i] === 0 || 
          nowMs - player.shield.sectionDamageTimes[i] >= this.SECTION_RECOVERY_TIME_MS) {
        // Section is active
        activeParts++
        if (nowMs - player.shield.sectionDamageTimes[i] >= this.SECTION_RECOVERY_TIME_MS) {
          player.shield.sectionDamageTimes[i] = 0 // Reset damage time
        }
      }
    }
    
    player.shield.parts = activeParts
  }

  static damageShieldSection(state: GameState, sectionIndex: number, nowMs: number): boolean {
    const { player } = state
    
    if (sectionIndex >= 0 && sectionIndex < this.MAX_SHIELD_PARTS) {
      // Only damage if section is currently active
      if (player.shield.sectionDamageTimes[sectionIndex] === 0 || 
          nowMs - player.shield.sectionDamageTimes[sectionIndex] >= this.SECTION_RECOVERY_TIME_MS) {
        player.shield.sectionDamageTimes[sectionIndex] = nowMs
        return true // Section absorbed the hit
      }
    }
    
    return false // Section was already damaged
  }

  static checkShieldCollision(state: GameState, bulletX: number, bulletY: number, nowMs: number): boolean {
    const { player } = state
    const dx = bulletX - player.x
    const dy = bulletY - player.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // Check if bullet is within shield radius
    const shieldRadius = player.radius + 15
    if (distance > shieldRadius + 5 || distance < player.radius - 5) {
      return false // Bullet is not in shield range
    }
    
    // Calculate which section the bullet hit
    let angle = Math.atan2(dy, dx) + Math.PI / 2 // Normalize to start from top
    if (angle < 0) angle += Math.PI * 2
    
    const sectionAngle = (Math.PI * 2) / this.MAX_SHIELD_PARTS
    const sectionIndex = Math.floor(angle / sectionAngle)
    
    // Check if this section is active (can block bullets)
    const isSectionActive = player.shield.sectionDamageTimes[sectionIndex] === 0 || 
                           nowMs - player.shield.sectionDamageTimes[sectionIndex] >= this.SECTION_RECOVERY_TIME_MS
    
    if (isSectionActive) {
      // Section is active, damage it and block the bullet
      this.damageShieldSection(state, sectionIndex, nowMs)
      return true // Bullet blocked by shield
    }
    
    return false // Bullet penetrated through damaged section
  }

  static draw(ctx: CanvasRenderingContext2D, state: GameState, nowMs: number) {
    const { player } = state
    
    // Draw shield segments around player
    const segmentAngle = (Math.PI * 2) / this.MAX_SHIELD_PARTS
    const shieldRadius = player.radius + 15
    
    ctx.save()
    ctx.translate(player.x, player.y)
    
    for (let i = 0; i < this.MAX_SHIELD_PARTS; i++) {
      const isDamaged = player.shield.sectionDamageTimes[i] > 0 && 
                       nowMs - player.shield.sectionDamageTimes[i] < this.SECTION_RECOVERY_TIME_MS
      
      if (!isDamaged) {
        // Section is active, draw it
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
      } else {
        // Section is damaged, show recovery indicator
        const timeRemaining = this.SECTION_RECOVERY_TIME_MS - (nowMs - player.shield.sectionDamageTimes[i])
        const recoveryProgress = 1 - (timeRemaining / this.SECTION_RECOVERY_TIME_MS)
        
        const startAngle = i * segmentAngle - Math.PI / 2
        const endAngle = startAngle + segmentAngle * 0.8
        
        // Draw faint recovery outline
        ctx.strokeStyle = `rgba(100, 200, 255, ${0.1 + recoveryProgress * 0.2})`
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.lineDashOffset = -nowMs / 100
        
        ctx.beginPath()
        ctx.arc(0, 0, shieldRadius, startAngle, endAngle)
        ctx.stroke()
        
        ctx.setLineDash([]) // Reset line dash
      }
    }
    
    ctx.restore()
  }

  static getSectionStatus(state: GameState, sectionIndex: number, nowMs: number): 'active' | 'damaged' | 'recovering' {
    const { player } = state
    if (sectionIndex < 0 || sectionIndex >= this.MAX_SHIELD_PARTS) return 'damaged'
    
    const damageTime = player.shield.sectionDamageTimes[sectionIndex]
    if (damageTime === 0) return 'active'
    
    const timeSinceDamage = nowMs - damageTime
    if (timeSinceDamage >= this.SECTION_RECOVERY_TIME_MS) return 'active'
    
    return 'recovering'
  }

  static getRecoveryTimeRemaining(state: GameState, sectionIndex: number, nowMs: number): number {
    const { player } = state
    if (sectionIndex < 0 || sectionIndex >= this.MAX_SHIELD_PARTS) return 0
    
    const damageTime = player.shield.sectionDamageTimes[sectionIndex]
    if (damageTime === 0) return 0
    
    return Math.max(0, this.SECTION_RECOVERY_TIME_MS - (nowMs - damageTime))
  }
}
