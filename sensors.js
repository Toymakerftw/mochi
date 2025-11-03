/* -------------------------------------------------------------
   Dasai-Mochi Sensors
   Handles device orientation, motion, and geolocation
   ------------------------------------------------------------- */

// Use the global STATE object

/* -------------------  Device Orientation ------------------- */
function initOrientation() {
  const request = typeof DeviceOrientationEvent.requestPermission === 'function';
  const btn = document.getElementById('carModeBtn');
  
  if (request) {
    btn.style.display = 'block';
    btn.onclick = () => DeviceOrientationEvent.requestPermission()
      .then(r => {
        if (r === 'granted') {
          window.addEventListener('deviceorientation', oriHandler);
          btn.textContent = '✓ Car Mode Active';
          STATE.carModeActive = true;
          setTimeout(() => {
            btn.style.display = 'none';
          }, 2000);
        }
      })
      .catch(err => {
        btn.textContent = 'Permission Denied';
        setTimeout(() => {
          btn.style.display = 'none';
        }, 2000);
      });
  } else {
    btn.style.display = 'none';
    window.addEventListener('deviceorientation', oriHandler);
    STATE.carModeActive = true;
  }
}

function oriHandler(e) {
  if (!STATE.carModeActive || STATE.isSleeping) return;
  
  if (e.gamma !== null) STATE.tiltX = e.gamma;
  if (e.beta !== null) STATE.tiltY = e.beta;
  
  // Detect turning based on gamma (left/right tilt)
  const absTiltX = Math.abs(STATE.tiltX);
  if (absTiltX > 20 && !STATE.isTurning) {
    STATE.isTurning = true;
    const direction = STATE.tiltX > 0 ? 'right' : 'left';
    window.expr.sideEye(direction);
    setTimeout(() => {
      STATE.isTurning = false;
      if (!STATE.isSleeping) window.expr.regEyes();
    }, 1500);
  }
}

/* -------------------  Device Motion ------------------- */
function initMotion() {
  let lastAccel = null;
  let motionHandlerActive = false;

  window.addEventListener('devicemotion', e => {
    if (!STATE.carModeActive || STATE.isSleeping) return;
    
    const a = e.accelerationIncludingGravity;
    if (!a.x || !a.y || !a.z) return;
    
    // Debounce motion events
    if (motionHandlerActive) return;
    motionHandlerActive = true;
    
    setTimeout(() => {
      motionHandlerActive = false;
    }, 100);
    
    if (lastAccel) {
      const dx = a.x - lastAccel.x;
      const dy = a.y - lastAccel.y;
      const dz = a.z - lastAccel.z;
      const force = Math.hypot(dx, dy, dz);
      
      // Detect hard braking (sudden deceleration)
      if (dy > 15 && !STATE.isBraking) {
        STATE.isBraking = true;
        window.expr.scared();
        setTimeout(() => {
          STATE.isBraking = false;
          if (!STATE.isSleeping) window.expr.regEyes();
        }, 2000);
      }
      
      // Detect acceleration (speeding up)
      if (dy < -12 && !STATE.isAccelerating) {
        STATE.isAccelerating = true;
        window.expr.excited();
        window.expr.speedLines();
        setTimeout(() => {
          STATE.isAccelerating = false;
          if (!STATE.isSleeping) window.expr.regEyes();
        }, 2000);
      }
      
      // Detect shake (rough road)
      if (force > 20 && !STATE.isSleeping) {
        window.expr.dizzy();
        setTimeout(() => {
          if (!STATE.isSleeping) window.expr.worried();
        }, 1500);
        setTimeout(() => {
          if (!STATE.isSleeping) window.expr.regEyes();
        }, 3000);
      }
    }
    lastAccel = { x: a.x, y: a.y, z: a.z };
  });
}

/* -------------------  Geolocation ------------------- */
function initGeolocation() {
  if (!('geolocation' in navigator)) {
    console.log('Geolocation not available');
    return;
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  navigator.geolocation.watchPosition(
    position => {
      if (STATE.lastPos && STATE.lastTime) {
        const dLat = position.coords.latitude - STATE.lastPos.latitude;
        const dLon = position.coords.longitude - STATE.lastPos.longitude;
        const dt = (position.timestamp - STATE.lastTime) / 1000;
        
        // Calculate distance using Haversine formula
        const R = 6371000; // Earth's radius in meters
        const lat1 = STATE.lastPos.latitude * Math.PI / 180;
        const lat2 = position.coords.latitude * Math.PI / 180;
        const dLatRad = dLat * Math.PI / 180;
        const dLonRad = dLon * Math.PI / 180;
        
        const a = Math.sin(dLatRad/2) * Math.sin(dLatRad/2) +
                 Math.cos(lat1) * Math.cos(lat2) *
                 Math.sin(dLonRad/2) * Math.sin(dLonRad/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distM = R * c;
        
        const newSpeed = distM / dt * 3.6; // km/h
        
        // Calculate acceleration
        STATE.acceleration = (newSpeed - STATE.lastSpeed) / dt;
        STATE.speed = newSpeed;
        STATE.lastSpeed = newSpeed;
      }
      STATE.lastPos = position.coords;
      STATE.lastTime = position.timestamp;
    },
    error => {
      console.log('Geolocation error:', error);
      // Fallback to simulated speed for demo purposes
      if (STATE.carModeActive && !STATE.lastPos) {
        simulateSpeed();
      }
    },
    options
  );
}

// Fallback speed simulation for demo
function simulateSpeed() {
  let simulatedSpeed = 0;
  setInterval(() => {
    if (STATE.carModeActive && !STATE.lastPos) {
      // Random speed changes for demo
      simulatedSpeed += (Math.random() - 0.5) * 10;
      simulatedSpeed = Math.max(0, Math.min(120, simulatedSpeed));
      STATE.speed = simulatedSpeed;
      STATE.lastSpeed = simulatedSpeed;
    }
  }, 3000);
}

/* -------------------  Battery API ------------------- */
function initBattery() {
  if (!('getBattery' in navigator)) {
    console.log('Battery API not available');
    return;
  }

  navigator.getBattery().then(battery => {
    STATE.batteryLow = battery.level < 0.15;
    
    battery.addEventListener('levelchange', () => {
      STATE.batteryLow = battery.level < 0.15;
      if (STATE.batteryLow && !STATE.isSleeping) {
        window.expr.worried();
        setTimeout(() => {
          if (!STATE.isSleeping) window.expr.regEyes();
        }, 2000);
      }
    });
    
    battery.addEventListener('chargingchange', () => {
      if (battery.charging && STATE.batteryLow) {
        window.expr.excited();
        setTimeout(() => {
          if (!STATE.isSleeping) window.expr.regEyes();
        }, 2000);
      }
    });
  });
}

/* -------------------  Initialize All Sensors ------------------- */
function initSensors() {
  initOrientation();
  initMotion();
  initGeolocation();
  initBattery();
}

// Make functions available globally
window.initSensors = initSensors;