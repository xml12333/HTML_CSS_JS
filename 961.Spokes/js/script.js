function createSpokesSVG(n, size = 100, strokeWidth = 4) {
  const r = size * 0.2;
  const off = Math.PI / 2;
  const step = (2 * Math.PI) / n;

  let d = "";
  for (let i = 0; i < n; i++) {
    const t = off + i * step;
    const x = r * Math.cos(t);
    const y = r * Math.sin(t);
    d += `M 0 0 L ${x} ${y} `;
  }

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.setAttribute("viewBox", `${-size / 2} ${-size / 2} ${size} ${size}`);

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d.trim());
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", strokeWidth);
  path.setAttribute("stroke-linecap", "round");

  svg.appendChild(path);
  return svg;
}

const grid = document.querySelector("#grid");
for (let t = 4; t <= 50; t += 0.5) {
  for (let n = 3; n <= 12; n += 0.5) {
    grid.appendChild(createSpokesSVG(n, 100, t));
  }
}