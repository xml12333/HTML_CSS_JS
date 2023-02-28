/*********
* made by Matthias Hurrle (@atzedent)
*/

/** @type {HTMLCanvasElement} */
const canvas = window.canvas
const gl = canvas.getContext('webgl2')
const dpr = window.devicePixelRatio

const vertexSource = `#version 300 es
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

in vec2 position;

void main(void) {
    gl_Position = vec4(position, 0., 1.);
}
`
const fragmentSource = `#version 300 es
/*********
* made by Matthias Hurrle (@atzedent)
*/

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

out vec4 fragColor;

uniform vec2 resolution;
uniform float time;

#define T time*.05
#define S smoothstep

float rnd(float a) {
	return fract(
		sin(a*78.57137)*45911.575621
	);
}

float rnd(vec2 p) {
	return fract(
		sin(
			dot(
				p,
				vec2(12.342165,78.39911)
			)
		)*78.57137
	);
}

float _noise(vec2 p) {
	vec2 f=fract(p), i=floor(p);
	float n = i.x+i.y*57.;

	return mix(
		mix(rnd(n),rnd(n+1.),f.x),
		mix(rnd(n+57.),rnd(n+58.),f.x),
		f.y
	);
}

float noise(vec2 p) {
	p *= 3.;
	vec2 f=fract(p), i=floor(p);
	float
	a = rnd(i),
	b = rnd(i+vec2(1,0)),
	c = rnd(i+vec2(0,1)),
	d = rnd(i+vec2(1,1));

	vec2 u = f*f*(3.-2.*f);

	return mix(a,b,u.x)+
		(c-a)*u.y*(1.-u.x)+
		(d-b)*u.y*u.x;
}

float fbm(vec2 p) {
	float f = .0;
	mat2  m = mat2(1.6,1.2,-1.2,1.6);

	f += .5000*_noise(p); p*=m;
	f += .2500*noise(p); p*=m;
	f += .1250*noise(p); p*=m;
	f += .0625*_noise(p); p*=m;

	return f;
}

float _fbm(vec2 p) {
	float f = .0, a = .5;
	vec2 s = vec2(100);
	mat2 m = mat2(cos(.5),sin(.5),-sin(.5),cos(.5));

	for(float i=.0; i<6.; i++) {
		f += a*noise(p);
		p = p*m*s+2.;
		a *= .5;
	}

	return f;
}

void main(void) {
	vec2 uv = (
		gl_FragCoord.xy-.5*resolution
	) / min(resolution.x, resolution.y);

	vec2 p = uv;
	p.x = fbm(uv);
	p.y = _fbm(uv);

	p = 8.*(
		vec2(
			sin(T),
			-cos(T)
		)*.15 - p
	);

	const float pwr = .321;
	for(float i=.0;i<6.;i++) {
		p.x += pwr*sin(T*.1+i*1.5*p.y)-T;
		p.y += pwr*cos(T*.1-i*1.5*p.x)+T;
	}

	vec3 col = vec3(0);
	
	col = .25 + .75*sin(T*.1+p.xyx);
	col = mix((1.-length(uv*.5))*vec3(1,.05,.25), vec3(0), col);
	col = pow(S(vec3(0),vec3(1),col), vec3(4));
	col = 1.-col;

  	fragColor = vec4(col,1);
}
`
let time;
let buffer;
let program;
let resolution;
let vertices = []

function resize() {
	const {
		innerWidth: width,
		innerHeight: height
	} = window

	canvas.width = width * dpr
	canvas.height = height * dpr

	gl.viewport(0, 0, width * dpr, height * dpr)
}

function compile(shader, source) {
	gl.shaderSource(shader, source)
	gl.compileShader(shader)

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error(gl.getShaderInfoLog(shader))
	}
}

function setup() {
	const vs = gl.createShader(gl.VERTEX_SHADER)
	const fs = gl.createShader(gl.FRAGMENT_SHADER)

	program = gl.createProgram()

	compile(vs, vertexSource)
	compile(fs, fragmentSource)

	gl.attachShader(program, vs)
	gl.attachShader(program, fs)
	gl.linkProgram(program)

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error(gl.getProgramInfoLog(program))
	}

	vertices = [
		-1.0,
		-1.0,
		1.0,
		-1.0,
		-1.0,
		1.0,
		-1.0,
		1.0,
		1.0,
		-1.0,
		1.0,
		1.0
	]

	buffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

	const position = gl.getAttribLocation(program, "position")

	gl.enableVertexAttribArray(position)
	gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

	time = gl.getUniformLocation(program, "time")
	resolution = gl.getUniformLocation(program, 'resolution')
}

function draw(now) {
	gl.clearColor(0, 0, 0, 1.)
	gl.clear(gl.COLOR_BUFFER_BIT)

	gl.useProgram(program)
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

	gl.uniform1f(time, now*.001)
	gl.uniform2f(
		resolution,
		canvas.width,
		canvas.height
	)
	gl.drawArrays(gl.TRIANGLES, 0, vertices.length * .5)
}

function loop(now) {
	draw(now)
	requestAnimationFrame(loop)
}

function init() {
	setup()
	resize()
	loop(0)
}

document.body.onload = init
window.onresize = resize
