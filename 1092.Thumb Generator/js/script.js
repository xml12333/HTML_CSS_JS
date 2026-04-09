const SIG_LOCAL = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
const SIG_CD = new Uint8Array([0x50, 0x4b, 0x01, 0x02]);
const SIG_EOCD = new Uint8Array([0x50, 0x4b, 0x05, 0x06]);
const TEXT_ENC = new TextEncoder();

const CRC32_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++)
    c = CRC32_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function u16(v) {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, v, true);
  return b;
}

function u32(v) {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, v, true);
  return b;
}

function concat(...chunks) {
  let total = 0;
  for (const c of chunks) total += c.length;
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return out;
}

function buildLocalEntry(nameBytes, raw, crc, tBytes, dBytes) {
  return concat(
    SIG_LOCAL,
    u16(20),
    u16(0),
    u16(0),
    tBytes,
    dBytes,
    u32(crc),
    u32(raw.length),
    u32(raw.length),
    u16(nameBytes.length),
    u16(0),
    nameBytes,
    raw
  );
}

function buildCDEntry(nameBytes, crc, rawLen, tBytes, dBytes, offset) {
  return concat(
    SIG_CD,
    u16(20),
    u16(20),
    u16(0),
    u16(0),
    tBytes,
    dBytes,
    u32(crc),
    u32(rawLen),
    u32(rawLen),
    u16(nameBytes.length),
    u16(0),
    u16(0),
    u16(0),
    u16(0),
    u32(0),
    u32(offset),
    nameBytes
  );
}

async function buildZip(entries) {
  const now = new Date();
  const tBytes = u16(
    (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)
  );
  const dBytes = u16(
    ((now.getFullYear() - 1980) << 9) |
      ((now.getMonth() + 1) << 5) |
      now.getDate()
  );
  const locals = [];
  let offset = 0;

  for (const { name, blob } of entries) {
    const nameBytes = TEXT_ENC.encode(name);
    const raw = new Uint8Array(await blob.arrayBuffer());
    const crc = crc32(raw);
    const local = buildLocalEntry(nameBytes, raw, crc, tBytes, dBytes);
    locals.push({
      local,
      nameBytes,
      crc,
      len: raw.length,
      tBytes,
      dBytes,
      offset
    });
    offset += local.length;
  }

  const cdStart = offset;
  const cdParts = locals.map(
    ({ nameBytes, crc, len, tBytes, dBytes, offset: off }) =>
      buildCDEntry(nameBytes, crc, len, tBytes, dBytes, off)
  );

  const cd = concat(...cdParts);
  const eocd = concat(
    SIG_EOCD,
    u16(0),
    u16(0),
    u16(locals.length),
    u16(locals.length),
    u32(cd.length),
    u32(cdStart),
    u16(0)
  );

  return new Blob([concat(...locals.map((l) => l.local), cd, eocd)], {
    type: "application/zip"
  });
}

const MIME_MAP = {
  webp: "image/webp",
  jpeg: "image/jpeg",
  png: "image/png"
};

const CLOSE_SVG =
  '<svg width="14" height="14" viewBox="0 0 48 48" aria-hidden="true"><path d="m12.55 37.5-2-2.05L22 24 10.55 12.5l2-2L24 21.95 35.5 10.5l2 2L26.05 24 37.5 35.45l-2 2.05L24 26Z" fill="currentColor"></path></svg>';

const DOWNLOAD_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M26 24v4H6v-4H4v4a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-4Zm0-10-1.41-1.41L17 20.17V2h-2v18.17l-7.59-7.58L6 14l10 10z"/></svg>';

const state = {
  files: [],
  aspect: "1:1",
  anchorX: 0.5,
  anchorY: 0.5,
  quality: 90,
  maxWidth: 1024,
  prefix: "thumb",
  naming: "num",
  format: "webp",
  processing: false
};

const drop_zone = document.getElementById("drop_zone");
const file_input = document.getElementById("file_input");
const format_grid = document.getElementById("format_grid");
const aspect_grid = document.getElementById("aspect_grid");
const anchor_grid = document.getElementById("anchor_grid");
const naming_grid = document.getElementById("naming_grid");
const row_prefix = document.getElementById("row_prefix");
const row_quality = document.getElementById("row_quality");
const quality_range = document.getElementById("quality_range");
const quality_readout = document.getElementById("quality_readout");
const max_width_input = document.getElementById("max_width_input");
const prefix_input = document.getElementById("prefix_input");
const preview_grid = document.getElementById("preview_grid");
const btn_clear = document.getElementById("btn_clear");
const btn_export = document.getElementById("btn_export");
const status_bar = document.getElementById("status_bar");
const aspect_buttons = aspect_grid.querySelectorAll(".aspect-btn");
const anchor_buttons = anchor_grid.querySelectorAll(".anchor-btn");
const naming_buttons = naming_grid.querySelectorAll(".naming-btn");
const naming_preview = document.getElementById("naming_preview");
const format_hint = document.getElementById("format_hint");

function updateNamingPreview() {
  const prefix = state.prefix.trim() || "thumb";
  const suffix =
    state.aspect === "original" ? "" : `-${state.aspect.replace(":", "x")}`;
  const ext = state.format === "jpeg" ? "jpg" : state.format;
  let example;
  if (state.naming === "original") example = `image.${ext}`;
  else if (state.naming === "num") example = `${prefix}-01${suffix}.${ext}`;
  else if (state.naming === "prefix-original")
    example = `${prefix}-image-01${suffix}.${ext}`;
  naming_preview.textContent = example;
}

function getCropParams(srcW, srcH, aspect, anchorX, anchorY) {
  if (aspect === "original") return { sx: 0, sy: 0, sw: srcW, sh: srcH };
  const [tw, th] = aspect.split(":").map(Number);
  const ratio = tw / th;
  const srcRatio = srcW / srcH;
  let cropW, cropH;
  if (srcRatio > ratio) {
    cropH = srcH;
    cropW = srcH * ratio;
  } else {
    cropW = srcW;
    cropH = srcW / ratio;
  }
  const cw = Math.round(cropW);
  const ch = Math.round(cropH);
  return {
    sx: Math.min(srcW - cw, Math.max(0, Math.round((srcW - cw) * anchorX))),
    sy: Math.min(srcH - ch, Math.max(0, Math.round((srcH - ch) * anchorY))),
    sw: cw,
    sh: ch
  };
}

function getOutputDims(sw, sh, maxWidth) {
  const width = Math.round(Math.min(sw, maxWidth));
  const height = Math.round(sh * (width / sw));
  return { w: width, h: height };
}

function renderToCanvas(img, aspect, maxWidth, anchorX, anchorY) {
  const { sx, sy, sw, sh } = getCropParams(
    img.naturalWidth,
    img.naturalHeight,
    aspect,
    anchorX,
    anchorY
  );
  const { w, h } = getOutputDims(sw, sh, maxWidth);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable");

  const scale = sw / w;

  if (scale <= 2) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "low";
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    return canvas;
  }

  let source = document.createElement("canvas");
  source.width = sw;
  source.height = sh;
  const srcCtx = source.getContext("2d");
  if (!srcCtx) throw new Error("2D context unavailable");
  srcCtx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

  while (source.width / 2 > w) {
    const half = document.createElement("canvas");
    half.width = Math.max(w, Math.round(source.width / 2));
    half.height = Math.max(h, Math.round(source.height / 2));
    const hCtx = half.getContext("2d");
    hCtx.imageSmoothingEnabled = true;
    hCtx.imageSmoothingQuality = "low";
    hCtx.drawImage(source, 0, 0, half.width, half.height);
    source = half;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "low";
  ctx.drawImage(source, 0, 0, w, h);
  return canvas;
}

function invalidateCanvases() {
  for (const entry of state.files) entry.canvas = null;
}

function getCanvas(entry) {
  if (!entry.canvas)
    entry.canvas = renderToCanvas(
      entry.img,
      state.aspect,
      state.maxWidth,
      state.anchorX,
      state.anchorY
    );
  return entry.canvas;
}

function canvasToBlob(canvas, quality, mime) {
  return new Promise((resolve, reject) => {
    const q = mime === "image/png" ? undefined : quality / 100;
    canvas.toBlob(
      (blob) => {
        if (!blob)
          reject(new Error(`toBlob failed (${canvas.width}x${canvas.height})`));
        else resolve(blob);
      },
      mime,
      q
    );
  });
}

function sanitizeName(name) {
  return (
    name
      .replace(/\.[^.]+$/, "")
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "-")
      .trim() || "image"
  );
}

function loadFiles(fileList) {
  for (const file of fileList) {
    if (!file.type.startsWith("image/")) continue;
    if (
      state.files.some(
        (f) =>
          f.name === file.name &&
          f.size === file.size &&
          f.file.lastModified === file.lastModified
      )
    )
      continue;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onerror = () => URL.revokeObjectURL(url);
    img.onload = () => {
      state.files.push({
        file,
        img,
        url,
        name: file.name,
        id: crypto.randomUUID(),
        canvas: null
      });
      renderGrid();
      updateButtons();
    };
    img.src = url;
  }
}

function removeFile(id) {
  const entry = state.files.find((f) => f.id === id);
  if (entry) URL.revokeObjectURL(entry.url);
  state.files = state.files.filter((f) => f.id !== id);
  renderGrid();
  updateButtons();
}

function makePreviewImg(entry) {
  const img = document.createElement("img");
  img.src = entry.url;
  img.style.objectPosition = `${state.anchorX * 100}% ${state.anchorY * 100}%`;
  return img;
}

function renderGrid() {
  const frag = document.createDocumentFragment();

  for (const entry of state.files) {
    const output = getCanvas(entry);
    const preview = makePreviewImg(entry);

    const card = document.createElement("div");
    card.className = "preview-card";

    const ar =
      state.aspect === "original"
        ? `${entry.img.naturalWidth} / ${entry.img.naturalHeight}`
        : state.aspect.replace(":", " / ");

    const wrap = document.createElement("div");
    wrap.className = "preview-canvas-wrap";
    wrap.style.aspectRatio = ar;
    wrap.append(preview);

    const info = document.createElement("div");
    info.className = "preview-info";

    const name_el = document.createElement("div");
    name_el.className = "preview-name";
    name_el.title = entry.name;
    name_el.textContent = entry.name.replace(/\.[^.]+$/, "");

    const dims_el = document.createElement("div");
    dims_el.className = "preview-dims";
    dims_el.textContent = `${output.width} × ${output.height}`;

    const remove_btn = document.createElement("button");
    remove_btn.className = "preview-remove";
    remove_btn.setAttribute("aria-label", `Remove ${entry.name}`);
    remove_btn.innerHTML = CLOSE_SVG;
    remove_btn.addEventListener("click", () => removeFile(entry.id));

    const download_btn = document.createElement("button");
    download_btn.className = "preview-download";
    download_btn.setAttribute("aria-label", `Download ${entry.name}`);
    download_btn.innerHTML = DOWNLOAD_SVG;
    download_btn.addEventListener("click", async () => {
      const mime = MIME_MAP[state.format] || "image/webp";
      const ext = state.format === "jpeg" ? "jpg" : state.format;
      const suffix =
        state.aspect === "original" ? "" : `-${state.aspect.replace(":", "x")}`;
      const prefix = state.prefix.trim() || "thumb";
      const base = sanitizeName(entry.name);
      const num = String(state.files.indexOf(entry) + 1).padStart(2, "0");
      let filename;
      if (state.naming === "original") filename = `${base}${suffix}.${ext}`;
      else if (state.naming === "num")
        filename = `${prefix}-${num}${suffix}.${ext}`;
      else if (state.naming === "prefix-original")
        filename = `${prefix}-${base}-${num}${suffix}.${ext}`;
      else filename = `${prefix}-${num}${suffix}.${ext}`;
      const canvas = renderToCanvas(
        entry.img,
        state.aspect,
        state.maxWidth,
        state.anchorX,
        state.anchorY
      );
      const blob = await canvasToBlob(canvas, state.quality, mime);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    });

    const info_text = document.createElement("div");
    info_text.className = "preview-info-text";
    info_text.append(name_el, dims_el);

    const info_actions = document.createElement("div");
    info_actions.className = "preview-info-actions";
    info_actions.append(download_btn, remove_btn);

    info.append(info_text, info_actions);
    card.append(wrap, info);
    frag.append(card);
  }

  preview_grid.innerHTML = "";
  preview_grid.append(frag);

  setStatus(
    state.files.length
      ? `${state.files.length} image${state.files.length > 1 ? "s" : ""} loaded`
      : ""
  );
}

function lockUI() {
  state.processing = true;
  aspect_grid.style.pointerEvents = "none";
  btn_export.disabled = true;
  btn_clear.disabled = true;
}

function unlockUI() {
  state.processing = false;
  aspect_grid.style.pointerEvents = "";
  updateButtons();
}

async function exportZip() {
  if (!state.files.length || state.processing) return;
  lockUI();

  try {
    const prefix = state.prefix.trim() || "thumb";
    const suffix =
      state.aspect === "original" ? "" : `-${state.aspect.replace(":", "x")}`;
    const today = new Date().toISOString().slice(0, 10);
    const mime = MIME_MAP[state.format] || "image/webp";
    const ext = state.format === "jpeg" ? "jpg" : state.format;
    const zipName = `${prefix}-${today}.zip`;
    const entries = [];

    for (let i = 0; i < state.files.length; i++) {
      const entry = state.files[i];
      setStatus(`Processing ${i + 1} / ${state.files.length}…`);
      const blob = await canvasToBlob(getCanvas(entry), state.quality, mime);
      const base = sanitizeName(entry.name);
      const num = String(i + 1).padStart(2, "0");
      let filename;
      if (state.naming === "original") filename = `${base}${suffix}.${ext}`;
      else if (state.naming === "num")
        filename = `${prefix}-${num}${suffix}.${ext}`;
      else if (state.naming === "prefix-original")
        filename = `${prefix}-${base}-${num}${suffix}.${ext}`;
      else filename = `${prefix}-${num}${suffix}.${ext}`;
      entries.push({ name: filename, blob });
    }

    const zipBlob = await buildZip(entries);
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = zipName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    setTimeout(() => {
      setStatus(
        `${zipName} — ${state.files.length} file${
          state.files.length > 1 ? "s" : ""
        }`
      );
    }, 100);
  } catch (err) {
    setStatus(`Error: ${err.message}`);
  } finally {
    unlockUI();
  }
}

function updateButtons() {
  const has = state.files.length > 0;
  btn_clear.disabled = !has || state.processing;
  btn_export.disabled = !has || state.processing;
}

function setStatus(msg) {
  status_bar.textContent = msg;
}

drop_zone.addEventListener("dragover", (e) => {
  e.preventDefault();
  drop_zone.classList.add("is-over");
});

drop_zone.addEventListener("dragleave", (e) => {
  if (!e.relatedTarget || !drop_zone.contains(e.relatedTarget))
    drop_zone.classList.remove("is-over");
});

drop_zone.addEventListener("drop", (e) => {
  e.preventDefault();
  drop_zone.classList.remove("is-over");
  loadFiles(e.dataTransfer.files);
});

drop_zone.addEventListener("click", (e) => {
  if (e.target.tagName !== "LABEL" && e.target.tagName !== "INPUT")
    file_input.click();
});

drop_zone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    file_input.click();
  }
});

file_input.addEventListener("change", (e) => {
  loadFiles(e.target.files);
  file_input.value = "";
});

aspect_grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".aspect-btn");
  if (!btn) return;
  aspect_buttons.forEach((b) => b.classList.remove("is-active"));
  btn.classList.add("is-active");
  state.aspect = btn.dataset.aspect;
  invalidateCanvases();
  renderGrid();
  updateNamingPreview();
});

if (format_grid) {
  format_grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".format-btn");
    if (!btn) return;
    format_grid
      .querySelectorAll(".format-btn")
      .forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    state.format = btn.dataset.format;
    row_quality.classList.toggle("is-hidden", state.format === "png");
    format_hint.textContent =
      state.format === "webp"
        ? "Browser WebP encoding is lossy by default. Small thumbnails may appear softer than JPG or PNG at the same size."
        : "";
    updateNamingPreview();
  });
}

anchor_grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".anchor-btn");
  if (!btn) return;
  anchor_buttons.forEach((b) => b.classList.remove("is-active"));
  btn.classList.add("is-active");
  state.anchorX = +btn.dataset.ax;
  state.anchorY = +btn.dataset.ay;
  invalidateCanvases();
  renderGrid();
});

naming_grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".naming-btn");
  if (!btn) return;
  naming_buttons.forEach((b) => b.classList.remove("is-active"));
  btn.classList.add("is-active");
  state.naming = btn.dataset.mode;
  row_prefix.style.display = state.naming === "original" ? "none" : "";
  updateNamingPreview();
});

quality_range.addEventListener("input", () => {
  state.quality = +quality_range.value;
  quality_readout.textContent = state.quality;
});

let max_width_timer = null;
max_width_input.addEventListener("input", () => {
  clearTimeout(max_width_timer);
  max_width_timer = setTimeout(() => {
    const v = +max_width_input.value;
    if (v >= 64 && v <= 8192) {
      state.maxWidth = v;
      invalidateCanvases();
      renderGrid();
    }
  }, 400);
});

prefix_input.addEventListener("input", () => {
  state.prefix = prefix_input.value;
  updateNamingPreview();
});

btn_clear.addEventListener("click", () => {
  for (const { url } of state.files) URL.revokeObjectURL(url);
  state.files = [];
  renderGrid();
  updateButtons();
  setStatus("");
});

btn_export.addEventListener("click", exportZip);

state.maxWidth = +max_width_input.value || 1024;
state.quality = +quality_range.value || 90;
quality_readout.textContent = state.quality;
format_hint.textContent =
  state.format === "webp"
    ? "Browser WebP encoding is lossy by default. Small thumbnails may appear softer than JPG or PNG at the same size."
    : "";
updateNamingPreview();