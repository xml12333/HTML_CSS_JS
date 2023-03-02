//
// Draw pattern
//

const 
  PATTERN_WIDTH = 25,
  BASE = 6,
  COLORS = [
    'black', 'lightgray', 'cadetblue',
    'navy', 'teal', 'cornflowerblue', 'turquoise',
    'olive', 'gold',
    'maroon', 'darkorange', 'crimson', 'brown',
    'darkgreen', 'forestgreen', 'lightseagreen',
    'purple', 'mediumvioletred', 'thistle'
  ];

function getLine(vert, color, offset) {
  const
    OFF_X = vert ? offset * BASE : BASE / 2,
    OFF_Y = vert ? 0 : offset * BASE;
  
  return `linear-gradient(
    45deg,
    ${color} 0 ${BASE / 3}px,
    transparent ${BASE / 3}px ${BASE * (2 / 3)}px,
    ${color} ${BASE * (2 / 3)}px ${BASE}px,
    transparent ${BASE + 1}px
  ) ${OFF_X}px ${OFF_Y}px /
  ${BASE}px ${BASE}px repeat-${vert ? 'y' : 'x'}`;
}

function getPattern(lines, bg) {
  const WIDTH = (PATTERN_WIDTH - 1) * 2;
  let css = '';
  lines.forEach(l => {
    for (let pos = l[1]; pos < l[1] + l[2]; pos++) {
      css +=
        getLine(false, l[0], pos) + ', ' +
        getLine(true, l[0], pos) + ', ' +
        getLine(false, l[0], WIDTH - pos) + ', ' +
        getLine(true, l[0], WIDTH - pos) + ', ';
    }
  });
  return css + bg;
}

//
// Generate random pattern
//

let
  randInt,
  randEl  = arr => arr[randInt(arr.length)];
function generatePattern(seed) {
  const RNG = [
    0x80000000, 1103515245, 12345,
    seed || Math.floor(Math.random() * 10000)
  ];
  randInt = max => {
    RNG[3] = (RNG[1] * RNG[3] + RNG[2]) % RNG[0];
    return Math.floor(max * RNG[3] / RNG[0]);
  };
  
  let
    pallette = [],
    lines = [];
  for (let i = 0; i < 6; i++) {
    pallette.push(randEl(COLORS));
  }
  
  let pos = 4 + randInt(6);
  while (pos < PATTERN_WIDTH) {
    let lineWidth = randInt(4);
    if (pos + lineWidth > PATTERN_WIDTH) {
      lineWidth = PATTERN_WIDTH - pos;
    }
    if (randInt(4) !== 0) {
      lines.push([
        randEl(pallette),
        pos,
        lineWidth
      ]);
    }
    pos += lineWidth;
  }
  
  return getPattern(lines, randEl(COLORS));
}


//
// Generate pattern with name as seed
//

function generateFromName(name) {
  if (name === '') {
    startAnimation()
  } else {
    stopAnimation();
    const SEED = name
      .toLowerCase()
      .replace(/\s/g, '')
      .split('')
      .reduce((sum, l) => sum + l.charCodeAt(), 0);
    DIVS.forEach(d => d.style.background = generatePattern(SEED));
  }
}


//
// Add elements to page
//

const
  EL_WIDTH = BASE * PATTERN_WIDTH * 2,
  CONTAINER = document.createElement('main'),
  DIVS = [],
  DIV_COUNT =
      Math.ceil(window.innerWidth / EL_WIDTH) *
      Math.ceil(window.innerHeight / EL_WIDTH);

for (let i = 0; i < DIV_COUNT; i++) {
  const DIV = document.createElement('div');
  DIV.style.width = DIV.style.height = EL_WIDTH + 'px';
  DIV.style.background = generatePattern();
  CONTAINER.appendChild(DIV);
  DIVS.push(DIV);
}
DIVS.sort(() => Math.random() < 0.5 ? 1 : -1);

document.body.appendChild(CONTAINER);
CONTAINER.style.width = (
  EL_WIDTH * Math.ceil(window.innerWidth / EL_WIDTH)
) + 'px';
CONTAINER.style.height = (
  EL_WIDTH * Math.ceil(window.innerHeight / EL_WIDTH)
) + 'px';


//
// Animate
//

let ani, ani_i = 0;
function startAnimation() {
  clearInterval(ani);
  ani = setInterval(
    () => {
      DIVS[ani_i].style.background = generatePattern();
      ani_i += 1;
      ani_i %= DIVS.length;
    },
    400
  );
}

function stopAnimation() {
  clearInterval(ani);
}

startAnimation();
