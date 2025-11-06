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
  let lastHeading = null;
  let headingChangeRate = 0;
  let lastHeadingTime = null;
  let accelerationX = 0;
  let accelerationY = 0;
  let accelerationZ = 0;
  let lastCourse = null;
  let bumpDetectionHistory = [];
  let lastBumpTime = null;

  // Constants
  const ACCEL_THRESHOLD = 0.3; // m/s²
  const GPS_MAX_AGE = 3000;   // ms
  const MIN_SPEED_FOR_ACCEL = 3; // km/h
  const CAMERA_PROXIMITY_THRESHOLD = 500; // meters
  const HEAD_CHANGE_THRESHOLD = 15; // degrees for corner detection
  const HEAD_CHANGE_THRESHOLD_SHARP = 30; // degrees for sharp corner detection
  const BUMP_THRESHOLD = 2.0; // m/s² for bump detection
  const HARD_BRAKE_THRESHOLD = -2.5; // m/s² for hard braking
  const HIGH_SPEED_THRESHOLD = 80; // km/h
  const OVER_SPEED_THRESHOLD = 120; // km/h
  const DRIFT_THRESHOLD = 25; // degrees difference between heading and course

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

  let cameras = [];

  // Emote definitions
  const emotes = {
    idle: { class: '', speech: "Just cruisin'..." },
    slow: { class: 'sleeping', speech: "Zzz... wake me up when we get there..." },
    normal: { class: 'happy', speech: "Nice and steady! *burp*" },
    fast: { class: 'excited', speech: "Wubba lubba dub dub!" },
    speeding: { class: 'scared', speech: "Whoa whoa WHOA! Slow down!" },
    turning: { class: 'dizzy', speech: "Wheee! Sharp turn!" },
    stopped: { class: '', speech: "Hey! Traffic jam?" },
    bumpy: { class: 'surprised', speech: "Bumpy road ahead!" },
    aggressive: { class: 'angry shooting', speech: "Road rage mode activated!" },
    accelerating: { class: 'excited', speech: "Punch it!" },
    braking: { class: 'scared', speech: "Hit the brakes!" },
    looking: { class: '', speech: "What's over there?" },
    cornering: { class: 'dizzy', speech: "Taking this corner fast!" },
    sharp_corner: { class: 'surprised dizzy', speech: "Sharp corner!" },
    hard_brake: { class: 'scared', speech: "Emergency brake!" },
    bumpy_road: { class: 'surprised', speech: "Bumpy road!" },
    high_speed: { class: 'excited', speech: "Living on the edge! Fast!" },
    over_speed: { class: 'scared', speech: "Way too fast!" },
    drifting: { class: 'dizzy excited', speech: "Drifting!" },
    hill_climb: { class: 'determined', speech: "Climbing this hill!" },
    steep_descent: { class: 'concerned', speech: "Careful on this descent!" },
    crosswind: { class: 'dizzy', speech: "Strong crosswind!" },
    safety: { class: 'happy', speech: "Driving safely! Good job!" }
  };

  let currentEmote = 'idle';
  let speechTimeout = null;
  let lastSpeed = 0;

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

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
  }

  function calculateSpeed(lat1, lon1, lat2, lon2, timeDiffSec) {
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    return (distance / timeDiffSec) * 3.6; // km/h
  }

  async function loadCameras() {
    try {
      const response = await fetch('cameras.csv');
      const data = await response.text();
      const rows = data.split('\n').slice(1);
      cameras = rows.map(row => {
        const [name, latitude, longitude] = row.split(',');
        return { name, latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
      });
    } catch (error) {
      console.error('Error loading cameras:', error);
    }
  }

  function checkCameraProximity(lat, lon) {
    for (const camera of cameras) {
      const distance = calculateDistance(lat, lon, camera.latitude, camera.longitude);
      if (distance < CAMERA_PROXIMITY_THRESHOLD) {
        showSpeech(`Camera ahead: ${camera.name}`);
      }
    }
  }

  // ===== SENSOR HANDLERS =====
  function handleGPS(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const heading = position.coords.heading;
    const course = position.coords.course; // GPS course over ground
    const now = Date.now();
    
    locationEl.textContent = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    gpsActive = true;

    checkCameraProximity(lat, lon);
    
    // Update heading and detect turns/corners
    if (heading !== null) {
      if (currentSpeed < 1 && Math.abs(heading - currentHeading) > 10) {
        setEmote('looking');
      }
      
      // Calculate heading change rate for corner detection
      if (lastHeading !== null && lastHeadingTime !== null) {
        const headingDelta = Math.abs(heading - lastHeading);
        // Normalize the heading delta to handle wrap-around (e.g., 359 to 1 = 2 degrees)
        const normalizedDelta = headingDelta > 180 ? 360 - headingDelta : headingDelta;
        const timeDelta = (now - lastHeadingTime) / 1000; // seconds
        headingChangeRate = normalizedDelta / timeDelta;
        
        // Detect corners based on rapid heading change
        if (currentSpeed > 10 && headingChangeRate > 20) { // degrees per second
          if (headingChangeRate > 45) {
            setEmote('sharp_corner');
          } else {
            setEmote('cornering');
          }
        }
      }
      
      // Detect drifting by comparing heading and course
      if (course !== null && lastCourse !== null) {
        const courseDelta = Math.abs(course - heading);
        const normalizedCourseDelta = courseDelta > 180 ? 360 - courseDelta : courseDelta;
        
        if (normalizedCourseDelta > DRIFT_THRESHOLD && currentSpeed > 30) {
          setEmote('drifting');
        }
      }
      
      currentHeading = heading;
      lastHeading = heading;
      lastHeadingTime = now;
      lastCourse = course;
      
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

  function handleMotion(event) {
    const acc = event.accelerationIncludingGravity;
    const rot = event.rotationRate;
    const now = Date.now();
    const timeSinceGPS = now - lastSpeedUpdate;

    if (acc) {
      // Store previous acceleration values for bump/brake detection
      const prevAccX = accelerationX;
      const prevAccY = accelerationY;
      const prevAccZ = accelerationZ;
      
      accelerationX = acc.x;
      accelerationY = acc.y;
      accelerationZ = acc.z;
      
      // Only use accelerometer if GPS is stale AND we're already moving
      if (timeSinceGPS > GPS_MAX_AGE && currentSpeed > MIN_SPEED_FOR_ACCEL && gpsActive) {
        const magnitude = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
        if (magnitude > ACCEL_THRESHOLD) {
          const timeDelta = (now - lastSpeedUpdate) / 1000; // seconds
          const speedChange = magnitude * timeDelta * 3.6; // m/s² → km/h
          currentSpeed = Math.max(0, currentSpeed + speedChange * 0.7);
          speedEl.textContent = `${Math.round(currentSpeed)} km/h`;
          speedSourceEl.textContent = "Accelerometer";
          lastSpeedUpdate = now;
          updateEmoteBasedOnSpeed();
        }
      }

      // Calculate acceleration magnitude for bump detection
      const mag = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
      
      // Detect bumps (sudden high acceleration or rapid change in acceleration)
      if (currentSpeed > 5) {
        // Calculate jerk (rate of change of acceleration)
        if (prevAccX !== 0 || prevAccY !== 0 || prevAccZ !== 0) {
          const jerkX = Math.abs(acc.x - prevAccX);
          const jerkY = Math.abs(acc.y - prevAccY);
          const jerkZ = Math.abs(acc.z - prevAccZ);
          const totalJerk = Math.sqrt(jerkX**2 + jerkY**2 + jerkZ**2);
          
          // Add current jerk to history for smoothing
          bumpDetectionHistory.push({ time: now, jerk: totalJerk });
          
          // Keep only recent values (last 1 second)
          const cutoffTime = now - 1000;
          bumpDetectionHistory = bumpDetectionHistory.filter(item => item.time > cutoffTime);
          
          // Calculate average jerk in the last second
          let totalRecentJerk = 0;
          let count = 0;
          for (const item of bumpDetectionHistory) {
            totalRecentJerk += item.jerk;
            count++;
          }
          const avgJerk = count > 0 ? totalRecentJerk / count : 0;
          
          // Detect bumps based on jerk and magnitude
          if (mag > BUMP_THRESHOLD || avgJerk > 1.5) {
            const timeSinceLastBump = lastBumpTime ? now - lastBumpTime : Infinity;
            // Don't trigger multiple bumps in quick succession
            if (timeSinceLastBump > 1000) { // 1 second cooldown
              setEmote('bumpy_road');
              lastBumpTime = now;
            }
          }
        }
      }
      
      const speedDelta = currentSpeed - lastSpeed;
      if (speedDelta > 5) {
        setEmote('accelerating');
      } else if (speedDelta < -5) {
        // Check if this is a hard brake based on acceleration values
        if (acc.y < HARD_BRAKE_THRESHOLD) { // Forward acceleration is negative during braking
          setEmote('hard_brake');
        } else {
          setEmote('braking');
        }
      } else if (currentSpeed < lastSpeed && acc.y < HARD_BRAKE_THRESHOLD * 0.7) {
        // Even if speed change isn't large, if acceleration is very negative, it's braking
        setEmote('braking');
      }
    }

    if (rot) {
      if (Math.abs(rot.beta) > 30 || Math.abs(rot.gamma) > 30) {
        setEmote('turning');
      }
    }
    
    // Check for safe driving behavior - if acceleration is smooth and speed is appropriate, show safety emote
    const speedDelta = currentSpeed - lastSpeed;
    if (currentSpeed > 10 && Math.abs(speedDelta) < 3 && Math.abs(acc.y) < 0.5 && currentSpeed < 100) {
      // Give a safety emote periodically (not constantly)
      const timeSinceLastSafety = now - (window.lastSafetyTime || 0);
      if (timeSinceLastSafety > 30000) { // Show safety emote every 30 seconds if driving safely
        setEmote('safety');
        window.lastSafetyTime = now;
      }
    }

    lastSpeed = currentSpeed;
  }

  function handleOrientation(event) {
    if (event.beta !== null) {
      currentTilt = Math.round(event.beta);
      tiltEl.textContent = `${currentTilt}°`;
      
      // Detect turns based on gamma (left-right tilt) - differentiate between gentle and sharp
      // gamma indicates the left-right tilt of the device
      if (Math.abs(event.gamma) > 45) {
        setEmote('sharp_corner');
      } else if (Math.abs(event.gamma) > 30) {
        setEmote('turning');
      } else if (Math.abs(event.beta) > 45) {
        setEmote('bumpy');
      }
      
      // Detect crosswind or lateral forces causing drift
      if (Math.abs(event.gamma) > 45 && currentSpeed > 30) {
        setEmote('crosswind');
      }
      
      // Check for hill climbs and steep descents based on beta (front-back tilt)
      if (event.beta < -20) {
        setEmote('hill_climb');
      } else if (event.beta > 20) {
        setEmote('steep_descent');
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
    } else if (currentSpeed < 100) {
      setEmote('high_speed');
    } else {
      setEmote('over_speed');
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
            window.addEventListener('devicemotion', handleMotion);
            motionActive = true;
          }
          if (orientPerm === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        } 
        // Non-iOS: add listeners directly (Chrome, Firefox, etc.)
        else {
          if (hasMotion) {
            window.addEventListener('devicemotion', handleMotion);
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

  loadCameras();
  setEmote('idle');

  rick.addEventListener('click', () => {
    const randomEmote = Object.keys(emotes)[Math.floor(Math.random() * Object.keys(emotes).length)];
    setEmote(randomEmote);
  });
});

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registered: ', registration);
      })
      .catch(registrationError => {
        console.log('ServiceWorker registration failed: ', registrationError);
      });
  });
}
