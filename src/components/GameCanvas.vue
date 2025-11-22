<template>
  <canvas ref="canvasRef" class="game-canvas"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { GameEngine } from '../game/GameEngine'

const canvasRef = ref<HTMLCanvasElement>()

let gameEngine: GameEngine | null = null

const handleMouseMove = (event: MouseEvent) => {
  if (!gameEngine) return
  gameEngine.updateInput(event.clientX, event.clientY)
}

const handleMouseDown = (event: MouseEvent) => {
  if (!gameEngine) return
  if (event.button === 0) { // Left click
    gameEngine.updateShooting(true)
  }
}

const handleMouseUp = (event: MouseEvent) => {
  if (!gameEngine) return
  if (event.button === 0) { // Left click
    gameEngine.updateShooting(false)
  }
}

const handleTouchMove = (event: TouchEvent) => {
  if (!gameEngine) return
  event.preventDefault()
  const touch = event.touches[0]
  gameEngine.updateInput(touch.clientX, touch.clientY)
  gameEngine.updateShooting(true)
}

const handleTouchEnd = (event: TouchEvent) => {
  if (!gameEngine) return
  event.preventDefault()
  gameEngine.updateShooting(false)
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (!gameEngine) return
  
  switch (event.key.toLowerCase()) {
    case ' ':
      event.preventDefault()
      gameEngine.togglePause()
      break
    case 'r':
      event.preventDefault()
      gameEngine.restart()
      break
    case 's':
      event.preventDefault()
      gameEngine.takeScreenshot()
      break
    case 'f':
    case 'enter':
      event.preventDefault()
      gameEngine.updateShooting(true)
      break
  }
}

const handleKeyUp = (event: KeyboardEvent) => {
  if (!gameEngine) return
  
  switch (event.key.toLowerCase()) {
    case 'f':
    case 'enter':
      event.preventDefault()
      gameEngine.updateShooting(false)
      break
  }
}

onMounted(() => {
  if (!canvasRef.value) return
  
  const canvas = canvasRef.value
  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    gameEngine?.handleResize(window.innerWidth, window.innerHeight)
  }
  
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  
  // Initialize game engine
  gameEngine = new GameEngine(canvas)
  gameEngine.start()
  
  // Add input listeners
  canvas.addEventListener('mousemove', handleMouseMove)
  canvas.addEventListener('mousedown', handleMouseDown)
  canvas.addEventListener('mouseup', handleMouseUp)
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
  canvas.addEventListener('touchend', handleTouchEnd, { passive: false })
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  
  onUnmounted(() => {
    window.removeEventListener('resize', resizeCanvas)
    canvas.removeEventListener('mousemove', handleMouseMove)
    canvas.removeEventListener('mousedown', handleMouseDown)
    canvas.removeEventListener('mouseup', handleMouseUp)
    canvas.removeEventListener('touchmove', handleTouchMove)
    canvas.removeEventListener('touchend', handleTouchEnd)
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    gameEngine?.stop()
    gameEngine = null
  })
})
</script>

<style scoped>
.game-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
