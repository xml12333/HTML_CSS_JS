/* ════════════════════════════════════════════════
   CONFIG — all magic numbers live here
   ════════════════════════════════════════════════ */
const CONFIG = {
  canvas: { width: 240, height: 240 },

  starfield: {
    count: 180,
    speedBase: 0.01, // min warpSpeed (idle)
    speedThrust: 0.025, // added at full thrust
    jumpSpeed: 0.15, // one-shot warp-jump speed
    jumpDuration: 2000, // ms before returning to normal
    trailRatio: 0.6, // star trail length as fraction of radius
    trailMaxLen: 40, // px cap on trail length
    edgeRadius: 125, // recycle star beyond this radius
    alphaFadeAt: 80, // radius at which star reaches full alpha
    maxLineWidth: 1.8,
    spawnRadiusMax: 5, // random spawn radius 0.5–spawnRadiusMax
    starSpeedMin: 0.1,
    starSpeedMax: 0.5,
    hueBase: 200, // blue-cyan colour range start
    hueRange: 60,
    lightnessMin: 70,
    lightnessRange: 30,
    /* nebula gradient stops */
    nebulaInner: "rgba(10,20,60,0.15)",
    nebulaMid: "rgba(5,10,30,0.10)",
    nebulaRadius: 120,
    /* centre glow */
    glowColor: "rgba(80,160,255,0.15)",
    glowRadius: 30,
    /* motion-blur fill */
    trailFill: "rgba(3,4,12,0.25)"
  },

  /* gauge ticks */
  gauge: {
    size: 80, // canvas px (square)
    cx: 40,
    cy: 40,
    radius: 34,
    tickCount: 10,
    majorEvery: 5,
    majorTickLen: 8,
    minorTickLen: 4,
    arcStartAngle: Math.PI * 0.75,
    arcEndAngle: Math.PI * 1.75,
    majorColor: "rgba(200,205,214,0.5)",
    minorColor: "rgba(100,110,130,0.4)",
    arcColor: "rgba(0,180,220,0.2)",
    majorWidth: 1.5,
    minorWidth: 1,
    arcWidth: 2,
    /* needle mapping */
    needleMinDeg: -90,
    needleMaxDeg: 90,
    velMin: 0.5, // c — left of gauge
    velMax: 0.99 // c — right of gauge
  },

  /* porthole bolt ring */
  bolts: {
    count: 8,
    ringRadius: 142, // px from ring-div centre
    ringOffset: 142 // div is 284px wide, centre = 142
  },

  /* waveform bars */
  waveform: {
    barCount: 20,
    heightMin: 4,
    heightRange: 18,
    durMin: 0.4,
    durRange: 0.8,
    delayRange: 0.5,
    restFactor: 0.4 // starting height as fraction of max
  },

  /* telemetry readouts */
  telemetry: {
    tickMs: 900, // setInterval period
    jitterFactor: 0.03, // ±fraction of _max per tick
    barFlicker: 4, // ±% on each bar meter tick
    barMin: 10,
    barMax: 95,
    coordLabelChance: 0.15, // probability of rotating warp label each tick
    /* velocity */
    vel: { id: "velVal", init: 0.78, min: 0.5, max: 0.99 },
    /* distance */
    dist: { id: "distVal", init: 4.82, min: 0, max: 99 },
    /* eta */
    eta: { id: "etaVal", init: 12.78, min: 1, max: 99 },
    /* base coordinates */
    coordRA: 14,
    coordDec: 43,
    coordDrift: 0.01,
    /* bar meters: id → baseline % */
    bars: [
      { id: "bar1", base: 78 },
      { id: "bar2", base: 62 },
      { id: "bar3", base: 91 },
      { id: "bar4", base: 45 }
    ],
    /* warp status labels */
    warpLabels: [
      "Warp Field Active",
      "Quantum Drift",
      "Hyperlane Locked",
      "Superluminal"
    ],
    jumpLabel: "⚡ JUMP INITIATED"
  }
};

/* ════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════ */
const rng = (min, max) => Math.random() * (max - min) + min;

/* ════════════════════════════════════════════════
   WARP STARFIELD
   ════════════════════════════════════════════════ */
const canvas = document.getElementById("warpCanvas");
const ctx = canvas.getContext("2d");
const { width: W, height: H } = CONFIG.canvas;
const CX = W / 2,
  CY = H / 2;

let warpSpeed = CONFIG.starfield.speedBase;

const { starfield: SF } = CONFIG;
const stars = Array.from({ length: SF.count }, () => ({
  angle: Math.random() * Math.PI * 2,
  radius: Math.random() * SF.spawnRadiusMax + 1,
  speed: rng(SF.starSpeedMin, SF.starSpeedMax),
  color: `hsl(${SF.hueBase + Math.random() * SF.hueRange}, 80%, ${
    SF.lightnessMin + Math.random() * SF.lightnessRange
  }%)`,
  len: 0
}));

function respawnStar(s) {
  s.radius = Math.random() * SF.spawnRadiusMax + 0.5;
  s.len = 0;
  s.angle = Math.random() * Math.PI * 2;
  s.speed = rng(SF.starSpeedMin, SF.starSpeedMax);
}

function drawWarp() {
  ctx.fillStyle = SF.trailFill;
  ctx.fillRect(0, 0, W, H);

  // nebula
  const neb = ctx.createRadialGradient(CX, CY, 0, CX, CY, SF.nebulaRadius);
  neb.addColorStop(0, SF.nebulaInner);
  neb.addColorStop(0.5, SF.nebulaMid);
  neb.addColorStop(1, "transparent");
  ctx.fillStyle = neb;
  ctx.fillRect(0, 0, W, H);

  stars.forEach((s) => {
    s.radius += s.speed * warpSpeed * 60;
    s.len = Math.min(s.radius * SF.trailRatio, SF.trailMaxLen);
    if (s.radius > SF.edgeRadius) respawnStar(s);

    const x = CX + Math.cos(s.angle) * s.radius;
    const y = CY + Math.sin(s.angle) * s.radius;
    const x0 = CX + Math.cos(s.angle) * Math.max(s.radius - s.len, 0.1);
    const y0 = CY + Math.sin(s.angle) * Math.max(s.radius - s.len, 0.1);

    const alpha = Math.min(s.radius / SF.alphaFadeAt, 1);
    ctx.strokeStyle = s.color
      .replace(")", `, ${alpha})`)
      .replace("hsl", "hsla");
    ctx.lineWidth = Math.min(s.radius / 30, SF.maxLineWidth);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  // centre glow
  const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, SF.glowRadius);
  g.addColorStop(0, SF.glowColor);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  requestAnimationFrame(drawWarp);
}
drawWarp();

function drawGaugeTicks(canvasId) {
  const el = document.getElementById(canvasId);
  if (!el) return;
  const ct = el.getContext("2d");
  const {
    size,
    cx,
    cy,
    radius: r,
    tickCount,
    majorEvery,
    majorTickLen,
    minorTickLen,
    arcStartAngle,
    arcEndAngle,
    majorColor,
    minorColor,
    arcColor,
    majorWidth,
    minorWidth,
    arcWidth
  } = CONFIG.gauge;

  ct.clearRect(0, 0, size, size);

  for (let i = 0; i <= tickCount; i++) {
    const angle = Math.PI * (0.75 + (i * 1.5) / tickCount);
    const major = i % majorEvery === 0;
    const inner = r - (major ? majorTickLen : minorTickLen);
    ct.beginPath();
    ct.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
    ct.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    ct.strokeStyle = major ? majorColor : minorColor;
    ct.lineWidth = major ? majorWidth : minorWidth;
    ct.stroke();
  }

  ct.beginPath();
  ct.arc(cx, cy, r, arcStartAngle, arcEndAngle);
  ct.strokeStyle = arcColor;
  ct.lineWidth = arcWidth;
  ct.stroke();
}
drawGaugeTicks("gaugeTicks1");

/* ════════════════════════════════════════════════
   BOLT RING
   ════════════════════════════════════════════════ */
const ring = document.getElementById("boltRing");
const { count: boltCount, ringRadius, ringOffset } = CONFIG.bolts;
for (let i = 0; i < boltCount; i++) {
  const angle = (i / boltCount) * Math.PI * 2 - Math.PI / 2;
  const bolt = document.createElement("div");
  bolt.className = "bolt";
  bolt.style.left = ringOffset + Math.cos(angle) * ringRadius + "px";
  bolt.style.top = ringOffset + Math.sin(angle) * ringRadius + "px";
  ring.appendChild(bolt);
}

const wf = document.getElementById("waveform");
const {
  barCount,
  heightMin,
  heightRange,
  durMin,
  durRange,
  delayRange,
  restFactor
} = CONFIG.waveform;
for (let i = 0; i < barCount; i++) {
  const b = document.createElement("div");
  b.className = "wave-bar";
  const maxH = heightMin + Math.random() * heightRange;
  b.style.setProperty("--max-h", maxH + "px");
  b.style.setProperty("--dur", durMin + Math.random() * durRange + "s");
  b.style.setProperty("--delay", Math.random() * delayRange + "s");
  b.style.height = maxH * restFactor + "px";
  wf.appendChild(b);
}

const { telemetry: T } = CONFIG;

function jitter(el, fmt) {
  el._val += rng(-T.jitterFactor, T.jitterFactor) * (el._max ?? 1);
  el._val = Math.max(el._min ?? 0, Math.min(el._max ?? 99, el._val));
  el.textContent = fmt(el._val);
}

const velEl = Object.assign(document.getElementById(T.vel.id), {
  _val: T.vel.init,
  _min: T.vel.min,
  _max: T.vel.max
});
const distEl = Object.assign(document.getElementById(T.dist.id), {
  _val: T.dist.init,
  _min: T.dist.min,
  _max: T.dist.max
});
const etaEl = Object.assign(document.getElementById(T.eta.id), {
  _val: T.eta.init,
  _min: T.eta.min,
  _max: T.eta.max
});

const needle1 = document.getElementById("needle1");
const barEls = T.bars.map((b) => ({
  el: document.getElementById(b.id),
  base: b.base
}));
const warpLabelEl = document.getElementById("warpLabel");
const coordEl = document.getElementById("coordVal");
const thrustEl = document.getElementById("thrustSlider");

let labelIdx = 0;

const { gauge: G } = CONFIG;
function updateNeedle(vel) {
  const norm = (vel - G.velMin) / (G.velMax - G.velMin);
  const deg = G.needleMinDeg + norm * (G.needleMaxDeg - G.needleMinDeg);
  needle1.style.transform = `translateX(-50%) rotate(${deg}deg)`;
}

setInterval(() => {
  jitter(velEl, (v) => v.toFixed(2) + "c");
  jitter(distEl, (v) => v.toFixed(2));
  jitter(etaEl, (v) => {
    const h = Math.floor(v),
      m = Math.floor((v % 1) * 60);
    return h + ":" + (m < 10 ? "0" : "") + m;
  });

  updateNeedle(velEl._val);

  barEls.forEach(({ el, base }) => {
    el.style.height =
      Math.max(
        T.barMin,
        Math.min(T.barMax, base + rng(-T.barFlicker, T.barFlicker))
      ) + "%";
  });

  if (Math.random() < T.coordLabelChance) {
    labelIdx = (labelIdx + 1) % T.warpLabels.length;
    warpLabelEl.textContent = T.warpLabels[labelIdx];
  }

  const ra = (T.coordRA + rng(-T.coordDrift, T.coordDrift)).toFixed(2);
  const dec = (T.coordDec + rng(-T.coordDrift, T.coordDrift)).toFixed(2);
  coordEl.textContent = `α ${ra}h ${dec}° N`;

  warpSpeed =
    SF.speedBase + (parseFloat(thrustEl.value) / 100) * SF.speedThrust;
}, T.tickMs);

document.getElementById("launchBtn").addEventListener("click", () => {
  warpSpeed = SF.jumpSpeed;
  warpLabelEl.textContent = T.jumpLabel;
  setTimeout(() => {
    warpSpeed =
      SF.speedBase + (parseFloat(thrustEl.value) / 100) * SF.speedThrust;
    warpLabelEl.textContent = T.warpLabels[labelIdx];
  }, SF.jumpDuration);
});