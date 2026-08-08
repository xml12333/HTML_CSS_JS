// Setup
requestAnimationFrame(() => {
  const stage = document.getElementById("stage");
  const slapper = new StickerSlap(stage);

  const palette = [
    "🎉",
    "🔥",
    "💖",
    "⭐",
    "🦖",
    "🍕",
    "🌈",
    "👾",
    "🍩",
    "✨",
    "💩",
    "🍠"
  ];

  // Click the stage to slap at the cursor.
  stage.addEventListener("pointerdown", (e) => {
    const glyph = palette[Math.floor(Math.random() * palette.length)];
    const r = stage.getBoundingClientRect();
    slapper.slap(emojiToImage(glyph), {
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top) / r.height,
    });
  });
});


















const SETTINGS = {
  size: [50, 500], // sticker size - [min, max]
  x: null,
  y: null,
  rotation: null,
  curlAngle: null,
  startCurl: 0.15, // how peeled it starts
  duration: 1100, // unfold animation length in ms
  onLand: null, // callback(stickerEl) fired when it lies flat
};

function layer(cls) {
  const node = document.createElement("div");
  node.className = `sticker__layer ${cls}`;
  return node;
}
function setVars(node, vars) {
  for (const k in vars) node.style.setProperty(k, String(vars[k]));
}
function cancelSafe(anim) {
  try {
    anim.cancel();
  } catch (_) {}
}
function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}
function clamp01(v) {
  return clamp(v, 0, 1);
}
function rand(lo, hi) {
  return lo + Math.random() * (hi - lo);
}
function resolveSize(size) {
  return Array.isArray(size) ? Math.round(rand(size[0], size[1])) : size;
}

const EMOJI_RE = /\p{Extended_Pictographic}/u;

function isEmoji(str) {
  return (
    typeof str === "string" &&
    EMOJI_RE.test(str) &&
    !/^https?:|^data:|\.(png|svg|webp|jpe?g|gif)$/i.test(str)
  );
}

// Normalize a slap source into a URL string the sticker can render.
// Accepts a URL/data-URL string, an <img>, or a <canvas>.
function toImageSrc(source) {
  if (typeof source === "string") return source;
  if (source instanceof HTMLImageElement) return source.currentSrc || source.src;
  if (source instanceof HTMLCanvasElement) return source.toDataURL("image/png");
  throw new Error(
    "StickerSlap.slap expects image data (URL/data-URL string) or an image element."
  );
}

const emojiImageCache = new Map();

// Rasterize an emoji glyph to a PNG data URL.
function emojiToImage(emoji, { size = 256, padding = 0.12, paper = true } = {}) {
  const key = `${emoji}@${size}|${padding}|${paper}`;
  if (emojiImageCache.has(key)) return emojiImageCache.get(key);

  const dpr = Math.max(2, window.devicePixelRatio || 1);
  const px = Math.round(size * dpr);
  const canvas = document.createElement("canvas");
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext("2d");

  const border = paper ? Math.max(1, size * 0.022) * dpr : 0;
  const pad = size * padding * dpr + border; // leave room for the border
  const fontPx = Math.round(px - pad * 2);
  const font = `${fontPx}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  const cx = px / 2;
  const cy = px / 2 + fontPx * 0.04;

  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (border > 0) {
    const mark = document.createElement("canvas");
    mark.width = px;
    mark.height = px;
    const mctx = mark.getContext("2d");
    mctx.font = font;
    mctx.textAlign = "center";
    mctx.textBaseline = "middle";
    mctx.fillText(emoji, cx, cy);
    mctx.globalCompositeOperation = "source-in";
    mctx.fillStyle = "#fff";
    mctx.fillRect(0, 0, px, px);

    const steps = 24;
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      ctx.drawImage(mark, Math.cos(a) * border, Math.sin(a) * border);
    }
  }

  ctx.fillText(emoji, cx, cy);

  const url = canvas.toDataURL("image/png");
  emojiImageCache.set(key, url);
  return url;
}

let uid = 0;

class StickerSlap {
  constructor(stage, options = {}) {
    if (!stage) throw new Error("StickerSlap requires a stage element.");
    this.stage = stage;
    this.defaults = { ...SETTINGS, ...options };
    this.stickers = [];

    const cs = getComputedStyle(stage);
    if (cs.position === "static") stage.style.position = "relative";
    if (cs.overflow === "visible") stage.style.overflow = "hidden";
  }
  
  async slap(source, opts = {}) {
    const o = { ...this.defaults, ...opts };
    o.size = resolveSize(o.size); // collapse a [min, max] range to one value

    const el = this._createSticker(toImageSrc(source), o);
    this.stage.appendChild(el);
    this.stickers.push(el);

    await this._animateIn(el, o);
    if (typeof o.onLand === "function") o.onLand(el);
    return el;
  }

  clear() {
    this.stickers.forEach((s) => s.remove());
    this.stickers = [];
  }
  
  _settle(el) {
    // Drop the curl machinery once it's flat. The flap layers carry the
    // image is the cheap resting state.
    const flat = el.querySelector(".sticker__flat");
    const vars = ["--src","--u0","--u1","--w0","--w1","--minp",
                  "--span","--big","--s","--ca","--a","--b","--d","--p"];
    for (const name of vars)el.style.removeProperty(name);
    el.replaceChildren(flat);
    el.style.transform = `rotate(${el._restRotation}deg)`;
  }

  _createSticker(src, o) {
    const rect = this.stage.getBoundingClientRect();
    const S = o.size;

    const fx = o.x == null ? Math.random() : clamp01(o.x);
    const fy = o.y == null ? Math.random() : clamp01(o.y);
    const half = S / 2;
    const left = clamp(fx * rect.width, half, rect.width - half) - half;
    const top = clamp(fy * rect.height, half, rect.height - half) - half;

    const rest = o.rotation == null ? rand(-12, 12) : o.rotation;
    const angle =
      (o.curlAngle == null ? rand(0, 360) : o.curlAngle) * (Math.PI / 180);

    const u = [Math.cos(angle), Math.sin(angle)];
    const w = [-Math.sin(angle), Math.cos(angle)];
    const projs = [
      [0, 0],
      [S, 0],
      [S, S],
      [0, S],
    ].map((c) => c[0] * u[0] + c[1] * u[1]);
    const minP = Math.min(...projs);
    const span = Math.max(...projs) - minP;
    const p0 = clamp01(o.startCurl);

    const el = document.createElement("div");
    el.className = "sticker";
    el.dataset.id = `sticker-${++uid}`;
    Object.assign(el.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${S}px`,
      height: `${S}px`,
    });

    setVars(el, {
      "--src": `url("${src}")`,
      "--u0": u[0],
      "--u1": u[1],
      "--w0": w[0],
      "--w1": w[1],
      "--minp": minP,
      "--span": span,
      "--big": S * 6,
      "--s": S,
      "--ca": 90 + (angle * 180) / Math.PI,
      "--a": 1 - 2 * u[0] * u[0], // reflection matrix linear part
      "--b": -2 * u[0] * u[1],
      "--d": 1 - 2 * u[1] * u[1],
      "--p": p0, // start rolled; animated to 1
    });

    const flat = layer("sticker__flat");
    const img = document.createElement("img");
    img.className = "sticker__img";
    img.src = src;
    img.draggable = false;
    flat.appendChild(img);

    const flapShadow = layer("sticker__flap-shadow");
    const flapClip = layer("sticker__flap-clip");
    const flapInner = layer("sticker__flap-inner");
    const flapFill = layer("sticker__flap-fill");
    flapInner.appendChild(flapFill);
    flapClip.appendChild(flapInner);
    flapShadow.appendChild(flapClip);

    el.append(flat, flapShadow);

    el._restRotation = rest;
    el._startCurl = p0;
    return el;
  }

  _animateIn(el, o) {
    const rest = el._restRotation;

    const entrance = el.animate(
      [
        { offset: 0, transform: `rotate(${rest}deg) scale(1.06)`, opacity: 0 },
        { offset: 0.2, transform: `rotate(${rest}deg) scale(1.0)`, opacity: 1 },
        { offset: 1, transform: `rotate(${rest}deg) scale(1.0)`, opacity: 1 },
      ],
      { duration: o.duration, easing: "ease-out", fill: "both" },
    );

    const unroll = el.animate(
      [{ "--p": el._startCurl }, { "--p": 1 }],
      { duration: o.duration, easing: "ease-in-out", fill: "both" },
    );

    return Promise.all([entrance.finished, unroll.finished]).then(() => {
      el.style.setProperty("--p", "1"); // guarantee perfectly flat at the end
      el.style.transform = `rotate(${rest}deg)`;
      cancelSafe(entrance);
      cancelSafe(unroll);
      this._settle(el);
      return el;
    });
  }
  
}