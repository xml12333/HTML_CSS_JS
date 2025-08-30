//This is a pressure based fluid sim combined with forward rendering.
var can = document.getElementById("canvas");
var ctx = can.getContext("2d");
can.width = window.innerWidth;
can.height = window.innerHeight;
var body = []
var l = []
var substeps = 2;
var click = false;
function randFrom(min,max) {
//Returns a random number from minimum to maximum
return Math.floor(Math.random() * (max - min + 1)) + min;
} 
function randBet(c1,c2) {
//Returns a random element from two options
var nArr = [c1,c2];
return nArr[randFrom(0,1)];
}
function norm(v) {
var mag = Math.sqrt(v.x**2 + v.y**2)
return {x: v.x/mag, y: v.y/mag}
}
function dot(v1,v2) {
return v1.x*v2.x + v1.y*v2.y
}
function dist(p1,p2) {
return Math.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2)
}
function distSqrd(p1,p2) {
return (p2.x - p1.x)**2 + (p2.y - p1.y)**2  
}
var curveArray = []
function curveVertex(px,py,context,active) {
  curveArray.push({x:px, y:py})
  var length = curveArray.length
  if(length == 4) {
    var tan1 = {x: (curveArray[2].x-curveArray[0].x)/4, y: (curveArray[2].y-curveArray[0].y)/4}
    var tan2 = {x: (curveArray[1].x-curveArray[3].x)/4, y: (curveArray[1].y-curveArray[3].y)/4}
    context.bezierCurveTo(curveArray[1].x + tan1.x, curveArray[1].y + tan1.y, curveArray[2].x + tan2.x, curveArray[2].y + tan2.y, curveArray[2].x, curveArray[2].y);
    curveArray.shift()
  } else if(length == 2) {
    context.moveTo(curveArray[1].x,curveArray[1].y)
  }
  if(active !== undefined && active == false) {
    curveArray = []
  }
}
var m = {x: can.width/8, y: can.height/2}
window.addEventListener("touchstart", function(event) {
    m.x = event.touches[0].clientX
    m.y = event.touches[0].clientY
    click = true;
})
window.addEventListener("touchend", function(event) {
    click = false;
})
window.addEventListener("mousedown", function(event) {
    m.x = event.clientX
    m.y = event.clientY
    click = true;
})
window.addEventListener("mouseup", function(event) {
    click = false;
})
function light(x, y, rad, r, g, b) {
    this.r = r
    this.g = g
    this.b = b
    this.x = x
    this.y = y
    this.radius = rad
    this.shine = 1
    this.t = 0
    var sx = Math.random() * 100
    var sy = Math.random() * 100
    var nx = new myNoise()
    var ny = new myNoise()
    this.show = function() {
        var grd = ctx.createRadialGradient(this.x, this.y, 3, this.x, this.y, 25);
        grd.addColorStop(0, "rgb(" + this.r + "," + this.g + "," + this.b + ")");
      grd.addColorStop(0.01, "rgba(" + this.r + "," + this.g + "," + this.b + ",0.4)");
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(this.x, this.y, 255, 0, 2*Math.PI)
        ctx.fill() 
    }
    this.upd = function() {
        this.x = nx.giveNoiseValue(sx,this.t) * can.width
        this.y = ny.giveNoiseValue(sy,this.t) * (can.height/2 - 30)
      if(this.y < 0) console.log(this.y)
        this.t += 0.003
    }
}
function surface(x, y, dirX, dirY, redPerc, greenPerc, bluePerc) {
    this.x = x
    this.y = y
    this.dirX = dirX
    this.dirY = dirY
    this.shine = 10
    this.dirVector = norm({x: dirX, y: dirY})
    this.redPerc = redPerc
    this.greenPerc = greenPerc
    this.bluePerc = bluePerc
    this.shownCol = {r: 0, g: 0, b: 0}
    this.resetCol = function() {
        this.shownCol.r = 0
        this.shownCol.g = 0
        this.shownCol.b = 0
        this.dirX = 0
        this.dirY = 0
    }
    this.inLightRange = function(light) {
        if(light.radius >= 0) {
        if(distSqrd({x:this.x, y:this.y}, {x:light.x, y:light.y}) <= light.radius**2) {
            return true
        }} else { return true}
        return false
    }
    this.reflectLight = function(light) {
        if(this.inLightRange(light)) {
        var surToLight = {x: light.x - this.x, y: light.y - this.y}
        var normalFallOff = 1
        var radialFallOff = 1
        if(light.radius >= 0) { normalFallOff = Math.max(dot(norm(surToLight), this.dirVector), 0)**this.shine }
        if(light.radius >= 0) { radialFallOff = (1 - (dist({x:this.x, y:this.y}, {x:light.x, y:light.y})/light.radius))**2 }
        var intensity = normalFallOff * radialFallOff
        var lightAtSur = {r: light.r * intensity, g: light.g * intensity, b: light.b * intensity}
        this.shownCol.r += lightAtSur.r * this.redPerc
        this.shownCol.g += lightAtSur.g * this.greenPerc
        this.shownCol.b += lightAtSur.b * this.bluePerc
        }
    }
    this.upd = function(y) {
        this.y = y
    }
}
var waterCol = {r: 70, g: 180, b: 160}
function densityBlock(x,w) {
    // The unit of the fluid in this simulation is a "Density Block" that stores height, density, velocity and acceleration.
    this.x = Math.round(x)
    this.y = can.height/2
    this.h = can.height-this.y
    this.vel = 0
    this.acc = 0
    this.P = 0
    this.grab = false;
    this.surf = new surface(this.x,this.y, 0, -1, waterCol.r/255, waterCol.g/255, waterCol.b/255)
    this.touchSplash = function() {
        var range = 40;
        if(m.x > this.x - range && m.x < this.x + range && m.y >= this.y && click == true) {
            this.grab = true;
        }
        if(click == false) {
            this.grab = false
        }
        (this.grab) ? this.P = (range - Math.abs(this.x-m.x))/range*200 : this.P = 0
    }
    this.press = function(otherBlock) { 
        var e = -((otherBlock.P + otherBlock.h*1.2) - (this.P + this.h*1.2)) * 0.04
        this.acc += e
    }
    this.upd = function(sub) {
        //For updating
        var drag = -this.vel/35
        this.acc += drag
        this.vel += this.acc/sub
        this.y += this.vel/sub
        this.surf.upd(this.y)
        this.h = can.height-this.y
        this.acc = 0
    }
}
function myNoise() {
   var topAmp = 0.5/1.875
   var amps = [topAmp, topAmp*0.5, topAmp*0.25, topAmp*0.125]
   freqRange = 3
   var freqs = [Math.random() * freqRange/4, Math.random() * freqRange/4 + freqRange/4, Math.random() * freqRange/4 + freqRange/2, Math.random() * freqRange/4 + 3*freqRange/4]
   var waveLength = 2
   this.giveNoiseValue = function(x,t) {
      var value = amps[0]*Math.sin(2*Math.PI*freqs[0]*t + 2*Math.PI*(x/waveLength)) + 
      amps[1]*Math.sin(2*Math.PI*freqs[1]*t + 2*Math.PI*(x/waveLength)) +
      amps[2]*Math.sin(2*Math.PI*freqs[2]*t + 2*Math.PI*(x/waveLength)) +
      amps[3]*Math.sin(2*Math.PI*freqs[3]*t + 2*Math.PI*(x/waveLength)) + 0.5
      return value;
   }
}
function drawWater(body) {
    var l = body.length
    ctx.fillStyle = "rgba(" + waterCol.r + "," + waterCol.g + "," + waterCol.b + ", 0.3)"
    ctx.beginPath()
    curveVertex(body[0].x,body[0].y,ctx)
    curveVertex(body[0].x,body[0].y,ctx)
    for(i = 1; i < l-1; i++) {
        curveVertex(body[i].x,body[i].y,ctx)
    }
    curveVertex(body[l-1].x,body[l-1].y,ctx)
    curveVertex(body[l-1].x,body[l-1].y,ctx,false)
    ctx.lineTo(can.width,can.height)
    ctx.lineTo(0,can.height)
    ctx.closePath()
    ctx.fill()
    var grd = ctx.createLinearGradient(0, 0, can.width, 0);
    for(i = 0; i < l; i++) {
      var stop = i / (l - 1)
      grd.addColorStop(stop.toFixed(2), "rgb(" + body[i].surf.shownCol.r + "," + body[i].surf.shownCol.g + "," + body[i].surf.shownCol.b + ")");
      body[i].surf.resetCol()
    }
    ctx.fillStyle = grd
    ctx.beginPath()
    curveVertex(body[0].x,body[0].y,ctx)
    curveVertex(body[0].x,body[0].y,ctx)
    for(i = 1; i < l-1; i++) {
        curveVertex(body[i].x,body[i].y,ctx)
    }
    var dip = 6
    curveVertex(body[l-1].x,body[l-1].y,ctx)
    curveVertex(body[l-1].x,body[l-1].y,ctx,false)
    ctx.lineTo(body[l-1].x,body[l-1].y + Math.max(5 + body[l-1].vel*dip, 5))
    curveVertex(body[l-1].x,body[l-1].y + Math.max(5 +body[l-1].vel*dip, 5),ctx)
    curveVertex(body[l-1].x,body[l-1].y + Math.max(5 + body[l-1].vel*dip, 5),ctx)
    for(i = l-2; i > 0; i--) {
        curveVertex(body[i].x,body[i].y + Math.max(5 + body[i].vel*dip, 5),ctx)
    }
    curveVertex(body[0].x,body[0].y + Math.max(5 + body[0].vel*dip, 5),ctx)
    curveVertex(body[0].x,body[0].y + Math.max(5 + body[0].vel*dip, 5),ctx,false)
    ctx.lineTo(body[0].x,body[0].y)
    ctx.fill()   
}
window.addEventListener("keydown", function() {
  waterCol = {r: randFrom(0,255), g: randFrom(0,255), b: randFrom(0,255)}
  for(i = 0; i < body.length; i++) {
    body[i].surf.redPerc = waterCol.r/255
    body[i].surf.greenPerc = waterCol.g/255
    body[i].surf.bluePerc = waterCol.b/255
  }
})
bodyNum = 80;
function gameMake() {
//Initial setup
var width = can.width/bodyNum * 6/7
for (i = 0; i < bodyNum; i++) {
    body.push(new densityBlock((i)/(bodyNum-1)*can.width, width))
}
l.push(new light(0, 0, 1000, 255, randFrom(30,255), randFrom(30,255)))
l.push(new light(0, 0, 1000, randFrom(30,255), 255, randFrom(30,255)))
l.push(new light(0, 0, 1000, randFrom(30,255), randFrom(30,255), 255))
l.push(new light(0, 0, 1000, 255, 255, randFrom(70,255)))
l.push(new light(0, 0, -1, 34, 0, 37))
click = true
setTimeout(() => { click = false }, 100);
}
function gameMove() {
//Animating function
ctx.clearRect(0,0,can.width,can.height);
ctx.lineWidth = 0.7;
ctx.textAlign = "center"
ctx.strokeStyle = "white"
ctx.font = "40px Calibri"
ctx.strokeText("Click the fluid to form ripples",can.width/2,40)
ctx.font = "20px Calibri"
ctx.strokeText("(Press a key to change fluid colour)",can.width/2,65)
for (i = 0; i < l.length; i++) {
    if(l[i].radius > 0) {
    l[i].show()
    l[i].upd()
}}
for (i = 0; i < bodyNum; i++) {
    body[i].touchSplash()
    for (s = 0; s < substeps; s++) {
        if(body[i-1] !== undefined) {
            body[i].press(body[i-1])
        }
        if(body[i+1] !== undefined) {
            body[i].press(body[i+1])
        }
        body[i].upd(substeps)
        if(body[i-1] !== undefined) {
            body[i].surf.dirX += body[i].y - body[i-1].y
            body[i].surf.dirY += body[i-1].x - body[i].x
        }
        if(body[i+1] !== undefined) {
            body[i].surf.dirX += body[i+1].y - body[i].y
            body[i].surf.dirY += body[i].x - body[i+1].x
        }
        body[i].surf.dirVector = norm({x: body[i].surf.dirX, y: body[i].surf.dirY})
        for (j = 0; j < l.length; j++) {
            body[i].surf.reflectLight(l[j])
        }
    }
}
drawWater(body)
requestAnimationFrame(gameMove)
}
gameMake()
gameMove()