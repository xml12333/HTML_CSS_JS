// Key press handling
const keys = document.querySelectorAll('.key');
const apmDisplay = document.getElementById('apm');
const kpsDisplay = document.getElementById('kps');

// Performance tracking
let keyPresses = [];
let lastAPMUpdate = Date.now();
let currentAPM = 0;
let currentKPS = 0;

// Sound context (optional - won't work in CodePen without audio files)
const audioContext = typeof AudioContext !== 'undefined' ? new AudioContext() : null;

// Create click sound using Web Audio API
function playClickSound() {
  if (!audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

// Key press animation and tracking
function handleKeyPress(key, keyElement) {
  keyElement.classList.add('active');
  
  // Visual feedback
  const keyTop = keyElement.querySelector('.key-top');
  const originalBg = keyTop.style.background;
  
  // Track key press
  const now = Date.now();
  keyPresses.push(now);
  
  // Remove old key presses (older than 60 seconds for APM)
  keyPresses = keyPresses.filter(time => now - time < 60000);
  
  // Calculate APM (Actions Per Minute)
  currentAPM = keyPresses.length;
  
  // Calculate KPS (Keys Per Second) - last 1 second
  const recentPresses = keyPresses.filter(time => now - time < 1000);
  currentKPS = recentPresses.length;
  
  // Update displays
  updatePerformanceDisplay();
  
  // Play sound
  playClickSound();
  
  // Create ripple effect
  createRipple(keyElement);
}

function handleKeyRelease(keyElement) {
  setTimeout(() => {
    keyElement.classList.remove('active');
  }, 50);
}

// Create ripple effect on key press
function createRipple(keyElement) {
  const ripple = document.createElement('div');
  ripple.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10px;
    height: 10px;
    background: radial-gradient(circle, rgba(255,255,255,0.8), transparent);
    border-radius: 50%;
    transform: translate(-50%, -50%) translateZ(20px);
    pointer-events: none;
    animation: ripple-expand 0.5s ease-out forwards;
  `;
  
  keyElement.appendChild(ripple);
  
  setTimeout(() => ripple.remove(), 500);
}

// Add ripple animation to page
if (!document.querySelector('#ripple-style')) {
  const style = document.createElement('style');
  style.id = 'ripple-style';
  style.textContent = `
    @keyframes ripple-expand {
      to {
        width: 80px;
        height: 80px;
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Update performance display with smooth transitions
function updatePerformanceDisplay() {
  // Smooth APM update
  const targetAPM = Math.round(currentAPM);
  animateValue(apmDisplay, parseInt(apmDisplay.textContent), targetAPM, 300);
  
  // Instant KPS update
  kpsDisplay.textContent = currentKPS;
  
  // Add glow effect on high performance
  if (currentKPS > 5) {
    kpsDisplay.style.color = '#ff00ff';
    kpsDisplay.style.textShadow = '0 0 20px rgba(255, 0, 255, 0.8)';
  } else if (currentKPS > 3) {
    kpsDisplay.style.color = '#00ffff';
    kpsDisplay.style.textShadow = '0 0 15px rgba(0, 255, 255, 0.6)';
  } else {
    kpsDisplay.style.color = '#00ffff';
    kpsDisplay.style.textShadow = '0 0 10px rgba(0, 255, 255, 0.5)';
  }
}

// Animate number changes
function animateValue(element, start, end, duration) {
  const range = end - start;
  const startTime = Date.now();
  
  function update() {
    const now = Date.now();
    const progress = Math.min((now - startTime) / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
    
    element.textContent = Math.round(start + range * easeProgress);
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// Mouse interactions
keys.forEach(key => {
  key.addEventListener('mousedown', (e) => {
    const keyChar = key.dataset.key;
    handleKeyPress(keyChar, key);
  });
  
  key.addEventListener('mouseup', () => {
    handleKeyRelease(key);
  });
  
  key.addEventListener('mouseleave', () => {
    handleKeyRelease(key);
  });
  
  // Touch support
  key.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const keyChar = key.dataset.key;
    handleKeyPress(keyChar, key);
  });
  
  key.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleKeyRelease(key);
  });
});

// Keyboard support
const keyMap = {
  'z': 'Z',
  'Z': 'Z',
  'x': 'X',
  'X': 'X'
};

document.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  
  const mappedKey = keyMap[e.key];
  if (mappedKey) {
    const keyElement = document.querySelector(`[data-key="${mappedKey}"]`);
    if (keyElement && !keyElement.classList.contains('active')) {
      handleKeyPress(mappedKey, keyElement);
    }
  }
});

document.addEventListener('keyup', (e) => {
  const mappedKey = keyMap[e.key];
  if (mappedKey) {
    const keyElement = document.querySelector(`[data-key="${mappedKey}"]`);
    if (keyElement) {
      handleKeyRelease(keyElement);
    }
  }
});

// Update KPS display every second
setInterval(() => {
  const now = Date.now();
  const recentPresses = keyPresses.filter(time => now - time < 1000);
  currentKPS = recentPresses.length;
  
  if (currentKPS === 0) {
    kpsDisplay.textContent = '0';
    kpsDisplay.style.color = '#00ffff';
    kpsDisplay.style.textShadow = '0 0 10px rgba(0, 255, 255, 0.5)';
  }
}, 1000);

// Clean up old key presses periodically
setInterval(() => {
  const now = Date.now();
  keyPresses = keyPresses.filter(time => now - time < 60000);
  currentAPM = keyPresses.length;
  updatePerformanceDisplay();
}, 5000);

// Add some visual polish
document.addEventListener('DOMContentLoaded', () => {
  // Entrance animation
  const keyboard = document.querySelector('.keyboard-base');
  if (keyboard) {
    keyboard.style.animation = 'none';
    keyboard.style.opacity = '0';
    keyboard.style.transform = 'rotateX(25deg) rotateY(-15deg) translateZ(-50px)';
    
    setTimeout(() => {
      keyboard.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
      keyboard.style.opacity = '1';
      keyboard.style.transform = 'rotateX(25deg) rotateY(-15deg) translateZ(0)';
      
      setTimeout(() => {
        keyboard.style.transition = '';
        keyboard.style.animation = '';
      }, 1000);
    }, 100);
  }
  
  // Add hover effects to display
  const display = document.querySelector('.display-screen');
  if (display) {
    display.addEventListener('mouseenter', () => {
      display.style.filter = 'brightness(1.2)';
    });
    
    display.addEventListener('mouseleave', () => {
      display.style.filter = 'brightness(1)';
    });
  }
});

// Performance optimization: Request animation frame for smooth updates
let rafId = null;
function smoothUpdate() {
  // Any continuous animations can go here
  rafId = requestAnimationFrame(smoothUpdate);
}

// Start smooth update loop
smoothUpdate();

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (rafId) {
    cancelAnimationFrame(rafId);
  }
});

// Easter egg: Konami code for special effect
let konamiCode = [];
const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
                      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 
                      'b', 'a'];

document.addEventListener('keydown', (e) => {
  konamiCode.push(e.key);
  konamiCode = konamiCode.slice(-10);
  
  if (konamiCode.join(',') === konamiPattern.join(',')) {
    activateRainbowMode();
    konamiCode = [];
  }
});

function activateRainbowMode() {
  const keyboard = document.querySelector('.keyboard-body');
  if (keyboard) {
    keyboard.style.animation = 'rainbow-glow 2s linear infinite';
    
    // Add rainbow animation if not exists
    if (!document.querySelector('#rainbow-style')) {
      const style = document.createElement('style');
      style.id = 'rainbow-style';
      style.textContent = `
        @keyframes rainbow-glow {
          0% { box-shadow: 0 25px 50px rgba(255, 0, 0, 0.8), 0 0 100px rgba(255, 0, 0, 0.3); }
          16% { box-shadow: 0 25px 50px rgba(255, 165, 0, 0.8), 0 0 100px rgba(255, 165, 0, 0.3); }
          33% { box-shadow: 0 25px 50px rgba(255, 255, 0, 0.8), 0 0 100px rgba(255, 255, 0, 0.3); }
          50% { box-shadow: 0 25px 50px rgba(0, 255, 0, 0.8), 0 0 100px rgba(0, 255, 0, 0.3); }
          66% { box-shadow: 0 25px 50px rgba(0, 0, 255, 0.8), 0 0 100px rgba(0, 0, 255, 0.3); }
          83% { box-shadow: 0 25px 50px rgba(75, 0, 130, 0.8), 0 0 100px rgba(75, 0, 130, 0.3); }
          100% { box-shadow: 0 25px 50px rgba(238, 130, 238, 0.8), 0 0 100px rgba(238, 130, 238, 0.3); }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Reset after 10 seconds
    setTimeout(() => {
      keyboard.style.animation = '';
    }, 10000);
  }
}

console.log('OSU! Sayo Device initialized. Press Z and X keys or click the buttons to play!');