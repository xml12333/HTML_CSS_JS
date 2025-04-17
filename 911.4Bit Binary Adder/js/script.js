var matterContainer = document.getElementById("matter-container");
// module aliases
var Engine = Matter.Engine,
	Render = Matter.Render,
	Runner = Matter.Runner,
	Bodies = Matter.Bodies,
	Composite = Matter.Composite;

var centerX = window.innerWidth / 2;
var centerY = window.innerHeight / 2;

// create an engine
var engine = Engine.create();
var world = engine.world;
// create a renderer
var render = Render.create({
	element: matterContainer,
	engine: engine,
	options: {
		width: matterContainer.clientWidth,
		height: matterContainer.clientHeight,
		background: "transparent",
		wireframes: false
	}
});
engine.world.gravity.y = 0.5;
// create objects
// And(centerX,centerY,1);
// Xor(300, 300, 2);
// duper(centerX, centerY, 1, 10);
// or(centerX, centerY, 1, 10);
duper(centerX + 400, 100, 0.5, 5);
And(centerX + 425, 325, 0.5);
Xor(centerX + 540, 350, 0.5);
duper(centerX + 200, 100, 0.5, 5);
And(centerX + 225, 325, 0.5);
Xor(centerX + 340, 350, 0.5);
duper(centerX + 0, 100, 0.5, 5);
And(centerX + 25, 325, 0.5);
Xor(centerX + 140, 350, 0.5);
duper(centerX - 200, 100, 0.5, 5);
And(centerX - 175, 325, 0.5);
Xor(centerX - 60, 350, 0.5);
duper(centerX + 360, 750, 0.5);
line(centerX + 450, 675, 100, -Math.PI / 4, 0.5, 10, 1);
And(centerX + 390, 980, 0.5);
Xor(centerX + 500, 980, 0.5);
or(centerX + 250, 1200, 0.5);
line(centerX + 350, 1109, 175, -Math.PI / 6, 1, 10);
duper(centerX + 200, 1400, 0.5);
And(centerX + 240, 1650, 0.5);
Xor(centerX + 350, 1650, 0.5);
or(centerX + 60, 1920, 0.5);
line(centerX + 200, 1780, 175, -Math.PI / 6, 1, 10);
line(centerX + 110, 1850, 50, -Math.PI / 3, 1, 10);
duper(centerX + 0, 2200, 0.5, 5);
And(centerX + 20, 2450, 0.5);
Xor(centerX + 130, 2450, 0.5);
or(centerX - 130, 2700, 0.5);
line(centerX - 10, 2580, 175, -Math.PI / 6, 1, 10);
line(centerX - 85, 2635, 50, -Math.PI / 3, 1, 10);
bucket(centerX + 600, 3000, 0.5);
bucket(centerX + 500, 3000, 0.5);
bucket(centerX + 400, 3000, 0.5);
bucket(centerX + 200, 3000, 0.5);
bucket(centerX - 100, 3000, 0.5);
var stopper = Bodies.rectangle(centerX + 100, 60, 1000, 1, { isStatic: true });
Composite.add(world, stopper);

// add all of the bodies to the world

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);

function animation() {
	requestAnimationFrame(animation);
}

window.addEventListener("resize", function () {
	render.canvas.width = matterContainer.clientWidth;
	render.canvas.height = matterContainer.clientHeight;
});
animation();

//line function
function line(x, y, length, angle = 0, size, width = 1, friction = 0) {
	var rect = Bodies.rectangle(x, y, length * size, width, {
		angle: angle,
		isStatic: true,
		friction: friction
	});
	Composite.add(world, rect);
}
function seesaw(x, y, length, width, angle) {
	var catapult = Bodies.rectangle(x, y, length, width, {
		friction: 1,
		angle: angle
	});
	Composite.add(world, [
		catapult,
		Matter.Constraint.create({
			bodyA: catapult,
			pointB: Matter.Vector.clone(catapult.position)
		}),
		Matter.Constraint.create({
			bodyA: catapult,
			pointB: Matter.Vector.clone(catapult.position)
		})
	]);
}
function string(BodyA, BodyB) {
	Composite.add(world, [
		Matter.Constraint.create({
			bodyA: BodyA,
			bodyB: BodyB
		})
	]);
}
function ball(x, y, radius, friction = {}) {
	var balll = Bodies.circle(x, y, radius, friction);
	Composite.add(world, balll);
}
// ball(centerX - 40 - 200, 0, 10);
// ball(centerX + 40 - 200, 0, 10);
// ball(centerX - 40 + 200, 0, 10);
// ball(centerX + 40 + 200, 0, 10);
function And(x, y, size) {
	line(x - 30 * size, y - 25 * size, 150, Math.PI / 4, size, 16 * size);
	line(x + 60 * size, y + 70 * size, 25, Math.PI / 4, size);
	line(x + 60 * size, y + 20 * size, 25, Math.PI / 2, size);
	line(x + 70 * size, y + 10 * size, 120, Math.PI / 2, size);
	line(x + 28 * size, y + 84 * size, 120, Math.PI / 2, size);
	line(x + 51 * size, y + 122 * size, 120, Math.PI / 2, size);
	line(x + 40 * size, y - 50 * size, 60, 0, size);
	line(x + 60 * size, y - 80 * size, 120, -Math.PI / 6, size, 8 * size);
}
function Xor(x, y, size) {
	line(x - 50 * size, y - 60 * size, 150, Math.PI / 4, size, 4 * size);
	line(x - 50 * size, y - 60 * size, 150, Math.PI / 4, size, 4 * size);
	line(x + 24 * size, y + 20 * size, 15, Math.PI / 4, size);
	line(x + 60 * size, y + 70 * size, 25, Math.PI / 4, size);
	line(x + 70 * size, y + 10 * size, 120, Math.PI / 2, size);
	line(x + 28 * size, y + 124 * size, 200, Math.PI / 2, size);
	line(x + 51 * size, y + 177 * size, 230, Math.PI / 2, size);
	line(x + 40 * size, y - 50 * size, 60, 0, size);
	line(x + 10 * size, y + 33 * size, 30, 0, size);
	line(x + 32 * size, y - 70 * size, 60, -Math.PI / 4, size, 4 * size);
	seesaw(x + 12 * size, y + 3 * size, 55 * size, 2 * size, Math.PI / 1.9);
	ball(x + 0 * size, y + 25 * size, 4 * size, {
		density: 1,
		mass: 1,
		friction: 0
	});
	line(x - 50 * size, y + 115 * size, 350, Math.PI / 2, size);
	line(x - 20 * size, y + 50 * size, 60, Math.PI / 14, size);
	line(x - 20 * size, y + 90 * size, 60, Math.PI / 14, size);
	line(x - 20 * size, y + 130 * size, 60, Math.PI / 14, size);
	line(x - 20 * size, y + 170 * size, 60, Math.PI / 14, size);
	line(x - 20 * size, y + 210 * size, 60, Math.PI / 14, size);
	line(x - 37 * size, y + 41 * size, 30, Math.PI / 4, size);
	line(x - 1 * size, y + 70 * size, 60, -Math.PI / 14, size);
	line(x - 1 * size, y + 110 * size, 60, -Math.PI / 14, size);
	line(x - 1 * size, y + 150 * size, 60, -Math.PI / 14, size);
	line(x + 8 * size, y + 270 * size, 90, -Math.PI / 8, size, 8 * size);
	line(x - 1 * size, y + 190 * size, 60, -Math.PI / 14, size);
	or(x - 10 * size, y + 420 * size, size, 10 * size);
}
function duper(x, y, size) {
	line(x - 5 * size, y, 150, Math.PI / 2, size);
	line(x - 5 * size, y + 150 * size, 150, Math.PI / 2, size);
	line(x + 25 * size, y + 150 * size, 150, Math.PI / 2, size);
	line(x + 25 * size, y - 5 * size, 140, Math.PI / 2, size);
	line(x + 35 * size, y - 35 * size, 80, Math.PI / 2, size, 20 * size);
	line(x + 175 * size, y - 35 * size, 80, Math.PI / 2, size, 20 * size);
	line(x - 38 * size, y - 92 * size, 75, Math.PI / 4, size, 20 * size);
	line(x + 60 * size, y - 94 * size, 75, -Math.PI / 4, size, 20 * size);
	seesaw(x + 25 * size, y + 65 * size, 40 * size, 6 * size, 0);
	seesaw(x + 55 * size, y + 55 * size, 50 * size, 10 * size, 0);
	line(x + 40 * size, y + 67 * size, 20, 0, size);
	ball(x + 50 * size, y + 49 * size, 10 * size, { mass: 0.1 });
	//second ball duper
	line(x + 131 * size, y, 150, Math.PI / 2, size);
	line(x + 131 * size, y + 150 * size, 150, Math.PI / 2, size);
	line(x + 161 * size, y + 150 * size, 150, Math.PI / 2, size);
	line(x + 161 * size, y - 5 * size, 140, Math.PI / 2, size);
	line(x + 99 * size, y - 92 * size, 75, Math.PI / 4, size, 20 * size, 0);
	line(x + 195 * size, y - 94 * size, 75, -Math.PI / 4, size, 20 * size, 0);
	seesaw(x + 161 * size, y + 65 * size, 40 * size, 6 * size, 0);
	seesaw(x + 191 * size, y + 55 * size, 50 * size, 10 * size, 0);
	line(x + 181 * size, y + 67 * size, 20, 0, size);
	ball(x + 181 * size, y + 49 * size, 10 * size);
	line(x + 95 * size, y + 250 * size, 75, Math.PI / 8, size, 10 * size);
}
function or(x, y, size) {
	line(x - 5 * size, y, 150, Math.PI / 2, size);
	line(x - 5 * size, y + 150 * size, 150, Math.PI / 2, size);
	line(x + 25 * size, y + 150 * size, 150, Math.PI / 2, size);
	line(x + 25 * size, y - 5 * size, 140, Math.PI / 2, size);
	line(x + 35 * size, y - 35 * size, 80, Math.PI / 2, size, 20 * size);
	line(x - 52 * size, y - 92 * size, 100, Math.PI / 6, size, 20 * size);
	line(x + 72 * size, y - 90 * size, 100, -Math.PI / 6, size, 20 * size);
	seesaw(x + 25 * size, y + 65 * size, 48 * size, 6 * size, 0);
	seesaw(x + 55 * size, y + 55 * size, 50 * size, 10 * size, 0);
	line(x + 40 * size, y + 67 * size, 20, 0, size);
	line(x + 11 * size, y + 210 * size, 25, 0, size, 30 * size);
	ball(x + 45 * size, y + 49 * size, 10 * size);
	line(x + 80 * size, y + 150 * size, 150, Math.PI / 2, size);
	line(x + 105 * size, y + 100 * size, 250, Math.PI / 2, size);
}
function bucket(x, y, size) {
	line(x, y, 200, 0, size, 50);
	line(x + 100 * size, y - 90 * size, 200, Math.PI / 2, size, 20);
	line(x - 100 * size, y - 90 * size, 200, Math.PI / 2, size, 20);
}
window.addEventListener("click", function (e) {
	var ball = Bodies.circle(e.clientX, e.clientY, 5, { mass: 0.1 });
	Composite.add(world, ball);
});
window.addEventListener("keydown", function (e) {
	Composite.remove(world, stopper);
});