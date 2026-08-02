(() => {
  "use strict";

  const PALETTES = Object.freeze({
    retro: ["#5b83c4", "#ee93b5", "#2f9585", "#e8863f"],
    sunset: ["#e85f6b", "#f2a65a", "#f7d366", "#8e6fc4"],
    mono: ["#caa14e", "#8f7434", "#e3c078", "#6f5928"],
    acid: ["#9fd45b", "#2fb8a6", "#f2e15a", "#4f7fc0"],
    candy: ["#ff8fb3", "#8fd9ff", "#ffe08f", "#c48fff"],
    ocean: ["#1f6f8b", "#3fb6a8", "#a8dadc", "#0b4f6c"],
    neon: ["#ff2e88", "#00e5ff", "#ffe600", "#7a3cff"],
    earth: ["#a9744f", "#7c9473", "#d9a441", "#5b4636"]
  });

  const TEXTS = Object.freeze({
    default: { top: ["WHO CARES"], bottom: ["TRY AGAIN"] },
    custom1: { top: ["DREAM BIG"], bottom: ["WORK HARD"] },
    custom2: { top: ["STAY WEIRD"], bottom: ["STAY TRUE"] },
    custom3: { top: ["NEVER QUIT"], bottom: ["KEEP GOING"] },
    custom4: { top: ["FALL SEVEN"], bottom: ["RISE EIGHT"] },
    custom5: { top: ["TRUST TIME"], bottom: ["TRUST YOU"] },
    custom6: { top: ["MAKE MOVES"], bottom: ["TAKE ACTION"] },
    custom7: { top: ["DOUBT KILLS"], bottom: ["MORE DREAMS"] },
    custom8: { top: ["BE BRAVE"], bottom: ["OWN HERO"] }
  });

  const GOLD = "#d4ab55";
  const MAX_DPR = 2;

  /* ------------------------------------------------------------------
     Math helpers
  ------------------------------------------------------------------ */
  const lerp = (a, b, t) => a + (b - a) * t;
  const mod = (n, m) => ((n % m) + m) % m;
  const easeConverge = (t) => Math.pow(t, 1.7);

  class RippleState {
    constructor() {
      this.speed = 70;
      this.density = 22;
      this.wave = 8;
      this.palette = "neon";
      this.textSet = "default";
      this.vanishShape = "line";
      this.fontSize = 19;
      this.lineWidth = 14;
    }

    /** Returns a plain object snippet for the "copy params" feature. */
    serialize() {
      return `let state = {
    speed: ${this.speed},
    density: ${this.density},
    wave: ${this.wave},
    palette: '${this.palette}',
    textSet: '${this.textSet}',
    vanishShape: '${this.vanishShape}',
    fontSize: ${this.fontSize},
    lineWidth: ${this.lineWidth}
  };`;
    }
  }

  /* ------------------------------------------------------------------
     Canvas renderer — owns the canvas, resize handling and draw loop
  ------------------------------------------------------------------ */
  class RippleRenderer {
    constructor(canvas, state) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.state = state;
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.startTime = performance.now();
      this.rafId = null;

      this._onResize = this._onResize.bind(this);
      this._tick = this._tick.bind(this);
    }

    start() {
      this._onResize();
      window.addEventListener("resize", this._onResize);
      this.rafId = requestAnimationFrame(this._tick);
    }

    stop() {
      if (this.rafId !== null) cancelAnimationFrame(this.rafId);
      window.removeEventListener("resize", this._onResize);
    }

    _onResize() {
      this.dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    _tick(now) {
      const elapsed = (now - this.startTime) / 1000;
      // Continuously growing depth-offset: bands cycle from the base text
      // inward toward the vanishing point/line and loop forever.
      const phaseOffset = elapsed * (this.state.speed / 12);

      this._render(phaseOffset);
      this.rafId = requestAnimationFrame(this._tick);
    }

    _render(phaseOffset) {
      const { ctx, width: W, height: H, state } = this;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue("--bg")
        .trim();
      ctx.fillRect(0, 0, W, H);

      const texts = TEXTS[state.textSet];
      const colors = PALETTES[state.palette];
      const cx = W / 2;
      const fontSize = Math.min(
        W * (state.fontSize / 100),
        H * (state.fontSize / 100)
      );

      const midGapTop = H * 0.44;
      const midGapBottom = H * 0.56;

      // Top block: anchored above, bands flow down toward midGapTop.
      this._drawBlock(texts.top, cx, H * 0.2, midGapTop, phaseOffset, fontSize);
      // Bottom block: anchored below, bands flow up toward midGapBottom.
      this._drawBlock(
        texts.bottom,
        cx,
        H * 0.82,
        midGapBottom,
        phaseOffset,
        fontSize
      );
    }

    /**
     * Draws one text block (top or bottom) as a set of receding "echo"
     * bands converging toward a vanishing point or line, plus a solid
     * base layer on top.
     */
    _drawBlock(lines, cx, anchorY, vanishY, phaseOffset, fontSizePx) {
      const { ctx, state } = this;
      const {
        density: layers,
        wave: waveAmp,
        vanishShape,
        lineWidth: lineWidthPct
      } = state;
      const colors = PALETTES[state.palette];

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${fontSizePx}px 'Luckiest Guy', cursive`;
      const lineHeight = fontSizePx * 0.86;

      // Each band k keeps a fixed color identity, but its depth continuously
      // increases with phaseOffset and wraps, so bands appear to travel
      // from the base text inward toward the vanishing point/line, looping.
      const bands = [];
      for (let k = 0; k < layers; k++) {
        const depth = mod(k + phaseOffset, layers) / layers; // 0 = base, 1 = collapsed
        bands.push({
          ease: easeConverge(depth),
          color: colors[k % colors.length]
        });
      }
      // Draw farthest (closest to vanishing point/line) first so nearer
      // bands occlude them.
      bands.sort((a, b) => b.ease - a.ease);

      // Global sway: one value per frame, scaled linearly by each band's
      // ease, so every band's edge still lands on the same straight line
      // instead of fraying into a wavy fan.
      const sway = waveAmp * 0.35 * Math.sin(phaseOffset * 0.12);

      for (const band of bands) {
        const y = lerp(anchorY, vanishY, band.ease);
        // "point" collapses both axes toward zero; "line" keeps horizontal
        // width alive so ripples flatten into a wide line instead of a dot.
        const scaleY = lerp(1, 0.02, band.ease);
        const scaleX =
          vanishShape === "line"
            ? lerp(1, lineWidthPct / 100, band.ease)
            : lerp(1, 0.02, band.ease);
        const x = cx + sway * band.ease;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scaleX, scaleY);
        ctx.fillStyle = band.color;
        this._drawLines(lines, lineHeight);
        ctx.restore();
      }

      // Base solid text on top.
      ctx.save();
      ctx.translate(cx, anchorY);
      ctx.fillStyle = GOLD;
      this._drawLines(lines, lineHeight);
      ctx.restore();
    }

    _drawLines(lines, lineHeight) {
      const { ctx } = this;
      lines.forEach((line, idx) => {
        const ly = (idx - (lines.length - 1) / 2) * lineHeight;
        ctx.fillText(line, 0, ly);
      });
    }
  }

  /* ------------------------------------------------------------------
     Toast notifications
  ------------------------------------------------------------------ */
  class Toast {
    constructor(el, duration = 1800) {
      this.el = el;
      this.duration = duration;
      this.timer = null;
    }

    show(message) {
      this.el.textContent = message;
      this.el.classList.add("is-visible");
      clearTimeout(this.timer);
      this.timer = setTimeout(
        () => this.el.classList.remove("is-visible"),
        this.duration
      );
    }
  }

  /* ------------------------------------------------------------------
     Control panel — binds form inputs to the shared state
  ------------------------------------------------------------------ */
  class ControlPanel {
    constructor(root, toggleBtn, state, toast) {
      this.root = root;
      this.toggleBtn = toggleBtn;
      this.state = state;
      this.toast = toast;

      this.bindings = {
        textset: ["textSet", String],
        speed: ["speed", Number],
        density: ["density", Number],
        wave: ["wave", Number],
        fontsize: ["fontSize", Number],
        linewidth: ["lineWidth", Number],
        palette: ["palette", String],
        vanishshape: ["vanishShape", String]
      };

      root.addEventListener("submit", (e) => e.preventDefault());
      this._bindInputs();
      this._bindToggle();
      this._bindCopyButton();
    }

    _bindInputs() {
      for (const [id, [key, parse]] of Object.entries(this.bindings)) {
        const el = document.getElementById(id);
        if (!el) continue;
        const eventName = el.tagName === "SELECT" ? "change" : "input";
        el.addEventListener(eventName, (e) => {
          this.state[key] = parse(e.target.value);
        });
      }
    }

    _bindToggle() {
      this.toggleBtn.addEventListener("click", () => {
        const hidden = this.root.classList.toggle("is-hidden");
        this.toggleBtn.textContent = hidden ? "SHOW CONTROLS" : "HIDE CONTROLS";
      });
    }

    _bindCopyButton() {
      const btn = document.getElementById("copyparams");
      if (!btn) return;

      btn.addEventListener("click", async () => {
        const snippet = this.state.serialize();
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(snippet);
            this.toast.show('Params copied — paste over the "let state" block');
          } else {
            throw new Error("Clipboard API unavailable");
          }
        } catch (err) {
          console.log(snippet);
          this.toast.show("Copy failed — see console");
        }
      });
    }
  }

  async function boot() {
    const canvas = document.getElementById("stage");
    const panel = document.getElementById("panel");
    const toggleBtn = document.getElementById("toggle");
    const toastEl = document.getElementById("toast");

    const state = new RippleState();
    const toast = new Toast(toastEl);
    new ControlPanel(panel, toggleBtn, state, toast);

    const renderer = new RippleRenderer(canvas, state);

    if (document.fonts?.ready) {
      try {
        await document.fonts.load("100px 'Luckiest Guy'");
      } catch (err) {
        // Font failed to preload; proceed with fallback rendering.
      }
    }

    renderer.start();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();