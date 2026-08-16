"use strict";
// Loading Orb — a glassy, slowly-deforming blob with swirling liquid inside,
// a glow that stays OUTSIDE the silhouette, animated preset thumbnails on the
// left, and a dat.gui panel for live tweaking.
const canvas = document.getElementById("orb");
const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
if (!gl) {
    const msg = document.createElement("p");
    msg.textContent = "This demo needs WebGL2.";
    msg.style.cssText = "color:#fcc;font:16px monospace;padding:2rem";
    document.body.appendChild(msg);
    throw new Error("WebGL2 not supported");
}
// ---------------------------------------------------------------------------
// Live values (bound to dat.gui). Start as a copy of the first preset.
// ---------------------------------------------------------------------------
const params = {
    radius: 0.30,
    deform: 0.36,
    frequency: 1.0,
    morphSpeed: 0.30,
    rotSpeed: 0.12,
    specular: 1.0,
    shininess: 140,
    glowStrength: 0.70,
    colorBlue: "#4099FF",
    colorMagenta: "#E633BF",
    glowA: "#33B5FF",
    glowB: "#E24DD0",
    liquidSpeed: 0.50,
    liquidScale: 2.20,
    liquidBright: 1.00,
    filament: 1.40,
    core: 0.30,
    background: "#070A18",
    blend: "Auto", // "Auto" | "Glow" (additive) | "Ink" (works on light bg)
};
const PRESETS = [
    { name: "Aurora", values: { radius: 0.30, deform: 0.36, frequency: 2.0, morphSpeed: 1.30, rotSpeed: 0.12, specular: 1.0, shininess: 140, glowStrength: 0.70, colorBlue: "#4099FF", colorMagenta: "#E633BF", glowA: "#33B5FF", glowB: "#E24DD0", liquidSpeed: 0.50, liquidScale: 2.20, liquidBright: 1.00, filament: 1.40, core: 0.30, background: "#070A18" } },
    { name: "Ember", values: { radius: 0.32, deform: 0.30, frequency: 2.1, morphSpeed: 1.40, rotSpeed: 0.10, specular: 1.2, shininess: 120, glowStrength: 0.85, colorBlue: "#FFC24D", colorMagenta: "#FF3B2F", glowA: "#FF7A18", glowB: "#FF2D55", liquidSpeed: 0.75, liquidScale: 2.40, liquidBright: 1.10, filament: 1.90, core: 0.40, background: "#160806" } },
    { name: "Toxic", values: { radius: 0.28, deform: 0.44, frequency: 2.3, morphSpeed: 1.50, rotSpeed: 0.18, specular: 1.0, shininess: 160, glowStrength: 0.75, colorBlue: "#9CFF4D", colorMagenta: "#00E5A0", glowA: "#57FF3C", glowB: "#00FFC8", liquidSpeed: 0.85, liquidScale: 2.60, liquidBright: 1.00, filament: 1.70, core: 0.25, background: "#04120C" } },
    { name: "Ice", values: { radius: 0.34, deform: 0.20, frequency: 1.8, morphSpeed: 1.18, rotSpeed: 0.08, specular: 1.5, shininess: 210, glowStrength: 0.60, colorBlue: "#9CE3FF", colorMagenta: "#E6F7FF", glowA: "#6FD2FF", glowB: "#BFEFFF", liquidSpeed: 0.32, liquidScale: 2.00, liquidBright: 0.90, filament: 1.00, core: 0.35, background: "#0A1424" } },
    { name: "Plasma", values: { radius: 0.28, deform: 0.40, frequency: 2.4, morphSpeed: 1.60, rotSpeed: 0.20, specular: 1.0, shininess: 130, glowStrength: 0.95, colorBlue: "#B14DFF", colorMagenta: "#FF2DA0", glowA: "#9B5CFF", glowB: "#FF3DBE", liquidSpeed: 1.00, liquidScale: 2.80, liquidBright: 1.20, filament: 2.10, core: 0.30, background: "#10061C" } },
    { name: "Ghost", values: { radius: 0.32, deform: 0.30, frequency: 2.0, morphSpeed: 1.25, rotSpeed: 0.10, specular: 1.6, shininess: 220, glowStrength: 0.55, colorBlue: "#C2CBE6", colorMagenta: "#8893B5", glowA: "#AEB8D8", glowB: "#6E7799", liquidSpeed: 0.45, liquidScale: 2.20, liquidBright: 0.85, filament: 1.20, core: 0.20, background: "#070709" } },
    { name: "Daylight", values: { radius: 0.30, deform: 0.34, frequency: 2.0, morphSpeed: 1.30, rotSpeed: 0.12, specular: 1.0, shininess: 150, glowStrength: 0.80, colorBlue: "#2D6CFF", colorMagenta: "#B43CF0", glowA: "#3A82FF", glowB: "#A84DFF", liquidSpeed: 0.50, liquidScale: 2.20, liquidBright: 1.05, filament: 1.50, core: 0.30, background: "#EEF2F8" } },
];
// ---------------------------------------------------------------------------
// Shaders
// ---------------------------------------------------------------------------
const VERT = `#version 300 es
layout(location=0) in vec2 a_pos;
out vec2 v_uv;
void main(){ v_uv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }`;
const FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2  u_res;
uniform float u_radius;
uniform float u_deform;
uniform float u_freq;
uniform float u_morphSpeed;
uniform float u_rotSpeed;
uniform float u_specular;
uniform float u_shininess;
uniform float u_glowStrength;
uniform vec3  u_colBlue;
uniform vec3  u_colMag;
uniform vec3  u_glowA;
uniform vec3  u_glowB;
uniform float u_liquidSpeed;
uniform float u_liquidScale;
uniform float u_liquidBright;
uniform float u_filament;
uniform float u_core;
uniform vec3  u_bg;
uniform float u_blend;   // 0 = additive glow, 1 = ink (works on light backgrounds)

mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

// organic blob: a sphere whose radius is modulated by slow drifting sine lobes
float blobField(vec3 p){
  float t = u_time * u_morphSpeed;
  float f = u_freq;
  float d = 0.0;
  d += sin(p.x * 2.6 * f + t * 1.00);
  d += sin(p.y * 2.9 * f - t * 0.80 + 1.3);
  d += sin(p.z * 3.2 * f + t * 1.20 + 2.7);
  d += sin((p.x + p.z) * 2.2 * f - t * 0.90 + 4.1);
  d += sin((p.y - p.x) * 2.4 * f + t * 0.70 + 0.6);
  return d * 0.2;
}

float mapBlob(vec3 p){
  float t = u_time * u_rotSpeed;
  p.xy *= rot(t * 0.7);
  p.yz *= rot(t * 0.5);
  float r = u_radius + u_deform * blobField(p);
  return length(p) - r;              // approx SDF; under-step while marching
}

vec3 calcNormal(vec3 p){
  vec2 e = vec2(0.0015, 0.0);
  return normalize(vec3(
    mapBlob(p + e.xyy) - mapBlob(p - e.xyy),
    mapBlob(p + e.yxy) - mapBlob(p - e.yxy),
    mapBlob(p + e.yyx) - mapBlob(p - e.yyx)));
}

// 3D noise for the swirling liquid inside the glass
float hash13(vec3 p3){ p3 = fract(p3 * 0.1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }
float vnoise3(vec3 p){
  vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash13(i + vec3(0,0,0)), hash13(i + vec3(1,0,0)), f.x),
                 mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x),
                 mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm3(vec3 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 3; i++){ v += a * vnoise3(p); p *= 2.03; a *= 0.5; } return v; }

// domain-warped 3D field -> flowing liquid filaments
float liquid(vec3 p){
  float t = u_time * u_liquidSpeed;
  p *= u_liquidScale;
  p.xy *= rot(t * 0.15);
  p.yz *= rot(t * 0.10);
  vec3 w = vec3(fbm3(p + t * 0.2), fbm3(p + vec3(4.3, 1.2, -t * 0.15)), fbm3(p.zxy + vec3(7.7, 2.3, t * 0.10)));
  return fbm3(p + 1.8 * w);
}

void main(){
  vec2 p = v_uv * 2.0 - 1.0;
  p.x *= u_res.x / u_res.y;

  vec3 ro = vec3(0.0, 0.0, 3.0);
  vec3 rd = normalize(vec3(p, -1.8));

  // raymarch; track closest approach so the glow stays OUTSIDE the orb
  float t = 0.0;
  bool hit = false;
  vec3 pos = ro;
  float minD = 1e3;
  for (int i = 0; i < 160; i++) {
    pos = ro + rd * t;
    float d = mapBlob(pos);
    minD = min(minD, d);
    if (d < 0.001) { hit = true; break; }
    t += d * 0.40;
    if (t > 6.0) break;
  }

  vec3 E = vec3(0.0);   // emissive light the orb contributes

  if (hit) {
    vec3 n = calcNormal(pos);
    vec3 v = -rd;
    float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);

    // liquid interior: short volumetric march of swirling noise through the glass
    vec3 rp = pos + rd * 0.04;
    float trans = 1.0;
    vec3 inner = vec3(0.0);
    for (int k = 0; k < 10; k++) {
      float raw = liquid(rp);
      float dens = smoothstep(0.30, 0.70, raw);             // contrast -> distinct swirls
      float fil = pow(1.0 - abs(2.0 * raw - 1.0), 5.0);     // thin bright filaments
      vec3 c = mix(u_colMag, u_colBlue, 0.5 + 0.5 * sin(raw * 6.0 + u_time * 0.3 + rp.y * 2.5));
      vec3 emit = c * dens * 0.55 + c * fil * u_filament + vec3(1.0) * pow(fil, 3.0) * u_filament * 0.4;
      emit += u_colBlue * smoothstep(0.5, 0.0, length(rp)) * u_core;   // bright bluish core
      inner += trans * emit * 0.17;
      trans *= 0.84;
      rp += rd * 0.11;
      if (length(rp) > 1.0) break;
    }
    E += inner * (1.0 - fres * 0.6) * u_liquidBright;       // fades toward the rim

    // glassy rim + specular glints (front surface)
    vec3 rim = mix(u_colMag, u_colBlue, 0.5 + 0.5 * (n.x * 0.7 + n.y * 0.45));
    E += rim * fres * 1.3;
    vec3 l1 = normalize(vec3(0.6, 0.85, 0.6));
    vec3 l2 = normalize(vec3(-0.7, 0.25, 0.55));
    vec3 h1 = normalize(l1 + v);
    vec3 h2 = normalize(l2 + v);
    E += vec3(1.0) * pow(max(dot(n, h1), 0.0), u_shininess) * 1.3 * u_specular;
    E += vec3(0.8, 0.9, 1.0) * pow(max(dot(n, h2), 0.0), u_shininess * 0.45) * 0.6 * u_specular;
  } else {
    // glow ONLY outside: brightest at the silhouette, radiating outward
    float g = exp(-minD * 5.5);
    float ang = atan(rd.y, rd.x);
    vec3 gc = mix(u_glowA, u_glowB, 0.5 + 0.5 * sin(ang * 3.0 + u_time * 0.5));
    E += (gc * g * 1.4 + vec3(0.6, 0.8, 1.0) * pow(g, 3.0) * 0.7) * u_glowStrength;
  }

  // composite over the background:
  //  • Glow (additive)  — bright on dark backgrounds
  //  • Ink  ("over" with a tone-mapped colour) — stays visible on light ones
  vec3 glowCol = u_bg + E;
  float cov = clamp(max(E.r, max(E.g, E.b)), 0.0, 1.0);
  vec3 inkCol = mix(u_bg, E / (1.0 + E), cov);
  vec3 col = mix(glowCol, inkCol, u_blend);

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;
// ---------------------------------------------------------------------------
// WebGL plumbing
// ---------------------------------------------------------------------------
function compile(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(sh) || "shader compile failed");
    }
    return sh;
}
const program = gl.createProgram();
gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || "link failed");
}
gl.useProgram(program);
// fullscreen triangle-strip quad
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
gl.clearColor(5 / 255, 6 / 255, 10 / 255, 1.0);
// uniform locations
const U = {
    time: gl.getUniformLocation(program, "u_time"),
    res: gl.getUniformLocation(program, "u_res"),
    radius: gl.getUniformLocation(program, "u_radius"),
    deform: gl.getUniformLocation(program, "u_deform"),
    freq: gl.getUniformLocation(program, "u_freq"),
    morphSpeed: gl.getUniformLocation(program, "u_morphSpeed"),
    rotSpeed: gl.getUniformLocation(program, "u_rotSpeed"),
    specular: gl.getUniformLocation(program, "u_specular"),
    shininess: gl.getUniformLocation(program, "u_shininess"),
    glowStrength: gl.getUniformLocation(program, "u_glowStrength"),
    colBlue: gl.getUniformLocation(program, "u_colBlue"),
    colMag: gl.getUniformLocation(program, "u_colMag"),
    glowA: gl.getUniformLocation(program, "u_glowA"),
    glowB: gl.getUniformLocation(program, "u_glowB"),
    liquidSpeed: gl.getUniformLocation(program, "u_liquidSpeed"),
    liquidScale: gl.getUniformLocation(program, "u_liquidScale"),
    liquidBright: gl.getUniformLocation(program, "u_liquidBright"),
    filament: gl.getUniformLocation(program, "u_filament"),
    core: gl.getUniformLocation(program, "u_core"),
    bg: gl.getUniformLocation(program, "u_bg"),
    blend: gl.getUniformLocation(program, "u_blend"),
};
function hexToRgb(hex) {
    let h = hex.replace("#", "");
    if (h.length === 3)
        h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
function luminance(hex) {
    const [r, g, b] = hexToRgb(hex);
    return 0.299 * r + 0.587 * g + 0.114 * b;
}
// 0 = additive glow, 1 = ink; "Auto" picks by background luminance (per region)
function blendFor(v) {
    if (params.blend === "Glow")
        return 0;
    if (params.blend === "Ink")
        return 1;
    return Math.min(Math.max((luminance(v.background) - 0.35) / 0.30, 0), 1);
}
// keep the page background and the light/dark chrome theme in sync with the orb.
// --page-bg also drives the corner-mask box-shadow on the preset thumbnails.
function syncChrome() {
    document.body.style.background = params.background;
    document.body.style.setProperty("--page-bg", params.background);
    document.body.classList.toggle("light-bg", luminance(params.background) > 0.5);
}
// draw the orb (from a values object `v`) into one scissor region of the canvas
function drawOrb(x, y, w, h, v, time) {
    gl.viewport(x, y, w, h);
    gl.scissor(x, y, w, h);
    gl.uniform1f(U.time, time);
    gl.uniform2f(U.res, w, h);
    gl.uniform1f(U.radius, v.radius);
    gl.uniform1f(U.deform, v.deform);
    gl.uniform1f(U.freq, v.frequency);
    gl.uniform1f(U.morphSpeed, v.morphSpeed);
    gl.uniform1f(U.rotSpeed, v.rotSpeed);
    gl.uniform1f(U.specular, v.specular);
    gl.uniform1f(U.shininess, v.shininess);
    gl.uniform1f(U.glowStrength, v.glowStrength);
    gl.uniform3fv(U.colBlue, hexToRgb(v.colorBlue));
    gl.uniform3fv(U.colMag, hexToRgb(v.colorMagenta));
    gl.uniform3fv(U.glowA, hexToRgb(v.glowA));
    gl.uniform3fv(U.glowB, hexToRgb(v.glowB));
    gl.uniform1f(U.liquidSpeed, v.liquidSpeed);
    gl.uniform1f(U.liquidScale, v.liquidScale);
    gl.uniform1f(U.liquidBright, v.liquidBright);
    gl.uniform1f(U.filament, v.filament);
    gl.uniform1f(U.core, v.core);
    gl.uniform3fv(U.bg, hexToRgb(v.background));
    gl.uniform1f(U.blend, blendFor(v));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
// ---------------------------------------------------------------------------
// dat.gui control panel
// ---------------------------------------------------------------------------
const gui = new dat.GUI({ width: 300 });
const controllers = [];
const shape = gui.addFolder("Shape");
controllers.push(shape.add(params, "radius", 0.2, 0.40, 0.01).name("size"));
controllers.push(shape.add(params, "deform", 0.00, 0.8, 0.01).name("deformation"));
controllers.push(shape.add(params, "frequency", 0.40, 3.00, 0.05).name("lobes"));
controllers.push(shape.add(params, "morphSpeed", 0.00, 2.00, 0.01).name("morph speed"));
controllers.push(shape.add(params, "rotSpeed", 0.00, 0.60, 0.01).name("rotation"));
shape.open();
const colors = gui.addFolder("Colors");
controllers.push(colors.addColor(params, "background").name("background").onChange(syncChrome));
controllers.push(colors.add(params, "blend", ["Auto", "Glow", "Ink"]).name("blend mode"));
controllers.push(colors.addColor(params, "colorBlue").name("rim A"));
controllers.push(colors.addColor(params, "colorMagenta").name("rim B"));
controllers.push(colors.addColor(params, "glowA").name("glow A"));
controllers.push(colors.addColor(params, "glowB").name("glow B"));
colors.open();
const light = gui.addFolder("Lighting");
controllers.push(light.add(params, "specular", 0.00, 3.00, 0.05).name("specular"));
controllers.push(light.add(params, "shininess", 20, 300, 1).name("glint size"));
controllers.push(light.add(params, "glowStrength", 0.00, 1.50, 0.05).name("glow"));
light.open();
const liquidF = gui.addFolder("Liquid");
controllers.push(liquidF.add(params, "liquidSpeed", 0.00, 2.00, 0.01).name("flow speed"));
controllers.push(liquidF.add(params, "liquidScale", 1.00, 4.00, 0.05).name("swirl scale"));
controllers.push(liquidF.add(params, "liquidBright", 0.00, 2.50, 0.05).name("brightness"));
controllers.push(liquidF.add(params, "filament", 0.00, 3.00, 0.05).name("filaments"));
controllers.push(liquidF.add(params, "core", 0.00, 1.00, 0.02).name("core glow"));
liquidF.open();
if (window.innerWidth < 1000) {
    gui.close();
}
// ---------------------------------------------------------------------------
// Preset thumbnails (left column)
// ---------------------------------------------------------------------------
const presetsContainer = document.getElementById("presets");
const presetEls = [];
const previews = [];
function applyPreset(i) {
    Object.assign(params, PRESETS[i].values);
    controllers.forEach((c) => c.updateDisplay());
    syncChrome();
    presetEls.forEach((el, idx) => el.classList.toggle("is-active", idx === i));
}
PRESETS.forEach((preset, i) => {
    const wrap = document.createElement("div");
    wrap.className = "preset";
    wrap.title = preset.name;
    const thumb = document.createElement("div");
    thumb.className = "preset__thumb";
    const name = document.createElement("div");
    name.className = "preset__name";
    name.textContent = preset.name;
    wrap.append(thumb, name);
    wrap.addEventListener("click", () => applyPreset(i));
    presetsContainer.append(wrap);
    presetEls.push(wrap);
    previews.push({ el: thumb, values: preset.values });
});
applyPreset(0); // start on the first preset (matches the defaults)
// ---------------------------------------------------------------------------
// Resize + render loop
// ---------------------------------------------------------------------------
const MAX_MAIN = 1000; // device-px cap for the main orb (raise for sharper output)
let dpr = 1;
function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
    }
}
window.addEventListener("resize", resize);
resize();
function frame(now) {
    resize();
    const time = now * 0.001;
    const bg = hexToRgb(params.background); // gaps around the orbs use the main background
    gl.clearColor(bg[0], bg[1], bg[2], 1.0);
    gl.disable(gl.SCISSOR_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.SCISSOR_TEST);
    // main orb — centred square, capped resolution
    const side = Math.min(Math.min(canvas.width, canvas.height), MAX_MAIN);
    drawOrb(Math.floor((canvas.width - side) / 2), Math.floor((canvas.height - side) / 2), side, side, params, time);
    // animated preset previews (each shows its own settings)
    for (const pv of previews) {
        const r = pv.el.getBoundingClientRect();
        if (r.width <= 0 || r.bottom <= 0 || r.top >= window.innerHeight)
            continue;
        const x = Math.floor(r.left * dpr);
        const y = Math.floor((window.innerHeight - r.bottom) * dpr);
        const w = Math.ceil(r.width * dpr);
        const h = Math.ceil(r.height * dpr);
        drawOrb(x, y, w, h, pv.values, time);
    }
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);