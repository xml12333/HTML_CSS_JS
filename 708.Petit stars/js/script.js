console.clear();

let w = window.innerWidth;
let h = window.innerHeight;
svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

const min = 50;
const max = 150;

var p = new PoissonDiskSampling({
	shape: [w, h],
	minDistance: min,
	maxDistance: max,
	tries: 100
});
var points = p.fill();

const colors = ["#d9c693", "#dbe0e1"];
const getColor = () => colors[Math.floor(Math.random() * colors.length)];

const make = (el) => {
	return document.createElementNS("http://www.w3.org/2000/svg", el);
};
points.forEach((p, i) => {
	const g = make("g");
	const x = p[0];
	const y = p[1];

	if (i) {
		if (Math.random() > 0.5) {
			const prev = points[i - 1];
			g.innerHTML = `<path d="M${prev[0]},${prev[1]} L${p[0]},${p[1]}" style="stroke:rgba(255,255,255,.075)"/>`;
			svg.append(g);
		}
	}
});
points.forEach((p, i) => {
	const g = make("g");
	const x = p[0];
	const y = p[1];
	const color = getColor();
	const star = Math.round(Math.random());
	const rotation = Math.PI * 2 * Math.random();

	let filter = `
		<filter id="lightMe${i}">
			<feDiffuseLighting in="SourceGraphic" result="light" lighting-color="white">
				<fePointLight x="${x - (Math.cos(rotation) * 20)}" y="${y + (Math.sin(rotation) * 20)}" z="10" />
			</feDiffuseLighting>

			<feComposite
				in="SourceGraphic"
				in2="light"
				operator="arithmetic"
				k1="1"
				k2="0"
				k3="0"
				k4="0" />
		</filter>`;

	if (star) {
		const factor = 0.125 + Math.random() * 0.25;

		const path = `
			M${x + 0 * factor},${y - 50 * factor}
			L${x + 19 * factor},${y - 23 * factor}
			L${x + 50 * factor},${y - 13 * factor}
			L${x + 31 * factor},${y + 14 * factor}
			L${x + 31 * factor},${y + 48 * factor}
			L${x + 0 * factor},${y + 37 * factor}
			L${x - 31 * factor},${y + 47 * factor}
			L${x - 31 * factor},${y + 14 * factor}
			L${x - 50 * factor},${y - 13 * factor}
			L${x - 19 * factor},${y - 23 * factor}
		`;
		g.innerHTML = `
		${filter}
		<path d="${path}" fill="${color}" filter="url(#lightMe${i})" style="stroke:none; transform-origin: ${x}px ${y}px; rotate: ${rotation}rad" />
	`;
	} else {
		const factor = 0.1;
		g.innerHTML = `
			${filter}
			<circle cx=${x} cy=${y} r=${
			min * factor
		} fill="${color}" filter="url(#lightMe${i})" style="stroke:none;" />
		`;
	}

	svg.append(g);
});

const g = make("g");
g.innerHTML = `
	<rect x=0 y=0 height=100% width=100% fill="${colors[1]}" style="mix-blend-mode: overlay; opacity: .6;" />
	<rect x=0 y=0 height=100% width=100% fill="${colors[0]}" style="mix-blend-mode: overlay; opacity: .4;" />
`;
svg.append(g);