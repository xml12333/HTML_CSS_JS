// Matter.js module aliases
var Engine = Matter.Engine,
  World    = Matter.World,
  Bodies   = Matter.Bodies,
  Body     = Matter.Body;

var Composite = Matter.Composite
var Events = Matter.Events;

var MouseConstraint = Matter.MouseConstraint;
var Constraint = Matter.Constraint;

// Timing - Static value used to match up with the music
// x and y are the values that gravity alternates between
// for each axis (between -1 and +1 multiplied by this value).
// They are dynamically updated.
var params = {
  timing: 675,
  x: 0,
  y: 0,
};

var createConnect = function(bodyA, bodyB) {
  return Constraint.create({
    bodyA: bodyA,
    bodyB: bodyB,
    stiffness: 0.05
  });
};

// Attach the neck to the ground
var createAnchor = function(x, y, bodyB) {
  return Constraint.create({
    pointA: {
      x: x,
      y: y
    },
    bodyB: bodyB,
    stiffness: 0.1
  });
};

// create a Matter.js engine
var engine = Engine.create(document.body);

var mouseConstraint = MouseConstraint.create(engine, {
  constraint: {
    stiffness: 1.0
  }
});

var boxA = Bodies.circle(50, 200, 10, {}, 100);
var boxB = Bodies.circle(600, 50, 10);
var boxC = Bodies.circle(400, 50, 10);
var boxD = Bodies.circle(400, 200, 10);
var boxE = Bodies.circle(100, 100, 10);

var anchor1 = createAnchor(50,200,boxA);
var anchor2 = createAnchor(600,50,boxB);
var anchor3 = createAnchor(400,50,boxC);
var anchor4 = createAnchor(400,200,boxD);
var anchor5 = createAnchor(100,100,boxE);

anchor1.render.visible = false;
anchor2.render.visible = false;
anchor3.render.visible = false;
anchor4.render.visible = false;
anchor5.render.visible = false;

var ground = Bodies.rectangle(400, 610, 3000, 60, {
  isStatic: true
});

var connectA = createConnect(boxA, boxB);
var connectB = createConnect(boxA, boxC);
var connectC = createConnect(boxA, boxD);
var connectD = createConnect(boxA, boxE);
var connectE = createConnect(boxB, boxC);
var connectF = createConnect(boxB, boxD);
var connectG = createConnect(boxB, boxE);
var connectH = createConnect(boxC, boxD);
var connectI = createConnect(boxC, boxE);
var connectJ = createConnect(boxD, boxE);

connectA.render.lineWidth = 0.5;
connectB.render.lineWidth = 0.5;
connectC.render.lineWidth = 0.5;
connectD.render.lineWidth = 0.5;
connectE.render.lineWidth = 0.5;
connectF.render.lineWidth = 0.5;
connectG.render.lineWidth = 0.5;
connectH.render.lineWidth = 0.5;
connectI.render.lineWidth = 0.5;
connectJ.render.lineWidth = 0.5;

// add all of the bodies to the world
World.add(engine.world, [mouseConstraint, boxA, boxB, boxC, boxD, boxE, ground]);

setTimeout(function(){ 
		
	World.add(engine.world, [anchor1,anchor2,anchor3,anchor4,anchor5,connectA,connectB,connectC,connectD,connectE,connectF,connectG,connectH,connectI,connectJ]);
	
}, 1000);

// run the engine
Engine.run(engine);

engine.world.gravity.y = 0;
engine.world.gravity.x = 0;

var mouse = mouseConstraint.mouse,
		constraint = mouseConstraint.constraint,
   	body = mouseConstraint.body;

Events.on(mouseConstraint, "mouseup",  function(event){
		
	var query = Matter.Query.point([boxA,boxB,boxC,boxD,boxE],constraint.pointA);
	
	if(query.length > 0){
			
// 			Matter.World.remove(engine.world, query[0])
				Matter.World.remove(engine.world, anchor1);
				
				//Body.translate(query[0], { x: 500, y: 500 });
				console.log(anchor1);
				//Body.translate( anchor1.pointA , { x: 500, y: 500 });
				//Matter.World.remove(engine.world, anchor1);
				//Matter.World.remove(engine.world,[connectA,connectB,connectC,connectD]);

// 				var boxF = Bodies.circle(350, 150, 10); 
// 				var anchor6 = createAnchor(350,150,boxF);
// 				var connect1 = createConnect(boxF, boxB);
// 				var connect2 = createConnect(boxF, boxC);
// 				var connect3 = createConnect(boxF, boxD);
// 				var connect4 = createConnect(boxF, boxE);
				
// 				connectA.stiffness = 0.00001;
// 				console.log(connectA);
					
					connectA.stiffness = 0.0;
					connectB.stiffness = 0.0;
					connectC.stiffness = 0.0;
					connectD.stiffness = 0.0;
					connectE.stiffness = 0.0;

					Body.scale(boxA, 2.0 , 2.0);
					Body.setPosition(boxA, { x: 200, y: 200 });
					
// 				World.add(engine.world, [boxF,anchor6,connect1,connect2,connect3,connect4]);
				
	}

});

Events.on(engine, 'tick', function(event) {
		
		//Animate the gravity based on sine curves based on dynamic x and y values.
		engine.world.gravity.y = params.y * Math.sin( 20 * event.timestamp / 2 / (Math.PI * params.timing));
		//engine.world.gravity.x = params.x * Math.sin( 3 * event.timestamp / 2 / (Math.PI * params.timing) - 1 * Math.PI / 1);

  // Slowly animate the x and y values to add variety to the movement
  // x alternates between 0.5 and 1.5 over 17 seconds
  // y alternates between 0.75 and 1.75 over 42 seconds
  params.x += (0.50 * Math.sin(20 * engine.timing.timestamp / (Math.PI * 17 * 1000)) + 1.0 - params.x) / 20;
  params.y += (0.50 * Math.sin(20 * engine.timing.timestamp / (Math.PI * 42 * 1000)) + 1.25 - params.y) / 20;
  
});