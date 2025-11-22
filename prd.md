

## 1. PRD – “Neon Bullet Hell + Magic Ink”

### 1.1 Product Summary

A **browser-based 2D bullet hell game** with:

* A **flowing, “magic ink” background** driven by a vector field.
* **Neon bullet patterns** (spirals, rings, sweeping arcs).
* A **player ship following the cursor**, dodging bullets.
* Focused on **visual wow + tight, responsive feel** more than complex gameplay.

Deployed as a **single-page web app**.

---

### 1.2 Goals & Non-goals

**Goals**

* Look and feel like a **modern, demoscene-style bullet hell toy**.
* Run smoothly at **60 FPS on modern laptops**.
* Simple controls: **mouse/touch only**.
* Easy to share: open a URL → instantly in the game.

**Non-goals (for v1)**

* No mobile-optimized deep UX (it should work, but not polished).
* No content system / level editor.
* No backend, accounts, saves, or multiplayer.
* No complex enemies or story.

---

### 1.3 Target User & Use Cases

**User**

* Devs / designers / friends you want to impress with a flashy game in a browser.
* Anyone who likes “screensaver but interactive” experiences.

**Use cases**

* “Quick wow” demo in a meeting or talk.
* Playground to later plug in:

  * Audio-reactive backgrounds,
  * More bullet patterns,
  * Additional game modes.

---

### 1.4 Core Experience

**Controls**

* Mouse / touch controls **player ship**.
* Ship smoothly lerps toward cursor position.

**Gameplay loop**

* Bullets repeatedly spawn in aesthetic patterns:

  * Spiral waves from the center.
  * Rings around the player.
  * Horizontal / diagonal sweeping arcs.
* Player tries to **avoid being hit**.
* On hit:

  * Flash / screen effect.
  * Increment “deaths”.
  * Brief invincibility window.

**Visuals**

* Dark background (`#02030a`-ish).
* Magic-ink particle field:

  * Hundreds of small points moving along a pseudo-noise vector field.
  * Long trails, color-cycling hues.
* Neon bullets:

  * Glowy circles with additive blending feel.
* Player:

  * Glowing triangle, slight wobble, color shifting.

---

### 1.5 v1 Feature List

**Must-have**

1. **Game loop**

   * `requestAnimationFrame` loop.
   * Frame time delta for smooth motion.

2. **Magic ink background**

   * Particle system with position + velocity derived from vector field function.
   * Soft trails (semi-transparent rect clear).
   * Color-cycling.

3. **Bullet system**

   * Bullet model: position, velocity, life, maxLife, hueOffset.
   * Patterns:

     * Center spiral wave.
     * Ring around player.
     * Sweeping arc from left/right.
   * Spawn scheduler with random pattern selection.

4. **Player system**

   * Player follows mouse (or touch) with smoothing.
   * Collision detection (circle-circle).
   * Invincibility frames + “blink” effect.

5. **HUD/UI**

   * Death counter.
   * Minimal help text (e.g., “Move mouse to dodge”).

6. **Responsive canvas**

   * Fullscreen canvas.
   * Resize handling.
   * DevicePixelRatio aware.

**Nice-to-have (Stretch)**

* Audio-reactive bullet parameters or background.
* Pause / restart button.
* Difficulty setting (bullet speed, density).
* Mobile-specific tweaks (larger hitbox, slower bullets).
* Screenshot button (download current frame).

---

## 2. Design Doc

### 2.1 Tech Stack

* **Framework:** Vue 3 (Composition API)
* **Bundler:** Vite
* **Language:** TypeScript
* **Rendering:** `<canvas>` 2D context
* **State:** Local component state (no global store needed)

Reasoning:

* Vite + Vue 3 → simple, fast, minimal boilerplate.
* Only one core interactive surface (canvas), so we keep Vue for UI shell & lifecycle.

---

### 2.2 High-level Architecture

**App structure**

* `App.vue`

  * High-level layout, theme, and wrapper.
  * Contains `GameCanvas` and simple HUD controls.

* `components/GameCanvas.vue`

  * Holds `<canvas>`, mouse listeners, resize listener.
  * On mount: initialize `GameEngine`.
  * On unmount: stop game loop and clean up.

* `game/GameEngine.ts`

  * Core game loop + systems orchestrator.
  * Responsible for:

    * Maintaining game state.
    * Updating systems each frame.
    * Drawing to canvas.

* `game/systems/*`

  * `FlowFieldSystem.ts` – magic ink background.
  * `BulletSystem.ts` – bullet patterns + updates + render.
  * `PlayerSystem.ts` – player movement + collision.
  * `HudSystem.ts` – HUD drawing (deaths, hit flash overlays).

* `types/GameTypes.ts`

  * Shared interfaces (Player, Bullet, FlowParticle, GameConfig).

---

### 2.3 Data Model

**Bullet**

```ts
interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;      // seconds alive
  maxLife: number;   // seconds until despawn
  hueOffset: number; // for color variety
}
```

**Flow field particle**

```ts
interface FlowParticle {
  x: number;
  y: number;
  life: number; // 0–1, respawn when <= 0
}
```

**Player**

```ts
interface Player {
  x: number;
  y: number;
  radius: number;
  invincibleUntilMs: number;
  lastHitMs: number;
  deaths: number;
}
```

**Game state (engine internal)**

```ts
interface GameState {
  bullets: Bullet[];
  flowParticles: FlowParticle[];
  player: Player;
  lastPatternTimeMs: number;
  nextPatternDelayMs: number;
  lastFrameTimeMs: number;
}
```

---

### 2.4 Game Loop & Systems Interaction

**Loop (simplified)**

1. Compute `now` and `deltaSeconds`.
2. Clear canvas with semi-transparent fill (for trails).
3. Update systems:

   * `FlowFieldSystem.update(state, deltaSeconds, now)`
   * `BulletSystem.update(state, deltaSeconds, now)`
   * `PlayerSystem.update(state, deltaSeconds, now, input)`
4. Draw systems (order matters for layering):

   * `FlowFieldSystem.draw(ctx, state, now)`
   * `BulletSystem.draw(ctx, state, now)`
   * `PlayerSystem.draw(ctx, state, now)`
   * `HudSystem.draw(ctx, state, now)`

Schedulers like bullet patterns live in `BulletSystem`, using `lastPatternTimeMs` and `nextPatternDelayMs`.

---

### 2.5 Bullet Pattern Design

Patterns will be stateless functions using current time / player position:

```ts
type BulletPattern = (state: GameState, nowMs: number) => void;
```

* **SpiralWave**

  * Center = screen center.
  * `angle = baseAngle + (i / count) * 2π + timeTerm`.
  * Speed tuned for nice outward motion.

* **PlayerRing**

  * Center = `player.x/y`.
  * All bullets spawn as a ring radiating outward.

* **SweepingArc**

  * Spawn line off-screen left or right.
  * Angles form an arc so bullets converge / diverge slightly.

`BulletSystem` chooses a pattern when `nowMs - lastPatternTimeMs > nextPatternDelayMs`.

---

### 2.6 Input & Responsiveness

* `GameCanvas.vue`:

  * `mousemove` & `touchmove` listeners
  * Maintains a simple `inputState: { targetX, targetY }`
  * Passes input reference to `GameEngine`.

* `PlayerSystem`:

  * Lerp towards `targetX/Y` each frame using frame-rate-independent smoothing.

* Resize:

  * Handle `window.resize` in `GameCanvas`.
  * Update canvas size + notify `GameEngine` of new width/height (so vector field adapts).

---

### 2.7 Performance Considerations

* Limit bullet count and flow particles to a reasonable maximum (e.g., 600 bullets, 600 flows).
* Use **array reuse** where possible (recycle bullet objects) in future optimizations.
* Avoid allocations inside tight loops where possible (we can micro-opt later).
* Use a `clamp(deltaMs, max)` to avoid big leaps after tab-inactive.

---

### 2.8 Future Extensions (Post-v1)

* Audio-reactive behavior via Web Audio (FFT → drive hues / speeds).
* Settings panel:

  * Bullet density slider.
  * Background intensity.
  * Color palette switcher.
* “Zen” mode vs “Hardcore” mode.
* Touch controls tuning on mobile.

---

## 3. Task List

I’ll organize tasks by phases, roughly in the order you’d do them.

### Phase 0 – Project Setup

1. **Bootstrap Vue + Vite + TS project**

   * `npm create vite@latest neon-bullet-hell -- --template vue-ts`
   * Install dependencies, set up basic `App.vue`.

2. **Add basic global styles**

   * Fullscreen dark background.
   * Centered container.
   * System font stack.

---

### Phase 1 – Canvas & Game Engine Skeleton

3. **Create `GameCanvas.vue`**

   * Renders `<canvas>` filling viewport.
   * Uses `onMounted`/`onUnmounted` to initialize/destroy engine.
   * Handles resize to match window size.

4. **Implement `GameEngine.ts` skeleton**

   * Accepts: canvas, initial dimensions.
   * Holds `state` and `requestAnimationFrame` loop.
   * Stub `update()` and `render()` calls.

5. **Hook up a dummy loop**

   * Render background color gradient or simple animation to confirm loop works.

---

### Phase 2 – Magic Ink Background

6. **Define `FlowParticle` model and initialization**

   * Create `FlowFieldSystem.ts`.
   * Initialize N particles (configurable).

7. **Implement flow vector field function**

   * Based on normalized screen coordinates + time.
   * Returns velocity vector.

8. **Implement `updateFlowField()`**

   * Move particles along field each frame.
   * Wrap around edges.
   * Respawn when life ≤ 0.

9. **Implement `drawFlowField()`**

   * Draw small circles with varying alpha/hue.
   * Use semi-transparent clear in main loop for trails.

---

### Phase 3 – Player System

10. **Define `Player` model**

    * Position, radius, deaths, invincibility timers.

11. **Wire up input in `GameCanvas.vue`**

    * Track `targetX`, `targetY` from mouse / touch.

12. **Implement `PlayerSystem.update()`**

    * Smooth lerp from current position to target.
    * Clamp to screen.

13. **Implement `PlayerSystem.draw()`**

    * Glowing triangle ship oriented upwards.
    * Slight wobble based on time.

---

### Phase 4 – Bullet System

14. **Define `Bullet` model and `BulletSystem`**

    * Array of bullets in state.
    * Helpers for adding bullets.

15. **Implement basic update & cleanup**

    * Move bullets by velocity.
    * Remove when out of bounds or life > maxLife.

16. **Implement SpiralWave pattern**

    * Add `spawnSpiralWave()` that pushes new bullets to state.
    * Schedule pattern in a basic timer.

17. **Implement PlayerRing pattern**

    * Spawn bullets around current player position.

18. **Implement SweepingArc pattern**

    * Spawn from left/right off-screen with arc angles.

19. **Pattern scheduler**

    * Track `lastPatternTime`, `nextPatternDelay`.
    * Pick random pattern function.

20. **Implement bullet drawing**

    * Glowing neon circles with additive effect (`globalCompositeOperation = 'lighter'` or equivalent simulation).
    * Color hue based on time + bullet’s hueOffset.

---

### Phase 5 – Collision & HUD

21. **Collision detection**

    * In `PlayerSystem.update()`, check bullets’ distance to player.
    * Trigger “hit” when within radius and not currently invincible.

22. **Hit handling**

    * Increment `deaths`.
    * Set `invincibleUntilMs`.
    * Store `lastHitMs` for visual flash.

23. **HUD overlay**

    * Draw deaths counter bottom-right.
    * Draw brief red-tint overlay on recent hit.

24. **Blink on invincibility**

    * Skip drawing player for alternating frames during invincible period.

---

### Phase 6 – Polish & UX

25. **Tune parameters**

    * Flow particle count / speed.
    * Bullet speeds, counts, delays.
    * Player movement smoothing.
    * Hitbox radius vs visual size.

26. **Add minimal in-UI instructions**

    * “Move mouse to dodge. Reload to reshuffle patterns.”

27. **Basic responsiveness & mobile**

    * Verify touch input works.
    * Adjust speeds if needed on small screens.

28. **Build & deploy**

    * Simple static deploy (e.g., Netlify, Vercel, GitHub Pages).

