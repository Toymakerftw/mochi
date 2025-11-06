document.addEventListener('DOMContentLoaded', () => {
  // ===== STATE =====
  let currentSpeed = 0;
  let currentHeading = 0;
  let currentTilt = 0;
  let lastLat = null;
  let lastLon = null;
  let lastTime = null;
  let lastSpeedUpdate = 0;
  let gpsActive = false;
  let motionActive = false;

  // Constants
  const ACCEL_THRESHOLD = 0.3; // m/s²
  const GPS_MAX_AGE = 3000;   // ms
  const MIN_SPEED_FOR_ACCEL = 3; // km/h

  // DOM References
  const rick = document.getElementById('rick');
  const speedEl = document.getElementById('speed');
  const headingEl = document.getElementById('heading');
  const tiltEl = document.getElementById('tilt');
  const modeEl = document.getElementById('mode');
  const locationEl = document.getElementById('location');
  const speechBubble = document.getElementById('speech');
  const speedSourceEl = document.getElementById('speed-source');
  const permissionPrompt = document.getElementById('permission-prompt');

  // Emote definitions
  const emotes = {
    idle: { class: '', speech: "Just cruisin'..." },
    slow: { class: 'sleeping', speech: "Zzz... wake me up when we get there..." },
    normal: { class: 'happy', speech: "Nice and steady! *burp*" },
    fast: { class: 'excited', speech: "Wubba lubba dub dub!" },
    speeding: { class: 'scared', speech: "Whoa whoa WHOA! Slow down!" },
    turning: { class: 'dizzy', speech: "Wheee! Sharp turn!" },
    stopped: { class: 'waving', speech: "Hey! Traffic jam?" },
    bumpy: { class: 'surprised', speech: "Bumpy road ahead!" },
    aggressive: { class: 'angry shooting', speech: "Road rage mode activated!" }
  };

  let currentEmote = 'idle';
  let speechTimeout = null;

  // ===== HELPER FUNCTIONS =====
  function setEmote(emoteName) {
    if (currentEmote === emoteName) return;
    
    currentEmote = emoteName;
    const emote = emotes[emoteName];
    
    // Reset classes
    rick.className = 'rick column';
    
    // Apply new emote classes
    if (emote.class) {
      emote.class.split(' ').forEach(cls => rick.classList.add(cls));
    }
    
    // Update speech
    showSpeech(emote.speech);
    
    // Update mode display
    modeEl.textContent = emoteName.charAt(0).toUpperCase() + emoteName.slice(1);
  }

  function showSpeech(text) {
    speechBubble.textContent = text;
    speechBubble.classList.add('show');
    
    if (speechTimeout) clearTimeout(speechTimeout);
    
    speechTimeout = setTimeout(() => {
      speechBubble.classList.remove('show');
    }, 3000);
  }

  function calculateSpeed(lat1, lon1, lat2, lon2, timeDiffSec) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return (distance / timeDiffSec) * 3600; // km/h
  }

  // ===== SENSOR HANDLERS =====
  function handleGPS(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const heading = position.coords.heading;
    const now = Date.now();
    
    locationEl.textContent = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    gpsActive = true;
    
    // Update heading
    if (heading !== null) {
      currentHeading = heading;
      const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const index = Math.round(heading / 45) % 8;
      headingEl.textContent = `${Math.round(heading)}° ${directions[index]}`;
    }
    
    // Calculate speed from GPS
    if (lastLat !== null && lastTime !== null) {
      const timeDiff = (now - lastTime) / 1000; // seconds
      if (timeDiff > 0.5) {
        const speed = calculateSpeed(lastLat, lastLon, lat, lon, timeDiff);
        currentSpeed = Math.max(0, speed);
        speedEl.textContent = `${Math.round(currentSpeed)} km/h`;
        speedSourceEl.textContent = "GPS";
        lastSpeedUpdate = now;
        updateEmoteBasedOnSpeed();
      }
    } else {
      // First position - no speed yet
      speedEl.textContent = "0 km/h";
    }
    
    // Update position history
    lastLat = lat;
    lastLon = lon;
    lastTime = now;
  }

  function handleAccelerometer(event) {
    const now = Date.now();
    const timeSinceGPS = now - lastSpeedUpdate;
    
    // Only use accelerometer if GPS is stale AND we're already moving
    if (timeSinceGPS > GPS_MAX_AGE && currentSpeed > MIN_SPEED_FOR_ACCEL && gpsActive) {
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc || !acc.x) return;
      
      // Calculate magnitude of acceleration vector (excluding gravity bias)
      const magnitude = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
      
      if (magnitude > ACCEL_THRESHOLD) {
        const timeDelta = (now - lastSpeedUpdate) / 1000; // seconds
        const speedChange = magnitude * timeDelta * 3.6; // m/s² → km/h
        
        // Apply with damping to prevent oscillation
        currentSpeed = Math.max(0, currentSpeed + speedChange * 0.7);
        speedEl.textContent = `${Math.round(currentSpeed)} km/h`;
        speedSourceEl.textContent = "Accelerometer";
        lastSpeedUpdate = now;
        updateEmoteBasedOnSpeed();
      }
    }
  }

  function handleOrientation(event) {
    if (event.beta !== null) {
      currentTilt = Math.round(event.beta);
      tiltEl.textContent = `${currentTilt}°`;
      
      // Detect sharp turns or bumpy road
      if (Math.abs(event.gamma) > 30) {
        setEmote('turning');
      } else if (Math.abs(event.beta) > 45) {
        setEmote('bumpy');
      }
    }
  }

  function updateEmoteBasedOnSpeed() {
    if (currentSpeed < 1) {
      setEmote('stopped');
    } else if (currentSpeed < 10) {
      setEmote('slow');
    } else if (currentSpeed < 50) {
      setEmote('normal');
    } else if (currentSpeed < 80) {
      setEmote('fast');
    } else if (currentSpeed < 120) {
      setEmote('speeding');
    } else {
      setEmote('aggressive');
    }
  }

  // ===== SENSOR INITIALIZATION =====
  async function initSensors() {
    // Hide prompt
    permissionPrompt.classList.add('hidden');
    
    // === GPS INIT ===
    if ('geolocation' in navigator) {
      try {
        navigator.geolocation.watchPosition(
          handleGPS,
          (error) => {
            console.error('GPS Error:', error);
            locationEl.textContent = 'GPS denied or unavailable';
            speedSourceEl.textContent = "GPS unavailable";
          },
          {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 10000
          }
        );
      } catch (err) {
        locationEl.textContent = 'GPS init failed';
        console.error('GPS init error:', err);
      }
    } else {
      locationEl.textContent = 'GPS not supported';
    }
    
    // === MOTION & ORIENTATION INIT ===
    const hasMotion = typeof DeviceMotionEvent !== 'undefined';
    const hasOrientation = typeof DeviceOrientationEvent !== 'undefined';
    
    if (hasMotion || hasOrientation) {
      try {
        // iOS-style permission request (Safari on iOS/iPadOS)
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
          const motionPerm = await DeviceMotionEvent.requestPermission();
          const orientPerm = await DeviceOrientationEvent.requestPermission();
          
          if (motionPerm === 'granted') {
            window.addEventListener('devicemotion', handleAccelerometer);
            motionActive = true;
          }
          if (orientPerm === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        } 
        // Non-iOS: add listeners directly (Chrome, Firefox, etc.)
        else {
          if (hasMotion) {
            window.addEventListener('devicemotion', handleAccelerometer);
            motionActive = true;
          }
          if (hasOrientation) {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        }
        
        if (motionActive) {
          speedSourceEl.textContent = gpsActive ? "GPS + Motion" : "Motion only";
        }
      } catch (err) {
        console.error('Sensor permission error:', err);
        speedSourceEl.textContent = "Motion denied";
      }
    }
    
    // Set initial emote
    setEmote('idle');
  }

  // ===== USER INTERACTION TRIGGER =====
  document.body.addEventListener('click', () => {
    // Only initialize once
    if (!permissionPrompt.classList.contains('hidden')) {
      initSensors();
    }
  }, { once: true });

  // Initial state
  setEmote('idle');
});