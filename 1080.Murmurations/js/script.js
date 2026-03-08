let n = 1024; //size of board - infinitely wrapped
let birds = []; //knights
let flock = 128; //number of ka-ni-ghghghets
let t = 0;
let moves = [
  [2, 1],
  [2, -1],
  [-2, 1],
  [-2, -1],
  [1, 2],
  [1, -2],
  [-1, 2],
  [-1, -2]
];
function setup() {
  w = max(n, 600);
  cnv = createCanvas(n, n);
  background(10, 20, 30);
  spots = [];
  d = width / n;
  birds = [];
  describe(
    "a cloud slowly forms from small pixels in the center so that the center is like a bright moon with a halo or aura. There is a pixelated texture slightly. "
  );
  for (let i = 0; i < flock; i++) {
    birds.push(new murmuration());
  }
}

function draw() {
  t++;
  for (let i = 0; i < birds.length; i++) {
    rMove = random(moves);
    birds[i].x = birds[i].x + rMove[0];
    birds[i].y = birds[i].y + rMove[1];
    if (birds[i].x < 0) {
      birds[i].x = birds[i].x + n;
    } else {
      birds[i].x = birds[i].x % n;
    }
    if (birds[i].y < 0) {
      birds[i].y = birds[i].y + n;
    } else {
      birds[i].y = birds[i].y % n;
    }
    fill(240, 250, 255, 2);
    stroke(240, 250, 255, 2);
    rect(birds[i].x * d, birds[i].y * d, d, d);
  }
  if (t > n * 6) {
    noLoop();
    console.log("fin");
  }
}

class murmuration {
  constructor() {
    this.x = int(n / 2);
    this.y = int(n / 2);
  }
}

function keyPressed() {
  if (keyCode === 83) {
    save(cnv, "knight_murmurations", "jpg");
  }
  if (keyCode === 32) {
    t = 0;
    clear();
    loop();
    setup();
    draw();
  }
}