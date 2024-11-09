//#mathober2024

const bgCol = "#447abd";
const gCol = "#a2c2e8";
const nGrid = 20;
let gSpace;
let w;
let nV, r, mul, d;

function setup() {
  w = max(400, min(windowWidth, windowHeight) * 0.9);
  describe(" ");
  gSpace = (w / nGrid) * 0.95;
  createCanvas(w, w);
  rectMode(CENTER);

  angleMode(DEGREES);
  textSize(16);
}

function draw() {
  background(bgCol);
  translate(w / 2, w / 2);
  drawGrid();
  t = frameCount / 10;
  stroke(255);
  strokeWeight(2);
  let r = w / 2.5;
  for (let i = 0; i < 12; i++) {
    chex(r, i * 30);
    r = (r * sqrt(3)) / 2;
  }

  chex(r, 0);
  chex((r * sqrt(3)) / 2, 30);

  noStroke();
  fill(gCol);
  text("cyclic hexagon", -w / 2 + 10, w / 2 - 5);
}
function chex(r, a) {
  push();
  rotate(a);

  fill(bgCol);

  circle(0, 0, r * 2);

  fill(255, 255, 255, 90);

  beginShape();
  for (let i = 0; i < 6; i++) {
    vertex(r * cos(i * 60 - t * i), r * sin(i * 60 - t * i));
  }
  endShape(CLOSE);
  pop();
}
function drawGrid() {
  stroke(gCol);
  strokeWeight(0.3);
  for (let i = 1; i <= nGrid; i++) {
    for (let j = 1; j <= nGrid; j++) {
      line(
        -w / 2 + gSpace * i,
        -w / 2 + gSpace,
        -w / 2 + gSpace * i,
        w / 2 - gSpace
      );
      line(
        -w / 2 + gSpace,
        -w / 2 + gSpace * i,
        w / 2 - gSpace,
        -w / 2 + gSpace * i
      );
    }
  }
  noFill();
  strokeWeight(3);
  rect(0, 0, w - 2 * gSpace);
}

function mousePressed() {
  setup();
  draw();
}
function windowResized() {
  setup();
  draw();
}