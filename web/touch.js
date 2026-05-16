/**
 * Mobile Touch Controls for Zombie Survival - Optimized Version
 * Handles proper multi-touch tracking, relative aiming mechanics, and latency-free input
 */

class TouchControls {
    constructor() {
        this.joystickActive = false;
        this.joystickX = 0;
        this.joystickY = 0;
        this.firingActive = false;
        this.fireX = 0;
        this.fireY = 0;
        
        // Tracking touch IDs uniquely to prevent multi-touch overlap issues
        this.joystickTouchId = null;
        this.firingTouchId = null;
        this.fireStartPoint = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        const joystickContainer = document.getElementById('joystick');
        const joystickThumb = document.querySelector('.joystick-thumb');
        const firingZone = document.getElementById('firing-zone');
        
        this.setupJoystick(joystickContainer, joystickThumb);
        this.setupFiring(firingZone);
        this.setupActionButtons();
        
        // Globally prevent scrolling/rubber-banding gestures while dragging on game interface
        document.addEventListener('touchmove', (e) => {
            if (e.target === document.getElementById('canvas') || e.target.closest('.ui-overlay')) {
                if (e.cancelable) e.preventDefault();
            }
        }, { passive: false });
    }
    
    /**
     * Setup virtual joystick for movement
     */
    setupJoystick(container, thumb) {
        let startX, startY;
        if (!container || !thumb) return;
        const radius = container.offsetWidth / 2 || 50; 
        
        container.addEventListener('touchstart', (e) => {
            if (this.joystickActive) return; 
            
            this.joystickActive = true;
            const touch = e.changedTouches[0];
            this.joystickTouchId = touch.identifier;
            startX = touch.clientX;
            startY = touch.clientY;
        }, { passive: false });
        
        container.addEventListener('touchmove', (e) => {
            if (!this.joystickActive) return;
            
            const touch = Array.from(e.touches).find(t => t.identifier === this.joystickTouchId);
            if (!touch) return;
            
            let dx = touch.clientX - startX;
            let dy = touch.clientY - startY;
            
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > radius) {
                dx = (dx / distance) * radius;
                dy = (dy / distance) * radius;
            }
            
            thumb.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
            
            this.joystickX = dx / radius;
            this.joystickY = dy / radius;
        }, { passive: false });
        
        const endJoystick = (e) => {
            if (!this.joystickActive) return;
            const touchChanged = Array.from(e.changedTouches).some(t => t.identifier === this.joystickTouchId);
            
            if (touchChanged) {
                this.joystickActive = false;
                this.joystickTouchId = null;
                this.joystickX = 0;
                this.joystickY = 0;
                thumb.style.transform = 'translate(-50%, -50%)';
            }
        };

        container.addEventListener('touchend', endJoystick);
        container.addEventListener('touchcancel', endJoystick);
    }
    
    /**
     * Setup firing zone with responsive relative dragging vectors
     */
    setupFiring(firingZone) {
        if (!firingZone) return;
        const dragLimit = 60; 
        
        firingZone.addEventListener('touchstart', (e) => {
            if (this.firingActive) return;
            
            this.firingActive = true;
            const touch = e.changedTouches[0];
            this.firingTouchId = touch.identifier;
            
            this.fireStartPoint.x = touch.clientX;
            this.fireStartPoint.y = touch.clientY;
            
            this.fireX = 0;
            this.fireY = 0;
        }, { passive: false });
        
        firingZone.addEventListener('touchmove', (e) => {
            if (!this.firingActive) return;
            
            const touch = Array.from(e.touches).find(t => t.identifier === this.firingTouchId);
            if (!touch) return;
            
            let dx = touch.clientX - this.fireStartPoint.x;
            let dy = touch.clientY - this.fireStartPoint.y;
            
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > dragLimit) {
                dx = (dx / dist) * dragLimit;
                dy = (dy / dist) * dragLimit;
                dist = dragLimit;
            }
            
            this.fireX = dist > 5 ? (dx / dragLimit) : 0;
            this.fireY = dist > 5 ? (dy / dragLimit) : 0;
        }, { passive: false });
        
        const endFiring = (e) => {
            if (!this.firingActive) return;
            const touchChanged = Array.from(e.changedTouches).some(t => t.identifier === this.firingTouchId);
            
            if (touchChanged) {
                this.firingActive = false;
                this.firingTouchId = null;
                this.fireX = 0;
                this.fireY = 0;
            }
        };

        firingZone.addEventListener('touchend', endFiring);
        firingZone.addEventListener('touchcancel', endFiring);
    }
    
    /**
     * Setup rapid responsive action buttons
     */
    setupActionButtons() {
        const buttons = [
            { id: 'reload-btn', action: 'reload' },
            { id: 'build-btn', action: 'build' },
            { id: 'use-btn', action: 'use-item' }
        ];
        
        buttons.forEach(btnObj => {
            const element = document.getElementById(btnObj.id);
            if (!element) return;
            
            element.addEventListener('touchstart', (e) => {
                e.preventDefault(); 
                this.fireEvent(btnObj.action);
            }, { passive: false });
        });
    }
    
    fireEvent(action) {
        const event = new CustomEvent('mobileAction', { detail: { action } });
        document.dispatchEvent(event);
    }
    
    getMovement() { return { x: this.joystickX, y: this.joystickY }; }
    getFiring() { return { x: this.fireX, y: this.fireY, active: this.firingActive }; }
}

// Global scope initialization
let touchControls;
document.addEventListener('DOMContentLoaded', () => { 
    touchControls = new TouchControls(); 
    requestAnimationFrame(updateInputBridgeLoop);
});

const keyboardState = { w: false, a: false, s: false, d: false, left: false, right: false, up: false, down: false };
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w') keyboardState.w = true;
    if (key === 'a') keyboardState.a = true;
    if (key === 's') keyboardState.s = true;
    if (key === 'd') keyboardState.d = true;
    if (key === 'arrowleft') keyboardState.left = true;
    if (key === 'arrowright') keyboardState.right = true;
    if (key === 'arrowup') keyboardState.up = true;
    if (key === 'arrowdown') keyboardState.down = true;
    if (key === 'r') document.dispatchEvent(new CustomEvent('mobileAction', { detail: { action: 'reload' } }));
    if (key === 'b') document.dispatchEvent(new CustomEvent('mobileAction', { detail: { action: 'build' } }));
    if (key === 'e') document.dispatchEvent(new CustomEvent('mobileAction', { detail: { action: 'use-item' } }));
});
document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w') keyboardState.w = false;
    if (key === 'a') keyboardState.a = false;
    if (key === 's') keyboardState.s = false;
    if (key === 'd') keyboardState.d = false;
    if (key === 'arrowleft') keyboardState.left = false;
    if (key === 'arrowright') keyboardState.right = false;
    if (key === 'arrowup') keyboardState.up = false;
    if (key === 'arrowdown') keyboardState.down = false;
});

// Continuously sync physical input variables with the running game state engine variables
function updateInputBridgeLoop() {
    if (typeof gameState !== 'undefined' && touchControls) {
        if (touchControls.joystickActive) {
            const movement = touchControls.getMovement();
            gameState.playerInput.x = movement.x;
            gameState.playerInput.y = movement.y;
        } else {
            let kx = 0, ky = 0;
            if (keyboardState.w || keyboardState.up) ky -= 1;
            if (keyboardState.s || keyboardState.down) ky += 1;
            if (keyboardState.a || keyboardState.left) kx -= 1;
            if (keyboardState.d || keyboardState.right) kx += 1;
            gameState.playerInput.x = kx;
            gameState.playerInput.y = ky;
        }

        const shooting = touchControls.getFiring();
        gameState.fireInput.active = shooting.active;
        if (shooting.active) {
            gameState.fireInput.x = shooting.x * 200; 
            gameState.fireInput.y = shooting.y * 200;
        }
    }
    requestAnimationFrame(updateInputBridgeLoop);
}

function resizeGameCanvas() {
    const canvas = document.getElementById('canvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}
window.addEventListener('resize', resizeGameCanvas);
window.addEventListener('orientationchange', () => { setTimeout(resizeGameCanvas, 100); });
resizeGameCanvas();

// Connect the Starting Character Selection UI to the Game Engine Loop
document.addEventListener('DOMContentLoaded', () => {
    const classScreen = document.getElementById('class-screen');
    const uiOverlay = document.getElementById('ui-overlay');
    const loadingScreen = document.getElementById('loading');

    const handleSelection = (e) => {
        e.preventDefault();
        const card = e.target.closest('.class-card');
        if (!card) return;

        const selectedClass = card.getAttribute('data-class');
        if (!selectedClass) return;

        if (classScreen) classScreen.style.display = 'none';
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (uiOverlay) uiOverlay.style.display = 'block';
    };

    if (classScreen) {
        classScreen.addEventListener('touchstart', handleSelection, { passive: false });
        classScreen.addEventListener('click', handleSelection);
    }
});

function showErrorMessage(message) {
    const loadingScreen = document.getElementById('loading');
    if (loadingScreen) {
        loadingScreen.innerHTML = `<p style="color: #ff4444;">${message}</p>`;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { gameState, initializeGame };
}
