/*
Shadertoy: Seascape
https://www.shadertoy.com/view/Ms2SD1
*/

const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");
if (!gl) {
	console.error("WebGL 2 not supported");
	document.body.innerHTML = "WebGL 2 is not supported in your browser.";
}

// Default shader parameters
const DEFAULT_SHADER_PARAMS = {
	CAMERA_SPEED: 1.0,
	MOUSE_SENSITIVITY: 0.1,
	NUM_STEPS: 32,
	ITER_GEOMETRY: 1,
	ITER_FRAGMENT: 5,
	SEA_HEIGHT: 0.6,
	SEA_CHOPPY: 4.0,
	SEA_SPEED: 0.8,
	SEA_FREQ: 0.16
};

let shaderParams = { ...DEFAULT_SHADER_PARAMS };

const vertexShaderSource = `#version 300 es
in vec4 aPosition;
void main() {
    gl_Position = aPosition;
}`;

const fragmentShaderSource = `#version 300 es
precision highp float;

uniform vec3 iResolution;
uniform float iTime;
uniform vec4 iMouse;
uniform int uNumSteps;
uniform int uGeometryIter;
uniform int uFragmentIter;
uniform float uSeaHeight;
uniform float uSeaChoppy;
uniform float uSeaSpeed;
uniform float uSeaFreq;
uniform float uCameraSpeed;  
uniform float uMouseSensitivity;
out vec4 fragColor;

/*--- BEGIN OF SHADERTOY ---*/

/*
 * "Seascape" by Alexander Alekseev aka TDM - 2014
 * License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
 * Contact: tdmaav@gmail.com
 */

const float PI	 	= 3.141592;
const float EPSILON	= 1e-3;
#define EPSILON_NRM (0.1 / iResolution.x)
//#define AA

// sea
const vec3 SEA_BASE = vec3(0.0,0.09,0.18);
const vec3 SEA_WATER_COLOR = vec3(0.8,0.9,0.6)*0.6;
#define SEA_TIME (1.0 + iTime * uSeaSpeed)
const mat2 octave_m = mat2(1.6,1.2,-1.2,1.6);

// math
mat3 fromEuler(vec3 ang) {
	vec2 a1 = vec2(sin(ang.x),cos(ang.x));
    vec2 a2 = vec2(sin(ang.y),cos(ang.y));
    vec2 a3 = vec2(sin(ang.z),cos(ang.z));
    mat3 m;
    m[0] = vec3(a1.y*a3.y+a1.x*a2.x*a3.x,a1.y*a2.x*a3.x+a3.y*a1.x,-a2.y*a3.x);
	m[1] = vec3(-a2.y*a1.x,a1.y*a2.y,a2.x);
	m[2] = vec3(a3.y*a1.x*a2.x+a1.y*a3.x,a1.x*a3.x-a1.y*a3.y*a2.x,a2.y*a3.y);
	return m;
}
float hash( vec2 p ) {
	float h = dot(p,vec2(127.1,311.7));	
    return fract(sin(h)*43758.5453123);
}
float noise( in vec2 p ) {
    vec2 i = floor( p );
    vec2 f = fract( p );	
	vec2 u = f*f*(3.0-2.0*f);
    return -1.0+2.0*mix( mix( hash( i + vec2(0.0,0.0) ), 
                     hash( i + vec2(1.0,0.0) ), u.x),
                mix( hash( i + vec2(0.0,1.0) ), 
                     hash( i + vec2(1.0,1.0) ), u.x), u.y);
}

// lighting
float diffuse(vec3 n,vec3 l,float p) {
    return pow(dot(n,l) * 0.4 + 0.6,p);
}
float specular(vec3 n,vec3 l,vec3 e,float s) {    
    float nrm = (s + 8.0) / (PI * 8.0);
    return pow(max(dot(reflect(e,n),l),0.0),s) * nrm;
}

// sky
vec3 getSkyColor(vec3 e) {
    e.y = (max(e.y,0.0)*0.8+0.2)*0.8;
    return vec3(pow(1.0-e.y,2.0), 1.0-e.y, 0.6+(1.0-e.y)*0.4) * 1.1;
}

// sea
float sea_octave(vec2 uv, float choppy) {
    uv += noise(uv);        
    vec2 wv = 1.0-abs(sin(uv));
    vec2 swv = abs(cos(uv));    
    wv = mix(wv,swv,wv);
    return pow(1.0-pow(wv.x * wv.y,0.65),choppy);
}

float map(vec3 p) {
    float freq = uSeaFreq;
    float amp = uSeaHeight;
    float choppy = uSeaChoppy;
    vec2 uv = p.xz; uv.x *= 0.75;
    
    float d, h = 0.0;    
    for(int i = 0; i < uGeometryIter; i++) {        
    	d = sea_octave((uv+SEA_TIME)*freq,choppy);
    	d += sea_octave((uv-SEA_TIME)*freq,choppy);
        h += d * amp;        
    	uv *= octave_m; freq *= 1.9; amp *= 0.22;
        choppy = mix(choppy,1.0,0.2);
    }
    return p.y - h;
}

float map_detailed(vec3 p) {
    float freq = uSeaFreq;
    float amp = uSeaHeight;
    float choppy = uSeaChoppy;
    vec2 uv = p.xz; uv.x *= 0.75;
    
    float d, h = 0.0;    
    for(int i = 0; i < uFragmentIter; i++) {        
    	d = sea_octave((uv+SEA_TIME)*freq,choppy);
    	d += sea_octave((uv-SEA_TIME)*freq,choppy);
        h += d * amp;        
    	uv *= octave_m; freq *= 1.9; amp *= 0.22;
        choppy = mix(choppy,1.0,0.2);
    }
    return p.y - h;
}

vec3 getSeaColor(vec3 p, vec3 n, vec3 l, vec3 eye, vec3 dist) {  
    float fresnel = clamp(1.0 - dot(n, -eye), 0.0, 1.0);
    fresnel = min(fresnel * fresnel * fresnel, 0.5);
    
    vec3 reflected = getSkyColor(reflect(eye, n));    
    vec3 refracted = SEA_BASE + diffuse(n, l, 80.0) * SEA_WATER_COLOR * 0.12; 
    
    vec3 color = mix(refracted, reflected, fresnel);
    
    float atten = max(1.0 - dot(dist, dist) * 0.001, 0.0);
    color += SEA_WATER_COLOR * (p.y - uSeaHeight) * 0.18 * atten;
    
    color += specular(n, l, eye, 60.0);
    
    return color;
}

// tracing
vec3 getNormal(vec3 p, float eps) {
    vec3 n;
    n.y = map_detailed(p);    
    n.x = map_detailed(vec3(p.x+eps,p.y,p.z)) - n.y;
    n.z = map_detailed(vec3(p.x,p.y,p.z+eps)) - n.y;
    n.y = eps;
    return normalize(n);
}

float heightMapTracing(vec3 ori, vec3 dir, out vec3 p) {  
    float tm = 0.0;
    float tx = 1000.0;    
    float hx = map(ori + dir * tx);
    if(hx > 0.0) {
        p = ori + dir * tx;
        return tx;   
    }
    float hm = map(ori);    
    for(int i = 0; i < uNumSteps; i++) {
        float tmid = mix(tm, tx, hm / (hm - hx));
        p = ori + dir * tmid;
        float hmid = map(p);        
        if(hmid < 0.0) {
            tx = tmid;
            hx = hmid;
        } else {
            tm = tmid;
            hm = hmid;
        }        
        if(abs(hmid) < EPSILON) break;
    }
    return mix(tm, tx, hm / (hm - hx));
}

vec3 getPixel(in vec2 coord, float time) {    
    vec2 uv = coord / iResolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;    
        
    // ray
    vec3 ang = vec3(sin(time*3.0)*0.1,sin(time)*0.2+0.3,time);    
    vec3 ori = vec3(0.0,3.5,time*5.0 * uCameraSpeed);  
    vec3 dir = normalize(vec3(uv.xy,-2.0)); dir.z += length(uv) * 0.14;
    dir = normalize(dir) * fromEuler(ang);
    
    // tracing
    vec3 p;
    heightMapTracing(ori,dir,p);
    vec3 dist = p - ori;
    vec3 n = getNormal(p, dot(dist,dist) * EPSILON_NRM);
    vec3 light = normalize(vec3(0.0,1.0,0.8)); 
             
    // color
    return mix(
        getSkyColor(dir),
        getSeaColor(p,n,light,dir,dist),
    	pow(smoothstep(0.0,-0.02,dir.y),0.2));
}

// main
void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    float time = iTime * 0.3 + iMouse.x * 0.01 * uMouseSensitivity;
	
#ifdef AA
    vec3 color = vec3(0.0);
    for(int i = -1; i <= 1; i++) {
        for(int j = -1; j <= 1; j++) {
        	vec2 uv = fragCoord+vec2(i,j)/3.0;
    		color += getPixel(uv, time);
        }
    }
    color /= 9.0;
#else
    vec3 color = getPixel(fragCoord, time);
#endif
    
    // post
	fragColor = vec4(pow(color,vec3(0.65)), 1.0);
}

/*--- END OF SHADERTOY ---*/

void main() {
    mainImage(fragColor, gl_FragCoord.xy);
}
`;

function createShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error("Shader compile error:", gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error("Program link error:", gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
		return null;
	}
	return program;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(
	gl,
	gl.FRAGMENT_SHADER,
	fragmentShaderSource
);
const program = createProgram(gl, vertexShader, fragmentShader);

const positionAttributeLocation = gl.getAttribLocation(program, "aPosition");
const resolutionUniformLocation = gl.getUniformLocation(program, "iResolution");
const timeUniformLocation = gl.getUniformLocation(program, "iTime");
const mouseUniformLocation = gl.getUniformLocation(program, "iMouse");
const numStepsUniformLocation = gl.getUniformLocation(program, "uNumSteps");
const geometryIterUniformLocation = gl.getUniformLocation(
	program,
	"uGeometryIter"
);
const fragmentIterUniformLocation = gl.getUniformLocation(
	program,
	"uFragmentIter"
);
const seaHeightUniformLocation = gl.getUniformLocation(program, "uSeaHeight");
const seaChoppyUniformLocation = gl.getUniformLocation(program, "uSeaChoppy");
const seaSpeedUniformLocation = gl.getUniformLocation(program, "uSeaSpeed");
const seaFreqUniformLocation = gl.getUniformLocation(program, "uSeaFreq");
const cameraSpeedUniformLocation = gl.getUniformLocation(
	program,
	"uCameraSpeed"
);
const mouseSensitivityUniformLocation = gl.getUniformLocation(
	program,
	"uMouseSensitivity"
);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(
	gl.ARRAY_BUFFER,
	new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
	gl.STATIC_DRAW
);

gl.useProgram(program);

gl.enableVertexAttribArray(positionAttributeLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

let mouseX = 0,
	mouseY = 0;
canvas.addEventListener("mousemove", (e) => {
	mouseX = e.clientX * 0.5;
	mouseY = (canvas.height - e.clientY) * 0.5;
});

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	gl.viewport(0, 0, canvas.width, canvas.height);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // Call once to set initial size

function render(time) {
	gl.uniform3f(
		resolutionUniformLocation,
		gl.canvas.width,
		gl.canvas.height,
		1.0
	);
	gl.uniform1f(timeUniformLocation, time * 0.001);
	gl.uniform4f(mouseUniformLocation, mouseX, mouseY, 0.0, 0.0);
	gl.uniform1i(numStepsUniformLocation, shaderParams.NUM_STEPS);
	gl.uniform1i(geometryIterUniformLocation, shaderParams.ITER_GEOMETRY);
	gl.uniform1i(fragmentIterUniformLocation, shaderParams.ITER_FRAGMENT);
	gl.uniform1f(seaHeightUniformLocation, shaderParams.SEA_HEIGHT);
	gl.uniform1f(seaChoppyUniformLocation, shaderParams.SEA_CHOPPY);
	gl.uniform1f(seaSpeedUniformLocation, shaderParams.SEA_SPEED);
	gl.uniform1f(seaFreqUniformLocation, shaderParams.SEA_FREQ);
	gl.uniform1f(cameraSpeedUniformLocation, shaderParams.CAMERA_SPEED);
	gl.uniform1f(mouseSensitivityUniformLocation, shaderParams.MOUSE_SENSITIVITY);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	requestAnimationFrame(render);
}

requestAnimationFrame(render);

// Fullscreen toggle functionality
const fullscreenBtn = document.getElementById("fullscreenBtn");
fullscreenBtn.addEventListener("click", toggleFullScreen);

function toggleFullScreen() {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen();
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		}
	}
}

// Panel Toggle and Slider Interaction
const togglePanelBtn = document.getElementById("togglePanelBtn");
const settingsPanel = document.getElementById("settingsPanel");

// Slider elements
const sliders = {
	cameraSpeed: document.getElementById("cameraSpeedSlider"),
	mouseSensitivity: document.getElementById("mouseSensitivitySlider"),
	numSteps: document.getElementById("numStepsSlider"),
	geometryIter: document.getElementById("geometryIterSlider"),
	fragmentIter: document.getElementById("fragmentIterSlider"),
	seaHeight: document.getElementById("seaHeightSlider"),
	seaChoppy: document.getElementById("seaChoppySlider"),
	seaSpeed: document.getElementById("seaSpeedSlider"),
	seaFreq: document.getElementById("seaFreqSlider")
};

// Slider value display elements
const sliderValues = {
	cameraSpeed: document.getElementById("cameraSpeedValue"),
	mouseSensitivity: document.getElementById("mouseSensitivityValue"),
	numSteps: document.getElementById("numStepsValue"),
	geometryIter: document.getElementById("geometryIterValue"),
	fragmentIter: document.getElementById("fragmentIterValue"),
	seaHeight: document.getElementById("seaHeightValue"),
	seaChoppy: document.getElementById("seaChoppyValue"),
	seaSpeed: document.getElementById("seaSpeedValue"),
	seaFreq: document.getElementById("seaFreqValue")
};

// Randomize and Reset buttons
const randomizeBtn = document.getElementById("randomizeBtn");
const resetBtn = document.getElementById("resetBtn");

function randomizeShaderParams() {
	shaderParams = {
		CAMERA_SPEED: Math.random() * 5,
		MOUSE_SENSITIVITY: Math.random() * 2,
		NUM_STEPS: Math.round(Math.random() * 120 + 8),
		ITER_GEOMETRY: Math.round(Math.random() * 7 + 1),
		ITER_FRAGMENT: Math.round(Math.random() * 7 + 1),
		SEA_HEIGHT: Math.random() * 2,
		SEA_CHOPPY: Math.random() * 10,
		SEA_SPEED: Math.random() * 2,
		SEA_FREQ: Math.random()
	};

	updateSlidersAndValues();
}

function resetShaderParams() {
	shaderParams = { ...DEFAULT_SHADER_PARAMS };
	updateSlidersAndValues();
}

function updateSlidersAndValues() {
	// Update slider values
	sliders.cameraSpeed.value = shaderParams.CAMERA_SPEED;
	sliders.mouseSensitivity.value = shaderParams.MOUSE_SENSITIVITY;
	sliders.numSteps.value = shaderParams.NUM_STEPS;
	sliders.geometryIter.value = shaderParams.ITER_GEOMETRY;
	sliders.fragmentIter.value = shaderParams.ITER_FRAGMENT;
	sliders.seaHeight.value = shaderParams.SEA_HEIGHT;
	sliders.seaChoppy.value = shaderParams.SEA_CHOPPY;
	sliders.seaSpeed.value = shaderParams.SEA_SPEED;
	sliders.seaFreq.value = shaderParams.SEA_FREQ;

	// Update value display
	sliderValues.cameraSpeed.textContent = shaderParams.CAMERA_SPEED.toFixed(2);
	sliderValues.mouseSensitivity.textContent = shaderParams.MOUSE_SENSITIVITY.toFixed(
		2
	);
	sliderValues.numSteps.textContent = shaderParams.NUM_STEPS;
	sliderValues.geometryIter.textContent = shaderParams.ITER_GEOMETRY;
	sliderValues.fragmentIter.textContent = shaderParams.ITER_FRAGMENT;
	sliderValues.seaHeight.textContent = shaderParams.SEA_HEIGHT.toFixed(2);
	sliderValues.seaChoppy.textContent = shaderParams.SEA_CHOPPY.toFixed(2);
	sliderValues.seaSpeed.textContent = shaderParams.SEA_SPEED.toFixed(2);
	sliderValues.seaFreq.textContent = shaderParams.SEA_FREQ.toFixed(2);
}

randomizeBtn.addEventListener("click", randomizeShaderParams);
resetBtn.addEventListener("click", resetShaderParams);

// Panel toggle functionality
togglePanelBtn.addEventListener("click", () => {
	settingsPanel.classList.toggle("visible");
});

// Slider value display setup
sliderValues.cameraSpeed.textContent = shaderParams.CAMERA_SPEED.toFixed(2);
sliderValues.mouseSensitivity.textContent = shaderParams.MOUSE_SENSITIVITY.toFixed(
	2
);
sliderValues.numSteps.textContent = shaderParams.NUM_STEPS;
sliderValues.geometryIter.textContent = shaderParams.ITER_GEOMETRY;
sliderValues.fragmentIter.textContent = shaderParams.ITER_FRAGMENT;
sliderValues.seaHeight.textContent = shaderParams.SEA_HEIGHT.toFixed(2);
sliderValues.seaChoppy.textContent = shaderParams.SEA_CHOPPY.toFixed(2);
sliderValues.seaSpeed.textContent = shaderParams.SEA_SPEED.toFixed(2);
sliderValues.seaFreq.textContent = shaderParams.SEA_FREQ.toFixed(2);

// Slider setup
sliders.cameraSpeed.value = shaderParams.CAMERA_SPEED;
sliders.mouseSensitivity.value = shaderParams.MOUSE_SENSITIVITY;
sliders.numSteps.value = shaderParams.NUM_STEPS;
sliders.geometryIter.value = shaderParams.ITER_GEOMETRY;
sliders.fragmentIter.value = shaderParams.ITER_FRAGMENT;
sliders.seaHeight.value = shaderParams.SEA_HEIGHT;
sliders.seaChoppy.value = shaderParams.SEA_CHOPPY;
sliders.seaSpeed.value = shaderParams.SEA_SPEED;
sliders.seaFreq.value = shaderParams.SEA_FREQ;

// Slider event listeners
Object.keys(sliders).forEach((key) => {
	sliders[key].addEventListener("input", (e) => {
		const value = parseFloat(e.target.value);
		sliderValues[key].textContent = value.toFixed(2);

		// Update shader parameters
		switch (key) {
			case "cameraSpeed":
				shaderParams.CAMERA_SPEED = value;
				break;
			case "mouseSensitivity":
				shaderParams.MOUSE_SENSITIVITY = value;
				break;
			case "numSteps":
				shaderParams.NUM_STEPS = Math.round(value);
				break;
			case "geometryIter":
				shaderParams.ITER_GEOMETRY = Math.round(value);
				break;
			case "fragmentIter":
				shaderParams.ITER_FRAGMENT = Math.round(value);
				break;
			case "seaHeight":
				shaderParams.SEA_HEIGHT = value;
				break;
			case "seaChoppy":
				shaderParams.SEA_CHOPPY = value;
				break;
			case "seaSpeed":
				shaderParams.SEA_SPEED = value;
				break;
			case "seaFreq":
				shaderParams.SEA_FREQ = value;
				break;
		}
	});
});