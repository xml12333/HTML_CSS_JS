const asciiEl = document.getElementById("ascii");

let cols, rows;

function resize() {
  const charWidth = 7;
  const charHeight = 12;

  cols = Math.floor(window.innerWidth / charWidth);
  rows = Math.floor(window.innerHeight / charHeight);
}
window.addEventListener("resize", resize);
resize();

/*MOUSE*/
let mouse = { x: cols / 2, y: rows / 2 };

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX / 7;
  mouse.y = e.clientY / 12;
});

/* CLICK EXPLOSIONS*/
let explosions = [];

window.addEventListener("click", (e) => {
  explosions.push({
    x: e.clientX / 7,
    y: e.clientY / 12,
    radius: 0,
    life: 1
  });
});

/* SRING GOING CRAZY= */
let baseString = "SEVAS_TRA";
let currentString = baseString;

const mutations = [
  (s) => s.split("").reverse().join(""),
  (s) => s.replace(/O/g, "0"),
  (s) => s.replace(/E/g, "3"),
  (s) => s.slice(0, Math.max(1, Math.floor(Math.random() * s.length))),
  (s) => s + "_ERR",
];

function mutateString() {
  const fn = mutations[Math.floor(Math.random() * mutations.length)];
  currentString = fn(currentString);

  if (currentString.length < 2) {
    currentString = baseString;
  }
}

/* SMOOTHING THE lil WAVE STRINGS */
class CursedString {
  constructor(index, total, depth) {
    this.index = index;
    this.total = total;
    this.depth = depth;

    this.baseY = (index / total) * rows;

    this.amplitude = 2 + depth * 4;
    this.wavelength = 0.08;
    this.speed = 0.0 + depth * 0.002;

    this.offset = Math.random() * 100;
  }

  update(time) {
    this.time = time;
  }

  getY(x) {
    let y =
      this.baseY +
      Math.sin(x * this.wavelength + this.time * this.speed + this.offset) *
        this.amplitude;

    // secondary wave (natural feel?)
    y +=
      Math.sin(x * 0.04 + this.time * 0.0015) *
      (this.amplitude * 0.5);

    // subtle mouse interaction
    let dx = x - mouse.x;
    let dy = y - mouse.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 10) {
      y += (10 - dist) * 0.3 * this.depth;
    }

    return Math.floor(y);
  }
}

/* CREATE LAYERS HERE */
let strings = [];

function createStrings() {
  strings = [];

  let total = 22;

  for (let i = 0; i < total; i++) {
    let depth = 0.6 + Math.random() * 0.8;
    strings.push(new CursedString(i, total, depth));
  }
}

createStrings();

/* RENDER GOES HERE ho pe it works*/
let lastMutation = 0;

function draw(time) {
  let grid = Array.from({ length: rows }, () =>
    Array(cols).fill(" ")
  );

  // draw waves
  strings.forEach((s) => {
    s.update(time);

    for (let x = 0; x < cols; x++) {
      let y = s.getY(x);

      if (y >= 0 && y < rows) {
        let charIndex =
          (x + Math.floor(time * 0.01)) % currentString.length;

        let char = currentString[charIndex];

        // light corruption
        if (Math.random() < 0.02) {
          char = "#";
        }

        grid[y][x] = char;
      }
    }
  });

  /* EXPLOSIONS */
  explosions.forEach((exp) => {
    exp.radius += 0.3;
    exp.life -= 0.015;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let dx = x - exp.x;
        let dy = y - exp.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < exp.radius && Math.random() < 0.25) {
          grid[y][x] = "@";
        }
      }
    }
  });

  explosions = explosions.filter(e => e.life > 0);

  /* OUTPUT */
  asciiEl.textContent = grid.map(r => r.join("")).join("\n");

  /* SLOW CRAXY */
  if (time - lastMutation > 2500) {
    mutateString();
    lastMutation = time;
  }

  requestAnimationFrame(draw);
}

draw();