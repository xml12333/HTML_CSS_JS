/*********
 * made by Matthias Hurrle (@atzedent)
 */

/** @type {HTMLCanvasElement} */
const canvas = window.canvas
const gl = canvas.getContext("webgl2")
const dpr = Math.max(1, .5*window.devicePixelRatio)
/** @type {Map<string,PointerEvent>} */
const touches = new Map()

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
uniform vec2 touch;
uniform float time;
uniform int pointerCount;

#define P pointerCount
#define mouse (touch/resolution)

#define T mod(32. + time, 5000.)
#define TIME (T * mix(1. , -.25, step(.5, curve(12. + T * 5e-3, 4e-2))))
#define S smoothstep
#define syl(p, s) (length(p)-s)

#define TAU 6.2831853
#define ESN 1.5707963
#define PI 3.14159265

#define palette(k) (vec3(.5) + vec3(.5) * cos(TAU * (vec3(1) * k + vec3(.3, .2, .2))))

mat2 rot(float a) {
  float c = cos(a),
  s = sin(a);

  return mat2(c, - s, s, c);
}

float rnd(vec2 p) {
  return fract(dot(sin(p * 482.707 + p.yx * 631.543), vec2(512.544)) * 78.233);
}

float rnd(float a) {
  return fract(sin(a * 12.599) * 78.233);
}

float curve(float t, float e) {
  t /= e;

  return mix(
    rnd(floor(t)),
    rnd(floor(t) + 1.),
    pow(S(.0, 1., fract(t)), e)
  );
}

float scratch(vec2 uv) {
  float x = uv.x + T * 3e-7,
  rx = rnd(vec2(x)),
  l = step(1.-7e-7, sin(x * 1e3 * (rx * 1e-2 + 1e-2)));

  float y = uv.y + T * 9e-7,
  ry = rnd(vec2(y));
  l *= sin(y * 1e3 * ry);

  return clamp(1. - l, .0, 1.);
}

float map(vec3 p) {
  float scale = .75,
  iter = 3.333;
  vec3 cs = vec3(1, 1.5, 1);

  for (float i = .0; i < 3.; i++) {
    vec3 q = 2. * clamp(p, -cs, cs) - p;

    float
    bl = clamp(iter - i, .0, 1.),
    sh = 1. - bl;

    p =
    sh * p +
    bl * q;

    float k = max(1.1 / dot(p, p), 1.);

    p = sh * p + bl * k * p;
    scale = sh * scale + bl * k * scale;
  }

  float
  l = length(p.xy),
  d = l - 2.,
  n = l * p.z;
  d = max(d, abs(n) / length(p));

  return max(d / scale, .0);
}

void cam(inout vec3 p, float t) {
  if (P > 0) {
    p.yz *= rot(mouse.y * PI + ESN);
    p.xz *= rot(PI - mouse.x * TAU);
  } else {
    p.yz *= rot(t * .025);
    p.xy *= rot(t * .05);
    p.xz *= rot(t * .1);
  }
}

void main(void) {
  float t = TIME,
  mn = min(resolution.x, resolution.y),
  mx = max(resolution.x, resolution.y),
  pr = min(2., mx / mn);
  vec2 uv = (
    gl_FragCoord.xy - .5 * resolution
  ) / mn;

  if (P == 0 && (abs(uv.y) > .4 || abs(uv.x) > .9)) {
    fragColor = vec4(vec3(0), 1);
    return;
  }

  vec3 col = vec3(0),
  ro = vec3(0, 0, 1. + (P > 0 ? .0: exp(cos(t * .2)))) / pr,
  rd = normalize(vec3(uv, 1));

  cam(ro, t);
  cam(rd, t);

  vec3 p = ro;

  const float steps = 30., maxd = 400.;
  float dither = mix(.75, 1., rnd(uv+t*1e-3));

  for (float i = .0; i < steps; i++) {
    float d = map(p) * .9 * dither;

    if (d < 1e-2) {
      d = 1e-1;
    }

    if (d > maxd) {
      break;
    }

    p += rd * d;

    float k = exp(-log(d));

    col = mix(
      col,
      vec3(1) * k * 38e-3,
      k * 14e-5
    );
  }

  col = mix(
    palette(PI + exp(-col * .8)),
    palette(PI + col * 1.2),
    S(.0, 1., sin(T * .5) * .5 + .5)
  );

  if (P == 0) {
    if (sin((PI+T*2.)*(PI/(3.*TAU))) < -.25) {
      col += step(scratch(uv), 1.-7e-7)*.2;
      col -= step(scratch(uv*1.1), 1.-7e-7)*.125;
    }
    col += .125;
    col *= vec3(2, 1.25, 1);
    col = clamp(col, .0, 1.);
    float vig = pow(1. - dot(uv, uv), -.5) -.5;
    col = mix(col, col * col, vig * col);
  } else {
    col = clamp(pow(col * 1.2, vec3(.4545)), .0, 1.);
  }

  fragColor = vec4(col, 1);
}
`
let time
let buffer
let program
let touch
let resolution
let pointerCount
let vertices = []
let touching = false

function resize() {
    const { innerWidth: width, innerHeight: height } = window

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

    vertices = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]

    buffer = gl.createBuffer()

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

    const position = gl.getAttribLocation(program, "position")

    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    time = gl.getUniformLocation(program, "time")
    touch = gl.getUniformLocation(program, "touch")
    pointerCount = gl.getUniformLocation(program, "pointerCount")
    resolution = gl.getUniformLocation(program, "resolution")
}

function draw(now) {
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

    gl.uniform1f(time, now * 0.001)
    gl.uniform2f(touch, ...getTouches())
    gl.uniform1i(pointerCount, touches.size)
    gl.uniform2f(resolution, canvas.width, canvas.height)
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length * 0.5)
}

function getTouches() {
    if (!touches.size) {
        return [0, 0]
    }

    for (let [id, t] of touches) {
        const result = [dpr * t.clientX, dpr * (innerHeight - t.clientY)]

        return result
    }
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
canvas.onpointerdown = e => {
    touching = true
    touches.set(e.pointerId, e)
}
canvas.onpointermove = e => {
    if (!touching) return
    touches.set(e.pointerId, e)
}
canvas.onpointerup = e => {
    touching = false
    touches.clear()
}
canvas.onpointerout = e => {
    touching = false
    touches.clear()
}
