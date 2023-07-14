"use strict"; // Paul Slaymaker, paul25882@gmail.com
const body=document.getElementsByTagName("body").item(0);
body.style.background="#000";

const TP=2*Math.PI;
const CSIZE=400;

const ctx=(()=>{
  let d=document.createElement("div");
  d.style.textAlign="center";
  body.append(d);
  let c=document.createElement("canvas");
  c.width=2*CSIZE;
  c.height=2*CSIZE;
  d.append(c);
  return c.getContext("2d");
})();
ctx.translate(CSIZE,CSIZE);
ctx.lineCap="round";

onresize=()=>{ 
  let D=Math.min(window.innerWidth,window.innerHeight)-40; 
  ctx.canvas.style.width=D+"px";
  ctx.canvas.style.height=D+"px";
}

const getRandomInt=(min,max,low)=>{
  if (low) return Math.floor(Math.random()*Math.random()*(max-min))+min;
  else return Math.floor(Math.random()*(max-min))+min;
}

var Circle=function(x,y,xp,yp,radius,pc) {
  this.x=x;
  this.y=y;
  this.xp=xp;
  this.yp=yp;
  this.radius=radius;
  this.pc=pc;
  this.c=[];
  this.drawCircle=(rf)=>{
    ctx.beginPath();
      ctx.moveTo(this.x+this.radius*rf,this.y);
      ctx.arc(this.x,this.y,this.radius*rf,0,TP);
ctx.fillStyle="hsl("+(hue+5*this.radius)+",90%,50%)";
    ctx.fill();
  }
}

var Curve=function() {
  this.car=[];
  this.to=-getRandomInt(0,400);
  this.addCurveCircle=(cir)=>{
    if (cir.pc) {
      this.car.unshift(cir.pc);
      this.addCurveCircle(cir.pc);
    } else {
      return;
    }
  }
  this.setPath=()=>{
    this.len=0;
    this.path=new Path2D();
    this.path.moveTo(0,0);
    this.path.lineTo(this.car[1].xp,this.car[1].yp);
    this.len+=this.car[0].radius;
    for (let i=1; i<this.car.length-1; i++) {
      this.path.bezierCurveTo(this.car[i].x,this.car[i].y,
                              this.car[i].x,this.car[i].y,
                              this.car[i+1].xp,this.car[i+1].yp);
      this.len+=2*this.car[i].radius;
    }
    this.path.lineTo(this.car[this.car.length-1].x,this.car[this.car.length-1].y);
    this.len+=this.car[this.car.length-1].radius;
  }
  this.drawCurve=()=>{
    let tt=this.to+t;
    ctx.setLineDash([Math.max(1,tt),4000]);
    ctx.stroke(this.path);
    if (tt>this.len+40) {
      this.car[this.car.length-1].drawCircle(0.8);
      if (tt>this.len+120) return false;
      else return true;
    } else if (tt>this.len) {
      let raf=0.8*(tt-this.len)/40;
      this.car[this.car.length-1].drawCircle(raf);
      return true;
    } else {
      return true;
    }
  }
}

var drawPoint=(x,y,col)=>{	// diag
  ctx.beginPath();
  ctx.arc(x,y,5,0,TP);
  ctx.closePath();
  if (col) ctx.fillStyle=col;
  else ctx.fillStyle="red";
  ctx.fill();
}

var cval=(x,y,rad)=>{
  if (Math.pow(x*x+y*y,0.5)>CSIZE-rad) return false;
  for (let i=0; i<ca.length; i++) {
    let rt=rad+ca[i].radius;
    let xd=ca[i].x-x;
    let yd=ca[i].y-y;
    if (Math.abs(xd)>rt) continue;
    if (Math.abs(yd)>rt) continue;
    if (Math.pow(xd*xd+yd*yd,0.5)+1<rt) {
      return false;
    }
  }
  return true;
}

var eg=Math.random()<0.3;

var grow=(rad)=>{
  let c=eg
        ?ca[ca.length-1-getRandomInt(0,ca.length,true)]
        :ca[getRandomInt(0,ca.length)];
  let a=TP*Math.random();
  let x=c.x+(c.radius+rad)*Math.cos(a);
  let y=c.y+(c.radius+rad)*Math.sin(a);
  if (cval(x,y,rad)) {
    let xp=c.x+c.radius*Math.cos(a);
    let yp=c.y+c.radius*Math.sin(a);
    let circle=new Circle(x,y,xp,yp,rad,c);
    c.c.push(circle);
    ca.push(circle);
    return true;
  }
  return false;
}

ctx.fillStyle="green";
ctx.lineWidth=5;

var draw=()=>{
  ctx.clearRect(-CSIZE,-CSIZE,2*CSIZE,2*CSIZE);
  let grown=0;
  for (let i=0; i<curves.length; i++) {
    if (curves[i].drawCurve()) grown++;
  }
  drawPoint(0,0,"silver");
  return grown;
}

var stopped=true;
var start=()=>{
  if (stopped) { 
    stopped=false;
    requestAnimationFrame(animate);
  } else stopped=true;
}
body.addEventListener("click", start, false);

var t=0;
var inc=3;
var animate=()=>{
  if (stopped) return;
  t+=inc;
  if (!draw() || t<0) {
    if (inc==3) inc=-8;
    else { 
      ctx.strokeStyle="hsla("+getRandomInt(0,360)+",90%,60%,0.6)";
      inc=3; 
      t=0; 
      eg=Math.random()<0.3;
      setCircles();
    }
  }
  requestAnimationFrame(animate);
}

var hue=getRandomInt(0,360);
var ca=[new Circle(0,0,0,0,50,0,0)];

var curves=[];

var setCircles=()=>{
  ca=[new Circle(0,0,0,0,50,0,0)];
  for (let i=0; i<2000; i++) {
    let r=10;
    if (i<20) r=42;
    else if (i<100) r=34;
    else if (i<300) r=26;
    else if (i<1000) r=18;
    grow(r);
  }
  curves=[];
  for (let i=0; i<ca.length; i++) {
    if (ca[i].c.length==0) {
      var nc=new Curve();
      nc.car=[ca[i]];
      nc.addCurveCircle(ca[i]);
      nc.setPath();
      curves.push(nc)
    }
  }
}

onresize();

setCircles();
ctx.strokeStyle="hsla("+getRandomInt(0,360)+",90%,60%,0.6)";

start();