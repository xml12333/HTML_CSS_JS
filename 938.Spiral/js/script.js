const textPath1 = document.getElementById("spiralText1");
const textPath2 = document.getElementById("spiralText2");
const textPath3 = document.getElementById("spiralText3");
const spiralPath = document.getElementById("spiralPath");
const spiralSVG = document.querySelector(".spiral-svg");

const toggleBtn = document.getElementById("toggleBtn");

let isPlaying = true;
let lastTime = null;
let offset = 0;

function generateSpiralPath(cx, cy, a, b, turns, pointsPerTurn = 400) {
  let d = `M${cx},${cy}`;
  const totalPoints = turns * pointsPerTurn;

  for (let i = 0; i < totalPoints; i++) {
    const theta = i * (2 * Math.PI / pointsPerTurn);
    const r = a + b * theta;
    const x = cx + r * Math.cos(theta);
    const y = cy + r * Math.sin(theta);
    d += ` L${x},${y}`;
  }

  return d;
}

function centerSpiral() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const cx = width / 2;
  const cy = height / 2;

  spiralSVG.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const spiralD = generateSpiralPath(cx, cy, 0, 6, 20);
  spiralPath.setAttribute("d", spiralD);
}

centerSpiral();
window.addEventListener("resize", centerSpiral);

function animateText(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  if (isPlaying) {
    offset += delta * 0.0005;
    if (offset > 100) offset -= 100;
  }

  textPath1.setAttribute("startOffset", `${offset}%`);
  textPath2.setAttribute("startOffset", `${offset - 2.28}%`);
  textPath3.setAttribute("startOffset", `${offset - 4.56}%`);

  requestAnimationFrame(animateText);
}
requestAnimationFrame(animateText);

toggleBtn.addEventListener("click", () => {
  isPlaying = !isPlaying;
  toggleBtn.textContent = isPlaying ? "⏸️ Stop" : "▶️ Play";
});