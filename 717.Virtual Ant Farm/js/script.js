var numberOfVirtualAnts = 3000; // Seems to work fine with up to a good few thousand more than this, although it can be a fair bit slower
var colors = ['#DDDDDD', 'black']; // Must be two colors

var gridWidth, gridHeight;
var grid = {};

// Vant for 'virtual ant'
function Vant(x, y, orientation, rules) {
  this.x = x;
  this.y = y;
  this.orientation = orientation;
  this.state = 0;
  this.color = 0;
  // 1 = noturn, 2 = right, 4 = uturn, 8 = left
  // Rules come in tuples: [new color, direction to turn, new state]
  this.rules = rules;
}

var vants = [];

function randBetween(min, max) {
  return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);
}

function randomRule() {
  return [randBetween(0, 1), [1, 2, 4, 8][randBetween(0, 3)], randBetween(0, 1)];
}

function randomRuleset() {
  return [[randomRule(), randomRule()], [randomRule(), randomRule()]];
}


// this kind of turmite uses relative positioning -- the ant has its own internal orientation. this function handles turning the ant in the appropriate direction -- 'right' if it is currently on a white square, 'left' if it is currently on a black square.
function findOrientation(dir, ori) {
  // dirs: 1 = noturn, 2 = right, 4 = uturn, 8 = left
  if (dir === 1) {// noturn
    return ori;
  } else
  if (dir === 4) {// uturn
    if (ori === 'n') {
      return 's';
    } else
    if (ori === 's') {
      return 'n';
    } else
    if (ori === 'e') {
      return 'w';
    } else
    {
      return 'e';
    }
  } else
  {// right (2) or left (8)
    if (ori == 'n') {
      return dir === 2 ? 'e' : 'w';
    } else
    if (ori == 'e') {
      return dir === 2 ? 's' : 'n';
    } else
    if (ori == 's') {
      return dir === 2 ? 'w' : 'e';
    } else
    {// 'w'
      return dir === 2 ? 'n' : 's';
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  gridWidth = windowWidth;
  gridHeight = windowHeight;

  function randomX() {
    return Math.ceil(Math.random() * gridWidth);
  }
  function randomY() {
    return Math.ceil(Math.random() * gridHeight);
  }

  // rules tuples: [new color (0/1), direction to turn (1 / 2 / 4 / 8), new state (0 / 1)]
  var vant1 = new Vant(
  Math.floor(gridWidth / 2),
  Math.floor(gridHeight / 2),
  'n',
  [[[1, 2, 0], [0, 8, 0]], [[1, 1, 0], [1, 1, 1]]]);
  // x, y, orientation, state
  var vant2 = new Vant(
  Math.floor(gridWidth / 2 + 50),
  Math.floor(gridHeight / 2),
  'e',
  [[[1, 1, 1], [1, 8, 0]], [[1, 2, 1], [0, 1, 0]]]);

  var vant3 = new Vant(
  Math.ceil(Math.random() * gridWidth),
  Math.ceil(Math.random() * gridHeight),
  'w',
  [[[1, 4, 1], [1, 8, 0]], [[1, 2, 1], [0, 1, 0]]]);


  vants.push(vant1, vant2, vant3);

  for (var i = 0; i <= numberOfVirtualAnts; i++) {
    vants.push(new Vant(randomX(), randomY(), ['n', 'e', 's', 'w'][randBetween(0, 3)], randomRuleset()));
  };
}

function draw() {
  vants.forEach(vant => {
    // Does the current square have a value?
    if (typeof grid[vant.x] == 'object' && typeof grid[vant.x][vant.y] == 'number') {
      // If so, get that value from the grid storage object.
      vant.color = grid[vant.x][vant.y];
    } else
    {
      // otherwise, treat that value as false.
      vant.color = 0;
    }

    var rule = vant.rules[vant.state][vant.color];
    vant.orientation = findOrientation(rule[1], vant.orientation);
    stroke(colors[rule[0]]);
    vant.color = rule[0];
    vant.state = rule[2];
    point(vant.x, vant.y);

    if (typeof grid[vant.x] == 'object') {
      grid[vant.x][vant.y] = vant.color;
    } else {
      // If there's no data for this row yet, make that row first, and then add the new value.
      grid[vant.x] = {};
      grid[vant.x][vant.y] = vant.color;
    }

    // Move the ant in the appropriate direction for the next iteration.
    if (vant.orientation === 'n') {
      vant.y -= 1;
    } else
    if (vant.orientation === 's') {
      vant.y += 1;
    } else
    if (vant.orientation === 'e') {
      vant.x += 1;
    } else
    {
      vant.x -= 1;
    }
    if (vant.x > windowWidth) {
      vant.x = 0;
    }
    if (vant.x < 0) {
      vant.x = windowWidth;
    }
    if (vant.y > windowHeight) {
      vant.y = 0;
    }
    if (vant.y < 0) {
      vant.y = windowHeight;
    }

    stroke('white');
    point(vant.x, vant.y);
  });

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}