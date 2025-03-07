import {Vector2 as vec2, MathUtils as mu, TextureLoader, Clock} from "three";

console.clear();

// load fonts
await (async function () {
  async function loadFont(fontface) {
    await fontface.load();
    document.fonts.add(fontface);
  }
  let fonts = [
    new FontFace(
      "FacultyGlyphic",
      "url(https://fonts.gstatic.com/s/facultyglyphic/v4/RrQIbot2-iBvI2mYSyKIrcgoBuQ4HO2E.woff2) format('woff2')"
    )
  ];
  for (let font in fonts) {
    await loadFont(fonts[font]);
  }
})();

class Point extends vec2{
  constructor(x, y, container){
    super(x, y);
    this.container = container;
    this.origin = new vec2(x, y);
    this.friction = 0.5;
    this.springFactor = 0.01;
    this.vx = 0;
    this.vy = 0;
  }
  
  // https://www.youtube.com/watch?v=XqB_Ulfpd0w
  move(t){
    let mouse = this.container.pointer;
    
    let ratio = this.container.imageRatio;
    
    let dx = (this.x - mouse.x) * ratio;
    let dy = this.y - mouse.y;

    let  dist = Math.sqrt(dx*dx + dy*dy);
    // interaction
    let dLim = this.container.dLim;
    if(this.container.isRipping && (dist<dLim)){
      let angle = Math.atan2(dy,dx);
      let tx = mouse.x * ratio + Math.cos(angle) * dLim;
      let ty = mouse.y + Math.sin(angle) * dLim;

      this.vx += tx - this.x * ratio;
      this.vy += ty - this.y;
    }

    // spring back
    let dx1 = -(this.x - this.origin.x);
    let dy1 = -(this.y - this.origin.y);

    this.vx += dx1 * this.springFactor;
    this.vy += dy1 * this.springFactor;

    // friction
    this.vx *= this.friction;
    this.vy *= this.friction;

    // actual move
    this.x += (this.vx / ratio) * t;
    this.y += this.vy * t;
  }
}

class PointGrid {
  constructor(img, baseAmount = 100){
    this.image = img;
    this.imageRatio = this.image.width / this.image.height;
    this.baseAmount = baseAmount;
    
    this.points = [];
    this.pointsRadius = 0.475;
    
    this.pointer = new vec2();
    this.isRipping = false;
    this.dLim = 2.7 * 5;
    
    this.init();
  }
  
  init(){
    let tempCnv = document.createElement("canvas");
    tempCnv.width = this.image.width;
    tempCnv.height = this.image.height;
    let tempCtx = tempCnv.getContext("2d");
    tempCtx.drawImage(this.image, 0, 0);
    let imageData = tempCtx.getImageData(0, 0, tempCnv.width, tempCnv.height).data;
    let sampleGrid = {width: this.baseAmount * this.imageRatio, height: this.baseAmount};
    
    let uStep = 1 / sampleGrid.width;
    let vStep = 1 / sampleGrid.height;
    let setPoint = (u, v) => {
      let x = Math.round(u * this.image.width);
      let y = Math.round(v * this.image.height);
      
      let dataIdx = (this.image.width * y + x) * 4;
      let sampledAlpha = imageData[dataIdx + 3];
      
      if (sampledAlpha > 128) this.points.push(new Point(u * 100, v * 100, this));
    }
    
    for(let row = 0; row < sampleGrid.height; row++){
      for(let col = 0; col < sampleGrid.width; col++){
        setPoint(col * uStep, row * vStep);
      }
    }
        
    // event stuff
    window.addEventListener("pointerdown", event => {
      this.isRipping = true;
    });
    window.addEventListener("pointermove", event => {
      this.setPointer(event);
    });
    window.addEventListener("pointerup", event => {
      this.isRipping = false;
    });
    
    cnv.addEventListener("touchstart", event => {
      this.isRipping = true;
    }, false);
    
    cnv.addEventListener("touchmove", event => {
      this.setPointer(event.touches[0]);
    }, false);
    
    cnv.addEventListener("touchend", event => {
      this.isRipping = false;
    }, false);
  }
  
  setPointer(event){
      let cnvRect = cnv.getBoundingClientRect();
      this.pointer.set(
        ((event.clientX - cnvRect.left) / (cnvRect.right - cnvRect.left)) * 100,
        ((event.clientY - cnvRect.top) / (cnvRect.bottom - cnvRect.top)) * 100
      );
    }
  
  update(t){
    this.points.forEach(p => {p.move(t)});
    this.draw();
  }
  
  draw(){
    ctx.fillStyle = "maroon";
    ctx.strokeStyle = "maroon";
    ctx.beginPath();
    let r = u(this.pointsRadius);
    this.points.forEach(p => {
      ctx.moveTo(u(p.x) * this.imageRatio + r, u(p.y));
      ctx.arc(u(p.x) * this.imageRatio, u(p.y), r, 0, Math.PI * 2);
    });
    ctx.fill();
  }
}

class TextLines {
  constructor(imageRatio){
    this.imageRatio = imageRatio;
    this.lines = [
      {
        text: "ORBIS TERRARVM",
        size: 10,
        position: {x: 50, y: 89.5}
      }
    ]
  }
  
  draw(){
    ctx.fillStyle = "maroon";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    this.lines.forEach(line => {
      ctx.font = `${u(line.size)}px FacultyGlyphic`;
      ctx.fillText(line.text, u(line.position.x * this.imageRatio), u(line.position.y));
    })
  }
}

class WindRose {
  constructor(imageRatio, x = 11, y = 75, r = 14){
    this.imageRatio = imageRatio;
    this.position = new vec2(x, y);
    this.rMax = r;
    this.rMin = r * 0.25;
    this.inclination = 0;
    
    this.letters = [..."ESWN"];
    this.controlPoints = Array.from({length: 5}, () => {return new vec2()});
    
  }
  
  draw(t){
    this.inclination = Math.sin(t * 0.1 + Math.cos(t * 0.27 + Math.sin(t * 0.31))) * 0.1;
    
    ctx.save();
      ctx.translate(u(this.position.x * this.imageRatio), u(this.position.y));
      ctx.rotate(this.inclination);
      
      ctx.fillStyle = "maroon";
      ctx.strokeStyle = "maroon";
      ctx.lineWidth = u(0.5);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.font = `${u(4)}px FacultyGlyphic`;
      let points = this.controlPoints;
      let inc = 0; //this.inclination;
      this.letters.forEach((letter, lIdx) => {
        let letterAngle = Math.PI * 0.5 * lIdx;
        points[0].set(0, 0);
        points[1].set(u(this.rMin), 0).rotateAround(points[0], letterAngle + (Math.PI * 0.25) + inc);
        points[2].set(u(this.rMax), 0).rotateAround(points[0], letterAngle + inc);
        points[3].set(u(this.rMin), 0).rotateAround(points[0], letterAngle - (Math.PI * 0.25) + inc);
        points[4].set(u(this.rMax * 1.2), 0).rotateAround(points[0], letterAngle + inc);
        
        ctx.beginPath()
        ctx.moveTo(...points[0]);
        ctx.lineTo(...points[1]);
        ctx.lineTo(...points[2]);
        ctx.lineTo(...points[3]);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(...points[0]);
        ctx.lineTo(...points[1]);
        ctx.lineTo(...points[2]);
        ctx.fill();
        
        ctx.fillText(letter, ...points[4]);
      })
    
    ctx.restore();
  }
}

let img = (await new TextureLoader().loadAsync(earthBase64String)).image;
let imgSize = {x: img.width, y: img.height};
let imgRatio = imgSize.x / imgSize.y;

let ctx = cnv.getContext("2d");
let unit = 0;
let u = val => unit * val;
let resize = () => {
  if(innerWidth > innerHeight * imgRatio){
    cnv.height = innerHeight * 0.95;
  } else {
    cnv.height = (innerWidth / imgRatio) * 0.95;
  }
  
  cnv.width = cnv.height * imgRatio;

  unit = cnv.height * 0.01;
  
  cnv.style.border = `${u(1)}px solid maroon`;
  cnv.style.borderRadius = `${u(5)}px`;
  
  document.body.style.backgroundColor = "#face8d";
}
window.addEventListener("resize", resize);
resize();

let pointGrid = new PointGrid(img);
let textLines = new TextLines(imgRatio);
let windRose = new WindRose(imgRatio);

let clock = new Clock();
let t = 0;

(function draw(){
  
   requestAnimationFrame(draw);
  
  ctx.clearRect(0, 0, cnv.width, cnv.height);
  
  let dt = clock.getDelta();
  t += dt;
  pointGrid.update(Math.min(dt * 1000, 1));
  textLines.draw();
  windRose.draw(t);
})();