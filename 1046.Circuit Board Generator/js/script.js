/**
 * --- PERLIN NOISE IMPLEMENTATION ---
 * Minimal 2D Perlin noise
 */
const Perlin = function () {
  const permutation = new Uint8Array(512);
  const p = new Uint8Array(256);
  // Initialize permutation table
  for (let i = 0; i < 256; i++) p[i] = i;

  // Shuffle
  for (let i = 255; i > 0; i--) {
    const r = Math.floor(Math.random() * (i + 1));
    [p[i], p[r]] = [p[r], p[i]];
  }

  for (let i = 0; i < 512; i++) permutation[i] = p[i & 255];

  function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function lerp(t, a, b) {
    return a + t * (b - a);
  }

  function grad(hash, x, y) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  return {
    seed: function (val) {
      // Simple re-shuffle based on random Math seed happening externally
      for (let i = 0; i < 256; i++) p[i] = i;

      for (let i = 255; i > 0; i--) {
        const r = Math.floor(Math.random() * (i + 1));
        [p[i], p[r]] = [p[r], p[i]];
      }

      for (let i = 0; i < 512; i++) permutation[i] = p[i & 255];
    },

    get: function (x, y) {
      const X = Math.floor(x) & 255,
      Y = Math.floor(y) & 255;
      x -= Math.floor(x);
      y -= Math.floor(y);
      const u = fade(x),
      v = fade(y);
      const A = permutation[X] + Y,
      B = permutation[X + 1] + Y;
      return lerp(
      v,
      lerp(u, grad(permutation[A], x, y), grad(permutation[B], x - 1, y)),
      lerp(
      u,
      grad(permutation[A + 1], x, y - 1),
      grad(permutation[B + 1], x - 1, y - 1)));


    } };

}();

/**
 * --- LOGIC & STATE ---
 */
// Config
let config = {
  cols: 24,
  rows: 24,
  size: 20,
  density: 0.4,
  noiseScale: 0.3,
  steps: 20,
  cBg: "#757575",
  cTrace: "#929292",
  cPad: "#DBDBDB",
  resolution: 2 };


// State
let tile = []; // 2D Array
let logicState = 0; // 0=Find Start, 1=Draw Path

let cursor = {
  r: 0,
  c: 0,
  dir: 0 };


let animFrameId;

// Constants
const BLANK = 0;
const BLOCKED = -1;
const BLOB = 8; // Bit index for Pad
// Directions
const N = 0,
NE = 1,
E = 2,
SE = 3,
S = 4,
SW = 5,
W = 6,
NW = 7;

// DOM Elements
const container = document.getElementById("viewport");

/**
 * --- INITIALIZATION ---
 */
function init() {
  // Stop any running animation
  if (animFrameId) cancelAnimationFrame(animFrameId);

  // Read Inputs
  config.cols = parseInt(document.getElementById("inp-cols").value);
  config.rows = parseInt(document.getElementById("inp-rows").value);
  config.size = parseInt(document.getElementById("inp-size").value);
  config.density = parseFloat(document.getElementById("inp-density").value);
  config.noiseScale = parseFloat(document.getElementById("inp-noise").value);
  config.steps = parseInt(document.getElementById("inp-speed").value);
  config.cBg = document.getElementById("col-bg").value;
  config.cTrace = document.getElementById("col-trace").value;
  config.cPad = document.getElementById("col-pad").value;

  // Setup Logic Grid
  tile = [];
  Perlin.seed(Math.random());

  for (let r = 0; r < config.rows; r++) {
    tile[r] = [];

    for (let c = 0; c < config.cols; c++) {
      // Perlin returns approx -1 to 1, normalize to 0-1 for density check
      // Actually implementation above usually returns -1 to 1 range approx.
      // Let's normalize explicitly 0..1
      let nVal =
      (Perlin.get(c * config.noiseScale, r * config.noiseScale) + 1) / 2;

      if (nVal > config.density) tile[r][c] = BLOCKED;else
      tile[r][c] = BLANK;
    }
  }

  logicState = 0; // Reset Logic

  // Create SVG DOM Structure
  createSVG();

  // Start Loop
  loop();
}

/**
 * --- RENDERER (SVG) ---
 */
let svgEl, groupTraces, groupPads, rectBg;

function createSVG() {
  container.innerHTML = "";
  const w = config.cols * config.size;
  const h = config.rows * config.size;

  svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgEl.setAttribute("width", w);
  svgEl.setAttribute("height", h);
  // Remove the spaces between $ and {
  svgEl.setAttribute("viewBox", `0 0 ${w} ${h}`);

  svgEl.style.backgroundColor = config.cBg;

  rectBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rectBg.setAttribute("width", "100%");
  rectBg.setAttribute("height", "100%");
  rectBg.setAttribute("fill", config.cBg);
  svgEl.appendChild(rectBg);

  groupTraces = document.createElementNS("http://www.w3.org/2000/svg", "g");
  groupTraces.setAttribute("stroke", config.cTrace);
  groupTraces.setAttribute("stroke-width", config.size / 6.0);
  groupTraces.setAttribute("stroke-linecap", "round");

  groupPads = document.createElementNS("http://www.w3.org/2000/svg", "g");

  svgEl.appendChild(groupTraces);
  svgEl.appendChild(groupPads);
  container.appendChild(svgEl);
}

function render() {
  // To keep performance high during animation, we wipe and rebuild
  // content. For < 2000 elements this is fast enough in modern DOM.
  // Optimization: logic updates `tile`, we map `tile` to SVG nodes.

  // Clear groups
  groupTraces.innerHTML = "";
  groupPads.innerHTML = "";

  const w = config.size;
  const h = config.size;
  const padOuter = w * 0.5;
  const padInner = w * 0.15;

  for (let r = 0; r < config.rows; r++) {
    for (let c = 0; c < config.cols; c++) {
      const type = tile[r][c];
      if (type === BLOCKED || type === BLANK) continue;

      const cx = c * w + w / 2;
      const cy = r * h + h / 2;

      // Draw Traces
      // Check bits 0-7
      for (let i = 0; i < 8; i++) {
        if ((type & 1 << i) !== 0) {
          let tx = cx,
          ty = cy;
          if (i === N) ty -= h / 2;
          if (i === S) ty += h / 2;
          if (i === W) tx -= w / 2;
          if (i === E) tx += w / 2;

          if (i === NE) {
            tx += w / 2;
            ty -= h / 2;
          }

          if (i === NW) {
            tx -= w / 2;
            ty -= h / 2;
          }

          if (i === SE) {
            tx += w / 2;
            ty += h / 2;
          }

          if (i === SW) {
            tx -= w / 2;
            ty += h / 2;
          }

          const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line");

          line.setAttribute("x1", cx);
          line.setAttribute("y1", cy);
          line.setAttribute("x2", tx);
          line.setAttribute("y2", ty);
          groupTraces.appendChild(line);
        }
      }

      // Draw Pad
      if ((type & 1 << BLOB) !== 0) {
        // Outer
        const cOuter = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "ellipse");

        cOuter.setAttribute("cx", cx);
        cOuter.setAttribute("cy", cy);
        cOuter.setAttribute("rx", padOuter / 2);
        cOuter.setAttribute("ry", padOuter / 2);
        cOuter.setAttribute("fill", config.cPad);
        groupPads.appendChild(cOuter);

        // Inner (hole) - represented as background color circle
        const cInner = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "ellipse");

        cInner.setAttribute("cx", cx);
        cInner.setAttribute("cy", cy);
        cInner.setAttribute("rx", padInner / 2);
        cInner.setAttribute("ry", padInner / 2);
        cInner.setAttribute("fill", config.cBg);
        groupPads.appendChild(cInner);
      }
    }
  }
}

/**
 * --- ALGORITHM LOGIC ---
 */
function getWrapped(index, max) {
  return (index % max + max) % max;
}

function canMove(r, c, d) {
  let dr = 0,
  dc = 0;
  if (d === N || d === NE || d === NW) dr = -1;
  if (d === S || d === SE || d === SW) dr = 1;
  if (d === E || d === NE || d === SE) dc = 1;
  if (d === W || d === NW || d === SW) dc = -1;

  let nr = getWrapped(r + dr, config.rows);
  let nc = getWrapped(c + dc, config.cols);

  // 1. Is target empty?
  if (tile[nr][nc] !== BLANK) return false;

  // 2. Diagonal Crossing Checks
  if (d === NE) {
    if (
    tile[getWrapped(r - 1, config.rows)][c] !== BLANK ||
    tile[r][getWrapped(c + 1, config.cols)] !== BLANK)

    return false;
  } else if (d === SW) {
    if (
    tile[getWrapped(r + 1, config.rows)][c] !== BLANK ||
    tile[r][getWrapped(c - 1, config.cols)] !== BLANK)

    return false;
  } else if (d === NW) {
    if (
    tile[getWrapped(r - 1, config.rows)][c] !== BLANK ||
    tile[r][getWrapped(c - 1, config.cols)] !== BLANK)

    return false;
  } else if (d === SE) {
    if (
    tile[getWrapped(r + 1, config.rows)][c] !== BLANK ||
    tile[r][getWrapped(c + 1, config.cols)] !== BLANK)

    return false;
  }

  return true;
}

function updateLogic() {
  if (logicState === 0) {
    // FIND START
    for (let k = 0; k < 10; k++) {
      cursor.r = Math.floor(Math.random() * config.rows);
      cursor.c = Math.floor(Math.random() * config.cols);
      cursor.dir = Math.floor(Math.random() * 8);

      if (tile[cursor.r][cursor.c] === BLANK) {
        logicState = 1;
        break;
      }
    }
  } else if (logicState === 1) {
    // DRAW PATH
    let attempts = [
    cursor.dir,
    // Straight
    (cursor.dir + 1) % 8,
    // Slight Right
    (cursor.dir + 7) % 8,
    // Slight Left
    (cursor.dir + 2) % 8,
    // Hard Right
    (cursor.dir + 6) % 8
    // Hard Left
    ];

    let foundDir = -1;

    for (let i = 0; i < attempts.length; i++) {
      let d = attempts[i];

      if (canMove(cursor.r, cursor.c, d)) {
        foundDir = d;
        break;
      }
    }

    if (foundDir !== -1) {
      cursor.dir = foundDir;

      let dr = 0,
      dc = 0;
      if (cursor.dir === N || cursor.dir === NE || cursor.dir === NW) dr = -1;
      if (cursor.dir === S || cursor.dir === SE || cursor.dir === SW) dr = 1;
      if (cursor.dir === E || cursor.dir === NE || cursor.dir === SE) dc = 1;
      if (cursor.dir === W || cursor.dir === NW || cursor.dir === SW) dc = -1;

      let nextRow = getWrapped(cursor.r + dr, config.rows);
      let nextCol = getWrapped(cursor.c + dc, config.cols);

      // Update Current
      if (tile[cursor.r][cursor.c] === BLANK) {
        tile[cursor.r][cursor.c] = 1 << BLOB | 1 << cursor.dir;
      } else {
        tile[cursor.r][cursor.c] &= ~(1 << BLOB); // Remove pad if continuing
        tile[cursor.r][cursor.c] |= 1 << cursor.dir;
      }

      // Update Next (Backlink)
      tile[nextRow][nextCol] = 1 << BLOB | 1 << (cursor.dir + 4 & 7);

      cursor.r = nextRow;
      cursor.c = nextCol;
    } else {
      // Stuck
      logicState = 0;
    }
  }
}

function loop() {
  // Run multiple logic steps per frame
  for (let i = 0; i < config.steps; i++) {
    updateLogic();
  }

  render();
  animFrameId = requestAnimationFrame(loop);
}

/**
 * --- EXPORTS ---
 */
function downloadString(text, fileType, fileName) {
  const blob = new Blob([text], {
    type: fileType });

  const a = document.createElement("a");
  a.download = fileName;
  a.href = URL.createObjectURL(blob);
  a.dataset.downloadurl = [fileType, a.download, a.href].join(":");
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(
  function () {
    URL.revokeObjectURL(a.href);
  },

  1500);

}

function round3(n) {
  return Math.round(n * 1000) / 1000;
}

function exportSVG() {
  const w = config.cols * config.size;
  const h = config.rows * config.size;
  const strokeW = round3(config.size / 6.0);
  const padOuter = round3(config.size * 0.5 / 2);
  const padInner = round3(config.size * 0.15 / 2);

  let lines = [];
  let padsOuter = [];
  let padsInner = [];

  const cellW = config.size;
  const cellH = config.size;

  for (let r = 0; r < config.rows; r++) {
    for (let c = 0; c < config.cols; c++) {
      const type = tile[r][c];
      if (type === BLOCKED || type === BLANK) continue;
      const cx = round3(c * cellW + cellW / 2);
      const cy = round3(r * cellH + cellH / 2);

      for (let i = 0; i < 8; i++) {
        if ((type & 1 << i) !== 0) {
          let tx = cx,ty = cy;
          if (i === N) ty = round3(cy - cellH / 2);
          if (i === S) ty = round3(cy + cellH / 2);
          if (i === W) tx = round3(cx - cellW / 2);
          if (i === E) tx = round3(cx + cellW / 2);
          if (i === NE) {tx = round3(cx + cellW / 2);ty = round3(cy - cellH / 2);}
          if (i === NW) {tx = round3(cx - cellW / 2);ty = round3(cy - cellH / 2);}
          if (i === SE) {tx = round3(cx + cellW / 2);ty = round3(cy + cellH / 2);}
          if (i === SW) {tx = round3(cx - cellW / 2);ty = round3(cy + cellH / 2);}
          lines.push(`<line x1="${cx}" y1="${cy}" x2="${tx}" y2="${ty}" />`);
        }
      }

      if ((type & 1 << BLOB) !== 0) {
        padsOuter.push(`<circle cx="${cx}" cy="${cy}" r="${padOuter}" />`);
        padsInner.push(`<circle cx="${cx}" cy="${cy}" r="${padInner}" />`);
      }
    }
  }

  // Ensure no spaces between $ and { in the string below
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <style>
        .bg { fill: ${config.cBg}; }
        .trace { stroke: ${config.cTrace}; stroke-width: ${strokeW}; stroke-linecap: round; }
        .pad-outer { fill: ${config.cPad}; }
        .pad-inner { fill: ${config.cBg}; }
      </style>
    </defs>
    <rect width="100%" height="100%" class="bg" />
    <g class="trace" fill="none">${lines.join('\n')}</g>
    <g class="pad-outer">${padsOuter.join('\n')}</g>
    <g class="pad-inner">${padsInner.join('\n')}</g>
  </svg>`;

  downloadString(svg, "image/svg+xml", "circuit.svg");
}

function exportPNG() {
  const s = new XMLSerializer();
  const str = s.serializeToString(svgEl);
  const canvas = document.getElementById("exportCanvas");
  const ctx = canvas.getContext("2d");

  const scale = config.resolution;
  const w = config.cols * config.size;
  const h = config.rows * config.size;
  canvas.width = w * scale;
  canvas.height = h * scale;

  const img = new Image();
  const svgBlob = new Blob([str], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  img.onload = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const pngUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");

    // Fix the interpolation here
    a.download = `circuit-${scale}x.png`;
    a.href = pngUrl;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

function toggleTilePreview() {
  const preview = document.getElementById("tile-preview");
  const inner = document.getElementById("tile-preview-inner");

  if (preview.classList.contains("active")) {
    preview.classList.remove("active");
    return;
  }

  // Generate data URL from current SVG
  const s = new XMLSerializer();
  const str = s.serializeToString(svgEl);

  const svgBlob = new Blob([str], {
    type: "image/svg+xml;charset=utf-8" });

  const url = URL.createObjectURL(svgBlob);

  inner.style.backgroundImage = `url("${url}")`;

  inner.style.backgroundSize = `$ {
   config.cols * config.size
 }

 px $ {
   config.rows * config.size
 }

 px`;
  preview.classList.add("active");
}

function closeTilePreview() {
  document.getElementById("tile-preview").classList.remove("active");
}

/**
 * --- EVENTS ---
 */
// Inputs
[
"inp-cols",
"inp-rows",
"inp-size",
"inp-density",
"inp-noise",
"inp-speed"].
forEach(id => {
  document.getElementById(id).addEventListener("input", e => {
    // Update display text
    let spanId = id.replace("inp", "val");
    let span = document.getElementById(spanId);
    if (span) span.innerText = e.target.value;

    // Restart if grid/algo params change (speed doesn't need restart)
    if (id !== "inp-speed") init();else
    config.steps = parseInt(e.target.value);
  });
});

// Colors (Update live without reset)
["col-bg", "col-trace", "col-pad"].forEach(id => {
  document.getElementById(id).addEventListener("input", e => {
    config.cBg = document.getElementById("col-bg").value;
    config.cTrace = document.getElementById("col-trace").value;
    config.cPad = document.getElementById("col-pad").value;
    // Apply immediately
    if (svgEl) svgEl.style.backgroundColor = config.cBg;
    if (rectBg) rectBg.setAttribute("fill", config.cBg);
    if (groupTraces) groupTraces.setAttribute("stroke", config.cTrace);

    if (groupPads) {
      // For pads we need to find children and update
      // This is slightly expensive so we just let the next render frame handle it
      // but force background color on inner circles now?
    }
  });
});

// Resolution slider
document.getElementById("inp-resolution").addEventListener("input", e => {
  config.resolution = parseInt(e.target.value);
  document.getElementById("val-resolution").innerText = config.resolution + "x";
});

document.getElementById("btn-generate").addEventListener("click", init);
document.getElementById("btn-svg").addEventListener("click", exportSVG);
document.getElementById("btn-png").addEventListener("click", exportPNG);
document.
getElementById("btn-tile").
addEventListener("click", toggleTilePreview);
document.
getElementById("tile-preview-close").
addEventListener("click", closeTilePreview);

// Escape key to close tile preview
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeTilePreview();
});

// Start
init();