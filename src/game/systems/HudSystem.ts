import { GameState } from '../../types/GameTypes'
import { ShieldSystem } from './ShieldSystem'

export class HudSystem {
  static draw(ctx: CanvasRenderingContext2D, state: GameState, nowMs: number) {
    const { player, width, height } = state
    
    // Draw hit flash overlay
    HudSystem.drawHitFlash(ctx, player, nowMs)
    
    // Draw score
    HudSystem.drawScore(ctx, player, width, height)
    
    // Draw lives as triangles
    HudSystem.drawLivesTriangles(ctx, player, width, height)
    
    // Draw shield status
    HudSystem.drawShieldStatus(ctx, player, nowMs)
    
    // Draw instructions
    HudSystem.drawInstructions(ctx, width, height, state.isPaused, state.isGameOver)
    
    // Draw pause overlay
    if (state.isPaused) {
      HudSystem.drawPauseOverlay(ctx, width, height)
    }
    
    // Draw game over overlay
    if (state.isGameOver) {
      HudSystem.drawGameOverOverlay(ctx, width, height, player.score)
    }
  }

  private static drawHitFlash(ctx: CanvasRenderingContext2D, player: any, nowMs: number) {
    const timeSinceHit = nowMs - player.lastHitMs
    if (timeSinceHit < 300) { // Flash for 300ms
      const alpha = 1 - (timeSinceHit / 300)
      ctx.fillStyle = `rgba(255, 0, 0, ${alpha * 0.3})`
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    }
  }

  private static drawScore(ctx: CanvasRenderingContext2D, player: any, _width: number, _height: number) {
    const text = `Score: ${player.score}`
    
    // Set up text style
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    
    // Draw text shadow for better readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
    
    // Draw score in top-left corner
    ctx.fillText(text, 20, 20)
    
    // Reset shadow
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  private static drawShieldStatus(ctx: CanvasRenderingContext2D, player: any, nowMs: number) {
    const y = 60 // Position below score
    
    // Draw shield parts
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    
    // Shield text with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
    
    // Count active sections and check if any are recovering
    let activeSections = 0
    let recoveringSections = 0
    let minRecoveryTime = Infinity
    
    for (let i = 0; i < 3; i++) {
      const status = ShieldSystem.getSectionStatus({ player } as GameState, i, nowMs)
      if (status === 'active') {
        activeSections++
      } else if (status === 'recovering') {
        recoveringSections++
        const timeRemaining = ShieldSystem.getRecoveryTimeRemaining({ player } as GameState, i, nowMs)
        minRecoveryTime = Math.min(minRecoveryTime, timeRemaining)
      }
    }
    
    // Draw shield indicator
    let shieldText = 'Shield: '
    let shieldColor = 'rgba(255, 255, 255, 0.8)'
    
    if (activeSections === 0 && recoveringSections > 0) {
      const secondsRemaining = Math.ceil(minRecoveryTime / 1000)
      shieldText += `Recovering in ${secondsRemaining}s...`
      shieldColor = 'rgba(255, 100, 100, 0.8)'
    } else {
      // Show active sections as filled blocks, damaged as empty
      shieldText += '■'.repeat(activeSections) + '□'.repeat(3 - activeSections)
      if (recoveringSections > 0) {
        shieldText += ` (${Math.ceil(minRecoveryTime / 1000)}s)`
        shieldColor = 'rgba(255, 255, 100, 0.8)'
      }
    }
    
    ctx.fillStyle = shieldColor
    ctx.fillText(shieldText, 20, y)
    
    // Reset shadow
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  private static drawLivesTriangles(ctx: CanvasRenderingContext2D, player: any, _width: number, _height: number) {
    const remainingLives = Math.max(0, 3 - player.deaths)
    const y = 95 // Position below score and shield
    
    // Set up text style for lives label
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    
    // Draw text shadow for better readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
    
    // Draw "Lives:" label
    ctx.fillText('Lives:', 20, y)
    
    // Draw triangles for remaining lives
    const triangleSize = 12
    const startX = 80
    const triangleY = y + 5
    
    ctx.fillStyle = remainingLives <= 1 ? 'rgba(255, 100, 100, 0.9)' : 'rgba(100, 255, 100, 0.9)'
    
    for (let i = 0; i < remainingLives; i++) {
      const x = startX + (i * (triangleSize + 8))
      
      // Draw triangle pointing up
      ctx.beginPath()
      ctx.moveTo(x, triangleY - triangleSize/2)
      ctx.lineTo(x - triangleSize/2, triangleY + triangleSize/2)
      ctx.lineTo(x + triangleSize/2, triangleY + triangleSize/2)
      ctx.closePath()
      ctx.fill()
    }
    
    // Draw empty triangles for lost lives
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.lineWidth = 1
    
    for (let i = remainingLives; i < 3; i++) {
      const x = startX + (i * (triangleSize + 8))
      
      // Draw empty triangle outline
      ctx.beginPath()
      ctx.moveTo(x, triangleY - triangleSize/2)
      ctx.lineTo(x - triangleSize/2, triangleY + triangleSize/2)
      ctx.lineTo(x + triangleSize/2, triangleY + triangleSize/2)
      ctx.closePath()
      ctx.stroke()
    }
    
    // Reset shadow
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  private static drawInstructions(ctx: CanvasRenderingContext2D, width: number, _height: number, isPaused: boolean, isGameOver: boolean) {
    let text = ''
    if (isGameOver) {
      text = 'Game Over! Press R to restart'
    } else if (isPaused) {
      text = 'PAUSED - Press SPACE to resume'
    } else {
      text = 'Move mouse to aim • Click/F/Enter to shoot • SPACE to pause • R to restart • S for screenshot'
    }
    
    // Set up text style
    ctx.font = '16px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = isGameOver ? 'rgba(255, 100, 100, 0.8)' : 'rgba(255, 255, 255, 0.4)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    
    // Draw instructions in top-center
    ctx.fillText(text, width / 2, 20)
  }

  private static drawPauseOverlay(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Dark semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, width, height)
    
    // PAUSED text
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 4
    ctx.shadowOffsetY = 4
    
    ctx.fillText('PAUSED', width / 2, height / 2)
    
    // Reset shadow
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  private static drawGameOverOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, finalScore: number) {
    // Dark semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, 0, width, height)
    
    // GAME OVER text
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = 'rgba(255, 100, 100, 0.9)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 4
    ctx.shadowOffsetY = 4
    
    ctx.fillText('GAME OVER', width / 2, height / 2 - 40)
    
    // Final score
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillText(`Final Score: ${finalScore}`, width / 2, height / 2 + 20)
    
    // Restart instruction
    ctx.font = '20px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = 'rgba(200, 200, 200, 0.8)'
    ctx.fillText('Press R to restart', width / 2, height / 2 + 80)
    
    // Reset shadow
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }
}
