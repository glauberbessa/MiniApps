# /game-developer

**Game development fundamentals, engine selection, and game design patterns.**

Use this skill when building games, choosing game engines, or planning game architecture.

---

## What This Skill Does

Teaches **game development thinking**. Covers:
- 🎮 Game engine selection (Unity, Godot, Phaser, Unreal)
- 🎯 Game design fundamentals (game loop, entities)
- 🕹️ 2D vs 3D game development
- 🎨 Game physics and collision
- ⌨️ Input handling and controls
- 🖼️ Asset management
- ⚡ Performance optimization for games
- 📱 Mobile game development
- 🎯 Publishing to app stores

---

## When to Use

✅ Planning game development project
✅ Choosing game engine
✅ Learning game development basics
✅ Optimizing game performance
✅ Publishing game to stores

❌ Specific engine tutorials (use engine docs)
❌ Game art/audio (use art guides)

---

## Game Engine Selection

### Decision Tree

```
What are you building?
│
├── 2D Game (top-down, platformer, puzzle)
│   ├── Web/browser?
│   │   └── Phaser, PixiJS, Babylon.js
│   │
│   ├── Mobile (iOS/Android)?
│   │   └── Godot, Unity
│   │
│   └── Standalone?
│       └── Godot, Unity, LibGDX
│
├── 3D Game (first-person, RPG, action)
│   ├── High fidelity needed?
│   │   └── Unreal Engine
│   │
│   ├── Indie/small scale?
│   │   └── Unity, Godot
│   │
│   └── Mobile?
│       └── Unity, Unreal
│
├── VR/AR Game
│   ├── High performance?
│   │   └── Unreal, Unity
│   │
│   └── Social/simple?
│       └── A-Frame (web)
│
└── Game Jam/Prototyping
    └── Godot (lightweight), itch.io friendly
```

---

## Engine Comparison

| Engine | Best For | Learning Curve | 2D | 3D | Mobile |
|--------|----------|--------|----|----|--------|
| **Unity** | Indie games | Medium | ✅ | ✅ | ✅✅ |
| **Godot** | Open-source, 2D | Low | ✅✅ | ✅ | ✅ |
| **Unreal** | AAA, 3D | High | ⚠️ | ✅✅ | ✅ |
| **Phaser** | Web games | Low | ✅✅ | ❌ | ✅ |
| **LibGDX** | Java games | Medium | ✅ | ⚠️ | ✅ |

---

## Game Development Fundamentals

### Game Loop

Every game runs on a loop:

```
while (gameRunning) {
  // 1. Input: Get player input
  const input = getInput();

  // 2. Update: Update game state
  player.move(input);
  updateEnemies();
  checkCollisions();

  // 3. Render: Draw everything
  clear();
  draw(player);
  draw(enemies);
  draw(ui);

  // 4. Repeat: ~60 times per second
}
```

### Delta Time

**Problem:** Different computers run at different speeds

**Solution:** Use delta time (time since last frame)

```typescript
let lastTime = Date.now();

function gameLoop() {
  const now = Date.now();
  const deltaTime = (now - lastTime) / 1000; // seconds
  lastTime = now;

  // Move consistent speed regardless of FPS
  player.position.x += player.velocity * deltaTime;

  requestAnimationFrame(gameLoop);
}
```

### Entity Component System (ECS)

Modern games use ECS pattern:

```
Entity (player)
├── Component: Transform (position, rotation)
├── Component: Sprite (image, animation)
├── Component: Physics (velocity, acceleration)
├── Component: Health (HP, status)
└── Component: Input (keyboard listener)

System (Physics)
├── Iterate all entities with Physics component
├── Update position based on velocity
└── Check collisions

System (Rendering)
├── Iterate all entities with Sprite component
└── Draw at their Transform position
```

---

## 2D Game Development

### Phaser Example (Web)

```javascript
import Phaser from 'phaser';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: { debug: false, gravity: { y: 300 } }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image('player', 'player.png');
  this.load.image('enemy', 'enemy.png');
}

function create() {
  this.player = this.add.sprite(400, 300, 'player');
  this.physics.add.existing(this.player);
  this.player.body.setBounce(0.2);
  this.player.body.setCollideWorldBounds(true);
}

function update() {
  const cursors = this.input.keyboard.createCursorKeys();

  if (cursors.left.isDown) {
    this.player.body.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    this.player.body.setVelocityX(160);
  }
}
```

### 2D Asset Organization

```
assets/
├── sprites/
│   ├── player/
│   │   ├── idle.png
│   │   ├── run.png
│   │   └── jump.png
│   ├── enemies/
│   │   └── ...
│   └── environment/
│       └── ...
├── tiles/
│   └── tileset.png
├── audio/
│   ├── sfx/
│   │   ├── jump.ogg
│   │   └── coin.ogg
│   └── music/
│       └── level1.ogg
└── ui/
    ├── button.png
    └── icon.png
```

---

## 3D Game Development

### Unity 3D Setup

```csharp
using UnityEngine;

public class PlayerController : MonoBehaviour {
  public float speed = 5f;
  private Rigidbody rb;

  void Start() {
    rb = GetComponent<Rigidbody>();
  }

  void Update() {
    float moveX = Input.GetAxis("Horizontal");
    float moveZ = Input.GetAxis("Vertical");

    Vector3 movement = new Vector3(moveX, 0, moveZ) * speed;
    rb.velocity = movement;
  }
}
```

### 3D Asset Management

```
Assets/
├── Models/
│   ├── Characters/
│   │   └── player.fbx
│   ├── Environment/
│   │   └── tree.fbx
│   └── Props/
│       └── barrel.fbx
├── Materials/
│   ├── grass.mat
│   └── wood.mat
├── Textures/
│   ├── grass.png
│   └── brick.png
├── Prefabs/
│   ├── Player.prefab
│   └── Enemy.prefab
└── Scenes/
    ├── Level1.unity
    └── Menu.unity
```

---

## Physics & Collision

### Collision Detection

```typescript
// Simple AABB (Axis-Aligned Bounding Box) collision
function isColliding(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

// Check collisions each frame
if (isColliding(player, coin)) {
  onCollectCoin();
}
```

### Physics Simulation

```typescript
class PhysicsBody {
  position = { x: 0, y: 0 };
  velocity = { x: 0, y: 0 };
  acceleration = { x: 0, y: 0 };
  mass = 1;

  update(deltaTime) {
    // Acceleration affects velocity
    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;

    // Velocity affects position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // Gravity
    this.acceleration.y = 9.8 / this.mass;
  }
}
```

---

## Input Handling

### Keyboard Input

```typescript
// Simple key tracking
const keys = {};

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// In game loop
function update() {
  if (keys['ArrowLeft']) player.moveLeft();
  if (keys['ArrowRight']) player.moveRight();
  if (keys[' ']) player.jump();
}
```

### Touch Input (Mobile)

```typescript
canvas.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  const x = touch.clientX;
  const y = touch.clientY;

  player.moveTowards(x, y);
});

canvas.addEventListener('touchmove', (e) => {
  // Handle drag
});
```

---

## Game State Management

```typescript
const GameState = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver'
};

let currentState = GameState.MENU;

function handleStateChange(newState) {
  switch (newState) {
    case GameState.MENU:
      showMenu();
      break;
    case GameState.PLAYING:
      resumeGame();
      break;
    case GameState.PAUSED:
      pauseGame();
      break;
    case GameState.GAME_OVER:
      showGameOverScreen();
      break;
  }

  currentState = newState;
}
```

---

## Performance Optimization for Games

### FPS Management

```typescript
// Target 60 FPS (16.67ms per frame)
const targetFPS = 60;
const frameTime = 1000 / targetFPS;

function gameLoop(timestamp) {
  // Measure frame time
  const deltaTime = (timestamp - lastTime) / 1000;

  if (deltaTime >= frameTime) {
    update(deltaTime);
    render();
    lastTime = timestamp;
  }

  requestAnimationFrame(gameLoop);
}
```

### Object Pooling

```typescript
// Reuse objects instead of creating/destroying
class BulletPool {
  constructor(initialSize = 50) {
    this.bullets = [];
    for (let i = 0; i < initialSize; i++) {
      this.bullets.push(new Bullet());
    }
    this.available = this.bullets.length;
  }

  getBullet() {
    if (this.available > 0) {
      return this.bullets[--this.available];
    }
    const newBullet = new Bullet();
    this.bullets.push(newBullet);
    return newBullet;
  }

  returnBullet(bullet) {
    bullet.reset();
    this.bullets[this.available++] = bullet;
  }
}
```

---

## Mobile Game Development

### Mobile Considerations

```
Performance
├── Target 30-60 FPS
├── Limit draw calls
├── Optimize physics
└── Battery aware

Controls
├── Touch-friendly hit areas (> 44x44px)
├── Gesture support (swipe, pinch, long-press)
├── Accelerometer (if relevant)
└── No keyboard required

Screen Sizes
├── Responsive layout
├── Safe area (notches, home bar)
├── Landscape and portrait
└── Different resolutions

Memory
├── Limit to < 256MB
├── Load level streaming
└── Unload unused assets
```

---

## Publishing to App Stores

### iOS (App Store)

1. **Prepare:**
   - Build for iOS
   - Icon (1024x1024)
   - Screenshots (5 per orientation)
   - Description and keywords

2. **Test:**
   - TestFlight (beta testing)

3. **Submit:**
   - App Store Connect
   - Apple reviews (24-48 hours)

4. **Publish:**
   - Available worldwide

### Android (Google Play)

1. **Build:**
   - APK or AAB format
   - Icon, screenshots, description

2. **Test:**
   - Open testing track

3. **Release:**
   - Gradual rollout (25% → 50% → 100%)

4. **Monitor:**
   - Crash reports, ratings

---

## Game Development Checklist

- [ ] **Game loop** - Input, update, render cycle
- [ ] **Physics** - Gravity, velocity, collision
- [ ] **Input** - Keyboard, touch, gamepad
- [ ] **State management** - Menu, playing, paused
- [ ] **Assets** - Organized and optimized
- [ ] **Audio** - SFX and music
- [ ] **UI** - Menu, HUD, pause screen
- [ ] **Performance** - 60 FPS target
- [ ] **Mobile** - Touch-friendly, responsive
- [ ] **Publishing** - App store ready

---

## Anti-Patterns to Avoid

❌ **DON'T:**
- Global game state (use proper state management)
- Magic numbers everywhere (use constants)
- Physics calculations every frame (use simulation)
- Load all assets upfront (stream assets)
- Ignore frame rate (use delta time)
- No input handling strategy
- Forget about mobile considerations

✅ **DO:**
- Organized code structure
- Named constants
- Physics simulation
- Asset streaming
- Delta time usage
- Clear input system
- Mobile-first design

---

## Next Steps

1. **Choose engine** - Unity, Godot, or Phaser
2. **Learn fundamentals** - Game loop, physics, entities
3. **Build prototype** - Simple playable game
4. **Add features** - Combat, score, levels
5. **Optimize** - Performance, memory
6. **Polish** - Audio, visuals, juice
7. **Publish** - App store or itch.io

---

## Related Skills

- `/mobile-builder` - For mobile game deployment
- `/performance-profiler` - For game optimization
- `/frontend-expert` - For web game UI
- `/ui-design-system` - For game UI design
- `/devops-pipeline` - For game distribution
