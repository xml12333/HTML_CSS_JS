//wccchalleng - pattern
//press space to pause
//click to cahnge
let x, y, t, n, r, g, b, p, angle;
let val, v2, v3;
playBool = false;
function setup() {
  cnv = createCanvas((c = min(windowWidth, windowHeight) * 0.9), c);
  n = random([3, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 20]);
}

function draw() {
  translate(width / 2, height / 2);
  if (playBool) {
    t = frameCount / 500;
  } else {
    if (frameCount > 1) {
      frameCount--;
    }
    t = frameCount / 500;
    background(10, 10, 20);
  }
  angle = PI / 6 + PI * Math.sin(t / 5);
  rotate(t / 2);
  background(10, 10, 20, 10);
  for (let i = 0; i < n; i++) {
    push();
    scale(0.5);
    rotate((TWO_PI / n) * i);
    translate(0, width / 10);
    rotate(t / 4);
    drawTree();
    pop();
    push();
    scale(1.2);
    rotate(-(TWO_PI / n) * (i + 0.5));
    translate(0, width / 10);
    rotate(t / 4);
    drawTree();
    pop();
  }
}

function drawTree() {
  x = width;
  val = 0.6;

  v2 = 5 * Math.sin(t / n);
  v3 = 9;
  strokeWeight(2);
  fractal(width / 6, -1 + -1 * Math.sin(t));
}

function fractal(len, refl) {
  tmp = len * refl;
  if (playBool) {
    strokeWeight(0.5);
    stroke(255, 255, 255, 10);
  } else {
    strokeWeight(0.25);
    stroke(255, 255, 255, 50);
  }
  line(0, 0, 0, min(-20, tmp));
  translate(0, tmp);
  if (len > v3) {
    push();
    rotate(angle - angle * v2);
    fractal(len * val, refl);
    noStroke();
    fill(255);
    circle(0, 0, 2);
    pop();
    push();
    rotate(-angle + angle * v2);
    fractal(len * val, refl);
    noStroke();
    fill(255);
    circle(0, 0, 2);

    pop();
  }
}

function mousePressed() {
  setup();
  draw();
}

function keyPressed() {
  playBool = !playBool;
}