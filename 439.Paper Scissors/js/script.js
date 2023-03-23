let boids = [];
const separationWeight = 1.5;
const cohesionWeight = 0.2;
const alignmentWeight = 1.3;
const maxSpeed = 1.8;
const maxForce = 0.05;
let num = 0;
let canvas;

let bgs = ["#EA7E30","#EAA85A","#C0D284","#96FCAE","#6CD8D8","#3FABF9"];
let bg = bgs[randomNumber(0,5)];

let objs = [];
const w = window.innerWidth;
const h = window.innerHeight;

let totalBoids = 100;

function resetSketch() {
  bg = bgs[randomNumber(0,5)];
	boids = [];
	for (let i = 0; i < totalBoids; i++) {
		boids[i] = new Boid(random(width), random(height));
	}
}

document.querySelector(".reset").addEventListener("click", resetSketch);

// function mousePressed() {
//   resetSketch();
// }
//*******helper functions*******
//makes anything below 0 = 0
//makes anything above 255 = 255
function limiter(value) {
	if (value > 255) {
		return 255;
	} else if (value < 0) {
		return 0;
	} else {
		return value;
	}
}
//randomly make positive or negative
function posNeg(value) {
	var numb = randomNumber(1, 2);
	if (numb == 1) {
		return value;
	} else {
		return value * -1;
	}
}
//Random Number generator
function randomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
//on resize
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}
//*****************************
// let bg = `rgb(${random(255)}, ${random(255)}, ${random(255)})`;
function setup() {
	canvas = createCanvas(windowWidth, windowHeight);
	// Add an initial set of boids into the system
	for (let i = 0; i < totalBoids; i++) {
		boids[i] = new Boid(random(width), random(height));
	}
}
function draw() {
	// background(bg);
	background(bg);
	// Run all the boids
	for (let i = 0; i < boids.length; i++) {
		boids[i].run(boids);
	}
}

// Boid class
// Methods for Separation, Cohesion, Alignment added
class Boid {
	constructor(x, y) {
		this.flockGroup = []; // keep track of the other boids in the same flock
		this.acceleration = createVector(0, 0);
		this.velocity = p5.Vector.random2D();
		this.position = createVector(x, y);
		this.r = 2;
		this.maxSpeed = maxSpeed; // Maximum speed
		this.maxForce = maxForce; // Maximum steering force

		this.boidSize = 2;
		this.rpsGroup = ["🪨", "📄", "✂️"];
		this.rps = this.rpsGroup[randomNumber(0, 2)];

		this.num = 0;
		//vertex positions that are cycled through to create a flapping motion
	}

	run(boids) {
		this.flockGroup = []; // reset the flock array
		this.flock(boids);
		this.update();
		this.borders();
		this.render();
	}

	// Forces go into acceleration
	applyForce(force) {
		this.acceleration.add(force);
	}

	// We accumulate a new acceleration each time based on three rules
	flock(boids) {
		let sep = this.separate(boids); // Separation
		let ali = this.align(boids); // Alignment
		let coh = this.cohesion(boids); // Cohesion
		// Arbitrarily weight these forces
		sep.mult(2.5);
		ali.mult(1.0);
		coh.mult(1.0);
		// Add the force vectors to acceleration
		this.applyForce(sep);
		this.applyForce(ali);
		this.applyForce(coh);
	}

	// Method to update location
	update() {
		// Update velocity
		this.velocity.add(this.acceleration);
		// Limit speed
		this.velocity.limit(this.maxSpeed);
		this.position.add(this.velocity);
		// Reset acceleration to 0 each cycle
		this.acceleration.mult(0);
	}

	// A method that calculates and applies a steering force towards a target
	// STEER = DESIRED MINUS VELOCITY
	seek(target) {
		let desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target
		// Normalize desired and scale to maximum speed
		desired.normalize();
		desired.mult(this.maxSpeed);
		// Steering = Desired minus Velocity
		let steer = p5.Vector.sub(desired, this.velocity);
		steer.limit(this.maxForce); // Limit to maximum steering force
		return steer;
	}

	// Draw boid as a seagull
	render(rps) {
		push();
		translate(this.position.x, this.position.y);
		rotate(this.velocity.heading() + radians(-90));
		textSize(16);
		text(this.rps, 0, 0);
		scale(this.boidSize);
		pop();
	}

	// Wraparound
	borders() {
		if (this.position.x < -this.r) this.position.x = width + this.r;
		if (this.position.y < -this.r) this.position.y = height + this.r;
		if (this.position.x > width + this.r) this.position.x = -this.r;
		if (this.position.y > height + this.r) this.position.y = -this.r;
	}

	// Separation
	// Method checks for nearby boids and steers away
	separate(boids) {
		let desiredSeparation = 25;
		let steer = createVector(0, 0);
		let count = 0;
		// For every boid in the system, check if it's too close
		for (let i = 0; i < boids.length; i++) {
			let d = p5.Vector.dist(this.position, boids[i].position);
			// If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
			if (d > 0 && d < desiredSeparation) {
				// Calculate vector pointing away from neighbor
				let diff = p5.Vector.sub(this.position, boids[i].position);
				diff.normalize();
				diff.div(d); // Weight by distance
				steer.add(diff);
				count++; // Keep track of how many
			}
		}
		// Average -- divide by how many
		if (count > 0) {
			steer.div(count);
		}

		// As long as the vector is greater than 0
		if (steer.mag() > 0) {
			// Implement Reynolds: Steering = Desired - Velocity
			steer.normalize();
			steer.mult(this.maxSpeed);
			steer.sub(this.velocity);
			steer.limit(this.maxForce);
		}
		return steer;
	}

	// Alignment
	// For every nearby boid in the system, calculate the average velocity
	align(boids) {
		let neighborDist = 50;
		let sum = createVector(0, 0);
		let count = 0;

		for (let i = 0; i < boids.length; i++) {
			let d = p5.Vector.dist(this.position, boids[i].position);
			if (d > 0 && d < neighborDist) {
				// Rock, Paper, Scissors, SHOOT!
				if (boids[i].rps == "🪨" && this.rps == "✂️") {
					this.rps = "🪨";
				} else if (boids[i].rps == "📄" && this.rps == "🪨") {
					this.rps = "📄";
				} else if (boids[i].rps == "✂️" && this.rps == "📄") {
					this.rps = "✂️";
				} else if (boids[i].rps == "✂️" && this.rps == "🪨") {
					boids[i].rps = "🪨";
				} else if (boids[i].rps == "🪨" && this.rps == "📄") {
					boids[i].rps = "📄";
				} else if (boids[i].rps == "📄" && this.rps == "✂️") {
					boids[i].rps = "✂️";
				}

				sum.add(boids[i].velocity);
				count++;
			}
		}
		if (count > 0) {
			sum.div(count);
			sum.normalize();
			sum.mult(this.maxSpeed);
			let steer = p5.Vector.sub(sum, this.velocity);
			steer.limit(this.maxForce);
			return steer;
		} else {
			return createVector(0, 0);
		}
	}

	// Cohesion
	// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
	cohesion(boids) {
		let perceptionRadius = 50; // radius to determine which boids are in the same flock
		let steering = createVector(0, 0); // steering force
		let count = 0; // count the number of boids in the same flock

		for (let i = 0; i < boids.length; i++) {
			let d = p5.Vector.dist(this.position, boids[i].position);
			if (d > 0 && d < perceptionRadius) {
				steering.add(boids[i].position); // Add location
				count++;
				if (!this.flockGroup.includes(boids[i])) {
					this.flockGroup.push(boids[i]);
				}
			}
		}

		//was 0... 1 makes small groups (2 or 1 boid) have to flap
		if (count > 1) {
			//******
			//ducks fly together
			this.startNum = 30;
			//******
			steering.div(count);
			return this.seek(steering); // Steer towards the location
		} else {
			//******
			// loner
			// this.rps = this.rpsGroup[randomNumber(0,2)];
			this.startNum++;
			//******
			return createVector(0, 0);
		}
	}
}
