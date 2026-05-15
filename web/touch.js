/**
 * Mobile Touch Controls for Zombie Survival
 * Handles virtual joystick, firing, and action buttons
 */

class TouchControls {
    constructor() {
        this.joystickActive = false;
        this.joystickX = 0;
        this.joystickY = 0;
        this.firingActive = false;
        this.fireX = 0;
        this.fireY = 0;
        
        this.init();
    }
    
    init() {
        // Joystick
        const joystickContainer = document.getElementById('joystick');
        const joystickThumb = document.querySelector('.joystick-thumb');
        
        this.setupJoystick(joystickContainer, joystickThumb);
        
        // Firing Zone
        const firingZone = document.getElementById('firing-zone');
        this.setupFiring(firingZone);
        
        // Action Buttons
        this.setupActionButtons();
        
        // Prevent default touch behaviors
        document.addEventListener('touchmove', (e) => {
            if (e.target === document.getElementById('canvas') ||
                e.target.closest('.ui-overlay')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    /**
     * Setup virtual joystick for movement
     */
    setupJoystick(container, thumb) {
        let startX, startY;
        const radius = container.offsetWidth / 2;
        const centerX = container.offsetLeft + radius;
        const centerY = container.offsetTop + radius;
        
        container.addEventListener('touchstart', (e) => {
            this.joystickActive = true;
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        });
        
        container.addEventListener('touchmove', (e) => {
            if (!this.joystickActive) return;
            
            const touch = e.touches[0];
            let dx = touch.clientX - startX;
            let dy = touch.clientY - startY;
            
            // Clamp to radius
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > radius) {
                dx = (dx / distance) * radius;
                dy = (dy / distance) * radius;
            }
            
            // Update thumb position
            thumb.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
            
            // Normalize to -1 to 1
            this.joystickX = dx / radius;
            this.joystickY = dy / radius;
        });
        
        container.addEventListener('touchend', (e) => {
            this.joystickActive = false;
            this.joystickX = 0;
            this.joystickY = 0;
            thumb.style.transform = 'translate(-50%, -50%)';
        });
    }
    
    /**
     * Setup firing zone (right side of screen)
     */
    setupFiring(firingZone) {
        firingZone.addEventListener('touchstart', (e) => {
            this.firingActive = true;
            const touch = e.touches[0];
            this.fireX = (touch.clientX / window.innerWidth - 0.5) * 2;
            this.fireY = (touch.clientY / window.innerHeight - 0.5) * 2;
        });
        
        firingZone.addEventListener('touchmove', (e) => {
            if (!this.firingActive) return;
            
            const touch = e.touches[0];
            this.fireX = (touch.clientX / window.innerWidth - 0.5) * 2;
            this.fireY = (touch.clientY / window.innerHeight - 0.5) * 2;
        });
        
        firingZone.addEventListener('touchend', (e) => {
            this.firingActive = false;
            this.fireX = 0;
            this.fireY = 0;
        });
    }
    
    /**
     * Setup action buttons
     */
    setupActionButtons() {
        const reloadBtn = document.getElementById('reload-btn');
        const buildBtn = document.getElementById('build-btn');
        const useBtn = document.getElementById('use-btn');
        
        reloadBtn.addEventListener('touchstart', () => {
            this.fireEvent('reload');
        });
        
        buildBtn.addEventListener('touchstart', () => {
            this.fireEvent('build');
        });
        
        useBtn.addEventListener('touchstart', () => {
            this.fireEvent('use-item');
        });
    }
    
    /**
     * Fire custom event for game
     */
    fireEvent(action) {
        const event = new CustomEvent('mobileAction', { detail: { action } });
        document.dispatchEvent(event);
    }
    
    /**
     * Get movement input (-1 to 1)
     */
    getMovement() {
        return {
            x: this.joystickX,
            y: this.joystickY
        };
    }
    
    /**
     * Get firing input (-1 to 1)
     */
    getFiring() {
        return {
            x: this.fireX,
            y: this.fireY,
            active: this.firingActive
        };
    }
}

// Initialize touch controls when page loads
let touchControls;
document.addEventListener('DOMContentLoaded', () => {
    touchControls = new TouchControls();
});

/**
 * Keyboard fallback for testing on desktop
 */
const keyboardState = {
    w: false, a: false, s: false, d: false,
    left: false, right: false, up: false, down: false
};

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

/**
 * Get input from either touch or keyboard
 */
function getPlayerInput() {
    let x = 0, y = 0;
    
    if (touchControls) {
        const movement = touchControls.getMovement();
        x = movement.x;
        y = movement.y;
    }
    
    // Keyboard fallback
    if (keyboardState.w || keyboardState.up) y -= 1;
    if (keyboardState.s || keyboardState.down) y += 1;
    if (keyboardState.a || keyboardState.left) x -= 1;
    if (keyboardState.d || keyboardState.right) x += 1;
    
    // Normalize diagonal movement
    const magnitude = Math.sqrt(x * x + y * y);
    if (magnitude > 1) {
        x /= magnitude;
        y /= magnitude;
    }
    
    return { x, y };
}

/**
 * Get firing input from either touch or keyboard
 */
function getFireInput() {
    if (!touchControls) return { x: 0, y: 0, active: false };
    
    return touchControls.getFiring();
}

/**
 * Handle responsive canvas sizing
 */
function resizeCanvas() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Notify game of resize
    const event = new CustomEvent('canvasResize', {
        detail: { width: canvas.width, height: canvas.height }
    });
    document.dispatchEvent(event);
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 100);
});

// Initial setup
resizeCanvas();
