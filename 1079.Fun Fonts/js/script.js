const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const on = (el, type, handler) => el === null || el === void 0 ? void 0 : el.addEventListener(type, handler);
const random = (min, max) => Math.random() * (max - min) + min;

const sleep = (ms, signal) =>
new Promise((res, rej) => {
  const timer = setTimeout(res, ms);
  signal === null || signal === void 0 ? void 0 : signal.addEventListener('abort', () => {
    clearTimeout(timer);
    rej(new DOMException('Aborted', 'AbortError'));
  });
});

const navButtons = $$('nav button');
const stages = $$('.stage');

const setActive = (elements, activeEl) =>
elements.forEach(el => el.classList.toggle('active', el === activeEl));

navButtons.forEach((btn) =>
on(btn, 'click', () => {
  if (btn.classList.contains('active')) return;

  const updateDOM = () => {
    setActive(navButtons, btn);
    setActive(stages, $(`#${btn.dataset.stage}`));
  };

  document.startViewTransition ?
  document.startViewTransition(updateDOM) :
  updateDOM();
}));


const magLetters = $$('#magnetic span:not(.space)');

on(document, 'mousemove', ({ clientX, clientY }) => {
  magLetters.forEach(el => {
    const { left, top, width, height } = el.getBoundingClientRect();
    const dx = clientX - (left + width / 2);
    const dy = clientY - (top + height / 2);
    const dist = Math.hypot(dx, dy);
    const intensity = Math.max(0, (90 - dist) / 90);

    if (intensity > 0) {
      const xPercent = -dx * intensity * 100 / width;
      const yPercent = -dy * intensity * 100 / height;
      const scale = 1 + intensity * 0.2;

      el.style.transform = `translate(${xPercent}%, ${yPercent}%) scale(${scale})`;
      el.style.filter = `brightness(${1 + intensity * 0.7})`;
    } else {
      el.style.transform = '';
      el.style.filter = '';
    }
  });
});

const createGlitcher = el => {
  let timer;
  let idleTimer;
  let isHovered = false;

  const trigger = ms => {
    el.classList.add('glitching');
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove('glitching'), ms);
  };

  const scheduleIdleGlitch = () => {
    clearTimeout(idleTimer);
    if (!isHovered) return;

    idleTimer = setTimeout(() => {
      if (isHovered) {
        trigger(random(80, 220));
        scheduleIdleGlitch();
      }
    }, random(600, 2200));
  };

  el.addEventListener('mouseenter', () => {
    isHovered = true;
    trigger(400);
    scheduleIdleGlitch();
  });

  el.addEventListener('mouseleave', () => {
    isHovered = false;
    clearTimeout(idleTimer);
  });

  return trigger;
};

const glitchEl = $('#glitch');
const triggerGlitch = createGlitcher(glitchEl);

on(glitchEl, 'click', () => {
  triggerGlitch(700);

  const randomizedText = glitchEl.textContent.
  split('').
  map(c => Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()).
  join('');

  glitchEl.textContent = randomizedText;
  glitchEl.dataset.text = randomizedText;
});

const waveEl = $('#wave');
const waveSpans = $$('span', waveEl);

const triggerWave = () => {
  waveEl.classList.remove('animate');
  void waveEl.offsetWidth;

  waveSpans.forEach((s, i) => {
    s.style.animationDelay = `${i * 62}ms`;
  });

  waveEl.classList.add('animate');
};

on(document, 'click', triggerWave);
setTimeout(triggerWave, 500);

const COLORS = [
'oklch(75% 0.25 330)',
'oklch(85% 0.20 85)',
'oklch(85% 0.15 200)',
'oklch(75% 0.22 35)',
'oklch(85% 0.18 150)',
'oklch(80% 0.20 290)',
'oklch(82% 0.18 60)',
'oklch(86% 0.12 240)'];


const canvas = $('#particle-canvas');
const ctx = canvas === null || canvas === void 0 ? void 0 : canvas.getContext('2d');
const pText = $('#particle-text');
let particles = [];

const resizeCanvas = () => {
  if (!canvas) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

const spawnConfetti = (originX, originY, count = 80) => {
  const fromTop = originY / window.innerHeight;
  const biasY = (fromTop - 0.5) * -14;

  Array.from({ length: count }, () => {
    const angle = random(-Math.PI, 0);
    const speed = random(5, 18);
    const spread = random(-1, 1) * Math.PI * 0.55;
    const shape = Math.random();

    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle + spread) * speed * random(0.6, 1.4),
      vy: Math.sin(angle + spread) * speed + biasY - random(2, 6),
      w: random(7, 32),
      h: random(3, 14),
      color: COLORS[Math.floor(random(0, COLORS.length))],
      alpha: 1,
      decay: random(0.006, 0.018),
      rot: random(0, Math.PI * 2),
      rotSpeed: random(-0.22, 0.22),
      wobble: random(0, Math.PI * 2),
      wobbleSpeed: random(0.05, 0.12),
      wobbleAmp: random(0.8, 2.5),
      shape: shape < 0.45 ? 0 : shape < 0.72 ? 1 : shape < 0.88 ? 2 : 3 });

  });
};

const drawConfettiPiece = p => {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.globalAlpha = Math.max(0, p.alpha);
  ctx.fillStyle = p.color;

  const scaleY = Math.abs(Math.cos(p.wobble)) || 0.05;

  if (p.shape === 0) {
    ctx.scale(1, scaleY);
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
  } else if (p.shape === 1) {
    ctx.scale(1, scaleY);
    ctx.fillRect(-p.w * 0.8, -p.h * 0.4, p.w * 1.6, p.h * 0.8);
  } else if (p.shape === 2) {
    ctx.beginPath();
    ctx.arc(0, 0, p.h, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.scale(1, scaleY);
    ctx.beginPath();
    ctx.moveTo(0, -p.h);
    ctx.lineTo(p.h * 0.866, p.h * 0.5);
    ctx.lineTo(-p.h * 0.866, p.h * 0.5);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
};

const drawFrame = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles = particles.filter(
  p => p.alpha > 0 && p.y < canvas.height + 80);


  for (const p of particles) {
    p.wobble += p.wobbleSpeed;
    p.x += p.vx + Math.sin(p.wobble) * p.wobbleAmp;
    p.y += p.vy;
    p.vy += 0.28;
    p.vx *= 0.99;
    p.rot += p.rotSpeed;
    p.alpha -= p.decay;

    drawConfettiPiece(p);
  }

  requestAnimationFrame(drawFrame);
};

if (canvas && pText) {
  resizeCanvas();
  drawFrame();
  on(window, 'resize', resizeCanvas);

  on(pText, 'click', ({ clientX, clientY }) => {
    spawnConfetti(clientX, clientY, 90);

    const { left, top, width, height } =
    pText.getBoundingClientRect();

    spawnConfetti(left + width / 2, top + height / 2, 50);
  });
}

on($('.flip-wrap'), 'click', async ({ target }) => {
  if (target.tagName !== 'SPAN' || !target.textContent.trim()) return;

  target.animate(
  [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }],
  { duration: 150, easing: 'ease-in' });


  await sleep(150);

  target.textContent =
  target.textContent === target.textContent.toUpperCase() ?
  target.textContent.toLowerCase() :
  target.textContent.toUpperCase();

  target.animate(
  [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }],
  { duration: 150, easing: 'ease-out' });

});

on(document, 'click', ({ target }) => {
  if (
  target.tagName !== 'SPAN' ||
  !target.textContent.trim() ||
  target.closest('.flip-wrap') ||
  target.id === 'type-text' ||
  target.classList.contains('cursor'))

  return;

  target.textContent =
  target.textContent === target.textContent.toUpperCase() ?
  target.textContent.toLowerCase() :
  target.textContent.toUpperCase();
});

const typeEl = $('#type-text');
const typeWrap = typeEl === null || typeEl === void 0 ? void 0 : typeEl.parentElement;

const MSG = 'Dream Big';

let typeController = new AbortController();

const cancelTyping = () => {
  typeController.abort();
  typeController = new AbortController();
  return typeController.signal;
};

const flashSelection = async (signal, duration = 120) => {
  if (!typeWrap) return;
  typeWrap.classList.add('selecting');
  await sleep(duration, signal);
  typeWrap.classList.remove('selecting');
};

const writeText = async (text, speed, signal) => {
  for (let i = 0; i <= text.length; i++) {
    typeEl.textContent = text.slice(0, i);
    await sleep(speed, signal);
  }
};

const eraseText = async (speed, signal) => {
  while (typeEl.textContent.length > 0) {
    typeEl.textContent = typeEl.textContent.slice(0, -1);
    await sleep(speed, signal);
  }
};

const executeTask = taskFn => async () => {
  try {
    await taskFn(cancelTyping());
  } catch (err) {
    if (err.name !== 'AbortError') throw err;
  }
};

on($('#btn-type'), 'click', executeTask(async signal => {
  typeEl.textContent = '';
  await writeText(MSG, 90, signal);
}));

on($('#btn-erase'), 'click', executeTask(async signal => {
  if (!typeEl.textContent) return;
  await flashSelection(signal, 110);
  await eraseText(60, signal);
}));

on($('#btn-loop'), 'click', executeTask(async signal => {
  typeEl.textContent = '';

  while (true) {
    await writeText(MSG, 80, signal);
    await sleep(900, signal);
    await flashSelection(signal, 110);
    await eraseText(80, signal);
  }
}));