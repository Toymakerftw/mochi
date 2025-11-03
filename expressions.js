/* -------------------------------------------------------------
   Dasai-Mochi Expressions
   Fixed expression changing to prevent glitches
   ------------------------------------------------------------- */

const svgNS = "http://www.w3.org/2000/svg";
let g = null;
let currentAnimationFrame = null;

/* -------------------  SVG helpers  ------------------- */
const create = (tag, attrs = {}) => {
  const el = document.createElementNS(svgNS, tag);
  Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k,v));
  return el;
};

const clear = () => { 
  // Cancel any pending animation frame
  if (currentAnimationFrame) {
    cancelAnimationFrame(currentAnimationFrame);
    currentAnimationFrame = null;
  }
  
  // Clear all children
  while (g.firstChild) g.removeChild(g.firstChild); 
};

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
      
      // Use requestAnimationFrame for smoother animation
      let startTime = null;
      const animateHeart = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / 800;
        const scale = 1 + 0.2 * Math.sin(progress * Math.PI * 2);
        h.setAttribute('transform', `scale(${scale})`);
        h.setAttribute('opacity', 0.9 + 0.1 * Math.sin(progress * Math.PI * 2));
        
        if (progress < 1) {
          currentAnimationFrame = requestAnimationFrame(animateHeart);
        }
      };
      currentAnimationFrame = requestAnimationFrame(animateHeart);
      
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
    const cy = 30;
    const happyEye = (cx) => {
      append(create('path', {
        d: `M${cx-10},${cy+6} Q${cx},${cy-8} ${cx+10},${cy+6}`,
        stroke: '#fff',
        'stroke-width': 5,
        fill: 'none',
        'stroke-linecap': 'round'
      }));
    };
    happyEye(46);
    happyEye(82);
    append(create('path', {d:'M48,48 Q64,64 80,48', stroke:'#fff', 'stroke-width':5, fill:'none', 'stroke-linecap':'round'}));
  },
  
  sleep() {
    clear();
    append(create('line', {x1:36, y1:32, x2:56, y2:32, stroke:'#fff', 'stroke-width':4, 'stroke-linecap':'round'}));
    append(create('line', {x1:72, y1:32, x2:92, y2:32, stroke:'#fff', 'stroke-width':4, 'stroke-linecap':'round'}));
    
    const zzz = [];
    const z = (x,y,delay) => {
      const txt = create('text', {x, y, fill:'#fff', 'font-size':12, 'font-family':'Arial', opacity:0});
      txt.textContent = 'z';
      g.appendChild(txt);
      zzz.push(txt);
      
      setTimeout(() => {
        let startTime = null;
        const animateZ = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const progress = (timestamp - startTime) / 2000;
          const translateY = -15 * progress;
          const opacity = 0.8 * (1 - progress);
          
          txt.setAttribute('transform', `translate(0, ${translateY})`);
          txt.setAttribute('opacity', opacity);
          
          if (progress < 1) {
            currentAnimationFrame = requestAnimationFrame(animateZ);
          } else {
            txt.remove();
          }
        };
        currentAnimationFrame = requestAnimationFrame(animateZ);
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
      
      let rotation = 0;
      const animateSpiral = () => {
        rotation += 2;
        s.setAttribute('transform', `rotate(${rotation} ${cx} ${cy})`);
        currentAnimationFrame = requestAnimationFrame(animateSpiral);
      };
      currentAnimationFrame = requestAnimationFrame(animateSpiral);
      
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
      
      let rotation = 0;
      const animateStar = () => {
        rotation += 3;
        const scale = 1 + 0.3 * Math.sin(rotation * Math.PI / 180);
        s.setAttribute('transform', `rotate(${rotation} ${cx} ${cy}) scale(${scale})`);
        currentAnimationFrame = requestAnimationFrame(animateStar);
      };
      currentAnimationFrame = requestAnimationFrame(animateStar);
      
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
    
    // Sweat drop animation
    const sweat = create('ellipse', {cx:35, cy:42, rx:2, ry:3, fill:'#87ceeb'});
    let sweatPos = 0;
    const animateSweat = () => {
      sweatPos += 0.1;
      const translateY = 8 * sweatPos;
      const opacity = Math.max(0, 1 - sweatPos);
      
      sweat.setAttribute('transform', `translate(0, ${translateY})`);
      sweat.setAttribute('opacity', opacity);
      
      if (sweatPos < 1) {
        currentAnimationFrame = requestAnimationFrame(animateSweat);
      } else {
        sweat.remove();
      }
    };
    currentAnimationFrame = requestAnimationFrame(animateSweat);
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
    const hearts = [];
    const heart = (x,y) => {
      const d = `M${x},${y+2} L${x-6},${y-4} Q${x-9},${y-7} ${x-6},${y-10}
                 Q${x-3},${y-13} ${x},${y-10} Q${x+3},${y-13} ${x+6},${y-10}
                 Q${x+9},${y-7} ${x+6},${y-4} Z`;
      const p = create('path', {d, fill:'#ff69b4', opacity:0, filter:'blur(0.5px)'});
      g.appendChild(p);
      hearts.push(p);
      
      let step = 0;
      const animateHeart = () => {
        step += 0.5;
        const translateY = -step * 3;
        const opacity = Math.max(0, 1 - step/20);
        const translateX = Math.sin(step/5) * 3;
        
        p.setAttribute('transform', `translate(${translateX}, ${translateY})`);
        p.setAttribute('opacity', opacity);
        
        if (step < 20) {
          currentAnimationFrame = requestAnimationFrame(animateHeart);
        } else {
          p.remove();
          const index = hearts.indexOf(p);
          if (index > -1) hearts.splice(index, 1);
        }
      };
      currentAnimationFrame = requestAnimationFrame(animateHeart);
    };
    for (let i=0;i<5;i++) setTimeout(()=>heart(64+Math.random()*30-15, 50), i*150);
  },
  
  sparkle() {
    const stars = [];
    const star = (x,y,delay) => {
      setTimeout(() => {
        const s = create('circle', {cx:x, cy:y, r:2, fill:'#fff', opacity:0});
        g.appendChild(s);
        stars.push(s);
        
        let startTime = null;
        const animateStar = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const progress = (timestamp - startTime) / 800;
          const scale = 1.5 * Math.sin(progress * Math.PI);
          const opacity = Math.sin(progress * Math.PI);
          
          s.setAttribute('transform', `scale(${scale})`);
          s.setAttribute('opacity', opacity);
          
          if (progress < 1) {
            currentAnimationFrame = requestAnimationFrame(animateStar);
          } else {
            s.remove();
            const index = stars.indexOf(s);
            if (index > -1) stars.splice(index, 1);
          }
        };
        currentAnimationFrame = requestAnimationFrame(animateStar);
      }, delay);
    };
    for(let i=0;i<8;i++) star(30+Math.random()*68, 15+Math.random()*40, i*100);
  },
  
  speedLines() {
    const lines = [];
    for(let i=0; i<5; i++) {
      const line = create('line', {
        x1: 10, y1: 20+i*10, x2: 30, y2: 20+i*10,
        stroke: '#fff', 'stroke-width': 2, opacity: 0
      });
      g.appendChild(line);
      lines.push(line);
      
      let startTime = null;
      const animateLine = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / 500;
        const translateX = -20 * progress;
        const opacity = 0.7 * (1 - progress);
        
        line.setAttribute('transform', `translate(${translateX}, 0)`);
        line.setAttribute('opacity', opacity);
        
        if (progress < 1) {
          currentAnimationFrame = requestAnimationFrame(animateLine);
        } else {
          line.remove();
          const index = lines.indexOf(line);
          if (index > -1) lines.splice(index, 1);
        }
      };
      setTimeout(() => {
        currentAnimationFrame = requestAnimationFrame(animateLine);
      }, i*50);
    }
  },
  
  cameraAlert() {
    clear();
    // Alert eyes - wide open with alert expression
    const eye = (cx) => {
      // Draw wide open eyes with alert pupils
      append(create('circle', {cx, cy:32, r:12, fill:'#fff'}));
      append(create('circle', {cx:cx+2, cy:30, r:5, fill:'#000', opacity:0.9}));
      append(create('circle', {cx:cx+4, cy:28, r:2, fill:'#fff'})); // highlight
    };
    eye(42); 
    eye(86);
    
    // Draw exclamation mark to indicate alert
    const exclamation = create('path', {d:'M60,15 L60,35 M60,42 L60,45', stroke:'#ff69b4', 'stroke-width':4, 'stroke-linecap':'round'});
    append(exclamation);
    
    // Add pulsing animation
    let pulsePhase = 0;
    const animatePulse = () => {
      pulsePhase += 0.2;
      const scale = 1 + 0.1 * Math.sin(pulsePhase);
      exclamation.setAttribute('transform', `translate(0, ${-2 * Math.sin(pulsePhase)}) scale(${scale})`);
      exclamation.setAttribute('stroke', pulsePhase % Math.PI < Math.PI/2 ? '#ff69b4' : '#ff0000');
      
      if (pulsePhase < 20) { // Run for a few seconds
        currentAnimationFrame = requestAnimationFrame(animatePulse);
      }
    };
    currentAnimationFrame = requestAnimationFrame(animatePulse);
  }
};

// Initialize the g element when the main app initializes
function initExpressions(svgElement) {
  g = create('g');
  svgElement.appendChild(g);
  expr.regEyes();
}