import opentype from "https://esm.sh/opentype.js";
import Matter from "https://esm.sh/matter-js";
import decomp from "https://esm.sh/poly-decomp";

console.clear();

Matter.Common.setDecomp(decomp);
const { Engine, Bodies, Body, Composite, Vertices, Query, Constraint } = Matter;

const CONFIG = {
  idleLetters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  fontSize: window.innerWidth < 700 ? 34 : window.innerWidth > 1000 ? 70 : 50,
  // Pin grid, expressed relative to fontSize so letters keep fitting through
  pinSpacingX: 2.2, // * fontSize
  pinSpacingY: 1.7, // * fontSize
  pinRadius: 8,
  pinTopOffset: 2.5, // * fontSize, empty drop zone above the first row
  edgeMargin: 1.4, // * fontSize, no pins within this distance of the sides
  idleInterval: 1000, // ms between idle drops
  idleResumeDelay: 4000, // ms of no typing before idle drops resume
  maxLetters: 250, // hard cap on live bodies, oldest are culled first
  cullBelow: 3, // * fontSize past the bottom edge before removal
  audio: {
    muted: false,
    ctx: null,
    lastPlay: 0,
    cooldown: 12,
    maxPerFrame: 12,
    minVelocity: 5,
    maxVelocity: 30,
    maxVolume: 0.1,
    
  },
  pinLayout: "grid", // "grid" | "chevrons" | "sinegrid"
  chevron: {
    pinRadius: 14,
    armPins: 3,   // pins per arm beyond the tip
    armStep: -1.1, // * fontSize, spacing along each arm
    slope: 0.7,   // arm rise per step; positive = tip points down, negative = up
    colGap: 5.5,  // * fontSize between chevron tips in a row
    rowGap: 5.2,  // * fontSize between rows
  },
  wave: {
    ampSpacing: 0.35,     // spacing swings ±35% of base
    ampRadius: 0.7,       // radius swings ±70% of base
    wavelength: 7,        // * fontSize, along x
    ySkew: 0.86,           // how much y feeds the phase; 0 = vertical bands, higher = diagonal waves
    rowAmp: -0.35,         // row spacing swings ±25%
  },
};

// State
const state = {
  dim: { x: window.innerWidth, y: window.innerHeight },
  letters: [], // { body, el, initX, initY }
  pins: [], // static bodies
  walls: [],
  pinsGroup: null,
  lastTypeTime: 0,
  glyphCache: new Map(),
};

// Layout formulae
const LAYOUTS = {
  grid(dim, m) {
    const pts = [];
    let row = 0;
    for (let py = m.top; py < dim.y - m.sy * 0.25; py += m.sy, row++) {
      const offset = row % 2 === 0 ? 0 : m.sx / 2;
      for (let px = m.margin + offset; px <= dim.x - m.margin; px += m.sx)
        pts.push({ x: px, y: py });
    }
    return pts;
  },

  chevrons(dim, m) {
    const fs = CONFIG.fontSize;
    const c = CONFIG.chevron;
    const step = c.armStep * fs;
    const halfW = c.armPins * step; // horizontal half-extent of one chevron
    const colGap = c.colGap * fs;
    const rowGap = c.rowGap * fs;
    const pts = [];

    let row = 0;
    for (let ty = m.top + halfW * Math.abs(c.slope); ty < dim.y; ty += rowGap, row++) {
      const shift = row % 2 ? colGap / 2 : 0;
      // Center the row about the middle of the screen
      const usable = dim.x - 2 * (m.margin + halfW);
      const n = Math.max(1, Math.floor(usable / colGap) + 1);
      const startX = dim.x / 2 - ((n - 1) / 2) * colGap + shift;

      for (let i = -1; i <= n; i++) {          // -1..n so shifted rows still fill edges
        const tx = startX + i * colGap;
        if (tx - halfW < m.margin || tx + halfW > dim.x - m.margin) continue;
        pts.push({ x: tx, y: ty });            // tip
        for (let k = 1; k <= c.armPins; k++) {
          const dy = -k * step * c.slope;      // arms rise away from the tip
          pts.push({ x: tx - k * step, y: ty + dy });
          pts.push({ x: tx + k * step, y: ty + dy });
        }
      }
    }
    return pts;
  },
  sinegrid(dim, m) {
    const fs = CONFIG.fontSize;
    const w = CONFIG.wave;
    const k = (2 * Math.PI) / (w.wavelength * fs);
    const pts = [];
    
    const pinRadius = w.pinRadius || CONFIG.pinRadius;

    let py = m.top;
    let row = 0;
    while (py < dim.y) {
      const offset = row % 2 ? m.sx / 2 : 0;
      let px = m.margin + offset;
      while (px <= dim.x - m.margin) {
        const phase = k * (px + w.ySkew * py);
        const s = Math.sin(phase);
        pts.push({
          x: px,
          y: py,
          r: pinRadius * (1 + w.ampRadius * s),
        });
        // Step size depends on where we are, so the grid stretches and squeezes
        px += m.sx * (1 + w.ampSpacing * s);
      }
      py += m.sy * (1 + w.rowAmp * Math.sin(k * w.ySkew * py));
      row++;
    }
    return pts;
  },
};

// Layout toggle
toggle.addEventListener("click", () => {
  const names = Object.keys(LAYOUTS);
  const next = names[(names.indexOf(CONFIG.pinLayout) + 1) % names.length];
  CONFIG.pinLayout = next;
  toggle.textContent = next;
  toggle.blur(); // see note below
  buildBoard();
});
balldrop.addEventListener("click", () => {
  let i=10 + Math.floor(Math.random() * 50);
  while(i--) {
    const char =
      CONFIG.idleLetters[Math.floor(Math.random() * CONFIG.idleLetters.length)];
    spawnLetter(char);
  }
});
mute.addEventListener("click", () => {
  CONFIG.audio.muted = !CONFIG.audio.muted
  mute.innerText = CONFIG.audio.muted ? "unmute" : "mute";
});

// SVG
const svg = document.getElementById("canvas");
svg.setAttribute("viewBox", `0 0 ${state.dim.x} ${state.dim.y}`);

const buffer = await fetch(
  "https://assets.codepen.io/982762/ArchivoBlack-Regular.ttf",
);
const font = await opentype.parse(await buffer.arrayBuffer());

let pickConstraint = null;

function svgPoint(e) {
  const rect = svg.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (state.dim.x / rect.width),
    y: (e.clientY - rect.top) * (state.dim.y / rect.height),
  };
}

svg.addEventListener("pointerdown", (e) => {
  const sp = svgPoint(e);
  const hit = Query.point(state.letters.map((l) => l.body), sp);
  if (hit.length === 0) return;
  const body = hit[0];
  svg.setPointerCapture(e.pointerId);
  const cos = Math.cos(-body.angle), sin = Math.sin(-body.angle);
  const wx = sp.x - body.position.x, wy = sp.y - body.position.y;
  pickConstraint = Constraint.create({
    pointA: sp,
    bodyB: body,
    pointB: { x: cos * wx - sin * wy, y: sin * wx + cos * wy },
    stiffness: 0.2, damping: 0.1, length: 0,
  });
  Composite.add(engine.world, pickConstraint);
});
svg.addEventListener("pointermove", (e) => {
  if (!pickConstraint) return;
  const sp = svgPoint(e);
  pickConstraint.pointA.x = sp.x;
  pickConstraint.pointA.y = sp.y;
});
svg.addEventListener("pointerup", () => {
  if (!pickConstraint) return;
  Composite.remove(engine.world, pickConstraint);
  pickConstraint = null;
});

// Geometry utilities
function pathToContours(path, steps = 4) {
  const contours = [];
  let current = null;
  let cx = 0,
    cy = 0;

  for (const cmd of path.commands) {
    switch (cmd.type) {
      case "M":
        current = [];
        contours.push(current);
        cx = cmd.x;
        cy = cmd.y;
        current.push({ x: cx, y: cy });
        break;
      case "L":
        cx = cmd.x;
        cy = cmd.y;
        current.push({ x: cx, y: cy });
        break;
      case "Q": {
        const x0 = cx,
          y0 = cy;
        for (let i = 1; i <= steps; i++) {
          const t = i / steps,
            mt = 1 - t;
          current.push({
            x: mt * mt * x0 + 2 * mt * t * cmd.x1 + t * t * cmd.x,
            y: mt * mt * y0 + 2 * mt * t * cmd.y1 + t * t * cmd.y,
          });
        }
        cx = cmd.x;
        cy = cmd.y;
        break;
      }
      case "C": {
        const x0 = cx,
          y0 = cy;
        for (let i = 1; i <= steps; i++) {
          const t = i / steps,
            mt = 1 - t;
          current.push({
            x:
              mt * mt * mt * x0 +
              3 * mt * mt * t * cmd.x1 +
              3 * mt * t * t * cmd.x2 +
              t * t * t * cmd.x,
            y:
              mt * mt * mt * y0 +
              3 * mt * mt * t * cmd.y1 +
              3 * mt * t * t * cmd.y2 +
              t * t * t * cmd.y,
          });
        }
        cx = cmd.x;
        cy = cmd.y;
        break;
      }
      case "Z":
        if (current && current.length > 1) current.push({ ...current[0] });
        current = null;
        break;
    }
  }

  return contours.filter((c) => c.length > 1);
}
function signedArea(ring) {
  let a = 0;
  for (let i = 0; i < ring.length - 1; i++)
    a += (ring[i + 1][0] - ring[i][0]) * (ring[i + 1][1] + ring[i][1]);
  return a * 0.5;
}
function multipolyToPathD(multipoly) {
  return multipoly
    .map((poly) =>
      poly
        .map((ring) => {
          const f = ring[0],
            l = ring[ring.length - 1];
          const pts = f[0] === l[0] && f[1] === l[1] ? ring.slice(0, -1) : ring;
          return (
            pts
              .map(
                (pt, i) =>
                  `${i === 0 ? "M" : "L"}${pt[0].toFixed(2)},${pt[1].toFixed(2)}`,
              )
              .join(" ") + " Z"
          );
        })
        .join(" "),
    )
    .join(" ");
}
function offsetMultipoly(multipoly, dx, dy) {
  return multipoly.map((poly) =>
    poly.map((ring) => ring.map(([x, y]) => [x + dx, y + dy])),
  );
}

// Glyph tessellation, cached per character
function getGlyph(char) {
  if (state.glyphCache.has(char)) return state.glyphCache.get(char);

  const path = font.getPath(char, 0, 0, CONFIG.fontSize);
  const contours = pathToContours(path);
  if (contours.length === 0) return null;

  const allX = contours.flat().map((p) => p.x);
  const allY = contours.flat().map((p) => p.y);
  const minX = Math.min(...allX),
    maxX = Math.max(...allX);
  const minY = Math.min(...allY),
    maxY = Math.max(...allY);

  // Largest ring first: physics uses the outer ring, render keeps the holes
  const rings = contours
    .map((c) => {
      const ring = c.map((p) => [p.x, p.y]);
      const f = ring[0],
        l = ring[ring.length - 1];
      if (f[0] !== l[0] || f[1] !== l[1]) ring.push([f[0], f[1]]);
      return ring;
    })
    .sort((a, b) => Math.abs(signedArea(b)) - Math.abs(signedArea(a)));

  const glyph = {
    rings,
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
    w: maxX - minX,
    h: maxY - minY,
  };
  state.glyphCache.set(char, glyph);
  return glyph;
}

// Physics
const engine = Engine.create({
  gravity: { y: 0.6 },
  constraintIterations: 8,
  // positionIterations: 12,
  // velocityIterations: 12
});

// SOUND
  function getAudioContext() {
    if (!CONFIG.audio.ctx) CONFIG.audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (CONFIG.audio.ctx.state === "suspended") CONFIG.audio.ctx.resume();
    return CONFIG.audio.ctx;
  }

  let _bus = null;
  function getBus(ctx) {
    if (_bus && _bus.ctx === ctx) return _bus.input;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.knee.value = 12;
    comp.ratio.value = 8;
    comp.attack.value = 0.002;
    comp.release.value = 0.15;
    comp.connect(ctx.destination);
    _bus = { ctx, input: comp };
    return comp;
  }

  // The 2.4 ratio (roughly a minor third above the octave)
  const BELL_PARTIALS = [
    { ratio: 1.00, gain: 1.00, decay: 1.00 },
    { ratio: 2.00, gain: 0.42, decay: 0.62 },
    { ratio: 4.00, gain: 0.32, decay: 0.32 }
  ];

  const PENTATONIC = [0, 3, 5, 7, 10];
  const ROOT_HZ = 323.25; // E4

  function playPlink(velocity) {
    if (CONFIG.audio.muted) return;
    const ctx = getAudioContext();
    const out = getBus(ctx);

    const span = CONFIG.audio.maxVelocity - CONFIG.audio.minVelocity;
    const norm = Math.min(1, Math.max(0, (velocity - CONFIG.audio.minVelocity) / span));
    const volume = CONFIG.audio.maxVolume * (0.3 + 0.7 * norm); // floor, never 0
    if (volume <= 0) return;

    // Jitter so hits landing in the same frame don't sum in phase.
    const t0 = ctx.currentTime + 0.002 + Math.random() * 0.006;

    const semis = PENTATONIC[(Math.random() * PENTATONIC.length) | 0]
                + (Math.random() < 0.35 ? 12 : 0);
    const f0 = ROOT_HZ * Math.pow(2, semis / 12);
    const decay = 0.5 + 0.4 * norm;

    // The muffle: harder hits open the filter, and it closes as the note rings.
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = 0.5;
    lp.frequency.setValueAtTime(900 + 2800 * norm, t0);
    lp.frequency.exponentialRampToValueAtTime(600, t0 + decay);

    const voice = ctx.createGain();
    voice.gain.value = volume;
    lp.connect(voice).connect(out);

    let last = null, lastEnd = 0;
    for (const p of BELL_PARTIALS) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f0 * p.ratio;

      const env = ctx.createGain();
      const end = t0 + decay * p.decay;
      env.gain.setValueAtTime(0, t0);
      env.gain.linearRampToValueAtTime(p.gain, t0 + 0.003); // 3ms attack, no click
      env.gain.exponentialRampToValueAtTime(0.0005, end);

      osc.connect(env).connect(lp);
      osc.start(t0);
      osc.stop(end + 0.02);
      if (end > lastEnd) { lastEnd = end; last = osc; }
    }
    last.onended = () => { voice.disconnect(); lp.disconnect(); };
  }


Matter.Events.on(engine, "collisionStart", (ev) => {
  const now = performance.now();
  let played = 0;
  for (const pair of ev.pairs) {
    if (played >= CONFIG.audio.maxPerFrame || now - CONFIG.audio.lastPlay < CONFIG.audio.cooldown) continue;

    const a = pair.bodyA.parent ?? pair.bodyA;
    const b = pair.bodyB.parent ?? pair.bodyB;
    const pin = a.label === "pin" ? a : b.label === "pin" ? b : null;
    if (!pin) continue; // only pin hits make sound

    const other = pin === a ? b : a;
    const rel = Math.hypot(other.velocity.x, other.velocity.y);
    // console.log("pin hit, velocity:", rel.toFixed(2));
    if (rel < CONFIG.audio.minVelocity) continue;

    playPlink(rel);
    CONFIG.audio.lastPlay = now;
    played++;
  }
});

function boardMetrics() {
  const fs = CONFIG.fontSize;
  return {
    margin: CONFIG.edgeMargin * fs,
    sx: CONFIG.pinSpacingX * fs,
    sy: CONFIG.pinSpacingY * fs,
    top: CONFIG.pinTopOffset * fs,
  };
}

function buildBoard() {
  // Tear down previous pins and walls
  for (const p of state.pins) Composite.remove(engine.world, p);
  for (const w of state.walls) Composite.remove(engine.world, w);
  state.pinsGroup?.remove();
  state.pins = [];

  const { x, y } = state.dim;
  state.walls = [
    Bodies.rectangle(-50, y / 2, 100, y * 3, { isStatic: true }),
    Bodies.rectangle(x + 50, y / 2, 100, y * 3, { isStatic: true }),
    // No floor: letters fall out the bottom and get culled
  ];
  Composite.add(engine.world, state.walls);
  
  

  const m = boardMetrics();
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  let row = 0;

  const pts = LAYOUTS[CONFIG.pinLayout](state.dim, m);
  for (const { x: px, y: py, r } of pts) {
    const radius = r ?? CONFIG.pinRadius;
    const body = Bodies.circle(px, py, radius, {
      isStatic: true,
      restitution: 0.6,
      label: "pin",
    });
    state.pins.push(body);

    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", px);
    c.setAttribute("cy", py);
    c.setAttribute("r", radius);
    c.setAttribute("fill", "#080808");
    g.appendChild(c);
  }

  Composite.add(engine.world, state.pins);
  svg.insertBefore(g, svg.firstChild);
  state.pinsGroup = g;
}

// Letters
function removeLetter(piece) {
  Composite.remove(engine.world, piece.body);
  piece.el.remove();
}

function spawnLetter(char, x = null) {
  const glyph = getGlyph(char);
  if (!glyph) return;

  const { margin } = boardMetrics();
  const halfW = glyph.w / 2;
  const lo = margin + halfW + 4;
  const hi = state.dim.x - margin - halfW - 4;
  if (hi <= lo) return;
  const spawnX = x ?? lo + Math.random() * (hi - lo);
  const spawnY = -glyph.h - glyph.h * Math.random() * 15;

  // Place glyph rings so the glyph center sits at (spawnX, spawnY)
  const ox = spawnX - glyph.cx;
  const oy = spawnY - glyph.cy;
  const svgPoly = offsetMultipoly([glyph.rings], ox, oy);

  const outerRing = svgPoly[0][0];
  const eps2 = 1e-6;
const verts = [];
for (const [px, py] of outerRing) {
  const prev = verts[verts.length - 1];
  if (prev && (prev.x - px) ** 2 + (prev.y - py) ** 2 < eps2) continue;
  verts.push({ x: px, y: py });
}
while (verts.length > 1) {
  const f = verts[0], l = verts[verts.length - 1];
  if ((f.x - l.x) ** 2 + (f.y - l.y) ** 2 < eps2) verts.pop();
  else break;
}
  const { x: cx, y: cy } = Vertices.centre(verts);

  const body = Bodies.fromVertices(cx, cy, verts, {
    restitution: 0.45,
    friction: .3,
    frictionAir: 0.0012,
  });
//   for (let i = 0; i < verts.length; i++) {
//   const j = (i + 1) % verts.length;
//   const d2 = (verts[i].x - verts[j].x) ** 2 + (verts[i].y - verts[j].y) ** 2;
//   if (d2 < 1e-6) console.log(char, "dup edge at", i, verts[i]);
// }
  // console.log(char,
  // "wrapDup:", verts[0].x === verts[verts.length - 1].x && verts[0].y === verts[verts.length - 1].y,
  // "zeroAxis:", body.axes.some(a => a.x === 0 && a.y === 0));
  if (!body) return;
  Body.setVelocity(body, { x: (Math.random() - 0.5) * 1.5, y: 1 });
  Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.12);
  Composite.add(engine.world, body);
  
  // console.log(char, "parts:", body.parts.length,
  // "signedArea:", Matter.Vertices.area(verts, true) | 0);

  const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
  el.setAttribute("d", multipolyToPathD(svgPoly));
  el.setAttribute("fill", "#080808");
  el.setAttribute("fill-rule", "evenodd");
  svg.appendChild(el);

  state.letters.push({ body, el, initX: body.position.x, initY: body.position.y });
  

  // Cap the population, oldest first
  while (state.letters.length > CONFIG.maxLetters)
    removeLetter(state.letters.shift());
}

// Idle drops and typing
setInterval(() => {
  if (Date.now() - state.lastTypeTime < CONFIG.idleResumeDelay) return;
  const char =
    CONFIG.idleLetters[Math.floor(Math.random() * CONFIG.idleLetters.length)];
  spawnLetter(char);
}, CONFIG.idleInterval);

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  // if (!/^[a-zA-Z0-9]$/.test(e.key)) return;
  state.lastTypeTime = Date.now();
  spawnLetter(e.key.toUpperCase());
});

// Resize
let resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    state.dim.x = window.innerWidth;
    state.dim.y = window.innerHeight;
    svg.setAttribute("viewBox", `0 0 ${state.dim.x} ${state.dim.y}`);
    buildBoard();
  }, 150);
});

// Init and render
buildBoard();
spawnLetter(
  CONFIG.idleLetters[Math.floor(Math.random() * CONFIG.idleLetters.length)],
);

function animate() {
  Engine.update(engine, 1000 / 60);

  const cullY = state.dim.y + CONFIG.cullBelow * CONFIG.fontSize;
  for (let i = state.letters.length - 1; i >= 0; i--) {
    const piece = state.letters[i];
    const { x, y } = piece.body.position;
    if (y > cullY) {
      removeLetter(piece);
      state.letters.splice(i, 1);
      continue;
    }
    const deg = (piece.body.angle * 180) / Math.PI;
    piece.el.setAttribute(
      "transform",
      `translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(${deg.toFixed(3)}) translate(${(-piece.initX).toFixed(2)},${(-piece.initY).toFixed(2)})`,
    );
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);