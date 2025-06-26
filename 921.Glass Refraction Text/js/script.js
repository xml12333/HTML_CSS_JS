// If you want to check how this works, the shader comes from here https://blog.maximeheckel.com/posts/refraction-dispersion-and-other-shader-light-effects/
// Be mindful that this implementation is not with react-three-fiber 😉
import * as THREE from "https://esm.sh/three@0.170.0";
import { FontLoader } from "https://esm.sh/three@0.170.0/addons/loaders/FontLoader.js";
import { TextGeometry } from "https://esm.sh/three@0.170.0/addons/geometries/TextGeometry.js";
import { OrbitControls } from "https://esm.sh/three@0.170.0/examples/jsm/controls/OrbitControls.js";

import { easing } from "https://esm.sh/maath@0.10.8";
import { Pane } from "https://esm.sh/tweakpane@4.0.5";

const vertexShader = `varying vec3 worldNormal;
varying vec3 eyeVector;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition = viewMatrix * worldPos;

  gl_Position = projectionMatrix * mvPosition;
  worldNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
  eyeVector =  normalize(worldPos.xyz - cameraPosition);
}
`;

const fragmentShader = `uniform float uIorR;
uniform float uIorY;
uniform float uIorG;
uniform float uIorC;
uniform float uIorB;
uniform float uIorP;

uniform float uSaturation;
uniform float uChromaticAberration;
uniform float uRefractPower;
uniform float uFresnelPower;
uniform float uShininess;
uniform float uDiffuseness;
uniform vec3 uLight;

uniform vec2 winResolution;
uniform sampler2D uTexture;

varying vec3 worldNormal;
varying vec3 eyeVector;

vec3 sat(vec3 rgb, float adjustment) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  vec3 intensity = vec3(dot(rgb, W));
  return mix(intensity, rgb, adjustment);
}

float fresnel(vec3 eyeVector, vec3 worldNormal, float power) {
  float fresnelFactor = abs(dot(eyeVector, worldNormal));
  float inversefresnelFactor = 1.0 - fresnelFactor;
  
  return pow(inversefresnelFactor, power);
}

float specular(vec3 light, float shininess, float diffuseness) {
  vec3 normal = worldNormal;
  vec3 lightVector = normalize(-light);
  vec3 halfVector = normalize(eyeVector + lightVector);

  float NdotL = dot(normal, lightVector);
  float NdotH =  dot(normal, halfVector);
  float kDiffuse = max(0.0, NdotL);
  float NdotH2 = NdotH * NdotH;

  float kSpecular = pow(NdotH2, shininess);
  return  kSpecular + kDiffuse * diffuseness;
}

const int LOOP = 16;

void main() {
  float iorRatioRed = 1.0/uIorR;
  float iorRatioGreen = 1.0/uIorG;
  float iorRatioBlue = 1.0/uIorB;

  vec2 uv = gl_FragCoord.xy / winResolution.xy;
  vec3 normal = worldNormal;
  vec3 color = vec3(0.0);

  for ( int i = 0; i < LOOP; i ++ ) {
    float slide = float(i) / float(LOOP) * 0.1;

    vec3 refractVecR = refract(eyeVector, normal,(1.0/uIorR));
    vec3 refractVecY = refract(eyeVector, normal, (1.0/uIorY));
    vec3 refractVecG = refract(eyeVector, normal, (1.0/uIorG));
    vec3 refractVecC = refract(eyeVector, normal, (1.0/uIorC));
    vec3 refractVecB = refract(eyeVector, normal, (1.0/uIorB));
    vec3 refractVecP = refract(eyeVector, normal, (1.0/uIorP));

    float r = texture2D(uTexture, uv + refractVecR.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).x * 0.5;

    float y = (texture2D(uTexture, uv + refractVecY.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).x * 2.0 +
                texture2D(uTexture, uv + refractVecY.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).y * 2.0 -
                texture2D(uTexture, uv + refractVecY.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).z) / 6.0;

    float g = texture2D(uTexture, uv + refractVecG.xy * (uRefractPower + slide * 2.0) * uChromaticAberration).y * 0.5;

    float c = (texture2D(uTexture, uv + refractVecC.xy * (uRefractPower + slide * 2.5) * uChromaticAberration).y * 2.0 +
                texture2D(uTexture, uv + refractVecC.xy * (uRefractPower + slide * 2.5) * uChromaticAberration).z * 2.0 -
                texture2D(uTexture, uv + refractVecC.xy * (uRefractPower + slide * 2.5) * uChromaticAberration).x) / 6.0;
          
    float b = texture2D(uTexture, uv + refractVecB.xy * (uRefractPower + slide * 3.0) * uChromaticAberration).z * 0.5;

    float p = (texture2D(uTexture, uv + refractVecP.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).z * 2.0 +
                texture2D(uTexture, uv + refractVecP.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).x * 2.0 -
                texture2D(uTexture, uv + refractVecP.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).y) / 6.0;

    float R = r + (2.0*p + 2.0*y - c)/3.0;
    float G = g + (2.0*y + 2.0*c - p)/3.0;
    float B = b + (2.0*c + 2.0*p - y)/3.0;

    color.r += R;
    color.g += G;
    color.b += B;

    color = sat(color, uSaturation);
  }

  // Divide by the number of layers to normalize colors (rgb values can be worth up to the value of LOOP)
  color /= float( LOOP );

  // Specular
  float specularLight = specular(uLight, uShininess, uDiffuseness);
  color += specularLight;

  // Fresnel
  float f = fresnel(eyeVector, normal, uFresnelPower);
  color.rgb += f * vec3(1.0);

  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

class App {
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer({ antialias: false });
	coords = new THREE.Vector2(0, 0);
	camera = new THREE.PerspectiveCamera(
		70,
		window.innerWidth / window.innerHeight,
		0.01,
		1000
	);

	constructor() {
		this.init();
		this.setComponents();
	}

	init() {
		this.renderer.setAnimationLoop(this.animate.bind(this));
		this.handleResize();
		window.addEventListener("resize", this.handleResize.bind(this), false);
		document.body.appendChild(this.renderer.domElement);

		this.camera.position.z = 3;
		document.body.addEventListener(
			"mousemove",
			this.onDocumentMouseMove.bind(this),
			false
		);
	}

	onDocumentMouseMove(event) {
		this.setCoords(event.clientX, event.clientY);
	}
	setCoords(x, y) {
		if (this.timer) clearTimeout(this.timer);
		this.coords.set(
			(x / window.innerWidth) * 2 - 1,
			-(y / window.innerHeight) * 2 + 1
		);
		this.mouseMoved = true;

		this.timer = setTimeout(() => {
			this.mouseMoved = false;
		}, 100);
	}

	setComponents() {
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		try {
			this.holder = new THREE.Group();
			const geo = new THREE.IcosahedronGeometry(0.5, 8);
			const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
			const ico = new THREE.Mesh(geo, mat);

			const w = 1000;
			for (let i = 0; i < w; i++) {
				const icot = ico.clone();
				icot.position.x = (i % 50) * 2.5 - 100;
				icot.position.y = Math.round(i / 25) * 2.5 - 50;
				icot.position.z = -40;
				icot.layers.set(1);
				this.holder.add(icot);
			}
			this.scene.add(this.holder);
		} catch (e) {
			console.log(e);
		}

		this.target = new THREE.WebGLRenderTarget(
			window.innerWidth * window.devicePixelRatio,
			window.innerHeight * window.devicePixelRatio,
			{
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter,
				type: THREE.HalfFloatType
			}
		);
		this.backTarget = new THREE.WebGLRenderTarget(
			window.innerWidth * window.devicePixelRatio,
			window.innerHeight * window.devicePixelRatio,
			{
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter,
				type: THREE.HalfFloatType
			}
		);

		const textGeometry = this.computeTextGeometry({ label: "Prisme." });
		const uniforms = {
			uTexture: {
				value: null
			},
			uIorR: { value: 1.15 },
			uIorY: { value: 1.16 },
			uIorG: { value: 1.18 },
			uIorC: { value: 1.22 },
			uIorB: { value: 1.22 },
			uIorP: { value: 1.22 },
			uRefractPower: {
				value: 0.2
			},
			uChromaticAberration: {
				value: 0.6
			},
			uSaturation: { value: 1.08 },
			uShininess: { value: 40.0 },
			uDiffuseness: { value: 0.2 },
			uFresnelPower: { value: 8.0 },
			uLight: {
				value: new THREE.Vector3(-1.0, 1.0, 1.0)
			},
			winResolution: {
				value: new THREE.Vector2(window.innerWidth, window.innerHeight)
			}
		};
		const material = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms
		});
		this.text = new THREE.Mesh(textGeometry, material);
		this.scene.add(this.text);

		this.uniforms = uniforms;
		this.setDebug();
	}

	computeTextGeometry({ label }) {
		const font = new FontLoader().parse(json);

		const textGeometry = new TextGeometry(label, {
			font,
			size: 0.5,
			height: 0.1,
			curveSegments: 12,
			bevelEnabled: true,
			bevelSize: 0.02,
			textAlign: "center",
			bevelThickness: 0.01,
			bevelOffset: 0,
			bevelSegments: 10
		});
		textGeometry.center();
		// textGeometry.computeVertexNormals();
		return textGeometry;
	}

	setDebug() {
		this.pane = new Pane();
		const PARAMS = {
			label: "Prisme."
		};
		const folder = this.pane.addFolder({
			title: "🔍",
			expanded: false
		});
		folder.addBinding(PARAMS, "label").on("change", () => {
			const { label } = PARAMS;

			this.scene.remove(this.text);
			this.text.geometry.copy(this.computeTextGeometry({ label }));

			this.scene.add(this.text);
		});
		folder.addButton({
			title: "update text"
		});

		folder.addBinding(this.uniforms.uSaturation, "value", {
			label: "Saturation",
			step: 0.01,
			min: 0,
			max: 2
		});

		folder.addBinding(this.uniforms.uChromaticAberration, "value", {
			label: "Aberration",
			step: 0.01,
			min: 0,
			max: 2
		});
		folder.addBinding(this.uniforms.uRefractPower, "value", {
			label: "RefractPower",
			step: 0.01,
			min: 0,
			max: 0.5
		});

		const subFolder = folder.addFolder({
			title: "🌈",
			expanded: false
		});

		subFolder.addBinding(this.uniforms.uIorR, "value", {
			label: "IOR Red",
			step: 0.01,
			min: 0,
			max: 2
		});
		subFolder.addBinding(this.uniforms.uIorY, "value", {
			label: "IOR Yellow",
			step: 0.01,
			min: 0,
			max: 2
		});
		subFolder.addBinding(this.uniforms.uIorG, "value", {
			label: "IOR Green",
			step: 0.01,
			min: 0,
			max: 2
		});
		subFolder.addBinding(this.uniforms.uIorC, "value", {
			label: "IOR Cyan",
			step: 0.01,
			min: 0,
			max: 2
		});
		subFolder.addBinding(this.uniforms.uIorB, "value", {
			label: "IOR Blue",
			step: 0.01,
			min: 0,
			max: 2
		});
		subFolder.addBinding(this.uniforms.uIorB, "value", {
			label: "IOR Blue",
			step: 0.01,
			min: 0,
			max: 2
		});
		subFolder.addBinding(this.uniforms.uIorP, "value", {
			label: "IOR Magenta",
			step: 0.01,
			min: 0,
			max: 2
		});
	}

	handleResize() {
		const { innerWidth: width, innerHeight: height } = window;
		const { camera, renderer } = this;
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
		if (this.text) {
			this.text.material.uniforms.winResolution.value.set(
				window.innerWidth,
				window.innerHeight
			);
		}
	}

	animate(t) {
		const delta = t - parseFloat(this.pt);
		this.pt = t;

		// this damping approach is super interesting it comes from https://codesandbox.io/p/sandbox/4j2q2
		easing.damp3(
			this.text.position,
			[
				this.text.position.x,
				this.text.position.y,
				(1.0 - Math.cos(this.coords.x)) * 2.25
			],
			0.2,
			delta / 1000
		);
		easing.damp3(
			this.text.rotation,
			[
				this.coords.y * 3.14 * 0.0314 * 0.9,
				this.coords.x * 3.14 * 0.0314 * 1.4,
				0
			],
			0.2,
			delta / 1000
		);
		// console.log(this.text.rotation)
		this.holder.rotation.z += 0.001;
		this.camera.layers.disableAll();
		this.camera.layers.enable(1);
		this.text.visible = false;
		this.renderer.setRenderTarget(this.backTarget);
		this.renderer.render(this.scene, this.camera);

		this.camera.layers.enableAll();
		this.text.material.side = THREE.BackSide;
		this.text.material.uniforms.uTexture.value = this.backTarget.texture;
		this.text.visible = true;
		this.renderer.setRenderTarget(this.target);
		this.renderer.render(this.scene, this.camera);

		this.camera.layers.disable(1);
		this.text.material.uniforms.uTexture.value = this.target.texture;
		this.text.material.side = THREE.FrontSide;
		this.renderer.setRenderTarget(null);
		this.renderer.render(this.scene, this.camera);
	}
}

// Typeface.json
const json = {
	glyphs: {
		0: {
			ha: 1319,
			x_min: 68,
			x_max: 1251,
			o:
				"m 660 -28 q 224 117 381 -28 q 68 500 68 263 q 224 879 68 735 q 660 1024 381 1024 q 1094 878 938 1024 q 1251 500 1251 733 q 1094 118 1251 264 q 660 -28 938 -28 m 417 500 q 480 315 417 378 q 660 251 543 251 q 839 315 775 251 q 903 500 903 378 q 840 683 903 619 q 660 746 776 746 q 480 683 543 746 q 417 500 417 621 z "
		},
		1: {
			ha: 1125,
			x_min: 82,
			x_max: 1043,
			o:
				"m 82 0 l 82 250 l 399 250 l 399 733 l 150 657 l 82 896 l 432 997 l 725 997 l 725 250 l 1043 250 l 1043 0 l 82 0 z "
		},
		2: {
			ha: 1257,
			x_min: 82,
			x_max: 1175,
			o:
				"m 82 143 q 124 292 82 226 q 232 399 165 358 q 378 471 299 439 q 539 526 458 503 q 686 574 619 550 q 794 629 753 597 q 836 703 836 661 q 798 775 836 751 q 668 799 760 799 q 438 646 438 799 l 97 646 q 156 819 107 744 q 283 936 204 893 q 460 1000 363 979 q 676 1021 558 1021 q 1043 944 911 1021 q 1175 721 1175 868 q 1110 543 1175 617 q 947 431 1044 469 q 751 366 850 393 q 573 311 653 339 q 476 250 493 283 l 1161 250 l 1161 0 l 82 0 l 82 143 z "
		},
		3: {
			ha: 1267,
			x_min: 68,
			x_max: 1200,
			o:
				"m 654 -28 q 228 65 372 -28 q 68 351 85 158 l 394 351 q 458 242 394 276 q 651 208 521 208 q 813 234 763 208 q 864 319 864 260 q 818 399 864 375 q 668 422 772 422 l 582 422 l 582 604 l 660 604 q 804 628 758 606 q 850 703 850 651 q 802 776 850 754 q 644 799 754 799 q 453 763 513 799 q 394 646 394 726 l 82 646 q 671 1021 115 1021 q 1056 947 926 1021 q 1186 729 1186 872 q 1029 514 1186 574 q 1200 288 1200 453 q 654 -28 1200 -28 z "
		},
		4: {
			ha: 1344,
			x_min: 82,
			x_max: 1263,
			o:
				"m 767 0 l 767 158 l 82 158 l 82 393 l 767 997 l 1093 997 l 1093 393 l 1263 393 l 1263 158 l 1093 158 l 1093 0 l 767 0 m 415 393 l 767 393 l 767 715 l 415 393 z "
		},
		5: {
			ha: 1231,
			x_min: 67,
			x_max: 1164,
			o:
				"m 635 -28 q 235 63 392 -28 q 67 331 79 153 l 410 331 q 622 210 436 210 q 821 354 821 210 q 776 453 821 418 q 647 489 732 489 q 535 472 583 489 q 428 413 486 456 l 125 471 l 207 999 l 1083 999 l 1083 760 l 471 760 l 450 610 q 765 674 588 674 q 1059 588 954 674 q 1164 349 1164 503 q 1026 73 1164 174 q 635 -28 889 -28 z "
		},
		6: {
			ha: 1288,
			x_min: 81,
			x_max: 1210,
			o:
				"m 664 -28 q 238 108 394 -28 q 81 478 81 244 q 259 874 81 728 q 740 1021 438 1021 q 1126 990 940 1021 l 1126 754 q 771 782 944 782 q 446 608 515 782 q 765 678 590 678 q 1090 588 971 678 q 1210 344 1210 497 q 1062 73 1210 174 q 664 -28 914 -28 m 425 350 q 484 248 425 286 q 642 210 543 210 q 806 249 744 210 q 867 353 867 288 q 806 452 867 415 q 644 489 746 489 q 485 451 544 489 q 425 350 425 413 z "
		},
		7: {
			ha: 1193,
			x_min: 85,
			x_max: 1108,
			o:
				"m 299 0 q 756 750 299 490 l 85 750 l 85 997 l 1108 997 l 1108 750 q 737 410 849 588 q 625 0 625 232 l 299 0 z "
		},
		8: {
			ha: 1349,
			x_min: 82,
			x_max: 1265,
			o:
				"m 674 -28 q 387 -7 504 -28 q 203 56 269 14 q 110 150 138 97 q 82 274 82 203 q 356 524 82 465 q 165 756 165 586 q 296 952 165 883 q 674 1021 426 1021 q 1051 952 921 1021 q 1181 756 1181 883 q 990 524 1181 585 q 1265 274 1265 467 q 1237 150 1265 203 q 1143 56 1208 97 q 960 -6 1078 15 q 674 -28 842 -28 m 435 297 q 674 183 435 183 q 913 297 913 183 q 674 410 913 410 q 492 382 549 410 q 435 297 435 354 m 524 801 q 501 789 524 801 q 479 732 479 778 q 524 664 479 686 q 674 642 568 642 q 824 664 781 642 q 868 732 868 686 q 824 801 868 778 q 674 824 779 824 q 524 801 568 824 z "
		},
		9: {
			ha: 1288,
			x_min: 78,
			x_max: 1207,
			o:
				"m 624 1021 q 1050 885 893 1021 q 1207 515 1207 749 q 1028 119 1207 265 q 547 -28 850 -28 q 161 3 347 -28 l 161 239 q 517 211 343 211 q 842 385 772 211 q 522 315 697 315 q 197 406 317 315 q 78 649 78 496 q 226 920 78 819 q 624 1021 374 1021 m 421 640 q 481 541 421 578 q 643 504 542 504 q 803 542 743 504 q 863 643 863 581 q 803 745 863 707 q 646 783 744 783 q 482 744 543 783 q 421 640 421 706 z "
		},
		"­": {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		"²": {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		"³": {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		µ: {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		"¹": {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		º: {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		Ĩ: {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		ĩ: {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		Ĭ: {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		ĭ: {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		"̉": {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		"―": {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		"‖": {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		"‗": {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		"‛": {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		"‟": {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		"‣": {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		"․": {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		"‥": {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		"∐": {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		"∑": {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		"≡": {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		"≢": {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		"≣": {
			ha: 722,
			x_min: 135,
			x_max: 592,
			o:
				"m 592 1111 l 592 -333 l 135 -333 l 135 1111 l 592 1111 m 242 -233 l 481 -233 l 481 -186 l 333 -186 l 435 -118 l 481 -118 l 481 -71 l 242 -71 l 242 -118 l 342 -118 l 242 -186 l 242 -233 m 242 -37 l 481 -37 l 481 126 l 242 126 l 242 -37 m 242 213 l 481 213 l 481 376 l 336 376 l 336 294 l 386 294 l 386 328 l 433 328 l 433 260 l 289 260 l 289 376 l 242 376 l 242 213 m 242 408 l 481 408 l 481 553 l 433 553 l 433 457 l 242 457 l 242 408 m 242 490 l 386 490 l 386 592 l 481 592 l 481 639 l 242 639 l 242 592 l 336 592 l 336 538 l 242 538 l 242 490 m 242 678 l 481 678 l 481 726 l 386 726 l 386 828 l 242 828 l 242 678 m 242 865 l 481 865 l 481 914 l 386 914 l 386 967 l 481 967 l 481 1014 l 243 1014 l 243 967 l 336 967 l 336 914 l 242 914 l 242 865 m 289 11 l 289 78 l 433 78 l 433 11 l 289 11 m 289 726 l 289 779 l 336 779 l 336 726 l 289 726 z "
		},
		" ": { ha: 542, x_min: 0, x_max: 0, o: "" },
		" ": { ha: 542, x_min: 0, x_max: 0, o: "" },
		"!": {
			ha: 532,
			x_min: 85,
			x_max: 449,
			o:
				"m 99 336 l 85 1001 l 449 1001 l 433 336 l 99 336 m 97 0 l 97 251 l 436 251 l 436 0 l 97 0 z "
		},
		'"': {
			ha: 968,
			x_min: 82,
			x_max: 886,
			o:
				"m 553 553 l 524 1085 l 886 1085 l 858 553 l 553 553 m 82 1085 l 444 1085 l 417 553 l 111 553 l 82 1085 z "
		},
		"#": {
			ha: 1818,
			x_min: 96,
			x_max: 1722,
			o:
				"m 883 -208 l 960 43 l 622 43 l 546 -208 l 240 -208 l 317 43 l 96 43 l 96 276 l 388 276 l 472 557 l 232 557 l 232 790 l 543 790 l 636 1097 l 942 1097 l 849 790 l 1186 790 l 1279 1097 l 1583 1097 l 1490 790 l 1722 790 l 1722 557 l 1419 557 l 1335 276 l 1586 276 l 1586 43 l 1265 43 l 1189 -208 l 883 -208 m 693 276 l 1031 276 l 1115 557 l 778 557 l 693 276 z "
		},
		$: {
			ha: 1367,
			x_min: 68,
			x_max: 1300,
			o:
				"m 581 -139 l 581 -24 q 205 76 333 -8 q 68 329 76 161 l 407 329 q 581 214 407 235 l 581 388 q 202 485 321 408 q 83 714 83 563 q 215 932 83 854 q 581 1019 346 1010 l 581 1111 l 779 1111 l 779 1015 q 1129 912 1008 997 q 1258 681 1250 826 l 919 681 q 779 778 919 760 l 779 621 q 957 602 886 613 q 1099 569 1028 592 q 1210 515 1169 547 q 1275 429 1250 482 q 1300 304 1300 376 q 1169 58 1300 133 q 779 -26 1038 -18 l 779 -139 l 581 -139 m 422 714 q 453 664 422 681 q 581 636 485 647 l 581 783 q 422 714 422 776 m 779 210 q 924 235 886 215 q 961 292 961 254 q 927 348 961 332 q 779 374 893 364 l 779 210 z "
		},
		"%": {
			ha: 2090,
			x_min: 82,
			x_max: 2008,
			o:
				"m 599 0 l 1226 1001 l 1492 1001 l 863 0 l 599 0 m 82 692 q 187 925 82 826 q 476 1024 292 1024 q 766 925 661 1024 q 871 692 871 826 q 766 456 871 554 q 476 357 661 357 q 187 456 292 357 q 82 692 82 554 m 329 692 q 364 590 329 631 q 476 549 399 549 q 590 590 554 549 q 625 692 625 631 q 590 792 625 751 q 476 832 554 832 q 364 792 399 832 q 329 692 329 751 m 1219 303 q 1324 538 1219 440 q 1614 636 1429 636 q 1903 538 1799 636 q 2008 303 2008 440 q 1903 69 2008 167 q 1614 -29 1799 -29 q 1324 69 1429 -29 q 1219 303 1219 167 m 1465 303 q 1501 203 1465 243 q 1614 163 1536 163 q 1726 203 1690 163 q 1761 303 1761 243 q 1726 405 1761 364 q 1614 446 1690 446 q 1501 405 1536 446 q 1465 303 1465 364 z "
		},
		"&": {
			ha: 1569,
			x_min: 81,
			x_max: 1488,
			o:
				"m 574 -28 q 208 44 335 -28 q 81 251 81 117 q 145 404 81 342 q 358 517 210 467 q 257 625 288 574 q 226 738 226 676 q 339 929 226 858 q 644 1000 451 1000 q 935 933 825 1000 q 1044 756 1044 867 q 974 608 1044 669 q 756 506 903 547 l 1014 328 q 1086 532 1068 406 l 1335 532 q 1199 200 1314 335 l 1488 0 l 1101 0 l 1014 61 q 574 -28 833 -28 m 403 299 q 649 179 403 179 q 817 197 746 179 l 490 425 q 403 299 403 372 m 519 717 q 539 665 519 689 q 606 610 558 642 l 631 593 q 758 649 719 619 q 796 721 796 679 q 760 784 796 761 q 661 807 724 807 q 558 782 596 807 q 519 717 519 757 z "
		},
		"'": {
			ha: 526,
			x_min: 82,
			x_max: 444,
			o: "m 111 553 l 82 1085 l 444 1085 l 417 553 l 111 553 z "
		},
		"(": {
			ha: 886,
			x_min: 82,
			x_max: 803,
			o:
				"m 803 -278 q 505 -243 632 -278 q 280 -129 378 -208 q 132 87 182 -50 q 82 417 82 224 q 132 747 82 610 q 280 962 182 883 q 506 1076 378 1040 q 803 1111 633 1111 l 803 861 q 579 823 663 861 q 452 687 496 785 q 408 417 408 589 q 453 146 408 244 q 580 10 497 47 q 803 -28 663 -28 l 803 -278 z "
		},
		")": {
			ha: 886,
			x_min: 83,
			x_max: 804,
			o:
				"m 83 1111 q 381 1076 254 1111 q 606 963 508 1042 q 754 747 704 883 q 804 417 804 610 q 754 87 804 224 q 606 -128 704 -50 q 381 -242 508 -207 q 83 -278 253 -278 l 83 -28 q 307 10 224 -28 q 434 147 390 49 q 478 417 478 244 q 433 688 478 589 q 306 824 389 786 q 83 861 224 861 l 83 1111 z "
		},
		"*": {
			ha: 900,
			x_min: 82,
			x_max: 818,
			o:
				"m 354 463 l 389 699 l 164 551 l 82 708 l 343 801 l 82 896 l 164 1051 l 389 904 l 354 1140 l 546 1140 l 514 904 l 738 1053 l 818 896 l 556 801 l 818 708 l 738 553 l 514 699 l 546 463 l 354 463 z "
		},
		"+": {
			ha: 1269,
			x_min: 82,
			x_max: 1186,
			o:
				"m 488 0 l 488 356 l 82 356 l 82 589 l 488 589 l 488 944 l 781 944 l 781 589 l 1186 589 l 1186 356 l 781 356 l 781 0 l 488 0 z "
		},
		",": {
			ha: 503,
			x_min: 82,
			x_max: 421,
			o:
				"m 113 -306 l 208 0 l 82 0 l 82 253 l 421 253 l 421 0 l 263 -306 l 113 -306 z "
		},
		"-": {
			ha: 1324,
			x_min: 110,
			x_max: 1214,
			o: "m 110 356 l 110 589 l 1214 589 l 1214 356 l 110 356 z "
		},
		".": {
			ha: 503,
			x_min: 82,
			x_max: 421,
			o: "m 82 0 l 82 253 l 421 253 l 421 0 l 82 0 z "
		},
		"/": {
			ha: 894,
			x_min: 96,
			x_max: 799,
			o: "m 96 -208 l 493 1097 l 799 1097 l 403 -208 l 96 -208 z "
		},
		":": {
			ha: 503,
			x_min: 82,
			x_max: 421,
			o:
				"m 82 0 l 82 253 l 421 253 l 421 0 l 82 0 m 82 417 l 82 669 l 421 669 l 421 417 l 82 417 z "
		},
		";": {
			ha: 503,
			x_min: 82,
			x_max: 421,
			o:
				"m 113 -306 l 208 0 l 82 0 l 82 253 l 421 253 l 421 0 l 263 -306 l 113 -306 m 82 417 l 82 669 l 421 669 l 421 417 l 82 417 z "
		},
		"<": {
			ha: 1267,
			x_min: 82,
			x_max: 1185,
			o:
				"m 1185 829 l 1185 563 l 339 472 l 1185 381 l 1185 114 l 82 265 l 82 679 l 1185 829 z "
		},
		"=": {
			ha: 1268,
			x_min: 82,
			x_max: 1186,
			o:
				"m 82 578 l 82 811 l 1186 811 l 1186 578 l 82 578 m 82 133 l 82 367 l 1186 367 l 1186 133 l 82 133 z "
		},
		">": {
			ha: 1267,
			x_min: 82,
			x_max: 1185,
			o:
				"m 82 115 l 82 382 l 928 472 l 82 564 l 82 831 l 1185 679 l 1185 265 l 82 115 z "
		},
		"?": {
			ha: 1188,
			x_min: 86,
			x_max: 1111,
			o:
				"m 410 329 q 447 474 410 414 q 538 565 485 535 q 644 618 592 596 q 735 665 697 640 q 772 724 772 690 q 619 803 772 803 q 399 633 399 803 l 86 633 q 632 1021 106 1021 q 986 953 861 1021 q 1111 763 1111 886 q 1083 656 1111 701 q 1011 586 1054 611 q 917 535 968 561 q 824 487 867 510 q 752 424 781 464 q 724 329 724 383 l 410 329 m 397 0 l 397 253 l 736 253 l 736 0 l 397 0 z "
		},
		"@": {
			ha: 2024,
			x_min: 68,
			x_max: 1956,
			o:
				"m 1033 -358 q 324 -159 579 -358 q 68 382 68 40 q 331 935 68 731 q 1057 1139 593 1139 q 1718 959 1481 1139 q 1956 472 1956 779 q 1842 138 1956 263 q 1538 13 1728 13 q 1350 56 1429 13 q 1235 178 1271 99 q 911 26 1143 26 q 631 121 735 26 q 528 386 528 215 q 631 652 528 557 q 911 747 735 747 q 1207 635 1110 747 l 1207 728 l 1425 728 l 1425 335 q 1462 240 1425 275 q 1560 206 1499 206 q 1669 271 1628 206 q 1711 443 1711 336 q 1540 800 1711 669 q 1057 931 1369 931 q 508 785 703 931 q 313 390 313 640 q 506 -6 313 139 q 1049 -150 699 -150 q 1489 -94 1260 -150 l 1544 -292 q 1033 -358 1326 -358 m 817 501 q 788 480 817 501 q 760 386 760 460 q 817 272 760 313 q 972 232 874 232 q 1147 272 1086 232 q 1207 386 1207 313 q 1147 502 1207 463 q 972 542 1088 542 q 817 501 874 542 z "
		},
		A: {
			ha: 1574,
			x_min: 68,
			x_max: 1506,
			o:
				"m 68 0 l 579 997 l 996 997 l 1506 0 l 1157 0 l 1069 185 l 504 185 l 415 0 l 68 0 m 615 419 l 957 419 l 786 776 l 615 419 z "
		},
		B: {
			ha: 1319,
			x_min: 82,
			x_max: 1251,
			o:
				"m 82 0 l 82 997 l 853 997 q 1116 933 1038 997 q 1194 753 1194 869 q 1022 522 1194 583 q 1251 275 1251 464 q 1169 73 1251 146 q 910 0 1086 0 l 82 0 m 408 236 l 806 236 q 848 238 832 236 q 881 248 864 240 q 905 273 897 256 q 913 318 913 290 q 885 385 913 371 q 806 400 858 400 l 408 400 l 408 236 m 408 599 l 750 599 q 813 603 790 599 q 851 626 835 607 q 868 682 868 644 q 840 747 868 733 q 750 761 813 761 l 408 761 l 408 599 z "
		},
		C: {
			ha: 1454,
			x_min: 68,
			x_max: 1386,
			o:
				"m 731 -28 q 249 116 431 -28 q 68 499 68 260 q 249 878 68 736 q 731 1021 431 1021 q 1187 903 1007 1021 q 1386 594 1367 786 l 1039 594 q 942 704 1026 661 q 731 747 857 747 q 497 679 585 747 q 408 499 408 611 q 497 317 408 386 q 731 247 585 247 q 942 291 857 247 q 1039 401 1026 335 l 1386 401 q 1187 90 1367 207 q 731 -28 1007 -28 z "
		},
		D: {
			ha: 1361,
			x_min: 82,
			x_max: 1293,
			o:
				"m 82 0 l 82 997 l 794 997 q 1152 857 1011 997 q 1293 500 1293 717 q 1152 142 1293 283 q 794 0 1011 0 l 82 0 m 408 275 l 663 275 q 956 500 956 275 q 663 722 956 722 l 408 722 l 408 275 z "
		},
		E: {
			ha: 1185,
			x_min: 82,
			x_max: 1101,
			o:
				"m 82 0 l 82 997 l 1101 997 l 1101 751 l 408 751 l 408 611 l 1074 611 l 1074 388 l 408 388 l 408 246 l 1101 246 l 1101 0 l 82 0 z "
		},
		F: {
			ha: 1185,
			x_min: 82,
			x_max: 1101,
			o:
				"m 82 0 l 82 997 l 1101 997 l 1101 722 l 408 722 l 408 556 l 1018 556 l 1018 281 l 408 281 l 408 0 l 82 0 z "
		},
		G: {
			ha: 1465,
			x_min: 67,
			x_max: 1399,
			o:
				"m 769 -28 q 258 114 450 -28 q 67 493 67 256 q 252 877 67 733 q 747 1021 438 1021 q 1208 913 1029 1021 q 1399 628 1386 804 l 1049 628 q 952 710 1035 676 q 750 744 869 744 q 501 674 593 744 q 410 493 410 604 q 510 313 410 376 q 789 249 610 249 q 1136 306 990 249 l 1136 354 l 722 354 l 722 557 l 1399 557 l 1399 126 q 1117 13 1286 53 q 769 -28 947 -28 z "
		},
		H: {
			ha: 1414,
			x_min: 82,
			x_max: 1332,
			o:
				"m 82 0 l 82 997 l 408 997 l 408 636 l 1006 636 l 1006 997 l 1332 997 l 1332 0 l 1006 0 l 1006 363 l 408 363 l 408 0 l 82 0 z "
		},
		I: {
			ha: 490,
			x_min: 82,
			x_max: 408,
			o: "m 82 0 l 82 997 l 408 997 l 408 0 l 82 0 z "
		},
		J: {
			ha: 1321,
			x_min: 82,
			x_max: 1240,
			o:
				"m 661 -28 q 82 488 82 -28 l 408 488 q 661 247 408 247 q 913 488 913 247 l 913 722 l 539 722 l 539 997 l 1240 997 l 1240 488 q 1101 101 1240 231 q 661 -28 963 -28 z "
		},
		K: {
			ha: 1401,
			x_min: 82,
			x_max: 1333,
			o:
				"m 82 0 l 82 997 l 408 997 l 408 601 l 853 997 l 1333 997 l 864 596 l 1333 0 l 936 0 l 629 396 l 408 208 l 408 0 l 82 0 z "
		},
		L: {
			ha: 1126,
			x_min: 82,
			x_max: 1074,
			o: "m 82 0 l 82 997 l 408 997 l 408 275 l 1074 275 l 1074 0 l 82 0 z "
		},
		M: {
			ha: 1772,
			x_min: 82,
			x_max: 1690,
			o:
				"m 82 0 l 82 997 l 592 997 l 888 376 l 1182 997 l 1690 997 l 1690 0 l 1364 0 l 1364 688 l 1039 0 l 735 0 l 408 688 l 408 0 l 82 0 z "
		},
		N: {
			ha: 1483,
			x_min: 82,
			x_max: 1401,
			o:
				"m 82 0 l 82 997 l 565 997 l 1075 314 l 1075 997 l 1401 997 l 1401 0 l 918 0 l 408 685 l 408 0 l 82 0 z "
		},
		O: {
			ha: 1535,
			x_min: 68,
			x_max: 1467,
			o:
				"m 767 -28 q 258 116 449 -28 q 68 499 68 260 q 258 878 68 736 q 767 1021 449 1021 q 1276 878 1086 1021 q 1467 499 1467 736 q 1276 115 1467 258 q 767 -28 1086 -28 m 408 499 q 506 316 408 385 q 767 247 604 247 q 1030 316 932 247 q 1128 499 1128 385 q 1030 679 1128 611 q 767 747 932 747 q 506 679 603 747 q 408 499 408 611 z "
		},
		P: {
			ha: 1331,
			x_min: 82,
			x_max: 1263,
			o:
				"m 82 0 l 82 997 l 863 997 q 1156 898 1050 997 q 1263 622 1263 799 q 1156 347 1263 446 q 863 247 1049 247 l 408 247 l 408 0 l 82 0 m 408 521 l 785 521 q 890 542 858 521 q 922 622 922 564 q 890 701 922 681 q 785 722 858 722 l 408 722 l 408 521 z "
		},
		Q: {
			ha: 1510,
			x_min: 68,
			x_max: 1467,
			o:
				"m 1250 -83 l 1121 31 q 767 -28 965 -28 q 258 116 449 -28 q 68 499 68 260 q 258 878 68 736 q 767 1021 449 1021 q 1276 878 1086 1021 q 1467 499 1467 736 q 1319 151 1467 290 l 1408 74 l 1250 -83 m 408 499 q 506 316 408 385 q 767 247 604 247 q 868 256 819 247 l 719 386 l 876 543 l 1081 363 q 1128 499 1128 422 q 1030 679 1128 611 q 767 747 932 747 q 506 679 603 747 q 408 499 408 611 z "
		},
		R: {
			ha: 1399,
			x_min: 82,
			x_max: 1304,
			o:
				"m 82 0 l 408 0 l 408 282 l 863 282 q 953 258 929 282 q 976 167 976 233 l 976 0 l 1303 0 l 1303 219 q 1247 363 1303 310 q 1094 424 1192 417 q 1304 692 1304 486 q 894 997 1304 997 l 82 997 l 82 0 m 408 543 l 408 736 l 817 736 q 927 716 890 736 q 964 640 964 696 q 927 563 964 583 q 817 543 890 543 l 408 543 z "
		},
		S: {
			ha: 1367,
			x_min: 68,
			x_max: 1300,
			o:
				"m 713 -28 q 239 56 400 -28 q 68 329 78 139 l 407 329 q 699 208 407 208 q 865 219 806 208 q 942 246 924 229 q 961 292 961 263 q 940 339 961 324 q 864 363 919 354 q 682 381 808 372 l 633 383 q 214 477 344 400 q 83 714 83 554 q 233 942 83 864 q 644 1021 382 1021 q 1093 934 938 1021 q 1258 681 1249 847 l 919 681 q 853 760 919 736 q 642 785 786 785 q 469 767 517 785 q 422 714 422 749 q 472 656 422 674 q 683 628 521 639 l 740 624 q 879 611 824 617 q 999 594 935 606 q 1104 567 1063 582 q 1186 529 1146 553 q 1249 475 1226 506 q 1286 401 1272 444 q 1300 304 1300 358 q 1152 48 1300 124 q 713 -28 1004 -28 z "
		},
		T: {
			ha: 1322,
			x_min: 68,
			x_max: 1254,
			o:
				"m 68 722 l 68 997 l 1254 997 l 1254 722 l 825 722 l 825 0 l 499 0 l 499 722 l 68 722 z "
		},
		U: {
			ha: 1376,
			x_min: 82,
			x_max: 1296,
			o:
				"m 689 -28 q 228 101 374 -28 q 82 488 82 231 l 82 997 l 408 997 l 408 499 q 689 247 408 247 q 826 269 769 247 q 913 328 883 290 q 956 407 943 365 q 968 499 968 449 l 968 997 l 1296 997 l 1296 488 q 1149 101 1296 231 q 689 -28 1003 -28 z "
		},
		V: {
			ha: 1574,
			x_min: 68,
			x_max: 1506,
			o:
				"m 553 0 l 68 997 l 415 997 l 786 221 l 1157 997 l 1506 997 l 1018 0 l 553 0 z "
		},
		W: {
			ha: 2301,
			x_min: 68,
			x_max: 2233,
			o:
				"m 399 0 l 68 997 l 397 997 l 640 244 l 935 997 l 1367 997 l 1661 244 l 1904 997 l 2233 997 l 1903 0 l 1433 0 l 1151 735 l 869 0 l 399 0 z "
		},
		X: {
			ha: 1575,
			x_min: 68,
			x_max: 1507,
			o:
				"m 68 0 l 565 499 l 68 997 l 508 997 l 789 693 l 1068 997 l 1507 997 l 1011 499 l 1507 0 l 1068 0 l 789 304 l 508 0 l 68 0 z "
		},
		Y: {
			ha: 1543,
			x_min: 68,
			x_max: 1475,
			o:
				"m 608 0 l 608 333 l 68 997 l 474 997 l 771 607 l 1069 997 l 1475 997 l 935 333 l 935 0 l 608 0 z "
		},
		Z: {
			ha: 1279,
			x_min: 82,
			x_max: 1199,
			o:
				"m 82 0 l 82 275 l 726 722 l 82 722 l 82 997 l 1199 997 l 1199 722 l 550 275 l 1199 275 l 1199 0 l 82 0 z "
		},
		"[": {
			ha: 886,
			x_min: 82,
			x_max: 803,
			o:
				"m 82 -278 l 82 1111 l 803 1111 l 803 861 l 408 861 l 408 -28 l 803 -28 l 803 -278 l 82 -278 z "
		},
		"\\": {
			ha: 865,
			x_min: 82,
			x_max: 783,
			o: "m 478 -208 l 82 1097 l 388 1097 l 783 -208 l 478 -208 z "
		},
		"]": {
			ha: 886,
			x_min: 83,
			x_max: 804,
			o:
				"m 804 1111 l 804 -278 l 83 -278 l 83 -28 l 478 -28 l 478 861 l 83 861 l 83 1111 l 804 1111 z "
		},
		"^": {
			ha: 1268,
			x_min: 82,
			x_max: 1186,
			o:
				"m 82 486 l 426 1111 l 844 1111 l 1186 486 l 886 486 l 635 963 l 382 486 l 82 486 z "
		},
		_: {
			ha: 1601,
			x_min: 110,
			x_max: 1492,
			o: "m 110 -304 l 110 -57 l 1492 -57 l 1492 -304 l 110 -304 z "
		},
		"`": {
			ha: 746,
			x_min: 139,
			x_max: 676,
			o: "m 676 928 l 139 1039 l 139 1201 l 676 1090 l 676 928 z "
		},
		a: {
			ha: 1318,
			x_min: 61,
			x_max: 1238,
			o:
				"m 446 -29 q 167 41 274 -29 q 61 250 61 111 q 101 388 61 331 q 210 477 140 446 q 359 522 279 508 q 535 536 439 536 q 914 490 735 536 q 851 602 911 569 q 661 635 790 635 q 168 564 472 635 l 129 793 q 722 863 447 863 q 1114 763 990 863 q 1238 435 1238 664 l 1238 0 l 914 0 l 914 110 q 681 7 808 43 q 446 -29 554 -29 m 397 267 q 554 185 397 185 q 730 206 624 185 q 914 253 836 226 l 914 322 q 579 357 693 357 q 438 336 479 357 q 397 267 397 315 z "
		},
		b: {
			ha: 1357,
			x_min: 82,
			x_max: 1303,
			o:
				"m 82 0 l 82 1111 l 403 1111 l 403 671 q 569 813 464 763 q 808 863 674 863 q 1168 742 1033 863 q 1303 418 1303 621 q 1168 94 1303 215 q 808 -28 1033 -28 q 569 22 674 -28 q 403 165 464 72 l 403 0 l 82 0 m 482 548 q 442 524 482 548 q 403 418 403 500 q 482 288 403 336 q 699 239 561 239 q 896 288 825 239 q 967 418 967 336 q 896 548 967 500 q 699 596 825 596 q 482 548 561 596 z "
		},
		c: {
			ha: 1317,
			x_min: 53,
			x_max: 1264,
			o:
				"m 660 -28 q 218 94 383 -28 q 53 418 53 215 q 218 742 53 621 q 660 863 383 863 q 1072 763 907 863 q 1264 496 1236 664 l 939 496 q 842 581 918 550 q 660 613 767 613 q 451 560 529 613 q 372 418 372 507 q 451 276 372 329 q 660 222 529 222 q 842 254 767 222 q 939 339 918 286 l 1264 339 q 1072 72 1236 172 q 660 -28 907 -28 z "
		},
		d: {
			ha: 1357,
			x_min: 54,
			x_max: 1276,
			o:
				"m 954 0 l 954 163 q 788 21 893 71 q 549 -29 683 -29 q 189 92 324 -29 q 54 415 54 213 q 189 740 54 618 q 549 861 324 861 q 788 811 683 861 q 954 668 893 761 l 954 1111 l 1276 1111 l 1276 0 l 954 0 m 461 546 q 426 522 461 546 q 390 415 390 497 q 461 285 390 333 q 658 238 532 238 q 875 285 796 238 q 954 415 954 333 q 875 546 954 497 q 658 594 796 594 q 461 546 532 594 z "
		},
		e: {
			ha: 1326,
			x_min: 51,
			x_max: 1274,
			o:
				"m 661 -28 q 217 93 382 -28 q 53 417 51 214 q 217 742 53 621 q 660 863 382 863 q 1114 732 954 863 q 1274 353 1274 601 l 383 353 q 681 196 424 196 q 854 223 781 196 q 953 296 928 250 l 1267 296 q 1070 51 1215 132 q 661 -28 925 -29 m 390 507 l 942 507 q 672 639 889 639 q 390 507 440 639 z "
		},
		f: {
			ha: 944,
			x_min: 53,
			x_max: 892,
			o:
				"m 247 871 q 347 1068 247 996 q 649 1140 447 1140 q 892 1126 785 1140 l 892 924 q 729 933 760 933 q 601 911 635 933 q 567 835 568 889 l 892 835 l 892 600 l 567 600 l 567 0 l 247 0 l 247 600 l 53 600 l 53 835 l 247 835 l 247 871 z "
		},
		g: {
			ha: 1354,
			x_min: 54,
			x_max: 1274,
			o:
				"m 696 -361 q 97 -292 426 -361 l 146 -54 q 639 -111 447 -111 q 882 -70 811 -111 q 953 65 953 -29 l 953 161 q 788 22 892 71 q 549 -28 683 -28 q 189 93 324 -28 q 54 417 54 214 q 189 741 54 619 q 549 863 324 863 q 788 813 683 863 q 953 672 892 763 l 953 835 l 1274 835 l 1274 82 q 1135 -253 1274 -146 q 696 -361 997 -361 m 461 547 q 426 523 461 547 q 390 417 390 499 q 461 287 390 335 q 658 239 532 239 q 864 281 786 239 q 953 396 942 324 l 953 438 q 864 553 942 510 q 658 596 786 596 q 461 547 532 596 z "
		},
		h: {
			ha: 1381,
			x_min: 82,
			x_max: 1300,
			o:
				"m 82 0 l 82 1111 l 403 1111 l 403 638 q 881 863 581 863 q 1300 447 1300 863 l 1300 0 l 978 0 l 978 325 q 920 534 978 469 q 719 599 863 599 q 484 531 565 599 q 403 329 403 463 l 403 0 l 82 0 z "
		},
		i: {
			ha: 483,
			x_min: 82,
			x_max: 403,
			o:
				"m 82 0 l 82 835 l 403 835 l 403 0 l 82 0 m 82 919 l 82 1111 l 403 1111 l 403 919 l 82 919 z "
		},
		j: {
			ha: 735,
			x_min: 26,
			x_max: 654,
			o:
				"m 271 -361 q 26 -339 153 -361 l 26 -126 q 200 -140 140 -140 q 306 -111 279 -140 q 333 11 333 -82 l 333 835 l 654 835 l 654 29 q 271 -361 654 -361 m 333 919 l 333 1111 l 654 1111 l 654 919 l 333 919 z "
		},
		k: {
			ha: 1344,
			x_min: 82,
			x_max: 1292,
			o:
				"m 82 0 l 82 1111 l 403 1111 l 403 529 l 811 835 l 1292 835 l 825 494 l 1292 0 l 899 0 l 601 332 l 403 186 l 403 0 l 82 0 z "
		},
		l: {
			ha: 485,
			x_min: 82,
			x_max: 403,
			o: "m 82 0 l 82 1111 l 403 1111 l 403 0 l 82 0 z "
		},
		m: {
			ha: 1947,
			x_min: 81,
			x_max: 1868,
			o:
				"m 1544 407 q 1499 553 1544 511 q 1356 596 1453 596 q 1136 411 1136 596 l 1136 0 l 813 0 l 813 407 q 767 553 813 511 q 625 596 722 596 q 406 411 406 596 l 406 0 l 81 0 l 81 835 l 406 835 l 406 697 q 771 863 549 863 q 974 812 886 863 q 1103 654 1061 761 q 1501 863 1254 863 q 1765 765 1661 863 q 1868 460 1868 667 l 1868 0 l 1544 0 l 1544 407 z "
		},
		n: {
			ha: 1382,
			x_min: 81,
			x_max: 1301,
			o:
				"m 81 0 l 81 835 l 406 835 l 406 647 q 883 863 581 863 q 1301 447 1301 863 l 1301 0 l 976 0 l 976 325 q 919 532 976 468 q 721 596 863 596 q 486 528 567 596 q 406 329 406 461 l 406 0 l 81 0 z "
		},
		o: {
			ha: 1319,
			x_min: 53,
			x_max: 1267,
			o:
				"m 1101 94 q 1018 33 1101 94 q 660 -28 935 -28 q 219 94 385 -28 q 53 418 53 215 q 219 742 53 621 q 660 863 385 863 q 1101 742 935 863 q 1267 418 1267 621 q 1101 94 1267 215 m 453 560 q 414 533 453 560 q 375 418 375 507 q 453 276 375 329 q 660 222 531 222 q 867 276 789 222 q 944 418 944 329 q 867 560 944 507 q 660 613 789 613 q 453 560 531 613 z "
		},
		p: {
			ha: 1357,
			x_min: 82,
			x_max: 1303,
			o:
				"m 82 -339 l 82 835 l 403 835 l 403 671 q 569 813 464 763 q 808 863 674 863 q 1168 742 1033 863 q 1303 418 1303 621 q 1168 94 1303 215 q 808 -28 1033 -28 q 569 22 674 -28 q 403 165 464 72 l 403 -339 l 82 -339 m 482 548 q 442 524 482 548 q 403 418 403 500 q 482 288 403 336 q 699 239 561 239 q 896 288 825 239 q 967 418 967 336 q 896 548 967 500 q 699 596 825 596 q 482 548 561 596 z "
		},
		q: {
			ha: 1357,
			x_min: 54,
			x_max: 1276,
			o:
				"m 1276 835 l 1276 -337 l 954 -337 l 954 163 q 788 21 893 71 q 549 -29 683 -29 q 189 92 324 -29 q 54 415 54 213 q 189 740 54 618 q 549 861 324 861 q 788 811 683 861 q 954 668 893 761 l 954 835 l 1276 835 m 461 546 q 426 522 461 546 q 390 415 390 497 q 461 285 390 333 q 658 238 532 238 q 875 285 796 238 q 954 415 954 333 q 875 546 954 497 q 658 594 796 594 q 461 546 532 594 z "
		},
		r: {
			ha: 997,
			x_min: 82,
			x_max: 943,
			o:
				"m 82 0 l 82 835 l 403 835 l 403 653 q 547 813 465 764 q 740 863 628 863 q 943 821 846 863 l 943 542 q 728 583 828 583 q 403 408 533 583 l 403 0 l 82 0 z "
		},
		s: {
			ha: 1231,
			x_min: 51,
			x_max: 1178,
			o:
				"m 636 -28 q 201 44 351 -28 q 53 278 51 117 l 389 278 q 441 206 389 229 q 631 182 493 182 q 801 199 754 182 q 847 254 847 217 q 803 306 847 292 q 626 332 758 321 l 554 338 q 180 407 288 358 q 72 585 72 456 q 608 863 72 863 q 819 847 725 863 q 986 799 913 832 q 1101 712 1060 767 q 1149 582 1143 657 l 813 582 q 601 665 811 665 q 403 604 403 665 q 442 560 403 574 q 604 538 482 547 l 690 531 q 864 513 797 522 q 997 486 931 504 q 1099 442 1064 468 q 1156 372 1135 415 q 1178 269 1178 329 q 1140 124 1178 183 q 1026 33 1101 65 q 858 -14 951 0 q 636 -28 764 -28 z "
		},
		t: {
			ha: 929,
			x_min: 53,
			x_max: 876,
			o:
				"m 590 -28 q 313 42 408 -28 q 218 250 218 111 l 218 600 l 53 600 l 53 835 l 218 835 l 218 988 l 538 1071 l 538 835 l 876 835 l 876 600 l 538 600 l 538 367 q 665 236 538 236 q 876 264 749 236 l 876 8 q 590 -28 732 -28 z "
		},
		u: {
			ha: 1382,
			x_min: 81,
			x_max: 1301,
			o:
				"m 1301 835 l 1301 0 l 976 0 l 976 188 q 499 -28 801 -28 q 81 388 81 -28 l 81 835 l 406 835 l 406 510 q 463 303 406 367 q 661 239 519 239 q 895 306 814 239 q 976 506 976 374 l 976 835 l 1301 835 z "
		},
		v: {
			ha: 1381,
			x_min: 53,
			x_max: 1326,
			o:
				"m 454 0 l 53 835 l 414 835 l 692 213 l 968 835 l 1326 835 l 925 0 l 454 0 z "
		},
		w: {
			ha: 2240,
			x_min: 53,
			x_max: 2188,
			o:
				"m 415 0 l 53 835 l 406 835 l 646 239 l 910 835 l 1331 835 l 1596 240 l 1836 835 l 2188 835 l 1825 0 l 1371 0 l 1121 558 l 869 0 l 415 0 z "
		},
		x: {
			ha: 1383,
			x_min: 53,
			x_max: 1331,
			o:
				"m 53 0 l 476 418 l 53 835 l 468 835 l 693 582 l 917 835 l 1331 835 l 908 418 l 1331 0 l 917 0 l 693 253 l 468 0 l 53 0 z "
		},
		y: {
			ha: 1386,
			x_min: 53,
			x_max: 1333,
			o:
				"m 435 -361 q 122 -311 292 -361 l 122 -69 q 390 -111 310 -111 q 510 -92 474 -111 q 588 0 547 -72 l 449 0 l 53 835 l 400 835 l 693 218 l 986 835 l 1333 835 l 949 28 q 739 -265 857 -168 q 435 -361 621 -361 z "
		},
		z: {
			ha: 1150,
			x_min: 82,
			x_max: 1068,
			o:
				"m 82 0 l 82 235 l 650 600 l 82 600 l 82 835 l 1068 835 l 1068 600 l 501 235 l 1068 235 l 1068 0 l 82 0 z "
		},
		"{": {
			ha: 961,
			x_min: 110,
			x_max: 878,
			o:
				"m 769 -275 q 373 -194 490 -275 q 283 81 256 -114 l 296 169 q 272 264 304 235 q 168 293 239 293 l 110 293 l 110 543 l 168 543 q 272 573 239 543 q 296 667 304 603 l 283 756 q 373 1031 256 950 q 769 1111 490 1111 l 878 1111 l 878 861 l 774 861 q 643 822 689 861 q 610 704 597 783 l 622 617 q 583 476 636 521 q 440 431 531 431 l 440 406 q 583 360 531 406 q 622 219 636 315 l 610 132 q 643 14 597 53 q 774 -25 689 -25 l 878 -25 l 878 -275 l 769 -275 z "
		},
		"|": {
			ha: 456,
			x_min: 82,
			x_max: 374,
			o: "m 82 -208 l 82 1111 l 374 1111 l 374 -208 l 82 -208 z "
		},
		"}": {
			ha: 961,
			x_min: 83,
			x_max: 851,
			o:
				"m 192 1108 q 588 1028 471 1108 q 678 753 706 947 l 665 664 q 690 569 657 599 q 793 540 722 540 l 851 540 l 851 290 l 793 290 q 690 260 722 290 q 665 167 657 231 l 678 78 q 588 -197 706 -117 q 192 -278 471 -278 l 83 -278 l 83 -28 l 188 -28 q 318 11 272 -28 q 351 129 364 50 l 339 217 q 378 358 325 313 q 521 403 431 403 l 521 428 q 378 473 431 428 q 339 614 325 518 l 351 701 q 318 819 364 781 q 188 858 272 858 l 83 858 l 83 1108 l 192 1108 z "
		},
		"~": {
			ha: 1268,
			x_min: 82,
			x_max: 1186,
			o:
				"m 82 251 q 156 576 82 458 q 369 693 231 693 q 501 667 435 693 q 613 610 568 642 q 712 553 657 579 q 811 528 767 528 q 899 565 874 528 q 925 693 925 603 l 1186 693 q 1112 369 1186 486 q 899 251 1038 251 q 767 277 833 251 q 656 334 700 303 q 556 391 611 365 q 457 417 501 417 q 369 379 394 417 q 343 251 343 342 l 82 251 z "
		},
		"¡": {
			ha: 532,
			x_min: 83,
			x_max: 447,
			o:
				"m 433 499 l 447 -167 l 83 -167 l 99 499 l 433 499 m 96 583 l 96 835 l 435 835 l 435 583 l 96 583 z "
		},
		"¢": {
			ha: 1332,
			x_min: 53,
			x_max: 1264,
			o:
				"m 561 -139 l 561 43 q 190 183 326 65 q 53 485 53 301 q 190 785 53 668 q 561 925 326 903 l 561 1111 l 761 1111 l 761 925 q 1104 809 969 906 q 1264 563 1239 713 l 939 563 q 761 671 907 644 l 761 297 q 939 406 907 324 l 1264 406 q 1104 160 1239 257 q 761 43 969 64 l 761 -139 l 561 -139 m 372 485 q 422 365 372 414 q 561 299 472 317 l 561 669 q 422 603 472 651 q 372 485 372 554 z "
		},
		"£": {
			ha: 1224,
			x_min: 81,
			x_max: 1142,
			o:
				"m 81 251 q 235 406 203 350 l 81 406 l 81 544 l 250 544 q 238 587 247 554 q 224 645 229 619 q 219 703 219 671 q 351 938 219 854 q 731 1021 483 1021 q 1142 979 910 1021 l 1142 729 q 793 769 922 769 q 610 736 664 769 q 556 628 556 703 q 565 544 556 606 l 981 544 l 981 406 l 564 406 q 308 251 522 297 l 1142 251 l 1142 0 l 81 0 l 81 251 z "
		},
		"¤": {
			ha: 1350,
			x_min: 69,
			x_max: 1282,
			o:
				"m 225 -56 l 111 58 l 225 171 q 69 488 69 290 q 225 804 69 683 l 111 915 l 225 1029 l 374 883 q 676 932 504 932 q 978 885 844 932 l 1125 1029 l 1240 915 l 1126 804 q 1282 488 1282 685 q 1126 169 1282 290 l 1240 58 l 1125 -56 l 978 90 q 676 42 847 42 q 374 90 504 42 l 225 -56 m 469 629 q 430 603 469 629 q 390 488 390 576 q 469 345 390 399 q 676 292 547 292 q 883 345 806 292 q 960 488 960 399 q 882 629 960 576 q 676 682 804 682 q 469 629 547 682 z "
		},
		"¥": {
			ha: 1543,
			x_min: 68,
			x_max: 1475,
			o:
				"m 608 0 l 608 150 l 218 150 l 218 274 l 608 274 l 608 333 l 606 338 l 218 338 l 218 463 l 503 463 l 68 997 l 474 997 l 771 607 l 1069 997 l 1475 997 l 1040 463 l 1325 463 l 1325 338 l 938 338 l 935 333 l 935 274 l 1325 274 l 1325 150 l 935 150 l 935 0 l 608 0 z "
		},
		"¦": {
			ha: 456,
			x_min: 82,
			x_max: 374,
			o:
				"m 82 590 l 82 1111 l 374 1111 l 374 590 l 82 590 m 82 -208 l 82 313 l 374 313 l 374 -208 l 82 -208 z "
		},
		"§": {
			ha: 1243,
			x_min: 71,
			x_max: 1172,
			o:
				"m 636 -199 q 97 90 117 -199 l 410 90 q 463 12 411 32 q 643 -8 515 -8 q 810 14 763 -8 q 858 81 858 36 q 809 144 858 125 q 594 178 760 163 l 544 182 q 383 199 446 190 q 258 225 321 208 q 160 265 194 242 q 103 324 125 288 q 82 411 82 361 q 134 542 82 494 q 288 613 186 590 q 124 701 178 643 q 71 851 71 758 q 111 995 71 936 q 228 1085 151 1054 q 397 1130 306 1117 q 608 1143 488 1143 q 1147 851 1128 1143 l 833 851 q 780 930 832 910 q 601 950 728 950 q 432 929 481 950 q 383 863 383 908 q 431 811 383 828 q 631 779 478 794 l 686 774 q 808 761 761 767 q 910 746 854 756 q 999 726 965 736 q 1067 699 1033 715 q 1119 660 1101 682 q 1149 610 1138 639 q 1161 544 1161 581 q 1108 412 1161 460 q 951 343 1054 364 q 1118 251 1064 311 q 1172 92 1172 192 q 1132 -52 1172 7 q 1015 -142 1092 -111 q 847 -186 938 -174 q 636 -199 757 -199 m 382 488 q 432 424 382 444 q 615 392 482 403 l 657 388 q 666 387 660 388 q 675 386 672 386 q 861 467 861 374 q 808 533 861 511 q 615 565 754 556 l 589 568 l 588 568 q 382 488 382 585 z "
		},
		"¨": {
			ha: 807,
			x_min: 139,
			x_max: 738,
			o:
				"m 496 949 l 496 1101 l 738 1101 l 738 949 l 496 949 m 139 949 l 139 1101 l 382 1101 l 382 949 l 139 949 z "
		},
		"©": {
			ha: 1479,
			x_min: 68,
			x_max: 1411,
			o:
				"m 738 -29 q 250 114 432 -29 q 68 497 68 257 q 250 878 68 736 q 738 1021 432 1021 q 1228 878 1044 1021 q 1411 497 1411 736 q 1228 114 1411 257 q 738 -29 1044 -29 m 371 768 q 302 717 371 768 q 233 497 233 667 q 371 225 233 328 q 738 122 508 122 q 1106 225 968 122 q 1244 497 1244 328 q 1106 768 1244 667 q 738 869 968 869 q 371 768 508 869 m 374 496 q 472 688 374 621 q 751 756 569 756 q 996 700 904 756 q 1107 542 1088 644 l 936 542 q 736 608 914 608 q 592 580 643 608 q 540 496 540 551 q 592 412 540 440 q 736 383 643 383 q 936 450 914 383 l 1107 450 q 996 293 1088 349 q 751 238 904 238 q 471 305 568 238 q 374 496 374 372 z "
		},
		"«": {
			ha: 1492,
			x_min: 82,
			x_max: 1410,
			o:
				"m 1025 0 l 664 418 l 1025 835 l 1410 835 l 1047 418 l 1410 0 l 1025 0 m 82 418 l 443 835 l 828 835 l 465 418 l 828 0 l 443 0 l 82 418 z "
		},
		"¬": {
			ha: 1269,
			x_min: 82,
			x_max: 1189,
			o: "m 896 75 l 896 399 l 82 399 l 82 633 l 1189 633 l 1189 75 l 896 75 z "
		},
		"®": {
			ha: 1483,
			x_min: 79,
			x_max: 1364,
			o:
				"m 736 224 q 257 363 435 224 q 79 738 79 501 q 257 1110 79 971 q 736 1249 435 1249 q 1194 1110 1024 1249 q 1364 738 1364 971 q 1194 363 1364 503 q 736 224 1024 224 m 244 738 q 377 472 244 571 q 736 374 510 374 q 1072 472 947 374 q 1197 738 1197 571 q 1072 1000 1197 903 q 736 1097 947 1097 q 377 1000 510 1097 q 244 738 244 903 m 457 500 l 457 997 l 839 997 q 999 951 940 997 q 1057 824 1057 904 q 957 664 1057 707 l 1065 500 l 861 500 l 782 632 l 624 632 l 624 500 l 457 500 m 624 763 l 811 763 q 885 814 885 763 q 811 864 885 864 l 624 864 l 624 763 z "
		},
		"¯": {
			ha: 853,
			x_min: 139,
			x_max: 783,
			o: "m 139 969 l 139 1101 l 783 1101 l 783 969 l 139 969 z "
		},
		"°": {
			ha: 982,
			x_min: 82,
			x_max: 900,
			o:
				"m 490 322 q 294 351 376 322 q 167 431 211 379 q 102 543 122 483 q 82 676 82 603 q 102 809 82 749 q 167 921 122 869 q 294 1001 211 972 q 490 1029 376 1029 q 655 1010 583 1029 q 772 958 726 990 q 847 878 818 925 q 888 783 876 832 q 900 676 900 733 q 880 543 900 603 q 815 431 860 483 q 688 351 771 379 q 490 322 606 322 m 329 678 q 490 514 329 514 q 654 678 654 514 q 490 838 654 838 q 329 678 329 838 z "
		},
		"±": {
			ha: 1268,
			x_min: 82,
			x_max: 1186,
			o:
				"m 488 319 l 488 536 l 82 536 l 82 769 l 488 769 l 488 988 l 781 988 l 781 769 l 1186 769 l 1186 536 l 781 536 l 781 319 l 488 319 m 82 22 l 82 256 l 1186 256 l 1186 22 l 82 22 z "
		},
		"´": {
			ha: 746,
			x_min: 139,
			x_max: 676,
			o: "m 139 928 l 139 1090 l 676 1201 l 676 1039 l 139 928 z "
		},
		"¶": {
			ha: 1303,
			x_min: 82,
			x_max: 1222,
			o:
				"m 506 443 q 182 522 282 443 q 82 778 82 601 q 182 1033 82 954 q 506 1111 282 1111 l 796 1111 l 796 -208 l 506 -208 l 506 443 m 929 -208 l 929 1111 l 1222 1111 l 1222 -208 l 929 -208 z "
		},
		"·": {
			ha: 503,
			x_min: 82,
			x_max: 421,
			o: "m 82 319 l 82 572 l 421 572 l 421 319 l 82 319 z "
		},
		"¸": {
			ha: 654,
			x_min: 139,
			x_max: 585,
			o:
				"m 139 -217 q 324 -231 264 -236 q 385 -190 385 -225 q 340 -160 385 -160 q 281 -181 313 -157 l 186 -154 l 225 0 l 367 0 l 349 -68 q 442 -56 392 -56 q 546 -90 507 -56 q 585 -186 585 -124 q 545 -284 585 -244 q 442 -338 506 -324 q 298 -357 378 -353 q 139 -349 218 -361 l 139 -217 z "
		},
		"»": {
			ha: 1486,
			x_min: 76,
			x_max: 1404,
			o:
				"m 461 835 l 822 417 l 461 0 l 76 0 l 439 418 l 76 835 l 461 835 m 658 0 l 1021 418 l 658 835 l 1043 835 l 1404 417 l 1043 0 l 658 0 z "
		},
		"¿": {
			ha: 1188,
			x_min: 76,
			x_max: 1101,
			o:
				"m 778 506 q 740 360 778 421 q 650 269 703 300 q 544 217 597 239 q 453 169 490 194 q 415 111 415 144 q 568 32 415 32 q 789 201 789 32 l 1101 201 q 556 -186 1082 -186 q 201 -119 326 -186 q 76 72 76 -51 q 105 178 76 133 q 176 249 133 224 q 270 299 219 274 q 364 348 321 325 q 435 411 407 371 q 464 506 464 451 l 778 506 m 451 582 l 451 835 l 790 835 l 790 582 l 451 582 z "
		},
		À: {
			ha: 1574,
			x_min: 68,
			x_max: 1506,
			o:
				"m 68 0 l 579 997 l 996 997 l 1506 0 l 1157 0 l 1069 185 l 504 185 l 415 0 l 68 0 m 518 1206 l 518 1368 l 1056 1257 l 1056 1094 l 518 1206 m 615 419 l 957 419 l 786 776 l 615 419 z "
		},
		Á: {
			ha: 1574,
			x_min: 68,
			x_max: 1506,
			o:
				"m 68 0 l 579 997 l 996 997 l 1506 0 l 1157 0 l 1069 185 l 504 185 l 415 0 l 68 0 m 518 1094 l 518 1257 l 1056 1368 l 1056 1206 l 518 1094 m 615 419 l 957 419 l 786 776 l 615 419 z "
		},
		Â: {
			ha: 1574,
			x_min: 68,
			x_max: 1506,
			o:
				"m 68 0 l 579 997 l 996 997 l 1506 0 l 1157 0 l 1069 185 l 504 185 l 415 0 l 68 0 m 503 1090 l 503 1256 l 788 1367 l 1071 1256 l 1071 1090 l 788 1201 l 503 1090 m 615 419 l 957 419 l 786 776 l 615 419 z "
		},
		Ã: {
			ha: 1574,
			x_min: 68,
			x_max: 1506,
			o:
				"m 68 0 l 579 997 l 996 997 l 1506 0 l 1157 0 l 1069 185 l 504 185 l 415 0 l 68 0 m 394 1082 q 457 1306 394 1228 q 636 1383 519 1383 q 740 1362 696 1383 q 806 1315 785 1340 q 858 1267 828 1289 q 924 1246 889 1246 q 1018 1385 1018 1246 l 1179 1385 q 1117 1160 1179 1239 q 939 1082 1054 1082 q 852 1097 890 1082 q 790 1131 814 1111 q 747 1172 767 1151 q 703 1206 728 1192 q 649 1221 678 1221 q 556 1082 556 1221 l 394 1082 m 615 419 l 957 419 l 786 776 l 615 419 z "
		},
		Ä: {
			ha: 1574,
			x_min: 68,
			x_max: 1506,
			o:
				"m 68 0 l 579 997 l 996 997 l 1506 0 l 1157 0 l 1069 185 l 504 185 l 415 0 l 68 0 m 486 1115 l 486 1268 l 729 1268 l 729 1115 l 486 1115 m 615 419 l 957 419 l 786 776 l 615 419 m 843 1115 l 843 1268 l 1085 1268 l 1085 1115 l 843 1115 z "
		},
		Å: {
			ha: 1574,
			x_min: 68,
			x_max: 1506,
			o:
				"m 68 0 l 579 997 l 996 997 l 1506 0 l 1157 0 l 1069 185 l 504 185 l 415 0 l 68 0 m 786 1083 q 482 1264 482 1083 q 786 1444 482 1444 q 1089 1264 1089 1444 q 786 1083 1089 1083 m 615 419 l 957 419 l 786 776 l 615 419 m 786 1336 q 715 1336 786 1336 q 644 1264 644 1336 q 786 1192 644 1192 q 928 1264 928 1192 q 786 1336 928 1336 z "
		},
		Æ: {
			ha: 2031,
			x_min: 68,
			x_max: 1949,
			o:
				"m 68 0 l 492 997 l 1949 997 l 1949 751 l 1256 751 l 1256 611 l 1921 611 l 1921 388 l 1256 388 l 1256 246 l 1949 246 l 1949 0 l 929 0 l 929 181 l 500 181 l 422 0 l 68 0 m 600 417 l 929 417 l 929 750 l 743 750 l 600 417 z "
		},
		Ç: {
			ha: 1454,
			x_min: 68,
			x_max: 1386,
			o:
				"m 544 -231 q 730 -244 669 -250 q 790 -204 790 -239 q 746 -174 790 -174 q 686 -194 718 -171 l 592 -168 l 628 -24 q 219 141 371 1 q 68 499 68 281 q 249 878 68 736 q 731 1021 431 1021 q 1187 903 1007 1021 q 1386 594 1367 786 l 1039 594 q 942 704 1026 661 q 731 747 857 747 q 497 679 585 747 q 408 499 408 611 q 497 317 408 386 q 731 247 585 247 q 942 291 857 247 q 1039 401 1026 335 l 1386 401 q 1199 98 1368 214 q 768 -28 1031 -18 l 754 -82 q 847 -69 797 -69 q 951 -103 913 -69 q 990 -200 990 -137 q 951 -298 990 -258 q 847 -352 911 -337 q 703 -371 783 -367 q 544 -362 624 -375 l 544 -231 z "
		},
		È: {
			ha: 1185,
			x_min: 82,
			x_max: 1101,
			o:
				"m 82 0 l 82 997 l 1101 997 l 1101 751 l 408 751 l 408 611 l 1074 611 l 1074 388 l 408 388 l 408 246 l 1101 246 l 1101 0 l 82 0 m 363 1201 l 363 1364 l 900 1253 l 900 1090 l 363 1201 z "
		},
		É: {
			ha: 1185,
			x_min: 82,
			x_max: 1101,
			o:
				"m 82 0 l 82 997 l 1101 997 l 1101 751 l 408 751 l 408 611 l 1074 611 l 1074 388 l 408 388 l 408 246 l 1101 246 l 1101 0 l 82 0 m 363 1090 l 363 1253 l 900 1364 l 900 1201 l 363 1090 z "
		},
		Ê: {
			ha: 1185,
			x_min: 82,
			x_max: 1101,
			o:
				"m 82 0 l 82 997 l 1101 997 l 1101 751 l 408 751 l 408 611 l 1074 611 l 1074 388 l 408 388 l 408 246 l 1101 246 l 1101 0 l 82 0 m 347 1086 l 347 1251 l 632 1363 l 915 1251 l 915 1086 l 632 1197 l 347 1086 z "
		},
		Ë: {
			ha: 1185,
			x_min: 82,
			x_max: 1101,
			o:
				"m 82 0 l 82 997 l 1101 997 l 1101 751 l 408 751 l 408 611 l 1074 611 l 1074 388 l 408 388 l 408 246 l 1101 246 l 1101 0 l 82 0 m 332 1111 l 332 1264 l 575 1264 l 575 1111 l 332 1111 m 689 1111 l 689 1264 l 931 1264 l 931 1111 l 689 1111 z "
		},
		Ì: {
			ha: 490,
			x_min: -18,
			x_max: 510,
			o:
				"m 82 0 l 82 997 l 408 997 l 408 0 l 82 0 m -18 1201 l -18 1364 l 510 1253 l 510 1090 l -18 1201 z "
		},
		Í: {
			ha: 490,
			x_min: -22,
			x_max: 515,
			o:
				"m 82 0 l 82 997 l 408 997 l 408 0 l 82 0 m -22 1090 l -22 1253 l 515 1364 l 515 1201 l -22 1090 z "
		},
		Î: {
			ha: 490,
			x_min: -33,
			x_max: 524,
			o:
				"m 82 0 l 82 997 l 408 997 l 408 0 l 82 0 m -33 1086 l -33 1251 l 246 1363 l 524 1251 l 524 1086 l 246 1197 l -33 1086 z "
		},
		Ï: {
			ha: 490,
			x_min: -49,
			x_max: 539,
			o:
				"m 82 0 l 82 997 l 408 997 l 408 0 l 82 0 m -49 1111 l -49 1264 l 190 1264 l 190 1111 l -49 1111 m 301 1111 l 301 1264 l 539 1264 l 539 1111 l 301 1111 z "
		},
		Ð: {
			ha: 1361,
			x_min: -39,
			x_max: 1293,
			o:
				"m 82 0 l 82 422 l -39 422 l -39 550 l 82 550 l 82 997 l 794 997 q 1152 857 1011 997 q 1293 500 1293 717 q 1152 142 1293 283 q 794 0 1011 0 l 82 0 m 408 275 l 663 275 q 956 500 956 275 q 663 722 956 722 l 408 722 l 408 550 l 614 550 l 614 422 l 408 422 l 408 275 z "
		},
		Ñ: {
			ha: 1483,
			x_min: 82,
			x_max: 1401,
			o:
				"m 82 0 l 82 997 l 565 997 l 1075 314 l 1075 997 l 1401 997 l 1401 0 l 918 0 l 408 685 l 408 0 l 82 0 m 351 1078 q 414 1301 351 1224 q 593 1379 476 1379 q 697 1358 653 1379 q 763 1310 742 1336 q 815 1263 785 1285 q 881 1242 846 1242 q 975 1381 975 1242 l 1136 1381 q 1074 1156 1136 1235 q 896 1078 1011 1078 q 809 1092 847 1078 q 747 1127 771 1107 q 704 1167 724 1147 q 660 1202 685 1188 q 606 1217 635 1217 q 513 1078 513 1217 l 351 1078 z "
		},
		Ò: {
			ha: 1535,
			x_min: 68,
			x_max: 1467,
			o:
				"m 767 -28 q 258 116 449 -28 q 68 499 68 260 q 258 878 68 736 q 767 1021 449 1021 q 1276 878 1086 1021 q 1467 499 1467 736 q 1276 115 1467 258 q 767 -28 1086 -28 m 408 499 q 506 316 408 385 q 767 247 604 247 q 1030 316 932 247 q 1128 499 1128 385 q 1030 679 1128 611 q 767 747 932 747 q 506 679 603 747 q 408 499 408 611 m 499 1201 l 499 1364 l 1036 1253 l 1036 1090 l 499 1201 z "
		},
		Ó: {
			ha: 1535,
			x_min: 68,
			x_max: 1467,
			o:
				"m 767 -28 q 258 116 449 -28 q 68 499 68 260 q 258 878 68 736 q 767 1021 449 1021 q 1276 878 1086 1021 q 1467 499 1467 736 q 1276 115 1467 258 q 767 -28 1086 -28 m 408 499 q 506 316 408 385 q 767 247 604 247 q 1030 316 932 247 q 1128 499 1128 385 q 1030 679 1128 611 q 767 747 932 747 q 506 679 603 747 q 408 499 408 611 m 499 1090 l 499 1253 l 1036 1364 l 1036 1201 l 499 1090 z "
		},
		Ô: {
			ha: 1535,
			x_min: 68,
			x_max: 1467,
			o:
				"m 767 -28 q 258 116 449 -28 q 68 499 68 260 q 258 878 68 736 q 767 1021 449 1021 q 1276 878 1086 1021 q 1467 499 1467 736 q 1276 115 1467 258 q 767 -28 1086 -28 m 408 499 q 506 316 408 385 q 767 247 604 247 q 1030 316 932 247 q 1128 499 1128 385 q 1030 679 1128 611 q 767 747 932 747 q 506 679 603 747 q 408 499 408 611 m 483 1086 l 483 1251 l 768 1363 l 1051 1251 l 1051 1086 l 768 1197 l 483 1086 z "
		},
		Õ: {
			ha: 1535,
			x_min: 68,
			x_max: 1467,
			o:
				"m 767 -28 q 258 116 449 -28 q 68 499 68 260 q 258 878 68 736 q 767 1021 449 1021 q 1276 878 1086 1021 q 1467 499 1467 736 q 1276 115 1467 258 q 767 -28 1086 -28 m 375 1078 q 438 1301 375 1224 q 617 1379 500 1379 q 721 1358 676 1379 q 787 1310 765 1336 q 839 1263 808 1285 q 904 1242 869 1242 q 999 1381 999 1242 l 1160 1381 q 1097 1156 1160 1235 q 919 1078 1035 1078 q 833 1092 871 1078 q 771 1127 794 1107 q 728 1167 747 1147 q 683 1202 708 1188 q 629 1217 658 1217 q 536 1078 536 1217 l 375 1078 m 408 499 q 506 316 408 385 q 767 247 604 247 q 1030 316 932 247 q 1128 499 1128 385 q 1030 679 1128 611 q 767 747 932 747 q 506 679 603 747 q 408 499 408 611 z "
		},
		Ö: {
			ha: 1535,
			x_min: 68,
			x_max: 1467,
			o:
				"m 767 -28 q 258 116 449 -28 q 68 499 68 260 q 258 878 68 736 q 767 1021 449 1021 q 1276 878 1086 1021 q 1467 499 1467 736 q 1276 115 1467 258 q 767 -28 1086 -28 m 408 499 q 506 316 408 385 q 767 247 604 247 q 1030 316 932 247 q 1128 499 1128 385 q 1030 679 1128 611 q 767 747 932 747 q 506 679 603 747 q 408 499 408 611 m 467 1111 l 467 1264 l 710 1264 l 710 1111 l 467 1111 m 824 1111 l 824 1264 l 1065 1264 l 1065 1111 l 824 1111 z "
		},
		"×": {
			ha: 1242,
			x_min: 83,
			x_max: 1158,
			o:
				"m 86 635 l 203 838 l 621 596 l 1040 838 l 1158 635 l 856 460 l 1158 285 l 1042 82 l 622 325 l 201 82 l 83 285 l 388 460 l 86 635 z "
		},
		Ø: {
			ha: 1535,
			x_min: 68,
			x_max: 1467,
			o:
				"m 767 -28 q 574 -12 668 -28 l 503 -132 l 297 -132 l 397 38 q 154 222 240 103 q 68 499 68 340 q 258 878 68 736 q 767 1021 449 1021 q 963 1004 871 1021 l 1032 1122 l 1238 1122 l 1139 956 q 1381 774 1296 892 q 1467 499 1467 656 q 1276 115 1467 258 q 767 -28 1086 -28 m 408 499 q 546 293 408 361 l 811 746 q 767 747 797 747 q 506 679 603 747 q 408 499 408 611 m 725 249 q 767 247 739 247 q 1030 316 932 247 q 1128 499 1128 385 q 992 701 1128 633 l 725 249 z "
		},
		Ù: {
			ha: 1376,
			x_min: 82,
			x_max: 1296,
			o:
				"m 689 -28 q 228 101 374 -28 q 82 488 82 231 l 82 997 l 408 997 l 408 499 q 689 247 408 247 q 826 269 769 247 q 913 328 883 290 q 956 407 943 365 q 968 499 968 449 l 968 997 l 1296 997 l 1296 488 q 1149 101 1296 231 q 689 -28 1003 -28 m 421 1201 l 421 1364 l 958 1253 l 958 1090 l 421 1201 z "
		},
		Ú: {
			ha: 1376,
			x_min: 82,
			x_max: 1296,
			o:
				"m 689 -28 q 228 101 374 -28 q 82 488 82 231 l 82 997 l 408 997 l 408 499 q 689 247 408 247 q 826 269 769 247 q 913 328 883 290 q 956 407 943 365 q 968 499 968 449 l 968 997 l 1296 997 l 1296 488 q 1149 101 1296 231 q 689 -28 1003 -28 m 421 1090 l 421 1253 l 958 1364 l 958 1201 l 421 1090 z "
		},
		Û: {
			ha: 1376,
			x_min: 82,
			x_max: 1296,
			o:
				"m 689 -28 q 228 101 374 -28 q 82 488 82 231 l 82 997 l 408 997 l 408 499 q 689 247 408 247 q 826 269 769 247 q 913 328 883 290 q 956 407 943 365 q 968 499 968 449 l 968 997 l 1296 997 l 1296 488 q 1149 101 1296 231 q 689 -28 1003 -28 m 406 1086 l 406 1251 l 690 1363 l 974 1251 l 974 1086 l 690 1197 l 406 1086 z "
		},
		Ü: {
			ha: 1376,
			x_min: 82,
			x_max: 1296,
			o:
				"m 689 -28 q 228 101 374 -28 q 82 488 82 231 l 82 997 l 408 997 l 408 499 q 689 247 408 247 q 826 269 769 247 q 913 328 883 290 q 956 407 943 365 q 968 499 968 449 l 968 997 l 1296 997 l 1296 488 q 1149 101 1296 231 q 689 -28 1003 -28 m 389 1111 l 389 1264 l 632 1264 l 632 1111 l 389 1111 m 746 1111 l 746 1264 l 988 1264 l 988 1111 l 746 1111 z "
		},
		Ý: {
			ha: 1543,
			x_min: 68,
			x_max: 1475,
			o:
				"m 608 0 l 608 333 l 68 997 l 474 997 l 771 607 l 1069 997 l 1475 997 l 935 333 l 935 0 l 608 0 m 503 1090 l 503 1253 l 1040 1364 l 1040 1201 l 503 1090 z "
		},
		Þ: {
			ha: 1317,
			x_min: 82,
			x_max: 1249,
			o:
				"m 82 0 l 82 997 l 408 997 l 408 872 l 851 872 q 1142 774 1035 872 q 1249 508 1249 675 q 1142 243 1249 342 q 851 144 1035 144 l 408 144 l 408 0 l 82 0 m 408 419 l 774 419 q 826 422 806 419 q 868 433 847 425 q 899 460 889 442 q 908 508 908 479 q 875 581 908 565 q 774 597 842 597 l 408 597 l 408 419 z "
		},
		ß: {
			ha: 1378,
			x_min: 81,
			x_max: 1311,
			o:
				"m 81 646 q 235 1015 81 889 q 688 1142 390 1142 q 1088 1061 943 1142 q 1232 835 1232 981 q 1178 686 1232 749 q 1026 593 1124 624 q 1242 507 1174 571 q 1311 329 1311 443 q 1156 80 1311 160 q 671 0 1000 0 l 583 0 l 583 251 l 708 251 q 975 368 975 251 q 921 443 975 424 q 715 463 867 463 l 583 463 l 583 681 l 688 681 q 845 702 794 681 q 896 771 896 724 q 834 858 896 826 q 665 889 772 889 q 472 833 540 889 q 403 675 403 776 l 403 0 l 81 0 l 81 646 z "
		},
		à: {
			ha: 1318,
			x_min: 61,
			x_max: 1238,
			o:
				"m 446 -29 q 167 41 274 -29 q 61 250 61 111 q 101 388 61 331 q 210 477 140 446 q 359 522 279 508 q 535 536 439 536 q 914 490 735 536 q 851 602 911 569 q 661 635 790 635 q 168 564 472 635 l 129 793 q 722 863 447 863 q 1114 763 990 863 q 1238 435 1238 664 l 1238 0 l 914 0 l 914 110 q 681 7 808 43 q 446 -29 554 -29 m 394 1039 l 394 1201 l 932 1090 l 932 928 l 394 1039 m 397 267 q 554 185 397 185 q 730 206 624 185 q 914 253 836 226 l 914 322 q 579 357 693 357 q 438 336 479 357 q 397 267 397 315 z "
		},
		á: {
			ha: 1318,
			x_min: 61,
			x_max: 1238,
			o:
				"m 446 -29 q 167 41 274 -29 q 61 250 61 111 q 101 388 61 331 q 210 477 140 446 q 359 522 279 508 q 535 536 439 536 q 914 490 735 536 q 851 602 911 569 q 661 635 790 635 q 168 564 472 635 l 129 793 q 722 863 447 863 q 1114 763 990 863 q 1238 435 1238 664 l 1238 0 l 914 0 l 914 110 q 681 7 808 43 q 446 -29 554 -29 m 394 928 l 394 1090 l 932 1201 l 932 1039 l 394 928 m 397 267 q 554 185 397 185 q 730 206 624 185 q 914 253 836 226 l 914 322 q 579 357 693 357 q 438 336 479 357 q 397 267 397 315 z "
		},
		â: {
			ha: 1318,
			x_min: 61,
			x_max: 1238,
			o:
				"m 446 -29 q 167 41 274 -29 q 61 250 61 111 q 101 388 61 331 q 210 477 140 446 q 359 522 279 508 q 535 536 439 536 q 914 490 735 536 q 851 602 911 569 q 661 635 790 635 q 168 564 472 635 l 129 793 q 722 863 447 863 q 1114 763 990 863 q 1238 435 1238 664 l 1238 0 l 914 0 l 914 110 q 681 7 808 43 q 446 -29 554 -29 m 379 924 l 379 1089 l 664 1200 l 947 1089 l 947 924 l 664 1035 l 379 924 m 397 267 q 554 185 397 185 q 730 206 624 185 q 914 253 836 226 l 914 322 q 579 357 693 357 q 438 336 479 357 q 397 267 397 315 z "
		},
		ã: {
			ha: 1318,
			x_min: 61,
			x_max: 1238,
			o:
				"m 446 -29 q 167 41 274 -29 q 61 250 61 111 q 101 388 61 331 q 210 477 140 446 q 359 522 279 508 q 535 536 439 536 q 914 490 735 536 q 851 602 911 569 q 661 635 790 635 q 168 564 472 635 l 129 793 q 722 863 447 863 q 1114 763 990 863 q 1238 435 1238 664 l 1238 0 l 914 0 l 914 110 q 681 7 808 43 q 446 -29 554 -29 m 271 915 q 333 1139 271 1061 q 513 1217 396 1217 q 617 1195 572 1217 q 683 1148 661 1174 q 735 1101 704 1122 q 800 1079 765 1079 q 894 1218 894 1079 l 1056 1218 q 993 994 1056 1072 q 815 915 931 915 q 728 930 767 915 q 667 965 690 944 q 624 1005 643 985 q 579 1040 604 1025 q 525 1054 554 1054 q 432 915 432 1054 l 271 915 m 397 267 q 554 185 397 185 q 730 206 624 185 q 914 253 836 226 l 914 322 q 579 357 693 357 q 438 336 479 357 q 397 267 397 315 z "
		},
		ä: {
			ha: 1318,
			x_min: 61,
			x_max: 1238,
			o:
				"m 446 -29 q 167 41 274 -29 q 61 250 61 111 q 101 388 61 331 q 210 477 140 446 q 359 522 279 508 q 535 536 439 536 q 914 490 735 536 q 851 602 911 569 q 661 635 790 635 q 168 564 472 635 l 129 793 q 722 863 447 863 q 1114 763 990 863 q 1238 435 1238 664 l 1238 0 l 914 0 l 914 110 q 681 7 808 43 q 446 -29 554 -29 m 364 949 l 364 1101 l 607 1101 l 607 949 l 364 949 m 397 267 q 554 185 397 185 q 730 206 624 185 q 914 253 836 226 l 914 322 q 579 357 693 357 q 438 336 479 357 q 397 267 397 315 m 721 949 l 721 1101 l 963 1101 l 963 949 l 721 949 z "
		},
		å: {
			ha: 1318,
			x_min: 61,
			x_max: 1238,
			o:
				"m 446 -29 q 167 41 274 -29 q 61 250 61 111 q 101 388 61 331 q 210 477 140 446 q 359 522 279 508 q 535 536 439 536 q 914 490 735 536 q 851 602 911 569 q 661 635 790 635 q 168 564 472 635 l 129 793 q 722 863 447 863 q 1114 763 990 863 q 1238 435 1238 664 l 1238 0 l 914 0 l 914 110 q 681 7 808 43 q 446 -29 554 -29 m 663 917 q 358 1097 358 917 q 663 1278 358 1278 q 965 1097 965 1278 q 663 917 965 917 m 397 267 q 554 185 397 185 q 730 206 624 185 q 914 253 836 226 l 914 322 q 579 357 693 357 q 438 336 479 357 q 397 267 397 315 m 663 1169 q 592 1169 663 1169 q 521 1097 521 1169 q 663 1025 521 1025 q 804 1097 804 1025 q 663 1169 804 1169 z "
		},
		æ: {
			ha: 2119,
			x_min: 53,
			x_max: 2065,
			o:
				"m 476 -29 q 160 38 268 -29 q 53 225 53 106 q 188 432 53 363 q 579 501 322 501 l 819 501 q 610 613 819 613 q 228 542 457 613 l 136 749 q 614 849 354 849 q 999 735 864 849 q 1451 863 1164 863 q 1906 732 1746 863 q 2065 353 2065 601 l 1175 353 q 1472 196 1215 196 q 1646 223 1572 196 q 1744 296 1719 250 l 2058 296 q 1862 51 2007 132 q 1453 -28 1717 -29 q 974 121 1140 -28 q 476 -29 796 -29 m 388 268 q 528 183 388 183 q 819 263 711 183 l 819 339 l 613 350 q 388 268 388 364 m 1182 507 l 1733 507 q 1464 639 1681 639 q 1182 507 1232 639 z "
		},
		ç: {
			ha: 1317,
			x_min: 53,
			x_max: 1264,
			o:
				"m 492 -215 q 677 -229 617 -235 q 738 -189 738 -224 q 693 -158 738 -158 q 633 -179 665 -156 l 539 -153 l 571 -24 q 192 114 332 -4 q 53 418 53 232 q 218 742 53 621 q 660 863 383 863 q 1072 763 907 863 q 1264 496 1236 664 l 939 496 q 842 581 918 550 q 660 613 767 613 q 451 560 529 613 q 372 418 372 507 q 451 276 372 329 q 660 222 529 222 q 842 254 767 222 q 939 339 918 286 l 1264 339 q 1088 83 1238 182 q 713 -26 939 -15 l 701 -67 q 794 -54 744 -54 q 899 -88 860 -54 q 938 -185 938 -122 q 898 -283 938 -243 q 794 -337 858 -322 q 651 -356 731 -351 q 492 -347 571 -360 l 492 -215 z "
		},
		è: {
			ha: 1326,
			x_min: 51,
			x_max: 1274,
			o:
				"m 661 -28 q 217 93 382 -28 q 53 417 51 214 q 217 742 53 621 q 660 863 382 863 q 1114 732 954 863 q 1274 353 1274 601 l 383 353 q 681 196 424 196 q 854 223 781 196 q 953 296 928 250 l 1267 296 q 1070 51 1215 132 q 661 -28 925 -29 m 375 1035 l 375 1197 l 913 1086 l 913 924 l 375 1035 m 390 507 l 942 507 q 672 639 889 639 q 390 507 440 639 z "
		},
		é: {
			ha: 1326,
			x_min: 51,
			x_max: 1274,
			o:
				"m 661 -28 q 217 93 382 -28 q 53 417 51 214 q 217 742 53 621 q 660 863 382 863 q 1114 732 954 863 q 1274 353 1274 601 l 383 353 q 681 196 424 196 q 854 223 781 196 q 953 296 928 250 l 1267 296 q 1070 51 1215 132 q 661 -28 925 -29 m 375 924 l 375 1086 l 913 1197 l 913 1035 l 375 924 m 390 507 l 942 507 q 672 639 889 639 q 390 507 440 639 z "
		},
		ê: {
			ha: 1326,
			x_min: 51,
			x_max: 1274,
			o:
				"m 661 -28 q 217 93 382 -28 q 53 417 51 214 q 217 742 53 621 q 660 863 382 863 q 1114 732 954 863 q 1274 353 1274 601 l 383 353 q 681 196 424 196 q 854 223 781 196 q 953 296 928 250 l 1267 296 q 1070 51 1215 132 q 661 -28 925 -29 m 360 919 l 360 1085 l 644 1196 l 928 1085 l 928 919 l 644 1031 l 360 919 m 390 507 l 942 507 q 672 639 889 639 q 390 507 440 639 z "
		},
		ë: {
			ha: 1326,
			x_min: 51,
			x_max: 1274,
			o:
				"m 661 -28 q 217 93 382 -28 q 53 417 51 214 q 217 742 53 621 q 660 863 382 863 q 1114 732 954 863 q 1274 353 1274 601 l 383 353 q 681 196 424 196 q 854 223 781 196 q 953 296 928 250 l 1267 296 q 1070 51 1215 132 q 661 -28 925 -29 m 343 944 l 343 1097 l 586 1097 l 586 944 l 343 944 m 390 507 l 942 507 q 672 639 889 639 q 390 507 440 639 m 700 944 l 700 1097 l 942 1097 l 942 944 l 700 944 z "
		},
		ì: {
			ha: 483,
			x_min: -26,
			x_max: 511,
			o:
				"m 82 0 l 82 835 l 403 835 l 403 0 l 82 0 m -26 1039 l -26 1201 l 511 1090 l 511 928 l -26 1039 z "
		},
		í: {
			ha: 483,
			x_min: -26,
			x_max: 511,
			o:
				"m 82 0 l 82 835 l 403 835 l 403 0 l 82 0 m -26 928 l -26 1090 l 511 1201 l 511 1039 l -26 928 z "
		},
		î: {
			ha: 483,
			x_min: -42,
			x_max: 526,
			o:
				"m 82 0 l 82 835 l 403 835 l 403 0 l 82 0 m -42 924 l -42 1089 l 243 1200 l 526 1089 l 526 924 l 243 1035 l -42 924 z "
		},
		ï: {
			ha: 483,
			x_min: -57,
			x_max: 542,
			o:
				"m 82 0 l 82 835 l 403 835 l 403 0 l 82 0 m -57 949 l -57 1101 l 186 1101 l 186 949 l -57 949 m 300 949 l 300 1101 l 542 1101 l 542 949 l 300 949 z "
		},
		ñ: {
			ha: 1382,
			x_min: 81,
			x_max: 1301,
			o:
				"m 81 0 l 81 835 l 406 835 l 406 647 q 883 863 581 863 q 1301 447 1301 863 l 1301 0 l 976 0 l 976 325 q 919 532 976 468 q 721 596 863 596 q 486 528 567 596 q 406 329 406 461 l 406 0 l 81 0 m 333 911 q 396 1135 333 1057 q 575 1213 458 1213 q 679 1191 635 1213 q 745 1144 724 1169 q 797 1097 767 1118 q 863 1075 828 1075 q 957 1214 957 1075 l 1118 1214 q 1056 990 1118 1068 q 878 911 993 911 q 791 926 829 911 q 729 960 753 940 q 686 1001 706 981 q 642 1035 667 1021 q 588 1050 617 1050 q 494 911 494 1050 l 333 911 z "
		},
		ò: {
			ha: 1319,
			x_min: 53,
			x_max: 1267,
			o:
				"m 1101 94 q 1018 33 1101 94 q 660 -28 935 -28 q 219 94 385 -28 q 53 418 53 215 q 219 742 53 621 q 660 863 385 863 q 1101 742 935 863 q 1267 418 1267 621 q 1101 94 1267 215 m 453 560 q 414 533 453 560 q 375 418 375 507 q 453 276 375 329 q 660 222 531 222 q 867 276 789 222 q 944 418 944 329 q 867 560 944 507 q 660 613 789 613 q 453 560 531 613 m 392 1039 l 392 1201 l 929 1090 l 929 928 l 392 1039 z "
		},
		ó: {
			ha: 1319,
			x_min: 53,
			x_max: 1267,
			o:
				"m 1101 94 q 1018 33 1101 94 q 660 -28 935 -28 q 219 94 385 -28 q 53 418 53 215 q 219 742 53 621 q 660 863 385 863 q 1101 742 935 863 q 1267 418 1267 621 q 1101 94 1267 215 m 453 560 q 414 533 453 560 q 375 418 375 507 q 453 276 375 329 q 660 222 531 222 q 867 276 789 222 q 944 418 944 329 q 867 560 944 507 q 660 613 789 613 q 453 560 531 613 m 392 928 l 392 1090 l 929 1201 l 929 1039 l 392 928 z "
		},
		ô: {
			ha: 1319,
			x_min: 53,
			x_max: 1267,
			o:
				"m 1101 94 q 1018 33 1101 94 q 660 -28 935 -28 q 219 94 385 -28 q 53 418 53 215 q 219 742 53 621 q 660 863 385 863 q 1101 742 935 863 q 1267 418 1267 621 q 1101 94 1267 215 m 453 560 q 414 533 453 560 q 375 418 375 507 q 453 276 375 329 q 660 222 531 222 q 867 276 789 222 q 944 418 944 329 q 867 560 944 507 q 660 613 789 613 q 453 560 531 613 m 376 924 l 376 1089 l 661 1200 l 944 1089 l 944 924 l 661 1035 l 376 924 z "
		},
		õ: {
			ha: 1319,
			x_min: 53,
			x_max: 1267,
			o:
				"m 1101 94 q 1018 33 1101 94 q 660 -28 935 -28 q 219 94 385 -28 q 53 418 53 215 q 219 742 53 621 q 660 863 385 863 q 1101 742 935 863 q 1267 418 1267 621 q 1101 94 1267 215 m 268 915 q 331 1139 268 1061 q 510 1217 393 1217 q 614 1195 569 1217 q 680 1148 658 1174 q 732 1101 701 1122 q 797 1079 763 1079 q 892 1218 892 1079 l 1053 1218 q 990 994 1053 1072 q 813 915 928 915 q 726 930 764 915 q 664 965 688 944 q 621 1005 640 985 q 576 1040 601 1025 q 522 1054 551 1054 q 429 915 429 1054 l 268 915 m 453 560 q 414 533 453 560 q 375 418 375 507 q 453 276 375 329 q 660 222 531 222 q 867 276 789 222 q 944 418 944 329 q 867 560 944 507 q 660 613 789 613 q 453 560 531 613 z "
		},
		ö: {
			ha: 1319,
			x_min: 53,
			x_max: 1267,
			o:
				"m 1101 94 q 1018 33 1101 94 q 660 -28 935 -28 q 219 94 385 -28 q 53 418 53 215 q 219 742 53 621 q 660 863 385 863 q 1101 742 935 863 q 1267 418 1267 621 q 1101 94 1267 215 m 360 949 l 360 1101 l 603 1101 l 603 949 l 360 949 m 453 560 q 414 533 453 560 q 375 418 375 507 q 453 276 375 329 q 660 222 531 222 q 867 276 789 222 q 944 418 944 329 q 867 560 944 507 q 660 613 789 613 q 453 560 531 613 m 717 949 l 717 1101 l 958 1101 l 958 949 l 717 949 z "
		},
		"÷": {
			ha: 1324,
			x_min: 110,
			x_max: 1214,
			o:
				"m 110 356 l 110 589 l 1214 589 l 1214 356 l 110 356 m 531 26 l 531 221 l 792 221 l 792 26 l 531 26 m 531 721 l 531 915 l 792 915 l 792 721 l 531 721 z "
		},
		ø: {
			ha: 1319,
			x_min: 53,
			x_max: 1267,
			o:
				"m 660 -28 q 619 -26 633 -28 l 572 -186 l 388 -186 l 442 -4 q 156 149 260 38 q 53 418 53 260 q 219 742 53 621 q 660 863 385 863 q 700 861 688 863 l 749 1022 l 933 1022 l 879 839 q 1164 687 1061 797 q 1267 418 1267 576 q 1101 94 1267 215 q 660 -28 935 -28 m 375 418 q 517 244 375 293 l 626 611 q 443 552 511 604 q 375 418 375 500 m 694 224 q 877 283 810 231 q 944 418 944 335 q 908 522 944 478 q 804 590 871 567 l 694 224 z "
		},
		ù: {
			ha: 1382,
			x_min: 81,
			x_max: 1301,
			o:
				"m 1301 835 l 1301 0 l 976 0 l 976 188 q 499 -28 801 -28 q 81 388 81 -28 l 81 835 l 406 835 l 406 510 q 463 303 406 367 q 661 239 519 239 q 895 306 814 239 q 976 506 976 374 l 976 835 l 1301 835 m 422 1039 l 422 1201 l 960 1090 l 960 928 l 422 1039 z "
		},
		ú: {
			ha: 1382,
			x_min: 81,
			x_max: 1301,
			o:
				"m 1301 835 l 1301 0 l 976 0 l 976 188 q 499 -28 801 -28 q 81 388 81 -28 l 81 835 l 406 835 l 406 510 q 463 303 406 367 q 661 239 519 239 q 895 306 814 239 q 976 506 976 374 l 976 835 l 1301 835 m 422 928 l 422 1090 l 960 1201 l 960 1039 l 422 928 z "
		},
		û: {
			ha: 1382,
			x_min: 81,
			x_max: 1301,
			o:
				"m 1301 835 l 1301 0 l 976 0 l 976 188 q 499 -28 801 -28 q 81 388 81 -28 l 81 835 l 406 835 l 406 510 q 463 303 406 367 q 661 239 519 239 q 895 306 814 239 q 976 506 976 374 l 976 835 l 1301 835 m 407 924 l 407 1089 l 692 1200 l 975 1089 l 975 924 l 692 1035 l 407 924 z "
		},
		ü: {
			ha: 1382,
			x_min: 81,
			x_max: 1301,
			o:
				"m 1301 835 l 1301 0 l 976 0 l 976 188 q 499 -28 801 -28 q 81 388 81 -28 l 81 835 l 406 835 l 406 510 q 463 303 406 367 q 661 239 519 239 q 895 306 814 239 q 976 506 976 374 l 976 835 l 1301 835 m 390 949 l 390 1101 l 633 1101 l 633 949 l 390 949 m 747 949 l 747 1101 l 989 1101 l 989 949 l 747 949 z "
		},
		ý: {
			ha: 1386,
			x_min: 53,
			x_max: 1333,
			o:
				"m 435 -361 q 122 -311 292 -361 l 122 -69 q 390 -111 310 -111 q 510 -92 474 -111 q 588 0 547 -72 l 449 0 l 53 835 l 400 835 l 693 218 l 986 835 l 1333 835 l 949 28 q 739 -265 857 -168 q 435 -361 621 -361 m 407 928 l 407 1090 l 944 1201 l 944 1039 l 407 928 z "
		},
		þ: {
			ha: 1356,
			x_min: 82,
			x_max: 1301,
			o:
				"m 82 -222 l 82 1111 l 403 1111 l 403 674 q 568 813 464 764 q 807 863 672 863 q 1167 742 1032 863 q 1301 418 1301 621 q 1167 94 1301 215 q 807 -28 1032 -28 q 568 22 672 -28 q 403 163 464 72 l 403 -222 l 82 -222 m 403 397 q 492 282 414 325 q 697 239 569 239 q 894 288 824 239 q 965 418 965 336 q 894 548 965 500 q 697 596 824 596 q 492 553 569 596 q 403 439 414 511 l 403 397 z "
		},
		ÿ: {
			ha: 1386,
			x_min: 53,
			x_max: 1333,
			o:
				"m 435 -361 q 122 -311 292 -361 l 122 -69 q 390 -111 310 -111 q 510 -92 474 -111 q 588 0 547 -72 l 449 0 l 53 835 l 400 835 l 693 218 l 986 835 l 1333 835 l 949 28 q 739 -265 857 -168 q 435 -361 621 -361 m 375 949 l 375 1101 l 618 1101 l 618 949 l 375 949 m 732 949 l 732 1101 l 974 1101 l 974 949 l 732 949 z "
		},
		Ā: {
			ha: 1574,
			x_min: 68,
			x_max: 1506,
			o:
				"m 68 0 l 579 997 l 996 997 l 1506 0 l 1157 0 l 1069 185 l 504 185 l 415 0 l 68 0 m 464 1136 l 464 1268 l 1108 1268 l 1108 1136 l 464 1136 m 615 419 l 957 419 l 786 776 l 615 419 z "
		},
		ā: {
			ha: 1318,
			x_min: 61,
			x_max: 1238,
			o:
				"m 446 -29 q 167 41 274 -29 q 61 250 61 111 q 101 388 61 331 q 210 477 140 446 q 359 522 279 508 q 535 536 439 536 q 914 490 735 536 q 851 602 911 569 q 661 635 790 635 q 168 564 472 635 l 129 793 q 722 863 447 863 q 1114 763 990 863 q 1238 435 1238 664 l 1238 0 l 914 0 l 914 110 q 681 7 808 43 q 446 -29 554 -29 m 340 969 l 340 1101 l 985 1101 l 985 969 l 340 969 m 397 267 q 554 185 397 185 q 730 206 624 185 q 914 253 836 226 l 914 322 q 579 357 693 357 q 438 336 479 357 q 397 267 397 315 z "
		},
		Ă: {
			ha: 1574,
			x_min: 68,
			x_max: 1506,
			o:
				"m 68 0 l 579 997 l 996 997 l 1506 0 l 1157 0 l 1069 185 l 504 185 l 415 0 l 68 0 m 474 1360 l 649 1360 q 680 1275 649 1304 q 786 1246 711 1246 q 892 1275 861 1246 q 924 1360 924 1304 l 1099 1360 q 1013 1153 1099 1218 q 786 1088 926 1088 q 560 1153 646 1088 q 474 1360 474 1218 m 615 419 l 957 419 l 786 776 l 615 419 z "
		},
		ă: {
			ha: 1318,
			x_min: 61,
			x_max: 1238,
			o:
				"m 446 -29 q 167 41 274 -29 q 61 250 61 111 q 101 388 61 331 q 210 477 140 446 q 359 522 279 508 q 535 536 439 536 q 914 490 735 536 q 851 602 911 569 q 661 635 790 635 q 168 564 472 635 l 129 793 q 722 863 447 863 q 1114 763 990 863 q 1238 435 1238 664 l 1238 0 l 914 0 l 914 110 q 681 7 808 43 q 446 -29 554 -29 m 350 1193 l 525 1193 q 556 1108 525 1138 q 663 1079 588 1079 q 769 1108 738 1079 q 800 1193 800 1138 l 975 1193 q 889 986 975 1051 q 663 921 803 921 q 436 986 522 921 q 350 1193 350 1051 m 397 267 q 554 185 397 185 q 730 206 624 185 q 914 253 836 226 l 914 322 q 579 357 693 357 q 438 336 479 357 q 397 267 397 315 z "
		},
		Ą: {
			ha: 1574,
			x_min: 68,
			x_max: 1564,
			o:
				"m 68 0 l 579 997 l 996 997 l 1506 0 l 1419 0 q 1351 -104 1351 -58 q 1398 -165 1351 -147 q 1564 -182 1444 -182 l 1564 -336 q 1244 -301 1331 -336 q 1157 -171 1157 -265 q 1271 0 1157 -76 l 1157 0 l 1069 185 l 504 185 l 415 0 l 68 0 m 615 419 l 957 419 l 786 776 l 615 419 z "
		},
		ą: {
			ha: 1318,
			x_min: 53,
			x_max: 1228,
			o:
				"m 439 -29 q 159 40 265 -29 q 53 251 53 110 q 94 392 53 333 q 207 480 135 450 q 358 523 279 510 q 529 536 436 536 q 907 490 721 536 q 842 609 904 576 q 656 642 779 642 q 160 575 454 642 l 121 793 q 717 863 443 863 q 1104 763 981 863 q 1228 435 1228 664 l 1228 0 l 1053 0 q 985 -104 985 -58 q 1031 -165 985 -147 q 1197 -182 1078 -182 l 1197 -336 q 878 -301 965 -336 q 790 -171 790 -265 q 907 1 790 -75 l 907 114 q 673 8 800 46 q 439 -29 546 -29 m 386 267 q 549 183 386 183 q 907 246 696 183 l 907 331 q 579 364 676 364 q 432 342 478 364 q 386 267 386 321 z "
		},
		Ć: {
			ha: 1454,
			x_min: 68,
			x_max: 1386,
			o:
				"m 731 -28 q 249 116 431 -28 q 68 499 68 260 q 249 878 68 736 q 731 1021 431 1021 q 1187 903 1007 1021 q 1386 594 1367 786 l 1039 594 q 942 704 1026 661 q 731 747 857 747 q 497 679 585 747 q 408 499 408 611 q 497 317 408 386 q 731 247 585 247 q 942 291 857 247 q 1039 401 1026 335 l 1386 401 q 1187 90 1367 207 q 731 -28 1007 -28 m 461 1090 l 461 1253 l 999 1364 l 999 1201 l 461 1090 z "
		},
		ć: {
			ha: 1317,
			x_min: 53,
			x_max: 1264,
			o:
				"m 660 -28 q 218 94 383 -28 q 53 418 53 215 q 218 742 53 621 q 660 863 383 863 q 1072 763 907 863 q 1264 496 1236 664 l 939 496 q 842 581 918 550 q 660 613 767 613 q 451 560 529 613 q 372 418 372 507 q 451 276 372 329 q 660 222 529 222 q 842 254 767 222 q 939 339 918 286 l 1264 339 q 1072 72 1236 172 q 660 -28 907 -28 m 389 928 l 389 1090 l 926 1201 l 926 1039 l 389 928 z "
		},
		Ċ: {
			ha: 1454,
			x_min: 68,
			x_max: 1386,
			o:
				"m 731 -28 q 249 116 431 -28 q 68 499 68 260 q 249 878 68 736 q 731 1021 431 1021 q 1187 903 1007 1021 q 1386 594 1367 786 l 1039 594 q 942 704 1026 661 q 731 747 857 747 q 497 679 585 747 q 408 499 408 611 q 497 317 408 386 q 731 247 585 247 q 942 291 857 247 q 1039 401 1026 335 l 1386 401 q 1187 90 1367 207 q 731 -28 1007 -28 m 593 1129 l 593 1264 l 865 1264 l 865 1129 l 593 1129 z "
		},
		ċ: {
			ha: 1317,
			x_min: 53,
			x_max: 1264,
			o:
				"m 660 -28 q 218 94 383 -28 q 53 418 53 215 q 218 742 53 621 q 660 863 383 863 q 1072 763 907 863 q 1264 496 1236 664 l 939 496 q 842 581 918 550 q 660 613 767 613 q 451 560 529 613 q 372 418 372 507 q 451 276 372 329 q 660 222 529 222 q 842 254 767 222 q 939 339 918 286 l 1264 339 q 1072 72 1236 172 q 660 -28 907 -28 m 522 967 l 522 1101 l 794 1101 l 794 967 l 522 967 z "
		},
		Č: {
			ha: 1454,
			x_min: 68,
			x_max: 1386,
			o:
				"m 731 -28 q 249 116 431 -28 q 68 499 68 260 q 249 878 68 736 q 731 1021 431 1021 q 1187 903 1007 1021 q 1386 594 1367 786 l 1039 594 q 942 704 1026 661 q 731 747 857 747 q 497 679 585 747 q 408 499 408 611 q 497 317 408 386 q 731 247 585 247 q 942 291 857 247 q 1039 401 1026 335 l 1386 401 q 1187 90 1367 207 q 731 -28 1007 -28 m 446 1182 l 446 1349 l 729 1238 l 1014 1349 l 1014 1182 l 731 1071 l 446 1182 z "
		},
		č: {
			ha: 1317,
			x_min: 53,
			x_max: 1264,
			o:
				"m 660 -28 q 218 94 383 -28 q 53 418 53 215 q 218 742 53 621 q 660 863 383 863 q 1072 763 907 863 q 1264 496 1236 664 l 939 496 q 842 581 918 550 q 660 613 767 613 q 451 560 529 613 q 372 418 372 507 q 451 276 372 329 q 660 222 529 222 q 842 254 767 222 q 939 339 918 286 l 1264 339 q 1072 72 1236 172 q 660 -28 907 -28 m 374 1019 l 374 1186 l 657 1075 l 942 1186 l 942 1019 l 658 908 l 374 1019 z "
		},
		Ď: {
			ha: 1361,
			x_min: 82,
			x_max: 1293,
			o:
				"m 82 0 l 82 997 l 794 997 q 1152 857 1011 997 q 1293 500 1293 717 q 1152 142 1293 283 q 794 0 1011 0 l 82 0 m 286 1157 l 286 1324 l 569 1213 l 854 1324 l 854 1157 l 571 1046 l 286 1157 m 408 275 l 663 275 q 956 500 956 275 q 663 722 956 722 l 408 722 l 408 275 z "
		},
		ď: {
			ha: 1760,
			x_min: 54,
			x_max: 1676,
			o:
				"m 954 0 l 954 163 q 788 21 893 71 q 549 -29 683 -29 q 189 92 324 -29 q 54 415 54 213 q 189 740 54 618 q 549 861 324 861 q 788 811 683 861 q 954 668 893 761 l 954 1111 l 1276 1111 l 1276 0 l 954 0 m 461 546 q 426 522 461 546 q 390 415 390 497 q 461 285 390 333 q 658 238 532 238 q 875 285 796 238 q 954 415 954 333 q 875 546 954 497 q 658 594 796 594 q 461 546 532 594 m 1374 871 l 1374 1111 l 1676 1111 l 1676 908 l 1542 651 l 1393 651 l 1488 871 l 1374 871 z "
		},
		Đ: {
			ha: 1361,
			x_min: -39,
			x_max: 1293,
			o:
				"m 82 0 l 82 422 l -39 422 l -39 550 l 82 550 l 82 997 l 794 997 q 1152 857 1011 997 q 1293 500 1293 717 q 1152 142 1293 283 q 794 0 1011 0 l 82 0 m 408 275 l 663 275 q 956 500 956 275 q 663 722 956 722 l 408 722 l 408 550 l 614 550 l 614 422 l 408 422 l 408 275 z "
		},
		đ: {
			ha: 1357,
			x_min: 54,
			x_max: 1425,
			o:
				"m 954 0 l 954 163 q 788 21 893 71 q 549 -29 683 -29 q 189 92 324 -29 q 54 415 54 213 q 189 740 54 618 q 549 861 324 861 q 788 811 683 861 q 954 668 893 761 l 954 893 l 681 893 l 681 1025 l 954 1025 l 954 1111 l 1276 1111 l 1276 1025 l 1425 1025 l 1425 893 l 1276 893 l 1276 0 l 954 0 m 461 546 q 426 522 461 546 q 390 415 390 497 q 461 285 390 333 q 658 238 532 238 q 875 285 796 238 q 954 415 954 333 q 875 546 954 497 q 658 594 796 594 q 461 546 532 594 z "
		},
		Ē: {
			ha: 1185,
			x_min: 82,
			x_max: 1101,
			o:
				"m 82 0 l 82 997 l 1101 997 l 1101 751 l 408 751 l 408 611 l 1074 611 l 1074 388 l 408 388 l 408 246 l 1101 246 l 1101 0 l 82 0 m 308 1132 l 308 1264 l 953 1264 l 953 1132 l 308 1132 z "
		},
		ē: {
			ha: 1326,
			x_min: 51,
			x_max: 1274,
			o:
				"m 661 -28 q 217 93 382 -28 q 53 417 51 214 q 217 742 53 621 q 660 863 382 863 q 1114 732 954 863 q 1274 353 1274 601 l 383 353 q 681 196 424 196 q 854 223 781 196 q 953 296 928 250 l 1267 296 q 1070 51 1215 132 q 661 -28 925 -29 m 321 965 l 321 1097 l 965 1097 l 965 965 l 321 965 m 390 507 l 942 507 q 672 639 889 639 q 390 507 440 639 z "
		},
		Ė: {
			ha: 1185,
			x_min: 82,
			x_max: 1101,
			o:
				"m 82 0 l 82 997 l 1101 997 l 1101 751 l 408 751 l 408 611 l 1074 611 l 1074 388 l 408 388 l 408 246 l 1101 246 l 1101 0 l 82 0 m 496 1129 l 496 1264 l 768 1264 l 768 1129 l 496 1129 z "
		},
		ė: {
			ha: 1326,
			x_min: 51,
			x_max: 1274,
			o:
				"m 661 -28 q 217 93 382 -28 q 53 417 51 214 q 217 742 53 621 q 660 863 382 863 q 1114 732 954 863 q 1274 353 1274 601 l 383 353 q 681 196 424 196 q 854 223 781 196 q 953 296 928 250 l 1267 296 q 1070 51 1215 132 q 661 -28 925 -29 m 390 507 l 942 507 q 672 639 889 639 q 390 507 440 639 m 507 963 l 507 1097 l 779 1097 l 779 963 l 507 963 z "
		},
		Ę: {
			ha: 1317,
			x_min: 82,
			x_max: 1247,
			o:
				"m 82 0 l 82 997 l 1101 997 l 1101 751 l 408 751 l 408 611 l 1074 611 l 1074 388 l 408 388 l 408 246 l 1101 246 l 1101 0 l 1103 0 q 1035 -104 1035 -58 q 1081 -165 1035 -147 q 1247 -182 1128 -182 l 1247 -336 q 927 -301 1014 -336 q 840 -171 840 -265 q 954 0 840 -76 l 82 0 z "
		},
		ę: {
			ha: 1326,
			x_min: 51,
			x_max: 1274,
			o:
				"m 661 -28 q 217 93 382 -28 q 53 417 51 214 q 217 742 53 621 q 660 863 382 863 q 1114 732 954 863 q 1274 353 1274 601 l 383 353 q 681 196 424 196 q 854 223 781 196 q 953 296 928 250 l 1267 296 q 914 -4 1193 57 q 851 -104 851 -60 q 898 -165 851 -147 q 1064 -182 944 -182 l 1064 -336 q 744 -301 831 -336 q 657 -171 657 -265 q 735 -26 657 -92 q 661 -28 711 -28 m 390 507 l 942 507 q 672 639 889 639 q 390 507 440 639 z "
		},
		Ě: {
			ha: 1185,
			x_min: 82,
			x_max: 1101,
			o:
				"m 82 0 l 82 997 l 1101 997 l 1101 751 l 408 751 l 408 611 l 1074 611 l 1074 388 l 408 388 l 408 246 l 1101 246 l 1101 0 l 82 0 m 347 1182 l 347 1349 l 631 1238 l 915 1349 l 915 1182 l 632 1071 l 347 1182 z "
		},
		ě: {
			ha: 1326,
			x_min: 51,
			x_max: 1274,
			o:
				"m 661 -28 q 217 93 382 -28 q 53 417 51 214 q 217 742 53 621 q 660 863 382 863 q 1114 732 954 863 q 1274 353 1274 601 l 383 353 q 681 196 424 196 q 854 223 781 196 q 953 296 928 250 l 1267 296 q 1070 51 1215 132 q 661 -28 925 -29 m 360 1015 l 360 1182 l 643 1071 l 928 1182 l 928 1015 l 644 904 l 360 1015 m 390 507 l 942 507 q 672 639 889 639 q 390 507 440 639 z "
		},
		Ğ: {
			ha: 1465,
			x_min: 67,
			x_max: 1399,
			o:
				"m 769 -28 q 258 114 450 -28 q 67 493 67 256 q 252 877 67 733 q 747 1021 438 1021 q 1208 913 1029 1021 q 1399 628 1386 804 l 1049 628 q 952 710 1035 676 q 750 744 869 744 q 501 674 593 744 q 410 493 410 604 q 510 313 410 376 q 789 249 610 249 q 1136 306 990 249 l 1136 354 l 722 354 l 722 557 l 1399 557 l 1399 126 q 1117 13 1286 53 q 769 -28 947 -28 m 429 1353 l 604 1353 q 635 1268 604 1297 q 742 1239 667 1239 q 848 1268 817 1239 q 879 1353 879 1297 l 1054 1353 q 968 1146 1054 1211 q 742 1081 882 1081 q 515 1146 601 1081 q 429 1353 429 1211 z "
		},
		ğ: {
			ha: 1354,
			x_min: 54,
			x_max: 1274,
			o:
				"m 696 -361 q 97 -292 426 -361 l 146 -54 q 639 -111 447 -111 q 882 -70 811 -111 q 953 65 953 -29 l 953 161 q 788 22 892 71 q 549 -28 683 -28 q 189 93 324 -28 q 54 417 54 214 q 189 741 54 619 q 549 863 324 863 q 788 813 683 863 q 953 672 892 763 l 953 835 l 1274 835 l 1274 82 q 1135 -253 1274 -146 q 696 -361 997 -361 m 382 1193 l 557 1193 q 588 1108 557 1138 q 694 1079 619 1079 q 801 1108 769 1079 q 832 1193 832 1138 l 1007 1193 q 921 986 1007 1051 q 694 921 835 921 q 468 986 554 921 q 382 1193 382 1051 m 461 547 q 426 523 461 547 q 390 417 390 499 q 461 287 390 335 q 658 239 532 239 q 864 281 786 239 q 953 396 942 324 l 953 438 q 864 553 942 510 q 658 596 786 596 q 461 547 532 596 z "
		},
		Ġ: {
			ha: 1465,
			x_min: 67,
			x_max: 1399,
			o:
				"m 769 -28 q 258 114 450 -28 q 67 493 67 256 q 252 877 67 733 q 747 1021 438 1021 q 1208 913 1029 1021 q 1399 628 1386 804 l 1049 628 q 952 710 1035 676 q 750 744 869 744 q 501 674 593 744 q 410 493 410 604 q 510 313 410 376 q 789 249 610 249 q 1136 306 990 249 l 1136 354 l 722 354 l 722 557 l 1399 557 l 1399 126 q 1117 13 1286 53 q 769 -28 947 -28 m 606 1126 l 606 1261 l 878 1261 l 878 1126 l 606 1126 z "
		},
		ġ: {
			ha: 1354,
			x_min: 54,
			x_max: 1274,
			o:
				"m 696 -361 q 97 -292 426 -361 l 146 -54 q 639 -111 447 -111 q 882 -70 811 -111 q 953 65 953 -29 l 953 161 q 788 22 892 71 q 549 -28 683 -28 q 189 93 324 -28 q 54 417 54 214 q 189 741 54 619 q 549 863 324 863 q 788 813 683 863 q 953 672 892 763 l 953 835 l 1274 835 l 1274 82 q 1135 -253 1274 -146 q 696 -361 997 -361 m 461 547 q 426 523 461 547 q 390 417 390 499 q 461 287 390 335 q 658 239 532 239 q 864 281 786 239 q 953 396 942 324 l 953 438 q 864 553 942 510 q 658 596 786 596 q 461 547 532 596 m 560 967 l 560 1101 l 832 1101 l 832 967 l 560 967 z "
		},
		Ģ: {
			ha: 1465,
			x_min: 67,
			x_max: 1399,
			o:
				"m 769 -28 q 258 114 450 -28 q 67 493 67 256 q 252 877 67 733 q 747 1021 438 1021 q 1208 913 1029 1021 q 1399 628 1386 804 l 1049 628 q 952 710 1035 676 q 750 744 869 744 q 501 674 593 744 q 410 493 410 604 q 510 313 410 376 q 789 249 610 249 q 1136 306 990 249 l 1136 354 l 722 354 l 722 557 l 1399 557 l 1399 126 q 1117 13 1286 53 q 769 -28 947 -28 m 628 -239 l 628 -74 l 907 -74 l 907 -239 l 763 -390 l 629 -390 l 724 -239 l 628 -239 z "
		},
		ģ: {
			ha: 1354,
			x_min: 54,
			x_max: 1274,
			o:
				"m 696 -361 q 97 -292 426 -361 l 146 -54 q 639 -111 447 -111 q 882 -70 811 -111 q 953 65 953 -29 l 953 161 q 788 22 892 71 q 549 -28 683 -28 q 189 93 324 -28 q 54 417 54 214 q 189 741 54 619 q 549 863 324 863 q 788 813 683 863 q 953 672 892 763 l 953 835 l 1274 835 l 1274 82 q 1135 -253 1274 -146 q 696 -361 997 -361 m 461 547 q 426 523 461 547 q 390 417 390 499 q 461 287 390 335 q 658 239 532 239 q 864 281 786 239 q 953 396 942 324 l 953 438 q 864 553 942 510 q 658 596 786 596 q 461 547 532 596 m 557 971 l 557 1135 l 701 1288 l 835 1288 l 742 1135 l 836 1135 l 836 971 l 557 971 z "
		},
		Ħ: {
			ha: 1507,
			x_min: 25,
			x_max: 1482,
			o:
				"m 128 0 l 128 757 l 25 757 l 25 889 l 128 889 l 128 997 l 454 997 l 454 889 l 1051 889 l 1051 997 l 1378 997 l 1378 889 l 1482 889 l 1482 757 l 1378 757 l 1378 0 l 1051 0 l 1051 363 l 454 363 l 454 0 l 128 0 m 454 636 l 1051 636 l 1051 757 l 454 757 l 454 636 z "
		},
		ħ: {
			ha: 1381,
			x_min: -67,
			x_max: 1300,
			o:
				"m 82 0 l 82 892 l -67 892 l -67 1024 l 82 1024 l 82 1111 l 403 1111 l 403 1024 l 678 1024 l 678 892 l 403 892 l 403 638 q 881 863 581 863 q 1300 447 1300 863 l 1300 0 l 978 0 l 978 325 q 920 534 978 469 q 719 599 863 599 q 484 531 565 599 q 403 329 403 463 l 403 0 l 82 0 z "
		},
		Ī: {
			ha: 490,
			x_min: -76,
			x_max: 568,
			o:
				"m 82 0 l 82 997 l 408 997 l 408 0 l 82 0 m -76 1132 l -76 1264 l 568 1264 l 568 1132 l -76 1132 z "
		},
		ī: {
			ha: 483,
			x_min: -81,
			x_max: 564,
			o:
				"m 82 0 l 82 835 l 403 835 l 403 0 l 82 0 m -81 969 l -81 1101 l 564 1101 l 564 969 l -81 969 z "
		},
		Į: {
			ha: 490,
			x_min: 82,
			x_max: 553,
			o:
				"m 82 0 l 82 997 l 408 997 l 408 0 q 340 -104 340 -58 q 387 -165 340 -147 q 553 -182 433 -182 l 553 -336 q 233 -301 319 -336 q 146 -171 146 -265 q 260 0 146 -76 l 82 0 z "
		},
		į: {
			ha: 483,
			x_min: 50,
			x_max: 457,
			o:
				"m 82 0 l 82 835 l 403 835 l 403 0 l 313 0 q 244 -104 244 -58 q 291 -165 244 -147 q 457 -182 338 -182 l 457 -336 q 137 -301 224 -336 q 50 -171 50 -265 q 164 0 50 -76 l 82 0 m 82 919 l 82 1111 l 403 1111 l 403 919 l 82 919 z "
		},
		İ: {
			ha: 490,
			x_min: 82,
			x_max: 408,
			o:
				"m 82 0 l 82 997 l 408 997 l 408 0 l 82 0 m 110 1129 l 110 1264 l 382 1264 l 382 1129 l 110 1129 z "
		},
		ı: {
			ha: 483,
			x_min: 82,
			x_max: 403,
			o: "m 82 0 l 82 835 l 403 835 l 403 0 l 82 0 z "
		},
		Ķ: {
			ha: 1401,
			x_min: 82,
			x_max: 1333,
			o:
				"m 82 0 l 82 997 l 408 997 l 408 601 l 853 997 l 1333 997 l 864 596 l 1333 0 l 936 0 l 629 396 l 408 208 l 408 0 l 82 0 m 533 -239 l 533 -74 l 813 -74 l 813 -239 l 668 -390 l 535 -390 l 629 -239 l 533 -239 z "
		},
		ķ: {
			ha: 1344,
			x_min: 82,
			x_max: 1292,
			o:
				"m 82 0 l 82 1111 l 403 1111 l 403 529 l 811 835 l 1292 835 l 825 494 l 1292 0 l 899 0 l 601 332 l 403 186 l 403 0 l 82 0 m 521 -239 l 521 -74 l 800 -74 l 800 -239 l 656 -390 l 522 -390 l 617 -239 l 521 -239 z "
		},
		Ĺ: {
			ha: 1126,
			x_min: 82,
			x_max: 1074,
			o:
				"m 82 0 l 82 997 l 408 997 l 408 275 l 1074 275 l 1074 0 l 82 0 m 83 1090 l 83 1253 l 621 1364 l 621 1201 l 83 1090 z "
		},
		ĺ: {
			ha: 485,
			x_min: -26,
			x_max: 511,
			o:
				"m 82 0 l 82 1111 l 403 1111 l 403 0 l 82 0 m -26 1204 l -26 1367 l 511 1478 l 511 1315 l -26 1204 z "
		},
		Ļ: {
			ha: 1126,
			x_min: 82,
			x_max: 1074,
			o:
				"m 82 0 l 82 997 l 408 997 l 408 275 l 1074 275 l 1074 0 l 82 0 m 443 -239 l 443 -74 l 722 -74 l 722 -239 l 578 -390 l 444 -390 l 539 -239 l 443 -239 z "
		},
		ļ: {
			ha: 485,
			x_min: 82,
			x_max: 403,
			o:
				"m 82 0 l 82 1111 l 403 1111 l 403 0 l 82 0 m 108 -239 l 108 -74 l 388 -74 l 388 -239 l 243 -390 l 110 -390 l 204 -239 l 108 -239 z "
		},
		Ľ: {
			ha: 1126,
			x_min: 82,
			x_max: 1074,
			o:
				"m 82 0 l 82 997 l 408 997 l 408 275 l 1074 275 l 1074 0 l 82 0 m 760 757 l 760 997 l 1063 997 l 1063 794 l 928 538 l 779 538 l 874 757 l 760 757 z "
		},
		ľ: {
			ha: 913,
			x_min: 82,
			x_max: 831,
			o:
				"m 82 0 l 82 1111 l 403 1111 l 403 0 l 82 0 m 528 871 l 528 1111 l 831 1111 l 831 908 l 696 651 l 547 651 l 642 871 l 528 871 z "
		},
		Ł: {
			ha: 1126,
			x_min: -65,
			x_max: 1074,
			o:
				"m 82 0 l 82 451 l -65 404 l -65 569 l 82 617 l 82 997 l 408 997 l 408 722 l 718 822 l 718 656 l 408 556 l 408 275 l 1074 275 l 1074 0 l 82 0 z "
		},
		ł: {
			ha: 833,
			x_min: 51,
			x_max: 783,
			o:
				"m 257 0 l 257 368 l 51 272 l 51 418 l 257 514 l 257 1111 l 578 1111 l 578 661 l 783 757 l 783 613 l 578 517 l 578 0 l 257 0 z "
		},
		Ń: {
			ha: 1483,
			x_min: 82,
			x_max: 1401,
			o:
				"m 82 0 l 82 997 l 565 997 l 1075 314 l 1075 997 l 1401 997 l 1401 0 l 918 0 l 408 685 l 408 0 l 82 0 m 474 1090 l 474 1253 l 1011 1364 l 1011 1201 l 474 1090 z "
		},
		ń: {
			ha: 1382,
			x_min: 81,
			x_max: 1301,
			o:
				"m 81 0 l 81 835 l 406 835 l 406 647 q 883 863 581 863 q 1301 447 1301 863 l 1301 0 l 976 0 l 976 325 q 919 532 976 468 q 721 596 863 596 q 486 528 567 596 q 406 329 406 461 l 406 0 l 81 0 m 457 924 l 457 1086 l 994 1197 l 994 1035 l 457 924 z "
		},
		Ņ: {
			ha: 1483,
			x_min: 82,
			x_max: 1401,
			o:
				"m 82 0 l 82 997 l 565 997 l 1075 314 l 1075 997 l 1401 997 l 1401 0 l 918 0 l 408 685 l 408 0 l 82 0 m 531 -239 l 531 -74 l 810 -74 l 810 -239 l 665 -390 l 532 -390 l 626 -239 l 531 -239 z "
		},
		ņ: {
			ha: 1382,
			x_min: 81,
			x_max: 1301,
			o:
				"m 81 0 l 81 835 l 406 835 l 406 647 q 883 863 581 863 q 1301 447 1301 863 l 1301 0 l 976 0 l 976 325 q 919 532 976 468 q 721 596 863 596 q 486 528 567 596 q 406 329 406 461 l 406 0 l 81 0 m 556 -239 l 556 -74 l 835 -74 l 835 -239 l 690 -390 l 557 -390 l 651 -239 l 556 -239 z "
		},
		Ň: {
			ha: 1483,
			x_min: 82,
			x_max: 1401,
			o:
				"m 82 0 l 82 997 l 565 997 l 1075 314 l 1075 997 l 1401 997 l 1401 0 l 918 0 l 408 685 l 408 0 l 82 0 m 458 1182 l 458 1349 l 742 1238 l 1026 1349 l 1026 1182 l 743 1071 l 458 1182 z "
		},
		ň: {
			ha: 1382,
			x_min: 81,
			x_max: 1301,
			o:
				"m 81 0 l 81 835 l 406 835 l 406 647 q 883 863 581 863 q 1301 447 1301 863 l 1301 0 l 976 0 l 976 325 q 919 532 976 468 q 721 596 863 596 q 486 528 567 596 q 406 329 406 461 l 406 0 l 81 0 m 442 1015 l 442 1182 l 725 1071 l 1010 1182 l 1010 1015 l 726 904 l 442 1015 z "
		},
		Ŋ: {
			ha: 1483,
			x_min: 82,
			x_max: 1401,
			o:
				"m 82 0 l 82 997 l 565 997 l 1075 314 l 1075 997 l 1401 997 l 1401 0 q 1019 -360 1401 -360 q 774 -339 892 -360 l 774 -131 q 928 -144 872 -144 q 1015 -117 990 -144 q 1039 0 1039 -89 l 918 0 l 408 685 l 408 0 l 82 0 z "
		},
		ŋ: {
			ha: 1382,
			x_min: 81,
			x_max: 1301,
			o:
				"m 81 0 l 81 835 l 406 835 l 406 647 q 883 863 581 863 q 1301 447 1301 863 l 1301 0 q 1208 -268 1301 -175 q 906 -361 1114 -361 q 671 -340 803 -361 l 671 -97 q 836 -112 764 -112 q 951 -88 922 -112 q 979 0 979 -64 l 976 0 l 976 325 q 919 532 976 468 q 721 596 863 596 q 486 528 567 596 q 406 329 406 461 l 406 0 l 81 0 z "
		},
		Ō: {
			ha: 1535,
			x_min: 68,
			x_max: 1467,
			o:
				"m 767 -28 q 258 116 449 -28 q 68 499 68 260 q 258 878 68 736 q 767 1021 449 1021 q 1276 878 1086 1021 q 1467 499 1467 736 q 1276 115 1467 258 q 767 -28 1086 -28 m 408 499 q 506 316 408 385 q 767 247 604 247 q 1030 316 932 247 q 1128 499 1128 385 q 1030 679 1128 611 q 767 747 932 747 q 506 679 603 747 q 408 499 408 611 m 444 1132 l 444 1264 l 1089 1264 l 1089 1132 l 444 1132 z "
		},
		ō: {
			ha: 1319,
			x_min: 53,
			x_max: 1267,
			o:
				"m 1101 94 q 1018 33 1101 94 q 660 -28 935 -28 q 219 94 385 -28 q 53 418 53 215 q 219 742 53 621 q 660 863 385 863 q 1101 742 935 863 q 1267 418 1267 621 q 1101 94 1267 215 m 338 969 l 338 1101 l 982 1101 l 982 969 l 338 969 m 453 560 q 414 533 453 560 q 375 418 375 507 q 453 276 375 329 q 660 222 531 222 q 867 276 789 222 q 944 418 944 329 q 867 560 944 507 q 660 613 789 613 q 453 560 531 613 z "
		},
		Ő: {
			ha: 1535,
			x_min: 68,
			x_max: 1467,
			o:
				"m 767 -28 q 258 116 449 -28 q 68 499 68 260 q 258 878 68 736 q 767 1021 449 1021 q 1276 878 1086 1021 q 1467 499 1467 736 q 1276 115 1467 258 q 767 -28 1086 -28 m 408 499 q 506 316 408 385 q 767 247 604 247 q 1030 316 932 247 q 1128 499 1128 385 q 1030 679 1128 611 q 767 747 932 747 q 506 679 603 747 q 408 499 408 611 m 439 1099 l 439 1265 l 725 1376 l 725 1210 l 439 1099 m 807 1099 l 807 1265 l 1093 1376 l 1093 1210 l 807 1099 z "
		},
		ő: {
			ha: 1319,
			x_min: 53,
			x_max: 1267,
			o:
				"m 1101 94 q 1018 33 1101 94 q 660 -28 935 -28 q 219 94 385 -28 q 53 418 53 215 q 219 742 53 621 q 660 863 385 863 q 1101 742 935 863 q 1267 418 1267 621 q 1101 94 1267 215 m 333 936 l 333 1103 l 619 1214 l 619 1047 l 333 936 m 453 560 q 414 533 453 560 q 375 418 375 507 q 453 276 375 329 q 660 222 531 222 q 867 276 789 222 q 944 418 944 329 q 867 560 944 507 q 660 613 789 613 q 453 560 531 613 m 701 936 l 701 1103 l 988 1214 l 988 1047 l 701 936 z "
		},
		Œ: {
			ha: 2307,
			x_min: 68,
			x_max: 2224,
			o:
				"m 767 -28 q 258 116 449 -28 q 68 499 68 260 q 258 878 68 736 q 767 1021 449 1021 q 1204 925 1024 1021 l 1204 997 l 2224 997 l 2224 751 l 1531 751 l 1531 611 l 2196 611 l 2196 388 l 1531 388 l 1531 246 l 2224 246 l 2224 0 l 1204 0 l 1204 69 q 767 -28 1025 -28 m 408 499 q 506 316 408 385 q 767 247 604 247 q 1030 316 932 247 q 1128 499 1128 385 q 1030 679 1128 611 q 767 747 932 747 q 506 679 603 747 q 408 499 408 611 z "
		},
		œ: {
			ha: 2218,
			x_min: 53,
			x_max: 2164,
			o:
				"m 660 -28 q 219 94 385 -28 q 53 418 53 215 q 219 742 53 621 q 660 863 385 863 q 1104 739 939 863 q 1550 863 1269 863 q 2004 732 1844 863 q 2164 353 2164 601 l 1274 353 q 1571 196 1314 196 q 1744 223 1671 196 q 1843 296 1818 250 l 2157 296 q 1960 51 2106 132 q 1551 -28 1815 -29 q 1103 96 1269 -28 q 660 -28 938 -28 m 453 560 q 414 533 453 560 q 375 418 375 507 q 453 276 375 329 q 660 222 531 222 q 858 270 782 222 q 943 399 935 318 l 943 417 l 943 436 q 858 565 935 517 q 660 613 782 613 q 453 560 531 613 m 1281 507 l 1832 507 q 1563 639 1779 639 q 1281 507 1331 639 z "
		},
		Ŕ: {
			ha: 1399,
			x_min: 82,
			x_max: 1304,
			o:
				"m 82 0 l 82 997 l 894 997 q 1304 692 1304 997 q 1094 424 1304 486 q 1247 363 1192 417 q 1303 219 1303 310 l 1303 0 l 976 0 l 976 167 q 953 258 976 233 q 863 282 929 282 l 408 282 l 408 0 l 82 0 m 389 1090 l 389 1253 l 926 1364 l 926 1201 l 389 1090 m 408 543 l 817 543 q 927 563 890 543 q 964 640 964 583 q 927 716 964 696 q 817 736 890 736 l 408 736 l 408 543 z "
		},
		ŕ: {
			ha: 997,
			x_min: 82,
			x_max: 943,
			o:
				"m 82 0 l 82 835 l 403 835 l 403 653 q 547 813 465 764 q 740 863 628 863 q 943 821 846 863 l 943 542 q 728 583 828 583 q 403 408 533 583 l 403 0 l 82 0 m 217 928 l 217 1090 l 754 1201 l 754 1039 l 217 928 z "
		},
		Ŗ: {
			ha: 1399,
			x_min: 82,
			x_max: 1304,
			o:
				"m 82 0 l 82 997 l 894 997 q 1304 692 1304 997 q 1094 424 1304 486 q 1247 363 1192 417 q 1303 219 1303 310 l 1303 0 l 976 0 l 976 167 q 953 258 976 233 q 863 282 929 282 l 408 282 l 408 0 l 82 0 m 408 543 l 817 543 q 927 563 890 543 q 964 640 964 583 q 927 716 964 696 q 817 736 890 736 l 408 736 l 408 543 m 565 -239 l 565 -74 l 844 -74 l 844 -239 l 700 -390 l 567 -390 l 661 -239 l 565 -239 z "
		},
		ŗ: {
			ha: 997,
			x_min: 82,
			x_max: 943,
			o:
				"m 82 0 l 82 835 l 403 835 l 403 653 q 547 813 465 764 q 740 863 628 863 q 943 821 846 863 l 943 542 q 728 583 828 583 q 403 408 533 583 l 403 0 l 82 0 m 108 -239 l 108 -74 l 388 -74 l 388 -239 l 243 -390 l 110 -390 l 204 -239 l 108 -239 z "
		},
		Ř: {
			ha: 1399,
			x_min: 82,
			x_max: 1304,
			o:
				"m 82 0 l 82 997 l 894 997 q 1304 692 1304 997 q 1094 424 1304 486 q 1247 363 1192 417 q 1303 219 1303 310 l 1303 0 l 976 0 l 976 167 q 953 258 976 233 q 863 282 929 282 l 408 282 l 408 0 l 82 0 m 374 1182 l 374 1349 l 657 1238 l 942 1349 l 942 1182 l 658 1071 l 374 1182 m 408 543 l 817 543 q 927 563 890 543 q 964 640 964 583 q 927 716 964 696 q 817 736 890 736 l 408 736 l 408 543 z "
		},
		ř: {
			ha: 997,
			x_min: 82,
			x_max: 943,
			o:
				"m 82 0 l 82 835 l 403 835 l 403 653 q 547 813 465 764 q 740 863 628 863 q 943 821 846 863 l 943 542 q 728 583 828 583 q 403 408 533 583 l 403 0 l 82 0 m 201 1019 l 201 1186 l 485 1075 l 769 1186 l 769 1019 l 486 908 l 201 1019 z "
		},
		Ś: {
			ha: 1367,
			x_min: 68,
			x_max: 1300,
			o:
				"m 713 -28 q 239 56 400 -28 q 68 329 78 139 l 407 329 q 699 208 407 208 q 865 219 806 208 q 942 246 924 229 q 961 292 961 263 q 940 339 961 324 q 864 363 919 354 q 682 381 808 372 l 633 383 q 214 477 344 400 q 83 714 83 554 q 233 942 83 864 q 644 1021 382 1021 q 1093 934 938 1021 q 1258 681 1249 847 l 919 681 q 853 760 919 736 q 642 785 786 785 q 469 767 517 785 q 422 714 422 749 q 472 656 422 674 q 683 628 521 639 l 740 624 q 879 611 824 617 q 999 594 935 606 q 1104 567 1063 582 q 1186 529 1146 553 q 1249 475 1226 506 q 1286 401 1272 444 q 1300 304 1300 358 q 1152 48 1300 124 q 713 -28 1004 -28 m 411 1090 l 411 1253 l 949 1364 l 949 1201 l 411 1090 z "
		},
		ś: {
			ha: 1231,
			x_min: 51,
			x_max: 1178,
			o:
				"m 636 -28 q 201 44 351 -28 q 53 278 51 117 l 389 278 q 441 206 389 229 q 631 182 493 182 q 801 199 754 182 q 847 254 847 217 q 803 306 847 292 q 626 332 758 321 l 554 338 q 180 407 288 358 q 72 585 72 456 q 608 863 72 863 q 819 847 725 863 q 986 799 913 832 q 1101 712 1060 767 q 1149 582 1143 657 l 813 582 q 601 665 811 665 q 403 604 403 665 q 442 560 403 574 q 604 538 482 547 l 690 531 q 864 513 797 522 q 997 486 931 504 q 1099 442 1064 468 q 1156 372 1135 415 q 1178 269 1178 329 q 1140 124 1178 183 q 1026 33 1101 65 q 858 -14 951 0 q 636 -28 764 -28 m 349 924 l 349 1086 l 886 1197 l 886 1035 l 349 924 z "
		},
		Ş: {
			ha: 1367,
			x_min: 68,
			x_max: 1300,
			o:
				"m 510 -231 q 695 -244 635 -250 q 756 -204 756 -239 q 711 -174 756 -174 q 651 -194 683 -171 l 557 -168 l 593 -25 q 208 74 339 -10 q 68 329 76 158 l 407 329 q 699 208 407 208 q 865 219 806 208 q 942 246 924 229 q 961 292 961 263 q 940 339 961 324 q 864 363 919 354 q 682 381 808 372 l 633 383 q 214 477 344 400 q 83 714 83 554 q 233 942 83 864 q 644 1021 382 1021 q 1093 934 938 1021 q 1258 681 1249 847 l 919 681 q 853 760 919 736 q 642 785 786 785 q 469 767 517 785 q 422 714 422 749 q 472 656 422 674 q 683 628 521 639 l 740 624 q 879 611 824 617 q 999 594 935 606 q 1104 567 1063 582 q 1186 529 1146 553 q 1249 475 1226 506 q 1286 401 1272 444 q 1300 304 1300 358 q 1157 51 1300 128 q 733 -28 1014 -25 l 719 -82 q 813 -69 763 -69 q 917 -103 878 -69 q 956 -200 956 -137 q 916 -298 956 -258 q 813 -352 876 -337 q 669 -371 749 -367 q 510 -362 589 -375 l 510 -231 z "
		},
		ş: {
			ha: 1231,
			x_min: 51,
			x_max: 1178,
			o:
				"m 446 -231 q 631 -244 571 -250 q 692 -204 692 -239 q 647 -174 692 -174 q 588 -194 619 -171 l 493 -168 l 529 -25 q 174 60 296 -12 q 53 278 51 132 l 389 278 q 441 206 389 229 q 631 182 493 182 q 801 199 754 182 q 847 254 847 217 q 803 306 847 292 q 626 332 758 321 l 554 338 q 180 407 288 358 q 72 585 72 456 q 608 863 72 863 q 819 847 725 863 q 986 799 913 832 q 1101 712 1060 767 q 1149 582 1143 657 l 813 582 q 601 665 811 665 q 403 604 403 665 q 442 560 403 574 q 604 538 482 547 l 690 531 q 864 513 797 522 q 997 486 931 504 q 1099 442 1064 468 q 1156 372 1135 415 q 1178 269 1178 329 q 1047 42 1178 110 q 669 -28 917 -25 l 656 -82 q 749 -69 699 -69 q 853 -103 814 -69 q 892 -200 892 -137 q 852 -298 892 -258 q 749 -352 813 -337 q 605 -371 685 -367 q 446 -362 525 -375 l 446 -231 z "
		},
		Š: {
			ha: 1367,
			x_min: 68,
			x_max: 1300,
			o:
				"m 713 -28 q 239 56 400 -28 q 68 329 78 139 l 407 329 q 699 208 407 208 q 865 219 806 208 q 942 246 924 229 q 961 292 961 263 q 940 339 961 324 q 864 363 919 354 q 682 381 808 372 l 633 383 q 214 477 344 400 q 83 714 83 554 q 233 942 83 864 q 644 1021 382 1021 q 1093 934 938 1021 q 1258 681 1249 847 l 919 681 q 853 760 919 736 q 642 785 786 785 q 469 767 517 785 q 422 714 422 749 q 472 656 422 674 q 683 628 521 639 l 740 624 q 879 611 824 617 q 999 594 935 606 q 1104 567 1063 582 q 1186 529 1146 553 q 1249 475 1226 506 q 1286 401 1272 444 q 1300 304 1300 358 q 1152 48 1300 124 q 713 -28 1004 -28 m 396 1182 l 396 1349 l 679 1238 l 964 1349 l 964 1182 l 681 1071 l 396 1182 z "
		},
		š: {
			ha: 1231,
			x_min: 51,
			x_max: 1178,
			o:
				"m 636 -28 q 201 44 351 -28 q 53 278 51 117 l 389 278 q 441 206 389 229 q 631 182 493 182 q 801 199 754 182 q 847 254 847 217 q 803 306 847 292 q 626 332 758 321 l 554 338 q 180 407 288 358 q 72 585 72 456 q 608 863 72 863 q 819 847 725 863 q 986 799 913 832 q 1101 712 1060 767 q 1149 582 1143 657 l 813 582 q 601 665 811 665 q 403 604 403 665 q 442 560 403 574 q 604 538 482 547 l 690 531 q 864 513 797 522 q 997 486 931 504 q 1099 442 1064 468 q 1156 372 1135 415 q 1178 269 1178 329 q 1140 124 1178 183 q 1026 33 1101 65 q 858 -14 951 0 q 636 -28 764 -28 m 332 1015 l 332 1182 l 615 1071 l 900 1182 l 900 1015 l 617 904 l 332 1015 z "
		},
		Ţ: {
			ha: 1322,
			x_min: 68,
			x_max: 1254,
			o:
				"m 68 722 l 68 997 l 1254 997 l 1254 722 l 825 722 l 825 0 l 719 0 l 701 -68 q 794 -56 744 -56 q 899 -90 860 -56 q 938 -186 938 -124 q 898 -284 938 -244 q 794 -338 858 -324 q 651 -357 731 -353 q 492 -349 571 -361 l 492 -217 q 677 -231 617 -236 q 738 -190 738 -225 q 693 -160 738 -160 q 633 -181 665 -157 l 539 -154 l 578 0 l 499 0 l 499 722 l 68 722 z "
		},
		ţ: {
			ha: 929,
			x_min: 53,
			x_max: 876,
			o:
				"m 53 600 l 53 835 l 218 835 l 218 988 l 538 1071 l 538 835 l 876 835 l 876 600 l 538 600 l 538 367 q 665 236 538 236 q 876 264 749 236 l 876 8 q 606 -28 736 -26 l 596 -67 q 689 -54 639 -54 q 793 -88 754 -54 q 832 -185 832 -122 q 792 -283 832 -243 q 689 -337 753 -322 q 545 -356 625 -351 q 386 -347 465 -360 l 386 -215 q 572 -229 511 -235 q 632 -189 632 -224 q 588 -158 632 -158 q 528 -179 560 -156 l 433 -153 l 467 -18 q 218 250 218 25 l 218 600 l 53 600 z "
		},
		Ť: {
			ha: 1322,
			x_min: 68,
			x_max: 1254,
			o:
				"m 68 722 l 68 997 l 1254 997 l 1254 722 l 825 722 l 825 0 l 499 0 l 499 722 l 68 722 m 378 1182 l 378 1349 l 661 1238 l 946 1349 l 946 1182 l 663 1071 l 378 1182 z "
		},
		ť: {
			ha: 1301,
			x_min: 53,
			x_max: 1233,
			o:
				"m 590 -28 q 313 42 408 -28 q 218 250 218 111 l 218 600 l 53 600 l 53 835 l 218 835 l 218 988 l 538 1071 l 538 835 l 876 835 l 876 600 l 538 600 l 538 367 q 665 236 538 236 q 876 264 749 236 l 876 8 q 590 -28 732 -28 m 931 871 l 931 1111 l 1233 1111 l 1233 908 l 1099 651 l 950 651 l 1044 871 l 931 871 z "
		},
		Ŧ: {
			ha: 1322,
			x_min: 68,
			x_max: 1254,
			o:
				"m 68 722 l 68 997 l 1254 997 l 1254 722 l 825 722 l 825 493 l 1147 493 l 1147 360 l 825 360 l 825 0 l 499 0 l 499 360 l 176 360 l 176 493 l 499 493 l 499 722 l 68 722 z "
		},
		ŧ: {
			ha: 929,
			x_min: 53,
			x_max: 876,
			o:
				"m 53 394 l 53 526 l 218 526 l 218 600 l 53 600 l 53 835 l 218 835 l 218 988 l 538 1071 l 538 835 l 876 835 l 876 600 l 538 600 l 538 526 l 876 526 l 876 394 l 538 394 l 538 367 q 665 236 538 236 q 876 264 749 236 l 876 8 q 590 -28 732 -28 q 313 42 408 -28 q 218 250 218 111 l 218 394 l 53 394 z "
		},
		Ū: {
			ha: 1376,
			x_min: 82,
			x_max: 1296,
			o:
				"m 689 -28 q 228 101 374 -28 q 82 488 82 231 l 82 997 l 408 997 l 408 499 q 689 247 408 247 q 826 269 769 247 q 913 328 883 290 q 956 407 943 365 q 968 499 968 449 l 968 997 l 1296 997 l 1296 488 q 1149 101 1296 231 q 689 -28 1003 -28 m 367 1132 l 367 1264 l 1011 1264 l 1011 1132 l 367 1132 z "
		},
		ū: {
			ha: 1382,
			x_min: 81,
			x_max: 1301,
			o:
				"m 1301 835 l 1301 0 l 976 0 l 976 188 q 499 -28 801 -28 q 81 388 81 -28 l 81 835 l 406 835 l 406 510 q 463 303 406 367 q 661 239 519 239 q 895 306 814 239 q 976 506 976 374 l 976 835 l 1301 835 m 368 969 l 368 1101 l 1013 1101 l 1013 969 l 368 969 z "
		},
		Ů: {
			ha: 1376,
			x_min: 82,
			x_max: 1296,
			o:
				"m 689 -28 q 228 101 374 -28 q 82 488 82 231 l 82 997 l 408 997 l 408 499 q 689 247 408 247 q 826 269 769 247 q 913 328 883 290 q 956 407 943 365 q 968 499 968 449 l 968 997 l 1296 997 l 1296 488 q 1149 101 1296 231 q 689 -28 1003 -28 m 689 1079 q 385 1260 385 1079 q 689 1440 385 1440 q 992 1260 992 1440 q 689 1079 992 1079 m 689 1332 q 618 1332 689 1332 q 547 1260 547 1332 q 689 1188 547 1188 q 831 1260 831 1188 q 689 1332 831 1332 z "
		},
		ů: {
			ha: 1382,
			x_min: 81,
			x_max: 1301,
			o:
				"m 1301 835 l 1301 0 l 976 0 l 976 188 q 499 -28 801 -28 q 81 388 81 -28 l 81 835 l 406 835 l 406 510 q 463 303 406 367 q 661 239 519 239 q 895 306 814 239 q 976 506 976 374 l 976 835 l 1301 835 m 690 917 q 386 1097 386 917 q 690 1278 386 1278 q 993 1097 993 1278 q 690 917 993 917 m 690 1169 q 619 1169 690 1169 q 549 1097 549 1169 q 690 1025 549 1025 q 832 1097 832 1025 q 690 1169 832 1169 z "
		},
		Ű: {
			ha: 1376,
			x_min: 82,
			x_max: 1296,
			o:
				"m 689 -28 q 228 101 374 -28 q 82 488 82 231 l 82 997 l 408 997 l 408 499 q 689 247 408 247 q 826 269 769 247 q 913 328 883 290 q 956 407 943 365 q 968 499 968 449 l 968 997 l 1296 997 l 1296 488 q 1149 101 1296 231 q 689 -28 1003 -28 m 361 1099 l 361 1265 l 647 1376 l 647 1210 l 361 1099 m 729 1099 l 729 1265 l 1015 1376 l 1015 1210 l 729 1099 z "
		},
		ű: {
			ha: 1382,
			x_min: 81,
			x_max: 1301,
			o:
				"m 1301 835 l 1301 0 l 976 0 l 976 188 q 499 -28 801 -28 q 81 388 81 -28 l 81 835 l 406 835 l 406 510 q 463 303 406 367 q 661 239 519 239 q 895 306 814 239 q 976 506 976 374 l 976 835 l 1301 835 m 363 936 l 363 1103 l 649 1214 l 649 1047 l 363 936 m 731 936 l 731 1103 l 1017 1214 l 1017 1047 l 731 936 z "
		},
		Ų: {
			ha: 1376,
			x_min: 82,
			x_max: 1296,
			o:
				"m 689 -28 q 228 101 374 -28 q 82 488 82 231 l 82 997 l 408 997 l 408 499 q 689 247 408 247 q 826 269 769 247 q 913 328 883 290 q 956 407 943 365 q 968 499 968 449 l 968 997 l 1296 997 l 1296 488 q 939 -1 1296 89 q 872 -104 872 -58 q 919 -165 872 -147 q 1085 -182 965 -182 l 1085 -336 q 765 -301 851 -336 q 678 -171 678 -265 q 756 -26 678 -89 q 689 -28 735 -28 z "
		},
		ų: {
			ha: 1382,
			x_min: 81,
			x_max: 1301,
			o:
				"m 1301 835 l 1301 0 l 1126 0 q 1058 -104 1058 -58 q 1105 -165 1058 -147 q 1271 -182 1151 -182 l 1271 -336 q 951 -301 1038 -336 q 864 -171 864 -265 q 978 0 864 -76 l 976 0 l 976 188 q 499 -28 801 -28 q 81 388 81 -28 l 81 835 l 406 835 l 406 510 q 463 303 406 367 q 661 239 519 239 q 895 306 814 239 q 976 506 976 374 l 976 835 l 1301 835 z "
		},
		Ŵ: {
			ha: 2301,
			x_min: 68,
			x_max: 2233,
			o:
				"m 399 0 l 68 997 l 397 997 l 640 244 l 935 997 l 1367 997 l 1661 244 l 1904 997 l 2233 997 l 1903 0 l 1433 0 l 1151 735 l 869 0 l 399 0 m 867 1086 l 867 1251 l 1151 1363 l 1435 1251 l 1435 1086 l 1151 1197 l 867 1086 z "
		},
		ŵ: {
			ha: 2240,
			x_min: 53,
			x_max: 2188,
			o:
				"m 415 0 l 53 835 l 406 835 l 646 239 l 910 835 l 1331 835 l 1596 240 l 1836 835 l 2188 835 l 1825 0 l 1371 0 l 1121 558 l 869 0 l 415 0 m 838 924 l 838 1089 l 1122 1200 l 1406 1089 l 1406 924 l 1122 1035 l 838 924 z "
		},
		Ŷ: {
			ha: 1543,
			x_min: 68,
			x_max: 1475,
			o:
				"m 608 0 l 608 333 l 68 997 l 474 997 l 771 607 l 1069 997 l 1475 997 l 935 333 l 935 0 l 608 0 m 488 1086 l 488 1251 l 772 1363 l 1056 1251 l 1056 1086 l 772 1197 l 488 1086 z "
		},
		ŷ: {
			ha: 1386,
			x_min: 53,
			x_max: 1333,
			o:
				"m 435 -361 q 122 -311 292 -361 l 122 -69 q 390 -111 310 -111 q 510 -92 474 -111 q 588 0 547 -72 l 449 0 l 53 835 l 400 835 l 693 218 l 986 835 l 1333 835 l 949 28 q 739 -265 857 -168 q 435 -361 621 -361 m 390 924 l 390 1089 l 675 1200 l 958 1089 l 958 924 l 675 1035 l 390 924 z "
		},
		Ÿ: {
			ha: 1543,
			x_min: 68,
			x_max: 1475,
			o:
				"m 608 0 l 608 333 l 68 997 l 474 997 l 771 607 l 1069 997 l 1475 997 l 935 333 l 935 0 l 608 0 m 472 1111 l 472 1264 l 715 1264 l 715 1111 l 472 1111 m 829 1111 l 829 1264 l 1071 1264 l 1071 1111 l 829 1111 z "
		},
		Ź: {
			ha: 1279,
			x_min: 82,
			x_max: 1199,
			o:
				"m 82 0 l 82 275 l 726 722 l 82 722 l 82 997 l 1199 997 l 1199 722 l 550 275 l 1199 275 l 1199 0 l 82 0 m 371 1090 l 371 1253 l 908 1364 l 908 1201 l 371 1090 z "
		},
		ź: {
			ha: 1150,
			x_min: 82,
			x_max: 1068,
			o:
				"m 82 0 l 82 235 l 650 600 l 82 600 l 82 835 l 1068 835 l 1068 600 l 501 235 l 1068 235 l 1068 0 l 82 0 m 307 928 l 307 1090 l 844 1201 l 844 1039 l 307 928 z "
		},
		Ż: {
			ha: 1279,
			x_min: 82,
			x_max: 1199,
			o:
				"m 82 0 l 82 275 l 726 722 l 82 722 l 82 997 l 1199 997 l 1199 722 l 550 275 l 1199 275 l 1199 0 l 82 0 m 503 1129 l 503 1264 l 775 1264 l 775 1129 l 503 1129 z "
		},
		ż: {
			ha: 1150,
			x_min: 82,
			x_max: 1068,
			o:
				"m 82 0 l 82 235 l 650 600 l 82 600 l 82 835 l 1068 835 l 1068 600 l 501 235 l 1068 235 l 1068 0 l 82 0 m 439 967 l 439 1101 l 711 1101 l 711 967 l 439 967 z "
		},
		Ž: {
			ha: 1279,
			x_min: 82,
			x_max: 1199,
			o:
				"m 82 0 l 82 275 l 726 722 l 82 722 l 82 997 l 1199 997 l 1199 722 l 550 275 l 1199 275 l 1199 0 l 82 0 m 356 1182 l 356 1349 l 639 1238 l 924 1349 l 924 1182 l 640 1071 l 356 1182 z "
		},
		ž: {
			ha: 1150,
			x_min: 82,
			x_max: 1068,
			o:
				"m 82 0 l 82 235 l 650 600 l 82 600 l 82 835 l 1068 835 l 1068 600 l 501 235 l 1068 235 l 1068 0 l 82 0 m 290 1019 l 290 1186 l 574 1075 l 858 1186 l 858 1019 l 575 908 l 290 1019 z "
		},
		Ș: {
			ha: 1367,
			x_min: 68,
			x_max: 1300,
			o:
				"m 713 -28 q 239 56 400 -28 q 68 329 78 139 l 407 329 q 699 208 407 208 q 865 219 806 208 q 942 246 924 229 q 961 292 961 263 q 940 339 961 324 q 864 363 919 354 q 682 381 808 372 l 633 383 q 214 477 344 400 q 83 714 83 554 q 233 942 83 864 q 644 1021 382 1021 q 1093 934 938 1021 q 1258 681 1249 847 l 919 681 q 853 760 919 736 q 642 785 786 785 q 469 767 517 785 q 422 714 422 749 q 472 656 422 674 q 683 628 521 639 l 740 624 q 879 611 824 617 q 999 594 935 606 q 1104 567 1063 582 q 1186 529 1146 553 q 1249 475 1226 506 q 1286 401 1272 444 q 1300 304 1300 358 q 1152 48 1300 124 q 713 -28 1004 -28 m 544 -253 l 544 -87 l 824 -87 l 824 -253 l 679 -404 l 546 -404 l 640 -253 l 544 -253 z "
		},
		ș: {
			ha: 1231,
			x_min: 51,
			x_max: 1178,
			o:
				"m 636 -28 q 201 44 351 -28 q 53 278 51 117 l 389 278 q 441 206 389 229 q 631 182 493 182 q 801 199 754 182 q 847 254 847 217 q 803 306 847 292 q 626 332 758 321 l 554 338 q 180 407 288 358 q 72 585 72 456 q 608 863 72 863 q 819 847 725 863 q 986 799 913 832 q 1101 712 1060 767 q 1149 582 1143 657 l 813 582 q 601 665 811 665 q 403 604 403 665 q 442 560 403 574 q 604 538 482 547 l 690 531 q 864 513 797 522 q 997 486 931 504 q 1099 442 1064 468 q 1156 372 1135 415 q 1178 269 1178 329 q 1140 124 1178 183 q 1026 33 1101 65 q 858 -14 951 0 q 636 -28 764 -28 m 482 -253 l 482 -87 l 761 -87 l 761 -253 l 617 -404 l 483 -404 l 578 -253 l 482 -253 z "
		},
		Ț: {
			ha: 1322,
			x_min: 68,
			x_max: 1254,
			o:
				"m 68 722 l 68 997 l 1254 997 l 1254 722 l 825 722 l 825 0 l 499 0 l 499 722 l 68 722 m 528 -239 l 528 -74 l 807 -74 l 807 -239 l 663 -390 l 529 -390 l 624 -239 l 528 -239 z "
		},
		ț: {
			ha: 929,
			x_min: 53,
			x_max: 876,
			o:
				"m 590 -28 q 313 42 408 -28 q 218 250 218 111 l 218 600 l 53 600 l 53 835 l 218 835 l 218 988 l 538 1071 l 538 835 l 876 835 l 876 600 l 538 600 l 538 367 q 665 236 538 236 q 876 264 749 236 l 876 8 q 590 -28 732 -28 m 421 -237 l 421 -72 l 700 -72 l 700 -237 l 556 -389 l 422 -389 l 517 -237 l 421 -237 z "
		},
		ȷ: {
			ha: 735,
			x_min: 26,
			x_max: 654,
			o:
				"m 271 -361 q 26 -339 153 -361 l 26 -126 q 200 -140 140 -140 q 306 -111 279 -140 q 333 11 333 -82 l 333 835 l 654 835 l 654 29 q 271 -361 654 -361 z "
		},
		ˆ: {
			ha: 776,
			x_min: 139,
			x_max: 707,
			o:
				"m 139 924 l 139 1089 l 424 1200 l 707 1089 l 707 924 l 424 1035 l 139 924 z "
		},
		ˇ: {
			ha: 776,
			x_min: 139,
			x_max: 707,
			o:
				"m 424 908 l 139 1019 l 139 1186 l 422 1075 l 707 1186 l 707 1019 l 424 908 z "
		},
		"˘": {
			ha: 833,
			x_min: 139,
			x_max: 764,
			o:
				"m 678 986 q 635 953 678 986 q 451 921 592 921 q 225 986 311 921 q 139 1193 139 1051 l 314 1193 q 345 1108 314 1138 q 451 1079 376 1079 q 558 1108 526 1079 q 589 1193 589 1138 l 764 1193 q 678 986 764 1051 z "
		},
		"˙": {
			ha: 481,
			x_min: 139,
			x_max: 411,
			o: "m 139 967 l 139 1101 l 411 1101 l 411 967 l 139 967 z "
		},
		"˚": {
			ha: 815,
			x_min: 139,
			x_max: 746,
			o:
				"m 443 917 q 139 1097 139 917 q 443 1278 139 1278 q 746 1097 746 1278 q 443 917 746 917 m 443 1169 q 372 1169 443 1169 q 301 1097 301 1169 q 443 1025 301 1025 q 585 1097 585 1025 q 443 1169 585 1169 z "
		},
		"˛": {
			ha: 615,
			x_min: 139,
			x_max: 546,
			o:
				"m 546 -336 q 226 -301 313 -336 q 139 -171 139 -265 q 167 -78 139 -118 q 257 3 196 -39 l 401 0 q 333 -104 333 -58 q 380 -165 333 -147 q 546 -182 426 -182 l 546 -336 z "
		},
		"˜": {
			ha: 993,
			x_min: 139,
			x_max: 924,
			o:
				"m 683 915 q 597 930 635 915 q 535 965 558 944 q 492 1005 511 985 q 447 1040 472 1025 q 393 1054 422 1054 q 300 915 300 1054 l 139 915 q 201 1139 139 1061 q 381 1217 264 1217 q 485 1195 440 1217 q 551 1148 529 1174 q 603 1101 572 1122 q 668 1079 633 1079 q 763 1218 763 1079 l 924 1218 q 861 994 924 1072 q 683 915 799 915 z "
		},
		"˝": {
			ha: 863,
			x_min: 139,
			x_max: 793,
			o:
				"m 507 936 l 507 1103 l 793 1214 l 793 1047 l 507 936 m 139 936 l 139 1103 l 425 1214 l 425 1047 l 139 936 z "
		},
		"̀": {
			ha: 0,
			x_min: 69,
			x_max: 607,
			o: "m 607 928 l 69 1039 l 69 1201 l 607 1090 l 607 928 z "
		},
		"́": {
			ha: 0,
			x_min: 69,
			x_max: 607,
			o: "m 69 928 l 69 1090 l 607 1201 l 607 1039 l 69 928 z "
		},
		"̂": {
			ha: 0,
			x_min: 69,
			x_max: 638,
			o:
				"m 69 924 l 69 1089 l 354 1200 l 638 1089 l 638 924 l 354 1035 l 69 924 z "
		},
		"̃": {
			ha: 0,
			x_min: 69,
			x_max: 854,
			o:
				"m 614 915 q 527 930 565 915 q 465 965 489 944 q 422 1005 442 985 q 378 1040 403 1025 q 324 1054 353 1054 q 231 915 231 1054 l 69 915 q 132 1139 69 1061 q 311 1217 194 1217 q 415 1195 371 1217 q 481 1148 460 1174 q 533 1101 503 1122 q 599 1079 564 1079 q 693 1218 693 1079 l 854 1218 q 792 994 854 1072 q 614 915 729 915 z "
		},
		"̄": {
			ha: 0,
			x_min: 69,
			x_max: 714,
			o: "m 69 969 l 69 1101 l 714 1101 l 714 969 l 69 969 z "
		},
		"̆": {
			ha: 0,
			x_min: 69,
			x_max: 694,
			o:
				"m 608 986 q 565 953 608 986 q 382 921 522 921 q 156 986 242 921 q 69 1193 69 1051 l 244 1193 q 276 1108 244 1138 q 382 1079 307 1079 q 488 1108 457 1079 q 519 1193 519 1138 l 694 1193 q 608 986 694 1051 z "
		},
		"̇": {
			ha: 0,
			x_min: 69,
			x_max: 342,
			o: "m 69 967 l 69 1101 l 342 1101 l 342 967 l 69 967 z "
		},
		"̈": {
			ha: 0,
			x_min: 69,
			x_max: 668,
			o:
				"m 426 949 l 426 1101 l 668 1101 l 668 949 l 426 949 m 69 949 l 69 1101 l 313 1101 l 313 949 l 69 949 z "
		},
		"̊": {
			ha: 0,
			x_min: 69,
			x_max: 676,
			o:
				"m 374 917 q 69 1097 69 917 q 374 1278 69 1278 q 676 1097 676 1278 q 374 917 676 917 m 374 1169 q 303 1169 374 1169 q 232 1097 232 1169 q 374 1025 232 1025 q 515 1097 515 1025 q 374 1169 515 1169 z "
		},
		"̋": {
			ha: 0,
			x_min: 69,
			x_max: 724,
			o:
				"m 438 936 l 438 1103 l 724 1214 l 724 1047 l 438 936 m 69 936 l 69 1103 l 356 1214 l 356 1047 l 69 936 z "
		},
		"̌": {
			ha: 0,
			x_min: 69,
			x_max: 638,
			o:
				"m 354 908 l 69 1019 l 69 1186 l 353 1075 l 638 1186 l 638 1019 l 354 908 z "
		},
		"̒": {
			ha: 0,
			x_min: 69,
			x_max: 349,
			o:
				"m 69 971 l 69 1135 l 214 1288 l 347 1288 l 254 1135 l 349 1135 l 349 971 l 69 971 z "
		},
		"̦": {
			ha: 0,
			x_min: 69,
			x_max: 349,
			o:
				"m 71 -390 l 165 -239 l 69 -239 l 69 -74 l 349 -74 l 349 -239 l 204 -390 l 71 -390 z "
		},
		"̧": {
			ha: 0,
			x_min: 69,
			x_max: 515,
			o:
				"m 69 -217 q 255 -231 194 -236 q 315 -190 315 -225 q 271 -160 315 -160 q 211 -181 243 -157 l 117 -154 l 156 0 l 297 0 l 279 -68 q 372 -56 322 -56 q 476 -90 438 -56 q 515 -186 515 -124 q 476 -284 515 -244 q 372 -338 436 -324 q 228 -357 308 -353 q 69 -349 149 -361 l 69 -217 z "
		},
		"̨": {
			ha: 0,
			x_min: 69,
			x_max: 476,
			o:
				"m 476 -336 q 156 -301 243 -336 q 69 -171 69 -265 q 98 -78 69 -118 q 188 3 126 -39 l 332 0 q 264 -104 264 -58 q 310 -165 264 -147 q 476 -182 357 -182 l 476 -336 z "
		},
		"̵": {
			ha: 0,
			x_min: 69,
			x_max: 729,
			o: "m 69 407 l 69 539 l 729 539 l 729 407 l 69 407 z "
		},
		"̶": {
			ha: 0,
			x_min: 69,
			x_max: 1451,
			o: "m 69 407 l 69 539 l 1451 539 l 1451 407 l 69 407 z "
		},
		"̷": {
			ha: 0,
			x_min: 165,
			x_max: 868,
			o: "m 165 -208 l 563 1097 l 868 1097 l 472 -208 l 165 -208 z "
		},
		"̸": {
			ha: 0,
			x_min: 69,
			x_max: 615,
			o: "m 69 -204 l 431 1004 l 615 1004 l 254 -204 l 69 -204 z "
		},
		Ẁ: {
			ha: 2301,
			x_min: 68,
			x_max: 2233,
			o:
				"m 399 0 l 68 997 l 397 997 l 640 244 l 935 997 l 1367 997 l 1661 244 l 1904 997 l 2233 997 l 1903 0 l 1433 0 l 1151 735 l 869 0 l 399 0 m 882 1201 l 882 1364 l 1419 1253 l 1419 1090 l 882 1201 z "
		},
		ẁ: {
			ha: 2240,
			x_min: 53,
			x_max: 2188,
			o:
				"m 415 0 l 53 835 l 406 835 l 646 239 l 910 835 l 1331 835 l 1596 240 l 1836 835 l 2188 835 l 1825 0 l 1371 0 l 1121 558 l 869 0 l 415 0 m 853 1039 l 853 1201 l 1390 1090 l 1390 928 l 853 1039 z "
		},
		Ẃ: {
			ha: 2301,
			x_min: 68,
			x_max: 2233,
			o:
				"m 399 0 l 68 997 l 397 997 l 640 244 l 935 997 l 1367 997 l 1661 244 l 1904 997 l 2233 997 l 1903 0 l 1433 0 l 1151 735 l 869 0 l 399 0 m 882 1090 l 882 1253 l 1419 1364 l 1419 1201 l 882 1090 z "
		},
		ẃ: {
			ha: 2240,
			x_min: 53,
			x_max: 2188,
			o:
				"m 415 0 l 53 835 l 406 835 l 646 239 l 910 835 l 1331 835 l 1596 240 l 1836 835 l 2188 835 l 1825 0 l 1371 0 l 1121 558 l 869 0 l 415 0 m 853 928 l 853 1090 l 1390 1201 l 1390 1039 l 853 928 z "
		},
		Ẅ: {
			ha: 2301,
			x_min: 68,
			x_max: 2233,
			o:
				"m 399 0 l 68 997 l 397 997 l 640 244 l 935 997 l 1367 997 l 1661 244 l 1904 997 l 2233 997 l 1903 0 l 1433 0 l 1151 735 l 869 0 l 399 0 m 851 1111 l 851 1264 l 1094 1264 l 1094 1111 l 851 1111 m 1208 1111 l 1208 1264 l 1450 1264 l 1450 1111 l 1208 1111 z "
		},
		ẅ: {
			ha: 2240,
			x_min: 53,
			x_max: 2188,
			o:
				"m 415 0 l 53 835 l 406 835 l 646 239 l 910 835 l 1331 835 l 1596 240 l 1836 835 l 2188 835 l 1825 0 l 1371 0 l 1121 558 l 869 0 l 415 0 m 821 949 l 821 1101 l 1064 1101 l 1064 949 l 821 949 m 1178 949 l 1178 1101 l 1419 1101 l 1419 949 l 1178 949 z "
		},
		Ỳ: {
			ha: 1543,
			x_min: 68,
			x_max: 1475,
			o:
				"m 608 0 l 608 333 l 68 997 l 474 997 l 771 607 l 1069 997 l 1475 997 l 935 333 l 935 0 l 608 0 m 503 1201 l 503 1364 l 1040 1253 l 1040 1090 l 503 1201 z "
		},
		ỳ: {
			ha: 1386,
			x_min: 53,
			x_max: 1333,
			o:
				"m 435 -361 q 122 -311 292 -361 l 122 -69 q 390 -111 310 -111 q 510 -92 474 -111 q 588 0 547 -72 l 449 0 l 53 835 l 400 835 l 693 218 l 986 835 l 1333 835 l 949 28 q 739 -265 857 -168 q 435 -361 621 -361 m 407 1039 l 407 1201 l 944 1090 l 944 928 l 407 1039 z "
		},
		"–": {
			ha: 1601,
			x_min: 110,
			x_max: 1492,
			o: "m 110 356 l 110 589 l 1492 589 l 1492 356 l 110 356 z "
		},
		"—": {
			ha: 1879,
			x_min: 110,
			x_max: 1769,
			o: "m 110 356 l 110 589 l 1769 589 l 1769 356 l 110 356 z "
		},
		"‘": {
			ha: 553,
			x_min: 96,
			x_max: 472,
			o: "m 472 1085 l 415 553 l 96 553 l 194 1085 l 472 1085 z "
		},
		"’": {
			ha: 538,
			x_min: 81,
			x_max: 457,
			o: "m 81 553 l 138 1085 l 457 1085 l 358 553 l 81 553 z "
		},
		"‚": {
			ha: 503,
			x_min: 82,
			x_max: 421,
			o:
				"m 113 -306 l 208 0 l 82 0 l 82 253 l 421 253 l 421 0 l 263 -306 l 113 -306 z "
		},
		"“": {
			ha: 972,
			x_min: 82,
			x_max: 892,
			o:
				"m 892 1085 l 835 553 l 515 553 l 614 1085 l 892 1085 m 82 553 l 181 1085 l 458 1085 l 401 553 l 82 553 z "
		},
		"”": {
			ha: 972,
			x_min: 81,
			x_max: 890,
			o:
				"m 81 553 l 138 1085 l 457 1085 l 358 553 l 81 553 m 514 553 l 571 1085 l 890 1085 l 792 553 l 514 553 z "
		},
		"„": {
			ha: 933,
			x_min: 82,
			x_max: 851,
			o:
				"m 543 -306 l 639 0 l 513 0 l 513 253 l 851 253 l 851 0 l 693 -306 l 543 -306 m 82 0 l 82 253 l 421 253 l 421 0 l 263 -306 l 113 -306 l 208 0 l 82 0 z "
		},
		"†": {
			ha: 1278,
			x_min: 82,
			x_max: 1194,
			o:
				"m 493 -208 l 493 571 l 82 571 l 82 835 l 493 835 l 493 1104 l 785 1104 l 785 835 l 1194 835 l 1194 571 l 785 571 l 785 -208 l 493 -208 z "
		},
		"‡": {
			ha: 1278,
			x_min: 82,
			x_max: 1194,
			o:
				"m 82 78 l 82 342 l 493 342 l 493 571 l 82 571 l 82 835 l 493 835 l 493 1104 l 785 1104 l 785 835 l 1194 835 l 1194 571 l 785 571 l 785 342 l 1194 342 l 1194 78 l 785 78 l 785 -208 l 493 -208 l 493 78 l 82 78 z "
		},
		"•": {
			ha: 740,
			x_min: 82,
			x_max: 657,
			o:
				"m 588 290 q 553 265 588 290 q 371 240 518 240 q 153 290 224 240 q 82 446 82 340 q 153 599 82 550 q 371 649 224 649 q 588 599 518 649 q 657 446 657 550 q 588 290 657 340 z "
		},
		"…": {
			ha: 1340,
			x_min: 82,
			x_max: 1258,
			o:
				"m 82 0 l 82 253 l 421 253 l 421 0 l 82 0 m 501 0 l 501 253 l 840 253 l 840 0 l 501 0 m 919 0 l 919 253 l 1258 253 l 1258 0 l 919 0 z "
		},
		"‰": {
			ha: 2922,
			x_min: 82,
			x_max: 2868,
			o:
				"m 2763 74 q 2711 23 2763 74 q 2474 -28 2658 -28 q 2184 74 2289 -28 q 2079 313 2079 175 q 2184 549 2079 449 q 2474 650 2289 650 q 2763 549 2658 650 q 2868 313 2868 449 q 2763 74 2868 175 m 82 692 q 187 925 82 826 q 476 1024 292 1024 q 766 925 661 1024 q 871 692 871 826 q 766 456 871 554 q 476 357 661 357 q 187 456 292 357 q 82 692 82 554 m 329 692 q 364 590 329 631 q 476 549 399 549 q 590 590 554 549 q 625 692 625 631 q 590 792 625 751 q 476 832 554 832 q 364 792 399 832 q 329 692 329 751 m 599 0 l 1226 1001 l 1492 1001 l 863 0 l 599 0 m 1219 303 q 1324 538 1219 440 q 1614 636 1429 636 q 1903 538 1799 636 q 2008 303 2008 440 q 1903 69 2008 167 q 1614 -29 1799 -29 q 1324 69 1429 -29 q 1219 303 1219 167 m 1465 303 q 1501 203 1465 243 q 1614 163 1536 163 q 1726 203 1690 163 q 1761 303 1761 243 q 1726 405 1761 364 q 1614 446 1690 446 q 1501 405 1536 446 q 1465 303 1465 364 m 2362 416 q 2344 395 2362 416 q 2326 313 2326 374 q 2362 208 2326 251 q 2474 164 2397 164 q 2586 208 2550 164 q 2622 313 2622 251 q 2587 416 2622 374 q 2474 458 2551 458 q 2362 416 2397 458 z "
		},
		"‹": {
			ha: 910,
			x_min: 82,
			x_max: 828,
			o: "m 443 0 l 82 418 l 443 835 l 828 835 l 465 418 l 828 0 l 443 0 z "
		},
		"›": {
			ha: 910,
			x_min: 82,
			x_max: 828,
			o: "m 467 835 l 828 417 l 467 0 l 82 0 l 444 418 l 82 835 l 467 835 z "
		},
		"⁄": {
			ha: 894,
			x_min: 96,
			x_max: 799,
			o: "m 96 -208 l 493 1097 l 799 1097 l 403 -208 l 96 -208 z "
		},
		"€": {
			ha: 1436,
			x_min: 81,
			x_max: 1354,
			o:
				"m 894 -29 q 414 57 578 -29 q 208 333 250 143 l 81 333 l 81 458 l 193 458 l 193 490 l 193 515 l 81 515 l 81 640 l 206 640 q 410 931 244 840 q 899 1021 575 1021 q 1354 965 1171 1021 l 1354 701 q 963 757 1174 757 q 576 640 657 757 l 1193 640 l 1193 515 l 536 515 l 536 494 q 538 458 536 469 l 1193 458 l 1193 333 l 589 333 q 958 235 679 235 q 1354 290 1165 235 l 1354 26 q 894 -29 1168 -29 z "
		},
		"™": {
			ha: 1742,
			x_min: 79,
			x_max: 1621,
			o:
				"m 79 826 l 79 997 l 710 997 l 710 826 l 492 826 l 492 500 l 296 500 l 296 826 l 79 826 m 772 500 l 772 997 l 1069 997 l 1197 726 l 1325 997 l 1621 997 l 1621 500 l 1425 500 l 1425 818 l 1272 500 l 1110 500 l 968 815 l 968 500 l 772 500 z "
		},
		"←": {
			ha: 1599,
			x_min: 110,
			x_max: 1489,
			o:
				"m 533 1 l 110 429 l 533 854 l 676 719 l 472 531 l 1489 531 l 1489 325 l 471 325 l 676 136 l 533 1 z "
		},
		"↑": {
			ha: 1018,
			x_min: 82,
			x_max: 935,
			o:
				"m 935 597 l 800 454 l 611 660 l 611 0 l 406 0 l 406 658 l 217 454 l 82 597 l 507 1021 l 935 597 z "
		},
		"→": {
			ha: 1599,
			x_min: 110,
			x_max: 1489,
			o:
				"m 1064 1 l 921 136 l 1126 325 l 110 325 l 110 531 l 1126 531 l 921 719 l 1065 854 l 1489 429 l 1064 1 z "
		},
		"↓": {
			ha: 1018,
			x_min: 82,
			x_max: 935,
			o:
				"m 935 394 l 507 -29 l 82 394 l 217 538 l 406 333 l 406 997 l 611 997 l 611 332 l 800 538 l 935 394 z "
		},
		"↔": {
			ha: 1979,
			x_min: 110,
			x_max: 1869,
			o:
				"m 533 0 l 110 428 l 533 853 l 676 718 l 472 529 l 1508 529 l 1303 718 l 1446 853 l 1869 428 l 1446 0 l 1303 135 l 1508 324 l 471 324 l 676 135 l 533 0 z "
		},
		"↕": {
			ha: 1017,
			x_min: 82,
			x_max: 935,
			o:
				"m 507 -174 l 82 250 l 217 393 l 406 189 l 406 804 l 217 599 l 82 743 l 507 1167 l 935 742 l 800 599 l 611 804 l 611 188 l 800 393 l 935 250 l 507 -174 z "
		},
		"↖": {
			ha: 1135,
			x_min: 68,
			x_max: 1067,
			o:
				"m 68 393 l 71 994 l 671 996 l 676 800 l 397 813 l 1067 144 l 921 0 l 251 668 l 264 386 l 68 393 z "
		},
		"↗": {
			ha: 1132,
			x_min: 68,
			x_max: 1064,
			o:
				"m 1064 393 l 868 386 l 881 667 l 213 0 l 68 144 l 733 810 l 456 799 l 461 996 l 1061 994 l 1064 393 z "
		},
		"↘": {
			ha: 1139,
			x_min: 68,
			x_max: 1069,
			o:
				"m 1069 606 l 1068 3 l 468 3 l 461 199 l 742 186 l 68 853 l 213 997 l 888 331 l 875 611 l 1069 606 z "
		},
		"↙": {
			ha: 1133,
			x_min: 68,
			x_max: 1065,
			o:
				"m 671 3 l 71 3 l 68 606 l 264 611 l 251 331 l 921 997 l 1065 853 l 397 186 l 676 199 l 671 3 z "
		},
		"∅": {
			ha: 1522,
			x_min: 44,
			x_max: 1478,
			o:
				"m 201 -231 l 44 -74 l 200 82 q 68 490 68 250 q 114 744 68 626 q 245 950 160 861 q 464 1090 331 1039 q 763 1140 597 1140 q 1160 1042 996 1140 l 1321 1203 l 1478 1046 l 1326 894 q 1454 490 1454 726 q 1272 23 1454 208 q 763 -162 1090 -162 q 367 -65 535 -162 l 201 -231 m 381 490 q 415 297 381 376 l 958 840 q 761 879 874 879 q 476 777 572 879 q 381 490 381 675 m 568 136 q 761 99 647 99 q 1044 201 949 99 q 1140 490 1140 304 q 1108 676 1140 596 l 568 136 z "
		},
		"∏": {
			ha: 1800,
			x_min: 68,
			x_max: 1732,
			o:
				"m 68 847 l 68 1111 l 1732 1111 l 1732 847 l 1426 847 l 1426 -208 l 1135 -208 l 1135 847 l 667 847 l 667 -208 l 375 -208 l 375 847 l 68 847 z "
		},
		"−": {
			ha: 1268,
			x_min: 82,
			x_max: 1186,
			o: "m 82 356 l 82 589 l 1186 589 l 1186 356 l 82 356 z "
		},
		"∫": {
			ha: 1258,
			x_min: 26,
			x_max: 1232,
			o:
				"m 26 56 q 98 57 69 56 q 168 65 126 58 q 241 85 210 71 q 305 124 272 100 q 362 185 338 147 q 403 275 386 224 l 508 628 q 579 806 539 729 q 658 934 619 883 q 756 1019 697 985 q 857 1072 814 1054 q 976 1099 900 1090 q 1097 1110 1051 1108 q 1232 1111 1143 1111 l 1232 847 q 1124 842 1167 847 q 1022 818 1081 838 q 922 751 964 799 q 857 628 881 703 l 750 275 q 670 72 714 157 q 566 -65 626 -14 q 456 -147 506 -117 q 321 -190 406 -178 q 183 -206 236 -203 q 26 -208 131 -208 l 26 56 z "
		},
		"≈": {
			ha: 1269,
			x_min: 82,
			x_max: 1186,
			o:
				"m 82 526 q 156 851 82 733 q 369 968 231 968 q 501 942 435 968 q 613 885 568 917 q 712 828 657 854 q 811 803 767 803 q 899 840 874 803 q 925 968 925 878 l 1186 968 q 1112 644 1186 761 q 899 526 1038 526 q 767 552 833 526 q 656 609 700 578 q 556 666 611 640 q 457 692 501 692 q 369 654 394 692 q 343 526 343 617 l 82 526 m 82 1 q 156 326 82 208 q 369 443 231 443 q 501 417 435 443 q 613 360 568 392 q 712 303 657 329 q 811 278 767 278 q 899 315 874 278 q 925 443 925 353 l 1186 443 q 1112 119 1186 236 q 899 1 1038 1 q 767 27 833 1 q 656 84 700 53 q 556 141 611 115 q 457 167 501 167 q 369 129 394 167 q 343 1 343 92 l 82 1 z "
		},
		"≠": {
			ha: 1268,
			x_min: 82,
			x_max: 1186,
			o:
				"m 82 578 l 82 811 l 640 811 l 728 1097 l 936 1097 l 850 811 l 1186 811 l 1186 578 l 779 578 l 715 367 l 1186 367 l 1186 133 l 644 133 l 540 -208 l 331 -208 l 435 133 l 82 133 l 82 367 l 506 367 l 569 578 l 82 578 z "
		},
		"≤": {
			ha: 1271,
			x_min: 82,
			x_max: 1186,
			o:
				"m 82 1 l 82 235 l 1186 235 l 1186 1 l 82 1 m 82 460 l 82 874 l 1185 1024 l 1185 757 l 339 667 l 1185 575 l 1185 308 l 82 460 z "
		},
		"≥": {
			ha: 1274,
			x_min: 86,
			x_max: 1192,
			o:
				"m 88 1 l 88 235 l 1192 235 l 1192 1 l 88 1 m 86 313 l 86 579 l 932 669 l 86 761 l 86 1028 l 1189 876 l 1189 463 l 86 313 z "
		},
		"◊": {
			ha: 1342,
			x_min: 82,
			x_max: 1258,
			o:
				"m 454 -250 l 82 432 l 454 1111 l 888 1111 l 1258 432 l 888 -250 l 454 -250 m 382 431 l 671 -103 l 960 431 l 671 964 l 382 431 z "
		},
		ﬁ: {
			ha: 1385,
			x_min: 53,
			x_max: 1304,
			o:
				"m 247 869 q 335 1052 247 993 q 617 1111 424 1111 l 1304 1111 l 1304 919 l 703 919 q 597 902 625 919 q 567 835 568 885 l 1304 835 l 1304 0 l 983 0 l 983 600 l 567 600 l 567 0 l 247 0 l 247 600 l 53 600 l 53 835 l 247 835 l 247 869 z "
		},
		ﬂ: {
			ha: 1386,
			x_min: 53,
			x_max: 1304,
			o:
				"m 247 869 q 335 1052 247 993 q 617 1111 424 1111 l 1304 1111 l 1304 0 l 983 0 l 983 919 l 703 919 q 597 902 625 919 q 567 835 568 885 l 892 835 l 892 600 l 567 600 l 567 0 l 247 0 l 247 600 l 53 600 l 53 835 l 247 835 l 247 869 z "
		}
	},
	familyName: "PP Monument Extended Black",
	ascender: 1414,
	descender: -417,
	underlinePosition: -82,
	underlineThickness: 126,
	boundingBox: { yMin: -404, xMin: -81, yMax: 1478, xMax: 2868 },
	resolution: 1000,
	original_font_information: {
		format: 0,
		copyright: "Pangram Pangram®",
		fontFamily: "PP Monument Extended Black",
		fontSubfamily: "Regular",
		uniqueID: "3.000;PP;PPMonumentExtended-Black",
		fullName: "PP Monument Extended Black",
		version: "Version 3.000;FEAKit 1.0",
		postScriptName: "PPMonumentExtended-Black",
		manufacturer: "Pangram Pangram®",
		designer: "Mathieu Desjardins",
		manufacturerURL: "pangrampangram.com",
		designerURL: "pangrampangram.com",
		preferredFamily: "PP Monument Extended",
		preferredSubfamily: "Black",
		unknown1: "Alternate AVWag",
		unknown2: "Alternate KR"
	},
	cssFontWeight: "normal",
	cssFontStyle: "normal"
};

new App();