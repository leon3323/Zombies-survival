/**
 * Zombie Survival Game - Emscripten Compiled Output
 * This file initializes the game and manages core gameplay
 */

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
    startTime: Date.now()
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
        // Setup event listeners
        setupEventListeners();
        
        // Initialize canvas
        const canvas = document.getElementById('canvas');
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }
        
        // Setup WebGL or 2D context
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Could not get 2D context');
            return;
        }
        
        // Resize canvas to window size
        resizeGameCanvas();
        window.addEventListener('resize', resizeGameCanvas);
        
        // Show class selection screen
        const classScreen = document.getElementById('class-screen');
        if (classScreen) {
            classScreen.style.display = 'flex';
        }
        
        // Setup class selection
        setupClassSelection();
        
        // Hide loading screen
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
    switch(classType) {
        case 'soldier':
            gameState.playerHealth = 110;
            break;
        case 'scavenger':
            gameState.playerHealth = 100;
            break;
        case 'medic':
            gameState.playerHealth = 130;
            break;
        case 'engineer':
            gameState.playerHealth = 105;
            break;
    }
    
    // Hide class screen and start game
    const classScreen = document.getElementById('class-screen');
    classScreen.style.display = 'none';
    
    // Show UI overlay
    const uiOverlay = document.getElementById('ui-overlay');
    uiOverlay.style.display = 'block';
    
    // Start game loop
    startGameLoop();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Pause menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            togglePauseMenu();
        }
    });
    
    // Game over screen buttons
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
    }
    
    const menuBtn = document.getElementById('menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', goToMenu);
    }
    
    // Pause menu buttons
    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', togglePauseMenu);
    }
    
    const quitBtn = document.getElementById('quit-btn');
    if (quitBtn) {
        quitBtn.addEventListener('click', goToMenu);
    }
    
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
            buildBase();
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
    console.log('Starting game loop...');
    
    // Main game loop
    function gameLoop() {
        if (!gameState.running) return;
        
        if (!gameState.paused) {
            updateGameState();
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
function updateGameState() {
    const deltaTime = 0.016; // Approximate 60 FPS
    
    // Decrease hunger and thirst over time
    gameState.playerHunger = Math.max(0, gameState.playerHunger - 0.05);
    gameState.playerThirst = Math.max(0, gameState.playerThirst - 0.07);
    
    // Apply damage from hunger/thirst
    if (gameState.playerHunger <= 0) {
        gameState.playerHealth -= 0.1;
    }
    if (gameState.playerThirst <= 0) {
        gameState.playerHealth -= 0.1;
    }
    
    // Apply infection damage
    if (gameState.isInfected) {
        gameState.playerHealth -= 0.05;
    }
    
    // Check death condition
    if (gameState.playerHealth <= 0) {
        gameOver(false);
        return;
    }
    
    // Check win condition (all ingredients collected)
    if (gameState.ingredientsCured >= 5 && gameState.isInfected) {
        gameOver(true);
    }
}

/**
 * Update UI elements
 */
function updateUI() {
    // Update health bar
    const healthBar = document.getElementById('health-bar');
    if (healthBar) {
        healthBar.style.width = Math.max(0, gameState.playerHealth) + '%';
    }
    
    // Update hunger bar
    const hungerBar = document.getElementById('hunger-bar');
    if (hungerBar) {
        hungerBar.style.width = Math.max(0, gameState.playerHunger) + '%';
    }
    
    // Update thirst bar
    const thirstBar = document.getElementById('thirst-bar');
    if (thirstBar) {
        thirstBar.style.width = Math.max(0, gameState.playerThirst) + '%';
    }
    
    // Update ammo display
    const ammoDisplay = document.getElementById('ammo-display');
    if (ammoDisplay) {
        ammoDisplay.textContent = `Ammo: ${gameState.ammo}/${gameState.maxAmmo}`;
    }
    
    // Update wave display
    const waveDisplay = document.getElementById('wave-display');
    if (waveDisplay) {
        waveDisplay.textContent = `Wave: ${gameState.wave}`;
    }
    
    // Update infection status
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
    
    // Update time display
    const timeDisplay = document.getElementById('time-display');
    if (timeDisplay) {
        const gameTime = getGameTime();
        timeDisplay.textContent = gameTime;
    }
}

/**
 * Get current game time (24-hour cycle)
 */
function getGameTime() {
    const elapsed = (Date.now() - gameState.startTime) / 1000;
    const gameHour = Math.floor((elapsed / 60) % 24) + 6; // Start at 6 AM
    const gameMinute = Math.floor((elapsed % 60));
    
    const hour = String(gameHour % 24).padStart(2, '0');
    const minute = String(gameMinute).padStart(2, '0');
    
    return `${hour}:${minute}`;
}

/**
 * Render game
 */
function renderGame() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw placeholder game world
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(50, 50, 100, 100); // Player representation
    
    // Draw base
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 80, 0, Math.PI * 2);
    ctx.stroke();
    
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
    
    // Clear minimap
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, minimap.width, minimap.height);
    
    // Draw base (cyan)
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(minimap.width / 2 - 3, minimap.height / 2 - 3, 6, 6);
    
    // Draw player (green)
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(minimap.width / 2 - 2, minimap.height / 2 - 2, 4, 4);
    
    // Draw border
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, minimap.width, minimap.height);
}

/**
 * Reload weapon
 */
function reloadWeapon() {
    gameState.ammo = gameState.maxAmmo;
    console.log('Weapon reloaded');
}

/**
 * Build base
 */
function buildBase() {
    console.log('Building base...');
}

/**
 * Use item
 */
function useItem() {
    gameState.playerHunger = Math.min(100, gameState.playerHunger + 20);
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
        document.getElementById('playtime').textContent = `${playtime}m`;
        
        victoryScreen.style.display = 'flex';
    }
}

/**
 * Restart game
 */
function restartGame() {
    // Reset game state
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
    
    // Hide game over screen
    const gameOverScreen = document.getElementById('game-over-screen');
    const victoryScreen = document.getElementById('victory-screen');
    if (gameOverScreen) gameOverScreen.style.display = 'none';
    if (victoryScreen) victoryScreen.style.display = 'none';
    
    // Show class selection
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

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { gameState, initializeGame };
}
