import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
    import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
    import GUI from 'lil-gui';

    // --- 1. PARAMETERS ---
    const fileInput = document.getElementById('fileInput');
    
    const params = {
        upload: () => fileInput.click(),
        
        shape: 'Square',
        segments: 64,
        photoScale: 1.2,
        
        bg: '#050505',
        envMap: 'Royal Esplanade',
        
        // Glass Settings
        glassColor: '#ffffff', // NEW: Base color of the glass
        envIntensity: 1.0,
        internalReflect: 1.5,
        opacity: 1.0, 
        
        playing: true,
        globalSpeed: 1.0,
        yAxis: { mode: 'Spin', speed: 0.5, amp: 0.6 },
        xAxis: { enabled: true, speed: 0.4, amp: 0.2 },
        zAxis: { enabled: true, speed: 0.3, amp: 0.1 }
    };

    // --- 2. SCENE ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(params.bg);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;

    // --- 3. LIGHTS AND ENV ---
    const hdriUrls = {
        'Royal Esplanade': 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/royal_esplanade_2k.hdr',
        'Studio Small': 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/studio_small_03_2k.hdr',
        'Moonless Golf': 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/moonless_golf_2k.hdr',
        'Overcast': 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/zhgezhda_2k.hdr'
    };

    const rgbeLoader = new RGBELoader();
    
    function loadEnvironment(name) {
        rgbeLoader.load(hdriUrls[name], (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            scene.environment = texture;
            scene.environmentIntensity = params.envIntensity;
        });
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    const backLight = new THREE.DirectionalLight(0xffffff, 3.0);
    backLight.position.set(-5, 2, -10);
    scene.add(backLight);
    const topLight = new THREE.DirectionalLight(0xffffff, 2.0);
    topLight.position.set(0, 10, 0);
    scene.add(topLight);
    const frontLight = new THREE.DirectionalLight(0xffffff, 1.0);
    frontLight.position.set(0, 2, 10);
    scene.add(frontLight);

    const group = new THREE.Group();
    scene.add(group);

    // --- 4. PHOTO ---
    let currentAspectRatio = 1.0; 

    const photoGeo = new THREE.PlaneGeometry(1, 1);
    const photoMat = new THREE.MeshStandardMaterial({ 
        side: THREE.DoubleSide,
        color: 0xffffff,
        roughness: 0.2,
        metalness: 0.1,
        transparent: false, 
        alphaTest: 0.5,
        depthWrite: true 
    });
    
    const photoMesh = new THREE.Mesh(photoGeo, photoMat);
    photoMesh.position.set(0, 0, 0);
    photoMesh.renderOrder = 0;
    group.add(photoMesh);

    const textureLoader = new THREE.TextureLoader();

    function updatePhotoScale() {
        const s = params.photoScale;
        let safeMargin = 1.0;
        if (params.shape === 'Heart' || params.shape === 'Oval') {
            safeMargin = 0.9; 
        }
        const finalScale = s * safeMargin;

        if (currentAspectRatio > 1) {
            photoMesh.scale.set(finalScale, finalScale / currentAspectRatio, 1);
        } else {
            photoMesh.scale.set(finalScale * currentAspectRatio, finalScale, 1);
        }
    }

    textureLoader.load('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop', (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        photoMat.map = tex;
        photoMat.needsUpdate = true;
        if (tex.image) {
            currentAspectRatio = tex.image.width / tex.image.height;
            updatePhotoScale();
        }
    });

    // --- 5. GEOMETRY HELPERS ---
    function createSmoothShape(radiusX, radiusY, points = 128) {
        const shape = new THREE.Shape();
        const step = (Math.PI * 2) / points;
        for (let i = 0; i < points; i++) {
            const angle = i * step;
            const x = Math.cos(angle) * radiusX;
            const y = Math.sin(angle) * radiusY;
            if (i === 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
        }
        return shape;
    }

    function createHeartShape() {
        const x = 0, y = 0;
        const shape = new THREE.Shape();
        shape.moveTo(x + 0.5, y + 0.5);
        shape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
        shape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
        shape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
        shape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
        shape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y);
        shape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);
        return shape;
    }

    function createPolygonShape(sides, radius) {
        const shape = new THREE.Shape();
        const angleStep = (Math.PI * 2) / sides;
        const offset = sides === 6 ? Math.PI / 2 : Math.PI / 8; 
        for (let i = 0; i < sides; i++) {
            const x = Math.cos(i * angleStep + offset) * radius;
            const y = Math.sin(i * angleStep + offset) * radius;
            if (i === 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
        }
        return shape;
    }

    // Glass Material
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: params.glassColor, // Initial color
        transmission: 1.0,      
        opacity: params.opacity,
        metalness: 0.0,
        roughness: 0.0,         
        ior: 1.5,
        thickness: 1.2,
        attenuationColor: 0xffffff,
        attenuationDistance: 9999.0,
        specularIntensity: 1.0,
        envMapIntensity: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
        transparent: true,
        side: THREE.DoubleSide, 
        depthWrite: false
    });
    
    const glassMesh = new THREE.Mesh(new THREE.BufferGeometry(), glassMat);
    glassMesh.receiveShadow = false;
    glassMesh.renderOrder = 1;
    group.add(glassMesh);

    function updateGeometry() {
        if (glassMesh.geometry) glassMesh.geometry.dispose();

        let geo;
        const type = params.shape;
        const detail = params.segments;

        const extrudeSettings = { 
            depth: 1.0, 
            bevelEnabled: true, 
            bevelSegments: 8,  
            steps: 2, 
            bevelSize: 0.08, 
            bevelThickness: 0.1,
            curveSegments: detail 
        };

        switch (type) {
            case 'Square':
                geo = new RoundedBoxGeometry(2.1, 2.1, 1.0, 32, 0.25);
                break;
            case 'Heart':
                geo = new THREE.ExtrudeGeometry(createHeartShape(), extrudeSettings);
                geo.center(); geo.rotateZ(Math.PI); geo.scale(1.2, 1.2, 1);
                break;
            case 'Circle':
                geo = new THREE.ExtrudeGeometry(createSmoothShape(1.1, 1.1, Math.max(detail, 64)), extrudeSettings);
                geo.center();
                break;
            case 'Oval':
                geo = new THREE.ExtrudeGeometry(createSmoothShape(0.8, 1.3, Math.max(detail, 64)), extrudeSettings);
                geo.center();
                break;
            case 'Hexagon (6)':
                geo = new THREE.ExtrudeGeometry(createPolygonShape(6, 1.2), extrudeSettings);
                geo.center();
                break;
            case 'Octagon (8)':
                geo = new THREE.ExtrudeGeometry(createPolygonShape(8, 1.2), extrudeSettings);
                geo.center();
                break;
        }
        glassMesh.geometry = geo;
        updatePhotoScale();
    }

    // --- INITIALIZATION ---
    loadEnvironment('Royal Esplanade');
    updateGeometry();

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
            const base64 = event.target.result;
            textureLoader.load(base64, (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                if (photoMat.map) photoMat.map.dispose();
                photoMat.map = tex;
                photoMat.needsUpdate = true;
                if (tex.image) {
                    currentAspectRatio = tex.image.width / tex.image.height;
                    updatePhotoScale();
                }
            });
        };
        reader.readAsDataURL(file);
        fileInput.value = '';
    });

    // --- GUI ---
    const gui = new GUI({ title: 'Glass Designer', width: 340 });
    
    // Content
    const contentFolder = gui.addFolder('Content & Shape');
    contentFolder.add(params, 'upload').name('📂 Upload Photo');
    contentFolder.add(params, 'photoScale', 0.5, 2.0).name('Photo Scale').onChange(updatePhotoScale);
    contentFolder.add(params, 'shape', ['Square', 'Heart', 'Oval', 'Circle', 'Hexagon (6)', 'Octagon (8)'])
       .name('Shape Type').onChange(updateGeometry);
    contentFolder.add(params, 'segments', 1, 512, 1).name('Curve Detail').onChange(updateGeometry);
    contentFolder.addColor(params, 'bg').name('Background Color').onChange(c => scene.background.set(c));
    contentFolder.open();

    // Glass
    const glassFolder = gui.addFolder('Glass & Reflections');
    glassFolder.addColor(params, 'glassColor').name('Glass Tint').onChange(c => glassMat.color.set(c)); // NEW
    glassFolder.add(params, 'envMap', Object.keys(hdriUrls)).name('Environment').onChange(loadEnvironment);
    glassFolder.add(params, 'internalReflect', 1.0, 2.33).name('Refraction IOR').onChange(v => glassMat.ior = v);
    glassFolder.add(params, 'envIntensity', 0, 3.0).name('Env Brightness').onChange(v => scene.environmentIntensity = v);
    glassFolder.add(glassMat, 'opacity', 0.0, 1.0).name('Glass Opacity');
    
    // Animation
    const animFolder = gui.addFolder('Animation');
    animFolder.add(params, 'playing').name('▶ Play');
    animFolder.add(params, 'globalSpeed', 0, 3).name('Speed');
    const rotFolder = animFolder.addFolder('Axes');
    rotFolder.add(params.yAxis, 'mode', ['Spin', 'Swing']).name('Y Mode');
    rotFolder.add(params.yAxis, 'speed', 0, 2).name('Y Speed');
    rotFolder.add(params.xAxis, 'enabled').name('X (Pitch)');
    rotFolder.add(params.zAxis, 'enabled').name('Z (Float)');

    // --- LOOP ---
    const clock = new THREE.Clock();
    let time = 0;

    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();

        if (params.playing) {
            time += delta * params.globalSpeed;
            
            if (params.yAxis.mode === 'Spin') {
                group.rotation.y += delta * params.yAxis.speed * params.globalSpeed; 
            } else {
                group.rotation.y = Math.sin(time * params.yAxis.speed) * params.yAxis.amp;
            }
            
            if (params.xAxis.enabled) group.rotation.x = Math.cos(time * params.xAxis.speed) * params.xAxis.amp;
            if (params.zAxis.enabled) group.rotation.z = Math.sin(time * params.zAxis.speed * 0.7) * params.zAxis.amp;
        }

        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    window.onresize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };