/* -------------------------------------------------------------
   Dasai-Mochi Main App
   Coordinates expressions, sensors, and interactions
   ------------------------------------------------------------- */

// Global state
window.STATE = {
  tiltX: 0,
  tiltY: 0,
  speed: 0,
  acceleration: 0,
  lastPos: null,
  lastTime: null,
  lastSpeed: 0,
  currentExpr: "regEyes",
  idleTimer: null,
  isSleeping: false,
  petting: false,
  batteryLow: false,
  isTurning: false,
  isBraking: false,
  isAccelerating: false,
  currentMood: 'neutral',
  carModeActive: false
};

// Make expressions globally available
window.expr = expr;

/* -------------------  Decision Engine ------------------- */
let lastChange = 0;
let lastSpeedCheck = 0;
let lastCameraCheck = 0;

function chooseExpression() {
  if (!STATE.carModeActive) return;
  if (STATE.isSleeping) return;
  if (STATE.isTurning || STATE.isBraking || STATE.isAccelerating) return;
  
  const now = Date.now();
  
  // Check for camera alerts (priority over other expressions)
  if (STATE.nearbyCamera && STATE.lastCameraAlert && (now - STATE.lastCameraAlert < 5000)) { // Alert for 5 seconds
    expr.cameraAlert();
    lastChange = now;
    resetIdle();
    return;
  }
  
  // Speed-based reactions
  if (now - lastSpeedCheck > 3000) {
    lastSpeedCheck = now;
    
    // Very fast (>80 km/h)
    if (STATE.speed > 80) {
      expr.speedy();
      lastChange = now;
      resetIdle();
      return;
    }
    
    // Fast and loving it (50-80 km/h)
    if (STATE.speed > 50 && STATE.speed <= 80) {
      if (Math.random() > 0.5) {
        expr.cool();
      } else {
        expr.determined();
      }
      lastChange = now;
      resetIdle();
      return;
    }
    
    // Medium speed with hearts (20-50 km/h)
    if (STATE.speed > 20 && STATE.speed <= 50) {
      if (Math.random() > 0.7) {
        expr.heart();
      } else {
        expr.regEyes();
      }
      lastChange = now;
      resetIdle();
      return;
    }
    
    // Slow/stopped (0-20 km/h)
    if (STATE.speed <= 20 && STATE.speed > 1) {
      if (Math.random() > 0.5) {
        expr.relaxed();
      } else {
        expr.thinking();
      }
      lastChange = now;
      resetIdle();
      return;
    }
  }
  
  // Tilt-based reactions (when not turning sharply)
  const ax = Math.abs(STATE.tiltX);
  const ay = Math.abs(STATE.tiltY);
  
  // Moderate tilt - curious look
  if (ax > 15 && ax < 30 && now - lastChange > 2000) {
    const direction = STATE.tiltX > 0 ? 'right' : 'left';
    expr.sideEye(direction);
    lastChange = now;
    resetIdle();
    return;
  }
  
  // Forward tilt (going uphill or accelerating)
  if (ay > 20 && ay < 50 && now - lastChange > 2000) {
    expr.determined();
    lastChange = now;
    resetIdle();
    return;
  }
  
  // Backward tilt (going downhill or braking)
  if (ay < -20 && ay > -50 && now - lastChange > 2000) {
    expr.worried();
    lastChange = now;
    resetIdle();
    return;
  }
  
  // Random idle expressions (when driving normally)
  if (now - lastChange > 6000 && STATE.speed > 5) {
    const idles = [
      expr.regEyes,
      () => expr.wink(Math.random() < 0.5),
      expr.carrotEyes,
      expr.thinking,
      expr.relaxed
    ];
    idles[Math.floor(Math.random() * idles.length)]();
    lastChange = now;
    resetIdle();
  }
  
  // Random idle when stopped
  if (now - lastChange > 8000 && STATE.speed <= 5) {
    const stoppedIdles = [
      expr.bored,
      expr.thinking,
      () => expr.wink(Math.random() < 0.5),
      expr.sideEye
    ];
    stoppedIdles[Math.floor(Math.random() * stoppedIdles.length)]();
    lastChange = now;
    resetIdle();
  }
}

/* -------------------  Status Display ------------------- */
function createStatusDisplay() {
  const status = document.getElementById('status');
  
  if (!status) return;
  
  // Update status every second
  setInterval(() => {
    if (STATE.speed > 1 && STATE.carModeActive) {
      status.style.display = 'block';
      status.textContent = `🚗 ${STATE.speed.toFixed(1)} km/h`;
      
      // Add battery indicator if low
      if (STATE.batteryLow) {
        status.textContent += ' 🔋';
      }
    } else {
      status.style.display = 'none';
    }
  }, 1000);
}

/* -------------------  Main Loop ------------------- */
function startMainLoop() {
  const loop = () => {
    chooseExpression();
    const delay = STATE.batteryLow ? 500 : 250;
    setTimeout(loop, delay);
  };
  loop();
}

/* -------------------  Initialization ------------------- */
function initMochi() {
  const svg = document.querySelector('svg');
  
  // Initialize all components
  initExpressions(svg);
  initSensors();
  if (typeof initInteractions === 'function') {
    initInteractions();
  } else {
    console.error('initInteractions function not available');
  }
  createStatusDisplay();
  resetIdle();
  startMainLoop();
  
  // Wake-up animation on first load
  setTimeout(() => {
    expr.sleep();
    STATE.isSleeping = true;
    setTimeout(wakeUp, 1000);
  }, 500);
}

// Start the app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMochi);
} else {
  initMochi();
}