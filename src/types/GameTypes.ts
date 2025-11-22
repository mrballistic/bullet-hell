export interface FlowParticle {
  x: number
  y: number
  life: number // 0–1, respawn when <= 0
}

export interface Bullet {
  x: number
  y: number
  vx: number
  vy: number
  life: number // seconds alive
  maxLife: number // seconds until despawn
  hueOffset: number // for color variety
  isPlayerBullet?: boolean // distinguish between enemy and player bullets
}

export interface Asteroid {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  rotation: number
  rotationSpeed: number
  size: 'small' | 'medium' | 'large'
  health: number
}

export interface Player {
  x: number
  y: number
  radius: number
  invincibleUntilMs: number
  lastHitMs: number
  deaths: number
  lastShotTimeMs: number
  score: number
  shield: {
    parts: number // 0-3 shield parts remaining
    lastDamageTimeMs: number // Track when shield was last hit for regeneration
    isRegenerating: boolean
  }
}

export interface InputState {
  targetX: number
  targetY: number
  isShooting: boolean
}

export interface GameConfig {
  flowParticleCount: number
  maxBullets: number
  playerRadius: number
  playerSpeed: number
}

export interface GameState {
  bullets: Bullet[]
  asteroids: Asteroid[]
  flowParticles: FlowParticle[]
  player: Player
  input: InputState
  lastPatternTimeMs: number
  nextPatternDelayMs: number
  lastFrameTimeMs: number
  width: number
  height: number
  isPaused: boolean
  isGameOver: boolean
}
