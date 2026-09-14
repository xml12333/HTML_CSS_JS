const COUNT = 14000;
const MAX_DPR = 1;
const TARGET_FPS = 30;
const FRAME_MS = 1000 / TARGET_FPS;

const FLOW_SPEED = 2.5;
const FIELD_GAIN = 0.38;
const ERASE = 0.07;
const LINE_ALPHA = 0.54;

const LIFE_MIN = 1.15;
const LIFE_MAX = 3.9;

const INFLOW = 0.32;
const BG_U = 0.045;
const BG_V = 0.0;
const DRIFT = 0.0042;
const SYSTEM_WOBBLE = 0.0032;
const SYSTEM_EVOLUTION = 0.08;
const MARKER_SMOOTHING = 0.12;

const GRID_STEP = 28;
const FIELD_ROWS_PER_FRAME = 1;

let BG_RGB = [13 / 255, 20 / 255, 26 / 255];

let COLORS = [
	[0x50 / 255, 0x79 / 255, 0xa8 / 255],
	[0x4a / 255, 0x93 / 255, 0xa6 / 255],
	[0x46 / 255, 0xa8 / 255, 0x83 / 255],
	[0x74 / 255, 0xb8 / 255, 0x5a / 255],
	[0xc9 / 255, 0xc2 / 255, 0x4c / 255],
	[0xdc / 255, 0xa0 / 255, 0x46 / 255],
	[0xd4 / 255, 0x70 / 255, 0x3f / 255],
	[0xc8 / 255, 0x46 / 255, 0x3a / 255]
];

const NBINS = COLORS.length;
const SPEED_COLOR_MAX_SQ = 0.0256;
const SPEED_COLOR_GAIN = 1 / SPEED_COLOR_MAX_SQ;

const SYSTEMS = [
	{ x: 0.16, y: 0.34, spin: 1, r: 0.2, strength: 0.95 },
	{ x: 0.44, y: 0.2, spin: -1, r: 0.18, strength: 0.7 },
	{ x: 0.52, y: 0.66, spin: -1, r: 0.26, strength: 0.85 },
	{ x: 0.78, y: 0.32, spin: 1, r: 0.19, strength: 0.9 },
	{ x: 0.84, y: 0.74, spin: 1, r: 0.22, strength: 0.75 },
	{ x: 0.3, y: 0.56, spin: 1, r: 0.16, strength: 0.6 }
];

const PALETTES = {
	marine: [
		[0x50 / 255, 0x79 / 255, 0xa8 / 255],
		[0x4a / 255, 0x93 / 255, 0xa6 / 255],
		[0x46 / 255, 0xa8 / 255, 0x83 / 255],
		[0x74 / 255, 0xb8 / 255, 0x5a / 255],
		[0xc9 / 255, 0xc2 / 255, 0x4c / 255],
		[0xdc / 255, 0xa0 / 255, 0x46 / 255],
		[0xd4 / 255, 0x70 / 255, 0x3f / 255],
		[0xc8 / 255, 0x46 / 255, 0x3a / 255]
	],
	mistral: [
		[0x45 / 255, 0x67 / 255, 0x9c / 255],
		[0x43 / 255, 0x83 / 255, 0xad / 255],
		[0x3f / 255, 0xa2 / 255, 0xa4 / 255],
		[0x65 / 255, 0xb4 / 255, 0x83 / 255],
		[0xb6 / 255, 0xc6 / 255, 0x59 / 255],
		[0xd6 / 255, 0xa4 / 255, 0x42 / 255],
		[0xd1 / 255, 0x75 / 255, 0x3d / 255],
		[0xb8 / 255, 0x46 / 255, 0x46 / 255]
	],
	sirocco: [
		[0x55 / 255, 0x78 / 255, 0x91 / 255],
		[0x68 / 255, 0x8d / 255, 0x8b / 255],
		[0x8f / 255, 0xa2 / 255, 0x70 / 255],
		[0xba / 255, 0xaa / 255, 0x58 / 255],
		[0xd6 / 255, 0xa0 / 255, 0x4f / 255],
		[0xdd / 255, 0x7d / 255, 0x46 / 255],
		[0xce / 255, 0x55 / 255, 0x3f / 255],
		[0xb9 / 255, 0x3e / 255, 0x38 / 255]
	]
};

const MODES = {
	summer: {
		label: "Summer Calm",
		palette: "marine",
		bg: [13 / 255, 20 / 255, 26 / 255],
		flowSpeed: 1.75,
		fieldGain: 0.31,
		bgU: 0.032,
		bgV: 0.0,
		wander: 0.018,
		systems: [
			{ x: 0.18, y: 0.36, spin: 1, r: 0.24, strength: 0.55 },
			{ x: 0.46, y: 0.22, spin: -1, r: 0.25, strength: 0.48 },
			{ x: 0.56, y: 0.68, spin: -1, r: 0.29, strength: 0.52 },
			{ x: 0.8, y: 0.34, spin: 1, r: 0.24, strength: 0.5 },
			{ x: 0.86, y: 0.74, spin: 1, r: 0.27, strength: 0.42 },
			{ x: 0.3, y: 0.58, spin: 1, r: 0.2, strength: 0.38 }
		]
	},
	levante: {
		label: "Levante",
		palette: "marine",
		bg: [12 / 255, 20 / 255, 27 / 255],
		flowSpeed: 2.25,
		fieldGain: 0.35,
		bgU: -0.055,
		bgV: 0.004,
		wander: 0.023,
		systems: [
			{ x: 0.82, y: 0.3, spin: -1, r: 0.26, strength: 0.76 },
			{ x: 0.62, y: 0.64, spin: 1, r: 0.23, strength: 0.7 },
			{ x: 0.36, y: 0.28, spin: 1, r: 0.22, strength: 0.58 },
			{ x: 0.18, y: 0.72, spin: -1, r: 0.27, strength: 0.66 },
			{ x: 0.74, y: 0.78, spin: 1, r: 0.22, strength: 0.5 },
			{ x: 0.44, y: 0.52, spin: -1, r: 0.2, strength: 0.54 }
		]
	},
	mistral: {
		label: "Mistral",
		palette: "mistral",
		bg: [10 / 255, 18 / 255, 27 / 255],
		flowSpeed: 2.9,
		fieldGain: 0.43,
		bgU: 0.07,
		bgV: 0.02,
		wander: 0.026,
		systems: [
			{ x: 0.14, y: 0.24, spin: -1, r: 0.2, strength: 0.84 },
			{ x: 0.34, y: 0.44, spin: 1, r: 0.18, strength: 0.86 },
			{ x: 0.54, y: 0.66, spin: 1, r: 0.23, strength: 0.95 },
			{ x: 0.74, y: 0.34, spin: -1, r: 0.2, strength: 0.7 },
			{ x: 0.88, y: 0.72, spin: 1, r: 0.22, strength: 0.8 },
			{ x: 0.46, y: 0.2, spin: -1, r: 0.18, strength: 0.62 }
		]
	},
	tramontana: {
		label: "Tramontana",
		palette: "mistral",
		bg: [11 / 255, 18 / 255, 25 / 255],
		flowSpeed: 3.05,
		fieldGain: 0.46,
		bgU: 0.025,
		bgV: 0.055,
		wander: 0.031,
		systems: [
			{ x: 0.2, y: 0.18, spin: -1, r: 0.18, strength: 0.78 },
			{ x: 0.4, y: 0.36, spin: 1, r: 0.16, strength: 0.82 },
			{ x: 0.62, y: 0.28, spin: -1, r: 0.18, strength: 0.72 },
			{ x: 0.8, y: 0.56, spin: 1, r: 0.19, strength: 0.9 },
			{ x: 0.54, y: 0.76, spin: 1, r: 0.22, strength: 0.76 },
			{ x: 0.26, y: 0.66, spin: -1, r: 0.19, strength: 0.68 }
		]
	},
	sirocco: {
		label: "Sirocco",
		palette: "sirocco",
		bg: [18 / 255, 18 / 255, 20 / 255],
		flowSpeed: 2.45,
		fieldGain: 0.4,
		bgU: -0.015,
		bgV: -0.045,
		wander: 0.024,
		systems: [
			{ x: 0.22, y: 0.78, spin: 1, r: 0.26, strength: 0.78 },
			{ x: 0.38, y: 0.56, spin: -1, r: 0.2, strength: 0.66 },
			{ x: 0.58, y: 0.36, spin: 1, r: 0.22, strength: 0.86 },
			{ x: 0.78, y: 0.22, spin: -1, r: 0.24, strength: 0.74 },
			{ x: 0.84, y: 0.68, spin: 1, r: 0.2, strength: 0.68 },
			{ x: 0.28, y: 0.28, spin: -1, r: 0.21, strength: 0.58 }
		]
	},
	winter: {
		label: "Winter Storm",
		palette: "marine",
		bg: [9 / 255, 15 / 255, 22 / 255],
		flowSpeed: 3.2,
		fieldGain: 0.5,
		bgU: 0.06,
		bgV: -0.012,
		wander: 0.034,
		systems: [
			{ x: 0.15, y: 0.32, spin: 1, r: 0.18, strength: 1.08 },
			{ x: 0.35, y: 0.18, spin: -1, r: 0.17, strength: 0.86 },
			{ x: 0.5, y: 0.62, spin: -1, r: 0.22, strength: 1.0 },
			{ x: 0.7, y: 0.38, spin: 1, r: 0.18, strength: 1.04 },
			{ x: 0.86, y: 0.78, spin: 1, r: 0.2, strength: 0.9 },
			{ x: 0.28, y: 0.62, spin: -1, r: 0.17, strength: 0.78 }
		]
	}
};

const canvas = document.getElementById("wind_canvas");
const markers = document.getElementById("markers");
const legendBar = document.getElementById("legend_bar");
const modeButtons = Array.from(document.querySelectorAll("[data-mode]"));
const modeLabel = document.getElementById("mode_label");

const gl = canvas.getContext("webgl", {
	alpha: false,
	antialias: false,
	depth: false,
	stencil: false,
	premultipliedAlpha: false,
	preserveDrawingBuffer: false
});

if (!gl) {
	throw new Error("WebGL is not available in this browser.");
}

const xs = new Float32Array(COUNT);
const ys = new Float32Array(COUNT);
const pxs = new Float32Array(COUNT);
const pys = new Float32Array(COUNT);
const ages = new Float32Array(COUNT);
const lifes = new Float32Array(COUNT);
const bins = new Uint8Array(COUNT);

const linePositions = new Float32Array(COUNT * 4);
const lineColors = new Float32Array(COUNT * 8);

let fieldU = new Float32Array(1);
let fieldV = new Float32Array(1);
let fieldB = new Uint8Array(1);

const markerEls = [];
const pressureGroups = [];

const state = {
	w: 1,
	h: 1,
	dpr: 1,
	pw: 1,
	ph: 1,
	aspect: 1,
	gridW: 1,
	gridH: 1,
	fieldRow: 0,
	frame: 0,
	sampleU: 0,
	sampleV: 0,
	sampleB: 0,
	sampleSpeedSq: 0,
	mode: "mistral",
	modeTarget: MODES.mistral,
	flowSpeed: MODES.mistral.flowSpeed,
	fieldGain: MODES.mistral.fieldGain,
	bgU: MODES.mistral.bgU,
	bgV: MODES.mistral.bgV,
	wander: MODES.mistral.wander,
	running: true,
	rafId: 0,
	contextLost: false,
	lastT: 0,
	lastStep: 0,
	fboA: null,
	fboB: null,
	texA: null,
	texB: null,
	read: null,
	write: null,
	systems: SYSTEMS.map((s) => ({
		...s,
		targetX: s.x,
		targetY: s.y,
		targetSpin: s.spin,
		targetR: s.r,
		targetStrength: s.strength,
		baseR: s.r,
		baseStrength: s.strength,
		vx: rand(-DRIFT, DRIFT),
		vy: rand(-DRIFT, DRIFT),
		displayX: s.x,
		displayY: s.y,
		phaseX: rand(0, Math.PI * 2),
		phaseY: rand(0, Math.PI * 2),
		phaseStrength: rand(0, Math.PI * 2),
		phaseRadius: rand(0, Math.PI * 2)
	}))
};

function rand(min, max) {
	return min + Math.random() * (max - min);
}

function clamp(v, min, max) {
	return v < min ? min : v > max ? max : v;
}

function compileShader(type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(gl.getShaderInfoLog(shader) || "Shader compile failed.");
	}

	return shader;
}

function createProgram(vertexSource, fragmentSource) {
	const program = gl.createProgram();
	gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexSource));
	gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentSource));
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error(gl.getProgramInfoLog(program) || "Program link failed.");
	}

	return program;
}

const quadProgram = createProgram(
	`
	attribute vec2 a_pos;
	varying vec2 v_uv;
	void main() {
		v_uv = a_pos * 0.5 + 0.5;
		gl_Position = vec4(a_pos, 0.0, 1.0);
	}
	`,
	`
	precision mediump float;
	uniform sampler2D u_tex;
	uniform vec3 u_bg;
	uniform float u_keep;
	uniform float u_mode;
	varying vec2 v_uv;
	void main() {
		vec3 c = texture2D(u_tex, v_uv).rgb;
		vec3 faded = mix(u_bg, c, u_keep);
		vec3 outColor = mix(c, faded, u_mode);
		gl_FragColor = vec4(outColor, 1.0);
	}
	`
);

const lineProgram = createProgram(
	`
	attribute vec2 a_pos;
	attribute vec4 a_color;
	uniform float u_aspect;
	varying vec4 v_color;
	void main() {
		float x = (a_pos.x / u_aspect) * 2.0 - 1.0;
		float y = 1.0 - a_pos.y * 2.0;
		gl_Position = vec4(x, y, 0.0, 1.0);
		v_color = a_color;
	}
	`,
	`
	precision mediump float;
	varying vec4 v_color;
	void main() {
		gl_FragColor = v_color;
	}
	`
);

const pressureProgram = createProgram(
	`
	attribute vec2 a_pos;
	attribute vec4 a_color;
	attribute float a_size;
	uniform float u_aspect;
	varying vec4 v_color;
	void main() {
		float x = (a_pos.x / u_aspect) * 2.0 - 1.0;
		float y = 1.0 - a_pos.y * 2.0;
		gl_Position = vec4(x, y, 0.0, 1.0);
		gl_PointSize = a_size;
		v_color = a_color;
	}
	`,
	`
	precision mediump float;
	varying vec4 v_color;
	void main() {
		vec2 p = gl_PointCoord - 0.5;
		float d = length(p) * 2.0;
		float outer = smoothstep(1.0, 0.94, d) * smoothstep(0.88, 0.94, d);
		float mid = smoothstep(0.74, 0.69, d) * smoothstep(0.63, 0.69, d);
		float inner = smoothstep(0.48, 0.43, d) * smoothstep(0.36, 0.43, d);
		float alpha = max(max(outer, mid * 0.72), inner * 0.58);
		gl_FragColor = vec4(v_color.rgb, alpha * v_color.a);
	}
	`
);

const quad = {
	program: quadProgram,
	buffer: gl.createBuffer(),
	aPos: gl.getAttribLocation(quadProgram, "a_pos"),
	uTex: gl.getUniformLocation(quadProgram, "u_tex"),
	uBg: gl.getUniformLocation(quadProgram, "u_bg"),
	uKeep: gl.getUniformLocation(quadProgram, "u_keep"),
	uMode: gl.getUniformLocation(quadProgram, "u_mode")
};

gl.bindBuffer(gl.ARRAY_BUFFER, quad.buffer);
gl.bufferData(
	gl.ARRAY_BUFFER,
	new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
	gl.STATIC_DRAW
);

const lines = {
	program: lineProgram,
	positionBuffer: gl.createBuffer(),
	colorBuffer: gl.createBuffer(),
	aPos: gl.getAttribLocation(lineProgram, "a_pos"),
	aColor: gl.getAttribLocation(lineProgram, "a_color"),
	uAspect: gl.getUniformLocation(lineProgram, "u_aspect")
};

gl.bindBuffer(gl.ARRAY_BUFFER, lines.positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, linePositions.byteLength, gl.DYNAMIC_DRAW);

gl.bindBuffer(gl.ARRAY_BUFFER, lines.colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, lineColors.byteLength, gl.DYNAMIC_DRAW);

const pressurePositions = new Float32Array(SYSTEMS.length * 2);
const pressureColors = new Float32Array(SYSTEMS.length * 4);
const pressureSizes = new Float32Array(SYSTEMS.length);

const pressure = {
	program: pressureProgram,
	positionBuffer: gl.createBuffer(),
	colorBuffer: gl.createBuffer(),
	sizeBuffer: gl.createBuffer(),
	aPos: gl.getAttribLocation(pressureProgram, "a_pos"),
	aColor: gl.getAttribLocation(pressureProgram, "a_color"),
	aSize: gl.getAttribLocation(pressureProgram, "a_size"),
	uAspect: gl.getUniformLocation(pressureProgram, "u_aspect")
};

gl.bindBuffer(gl.ARRAY_BUFFER, pressure.positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, pressurePositions.byteLength, gl.DYNAMIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, pressure.colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, pressureColors.byteLength, gl.DYNAMIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, pressure.sizeBuffer);
gl.bufferData(gl.ARRAY_BUFFER, pressureSizes.byteLength, gl.DYNAMIC_DRAW);

function createTexture(w, h) {
	const tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		w,
		h,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		null
	);
	return tex;
}

function createFramebuffer(tex) {
	const fbo = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
	gl.framebufferTexture2D(
		gl.FRAMEBUFFER,
		gl.COLOR_ATTACHMENT0,
		gl.TEXTURE_2D,
		tex,
		0
	);
	return fbo;
}

function clearFramebuffer(fbo) {
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
	gl.viewport(0, 0, state.pw, state.ph);
	gl.disable(gl.BLEND);
	gl.clearColor(BG_RGB[0], BG_RGB[1], BG_RGB[2], 1);
	gl.clear(gl.COLOR_BUFFER_BIT);
}

function rebuildRenderTargets() {
	if (state.texA) gl.deleteTexture(state.texA);
	if (state.texB) gl.deleteTexture(state.texB);
	if (state.fboA) gl.deleteFramebuffer(state.fboA);
	if (state.fboB) gl.deleteFramebuffer(state.fboB);

	state.texA = createTexture(state.pw, state.ph);
	state.texB = createTexture(state.pw, state.ph);
	state.fboA = createFramebuffer(state.texA);
	state.fboB = createFramebuffer(state.texB);

	state.read = { tex: state.texA, fbo: state.fboA };
	state.write = { tex: state.texB, fbo: state.fboB };

	clearFramebuffer(state.fboA);
	clearFramebuffer(state.fboB);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function speedBinSq(sp2) {
	if (sp2 < 0.0016) return 0;
	if (sp2 < 0.0036) return 1;
	if (sp2 < 0.0064) return 2;
	if (sp2 < 0.01) return 3;
	if (sp2 < 0.0144) return 4;
	if (sp2 < 0.0196) return 5;
	if (sp2 < 0.0256) return 6;
	return 7;
}

function writeLineColor(offset, sp2) {
	const scaled = clamp(sp2 * SPEED_COLOR_GAIN, 0, 1) * (NBINS - 1);
	const idx = scaled | 0;
	const next = idx < NBINS - 1 ? idx + 1 : idx;
	const mix = scaled - idx;
	const c0 = COLORS[idx];
	const c1 = COLORS[next];

	const r = c0[0] + (c1[0] - c0[0]) * mix;
	const g = c0[1] + (c1[1] - c0[1]) * mix;
	const b = c0[2] + (c1[2] - c0[2]) * mix;

	lineColors[offset++] = r;
	lineColors[offset++] = g;
	lineColors[offset++] = b;
	lineColors[offset++] = LINE_ALPHA;
	lineColors[offset++] = r;
	lineColors[offset++] = g;
	lineColors[offset++] = b;
	lineColors[offset++] = LINE_ALPHA;

	return offset;
}

function spawn(i) {
	const x = rand(0, state.aspect);
	const y = rand(0, 1);

	xs[i] = x;
	ys[i] = y;
	pxs[i] = x;
	pys[i] = y;
	ages[i] = rand(0, LIFE_MAX);
	lifes[i] = rand(LIFE_MIN, LIFE_MAX);
	bins[i] = 0;
}

function initParticles() {
	for (let i = 0; i < COUNT; i++) spawn(i);
}

function buildLegend() {
	legendBar.style.background = `linear-gradient(90deg, ${COLORS.map(
		(c) =>
			`rgb(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(
				c[2] * 255
			)})`
	).join(", ")})`;
}

function buildMarkers() {
	markers.textContent = "";
	markerEls.length = 0;
	pressureGroups.length = 0;

	for (let i = 0; i < state.systems.length; i++) {
		const group = document.createElement("div");
		const label = document.createElement("div");
		const kind = state.systems[i].spin > 0 ? "L" : "H";

		group.className = "pressure-system";
		group.dataset.kind = kind;

		for (let r = 0; r < 3; r++) {
			const ring = document.createElement("div");
			ring.className = "pressure-ring";
			ring.dataset.ring = String(r + 1);
			group.appendChild(ring);
		}

		label.className = "pressure-marker";
		label.dataset.kind = kind;
		label.textContent = kind;

		group.appendChild(label);
		markers.appendChild(group);

		markerEls.push(group);
		pressureGroups.push(group);
	}
}

function stepSystems(dt) {
	const systems = state.systems;
	const t = performance.now() * 0.001;
	const driftEase = Math.min(1, dt * 0.32);

	for (let i = 0; i < systems.length; i++) {
		const s = systems[i];
		const wobbleX = Math.sin(t * 0.071 + s.phaseX) * state.wander;
		const wobbleY = Math.cos(t * 0.064 + s.phaseY) * state.wander;
		const tx = clamp(s.targetX + wobbleX, 0.1, 0.9);
		const ty = clamp(s.targetY + wobbleY, 0.14, 0.86);

		s.x += (tx - s.x) * driftEase;
		s.y += (ty - s.y) * driftEase;
		s.spin = s.targetSpin;

		const strengthWave = Math.sin(t * 0.045 + s.phaseStrength);
		const radiusWave = Math.cos(t * 0.038 + s.phaseRadius);

		s.baseStrength += (s.targetStrength - s.baseStrength) * driftEase;
		s.baseR += (s.targetR - s.baseR) * driftEase;
		s.strength = s.baseStrength * (1 + strengthWave * SYSTEM_EVOLUTION);
		s.r = s.baseR * (1 + radiusWave * SYSTEM_EVOLUTION * 0.7);

		s.displayX += (s.x - s.displayX) * MARKER_SMOOTHING;
		s.displayY += (s.y - s.displayY) * MARKER_SMOOTHING;
	}
}
function rebuildField() {
	state.gridW = Math.max(2, Math.ceil(state.w / GRID_STEP));
	state.gridH = Math.max(2, Math.ceil(state.h / GRID_STEP));
	state.fieldRow = 0;

	const total = state.gridW * state.gridH;

	fieldU = new Float32Array(total);
	fieldV = new Float32Array(total);
	fieldB = new Uint8Array(total);
}

function computeCell(fx, fy, p) {
	let u = state.bgU;
	let v = state.bgV;

	const aspect = state.aspect;
	const systems = state.systems;

	for (let k = 0; k < systems.length; k++) {
		const s = systems[k];
		const cx = s.x * aspect;
		const rx = fx - cx;
		const ry = fy - s.y;
		const d2 = rx * rx + ry * ry + 0.0001;
		const d = Math.sqrt(d2);
		const invD = 1 / d;
		const r = s.r;
		const mag =
			s.strength * (d / r) * Math.exp(-d2 / (2 * r * r)) * state.fieldGain;
		const tx = -ry * invD;
		const ty = rx * invD;

		u += s.spin * mag * tx;
		v += s.spin * mag * ty;

		const radial = -s.spin * INFLOW * mag;
		u += rx * invD * radial;
		v += ry * invD * radial;
	}

	fieldU[p] = u;
	fieldV[p] = v;
	fieldB[p] = speedBinSq(u * u + v * v);
}

function updateFieldRows(rows) {
	const gw = state.gridW;
	const gh = state.gridH;
	const aspect = state.aspect;

	for (let r = 0; r < rows; r++) {
		const y = state.fieldRow;
		const fy = y / (gh - 1);
		let p = y * gw;

		for (let x = 0; x < gw; x++) {
			computeCell((x / (gw - 1)) * aspect, fy, p);
			p++;
		}

		state.fieldRow++;
		if (state.fieldRow >= gh) state.fieldRow = 0;
	}
}

function updateFullField() {
	for (let y = 0; y < state.gridH; y++) updateFieldRows(1);
}

function sampleField(fx, fy) {
	const gw = state.gridW;
	const gh = state.gridH;
	const gx = clamp((fx / state.aspect) * (gw - 1), 0, gw - 1);
	const gy = clamp(fy * (gh - 1), 0, gh - 1);
	const x0 = gx | 0;
	const y0 = gy | 0;
	const x1 = x0 < gw - 1 ? x0 + 1 : x0;
	const y1 = y0 < gh - 1 ? y0 + 1 : y0;
	const tx = gx - x0;
	const ty = gy - y0;
	const i00 = y0 * gw + x0;
	const i10 = y0 * gw + x1;
	const i01 = y1 * gw + x0;
	const i11 = y1 * gw + x1;

	const u0 = fieldU[i00] + (fieldU[i10] - fieldU[i00]) * tx;
	const u1 = fieldU[i01] + (fieldU[i11] - fieldU[i01]) * tx;
	const v0 = fieldV[i00] + (fieldV[i10] - fieldV[i00]) * tx;
	const v1 = fieldV[i01] + (fieldV[i11] - fieldV[i01]) * tx;

	state.sampleU = u0 + (u1 - u0) * ty;
	state.sampleV = v0 + (v1 - v0) * ty;

	const sp2 = state.sampleU * state.sampleU + state.sampleV * state.sampleV;
	state.sampleSpeedSq = sp2;
	state.sampleB = speedBinSq(sp2);
}

function simulate(dt) {
	const aspect = state.aspect;
	let vp = 0;
	let cp = 0;

	for (let i = 0; i < COUNT; i++) {
		const x = xs[i];
		const y = ys[i];
		sampleField(x, y);
		const nx = x + state.sampleU * dt * state.flowSpeed;
		const ny = y + state.sampleV * dt * state.flowSpeed;

		ages[i] += dt;

		if (ages[i] > lifes[i] || nx < 0 || nx > aspect || ny < 0 || ny > 1) {
			spawn(i);
			linePositions[vp++] = xs[i];
			linePositions[vp++] = ys[i];
			linePositions[vp++] = xs[i];
			linePositions[vp++] = ys[i];
			cp = writeLineColor(cp, 0);
			continue;
		}

		pxs[i] = x;
		pys[i] = y;
		xs[i] = nx;
		ys[i] = ny;
		bins[i] = state.sampleB;

		linePositions[vp++] = x;
		linePositions[vp++] = y;
		linePositions[vp++] = nx;
		linePositions[vp++] = ny;

		cp = writeLineColor(cp, state.sampleSpeedSq);
	}
}

function drawQuad(texture, mode) {
	gl.useProgram(quad.program);
	gl.bindBuffer(gl.ARRAY_BUFFER, quad.buffer);
	gl.enableVertexAttribArray(quad.aPos);
	gl.vertexAttribPointer(quad.aPos, 2, gl.FLOAT, false, 0, 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(quad.uTex, 0);
	gl.uniform3f(quad.uBg, BG_RGB[0], BG_RGB[1], BG_RGB[2]);
	gl.uniform1f(quad.uKeep, 1 - ERASE);
	gl.uniform1f(quad.uMode, mode);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function uploadLines() {
	gl.bindBuffer(gl.ARRAY_BUFFER, lines.positionBuffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, linePositions);
	gl.bindBuffer(gl.ARRAY_BUFFER, lines.colorBuffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, lineColors);
}

function drawLines() {
	gl.useProgram(lines.program);
	gl.uniform1f(lines.uAspect, state.aspect);

	gl.bindBuffer(gl.ARRAY_BUFFER, lines.positionBuffer);
	gl.enableVertexAttribArray(lines.aPos);
	gl.vertexAttribPointer(lines.aPos, 2, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, lines.colorBuffer);
	gl.enableVertexAttribArray(lines.aColor);
	gl.vertexAttribPointer(lines.aColor, 4, gl.FLOAT, false, 0, 0);

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.drawArrays(gl.LINES, 0, COUNT * 2);
	gl.disable(gl.BLEND);
}

function uploadPressure() {
	const systems = state.systems;
	let pp = 0;
	let cp = 0;

	for (let i = 0; i < systems.length; i++) {
		const s = systems[i];
		pressurePositions[pp++] = s.displayX * state.aspect;
		pressurePositions[pp++] = s.displayY;

		pressureColors[cp++] = 0.94;
		pressureColors[cp++] = 0.92;
		pressureColors[cp++] = 0.84;
		pressureColors[cp++] = 0.34;

		pressureSizes[i] = Math.max(72, Math.min(state.w, state.h) * s.r * 1.15);
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, pressure.positionBuffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, pressurePositions);
	gl.bindBuffer(gl.ARRAY_BUFFER, pressure.colorBuffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, pressureColors);
	gl.bindBuffer(gl.ARRAY_BUFFER, pressure.sizeBuffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, pressureSizes);
}

function drawPressure() {
	uploadPressure();
	gl.useProgram(pressure.program);
	gl.uniform1f(pressure.uAspect, state.aspect);

	gl.bindBuffer(gl.ARRAY_BUFFER, pressure.positionBuffer);
	gl.enableVertexAttribArray(pressure.aPos);
	gl.vertexAttribPointer(pressure.aPos, 2, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, pressure.colorBuffer);
	gl.enableVertexAttribArray(pressure.aColor);
	gl.vertexAttribPointer(pressure.aColor, 4, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, pressure.sizeBuffer);
	gl.enableVertexAttribArray(pressure.aSize);
	gl.vertexAttribPointer(pressure.aSize, 1, gl.FLOAT, false, 0, 0);

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.drawArrays(gl.POINTS, 0, state.systems.length);
	gl.disable(gl.BLEND);
}

function render() {
	uploadLines();

	gl.bindFramebuffer(gl.FRAMEBUFFER, state.write.fbo);
	gl.viewport(0, 0, state.pw, state.ph);
	gl.disable(gl.BLEND);
	drawQuad(state.read.tex, 1);
	drawLines();

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.viewport(0, 0, state.pw, state.ph);
	drawQuad(state.write.tex, 0);

	const tmp = state.read;
	state.read = state.write;
	state.write = tmp;
}

function updateMarkers() {
	const w = state.w;
	const h = state.h;
	const base = Math.min(w, h);

	for (let i = 0; i < state.systems.length; i++) {
		const s = state.systems[i];
		const size = Math.max(86, base * s.r * 1.55);
		const opacity = clamp(0.34 + s.strength * 0.24, 0.42, 0.64);

		const kind = s.spin > 0 ? "L" : "H";
		const label = markerEls[i].querySelector(".pressure-marker");
		markerEls[i].dataset.kind = kind;
		if (label && label.textContent !== kind) {
			label.textContent = kind;
			label.dataset.kind = kind;
		}

		markerEls[i].style.transform = `translate3d(${s.displayX * w}px, ${
			s.displayY * h
		}px, 0) translate(-50%, -50%)`;
		markerEls[i].style.setProperty("--pressure-size", `${size}px`);
		markerEls[i].style.setProperty("--pressure-opacity", opacity.toFixed(3));
	}
}

function resize() {
	const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
	const w = Math.max(1, canvas.clientWidth | 0);
	const h = Math.max(1, canvas.clientHeight | 0);
	const pw = Math.max(1, Math.floor(w * dpr));
	const ph = Math.max(1, Math.floor(h * dpr));

	if (w === state.w && h === state.h && dpr === state.dpr) return;

	state.w = w;
	state.h = h;
	state.dpr = dpr;
	state.pw = pw;
	state.ph = ph;
	state.aspect = w / h;

	canvas.width = pw;
	canvas.height = ph;

	rebuildRenderTargets();
	rebuildField();
	updateFullField();

	for (let i = 0; i < COUNT; i++) {
		if (xs[i] > state.aspect) spawn(i);
	}

	updateMarkers();
}

function initResizeObserver() {
	let pending = false;
	const ro = new ResizeObserver(() => {
		if (pending) return;
		pending = true;
		requestAnimationFrame(() => {
			pending = false;
			resize();
		});
	});
	ro.observe(canvas);
}

function frame(now) {
	state.rafId = 0;

	if (!state.running || state.contextLost || document.hidden) return;

	state.rafId = requestAnimationFrame(frame);

	const since = now - state.lastStep;
	if (since < FRAME_MS) return;
	state.lastStep = now - (since % FRAME_MS);

	let dt = (now - state.lastT) * 0.001;
	state.lastT = now;

	if (!Number.isFinite(dt) || dt < 0 || dt > 0.05) {
		dt = 1 / TARGET_FPS;
	}

	state.frame++;
	stepSystems(dt);
	updateFieldRows(FIELD_ROWS_PER_FRAME);
	simulate(dt);
	render();
	updateMarkers();
}

function startAnimation() {
	if (state.rafId || state.contextLost) return;
	state.running = true;
	state.lastT = performance.now();
	state.lastStep = 0;
	state.rafId = requestAnimationFrame(frame);
}

function stopAnimation() {
	state.running = false;
	if (state.rafId) {
		cancelAnimationFrame(state.rafId);
		state.rafId = 0;
	}
}

function resetAfterPause() {
	state.lastT = performance.now();
	state.fieldRow = 0;

	if (state.fboA && state.fboB && !state.contextLost) {
		clearFramebuffer(state.fboA);
		clearFramebuffer(state.fboB);
	}
}

function setMode(name, immediate = false) {
	if (!immediate && name === state.mode) return;

	const mode = MODES[name] || MODES.mistral;
	state.mode = name;
	state.modeTarget = mode;
	COLORS = PALETTES[mode.palette] || PALETTES.marine;
	BG_RGB = mode.bg.slice();
	state.flowSpeed = mode.flowSpeed;
	state.fieldGain = mode.fieldGain;
	state.bgU = mode.bgU;
	state.bgV = mode.bgV;
	state.wander = mode.wander;

	for (let i = 0; i < state.systems.length; i++) {
		const src = mode.systems[i % mode.systems.length];
		const s = state.systems[i];
		s.targetX = src.x;
		s.targetY = src.y;
		s.targetSpin = src.spin;
		s.targetR = src.r;
		s.targetStrength = src.strength;

		if (immediate) {
			s.x = src.x;
			s.y = src.y;
			s.displayX = src.x;
			s.displayY = src.y;
			s.spin = src.spin;
			s.baseR = src.r;
			s.baseStrength = src.strength;
			s.r = src.r;
			s.strength = src.strength;
		}
	}

	for (const button of modeButtons) {
		button.classList.toggle("is-active", button.dataset.mode === name);
	}

	if (modeLabel) modeLabel.textContent = mode.label;

	buildLegend();

	state.fieldRow = 0;
	updateFieldRows(Math.min(state.gridH, 6));

	clearFramebuffer(state.fboA);
	clearFramebuffer(state.fboB);
}

function initModes() {
	for (const button of modeButtons) {
		button.addEventListener("click", () => setMode(button.dataset.mode));
	}

	setMode(state.mode, true);
}

function initVisibility() {
	document.addEventListener("visibilitychange", () => {
		if (document.hidden) {
			stopAnimation();
			return;
		}

		resetAfterPause();
		startAnimation();
	});

	window.addEventListener("pageshow", () => {
		resetAfterPause();
		startAnimation();
	});

	window.addEventListener("pagehide", stopAnimation);

	window.addEventListener("focus", () => {
		if (document.hidden) return;
		resetAfterPause();
		startAnimation();
	});
}

function initWebGLContextHandling() {
	canvas.addEventListener("webglcontextlost", (event) => {
		event.preventDefault();
		state.contextLost = true;
		stopAnimation();
	});

	canvas.addEventListener("webglcontextrestored", () => {
		window.location.reload();
	});
}

function init() {
	buildLegend();
	buildMarkers();
	resize();
	initParticles();
	initModes();
	updateFullField();
	simulate(0.016);
	render();
	initResizeObserver();
	initVisibility();
	initWebGLContextHandling();
	startAnimation();
}

init();