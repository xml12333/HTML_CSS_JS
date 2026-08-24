import {
  Renderer,
  Program,
  Mesh,
  Uniform,
  PointCloud,
  GeometryAttribute,
  TransformFeedback,
  Texture,
  Vec2,
  Plane,
} from "https://cdn.skypack.dev/wtc-gl";

const PARTICLE_VERT = /* glsl */ `#version 300 es

in vec2 position;
layout(location=0) in vec4 a_posvel;    
layout(location=1) in vec4 a_lifeseed;  
layout(location=2) in vec3 a_color;     

out vec4 v_posvel;
out vec4 v_lifeseed;
out vec3 v_color;
out float v_alpha;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_mouse_velocity; // NEW: Receives the momentum of the mouse
uniform sampler2D u_image;
uniform float u_image_aspect;

vec2 coverUv(vec2 uv) {
  float canvasAspect = u_resolution.x / u_resolution.y;
  float scale = (u_image_aspect > canvasAspect)
    ? canvasAspect / u_image_aspect
    : u_image_aspect / canvasAspect;
  vec2 axis = (u_image_aspect > canvasAspect) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  return (uv - 0.5) * (axis * scale + (1.0 - axis)) + 0.5;
}

#define MOD3 vec3(.1031,.11369,.13787)
vec3 hash33(vec3 p3) {
  p3 = fract(p3 * MOD3);
  p3 += dot(p3, p3.yxz + 19.19);
  return -1.0 + 2.0 * fract(vec3((p3.x+p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
}

float simplex_noise(vec3 p) {
  const float K1 = 0.333333333;
  const float K2 = 0.166666667;
  vec3 i  = floor(p + (p.x+p.y+p.z)*K1);
  vec3 d0 = p - (i - (i.x+i.y+i.z)*K2);
  vec3 e  = step(vec3(0.0), d0 - d0.yzx);
  vec3 i1 = e * (1.0 - e.zxy);
  vec3 i2 = 1.0 - e.zxy*(1.0 - e);
  vec3 d1 = d0 - (i1 - K2);
  vec3 d2 = d0 - (i2 - 2.0*K2);
  vec3 d3 = d0 - (1.0 - 3.0*K2);
  vec4 h = max(0.6 - vec4(dot(d0,d0),dot(d1,d1),dot(d2,d2),dot(d3,d3)), 0.0);
  vec4 n = h*h*h*h * vec4(
    dot(d0, hash33(i)),
    dot(d1, hash33(i+i1)),
    dot(d2, hash33(i+i2)),
    dot(d3, hash33(i+1.0))
  );
  return dot(vec4(31.316), n);
}

void main() {
  vec2  position = a_posvel.xy;
  vec2  velocity = a_posvel.zw;
  float life     = a_lifeseed.x + 1.0;
  float maxLife  = a_lifeseed.y;
  vec2  seed     = a_lifeseed.zw;

  // Noise-field acceleration
  float angle      = simplex_noise(vec3(position * 0.004, u_time*20. + life*.05)) * 6.2831;
  vec2  noiseForce = vec2(cos(angle), sin(angle)) * 0.04;

  // Mouse Momentum
  vec2  toMouse    = position - u_mouse;
  float dist2      = dot(toMouse, toMouse);
  
  // Create a proximity multiplier (0.0 to ~1.0). 
  float proximity  = pow(1000.0 / (dist2 + 1000.0), 1.0);
  
  // Multiply the mouse's velocity by how close the particle is to the mouse
  // 0.08 is the strength multiplier. Tweak it for more/less push.
  vec2  mouseForce = u_mouse_velocity * proximity * 0.08;

  velocity = velocity * 0.98 + noiseForce + mouseForce;
  position = position + velocity;

  v_posvel   = vec4(position, velocity);
  v_lifeseed = vec4(life, maxLife, seed);
  v_color    = a_color;

  bool dead = life >= maxLife
           || position.x < 0.0 || position.x > u_resolution.x
           || position.y < 0.0 || position.y > u_resolution.y;

  if (dead) {
    vec3 h       = hash33(vec3(seed, u_time + life));
    vec2 newSeed = h.xy;
    vec2 uv      = fract(h.xy * 0.5 + 0.5);
    v_posvel     = vec4(uv * u_resolution, 0.0, 0.0);
    v_lifeseed   = vec4(0.0, maxLife, newSeed);
    v_color      = texture(u_image, coverUv(uv)).rgb;
  }

  float lifeRatio = v_lifeseed.x / maxLife;
  float alpha     = smoothstep(0.0, 0.05, lifeRatio) * (1.0 - smoothstep(0.85, 1.0, lifeRatio));
  gl_PointSize    = smoothstep(1., 0.5, lifeRatio) * 4. * alpha;
  v_alpha = alpha * .5;

  vec2 ndc  = v_posvel.xy / u_resolution * 2.0 - 1.0;
  ndc.y     = -ndc.y;
  gl_Position = vec4(ndc, 0.0, 1.0);
}`;

const PARTICLE_FRAG = /* glsl */ `#version 300 es
precision highp float;

in vec4 v_lifeseed;
in vec3 v_color;
in float v_alpha;

out vec4 fragColor;

void main() {
  float dist  = length(gl_PointCoord - 0.5);
  float shape = 1.0 - smoothstep(0.3, 0.5, dist);

  fragColor = vec4(v_color, v_alpha * shape);
}`;

const BG_VERT = /* glsl */ `#version 300 es
in vec3 position;
in vec2 uv;
out vec2 v_uv;
void main() {
  v_uv        = uv;
  gl_Position = vec4(position, 1.0);
}`;

const BG_FRAG = /* glsl */ `#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_image_aspect;
in vec2 v_uv;
out vec4 fragColor;

vec2 coverUv(vec2 uv) {
  float canvasAspect = u_resolution.x / u_resolution.y;
  float scale = (u_image_aspect > canvasAspect)
    ? canvasAspect / u_image_aspect
    : u_image_aspect / canvasAspect;
  vec2 axis = (u_image_aspect > canvasAspect) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  return (uv - 0.5) * (axis * scale + (1.0 - axis)) + 0.5;
}

void main() {
  vec2 uv = vec2(v_uv.x, 1.0 - v_uv.y);
  fragColor = texture(u_image, coverUv(uv));
}`;

export class ImageParticles {
  #playing = false;
  #lastTime = 0;

  constructor({
    image,
    container = document.body,
    numParticles = 500000,
    onBeforeRender,
  } = {}) {
    this.numParticles = numParticles;
    this.onBeforeRender = onBeforeRender;

    this.renderer = new Renderer({ dpr: Math.min(devicePixelRatio, 2) });
    this.gl = this.renderer.gl;

    this.gl.depthMask(false);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    const canvas = this.gl.canvas;
    canvas.style.cssText =
      "display:block;width:100%;height:100%;position:absolute;inset:0;";
    container.appendChild(canvas);

    this.u_time = new Uniform({ name: "u_time", value: 0, kind: "float" });
    this.u_resolution = new Uniform({
      name: "u_resolution",
      value: [1, 1],
      kind: "float_vec2",
    });
    this.u_mouse = new Uniform({
      name: "u_mouse",
      value: [0, 0],
      kind: "float_vec2",
    });
    
    this.u_mouse_velocity = new Uniform({
      name: "u_mouse_velocity",
      value: [0, 0],
      kind: "float_vec2",
    });
    
    this._targetMouse = [-10000, -10000];
    this._lastMouse = [-10000, -10000];
    this._mouseVelocity = [0, 0];

    this.u_image = new Uniform({
      name: "u_image",
      value: null,
      kind: "texture",
    });
    this.u_image_aspect = new Uniform({
      name: "u_image_aspect",
      value: 1.0,
      kind: "float",
    });

    this.render = this.render.bind(this);
    this.resize = this.resize.bind(this);
    this.pointerMove = this.pointerMove.bind(this);
    this.pointerLeave = this.pointerLeave.bind(this);

    window.addEventListener("resize", this.resize);
    window.addEventListener("pointermove", this.pointerMove);
    canvas.addEventListener("pointerleave", this.pointerLeave);
    
    this.resize();

    if (image) this.loadImage(image);
  }

  async loadImage(src) {
    const img =
      src instanceof HTMLImageElement || src instanceof HTMLCanvasElement
        ? src
        : await new Promise((resolve, reject) => {
            const i = new Image();
            i.crossOrigin = "anonymous";
            i.onload = () => resolve(i);
            i.onerror = reject;
            i.src = src;
          });
    this.#setupScene(img);
    this.playing = true;
  }

  #setupScene(img) {
    const gl = this.gl;

    const tex = new Texture(gl, {
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
      flipY: false,
    });
    tex.image = img;
    tex.needsUpdate = true;
    this.u_image.value = tex;

    const offscreen = document.createElement("canvas");
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    this.u_image_aspect.value = iw / ih;
    offscreen.width = iw;
    offscreen.height = ih;
    const ctx2d = offscreen.getContext("2d");
    ctx2d.drawImage(img, 0, 0);
    const imageData = ctx2d.getImageData(0, 0, iw, ih);

    const N = this.numParticles;
    const [w, h] = this.u_resolution.value;
    const posvel = new Float32Array(N * 4); 
    const lifeseed = new Float32Array(N * 4); 
    const color = new Float32Array(N * 3);

    const canvasAspect = w / h;
    const imageAspect = iw / ih;

    for (let i = 0; i < N; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const maxLife = 100 + Math.random() * 300;

      posvel[i * 4] = x;
      posvel[i * 4 + 1] = y;
      posvel[i * 4 + 2] = (Math.random() - 0.5) * 0.5;
      posvel[i * 4 + 3] = (Math.random() - 0.5) * 0.5;

      lifeseed[i * 4] = Math.random() * maxLife;
      lifeseed[i * 4 + 1] = maxLife;
      lifeseed[i * 4 + 2] = Math.random() * 2 - 1;
      lifeseed[i * 4 + 3] = Math.random() * 2 - 1;

      let cu = x / w;
      let cv = y / h;
      if (imageAspect > canvasAspect) {
        cu = (cu - 0.5) * (canvasAspect / imageAspect) + 0.5;
      } else {
        cv = (cv - 0.5) * (imageAspect / canvasAspect) + 0.5;
      }
      cu = Math.max(0, Math.min(1, cu));
      cv = Math.max(0, Math.min(1, cv));
      const px = Math.min(Math.floor(cu * iw), iw - 1);
      const py = Math.min(Math.floor(cv * ih), ih - 1);
      const di = (py * iw + px) * 4;
      color[i * 3] = imageData.data[di] / 255;
      color[i * 3 + 1] = imageData.data[di + 1] / 255;
      color[i * 3 + 2] = imageData.data[di + 2] / 255;
    }

    const bgProgram = new Program(gl, {
      vertex: BG_VERT,
      fragment: BG_FRAG,
      uniforms: {
        u_image: this.u_image,
        u_resolution: this.u_resolution,
        u_image_aspect: this.u_image_aspect,
      },
      depthTest: false,
    });
    this.bgMesh = new Mesh(gl, {
      geometry: new Plane(gl, { width: 2, height: 2 }),
      program: bgProgram,
    });

    const particleProgram = new Program(gl, {
      vertex: PARTICLE_VERT,
      fragment: PARTICLE_FRAG,
      uniforms: {
        u_time: this.u_time,
        u_resolution: this.u_resolution,
        u_mouse: this.u_mouse,
        u_mouse_velocity: this.u_mouse_velocity,
        u_image: this.u_image,
        u_image_aspect: this.u_image_aspect,
      },
      transparent: true,
      depthTest: false,
      transformFeedbackVaryings: ["v_posvel", "v_lifeseed", "v_color"],
    });

    this.transformFeedbacks = new TransformFeedback(gl, {
      program: particleProgram.program,
      transformFeedbacks: {
        a_posvel: {
          data: posvel,
          size: 4,
          usage: gl.STREAM_COPY,
          varying: "v_posvel",
        },
        a_lifeseed: {
          data: lifeseed,
          size: 4,
          usage: gl.STREAM_COPY,
          varying: "v_lifeseed",
        },
        a_color: {
          data: color,
          size: 3,
          usage: gl.STREAM_COPY,
          varying: "v_color",
        },
      },
    });

    const positionView = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
      positionView[i * 2] = posvel[i * 4];
      positionView[i * 2 + 1] = posvel[i * 4 + 1];
    }

    const cloud = new PointCloud(gl, {
      particles: N,
      dimensions: 2,
      fillFunction: (pts) => {
        for (let i = 0; i < pts.length; i++) pts[i] = positionView[i];
      },
      attributes: {
        a_posvel: new GeometryAttribute({ size: 4, data: posvel }),
        a_lifeseed: new GeometryAttribute({ size: 4, data: lifeseed }),
        a_color: new GeometryAttribute({ size: 3, data: color }),
      },
      transformFeedbacks: this.transformFeedbacks,
    });

    this.particleMesh = new Mesh(gl, {
      mode: gl.POINTS,
      geometry: cloud,
      program: particleProgram,
    });
  }

  pointerMove(e) {
    const rect = this.gl.canvas.getBoundingClientRect();
    const dpr = this.renderer.dpr;
    
    // Snap last mouse to current if coming from offscreen to prevent huge velocity leaps
    if (this._targetMouse[0] < -9000) {
      this._lastMouse[0] = (e.clientX - rect.left) * dpr;
      this._lastMouse[1] = (e.clientY - rect.top) * dpr;
    }
    
    this._targetMouse[0] = (e.clientX - rect.left) * dpr;
    this._targetMouse[1] = (e.clientY - rect.top) * dpr;
    
    this.u_mouse.value = this._targetMouse;
  }
  
  pointerLeave(e) {
    const dpr = this.renderer.dpr;
    this._targetMouse[0] = -10000 * dpr;
    this._targetMouse[1] = -10000 * dpr;
    
    // Reset positions and velocity so it doesn't drift when leaving
    this._lastMouse[0] = this._targetMouse[0];
    this._lastMouse[1] = this._targetMouse[1];
    this.u_mouse.value = this._targetMouse;
    
    this._mouseVelocity[0] = 0;
    this._mouseVelocity[1] = 0;
  }

  render(t) {
    const firstRun = this.#lastTime === 0;
    const diff = t - this.#lastTime;
    this.#lastTime = t;

    if (this.#playing) requestAnimationFrame(this.render);
    if (firstRun) return;

    this.u_time.value += diff * 0.00005;
    
    // Calculate raw velocity
    let vx = this._targetMouse[0] - this._lastMouse[0];
    let vy = this._targetMouse[1] - this._lastMouse[1];

    // Smooth/interpolate the velocity for a natural drag effect 
    // Decrease the 0.15 for more slide/drift, increase for tighter stopping
    this._mouseVelocity[0] += (vx - this._mouseVelocity[0]) * 0.15;
    this._mouseVelocity[1] += (vy - this._mouseVelocity[1]) * 0.15;

    // Shift target position to last position
    this._lastMouse[0] = this._targetMouse[0];
    this._lastMouse[1] = this._targetMouse[1];

    this.u_mouse_velocity.value = this._mouseVelocity;

    if (this.onBeforeRender) this.onBeforeRender(diff);

    if (this.bgMesh) {
      this.renderer.render({
        scene: this.bgMesh,
        update: true,
        sort: false,
        frustumCull: false,
      });
    }

    if (this.particleMesh) {
      this.renderer.render({
        scene: this.particleMesh,
        update: true,
        sort: false,
        frustumCull: false,
        clear: false,
      });
    }
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.dimensions = new Vec2(w, h);
    this.u_resolution.value = [w * this.renderer.dpr, h * this.renderer.dpr];
  }

  set playing(v) {
    if (!this.#playing && v === true) {
      this.#playing = true;
      this.#lastTime = 0;
      requestAnimationFrame(this.render);
    } else if (v === false) {
      this.#playing = false;
    }
  }
  get playing() {
    return this.#playing;
  }

  destroy() {
    this.#playing = false;
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("pointermove", this.pointerMove);
    this.gl.canvas.removeEventListener("pointerleave", this.pointerLeave);
    this.gl.canvas.remove();
  }
}

const particles = new ImageParticles({
  image:
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop&auto=format",
  container: document.body,
  numParticles: 600000,
});