let terrainIncrement = 0.005;
let r = 35;
let k = 30;
let grid = [];
let perlinGrid = [];
let terrainGrid = [];
let inc = 0.15; // bigger values = more variation in clusters
let w = r / Math.sqrt(2);
let active = [];
let cols, rows;
let trees = [];
let options = {
  treeCount: 0,
  speed: 60,
  mapSize: r, 
  gridWidth: 2,
  terrainNoise: terrainIncrement,
  treeNoise: inc,
  pine: true,
  oak: true,
  apple: true,
  water: true,
  grass: true,
  createNewForest: function(){
    resizeCanvas(windowWidth, windowHeight);
    setupTerrain();
    setupPoissonDiskSampling();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  strokeWeight(4);

  setupTerrain();
  
  setupPoissonDiskSampling();
}

function draw() {
  frameRate(options['speed']);
  runPoissonDiskSampling();

  for (let i = 0; i < trees.length; i++) {
    if (trees[i]) {
      trees[i].render();
      trees[i].update();
    }
  }
}

function setupTerrain() {
  terrainGrid = [];
  loadPixels();
  let yoff = Math.random() * 100
  for (let y = 0; y < height + r; y++) { // add some offscreen overlapping trees near the bottom
      let xoff = 0
      for (let x = 0; x < width + r; x++) {
        let noiseValue = noise(xoff, yoff)
        let terrainColor = getTerrainColor(noiseValue)
        terrainGrid[x + y * width] = noiseValue
        set(x, y, terrainColor)
        xoff += options['terrainNoise']
      }
      yoff += options['terrainNoise']
  }
  updatePixels();
}

function setupPoissonDiskSampling() {
  r = options['mapSize'];
  k = 30;
  grid = [];
  perlinGrid = [];
  inc = options['treeNoise']; // bigger values = more variation in clusters
  w = r / Math.sqrt(options['gridWidth']);
  active = [];
  cols, rows;
  trees = [];
  options['treeCount'] = 0;
  // setup grid
  cols = floor(width / w) + 1; // add an extra column to create a more natural looking overlap effect near the right side of the window
  rows = floor(height / w) + 1; // add an extra row to create a more natural looking overlap effect near the bottom of the window
  for (let i = 0; i < cols * rows; i++) {
    grid[i] = undefined;
  }
  
  // setup perlin noise grid for tree clustering
  let rowOff = Math.random() * 100
  for (let row = 0; row < rows; row++) {
      let colOff = 0
      for (let col = 0; col < cols; col++) {
        let noiseValue = noise(colOff, rowOff)
        perlinGrid[col + row * cols] = noiseValue
        colOff += options['treeNoise']
      }
      rowOff += options['treeNoise']
  }
  
  // initialize starting point
  let x = width * 0.5;
  let y = height * 0.5;
  let i = floor(x / w);
  let j = floor(y / w);
  let pos = createVector(x, y);
  grid[i + j * cols] = pos;
  active.push(pos);
  let sampleInWater = options['water'] && terrainGrid[Math.round(pos.x) + Math.round(pos.y) * width] >= 0.56
  if (!sampleInWater) {
    addTree(pos.x, pos.y, i, j, r)
  }
}

function addTree(xPos, yPos, col, row, radius) {
  let p = options['pine']
  let a = options['apple']
  let o = options['oak']
  yPos -= (0.5 * radius)
  let newTree;
  if (p && a && o) {
    if (perlinGrid[col + row * cols] < 0.4) {
      newTree = new PineTree(xPos, yPos, radius);
    } else if (perlinGrid[col + row * cols] < 0.55) {
      newTree = new OakTree(xPos, yPos, radius);
    } else {
      newTree = new AppleTree(xPos, yPos, radius);
    }
  } else if (p && a && !o) {
    if (perlinGrid[col + row * cols] < 0.5) {
      newTree = new PineTree(xPos, yPos, radius);
    } else {
      newTree = new AppleTree(xPos, yPos, radius);
    }
  } else if (p && !a && o) {
    if (perlinGrid[col + row * cols] < 0.5) {
      newTree = new PineTree(xPos, yPos, radius);
    } else {
      newTree = new OakTree(xPos, yPos, radius);
    }
  } else if (p && !a && !o) {
    newTree = new PineTree(xPos, yPos, radius);
  } else if (!p && a && o) {
    if (perlinGrid[col + row * cols] < 0.5) {
      newTree = new AppleTree(xPos, yPos, radius);
    } else {
      newTree = new OakTree(xPos, yPos, radius);
    }
  } else if (!p && a && !o) {
    newTree = new AppleTree(xPos, yPos, radius);
  } else if (!p && !a && o) {
    newTree = new OakTree(xPos, yPos, radius);
  }
  if (p || a || o) {
    trees.push(newTree)
  }
}

function runPoissonDiskSampling() {
  if (active.length > 0) {
    let randIndex = floor(random(active.length));
    let pos = active[randIndex];
    let found = false;
    for (let n = 0; n < k; n++) {
      let sample = p5.Vector.random2D();
      let m = random(r, 2 * r);
      sample.setMag(m);
      sample.add(pos);
  
      let col = floor(sample.x / w);
      let row = floor(sample.y / w);
       
      if (col > -1 && row > -1 && col < cols && row < rows && !grid[col + row * cols]) {
        let ok = true;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            let index = (col + i) + (row + j) * cols;
            let neighbor = grid[index];
            if (neighbor) {
              let d = p5.Vector.dist(sample, neighbor);
              if (d < r) {
                ok = false;
              }
            }
          }
        }
        if (ok) {
          found = true;
          grid[col + row * cols] = sample;
          active.push(sample);
          options['treeCount'] += 1
          let sampleInWater = options['water'] && terrainGrid[Math.round(sample.x) + Math.round(sample.y) * width] >= 0.56
          if (!sampleInWater) {
            addTree(sample.x, sample.y, col, row, r)
          }
          trees.sort((a, b) => a.position.y - b.position.y)
          break;
        }
      }
    }
  
    if (!found) {
      active.splice(randIndex, 1);
    }
  }
}

function getTerrainColor(noiseValue) {
  let green = color(140, 151, 140)
  let brown = color(237, 201, 175)
  let blue = color(140, 140, 251)
  if (options['water'] && options['grass']) {
    if (noiseValue < 0.54) {
      return green
    } else if (noiseValue < 0.6) {
        return brown
    } else {
        return blue
    }
  } else if (options['water'] && !options['grass']) {
    if (noiseValue < 0.6) {
        return brown
    } else {
        return blue
    }
  } else if (!options['water'] && options['grass']) {
    if (noiseValue < 0.6) {
        return green
    } else {
        return brown
    }
  } else {
    return color(237, 201, 175)
  }
}

class Tree {
  constructor(x, y, size) {
    this.position = createVector(x, y);
    this.size = size;
    this.opacityFadeIn = 0;
  }

  update() {
    if (this.opacityFadeIn < 255) {
      this.opacityFadeIn += 5;
    }
  }
}

class PineTree extends Tree {
  constructor(x, y, size) {
    super(x, y, size * 0.75)
  }

  render() {
    let { x, y } = this.position;
    let size = map(this.opacityFadeIn, 0, 255, 0, this.size);

    let trunkWidth = size * 0.25;
    let trunkHeight = size;
    let leavesWidth = size;
    let leavesOverhang = (size - trunkWidth) * 0.5;

    let leavesX1 = x - leavesOverhang; // left point of triangle
    let leavesX2 = x + trunkWidth + leavesOverhang; // right point of triangle
    let leavesX3 = x + (trunkWidth * 0.5); // middle and top of triangle

    push();
    noStroke();
    fill(101, 67, 33); // dark brown
    rect(x, y, trunkWidth, trunkHeight);
    fill(0, 100, 0); // dark green
    triangle(leavesX1, y + (size * 0.75), leavesX2, y + (size * 0.75), leavesX3, y - (size * 0.5));
    triangle(leavesX1, y + (size * 0.5), leavesX2, y + (size * 0.5), leavesX3, y - (size * 0.5));
    triangle(leavesX1, y + (size * 0.25), leavesX2, y + (size * 0.25), leavesX3, y - (size * 0.5));
    pop();
  }
}

class OakTree extends Tree {
  constructor(x, y, size) {
    super(x, y, size * 0.5)
  }

  render() {
    let { x, y } = this.position;
    let size = map(this.opacityFadeIn, 0, 255, 0, this.size);

    const trunkWidth = size * 0.25;
    const trunkHeight = size;
    const leavesWidth = size;
    const leavesOverhang = (size - trunkWidth) * 0.3;

    const leavesX1 = x - leavesOverhang; // left point of triangle
    const leavesX2 = x + trunkWidth + leavesOverhang; // right point of triangle
    const leavesX3 = x + (trunkWidth * 0.5); // middle and top of triangle

    push();
    noStroke();
    fill(166, 94, 46); // orange brown
    rect(x, y, trunkWidth, trunkHeight);
    fill(10, 140, 10) // dark green
    circle(x - leavesOverhang, y + (size * 0.1), trunkWidth * 3);
    circle(x + trunkWidth + leavesOverhang, y + (size * 0.1), trunkWidth * 3);
    // circle(x + (trunkWidth * 0.5), y - size, trunkWidth * 3);
    fill(60, 179, 113); // medium sea green
    circle(x + (trunkWidth * 0.5), y - (size * 0.5), trunkWidth * 5);
    pop();
  }
}

class AppleTree extends Tree {
  constructor(x, y, size) {
    super(x, y, size * 0.5)
  }

  render() {
    let { x, y } = this.position;
    let size = map(this.opacityFadeIn, 0, 255, 0, this.size);

    const trunkWidth = size * 0.5;
    const trunkHeight = size;
    const leavesWidth = size;
    const leavesOverhang = (size - trunkWidth) * 0.5;

    const leavesX1 = x - leavesOverhang; // left point of triangle
    const leavesX2 = x + trunkWidth + leavesOverhang; // right point of triangle
    const leavesX3 = x + (trunkWidth * 0.5); // middle and top of triangle

    push();
    noStroke();
    fill(100, 69, 34); // orange brown
    rect(x, y, trunkWidth, trunkHeight);
    fill(50, 205, 50);
    circle(x + (trunkWidth * 0.5), y - (size * 0.25), size * 1.5);
    circle(x - trunkWidth * 0.5, y + (size * 0.25), size * 0.5);
    circle(x + trunkWidth * 1.5, y + (size * 0.25), size * 0.5);
    fill(255, 98, 84); // red
    circle(x, y, size * 0.35);
    circle(x + trunkWidth * 0.5, y - trunkHeight * 0.5, size * 0.35);
    circle(x + trunkWidth, y, size * 0.35);
    pop();
  }
}

gui = new dat.GUI( { autoPlace: false } )
gui.add( options, 'treeCount' ).name( 'Tree Count' ).listen();
gui.add( options, 'speed' ).min( 0 ).max( 60 ).step( 1 ).name( 'Speed' );
gui.add( options, 'mapSize' ).min( 5 ).max( 100 ).step( 1 ).name( 'Zoom' );
gui.add( options, 'gridWidth' ).min( 0.5 ).max( 9 ).step( 0.1 ).name( 'Tree Density' );
gui.add( options, 'terrainNoise' ).min( 0 ).max( 0.015 ).step( 0.001 ).name( 'Terrain Noise' );
gui.add( options, 'treeNoise' ).min( 0 ).max( 0.5 ).step( 0.001 ).name( 'Tree Noise' );
gui.add( options, 'pine' ).name( 'Pine Trees?' )
gui.add( options, 'oak' ).name( 'Oak Trees?' )
gui.add( options, 'apple' ).name( 'Apple Trees?' )
gui.add( options, 'water' ).name( 'Water?' )
gui.add( options, 'grass' ).name( 'Grass?' )

gui.add( options, 'createNewForest' ).name( 'Create New Forest' );
customContainer = document.getElementById( 'gui' );
customContainer.appendChild(gui.domElement);
  
document.onselectstart = function(){
  return false;
};