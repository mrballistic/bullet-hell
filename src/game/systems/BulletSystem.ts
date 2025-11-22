import { Bullet, GameState } from '../../types/GameTypes'

type BulletPattern = (state: GameState, nowMs: number) => void

export class BulletSystem {
  private static readonly PLAYER_FIRE_RATE_MS = 150 // 6.67 shots per second
  private static readonly PLAYER_BULLET_SPEED = 400
  private static patterns: BulletPattern[] = [
    BulletSystem.spawnSpiralWave,
    BulletSystem.spawnPlayerRing,
    BulletSystem.spawnSweepingArc
  ]

  static update(state: GameState, deltaSeconds: number, nowMs: number) {
    const { bullets, width, height, player, input } = state

    // Handle player shooting
    if (input.isShooting && nowMs - player.lastShotTimeMs > this.PLAYER_FIRE_RATE_MS) {
      this.spawnPlayerBullet(state)
      player.lastShotTimeMs = nowMs
    }

    // Update bullet positions
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i]
      
      // Move bullet
      bullet.x += bullet.vx * deltaSeconds
      bullet.y += bullet.vy * deltaSeconds
      
      // Update life
      bullet.life += deltaSeconds
      
      // Remove if out of bounds or expired
      if (
        bullet.life > bullet.maxLife ||
        bullet.x < -50 || bullet.x > width + 50 ||
        bullet.y < -50 || bullet.y > height + 50
      ) {
        bullets.splice(i, 1)
      }
    }

    // Spawn new enemy patterns
    BulletSystem.spawnPatterns(state, nowMs)
  }

  private static spawnPlayerBullet(state: GameState) {
    const { player, input } = state
    
    // Calculate direction from player to mouse
    const dx = input.targetX - player.x
    const dy = input.targetY - player.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance === 0) return // Avoid division by zero
    
    // Normalize direction and apply speed
    const vx = (dx / distance) * this.PLAYER_BULLET_SPEED
    const vy = (dy / distance) * this.PLAYER_BULLET_SPEED
    
    const bullet: Bullet = {
      x: player.x,
      y: player.y,
      vx,
      vy,
      life: 0,
      maxLife: 2, // Player bullets live for 2 seconds
      hueOffset: 120, // Green for player bullets
      isPlayerBullet: true
    }
    
    state.bullets.push(bullet)
  }

  private static spawnPatterns(state: GameState, nowMs: number) {
    if (nowMs - state.lastPatternTimeMs > state.nextPatternDelayMs) {
      // Choose random pattern
      const pattern = this.patterns[Math.floor(Math.random() * this.patterns.length)]
      pattern(state, nowMs)
      
      // Reset timer with random delay
      state.lastPatternTimeMs = nowMs
      state.nextPatternDelayMs = 1500 + Math.random() * 2000 // 1.5-3.5 seconds
    }
  }

  private static spawnSpiralWave(state: GameState, nowMs: number) {
    const { width, height, player } = state
    const centerX = width / 2
    const centerY = height / 2
    const bulletCount = 8 // Reduced from 12 for less density
    const speed = 120 // Slightly slower for better dodgeability
    const safeRadius = 60 // Safe zone around player
    
    // Check if player is too close to center, adjust spawn position if needed
    const distToPlayer = Math.sqrt(Math.pow(player.x - centerX, 2) + Math.pow(player.y - centerY, 2))
    let spawnX = centerX
    let spawnY = centerY
    
    if (distToPlayer < safeRadius) {
      // Offset spawn position away from player
      const angleAwayFromPlayer = Math.atan2(centerY - player.y, centerX - player.x)
      const offsetDistance = safeRadius - distToPlayer + 20
      spawnX = centerX + Math.cos(angleAwayFromPlayer) * offsetDistance
      spawnY = centerY + Math.sin(angleAwayFromPlayer) * offsetDistance
    }
    
    for (let i = 0; i < bulletCount; i++) {
      const angle = (i / bulletCount) * Math.PI * 2 + (nowMs / 800) // Slower rotation
      const bullet: Bullet = {
        x: spawnX,
        y: spawnY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 10, // Longer lifetime for more screen coverage
        hueOffset: (i / bulletCount) * 60,
        isPlayerBullet: false
      }
      state.bullets.push(bullet)
    }
  }

  private static spawnPlayerRing(state: GameState, _nowMs: number) {
    const { player, width, height } = state
    const bulletCount = 16
    const speed = 120
    const safeRadius = 80 // Minimum distance from player to spawn bullets
    
    // Calculate ring position at safe distance from player
    const angleToPlayer = Math.atan2(player.y - height/2, player.x - width/2)
    const ringDistance = Math.max(safeRadius, 150) // At least 150px from center, but keep safe distance from player
    const ringX = width/2 + Math.cos(angleToPlayer) * ringDistance
    const ringY = height/2 + Math.sin(angleToPlayer) * ringDistance
    
    // Ensure ring stays within screen bounds
    const clampedX = Math.max(50, Math.min(width - 50, ringX))
    const clampedY = Math.max(50, Math.min(height - 50, ringY))
    
    for (let i = 0; i < bulletCount; i++) {
      const angle = (i / bulletCount) * Math.PI * 2
      const bullet: Bullet = {
        x: clampedX,
        y: clampedY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 6,
        hueOffset: 180, // Blue-ish bullets for player ring
        isPlayerBullet: false
      }
      state.bullets.push(bullet)
    }
  }

  private static spawnSweepingArc(state: GameState, _nowMs: number) {
    const { width, height } = state
    const fromLeft = Math.random() > 0.5
    const bulletCount = 8
    const speed = 180
    
    const startY = height * 0.2 + Math.random() * height * 0.6
    const baseAngle = fromLeft ? 0 : Math.PI
    
    for (let i = 0; i < bulletCount; i++) {
      const angleOffset = (i - bulletCount / 2) * 0.15 // Create arc
      const angle = baseAngle + angleOffset
      const x = fromLeft ? -20 : width + 20
      const y = startY + i * 15
      
      const bullet: Bullet = {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.3, // Slight vertical component
        life: 0,
        maxLife: 7,
        hueOffset: 300, // Purple-ish bullets for sweeping arc
        isPlayerBullet: false
      }
      state.bullets.push(bullet)
    }
  }

  static draw(ctx: CanvasRenderingContext2D, state: GameState, nowMs: number) {
    const { bullets } = state
    
    for (const bullet of bullets) {
      // Color based on time + bullet's hueOffset
      const hue = (nowMs / 30 + bullet.hueOffset) % 360
      const alpha = Math.max(0, 1 - (bullet.life / bullet.maxLife) * 0.5)
      
      // Neon glow effect
      ctx.shadowBlur = 15
      ctx.shadowColor = `hsl(${hue}, 100%, 50%)`
      
      // Draw bullet
      ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha})`
      ctx.beginPath()
      ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2)
      ctx.fill()
      
      // Inner bright core
      ctx.fillStyle = `hsla(${hue}, 100%, 80%, ${alpha * 1.5})`
      ctx.beginPath()
      ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // Reset shadow
    ctx.shadowBlur = 0
  }
}
