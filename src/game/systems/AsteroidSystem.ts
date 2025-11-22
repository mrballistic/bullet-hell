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

  static draw(ctx: CanvasRenderingContext2D, state: GameState, _nowMs: number) {
    const { asteroids } = state
    
    for (const asteroid of asteroids) {
      ctx.save()
      ctx.translate(asteroid.x, asteroid.y)
      ctx.rotate(asteroid.rotation)
      
      // Draw asteroid as irregular polygon
      ctx.strokeStyle = '#666'
      ctx.fillStyle = '#333'
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

  static splitAsteroid(asteroid: Asteroid): Asteroid[] {
    if (asteroid.size === 'small') {
      return [] // Small asteroids don't split
    }
    
    const newSize = asteroid.size === 'large' ? 'medium' : 'small'
    const newRadius = this.ASTEROID_SIZES[newSize].radius
    const newSpeed = this.ASTEROID_SIZES[newSize].speed
    const fragments: Asteroid[] = []
    
    // Create 2-3 fragments
    const fragmentCount = asteroid.size === 'large' ? 3 : 2
    for (let i = 0; i < fragmentCount; i++) {
      const angle = (i / fragmentCount) * Math.PI * 2 + Math.random() * 0.5
      fragments.push({
        x: asteroid.x,
        y: asteroid.y,
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
