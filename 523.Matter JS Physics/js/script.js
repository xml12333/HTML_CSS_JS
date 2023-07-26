/* To apply this animation to your website, paste the following into your HTML code:
<iframe src="https://codepen.io/tommyho/full/PoxdWJY" width=500 height=500></iframe>
*/

/*
  Sources:
  https://thecodingtrain.com/tracks/the-nature-of-code-2/noc/6-physics-libraries/1-matterjs-introduction
  Revised by: tommyho510@gmail.com   
*/

/* --- System Parameters (Recommended)--- */
let pBounce =   0.8;  // Define Bounciness (0.8)
let pFriction = 0.01; // Define air friction (0.01)
// mouse click in mid-air to create more particles

/* --- Main Program: DO NOT EDIT BELOW --- */
let w = window.innerWidth;
let h = window.innerHeight;

const { Engine, Render, Bodies, World, MouseConstraint, Composites, Query } = Matter;

const sectionTag = document.querySelector("section.canvas");
const engine = Engine.create();
const renderer = Render.create({
  element: sectionTag,
  engine: engine,
  options: {
    width: w,
    height: h,
    background: "#000000",
    wireframes: false,
    pixelRatio: window.devicePixelRatio 
  }
});

// Create a bubble
const createShape = function(x, y) {
  return Bodies.circle(x, y, 25, {
    frictionAir: pFriction,
    restitution: pBounce,
    render: {
      sprite: {
        yScale: 0.5,
        xScale: 0.5, 
      }
    }
  })
};

// Create a static body to bounce off
const staticObj = Bodies.polygon(w / 2, h / 2, 6, Math.min(w / 6, h / 6), {
  isStatic: true,
  render: {
    lineWidth: 5,
    strokeStyle: 'yellow',
    fillStyle: "#448",
    visible: true
  }
});

// Create a wall for the shapes to bounce off
const wallOptions = {
  isStatic: true,
  render: {
    visible: true
  }
};

const ground = Bodies.rectangle(w / 2, h + 50, w + 100, 100, wallOptions);
const ceiling = Bodies.rectangle(w / 2, -50, w + 100, 100, wallOptions);
const leftWall = Bodies.rectangle(-50, h / 2, 100, h + 100, wallOptions);
const rightWall = Bodies.rectangle(w + 50, h / 2, 100, h + 100, wallOptions);

const mouseControl = MouseConstraint.create(engine, {
  element: sectionTag,
  constraint: {
    render: {
      visible: false
    }
  }
});

// Create a stack of 15 x 5 bubbles
const intialShapes = Composites.stack(50, 50, 15, 5, 40, 40, function(x, y){
  return createShape(x, y)
});

// Start world engine
World.add(engine.world, [
  staticObj, 
  ground,
  ceiling,
  leftWall,
  rightWall,
  mouseControl,
  intialShapes
]);

// Add resize listener
/* 
window.addEventListener("resize", function() {
	w = window.innerWidth;
	h = window.innerHeight;
	renderer = Render.run({
    options: {
      width: w,
      height: h,
    }
  })
});
*/

// Add a click listener -> add a bubble or drag a bubble
document.addEventListener("click", function(event){
  const shape = createShape(event.pageX, event.pageY);
  intialShapes.bodies.push(shape);
  World.add(engine.world, shape);
});

// Add a mousemove -> change bubble color or drag a bubble
document.addEventListener("mousemove", function(event){
  const vector = {x: event.pageX, y: event.pageY};
  const hoveredShapes = Query.point(intialShapes.bodies, vector);
  
  hoveredShapes.forEach(shape => {
    shape.render.sprite = null
    shape.render.fillStyle = "black"
    shape.render.lineWidth = 5
  });
  
});

Matter.Runner.run(engine);
Matter.Render.run(renderer);

// Add time-dependent gravity
let time = 0;
const changeGravity = function() {
 time = time + 0.01;
   
 engine.world.gravity.x = Math.sin(time);
 engine.world.gravity.y = Math.cos(time);
 
 requestAnimationFrame(changeGravity);
};

changeGravity();

// Add orientation listener -> gravity follows orientation
/*
window.addEventListener("deviceorientation", function(event){
  engine.world.gravity.x = event.gamma;
  engine.world.gravity.y = event.beta;
});
*/
