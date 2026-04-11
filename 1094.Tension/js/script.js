const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cursorEl = document.getElementById("cursor");

const WORD = "TENSION".split("");
const COLORS = [
  "#ff6b6b",
  "#f7b801",
  "#6bcb77",
  "#4d96ff",
  "#b892ff",
  "#ff8fab",
  "#ffd166",
];

let width = 0;
let height = 0;
let midY = 0;
let dpr = Math.min(window.devicePixelRatio || 1, 2);

const POINTS_PER_SEGMENT = 18;
const SEGMENT_COUNT = WORD.length;
const TOTAL_POINTS = SEGMENT_COUNT * POINTS_PER_SEGMENT + 1;
const stringPoints = [];

const mouse = {
  x: window.innerWidth * 0.5,
  y: window.innerHeight * 0.5,
  px: window.innerWidth * 0.5,
  py: window.innerHeight * 0.5,
  vx: 0,
  vy: 0,
  rawVX: 0,
  rawVY: 0,
  speed: 0,
  down: false,
  nearString: false,
  dragging: false,
  grabbedSegment: -1,
  grabbedIndex: -1,
};

let autoReturn = false;
let autoReturnStart = 0;

const letters = WORD.map((char, i) => ({
  char,
  color: COLORS[i],
  index: i,
  homeX: 0,
  homeY: 0,
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  angle: 0,
  va: 0,
  size: 0,
  released: false,
  returning: false,
  parked: false,
  parkX: 0,
  parkY: 0,
  parkAngle: 0,
  returnDelay: 0,
}));

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  midY = height * 0.5;

  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  buildString();
  layoutLetters(true);
}

function buildString() {
  stringPoints.length = 0;

  const margin = Math.max(70, width * 0.1);
  const usable = width - margin * 2;

  for (let i = 0; i < TOTAL_POINTS; i++) {
    const t = i / (TOTAL_POINTS - 1);
    const x = margin + usable * t;

    stringPoints.push({
      x,
      y: midY,
      baseY: midY,
      vy: 0,
    });
  }
}

function segmentCenterX(segIndex) {
  const startIndex = segIndex * POINTS_PER_SEGMENT;
  const endIndex = startIndex + POINTS_PER_SEGMENT;
  return (stringPoints[startIndex].x + stringPoints[endIndex].x) * 0.5;
}

function getSegmentY(segIndex) {
  const startIndex = segIndex * POINTS_PER_SEGMENT;
  const endIndex = startIndex + POINTS_PER_SEGMENT;
  let sum = 0;
  let count = 0;

  for (let i = startIndex; i <= endIndex; i++) {
    sum += stringPoints[i].y;
    count++;
  }
  return sum / count;
}

function layoutLetters(forceSnap = false) {
  letters.forEach((letter, i) => {
    letter.size = clamp(width * 0.04, 30, 62);
    letter.homeX = segmentCenterX(i);
    letter.homeY = getSegmentY(i) - 16;

    if (forceSnap) {
      letter.x = letter.homeX;
      letter.y = letter.homeY;
      letter.vx = 0;
      letter.vy = 0;
      letter.angle = 0;
      letter.va = 0;
      letter.released = false;
      letter.returning = false;
      letter.parked = false;
    }
  });
}

function getLocalStringYAtX(x) {
  const left = stringPoints[0].x;
  const right = stringPoints[stringPoints.length - 1].x;
  const tx = clamp((x - left) / (right - left), 0, 1);
  const index = tx * (stringPoints.length - 1);
  const i0 = Math.floor(index);
  const i1 = Math.min(stringPoints.length - 1, i0 + 1);
  const frac = index - i0;
  return lerp(stringPoints[i0].y, stringPoints[i1].y, frac);
}

function getSegmentFromX(x) {
  const left = stringPoints[0].x;
  const right = stringPoints[stringPoints.length - 1].x;
  const t = clamp((x - left) / (right - left), 0, 0.999999);
  return clamp(Math.floor(t * SEGMENT_COUNT), 0, SEGMENT_COUNT - 1);
}

function segmentStartIndex(seg) {
  return seg * POINTS_PER_SEGMENT;
}

function disturbSegment(segIndex, targetY, power = 1) {
  const start = segmentStartIndex(segIndex);
  const end = start + POINTS_PER_SEGMENT;
  const center = (start + end) * 0.5;

  for (let i = start; i <= end; i++) {
    if (i <= 0 || i >= stringPoints.length - 1) continue;

    const p = stringPoints[i];
    const local = Math.abs(i - center) / ((end - start) * 0.5);
    const falloff = 1 - clamp(local, 0, 1);
    const strength = 0.25 * falloff * power;

    p.y += (targetY - p.y) * strength;
    p.vy += (targetY - p.y) * 0.02 * falloff;
  }
}

function exciteSegment(segIndex, impulseY) {
  const start = segmentStartIndex(segIndex);
  const end = start + POINTS_PER_SEGMENT;
  const center = (start + end) * 0.5;

  for (
    let i = Math.max(1, start - 6);
    i <= Math.min(stringPoints.length - 2, end + 6);
    i++
  ) {
    const p = stringPoints[i];
    const d = Math.abs(i - center);
    const falloff = 1 - clamp(d / (POINTS_PER_SEGMENT * 0.9), 0, 1);
    p.vy += impulseY * falloff;
  }
}

function updateCursor() {
  cursorEl.style.left = mouse.x + "px";
  cursorEl.style.top = mouse.y + "px";
  cursorEl.classList.toggle("near", mouse.nearString);
  cursorEl.classList.toggle("dragging", mouse.dragging);
}

function onPointerMove(e) {
  mouse.px = mouse.x;
  mouse.py = mouse.y;
  mouse.x = e.clientX;
  mouse.y = e.clientY;

  mouse.rawVX = mouse.x - mouse.px;
  mouse.rawVY = mouse.y - mouse.py;

  mouse.vx = mouse.vx * 0.75 + mouse.rawVX * 0.25;
  mouse.vy = mouse.vy * 0.75 + mouse.rawVY * 0.25;
  mouse.speed = Math.hypot(mouse.vx, mouse.vy);

  const yOnString = getLocalStringYAtX(mouse.x);
  mouse.nearString = Math.abs(mouse.y - yOnString) < 42;

  if (mouse.down && mouse.nearString) {
    mouse.dragging = true;

    if (mouse.grabbedSegment === -1) {
      mouse.grabbedSegment = getSegmentFromX(mouse.x);
      mouse.grabbedIndex =
        segmentStartIndex(mouse.grabbedSegment) +
        Math.floor(POINTS_PER_SEGMENT / 2);
    }
  } else if (!mouse.down) {
    mouse.dragging = false;
    mouse.grabbedSegment = -1;
    mouse.grabbedIndex = -1;
  }

  updateCursor();
}

function onPointerDown(e) {
  mouse.down = true;
  mouse.x = e.clientX;
  mouse.y = e.clientY;

  const yOnString = getLocalStringYAtX(mouse.x);
  mouse.nearString = Math.abs(mouse.y - yOnString) < 42;

  if (mouse.nearString) {
    mouse.dragging = true;
    mouse.grabbedSegment = getSegmentFromX(mouse.x);
    mouse.grabbedIndex =
      segmentStartIndex(mouse.grabbedSegment) +
      Math.floor(POINTS_PER_SEGMENT / 2);
  }

  updateCursor();
}

function releaseLetter(segIndex) {
  const letter = letters[segIndex];
  if (!letter || letter.released || letter.returning) return;

  const dx = mouse.vx;
  const dy = mouse.vy;
  const dist = Math.hypot(dx, dy) || 1;

  let dirX = dx / dist;
  let dirY = dy / dist;

  const verticalBias = Math.abs(dirY);
  dirX *= 1 - 0.55 * verticalBias;

  const power = clamp(mouse.speed * 2.4, 14, 75);
  const centerBias = (segIndex / (letters.length - 1)) * 2 - 1;

  letter.released = true;
  letter.returning = false;
  letter.parked = false;

  letter.vx = -dirX * power + -centerBias * 4;
  letter.vy = -dirY * power;
  letter.va = -dirX * 0.05;

  const vxSign = Math.sign(letter.vx || (centerBias === 0 ? 1 : -centerBias));
  const vySign = Math.sign(letter.vy || -1);

  letter.parkX = clamp(
    letter.homeX + vxSign * (width * 0.18 + Math.random() * width * 0.08),
    40,
    width - 40,
  );

  letter.parkY = clamp(
    letter.homeY + vySign * (height * 0.14 + Math.random() * height * 0.12),
    60,
    height - 60,
  );

  letter.parkAngle = clamp(letter.angle + letter.va * 10, -0.8, 0.8);

  exciteSegment(segIndex, -mouse.vy * 0.22);
}

function onPointerUp() {
  if (mouse.dragging && mouse.grabbedSegment > -1) {
    releaseLetter(mouse.grabbedSegment);
  }

  mouse.down = false;
  mouse.dragging = false;
  mouse.grabbedSegment = -1;
  mouse.grabbedIndex = -1;
  updateCursor();
}

function allLettersReleasedAndParked() {
  return letters.every((l) => l.released && l.parked);
}

function startAutoReturn() {
  autoReturn = true;
  autoReturnStart = performance.now();

  letters.forEach((letter, i) => {
    letter.returnDelay = i * 180;
  });
}

function updateString() {
  if (mouse.dragging && mouse.grabbedSegment > -1) {
    const dragY = clamp(mouse.y, midY - 240, midY + 240);
    disturbSegment(mouse.grabbedSegment, dragY, 1.9);
  }

  for (let i = 1; i < stringPoints.length - 1; i++) {
    const p = stringPoints[i];
    const spring = (p.baseY - p.y) * 0.065;
    p.vy += spring;
    p.vy *= 0.94;
    p.y += p.vy;
  }

  for (let pass = 0; pass < 7; pass++) {
    for (let i = 1; i < stringPoints.length - 1; i++) {
      const prev = stringPoints[i - 1];
      const p = stringPoints[i];
      const next = stringPoints[i + 1];
      const average = (prev.y + next.y) * 0.5;
      p.y += (average - p.y) * 0.19;
    }
  }
}

function updateLetters(now) {
  layoutLetters(false);

  letters.forEach((letter) => {
    if (!letter.released && !letter.returning) {
      letter.x += (letter.homeX - letter.x) * 0.16;
      letter.y += (letter.homeY - letter.y) * 0.16;
      letter.angle += (0 - letter.angle) * 0.12;
      return;
    }

    if (letter.released && !letter.returning) {
      if (!letter.parked) {
        const dx = letter.parkX - letter.x;
        const dy = letter.parkY - letter.y;

        letter.vx += dx * 0.0014;
        letter.vy += dy * 0.0014;
        letter.va += (letter.parkAngle - letter.angle) * 0.007;

        letter.vx *= 0.87;
        letter.vy *= 0.87;
        // vorher 0.9, 0.9, 0.87
        letter.va *= 0.85;

        letter.x += letter.vx;
        letter.y += letter.vy;
        letter.angle += letter.va;

        const dist = Math.hypot(dx, dy);
        if (dist < 18 && Math.abs(letter.vx) + Math.abs(letter.vy) < 1.2) {
          letter.parked = true;
          letter.vx = 0;
          letter.vy = 0;
          letter.va = 0;
        }
      } else {
        letter.x = lerp(letter.x, letter.parkX, 0.05);
        letter.y = lerp(letter.y, letter.parkY, 0.05);
        letter.angle = lerp(letter.angle, letter.parkAngle, 0.05);
      }
    }

    if (autoReturn && letter.released) {
      const elapsed = now - autoReturnStart - letter.returnDelay;
      if (elapsed > 0) {
        const t = clamp(elapsed / 2400, 0, 1);
        const e = easeOutCubic(t);

        letter.returning = true;
        letter.parked = false;

        const startX = letter.parkX;
        const startY = letter.parkY;
        const startA = letter.parkAngle;
        const arcY = Math.sin(t * Math.PI) * 40;

        letter.x = lerp(startX, letter.homeX, e);
        letter.y = lerp(startY, letter.homeY, e) - arcY;
        letter.angle = lerp(startA, 0, e);

        if (t >= 1) {
          letter.released = false;
          letter.returning = false;
          letter.parked = false;
          letter.x = letter.homeX;
          letter.y = letter.homeY;
          letter.vx = 0;
          letter.vy = 0;
          letter.angle = 0;
          letter.va = 0;
        }
      }
    }
  });

  if (!autoReturn && allLettersReleasedAndParked()) {
    startAutoReturn();
  }

  if (autoReturn && letters.every((l) => !l.released && !l.returning)) {
    autoReturn = false;
  }
}

function drawBackgroundGuide() {
  ctx.save();
  ctx.strokeStyle = "rgba(244, 241, 234, 0.05)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(width, midY);
  ctx.stroke();
  ctx.restore();
}

function drawColoredString() {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (let seg = 0; seg < SEGMENT_COUNT; seg++) {
    const start = segmentStartIndex(seg);
    const end = start + POINTS_PER_SEGMENT;

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(stringPoints[start].x, stringPoints[start].y);
    for (let i = start + 1; i <= end; i++) {
      ctx.lineTo(stringPoints[i].x, stringPoints[i].y);
    }
    ctx.stroke();

    ctx.strokeStyle = COLORS[seg];
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(stringPoints[start].x, stringPoints[start].y);
    for (let i = start + 1; i <= end; i++) {
      ctx.lineTo(stringPoints[i].x, stringPoints[i].y);
    }
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(244, 241, 234, 0.9)";
  ctx.beginPath();
  ctx.arc(stringPoints[0].x, stringPoints[0].y, 3.5, 0, Math.PI * 2);
  ctx.arc(
    stringPoints[stringPoints.length - 1].x,
    stringPoints[stringPoints.length - 1].y,
    3.5,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.restore();
}

function drawLetters() {
  letters.forEach((letter) => {
    if (
      letter.released &&
      !letter.returning &&
      !letter.parked &&
      Math.hypot(letter.vx, letter.vy) > 6
    ) {
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = letter.color;
      ctx.font = `600 ${letter.size}px Inter, Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.translate(letter.x - letter.vx * 1.6, letter.y - letter.vy * 1.6);
      ctx.rotate(letter.angle - letter.va * 0.8);
      ctx.fillText(letter.char, 0, 0);
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = letter.color;
    ctx.font = `700 ${letter.size}px Inter, Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.translate(letter.x, letter.y);
    ctx.rotate(letter.angle);
    ctx.shadowColor = letter.color;
    ctx.shadowBlur = 14;
    ctx.fillText(letter.char, 0, 0);
    ctx.restore();
  });
}

function render() {
  ctx.clearRect(0, 0, width, height);
  drawBackgroundGuide();
  drawColoredString();
  drawLetters();
}

function tick(now) {
  updateString();
  updateLetters(now);
  render();
  requestAnimationFrame(tick);
}

window.addEventListener("resize", resize);
window.addEventListener("pointermove", onPointerMove);
window.addEventListener("pointerdown", onPointerDown);
window.addEventListener("pointerup", onPointerUp);
window.addEventListener("pointercancel", onPointerUp);
window.addEventListener("mouseleave", onPointerUp);

resize();
updateCursor();
requestAnimationFrame(tick);