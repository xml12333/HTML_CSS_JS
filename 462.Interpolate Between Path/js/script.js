console.clear()

import { spline, pointsInPath } from "https://cdn.skypack.dev/@georgedoescode/generative-utils@1.0.0";

const blendSteps = 25,
      precision = 99,
      stage = document.querySelector('.stage'),
      path1 = document.querySelector('.path1'),
      path2 = document.querySelector('.path2'),
      blended = document.querySelector('.blended')

let mx,
    my,
    currentPath = document.querySelector('.path1'),
    nPts = 0,
    drawn = 0

function setM(e){
  mx = e.clientX
  my = e.clientY
}

stage.addEventListener('pointerdown', handleDown)

function handleDown(e){
  setM(e)
  window.addEventListener('pointermove', setM)
  stage.addEventListener('pointerup', handleUp)
  stage.addEventListener('mouseleave', handleOut)
  gsap.set(currentPath,{attr:{d:'M'+mx+','+my}})
  addPt(true)
}

function handleOut(){
  stage.removeEventListener('pointerup', handleUp)
  handleUp()
}

function handleUp(){
  gsap.killTweensOf(addPt)
  window.removeEventListener('pointermove', setM)
  stage.removeEventListener('mouseleave', handleOut)
  let pInP = pointsInPath(currentPath,nPts)
  if (pInP.length==0) {//check to make sure a path was actually drawn
    (drawn>1) ? drawn = 1 : drawn = 0
    gsap.to('.dir', {opacity:1, ease:'power1.inOut'})
    return
  } 
  let d = spline(pInP, 1, false) //smooth the path
  gsap.set(currentPath, {attr:{d:d}})
  nPts = 0
  drawn++
  currentPath = (currentPath==path1) ? path2 : path1
  if (drawn>1) blend()
}

function addPt(loop){  
  const pts = currentPath.getAttribute('d')+' L'+mx+','+my+' '
  gsap.set(currentPath, {attr:{d:pts}})  
  nPts++
  if (loop) gsap.delayedCall(0.1, addPt, [true])  
}


function blend(){
  gsap.to('.dir', {opacity:0, ease:'power1.inOut'})

  gsap.killTweensOf('.blendPath')
  while (blended.childNodes.length > 0) blended.childNodes[0].remove()
  
  const pts1 = pointsInPath( document.querySelector('.path1'), precision ),
        pts2 = pointsInPath( document.querySelector('.path2'), precision )

  for (let i=0; i<blendSteps; i++){
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const prog = i/blendSteps
    gsap.set(p, {attr:{
      class:'blendPath',
      stroke:'rgba(255,255,255,0.5)',
      'stroke-dasharray':'29 2',//(1-prog)*5+' '+(1-prog)*5,
      d:()=>{
        let d = 'M'    
        for (let n=0; n<precision; n++){
          const x = (gsap.utils.interpolate(pts1[n].x, pts2[n].x, prog)).toFixed(3)
          const y = (gsap.utils.interpolate(pts1[n].y, pts2[n].y, prog)).toFixed(3)
          d = d+x+','+y+' '      
        }
        return d//+'z'
      }
    }})
    blended.appendChild(p)
  }

  gsap.fromTo('.blendPath', {
    opacity:(i)=>(i==0)?0:1
  }, {
    morphSVG:(i,t,a)=>(i==a.length-1) ? '.path2' : a[i+1],// for all but the last instance of blendPath, target the next instance...but on the last instance target path2 (the outter circle)
    opacity:(i,t,a)=>(i==a.length-1)?0:1,
    duration:1.2, 
    repeat:-1,
    ease:'none'
  })

}