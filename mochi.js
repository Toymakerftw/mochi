/* -------------------------------------------------------------
   Dasai-Mochi Web – CAR DASHBOARD VERSION
   ------------------------------------------------------------- */
const svgNS = "http://www.w3.org/2000/svg";
const svg   = document.querySelector("svg");
let   g     = null;               // <g> for the face
const STATE = {
  tiltX: 0, tiltY: 0,
  speed: 0,
  acceleration: 0,
  lastPos: null, lastTime: null,
  lastSpeed: 0,
  currentExpr: "regEyes",
  idleTimer: null,
  isSleeping: false,
  petting: false,
  batteryLow: false,
  isTurning: false,
  isBraking: false,
  isAccelerating: false,
  currentMood: 'neutral' // tracks overall mood
};

/* -------------------  SVG helpers  ------------------- */
const create = (tag, attrs = {}) => {
  const el = document.createElementNS(svgNS, tag);
  Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k,v));
  return el;
};
const clear = () => { while (g.firstChild) g.removeChild(g.firstChild); };
const append = (...els) => els.forEach(e => g.appendChild(e));

/* -------------------  Expressions ------------------- */
const expr = {
  regEyes() {
    clear();
    // Big sparkly eyes
    const eye = (cx) => {
      append(create('circle', {cx, cy:32, r:10, fill:'#fff'}));
      append(create('circle', {cx:cx+3, cy:29, r:3, fill:'#000', opacity:0.8}));
      append(create('circle', {cx:cx+5, cy:28, r:1.5, fill:'#fff'}));
    };
    eye(46); eye(82);
    // Cute smile
    append(create('path', {d:'M50,52 Q64,58 78,52', stroke:'#fff', 'stroke-width':3, fill:'none', 'stroke-linecap':'round'}));
  },
  
  wink(left = true) {
    clear();
    if (left) {
      append(create('circle', {cx:82, cy:32, r:10, fill:'#fff'}));
      append(create('circle', {cx:85, cy:29, r:3, fill:'#000', opacity:0.8}));
      append(create('path', {d:'M36,32 Q46,28 56,32', stroke:'#fff', 'stroke-width':4, fill:'none', 'stroke-linecap':'round'}));
    } else {
      append(create('circle', {cx:46, cy:32, r:10, fill:'#fff'}));
      append(create('circle', {cx:49, cy:29, r:3, fill:'#000', opacity:0.8}));
      append(create('path', {d:'M72,32 Q82,28 92,32', stroke:'#fff', 'stroke-width':4, fill:'none', 'stroke-linecap':'round'}));
    }
    append(create('path', {d:'M50,52 Q64,58 78,52', stroke:'#fff', 'stroke-width':3, fill:'none', 'stroke-linecap':'round'}));
  },
  
  heart() {
    clear();
    const heart = (cx,cy,scale=1) => {
      const s = scale;
      const d = `M${cx},${cy+2*s} 
                 L${cx-8*s},${cy-6*s} 
                 Q${cx-12*s},${cy-10*s} ${cx-8*s},${cy-14*s}
                 Q${cx-4*s},${cy-18*s} ${cx},${cy-14*s}
                 Q${cx+4*s},${cy-18*s} ${cx+8*s},${cy-14*s}
                 Q${cx+12*s},${cy-10*s} ${cx+8*s},${cy-6*s} Z`;
      const h = create('path', {d, fill:'#ff69b4'});
      h.animate([
        {transform: 'scale(1)', opacity: 1},
        {transform: 'scale(1.2)', opacity: 0.9},
        {transform: 'scale(1)', opacity: 1}
      ], {duration: 800, iterations: Infinity});
      return h;
    };
    append(heart(46,32,0.8), heart(82,32,0.8));
    append(create('path', {d:'M48,50 Q64,64 80,50', stroke:'#fff', 'stroke-width':4, fill:'none', 'stroke-linecap':'round'}));
  },
  
  sideEye(direction = 'left') {
    clear();
    if (direction === 'left') {
      append(create('circle', {cx:36, cy:32, r:9, fill:'#fff'}));
      append(create('circle', {cx:30, cy:32, r:4, fill:'#000'}));
      append(create('circle', {cx:72, cy:32, r:9, fill:'#fff'}));
      append(create('circle', {cx:66, cy:32, r:4, fill:'#000'}));
    } else {
      append(create('circle', {cx:56, cy:32, r:9, fill:'#fff'}));
      append(create('circle', {cx:62, cy:32, r:4, fill:'#000'}));
      append(create('circle', {cx:92, cy:32, r:9, fill:'#fff'}));
      append(create('circle', {cx:98, cy:32, r:4, fill:'#000'}));
    }
    append(create('rect', {x:48, y:54, width:32, height:4, fill:'#fff'}));
  },
  
  carrotEyes() {
    clear();
    const happyEye = (cx) => {
      append(create('path', {
        d: `M${cx-10},${cy+6} Q${cx},${cy-8} ${cx+10},${cy+6}`,
        stroke: '#fff',
        'stroke-width': 5,
        fill: 'none',
        'stroke-linecap': 'round'
      }));
    };
    const cy = 30;
    happyEye(46);
    happyEye(82);
    append(create('path', {d:'M48,48 Q64,64 80,48', stroke:'#fff', 'stroke-width':5, fill:'none', 'stroke-linecap':'round'}));
  },
  
  sleep() {
    clear();
    append(create('line', {x1:36, y1:32, x2:56, y2:32, stroke:'#fff', 'stroke-width':4, 'stroke-linecap':'round'}));
    append(create('line', {x1:72, y1:32, x2:92, y2:32, stroke:'#fff', 'stroke-width':4, 'stroke-linecap':'round'}));
    const z = (x,y,delay) => {
      const txt = create('text', {x, y, fill:'#fff', 'font-size':12, 'font-family':'Arial', opacity:0});
      txt.textContent = 'z';
      g.appendChild(txt);
      setTimeout(() => {
        txt.animate([
          {transform: 'translate(0,0)', opacity: 0.8},
          {transform: 'translate(5,-15)', opacity: 0}
        ], {duration: 2000, iterations: Infinity});
      }, delay);
    };
    z(100, 25, 0);
    z(108, 18, 400);
    z(116, 12, 800);
    append(create('path', {d:'M52,52 Q64,56 76,52', stroke:'#fff', 'stroke-width':3, fill:'none', 'stroke-linecap':'round'}));
  },
  
  dizzy() {
    clear();
    const spiral = (cx, cy) => {
      const s = create('path', {
        d: `M${cx},${cy} Q${cx+6},${cy-6} ${cx+8},${cy} Q${cx+6},${cy+8} ${cx-2},${cy+6} Q${cx-8},${cy} ${cx-6},${cy-8}`,
        stroke: '#fff',
        'stroke-width': 3,
        fill: 'none',
        'stroke-linecap': 'round'
      });
      s.animate([
        {transform: `rotate(0deg)`, transformOrigin: `${cx}px ${cy}px`},
        {transform: `rotate(360deg)`, transformOrigin: `${cx}px ${cy}px`}
      ], {duration: 1500, iterations: Infinity});
      return s;
    };
    append(spiral(46, 32), spiral(82, 32));
    append(create('path', {d:'M46,54 Q56,50 64,54 Q72,58 82,54', stroke:'#fff', 'stroke-width':3, fill:'none'}));
  },
  
  surprised() {
    clear();
    append(create('circle', {cx:46, cy:30, r:12, fill:'#fff'}));
    append(create('circle', {cx:46, cy:30, r:6, fill:'#000'}));
    append(create('circle', {cx:82, cy:30, r:12, fill:'#fff'}));
    append(create('circle', {cx:82, cy:30, r:6, fill:'#000'}));
    append(create('circle', {cx:64, cy:54, r:6, fill:'none', stroke:'#fff', 'stroke-width':3}));
  },
  
  excited() {
    clear();
    const star = (cx, cy) => {
      const d = `M${cx},${cy-8} L${cx+2},${cy-2} L${cx+8},${cy} L${cx+2},${cy+2} L${cx},${cy+8} 
                 L${cx-2},${cy+2} L${cx-8},${cy} L${cx-2},${cy-2} Z`;
      const s = create('path', {d, fill:'#ffd700', stroke:'#fff', 'stroke-width':1.5});
      s.animate([
        {transform: 'scale(1) rotate(0deg)', transformOrigin: `${cx}px ${cy}px`},
        {transform: 'scale(1.3) rotate(180deg)', transformOrigin: `${cx}px ${cy}px`},
        {transform: 'scale(1) rotate(360deg)', transformOrigin: `${cx}px ${cy}px`}
      ], {duration: 1000, iterations: Infinity});
      return s;
    };
    append(star(46, 32), star(82, 32));
    append(create('path', {d:'M42,48 Q64,68 86,48', stroke:'#fff', 'stroke-width':5, fill:'none', 'stroke-linecap':'round'}));
  },
  
  scared() {
    clear();
    // Wide shaking eyes
    append(create('circle', {cx:42, cy:30, r:11, fill:'#fff'}));
    append(create('circle', {cx:42, cy:32, r:5, fill:'#000'}));
    append(create('circle', {cx:86, cy:30, r:11, fill:'#fff'}));
    append(create('circle', {cx:86, cy:32, r:5, fill:'#000'}));
    // Worried mouth
    append(create('path', {d:'M50,56 Q64,54 78,56', stroke:'#fff', 'stroke-width':3, fill:'none', 'stroke-linecap':'round'}));
    // Add sweat drops
    const sweat = create('ellipse', {cx:35, cy:42, rx:2, ry:3, fill:'#87ceeb'});
    sweat.animate([
      {transform: 'translate(0,0)', opacity: 0.8},
      {transform: 'translate(-3,8)', opacity: 0}
    ], {duration: 1000, iterations: Infinity});
    append(sweat);
  },
  
  determined() {
    clear();
    // Focused eyes
    append(create('rect', {x:38, y:28, width:16, height:10, fill:'#fff', rx:2}));
    append(create('circle', {cx:46, cy:33, r:3, fill:'#000'}));
    append(create('rect', {x:74, y:28, width:16, height:10, fill:'#fff', rx:2}));
    append(create('circle', {cx:82, cy:33, r:3, fill:'#000'}));
    // Determined smile
    append(create('path', {d:'M50,54 Q64,58 78,54', stroke:'#fff', 'stroke-width':4, fill:'none', 'stroke-linecap':'round'}));
  },
  
  relaxed() {
    clear();
    // Content closed eyes (slight curve)
    append(create('path', {d:'M36,32 Q46,30 56,32', stroke:'#fff', 'stroke-width':4, fill:'none', 'stroke-linecap':'round'}));
    append(create('path', {d:'M72,32 Q82,30 92,32', stroke:'#fff', 'stroke-width':4, fill:'none', 'stroke-linecap':'round'}));
    // Gentle smile
    append(create('path', {d:'M50,52 Q64,58 78,52', stroke:'#fff', 'stroke-width':3, fill:'none', 'stroke-linecap':'round'}));
  },
  
  worried() {
    clear();
    // Worried eyebrows
    append(create('path', {d:'M36,22 Q46,20 56,22', stroke:'#fff', 'stroke-width':3, fill:'none', 'stroke-linecap':'round'}));
    append(create('path', {d:'M72,22 Q82,20 92,22', stroke:'#fff', 'stroke-width':3, fill:'none', 'stroke-linecap':'round'}));
    // Normal eyes
    append(create('circle', {cx:46, cy:32, r:8, fill:'#fff'}));
    append(create('circle', {cx:46, cy:34, r:3, fill:'#000'}));
    append(create('circle', {cx:82, cy:32, r:8, fill:'#fff'}));
    append(create('circle', {cx:82, cy:34, r:3, fill:'#000'}));
    // Worried mouth
    append(create('path', {d:'M52,56 Q64,54 76,56', stroke:'#fff', 'stroke-width':3, fill:'none', 'stroke-linecap':'round'}));
  },
  
  bored() {
    clear();
    // Half-closed eyes
    append(create('ellipse', {cx:46, cy:32, rx:10, ry:6, fill:'#fff'}));
    append(create('circle', {cx:46, cy:33, r:3, fill:'#000'}));
    append(create('ellipse', {cx:82, cy:32, rx:10, ry:6, fill:'#fff'}));
    append(create('circle', {cx:82, cy:33, r:3, fill:'#000'}));
    // Neutral mouth
    append(create('line', {x1:50, y1:54, x2:78, y2:54, stroke:'#fff', 'stroke-width':3, 'stroke-linecap':'round'}));
  },
  
  cool() {
    clear();
    // Sunglasses effect
    append(create('rect', {x:36, y:28, width:20, height:10, fill:'#000', stroke:'#fff', 'stroke-width':2, rx:3}));
    append(create('rect', {x:72, y:28, width:20, height:10, fill:'#000', stroke:'#fff', 'stroke-width':2, rx:3}));
    append(create('line', {x1:56, y1:33, x2:72, y2:33, stroke:'#fff', 'stroke-width':2}));
    // Cool smile
    append(create('path', {d:'M48,52 Q64,60 80,52', stroke:'#fff', 'stroke-width':4, fill:'none', 'stroke-linecap':'round'}));
  },
  
  speedy() {
    clear();
    // Speed lines behind eyes
    for(let i=0; i<3; i++) {
      append(create('line', {x1:10+i*8, y1:26+i*4, x2:20+i*8, y2:26+i*4, stroke:'#fff', 'stroke-width':2, opacity:0.3+i*0.2, 'stroke-linecap':'round'}));
      append(create('line', {x1:10+i*8, y1:36+i*4, x2:20+i*8, y2:36+i*4, stroke:'#fff', 'stroke-width':2, opacity:0.3+i*0.2, 'stroke-linecap':'round'}));
    }
    // Narrowed focused eyes
    append(create('ellipse', {cx:46, cy:32, rx:12, ry:7, fill:'#fff'}));
    append(create('circle', {cx:48, cy:32, r:3, fill:'#000'}));
    append(create('ellipse', {cx:82, cy:32, rx:12, ry:7, fill:'#fff'}));
    append(create('circle', {cx:84, cy:32, r:3, fill:'#000'}));
    // Excited grin
    append(create('path', {d:'M46,50 Q64,62 82,50', stroke:'#fff', 'stroke-width':4, fill:'none', 'stroke-linecap':'round'}));
  },
  
  thinking() {
    clear();
    // One eye looking up
    append(create('circle', {cx:46, cy:32, r:10, fill:'#fff'}));
    append(create('circle', {cx:46, cy:28, r:4, fill:'#000'}));
    // Other eye normal
    append(create('circle', {cx:82, cy:32, r:10, fill:'#fff'}));
    append(create('circle', {cx:82, cy:32, r:4, fill:'#000'}));
    // Thinking expression
    append(create('path', {d:'M52,54 Q64,56 76,54', stroke:'#fff', 'stroke-width':3, fill:'none', 'stroke-linecap':'round'}));
    // Question mark
    const q = create('text', {x:105, y:20, fill:'#fff', 'font-size':14, 'font-family':'Arial', opacity:0.7});
    q.textContent = '?';
    append(q);
  },
  
  laughing() {
    clear();
    // Eyes squeezed shut with joy
    append(create('path', {d:'M36,34 Q46,28 56,34', stroke:'#fff', 'stroke-width':5, fill:'none', 'stroke-linecap':'round'}));
    append(create('path', {d:'M72,34 Q82,28 92,34', stroke:'#fff', 'stroke-width':5, fill:'none', 'stroke-linecap':'round'}));
    // Big laughing mouth
    append(create('path', {d:'M44,48 Q64,64 84,48', stroke:'#fff', 'stroke-width':5, fill:'none', 'stroke-linecap':'round'}));
    // Tears of joy
    const tear1 = create('circle', {cx:34, cy:40, r:2, fill:'#87ceeb'});
    const tear2 = create('circle', {cx:94, cy:40, r:2, fill:'#87ceeb'});
    append(tear1, tear2);
  },
  
  // Effects
  petHearts() {
    const heart = (x,y) => {
      const d = `M${x},${y+2} L${x-6},${y-4} Q${x-9},${y-7} ${x-6},${y-10}
                 Q${x-3},${y-13} ${x},${y-10} Q${x+3},${y-13} ${x+6},${y-10}
                 Q${x+9},${y-7} ${x+6},${y-4} Z`;
      const p = create('path', {d, fill:'#ff69b4', opacity:0, filter:'blur(0.5px)'});
      g.appendChild(p);
      let step = 0;
      const anim = setInterval(() => {
        step += 3;
        p.setAttribute('transform', `translate(${Math.sin(step/5)*3},${-step})`);
        p.setAttribute('opacity', Math.max(0, 1 - step/40));
        if (step > 40) { clearInterval(anim); p.remove(); }
      }, 40);
    };
    for (let i=0;i<5;i++) setTimeout(()=>heart(64+Math.random()*30-15, 50), i*150);
  },
  
  sparkle() {
    const star = (x,y,delay) => {
      const s = create('circle', {cx:x, cy:y, r:2, fill:'#fff', opacity:0});
      g.appendChild(s);
      setTimeout(() => {
        s.animate([
          {opacity: 0, transform: 'scale(0)'},
          {opacity: 1, transform: 'scale(1.5)'},
          {opacity: 0, transform: 'scale(0)'}
        ], {duration: 800});
        setTimeout(() => s.remove(), 800);
      }, delay);
    };
    for(let i=0;i<8;i++) star(30+Math.random()*68, 15+Math.random()*40, i*100);
  },
  
  speedLines() {
    for(let i=0; i<5; i++) {
      const line = create('line', {
        x1: 10, y1: 20+i*10, x2: 30, y2: 20+i*10,
        stroke: '#fff', 'stroke-width': 2, opacity: 0
      });
      g.appendChild(line);
      line.animate([
        {transform: 'translateX(0)', opacity: 0.7},
        {transform: 'translateX(-20)', opacity: 0}
      ], {duration: 500, delay: i*50});
      setTimeout(() => line.remove(), 500 + i*50);
    }
  }
};

/* -------------------  Animations ------------------- */
async function wakeUp() {
  STATE.isSleeping = false;
  expr.sleep(); await sleep(1000);
  expr.wink(true); await sleep(600);
  expr.wink(false); await sleep(600);
  expr.relaxed(); await sleep(800);
  expr.regEyes();
}

const sleep = ms => new Promise(r=>setTimeout(r,ms));

/* -------------------  Sensors ------------------- */
function initSensors() {
  // ---- DeviceOrientation (gyro/accelerometer) ----
  const request = typeof DeviceOrientationEvent.requestPermission === 'function';
  const btn = request ? document.createElement('button') : null;
  if (btn) {
    btn.textContent = '🚗 Enable Car Mode';
    btn.style.cssText = 'position:absolute; top:10px; left:50%; transform:translateX(-50%); z-index:100; padding:12px 24px; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:#fff; border:none; border-radius:12px; font-size:16px; font-weight:bold; cursor:pointer; box-shadow:0 4px 15px rgba(0,0,0,0.3);';
    document.body.appendChild(btn);
    btn.onclick = () => DeviceOrientationEvent.requestPermission()
      .then(r=>{
        if(r==='granted') {
          window.addEventListener('deviceorientation', oriHandler);
          btn.textContent = '✓ Car Mode Active';
          setTimeout(() => btn.remove(), 2000);
        }
      })
      .catch(err => {
        btn.textContent = 'Permission Denied';
        setTimeout(() => btn.remove(), 2000);
      });
  } else {
    window.addEventListener('deviceorientation', oriHandler);
  }
  
  // ---- Motion detection for acceleration/braking/turning ----
  let lastAccel = null;
  window.addEventListener('devicemotion', e => {
    const a = e.accelerationIncludingGravity;
    if (!a.x || !a.y || !a.z) return;
    
    if (lastAccel) {
      const dx = a.x - lastAccel.x;
      const dy = a.y - lastAccel.y;
      const dz = a.z - lastAccel.z;
      const force = Math.hypot(dx,dy,dz);
      
      // Detect hard braking (sudden deceleration)
      if (dy > 15 && !STATE.isBraking) {
        STATE.isBraking = true;
        expr.scared();
        setTimeout(() => {
          STATE.isBraking = false;
          expr.regEyes();
        }, 2000);
      }
      
      // Detect acceleration (speeding up)
      if (dy < -12 && !STATE.isAccelerating) {
        STATE.isAccelerating = true;
        expr.excited();
        expr.speedLines();
        setTimeout(() => {
          STATE.isAccelerating = false;
          expr.regEyes();
        }, 2000);
      }
      
      // Detect shake (rough road)
      if (force > 20 && !STATE.isSleeping) {
        expr.dizzy();
        setTimeout(()=>expr.worried(), 1500);
        setTimeout(()=>expr.regEyes(), 3000);
      }
    }
    lastAccel = {x:a.x, y:a.y, z:a.z};
  });
  
  // ---- Geolocation for speed tracking ----
  if ('geolocation' in navigator) {
    navigator.geolocation.watchPosition(pos => {
      if (STATE.lastPos && STATE.lastTime) {
        const dLat = pos.coords.latitude  - STATE.lastPos.latitude;
        const dLon = pos.coords.longitude - STATE.lastPos.longitude;
        const dt = (pos.timestamp - STATE.lastTime)/1000;
        const distM = Math.hypot(dLat,dLon) * 40075000 / 360;
        const newSpeed = distM / dt * 3.6; // km/h
        
        // Calculate acceleration
        STATE.acceleration = (newSpeed - STATE.lastSpeed) / dt;
        STATE.speed = newSpeed;
        STATE.lastSpeed = newSpeed;
      }
      STATE.lastPos = pos.coords; 
      STATE.lastTime = pos.timestamp;
    }, console.error, {enableHighAccuracy:true, timeout:5000, maximumAge:0});
  }
  
  // ---- Battery API ----
  if ('getBattery' in navigator) {
    navigator.getBattery().then(b => {
      STATE.batteryLow = b.level < 0.15;
      b.addEventListener('levelchange', () => {
        STATE.batteryLow = b.level < 0.15;
        if (STATE.batteryLow && !STATE.isSleeping) {
          expr.worried();
          setTimeout(() => expr.regEyes(), 2000);
        }
      });
    });
  }
}

function oriHandler(e) {
  if (e.gamma !== null) STATE.tiltX = e.gamma;
  if (e.beta  !== null) STATE.tiltY = e.beta;
  
  // Detect turning based on gamma (left/right tilt)
  const absTiltX = Math.abs(STATE.tiltX);
  if (absTiltX > 20 && !STATE.isTurning) {
    STATE.isTurning = true;
    const direction = STATE.tiltX > 0 ? 'right' : 'left';
    expr.sideEye(direction);
    setTimeout(() => {
      STATE.isTurning = false;
      expr.regEyes();
    }, 1500);
  }
}

/* -------------------  Interaction ------------------- */
function initInteraction() {
  const mochi = document.getElementById('mochi');
  
  // ---- Tap / Click ----
  let lastTap = 0;
  mochi.addEventListener('click', (e) => {
    const now = Date.now();
    
    // Double tap detection
    if (now - lastTap < 300) {
      expr.laughing();
      expr.sparkle();
      setTimeout(()=>expr.regEyes(), 2000);
      lastTap = 0;
      return;
    }
    lastTap = now;
    
    if (STATE.isSleeping) { 
      wakeUp(); 
      return; 
    }
    
    const emotions = [
      () => expr.wink(Math.random()<0.5),
      () => expr.heart(),
      () => expr.carrotEyes(),
      () => expr.excited(),
      () => expr.surprised(),
      () => { expr.sparkle(); expr.heart(); },
      () => expr.cool(),
      () => expr.thinking()
    ];
    emotions[Math.floor(Math.random()*emotions.length)]();
    setTimeout(()=>expr.regEyes(), 1800);
    resetIdle();
  });
  
  // ---- Pet (touch drag) ----
  let touchStart = null, petCount = 0;
  mochi.addEventListener('touchstart', e=>{ 
    touchStart = e.touches[0].clientY; 
    petCount = 0;
    e.preventDefault(); 
  }, {passive:false});
  
  mochi.addEventListener('touchmove', e=>{
    if (!touchStart) return;
    const dy = e.touches[0].clientY - touchStart;
    if (Math.abs(dy) > 20) {
      STATE.petting = true;
      petCount++;
      expr.petHearts();
      if (petCount > 3) { 
        expr.excited(); 
        setTimeout(()=>expr.heart(), 1000);
        setTimeout(()=>expr.regEyes(), 2500); 
      }
      touchStart = e.touches[0].clientY;
    }
  });
  
  mochi.addEventListener('touchend', ()=>{ 
    STATE.petting = false; 
    petCount = 0;
  });
  
  // ---- Long press ----
  let pressTimer;
  mochi.addEventListener('mousedown', () => {
    pressTimer = setTimeout(() => {
      expr.relaxed();
      setTimeout(() => expr.sleep(), 2000);
      STATE.isSleeping = true;
    }, 2000);
  });
  
  mochi.addEventListener('mouseup', () => {
    clearTimeout(pressTimer);
  });
  
  mochi.addEventListener('touchstart', e => {
    pressTimer = setTimeout(() => {
      expr.relaxed();
      setTimeout(() => expr.sleep(), 2000);
      STATE.isSleeping = true;
    }, 2000);
  }, {passive: true});
  
  mochi.addEventListener('touchend', () => {
    clearTimeout(pressTimer);
  });
}

/* -------------------  Idle / Sleep ------------------- */
function resetIdle() {
  clearTimeout(STATE.idleTimer);
  STATE.idleTimer = setTimeout(() => {
    if (!STATE.isSleeping && !STATE.petting && STATE.speed < 5) {
      // Car is stopped and idle
      expr.bored();
      setTimeout(() => {
        expr.sleep();
        STATE.isSleeping = true;
      }, 3000);
    }
  }, 20000); // 20 seconds idle when stopped
}

/* -------------------  Decision loop ------------------- */
let lastChange = 0;
let lastSpeedCheck = 0;

function chooseExpression() {
  if (STATE.isSleeping) return;
  if (STATE.isTurning || STATE.isBraking || STATE.isAccelerating) return; // Don't interrupt special states
  
  const now = Date.now();
  
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
  const ax = Math.abs(STATE.tiltX), ay = Math.abs(STATE.tiltY);
  
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
      () => expr.wink(Math.random()<0.5),
      expr.carrotEyes,
      expr.thinking,
      expr.relaxed
    ];
    idles[Math.floor(Math.random()*idles.length)]();
    lastChange = now;
    resetIdle();
  }
  
  // Random idle when stopped
  if (now - lastChange > 8000 && STATE.speed <= 5) {
    const stoppedIdles = [
      expr.bored,
      expr.thinking,
      () => expr.wink(Math.random()<0.5),
      expr.sideEye
    ];
    stoppedIdles[Math.floor(Math.random()*stoppedIdles.length)]();
    lastChange = now;
    resetIdle();
  }
}

/* -------------------  Status Display ------------------- */
function createStatusDisplay() {
  const status = document.createElement('div');
  status.id = 'status';
  status.style.cssText = `
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.7);
    color: #fff;
    padding: 10px 20px;
    border-radius: 20px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    backdrop-filter: blur(10px);
    display: none;
  `;
  document.body.appendChild(status);
  
  // Update status every second
  setInterval(() => {
    if (STATE.speed > 1) {
      status.style.display = 'block';
      status.textContent = `🚗 ${STATE.speed.toFixed(1)} km/h`;
    } else {
      status.style.display = 'none';
    }
  }, 1000);
}

/* -------------------  Init ------------------- */
(function init() {
  g = create('g');
  svg.appendChild(g);
  expr.regEyes();
  initSensors();
  initInteraction();
  createStatusDisplay();
  resetIdle();
  
  // Start decision loop
  const loop = () => {
    chooseExpression();
    const delay = STATE.batteryLow ? 500 : 250;
    setTimeout(loop, delay);
  };
  loop();
  
  // Wake-up animation on first load
  setTimeout(() => {
    expr.sleep();
    STATE.isSleeping = true;
    setTimeout(wakeUp, 1000);
  }, 500);
})();