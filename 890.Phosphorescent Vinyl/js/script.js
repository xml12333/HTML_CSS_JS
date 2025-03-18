let persistence = 60 // [0, 100]
let mode = "vinyl" // "square"
let vinylSpeed = 40 // have fun

const can1 = document.getElementById("can-1")
const can2 = document.getElementById("can-2")
const pointerDetector = document.getElementById("pointer-detector")
const vinylHole = document.getElementById("vinyl-hole")
const ctx1 = can1.getContext("2d")
const ctx2 = can2.getContext("2d")

let size, w, h
let hue = 5
let initBackground = () => {
  ctx1.clearRect(0, 0, w, h)
  ctx1.fillStyle = "hsl(180, 90%, 25%)"
  //ctx1.fillRect(0, 0, w, h)
  
  // Draw board/vinyl background
  for (let i = 0; i < 50; i++) {
    let x = w * Math.random()
    let y = h * Math.random()
    let r = size / 300 * (10 + 130 * Math.random())

    ctx1.beginPath()
    ctx1.arc(x, y, r, 0, 2 * Math.PI, false)
    ctx1.fillStyle = "hsla(220, 70%, 45%, .01)"
    ctx1.fill()
    ctx1.closePath()
  }
}
let initSwitch = (switchId, colorsArray, action1, action2, initStateIndex) => {
  let node = document.getElementById(switchId)
  // Inject 1 segment and the knob
  node.innerHTML = '<div class="switch-segment"></div><div class="knob"></div>'
  
  // State management
  node.classList = 'switch state-' + initStateIndex
  let states = ['state-1', 'state-2']
  let index = initStateIndex - 1
  let click = () => {
    index = 1 + index % 2
    segmentNode.style.backgroundColor = colorsArray[index - 1]
    node.classList = 'switch ' + states[index - 1]
    if (index % 2 == 1) action1()
    else action2()
  }
  let segmentNode = node.querySelector('.switch-segment')
  node.addEventListener("click", click)
  
  // Init color
  click()
}
let switch1off = () => {
  hue = 180
}
let switch1on = () => {
  hue = 5
}
let init = () => {
  // Init dimensions
  size = (mode == "vinyl" ? 0.9 : 0.8) * Math.min(Math.min(550, window.innerHeight), window.innerWidth)
  w = size
  h = size
  can1.width = w * window.devicePixelRatio
	can1.height = h * window.devicePixelRatio
  can2.width = w * window.devicePixelRatio
	can2.height = h * window.devicePixelRatio
	can1.style.width = w + "px"
	can1.style.height = h + "px"
	can2.style.width = w + "px"
	can2.style.height = h + "px"
	ctx1.scale(window.devicePixelRatio, window.devicePixelRatio)
	ctx2.scale(window.devicePixelRatio, window.devicePixelRatio)
  pointerDetector.style.width = w + "px"
  pointerDetector.style.height = h + "px"
  vinylHole.style.width = w / 5 + "px"
  vinylHole.style.height = h / 5 + "px"
  
  // Shape vinyl
  if (mode == "vinyl") {
    can1.style.borderRadius = "50%"
    can2.style.borderRadius = "50%"
    pointerDetector.style.borderRadius = "50%"
    vinylHole.style.display = "inherit"
  }
  
  ctx2.lineCap = "round"
  
  initBackground()
  
  initSwitch('switch-1', ['hsl(180, 80%, 50%)', 'hsl(0, 90%, 45%)'], switch1off, switch1on, 2)
  
}
init()

let vinylAngle = 0
let drawLaserSegment = (x0, y0, x1, y1) => {
  ctx2.beginPath()
  ctx2.moveTo(x0, y0)
  ctx2.lineTo(x1, y1)
  
  // Strokes with decreasing brightness and increasing radius (big radius first)
  ctx2.lineWidth = 35
  ctx2.strokeStyle = "hsla(" + hue + ", 100%, 50%, .03)"
  ctx2.stroke()
  
  ctx2.lineWidth = 20
  ctx2.strokeStyle = "hsla(" + hue + ", 100%, 50%, .08)"
  ctx2.stroke()
  
  ctx2.lineWidth = 10
  ctx2.strokeStyle = "hsla(" + hue + ", 100%, 60%, .15)"
  ctx2.stroke()
  
  ctx2.lineWidth = 6
  ctx2.strokeStyle = "hsla(" + hue + ", 100%, 60%, .25)"
  ctx2.stroke()
  
  ctx2.lineWidth = 2
  ctx2.strokeStyle = "hsla(" + hue + ", 100%, 80%, .8)"
  ctx2.stroke()
  
  ctx2.lineWidth = 1.5
  ctx2.strokeStyle = "hsla(" + hue + ", 100%, 90%, 1)"
  ctx2.stroke()
  
  ctx2.lineWidth = 1
  ctx2.strokeStyle = "hsla(" + hue + ", 100%, 100%, 1)"
  ctx2.stroke()
  
  ctx2.closePath()
}

// User interaction
let lastX, lastY
let newX, newY
let isPointerInside = false
pointerDetector.addEventListener("pointermove", (event) => {
  isPointerInside = true
  let rect = event.target.getBoundingClientRect()
  newX = event.clientX - rect.left
  newY = event.clientY - rect.top
})
pointerDetector.addEventListener("pointerleave", () => {
  isPointerInside = false
  lastX = undefined
  lastY = undefined
})
let updateVinylRotation = () => {
  let transform = "rotate(" + vinylAngle * 360 / (2 * Math.PI) + "deg)"
  can1.style.transform = transform
  can2.style.transform = transform
}
let vinylLastX, vinylLastY, vinylDrawnX, vinylDrawnY
let updateVinylDrawnPosition = () => {
  vinylLastX = vinylDrawnX
  vinylLastY = vinylDrawnY
  let xx = newX - w / 2
  let yy = newY - h / 2
  let detectedAngle = Math.atan(yy / xx) + (Math.sign(xx) >= 0 ? 0 : Math.PI)
  let detectedRadius = Math.hypot(xx, yy)
  let repositionedAngle = detectedAngle - vinylAngle
  vinylDrawnX = w / 2 + detectedRadius * Math.cos(repositionedAngle)
  vinylDrawnY = h / 2 + detectedRadius * Math.sin(repositionedAngle) 
}

// Main loop
let loop = () => {
  // Black persistence overlay
  ctx2.beginPath()
  let alpha = 0.01 + 0.5 * Math.pow(1 - 0.01 * persistence, 4)
  ctx2.fillStyle = "rgba(0, 0, 0, " + alpha + ")"
  ctx2.fillRect(0, 0, w, h)
  ctx2.fill()
  ctx2.closePath()
  
  // Vinyl angle
  if (mode == "vinyl") {
    vinylAngle += vinylSpeed / 1000
    updateVinylRotation()
    updateVinylDrawnPosition()
    
    if (isPointerInside) {
      drawLaserSegment(vinylLastX || vinylDrawnX, vinylLastY || vinylDrawnY, vinylDrawnX, vinylDrawnY)
    }
  } else {
    if (isPointerInside) drawLaserSegment(lastX || newX, lastY || newY, newX, newY)
  }

  lastX = newX
  lastY = newY
  
  window.requestAnimationFrame(loop)
}

// On-resize reset
window.onresize = init

// Boot
loop()