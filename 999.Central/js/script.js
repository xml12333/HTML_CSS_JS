//Mathober Day 31 2025
//#mathober #mathober2025
//https://mathworld.wolfram.com/CentralAngle.html

let t = 0;
let n = 25;

function setup() {
  createCanvas(500, 500);
  background(255);
  describe(
    "and arrow head in a circle expanding and contracting and spinning on radial graph paper where the central angle is darker and the rest is grey. the inscribed angle makes the point."
  );
  rectMode(CENTER);
  strokeWeight(0.5);
  strokeCap(SQUARE);
  d = width / 25;
  r1 = 9;
}

function draw() {
  background(245, 250, 255, 20);
  translate(width / 2, height / 2);
  stroke(100, 110, 120, 10);
  drawGrid();
  t += 0.05;
  noFill();
  noStroke();
  r = width / 50;
  fill(50, 60, 70, 10);
  circle(0, 0, d * 2 * r1);
  stroke(10, 20, 30, 50);
  t1 = 4 + 6 * cos(t) * sin(t / 3);
  t2 = 26 + 10 * cos(-t) * sin(t / 4);
  p1 = {
    x: d * r1 * cos((t1 * PI) / 50 + t / 10),
    y: d * r1 * sin((t1 * PI) / 50 + t / 10)
  };
  p2 = {
    x: d * r1 * cos((t2 * PI) / 50 + t / 10),
    y: d * r1 * sin((t2 * PI) / 50 + t / 10)
  };
  p3 = {
    x: d * r1 * cos((((t2 + t1) / 2) * PI) / 50 + PI + t / 10),
    y: d * r1 * sin((((t2 + t1) / 2) * PI) / 50 + PI + t / 10)
  };
  line(0, 0, p1.x, p1.y);
  line(0, 0, p2.x, p2.y);
  line(p1.x, p1.y, p3.x, p3.y);
  line(p2.x, p2.y, p3.x, p3.y);
  arc(
    0,
    0,
    d * r1 * 2,
    d * r1 * 2,
    (t1 * PI) / 50 + t / 10,
    (t2 * PI) / 50 + t / 10
  );

  strokeWeight(1);
  noFill();
  stroke(100, 110, 120, 30);
  rect(0, 0, width / 1.02, width / 1.02);
  rect(0, 0, width / 1.04, width / 1.04);
}

function drawGrid() {
  for (let i = 0; i < n; i++) {
    rotate((2 * PI) / n);
    line(-width / 1.5, 0, width / 1.5, 0);
    circle(0, 0, (width / n) * 2 * i);
  }
  noStroke();
  for (let i = 0; i < 500; i++) {
    x = random(-width / 2, width / 2);
    y = random(-width / 2, width / 2);
    fill(245, 250, 255, 150);
    circle(x, y, 2);
  }
}

function mousePressed() {
  setup();
  draw();
}