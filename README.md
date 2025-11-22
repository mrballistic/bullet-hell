# Neon Bullet Hell + Magic Ink

A visually stunning browser-based 2D bullet hell game featuring a flowing "magic ink" background and neon bullet patterns.

![Game Preview](https://img.shields.io/badge/Status-Complete-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue) ![Vue](https://img.shields.io/badge/Vue-3.4+-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎮 Features

### Core Gameplay
- **Magic Ink Background**: 800+ particles flowing through a dynamic vector field with color-cycling trails
- **Neon Bullet Patterns**: Three unique attack patterns:
  - 🌀 **Spiral Wave**: Rotating bullets from screen center
  - ⭕ **Player Ring**: Bullets spawning in a ring around the player
  - 🌊 **Sweeping Arc**: Convergent bullet waves from screen edges
- **Smooth Controls**: Mouse/touch input with exponential smoothing
- **Collision Detection**: Precise hit detection with visual feedback

### Visual Effects
- ✨ **Glowing Neon**: Shadow blur effects and additive blending
- 🌈 **Color Cycling**: Dynamic hue shifting based on time
- 💫 **Trail Effects**: Semi-transparent canvas clearing for particle trails
- 💥 **Hit Flash**: Red overlay effect on player damage
- 👻 **Invincibility Blinking**: Visual feedback during invulnerability

### Game Controls
- **Mouse/Touch**: Move player ship
- **SPACE**: Pause/Resume game
- **R**: Restart game
- **S**: Take screenshot

### Polish Features
- 📊 **HUD System**: Deaths counter and contextual instructions
- ⏸️ **Pause System**: Full game state preservation
- 🔄 **Restart**: Complete game reset
- 📸 **Screenshot**: Download current frame as PNG
- 📱 **Responsive**: Adapts to window resizing

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/neon-bullet-hell.git
cd neon-bullet-hell

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
# Build optimized version
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment.

## 🛠️ Technology Stack

- **Frontend Framework**: Vue 3 (Composition API)
- **Language**: TypeScript
- **Build Tool**: Vite
- **Rendering**: HTML5 Canvas 2D
- **State Management**: Local component state
- **Styling**: CSS with scoped styles

## 📁 Project Structure

```
src/
├── components/
│   ├── GameCanvas.vue      # Canvas component with input handling
│   └── App.vue             # Main application wrapper
├── game/
│   ├── GameEngine.ts       # Core game loop and orchestration
│   └── systems/
│       ├── FlowFieldSystem.ts    # Magic ink background
│       ├── PlayerSystem.ts       # Player movement and collision
│       ├── BulletSystem.ts       # Bullet patterns and spawning
│       └── HudSystem.ts          # UI and visual effects
├── types/
│   └── GameTypes.ts        # TypeScript interfaces
├── style.css               # Global styles
├── main.ts                 # Application entry point
└── env.d.ts               # Vue type declarations
```

## 🎯 Game Design

### Performance Targets
- **60 FPS** on modern laptops
- **600 max bullets** on screen
- **800 flow particles** for background
- **Bundle size**: ~67KB (27KB gzipped)

### Gameplay Balance
- **Player radius**: 12px (tight hitbox for precise dodging)
- **Bullet speed**: 120-180px/s (dodgeable but challenging)
- **Pattern interval**: 1.5-3.5 seconds (varied rhythm)
- **Invincibility**: 2 seconds after hit

## 🎨 Visual Design

### Color Palette
- **Background**: Deep space (#02030a)
- **Flow Field**: Full spectrum HSL cycling
- **Bullets**: Neon blues, purples, and cyans
- **Player**: Dynamic hue-shifting triangle
- **UI**: Semi-transparent white

### Effects Pipeline
1. **Layer 1**: Flow field particles with trails
2. **Layer 2**: Neon bullets with glow
3. **Layer 3**: Player ship with wobble
4. **Layer 4**: HUD and overlay effects

## 🌐 Deployment

### Static Hosting
The production build is optimized for static hosting:

```bash
npm run build
# Deploy the 'dist' folder to:
# - Netlify
# - Vercel  
# - GitHub Pages
# - Any static file server
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 80
CMD ["npx", "serve", "-s", "dist", "-l", "80"]
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
- Follow existing code style
- Add TypeScript types for new features
- Test on both desktop and mobile
- Keep performance in mind (60 FPS target)

### Future Enhancement Ideas
- 🎵 Audio-reactive bullet patterns
- 🎚️ Difficulty settings
- 📱 Mobile-optimized UI
- 🏆 High score tracking
- 🎨 Additional bullet patterns
- 🌍 Multi-language support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by classic bullet hell games and demoscene visuals
- Built with modern web technologies for optimal performance
- Designed for "visual wow + tight, responsive feel"

## 📞 Support

If you encounter any issues or have questions, please:
- Check the [Issues](https://github.com/yourusername/neon-bullet-hell/issues) page
- Create a new issue with details about your environment
- Include browser/console information for bugs

---

**Made with ❤️ and TypeScript**
