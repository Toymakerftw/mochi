/* -------------------------------------------------------------
   Dasai-Mochi Web – FULLY INTERACTIVE (IMPROVED)
   ------------------------------------------------------------- */
const svgNS = "http://www.w3.org/2000/svg";
const svg   = document.querySelector("svg");
let   g     = null;               // <g> for the face
const STATE = {
  tiltX: 0, tiltY: 0,
  speed: 0,
  lastPos: null, lastTime: null,
  currentExpr: "regEyes",
  idleTimer: null,
  isSleeping: false,
  petting: false,
  batteryLow: false
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
      // Open eye
      append(create('circle', {cx:82, cy:32, r:10, fill:'#fff'}));
      append(create('circle', {cx:85, cy:29, r:3, fill:'#000', opacity:0.8}));
      // Winking arc
      append(create('path', {d:'M36,32 Q46,28 56,32', stroke:'#fff', 'stroke-width':4, fill:'none', 'stroke-linecap':'round'}));
    } else {
      // Open eye
      append(create('circle', {cx:46, cy:32, r:10, fill:'#fff'}));
      append(create('circle', {cx:49, cy:29, r:3, fill:'#000', opacity:0.8}));
      // Winking arc
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
    // Big smile
    append(create('path', {d:'M48,50 Q64,64 80,50', stroke:'#fff', 'stroke-width':4, fill:'none', 'stroke-linecap':'round'}));
  },
  
  sideEye() {
    clear();
    // Eyes shifted to side with smaller pupils
    append(create('circle', {cx:36, cy:32, r:9, fill:'#fff'}));
    append(create('circle', {cx:30, cy:32, r:4, fill:'#000'}));
    append(create('circle', {cx:92, cy:32, r:9, fill:'#fff'}));
    append(create('circle', {cx:86, cy:32, r:4, fill:'#000'}));
    // Straight mouth
    append(create('rect', {x:48, y:54, width:32, height:4, fill:'#fff'}));
  },
  
  carrotEyes() {
    clear();
    // Happy upside-down U eyes
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
    // Big excited smile
    append(create('path', {d:'M48,48 Q64,64 80,48', stroke:'#fff', 'stroke-width':5, fill:'none', 'stroke-linecap':'round'}));
  },
  
  sleep() {
    clear();
    // Closed eyes
    append(create('line', {x1:36, y1:32, x2:56, y2:32, stroke:'#fff', 'stroke-width':4, 'stroke-linecap':'round'}));
    append(create('line', {x1:72, y1:32, x2:92, y2:32, stroke:'#fff', 'stroke-width':4, 'stroke-linecap':'round'}));
    // Zzz animation
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
    // Peaceful smile
    append(create('path', {d:'M52,52 Q64,56 76,52', stroke:'#fff', 'stroke-width':3, fill:'none', 'stroke-linecap':'round'}));
  },
  
  dizzy() {
    clear();
    // Spiral dizzy eyes
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
    // Wavy mouth
    append(create('path', {d:'M46,54 Q56,50 64,54 Q72,58 82,54', stroke:'#fff', 'stroke-width':3, fill:'none'}));
  },
  
  surprised() {
    clear();
    // Wide open eyes
    append(create('circle', {cx:46, cy:30, r:12, fill:'#fff'}));
    append(create('circle', {cx:46, cy:30, r:6, fill:'#000'}));
    append(create('circle', {cx:82, cy:30, r:12, fill:'#fff'}));
    append(create('circle', {cx:82, cy:30, r:6, fill:'#000'}));
    // O mouth
    append(create('circle', {cx:64, cy:54, r:6, fill:'none', stroke:'#fff', 'stroke-width':3}));
  },
  
  excited() {
    clear();
    // Star eyes
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
    // Wide smile
    append(create('path', {d:'M42,48 Q64,68 86,48', stroke:'#fff', 'stroke-width':5, fill:'none', 'stroke-linecap':'round'}));
  },
  
  sad() {
    clear();
    // Droopy eyes
    append(create('circle', {cx:46, cy:32, r:9, fill:'#fff'}));
    append(create('circle', {cx:46, cy:35, r:4, fill:'#000'}));
    append(create('circle', {cx:82, cy:32, r:9, fill:'#fff'}));
    append(create('circle', {cx:82, cy:35, r:4, fill:'#000'}));
    // Tear
    const tear = create('ellipse', {cx:50, cy:42, rx:2, ry:4, fill:'#87ceeb'});
    tear.animate([
      {transform: 'translate(0,0)', opacity: 1},
      {transform: 'translate(0,12)', opacity: 0}
    ], {duration: 1500, iterations: Infinity});
    append(tear);
    // Frown
    append(create('path', {d:'M50,58 Q64,52 78,58', stroke:'#fff', 'stroke-width':3, fill:'none', 'stroke-linecap':'round'}));
  },
  
  angry() {
    clear();
    // Angry eyebrows
    append(create('line', {x1:36, y1:22, x2:56, y2:28, stroke:'#ff4444', 'stroke-width':4, 'stroke-linecap':'round'}));
    append(create('line', {x1:72, y1:28, x2:92, y2:22, stroke:'#ff4444', 'stroke-width':4, 'stroke-linecap':'round'}));
    // Intense eyes
    append(create('circle', {cx:46, cy:34, r:8, fill:'#fff'}));
    append(create('circle', {cx:46, cy:34, r:4, fill:'#ff4444'}));
    append(create('circle', {cx:82, cy:34, r:8, fill:'#fff'}));
    append(create('circle', {cx:82, cy:34, r:4, fill:'#ff4444'}));
    // Grumpy mouth
    append(create('path', {d:'M50,56 L78,56', stroke:'#fff', 'stroke-width':4, 'stroke-linecap':'round'}));
  },
  
  // tiny floating hearts when petted
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
  }
};

/* -------------------  Animations ------------------- */
async function wakeUp() {
  if (STATE.isSleeping) return;
  STATE.isSleeping = true;
  expr.sleep(); await sleep(2000);
  expr.wink(true); await sleep(800);
  expr.wink(false); await sleep(800);
  expr.regEyes();
  STATE.isSleeping = false;
}
/* tiny helper */
const sleep = ms => new Promise(r=>setTimeout(r,ms));

/* -------------------  Sensors ------------------- */
function initSensors() {
  // ---- DeviceOrientation (gyro/accelerometer) ----
  const request = typeof DeviceOrientationEvent.requestPermission === 'function';
  const btn = request ? document.createElement('button') : null;
  if (btn) {
    btn.textContent = 'Allow motion';
    btn.style.cssText = 'position:absolute; top:10px; left:10px; z-index:100; padding:10px 20px; background:#fff; border:none; border-radius:8px; font-size:14px; cursor:pointer;';
    document.body.appendChild(btn);
    btn.onclick = () => DeviceOrientationEvent.requestPermission()
      .then(r=>{if(r==='granted') window.addEventListener('deviceorientation', oriHandler);})
      .finally(()=>btn.remove());
  } else {
    window.addEventListener('deviceorientation', oriHandler);
  }
  
  // ---- Shake detection (accelerometer) ----
  let lastAccel = null, shakeThreshold = 18;
  window.addEventListener('devicemotion', e => {
    const a = e.accelerationIncludingGravity;
    if (!a.x || !a.y || !a.z) return;
    if (lastAccel) {
      const dx = a.x - lastAccel.x, dy = a.y - lastAccel.y, dz = a.z - lastAccel.z;
      const force = Math.hypot(dx,dy,dz);
      if (force > shakeThreshold && !STATE.isSleeping) {
        expr.dizzy();
        setTimeout(()=>expr.regEyes(), 1500);
      }
    }
    lastAccel = {x:a.x, y:a.y, z:a.z};
  });
  
  // ---- Geolocation speed ----
  if ('geolocation' in navigator) {
    navigator.geolocation.watchPosition(pos => {
      if (STATE.lastPos && STATE.lastTime) {
        const dLat = pos.coords.latitude  - STATE.lastPos.latitude;
        const dLon = pos.coords.longitude - STATE.lastPos.longitude;
        const dt = (pos.timestamp - STATE.lastTime)/1000;
        const distM = Math.hypot(dLat,dLon) * 40075000 / 360;
        STATE.speed = distM / dt * 3.6; // km/h
      }
      STATE.lastPos = pos.coords; STATE.lastTime = pos.timestamp;
    }, console.error, {enableHighAccuracy:true});
  }
  
  // ---- Battery API (optional) ----
  if ('getBattery' in navigator) {
    navigator.getBattery().then(b => {
      STATE.batteryLow = b.level < 0.15;
      b.addEventListener('levelchange', () => STATE.batteryLow = b.level < 0.15);
    });
  }
}

function oriHandler(e) {
  if (e.gamma !== null) STATE.tiltX = e.gamma;
  if (e.beta  !== null) STATE.tiltY = e.beta;
}

/* -------------------  Interaction ------------------- */
function initInteraction() {
  const mochi = document.getElementById('mochi');
  
  // ---- Tap / Click ----
  mochi.addEventListener('click', () => {
    if (STATE.isSleeping) { wakeUp(); return; }
    const emotions = [
      () => expr.wink(Math.random()<0.5),
      () => expr.heart(),
      () => expr.carrotEyes(),
      () => expr.excited(),
      () => expr.surprised(),
      () => { expr.sparkle(); expr.heart(); }
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
    if (Math.abs(dy) > 20) { // pet stroke
      STATE.petting = true;
      petCount++;
      expr.petHearts();
      if (petCount > 3) { expr.excited(); setTimeout(()=>expr.regEyes(), 1500); }
      touchStart = e.touches[0].clientY;
    }
  });
  mochi.addEventListener('touchend', ()=>{ 
    STATE.petting = false; 
    petCount = 0;
  });
  
  // ---- Voice commands (Web Speech) ----
  if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.continuous = false;
    mochi.addEventListener('dblclick', () => rec.start()); // double-tap to talk
    rec.onresult = ev => {
      const cmd = ev.results[0][0].transcript.toLowerCase().trim();
      if (cmd.includes('sleep')) { expr.sleep(); STATE.isSleeping = true; }
      else if (cmd.includes('wake') || cmd.includes('hello')) wakeUp();
      else if (cmd.includes('love') || cmd.includes('heart')) expr.heart();
      else if (cmd.includes('spin') || cmd.includes('dizzy')) { expr.dizzy(); setTimeout(expr.regEyes,1500); }
    };
    rec.onerror = () => console.log('speech error');
  }
}

/* -------------------  Idle / Sleep ------------------- */
function resetIdle() {
  clearTimeout(STATE.idleTimer);
  STATE.idleTimer = setTimeout(() => {
    if (!STATE.isSleeping && !STATE.petting) { expr.sleep(); STATE.isSleeping = true; }
  }, 15000); // 15 s idle → sleep
}

/* -------------------  Decision loop ------------------- */
let lastChange = 0;
function chooseExpression() {
  if (STATE.isSleeping) return;
  const now = Date.now();
  
  // speed → heart
  if (STATE.speed > 12) { expr.heart(); lastChange = now; resetIdle(); return; }
  
  // tilt
  const ax = Math.abs(STATE.tiltX), ay = Math.abs(STATE.tiltY);
  if (ax > 45) { expr.sideEye(); lastChange = now; resetIdle(); return; }
  if (ay > 60) { expr.carrotEyes(); lastChange = now; resetIdle(); return; }
  
  // random idle
  if (now - lastChange > 5000) {
    const idles = [expr.regEyes, expr.sideEye, () => expr.wink(Math.random()<0.5)];
    idles[Math.floor(Math.random()*idles.length)]();
    lastChange = now;
    resetIdle();
  }
}

/* -------------------  Init ------------------- */
(function init() {
  g = create('g');
  svg.appendChild(g);
  expr.regEyes();
  initSensors();
  initInteraction();
  resetIdle();
  
  // start loop (throttled when battery low)
  const loop = () => {
    chooseExpression();
    const delay = STATE.batteryLow ? 500 : 250;
    setTimeout(loop, delay);
  };
  loop();
  
  // wake-up on first load
  setTimeout(wakeUp, 800);
})();