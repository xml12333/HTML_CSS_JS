import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

let composer, scene, camera, renderer, group;

const params = {
	threshold: 0,
	strength: 0.1,
	radius: 0,
	exposure: 1
};

let allGeometry = [];

function init() {
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);

	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);

	renderer = new THREE.WebGLRenderer({ alpha: true });

	const controls = new OrbitControls(camera, renderer.domElement);
	renderer.setSize(window.innerWidth, window.innerHeight);

	document.getElementById("canvas-container").appendChild(renderer.domElement);

	const sprite = new THREE.TextureLoader().load(
		"https://assets.codepen.io/10590426/disc.png"
	);
	sprite.colorSpace = THREE.SRGBColorSpace;

	const renderScene = new RenderPass(scene, camera);

	const bloomPass = new UnrealBloomPass(
		new THREE.Vector2(window.innerWidth, window.innerHeight),
		1.5,
		0.4,
		0.85
	);
	bloomPass.threshold = params.threshold;
	bloomPass.strength = params.strength;
	bloomPass.radius = params.radius;

	const outputPass = new OutputPass(THREE.ReinhardToneMapping);
	group = new THREE.Group();

	composer = new EffectComposer(renderer);
	composer.addPass(renderScene);
	composer.addPass(bloomPass);
	composer.addPass(outputPass);

	// load the model
	const loader = new GLTFLoader();
	loader.load(
		"https://assets.codepen.io/10590426/Whale+Poly.glb",
		function (gltf) {
			gltf.scene.traverse(function (child) {
				const geometry = child.geometry;
				const material = new THREE.PointsMaterial({
					// color: 0x0378ff,
					size: 0.6,
					alphaTest: 0.5,
					transparent: true,
					blending: THREE.AdditiveBlending,
					map: sprite,
					vertexColors: true
				});
				const whale = new THREE.Points(geometry, material);
				const wireframe = new THREE.WireframeGeometry(geometry);

				const line = new THREE.LineSegments(wireframe);
				line.material.depthTest = false;
				line.material.opacity = 0.006;
				line.material.transparent = true;

				group.add(line);
				group.add(whale);
				scene.add(group);

				allGeometry.push(line);
				allGeometry.push(whale);
			});
		}
	);

	camera.position.y = -25;
	camera.position.z = 12;
	camera.position.x = 10;

	controls.update();
}

let elapsed = 0;

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function animate() {
	requestAnimationFrame(animate);

	scene.rotation.z += 0.004;

	renderer.render(scene, camera);

	elapsed += 0.02;

	for (const particles of allGeometry) {
		const positions = particles?.geometry?.attributes?.position?.array;

		let colors = [];
		if (positions) {
			for (let i = 0; i < positions.length; i += 3) {
				let waveY =
					0.03 *
					Math.cos(0.1 * (positions[i] / 2) + positions[i + 2] / 12 + elapsed);

				positions[i + 1] = positions[i + 1] + waveY;

				// create a color based on the y position
				let color = new THREE.Color(0x0378ff);

				color.setHSL(
					0.65 * clamp(Math.sin(0.1 * positions[i + 2] + elapsed), 0.6, 1),
					1,
					0.4
				);
				colors.push(color.r, color.g, color.b);
			}
			particles.geometry.setAttribute(
				"color",
				new THREE.Float32BufferAttribute(colors, 3)
			);
			particles.geometry.attributes.position.needsUpdate = true;
			particles.geometry.attributes.color.needsUpdate = true;
		}
	}
	composer.render();
}

init();
animate();
