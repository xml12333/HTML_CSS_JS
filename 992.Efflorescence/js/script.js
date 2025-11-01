var can = document.getElementById("canvas");
var ctx = can.getContext("2d");
can.width = window.innerWidth;
can.height = window.innerHeight;
var p = [];
var tulip, tulip2, tulip3;
var m = {x: can.width/8, y: can.height/2}
window.addEventListener("mousemove", function(event) {
    m.x = event.clientX
    m.y = event.clientY
})
window.addEventListener("touchmove", function(event) {
    m.x = event.touches[0].clientX
    m.y = event.touches[0].clientY
})
function distSqrd(x,y,x2,y2) {
    return ((x2 - x)**2 + (y2 - y)**2)
}
function Transition(startValue, endValue,  type = "linear", duration, delay = 0) { // Used for performing transition animations from one point to another
    this.start = startValue
    this.end = endValue
    this.duration = duration
    this.delay = delay
    this.type = type
    this.done = false
    this.startTime = Date.now()
    this.setValue = function(start, end,  t = this.type, dur = this.duration, del = this.delay) {
        this.start = start
        this.end = end
        this.currentVal = start
        this.duration = dur
        this.delay = del
        this.type = t
        this.done = false
        this.startTime = Date.now()
    }
    this.getCurrentTime = function() {
        return Date.now()
    }
    this.getElapsedTime = function() {
        return (this.getCurrentTime() - this.startTime)/1000
    }
    this.giveValue = function() {
        var delta = this.end - this.start
        var elapsed = (this.getElapsedTime() - this.delay)/this.duration
        var timeFunction
        switch(this.type) {
            case "easeOut":
                timeFunction = 1 - ((1 - elapsed) ** 4)
                break
            case "easeInOut":
                (elapsed < 0.5) ? timeFunction = ((elapsed * 2) ** 4)/2 : timeFunction = (2 - (((1 - elapsed) * 2) ** 4))/2
                break
            case "easeOutBack":
                var j = 0.45
                timeFunction = 1 - ((-2 * ((1 - elapsed) ** 3) + (3 * j) * ((1 - elapsed) ** 2))/(3 * j - 2))
                break
            default:
                console.log("Invalid Transition")
        }
        if(elapsed >= 1) {
            if(!this.done) this.done = true; 
            return this.end
        } else if(elapsed <= 0) {
            return this.start
        }
        return this.start + delta * timeFunction
    }
}
function Petal(x, y, ang, l, h, max, dur, del, type) { //Creates a petal object with transition animation
    var transition = "easeInOut"
    this.scale = new Transition(-0.05, max, transition, dur, del)
    this.x = x
    this.y = y
    this.h = h
    if(type == "gold") {
        var shade = []
        var shadeNum = 15
        for(var i = 0; i < shadeNum; i++) {
            shade.push(Math.random())
        }
    }
    this.upd = function() {// Draws and moves petals
        var size = this.scale.giveValue()
        switch(type) {
            case "gold":
                ctx.lineWidth = 5
                ctx.save()
                var grd = ctx.createLinearGradient(0,0,l,0)
                grd.addColorStop(0, "black")
                grd.addColorStop(0.2, "black")
                grd.addColorStop(0.9, "hsl(45,100%," + ((size >= 0) ? 30 + 40*shade[Math.floor(size*(shadeNum-1))] : 100*shade[0]) + "%)")
                grd.addColorStop(1, "hsl(45,100%," + ((size >= 0) ? 30 + 40*shade[Math.floor(size*(shadeNum-1))] : 100*shade[0]) + "%)")
                ctx.strokeStyle = grd
                grd = ctx.createLinearGradient(0,0,l,0)
                grd.addColorStop(0, "hsl(" + this.h + "," + ((size >= 0) ? 80 : 0) + "%,10%)")
                grd.addColorStop(1, "hsl(" + this.h + "," + ((size >= 0) ? 80 : 0) + "%," + (size >= 0 ? (10 + size * 45) : 20) + "%)")
                ctx.fillStyle = grd
                ctx.translate(this.x, this.y)
                ctx.rotate(ang)
                ctx.scale((size <= 1) ? size : (-size + 2), 1)
                ctx.beginPath()
                ctx.moveTo(0,-l/10)
                ctx.quadraticCurveTo(l/2, -l/20, 3 * l/4, -l/6)
                ctx.lineTo(l, 0)
                ctx.lineTo(3 * l/4, l/6)
                ctx.quadraticCurveTo(l/2, l/20, 0, l/10)
                ctx.closePath()
                ctx.fill()
                ctx.stroke()
                ctx.restore()
                break 
            case "strange": 
                ctx.lineWidth = 1
                ctx.save()
                ctx.strokeStyle = "hsl(0,0%," + (size >= 0 ? (30 + size * 70) : 20) + "%)"
                ctx.fillStyle = "hsla(" + this.h + "," + ((size >= 0) ? 100 : 0) + "%," + (size >= 0 ? (6 + size * 40) : 20) + "%,0.8)"
                ctx.translate(this.x, this.y)
                ctx.rotate(ang)
                ctx.scale((size <= 1) ? size : (-size + 2), 1)
                ctx.beginPath()
                ctx.arc(l, 0, 5, 0, 2*Math.PI)
                ctx.fill()
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo(l/2, 0)
                ctx.lineTo(l-5, 0)
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo(0,-l/10)
                ctx.quadraticCurveTo(l/2, -l/7, l/2, 0)
                ctx.quadraticCurveTo(l/2, l/7, 0, l/10)
                ctx.closePath()
                ctx.fill()
                ctx.stroke()
                ctx.restore()
                break 
            default:
            ctx.lineWidth = 5
            ctx.save()
            var grd = ctx.createLinearGradient(0,0,l,0)
            grd.addColorStop(0, "hsl(" + this.h + "," + ((size >= 0) ? 100 : 0) + "%,10%)")
            grd.addColorStop(1, "hsl(" + this.h + "," + ((size >= 0) ? 100 : 0) + "%," + (size >= 0 ? (10 + size * 50) : 20) + "%)")
            ctx.fillStyle = grd
            ctx.translate(this.x, this.y)
            ctx.rotate(ang)
            ctx.scale((size <= 1) ? size : (-size + 2), 1)
            ctx.beginPath()
            ctx.moveTo(0,-l/20)
            ctx.quadraticCurveTo(3 * l/4,-l/3, l, 0)
            ctx.quadraticCurveTo(3 * l/4,l/3, 0,l/20)
            ctx.closePath()
            ctx.fill()
            ctx.restore()
        }
    }
}
function Flower(x, y, h, petalDur, type) { // Creates a flower object from multiple petals
    //To be editted later for customizable Bloom duration.
    switch(type) {
        case "gold": 
            this.num = 10
            this.layers = 6
            break
        case "strange": 
            this.num = 6
            this.layers = 10
            break
        default:
            this.num = 8
            this.layers = 6
    }
    this.h = h
    this.inside = false
    var random = 0.11
    var delayMult = 0.08
    this.bloomDur = (random + (this.layers-1)*delayMult) + petalDur
    this.canChange = false
    setTimeout(function() {this.canChange = true}, this.bloomDur*1000)
    this.ready = false
    this.rad = Math.min(can.width, can.height)/20
    var innerRad = this.rad/3
    this.petals = []
    for(var j = 0; j < this.layers; j++) {
        for(var i = 0; i < this.num; i++) {
            var angle = i * 2 * Math.PI/this.num + j * 0.3
            var setRad = this.rad + (innerRad - this.rad) * j/(this.layers-1)
            var del = Math.random()*random + j*delayMult
            var hue = (type == "gold") ? h + 110*(this.layers-1-j)/(this.layers-1) : h
            this.petals.push(new Petal(x + Math.cos(angle)*setRad, y + Math.sin(angle)*setRad, angle, setRad*4, hue, 0.3 + (1-0.3)*(this.layers-1-j)/(this.layers-1), petalDur, del, type))
    }}
    var fullNum = this.layers * this.num
    var st = Date.now()
    this.changeOnMouse = function() {// Handles the mouse responses
        if(distSqrd(x, y, m.x, m.y) <= (this.rad + 10)**2 && this.canChange) {
            for(var j = 0; j < this.layers; j++) {
            for(var i = 0; i < this.num; i++) {
                var index = j*this.num + i
                var del = (random + (this.layers-1)*delayMult) - this.petals[index].scale.delay
                this.petals[index].scale.setValue(this.petals[index].scale.end, this.petals[index].scale.start, "easeOut", petalDur, del)
            }}
            this.canChange = false
            st = Date.now()
        }
        if((Date.now() - st)/1000 > this.bloomDur && !this.canchange) {
                this.ready = true
        }
        if(distSqrd(x, y, m.x, m.y) > (this.rad + 10)**2 && this.ready) {
            this.ready = false
            this.canChange = true
        }
         return;
    }
    this.upd = function() { // Updates the blooming and closing state of flower, also draws the base
        ctx.fillStyle = "hsl(" + h + ",100%,10%)"
        ctx.beginPath()
        ctx.arc(x, y, this.rad, 0, 2*Math.PI)
        ctx.fill()
        this.changeOnMouse()
    }
}
function setup() { // Sets the starting state
    tulip = new Flower(can.width/5, can.height/2, 13, 1)
    tulip2 = new Flower(can.width/2, can.height/2, 190, 1, "gold")
    tulip3 = new Flower(4*can.width/5, can.height/2, 120, 1, "strange")
}
function anim() { // Animates the program
    ctx.clearRect(0,0,can.width,can.height);
    ctx.lineWidth = 0.8;
    ctx.textAlign = "center"
    ctx.strokeStyle = "white"
    ctx.font = "30px Calibri"
    ctx.strokeText("Hover over the flowers to make them bloom or close",can.width/2,40)
    var l = tulip.petals.length
    tulip.upd()
    for(var i = 0; i < l; i++) {
        tulip.petals[i].upd()
    }
    l = tulip2.petals.length
    tulip2.upd()
    for(var i = 0; i < l; i++) {
        tulip2.petals[i].upd()
    }
    l = tulip3.petals.length
    tulip3.upd()
    for(var i = 0; i < l; i++) {
        tulip3.petals[i].upd()
    }
    requestAnimationFrame(anim)
}
window.onload = function() {
setup()
anim()
}