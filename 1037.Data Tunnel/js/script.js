import * as THREE from 'three';
    import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
    import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
    import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
    import GUI from 'lil-gui';

    // --- CONFIGURATION ---
    const params = {
        // Colors
        colorBg: '#080808',
        colorLine: '#27303a',
        
        // Signal Colors
        colorSignal: '#80c1ff',  // Main (Always on)
        
        useColor2: false,        // Toggle 2
        colorSignal2: '#4dff79', // Extra Color 1
        
        useColor3: false,        // Toggle 3
        colorSignal3: '#ff1467', // Extra Color 2

        // Geometry
        spreadHeight: 30.33,
        spreadDepth: 0,
        curveLength: 33.41,
        straightLength: 109.26,
        curvePower: 0.8265,

        // Line Animation
        waveSpeed: 2.48,
        waveHeight: 0.145,
        lineOpacity: 0.557,

        // Signals
        signalCount: 75,        
        speedGlobal: 0.345,
        trailLength: 7,        
        
        // Visuals (Bloom)
        bloomStrength: 3.0,
        bloomRadius: 0.5
    };

    const CONSTANTS = {
        lineCount: 80,
        segmentCount: 150
    };

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(params.colorBg);
    scene.fog = new THREE.FogExp2(params.colorBg, 0.002);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 0, 90);
    camera.lookAt(20, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement);

    // --- POST-PROCESSING ---
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // --- MATH & PATH CALCULATION ---
    function getPathPoint(t, lineIndex, time) {
        const totalLen = params.curveLength + params.straightLength;
        const currentX = -params.curveLength + t * totalLen;

        let y = 0;
        let z = 0;
        const spreadFactor = (lineIndex / CONSTANTS.lineCount - 0.5) * 2;

        if (currentX < 0) {
            const ratio = (currentX + params.curveLength) / params.curveLength;
            let shapeFactor = (Math.cos(ratio * Math.PI) + 1) / 2;
            shapeFactor = Math.pow(shapeFactor, params.curvePower);

            y = spreadFactor * params.spreadHeight * shapeFactor;
            z = spreadFactor * params.spreadDepth * shapeFactor;

            const waveFactor = shapeFactor; 
            const wave = Math.sin(time * params.waveSpeed + currentX * 0.1 + lineIndex) * params.waveHeight * waveFactor;
            y += wave;
        }

        return new THREE.Vector3(currentX, y, z);
    }

    // --- BACKGROUND LINES ---
    const backgroundLines = [];
    const bgMaterial = new THREE.LineBasicMaterial({ 
        color: params.colorLine, 
        transparent: true, 
        opacity: params.lineOpacity,
        depthWrite: false 
    });

    for (let i = 0; i < CONSTANTS.lineCount; i++) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(CONSTANTS.segmentCount * 3);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const line = new THREE.Line(geometry, bgMaterial);
        line.userData = { id: i };
        line.renderOrder = 0; 
        scene.add(line);
        backgroundLines.push(line);
    }

    // --- SIGNALS ---
    let signals = [];
    
    // Color objects to hold state
    const signalColorObj1 = new THREE.Color(params.colorSignal);
    const signalColorObj2 = new THREE.Color(params.colorSignal2);
    const signalColorObj3 = new THREE.Color(params.colorSignal3);

    const signalMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false, 
        depthTest: false,  
        transparent: true
    });

    // Helper to pick a color based on enabled toggles
    function pickSignalColor() {
        const choices = [signalColorObj1];
        if (params.useColor2) choices.push(signalColorObj2);
        if (params.useColor3) choices.push(signalColorObj3);
        
        return choices[Math.floor(Math.random() * choices.length)];
    }

    function createSignalData() {
        const maxTrail = 150; 
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(maxTrail * 3);
        const colors = new Float32Array(maxTrail * 3);
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const mesh = new THREE.Line(geometry, signalMaterial);
        mesh.frustumCulled = false;
        mesh.renderOrder = 1; 
        scene.add(mesh);

        return {
            mesh: mesh,
            laneIndex: Math.floor(Math.random() * CONSTANTS.lineCount),
            speed: 0.2 + Math.random() * 0.5,
            progress: Math.random(),
            history: [],
            assignedColor: pickSignalColor() // Assign color on creation
        };
    }

    function rebuildSignals() {
        signals.forEach(s => {
            scene.remove(s.mesh);
            s.mesh.geometry.dispose();
        });
        signals = [];
        for(let i=0; i<params.signalCount; i++) {
            signals.push(createSignalData());
        }
    }

    rebuildSignals();


    // --- GUI SETUP ---
    const gui = new GUI({ title: 'Settings' });

    // Global Colors
    const folderColors = gui.addFolder('Global Colors');
    folderColors.addColor(params, 'colorBg').name('Background').onChange(v => {
        scene.background.set(v);
        scene.fog.color.set(v);
    });
    folderColors.addColor(params, 'colorLine').name('Lines').onChange(v => {
        bgMaterial.color.set(v);
    });

    // Signal Colors
    const folderSignalColors = gui.addFolder('Signal Colors');
    
    // Main Color
    folderSignalColors.addColor(params, 'colorSignal').name('Main Color').onChange(v => signalColorObj1.set(v));
    
    // Color 2
    folderSignalColors.add(params, 'useColor2').name('Use Extra Color 1');
    folderSignalColors.addColor(params, 'colorSignal2').name('Extra Color 1').onChange(v => signalColorObj2.set(v));
    
    // Color 3
    folderSignalColors.add(params, 'useColor3').name('Use Extra Color 2');
    folderSignalColors.addColor(params, 'colorSignal3').name('Extra Color 2').onChange(v => signalColorObj3.set(v));


    const folderGeo = gui.addFolder('Geometry');
    folderGeo.add(params, 'spreadHeight', 10, 100);
    folderGeo.add(params, 'spreadDepth', 0, 50);
    folderGeo.add(params, 'curveLength', 20, 150);
    folderGeo.add(params, 'curvePower', 0.1, 3.0);
    folderGeo.add(params, 'straightLength', 20, 200);

    const folderAnim = gui.addFolder('Lines');
    folderAnim.add(params, 'waveSpeed', 0, 5);
    folderAnim.add(params, 'waveHeight', 0, 5);
    folderAnim.add(params, 'lineOpacity', 0, 1).onChange(v => bgMaterial.opacity = v);

    const folderSignals = gui.addFolder('Signals');
    folderSignals.add(params, 'signalCount', 0, 200, 1).name('Count').onFinishChange(rebuildSignals);
    folderSignals.add(params, 'speedGlobal', 0, 3).name('Speed');
    folderSignals.add(params, 'trailLength', 0, 100, 1).name('Trail Length');
    
    const folderBloom = gui.addFolder('Bloom');
    folderBloom.add(params, 'bloomStrength', 0, 5).onChange(v => bloomPass.strength = v);
    folderBloom.add(params, 'bloomRadius', 0, 1).onChange(v => bloomPass.radius = v);


    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const time = clock.getElapsedTime();

        // 1. Update Lines
        backgroundLines.forEach(line => {
            const positions = line.geometry.attributes.position.array;
            const lineId = line.userData.id;
            for (let j = 0; j < CONSTANTS.segmentCount; j++) {
                const t = j / (CONSTANTS.segmentCount - 1);
                const vec = getPathPoint(t, lineId, time);
                positions[j * 3] = vec.x;
                positions[j * 3 + 1] = vec.y;
                positions[j * 3 + 2] = vec.z;
            }
            line.geometry.attributes.position.needsUpdate = true;
        });

        // 2. Update Signals
        signals.forEach(sig => {
            sig.progress += sig.speed * 0.005 * params.speedGlobal;
            
            // Loop logic (Respawn)
            if (sig.progress > 1.0) {
                sig.progress = 0;
                sig.laneIndex = Math.floor(Math.random() * CONSTANTS.lineCount);
                sig.history = [];
                // Re-assign color when starting a new lap to respect toggles
                sig.assignedColor = pickSignalColor();
            }

            const pos = getPathPoint(sig.progress, sig.laneIndex, time);
            sig.history.push(pos);
            
            if (sig.history.length > params.trailLength + 1) { 
                sig.history.shift();
            }

            const positions = sig.mesh.geometry.attributes.position.array;
            const colors = sig.mesh.geometry.attributes.color.array;
            
            const drawCount = Math.max(1, params.trailLength);
            const currentLen = sig.history.length;

            for (let i = 0; i < drawCount; i++) {
                let index = currentLen - 1 - i;
                if (index < 0) index = 0;
                
                const p = sig.history[index] || new THREE.Vector3();

                positions[i*3] = p.x;
                positions[i*3+1] = p.y;
                positions[i*3+2] = p.z;

                // Color Gradient Calculation
                let alpha = 1;
                if (params.trailLength > 0) {
                    alpha = Math.max(0, 1 - i / params.trailLength);
                }
                
                // Use assigned color for this specific signal
                colors[i*3] = sig.assignedColor.r * alpha;
                colors[i*3+1] = sig.assignedColor.g * alpha;
                colors[i*3+2] = sig.assignedColor.b * alpha;
            }
            
            sig.mesh.geometry.setDrawRange(0, drawCount);
            sig.mesh.geometry.attributes.position.needsUpdate = true;
            sig.mesh.geometry.attributes.color.needsUpdate = true;
        });

        composer.render();
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();