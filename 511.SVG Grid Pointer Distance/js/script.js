const stage = document.querySelector('svg')
const hit = document.querySelector('div')
let mPos = {x:50, y:-50}

for (let x=1; x<10; x++)
  for (let y=1; y<10; y++) makePt(x*10, y*10)

function makePt(x,y){
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
  gsap.set(g, {x:x, y:y, attr:{class:'pt'}})
  stage.append(g) 
  
  const t = document.createElementNS("http://www.w3.org/2000/svg", "text")
  const dist = Math.abs( Math.abs(x-mPos.x) + Math.abs(y-mPos.y) )
  gsap.set(t, {
    innerHTML:dist,
    scale:Math.max(1-dist/100,0),
    attr:{
      x:x-mPos.x,
      y:y-mPos.y,
      'text-anchor':'middle',
      fill:'hsl('+(dist*Math.PI)+',100%,50%)'
    }
  })
  g.appendChild(t)  
}

function redraw(t){
  const txt = t.querySelector('text')
  const p = t.querySelector('path')
  const x = gsap.getProperty(t, 'x')
  const y = gsap.getProperty(t, 'y')
  const dist = Math.abs( Math.abs(x-mPos.x) + Math.abs(y-mPos.y) )
  gsap.to(txt, {
    duration:0.7,
    scale:Math.max(1-dist/100,0),
    innerHTML:dist,
    snap:'innerHTML',
    attr:{
      x:x-mPos.x,
      y:y-mPos.y,
      fill:'hsl('+(dist*Math.PI)+',100%,50%)'
    }
  })
}

window.onpointermove = (e)=>{
  const domPt = new DOMPoint(e.x, e.y);
  let svgPt = domPt.matrixTransform( stage.getScreenCTM().inverse() );
  gsap.set(mPos, {x:svgPt.x, y:svgPt.y})
  pts.forEach(redraw)
}

const pts = document.querySelectorAll('.pt')
gsap.to(mPos, {ease:'none', x:50, y:50, onUpdate:()=>{ pts.forEach(redraw) }})