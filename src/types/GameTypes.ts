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
  isPlayerBullet: boolean // distinguish between enemy and player bullets
  createdAtMs: number // Timestamp when bullet was created
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
  rotation: number // Ship rotation in radians
  invincibleUntilMs: number
  lastHitMs: number
  deaths: number
  lastShotTimeMs: number
  score: number
  shield: {
    parts: number // 0-3 shield parts remaining
    sectionDamageTimes: number[] // Track when each section was last hit [section1, section2, section3]
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
