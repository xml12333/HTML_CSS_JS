// ====================== CONFIG ======================
let userBase64SVG = ""; // Paste base64 SVG here (without data: prefix)
const demoSVG = `<svg xmlns='http://www.w3.org/2000/svg' height='1000' width='1000' viewbox='0 0 1000 1000'>
	<path fill='#aaa' d='M 500 0 A 100 100 90 0 1 500 1000 A 100 100 90 0 1 500 0 M 500 300 A 100 100 90 0 0 500 700 A 100 100 90 0 0 500 300' />
	<path fill='#ccc' d='M 200 0 H 800 L 500 500 Z M 500 100 A 100 100 90 0 0 500 300 A 100 100 90 0 0 500 100' />
	<path fill='#ccc' d='M 500 500 L 800 1000 H 200 Z M 500 700 A 100 100 90 0 0 500 900 A 100 100 90 0 0 500 700' />
	<path fill='#aaa' d='M 400 450 H 600 V 550 H 400 Z' />
</svg>`;
// ====================== CORE ======================
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", {
	alpha: true
});
let width = 0,
	height = 0;
let particles = [];
let brightnessGrid = [];
let cellSize = 8;
let cols = 0,
	rows = 0;
let img = new Image();
let isPaused = false;
// Angle in degrees: 0° = right, increases counter-clockwise
let flowAngle = 0;
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
class Particle {
	constructor() {
		this.reset();
	}
	reset() {
		this.x = Math.random() * width;
		this.y = Math.random() * height;
	}
	update() {
		const col = Math.max(0, Math.min(cols - 1, Math.floor(this.x / cellSize)));
		const row = Math.max(0, Math.min(rows - 1, Math.floor(this.y / cellSize)));
		const brightness = brightnessGrid[row][col];
		const darkSpeed =
			parseFloat(document.getElementById("darkSpeed").value) +
			randInt(-10, 10) / 10;
		const brightSpeed = parseFloat(document.getElementById("brightSpeed").value);
		const speed = darkSpeed * (1 - brightness) + brightSpeed * brightness;
		const rad = (flowAngle * Math.PI) / 180;
		this.x += Math.cos(rad) * speed;
		this.y += Math.sin(rad) * speed;
		// Wrap around screen for any direction
		if (this.x > width + 60) this.x = -60;
		if (this.x < -60) this.x = width + 60;
		if (this.y > height + 60) this.y = -60;
		if (this.y < -60) this.y = height + 60;
	}
	draw() {
		const alpha = Math.max(0.35, 1.8 - 3 * 0.35); // approximate average speed for fade
		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.fillStyle = "#e0f0ff";
		ctx.shadowBlur = 8;
		ctx.shadowColor = "#88ccff";
		ctx.fillRect(this.x, this.y, 3, 3);
		ctx.restore();
	}
}

function computeBrightnessGrid() {
	const off = document.createElement("canvas");
	off.width = width;
	off.height = height;
	const octx = off.getContext("2d");
	octx.drawImage(img, 0, 0, width, height);
	const data = octx.getImageData(0, 0, width, height).data;
	cols = Math.floor(width / cellSize);
	rows = Math.floor(height / cellSize);
	brightnessGrid = Array.from(
		{
			length: rows
		},
		() => Array(cols).fill(0)
	);
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			let sum = 0,
				count = 0;
			const sy = r * cellSize,
				sx = c * cellSize;
			const ey = Math.min(sy + cellSize, height);
			const ex = Math.min(sx + cellSize, width);
			for (let y = sy; y < ey; y++) {
				for (let x = sx; x < ex; x++) {
					const i = (y * width + x) * 4;
					const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
					sum += lum;
					count++;
				}
			}
			brightnessGrid[r][c] = count ? sum / count / 255 : 0;
		}
	}
}

function resize() {
	width = window.innerWidth;
	height = window.innerHeight;
	canvas.width = width;
	canvas.height = height;
	if (img.complete) computeBrightnessGrid();
}

function animate() {
	if (isPaused) {
		requestAnimationFrame(animate);
		return;
	}
	ctx.globalAlpha =
		parseFloat(document.getElementById("fadeSlider").value) / 1000;
	ctx.fillStyle = "#05050f";
	ctx.fillRect(0, 0, width, height);
	ctx.globalAlpha = 1;
	for (let p of particles) {
		p.update();
		p.draw();
	}
	requestAnimationFrame(animate);
}
// ====================== CIRCULAR ANGLE KNOB ======================
function setupAngleKnob() {
	const knob = document.getElementById("angleKnob");
	const indicator = document.getElementById("indicator");
	const angleDisplay = document.getElementById("angleValue");
	let isDragging = false;

	function updateKnob(angleDeg) {
		flowAngle = ((angleDeg % 360) + 360) % 360;
		// Rotate the indicator line: 0° points right (positive x)
		const rad = (flowAngle * Math.PI) / 180;
		const len = 34;
		const x2 = 50 + len * Math.cos(rad);
		const y2 = 50 + len * Math.sin(rad);
		indicator.setAttribute("x2", x2);
		indicator.setAttribute("y2", y2);
		angleDisplay.textContent = Math.round(flowAngle) + "°";
	}

	function getAngleFromEvent(e) {
		const rect = knob.getBoundingClientRect();
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;
		const clientX = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
		const clientY = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;
		let angle = (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
		return (angle + 360) % 360; // 0° = right, counter-clockwise
	}

	function startDrag(e) {
		isDragging = true;
		e.preventDefault();
		const angle = getAngleFromEvent(e);
		updateKnob(angle);
	}

	function duringDrag(e) {
		if (!isDragging) return;
		e.preventDefault();
		const angle = getAngleFromEvent(e);
		updateKnob(angle);
	}

	function endDrag() {
		isDragging = false;
	}
	// Mouse
	knob.addEventListener("mousedown", startDrag);
	document.addEventListener("mousemove", duringDrag);
	document.addEventListener("mouseup", endDrag);
	// Touch (mobile)
	knob.addEventListener("touchstart", startDrag, {
		passive: false
	});
	document.addEventListener("touchmove", duringDrag, {
		passive: false
	});
	document.addEventListener("touchend", endDrag);
	// Initial state: 0° pointing right
	updateKnob(0);
}
// ====================== INIT ======================
function init() {
	if (userBase64SVG.trim()) {
		img.src = `data:image/svg+xml;base64,${userBase64SVG}`;
	} else {
		img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(demoSVG)}`;
	}
	window.addEventListener("resize", resize);
	document.getElementById("pauseBtn").addEventListener("click", () => {
		isPaused = !isPaused;
		document.getElementById("pauseBtn").textContent = isPaused
			? "Resume"
			: "Pause";
	});
	document.getElementById("resetBtn").addEventListener("click", () => {
		particles.forEach((p) => p.reset());
	});
	const pSlider = document.getElementById("particleSlider");
	const pCount = document.getElementById("particleCount");
	pSlider.addEventListener("input", () => {
		const target = parseInt(pSlider.value);
		pCount.textContent = target;
		while (particles.length < target) particles.push(new Particle());
		while (particles.length > target) particles.pop();
	});
	const darkSlider = document.getElementById("darkSpeed");
	const brightSlider = document.getElementById("brightSpeed");
	const darkVal = document.getElementById("darkSpeedVal");
	const brightVal = document.getElementById("brightSpeedVal");
	darkSlider.addEventListener(
		"input",
		() => (darkVal.textContent = parseFloat(darkSlider.value).toFixed(1))
	);
	brightSlider.addEventListener(
		"input",
		() => (brightVal.textContent = parseFloat(brightSlider.value).toFixed(1))
	);
	// Mobile-friendly range sliders (optional but recommended)
	document.querySelectorAll('input[type="range"]').forEach((slider) => {
		slider.addEventListener("touchstart", () => {}, {
			passive: true
		});
	});
	setupAngleKnob();
	img.onload = () => {
		resize();
		computeBrightnessGrid();
		const target = parseInt(pSlider.value);
		particles = [];
		for (let i = 0; i < target; i++) particles.push(new Particle());
		animate();
	};
}
window.onload = init;