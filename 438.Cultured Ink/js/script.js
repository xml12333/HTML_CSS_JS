//quick sketch for #wccchallenge - organism
//an inky petri dish of glyphs - no time to comment
//press key or click to mix
//I originally learned to play with noise here: https://openprocessing.org/sketch/1254827
let n;
let nArray;
function setup() {
  nArray = [];
  inner1 = floor(random(0, 1.99));
  n = round(random(3, 20));
  cnv = createCanvas(windowWidth, windowHeight);
  background(255);
  d = min(width, height) * 0.5;
  r1 = random(d / 2.5, d / 1.5);
  for (let i = 0; i < n + 5; i++) {
    if (i === 0 || (inner1 === 0 && i % 5 === 0)) {
      nArray.push(new noiseCircle(r1 - i * random(2, 20), 0, 0, 0));
    } else {
      A = random(TWO_PI);
      nArray.push(
        new noiseCircle(d / random(5, 10), r1 * sin(A), r1 * cos(A), 1)
      );
    }
  }
}
function draw() {
  translate(width / 2, height / 2);
  for (let i = 0; i < n; i++) {
    nArray[i].move();
  }
}

class noiseCircle {
  constructor(r, x, y, t1) {
    this.x = x;
    this.y = y;
    this.p = [];
    this.r = r;
    this.t = 0;
    this.nf = random(0.1, 10);
    this.nf2 = random(5, 200);
    this.type = t1;
    this.random = int(random(1, 5));
    this.random2 = int(random(1, 5));
    this.np = int(r * 2);
    for (let i = 0; i < this.np; i++) {
      let theta = random(0, TWO_PI);
      if (this.type === 0) {
        this.p[i] = createVector(this.r * sin(theta), this.r * cos(theta));
      } else {
        this.p[i] = createVector(
          this.r * sin(theta / this.random2) * cos(theta / this.random) -
            this.r * cos((theta / this.random) * 2) -
            (this.r / 3) * sin(theta),
          this.r * cos(theta / this.random) - (this.r / 2) * sin(theta / 2)
        );
      }
    }
  }
  move() {
    strokeWeight(this.r / 300);
    push();
    translate(this.x, this.y);
    rotate(this.nf);
    stroke(
      255 - 255 * sin(this.t / 160),
      255 - 250 * sin(this.t / 160),
      255 - 250 * sin(this.t / 160)
    );
    this.t++;
    for (let i = 0; i < this.np; i++) {
      this.n = noise(this.nf * this.p[i].x, this.nf * this.p[i].y) * this.nf2;
      this.p[i].add(
        (this.n / 50) * cos(this.n) * sin(this.n / 2),
        (this.n / 50) * sin(this.n) * cos(this.n / 2)
      );
      point(this.p[i].x, this.p[i].y);
    }
    pop();
  }
}

function keyPressed() {
  setup();
  draw();
}

function mousePressed() {
  setup();
  draw();
}
