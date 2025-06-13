// firstly create a full window canvas
function setup() {
  createCanvas(windowWidth, windowHeight);
  background("#FEE8D0");
  stroke(30);
  strokeWeight(2);

  // Initialize cats array
  cats = [];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      let posture = postures[Math.floor(random(2))];
      cats.push({
        x: 100 + i * 250,
        y: 100 + j * 250,
        posture: posture,
        eyeShape: shapes[Math.floor(random(2))],
        color: catColors[Math.floor(random(catColors.length))],
        blinkTimer: random(60, 180),
      });
    }
  }
}

function draw() {
  background("#FEE8D0");
  stroke(30);
  strokeWeight(2);

  // Update and draw each cat
  cats.forEach((cat) => {
    // Update cat animations
    cat.blinkTimer--;
    if (cat.blinkTimer <= 0) {
      cat.blinkTimer = random(60, 180);
    }

    // Draw the cat with current animation state
    drawCat(cat);
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Global variables
let headX = 200;
let headY = 200;
let headWidth = 100;
let sittingBodyWidth = 110;
let layingBodyWidth = 150;
let HeadBorderRadius = 20;
let bodyBorderRadius = 20;
let earSize = 25;
let eyeSize = 10;
let arcSize = 20;

let shapes = ["round", "line"];
let postures = ["laying", "sitting"];
let catColors = ["#ECD4B0", "#EE9A36", "#BDBDBB", "#C27138"];
let cats = []; // Array to store cat objects

function drawEars(earSize) {
  ellipse(-earSize, -0.25 * headWidth, earSize, earSize * 1.5);
  ellipse(earSize, -0.25 * headWidth, earSize, earSize * 1.5);

  // Draw inner ears
  fill("#FFB6C1"); // Light pink for inner ears
  let innerEarSize = earSize * 0.7; // 60% of outer ear size
  ellipse(-earSize, -0.25 * headWidth, innerEarSize, innerEarSize * 1.5);
  ellipse(earSize, -0.25 * headWidth, innerEarSize, innerEarSize * 1.5);
}

function drawEyesAndMouth(eyeShape, eyeSize, isBlinking) {
  fill(20);

  let left = -eyeSize - 10;
  let right = eyeSize + 10;
  let h = -5;
  let eyeHeight = 3;
  let eyeBorderRadius = 10;

  if (isBlinking) {
    // Draw closed eyes
    line(left - eyeSize / 2, h, left + eyeSize / 2, h);
    line(right - eyeSize / 2, h, right + eyeSize / 2, h);
  } else {
    if (eyeShape === "round") {
      circle(left, h, eyeSize);
      circle(right, h, eyeSize);
    } else {
      rect(left, h, eyeSize * 1.5, eyeHeight, eyeBorderRadius);
      rect(right, h, eyeSize * 1.5, eyeHeight, eyeBorderRadius);
    }
  }

  let mouthX = (left + right) / 2;
  let mouthY = 5;
  let mouthSize = 5;

  circle(mouthX, mouthY, mouthSize);
  noFill();
  arc(mouthX - 10, mouthY, arcSize, arcSize, 0, HALF_PI);
  arc(mouthX + 10, mouthY, arcSize, arcSize, HALF_PI, PI);
}

function drawHead(x, y, w, hRadius) {
  rect(x, y, w, 0.6 * w, hRadius);
}

function drawBodyAndTail(posture) {
  if (posture === "laying") {
    rectMode(CORNER);
    rect(layingBodyWidth + 15, 0.3 * headWidth - 5, 10, 100, 10);
    arc(
      headWidth,
      0.3 * headWidth,
      layingBodyWidth,
      layingBodyWidth,
      PI,
      TWO_PI,
      CHORD
    );
  } else {
    rectMode(CORNER);
    rect(
      -0.3 * headWidth + sittingBodyWidth - 10,
      0.2 * headWidth + sittingBodyWidth * 0.9 - 10,
      100,
      10,
      10
    );
    rect(
      -0.3 * headWidth,
      0.2 * headWidth,
      sittingBodyWidth,
      0.9 * sittingBodyWidth,
      0,
      60,
      10,
      10
    );
  }
}

function drawCat(cat) {
  push();
  translate(cat.x, cat.y);

  // Draw base color
  fill(cat.color);
  drawBodyAndTail(cat.posture);

  ellipseMode(CENTER);
  drawEars(earSize);
  rectMode(CENTER);
  fill(cat.color);
  drawHead(0, 0, headWidth, HeadBorderRadius);

  // Draw eyes and mouth last so they're always on top
  drawEyesAndMouth(cat.eyeShape, eyeSize, cat.blinkTimer < 10);
  pop();
}