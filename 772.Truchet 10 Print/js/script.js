let grid = [];
let gw = 70;
let gh = 30;

class Cell{
  constructor(){
    this.walls = 0;
    this.visited = false;
    this.color = [0];
  }
  render(x, y, s){
    push();
    translate(x, y);
    
    stroke(.7);
    drawingContext.setLineDash([5/s, 5/s]);
    let n = this.walls;
    if ((n & 1) == 1) line(0, 0, 1, 0);
    if ((n & 2) == 2) line(1, 0, 1, 1);
    if ((n & 4) == 4) line(0, 1, 1, 1);
    if ((n & 8) == 8) line(0, 0, 0, 1);
    
    drawingContext.setLineDash([1]);
    
    noFill();
    stroke(.55, this.color[1]*.8, pow(this.color[1], .7));
    strokeWeight((1-this.color[0])*.8);
    
    let drawArc = (x, y, a, b) => {
      push();
      translate(x, y);
      arc(0, 0, 1, 1, PI*a/2, PI*b/2);
      pop();
    }
    
    let hasWalls = (a, b) => ((n & a) == a) && ((n & b) == b)
    
    if (hasWalls(1, 2)) drawArc(0, 1, 3, 4);
    if (hasWalls(2, 4)) drawArc(0, 0, 0, 1);
    if (hasWalls(4, 8)) drawArc(1, 0, 1, 2);
    if (hasWalls(8, 1)) drawArc(1, 1, 2, 3);
    if (hasWalls(1, 4)) line(0, 0.5, 1, 0.5);
    if (hasWalls(2, 8)) line(0.5, 0, 0.5, 1);
    
    pop();
  }
}

function setup (){
  pixelDensity(1);
  createCanvas();
  colorMode(HSB, 1, 1, 1);
  init();
  windowResized();
}

let inGrid = (x, y) => {
  return (x >= 0 && y >= 0 && x < grid[0].length && y < grid.length);
}

let setCells = (x, y) => {
  let set = (x, y, n) => {
    if (inGrid(x, y)) grid[y][x].walls |= n;
  }
  
  if (random() < .5){
    set(x,   y, 4); set(x+1,   y, 4);
    set(x, y+1, 1); set(x+1, y+1, 1);
  } else {
    set(x,   y, 2); set(x+1,   y, 8);
    set(x, y+1, 2); set(x+1, y+1, 8);
  }
}

let setColumn = (x, offset=0) => {
  for (let j = -1; j <= grid.length; j += 2){
    let y = j+offset;
    setCells(x, y);
  }
}

let fillGrid = () => {
  for (let i = -1; i < grid[0].length-1; i ++){
    setColumn(i, (i%2));
  }
}

let slideAmt = 0;
let count = 0;
let init = () => {
  grid = [];
  for (let j = 0; j < gh; j++){
    grid.push([]);
    for (let i = 0; i < gw; i++){
      grid[j].push(new Cell());
    }
  }
  
  fillGrid();
  colorGrid();
  console.log(grid);
}

let searchLs = [
  //id, x, y
  [1,  0, -1], //top
  [2,  1,  0], //right
  [4,  0,  1], //bottom
  [8, -1,  0], //left
];
let colorConnectedCells = (x, y) => {
  let connections = [];
  let fronteir = [[x, y]];
  let maxLoops = 1000;
  let loops = 0;
  while (!(fronteir.length == 0) && loops < maxLoops){
    loops++;
    let newFronteir = [];
    for (let coord of fronteir){
      // console.log(coord);
      let cell = grid[coord[1]][coord[0]];
      cell.visited = true;
      for (let search of searchLs){
        if ((cell.walls&search[0]) != search[0]){
          let x2 = coord[0]+search[1];
          let y2 = coord[1]+search[2];
          if (inGrid(x2, y2) && !grid[y2][x2].visited){
            newFronteir.push([x2, y2])
          }
        }
      }
      connections.push(cell);
    }
    fronteir = newFronteir;
  }
  
  let len = connections.length-5;
  let col = [random()*.8 + .1, random(), random()];
  for (let cell of connections){
    cell.color = col;
  }
}

let colorGrid = () => {
  for (let j = 0; j < gh; j++){
    for (let i = 0; i < gw; i++){
      grid[j][i].visited = false;
    }
  }
  
  for (let j = 0; j < gh; j++){
    for (let i = 0; i < gw; i++){
      let cell = grid[j][i];
      if (!cell.visited) colorConnectedCells(i, j);
    }
  }
}

function draw(){
  background(.15, .02, .99);
  slideAmt += .03;
  
  if (slideAmt >= 1){
    slideAmt -= 1;
    count++;
    
    //add cell to each row
    for (let j = 0; j < gh; j++){
      //remove first cell
      grid[j].shift();
      //add new cell to list
      grid[j].push(new Cell());
    }
    setColumn(gw-2, (count%2));
    
    //reset visited state
    for (let j = 0; j < gh; j++){
      for (let i = 0; i < gw; i++){
        grid[j][i].visited = false;
      }
    }
    
    //recolor cells
    for (let j = 0; j < gh; j++){
      let x = gw-1;
      let y = j;
      if (!grid[y][x].visited) colorConnectedCells(gw-1, j);
    }
  }
  
  if (grid.length == 0) return;
  
  translate(height/2)
  let s = (height/gh)*1;
  translate(-gh/2);
  scale(s);
  translate(-slideAmt, 0);
  strokeWeight(1/s);
  stroke(0);

  for (let j = 0; j < grid.length; j++){
    for (let i = 0; i < grid[0].length; i++){
      grid[j][i].render(i, j, s);
    }
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}