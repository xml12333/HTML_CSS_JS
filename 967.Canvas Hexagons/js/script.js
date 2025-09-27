const c = document.getElementById('c');
const ctx = c.getContext('2d');
const shapes = [];
const columns = 35;
const rows = 35;
const baseScale = .98;
const minScale = 0.12;
let max = Math.max(innerWidth, innerHeight);
let cRect;
const mouse = { x: max/2, y: max/2, r:0 };
const colors = ['rgb(0,0,99)', 'rgb(200,50,200)','rgb(23,23,223)', 'rgb(80,80,235)']

function setSizes() {
  max = Math.max(innerWidth, innerHeight);
  mouse.r = max / 2.6;
  c.width = c.height = max;
  cRect = c.getBoundingClientRect();
  
  const hexagonSize = max / (columns + 1); 
  const verticalSpacing = hexagonSize / Math.tan(Math.PI / 6);
  const total = rows * columns
  
  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / columns);
    const col = i % columns;
    const x = col * hexagonSize * 1.5; 
    const y = row * verticalSpacing + (col % 2) * (verticalSpacing / 2);
    if ( shapes.length < total ){
      shapes.push({
        x: x,
        y: y,
        size: hexagonSize,
        scale: baseScale,
        scale2: 1,
        row: row,
        col: col,
        color: gsap.utils.random(colors),
        a: 1
      });
      if (Math.random()>0.5) gsap.to(shapes[i], {
        duration: 2,
        scale2: () => 'random(0.65, 0.85)',
        color: () => gsap.utils.random(colors),
        repeat: -1,
        repeatRefresh: true,
        yoyo: true,
        ease: 'power1.inOut'
      }).seek( Math.random()*99 );
    }    
    else {
      shapes[i].x = x;
      shapes[i].y = y;
      shapes[i].size = hexagonSize;
    }
  }
}

function render() {
  ctx.clearRect(0, 0, c.width, c.height);
  shapes.forEach(shape => {    
    const dist = getDistance(shape);
    gsap.to(shape, {
      duration: 3, 
      ease: 'power3',
      overwrite: false,
      scale: (dist <= mouse.r ? Math.min(baseScale, 1 + (minScale - 1) * (1 - (dist / mouse.r))) : baseScale )
    });
    drawHexagon(ctx, shape.x, shape.y, (shape.size * shape.scale * shape.scale2), shape.color);
  });
}

function getDistance(shape) {
  const dx = mouse.x - shape.x;
  const dy = mouse.y - shape.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function drawHexagon(ctx, x, y, size, color) {
  const angle = Math.PI / 3;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const currentAngle = i * angle; 
    const pointX = x + size * Math.cos(currentAngle);
    const pointY = y + size * Math.sin(currentAngle);
    (i === 0) ? ctx.moveTo(pointX, pointY) : ctx.lineTo(pointX, pointY);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

window.addEventListener('resize', ()=>{
  cRect = c.getBoundingClientRect();
  if (c.width !== Math.max(innerWidth, innerHeight)) setSizes();
});

function pointerMove(e) {
  gsap.to(mouse, { x: e.x - cRect.left, y: e.y - cRect.top });
}
c.addEventListener('pointermove', pointerMove);
c.addEventListener('pointerleave', () => pointerMove({ x: innerWidth/2, y: innerHeight/2 }) );

setSizes();
gsap.ticker.add(render);