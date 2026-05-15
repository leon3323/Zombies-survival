/**
 * Zombie Survival Game - Enhanced Gameplay
 * Includes zombie entities, player rendering, collisions, and wave progression
 */

// Game entity classes
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
    }
    
    update(deltaTime, input) {
        // Update position based on input
        if (input.x !== 0 || input.y !== 0) {
            const direction = new Vector2(input.x, input.y).normalize();
            this.velocity = direction.multiply(this.speed);
            this.isMoving = true;
        } else {
            this.velocity = new Vector2(0, 0);
            this.isMoving = false;
        }
        
        this.position = this.position.add(this.velocity.multiply(deltaTime));
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
        
        // Draw direction indicator
        const fireScreenX = screenX + this.fireDirection.x * 20;
        const fireScreenY = screenY + this.fireDirection.y * 20;
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(fireScreenX, fireScreenY);
        ctx.stroke();
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }
    
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
}

class Zombie {
    constructor(x, y, isInfected = false) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.radius = 12;
        this.speed = 100;
        this.maxHealth = 30;
        this.health = 30;
        this.isInfected = isInfected;
        this.detectionRange = 300;
        this.attacking = false;
        this.attackCooldown = 0;
    }
    
    update(deltaTime, player, isNight) {
        const distToPlayer = this.position.distance(player.position);
        
        // Increase speed at night
        const speedMultiplier = isNight ? 1.2 : 1;
        
        if (distToPlayer < this.detectionRange) {
            // Chase player
            const direction = player.position.subtract(this.position).normalize();
            this.velocity = direction.multiply(this.speed * speedMultiplier);
            this.attacking = distToPlayer < this.radius + player.radius + 20;
        } else {
            // Patrol (random movement)
            if (Math.random() < 0.02) {
                const angle = Math.random() * Math.PI * 2;
                this.velocity = new Vector2(Math.cos(angle), Math.sin(angle))
                    .multiply(this.speed * 0.5);
            }
            this.attacking = false;
        }
        
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
    }
    
    draw(ctx, cameraX, cameraY) {
        const screenX = this.position.x - cameraX;
        const screenY = this.position.y - cameraY;
        
        // Draw zombie body
        ctx.fillStyle = this.isInfected ? '#ff6600' : '#228b22';
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw health indicator
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(screenX - 12, screenY - 20, 24 * healthPercent, 3);
        
        // Draw infected marker
        if (this.isInfected) {
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.radius + 3, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        return this.health <= 0;
    }
    
    canAttack() {
        return this.attackCooldown <= 0;
    }
}

class Ingredient {
    constructor(x, y, type) {
        this.position = new Vector2(x, y);
        this.radius = 8;
        this.type = type; // 'cure' or 'food'
        this.collected = false;
        this.pulse = 0;
    }
    
    update(deltaTime) {
        this.pulse += deltaTime;
    }
    
    draw(ctx, cameraX, cameraY) {
        const screenX = this.position.x - cameraX;
        const screenY = this.position.y - cameraY;
        
        // Pulsing glow effect
        const scale = 1 + Math.sin(this.pulse * 4) * 0.2;
        
        ctx.fillStyle = this.type === 'cure' ? '#ffff00' : '#ff8800';
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow
        ctx.strokeStyle = this.type === 'cure' ? 'rgba(255,255,0,0.5)' : 'rgba(255,136,0,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * scale + 3, 0, Math.PI * 2);
        ctx.stroke();
    }
}

class Projectile {
    constructor(x, y, dirX, dirY, damage) {
        this.position = new Vector2(x, y);
        this.direction = new Vector2(dirX, dirY).normalize();
        this.speed = 400;
        this.damage = damage;
        this.radius = 4;
        this.lifetime = 3;
    }
    
    update(deltaTime) {
        this.position = this.position.add(this.direction.multiply(this.speed * deltaTime));
        this.lifetime -= deltaTime;
    }
    
    draw(ctx, cameraX, cameraY) {
        const screenX = this.position.x - cameraX;
        const screenY = this.position.y - cameraY;
        
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fill();
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
        
        // Draw base structure
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw health indicator
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : '#ff4444';
        ctx.fillRect(screenX - 40, screenY - this.radius - 15, 80 * healthPercent, 4);
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }
}

// Global game state
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
    ammo: 30,
    maxAmmo: 120,
    isInfected: false,
    ingredientsCured: 0,
    gameOverMessage: '',
    startTime: Date.now(),
    
    // Gameplay entities
    player: null,
    base: null,
    zombies: [],
    projectiles: [],
    ingredients: [],
    
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
    lastZombieSpawnTime: 0,
    zombieSpawnInterval: 0.5,
    
    // Game loop
    lastFireTime: 0,
    fireRate: 0.1
};

// Initialize game when document is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

/**
 * Initialize the game
 */
function initializeGame() {
    console.log('Initializing Zombie Survival Game...');
    
    try {
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

/**
 * Setup class selection
 */
function setupClassSelection() {
    const classCards = document.querySelectorAll('.class-card');
    
    classCards.forEach(card => {
        card.addEventListener('click', () => {
            const selectedClass = card.getAttribute('data-class');
            selectClass(selectedClass);
        });
    });
}

/**
 * Handle class selection
 */
function selectClass(classType) {
    gameState.selectedClass = classType;
    console.log('Selected class:', classType);
    
    // Apply class bonuses
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
    
    // Initialize game world
    gameState.playerHealth = health;
    gameState.player = new Player(gameState.worldWidth / 2, gameState.worldHeight / 2);
    gameState.player.maxHealth = health;
    gameState.player.health = health;
    gameState.base = new Base(gameState.worldWidth / 2, gameState.worldHeight / 2);
    
    // Generate ingredients
    generateIngredients();
    
    // Spawn initial wave
    spawnWave();
    
    const classScreen = document.getElementById('class-screen');
    classScreen.style.display = 'none';
    
    const uiOverlay = document.getElementById('ui-overlay');
    uiOverlay.style.display = 'block';
    
    startGameLoop();
}

/**
 * Generate ingredients on map
 */
function generateIngredients() {
    const cureTypes = ['Herb Root', 'Crystal Shard', 'Zombie DNA', 'Blue Flower', 'Ancient Artifact'];
    const foodTypes = ['Apple', 'Water Bottle', 'Canned Food'];
    
    // Spawn 5 cure ingredients
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i;
        const distance = 400;
        const x = gameState.worldWidth / 2 + Math.cos(angle) * distance;
        const y = gameState.worldHeight / 2 + Math.sin(angle) * distance;
        gameState.ingredients.push(new Ingredient(x, y, 'cure'));
    }
    
    // Spawn food ingredients
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * gameState.worldWidth;
        const y = Math.random() * gameState.worldHeight;
        gameState.ingredients.push(new Ingredient(x, y, 'food'));
    }
}

/**
 * Spawn zombie wave
 */
function spawnWave() {
    const zombieCount = 5 + (3 * gameState.wave);
    gameState.waveZombiesSpawned = 0;
    gameState.waveZombiesRemaining = zombieCount;
    gameState.lastZombieSpawnTime = 0;
    console.log(`Wave ${gameState.wave}: Spawning ${zombieCount} zombies`);
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Keyboard input
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'w' || key === 'arrowup') gameState.playerInput.y = -1;
        if (key === 's' || key === 'arrowdown') gameState.playerInput.y = 1;
        if (key === 'a' || key === 'arrowleft') gameState.playerInput.x = -1;
        if (key === 'd' || key === 'arrowright') gameState.playerInput.x = 1;
        
        if (key === 'escape') togglePauseMenu();
        if (key === 'r') reloadWeapon();
    });
    
    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'w' || key === 'arrowup') gameState.playerInput.y = 0;
        if (key === 's' || key === 'arrowdown') gameState.playerInput.y = 0;
        if (key === 'a' || key === 'arrowleft') gameState.playerInput.x = 0;
        if (key === 'd' || key === 'arrowright') gameState.playerInput.x = 0;
    });
    
    // Mouse input for firing
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
    
    // Touch input fallback
    const touchInput = {
        x: 0,
        y: 0
    };
    
    document.addEventListener('touchmove', (e) => {
        if (touchControls) {
            gameState.playerInput = touchControls.getMovement();
            gameState.fireInput = touchControls.getFiring();
        }
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
    
    // Mobile actions
    document.addEventListener('mobileAction', (e) => {
        handleMobileAction(e.detail.action);
    });
}

/**
 * Handle mobile actions
 */
function handleMobileAction(action) {
    switch(action) {
        case 'reload':
            reloadWeapon();
            break;
        case 'build':
            upgradBase();
            break;
        case 'use-item':
            useItem();
            break;
    }
}

/**
 * Start the game loop
 */
function startGameLoop() {
    gameState.running = true;
    gameState.startTime = Date.now();
    
    let lastTime = Date.now();
    
    function gameLoop() {
        if (!gameState.running) return;
        
        const now = Date.now();
        const deltaTime = Math.min((now - lastTime) / 1000, 0.016); // Cap at 60 FPS
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

/**
 * Update game state
 */
function updateGameState(deltaTime) {
    if (!gameState.player || !gameState.base) return;
    
    const isNight = isNightTime();
    
    // Update player
    gameState.player.update(deltaTime, gameState.playerInput);
    gameState.playerHealth = gameState.player.health;
    
    // Update hunger and thirst
    gameState.playerHunger = Math.max(0, gameState.playerHunger - 0.05);
    gameState.playerThirst = Math.max(0, gameState.playerThirst - 0.07);
    
    // Apply damage from hunger/thirst
    if (gameState.playerHunger <= 0) {
        gameState.player.takeDamage(0.1);
    }
    if (gameState.playerThirst <= 0) {
        gameState.player.takeDamage(0.1);
    }
    
    // Apply infection damage
    if (gameState.isInfected) {
        gameState.player.takeDamage(0.05);
    }
    
    // Spawn zombies for current wave
    gameState.lastZombieSpawnTime += deltaTime;
    if (gameState.waveZombiesSpawned < gameState.waveZombiesRemaining && 
        gameState.lastZombieSpawnTime > gameState.zombieSpawnInterval) {
        spawnZombie(isNight);
        gameState.waveZombiesSpawned++;
        gameState.lastZombieSpawnTime = 0;
    }
    
    // Update zombies
    gameState.zombies.forEach((zombie, index) => {
        zombie.update(deltaTime, gameState.player, isNight);
        
        // Check if zombie is attacking player
        if (zombie.attacking && zombie.canAttack()) {
            gameState.player.takeDamage(5);
            zombie.attackCooldown = 1;
        }
        
        // Check if zombie should be removed
        if (zombie.health <= 0) {
            gameState.zombies.splice(index, 1);
            gameState.kills++;
        }
    });
    
    // Update projectiles
    gameState.projectiles = gameState.projectiles.filter(proj => {
        proj.update(deltaTime);
        
        // Check collision with zombies
        gameState.zombies.forEach(zombie => {
            if (proj.position.distance(zombie.position) < proj.radius + zombie.radius) {
                if (zombie.takeDamage(proj.damage)) {
                    // Zombie died
                }
                proj.lifetime = 0; // Remove projectile
            }
        });
        
        return proj.lifetime > 0;
    });
    
    // Update ingredients
    gameState.ingredients.forEach((ingredient, index) => {
        ingredient.update(deltaTime);
        
        // Check collection
        if (!ingredient.collected && 
            gameState.player.position.distance(ingredient.position) < gameState.player.radius + 20) {
            ingredient.collected = true;
            gameState.ingredientsFound++;
            
            if (ingredient.type === 'cure') {
                gameState.ingredientsCured++;
                if (!gameState.isInfected && Math.random() < 0.3) {
                    gameState.isInfected = true;
                }
            } else {
                gameState.playerHunger = Math.min(100, gameState.playerHunger + 20);
            }
        }
    });
    
    // Remove collected ingredients
    gameState.ingredients = gameState.ingredients.filter(i => !i.collected);
    
    // Handle firing
    if (gameState.fireInput.active && gameState.lastFireTime <= 0) {
        const direction = new Vector2(gameState.fireInput.x, gameState.fireInput.y);
        if (direction.magnitude() < 10) {
            // Use player's last direction if fire input is near center
            direction.x = gameState.player.fireDirection.x;
            direction.y = gameState.player.fireDirection.y;
        }
        
        gameState.player.fireDirection = direction.normalize();
        
        // Create projectile
        const projectile = new Projectile(
            gameState.player.position.x,
            gameState.player.position.y,
            direction.x,
            direction.y,
            10
        );
        gameState.projectiles.push(projectile);
        gameState.ammo--;
        
        gameState.lastFireTime = gameState.fireRate;
        
        // Play sound effect
        playSound('fire');
    }
    
    gameState.lastFireTime -= deltaTime;
    
    // Update camera to follow player
    const canvas = document.getElementById('canvas');
    gameState.cameraX = gameState.player.position.x - canvas.width / 2;
    gameState.cameraY = gameState.player.position.y - canvas.height / 2;
    
    // Clamp camera
    gameState.cameraX = Math.max(0, Math.min(gameState.cameraX, gameState.worldWidth - canvas.width));
    gameState.cameraY = Math.max(0, Math.min(gameState.cameraY, gameState.worldHeight - canvas.height));
    
    // Check wave completion
    if (gameState.zombies.length === 0 && gameState.waveZombiesSpawned >= gameState.waveZombiesRemaining) {
        gameState.wave++;
        spawnWave();
    }
    
    // Check win/lose conditions
    if (gameState.player.health <= 0) {
        gameOver(false);
    }
    
    if (gameState.ingredientsCured >= 5 && gameState.isInfected) {
        gameOver(true);
    }
}

/**
 * Get current game time
 */
function getGameTime() {
    const elapsed = (Date.now() - gameState.startTime) / 1000;
    const gameHour = Math.floor((elapsed / 60) % 24) + 6;
    const gameMinute = Math.floor((elapsed % 60));
    
    const hour = String(gameHour % 24).padStart(2, '0');
    const minute = String(gameMinute).padStart(2, '0');
    
    return { hour: parseInt(hour), minute: gameMinute, display: `${hour}:${minute}` };
}

/**
 * Check if it's night time
 */
function isNightTime() {
    const time = getGameTime();
    return time.hour >= 18 || time.hour < 6;
}

/**
 * Spawn a single zombie
 */
function spawnZombie(isNight) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 400 + Math.random() * 200;
    
    const x = gameState.player.position.x + Math.cos(angle) * distance;
    const y = gameState.player.position.y + Math.sin(angle) * distance;
    
    const isInfected = Math.random() < 0.3;
    const zombie = new Zombie(x, y, isInfected);
    
    if (isNight) {
        zombie.speed *= 1.2;
    }
    
    gameState.zombies.push(zombie);
    playSound('spawn');
}

/**
 * Update UI elements
 */
function updateUI() {
    const healthBar = document.getElementById('health-bar');
    if (healthBar) {
        healthBar.style.width = Math.max(0, gameState.playerHealth) + '%';
    }
    
    const hungerBar = document.getElementById('hunger-bar');
    if (hungerBar) {
        hungerBar.style.width = Math.max(0, gameState.playerHunger) + '%';
    }
    
    const thirstBar = document.getElementById('thirst-bar');
    if (thirstBar) {
        thirstBar.style.width = Math.max(0, gameState.playerThirst) + '%';
    }
    
    const ammoDisplay = document.getElementById('ammo-display');
    if (ammoDisplay) {
        ammoDisplay.textContent = `Ammo: ${Math.max(0, gameState.ammo)}/${gameState.maxAmmo}`;
    }
    
    const waveDisplay = document.getElementById('wave-display');
    if (waveDisplay) {
        waveDisplay.textContent = `Wave: ${gameState.wave}`;
    }
    
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
    if (timeDisplay) {
        timeDisplay.textContent = getGameTime().display;
    }
}

/**
 * Render game
 */
function renderGame() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // Get time for day/night effect
    const isNight = isNightTime();
    
    // Clear canvas with day/night background
    if (isNight) {
        ctx.fillStyle = '#0a0a1a';
    } else {
        ctx.fillStyle = '#1a2a1a';
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw world boundary
    const boundaryLeft = -gameState.cameraX;
    const boundaryTop = -gameState.cameraY;
    const boundaryRight = gameState.worldWidth - gameState.cameraX;
    const boundaryBottom = gameState.worldHeight - gameState.cameraY;
    
    ctx.strokeStyle = '#004400';
    ctx.lineWidth = 2;
    ctx.strokeRect(boundaryLeft, boundaryTop, gameState.worldWidth, gameState.worldHeight);
    
    // Draw grid
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
    
    // Draw base
    if (gameState.base) {
        gameState.base.draw(ctx, gameState.cameraX, gameState.cameraY);
    }
    
    // Draw ingredients
    gameState.ingredients.forEach(ingredient => {
        ingredient.draw(ctx, gameState.cameraX, gameState.cameraY);
    });
    
    // Draw zombies
    gameState.zombies.forEach(zombie => {
        zombie.draw(ctx, gameState.cameraX, gameState.cameraY);
    });
    
    // Draw projectiles
    gameState.projectiles.forEach(projectile => {
        projectile.draw(ctx, gameState.cameraX, gameState.cameraY);
    });
    
    // Draw player
    if (gameState.player) {
        gameState.player.draw(ctx, gameState.cameraX, gameState.cameraY);
    }
    
    // Update minimap
    updateMinimap();
}

/**
 * Update minimap
 */
function updateMinimap() {
    const minimap = document.getElementById('minimap');
    if (!minimap) return;
    
    const ctx = minimap.getContext('2d');
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, minimap.width, minimap.height);
    
    const scaleX = minimap.width / gameState.worldWidth;
    const scaleY = minimap.height / gameState.worldHeight;
    
    // Draw base
    if (gameState.base) {
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(
            gameState.base.position.x * scaleX - 2,
            gameState.base.position.y * scaleY - 2,
            4, 4
        );
    }
    
    // Draw player
    if (gameState.player) {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(
            gameState.player.position.x * scaleX - 2,
            gameState.player.position.y * scaleY - 2,
            4, 4
        );
    }
    
    // Draw zombies
    ctx.fillStyle = '#ff0000';
    gameState.zombies.forEach(zombie => {
        ctx.fillRect(
            zombie.position.x * scaleX - 1,
            zombie.position.y * scaleY - 1,
            2, 2
        );
    });
    
    // Border
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, minimap.width, minimap.height);
}

/**
 * Reload weapon
 */
function reloadWeapon() {
    gameState.ammo = gameState.maxAmmo;
    playSound('reload');
    console.log('Weapon reloaded');
}

/**
 * Upgrade base
 */
function upgradBase() {
    if (gameState.base) {
        gameState.base.maxHealth += 50;
        gameState.base.health = gameState.base.maxHealth;
        gameState.base.radius += 20;
        playSound('build');
        console.log('Base upgraded');
    }
}

/**
 * Use item
 */
function useItem() {
    gameState.playerHunger = Math.min(100, gameState.playerHunger + 30);
    playSound('use');
    console.log('Item used');
}

/**
 * Toggle pause menu
 */
function togglePauseMenu() {
    gameState.paused = !gameState.paused;
    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu) {
        pauseMenu.style.display = gameState.paused ? 'flex' : 'none';
    }
}

/**
 * Game over
 */
function gameOver(victory) {
    gameState.running = false;
    
    if (victory) {
        showVictoryScreen();
    } else {
        showGameOverScreen();
    }
}

/**
 * Show game over screen
 */
function showGameOverScreen() {
    const gameOverScreen = document.getElementById('game-over-screen');
    const uiOverlay = document.getElementById('ui-overlay');
    
    if (gameOverScreen && uiOverlay) {
        uiOverlay.style.display = 'none';
        
        document.getElementById('wave-survived').textContent = gameState.wave;
        document.getElementById('kills').textContent = gameState.kills;
        document.getElementById('ingredients-found').textContent = gameState.ingredientsFound;
        
        gameOverScreen.style.display = 'flex';
    }
}

/**
 * Show victory screen
 */
function showVictoryScreen() {
    const victoryScreen = document.getElementById('victory-screen');
    const uiOverlay = document.getElementById('ui-overlay');
    
    if (victoryScreen && uiOverlay) {
        uiOverlay.style.display = 'none';
        
        const playtime = Math.floor((Date.now() - gameState.startTime) / 1000 / 60);
        document.getElementById('victory-waves').textContent = gameState.wave;
        document.getElementById('playtime').textContent = `${playtime}m`;
        
        victoryScreen.style.display = 'flex';
    }
}

/**
 * Restart game
 */
function restartGame() {
    gameState.playerHealth = 100;
    gameState.playerHunger = 100;
    gameState.playerThirst = 100;
    gameState.wave = 1;
    gameState.kills = 0;
    gameState.ingredientsFound = 0;
    gameState.ammo = 30;
    gameState.isInfected = false;
    gameState.ingredientsCured = 0;
    gameState.selectedClass = null;
    gameState.zombies = [];
    gameState.projectiles = [];
    gameState.ingredients = [];
    
    const gameOverScreen = document.getElementById('game-over-screen');
    const victoryScreen = document.getElementById('victory-screen');
    if (gameOverScreen) gameOverScreen.style.display = 'none';
    if (victoryScreen) victoryScreen.style.display = 'none';
    
    const classScreen = document.getElementById('class-screen');
    if (classScreen) classScreen.style.display = 'flex';
}

/**
 * Go to menu
 */
function goToMenu() {
    restartGame();
}

/**
 * Resize game canvas
 */
function resizeGameCanvas() {
    const canvas = document.getElementById('canvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    const loadingScreen = document.getElementById('loading');
    if (loadingScreen) {
        loadingScreen.innerHTML = `<p style="color: #ff4444;">${message}</p>`;
    }
}

/**
 * Play sound effect (placeholder)
 */
function playSound(soundType) {
    // Sound effects can be added later using Web Audio API
    // For now, this is a placeholder
    switch(soundType) {
        case 'fire':
            // Create beep sound for firing
            if (window.audioContext === undefined) {
                window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = window.audioContext;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 400;
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.1);
            break;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { gameState, initializeGame };
}
