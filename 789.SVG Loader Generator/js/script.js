const sliders = {
	size: document.getElementById("sizeSlider"),
	inner: document.getElementById("innerSlider"),
	segments: document.getElementById("segmentsSlider"),
	thickness: document.getElementById("thicknessSlider"),
	speed: document.getElementById("speedSlider"),
	color: document.getElementById("colorPicker")
};

const readouts = {
	size: document.getElementById("sizeReadout"),
	inner: document.getElementById("innerReadout"),
	segments: document.getElementById("segmentsReadout"),
	thickness: document.getElementById("thicknessReadout"),
	speed: document.getElementById("speedReadout"),
	color: document.getElementById("colorReadout")
};

const settings = {
	size: parseInt(sliders.size.value),
	inner: parseInt(sliders.inner.value),
	segments: parseInt(sliders.segments.value),
	thickness: parseInt(sliders.thickness.value),
	speed: null,
	color: sliders.color.value
};

const svgPanel = document.getElementById("svgPanel");
const copyBtn = document.getElementById("copyBtn");
const randomBtn = document.getElementById("randomBtn");
const colorBlock = document.getElementById("colorBlock");

let currentSvg = null;

const setAttributes = (el, attrs) => {
	for (let key in attrs) {
		el.setAttribute(key, attrs[key]);
	}
};

const createLinesSvg = (settings) => {
	if (currentSvg) currentSvg.remove();

	const fixedSize = 220;
	const center = fixedSize / 2;
	const maxRadius = center - settings.thickness;
	const radius = Math.min(settings.size / 2, maxRadius);
	const innerRadius = Math.min(settings.inner, radius);

	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	currentSvg = svg;
	svgPanel.appendChild(svg);

	setAttributes(svg, {
		xmlns: "http://www.w3.org/2000/svg",
		width: fixedSize,
		height: fixedSize,
		viewBox: `0 0 ${fixedSize} ${fixedSize}`,
		preserveAspectRatio: "xMidYMid meet"
	});

	for (let i = 0; i < settings.segments; i++) {
		const angle = (360 / settings.segments) * i - 90;
		const rad = (angle * Math.PI) / 180;
		const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

		const x1 = center + innerRadius * Math.cos(rad);
		const y1 = center + innerRadius * Math.sin(rad);
		const x2 = center + radius * Math.cos(rad);
		const y2 = center + radius * Math.sin(rad);

		setAttributes(line, {
			x1: x1,
			y1: y1,
			x2: x2,
			y2: y2,
			stroke: settings.color,
			"stroke-width": settings.thickness
		});

		line.style.animation = `fade ${settings.speed}ms infinite`;
		line.style.animationDelay = `${(i * settings.speed) / settings.segments}ms`;

		svg.appendChild(line);
	}
};

const updateSettings = () => {
	const speedRange = { min: 400, max: 8400 };
	const sliderVal = parseInt(sliders.speed.value);
	const invertedSpeed = speedRange.max + speedRange.min - sliderVal;
	settings.speed = invertedSpeed;

	readouts.size.textContent = sliders.size.value + "px";
	readouts.inner.textContent = sliders.inner.value + "px";
	readouts.segments.textContent = sliders.segments.value;
	readouts.thickness.textContent = sliders.thickness.value + "px";
	readouts.speed.textContent = invertedSpeed + "ms";
	readouts.color.textContent = sliders.color.value.toUpperCase();

	colorBlock.style.backgroundColor = sliders.color.value;

	settings.size = parseInt(sliders.size.value);
	settings.inner = parseInt(sliders.inner.value);
	settings.segments = parseInt(sliders.segments.value);
	settings.thickness = parseInt(sliders.thickness.value);
	settings.color = sliders.color.value;

	createLinesSvg(settings);
};

Object.values(sliders).forEach((slider) => {
	slider.addEventListener("input", updateSettings);
});

colorBlock.addEventListener("click", () => {
	sliders.color.click();
});

copyBtn.addEventListener("click", () => {
	if (currentSvg) {
		const serializer = new XMLSerializer();
		const source = serializer.serializeToString(currentSvg);
		navigator.clipboard
			.writeText(source)
			.then(() => alert("SVG code copied to clipboard!"))
			.catch(() => alert("Failed to copy SVG code."));
	}
});

function randomInRange(min, max, step) {
	const range = (max - min) / step;
	return Math.floor(Math.random() * (range + 1)) * step + min;
}

randomBtn.addEventListener("click", () => {
	sliders.size.value = randomInRange(16, 200, 4);
	sliders.inner.value = randomInRange(0, 100, 1);
	sliders.segments.value = randomInRange(8, 64, 2);
	sliders.thickness.value = randomInRange(1, 10, 1);
	sliders.speed.value = randomInRange(400, 8400, 50);

	const randomColor =
		"#" +
		Math.floor(Math.random() * 16777215)
			.toString(16)
			.padStart(6, "0")
			.toUpperCase();
	sliders.color.value = randomColor;

	updateSettings();
});

updateSettings();