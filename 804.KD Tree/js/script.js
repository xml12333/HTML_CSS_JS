const wrapper = document.querySelector`div`;
const button = document.querySelector`button`;

const unit = "vmin";
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

const getState = () => {
  return {
    sliders: [],
    groups: [],
    balance1: 0.1 + Math.random() * 0.9,
    balance2: 0.1 + Math.random() * 0.9,
    balance3: Math.random() * 0.5,
    minSize: 15,
    spacing: 2,
    startPos: [-100 / 2, -100 / 2],
    areas: [[0, 0, 100, 100]],
    cooldown: 60
  };
};
let state;

function walk(i) {
  let { areas, startPos, spacing } = state;
  if (i === 0) {
    for (const area of areas.slice()) {
      subdivide(area);
    }
  }

  let area = areas.shift();
  const a = [area[0], area[1]];
  const b = [area[0] + area[2], area[1] + area[3]];

  let s = spacing * 0.5;
  add2(a, startPos);
  add2(b, startPos);
  add2(a, [s, s]);
  add2(b, [-s, -s]);

  s = (spacing * 2) / 3;
  createWeirdRect(a, b, (area[0] + area[2] / 2) / 100);
  return areas.length;
}

function createWeirdRect(a, b, xx) {
  const hexa = "02468ACE".split("");
  const colors = pick([
    hexa.map((v) => `#${v}${v}${v}`),
    hexa.map((v) => `#00${v}`),
    hexa.map((v) => `#${v}00`),
    hexa.map((v) => `#e4d81a`)
  ]);

  const div = document.createElement("div");
  div.classList.add("bg");
  div.style.background = pick(colors);
  div.style.width = `${b[0] - a[0] - 4}${unit}`;
  div.style.height = `${b[1] - a[1] - 4}${unit}`;
  div.style.transform = `translate(${a[0] + 2}${unit}, ${a[1] + 2}${unit})`;
  wrapper.append(div);

  const group = {
    div,
    sliders: [
      createSlider([a[0], b[1]], [a[0], a[1]]),
      createSlider([b[0], b[1]], [a[0], b[1]]),
      createSlider([b[0], a[1]], [b[0], b[1]]),
      createSlider([a[0], a[1]], [b[0], a[1]])
    ]
  };
  state.groups.push(group);
  for (const slider of group.sliders) state.sliders.push(slider);
}

function createSlider(from, to) {
  const div = document.createElement("div");
  div.classList.add("slider");

  const el = document.createElement("input");
  el.type = "range";
  el.min = 0;
  el.max = 1;
  el.step = 0.01;
  el.value = 0;
  let len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  let angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  div.style.width = `${len}${unit}`;
  div.style.transform = `translate(${from[0]}${unit}, ${from[1]}${unit}) rotate(${angle}rad)`;
  div.appendChild(el);
  wrapper.appendChild(div);
  return el;
}

// based on <https://turtletoy.net/turtle/182d91df0d> by Mark Knol
function subdivide(area) {
  let { areas, balance1, balance2, balance3, minSize, spacing } = state;
  const b1 = 1 - balance1;
  let r = 0.5 - b1 / 2 + (Math.random() * b1) / 2;
  let verticalSplit = Math.random() > 0.5;
  if (Math.random() < balance2) verticalSplit = area[2] < area[3];
  const area1 = verticalSplit
    ? [area[0], area[1], area[2], area[3] * r]
    : [area[0], area[1], area[2] * r, area[3]];

  const area2 = !verticalSplit
    ? [area[0] + area[2] * r, area[1], area[2] * (1 - r), area[3]]
    : [area[0], area[1] + area[3] * r, area[2], area[3] * (1 - r)];

  areas.remove(area);
  areas.push(area1);
  areas.push(area2);

  const minWidth = Math.max(minSize + spacing, spacing);
  const minHeight = Math.max(minSize + spacing, spacing);
  if (area1[2] > minWidth && area1[3] > minHeight) {
    if (Math.random() > Math.pow(balance3, 3)) subdivide(area1);
  }
  if (area2[2] > minWidth && area2[3] > minHeight) {
    if (Math.random() > Math.pow(balance3, 3)) subdivide(area2);
  }
}

function add2(p, v) {
  p[0] += v[0];
  p[1] += v[1];
  return p;
}

Array.prototype.remove = function (item) {
  var idx;
  while ((idx = this.indexOf(item)) !== -1) this.splice(idx, 1);
  return this;
};

function animate() {
  let didUpdate = false;
  for (const slider of state.sliders) {
    const value = slider.valueAsNumber;
    if (value < 1) {
      slider.value = value + window.innerWidth / parseFloat(slider.parentElement.style.width) / 250;
      didUpdate = true;
      break;
    }
  }

  for (const slider of state.sliders.reverse()) {
    const value = slider.valueAsNumber;
    if (value < 1) {
      slider.value = value + 0.2;
      didUpdate = true;
      break;
    }
  }

  state.groups.forEach((group, idx) => {
    let isCompleted = !!group.sliders.find(
      (slider) => slider.valueAsNumber < 1
    );
    group.div.classList.toggle("completed", !isCompleted);
  });

  if (!didUpdate && state.cooldown-- < 0) {
    build();
  }

  requestAnimationFrame(animate);
}

function build() {
  wrapper.innerHTML = "";
  sliders = [];
  groups = [];
  state = getState();

  let __i = 0;
  while (walk(__i++, 1)) {}
}

build();
animate();

button.onclick = () => build();