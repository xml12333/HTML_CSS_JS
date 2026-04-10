const HEXES = "3b82f61d4ed822c55e15803def4444b91c1cff6a00cc5500ffc800cca00014b8a60f766edb3b7cb02e649356d46b3fa13341551e293bffbf00cc9900ffffffd3e2ef".match(
  /.{6}/g
);
const COLORS = {
  blue: 0,
  green: 1,
  red: 2,
  orange: 3,
  yellow: 4,
  teal: 5,
  pink: 6,
  purple: 7,
  slate: 8,
  amber: 9,
  white: 10
};
const CTX = document.createElement("canvas").getContext("2d");

const S = (w, h, r, x, y, p = "") => {
  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < 31; i++) {
      let q = ((j + i / 30) * Math.PI) / 2,
        c = Math.cos(q),
        s = Math.sin(q);
      p +=
        (j || i ? "L" : "M") +
        (x +
          (c > 0 ? w - r : r) +
          Math.sign(c) * Math.pow(Math.abs(c), 0.6) * r) +
        " " +
        (y +
          (s > 0 ? h - r : r) +
          Math.sign(s) * Math.pow(Math.abs(s), 0.6) * r);
    }
  }
  return p + "Z";
};

const createBtn = (cfg) => {
  const el = document.createElement("div");
  el.className = `inline-block no-select cursor-pointer ${cfg.class || ""}`;
  let p = 0,
    w = 0,
    u = Math.random().toString(36).slice(2);

  const render = () => {
    const {
      c = "blue",
      l = "",
      i = "",
      h = 44,
      sq = false,
      floating = false
    } = cfg;
    const idx = COLORS[c] || 0,
      hb = HEXES[idx * 2],
      hd = HEXES[idx * 2 + 1],
      white = c === "white";
    const color = (hex, pct, k) => `color-mix(in srgb, #${hex} ${pct}%, ${k})`;
    const hi = color(hb, 70, "white"),
      sh = color(hd, 35, "black");
    const scale = h / 40,
      label = l.toUpperCase();

    if (!w) {
      CTX.font = "900 15px system-ui";
      w = sq
        ? 48
        : Math.ceil((CTX.measureText(label).width + (i ? 100 : 80)) * 1.1);
    }

    const faceY = 4 + p * 5,
      baseY = 12,
      z = Math.min(0.5, 20 / w);
    const dy = floating ? 24 - p * 12 : 4 - p * 2,
      std = floating ? 12 - p * 6 : 3 - p * 1.5,
      op = floating ? 0.15 : 0.3;

    el.style.width = el.classList.contains("w-full")
      ? "100%"
      : `${(w + 10) * scale}px`;
    el.style.height = `${60 * scale}px`;

    el.innerHTML = `
                <svg viewBox="0 0 ${
                  w + 10
                } 60" style="width:100%;height:100%;overflow:visible" preserveAspectRatio="none">
                    <defs>
                        <filter id="b${u}" x="-100%" y="-100%" width="300%" height="300%"><feDropShadow dy="${dy}" stdDeviation="${std}" flood-color="${sh}" flood-opacity="${op}"/></filter>
                        <linearGradient id="g${u}">
                            <stop offset="0" stop-color="${color(
                              hd,
                              65,
                              "white"
                            )}"/>
                            <stop offset="${z}" stop-color="${color(
      hd,
      90,
      "white"
    )}"/>
                            <stop offset="${1 - z}" stop-color="${color(
      hd,
      90,
      "white"
    )}"/>
                            <stop offset="1" stop-color="${color(
                              hd,
                              65,
                              "white"
                            )}"/>
                        </linearGradient>
                    </defs>
                    <path d="${S(w, 40, 18, 5, baseY)}" fill="${color(
      hd,
      60,
      "black"
    )}" filter="url(#b${u})"/>
                    <path d="${S(w, 40, 18, 5, baseY)}" fill="${color(
      hd,
      80,
      "black"
    )}" stroke="${floating ? hi : color(hd, 50, "black")}" stroke-width="1"/>
                    ${Array.from({ length: Math.max(0, baseY - faceY) })
                      .map(
                        (_, k) =>
                          `<path d="${S(
                            w,
                            40,
                            18,
                            5,
                            faceY + 1 + k
                          )}" fill="url(#g${u})"/>`
                      )
                      .join("")}
                    <path d="${S(w, 40, 18, 5, faceY)}" fill="${
      white ? "#fff" : "#" + hb
    }" stroke="${white ? "#e2e8f0" : hi}" stroke-width="1.5"/>
                    <text x="${5 + w / 2}" y="${
      20 + faceY
    }" text-anchor="middle" dominant-baseline="central" fill="${
      white ? "#3b82f6" : "#fff"
    }" style="pointer-events:none;font-weight:900">
                        <tspan style="font-family:'Material Icons';font-size:${
                          sq ? "26px" : "20px"
                        }" dy="1">${i}</tspan>
                        ${
                          !sq
                            ? `<tspan dx="${
                                i ? 8 : 0
                              }" dy="0" font-size="15" style="letter-spacing:1px;font-family:system-ui">${label}</tspan>`
                            : ""
                        }
                    </text>
                </svg>`;
  };

  const press = (v) => {
    p = v;
    render();
  };
  el.onpointerdown = () => press(1);
  el.onpointerup = el.onpointerleave = () => press(0);
  new ResizeObserver(() => {
    if (el.classList.contains("w-full")) {
      w = el.offsetWidth / (cfg.h / 40) - 10;
      render();
    }
  }).observe(el);
  render();
  return el;
};

[
  {
    t: "Button Palette",
    b: Object.keys(COLORS).map((c) => ({ c, l: c, i: "palette" }))
  },
  {
    t: "Square Icons",
    b: Object.keys(COLORS).map((c) => ({ c, i: "fingerprint", sq: true }))
  },
  {
    t: "Sizing & Layouts",
    b: [
      { c: "blue", l: "Tiny", h: 30, i: "bolt" },
      { c: "teal", l: "Standard", h: 44, i: "rocket_launch" },
      { c: "pink", l: "Large & Long Label", h: 60, i: "celebration" },
      {
        c: "orange",
        l: "Full Width Button",
        h: 44,
        i: "width_full",
        class: "w-full block mt-4"
      }
    ]
  }
].forEach((s) => {
  const sec = document.createElement("section");
  sec.innerHTML = `<h2 class="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">${s.t}</h2>`;
  const wrap = document.createElement("div");
  wrap.className = "flex flex-wrap gap-4";
  s.b.forEach((b) => wrap.appendChild(createBtn(b)));
  sec.appendChild(wrap);
  document.getElementById("app").appendChild(sec);
});

document
  .getElementById("float-root")
  .appendChild(
    createBtn({ c: "blue", i: "rocket", h: 64, sq: true, floating: true })
  );