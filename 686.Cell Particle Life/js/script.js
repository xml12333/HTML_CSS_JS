//see https://codepen.io/tientq64/pen/gOEvxqb

let numTypes  = 5;
let goalTypes = 5;
let drag      = .15;
let numPoints = 1000;
let maxTypes  = 20;

let rInt = (b, a=0) => Math.floor(Math.random()*(b-a) + a);

class Particle{
  constructor({x, y, type=random(), dx=0, dy=0}){
    Object.assign(this, {x, y, type, dx, dy});
  }
  addForce(p){
    let entry = controlGrid[floor(this.type*numTypes)][floor(p.type*numTypes)];
    let dx = this.x-p.x;
    let dy = this.y-p.y;
    let d  = dx*dx + dy*dy;
    let f  = ((entry.goalDist*100)**2-d);
    
    let ddx = dx*f*.001/d;
    let ddy = dy*f*.001/d;
    
    this.dx += ddx + ddy*entry.strafe;
    this.dy += ddy + ddx*entry.strafe*-1;
  }
  update(){
    let d = Math.hypot(this.dx, this.dy);
    d = max(d, 2)/2;
    this.x += this.dx/d;
    this.y += this.dy/d;
    this.angle += this.spin;
    this.dx *= drag;
    this.dy *= drag;
  }
  render(){
    fill(floor(this.type*numTypes)/numTypes, 1, 1);
    ellipse(this.x, this.y, 5);
  }
}

function setup (){
  pixelDensity(1);
  createCanvas();
  colorMode(HSB, 1, 1, 1);
  window.controlGrid = makeControlGrid();
  window.goalGrid    = makeControlGrid();
  windowResized();
  init();
}

let init = () => {
  points = [];
  for (let i = 0; i < numPoints; i++){
    points.push(new Particle({x:random()*width, y:random()*height}));
  }
}

let makeControlGrid = () => {
  controlGrid = [];
  strafeMod = random() < .3 ? 0 : 1;
  for (let i = 0; i < maxTypes; i++){
    controlGrid.push([]);
    for (let j = 0; j < maxTypes; j++){
      controlGrid[i].push({goalDist:Math.random()*4 + .1, strafe:Math.random()*(2-1)*strafeMod});
    }
  }
  
  //hack to also reset goalTypes
  goalTypes = rInt(maxTypes, 3);
  
  return controlGrid;
}

function draw(){
  background(0, .1);
  
  for (let i = 0; i < maxTypes; i++){
    for (let j = 0; j < maxTypes; j++){
      let entry = controlGrid[i][j];
      let goal  = goalGrid[i][j];
      entry.goalDist = lerp(entry.goalDist, goal.goalDist, .05);
      entry.strafe   = lerp(entry.strafe  , goal.strafe  , .05);
    }
  }
  
  numTypes = lerp(numTypes, goalTypes, .05);
  
  if (random() < .0005) goalGrid = makeControlGrid();
  
  let cx = 0;
  let cy = 0;
  let mx = 0;
  let my = 0;
  let nx = 0;
  let ny = 0;
  
  noStroke();
  
  for (let i = 0; i < points.length; i++){
    let p1 = points[i];
    cx += p1.x;
    cy += p1.y;
    mx = max(mx, p1.x);
    my = max(my, p1.y);
    nx = min(nx, p1.x);
    ny = min(ny, p1.y);
    for (let j = i+1; j < points.length; j++){
      let p2 = points[j];
      p1.addForce(p2);
      p2.addForce(p1);
    }
  }
  
  cx /= numPoints;
  cy /= numPoints;
  let s = min(width/(mx-nx), height/(my-ny));
  
  translate(width/(2), height/(2));
  scale(s);
  translate(-cx, -cy);
  
  for (let p of points){
    p.update();
    p.render();
    p.x -= cx;
    p.y -= cy;
  }
}

function mousePressed(){
  goalGrid = makeControlGrid();
}

function keyPressed(evt){
  if (evt.key === "ArrowLeft" ) goalTypes = max(goalTypes-1, 3);
  if (evt.key === "ArrowRight") goalTypes = min(goalTypes+1, maxTypes);
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}