function touch2Mouse(e) {
  var theTouch = e.changedTouches[0];
  var mouseEv;
  switch (e.type) {
    case "touchstart":
      mouseEv = "mousedown";
      break;
    case "touchend":
      mouseEv = "mouseup";
      break;
    case "touchmove":
      mouseEv = "mousemove";
      break;
    default:
      return;}

  var mouseEvent = document.createEvent("MouseEvent");
  mouseEvent.initMouseEvent(
  mouseEv,
  true,
  true,
  window,
  1,
  theTouch.screenX,
  theTouch.screenY,
  theTouch.clientX,
  theTouch.clientY,
  false,
  false,
  false,
  false,
  0,
  null);

  theTouch.target.dispatchEvent(mouseEvent);
  e.preventDefault();
}

document.addEventListener("touchstart", touch2Mouse, true);
document.addEventListener("touchmove", touch2Mouse, true);
document.addEventListener("touchend", touch2Mouse, true);

r = Math.random;S = Math.sin, C = Math.cos, T = Math.tan, s = (k = canvas.width / 3) => r() * k;rp = (v, i) => [
S(i) * v,
C(i) * v,
S(i) * v];

const canvas = document.getElementById('canvas');
const x = canvas.getContext('2d');
let lineWidth = 1;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.particles = [];
//x.globalCompositeOperation = 'xor'
x.translate(canvas.width / 2, canvas.height / 2);
if (!window.particles || window.particles.length === 0) {
  window.particles = [];
  for (i = 0; i < 360; i++) window.particles.push({ p: rp(canvas.height / 3, i), v: rp(0, i) });
}

const loop = () => {
  window.particles = window.particles.map(p => {
    p.d = 0;
    p.dc = 0;
    window.particles.map(q => {
      if (p === q) return;
      d = Math.sqrt((p.p[0] - q.p[0]) ** 2 + (p.p[1] - q.p[1]) ** 2 + (p.p[2] - q.p[2]) ** 2);
      p.d += d;
      p.dc++;
      p.v[0] -= (p.p[0] - q.p[0]) / d;
      p.v[1] -= (p.p[1] - q.p[1]) / d;
      p.v[2] -= (p.p[2] - q.p[2]) / d;
    });
    p.d = p.d / p.dc;
    p.color = `hsla(${p.d},100%,50%,1)`;
    p.v = p.v.map(e => e * .998);
    p.p[0] += p.v[0] * 0.0001;
    p.p[1] += p.v[1] * 0.0001;
    p.p[2] += p.v[2] * 0.0001;
    return p;
  });
  x.fillStyle = '#00000001';
  x.fillRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
  window.particles.forEach(pp => {// draw points
    x.beginPath();
    x.fillStyle = pp.color;
    x.fillRect(pp.p[0] / 1, pp.p[1] / 1, lineWidth / 2, lineWidth / 2);
    x.fill();
  });
  requestAnimationFrame(loop);
};
loop();


// use mousewheel event to zoom in and out
canvas.addEventListener('wheel', e => {
  // scale the canvas
  x.scale(e.deltaY > 0 ? 1.1 : 0.9, e.deltaY > 0 ? 1.1 : 0.9);
  lineWidth /= e.deltaY > 0 ? 1.1 : 0.9;
});


let mouseState = {
  x: 0,
  y: 0,
  down: false };

// mousemove event to rotate the canvas
canvas.addEventListener('mousemove', e => {
  if (!mouseState.down) return;
  // rotate the canvas
  x.rotate(e.movementX / 10000);
  x.rotate(e.movementY / 10000, 1);
});

// mousedown event to start rotating the canvas
canvas.addEventListener('mousedown', e => {
  mouseState.down = true;
});

// mouseup event to stop rotating the canvas
canvas.addEventListener('mouseup', e => {
  mouseState.down = false;
});
// canvas.width = window.innerWidth
// canvas.height = window.innerHeight