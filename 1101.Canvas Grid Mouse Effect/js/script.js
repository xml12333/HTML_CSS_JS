const c = document.querySelector('#c');
const ctx = c.getContext('2d');
const cw = 2000; //too small = poor image quality, too big = performance suffers
const ch = cw; 
c.width = c.height = cw;

let cRect = c.getBoundingClientRect();
let sx = cw / cRect.width;
let sy = ch / cRect.height;

const T = Math.PI * 2;
const m = { x:cw/2, y:ch/2, s:1.5, x2:cw/2, y2:ch/2 };
const xTo = gsap.quickTo(m, "x", {duration:1, ease:"expo"})
const yTo = gsap.quickTo(m, "y", {duration:1, ease:"expo"})
const sTo = gsap.quickTo(m, "s", {duration:2, ease:"power2"})
let boxes = [];

const imgs = {
  'logo':'https://assets.codepen.io/721952/logo_2000x2000.png',
  'flowers':'https://images.unsplash.com/photo-1777059269563-51fdb397358c?q=80&w='+cw,
  'snowy mountain':'https://images.unsplash.com/photo-1648723906701-260f1be9bd68?q=80&w='+cw,
  'prism':'https://images.unsplash.com/photo-1597589827317-4c6d6e0a90bd?q=80&w='+cw,
  'northern lights':'https://images.unsplash.com/photo-1680666032153-46856cdcb21f?q=80&w='+cw,
  'portrait':'https://images.unsplash.com/photo-1665174286799-5c51dcc9748a?q=80&w='+cw
}

const props = {
  img: imgs['flowers'], // image URL
  boxSize: 123, // size of grid boxes
  fade: false, // toggle fading opacity 
  dots: true, // toggle drawing dots
  dotColor: '#fff', // dot color
}

ctx.fillStyle = props.dotColor;

const img = new Image();
img.src = props.img;
img.onload = initImg;

function initImg(){
  for (let x=0; x<=cw; x+=props.boxSize) { for (let y=0; y<=ch; y+=props.boxSize) boxes.push({ x, y, d:0, s:0 }) }
  gsap.ticker.add(update)
}

function update(){
  const d = Math.hypot((m.x-m.x2),(m.y-m.y2));
  sTo( d/cw*2 )
  ctx.clearRect(0, 0, cw, ch)
  ctx.drawImage(img, 0, 0, cw, ch, 0, 0, cw, ch)
  boxes.forEach(drawImg)
  if (props.fade) ctx.globalAlpha = 1;
  if (props.dots) boxes.forEach(drawDots)
}

function drawImg(c){
  c.d = Math.hypot((c.x-m.x),(c.y-m.y));
  c.s = 1 - gsap.utils.clamp(0, 1, c.d/cw/m.s);
  if (c.s<0.001) return;
  let boxScaled = props.boxSize*(c.s);
  if (props.fade) ctx.globalAlpha = c.s
  ctx.drawImage(img, c.x+boxScaled/2, c.y+boxScaled/2, props.boxSize-boxScaled, props.boxSize-boxScaled, c.x, c.y, props.boxSize, props.boxSize)
}

function drawDots(c){
  ctx.beginPath();
  ctx.arc(c.x, c.y, props.boxSize*0.15*c.s, 0, T);
  ctx.fill();
}

c.addEventListener('pointermove', (e)=> {
  m.x2 = (e.x - cRect.left) * sx;
  m.y2 = (e.y - cRect.top) * sy;
  xTo(m.x2)
  yTo(m.y2)
})

window.addEventListener('resize', ()=>{
  cRect = c.getBoundingClientRect()
  sx = cw / cRect.width;
  sy = ch / cRect.height;
});



// Tweakpane
import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';
const pane = new Pane({title: 'Options', expanded:false});

const p_img = pane.addBinding(props, 'img', {options: imgs});
p_img.on('change', function(e) {
  img.src = e.value;
  initImg()
});

const p_boxSize = pane.addBinding(props, 'boxSize', {min: 25, max: 250, step: 1});
p_boxSize.on('change', (e)=> {
  boxes = [];
  props.boxSize = e.value;
  initImg()
});

const p_fade = pane.addBinding(props, 'fade');
p_fade.on('change', (e)=> props.fade = e.value );

const p_drawDots = pane.addBinding(props, 'dots');
p_drawDots.on('change', (e)=> props.dots = e.value );

const p_dotColor = pane.addBinding(props, 'dotColor', {});
p_dotColor.on('change', function(e) {
  props.dotColor = e.value;
  ctx.fillStyle = props.dotColor;
});