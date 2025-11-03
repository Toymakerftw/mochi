/* -------------------------------------------------------------
   Dasai-Mochi Interactions
   Handles touch, click, and gesture interactions
   ------------------------------------------------------------- */

// Use the global STATE object

/* -------------------  Tap / Click ------------------- */
function initTapInteraction() {
  const mochi = document.getElementById('mochi');
  let lastTap = 0;
  let tapTimeout = null;

  mochi.addEventListener('click', (e) => {
    const now = Date.now();
    
    // Double tap detection
    if (now - lastTap < 300) {
      clearTimeout(tapTimeout);
      window.expr.laughing();
      window.expr.sparkle();
      setTimeout(() => {
        if (!STATE.isSleeping) window.expr.regEyes();
      }, 2000);
      lastTap = 0;
      return;
    }
    
    lastTap = now;
    tapTimeout = setTimeout(() => {
      // Single tap
      handleSingleTap();
      lastTap = 0;
    }, 310);
  });

  function handleSingleTap() {
    if (STATE.isSleeping) {
      wakeUp();
      return;
    }
    
    const emotions = [
      () => window.expr.wink(Math.random() < 0.5),
      () => window.expr.heart(),
      () => window.expr.carrotEyes(),
      () => window.expr.excited(),
      () => window.expr.surprised(),
      () => { window.expr.sparkle(); window.expr.heart(); },
      () => window.expr.cool(),
      () => window.expr.thinking()
    ];
    
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    randomEmotion();
    
    setTimeout(() => {
      if (!STATE.isSleeping) window.expr.regEyes();
    }, 1800);
    
    resetIdle();
  }
}

/* -------------------  Pet (Touch Drag) ------------------- */
function initTouchInteraction() {
  const mochi = document.getElementById('mochi');
  let touchStart = null;
  let petCount = 0;
  let petTimeout = null;

  mochi.addEventListener('touchstart', e => {
    touchStart = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
    petCount = 0;
    e.preventDefault();
  }, { passive: false });

  mochi.addEventListener('touchmove', e => {
    if (!touchStart) return;
    
    const currentTouch = e.touches[0];
    const dx = currentTouch.clientX - touchStart.x;
    const dy = currentTouch.clientY - touchStart.y;
    const distance = Math.hypot(dx, dy);
    
    // Petting detection (vertical movement)
    if (Math.abs(dy) > 20 && Math.abs(dx) < Math.abs(dy) * 2) {
      STATE.petting = true;
      
      // Debounce petting
      if (petTimeout) clearTimeout(petTimeout);
      petTimeout = setTimeout(() => {
        petCount++;
        window.expr.petHearts();
        
        if (petCount > 3) {
          window.expr.excited();
          setTimeout(() => window.expr.heart(), 1000);
          setTimeout(() => {
            if (!STATE.isSleeping) window.expr.regEyes();
          }, 2500);
        }
        
        touchStart = {
          x: currentTouch.clientX,
          y: currentTouch.clientY,
          time: Date.now()
        };
      }, 100);
    }
  });

  mochi.addEventListener('touchend', () => {
    STATE.petting = false;
    petCount = 0;
    touchStart = null;
    if (petTimeout) clearTimeout(petTimeout);
  });
}

/* -------------------  Long Press ------------------- */
function initLongPress() {
  const mochi = document.getElementById('mochi');
  let pressTimer = null;

  // Mouse events
  mochi.addEventListener('mousedown', () => {
    pressTimer = setTimeout(() => {
      window.expr.relaxed();
      setTimeout(() => {
        window.expr.sleep();
        STATE.isSleeping = true;
      }, 2000);
    }, 2000);
  });

  mochi.addEventListener('mouseup', () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  });

  mochi.addEventListener('mouseleave', () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  });

  // Touch events
  mochi.addEventListener('touchstart', e => {
    pressTimer = setTimeout(() => {
      window.expr.relaxed();
      setTimeout(() => {
        window.expr.sleep();
        STATE.isSleeping = true;
      }, 2000);
    }, 2000);
  }, { passive: true });

  mochi.addEventListener('touchend', () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  });

  mochi.addEventListener('touchcancel', () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  });
}

/* -------------------  Wake Up Animation ------------------- */
async function wakeUp() {
  STATE.isSleeping = false;
  window.expr.sleep();
  await sleep(1000);
  window.expr.wink(true);
  await sleep(600);
  window.expr.wink(false);
  await sleep(600);
  window.expr.relaxed();
  await sleep(800);
  window.expr.regEyes();
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* -------------------  Idle Timer ------------------- */
function resetIdle() {
  if (STATE.idleTimer) {
    clearTimeout(STATE.idleTimer);
  }
  
  STATE.idleTimer = setTimeout(() => {
    if (!STATE.isSleeping && !STATE.petting && STATE.speed < 5) {
      // Car is stopped and idle
      window.expr.bored();
      setTimeout(() => {
        window.expr.sleep();
        STATE.isSleeping = true;
      }, 3000);
    }
  }, 20000); // 20 seconds idle when stopped
}

/* -------------------  Fullscreen ------------------- */
function initFullscreen() {
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  
  if (!fullscreenBtn) return;
  
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log('Fullscreen error:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  });
  
  // Update button visibility based on fullscreen state
  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      fullscreenBtn.classList.add('hidden');
    } else {
      fullscreenBtn.classList.remove('hidden');
    }
  });
}

/* -------------------  Initialize All Interactions ------------------- */
function initInteractions() {
  initTapInteraction();
  initTouchInteraction();
  initLongPress();
  initFullscreen();
}

// Make functions available globally
window.initInteractions = initInteractions;
window.wakeUp = wakeUp;
window.resetIdle = resetIdle;
window.sleep = sleep;