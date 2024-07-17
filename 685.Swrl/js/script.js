const canvas = document.createElement("canvas");
const c = canvas.getContext("2d");
 
canvas.width = innerWidth;
canvas.height = innerHeight;
document.body.append(canvas); 
 
const TWO_PI = 2 * Math.PI;
 
class Dot {
  constructor(id, x, y, theta, parent) {
    this.x = x;
    this.y = y;
    this.t = theta;
    this.vx = Math.cos(this.t) * Math.random() * 2;
    this.vy = Math.sin(this.t) * Math.random() * 2;
    this.life = 30;
    this.col = parent.col;
 
    if (Math.random() < 0.005) this.other = true;
    if (this.other) {
      this.life = 1000;
      this.t = Math.random() * 7;
      this.vx = Math.cos(this.t) * Math.random() * 2;
      this.vy = Math.sin(this.t) * Math.random() * 2;
      this.col = "black";
    }
    this.iter = 0;
    this.parent = parent;
    this.id = id;
    this.alpha = 0.25;
 
    if (Math.random() < 0.3) this.alpha = 0.25;
  }
 
  draw() {
    this.x += this.vx;
    this.y += this.vy;
    this.iter++;
    if (this.iter > this.life) {
      delete this.parent.dots[this.id];
    }
    c.fillStyle = this.col;
    c.globalAlpha = this.alpha;
    if (!this.no) this.alpha -= 0.00125;
    c.fillRect(this.x, this.y, this.parent.size, this.parent.size);
  }
}
 
class Stain {
  constructor(x = innerWidth, y = innerHeight) {
    this.x = x / 2;
    this.y = y / 2;
    this.num = 1;
    this.step = TWO_PI / this.num;
 
    this.size = 1 + Math.random() * Math.random() * 2;
    this.rad = Math.random() * 300;
    this.dots = {};
    this.dotId = 0;
    this.col = Math.random() < 0.8 ? "white" : "black";
    this.to = Math.random() * 7;
    this.S = 20 + Math.random() * 50;
    this.R = 100 + Math.random() * 300;
    this.rr = 50 + Math.random() * 300;
    this.dir = Math.random() < 0.6 ? 1 : Math.random() * 10 - 5;
    this.v = 1;
    this.tt = 0;
    if (Math.random() * 0.25) this.v = Math.random() * 5;
  }
 
  draw() { 
    const circ = this.rad * TWO_PI;
    this.rad -= this.v;
 
    this.step = TWO_PI / circ;
 
    if (this.rad > 0) {
      for (let i = 1; i <= this.R; i += this.S) {
        let t = (i * this.step + this.to) * this.dir;
        let x = this.x + this.rad * Math.cos(t);
        let y = this.y + this.rad * Math.sin(t);
        this.dots[this.dotId] = new Dot(this.dotId, x, y, t, this);
        this.dotId++;
      }
    }
    for (let i in this.dots) {
      if (this.dots[i]) this.dots[i].draw();
    }
  }
}
 
onresize = e => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  c.fillStyle = "black";
  c.fillRect(0, 0, innerWidth, innerHeight)
}
 
onresize()
 
let ss = [new Stain()];
 
function loop() {
  if (Math.random() < 0.05) {
    ss.push(
      new Stain(Math.random() * innerWidth * 2, Math.random() * innerHeight * 2)
    );
  }
  ss.forEach((s) => s.draw());
  c.globalAlpha = 0.05;
  c.drawImage(canvas, 0, 3, canvas.width + 0.2, canvas.height - 6);
  c.globalAlpha = 1;
  requestAnimationFrame(loop);
}
loop();