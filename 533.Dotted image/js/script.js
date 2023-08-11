const SIZE = 420;

const MAX_R = Math.sqrt((SIZE*SIZE*2)/4);

const c = document.querySelector('canvas');
const ctx = c.getContext('2d');

const osc = new OffscreenCanvas(SIZE, SIZE);
const osctx = osc.getContext('2d');

const image = new Image();
const fr = new FileReader();
let data;

let r = 0;
let angle = 0;

let rOffset = 1;
let aOffset = 5;
let contrast = 1;

function init() {

  c.width = SIZE;
  c.height = SIZE;
  ctx.fillStyle = '#fff';

  r = 0;
  angle = 0;
  
  rOffset = Number(document.querySelector('#linearOffset').value);
  aOffset = Number(document.querySelector('#radialOffset').value) * rOffset;

  const tc = Number(document.querySelector('#contrast').value);
  contrast = tc < 0 ? ((tc + 3) / 3) : (tc + 1);
}

window.onload = () => {
  
  document.querySelector('#linearOffset').value = Math.random() * 1.5 + 0.5;
  document.querySelector('#radialOffset').value = Math.random() * 19 + 1;

  init();

  image.onload = () => {
    const ratio = Math.min(image.width, image.height)  / SIZE;
    const newW = image.width / ratio;
    const newH = image.height / ratio;
    const newX = (SIZE - newW) / 2;
    const newY = (SIZE - newH) / 2;

    osctx.drawImage(image, newX, newY, newW, newH);
    data = osctx.getImageData(0, 0, SIZE, SIZE).data;
    render();
  }

  image.crossOrigin = "Anonymous";
  image.src = 'https://assets.codepen.io/1948355/logo.jpg';

  document.querySelector('#generate').addEventListener('click', () => {
    init();
    render();
  });

  const fileInput = document.querySelector('#fileInput');

  fileInput.addEventListener('change', () => {
    document.querySelector('.fileInput').innerHTML = fileInput.files[0].name;

    fr.onload = () => { image.src = fr.result; }  
    fr.readAsDataURL(fileInput.files[0]);   
  });
}

function render() {

  let count = 1000;
  while (count > 0) {

    const x = SIZE / 2 + Math.cos(angle) * r;
    const y = SIZE / 2 + Math.sin(angle) * r;

    const p = (Math.round(y) * SIZE + Math.round(x)) * 4;
    const ap = (data[p] + data[p + 1] + data[p + 2]) / 3;

    const tr = Math.pow(ap / 255, contrast) * Math.PI * rOffset * contrast;

    ctx.beginPath();
    ctx.arc(x, y, tr, 0, 2 * Math.PI);
    ctx.fill();

    const thisAngle = Math.atan(aOffset / r);
    angle += thisAngle;
    r += rOffset * thisAngle;

    count --;
  }

  if (r <= MAX_R) {
    requestAnimationFrame(render);
  }
}