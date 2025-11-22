import { GameState } from '../../types/GameTypes'
import { AsteroidSystem } from './AsteroidSystem'
import { ShieldSystem } from './ShieldSystem'
import { ExplosionSystem } from './ExplosionSystem'

export class CollisionSystem {
  static update(state: GameState, _deltaSeconds: number, nowMs: number) {
    const { bullets, asteroids, player } = state
    
    // Check bullet-asteroid collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i]
      
      // Only player bullets can destroy asteroids
      if (!bullet.isPlayerBullet) continue
      
      for (let j = asteroids.length - 1; j >= 0; j--) {
        const asteroid = asteroids[j]
        
        if (AsteroidSystem.checkCollision(bullet.x, bullet.y, asteroid)) {
          // Create explosion at bullet hit point
          const explosionHue = 120 + Math.random() * 60 // Green to yellow range for player bullets
          const explosionParticles = ExplosionSystem.createExplosion(bullet.x, bullet.y, 8, explosionHue, 'bullet')
          state.explosionParticles.push(...explosionParticles)
          
          // Remove bullet
          bullets.splice(i, 1)
          
          // Damage asteroid
          if (AsteroidSystem.damageAsteroid(asteroid)) {
            // Asteroid destroyed - create bigger explosion
            const asteroidHue = asteroid.size === 'large' ? 30 : asteroid.size === 'medium' ? 45 : 15
            const asteroidExplosion = ExplosionSystem.createExplosion(asteroid.x, asteroid.y, 15, asteroidHue, 'asteroid')
            state.explosionParticles.push(...asteroidExplosion)
            
            asteroids.splice(j, 1)
            
            // Add score based on asteroid size
            const scoreValue = asteroid.size === 'small' ? 100 : 
                              asteroid.size === 'medium' ? 50 : 25
            player.score += scoreValue
            
            // Split asteroid if not small
            const fragments = AsteroidSystem.splitAsteroid(asteroid, player.x, player.y)
            asteroids.push(...fragments)
          }
          
          break // Bullet can only hit one asteroid
        }
      }
    }
    
    // Check enemy bullet-player collisions (with shield)
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i]
      
      // Only enemy bullets can hurt player
      if (bullet.isPlayerBullet) continue
      
      // Calculate bullet age in milliseconds
      const bulletAge = nowMs - bullet.createdAtMs
      
      // Check shield collision first
      const shieldBlocked = ShieldSystem.checkShieldCollision(state, bullet.x, bullet.y, nowMs)
      if (shieldBlocked) {
        bullets.splice(i, 1)
        continue
      }
      
      // Check if bullet hits player directly
      const dx = bullet.x - player.x
      const dy = bullet.y - player.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < player.radius) {
        // Bullet penetrated shield and hit player
        const bulletType = bullet.hueOffset === 180 ? 'Ring' : 
                          bullet.hueOffset === 300 ? 'Arc' : 
                          bullet.hueOffset < 60 ? 'Spiral' : 'Unknown'
        
        console.log(`🎯 HIT by ${bulletType} bullet! Age: ${Math.ceil(bulletAge)}ms, Pos: (${Math.round(bullet.x)}, ${Math.round(bullet.y)}), Shield: ${player.shield.parts}/3`)
        
        // Flag suspiciously new bullets
        if (bulletAge < 100) {
          console.log(`🚨 SUSPICIOUS: Bullet spawned too close! (${Math.ceil(bulletAge)}ms old)`)
        }
        
        if (nowMs > player.invincibleUntilMs) {
          player.deaths++
          player.invincibleUntilMs = nowMs + 2000 // 2 seconds of invincibility
          player.lastHitMs = nowMs
          
          // Reset player position
          player.x = state.width / 2
          player.y = state.height / 2
          
          console.log(`💀 Death ${player.deaths}/3`)
        }
        
        // Remove bullet after hit
        bullets.splice(i, 1)
      }
    }
    
    // Check player-asteroid collisions (without shield for now)
    for (const asteroid of asteroids) {
      const dx = player.x - asteroid.x
      const dy = player.y - asteroid.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < player.radius + asteroid.radius) {
        console.log(`☄️ HIT by ${asteroid.size} asteroid! Pos: (${Math.round(asteroid.x)}, ${Math.round(asteroid.y)}), Shield: ${player.shield.parts}/3`)
        
        if (nowMs > player.invincibleUntilMs) {
          player.deaths++
          player.invincibleUntilMs = nowMs + 2000 // 2 seconds of invincibility
          player.lastHitMs = nowMs
          
          // Reset player position
          player.x = state.width / 2
          player.y = state.height / 2
          
          console.log(`💀 Death ${player.deaths}/3`)
        }
      }
    }
  }
  
  static draw(_ctx: CanvasRenderingContext2D, _state: GameState, _nowMs: number) {
    // No visual feedback needed for collisions
  }
}
