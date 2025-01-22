import GUI from "https://cdn.jsdelivr.net/npm/lil-gui@0.18.2/+esm"

const canvasEl = document.querySelector("canvas");
const imgInput = document.querySelector("#image-selector-input");
const devicePixelRatio = Math.min(window.devicePixelRatio, 2);

const params = {
    clickRandomizer: .332,
    distance: .015,
    effectOn: true,
    edgeThickness: .006,
    loadMyImage: () => {
        imgInput.click();
    },
};

const pointer = {
    x: .55 * window.innerWidth,
    y: .5 * window.innerHeight,
};

imgInput.onchange = () => {
    const [file] = imgInput.files;
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            loadImage(e.target.result);
        };
        reader.readAsDataURL(file);
    }
};


let image, uniforms, effectOffControl;
const gl = initShader();
updateUniforms();
loadImage("../../774.Broken Glass/img/for-glass-crack-demo-1.jpg");
setupEvents();
createControls();
render();
window.addEventListener("resize", resizeCanvas);


    // ---------------
    // codepen preview
	 let autoRunFlag = true;
    function autoRun() {
        params.clickRandomizer -= .03;
        pointer.x += 70 * (autoRunFlag ? 1 : -1);
        pointer.y += 40;
        updateUniforms();
		  autoRunFlag = !autoRunFlag;
    }
    setTimeout(autoRun, 500);
    setTimeout(autoRun, 1000);
    // ---------------


function initShader() {
    const vsSource = document.getElementById("vertShader").innerHTML;
    const fsSource = document.getElementById("fragShader").innerHTML;

    const gl = canvasEl.getContext("webgl");

    function createShader(gl, sourceCode, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, sourceCode);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    const vertexShader = createShader(gl, vsSource, gl.VERTEX_SHADER);
    const fragmentShader = createShader(gl, fsSource, gl.FRAGMENT_SHADER);

    function createShaderProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }

    const shaderProgram = createShaderProgram(gl, vertexShader, fragmentShader);
    uniforms = getUniforms(shaderProgram);

    function getUniforms(program) {
        let uniforms = [];
        let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
            let uniformName = gl.getActiveUniform(program, i).name;
            uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
        }
        return uniforms;
    }

    const vertices = new Float32Array([-1., -1., 1., -1., -1., 1., 1., 1.]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.useProgram(shaderProgram);

    const positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
    gl.enableVertexAttribArray(positionLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    return gl;
}

function updateUniforms() {
    gl.uniform1f(uniforms.u_click_randomizer, params.clickRandomizer);
    gl.uniform1f(uniforms.u_rotation, params.rotation);
    gl.uniform1f(uniforms.u_effect, params.distance);
    gl.uniform1f(uniforms.u_effect_active, params.effectOn ? 1 : 0);
    gl.uniform1f(uniforms.u_edge_thickness, params.edgeThickness);
    gl.uniform2f(uniforms.u_pointer_position, pointer.x / window.innerWidth, pointer.y / window.innerHeight);
}

function loadImage(src) {
    image = new Image();
    image.crossOrigin = "anonymous";
    image.src = src;
    image.onload = () => {
        const imageTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, imageTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.uniform1i(uniforms.u_image_texture, 0);
        resizeCanvas();
    };
}

function render() {
    const currentTime = performance.now();
    gl.uniform1f(uniforms.u_time, currentTime);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
}

function resizeCanvas() {
    const imgRatio = image.naturalWidth / image.naturalHeight;
    canvasEl.width = window.innerWidth * devicePixelRatio;
    canvasEl.height = window.innerHeight * devicePixelRatio;
    gl.viewport(0, 0, canvasEl.width, canvasEl.height);
    gl.uniform1f(uniforms.u_ratio, canvasEl.width / canvasEl.height);
    gl.uniform1f(uniforms.u_img_ratio, imgRatio);
}

function setupEvents() {
    canvasEl.addEventListener("click", e => {
        pointer.x = e.pageX;
        pointer.y = e.pageY;
        params.clickRandomizer = Math.random();
        updateUniforms();
    });

    document.addEventListener("keydown", e => {
        if (event.code === "Space") {
            params.effectOn = !params.effectOn;
            if (effectOffControl) {
                effectOffControl.setValue(params.effectOn)
            }
        }
    });
}


function createControls() {
    const gui = new GUI();
	 gui.close();
	
    gui
        .add(params, "loadMyImage")
        .name("load image")

    const paramsFolder = gui.addFolder("shader params");
    // paramsFolder.close();


    effectOffControl = paramsFolder
        .add(params, "effectOn")
        .onChange(updateUniforms)
    paramsFolder
        .add(params, "distance", 0, .2)
        .onChange(updateUniforms)
    paramsFolder
        .add(params, "clickRandomizer", 0, 1)
        .onChange(updateUniforms)
    paramsFolder
        .add(params, "edgeThickness", 0, .02)
        .onChange(updateUniforms)
}