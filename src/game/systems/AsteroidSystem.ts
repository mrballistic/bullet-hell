import { Asteroid, GameState } from '../../types/GameTypes'

export class AsteroidSystem {
  private static readonly ASTEROID_SIZES = {
    small: { radius: 15, health: 1, speed: 150 },
    medium: { radius: 25, health: 2, speed: 100 },
    large: { radius: 40, health: 3, speed: 60 }
  }

  static initialize(count: number, width: number, height: number): Asteroid[] {
    const asteroids: Asteroid[] = []
    
    for (let i = 0; i < count; i++) {
      asteroids.push(this.createAsteroid(width, height))
    }
    
    return asteroids
  }

  private static createAsteroid(width: number, height: number): Asteroid {
    const size = ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as 'small' | 'medium' | 'large'
    const sizeConfig = this.ASTEROID_SIZES[size]
    
    // Spawn from edges
    const edge = Math.floor(Math.random() * 4)
    let x = 0, y = 0, vx = 0, vy = 0
    
    switch (edge) {
      case 0: // top
        x = Math.random() * width
        y = -sizeConfig.radius
        vx = (Math.random() - 0.5) * sizeConfig.speed
        vy = Math.random() * sizeConfig.speed
        break
      case 1: // right
        x = width + sizeConfig.radius
        y = Math.random() * height
        vx = -Math.random() * sizeConfig.speed
        vy = (Math.random() - 0.5) * sizeConfig.speed
        break
      case 2: // bottom
        x = Math.random() * width
        y = height + sizeConfig.radius
        vx = (Math.random() - 0.5) * sizeConfig.speed
        vy = -Math.random() * sizeConfig.speed
        break
      case 3: // left
        x = -sizeConfig.radius
        y = Math.random() * height
        vx = Math.random() * sizeConfig.speed
        vy = (Math.random() - 0.5) * sizeConfig.speed
        break
    }
    
    return {
      x,
      y,
      vx,
      vy,
      radius: sizeConfig.radius,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 2,
      size,
      health: sizeConfig.health
    }
  }

  static update(state: GameState, deltaSeconds: number, _nowMs: number) {
    const { asteroids, width, height } = state

    // Update asteroid positions
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const asteroid = asteroids[i]
      
      // Move asteroid
      asteroid.x += asteroid.vx * deltaSeconds
      asteroid.y += asteroid.vy * deltaSeconds
      asteroid.rotation += asteroid.rotationSpeed * deltaSeconds
      
      // Remove if out of bounds (with generous margin)
      if (
        asteroid.x < -100 || asteroid.x > width + 100 ||
        asteroid.y < -100 || asteroid.y > height + 100
      ) {
        asteroids.splice(i, 1)
      }
    }

    // Spawn new asteroids to maintain minimum count
    const minAsteroids = 5
    if (asteroids.length < minAsteroids && Math.random() < 0.02) {
      asteroids.push(this.createAsteroid(width, height))
    }
  }

  static draw(ctx: CanvasRenderingContext2D, asteroids: Asteroid[], nowMs: number) {
    if (!asteroids || !Array.isArray(asteroids)) {
      return // Safety check - don't draw if asteroids is not an array
    }
    
    for (const asteroid of asteroids) {
      ctx.save()
      ctx.translate(asteroid.x, asteroid.y)
      ctx.rotate(asteroid.rotation)
      
      // Glowy asteroid colors based on size
      let hue, glowColor, fillColor
      if (asteroid.size === 'large') {
        hue = 30 // Orange-ish
        glowColor = `hsl(${hue}, 80%, 50%)`
        fillColor = `hsl(${hue}, 60%, 25%)`
      } else if (asteroid.size === 'medium') {
        hue = 45 // Yellow-ish
        glowColor = `hsl(${hue}, 70%, 45%)`
        fillColor = `hsl(${hue}, 50%, 20%)`
      } else {
        hue = 15 // Red-orange-ish
        glowColor = `hsl(${hue}, 90%, 55%)`
        fillColor = `hsl(${hue}, 70%, 15%)`
      }
      
      // Pulsing glow effect
      const pulse = Math.sin(nowMs / 300 + asteroid.rotation) * 0.2 + 0.8
      
      // Draw outer glow
      ctx.shadowBlur = 20 * pulse
      ctx.shadowColor = glowColor
      
      // Draw asteroid as irregular polygon with glow
      ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${0.8 * pulse})`
      ctx.fillStyle = fillColor
      ctx.lineWidth = 2
      
      ctx.beginPath()
      const vertices = 8
      for (let i = 0; i < vertices; i++) {
        const angle = (i / vertices) * Math.PI * 2
        const radiusVariation = 0.8 + Math.sin(i * 1.7) * 0.2
        const x = Math.cos(angle) * asteroid.radius * radiusVariation
        const y = Math.sin(angle) * asteroid.radius * radiusVariation
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      
      // Add some glowing cracks/details
      ctx.shadowBlur = 5
      ctx.shadowColor = glowColor
      ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${0.4 * pulse})`
      ctx.lineWidth = 1
      
      // Draw some surface details
      for (let i = 0; i < 3; i++) {
        const detailAngle = (i / 3) * Math.PI * 2 + nowMs / 1000
        const detailRadius = asteroid.radius * 0.3
        const x1 = Math.cos(detailAngle) * detailRadius
        const y1 = Math.sin(detailAngle) * detailRadius
        const x2 = Math.cos(detailAngle + 0.5) * detailRadius * 0.7
        const y2 = Math.sin(detailAngle + 0.5) * detailRadius * 0.7
        
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
      
      ctx.restore()
    }
  }

  static checkCollision(bulletX: number, bulletY: number, asteroid: Asteroid): boolean {
    const dx = bulletX - asteroid.x
    const dy = bulletY - asteroid.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance < asteroid.radius
  }

  static damageAsteroid(asteroid: Asteroid, damage: number = 1): boolean {
    asteroid.health -= damage
    return asteroid.health <= 0
  }

  static splitAsteroid(asteroid: Asteroid, playerX: number, playerY: number): Asteroid[] {
    if (asteroid.size === 'small') {
      return [] // Small asteroids don't split
    }
    
    const newSize = asteroid.size === 'large' ? 'medium' : 'small'
    const newRadius = this.ASTEROID_SIZES[newSize].radius
    const newSpeed = this.ASTEROID_SIZES[newSize].speed
    const fragments: Asteroid[] = []
    const SAFETY_ZONE = 100 // Minimum distance from player
    
    // Create 2-3 fragments
    const fragmentCount = asteroid.size === 'large' ? 3 : 2
    for (let i = 0; i < fragmentCount; i++) {
      let fragmentX = asteroid.x
      let fragmentY = asteroid.y
      
      // Check if original position is within safety zone
      const dx = asteroid.x - playerX
      const dy = asteroid.y - playerY
      const distanceToPlayer = Math.sqrt(dx * dx + dy * dy)
      
      if (distanceToPlayer < SAFETY_ZONE) {
        // Move fragment outside safety zone
        const angleAwayFromPlayer = Math.atan2(dy, dx)
        const pushDistance = SAFETY_ZONE - distanceToPlayer + 20 // Push extra 20px beyond safety zone
        fragmentX = asteroid.x + Math.cos(angleAwayFromPlayer) * pushDistance
        fragmentY = asteroid.y + Math.sin(angleAwayFromPlayer) * pushDistance
      }
      
      const angle = (i / fragmentCount) * Math.PI * 2 + Math.random() * 0.5
      fragments.push({
        x: fragmentX,
        y: fragmentY,
        vx: Math.cos(angle) * newSpeed + asteroid.vx * 0.5,
        vy: Math.sin(angle) * newSpeed + asteroid.vy * 0.5,
        radius: newRadius,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 3,
        size: newSize,
        health: this.ASTEROID_SIZES[newSize].health
      })
    }
    
    return fragments
  }
}
