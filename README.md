# Zombie Survival - Complete Mobile Game
## Play Now on Any Device! 🧟‍♂️📱

**Play in your browser:** [Open Game](./web/index.html)

**Install as App:**
- **iPhone:** Open in Safari → Share → Add to Home Screen
- **Android:** Open in Chrome → Menu → Install app
- **iPad/Tablet:** Same process as above

---

## 🎮 Game Features

### Core Systems
✅ **Hunger & Thirst** - Manage resources to stay alive  
✅ **Pre-Madeath Infection** - 30% chance to get infected, find cure to survive  
✅ **Base Building & Defense** - Build bases with upgradeable durability and size  
✅ **Wave System** - Progressive zombie attacks increase in difficulty  
✅ **4 Character Classes** - Soldier, Scavenger, Medic, Engineer (each with unique abilities)  

### Gameplay Mechanics
✅ **5 Weapon Types** - Pistol, Rifle, Shotgun, Melee, Grenades  
✅ **10 Ingredient Types** - Collect to craft cure and items  
✅ **Day/Night Cycle** - Full 24-hour cycle affecting zombie behavior  
✅ **Mini-Map** - Real-time map showing player, base, and zombies  
✅ **Zombie AI** - Intelligent pathfinding and detection system  

### Mobile Features
✅ **Touch Controls** - Virtual joystick + firing zone  
✅ **Responsive UI** - Works on all screen sizes  
✅ **Offline Play** - Play without internet after first load  
✅ **Safe Area Support** - Works with notches and gesture navigation  
✅ **Portrait & Landscape** - Full support for device rotation  

---

## 🕹️ Controls

### Mobile (Touch)
| Action | Control |
|--------|---------|
| Move | Virtual Joystick (bottom-left) |
| Aim & Fire | Tap & drag right side of screen |
| Reload | Tap Reload button or swipe up |
| Build Base | Tap Build button |
| Use Item | Tap Use button |
| Pause | Tap Menu button or press ESC |

### Desktop (Keyboard & Mouse)
| Action | Control |
|--------|---------|
| Move | W/A/S/D or Arrow Keys |
| Aim | Mouse cursor |
| Fire | Left Mouse Click |
| Reload | R key |
| Build Base | B key |
| Use Item | E key |
| Pause | ESC key |

---

## 🎯 How to Play

1. **Choose Your Class:**
   - ⚔️ **Soldier:** High damage & health (+10 HP, +20% dmg)
   - 🏃 **Scavenger:** Fast movement & loot finding (+30% speed, +50% loot)
   - 🏥 **Medic:** Enhanced health & recovery (+30 HP, +15% healing)
   - 🔧 **Engineer:** Master builder (+75% build speed, +50 base HP)

2. **Survive the Waves:**
   - Fight off waves of zombies
   - Manage hunger and thirst
   - Protect your base from damage

3. **Get Infected (30% chance):**
   - Find 5 specific cure ingredients:
     - Herb Root
     - Crystal Shard
     - Zombie DNA
     - Blue Flower
     - Ancient Artifact

4. **Win the Game:**
   - Collect the 5 cure ingredients
   - Cure yourself of infection
   - Survive and thrive!

---

## 📊 Game Stats

| Stat | Value |
|------|-------|
| Starting Health | 100 HP |
| Starting Hunger | 100 |
| Starting Thirst | 100 |
| Base Durability | 200 HP |
| Initial Zombie Count (Wave 1) | 5 |
| Spawn Formula | 5 + (3 × wave) |
| Infection Chance | 30% |
| Cure Ingredients Needed | 5 |
| Day/Night Cycle | 24 in-game hours |

---

## 🏗️ Building Your Base

- **Location:** Center of map
- **Benefits:** Safe zone, passive health recovery
- **Durability:** Decreases when zombies attack
- **Upgrades:**
  - Durability +50 HP
  - Size expansion +20 radius

---

## 🔫 Weapons

| Weapon | Damage | Fire Rate | Magazine | Reload |
|--------|--------|-----------|----------|--------|
| Pistol | 10 | 0.1s | 30 | 2s |
| Rifle | 20 | 0.15s | 60 | 2s |
| Shotgun | 40 | 0.5s | 20 | 2s |
| Melee | 25 | 0.3s | ∞ | - |
| Grenades | 100 (AoE) | 1.0s | 5 | 2s |

---

## 🌙 Day & Night System

- **Day (6 AM - 6 PM):**
  - Normal zombie spawn rate
  - Better visibility
  - Easier to move around

- **Night (6 PM - 6 AM):**
  - +20% zombie spawn rate
  - Reduced visibility
  - Zombies move 20% faster
  - More dangerous!

---

## 💊 Infection & Cure

**How to get infected:**
- Attacked by infected zombie (30% chance)
- Pre-madeath status effect activates
- Health slowly drains over time

**How to cure:**
- Collect 5 cure ingredients
- Ingredients found in the world
- Trade with curing system when you have all 5

**After cure:**
- Infection removed
- Continue playing or win!

---

## 🌐 Play Online

### Browser Play (Recommended)
No installation required! Play directly in browser:
```
https://leon3323.github.io/Zombies-survival/web/
```

### Install as App

**iPhone/iPad:**
1. Open link in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Name: "Zombie Survival"
5. Tap Add

**Android:**
1. Open link in Chrome
2. Tap menu (⋮)
3. Tap "Install app"
4. Confirm

---

## 📱 Supported Devices

✅ iPhone 6s and newer  
✅ iPad (all models)  
✅ Android 5.0+  
✅ Desktop/Laptop browsers  
✅ Tablets (all sizes)  

---

## ⚙️ Technical Details

**Built with:**
- C++ (game logic compiled to WebAssembly)
- SFML 2.5+ (graphics)
- Emscripten (C++ to Web compilation)
- Service Workers (offline support)

**Browser Support:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 12+
- Opera 76+

---

## 🐛 Bug Reports

Found a bug? Report it on [GitHub Issues](https://github.com/leon3323/Zombies-survival/issues)

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🚀 Development

### Build from Source
```bash
# Prerequisites
# - C++17 compiler
# - CMake 3.16+
# - SFML 2.5+
# - Emscripten (for web build)

# Desktop build
mkdir build && cd build
cmake ..
make
./zombie-survival

# Web build
mkdir web-build && cd web-build
emconfigure cmake -DWEB=ON ..
emmake make
```

### Project Structure
```
Zombies-survival/
├── src/              # C++ source files
├── include/          # Header files
├── web/              # Web/mobile files
│   ├── index.html   # Web UI
│   ├── style.css    # Styling
│   ├── touch.js     # Touch controls
│   ├── sw.js        # Service worker
│   └── manifest.json # PWA manifest
├── CMakeLists.txt   # Build configuration
└── README.md        # This file
```

---

## 🎓 Learning Resources

Interested in game development?
- [SFML Documentation](https://www.sfml-dev.org/)
- [Emscripten Guide](https://emscripten.org/docs/getting_started/index.html)
- [Web Game Dev](https://developer.mozilla.org/en-US/docs/Games)
- [C++ Best Practices](https://isocpp.org/)

---

## 🙏 Credits

**Developer:** leon3323  
**Game Engine:** SFML  
**Web Tech:** Emscripten, Service Workers, PWA

---

**Happy Hunting! 🧟‍♂️🔫**

*Last Updated: 2026-05-15*
