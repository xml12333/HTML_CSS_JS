function createPattern({ length }) {
	const lines = appendChildren(
		createElements(length, createElement("line")),
		createElement("lines")
	);
	const rays = appendChildren(
		createElements(length / 2, createElement("ray")),
		createElement("rays")
	);

	const box = createElement("box");
	const chart = appendChildren(lines, createElement("chart"));
	const eye = createElement("eye");
	const sun = appendChildren(rays, createElement("sun"));

	const tracker = appendChildren(
		appendChildren(sun, createElement("scale")),
		createElement("tracker")
	);

	appendChildren([chart, eye, tracker], box);

	return box;
}

function setup() {
	const length = +getVariableCSS("length");

	const pattern = createPattern({ length });
	const scene = setupScene(pattern);

	const box = document.querySelector(".box");
	const scale = document.querySelector(".scale");
	const tracker = document.querySelector(".tracker");

	const origin = {
		x: window.innerWidth / 2,
		y: window.innerHeight / 2
	};

	const state = {};

	function resetTracking() {
		box.classList.remove("active");
		tracker.style.transform = `translate(${0}px, ${0}px)`;
	}

	box.addEventListener("mouseenter", function () {
		state.radius = box.clientWidth / 2;
		state.range = state.radius * state.radius;

		origin.x = window.innerWidth / 2;
		origin.y = window.innerHeight / 2;
	});

	box.addEventListener("mouseleave", function () {
		resetTracking();
	});

	box.addEventListener("mousemove", function (event) {
		const { clientX, clientY } = event;

		const dx = clientX - origin.x;
		const dy = clientY - origin.y;

		if (dx * dx + dy * dy > state.range) return resetTracking();

		box.classList.add("active");

		const x = dx < 0 ? Math.max(dx, -30) : Math.min(dx, 30);
		const y = dy < 0 ? Math.max(dy, -15) : Math.min(dy, 15);

		tracker.style.transform = `translate(${x}px, ${y}px)`;
	});

	renderThemes({ index: 11 });
}

setup();