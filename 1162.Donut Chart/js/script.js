/* ════════════════════════════════════════
   DATA
═══════════════════════════════════════ */
const MONTHS = [
  [
    { label: "Rent", value: 1150, c1: "#ff6b9d", c2: "#e0447a" },
    { label: "Groceries", value: 620, c1: "#7dd3a0", c2: "#3fa06c" },
    { label: "Transport", value: 340, c1: "#7aa8ff", c2: "#4b7fe0" },
    { label: "Coffee", value: 285, c1: "#c98d4e", c2: "#9c6428" },
    { label: "Subscriptions", value: 245, c1: "#c084fc", c2: "#9333ea" },
    { label: "Actual donuts", value: 600, c1: "#ffcf5c", c2: "#e0a020" }
  ],
  [
    { label: "Rent", value: 1150, c1: "#ff6b9d", c2: "#e0447a" },
    { label: "Groceries", value: 510, c1: "#7dd3a0", c2: "#3fa06c" },
    { label: "Transport", value: 190, c1: "#7aa8ff", c2: "#4b7fe0" },
    { label: "Coffee", value: 410, c1: "#c98d4e", c2: "#9c6428" },
    { label: "Subscriptions", value: 300, c1: "#c084fc", c2: "#9333ea" },
    { label: "Actual donuts", value: 880, c1: "#ffcf5c", c2: "#e0a020" }
  ],
  [
    { label: "Rent", value: 1150, c1: "#ff6b9d", c2: "#e0447a" },
    { label: "Groceries", value: 700, c1: "#7dd3a0", c2: "#3fa06c" },
    { label: "Transport", value: 420, c1: "#7aa8ff", c2: "#4b7fe0" },
    { label: "Coffee", value: 160, c1: "#c98d4e", c2: "#9c6428" },
    { label: "Subscriptions", value: 180, c1: "#c084fc", c2: "#9333ea" },
    { label: "Actual donuts", value: 320, c1: "#ffcf5c", c2: "#e0a020" }
  ]
];
let monthIdx = 0;
let DATA = MONTHS[0];

const CX = 200,
  CY = 200,
  R_OUT = 152,
  R_IN = 62;

const slicesEl = document.getElementById("slices");
const sprEl = document.getElementById("sprinkles");
const legendEl = document.getElementById("legend");
const roVal = document.getElementById("ro-val");
const roLab = document.getElementById("ro-lab");
const donutEl = document.getElementById("donut");
const svgNS = "http://www.w3.org/2000/svg";

let bitten = false;
let total = 0;

/* ════════════════════════════════════════
   GEOMETRY
═══════════════════════════════════════ */
function pt(cx, cy, r, deg) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}
function ringSlice(a0, a1, rOut, rIn) {
  const [x0, y0] = pt(CX, CY, rOut, a0);
  const [x1, y1] = pt(CX, CY, rOut, a1);
  const [x2, y2] = pt(CX, CY, rIn, a1);
  const [x3, y3] = pt(CX, CY, rIn, a0);
  const big = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${rOut} ${rOut} 0 ${big} 1 ${x1} ${y1}
          L ${x2} ${y2} A ${rIn} ${rIn} 0 ${big} 0 ${x3} ${y3} Z`;
}
/* wavy drip along the outer edge of a slice */
function dripPath(a0, a1) {
  const steps = Math.max(4, Math.round((a1 - a0) / 7));
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const a = a0 + (a1 - a0) * (i / steps);
    const wob = Math.sin(i * 1.9 + a0) * 5 + 4;
    const [x, y] = pt(CX, CY, R_OUT + wob * 0.5, a);
    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  for (let i = steps; i >= 0; i--) {
    const a = a0 + (a1 - a0) * (i / steps);
    const [x, y] = pt(CX, CY, R_OUT - 4, a);
    d += ` L ${x} ${y}`;
  }
  return d + " Z";
}

/* ════════════════════════════════════════
   BUILD
═══════════════════════════════════════ */
function build() {
  slicesEl.innerHTML = "";
  sprEl.innerHTML = "";
  legendEl.innerHTML = "";

  total = DATA.reduce((s, d) => s + d.value, 0);
  let angle = -12; // slight rotation so it doesn't feel machine-made

  DATA.forEach((d, i) => {
    const span = (d.value / total) * 360;
    const a0 = angle,
      a1 = angle + span;
    const mid = (a0 + a1) / 2;
    angle = a1;

    /* gradient per slice */
    const grad = document.createElementNS(svgNS, "radialGradient");
    grad.id = `g${i}`;
    grad.setAttribute("cx", "38%");
    grad.setAttribute("cy", "30%");
    grad.setAttribute("r", "75%");
    grad.innerHTML = `<stop offset="0%" stop-color="${d.c1}"/>
       <stop offset="62%" stop-color="${d.c1}"/>
       <stop offset="100%" stop-color="${d.c2}"/>`;
    slicesEl.appendChild(grad);

    /* group */
    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("class", "slice");
    g.dataset.i = i;

    /* drip under-layer */
    const drip = document.createElementNS(svgNS, "path");
    drip.setAttribute("d", dripPath(a0, a1));
    drip.setAttribute("fill", d.c2);
    drip.setAttribute("class", "drip");
    g.appendChild(drip);

    /* frosting body */
    const p = document.createElementNS(svgNS, "path");
    p.setAttribute("d", ringSlice(a0, a1, R_OUT, R_IN));
    p.setAttribute("fill", `url(#g${i})`);
    p.setAttribute("stroke", "rgba(255,255,255,0.28)");
    p.setAttribute("stroke-width", "1");
    g.appendChild(p);

    /* inner shadow at the hole edge */
    const sh = document.createElementNS(svgNS, "path");
    sh.setAttribute("d", ringSlice(a0, a1, R_IN + 9, R_IN));
    sh.setAttribute("fill", "rgba(60,20,10,0.16)");
    sh.setAttribute("pointer-events", "none");
    g.appendChild(sh);

    slicesEl.appendChild(g);

    /* offset on hover */
    const [ox, oy] = [
      Math.cos(((mid - 90) * Math.PI) / 180),
      Math.sin(((mid - 90) * Math.PI) / 180)
    ];
    g.addEventListener("mouseenter", () => {
      g.style.transform = `translate(${ox * 13}px, ${oy * 13}px)`;
      document.querySelectorAll(".slice").forEach((s) => {
        if (s !== g) s.classList.add("dim");
      });
      document.querySelectorAll(".spr").forEach((s) => {
        if (+s.dataset.i === i)
          s.style.transform = `translate(${ox * 13}px, ${oy * 13}px) rotate(${s.dataset.rot}deg) scale(1.25)`;
      });
      setReadout(d);
      legendEl.children[i].classList.add("active");
    });
    g.addEventListener("mouseleave", () => {
      g.style.transform = "";
      document
        .querySelectorAll(".slice")
        .forEach((s) => s.classList.remove("dim"));
      document.querySelectorAll(".spr").forEach((s) => {
        s.style.transform = `rotate(${s.dataset.rot}deg)`;
      });
      resetReadout();
      legendEl.children[i].classList.remove("active");
    });

    /* sprinkles scattered within this slice's arc */
    const count = Math.max(3, Math.round(span / 7));
    for (let k = 0; k < count; k++) {
      const a = a0 + Math.random() * span;
      const r = R_IN + 16 + Math.random() * (R_OUT - R_IN - 30);
      const [sx, sy] = pt(50, 50, (r / 400) * 100, a);
      const s = document.createElement("i");
      s.className = "spr";
      s.dataset.i = i;
      const rot = Math.random() * 180;
      s.dataset.rot = rot;
      const w = 3 + Math.random() * 2;
      s.style.cssText = `
        left:${sx}%; top:${sy}%;
        width:${w * 2.6}px; height:${w}px;
        background:${SPRINKLE[k % SPRINKLE.length]};
        transform: rotate(${rot}deg);
        margin-left:${-w * 1.3}px; margin-top:${-w / 2}px;`;
      sprEl.appendChild(s);
    }

    /* legend chip */
    const li = document.createElement("li");
    li.className = "lg";
    li.innerHTML = `
      <span class="lg-swatch" style="background:linear-gradient(140deg,${d.c1},${d.c2})"></span>
      ${d.label}
      <span class="lg-pct">${Math.round((d.value / total) * 100)}%</span>`;
    li.addEventListener("mouseenter", () =>
      g.dispatchEvent(new Event("mouseenter"))
    );
    li.addEventListener("mouseleave", () =>
      g.dispatchEvent(new Event("mouseleave"))
    );
    legendEl.appendChild(li);
  });

  resetReadout();
  scatterCrumbs();
}

const SPRINKLE = [
  "#fff",
  "#ff6b9d",
  "#7dd3a0",
  "#7aa8ff",
  "#ffcf5c",
  "#c084fc"
];

/* ════════════════════════════════════════
   READOUT
═══════════════════════════════════════ */
function setReadout(d) {
  roVal.textContent = "€" + d.value.toLocaleString();
  roLab.textContent = d.label.toLowerCase();
}
function resetReadout() {
  roVal.textContent = "€" + total.toLocaleString();
  roLab.textContent = "total monthly";
}

/* ════════════════════════════════════════
   CRUMBS ON THE PLATE
═══════════════════════════════════════ */
function scatterCrumbs() {
  const c = document.getElementById("crumbs");
  c.innerHTML = "";
  for (let i = 0; i < 16; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 44 + Math.random() * 8;
    const el = document.createElement("i");
    el.className = "crumb";
    const sz = 2 + Math.random() * 4;
    el.style.cssText = `
      left:${50 + Math.cos(a) * r}%;
      top:${50 + Math.sin(a) * r}%;
      width:${sz}px; height:${sz * 0.8}px;
      transform: rotate(${Math.random() * 360}deg);
      opacity:${0.4 + Math.random() * 0.4};`;
    c.appendChild(el);
  }
}

/* ════════════════════════════════════════
   BITE
═══════════════════════════════════════ */
const svg = document.querySelector(".rings");
document.getElementById("bite").addEventListener("click", () => {
  bitten = !bitten;
  let mask = document.getElementById("bitemask");
  if (bitten) {
    if (!mask) {
      mask = document.createElementNS(svgNS, "g");
      mask.id = "bitemask";
      /* three overlapping circles = a bite */
      [
        [318, 118, 46],
        [352, 150, 34],
        [300, 82, 30]
      ].forEach(([x, y, r]) => {
        const c = document.createElementNS(svgNS, "circle");
        c.setAttribute("cx", x);
        c.setAttribute("cy", y);
        c.setAttribute("r", r);
        c.setAttribute("fill", "#fff6e9");
        mask.appendChild(c);
      });
      svg.appendChild(mask);
    }
    mask.style.display = "";
    document.getElementById("bite").textContent = "🍩 Un-bite";
    /* crumbs fly */
    for (let i = 0; i < 10; i++) {
      const el = document.createElement("i");
      el.className = "crumb";
      const sz = 2 + Math.random() * 4;
      el.style.cssText = `left:78%; top:26%; width:${sz}px; height:${sz}px;`;
      document.getElementById("crumbs").appendChild(el);
      el.animate(
        [
          { transform: "translate(0,0) rotate(0)", opacity: 1 },
          {
            transform: `translate(${(Math.random() - 0.3) * 90}px, ${40 + Math.random() * 70}px) rotate(${Math.random() * 400}deg)`,
            opacity: 0
          }
        ],
        {
          duration: 800 + Math.random() * 400,
          easing: "cubic-bezier(.3,1,.5,1)"
        }
      );
      setTimeout(() => el.remove(), 1200);
    }
  } else {
    mask.style.display = "none";
    document.getElementById("bite").textContent = "🍩 Take a bite";
  }
});

/* ════════════════════════════════════════
   SHUFFLE MONTH
═══════════════════════════════════════ */
document.getElementById("shuffle").addEventListener("click", () => {
  monthIdx = (monthIdx + 1) % MONTHS.length;
  DATA = MONTHS[monthIdx];
  donutEl.style.animation = "none";
  void donutEl.offsetWidth;
  donutEl.style.animation = "";
  build();
  if (bitten) {
    const m = document.getElementById("bitemask");
    if (m) svg.appendChild(m); // keep the bite on top
  }
});

/* ── INIT ── */
build();
