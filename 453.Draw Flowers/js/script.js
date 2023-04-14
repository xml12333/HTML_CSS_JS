import * as THREE from 'https://cdn.skypack.dev/three@0.139.1/build/three.module';

const canvasEl = document.querySelector('#canvas');

const pointer = {
    x: .5,
    y: .6,
    moved: false,
    speed: 0,
    vanishMode: false,
    drawingAllowed: true,
};
window.setTimeout(() => {
    pointer.x = .7;
    pointer.y = .5;
    pointer.moved = true;
}, 100);

let basicMaterial, shaderMaterial;

let renderer = new THREE.WebGLRenderer({
    canvas: canvasEl,
    alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
let sceneShader = new THREE.Scene();
let sceneBasic = new THREE.Scene();
let camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
let clock = new THREE.Clock();

let renderTargets = [
    new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight),
    new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight)
];

createPlane();
updateSize();
window.addEventListener("resize", updateSize);

render();

window.addEventListener("mousemove", (e) => {
    if (pointer.drawingAllowed) {
        pointer.moved = true;
        const dx = 12 * (e.pageX / window.innerWidth - pointer.x);
        const dy = 12 * (e.pageY / window.innerHeight - pointer.y);
        pointer.x = e.pageX / window.innerWidth;
        pointer.y = e.pageY / window.innerHeight;
        pointer.speed = Math.min(2, Math.pow(dx, 2) + Math.pow(dy, 2));
    }
});
canvasEl.addEventListener("click", (e) => {
    pointer.x = e.pageX / window.innerWidth;
    pointer.y = e.pageY / window.innerHeight;
    pointer.drawingAllowed = !pointer.drawingAllowed;
    if (pointer.drawingAllowed) {
        pointer.moved = true;
    }
});
const vanishingBtn = document.querySelector('#vanishing-mode-btn');
vanishingBtn.addEventListener("click", (e) => {
    pointer.vanishMode = !pointer.vanishMode;
    if (pointer.vanishMode) {
        pointer.drawingAllowed = true;
        pointer.moved = false;
    }
});

window.addEventListener("touchstart", (e) => {
    pointer.x = e.targetTouches[0].pageX / window.innerWidth;
    pointer.y = e.targetTouches[0].pageY / window.innerHeight;
    pointer.drawingAllowed = !pointer.drawingAllowed;
    if (pointer.drawingAllowed) {
        pointer.moved = true;
    }
});
window.addEventListener("touchmove", (e) => {
    pointer.moved = true;
    const dx = 5 * (e.targetTouches[0].pageX / window.innerWidth - pointer.x);
    const dy = 5 * (e.targetTouches[0].pageY / window.innerHeight - pointer.y);
    pointer.x = e.targetTouches[0].pageX / window.innerWidth;
    pointer.y = e.targetTouches[0].pageY / window.innerHeight;
    pointer.speed = Math.min(2, Math.pow(dx, 2) + Math.pow(dy, 2));
});

function createPlane() {
    shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            u_stop_time: {type: "f", value: 0.},
            u_point: {type: "v2", value: new THREE.Vector2(pointer.x, pointer.y)},
            u_moving: {type: "f", value: 0.},
            u_speed: {type: "f", value: 0.},
            u_stop_randomizer: {type: "v2", value: new THREE.Vector2(Math.random(), Math.random())},
            u_clean: {type: "f", value: 1.},
            u_ratio: {type: "f", value: window.innerWidth / window.innerHeight},
            u_texture: {type: "t", value: null}
        },
        vertexShader: document.getElementById("vertexShader").textContent,
        fragmentShader: document.getElementById("fragmentShader").textContent
    });
    basicMaterial = new THREE.MeshBasicMaterial();

    const planeGeometry = new THREE.PlaneGeometry(2, 2);
    const planeBasic = new THREE.Mesh(planeGeometry, basicMaterial);
    const planeShader = new THREE.Mesh(planeGeometry, shaderMaterial);
    sceneBasic.add(planeBasic);
    sceneShader.add(planeShader);
}

function render() {
    shaderMaterial.uniforms.u_clean.value = pointer.vanishMode ? .93 : 1;
    shaderMaterial.uniforms.u_point.value = new THREE.Vector2(pointer.x, 1 - pointer.y);
    shaderMaterial.uniforms.u_texture.value = renderTargets[0].texture;
    shaderMaterial.uniforms.u_ratio.value = window.innerWidth / window.innerHeight;
    if (pointer.moved) {
        shaderMaterial.uniforms.u_moving.value = 1.;
        shaderMaterial.uniforms.u_stop_randomizer.value = new THREE.Vector2(Math.random(), Math.random());
        shaderMaterial.uniforms.u_stop_time.value = 0.;
        pointer.moved = false;
    } else {
        shaderMaterial.uniforms.u_moving.value = 0.;
    }
    shaderMaterial.uniforms.u_stop_time.value += clock.getDelta();
    shaderMaterial.uniforms.u_speed.value = pointer.speed;

    renderer.setRenderTarget(renderTargets[1]);
    renderer.render(sceneShader, camera);

    basicMaterial.map = renderTargets[1].texture;

    renderer.setRenderTarget(null);
    renderer.render(sceneBasic, camera);

    let tmp = renderTargets[0];
    renderTargets[0] = renderTargets[1];
    renderTargets[1] = tmp;

    requestAnimationFrame(render);
}

function updateSize() {
    shaderMaterial.uniforms.u_ratio.value = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
}

const screenshotBtn = document.querySelector('#screenshot');
screenshotBtn.addEventListener('click', () => {
    renderer.render(sceneBasic, camera);
    canvasEl.toBlob((blob) => {
        saveBlob(blob, "flowers-from-ksenia.png");
    });
    const saveBlob = (function () {
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        return function saveData(blob, fileName) {
            a.href = window.URL.createObjectURL(blob);
            a.download = fileName;
            a.click();
        };
    }());
});