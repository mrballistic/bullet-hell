import { GameState } from '../../types/GameTypes'
import { ShieldSystem } from './ShieldSystem'

export class HudSystem {
  static draw(ctx: CanvasRenderingContext2D, state: GameState, nowMs: number) {
    const { player, width, height } = state
    
    // Draw hit flash overlay
    HudSystem.drawHitFlash(ctx, player, nowMs)
    
    // Draw score
    HudSystem.drawScore(ctx, player, width, height)
    
    // Draw shield status
    HudSystem.drawShieldStatus(ctx, player, nowMs)
    
    // Draw deaths counter
    HudSystem.drawDeathsCounter(ctx, player, width, height)
    
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
    const { shield } = player
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
    
    // Draw shield indicator
    let shieldText = 'Shield: '
    let shieldColor = 'rgba(255, 255, 255, 0.8)'
    
    if (shield.parts === 0) {
      const timeRemaining = ShieldSystem.getRegenerationTimeRemaining({ player } as GameState, nowMs)
      const secondsRemaining = Math.ceil(timeRemaining / 1000)
      shieldText += `Regenerating in ${secondsRemaining}s...`
      shieldColor = 'rgba(255, 100, 100, 0.8)'
    } else {
      shieldText += '■'.repeat(shield.parts) + '□'.repeat(3 - shield.parts)
      if (ShieldSystem.isRegeneratingSoon({ player } as GameState, nowMs)) {
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

  private static drawDeathsCounter(ctx: CanvasRenderingContext2D, player: any, width: number, height: number) {
    const remainingLives = Math.max(0, 3 - player.deaths)
    const text = `Lives: ${remainingLives}/3`
    
    // Set up text style
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = remainingLives <= 1 ? 'rgba(255, 100, 100, 0.9)' : 'rgba(255, 255, 255, 0.8)'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    
    // Draw text shadow for better readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
    
    // Draw deaths counter in bottom-right corner
    ctx.fillText(text, width - 20, height - 20)
    
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
