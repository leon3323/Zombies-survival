# Zombie Survival Game - Design Document

## Overview
Zombie Survival is a C++ top-down 2D survival game where players must manage resources, fend off waves of zombies, and collect ingredients to cure a pre-madeath infection.

## Game Systems

### 1. Player Management
- **Health**: 100 points (takes damage from zombies and starvation)
- **Hunger**: 100 points (decreases over time, low hunger causes damage)
- **Thirst**: 100 points (decreases over time, low thirst causes damage)
- **Movement Speed**: 200 pixels/second (affected by character class)

### 2. Pre-Madeath System
- **Activation**: Random chance when hit by infected zombie (30% infection rate)
- **Effect**: Continuous health drain over time
- **Cure**: Collect 5 specific ingredients
- **Cure Ingredients**:
  1. Herb Root
  2. Crystal Shard
  3. Zombie DNA
  4. Blue Flower
  5. Ancient Artifact

### 3. Character Classes

#### Soldier
- Health: +10
- Damage: +20
- Speed: 1.0x
- Ingredient Find: No bonus
- Building Speed: No bonus
- Playstyle: Aggressive combat focus

#### Scavenger
- Health: No bonus
- Damage: No bonus
- Speed: 1.3x
- Ingredient Find: +50%
- Building Speed: No bonus
- Playstyle: Exploration and resource gathering

#### Medic
- Health: +30
- Damage: -5
- Speed: 1.0x
- Ingredient Find: No bonus
- Building Speed: No bonus
- Playstyle: Survival and support

#### Engineer
- Health: +5
- Damage: -10
- Speed: 0.9x
- Ingredient Find: No bonus
- Building Speed: +75%
- Playstyle: Base building and defense

### 4. Weapon System

#### Pistol
- Damage: 10
- Fire Rate: 0.1s
- Magazine Size: 30
- Reload Time: 2s
- Use: Reliable, all-purpose weapon

#### Rifle
- Damage: 20
- Fire Rate: 0.15s
- Magazine Size: 60
- Reload Time: 2s
- Use: Long-range, medium-rate combat

#### Shotgun
- Damage: 40
- Fire Rate: 0.5s
- Magazine Size: 20
- Reload Time: 2s
- Use: Close-range, high damage

#### Melee
- Damage: 25
- Fire Rate: 0.3s
- Magazine Size: Unlimited
- Reload Time: 0s
- Use: Emergency, no ammo required

#### Grenades
- Damage: 100 (area effect)
- Fire Rate: 1.0s
- Magazine Size: 5
- Reload Time: 2s
- Use: Area denial, crowd control

### 5. Base System
- **Base Durability**: 200 HP
- **Base Size**: 100 radius (expandable)
- **Features**:
  - Protective structure
  - Passive health recovery when inside
  - Zombie damage mitigation
  - Upgradeable durability and size
- **Upgrades**:
  - Durability Upgrade: +50 HP
  - Size Expansion: +20 radius
  - Cost: Varies by upgrade

### 6. Zombie System
- **Health**: 30 HP per zombie
- **Speed**: 100 pixels/second
- **Detection Range**: 300 pixels
- **Pre-Madeath Status**: 30% of spawned zombies are infected
- **Behavior**: 
  - Patrol when player is outside detection range
  - Chase and attack player when detected
  - Attack base when nearby
  - Increased aggression during night hours

### 7. Wave System
- **Wave 1**: 5 zombies
- **Wave 2**: 8 zombies
- **Wave 3**: 11 zombies
- **Formula**: Initial count + (3 × wave number)
- **Difficulty Scaling**: Each wave is 1.5x harder

### 8. Day/Night Cycle
- **Cycle Duration**: 24 hours (in-game, adjustable)
- **Day Hours**: 6 AM - 6 PM
- **Night Hours**: 6 PM - 6 AM
- **Effects**:
  - Increased zombie spawn rate at night
  - Reduced visibility (darker rendering)
  - Increased player movement difficulty
  - Zombie speed +20% at night

### 9. Ingredient Collection
- **Ingredient Types**: 10 different types
- **Spawn Count**: 10 ingredients per game
- **Collection Range**: 50 pixels
- **Auto-Collection**: Automatic when in range
- **Required for Cure**: 5 specific ingredients
- **Secondary Ingredients**: Used for crafting other items

### 10. Mini-Map System
- **Size**: 150x150 pixels
- **Location**: Top-right corner of screen
- **Scale**: 1:1400 world ratio
- **Markers**:
  - Green: Player position
  - Cyan: Base location
  - Red: Zombie positions
- **Update Rate**: Real-time (60 FPS)

### 11. Time System
- **Display**: Current hour and minute
- **Format**: 24-hour military time
- **Update Rate**: 1 in-game minute per second of gameplay
- **Cycle**: Full 24 hours every 1440 seconds (~24 minutes real time)

## UI/HUD Layout

### Left Panel (HUD)
- Health Bar
- Hunger Bar
- Thirst Bar
- Current Ammo / Max Ammo
- Wave Counter
- Infection Status
- Day/Night Indicator
- Inventory (Ingredients)

### Right Panel
- Mini-map

### Full Screen Overlays
- Game Over Screen (on death)
- Victory Screen (on cure collection)
- Pause Menu (ESC key)

## Game Flow

1. **Start Screen**: Player selects character class
2. **Game Initialization**: 
   - Spawn player at center
   - Create base at center
   - Generate ingredients randomly
   - Spawn initial zombie wave
3. **Main Loop**:
   - Update player input
   - Update all entities
   - Check collisions
   - Render all objects
   - Update HUD
4. **Wave Progression**:
   - Wave starts with zombie spawn
   - Player fights and survives
   - Collect ingredients and resources
   - Kill all zombies to progress
5. **Win Condition**: Collect 5 cure ingredients while infected
6. **Lose Condition**: Health reaches 0

## Difficulty and Progression

### Scaling Factors
- Zombies per wave increases
- Zombie health increases
- Spawn frequency increases
- Day/night cycle affects spawn rates
- Ingredient rarity affects progression speed

### Balancing
- Player power scaling with weapons and classes
- Resource availability through ingredient spawning
- Base defense as safety mechanism
- Wave difficulty matched to survival time

## Controls

### Movement
- W: Move Up
- A: Move Left
- S: Move Down
- D: Move Right

### Actions
- Left Mouse: Fire weapon
- R: Reload weapon
- E: Eat food
- Q: Drink water
- B: Build/Upgrade base
- ESC: Menu/Quit

## Audio (Future)
- Background music (different for day/night)
- Weapon fire sounds
- Zombie growls and roars
- Ambient environmental sounds
- UI click sounds

## Graphics (Future)
- Particle effects for explosions
- Muzzle flashes for weapons
- Blood splatters
- Animation for zombie movement
- Base construction animations

## Performance Targets
- 60 FPS on target hardware
- Smooth gameplay with 50+ entities
- Load times < 2 seconds
- Memory usage < 512MB

## Accessibility
- Colorblind mode
- Font size adjustments
- Remappable controls
- Difficulty modifiers
