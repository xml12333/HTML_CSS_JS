// for a more dev friendly experience try: https://meodai.github.io/poline/
console.clear();

const positionFunctions = {
  linear: t => t,
  exponential: t => t * t,
  quadratic: t => t * t * t,
  sinusoidal: t => Math.sin(t * Math.PI / 2),
  asinusoidal: t => Math.asin(t) / (Math.PI / 2),
  smoothStep: t => t * t * (3 - 2 * t),
  arc: t => 1 - Math.sqrt(1 - t * t) };


let state = {
  numColorStops: 9,
  positionFunction: "smoothStep",
  startSaturation: 0.55,
  endSaturation: 0.8,
  invertLightness: true,
  invertXY: false,
  points: [
  { x: 0.3, y: 0.5, type: "point" },
  { x: 0.35, y: 0.45, type: "control" },
  { x: 0.65, y: 0.55, type: "control" },
  { x: 0.7, y: 0.5, type: "point" }],

  activePoint: null,
  colorMode: "hsl" };


const gamut = window.matchMedia("(color-gamut: p3)").matches ?
"display-p3" :
"srgb";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { colorSpace: gamut });
const canvasContainer = document.getElementById("canvasContainer");
const colorStrip = document.getElementById("colorStrip");

function updateLabels() {
  document.querySelectorAll("[data-label]").forEach(label => {
    const stateName = label.dataset.label;
    const value = state[stateName];
    if (typeof value === "number") {
      if (stateName.includes("Saturation")) {
        label.textContent = Math.round(value * 100);
      } else {
        label.textContent = value;
      }
    }
  });
}

function handleControlChange(e) {
  const element = e.target;
  const stateName = element.dataset.state;
  const dataType = element.dataset.type;

  if (!stateName) return;

  let value;
  if (element.type === "checkbox") {
    value = element.checked;
  } else if (dataType === "int") {
    value = parseInt(element.value);
  } else if (dataType === "percent") {
    value = parseInt(element.value) / 100;
  } else {
    value = element.value;
  }

  state[stateName] = value;
  updateLabels();
  render();
}

function mapToCircle(x, y, constrainToCircle = false) {
  const centerX = 0.5;
  const centerY = 0.5;

  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;

  const pixelX = x * width;
  const pixelY = y * height;
  const pixelCenterX = centerX * width;
  const pixelCenterY = centerY * height;

  const dx = pixelX - pixelCenterX;
  const dy = pixelY - pixelCenterY;

  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  let maxRadius;
  if (constrainToCircle) {
    maxRadius = Math.min(width, height) * 0.4;
  } else {
    maxRadius = Math.min(width, height) * 0.55;
  }

  const constrainedDistance = Math.min(distance, maxRadius);

  const newPixelX = pixelCenterX + constrainedDistance * Math.cos(angle);
  const newPixelY = pixelCenterY + constrainedDistance * Math.sin(angle);

  return {
    x: newPixelX / width,
    y: newPixelY / height };

}

function cartesianToPolar(x, y) {
  const centerX = 0.5;
  const centerY = 0.5;

  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;

  const pixelX = x * width;
  const pixelY = y * height;
  const pixelCenterX = centerX * width;
  const pixelCenterY = centerY * height;

  const dx = pixelX - pixelCenterX;
  const dy = pixelY - pixelCenterY;

  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  angle = (angle + 360) % 360;

  const dist = Math.sqrt(dx * dx + dy * dy);
  const circleRadius = Math.min(width, height) * 0.4;

  let lightness = 1 - Math.min(dist / circleRadius, 1);

  if (state.invertLightness) {
    lightness = 1 - lightness;
  }

  return { hue: angle, lightness };
}

function bezierPoint(t) {
  const p0 = state.points[0];
  const p1 = state.points[1];
  const p2 = state.points[2];
  const p3 = state.points[3];

  const t2 = t * t;
  const t3 = t2 * t;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;

  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y };

}

function getColors() {
  const colors = [];
  const fn = positionFunctions[state.positionFunction];

  for (let i = 0; i < state.numColorStops; i++) {
    const t = fn(i / (state.numColorStops - 1));
    const point = bezierPoint(t);
    const { hue, lightness } = cartesianToPolar(point.x, point.y);
    const saturation =
    state.startSaturation + (state.endSaturation - state.startSaturation) * t;

    colors.push([hue, saturation, lightness]);
  }
  return colors;
}

function getColorStopPoints() {
  const stopPoints = [];
  const fn = positionFunctions[state.positionFunction];

  for (let i = 0; i < state.numColorStops; i++) {
    const t = fn(i / (state.numColorStops - 1));
    stopPoints.push(bezierPoint(t));
  }
  return stopPoints;
}

const formatColor = (hue, saturation, lightness, mode = "hsl") => {
  let l = lightness;
  let s = saturation;
  if (state.invertXY) {
    s = lightness;
    l = saturation;
  }
  if (mode === "lch" || mode === "oklch") {
    // I realize that this messes with the very nature of lch or oklch
    const exponent = 10;
    const chromaReduction = 1 - Math.pow(l, exponent);
    s *= chromaReduction;
  }
  if (mode == "lch" || mode == "oklch") {
    return `${mode}(${(l * 100).toFixed(1)}% ${(s * 100).toFixed(
    1)
    }% ${hue.toFixed(1)}deg)`;
  } else if (mode === "hsl") {
    return `hsl(${hue.toFixed(1)}deg ${(s * 100).toFixed(1)}% ${(
    l * 100).
    toFixed(1)}%)`;
  } else if (mode === "hwb") {
    return `hwb(${hue.toFixed(1)}deg ${(s * 100).toFixed(1)}% ${(
    l * 100).
    toFixed(1)}%)`;
  }
};

function drawColorWheel(ctx, centerX, centerY, radius, saturation) {
  const numRings = 10;
  const ringPositions = [];
  for (let i = 0; i < numRings; i++) {
    ringPositions.push(i / (numRings - 1));
  }

  for (let angle = 0; angle < 360; angle += 1) {
    const startAngle = (angle - 0.5) * Math.PI / 180;
    const endAngle = (angle + 0.5) * Math.PI / 180;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();

    const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    radius);


    ringPositions.forEach(position => {
      let lightness;
      if (state.invertLightness) {
        lightness = position;
      } else {
        lightness = 1 - position;
      }
      gradient.addColorStop(
      position,
      formatColor(angle, saturation, lightness, state.colorMode));

    });

    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

function drawCanvas() {
  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;

  ctx.clearRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.4;

  drawColorWheel(ctx, centerX, centerY, radius, state.startSaturation);

  const startPoint = state.points[0];
  const endPoint = state.points[3];

  const maskGradient = ctx.createLinearGradient(
  startPoint.x * width,
  startPoint.y * height,
  endPoint.x * width,
  endPoint.y * height);


  ctx.globalCompositeOperation = "source-over";

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext("2d", { colorSpace: gamut });

  drawColorWheel(tempCtx, centerX, centerY, radius, state.endSaturation);

  tempCtx.globalCompositeOperation = "destination-in";
  tempCtx.fillStyle = maskGradient;
  maskGradient.addColorStop(0, "rgba(0,0,0,0)");
  maskGradient.addColorStop(1, "rgba(0,0,0,1)");
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  if (tempCanvas.width > 0 && tempCanvas.height > 0) {
    ctx.drawImage(tempCanvas, 0, 0);
  }

  // curve
  ctx.beginPath();
  ctx.moveTo(state.points[0].x * width, state.points[0].y * height);
  ctx.bezierCurveTo(
  state.points[1].x * width,
  state.points[1].y * height,
  state.points[2].x * width,
  state.points[2].y * height,
  state.points[3].x * width,
  state.points[3].y * height);

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1;
  ctx.stroke();

  // control lines
  ctx.beginPath();
  ctx.moveTo(state.points[0].x * width, state.points[0].y * height);
  ctx.lineTo(state.points[1].x * width, state.points[1].y * height);
  ctx.moveTo(state.points[2].x * width, state.points[2].y * height);
  ctx.lineTo(state.points[3].x * width, state.points[3].y * height);
  ctx.strokeStyle = "#202126";
  ctx.setLineDash([2, 2]);
  ctx.stroke();
  ctx.setLineDash([]);

  // control points
  state.points.forEach(p => {
    ctx.beginPath();
    ctx.arc(
    p.x * width,
    p.y * height,
    p.type === "point" ? 8 : 5,
    0,
    Math.PI * 2);

    ctx.fillStyle = "#fff";
    ctx.stroke();
    ctx.fill();
  });

  const stopPoints = getColorStopPoints();
  const colors = getColors();
  stopPoints.forEach((p, i) => {
    const [h, s, l] = colors[i];

    const baseSizeOuter = 5;
    const baseSizeInner = 4;
    const sizeMultiplier = 0.4 + s * 0.6;
    const outerSize = baseSizeOuter * sizeMultiplier;
    const innerSize = baseSizeInner * sizeMultiplier;

    ctx.beginPath();
    ctx.arc(p.x * width, p.y * height, outerSize, 0, Math.PI * 2);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(p.x * width, p.y * height, innerSize, 0, Math.PI * 2);
    ctx.fillStyle = formatColor(h, s, l, state.colorMode);
    ctx.fill();

    ctx.strokeStyle = "#202126";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  });
}

function updateColorStrip() {
  const colors = getColors();
  const totalColors = colors.length;

  const gradientStops = [];
  colors.forEach((color, index) => {
    const colorStr = formatColor(color[0], color[1], color[2], state.colorMode);
    const startPercent = (index / totalColors * 100).toFixed(2);
    const endPercent = ((index + 1) / totalColors * 100).toFixed(2);
    gradientStops.push(`${colorStr} ${startPercent}% ${endPercent}%`);
  });

  const gradient = `linear-gradient(to right, ${gradientStops.join(", ")})`;
  document.documentElement.style.setProperty('--grad', gradient);
}

function updateBackgroundColor() {
  if (state.invertLightness) {
    document.body.classList.remove("inverted-lightness");
  } else {
    document.body.classList.add("inverted-lightness");
  }
}

function rotateAllPoints(angleRadians) {
  const centerX = 0.5;
  const centerY = 0.5;

  state.points = state.points.map(point => {
    const dx = point.x - centerX;
    const dy = point.y - centerY;

    const cos = Math.cos(angleRadians);
    const sin = Math.sin(angleRadians);

    const newDx = dx * cos - dy * sin;
    const newDy = dx * sin + dy * cos;

    return {
      ...point,
      x: centerX + newDx,
      y: centerY + newDy };

  });
}

function updateLinkedPoints(idx, newX, newY) {
  const dx = newX - state.points[idx].x;
  const dy = newY - state.points[idx].y;

  state.points[idx] = { ...state.points[idx], x: newX, y: newY };

  if (idx === 0) {
    const controlPoint = mapToCircle(
    state.points[1].x + dx,
    state.points[1].y + dy,
    false);

    state.points[1] = {
      ...state.points[1],
      x: controlPoint.x,
      y: controlPoint.y };

  } else if (idx === 3) {
    const controlPoint = mapToCircle(
    state.points[2].x + dx,
    state.points[2].y + dy,
    false);

    state.points[2] = {
      ...state.points[2],
      x: controlPoint.x,
      y: controlPoint.y };

  }
}

let nameTimer = null;
const $namesContainer = document.querySelector('[data-colornames]');

function render() {
  drawCanvas();
  updateColorStrip();
  updateBackgroundColor();
  if (nameTimer) clearTimeout(nameTimer);
  nameTimer = setTimeout(async () => {
    const colorsCSS = getColors().map(color => formatColor(color[0], color[1], color[2], state.colorMode));
    const swatchesHTML = await getNames(colorsToHex(colorsCSS)).then(d => {
      return d.colors.map((colorName, i) => getSwatchForColorName(colorName, colorsCSS[i], d.colors.length));
    });
    $namesContainer.innerHTML = swatchesHTML.join('');
  }, 200);
}

function initCanvas() {
  const rect = canvasContainer.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio;
  canvas.height = rect.height * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

const init = () => {
  initCanvas();
  render();
};

function setupEventListeners() {
  document.querySelectorAll("[data-state]").forEach(element => {
    const eventType = element.type === "range" ? "input" : "change";
    element.addEventListener(eventType, handleControlChange);
  });

  canvasContainer.addEventListener("pointerdown", e => {
    e.preventDefault();
    document.documentElement.classList.add("dragging");
    const rect = canvasContainer.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    let closestIndex = 0;
    let closestDistance = Infinity;

    state.points.forEach((point, index) => {
      const distance = Math.hypot(point.x - x, point.y - y);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    state.activePoint = closestIndex;
  }, { passive: false });

  canvasContainer.addEventListener("pointermove", e => {
    if (state.activePoint === null) return;
    e.preventDefault();

    const rect = canvasContainer.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const isEndpoint = state.points[state.activePoint].type === "point";
    const mapped = mapToCircle(x, y, isEndpoint);
    updateLinkedPoints(state.activePoint, mapped.x, mapped.y);
    render();
  }, { passive: false });

  const handleMouseUp = () => {
    state.activePoint = null;
    document.documentElement.classList.remove("dragging");
  };

  canvasContainer.addEventListener("pointerup", handleMouseUp);
  canvasContainer.addEventListener("pointerleave", handleMouseUp);

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      rotateAllPoints(-Math.PI / 180);
      render();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      rotateAllPoints(Math.PI / 180);
      render();
    }
  }, { passive: false });

  let timer = null;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(() => init(), 100);
  });

  const orientationQuery = window.matchMedia("(orientation: landscape)");
  orientationQuery.addEventListener("change", () => {
    clearTimeout(timer);
    timer = setTimeout(() => init(), 100);
  });
}

init();
setupEventListeners();


// only needed for the named colors:
import { formatHex } from 'https://cdn.skypack.dev/culori';

function colorsToHex(CSScolorArr, noHash = true) {
  return CSScolorArr.map(color => {
    const hex = formatHex(color);
    if (noHash) {
      return hex.slice(1);
    }
    return hex;
  });
}

async function getNames(hexArr) {
  const resp = await fetch(`https://api.color.pizza/v1/?values=${hexArr.join()}&list=bestOf&noduplicates=true`);
  return await resp.json();
}


function getSwatchForColorName(colorNameObj, cssColor, length) {
  const { requestedHex, name, bestContrast } = colorNameObj;
  return `<aside class="colorSwatch" style="--ch: ${requestedHex}; --cc: ${cssColor}; --ct: ${bestContrast}; --basis: ${1 / length}">
    <div class="colorSwatch__inner">
      <h3 class="colorSwatch__title">${name}</h3>
      <strong class="colorSwatch__value">${requestedHex}</strong>
    </div>
  </aside>`;
}