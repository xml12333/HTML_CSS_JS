"use strict";
//////// SETUP
const settings = [
    [32, 64, 0.02, 0.67],
    [64, 64, 0.02, 0.67],
    [128, 64, 0.01, 0.33], // 2
];
// settings index
const S = 1;
const side = settings[S][0];
const height = settings[S][1];
const scale = settings[S][2];
const y_offset = settings[S][3];
// total number of cubes
const N = side * side * height;
// texture side
const t_side = Math.sqrt(N);
// grid (of chunks on texture) side
const g_side = t_side / side;
// half side
const h_side = side / 2;
// coordinate of last chunk (life chunk)
const l_chunk = t_side - side;
//////// PREPARE WEBGL CONTEXT
const gl = (() => {
    const dpr = Math.min(2, devicePixelRatio);
    let c_side = Math.max(innerWidth, innerHeight);
    c_side = Math.max(c_side * dpr, t_side);
    canvas.width = c_side;
    canvas.height = c_side;
    return canvas.getContext("webgl2", {
        preserveDrawingBuffer: true,
        alpha: false,
    });
})();
gl.enable(gl.DEPTH_TEST);
gl.clearColor(0.067, 0.067, 0.067, 1);
//////// ATTRIBUTES
// indices
var A;
(function (A) {
    A[A["QUAD"] = 0] = "QUAD";
    A[A["ID"] = 1] = "ID";
    A[A["POS"] = 2] = "POS";
    A[A["IPOS"] = 3] = "IPOS";
    A[A["NORM"] = 4] = "NORM";
})(A || (A = {}));
{
    // quad from a triangle
    const quad = new Float32Array([
        -1, -3,
        3, 1,
        -1, 1,
    ]);
    set_attrib(quad, [A.QUAD, 2]);
    // cube data -> pos, norm
    const cube = new Float32Array([
        // face, face, normal
        [0, 0, 0, 1, 0, 0, 1, 1, 0,
            1, 1, 0, 0, 1, 0, 0, 0, 0,
            0, 0, -1],
        [1, 0, 0, 1, 0, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 0, 1, 0, 0,
            1, 0, 0],
        [1, 0, 1, 0, 0, 1, 0, 1, 1,
            0, 1, 1, 1, 1, 1, 1, 0, 1,
            0, 0, 1],
        [0, 0, 1, 0, 0, 0, 0, 1, 0,
            0, 1, 0, 0, 1, 1, 0, 0, 1,
            -1, 0, 0],
        [1, 1, 0, 1, 1, 1, 0, 1, 1,
            0, 1, 1, 0, 1, 0, 1, 1, 0,
            0, 1, 0],
    ].reduce((arr, e) => {
        const n = e.slice(18), data = [];
        for (let i = 0; i < 18; i += 3) {
            e[i + 0] -= 0.5;
            e[i + 1] -= 0.5;
            e[i + 2] -= 0.5;
            data.push(e[i], e[i + 1], e[i + 2], ...n);
        }
        return arr.concat(data);
    }, []));
    set_attrib(cube, [A.POS, 3], [A.NORM, 3]);
    // instanced cubes data -> ipos, id
    const icubes = new ArrayBuffer(N * 6 * 4);
    for (let i = 0; i < N; i++) {
        const x = i % side;
        const z = (i / t_side | 0) % side;
        const y = (() => {
            // grid id — coord of chunk on texture
            const x = (i % t_side) / side | 0;
            const y = i / (t_side * side) | 0;
            return y * g_side + x;
        })();
        const o = i * 6 * 4;
        const ipos = new Float32Array(icubes, o, 3);
        ipos[0] = x - h_side;
        ipos[1] = y - height;
        ipos[2] = h_side - z;
        const id = new Int32Array(icubes, o + 12, 3);
        id[0] = x;
        id[1] = y;
        id[2] = z;
    }
    set_attrib(icubes, [A.IPOS, 3, 1], [A.ID, 3, 1, true]);
}
//////// MESH PROGRAM
const mesh = (() => {
    const vert = /*glsl*/ `#version 300 es
  layout(location=${A.ID})   in ivec3 id;
  layout(location=${A.POS})  in vec3 pos;
  layout(location=${A.IPOS}) in vec3 ipos;
  layout(location=${A.NORM}) in vec3 norm;

  uniform mat4 proj;
  uniform mat4 wmat;
  uniform mat4 rmat;
  uniform sampler2D map;

  out vec3 color;

  void main() {
  
    ivec2 uv = id.xz;
    uv.x += (id.y % ${g_side}) * ${side};
    uv.y += (id.y / ${g_side}) * ${side};

    float is_alive = texelFetch(map, uv, 0).r;
    vec4 p = rmat * vec4((pos + ipos) * is_alive, 1);

    // AO, SELF SHADOW

    // height
    float h = float(id.y) / ${height}.0;

    // length from far corner
    float l = length(vec2(-${h_side}, ${h_side}) - p.xz);
    l = min(1.0, l / ${side}.0);
    l *= l;
    l = mix(1.0, l, sqrt(1.0 - h) - 0.1);

    // radius from center
    float r = length(vec2(id.xz) / ${side}.0 - 0.5);
    r = min(1.0, r * 2.0);
    r = mix(1.0, r, sqrt(1.0 - h) - 0.1);

    h = mix(h, 1.0, (l + h) / 5.0);

    color = vec3(l * r * sqrt(h));
    color *= color;
    color = 0.087 + color * (1.0 - 0.087);

    // LIGHT

    vec3 n = mat3(rmat) * norm;
    vec3 light_dir = normalize(vec3(1, 3, -2));
    float diff = max(dot(n, light_dir), 0.0);
    color *= sqrt(0.67 + diff * 0.33);

    gl_Position = proj * wmat * vec4(p.xyz * ${scale}, 1);
  }`;
    const frag = /*glsl*/ `#version 300 es
  precision highp float;
  in vec3 color;
  out vec3 Color;
  void main() {
    Color = color;
  }`;
    const pr = new_program(vert, frag);
    gl.useProgram(pr);
    gl.uniformMatrix4fv(uloc(pr, "proj"), !1, ortho_proj());
    gl.uniform1i(uloc(pr, "map"), 0);
    return pr;
})();
const wmat = new_mat();
rot_x(wmat, -Math.PI / 4 + 0.17);
rot_y(wmat, Math.PI / 4);
mov_y(wmat, -y_offset);
const wmat_loc = uloc(mesh, "wmat");
gl.uniformMatrix4fv(wmat_loc, false, wmat);
const rmat = new_mat();
const rmat_loc = uloc(mesh, "rmat");
//////// LIFE PROGRAM
const life = (() => {
    const vert = /*glsl*/ `#version 300 es
  layout(location=${A.QUAD}) in vec2 pos;
  void main() {
    gl_Position = vec4(pos, 0, 1);
  }`;
    const frag = /*glsl*/ `#version 300 es
  precision highp float;
  uniform sampler2D map;
  uniform float time;
  out float Color;

  float cell(ivec2 p) {
    // life evolves at the last chunk
    p = ivec2(${l_chunk}) + (p + ${side}) % ${side};
    return texelFetch(map, p, 0).r;
  }

  float hash(float x) {
    return fract(sin(x) * 138.5453123);
  }

  float random() {
    float v = hash(gl_FragCoord.y - time);
    v = hash(gl_FragCoord.x + time * v);
    return step(0.957, v);
  }

  void main() {
    ivec2 pos = ivec2(gl_FragCoord.xy);
    float self = cell(pos);

    int sum = 0;
    for (int x = -1; x < 2; x++) {
      for (int y = -1; y < 2; y++) {
        sum += int(cell(pos + ivec2(x, y)));
      }
    }

    // rules of the game of life, slightly modified
    float is_alive =
      sum == 3 ? 1.0      :
      sum == 2 ? self     :
      sum == 1 ? random() :
                 0.0;

    // life evolves at the last chunk
    // so, copy cell from the next chunk in texture
    int x = (pos.x + ${side} + ${t_side}) % ${t_side};
    int y = x < ${side} ? pos.y + ${side} : pos.y;
    float copy_cell = texelFetch(map, ivec2(x, y), 0).r;

    // if it is the last chunk, write life
    if (pos.x > ${l_chunk} && pos.y > ${l_chunk}) {
      Color = is_alive;
    }
    // else copy the next chunk
    else {
      Color = copy_cell;
    }
  }`;
    const pr = new_program(vert, frag);
    gl.useProgram(pr);
    gl.uniform1i(uloc(pr, "map"), 0);
    return pr;
})();
const time_loc = uloc(life, "time");
//////// LIFE TARGET
const life_wrt = (() => {
    const data = new Uint8Array(N);
    // pollute the last chunk
    for (let y = l_chunk; y < t_side; y++) {
        for (let x = l_chunk; x < t_side; x++) {
            data[y * t_side + x] = (Math.random() * 1.25 | 0) * 255;
        }
    }
    return new_wrt(t_side, t_side, data);
})();
//////// RENDER
let i = 0; // render counter
requestAnimationFrame(render);
function render() {
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    // mesh
    gl.useProgram(mesh);
    if (i++ < height) {
        mov_y(wmat, scale);
        gl.uniformMatrix4fv(wmat_loc, false, wmat);
    }
    rot_y(rmat, Math.PI / 128);
    gl.uniformMatrix4fv(rmat_loc, false, rmat);
    gl.bindTexture(gl.TEXTURE_2D, life_wrt.txt);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 30, N);
    // life
    life_wrt.bind();
    gl.useProgram(life);
    gl.bindTexture(gl.TEXTURE_2D, life_wrt.txt);
    const time = performance.now() * 1e-3 % 99.73;
    gl.uniform1f(time_loc, time);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    life_wrt.unbind();
    life_wrt.swap();
    setTimeout(() => {
        requestAnimationFrame(render);
    }, 30);
}
//////// GL HELPERS
function new_program(vert, frag) {
    const pr = gl.createProgram();
    gl.attachShader(pr, new_shader(gl.VERTEX_SHADER, vert));
    gl.attachShader(pr, new_shader(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(pr);
    return pr;
}
function new_shader(type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return shader;
}
function uloc(pr, name) {
    return gl.getUniformLocation(pr, name);
}
function set_attrib(data, ...attrs) {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // l - byteLength (stride)
    const l = attrs.reduce((l, [_, s]) => l + s * 4, 0);
    // o - offset
    let o = 0;
    for (const [i, s, d, INT] of attrs) {
        INT
            ? gl.vertexAttribIPointer(i, s, gl.INT, l, o)
            : gl.vertexAttribPointer(i, s, gl.FLOAT, !1, l, o);
        d && gl.vertexAttribDivisor(i, d);
        gl.enableVertexAttribArray(i);
        o += s * 4;
    }
}
function new_rt(w, h, src) {
    const txt = gl.createTexture();
    const T2D = gl.TEXTURE_2D;
    gl.bindTexture(T2D, txt);
    gl.texParameteri(T2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(T2D, 0, gl.R8, w, h, 0, gl.RED, gl.UNSIGNED_BYTE, src);
    const buf = gl.createFramebuffer();
    const FBO = gl.FRAMEBUFFER;
    gl.bindFramebuffer(FBO, buf);
    gl.framebufferTexture2D(FBO, gl.COLOR_ATTACHMENT0, T2D, txt, 0);
    gl.bindFramebuffer(FBO, null);
    return {
        bind() { gl.bindFramebuffer(FBO, buf); },
        unbind() { gl.bindFramebuffer(FBO, null); },
        get txt() { return txt; },
    };
}
function new_wrt(w, h, src) {
    let read = new_rt(w, h, src);
    let write = new_rt(w, h, null);
    return {
        swap() { [write, read] = [read, write]; },
        bind() { write.bind(); },
        unbind() { write.unbind(); },
        get txt() { return read.txt; },
    };
}
//////// MATRIX
function new_mat() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ]);
}
function mov_y(m, y) {
    m[12] += y * m[4];
    m[13] += y * m[5];
    m[14] += y * m[6];
}
function rot_x(m, a) {
    const c = Math.cos(a), s = Math.sin(a), m4 = m[4], m5 = m[5], m6 = m[6], m8 = m[8], m9 = m[9], ma = m[10];
    m[4] = c * m4 + s * m8;
    m[5] = c * m5 + s * m9;
    m[6] = c * m6 + s * ma;
    m[8] = c * m8 - s * m4;
    m[9] = c * m9 - s * m5;
    m[10] = c * ma - s * m6;
}
function rot_y(m, a) {
    const c = Math.cos(a), s = Math.sin(a), m0 = m[0], m1 = m[1], m2 = m[2], m8 = m[8], m9 = m[9], ma = m[10];
    m[0] = c * m0 - s * m8;
    m[1] = c * m1 - s * m9;
    m[2] = c * m2 - s * ma;
    m[8] = c * m8 + s * m0;
    m[9] = c * m9 + s * m1;
    m[10] = c * ma + s * m2;
}
function ortho_proj(left = -1, right = 1, bottom = -1, top = 1, near = -2, far = 2) {
    const m = new_mat();
    m[0] = 2 / (right - left);
    m[5] = 2 / (top - bottom);
    m[10] = 2 / (far - near);
    m[12] = -(right + left) / (right - left);
    m[13] = -(top + bottom) / (top - bottom);
    m[14] = -(far + near) / (far - near);
    return m;
}