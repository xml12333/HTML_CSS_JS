const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 1200;
const textArray = ["Design.", "Code.", "Coffee."];
let currentTextIndex = 0;
let nextTextTimeout;
let textCoordinates = [];

const mouse = {
	x: -500,
	y: -500,
	radius: 50
};

class Particle {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.size = 1;
		this.baseX = x;
		this.baseY = y;
		this.density = Math.random() * 30 + 1;
		this.color = "white";
		this.history = [];
	}

	update() {
		let dx = mouse.x - this.x;
		let dy = mouse.y - this.y;
		let distance = Math.sqrt(dx * dx + dy * dy);

		if (distance < mouse.radius) {
			let forceDirectionX = dx / distance;
			let forceDirectionY = dy / distance;
			let maxDistance = mouse.radius;
			let force = (maxDistance - distance) / maxDistance;
			let directionX = forceDirectionX * force * this.density;
			let directionY = forceDirectionY * force * this.density;

			this.x -= directionX;
			this.y -= directionY;
		} else {
			this.x += (this.baseX - this.x) * 0.05;
			this.y += (this.baseY - this.y) * 0.05;
		}

		this.history.push({ x: this.x, y: this.y });
		if (this.history.length > 10) {
			this.history.shift();
		}

		const speed = Math.sqrt(
			(this.baseX - this.x) ** 2 + (this.baseY - this.y) ** 2
		);
		const hue = (speed / 100) * 360;

		this.color = `hsl(${hue}, 100%, ${100 - speed / 5}%)`;

		if (this.history.length > 10) {
			this.history.shift();
		}
	}

	draw() {
		ctx.beginPath();
		ctx.moveTo(this.history[0].x, this.history[0].y);
		for (let i = 1; i < this.history.length; i++) {
			ctx.lineTo(this.history[i].x, this.history[i].y);
		}
		ctx.strokeStyle = this.color;
		ctx.stroke();

		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
	}
}

function createParticles() {
	particles.length = 0;
	textCoordinates = getTextCoordinates(textArray[currentTextIndex]);

	for (let i = 0; i < particleCount; i++) {
		const randomIndex = Math.floor(Math.random() * textCoordinates.length);
		const x = textCoordinates[randomIndex].x;
		const y = textCoordinates[randomIndex].y;
		particles.push(new Particle(x, y));
	}
}

function getTextCoordinates(text) {
	const fontSize = Math.min(canvas.width / 10, canvas.height / 5);
	ctx.font = `${fontSize}px Arial`;
	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	const x = canvas.width / 2;
	const y = canvas.height / 2;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillText(text, x, y);

	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
	const coordinates = [];

	for (let y = 0; y < canvas.height; y += 4) {
		for (let x = 0; x < canvas.width; x += 4) {
			const index = (y * canvas.width + x) * 4;
			if (imageData[index + 3] > 128) {
				coordinates.push({ x, y });
			}
		}
	}

	return coordinates;
}

function animate() {
	ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	particles.forEach((particle) => {
		particle.update();
		particle.draw();
	});

	requestAnimationFrame(animate);
}

canvas.addEventListener("mousemove", (event) => {
	mouse.x = event.clientX;
	mouse.y = event.clientY;
});

canvas.addEventListener("mouseleave", () => {
	mouse.x = -500;
	mouse.y = -500;
});

window.addEventListener("resize", () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	createParticles();
});

function changeText() {
	currentTextIndex = (currentTextIndex + 1) % textArray.length;
	const newCoordinates = getTextCoordinates(textArray[currentTextIndex]);

	particles.forEach((particle, index) => {
		if (index < newCoordinates.length) {
			particle.baseX = newCoordinates[index].x;
			particle.baseY = newCoordinates[index].y;
		} else {
			particle.baseX = Math.random() * canvas.width;
			particle.baseY = Math.random() * canvas.height;
		}
	});

	nextTextTimeout = setTimeout(changeText, 3000);
}

createParticles();
animate();
nextTextTimeout = setTimeout(changeText, 3000);