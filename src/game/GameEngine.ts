import { GameState, GameConfig } from '../types/GameTypes'
import { FlowFieldSystem } from './systems/FlowFieldSystem'
import { PlayerSystem } from './systems/PlayerSystem'
import { BulletSystem } from './systems/BulletSystem'
import { AsteroidSystem } from './systems/AsteroidSystem'
import { CollisionSystem } from './systems/CollisionSystem'
import { ShieldSystem } from './systems/ShieldSystem'
import { HudSystem } from './systems/HudSystem'

export class GameEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private config: GameConfig
  private state: GameState
  private animationId: number | null = null
  private lastFrameTimeMs: number = 0
  private lastLoggedDeaths: number = 0

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get 2D context')
    }
    this.ctx = ctx

    // Initialize game configuration
    this.config = {
      flowParticleCount: 800, // More particles for richer background
      maxBullets: 600,
      playerRadius: 12, // Slightly smaller for tighter dodging
      playerSpeed: 300
    }

    // Initialize game state
    this.state = this.initializeState()
    this.lastLoggedDeaths = this.state.player.deaths
  }

  private initializeState(): GameState {
    return {
      bullets: [],
      asteroids: AsteroidSystem.initialize(5, this.canvas.width, this.canvas.height),
      flowParticles: FlowFieldSystem.initialize(this.config.flowParticleCount, this.canvas.width, this.canvas.height),
      player: {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        radius: this.config.playerRadius,
        rotation: 0, // Initial rotation pointing up
        invincibleUntilMs: 0,
        lastHitMs: 0,
        deaths: 0,
        lastShotTimeMs: 0,
        score: 0,
        shield: {
          parts: 3,
          sectionDamageTimes: [0, 0, 0] // All sections initially active
        }
      },
      input: {
        targetX: this.canvas.width / 2,
        targetY: this.canvas.height / 2,
        isShooting: false
      },
      lastPatternTimeMs: 0,
      nextPatternDelayMs: 2000,
      lastFrameTimeMs: 0,
      width: this.canvas.width,
      height: this.canvas.height,
      isPaused: false,
      isGameOver: false
    }
  }

  start() {
    this.lastFrameTimeMs = performance.now()
    this.gameLoop()
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  private gameLoop = () => {
    const nowMs = performance.now()
    const deltaMs = nowMs - this.lastFrameTimeMs
    const deltaSeconds = Math.min(deltaMs / 1000, 0.1) // Cap to avoid large jumps
    
    this.lastFrameTimeMs = nowMs

    this.update(deltaSeconds, nowMs)
    this.render(nowMs)

    this.animationId = requestAnimationFrame(this.gameLoop)
  }

  private update(deltaSeconds: number, nowMs: number) {
    // Skip updates if paused or game over
    if (this.state.isPaused || this.state.isGameOver) return
    
    // Update flow field system
    FlowFieldSystem.update(this.state, deltaSeconds, nowMs)
    
    // Update player system
    PlayerSystem.update(this.state, deltaSeconds, nowMs)
    
    // Update bullet system
    BulletSystem.update(this.state, deltaSeconds, nowMs)
    
    // Update asteroid system
    AsteroidSystem.update(this.state, deltaSeconds, nowMs)
    
    // Update collision system
    CollisionSystem.update(this.state, deltaSeconds, nowMs)
    
    // Update shield system
    ShieldSystem.update(this.state, deltaSeconds, nowMs)
    
    // Check for game over (3 deaths)
    if (this.state.player.deaths >= 3) {
      console.log(`🎮 GAME OVER TRIGGERED! Deaths: ${this.state.player.deaths}, Shield: ${this.state.player.shield.parts}`)
      this.state.isGameOver = true
    }
    
    // Log any unexpected death changes
    if (this.state.player.deaths !== this.lastLoggedDeaths) {
      console.log(`⚠️ DEATH CHANGED! Was: ${this.lastLoggedDeaths}, Now: ${this.state.player.deaths}`)
      this.lastLoggedDeaths = this.state.player.deaths
    }
  }

  private render(nowMs: number) {
    const { ctx, canvas } = this
    
    // Clear canvas with semi-transparent fill for trails
    ctx.fillStyle = 'rgba(2, 3, 10, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw flow field
    FlowFieldSystem.draw(ctx, this.state, nowMs)
    
    // Draw asteroids
    if (this.state.asteroids && Array.isArray(this.state.asteroids)) {
      AsteroidSystem.draw(ctx, this.state.asteroids, nowMs)
    }
    
    // Draw bullets
    BulletSystem.draw(ctx, this.state, nowMs)
    
    // Draw player
    PlayerSystem.draw(ctx, this.state, nowMs)
    
    // Draw shield (on top of player)
    ShieldSystem.draw(ctx, this.state, nowMs)
    
    // Draw HUD (on top of everything)
    HudSystem.draw(ctx, this.state, nowMs)
  }

  updateInput(targetX: number, targetY: number) {
    this.state.input.targetX = targetX
    this.state.input.targetY = targetY
  }

  updateShooting(isShooting: boolean) {
    this.state.input.isShooting = isShooting
  }

  handleResize(width: number, height: number) {
    this.state.width = width
    this.state.height = height
    
    // Reinitialize flow particles for new dimensions
    this.state.flowParticles = FlowFieldSystem.initialize(
      this.config.flowParticleCount, 
      width, 
      height
    )
    
    // Reinitialize asteroids for new dimensions
    this.state.asteroids = AsteroidSystem.initialize(5, width, height)
  }

  togglePause() {
    this.state.isPaused = !this.state.isPaused
  }

  restart() {
    // Reset game state but keep dimensions
    const { width, height } = this.state
    this.state = this.initializeState()
    this.state.width = width
    this.state.height = height
    
    // Reinitialize flow particles for current dimensions
    this.state.flowParticles = FlowFieldSystem.initialize(
      this.config.flowParticleCount, 
      width, 
      height
    )
    
    // Reinitialize asteroids for current dimensions
    this.state.asteroids = AsteroidSystem.initialize(5, width, height)
  }

  isPaused(): boolean {
    return this.state.isPaused
  }

  takeScreenshot() {
    // Create a download link for the canvas
    this.canvas.toBlob((blob) => {
      if (!blob) return
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `neon-bullet-hell-${Date.now()}.png`
      link.click()
      
      // Clean up
      URL.revokeObjectURL(url)
    })
  }
}
