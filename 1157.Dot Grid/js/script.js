(() => {
  const cv  = document.getElementById('cv');
  const ctx = cv.getContext('2d');

  const COLS      = 9;
  const ROWS      = 9;
  const SPACING   = 56;
  const BASE_R    = 12;
  const SPRING_K  = 0.09;
  const DAMP      = 0.78;
  const GRAVITY_R   = 210; // gravity influence radius
  const GRAVITY_MAX = 20;  // max px dots are displaced from rest toward cursor

  // drop-wave constants
  const ROW_DELAY  = 0.055; // seconds for impulse to travel one row down
  const BOUNCE_AMP = 12;    // max vertical displacement in px
  const DECAY      = 4.2;   // envelope decay rate (higher = shorter bounce)
  const FREQ       = 13.0;  // bounce oscillation in rad/s
  const COL_SPREAD = 0.65;  // lateral gaussian falloff (higher = tighter column)

  let W, H, dots, t = 0;
  const mouse = { x: -9999, y: -9999, on: false };
  let drops = [];
  let nextDropAt = 0.6; // first drop shortly after load

  // ── setup ───────────────────────────────────────────────────────────────

  function resize() {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
    buildGrid();
  }

  function buildGrid() {
    const ox = (W - (COLS - 1) * SPACING) / 2;
    const oy = (H - (ROWS - 1) * SPACING) / 2;
    dots = [];
    for (let ri = 0; ri < ROWS; ri++)
      for (let ci = 0; ci < COLS; ci++) {
        const bx = ox + ci * SPACING;
        const by = oy + ri * SPACING;
        dots.push({ bx, by, x: bx, y: by, vx: 0, vy: 0, r: BASE_R, col: ci, row: ri });
      }
  }

  // ── physics ──────────────────────────────────────────────────────────────

  function spawnDrop() {
    drops.push({
      col: Math.floor(Math.random() * COLS),
      time: t,
      amp: BOUNCE_AMP * (0.7 + Math.random() * 0.55),
    });
    nextDropAt = t + 1.8 + Math.random() * 2.4;
  }

  function tick() {
    t += 0.016;

    if (t >= nextDropAt) spawnDrop();
    drops = drops.filter(d => (t - d.time) < 2.5);

    for (const d of dots) {
      let tx = d.bx;
      let ty = d.by;
      let tr = BASE_R;

      // accumulate active drop impulses — wave travels row by row downward,
      // spreading with gaussian falloff to neighbouring columns
      for (const drop of drops) {
        const localT = (t - drop.time) - d.row * ROW_DELAY;
        if (localT <= 0) continue;
        const colDist = Math.abs(d.col - drop.col);
        const lateral = Math.exp(-(colDist ** 2) * COL_SPREAD);
        if (lateral < 0.01) continue;
        ty += drop.amp * Math.exp(-DECAY * localT) * Math.sin(FREQ * localT) * lateral;
      }

      // gravity well: nudges dots toward cursor from their rest position,
      // additive on top of the drop wave so both effects coexist
      if (mouse.on) {
        const dx   = mouse.x - d.bx;
        const dy   = mouse.y - d.by;
        const dist = Math.hypot(dx, dy);
        if (dist < GRAVITY_R && dist > 1) {
          const pull = (1 - dist / GRAVITY_R) ** 2;
          const off  = pull * GRAVITY_MAX;
          tx += (dx / dist) * off;
          ty += (dy / dist) * off;
          tr  = BASE_R * (1 + pull * 0.22);
        }
      }

      d.vx += (tx - d.x) * SPRING_K;
      d.vy += (ty - d.y) * SPRING_K;
      d.vx *= DAMP;
      d.vy *= DAMP;
      d.x  += d.vx;
      d.y  += d.vy;
      d.r  += (tr - d.r) * 0.10;
    }
  }

  // ── render ───────────────────────────────────────────────────────────────

  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#fff';
    for (const d of dots) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── events ───────────────────────────────────────────────────────────────

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true;
  });
  window.addEventListener('mouseleave', () => { mouse.on = false; });

  window.addEventListener('touchmove', e => {
    e.preventDefault();
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
    mouse.on = true;
  }, { passive: false });
  window.addEventListener('touchend',   () => { mouse.on = false; });

  window.addEventListener('resize', resize);
  resize(); // must run before loop so dots is populated

  // ── loop ─────────────────────────────────────────────────────────────────

  (function loop() { tick(); draw(); requestAnimationFrame(loop); })();
})();