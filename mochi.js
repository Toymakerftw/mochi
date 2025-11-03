/* -------------------------------------------------------------
   Dasai-Mochi Web – FULLY INTERACTIVE
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
    append(create('circle', {cx:48, cy:32, r:8, fill:'#fff'}));
    append(create('circle', {cx:80, cy:32, r:8, fill:'#fff'}));
    append(create('rect',   {x:48, y:55, width:32, height:8, fill:'#fff'}));
    append(create('circle', {cx:48, cy:58, r:3, fill:'#fff'}));
    append(create('circle', {cx:80, cy:58, r:3, fill:'#fff'}));
  },

  wink(left = true) {
    clear();
    if (left) {
      append(create('circle', {cx:46, cy:32, r:8, fill:'#fff'}));
      append(create('rect',   {x:76, y:28, width:20, height:8, fill:'#fff'}));
    } else {
      append(create('rect',   {x:36, y:28, width:20, height:8, fill:'#fff'}));
      append(create('circle', {cx:80, cy:32, r:8, fill:'#fff'}));
    }
    append(create('rect',   {x:48, y:55, width:32, height:8, fill:'#fff'}));
    append(create('circle', {cx:48, cy:58, r:3, fill:'#fff'}));
    append(create('circle', {cx:80, cy:58, r:3, fill:'#fff'}));
  },

  heart() {
    clear();
    const heart = (cx,cy) => {
      const d = `M${cx-10},${cy} Q${cx-15},${cy-10} ${cx-5},${cy-15}
                 Q${cx},${cy-10} ${cx},${cy}
                 Q${cx},${cy-10} ${cx+5},${cy-15}
                 Q${cx+15},${cy-10} ${cx+10},${cy} L${cx},${cy+10}Z`;
      return create('path', {d, fill:'#fff'});
    };
    append(heart(44,27), heart(84,27));
    const smile = create('path', {d:`M52,50 Q64,62 76,50`,
                     stroke:'#fff','stroke-width':8,fill:'none','stroke-linecap':'round'});
    append(smile);
  },

  sideEye() {
    clear();
    append(create('circle', {cx:32, cy:32, r:8, fill:'#fff'}));
    append(create('circle', {cx:96, cy:32, r:8, fill:'#fff'}));
    append(create('rect',   {x:32, y:55, width:64, height:8, fill:'#fff'}));
    append(create('circle', {cx:32, cy:58, r:3, fill:'#fff'}));
    append(create('circle', {cx:96, cy:58, r:3, fill:'#fff'}));
  },

  carrotEyes() {
    clear();
    const caret = (cx,cy) => {
      const p = create('path', {fill:'none',stroke:'#fff','stroke-width':4,'stroke-linecap':'round'});
      p.setAttribute('d',`M${cx-10},${cy+10} L${cx},${cy-10} L${cx+10},${cy+10}`);
      return p;
    };
    append(caret(42,32), caret(90,32));
    const smile = create('path', {d:`M52,50 Q64,62 76,50`,
                     stroke:'#fff','stroke-width':8,fill:'none','stroke-linecap':'round'});
    append(smile);
  },

  sleep() {
    clear();
    append(create('rect', {x:36, y:28, width:20, height:8, fill:'#fff'}));
    append(create('rect', {x:76, y:28, width:20, height:8, fill:'#fff'}));
    append(create('rect', {x:48, y:45, width:32, height:8, fill:'#fff'}));
    append(create('circle', {cx:48, cy:48, r:3, fill:'#fff'}));
    append(create('circle', {cx:80, cy:48, r:3, fill:'#fff'}));
  },

  dizzy() {
    clear();
    const eye = (cx,cy,rot) => {
      const grp = create('g', {transform:`rotate(${rot} ${cx} ${cy})`});
      grp.appendChild(create('circle', {cx, cy, r:8, fill:'#fff'}));
      grp.appendChild(create('line',   {x1:cx-5, y1:cy, x2:cx+5, y2:cy, stroke:'#000','stroke-width':2}));
      grp.appendChild(create('line',   {x1:cx, y1:cy-5, x2:cx, y2:cy+5, stroke:'#000','stroke-width':2}));
      return grp;
    };
    append(eye(48,32, 45), eye(80,32, -45));
    append(create('rect', {x:48, y:55, width:32, height:8, fill:'#fff'}));
    append(create('circle', {cx:48, cy:58, r:3, fill:'#fff'}));
    append(create('circle', {cx:80, cy:58, r:3, fill:'#fff'}));
  },

  // tiny floating hearts when petted
  petHearts() {
    const heart = (x,y) => {
      const d = `M${x-4},${y} Q${x-6},${y-4} ${x-2},${y-6}
                 Q${x},${y-4} ${x},${y}
                 Q${x},${y-4} ${x+2},${y-6}
                 Q${x+6},${y-4} ${x+4},${y} L${x},${y+4}Z`;
      const p = create('path', {d, fill:'#ff69b4', opacity:0});
      g.appendChild(p);
      // animate up & fade
      let step = 0;
      const anim = setInterval(() => {
        step += 2;
        p.setAttribute('transform', `translate(0,${-step})`);
        p.setAttribute('opacity', 1 - step/30);
        if (step > 30) { clearInterval(anim); p.remove(); }
      }, 30);
    };
    for (let i=0;i<3;i++) setTimeout(()=>heart(64+Math.random()*20-10,45), i*120);
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
    btn.style.position='absolute'; btn.style.top='10px'; btn.style.left='10px';
    btn.style.zIndex=100; document.body.appendChild(btn);
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
    const rnd = Math.random();
    if (rnd < 0.4) expr.wink(Math.random()<0.5);
    else if (rnd < 0.7) expr.heart();
    else expr.carrotEyes();
    setTimeout(()=>expr.regEyes(), 1200);
    resetIdle();
  });

  // ---- Pet (touch drag) ----
  let touchStart = null;
  mochi.addEventListener('touchstart', e=>{ touchStart = e.touches[0].clientY; e.preventDefault(); }, {passive:false});
  mochi.addEventListener('touchmove', e=>{
    if (!touchStart) return;
    const dy = e.touches[0].clientY - touchStart;
    if (Math.abs(dy) > 30) { // pet stroke
      STATE.petting = true;
      expr.petHearts();
      touchStart = e.touches[0].clientY;
    }
  });
  mochi.addEventListener('touchend', ()=>{ STATE.petting = false; });

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
  if (now - lastChange > 4000) {
    const r = Math.floor(Math.random()*5)+1;
    switch(r){
      case 1: expr.regEyes(); break;
      case 2: expr.heart(); break;
      case 3: expr.carrotEyes(); break;
      default: expr.sideEye(); break;
    }
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