import { GameState } from '../../types/GameTypes'
import { AsteroidSystem } from './AsteroidSystem'
import { ShieldSystem } from './ShieldSystem'

export class CollisionSystem {
  static update(state: GameState, _deltaSeconds: number, _nowMs: number) {
    const { bullets, asteroids, player } = state
    
    // Check bullet-asteroid collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i]
      
      // Only player bullets can destroy asteroids
      if (!bullet.isPlayerBullet) continue
      
      for (let j = asteroids.length - 1; j >= 0; j--) {
        const asteroid = asteroids[j]
        
        if (AsteroidSystem.checkCollision(bullet.x, bullet.y, asteroid)) {
          // Remove bullet
          bullets.splice(i, 1)
          
          // Damage asteroid
          if (AsteroidSystem.damageAsteroid(asteroid)) {
            // Asteroid destroyed
            asteroids.splice(j, 1)
            
            // Add score based on asteroid size
            const scoreValue = asteroid.size === 'small' ? 100 : 
                              asteroid.size === 'medium' ? 50 : 25
            player.score += scoreValue
            
            // Split asteroid if not small
            const fragments = AsteroidSystem.splitAsteroid(asteroid)
            asteroids.push(...fragments)
          }
          
          break // Bullet can only hit one asteroid
        }
      }
    }
    
    // Check player-asteroid collisions
    for (const asteroid of asteroids) {
      const dx = player.x - asteroid.x
      const dy = player.y - asteroid.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < player.radius + asteroid.radius) {
        // Player hit by asteroid
        const nowMs = performance.now()
        if (nowMs > player.invincibleUntilMs) {
          // Try to use shield first
          if (!ShieldSystem.damageShield(state, nowMs)) {
            // Shield depleted, player takes damage
            player.deaths++
            player.invincibleUntilMs = nowMs + 2000 // 2 seconds of invincibility
            player.lastHitMs = nowMs
            
            // Reset player position
            player.x = state.width / 2
            player.y = state.height / 2
          }
        }
      }
    }
  }
  
  static draw(_ctx: CanvasRenderingContext2D, _state: GameState, _nowMs: number) {
    // No visual feedback needed for collisions
  }
}
