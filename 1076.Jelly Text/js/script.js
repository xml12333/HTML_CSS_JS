import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.3/dist/tweakpane.min.js";

const h1 = document.querySelector(".hero h1");
const root = document.documentElement;

const params = {
  // Timing
  duration: 0.9,
  stagger: 0.035,

  // Base Font State
  baseWght: 700,
  baseWdth: 85,

  // Transform settings
  squashX: 1.35,
  squashY: 0.65,
  squashDown: 12,
  stretchX: 0.75,
  stretchY: 1.35,
  stretchUp: -22,
  overshootX: 1.15,
  overshootY: 0.85,

  // Font Variation Extreme Settings
  squashWght: 900,
  squashWdth: 80,
  stretchWght: 450,
  stretchWdth: 90 };


const updateCSS = () => {
  root.style.setProperty("--jelly-duration", `${params.duration}s`);
  root.style.setProperty("--stagger", `${params.stagger}s`);

  root.style.setProperty("--base-wght", params.baseWght);
  root.style.setProperty("--base-wdth", params.baseWdth);

  root.style.setProperty("--squash-scale-x", params.squashX);
  root.style.setProperty("--squash-scale-y", params.squashY);
  root.style.setProperty("--squash-ty", `${params.squashDown}%`);

  root.style.setProperty("--stretch-scale-x", params.stretchX);
  root.style.setProperty("--stretch-scale-y", params.stretchY);
  root.style.setProperty("--stretch-ty", `${params.stretchUp}%`);

  root.style.setProperty("--overshoot-scale-x", params.overshootX);
  root.style.setProperty("--overshoot-scale-y", params.overshootY);

  root.style.setProperty("--squash-wght", params.squashWght);
  root.style.setProperty("--squash-wdth", params.squashWdth);
  root.style.setProperty("--stretch-wght", params.stretchWght);
  root.style.setProperty("--stretch-wdth", params.stretchWdth);
};

const FLAVORS = [
{ c: "oklch(72% 0.42 12  / 0.65)", cs: "oklch(22% 0.20 12  / 0.3)" }, // Strawberry
{ c: "oklch(75% 0.40 138 / 0.65)", cs: "oklch(22% 0.18 138 / 0.3)" }, // Lime
{ c: "oklch(68% 0.42 308 / 0.65)", cs: "oklch(16% 0.18 308 / 0.3)" }, // Grape
{ c: "oklch(78% 0.36 60  / 0.65)", cs: "oklch(24% 0.15 60  / 0.3)" }, // Orange
{ c: "oklch(70% 0.38 232 / 0.65)", cs: "oklch(16% 0.15 232 / 0.3)" }, // Blue Razz
{ c: "oklch(72% 0.42 5   / 0.65)", cs: "oklch(18% 0.19 5   / 0.3)" }, // Cherry
{ c: "oklch(88% 0.30 100 / 0.65)", cs: "oklch(32% 0.13 100 / 0.3)" }, // Lemon
{ c: "oklch(70% 0.36 270 / 0.65)", cs: "oklch(18% 0.16 270 / 0.3)" } // Blueberry
];

const forceReflow = el => void el.offsetWidth;

let isAnimating = false;

const playJiggle = () => {
  if (!h1 || isAnimating) return;
  isAnimating = true;

  h1.classList.remove("force-jelly");
  forceReflow(h1);
  h1.classList.add("force-jelly");

  const letters = h1.querySelectorAll(".letter");
  const lastLetter = letters[letters.length - 1];

  const onDone = () => {
    h1.classList.remove("force-jelly");
    isAnimating = false;
  };

  lastLetter.addEventListener("animationend", onDone, { once: true });
};

const buildLetters = () => {
  if (!h1) return;

  const text = h1.textContent.trim();
  h1.setAttribute("aria-label", text);

  const fragment = document.createDocumentFragment();
  let flavorIndex = 0;

  Array.from(text).forEach((char, i) => {
    const span = document.createElement("span");
    span.className = "letter";
    span.style.setProperty("--i", i);

    const isSpace = char === " ";
    span.dataset.char = isSpace ? "\u00A0" : char;
    span.textContent = isSpace ? "\u00A0" : char;

    if (!isSpace) {
      const flavor = FLAVORS[flavorIndex % FLAVORS.length];
      span.style.setProperty("--c", flavor.c);
      span.style.setProperty("--cs", flavor.cs);
      flavorIndex++;
    }

    fragment.appendChild(span);
  });

  h1.replaceChildren(fragment);

  const triggerLetter = (e, forceRestart = false) => {
    const letter = e.target.closest(".letter");
    if (!letter) return;

    if (!forceRestart && letter.classList.contains("is-jiggling")) return;

    letter.classList.remove("is-jiggling");
    forceReflow(letter);
    letter.classList.add("is-jiggling");

    letter.addEventListener("animationend", () => {
      letter.classList.remove("is-jiggling");
    }, { once: true });
  };

  h1.addEventListener("mouseenter", e => triggerLetter(e, false), true);
  h1.addEventListener("click", e => triggerLetter(e, true), true);
};

buildLetters();
updateCSS();
playJiggle();

// Tweakpane
const pane = new Pane({ title: "⚙️ Settings", expanded: false });
pane.on("change", updateCSS);

const timing = pane.addFolder({ title: "Timing" });
timing.addBinding(params, "duration", { label: "Duration", min: 0.15, max: 5, step: 0.01 });
timing.addBinding(params, "stagger", { label: "Stagger", min: 0, max: 0.25, step: 0.002 });

const base = pane.addFolder({ title: "Base Font" });
base.addBinding(params, "baseWght", { label: "Wght", min: 100, max: 900, step: 1 });
base.addBinding(params, "baseWdth", { label: "Wdth", min: 100, max: 125, step: 1 });

const squash = pane.addFolder({ title: "Squash (Down)" });
squash.addBinding(params, "squashX", { label: "Scale X", min: 0.6, max: 1.8, step: 0.01 });
squash.addBinding(params, "squashY", { label: "Scale Y", min: 0.4, max: 1.2, step: 0.01 });
squash.addBinding(params, "squashDown", { label: "Drop (%)", min: -40, max: 60, step: 1 });
squash.addBinding(params, "squashWght", { label: "Wght", min: 100, max: 900, step: 1 });
squash.addBinding(params, "squashWdth", { label: "Wdth", min: 100, max: 125, step: 1 });

const stretch = pane.addFolder({ title: "Stretch (Up)" });
stretch.addBinding(params, "stretchX", { label: "Scale X", min: 0.4, max: 1.4, step: 0.01 });
stretch.addBinding(params, "stretchY", { label: "Scale Y", min: 0.9, max: 2, step: 0.01 });
stretch.addBinding(params, "stretchUp", { label: "Lift (%)", min: -80, max: 40, step: 1 });
stretch.addBinding(params, "stretchWght", { label: "Wght", min: 100, max: 900, step: 1 });
stretch.addBinding(params, "stretchWdth", { label: "Wdth", min: 100, max: 125, step: 1 });

const settle = pane.addFolder({ title: "Overshoot" });
settle.addBinding(params, "overshootX", { label: "Scale X", min: 0.7, max: 1.5, step: 0.005 });
settle.addBinding(params, "overshootY", { label: "Scale Y", min: 0.7, max: 1.5, step: 0.005 });

pane.addButton({ title: "Jiggle Words" }).on("click", playJiggle);