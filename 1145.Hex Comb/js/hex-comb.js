(() => {
  'use strict';

  const DEFAULTS = Object.freeze({
    background: '#080A10',
    baseColor: '#64C3B1',
    accentColor: '#FFFFFF',
    density: 15,
    gap: 7,
    lift: 75,
    reach: 18,
    swell: 100,
    speed: 100,
    grain: 3,
    vignette: 36,
  });

  const PERP_SUPPORT = 1.15001227;
  const ROW_PITCH = 1.7320508;
  const MAX_LIFT = 1.5;
  const MAX_SWELL = 0.5;
  const MAX_DPR = 2;
  const HOVER_RATE = 5;
  const POSITION_RATE = 9;

  const NUMERIC_SETTINGS = new Set([
    'density',
    'gap',
    'lift',
    'reach',
    'swell',
    'speed',
    'grain',
    'vignette',
  ]);

  const SERIALIZED_SETTINGS = [
    'background',
    'baseColor',
    'accentColor',
    'density',
    'gap',
    'lift',
    'reach',
    'swell',
    'speed',
    'grain',
    'vignette',
  ];

  const VERTEX_SHADER = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

  // This is a direct vanilla-WebGL port of the shader logic supplied with the
  // reference component. Geometry edges are feathered in shader space instead
  // of being decided by hard boolean pixel tests.
  const FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  uRes;
uniform float uTime;
uniform float uDpr;

uniform vec3  uBg;
uniform vec3  uBase;
uniform vec3  uAccent;
uniform float uScale;
uniform float uApothem;
uniform float uPerp;
uniform float uLift;
uniform float uSwell;
uniform float uReach;
uniform vec2  uPointer;
uniform float uPointerAmt;
uniform float uGrain;
uniform float uVignette;

const vec2  E    = vec2(0.4200, 0.9075);
const vec2  PP   = vec2(-0.9075, 0.4200);
const vec2  L    = vec2(-0.5548, 0.8320);
const vec2  N0   = vec2(1.0, 0.0);
const vec2  N1   = vec2(0.5, 0.8660254);
const vec2  N2   = vec2(-0.5, 0.8660254);
const float ROW  = 1.7320508;
const float CIRC = 1.1547005;

float h21(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float filmGrain(vec2 fragCoord, float t, float dpr) {
    vec2 cell = floor(fragCoord / max(dpr, 1.0));
    return h21(cell + floor(t * 24.0) * 13.7) - 0.5;
}

float vignetteMask(vec2 uv, float aspect, float amount) {
    vec2 v = uv - 0.5;
    v.x *= aspect;
    return 1.0 - amount * smoothstep(0.34, 1.0, length(v));
}

float hexD(vec2 q, float a) {
    return max(max(abs(dot(q, N0)), abs(dot(q, N1))), abs(dot(q, N2))) - a;
}

float hullD(vec2 q, float a, float h) {
    vec3 d = vec3(dot(N0, E), dot(N1, E), dot(N2, E)) * h;
    vec3 s = vec3(dot(q, N0), dot(q, N1), dot(q, N2));
    float m = abs(dot(q, PP)) - uPerp * a;
    m = max(m, max( s.x - a - max(0.0,  d.x), -s.x - a - max(0.0, -d.x)));
    m = max(m, max( s.y - a - max(0.0,  d.y), -s.y - a - max(0.0, -d.y)));
    m = max(m, max( s.z - a - max(0.0,  d.z), -s.z - a - max(0.0, -d.z)));
    return m;
}

float cellHeight(vec2 c) {
    float d = length(c - uPointer) / max(uReach, 0.001);
    float bump = exp(-d * d * 2.2);
    float w = 0.5 + 0.5 * sin(dot(c, vec2(0.21, 0.13)) + h21(c * 0.37) * 6.283 - uTime * 0.8);
    return uLift * uPointerAmt * bump + uSwell * w;
}

void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    float aspect = uRes.x / uRes.y;
    vec2 p = vec2(uv.x * aspect, uv.y) * uScale;

    float unitPx = uRes.y / uScale;
    float aa = 1.4 / unitPx;
    float a = uApothem;
    float ceiling = max(uLift + uSwell, 0.001);

    vec3 col = uBg;

    float j0 = floor(p.y / ROW + 0.5);

    for (int dj = 1; dj >= -3; dj--) {
        float fj = j0 + float(dj);
        float par = mod(fj, 2.0);
        float cy = fj * ROW;
        float i0 = floor((p.x - par) * 0.5 + 0.5);

        for (int di = -1; di <= 1; di++) {
            vec2 c = vec2((i0 + float(di)) * 2.0 + par, cy);
            vec2 q = p - c;
            float h = cellHeight(c);

            float bound = CIRC + h + 0.42;
            if (dot(q, q) > bound * bound) continue;

            if (h > 0.02) {
                float ds = hullD(q + vec2(0.11, 0.17), a, h);
                float sh = 1.0 - smoothstep(-0.02, 0.36, ds);
                col *= 1.0 - 0.55 * sh * clamp(h * 1.7, 0.0, 1.0);
            }

            float dh = hullD(q, a, h);
            float cov = 1.0 - smoothstep(-aa, aa, dh);
            if (cov <= 0.0) continue;

            float dt = hexD(q - h * E, a);
            float top = 1.0 - smoothstep(-aa, aa, dt);
            float wall = clamp(cov - top, 0.0, 1.0);
            float hn = clamp(h / ceiling, 0.0, 1.0);

            if (wall > 0.0) {
                vec3 s = vec3(dot(q, N0), dot(q, N1), dot(q, N2));
                vec2 wn = N0 * sign(s.x);
                float best = abs(s.x);
                if (abs(s.y) > best) { best = abs(s.y); wn = N1 * sign(s.y); }
                if (abs(s.z) > best) { best = abs(s.z); wn = N2 * sign(s.z); }

                float lam = clamp(dot(wn, L) * 0.5 + 0.5, 0.0, 1.0);
                float depth = clamp(dot(q - h * E, -E) / max(h, 0.001), 0.0, 1.0);
                vec3 wallCol = mix(uBg, uBase, 0.12 + 0.74 * lam) * (1.0 - 0.62 * depth);
                col = mix(col, wallCol, wall);
            }

            if (top > 0.0) {
                vec2 qt = (q - h * E) / max(a, 0.001);
                vec3 rest = mix(uBg, uBase, 0.20);
                vec3 risen = mix(uBase * 1.25, uAccent, smoothstep(0.58, 1.0, hn));
                vec3 topCol = mix(rest, risen, smoothstep(0.0, 0.45, hn));
                topCol *= 0.86 + 0.16 * dot(qt, L);

                float rim = smoothstep(-aa * 3.5, -aa * 1.0, dt) *
                            (1.0 - smoothstep(-aa * 1.0, aa, dt));
                topCol += rim * mix(uBase, uAccent, hn) * (0.30 + 0.75 * hn);

                col = mix(col, topCol, top);
            }
        }
    }

    col *= vignetteMask(uv, aspect, uVignette);
    col += (h21(gl_FragCoord.xy) - 0.5) * (1.5 / 255.0);
    col += filmGrain(gl_FragCoord.xy, uTime, uDpr) * uGrain;

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const num = (value, fallback) => (
    typeof value === 'number' && Number.isFinite(value) ? value : fallback
  );

  function parseColor(input, fallback) {
    if (!input) return fallback;
    const value = String(input).trim();

    if (value.startsWith('#')) {
      let hex = value.slice(1);
      if (hex.length === 3 || hex.length === 4) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      if (hex.length >= 6) {
        const r = Number.parseInt(hex.slice(0, 2), 16);
        const g = Number.parseInt(hex.slice(2, 4), 16);
        const b = Number.parseInt(hex.slice(4, 6), 16);
        if (![r, g, b].some(Number.isNaN)) return [r / 255, g / 255, b / 255];
      }
      return fallback;
    }

    const parts = value.match(/[\d.]+/g);
    if (parts && parts.length >= 3) {
      return [
        Math.min(255, Number.parseFloat(parts[0])) / 255,
        Math.min(255, Number.parseFloat(parts[1])) / 255,
        Math.min(255, Number.parseFloat(parts[2])) / 255,
      ];
    }

    return fallback;
  }

  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Unable to create a WebGL shader.');

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || 'Unknown shader compilation error.';
      gl.deleteShader(shader);
      throw new Error(message);
    }

    return shader;
  }

  function createProgram(gl) {
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();

    if (!program) throw new Error('Unable to create a WebGL program.');

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) || 'Unknown WebGL program link error.';
      gl.deleteProgram(program);
      throw new Error(message);
    }

    return program;
  }

  function datasetKey(setting) {
    return setting;
  }

  function readCanvasSettings(canvas) {
    const settings = {};

    for (const setting of SERIALIZED_SETTINGS) {
      const raw = canvas.dataset[datasetKey(setting)];
      if (raw === undefined || raw === '') continue;
      settings[setting] = NUMERIC_SETTINGS.has(setting) ? Number(raw) : raw;
    }

    return settings;
  }

  function escapeAttribute(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('"', '&quot;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }

  const instances = new WeakMap();

  class HexComb {
    constructor(canvas, options = {}) {
      if (!(canvas instanceof HTMLCanvasElement)) {
        throw new TypeError('HexComb requires a <canvas> element.');
      }

      const existing = instances.get(canvas);
      if (existing) return existing;

      this.canvas = canvas;
      this.settings = {
        ...DEFAULTS,
        ...readCanvasSettings(canvas),
        ...options,
      };

      this.gl = canvas.getContext('webgl', {
        antialias: false,
        alpha: false,
        depth: false,
        preserveDrawingBuffer: false,
      });

      if (!this.gl) {
        this.showError('WebGL is unavailable in this browser.');
        return;
      }

      try {
        this.program = createProgram(this.gl);
      } catch (error) {
        console.error('HexComb:', error);
        this.showError('The Hex Comb shader could not be compiled. See the console for details.');
        return;
      }

      this.gl.useProgram(this.program);
      this.setupGeometry();
      this.cacheUniforms();

      this.pointer = {
        x: 0.5,
        y: 0.5,
        rawX: 0.5,
        rawY: 0.5,
        on: 0,
        onTarget: 0,
      };

      this.cssWidth = this.canvas.offsetWidth || 1;
      this.cssHeight = this.canvas.offsetHeight || 1;
      this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.clock = 0;
      this.lastFrame = performance.now();
      this.raf = 0;
      this.destroyed = false;

      this.handlePointerMove = this.handlePointerMove.bind(this);
      this.handlePointerLeave = this.handlePointerLeave.bind(this);
      this.render = this.render.bind(this);

      this.canvas.addEventListener('pointermove', this.handlePointerMove, { passive: true });
      this.canvas.addEventListener('pointerenter', this.handlePointerMove, { passive: true });
      this.canvas.addEventListener('pointerleave', this.handlePointerLeave, { passive: true });
      window.addEventListener('blur', this.handlePointerLeave);

      this.resizeObserver = new ResizeObserver(() => {
        this.cssWidth = this.canvas.offsetWidth || 1;
        this.cssHeight = this.canvas.offsetHeight || 1;
      });
      this.resizeObserver.observe(this.canvas);

      this.writeSettingsToDataset();
      instances.set(canvas, this);
      this.raf = requestAnimationFrame(this.render);
    }

    setupGeometry() {
      const gl = this.gl;
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      );

      const positionLocation = gl.getAttribLocation(this.program, 'aPos');
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      this.positionBuffer = buffer;
    }

    cacheUniforms() {
      const gl = this.gl;
      const location = (name) => gl.getUniformLocation(this.program, name);

      this.uniforms = {
        res: location('uRes'),
        time: location('uTime'),
        dpr: location('uDpr'),
        bg: location('uBg'),
        base: location('uBase'),
        accent: location('uAccent'),
        scale: location('uScale'),
        apothem: location('uApothem'),
        perp: location('uPerp'),
        lift: location('uLift'),
        swell: location('uSwell'),
        reach: location('uReach'),
        pointer: location('uPointer'),
        pointerAmount: location('uPointerAmt'),
        grain: location('uGrain'),
        vignette: location('uVignette'),
      };
    }

    showError(message) {
      this.canvas.dataset.hexCombError = message;
      console.error(`HexComb: ${message}`);
    }

    handlePointerMove(event) {
      const rect = this.canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      this.pointer.rawX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      this.pointer.rawY = clamp((event.clientY - rect.top) / rect.height, 0, 1);
      this.pointer.onTarget = 1;
    }

    handlePointerLeave() {
      this.pointer.onTarget = 0;
    }

    setSetting(name, value) {
      if (!(name in DEFAULTS)) return;

      const normalized = NUMERIC_SETTINGS.has(name) ? Number(value) : String(value);
      if (NUMERIC_SETTINGS.has(name) && !Number.isFinite(normalized)) return;

      this.settings[name] = normalized;
      this.canvas.dataset[datasetKey(name)] = String(normalized);
    }

    reset() {
      this.settings = { ...DEFAULTS };
      this.writeSettingsToDataset();
    }

    writeSettingsToDataset() {
      for (const setting of SERIALIZED_SETTINGS) {
        this.canvas.dataset[datasetKey(setting)] = String(this.settings[setting]);
      }
    }

    toCanvasMarkup() {
      const attributes = [
        'data-hex-comb',
        ...SERIALIZED_SETTINGS.map((setting) => {
          const attributeName = `data-${setting.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
          return `${attributeName}="${escapeAttribute(this.settings[setting])}"`;
        }),
        'aria-label="Interactive extruded honeycomb"',
        'style="display:block;width:100%;height:100vh;"',
      ];

      return `<canvas\n  ${attributes.join('\n  ')}\n></canvas>`;
    }

    render(now) {
      if (this.destroyed || !this.gl || !this.program) return;
      this.raf = requestAnimationFrame(this.render);

      const dt = Math.min(0.05, (now - this.lastFrame) / 1000);
      this.lastFrame = now;

      const speedRate = this.reduceMotion
        ? 0
        : clamp(num(this.settings.speed, DEFAULTS.speed), 0, 100) / 50;
      this.clock = (this.clock + dt * speedRate) % 3600;

      const ease = (rate) => 1 - Math.exp(-rate * dt);
      this.pointer.on += (this.pointer.onTarget - this.pointer.on) * ease(HOVER_RATE);

      const targetX = this.pointer.onTarget > 0 ? this.pointer.rawX : 0.5;
      const targetY = this.pointer.onTarget > 0 ? this.pointer.rawY : 0.5;
      this.pointer.x += (targetX - this.pointer.x) * ease(POSITION_RATE);
      this.pointer.y += (targetY - this.pointer.y) * ease(POSITION_RATE);

      const gl = this.gl;
      const u = this.uniforms;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const bufferWidth = Math.max(1, Math.round(this.cssWidth * dpr));
      const bufferHeight = Math.max(1, Math.round(this.cssHeight * dpr));

      if (this.canvas.width !== bufferWidth || this.canvas.height !== bufferHeight) {
        this.canvas.width = bufferWidth;
        this.canvas.height = bufferHeight;
        gl.viewport(0, 0, bufferWidth, bufferHeight);
      }

      const aspect = bufferWidth / bufferHeight;
      const scale = clamp(num(this.settings.density, DEFAULTS.density), 3, 24) * ROW_PITCH;
      const pointerAmount = Math.min(1, this.pointer.on);
      const liftWorld = (clamp(num(this.settings.lift, DEFAULTS.lift), 0, 100) / 100) * MAX_LIFT;
      const raised = liftWorld * pointerAmount;

      const bg = parseColor(this.settings.background, [0.031, 0.039, 0.063]);
      const base = parseColor(this.settings.baseColor, [0.357, 0.486, 1.0]);
      const accent = parseColor(this.settings.accentColor, [1.0, 0.808, 0.361]);

      gl.useProgram(this.program);
      gl.uniform2f(u.res, bufferWidth, bufferHeight);
      gl.uniform1f(u.time, this.clock);
      gl.uniform1f(u.dpr, dpr);
      gl.uniform3f(u.bg, bg[0], bg[1], bg[2]);
      gl.uniform3f(u.base, base[0], base[1], base[2]);
      gl.uniform3f(u.accent, accent[0], accent[1], accent[2]);
      gl.uniform1f(u.scale, scale);
      gl.uniform1f(u.apothem, 1 - clamp(num(this.settings.gap, DEFAULTS.gap), 0, 40) / 100);
      gl.uniform1f(u.perp, PERP_SUPPORT);
      gl.uniform1f(u.lift, liftWorld);
      gl.uniform1f(
        u.swell,
        (clamp(num(this.settings.swell, DEFAULTS.swell), 0, 100) / 100) * MAX_SWELL,
      );
      gl.uniform1f(
        u.reach,
        (clamp(num(this.settings.reach, DEFAULTS.reach), 5, 100) / 100) * scale,
      );
      gl.uniform2f(
        u.pointer,
        this.pointer.x * aspect * scale - 0.42 * raised * 0.55,
        (1 - this.pointer.y) * scale - 0.9075 * raised * 0.55,
      );
      gl.uniform1f(u.pointerAmount, pointerAmount);
      gl.uniform1f(
        u.grain,
        (clamp(num(this.settings.grain, DEFAULTS.grain), 0, 100) / 100) * 0.09,
      );
      gl.uniform1f(
        u.vignette,
        clamp(num(this.settings.vignette, DEFAULTS.vignette), 0, 100) / 100,
      );

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    destroy() {
      if (this.destroyed) return;
      this.destroyed = true;

      cancelAnimationFrame(this.raf);
      this.resizeObserver?.disconnect();
      this.canvas.removeEventListener('pointermove', this.handlePointerMove);
      this.canvas.removeEventListener('pointerenter', this.handlePointerMove);
      this.canvas.removeEventListener('pointerleave', this.handlePointerLeave);
      window.removeEventListener('blur', this.handlePointerLeave);

      if (this.gl) {
        this.gl.deleteBuffer(this.positionBuffer);
        this.gl.deleteProgram(this.program);
      }

      instances.delete(this.canvas);
    }

    static get(canvas) {
      return instances.get(canvas) || null;
    }

    static initAll(root = document) {
      return Array.from(root.querySelectorAll('canvas[data-hex-comb]'), (canvas) => (
        HexComb.get(canvas) || new HexComb(canvas)
      ));
    }
  }

  function setupDemo() {
    const canvas = document.querySelector('#hexComb');
    const controls = document.querySelector('.controls');
    const resetButton = document.querySelector('#resetButton');
    const markupField = document.querySelector('#canvasMarkup');
    const copyButton = document.querySelector('#copyCanvasButton');

    if (!(canvas instanceof HTMLCanvasElement)) return;

    const component = HexComb.get(canvas) || new HexComb(canvas);
    window.hexComb = component;

    if (!controls || !component.gl) return;

    const syncControl = (setting, value) => {
      const input = controls.querySelector(`[data-setting="${setting}"]`);
      const output = controls.querySelector(`[data-value-for="${setting}"]`);
      if (!input) return;

      input.value = value;
      if (output) {
        output.value = typeof value === 'string' && value.startsWith('#')
          ? value.toUpperCase()
          : String(value);
      }
    };

    const syncMarkup = () => {
      if (markupField) markupField.value = component.toCanvasMarkup();
    };

    const syncAllControls = () => {
      for (const [setting, value] of Object.entries(component.settings)) {
        syncControl(setting, value);
      }
      syncMarkup();
    };

    controls.addEventListener('input', (event) => {
      const input = event.target.closest('[data-setting]');
      if (!input) return;

      const setting = input.dataset.setting;
      const value = input.type === 'range' ? Number(input.value) : input.value.toUpperCase();
      component.setSetting(setting, value);
      syncControl(setting, value);
      syncMarkup();
    });

    resetButton?.addEventListener('click', () => {
      component.reset();
      syncAllControls();
    });

    copyButton?.addEventListener('click', async () => {
      const text = component.toCanvasMarkup();
      if (markupField) markupField.value = text;

      try {
        await navigator.clipboard.writeText(text);
      } catch {
        markupField?.focus();
        markupField?.select();
        document.execCommand('copy');
      }

      const original = copyButton.textContent;
      copyButton.textContent = 'Copied';
      window.setTimeout(() => {
        copyButton.textContent = original;
      }, 1200);
    });

    syncAllControls();
  }

  function boot() {
    HexComb.initAll();
    setupDemo();
  }

  window.HexComb = HexComb;
  window.HEX_COMB_DEFAULTS = DEFAULTS;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
