
class Walker {
    constructor() {
      this.x = w / 2;
      this.y = h / 2;
      this.originalAngle = Math.random() * Math.PI * 2;
      this.angle = this.originalAngle;
    }
    walk() {
      this.angle += Math.random() - 0.5;
      const delta = Math.PI / 2;
      if (this.angle > this.originalAngle + delta) {
        this.angle = this.originalAngle + delta;
      } else if (this.angle < this.originalAngle - delta) {
        this.angle = this.originalAngle - delta;
      }
      const step = Math.random() * maxStep;
      this.x += Math.cos(this.angle) * step;
      this.y += Math.sin(this.angle) * step;
    }
  }
  let canvas;
  let ctx;
  let w, h;
  let walkers;
  let maxStep;
  function setup() {
    canvas = document.querySelector("#canvas");
    ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", () => {
      resize();
      draw();
    });
    canvas.addEventListener("click", draw);
  }
  function reset() {
    const min = Math.min(w, h);
    maxStep = min * 0.004 * (Math.random() * 0.5 + 0.5);
    walkers = [];
    const nrOfWalkers = min * 0.07;
    for (let i = 0; i < nrOfWalkers; i++) {
      const w = new Walker();
      walkers.push(w);
    }
  }
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  function sortWalkersByAngle() {
    walkers.sort((a, b) => {
      return Math.atan2(a.y - h / 2, a.x - w / 2) - Math.atan2(b.y - h / 2, b.x - w / 2);
    });
  }
  function getAverageDistance() {
    let totalDistance = 0;
    walkers.forEach(walker => totalDistance += Math.hypot(walker.x - w / 2, walker.y - h / 2));
    return totalDistance / walkers.length;
  }
  function connectAllWalkersAndTakeStep() {
    ctx.beginPath();
    for (let i = 0; i < walkers.length - 1; i++) {
      ctx.lineTo(walkers[i].x, walkers[i].y);
      walkers[i].walk();
    }
    ;
    ctx.closePath();
    ctx.stroke();
    walkers[walkers.length - 1].walk();
  }
  function addWalkerAtDistance(dist) {
    const walker = new Walker();
    const a = Math.random() * Math.PI * 2;
    const x = Math.cos(a) * dist + w / 2;
    const y = Math.sin(a) * dist + h / 2;
    walker.x = x;
    walker.y = y;
    const angle = Math.atan2(y - h / 2, x - w / 2);
    walker.angle = angle;
    walker.originalAngle = angle;
    walkers.push(walker);
  }
  function draw() {
    reset();
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
    const steps = Math.min(w, h) * 1.3 / maxStep;
    for (let j = 0; j < steps; j++) {
      sortWalkersByAngle();
      connectAllWalkersAndTakeStep();
      let avgDist = getAverageDistance();
      if (avgDist > walkers.length * 1.8) {
        addWalkerAtDistance(avgDist);
      }
    }
  }
  setup();
  draw();