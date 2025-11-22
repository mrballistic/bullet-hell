<template>
  <div class="app">
    <GameCanvas />
  </div>
</template>

<script setup lang="ts">
import GameCanvas from './components/GameCanvas.vue'
</script>

<style scoped>
.app {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
