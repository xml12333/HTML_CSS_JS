(() => {
  const root = document.documentElement;
  const body = document.body;
  const size = document.getElementById('size');
  const speed = document.getElementById('speed');
  const accent = document.getElementById('accent');
  const pauseBtn = document.getElementById('pause');
  const themeBtn = document.getElementById('theme');

  // init from controls -> CSS vars
  root.style.setProperty('--size', size.value + 'px');
  root.style.setProperty('--speed', speed.value);
  root.style.setProperty('--accent', accent.value);

  size.addEventListener('input', e => {
    root.style.setProperty('--size', e.target.value + 'px');
  });
  speed.addEventListener('input', e => {
    root.style.setProperty('--speed', e.target.value);
  });
  accent.addEventListener('input', e => {
    root.style.setProperty('--accent', e.target.value);
  });

  // Pause / Resume all animations
  pauseBtn.addEventListener('click', () => {
    const paused = body.getAttribute('data-paused') === 'true';
    body.setAttribute('data-paused', paused ? 'false' : 'true');
    pauseBtn.setAttribute('aria-pressed', paused ? 'false' : 'true');
    pauseBtn.textContent = paused ? 'Pause' : 'Resume';
  });

  // Theme toggle
  themeBtn.addEventListener('click', () => {
    const light = body.classList.toggle('light');
    themeBtn.textContent = light ? 'Light' : 'Dark';
  });

  // ---------- Infinity (SVG) — JS-driven dash animation ----------
  (function setupInfinity(){
    const path =
      document.querySelector('.infinity .loop') || // preferred (if you used class="loop")
      document.querySelector('.infinity path');    // fallback to any path in the block
    if (!path) return;

    // true path length in user units (viewBox space)
    const L = path.getTotalLength();

    // one visible dash (≈24% of path) + gap covering the rest
    const dash = 0.24 * L;
    path.style.strokeDasharray = `${dash} ${L}`;
    path.style.strokeDashoffset = '0';

    const mqlReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let off = 0;
    let last = performance.now();

    const getSpeedMul = () => {
      const s = parseFloat(getComputedStyle(root).getPropertyValue('--speed'));
      return (Number.isFinite(s) && s > 0) ? s : 1;
    };

    function frame(t){
      const dt = (t - last) / 1000; // seconds
      last = t;

      const paused = body.getAttribute('data-paused') === 'true';
      if (!paused && !mqlReduce.matches){
        // one full loop time = 1.6s / speed
        const duration = 1.6 / getSpeedMul(); // seconds per cycle
        const v = L / duration;               // px per second along path
        off -= v * dt;                        // move dash forward
        if (off < -L) off += L;               // keep offset bounded
        path.style.strokeDashoffset = String(off);
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  })();
})();