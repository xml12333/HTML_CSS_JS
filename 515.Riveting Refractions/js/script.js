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

const vec3 lcol=vec3(1,.5,.3).rbg*.0+1.;

const vec3 gold = vec3(255, 233, 152) / 255.;
const vec3 bron = vec3(87, 55, 13) / 255.;
vec3 tint = mix(bron, gold, .5);

#define PI 3.141592
#define TAU 6.283836
#define ESN 1.570796

#define P pointerCount
#define T mod(time*2.,300.)
#define S smoothstep
#define mouse (touch/resolution)
#define rot(a) mat2(cos(a),-sin(a),sin(a),cos(a))
#define syl(p,s) (length(p)-s)
#define noise(p) (.5+.5*sin(p.x*1.5)*sin(p.y*1.5))

float rnd(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

float fbm(vec2 p) {
  float f = .0;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);

  f += .500000*noise(p); p *= m;
  f += .250000*noise(p); p *= m;
  f += .125000*noise(p); p *= m;
  f += .062500*noise(p); p *= m;
  f += .015625*noise(p);

  return f;
}

float smin(float a, float b, float k) {
  float h = clamp(
    .5+.5*(b-a)/k,
    .0,
    1.
  );

  return mix(b, a, h)-k*h*(1.-h);
}

float ftor(vec3 p, vec3 s, float r) {
  vec2 e = vec2(
    abs(length(p.xz)-s.x)-s.z,
    abs(p.y)-s.y
  );

  return length(max(e,.0))+
  min(.0, max(e.x, e.y))-r;
}

float dsc(vec3 p, vec2 s, float r) {
  vec2 e = vec2(
    abs(length(p.xz)-s.x),
    abs(p.y)
  ) - s;

  return length(max(e,.0))+
  min(.0, max(e.x, e.y))-r;
}

float mat = .0;
float map(vec3 p, float scene) {
  float n = 6.;

  p.xz = (p.xz-n*clamp(round(p.xz/n), -1.,1.));

  vec3 q = p;
  q.y += (scene<2.?2.:6.)*T+(scene < 2.?cos(T)+2.75:.0);
  q.y = mod(q.y, 5.)-2.5;

  float d = 5e5,
  core = abs(dsc(p, vec2(.4,.7),.005))-3e-3,
  shell = ftor(q, vec3(1.2,.75,.1),.005),
  obj = shell;

  d = min(d, min(obj, core));

  if (d == core) mat = 1.;
  else mat = .0;

  return d;
}

vec3 norm(vec3 p, float scene) {
  vec2 e = vec2(1e-3, 0);
  float d = map(p, scene);
  vec3 n = d-vec3(
    map(p-e.xyy, scene),
    map(p-e.yxy, scene),
    map(p-e.yyx, scene)
  );

  return normalize(n);
}

void cam(inout vec3 p, float scene) {
  if (P > 0) {
    p.yz *= rot(-mouse.y*PI+ESN);
    p.xz *= rot(PI-mouse.x*TAU);
  } else {
    vec3 q = p;
    p.yz *= rot(sin(T*.5)*.25+.75);
    p.xz *= rot(T*.25);

    if (scene == .0) {
      p.xy *= rot(sin(T*.5)*.25+.25);
    } else if (scene == 2.) {
      p = q;
      p.yz *= rot(TAU+ESN);
      p.xz *= rot(T*.05);
    }
  }
}

void main(void) {
  vec2 uv = (
    gl_FragCoord.xy-.5*resolution
  )/min(resolution.x, resolution.y);

  if (abs(uv.y) > .4 || abs(uv.x) > .9) {
    fragColor = vec4(vec3(0), 1);
    return;
  }

  // anim
  vec2 st = abs(uv);
  float
  num = 3.,
  t = .125*T,
  prog = t*.25,
  preanim = P>0?.0:floor(mod(prog, num));
  prog += max(st.x, st.y) * .08;

  float
  anim = mod(prog, num),
  scene = P>0?.0:floor(anim);

  vec3 col = vec3(0),
  ro = vec3(
    0,
    (P > 0?.0: (scene < 2.?scene*-2.:2.95)),
    (P > 0?-3.:exp(-cos(T*(scene<2.?.25:.5)))-(5.+13.*(scene < 2.?scene:.9)))*1.125
  ),
  rd = normalize(vec3(uv, 1));
  cam(ro, scene);
  cam(rd, scene);

  vec3 p = ro;

  const float steps = 400.,maxd = 40.;
  float dd = .0,
  ii = .0,
  at = .0,
  bnz = .0,
  side = 1.,e = 1.;

  for (float i = .0; i < steps; i++, ii = i) {
    float d = map(p, scene)*side;

    if (d < 1e-3) {

      if (mat == 1.) {
        if (bnz++>1.) break;

        col += tint*5e-1;

        vec3 n = norm(p, scene) * side;
        n.y += max(.0, fbm((p*8.).xz)*.05);

        rd = reflect(rd, n);
        d = 3e-1;
        side = 1.;

      } else {

        vec3
        lp = vec3(0, 0, abs(rd.z)),
        n = norm(p, scene) * side,
        l = normalize(lp - p),
        r = reflect(rd, n);

        if (dot(l, n) < .0) l = -l;

        vec3 h = normalize(l - r);

        float
        fres = pow(1. - max(.0, dot(-r, n)), 5.),
        diff = pow(max(.0, dot(l, n)), 4.),
        fog = e * S(1., 0., dd / maxd),
        fade = pow(S(.0, 1.,1./dot(p-lp, p-lp)),.25);


        col += e * S(.0, 1., i / 300.) +
        mix(
          lcol,
          vec3(1),
          fog * fres
        ) * diff * fres * (
          5. * pow(max(.0, dot(h, n)), 32.) +
          .5 * pow(max(.0, dot(r, n)), 64.)
        );
        col += lcol*.1 * diff * e;
        col = mix(col, col, fade);

        const float aodist = .125;
        float ao = clamp(map(p + n * aodist, scene) / (aodist * .5), .0, 1.);
        col -= ao * .1;

        e *= .95;
        side = -side;

        vec3 rdo = refract(rd, n, 1. + .45 * side);
        if (dot(rdo, rdo) == .0) {
          rdo = reflect(r, n);
        }

        rd = rdo;

        d = 3e-1;
      }
    }

    if (dd > maxd) {
      dd = maxd;
      break;
    }

    p += rd*d;
    dd += d;
    at += 25e-4/dd;
  }


  vec3 off = rd;
  float iter = pow(abs(off.z), 10.);

  vec3 atmocol = mix(
    vec3(0),
    lcol,
    iter
  );

  col += pow(S(-.5, 1.5, at)*88e-2, 24.);
  col += S(1.,.0, dd/maxd)+ii*5e-5;
  col += pow(atmocol, vec3(.5));

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
