import gsap from "https://cdn.skypack.dev/gsap@3.13.0";
import Draggable from "https://cdn.skypack.dev/gsap@3.13.0/Draggable";
import { Pane } from "https://cdn.skypack.dev/tweakpane@4.0.4";
gsap.registerPlugin(Draggable);
const card = document.getElementById('card');


// ----- utilities -------------------------------------------------------------
const buildMarkup = () => {
  card.innerHTML = `
    <div class="corners">
      <span class="c tl">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </span>
      <span class="c tr">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </span>
      <span class="c bl">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </span>
      <span class="c br">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </span>
    </div>
    <!-- cells -->
    ${new Array(64).fill(0).map((_, i) => `
      <div>
        <div>
          <div class="cuboid">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    `).join('')}
    <div class="readout" id="readout">u: 0.00, v: 0.00</div>
  `;
};
buildMarkup();
const readout = document.getElementById('readout');
/**
 * Measure the 4 projected (screen-space) corners of the transformed element.
 * We get this by placing 4 zero-size absolutely-positioned children at the
 * corners of the *untransformed* local box (0,0), (1,0), (0,1), (1,1) and
 * reading their client rects after CSS transforms are applied.
 *
 * @param {HTMLElement} el - the .card element
 * @returns {{p00:{x:number,y:number}, p10:{x:number,y:number}, p01:{x:number,y:number}, p11:{x:number,y:number}}}
 */
function getProjectedCorners(el) {
  const q = sel => el.querySelector(sel).getBoundingClientRect();
  const tl = q('.tl'); // (0,0)
  const tr = q('.tr'); // (1,0)
  const bl = q('.bl'); // (0,1)
  const br = q('.br'); // (1,1)

  // left/top are fine because the corner markers are 0×0 size
  return {
    p00: { x: tl.left, y: tl.top },
    p10: { x: tr.left, y: tr.top },
    p01: { x: bl.left, y: bl.top },
    p11: { x: br.left, y: br.top } };

}

/**
 * Convert a screen-space point (mouse) to local UV on the original square.
 * Works for isometric/orthographic transforms (no CSS perspective).
 *
 * The projection is affine:
 *   p = p00 + u*(p10 - p00) + v*(p01 - p00)
 * Solve the 2×2 linear system for (u, v).
 *
 * @param {{x:number,y:number}} p  - screen-space point
 * @param {{p00,p10,p01}} corners  - projected corners from getProjectedCorners
 * @returns {{u:number,v:number}}   - unbounded UV (can be <0 or >1)
 */
function uvFromScreenPoint(p, corners) {
  const { p00, p10, p01 } = corners;

  // basis vectors of the projected parallelogram
  const ax = p10.x - p00.x,
  ay = p10.y - p00.y; // U axis
  const bx = p01.x - p00.x,
  by = p01.y - p00.y; // V axis

  // vector from p00 to mouse
  const px = p.x - p00.x,
  py = p.y - p00.y;

  // 2×2 determinant
  const det = ax * by - ay * bx;
  if (Math.abs(det) < 1e-8) return { u: NaN, v: NaN }; // degenerate

  // Cramer's rule
  const u = (px * by - py * bx) / det;
  const v = (ax * py - ay * px) / det;

  return { u, v };
}
const cells = Array.from(card.querySelectorAll('& > div:not([class])'));
// ---- easings ---------------------------------------------------------------
// t is in [0..1]. Return a value in [0..1].

const Easings = {
  linear: t => t,
  // A nice alternative: gentle, fast-start/slow-end falloff
  easeOutQuad: t => 1 - (1 - t) * (1 - t)
  // bonus (if you want something even smoother):
  // smoothstep: t => t * t * (3 - 2 * t),
};

/**
 * Map a pixel distance to a normalized falloff (1..0) with inner/outer radii.
 * - distPx <= rMin  -> 1
 * - distPx >= rMax  -> 0
 * - in between      -> 1 - ease( (dist - rMin)/(rMax - rMin) )
 */
function radialFalloff(distPx, rMinPx, rMaxPx, ease = Easings.linear) {
  if (distPx <= rMinPx) return 1;
  if (distPx >= rMaxPx) return 0;

  const t = (distPx - rMinPx) / (rMaxPx - rMinPx); // 0..1 across the ring
  return 1 - ease(t); // invert so 1 at inner edge → 0 at outer edge
}

/**
 * Compute distance + normalized falloff for every cell center.
 * @param {number} u         pointer U
 * @param {number} v         pointer V
 * @param {number} cols      grid columns
 * @param {number} rows      grid rows
 * @param {number} sizePx    square size in pixels (1 UV == sizePx)
 * @param {object}  opt
 *   - rMinPx  (default 0)   inner radius with full value
 *   - rMaxPx  (default 100) outer radius where value reaches 0
 *   - ease    (default Easings.linear) easing function over [0..1]
 * @returns Array of { i, j, distPx, value }
 */
function distanceToCellCenters(u, v, cols, rows, sizePx, opt = {}) {var _opt$rMinPx, _opt$rMaxPx, _opt$ease;
  const rMinPx = (_opt$rMinPx = opt.rMinPx) !== null && _opt$rMinPx !== void 0 ? _opt$rMinPx : 0;
  const rMaxPx = (_opt$rMaxPx = opt.rMaxPx) !== null && _opt$rMaxPx !== void 0 ? _opt$rMaxPx : 100;
  const ease = (_opt$ease = opt.ease) !== null && _opt$ease !== void 0 ? _opt$ease : Easings.linear;

  // const out = []

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const index = j * 8 + i;
      const cellU = (i + 0.5) / cols;
      const cellV = (j + 0.5) / rows;

      const du = u - cellU;
      const dv = v - cellV;

      // UV distance -> px distance
      const distPx = Math.hypot(du, dv) * sizePx;

      // 1 inside rMin, falloff to 0 by rMax (with easing)
      const value = radialFalloff(distPx, rMinPx, rMaxPx, ease);
      // cells[index].innerText = value.toFixed(2)
      cells[index].dataset.proximity = value.toFixed(2);
      cells[index].style.setProperty('--proximity', value.toFixed(2));
      // out.push({ i, j, distPx, value })
    }
  }

  // return out
}

// cache of the current corner measurement
let corners = getProjectedCorners(card);

const config = {
  theme: 'system',
  reveal: false,
  width: 300,
  height: 300,
  x1: -24,
  y1: 32,
  x2: 90,
  uvX: 0.00,
  uvY: 0.00,
  proximityMin: 10,
  proximityMax: 130,
  ease: 'power2.inOut' };


const ctrl = new Pane({
  title: 'config',
  expanded: true });


const update = () => {
  document.documentElement.dataset.theme = config.theme;
  document.documentElement.dataset.reveal = config.reveal;
  document.documentElement.style.setProperty('--height', config.height);
  document.documentElement.style.setProperty('--width', config.width);
  document.documentElement.style.setProperty('--x1', config.x1);
  document.documentElement.style.setProperty('--y1', config.y1);
  document.documentElement.style.setProperty('--x2', config.x2);
  corners = getProjectedCorners(card);
};

const sync = event => {
  if (
  !document.startViewTransition ||
  event.target.controller.view.labelElement.innerText !== 'theme')

  return update();
  document.startViewTransition(() => update());
};

const size = ctrl.addFolder({ title: 'size', expanded: false });
size.addBinding(config, 'height', {
  min: 100,
  max: 500,
  step: 1 });

size.addBinding(config, 'width', {
  min: 100,
  max: 500,
  step: 1 });


const rotation = ctrl.addFolder({ title: 'rotation', expanded: false });
rotation.addBinding(config, 'x1', {
  min: -90,
  max: 90,
  step: 1 });

rotation.addBinding(config, 'y1', {
  min: -90,
  max: 90,
  step: 1 });

rotation.addBinding(config, 'x2', {
  min: -90,
  max: 90,
  step: 1 });

const proximity = ctrl.addFolder({ title: 'proximity', expanded: false });
proximity.addBinding(config, 'proximityMin', {
  min: 0,
  max: 100,
  step: 1 });

proximity.addBinding(config, 'proximityMax', {
  min: 0,
  max: 300,
  step: 1 });


const misc = ctrl.addFolder({ title: 'misc', expanded: false });

misc.addBinding(config, 'ease', {
  label: 'ease (gsap)' });


ctrl.addBinding(config, 'reveal').on('change', () => {
  document.querySelector('.arrow').style.opacity = 0;
});
misc.addBinding(config, 'uvX', {
  min: -1,
  max: 2,
  step: 0.01,
  disabled: true,
  label: 'u' });

misc.addBinding(config, 'uvY', {
  min: -1,
  max: 2,
  step: 0.01,
  disabled: true,
  label: 'v' });

misc.addBinding(config, 'theme', {
  label: 'theme',
  options: {
    system: 'system',
    light: 'light',
    dark: 'dark' } });



ctrl.on('change', sync);
update();

// make tweakpane panel draggable
const tweakClass = 'div.tp-dfwv';
const d = Draggable.create(tweakClass, {
  type: 'x,y',
  allowEventDefault: true,
  trigger: tweakClass + ' button.tp-rotv_b' });

document.querySelector(tweakClass).addEventListener('dblclick', () => {
  gsap.to(tweakClass, {
    x: `+=${d[0].x * -1}`,
    y: `+=${d[0].y * -1}`,
    onComplete: () => {
      gsap.set(tweakClass, { clearProps: 'all' });
    } });

});

// want to just do this anywhere, do it here
document.body.addEventListener('pointermove', e => {
  const p = { x: e.clientX, y: e.clientY };
  const { u, v } = uvFromScreenPoint(p, corners);

  const sizePx = card.offsetWidth;
  distanceToCellCenters(u, v, 8, 8, sizePx, {
    rMinPx: config.proximityMin,
    rMaxPx: config.proximityMax,
    ease: gsap.parseEase(config.ease)
    // ease: Easings.easeOutQuad, // try Easings.linear or .smoothstep too
    // ease: Easings.linear,
  });

  // console.table(cells) // for demo
  // no clamping: report raw values (can be <0 or >1)
  readout.textContent = `u: ${u.toFixed(2)}, v: ${v.toFixed(2)}`;
  config.uvX = u.toFixed(2);
  config.uvY = v.toFixed(2);
  ctrl.refresh();
});

update();