/* ============================================================
   Potion Wheel — behaviour
   JS owns state and data. CSS owns nearly all of the motion.
   ============================================================ */

const SVG_NS = "http://www.w3.org/2000/svg";

const CX = 200,
  CY = 200; // centre of the 400-unit viewBox
const R_OUT = 140,
  R_IN = 92; // donut band
const R_POINT_A = 146,
  R_POINT_B = 155,
  R_GEM = 163;
const GAP = 1.4; // degrees of metal between slices
const LIFT = 9; // how far an active slice steps outward

/* ── Ingredients ───────────────────────────────────────────── */

const ingredients = [
  {
    id: "moonwater",
    name: "Moonwater",
    base: 22,
    affinity: "Lunar",
    effect: "Calm +4",
    volatility: "Low",
    description: "Skimmed off a still pool on the third night of a full moon.",
    particle: "drop",
    profile: { clarity: 0.55, energy: 0.2, focus: 0.6, volatility: 0.18 }
  },
  {
    id: "stardust",
    name: "Stardust",
    base: 18,
    affinity: "Celestial",
    effect: "Clarity +4",
    volatility: "Moderate",
    description: "Swept from the trail of a star that fell somewhere impolite.",
    particle: "star",
    profile: { clarity: 0.95, energy: 0.6, focus: 0.7, volatility: 0.4 }
  },
  {
    id: "nightshade",
    name: "Nightshade",
    base: 16,
    affinity: "Umbral",
    effect: "Focus +5",
    volatility: "High",
    description: "Cut at dusk, handled with gloves, argued with afterwards.",
    particle: "mist",
    profile: { clarity: 0.3, energy: 0.4, focus: 0.85, volatility: 0.72 }
  },
  {
    id: "dragonscale",
    name: "Dragon Scale",
    base: 17,
    affinity: "Draconic",
    effect: "Energy +6",
    volatility: "Severe",
    description: "Shed, not taken. The distinction matters to the dragon.",
    particle: "spark",
    profile: { clarity: 0.2, energy: 1, focus: 0.3, volatility: 0.92 }
  },
  {
    id: "emberroot",
    name: "Ember Root",
    base: 15,
    affinity: "Kindled",
    effect: "Warmth +3",
    volatility: "Moderate",
    description: "Still warm when you dig it up, which nobody has explained.",
    particle: "ember",
    profile: { clarity: 0.3, energy: 0.8, focus: 0.4, volatility: 0.58 }
  },
  {
    id: "crystaldust",
    name: "Crystal Dust",
    base: 12,
    affinity: "Prismatic",
    effect: "Insight +5",
    volatility: "Low",
    description: "Ground from a geode that hums faintly in E flat.",
    particle: "diamond",
    profile: { clarity: 0.8, energy: 0.3, focus: 0.9, volatility: 0.26 }
  }
];

const POTION_NAMES = {
  "moonwater+stardust": "Celestial Focus",
  "moonwater+nightshade": "Nightglass Serum",
  "moonwater+dragonscale": "Moonfire Elixir",
  "moonwater+emberroot": "Tidal Ember",
  "moonwater+crystaldust": "Crystal Reverie",
  "stardust+nightshade": "Violet Wake",
  "stardust+dragonscale": "Solar Cinder",
  "stardust+emberroot": "Starroot Tonic",
  "stardust+crystaldust": "Astral Bloom",
  "nightshade+dragonscale": "Wyrmshade Draught",
  "nightshade+emberroot": "Emberveil",
  "nightshade+crystaldust": "Shadeprism Serum",
  "dragonscale+emberroot": "Forge Heart",
  "dragonscale+crystaldust": "Prism Wyrm",
  "emberroot+crystaldust": "Hearthglass Tonic"
};

const SIDE_EFFECTS = {
  moonwater: "Mild urge to explain tides to strangers.",
  stardust: "May cause excessive confidence in unfinished side projects.",
  nightshade: "Shadows briefly answer to you. They get bored of it.",
  dragonscale: "Warm to the touch for a week. Insurance will not cover this.",
  emberroot: "Everything you cook for a month tastes faintly of autumn.",
  crystaldust: "You will hear E flat everywhere. Sorry."
};

/* ── Element handles ───────────────────────────────────────── */

const root = document.documentElement;
const el = {
  defs: document.getElementById("chart-defs"),
  shade: document.getElementById("chart-shade"),
  segments: document.getElementById("chart-segments"),
  pointers: document.getElementById("chart-pointers"),
  labels: document.getElementById("labels"),
  runesOuter: document.getElementById("runes-outer"),
  runesInner: document.getElementById("runes-inner"),
  cardinals: document.getElementById("cardinals"),
  motes: document.getElementById("motes"),
  burst: document.getElementById("burst"),
  stage: document.getElementById("stage"),
  brew: document.getElementById("brew"),
  brewLabel: document.querySelector(".brew__label"),
  brewNote: document.getElementById("brew-note"),
  live: document.getElementById("live"),
  table: document.querySelector("#data-table tbody"),
  ing: {
    name: document.getElementById("ing-name"),
    value: document.getElementById("ing-value"),
    desc: document.getElementById("ing-desc"),
    affinity: document.getElementById("ing-affinity"),
    effect: document.getElementById("ing-effect"),
    volatility: document.getElementById("ing-volatility")
  },
  potion: {
    name: document.getElementById("potion-name"),
    stats: document.getElementById("potion-stats"),
    side: document.getElementById("potion-side")
  },
  core: {
    value: document.getElementById("core-value"),
    name: document.getElementById("core-name")
  },
  history: document.getElementById("history"),
  historyWrap: document.getElementById("history-wrap")
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

const state = {
  values: ingredients.map((i) => i.base),
  locked: "stardust",
  hovered: null,
  brewing: false,
  history: []
};

const segNodes = new Map();
const pointerNodes = new Map();
const labelNodes = new Map();

/* ── Geometry ──────────────────────────────────────────────── */

const rad = (deg) => ((deg - 90) * Math.PI) / 180;
const px = (r, deg) => [
  CX + r * Math.cos(rad(deg)),
  CY + r * Math.sin(rad(deg))
];
const round = (n) => Math.round(n * 100) / 100;

function arcPath(start, end) {
  const inset = Math.min(GAP / 2, Math.max(0, (end - start) / 2 - 0.2));
  const a = start + inset;
  const b = end - inset;
  const [x1, y1] = px(R_OUT, a);
  const [x2, y2] = px(R_OUT, b);
  const [x3, y3] = px(R_IN, b);
  const [x4, y4] = px(R_IN, a);
  const large = b - a > 180 ? 1 : 0;
  return [
    `M${round(x1)} ${round(y1)}`,
    `A${R_OUT} ${R_OUT} 0 ${large} 1 ${round(x2)} ${round(y2)}`,
    `L${round(x3)} ${round(y3)}`,
    `A${R_IN} ${R_IN} 0 ${large} 0 ${round(x4)} ${round(y4)}`,
    "Z"
  ].join(" ");
}

/** angles for the current values, one entry per ingredient */
function angles() {
  const total = state.values.reduce((a, b) => a + b, 0) || 1;
  let cursor = 0;
  return state.values.map((v) => {
    const span = (v / total) * 360;
    const seg = { start: cursor, end: cursor + span, mid: cursor + span / 2 };
    cursor += span;
    return seg;
  });
}

/* ── Build the chart once ──────────────────────────────────── */

function buildDefs() {
  const gloss = document.createElementNS(SVG_NS, "linearGradient");
  gloss.id = "gloss";
  gloss.setAttribute("x1", "12%");
  gloss.setAttribute("y1", "0%");
  gloss.setAttribute("x2", "78%");
  gloss.setAttribute("y2", "100%");
  gloss.innerHTML = `
    <stop offset="0"    stop-color="#fff" stop-opacity="0.26"/>
    <stop offset="0.34" stop-color="#fff" stop-opacity="0.05"/>
    <stop offset="0.62" stop-color="#000" stop-opacity="0.18"/>
    <stop offset="1"    stop-color="#fff" stop-opacity="0.09"/>`;
  el.defs.appendChild(gloss);

  ingredients.forEach((ing) => {
    const g = document.createElementNS(SVG_NS, "radialGradient");
    g.id = `enamel-${ing.id}`;
    g.setAttribute("gradientUnits", "userSpaceOnUse");
    g.setAttribute("cx", CX);
    g.setAttribute("cy", CY);
    g.setAttribute("r", R_OUT);
    g.innerHTML = `
      <stop offset="0.56" stop-color="var(--ing-${ing.id})"/>
      <stop offset="0.76" stop-color="var(--ing-${ing.id})" stop-opacity="0.92"/>
      <stop offset="0.93" stop-color="var(--ing-${ing.id}-deep)"/>
      <stop offset="1"    stop-color="#0a0913" stop-opacity="0.92"/>`;
    el.defs.appendChild(g);
  });
}

function buildChart() {
  ingredients.forEach((ing) => {
    const shade = document.createElementNS(SVG_NS, "path");
    shade.setAttribute("transform", "translate(0 4)");
    el.shade.appendChild(shade);

    const seg = document.createElementNS(SVG_NS, "path");
    seg.setAttribute("class", "seg");
    seg.setAttribute("fill", `url(#enamel-${ing.id})`);
    seg.setAttribute("tabindex", "0");
    seg.setAttribute("role", "button");
    seg.setAttribute("aria-pressed", "false");
    seg.dataset.id = ing.id;
    seg.style.setProperty("--seg-color", `var(--ing-${ing.id})`);
    const title = document.createElementNS(SVG_NS, "title");
    seg.appendChild(title);
    el.segments.appendChild(seg);

    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("class", "pointer");
    line.style.setProperty("--seg-color", `var(--ing-${ing.id})`);
    const gem = document.createElementNS(SVG_NS, "circle");
    gem.setAttribute("class", "pointer-gem");
    gem.setAttribute("r", "4.2");
    gem.style.setProperty("--seg-color", `var(--ing-${ing.id})`);
    el.pointers.append(line, gem);

    const label = document.createElement("button");
    label.type = "button";
    label.className = "label";
    label.tabIndex = -1;
    label.setAttribute("aria-hidden", "true");
    label.style.setProperty("--seg-color", `var(--ing-${ing.id})`);
    label.innerHTML =
      `<span class="label__name"><span class="label__glyph"></span>${ing.name}</span>` +
      `<span class="label__value"></span>`;
    label.addEventListener("click", () => toggleLock(ing.id));
    el.labels.appendChild(label);

    segNodes.set(ing.id, { seg, shade, title });
    pointerNodes.set(ing.id, { line, gem });
    labelNodes.set(ing.id, {
      root: label,
      value: label.querySelector(".label__value")
    });
  });

  // one sheet of glass across the whole band, so the highlight stays put
  const sheen = document.createElementNS(SVG_NS, "circle");
  sheen.setAttribute("class", "seg-gloss");
  sheen.setAttribute("cx", CX);
  sheen.setAttribute("cy", CY);
  sheen.setAttribute("r", (R_OUT + R_IN) / 2);
  sheen.setAttribute("fill", "none");
  sheen.setAttribute("stroke", "url(#gloss)");
  sheen.setAttribute("stroke-width", R_OUT - R_IN);
  el.pointers.appendChild(sheen);
}

function buildRunes() {
  const shapes = ["diamond", "star", "moon", "triangle", "bar", "ring"];

  const make = (host, count, radius, size) => {
    for (let i = 0; i < count; i++) {
      const rune = document.createElement("i");
      const owner = ingredients[i % ingredients.length];
      rune.className = `rune rune--${shapes[i % shapes.length]}`;
      rune.dataset.owner = owner.id;
      const a = (360 / count) * i;
      rune.style.setProperty("--cx", round(Math.cos(rad(a))));
      rune.style.setProperty("--cy", round(Math.sin(rad(a))));
      rune.style.setProperty("--r", `${radius}%`);
      rune.style.setProperty("--rune-size", `${size}px`);
      host.appendChild(rune);
    }
  };

  make(el.runesOuter, 18, 39.5, 12);
  make(el.runesInner, 12, 20.5, 8);
}

function buildCardinals() {
  const points = [
    { key: "n", a: 0, label: "North gemstone" },
    { key: "e", a: 90, label: "East gemstone" },
    { key: "s", a: 180, label: "South gemstone" },
    { key: "w", a: 270, label: "West gemstone" }
  ];
  points.forEach((p) => {
    const gem = document.createElement("button");
    gem.type = "button";
    gem.className = "gem";
    gem.dataset.cardinal = p.key;
    gem.style.setProperty("--cx", round(Math.cos(rad(p.a))));
    gem.style.setProperty("--cy", round(Math.sin(rad(p.a))));
    gem.setAttribute("aria-label", p.label);
    gem.addEventListener("click", () => tapCardinal(p.key, gem));
    el.cardinals.appendChild(gem);
  });
}

function buildAmbient() {
  for (let i = 0; i < 18; i++) {
    const mote = document.createElement("i");
    mote.className = "mote mote--drift mote--dust";
    mote.style.setProperty("--px", `${Math.random() * 100}%`);
    mote.style.setProperty("--py", `${40 + Math.random() * 60}%`);
    mote.style.setProperty("--s", `${2 + Math.random() * 3}px`);
    mote.style.setProperty("--dur", `${9 + Math.random() * 9}s`);
    mote.style.setProperty("--delay", `${Math.random() * -14}s`);
    mote.style.setProperty("--dx", `${-40 + Math.random() * 80}px`);
    mote.style.setProperty("--peak", (0.22 + Math.random() * 0.4).toFixed(2));
    el.motes.appendChild(mote);
  }
}

/* ── Render ────────────────────────────────────────────────── */

function activeId() {
  return state.hovered || state.locked;
}

function ingredientById(id) {
  return ingredients.find((i) => i.id === id);
}

function renderSegments() {
  const segs = angles();
  const total = state.values.reduce((a, b) => a + b, 0) || 1;
  const active = activeId();

  ingredients.forEach((ing, i) => {
    const { start, end, mid } = segs[i];
    const d = arcPath(start, end);
    const share = Math.round((state.values[i] / total) * 100);
    const nodes = segNodes.get(ing.id);

    nodes.seg.setAttribute("d", d);
    nodes.shade.setAttribute("d", d);
    nodes.seg.setAttribute("aria-label", `${ing.name}, ${share} percent`);
    nodes.title.textContent = `${ing.name} — ${share}%`;

    const [ox, oy] = [Math.cos(rad(mid)) * LIFT, Math.sin(rad(mid)) * LIFT];
    nodes.seg.style.setProperty("--ox", `${round(ox)}px`);
    nodes.seg.style.setProperty("--oy", `${round(oy)}px`);

    const isActive = ing.id === active;
    nodes.seg.classList.toggle("is-active", isActive);
    nodes.seg.setAttribute("aria-pressed", String(ing.id === state.locked));

    const pointer = pointerNodes.get(ing.id);
    const [lx1, ly1] = px(R_POINT_A, mid);
    const [lx2, ly2] = px(R_POINT_B, mid);
    const [gx, gy] = px(R_GEM, mid);
    pointer.line.setAttribute("x1", round(lx1));
    pointer.line.setAttribute("y1", round(ly1));
    pointer.line.setAttribute("x2", round(lx2));
    pointer.line.setAttribute("y2", round(ly2));
    pointer.gem.setAttribute("cx", round(gx));
    pointer.gem.setAttribute("cy", round(gy));
    pointer.line.classList.toggle("is-active", isActive);
    pointer.gem.classList.toggle("is-active", isActive);

    const label = labelNodes.get(ing.id);
    label.root.style.setProperty("--cx", round(Math.cos(rad(mid))));
    label.root.style.setProperty("--cy", round(Math.sin(rad(mid))));
    label.value.textContent = `${share}%`;
    label.root.classList.toggle("is-active", isActive);
  });

  el.segments.classList.toggle("has-active", Boolean(active));
}

function renderIngredientPlate() {
  const id = activeId();
  const ing = ingredientById(id);
  const total = state.values.reduce((a, b) => a + b, 0) || 1;
  const share = Math.round(
    (state.values[ingredients.indexOf(ing)] / total) * 100
  );

  el.ing.name.textContent = ing.name;
  el.ing.value.textContent = share;
  el.ing.desc.textContent = ing.description;
  el.ing.affinity.textContent = ing.affinity;
  el.ing.effect.textContent = ing.effect;
  el.ing.volatility.textContent = ing.volatility;

  el.core.value.textContent = share;
  el.core.name.textContent = ing.name;

  const next = ingredients[(ingredients.indexOf(ing) + 1) % ingredients.length];
  root.style.setProperty("--active", `var(--ing-${ing.id})`);
  root.style.setProperty("--active-2", `var(--ing-${next.id})`);

  document.querySelectorAll(".rune").forEach((rune) => {
    rune.classList.toggle("is-lit", rune.dataset.owner === id);
  });
}

function renderTable() {
  const total = state.values.reduce((a, b) => a + b, 0) || 1;
  el.table.innerHTML = ingredients
    .map(
      (ing, i) =>
        `<tr><th scope="row">${ing.name}</th><td>${Math.round((state.values[i] / total) * 100)}%</td></tr>`
    )
    .join("");
}

function render() {
  renderSegments();
  renderIngredientPlate();
  renderTable();
}

/* ── Selection ─────────────────────────────────────────────── */

function setHover(id) {
  if (state.brewing) return;
  state.hovered = id;
  render();
}

function toggleLock(id) {
  if (state.brewing) return;
  state.locked = id;
  state.hovered = null;
  render();
  const ing = ingredientById(id);
  el.live.textContent = `${ing.name} selected. ${ing.effect}, volatility ${ing.volatility}.`;
  streamParticles(ing);
}

function focusSegment(offset) {
  const ids = ingredients.map((i) => i.id);
  const current = ids.indexOf(activeId());
  const next = ids[(current + offset + ids.length) % ids.length];
  const node = segNodes.get(next).seg;
  node.focus();
  setHover(null);
  state.locked = next;
  render();
}

function wireSegments() {
  segNodes.forEach(({ seg }, id) => {
    seg.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "mouse") setHover(id);
    });
    seg.addEventListener("pointerleave", (e) => {
      if (e.pointerType === "mouse") setHover(null);
    });
    seg.addEventListener("click", () => toggleLock(id));
    seg.addEventListener("focus", () => setHover(id));
    seg.addEventListener("blur", () => setHover(null));
    seg.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        toggleLock(id);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        focusSegment(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        focusSegment(-1);
      }
    });
  });
}

/* ── Potion result ─────────────────────────────────────────── */

function computePotion(special) {
  if (special) return special;

  const total = state.values.reduce((a, b) => a + b, 0) || 1;
  const sum = (key) =>
    ingredients.reduce(
      (acc, ing, i) => acc + (state.values[i] / total) * ing.profile[key],
      0
    );

  const ranked = ingredients
    .map((ing, i) => ({ ing, value: state.values[i] }))
    .sort((a, b) => b.value - a.value);

  const pair = [ranked[0].ing.id, ranked[1].ing.id];
  const key = Object.keys(POTION_NAMES).find((k) => {
    const parts = k.split("+");
    return parts.includes(pair[0]) && parts.includes(pair[1]);
  });

  return {
    name: POTION_NAMES[key] || `${ranked[0].ing.name} Draught`,
    side: SIDE_EFFECTS[ranked[0].ing.id],
    stats: [
      {
        label: "Clarity",
        value: Math.round(sum("clarity") * 14),
        max: 14,
        sign: true
      },
      {
        label: "Energy",
        value: Math.round(sum("energy") * 14),
        max: 14,
        sign: true
      },
      {
        label: "Focus",
        value: Math.round(sum("focus") * 14),
        max: 14,
        sign: true
      },
      {
        label: "Volatility",
        value: Math.round(sum("volatility") * 100),
        max: 100,
        pct: true
      }
    ]
  };
}

function renderPotion(potion) {
  el.potion.name.textContent = potion.name;
  el.potion.side.textContent = potion.side;
  el.potion.stats.innerHTML = potion.stats
    .map((s) => {
      const display = s.pct
        ? `${s.value}%`
        : `${s.value >= 0 ? "+" : ""}${s.value}`;
      const width = Math.max(
        0,
        Math.min(100, (Math.abs(s.value) / s.max) * 100)
      );
      const cls = s.label === "Volatility" ? "stat stat--volatility" : "stat";
      return `<div class="${cls}">
          <div class="stat__row"><dt>${s.label}</dt><dd>${display}</dd></div>
          <div class="stat__meter"><span class="stat__fill" style="width:${width.toFixed(1)}%"></span></div>
        </div>`;
    })
    .join("");
}

function pushHistory(name) {
  state.history.unshift(name);
  state.history = state.history.slice(0, 3);
  el.historyWrap.hidden = state.history.length < 1;
  el.history.innerHTML = state.history.map((n) => `<li>${n}</li>`).join("");
}

/* ── Particles ─────────────────────────────────────────────── */

function spawn(host, cls, opts) {
  const mote = document.createElement("i");
  mote.className = `mote ${cls}`;
  Object.entries(opts).forEach(([k, v]) => mote.style.setProperty(k, v));
  host.appendChild(mote);
  mote.addEventListener("animationend", () => mote.remove(), { once: true });
  return mote;
}

function burst() {
  if (reducedMotion.matches) return;
  const box = el.burst.getBoundingClientRect();
  const reach = box.width / 2;
  for (let i = 0; i < 28; i++) {
    const ing = ingredients[i % ingredients.length];
    const angle = Math.random() * Math.PI * 2;
    const dist = reach * (0.35 + Math.random() * 0.6);
    spawn(el.burst, `mote--burst mote--${ing.particle}`, {
      "--px": "50%",
      "--py": "50%",
      "--s": `${3 + Math.random() * 7}px`,
      "--c": `var(--ing-${ing.id})`,
      "--dx": `${Math.cos(angle) * dist}px`,
      "--dy": `${Math.sin(angle) * dist}px`,
      "--dur": `${0.85 + Math.random() * 0.8}s`,
      "--delay": `${Math.random() * 0.18}s`,
      "--s2": (0.2 + Math.random() * 0.5).toFixed(2)
    });
  }
}

function streamParticles(ing) {
  if (reducedMotion.matches) return;
  const box = el.burst.getBoundingClientRect();
  const reach = box.width / 2;
  for (let i = 0; i < 9; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = reach * (0.2 + Math.random() * 0.35);
    spawn(el.burst, `mote--stream mote--${ing.particle}`, {
      "--px": "50%",
      "--py": "50%",
      "--s": `${3 + Math.random() * 5}px`,
      "--c": `var(--ing-${ing.id})`,
      "--dx": `${Math.cos(angle) * dist}px`,
      "--dy": `${Math.sin(angle) * dist}px`,
      "--dur": `${1.6 + Math.random() * 1.2}s`,
      "--delay": `${Math.random() * 0.4}s`
    });
  }
}

function wireTrail() {
  let last = 0;
  el.stage.addEventListener("pointermove", (e) => {
    if (
      reducedMotion.matches ||
      !finePointer.matches ||
      e.pointerType !== "mouse"
    )
      return;
    const now = performance.now();
    if (now - last < 58) return;
    last = now;
    const box = el.burst.getBoundingClientRect();
    spawn(el.burst, "mote--trail mote--dust", {
      "--px": `${e.clientX - box.left}px`,
      "--py": `${e.clientY - box.top}px`,
      "--s": `${2 + Math.random() * 3}px`,
      "--c": "var(--active)"
    });
  });
}

/* ── Brew sequence ─────────────────────────────────────────── */

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function rollValues() {
  const raw = ingredients.map((ing) =>
    Math.max(5, ing.base * (0.62 + Math.random() * 0.78))
  );
  const total = raw.reduce((a, b) => a + b, 0);
  const scaled = raw.map((v) => (v / total) * 100);
  const floored = scaled.map((v) => Math.max(5, Math.floor(v)));
  let drift = 100 - floored.reduce((a, b) => a + b, 0);
  const order = scaled
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  let k = 0;
  while (drift > 0) {
    floored[order[k % order.length].i] += 1;
    drift--;
    k++;
  }
  while (drift < 0) {
    const idx = order[k % order.length].i;
    if (floored[idx] > 5) {
      floored[idx] -= 1;
      drift++;
    }
    k++;
  }
  return floored;
}

function tweenValues(target, duration) {
  const from = state.values.slice();
  if (duration <= 0) {
    state.values = target.slice();
    render();
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const start = performance.now();
    const ease = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const e = ease(t);
      state.values = from.map((v, i) => v + (target[i] - v) * e);
      renderSegments();
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        state.values = target.slice();
        render();
        resolve();
      }
    };
    requestAnimationFrame(step);
  });
}

async function runBrew(special) {
  if (state.brewing) return;
  state.brewing = true;
  const quick = reducedMotion.matches;

  el.brew.disabled = true;
  el.brew.setAttribute("aria-busy", "true");
  el.brewLabel.textContent = "Brewing";
  el.brewNote.textContent = "Measuring the wheel…";

  root.classList.add("is-charging");
  await wait(quick ? 120 : 400);
  root.classList.remove("is-charging");

  root.classList.add("is-spinning");
  el.brewNote.textContent = "The rings are arguing…";
  await wait(quick ? 140 : 800);
  root.classList.remove("is-spinning");

  root.classList.add("is-reacting");
  burst();
  if (!special) await tweenValues(rollValues(), quick ? 0 : 520);
  await wait(quick ? 80 : 180);
  root.classList.remove("is-reacting");

  const potion = computePotion(special);
  renderPotion(potion);
  pushHistory(potion.name);
  root.classList.add("is-settling");
  setTimeout(() => root.classList.remove("is-settling"), 750);

  el.brew.disabled = false;
  el.brew.removeAttribute("aria-busy");
  el.brewLabel.textContent = "Brew";
  el.brewNote.textContent = `${potion.name}. Brew again for a different measure.`;
  el.live.textContent = `Brewed ${potion.name}. ${potion.stats
    .map((s) => `${s.label} ${s.pct ? s.value + "%" : s.value}`)
    .join(", ")}.`;

  state.brewing = false;
}

/* ── Hidden recipe: the four gems, clockwise from the top ──── */

const SECRET = ["n", "e", "s", "w"];
let tapped = [];
let tapTimer = null;

function tapCardinal(key, node) {
  node.classList.add("is-armed");
  setTimeout(() => node.classList.remove("is-armed"), 900);

  tapped.push(key);
  clearTimeout(tapTimer);
  tapTimer = setTimeout(() => {
    tapped = [];
  }, 6000);

  const ok = tapped.every((k, i) => k === SECRET[i]);
  if (!ok) {
    tapped = key === SECRET[0] ? [key] : [];
    return;
  }
  if (tapped.length === SECRET.length) {
    tapped = [];
    el.cardinals.querySelectorAll(".gem").forEach((g) => {
      g.classList.add("is-armed");
      setTimeout(() => g.classList.remove("is-armed"), 1400);
    });
    runBrew({
      name: "Potion of Infinite Side Projects",
      side: "Obviously.",
      stats: [
        { label: "Inspiration", value: 100, max: 100, sign: true },
        { label: "Free Time", value: -93, max: 100, sign: true },
        { label: "Tabs Open", value: 14, max: 14, sign: true },
        { label: "Volatility", value: 97, max: 100, pct: true }
      ]
    });
  }
}

/* ── Go ────────────────────────────────────────────────────── */

buildDefs();
buildChart();
buildRunes();
buildCardinals();
buildAmbient();
wireSegments();
wireTrail();
render();
renderPotion(computePotion());

el.brew.addEventListener("click", () => runBrew());

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && state.hovered) setHover(null);
});
