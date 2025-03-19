/* global THREE */

// Configuration
const Config = {
    pixelSize: 10,
    d20Radius: 55,
    labelScale: 12,
    lineWidth: 15,
    rollDuration: 2000,
    stopDuration: 3000,
    initialScale: 1.2,
    gravity: 0.002,
    groundLevel: 0,
    flashDuration: 500,
    flashColor: 0xff0000,
    labelCanvasSize: 8,
    labelFontSize: 8,
    labelFont: 'bold 8px monospace',
    labelTextColor: '#ffffff',
    backgroundColor: 0x1a1a1a,  // Changed to match CRT shader's grey
    faceNumbers: [9, 6, 16, 3, 19, 14, 11, 1, 17, 8, 18, 5, 15, 12, 2, 4, 13, 7, 10, 20],
    initialAngularVelocity: 1,
    angularVelocityDamping: 0.98,
    bounceSpeed: 0.05,
    bounceDamping: -0.6,
    pixelHeightRatio: 2.0
};

// Shaders
const CRTShader = {
    uniforms: {
        tDiffuse: { value: null },
        time: { value: 0.0 },
        resolution: { value: new THREE.Vector2() },
        curvature: { value: 4.0 },      // Increased curvature
        vignetteBoost: { value: 1.2 },
        vignetteDarkness: { value: 1.5 },
        scanlineIntensity: { value: 0.075 },
        scanlineCount: { value: 800.0 },
        flickerAmount: { value: 0.1 },
        bleedAmount: { value: 10.0 },
        horizontalBleed: { value: 0.4 }, // Adjusted for better bloom
        bloomStrength: { value: 0.4 },   // Adjusted for wider bloom
        bloomSpread: { value: 0.01 },    // Increased spread
        glowStrength: { value: 0.8 },    // Reduced strength for wider radius
        glowSpread: { value: 0.02 },     // Much larger spread
        glowThreshold: { value: 0.4 },   // Lower threshold to catch more bright areas
        colorBleedStrength: { value: 0.25 },    // New uniform for color bleeding, increased to 0.25
        colorBleedSpread: { value: 0.0004 },    // New uniform for bleed spread, adjusted to 0.0004
        chromaticAberration: { value: 0.004 }, // Chromatic aberration intensity
        gridIntensity: { value: 0.2 },      // Adjusted for better visibility
        gridScale: { value: 2 },         // Reduced scale for more visible grid
        backgroundColor: { value: new THREE.Vector3(0.1, 0.1, 0.1) },  // Grey background tint
        borderWidth: { value: 0.03 },    // Width of the border
        vignetteAmount: { value: 0.5 },  // Strength of the vignette
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform vec2 resolution;
        uniform float curvature;
        uniform float vignetteBoost;
        uniform float vignetteDarkness;
        uniform float scanlineIntensity;
        uniform float scanlineCount;
        uniform float flickerAmount;
        uniform float bleedAmount;
        uniform float horizontalBleed;
        uniform float bloomStrength;
        uniform float bloomSpread;
        uniform float glowStrength;
        uniform float glowSpread;
        uniform float glowThreshold;
        uniform float colorBleedStrength;
        uniform float colorBleedSpread;
        uniform float chromaticAberration;
        uniform float gridIntensity;
        uniform float gridScale;
        uniform vec3 backgroundColor;
        uniform float borderWidth;
        uniform float vignetteAmount;
        varying vec2 vUv;

        vec2 curveRemapUV(vec2 uv) {
            // Convert to -1 to 1 range
            vec2 cuv = uv * 2.0 - 1.0;
            
            // Apply stronger curve towards edges
            vec2 offset = abs(cuv.yx) / vec2(curvature);
            cuv += cuv * offset * offset;
            
            // Add barrel distortion
            float barrelDistance = length(cuv);
            cuv *= 1.0 + barrelDistance * barrelDistance * 0.03;
            
            // Return to 0-1 range
            return cuv * 0.5 + 0.5;
        }

        // Improved brightness calculation that preserves color
        float getBrightness(vec3 color) {
            return dot(color, vec3(0.2, 0.7, 0.1)); // Weight green higher
        }

        float getVignette(vec2 uv) {
            uv = uv * 2.0 - 1.0;
            return smoothstep(1.0, 0.2, length(uv) * vignetteAmount);
        }

        void main() {
            vec2 uv = curveRemapUV(vUv);
            vec4 finalColor = vec4(backgroundColor, 1.0);
            float scanline = 1.0;
            float flicker = 1.0;
            
            // Improved border handling
            float border = 1.0;
            if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                return;
            }
            
            // Smooth border transition
            if (uv.x < borderWidth) border *= smoothstep(0.0, borderWidth, uv.x);
            if (uv.x > 1.0 - borderWidth) border *= smoothstep(1.0, 1.0 - borderWidth, uv.x);
            if (uv.y < borderWidth) border *= smoothstep(0.0, borderWidth, uv.y);
            if (uv.y > 1.0 - borderWidth) border *= smoothstep(1.0, 1.0 - borderWidth, uv.y);

            // Sample with chromatic aberration
            float chromaticOffset = chromaticAberration;
            vec4 r = texture2D(tDiffuse, uv + vec2(chromaticOffset, 0.0));
            vec4 g = texture2D(tDiffuse, uv);
            vec4 b = texture2D(tDiffuse, uv - vec2(chromaticOffset, 0.0));
            vec4 baseColor = vec4(r.r, g.g, b.b, g.a);

            // Sample with color separation
            vec4 rColor = texture2D(tDiffuse, uv + vec2(colorBleedSpread, 0.0));
            vec4 bColor = texture2D(tDiffuse, uv - vec2(colorBleedSpread, 0.0));
            
            vec4 centerColor = mix(baseColor, vec4(rColor.r, baseColor.g, bColor.b, baseColor.a), colorBleedStrength);

            vec4 glow = vec4(0.0);
            float brightness = getBrightness(centerColor.rgb);
            
            // Enhanced glow calculation with wider radius
            if(brightness > glowThreshold) {
                float glowFactor = 0.0;
                
                // Sample more points with much wider spacing
                for(float i = 1.0; i <= 8.0; i++) {
                    float offset = i * glowSpread;
                    float weight = pow(0.85, i); // Reduced falloff for wider glow
                    
                    vec4 sampleL = texture2D(tDiffuse, uv - vec2(offset, 0.0));
                    vec4 sampleR = texture2D(tDiffuse, uv + vec2(offset, 0.0));
                    vec4 sampleU = texture2D(tDiffuse, uv - vec2(0.0, offset));
                    vec4 sampleD = texture2D(tDiffuse, uv + vec2(0.0, offset));
                    
                    // Add diagonal samples for better spread
                    vec4 sampleUL = texture2D(tDiffuse, uv + vec2(-offset, -offset) * 0.707);
                    vec4 sampleUR = texture2D(tDiffuse, uv + vec2(offset, -offset) * 0.707);
                    vec4 sampleDL = texture2D(tDiffuse, uv + vec2(-offset, offset) * 0.707);
                    vec4 sampleDR = texture2D(tDiffuse, uv + vec2(offset, offset) * 0.707);
                    
                    glowFactor += weight;
                    glow += (sampleL + sampleR + sampleU + sampleD + 
                            sampleUL + sampleUR + sampleDL + sampleDR) * weight * 0.5;
                }
                
                // Enhance the glow intensity
                glow *= centerColor / max(0.001, brightness);
                glow *= glowStrength * smoothstep(glowThreshold, 1.0, brightness);
            }

            // Enhance the final color mix
            finalColor = mix(centerColor, centerColor + glow, 0.7);
            finalColor += glow * bloomStrength; // Add additional bloom

            // Apply scanlines and flicker
            scanline = sin(uv.y * scanlineCount + time * 10.0) * 0.5 + 0.5;
            scanline = 1.0 - (scanlineIntensity * scanline);
            flicker = 1.0 + sin(time * 100.0) * flickerAmount;

            // Apply grid lines - new calculation
            float gridX = abs(sin(uv.x * resolution.x / gridScale));
            float gridY = abs(sin(uv.y * resolution.y / gridScale));
            
            // Make grid lines more pronounced
            gridX = smoothstep(0.95, 1.0, gridX);
            gridY = smoothstep(0.95, 1.0, gridY);
            float grid = max(gridX, gridY) * gridIntensity;

            // Apply grid as a multiplicative dark mask
            finalColor.rgb *= (1.0 - grid);

            // Adjust final color for CRT look
            finalColor.rgb = mix(backgroundColor, finalColor.rgb, 0.9); // Reduce mix to maintain grey tint
            finalColor.rgb += backgroundColor * 0.15; // Increased ambient grey

            // Apply vignette and border
            float vignette = getVignette(uv);
            finalColor.rgb *= vignette * border;
            
            // Add subtle bloom near edges
            float edgeGlow = (1.0 - border) * 0.5;
            finalColor.rgb += vec3(0.1, 0.1, 0.1) * edgeGlow;

            gl_FragColor = finalColor * scanline * flicker;
        }
    `
};

const pixelateVertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const pixelateFragmentShader = `
    uniform sampler2D tDiffuse;
    uniform float pixelSize;
    uniform vec2 resolution;
    varying vec2 vUv;

    void main() {
        vec2 dxy = pixelSize / resolution;
        vec2 coord = dxy * floor(vUv / dxy);
        gl_FragColor = texture2D(tDiffuse, coord);
    }
`;

// D20 Module
const D20 = {
    d20: null,
    innerD20: null,
    labelGroup: null,
    labels: [],
    faceNumbers: Config.faceNumbers,
    init: function (scene) {
        const geometry = new THREE.IcosahedronGeometry(Config.d20Radius, 0);
        const innerGeometry = new THREE.IcosahedronGeometry(Config.d20Radius - 0.1, 0);
        geometry.computeVertexNormals();

        const innerMaterial = new THREE.MeshBasicMaterial({
            color: 0x222222,
            side: THREE.FrontSide
        });
        D20.innerD20 = new THREE.Mesh(innerGeometry, innerMaterial);

        const material = new THREE.LineMaterial({
            color: 0xffffff,
            linewidth: Config.lineWidth,
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
        });

        const edges = new THREE.EdgesGeometry(geometry);
        const lineGeometry = new THREE.LineSegmentsGeometry().setPositions(edges.attributes.position.array);
        D20.d20 = new THREE.LineSegments2(lineGeometry, material);

        D20.labelGroup = new THREE.Group();

        const positionAttribute = geometry.attributes.position;

        for (let i = 0; i < positionAttribute.count; i += 3) {
            const a = new THREE.Vector3();
            const b = new THREE.Vector3();
            const c = new THREE.Vector3();

            a.fromBufferAttribute(positionAttribute, i);
            b.fromBufferAttribute(positionAttribute, i + 1);
            c.fromBufferAttribute(positionAttribute, i + 2);

            const center = new THREE.Vector3()
                .add(a)
                .add(b)
                .add(c)
                .divideScalar(3);

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = Config.labelCanvasSize;
            canvas.height = Config.labelCanvasSize;

            context.fillStyle = '#1a1a1a';
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.font = Config.labelFont;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillStyle = Config.labelTextColor;
            context.fillText(D20.faceNumbers[i / 3].toString(), Config.labelCanvasSize / 2, Config.labelCanvasSize / 2 + 1);

            const texture = new THREE.CanvasTexture(canvas);
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;

            const spriteMaterial = new THREE.SpriteMaterial({
                map: texture,
                sizeAttenuation: false,
                depthTest: true,
                depthWrite: false
            });

            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(Config.labelScale, Config.labelScale, 1);

            const labelParent = new THREE.Object3D();
            labelParent.position.copy(center.multiplyScalar(1.1));
            labelParent.add(sprite);

            D20.labels.push(labelParent);
            D20.labelGroup.add(labelParent);
        }

        scene.add(D20.d20);
        scene.add(D20.innerD20);
        scene.add(D20.labelGroup);
    }
};

// Rendering Module
const RendererModule = {
    renderer: null,
    d20RenderTarget: null,
    d20Composer: null,
    d20Scene: null,
    labelScene: null,
    camera: null,
    pixelateShader: null,
    crtPass: null, // Add CRT pass
    init: function () {
        const scene = new THREE.Scene();
        const aspect = window.innerWidth / window.innerHeight;
        const d = 100;
        RendererModule.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
        RendererModule.camera.position.set(d, d, d);
        RendererModule.camera.lookAt(scene.position);

        RendererModule.renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('#bg'),
            depth: true,
            logarithmicDepthBuffer: true
        });

        RendererModule.renderer.setPixelRatio(window.devicePixelRatio);
        RendererModule.renderer.setSize(window.innerWidth, window.innerHeight);

        RendererModule.d20RenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);

        RendererModule.d20Scene = new THREE.Scene();
        RendererModule.labelScene = new THREE.Scene();
        RendererModule.labelScene.background = null;
        const ambientLight = new THREE.AmbientLight(0xffffff);
        RendererModule.labelScene.add(ambientLight);

        RendererModule.d20Scene.background = new THREE.Color(Config.backgroundColor);
        RendererModule.labelScene.background = null;

        RendererModule.pixelateShader = {
            uniforms: {
                tDiffuse: { value: null },
                pixelSize: { value: Config.pixelSize },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                pixelHeightRatio: { value: Config.pixelHeightRatio }
            },
            vertexShader: pixelateVertexShader,
            fragmentShader: `
              uniform sampler2D tDiffuse;
              uniform float pixelSize;
              uniform vec2 resolution;
              uniform float pixelHeightRatio;
              varying vec2 vUv;
        
              void main() {
                  vec2 uv = vUv;
                  float dx = (pixelSize / pixelHeightRatio) / resolution.x;
                  float dy = pixelSize / resolution.y;
                  vec2 coord = vec2(dx * floor(uv.x / dx), dy * floor(uv.y / dy));
                  gl_FragColor = texture2D(tDiffuse, coord) * vec4(0.3, 1.0, 0.3, 1.0);
              }
            `
        };

        // Setup render passes in correct order
        const renderPass = new THREE.RenderPass(RendererModule.d20Scene, RendererModule.camera);
        const pixelatePass = new THREE.ShaderPass(RendererModule.pixelateShader);
        const crtPass = new THREE.ShaderPass(CRTShader);
        const finalPass = new THREE.ShaderPass(THREE.CopyShader);
        finalPass.renderToScreen = true;

        // Configure CRT pass
        crtPass.uniforms['resolution'].value = new THREE.Vector2(window.innerWidth, window.innerHeight);
        crtPass.uniforms['scanlineIntensity'].value = 0.075;
        crtPass.uniforms['scanlineCount'].value = 800.0;
        crtPass.uniforms['flickerAmount'].value = 0.05;
        crtPass.uniforms['glowStrength'].value = 1.0;
        crtPass.uniforms['glowSpread'].value = 0.0015;

        // Setup composer with passes in order
        RendererModule.d20Composer = new THREE.EffectComposer(RendererModule.renderer);
        RendererModule.d20Composer.addPass(renderPass);
        RendererModule.d20Composer.addPass(pixelatePass);
        RendererModule.d20Composer.addPass(crtPass);
        RendererModule.d20Composer.addPass(finalPass);

        RendererModule.crtPass = crtPass;

        return { scene: scene, camera: RendererModule.camera, renderer: RendererModule.renderer };
    },
    render: function () {
        RendererModule.renderer.setRenderTarget(null);
        RendererModule.renderer.clear();

        // Update CRT shader time
        RendererModule.crtPass.uniforms['time'].value = performance.now() / 1000;

        RendererModule.d20Composer.render();

        RendererModule.renderer.autoClear = false;
        RendererModule.renderer.clearDepth();

        RendererModule.renderer.render(RendererModule.labelScene, RendererModule.camera);

        RendererModule.renderer.autoClear = true;
    },
    updateSize: function () {
        const aspect = window.innerWidth / window.innerHeight;
        RendererModule.camera.left = -100 * aspect;
        RendererModule.camera.right = 100 * aspect;
        RendererModule.camera.top = 100;
        RendererModule.camera.bottom = -100;
        RendererModule.camera.updateProjectionMatrix();
        RendererModule.renderer.setSize(window.innerWidth, window.innerHeight);
        RendererModule.pixelateShader.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
        D20.d20.material.resolution.set(window.innerWidth, window.innerHeight);
        RendererModule.d20Composer.setSize(window.innerWidth, window.innerHeight);
        RendererModule.d20RenderTarget.setSize(window.innerWidth, window.innerHeight);

        // Update CRT resolution
        RendererModule.crtPass.uniforms['resolution'].value.set(window.innerWidth, window.innerHeight);
    },
    addObjects: function (d20, innerD20, labelGroup) {
        RendererModule.d20Scene.add(d20);
        RendererModule.d20Scene.add(innerD20);
        RendererModule.labelScene.add(labelGroup);
    }
};

// Label Module
const LabelModule = {
    updateLabelVisibility: function (labels, camera) {
        const cameraPosition = new THREE.Vector3();
        camera.getWorldPosition(cameraPosition);

        for (const label of labels) {
            const labelPosition = new THREE.Vector3();
            label.getWorldPosition(labelPosition);

            const directionToCamera = cameraPosition.clone().sub(labelPosition).normalize();

            const normal = labelPosition.clone().normalize();

            label.children[0].visible = normal.dot(directionToCamera) > 0;
        }
    },
    quantizePosition: function (position, gridSize = 3) {
        return new THREE.Vector3(
            Math.round(position.x / gridSize) * gridSize,
            Math.round(position.y / gridSize) * gridSize,
            Math.round(position.z / gridSize) * gridSize
        );
    },
    currentFlashedSprite: null,
    originalColor: null,

    flashNumber: function (faceNumber, labels) {
        const faceIndex = Config.faceNumbers.indexOf(faceNumber);

        if (faceIndex >= 0 && faceIndex < labels.length) {
            const sprite = labels[faceIndex].children[0];

            if (sprite) {
                // Reset previous flash if exists
                if (LabelModule.currentFlashedSprite && LabelModule.originalColor) {
                    LabelModule.currentFlashedSprite.material.color.copy(LabelModule.originalColor);
                }

                // Store current sprite and its color
                LabelModule.currentFlashedSprite = sprite;
                LabelModule.originalColor = sprite.material.color.clone();
                
                // Apply flash color
                sprite.material.color.setHex(Config.flashColor);
            }
        }
    },

    resetFlash: function() {
        if (LabelModule.currentFlashedSprite && LabelModule.originalColor) {
            LabelModule.currentFlashedSprite.material.color.copy(LabelModule.originalColor);
            LabelModule.currentFlashedSprite = null;
            LabelModule.originalColor = null;
        }
    },

    getFaceFacingCamera: function (labels, camera) {
        const cameraPosition = new THREE.Vector3();
        camera.getWorldPosition(cameraPosition);

        let maxDot = -1;
        let facingFaceNumber = 1;

        for (let i = 0; i < labels.length; i++) {
            const label = labels[i];
            const labelPosition = new THREE.Vector3();
            label.getWorldPosition(labelPosition);

            const directionToCamera = cameraPosition.clone().sub(labelPosition).normalize();
            const normal = labelPosition.clone().normalize();
            const dot = normal.dot(directionToCamera);

            if (dot > maxDot) {
                maxDot = dot;
                facingFaceNumber = Config.faceNumbers[i];
            }
        }

        return facingFaceNumber;
    }
};

// Animation Module
const Animation = {
    isRolling: false,
    rollStartTime: 0,
    stopStartTime: 0,
    angularVelocityX: 0,
    angularVelocityY: 0,
    angularVelocityZ: 0,
    currentScale: 0,
    verticalSpeed: 0,
    rollD20: function (d20) {
        Animation.isRolling = true;
        Animation.rollStartTime = performance.now();

        // Reset the previous flash when starting new roll
        LabelModule.resetFlash();

        d20.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );
        D20.innerD20.rotation.copy(d20.rotation);
        D20.labelGroup.rotation.copy(d20.rotation);

        Animation.angularVelocityX = (Math.random() * 2 - 1) * Config.initialAngularVelocity;
        Animation.angularVelocityY = (Math.random() * 2 - 1) * Config.initialAngularVelocity;
        Animation.angularVelocityZ = (Math.random() * 2 - 1) * Config.initialAngularVelocity;

        Animation.currentScale = 0;
        Animation.verticalSpeed = Config.bounceSpeed;
    },
    animate: function (d20, labels, camera) {
        const currentTime = performance.now();
        const elapsedTime = currentTime - Animation.rollStartTime;

        if (Animation.isRolling) {
            const t = elapsedTime / Config.rollDuration;
            if (t < 1) {
                d20.rotation.x += Animation.angularVelocityX * (1 - t);
                d20.rotation.y += Animation.angularVelocityY * (1 - t);
                d20.rotation.z += Animation.angularVelocityZ * (1 - t);

                Animation.angularVelocityX *= Config.angularVelocityDamping;
                Animation.angularVelocityY *= Config.angularVelocityDamping;
                Animation.angularVelocityZ *= Config.angularVelocityDamping;

                Animation.verticalSpeed -= Config.gravity;
                Animation.currentScale += Animation.verticalSpeed;

                if (Animation.currentScale < Config.groundLevel) {
                    Animation.currentScale = Config.groundLevel;
                    Animation.verticalSpeed *= Config.bounceDamping;
                }

                d20.scale.set(Config.initialScale - Animation.currentScale, Config.initialScale - Animation.currentScale, Config.initialScale - Animation.currentScale);
                D20.innerD20.scale.copy(d20.scale);
                D20.labelGroup.scale.copy(d20.scale);

            } else {
                Animation.isRolling = false;
                Animation.stopStartTime = performance.now();
                const faceNumber = LabelModule.getFaceFacingCamera(labels, camera);
                LabelModule.flashNumber(faceNumber, labels);
            }
        } else {
            const stopElapsedTime = currentTime - Animation.stopStartTime;
            if (stopElapsedTime > Config.stopDuration) {
                d20.rotation.x += 0.01;
                d20.rotation.y += 0.005;
                d20.rotation.z += 0.007;
            }
        }

        D20.innerD20.rotation.copy(d20.rotation);

        D20.labelGroup.rotation.copy(d20.rotation);

        const matrix = new THREE.Matrix4();
        for (const label of labels) {
            const originalPos = new THREE.Vector3();
            label.getWorldPosition(originalPos);

            const quantizedPos = LabelModule.quantizePosition(originalPos);

            matrix.copy(label.matrixWorld).invert();
            quantizedPos.applyMatrix4(matrix);
            label.children[0].position.copy(quantizedPos);
        }

        LabelModule.updateLabelVisibility(labels, camera);
    }
};

// Event Handler Module
const EventHandler = {
    init: function (renderer) {
        renderer.domElement.addEventListener('click', () => {
            if (!Animation.isRolling) {
                Animation.rollD20(D20.d20);
            }
        });

        window.addEventListener('resize', () => {
            RendererModule.updateSize();
        });
    }
};

// Initialization
function init() {
    const { scene, camera, renderer } = RendererModule.init();
    D20.init(scene);
    RendererModule.addObjects(D20.d20, D20.innerD20, D20.labelGroup);

    for (const label of D20.labels) {
        const sprite = label.children[0];
        sprite.material.depthTest = true;
        sprite.material.depthWrite = false;
        sprite.renderOrder = 1;
    }

    EventHandler.init(renderer);

    // Start rolling immediately
    setTimeout(() => Animation.rollD20(D20.d20), 100);

    function animate() {
        requestAnimationFrame(animate);
        Animation.animate(D20.d20, D20.labels, camera);
        RendererModule.render();
    }

    animate();
}

init();