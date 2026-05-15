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
        // Dynamically compute size boundaries safely
        const radius = container.offsetWidth / 2 || 50; 
        
        container.addEventListener('touchstart', (e) => {
            if (this.joystickActive) return; // Guard logic
            
            this.joystickActive = true;
            const touch = e.changedTouches[0];
            this.joystickTouchId = touch.identifier;
            startX = touch.clientX;
            startY = touch.clientY;
        }, { passive: false });
        
        container.addEventListener('touchmove', (e) => {
            if (!this.joystickActive) return;
            
            // Find our specific joystick touch handle from active cluster
            const touch = Array.from(e.touches).find(t => t.identifier === this.joystickTouchId);
            if (!touch) return;
            
            let dx = touch.clientX - startX;
            let dy = touch.clientY - startY;
            
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > radius) {
                dx = (dx / distance) * radius;
                dy = (dy / distance) * radius;
            }
            
            // Instantly apply CSS transformation without frame delay
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
        const dragLimit = 60; // Max drag vector length for full sensitivity reach
        
        firingZone.addEventListener('touchstart', (e) => {
            if (this.firingActive) return;
            
            this.firingActive = true;
            const touch = e.changedTouches[0];
            this.firingTouchId = touch.identifier;
            
            // Remember starting point anchor to calculate a sliding aim vector
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
            
            // Provide exact vectors normalized smoothly to game logic
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
                e.preventDefault(); // Fully kills 300ms tap simulation latency delay
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

// Global scope fallbacks preservation
let touchControls;
document.addEventListener('DOMContentLoaded', () => { touchControls = new TouchControls(); });

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

function getPlayerInput() {
    let x = 0;
    let y = 0;
    
    // 1. Prioritize Mobile Touch Joystick
    if (touchControls && touchControls.joystickActive) {
        const movement = touchControls.getMovement();
        x = movement.x;
        y = movement.y;
    } 
    // 2. Fallback to Keyboard if no active touch input
    else {
        if (keyboardState.w || keyboardState.up) y -= 1;
        if (keyboardState.s || keyboardState.down) y += 1;
        if (keyboardState.a || keyboardState.left) x -= 1;
        if (keyboardState.d || keyboardState.right) x += 1;
        
        // Normalize keyboard diagonal speed
        const magnitude = Math.sqrt(x * x + y * y);
        if (magnitude > 1) { 
            x /= magnitude; 
            y /= magnitude; 
        }
    }
    
    return { x, y };
}
function getFireInput() {
    if (!touchControls) return { x: 0, y: 0, active: false };
    return touchControls.getFiring();
}

function resizeCanvas() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.dispatchEvent(new CustomEvent('canvasResize', { detail: { width: canvas.width, height: canvas.height } }));
}
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => { setTimeout(resizeCanvas, 100); });
resizeCanvas();
// Connect the Starting Character Selection UI to the Game Engine Loop
document.addEventListener('DOMContentLoaded', () => {
    const classScreen = document.getElementById('class-screen');
    const uiOverlay = document.getElementById('ui-overlay');
    const loadingScreen = document.getElementById('loading');

    const handleSelection = (e) => {
        e.preventDefault();
        
        // Climbs up the DOM tree to find the .class-card wrapper cleanly
        const card = e.target.closest('.class-card');
        if (!card) return;

        const selectedClass = card.getAttribute('data-class');
        if (!selectedClass) return;

        // Dismiss modals and mount the active touch HUD overlay
        if (classScreen) classScreen.style.display = 'none';
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (uiOverlay) uiOverlay.style.display = 'block';
        
        // Dispatch custom event to initialize the WebAssembly engine simulation loop
        const event = new CustomEvent('mobileAction', { 
            detail: { action: `spawn-${selectedClass}` } 
        });
        document.dispatchEvent(event);
    };

   if (classScreen) {
        classScreen.addEventListener('touchstart', handleSelection, { passive: false });
        classScreen.addEventListener('click', handleSelection);
    }
}); // <-- This bracket closes DOMContentLoaded correctly
}); // <-- TYPO: This extra bracket crashes the script compiler, disabling TouchControls entirely!
