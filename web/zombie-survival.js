/**
 * Zombie Survival Game - Enhanced Gameplay with Audio, Particles, Weapons, Bosses, Power-ups, Animations
 * Full-featured survival game with all gameplay systems
 */

// ============================================================================
// UTILITY CLASSES
// ============================================================================

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    
    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }
    
    subtract(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }
    
    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }
    
    distance(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    normalize() {
        const len = Math.sqrt(this.x * this.x + this.y * this.y);
        if (len === 0) return new Vector2(0, 0);
        return new Vector2(this.x / len, this.y / len);
    }
    
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}

// ============================================================================
// PARTICLE SYSTEM
// ============================================================================

class Particle {
    constructor(x, y, type = 'blood') {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(
            (Math.random() - 0.5) * 300,
            (Math.random() - 0.5) * 300 - 100
        );
        this.type = type;
        this.lifetime = type === 'blood' ? 1.0 : 0.5;
        this.maxLifetime = this.lifetime;
        this.size = type === 'blood' ? 4 : 6;
    }
    
    update(deltaTime) {
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        this.velocity = this.velocity.multiply(0.95); // Friction
        this.lifetime -= deltaTime;
    }
    
    draw(ctx, cameraX, cameraY) {
        const screenX = this.position.x - cameraX;
        const screenY = this.position.y - cameraY;
        
        const alpha = this.lifetime / this.maxLifetime;
        
        if (this.type === 'blood') {
            ctx.fillStyle = `rgba(255, 0, 0, ${alpha * 0.6})`;
        } else {
            ctx.fillStyle = `rgba(255, 200, 0, ${alpha * 0.8})`;
        }
        
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ============================================================================
// WEAPON SYSTEM
// ============================================================================

class Weapon {
    constructor(type = 'pistol') {
        this.type = type;
        this.ammo = 0;
        this.maxAmmo = 0;
        this.magazine = 0;
        this.maxMagazine = 0;
        this.lastFireTime = 0;
        this.isReloading = false;
        this.reloadTime = 0;
        this.animationTime = 0;
        
        this.setType(type);
    }
    
    setType(type) {
        this.type = type;
        
        switch(type) {
            case 'pistol':
                this.damage = 10;
                this.fireRate = 0.1;
                this.maxMagazine = 30;
                this.maxAmmo = 120;
                this.reloadTime = 2;
                break;
            case 'rifle':
                this.damage = 20;
                this.fireRate = 0.15;
                this.maxMagazine = 30;
                this.maxAmmo = 90;
                this.reloadTime = 2.5;
                break;
            case 'shotgun':
                this.damage = 40;
                this.fireRate = 0.5;
                this.maxMagazine = 8;
                this.maxAmmo = 32;
                this.reloadTime = 3;
                break;
            case 'grenade':
                this.damage = 100;
                this.fireRate = 1.0;
                this.maxMagazine = 5;
                this.maxAmmo = 20;
                this.reloadTime = 1;
                break;
        }
        
        this.magazine = this.maxMagazine;
        this.ammo = this.maxAmmo - this.magazine;
    }
    
    canFire() {
        return this.magazine > 0 && this.lastFireTime <= 0 && !this.isReloading;
    }
    
    fire() {
        if (this.canFire()) {
            this.magazine--;
            this.lastFireTime = this.fireRate;
            this.animationTime = 0.1;
            return true;
        }
        return false;
    }
    
    reload() {
        if (this.ammo > 0 && this.magazine < this.maxMagazine && !this.isReloading) {
            this.isReloading = true;
            this.reloadTime = 2;
            return true;
        }
        return false;
    }
    
    update(deltaTime) {
        this.lastFireTime -= deltaTime;
        this.animationTime -= deltaTime;
        
        if (this.isReloading) {
            this.reloadTime -= deltaTime;
            if (this.reloadTime <= 0) {
                const ammoNeeded = this.maxMagazine - this.magazine;
                const ammoTransfer = Math.min(this.ammo, ammoNeeded);
                this.magazine += ammoTransfer;
                this.ammo -= ammoTransfer;
                this.isReloading = false;
            }
        }
    }
}

// ============================================================================
// ENTITY CLASSES
// ============================================================================

class Player {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.radius = 15;
        this.speed = 200;
        this.maxHealth = 100;
        this.health = 100;
        this.fireDirection = new Vector2(1, 0);
        this.isMoving = false;
        this.weapon = new Weapon('pistol');
        this.score = 0;
    }
    
    update(deltaTime, input) {
        if (input.x !== 0 || input.y !== 0) {
            const direction = new Vector2(input.x, input.y).normalize();
            this.velocity = direction.multiply(this.speed);
            this.isMoving = true;
        } else {
            this.velocity = new Vector2(0, 0);
            this.isMoving = false;
        }
        
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        this.weapon.update(deltaTime);
    }
    
    draw(ctx, cameraX, cameraY) {
        const screenX = this.position.x - cameraX;
        const screenY = this.position.y - cameraY;
        
        // Draw player body
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw health indicator
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : '#ff4444';
        ctx.fillRect(screenX - 15, screenY - 25, 30 * healthPercent, 4);
        
        // Draw direction indicator (weapon direction)
        const fireScreenX = screenX + this.fireDirection.x * 20;
        const fireScreenY = screenY + this.fireDirection.y * 20;
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(fireScreenX, fireScreenY);
        ctx.stroke();
        
        // Draw reload indicator
        if (this.weapon.isReloading) {
            ctx.fillStyle = '#ffff00';
            ctx.font = '12px Arial';
            ctx.fillText('RELOAD', screenX - 20, screenY - 35);
        }
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }
    
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
}

class Zombie {
    constructor(x, y, isInfected = false, isBoss = false) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.radius = isBoss ? 20 : 12;
        this.speed = isBoss ? 80 : 100;
        this.maxHealth = isBoss ? 100 : 30;
        this.health = this.maxHealth;
        this.isInfected = isInfected;
        this.isBoss = isBoss;
        this.detectionRange = 300;
        this.attacking = false;
        this.attackCooldown = 0;
        this.deathTime = 0;
        this.isDying = false;
    }
    
    update(deltaTime, player, isNight) {
        if (this.isDying) {
            this.deathTime -= deltaTime;
            return;
        }
        
        const distToPlayer = this.position.distance(player.position);
        const speedMultiplier = isNight ? 1.2 : 1;
        
        if (distToPlayer < this.detectionRange) {
            const direction = player.position.subtract(this.position).normalize();
            this.velocity = direction.multiply(this.speed * speedMultiplier);
            this.attacking = distToPlayer < this.radius + player.radius + 20;
        } else {
            if (Math.random() < 0.02) {
                const angle = Math.random() * Math.PI * 2;
                this.velocity = new Vector2(Math.cos(angle), Math.sin(angle))
                    .multiply(this.speed * 0.5);
            }
            this.attacking = false;
        }
        
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
    }
    
    draw(ctx, cameraX, cameraY) {
        const screenX = this.position.x - cameraX;
        const screenY = this.position.y - cameraY;
        
        if (this.isDying) {
            // Death animation - fade out
            const alpha = this.deathTime / 0.5;
            ctx.globalAlpha = alpha;
        }
        
        // Draw zombie body
        if (this.isBoss) {
            ctx.fillStyle = '#ff0000';
        } else {
            ctx.fillStyle = this.isInfected ? '#ff6600' : '#228b22';
        }
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw health indicator
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(screenX - this.radius, screenY - this.radius - 8, this.radius * 2 * healthPercent, 3);
        
        // Draw infected marker
        if (this.isInfected) {
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.radius + 3, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Draw boss marker
        if (this.isBoss) {
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.radius + 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 10px Arial';
            ctx.fillText('BOSS', screenX - 15, screenY - this.radius - 15);
        }
        
        ctx.globalAlpha = 1;
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        if (this.health <= 0) {
            this.isDying = true;
            this.deathTime = 0.5;
            return true;
        }
        return false;
    }
    
    canAttack() {
        return this.attackCooldown <= 0;
    }
}

class Projectile {
    constructor(x, y, dirX, dirY, damage, type = 'bullet', spread = 1) {
        this.position = new Vector2(x, y);
        this.direction = new Vector2(dirX, dirY).normalize();
        
        // Add spread for shotgun
        if (spread > 1) {
            const angle = Math.random() * Math.PI * 2;
            const spreadAmount = (Math.random() - 0.5) * 0.3;
            this.direction.x += Math.cos(angle) * spreadAmount;
            this.direction.y += Math.sin(angle) * spreadAmount;
            this.direction = this.direction.normalize();
        }
        
        this.speed = type === 'grenade' ? 300 : 400;
        this.damage = damage;
        this.radius = type === 'grenade' ? 8 : 4;
        this.lifetime = type === 'grenade' ? 2 : 3;
        this.type = type;
    }
    
    update(deltaTime) {
        this.position = this.position.add(this.direction.multiply(this.speed * deltaTime));
        this.lifetime -= deltaTime;
    }
    
    draw(ctx, cameraX, cameraY) {
        const screenX = this.position.x - cameraX;
        const screenY = this.position.y - cameraY;
        
        if (this.type === 'grenade') {
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class Ingredient {
    constructor(x, y, type) {
        this.position = new Vector2(x, y);
        this.radius = 8;
        this.type = type;
        this.collected = false;
        this.pulse = 0;
    }
    
    update(deltaTime) {
        this.pulse += deltaTime;
    }
    
    draw(ctx, cameraX, cameraY) {
        const screenX = this.position.x - cameraX;
        const screenY = this.position.y - cameraY;
        
        const scale = 1 + Math.sin(this.pulse * 4) * 0.2;
        
        ctx.fillStyle = this.type === 'cure' ? '#ffff00' : '#ff8800';
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * scale, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = this.type === 'cure' ? 'rgba(255,255,0,0.5)' : 'rgba(255,136,0,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * scale + 3, 0, Math.PI * 2);
        ctx.stroke();
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.position = new Vector2(x, y);
        this.radius = 10;
        this.type = type; // 'health' or 'ammo'
        this.collected = false;
        this.pulse = 0;
    }
    
    update(deltaTime) {
        this.pulse += deltaTime;
    }
    
    draw(ctx, cameraX, cameraY) {
        const screenX = this.position.x - cameraX;
        const screenY = this.position.y - cameraY;
        
        const scale = 1 + Math.sin(this.pulse * 3) * 0.3;
        
        ctx.fillStyle = this.type === 'health' ? '#ff0000' : '#0099ff';
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * scale, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = this.type === 'health' ? 'rgba(255,0,0,0.7)' : 'rgba(0,153,255,0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * scale + 5, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw icon
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type === 'health' ? '+' : '🔫', screenX, screenY);
    }
}

class Base {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.radius = 80;
        this.maxHealth = 200;
        this.health = 200;
    }
    
    draw(ctx, cameraX, cameraY) {
        const screenX = this.position.x - cameraX;
        const screenY = this.position.y - cameraY;
        
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : '#ff4444';
        ctx.fillRect(screenX - 40, screenY - this.radius - 15, 80 * healthPercent, 4);
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }
}

// ============================================================================
// AUDIO SYSTEM
// ============================================================================

class AudioSystem {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {};
        this.loadSounds();
    }
    
    loadSounds() {
        // Procedurally generate sound effects
        this.sounds.fire = () => this.playBeep(400, 0.1, 0.1);
        this.sounds.reload = () => this.playBeep(600, 0.2, 0.05);
        this.sounds.spawn = () => this.playBeep(200, 0.3, 0.1);
        this.sounds.build = () => this.playBeep(800, 0.1, 0.1);
        this.sounds.powerup = () => this.playBeep(1200, 0.15, 0.1);
        this.sounds.damage = () => this.playBeep(300, 0.05, 0.15);
        this.sounds.victory = () => this.playVictorySound();
        this.sounds.gameover = () => this.playGameOverSound();
    }
    
    playBeep(frequency, duration, volume) {
        try {
            const ctx = this.audioContext;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.frequency.value = frequency;
            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
            
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            console.log('Audio error:', e);
        }
    }
    
    playVictorySound() {
        const frequencies = [523, 659, 784];
        frequencies.forEach((freq, i) => {
            setTimeout(() => this.playBeep(freq, 0.3, 0.2), i * 150);
        });
    }
    
    playGameOverSound() {
        const frequencies = [400, 300, 200];
        frequencies.forEach((freq, i) => {
            setTimeout(() => this.playBeep(freq, 0.4, 0.2), i * 150);
        });
    }
    
    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
}

// ============================================================================
// LEADERBOARD SYSTEM
// ============================================================================

class LeaderboardSystem {
    constructor() {
        this.scores = this.loadScores();
    }
    
    loadScores() {
        const stored = localStorage.getItem('zombie-survival-scores');
        return stored ? JSON.parse(stored) : [];
    }
    
    saveScores() {
        localStorage.setItem('zombie-survival-scores', JSON.stringify(this.scores));
    }
    
    addScore(name, score, wave, kills, ingredients) {
        this.scores.push({
            name,
            score,
            wave,
            kills,
            ingredients,
            date: new Date().toLocaleDateString()
        });
        
        this.scores.sort((a, b) => b.score - a.score);
        this.scores = this.scores.slice(0, 10); // Keep top 10
        
        this.saveScores();
        return this.scores.indexOf(this.scores.find(s => s.name === name && s.score === score)) + 1;
    }
    
    getTopScores() {
        return this.scores.slice(0, 10);
    }
    
    isHighScore(score) {
        if (this.scores.length < 10) return true;
        return score > this.scores[this.scores.length - 1].score;
    }
}

// ============================================================================
// GLOBAL GAME STATE
// ============================================================================

const gameState = {
    initialized: false,
    running: false,
    paused: false,
    selectedClass: null,
    playerHealth: 100,
    playerHunger: 100,
    playerThirst: 100,
    wave: 1,
    kills: 0,
    ingredientsFound: 0,
    isInfected: false,
    ingredientsCured: 0,
    score: 0,
    startTime: Date.now(),
    
    // Entities
    player: null,
    base: null,
    zombies: [],
    projectiles: [],
    ingredients: [],
    powerups: [],
    particles: [],
    
    // Input
    playerInput: { x: 0, y: 0 },
    fireInput: { x: 0, y: 0, active: false },
    
    // Camera
    cameraX: 0,
    cameraY: 0,
    worldWidth: 2000,
    worldHeight: 2000,
    
    // Wave system
    waveZombiesSpawned: 0,
    waveZombiesRemaining: 0,
    waveZombiesToSpawn: 0,
    lastZombieSpawnTime: 0,
    zombieSpawnInterval: 0.3,
    bossMeter: 0,
    bossSpawned: false,
    
    // Systems
    audio: null,
    leaderboard: null
};

// ============================================================================
// INITIALIZATION & MAIN LOOP
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

function initializeGame() {
    console.log('Initializing Zombie Survival Game...');
    
    try {
        gameState.audio = new AudioSystem();
        gameState.leaderboard = new LeaderboardSystem();
        
        setupEventListeners();
        
        const canvas = document.getElementById('canvas');
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Could not get 2D context');
            return;
        }
        
        resizeGameCanvas();
        window.addEventListener('resize', resizeGameCanvas);
        
        const classScreen = document.getElementById('class-screen');
        if (classScreen) {
            classScreen.style.display = 'flex';
        }
        
        setupClassSelection();
        
        const loadingScreen = document.getElementById('loading');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        gameState.initialized = true;
        console.log('Game initialized successfully');
        
    } catch (error) {
        console.error('Error initializing game:', error);
        showErrorMessage('Failed to initialize game: ' + error.message);
    }
}

function setupClassSelection() {
    const classCards = document.querySelectorAll('.class-card');
    
    classCards.forEach(card => {
        card.addEventListener('click', () => {
            const selectedClass = card.getAttribute('data-class');
            selectClass(selectedClass);
        });
    });
}

function selectClass(classType) {
    gameState.selectedClass = classType;
    console.log('Selected class:', classType);
    
    let health = 100;
    switch(classType) {
        case 'soldier':
            health = 110;
            break;
        case 'scavenger':
            health = 100;
            break;
        case 'medic':
            health = 130;
            break;
        case 'engineer':
            health = 105;
            break;
    }
    
    gameState.playerHealth = health;
    gameState.player = new Player(gameState.worldWidth / 2, gameState.worldHeight / 2);
    gameState.player.maxHealth = health;
    gameState.player.health = health;
    gameState.base = new Base(gameState.worldWidth / 2, gameState.worldHeight / 2);
    
    generateIngredients();
    spawnWave();
    
    const classScreen = document.getElementById('class-screen');
    classScreen.style.display = 'none';
    
    const uiOverlay = document.getElementById('ui-overlay');
    uiOverlay.style.display = 'block';
    
    startGameLoop();
}

function generateIngredients() {
    // Cure ingredients
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i;
        const distance = 400;
        const x = gameState.worldWidth / 2 + Math.cos(angle) * distance;
        const y = gameState.worldHeight / 2 + Math.sin(angle) * distance;
        gameState.ingredients.push(new Ingredient(x, y, 'cure'));
    }
    
    // Food ingredients
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * gameState.worldWidth;
        const y = Math.random() * gameState.worldHeight;
        gameState.ingredients.push(new Ingredient(x, y, 'food'));
    }
}

function spawnWave() {
    const zombieCount = 5 + (3 * gameState.wave);
    gameState.waveZombiesSpawned = 0;
    gameState.waveZombiesToSpawn = zombieCount;
    gameState.waveZombiesRemaining = zombieCount;
    gameState.lastZombieSpawnTime = 0;
    gameState.bossMeter = 0;
    gameState.bossSpawned = false;
    console.log(`Wave ${gameState.wave}: Spawning ${zombieCount} zombies`);
}

function setupEventListeners() {
    // Keyboard
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'w' || key === 'arrowup') gameState.playerInput.y = -1;
        if (key === 's' || key === 'arrowdown') gameState.playerInput.y = 1;
        if (key === 'a' || key === 'arrowleft') gameState.playerInput.x = -1;
        if (key === 'd' || key === 'arrowright') gameState.playerInput.x = 1;
        
        if (key === 'escape') togglePauseMenu();
        if (key === 'r') {
            if (gameState.player) gameState.player.weapon.reload();
        }
        if (key === '1') switchWeapon('pistol');
        if (key === '2') switchWeapon('rifle');
        if (key === '3') switchWeapon('shotgun');
        if (key === '4') switchWeapon('grenade');
    });
    
    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'w' || key === 'arrowup') gameState.playerInput.y = 0;
        if (key === 's' || key === 'arrowdown') gameState.playerInput.y = 0;
        if (key === 'a' || key === 'arrowleft') gameState.playerInput.x = 0;
        if (key === 'd' || key === 'arrowright') gameState.playerInput.x = 0;
    });
    
    // Mouse
    document.addEventListener('mousemove', (e) => {
        const canvas = document.getElementById('canvas');
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - canvas.width / 2;
        const mouseY = e.clientY - rect.top - canvas.height / 2;
        
        gameState.fireInput.x = mouseX;
        gameState.fireInput.y = mouseY;
    });
    
    document.addEventListener('mousedown', () => {
        gameState.fireInput.active = true;
    });
    
    document.addEventListener('mouseup', () => {
        gameState.fireInput.active = false;
    });
    
    // Game buttons
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) restartBtn.addEventListener('click', restartGame);
    
    const menuBtn = document.getElementById('menu-btn');
    if (menuBtn) menuBtn.addEventListener('click', goToMenu);
    
    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) resumeBtn.addEventListener('click', togglePauseMenu);
    
    const quitBtn = document.getElementById('quit-btn');
    if (quitBtn) quitBtn.addEventListener('click', goToMenu);
}

function switchWeapon(weaponType) {
    if (gameState.player) {
        gameState.player.weapon.setType(weaponType);
        gameState.audio.play('reload');
    }
}

function startGameLoop() {
    gameState.running = true;
    gameState.startTime = Date.now();
    
    let lastTime = Date.now();
    
    function gameLoop() {
        if (!gameState.running) return;
        
        const now = Date.now();
        const deltaTime = Math.min((now - lastTime) / 1000, 0.016);
        lastTime = now;
        
        if (!gameState.paused) {
            updateGameState(deltaTime);
            updateUI();
            renderGame();
        }
        
        requestAnimationFrame(gameLoop);
    }
    
    gameLoop();
}

function updateGameState(deltaTime) {
    if (!gameState.player || !gameState.base) return;
    
    const isNight = isNightTime();
    
    // Update player
    gameState.player.update(deltaTime, gameState.playerInput);
    gameState.playerHealth = gameState.player.health;
    gameState.score = gameState.player.score;
    
    // Update hunger/thirst
    gameState.playerHunger = Math.max(0, gameState.playerHunger - 0.05);
    gameState.playerThirst = Math.max(0, gameState.playerThirst - 0.07);
    
    // Damage from hunger/thirst
    if (gameState.playerHunger <= 0) {
        gameState.player.takeDamage(0.1);
    }
    if (gameState.playerThirst <= 0) {
        gameState.player.takeDamage(0.1);
    }
    
    // Infection damage
    if (gameState.isInfected) {
        gameState.player.takeDamage(0.03);
    }
    
    // Spawn zombies
    gameState.lastZombieSpawnTime += deltaTime;
    if (gameState.waveZombiesSpawned < gameState.waveZombiesToSpawn && 
        gameState.lastZombieSpawnTime > gameState.zombieSpawnInterval) {
        spawnZombie(isNight);
        gameState.waveZombiesSpawned++;
        gameState.lastZombieSpawnTime = 0;
    }
    
    // Boss spawn at 50% wave completion
    if (!gameState.bossSpawned && gameState.waveZombiesSpawned >= gameState.waveZombiesToSpawn * 0.5) {
        spawnBoss();
        gameState.bossSpawned = true;
    }
    
    // Update zombies
    gameState.zombies = gameState.zombies.filter(zombie => {
        zombie.update(deltaTime, gameState.player, isNight);
        
        if (!zombie.isDying && zombie.attacking && zombie.canAttack()) {
            gameState.player.takeDamage(zombie.isBoss ? 10 : 5);
            zombie.attackCooldown = 1;
            gameState.audio.play('damage');
        }
        
        return !(zombie.isDying && zombie.deathTime <= 0);
    });
    
    // Update projectiles
    gameState.projectiles = gameState.projectiles.filter(proj => {
        proj.update(deltaTime);
        
        let hitSomething = false;
        
        gameState.zombies.forEach(zombie => {
            if (!zombie.isDying && proj.position.distance(zombie.position) < proj.radius + zombie.radius) {
                if (zombie.takeDamage(proj.damage)) {
                    gameState.kills++;
                    gameState.player.score += (zombie.isBoss ? 500 : 100);
                    
                    // Create blood particles
                    for (let i = 0; i < 10; i++) {
                        gameState.particles.push(new Particle(zombie.position.x, zombie.position.y, 'blood'));
                    }
                }
                hitSomething = true;
            }
        });
        
        // Grenade explosion
        if (proj.type === 'grenade' && proj.lifetime <= 0) {
            const explosionRadius = 150;
            gameState.zombies.forEach(zombie => {
                if (proj.position.distance(zombie.position) < explosionRadius) {
                    if (zombie.takeDamage(proj.damage * 0.5)) {
                        gameState.kills++;
                        gameState.player.score += (zombie.isBoss ? 500 : 100);
                    }
                }
            });
            
            // Explosion particles
            for (let i = 0; i < 20; i++) {
                gameState.particles.push(new Particle(proj.position.x, proj.position.y, 'explosion'));
            }
        }
        
        return proj.lifetime > 0 && !hitSomething;
    });
    
    // Update particles
    gameState.particles = gameState.particles.filter(p => {
        p.update(deltaTime);
        return p.lifetime > 0;
    });
    
    // Update ingredients
    gameState.ingredients = gameState.ingredients.filter(ingredient => {
        ingredient.update(deltaTime);
        
        if (!ingredient.collected && 
            gameState.player.position.distance(ingredient.position) < gameState.player.radius + 20) {
            ingredient.collected = true;
            gameState.ingredientsFound++;
            
            if (ingredient.type === 'cure') {
                gameState.ingredientsCured++;
                gameState.player.score += 50;
                
                if (!gameState.isInfected && Math.random() < 0.3) {
                    gameState.isInfected = true;
                    gameState.audio.play('damage');
                }
            } else {
                gameState.playerHunger = Math.min(100, gameState.playerHunger + 30);
            }
            
            gameState.audio.play('powerup');
        }
        
        return !ingredient.collected;
    });
    
    // Update powerups
    gameState.powerups = gameState.powerups.filter(powerup => {
        powerup.update(deltaTime);
        
        if (!powerup.collected && 
            gameState.player.position.distance(powerup.position) < gameState.player.radius + 20) {
            powerup.collected = true;
            
            if (powerup.type === 'health') {
                gameState.player.heal(50);
            } else {
                gameState.player.weapon.ammo = gameState.player.weapon.maxAmmo;
                gameState.player.weapon.magazine = gameState.player.weapon.maxMagazine;
            }
            
            gameState.audio.play('powerup');
        }
        
        return !powerup.collected;
    });
    
    // Weapon firing
    if (gameState.fireInput.active && gameState.player.weapon.canFire()) {
        const direction = new Vector2(gameState.fireInput.x, gameState.fireInput.y);
        if (direction.magnitude() < 10) {
            direction.x = gameState.player.fireDirection.x;
            direction.y = gameState.player.fireDirection.y;
        }
        
        gameState.player.fireDirection = direction.normalize();
        
        if (gameState.player.weapon.fire()) {
            const weaponType = gameState.player.weapon.type;
            const damage = gameState.player.weapon.damage;
            
            if (weaponType === 'shotgun') {
                // 5 pellets
                for (let i = 0; i < 5; i++) {
                    const proj = new Projectile(
                        gameState.player.position.x,
                        gameState.player.position.y,
                        direction.x,
                        direction.y,
                        damage,
                        'bullet',
                        5
                    );
                    gameState.projectiles.push(proj);
                }
            } else if (weaponType === 'grenade') {
                const proj = new Projectile(
                    gameState.player.position.x,
                    gameState.player.position.y,
                    direction.x,
                    direction.y,
                    damage,
                    'grenade'
                );
                gameState.projectiles.push(proj);
            } else {
                const proj = new Projectile(
                    gameState.player.position.x,
                    gameState.player.position.y,
                    direction.x,
                    direction.y,
                    damage,
                    'bullet'
                );
                gameState.projectiles.push(proj);
            }
            
            // Muzzle flash particles
            for (let i = 0; i < 3; i++) {
                gameState.particles.push(new Particle(
                    gameState.player.position.x + direction.x * 15,
                    gameState.player.position.y + direction.y * 15,
                    'explosion'
                ));
            }
            
            gameState.audio.play('fire');
        }
    }
    
    // Camera follow
    const canvas = document.getElementById('canvas');
    gameState.cameraX = gameState.player.position.x - canvas.width / 2;
    gameState.cameraY = gameState.player.position.y - canvas.height / 2;
    gameState.cameraX = Math.max(0, Math.min(gameState.cameraX, gameState.worldWidth - canvas.width));
    gameState.cameraY = Math.max(0, Math.min(gameState.cameraY, gameState.worldHeight - canvas.height));
    
    // Wave completion
    if (gameState.zombies.length === 0 && gameState.waveZombiesSpawned >= gameState.waveZombiesToSpawn) {
        gameState.wave++;
        
        // Spawn powerups on wave complete
        for (let i = 0; i < 2; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 300;
            const x = gameState.player.position.x + Math.cos(angle) * distance;
            const y = gameState.player.position.y + Math.sin(angle) * distance;
            gameState.powerups.push(new PowerUp(x, y, i === 0 ? 'health' : 'ammo'));
        }
        
        spawnWave();
        gameState.audio.play('victory');
    }
    
    // Win/lose
    if (gameState.player.health <= 0) {
        gameOver(false);
    }
    
    if (gameState.ingredientsCured >= 5 && gameState.isInfected) {
        gameOver(true);
    }
}

function spawnZombie(isNight) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 400 + Math.random() * 200;
    
    const x = gameState.player.position.x + Math.cos(angle) * distance;
    const y = gameState.player.position.y + Math.sin(angle) * distance;
    
    const isInfected = Math.random() < 0.3;
    const zombie = new Zombie(x, y, isInfected, false);
    
    if (isNight) zombie.speed *= 1.2;
    
    gameState.zombies.push(zombie);
    gameState.audio.play('spawn');
}

function spawnBoss() {
    const angle = Math.random() * Math.PI * 2;
    const distance = 500;
    
    const x = gameState.player.position.x + Math.cos(angle) * distance;
    const y = gameState.player.position.y + Math.sin(angle) * distance;
    
    const boss = new Zombie(x, y, true, true);
    gameState.zombies.push(boss);
    gameState.audio.play('spawn');
    console.log('Boss spawned!');
}

function getGameTime() {
    const elapsed = (Date.now() - gameState.startTime) / 1000;
    const gameHour = Math.floor((elapsed / 60) % 24) + 6;
    const gameMinute = Math.floor((elapsed % 60));
    
    const hour = String(gameHour % 24).padStart(2, '0');
    const minute = String(gameMinute).padStart(2, '0');
    
    return { hour: parseInt(hour), minute: gameMinute, display: `${hour}:${minute}` };
}

function isNightTime() {
    const time = getGameTime();
    return time.hour >= 18 || time.hour < 6;
}

function updateUI() {
    const healthBar = document.getElementById('health-bar');
    if (healthBar) healthBar.style.width = Math.max(0, gameState.playerHealth) + '%';
    
    const hungerBar = document.getElementById('hunger-bar');
    if (hungerBar) hungerBar.style.width = Math.max(0, gameState.playerHunger) + '%';
    
    const thirstBar = document.getElementById('thirst-bar');
    if (thirstBar) thirstBar.style.width = Math.max(0, gameState.playerThirst) + '%';
    
    const ammoDisplay = document.getElementById('ammo-display');
    if (ammoDisplay) {
        const weapon = gameState.player.weapon;
        ammoDisplay.textContent = `${weapon.type.toUpperCase()} ${weapon.magazine}/${weapon.ammo}`;
    }
    
    const waveDisplay = document.getElementById('wave-display');
    if (waveDisplay) waveDisplay.textContent = `Wave: ${gameState.wave}`;
    
    const infectionDisplay = document.getElementById('infection-display');
    if (infectionDisplay) {
        if (gameState.isInfected) {
            infectionDisplay.textContent = `Infected (${gameState.ingredientsCured}/5)`;
            infectionDisplay.className = 'infected';
        } else {
            infectionDisplay.textContent = 'Safe';
            infectionDisplay.className = 'safe';
        }
    }
    
    const timeDisplay = document.getElementById('time-display');
    if (timeDisplay) timeDisplay.textContent = getGameTime().display;
}

function renderGame() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    const isNight = isNightTime();
    
    ctx.fillStyle = isNight ? '#0a0a1a' : '#1a2a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid
    ctx.strokeStyle = 'rgba(0,100,0,0.1)';
    ctx.lineWidth = 1;
    for (let x = Math.floor(gameState.cameraX / 100) * 100; x < gameState.cameraX + canvas.width; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x - gameState.cameraX, 0);
        ctx.lineTo(x - gameState.cameraX, canvas.height);
        ctx.stroke();
    }
    for (let y = Math.floor(gameState.cameraY / 100) * 100; y < gameState.cameraY + canvas.height; y += 100) {
        ctx.beginPath();
        ctx.moveTo(0, y - gameState.cameraY);
        ctx.lineTo(canvas.width, y - gameState.cameraY);
        ctx.stroke();
    }
    
    // Draw all entities
    if (gameState.base) gameState.base.draw(ctx, gameState.cameraX, gameState.cameraY);
    gameState.ingredients.forEach(i => i.draw(ctx, gameState.cameraX, gameState.cameraY));
    gameState.powerups.forEach(p => p.draw(ctx, gameState.cameraX, gameState.cameraY));
    gameState.particles.forEach(p => p.draw(ctx, gameState.cameraX, gameState.cameraY));
    gameState.zombies.forEach(z => z.draw(ctx, gameState.cameraX, gameState.cameraY));
    gameState.projectiles.forEach(p => p.draw(ctx, gameState.cameraX, gameState.cameraY));
    if (gameState.player) gameState.player.draw(ctx, gameState.cameraX, gameState.cameraY);
    
    updateMinimap();
}

function updateMinimap() {
    const minimap = document.getElementById('minimap');
    if (!minimap) return;
    
    const ctx = minimap.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, minimap.width, minimap.height);
    
    const scaleX = minimap.width / gameState.worldWidth;
    const scaleY = minimap.height / gameState.worldHeight;
    
    if (gameState.base) {
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(gameState.base.position.x * scaleX - 2, gameState.base.position.y * scaleY - 2, 4, 4);
    }
    
    if (gameState.player) {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(gameState.player.position.x * scaleX - 2, gameState.player.position.y * scaleY - 2, 4, 4);
    }
    
    ctx.fillStyle = '#ff0000';
    gameState.zombies.forEach(z => {
        ctx.fillRect(z.position.x * scaleX - 1, z.position.y * scaleY - 1, 2, 2);
    });
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, minimap.width, minimap.height);
}

function togglePauseMenu() {
    gameState.paused = !gameState.paused;
    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu) {
        pauseMenu.style.display = gameState.paused ? 'flex' : 'none';
    }
}

function gameOver(victory) {
    gameState.running = false;
    
    if (victory) {
        showVictoryScreen();
    } else {
        showGameOverScreen();
    }
}

function showGameOverScreen() {
    const gameOverScreen = document.getElementById('game-over-screen');
    const uiOverlay = document.getElementById('ui-overlay');
    
    if (gameOverScreen && uiOverlay) {
        uiOverlay.style.display = 'none';
        
        document.getElementById('wave-survived').textContent = gameState.wave;
        document.getElementById('kills').textContent = gameState.kills;
        document.getElementById('ingredients-found').textContent = gameState.ingredientsFound;
        
        gameOverScreen.style.display = 'flex';
        gameState.audio.play('gameover');
    }
}

function showVictoryScreen() {
    const victoryScreen = document.getElementById('victory-screen');
    const uiOverlay = document.getElementById('ui-overlay');
    
    if (victoryScreen && uiOverlay) {
        uiOverlay.style.display = 'none';
        
        const playtime = Math.floor((Date.now() - gameState.startTime) / 1000 / 60);
        document.getElementById('victory-waves').textContent = gameState.wave;
        document.getElementById('playtime').textContent = `${playtime}m`;
        
        // Add to leaderboard
        const rank = gameState.leaderboard.addScore(
            gameState.selectedClass,
            gameState.score,
            gameState.wave,
            gameState.kills,
            gameState.ingredientsFound
        );
        
        victoryScreen.style.display = 'flex';
        gameState.audio.play('victory');
    }
}

function restartGame() {
    gameState.playerHealth = 100;
    gameState.playerHunger = 100;
    gameState.playerThirst = 100;
    gameState.wave = 1;
    gameState.kills = 0;
    gameState.ingredientsFound = 0;
    gameState.isInfected = false;
    gameState.ingredientsCured = 0;
    gameState.score = 0;
    gameState.selectedClass = null;
    gameState.zombies = [];
    gameState.projectiles = [];
    gameState.ingredients = [];
    gameState.powerups = [];
    gameState.particles = [];
    
    const gameOverScreen = document.getElementById('game-over-screen');
    const victoryScreen = document.getElementById('victory-screen');
    if (gameOverScreen) gameOverScreen.style.display = 'none';
    if (victoryScreen) victoryScreen.style.display = 'none';
    
    const classScreen = document.getElementById('class-screen');
    if (classScreen) classScreen.style.display = 'flex';
}

function goToMenu() {
    restartGame();
}

function resizeGameCanvas() {
    const canvas = document.getElementById('canvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}

function showErrorMessage(message) {
    const loadingScreen = document.getElementById('loading');
    if (loadingScreen) {
        loadingScreen.innerHTML = `<p style="color: #ff4444;">${message}</p>`;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { gameState, initializeGame };
}
