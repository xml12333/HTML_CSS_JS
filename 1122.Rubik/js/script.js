(function() {
    'use strict';

    // ============================================================
    // 1. CONFIGURACIÓN DE LA ESCENA Y RENDERER
    // ============================================================
    const container = document.getElementById('canvas-container');
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f4f8);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    const CAMERA_DISTANCE = 8.5;
    camera.position.set(6, 4, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ============================================================
    // 2. CONTROLES Y NAVEGACIÓN
    // ============================================================
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.target.set(0, 0, 0);

    // ============================================================
    // 3. ILUMINACIÓN MULTIDIRECCIONAL (Cero caras negras)
    // ============================================================
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    scene.add(hemiLight);

    const dirLightFront = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLightFront.position.set(10, 10, 10);
    scene.add(dirLightFront);

    const dirLightBack = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLightBack.position.set(-10, -10, -10);
    scene.add(dirLightBack);

    // ============================================================
    // 4. PALETA Y POSICIONES
    // ============================================================
    const COLORS = {
        right:  0xd63031, // Rojo (+X)
        left:   0xe17055, // Naranja (-X)
        up:     0xffffff, // Blanco (+Y)
        down:   0xfdcb6e, // Amarillo (-Y)
        front:  0x00b894, // Verde (+Z)
        back:   0x0984e3, // Azul (-Z)
        inner:  0x2d3436  // Gris interior
    };

    const FACE_MAP = {
        white:  { camPos: { x: 0, y: CAMERA_DISTANCE, z: 0.001 } },
        yellow: { camPos: { x: 0, y: -CAMERA_DISTANCE, z: 0.001 } },
        red:    { camPos: { x: CAMERA_DISTANCE, y: 0, z: 0 } },
        orange: { camPos: { x: -CAMERA_DISTANCE, y: 0, z: 0 } },
        green:  { camPos: { x: 0, y: 0, z: CAMERA_DISTANCE } },
        blue:   { camPos: { x: 0, y: 0, z: -CAMERA_DISTANCE } }
    };

    // ============================================================
    // 5. CONSTRUCCIÓN DEL CUBO
    // ============================================================
    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    const cubeSize = 0.95;
    const gap = 0.05;
    const step = cubeSize + gap;
    const pieces = [];

    const baseGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const materials = [
                    new THREE.MeshLambertMaterial({ color: (x === 1)  ? COLORS.right : COLORS.inner }),
                    new THREE.MeshLambertMaterial({ color: (x === -1) ? COLORS.left  : COLORS.inner }),
                    new THREE.MeshLambertMaterial({ color: (y === 1)  ? COLORS.up    : COLORS.inner }),
                    new THREE.MeshLambertMaterial({ color: (y === -1) ? COLORS.down  : COLORS.inner }),
                    new THREE.MeshLambertMaterial({ color: (z === 1)  ? COLORS.front : COLORS.inner }),
                    new THREE.MeshLambertMaterial({ color: (z === -1) ? COLORS.back  : COLORS.inner })
                ];

                const piece = new THREE.Mesh(baseGeometry, materials);
                piece.position.set(x * step, y * step, z * step);

                piece.userData = {
                    gridPos: { x, y, z },
                    originalPos: { x, y, z }
                };

                cubeGroup.add(piece);
                pieces.push(piece);
            }
        }
    }

    // ============================================================
    // 6. HISTORIAL DE MOVIMIENTOS Y MOTOR DE ROTACIÓN
    // ============================================================
    let isAnimating = false;
    let animationQueue = [];
    let moveHistory = []; 

    function processQueue() {
        if (isAnimating || animationQueue.length === 0) return;

        const nextMove = animationQueue.shift();
        executeRotation(nextMove.axis, nextMove.layer, nextMove.direction, nextMove.duration, () => {
            if (nextMove.record) {
                moveHistory.push({ axis: nextMove.axis, layer: nextMove.layer, direction: nextMove.direction });
            }
            if (nextMove.onComplete) nextMove.onComplete();
            processQueue();
        });
    }

    function queueRotation(axis, layer, direction, duration = 150, record = false, onComplete = null) {
        animationQueue.push({ axis, layer, direction, duration, record, onComplete });
        processQueue();
    }

    function executeRotation(axis, layer, direction, duration, callback) {
        isAnimating = true;

        const layerPieces = pieces.filter(p => p.userData.gridPos[axis] === layer);
        const pivot = new THREE.Group();
        scene.add(pivot);

        layerPieces.forEach(p => {
            cubeGroup.remove(p);
            pivot.add(p);
        });

        const targetAngle = direction * (Math.PI / 2);
        const startTime = performance.now();

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);

            pivot.rotation[axis] = targetAngle * ease;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                pivot.rotation[axis] = targetAngle;
                pivot.updateMatrixWorld(true);

                layerPieces.forEach(p => {
                    p.applyMatrix4(pivot.matrix);
                    pivot.remove(p);
                    cubeGroup.add(p);

                    const gx = Math.round(p.position.x / step);
                    const gy = Math.round(p.position.y / step);
                    const gz = Math.round(p.position.z / step);

                    p.userData.gridPos = { x: gx, y: gy, z: gz };
                    p.position.set(gx * step, gy * step, gz * step);
                });

                scene.remove(pivot);
                isAnimating = false;
                if (callback) callback();
            }
        }

        requestAnimationFrame(animate);
    }

    // ============================================================
    // 7. SECUENCIA TEMPORIZADA: SOLUCIONAR -> ENCUADRAR CÁMARA
    // ============================================================
    function shuffleCube(movesCount = 10, speed = 80, onComplete = null) {
        const axes = ['x', 'y', 'z'];

        for (let i = 0; i < movesCount; i++) {
            const ax = axes[Math.floor(Math.random() * 3)];
            const lay = Math.floor(Math.random() * 3) - 1;
            const dir = Math.random() > 0.5 ? 1 : -1;
            const isLast = (i === movesCount - 1);

            queueRotation(ax, lay, dir, speed, true, isLast ? onComplete : null);
        }
    }

    function solveInverse(speed = 90, onComplete = null) {
        if (moveHistory.length === 0) {
            if (onComplete) onComplete();
            return;
        }

        const inverseMoves = [...moveHistory].reverse();
        moveHistory = []; 

        inverseMoves.forEach((move, index) => {
            const isLast = (index === inverseMoves.length - 1);
            queueRotation(move.axis, move.layer, -move.direction, speed, false, isLast ? onComplete : null);
        });
    }

    function handleFaceSelection(faceName) {
        const faceConfig = FACE_MAP[faceName];
        if (!faceConfig) return;

        animationQueue = []; // Limpiar ejecuciones pendientes

        const adjustCamera = () => {
            // Transición suave de la cámara a la cara seleccionada (Duración: 500ms)
            moveCameraTo(faceConfig.camPos, 500);
        };

        // PASO 1: Si no está revuelto, revolverlo rápido primero
        if (moveHistory.length === 0) {
            shuffleCube(8, 70, () => {
                setTimeout(() => {
                    // PASO 2: Resolver el cubo frente a la vista actual
                    solveInverse(80, () => {
                        // PASO 3: Esperar 200ms y luego mover la cámara
                        setTimeout(adjustCamera, 200);
                    });
                }, 150);
            });
        } else {
            // PASO 2 (Directo si ya estaba revuelto): Resolver primero
            solveInverse(80, () => {
                // PASO 3: Transición de cámara
                setTimeout(adjustCamera, 200);
            });
        }
    }

    function moveCameraTo(targetPos, duration = 500, onComplete = null) {
        controls.autoRotate = false;
        const startPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
        const startTime = performance.now();

        function animateCam(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);

            camera.position.x = startPos.x + (targetPos.x - startPos.x) * ease;
            camera.position.y = startPos.y + (targetPos.y - startPos.y) * ease;
            camera.position.z = startPos.z + (targetPos.z - startPos.z) * ease;

            controls.target.set(0, 0, 0);
            controls.update();

            if (progress < 1) {
                requestAnimationFrame(animateCam);
            } else {
                controls.autoRotate = true;
                if (onComplete) onComplete();
            }
        }

        requestAnimationFrame(animateCam);
    }

    function resetFullCube() {
        animationQueue = [];
        moveHistory = [];
        pieces.forEach(p => {
            const orig = p.userData.originalPos;
            p.position.set(orig.x * step, orig.y * step, orig.z * step);
            p.rotation.set(0, 0, 0);
            p.userData.gridPos = { x: orig.x, y: orig.y, z: orig.z };
        });
        controls.autoRotate = true;
    }

    // ============================================================
    // 8. BINDING DE BOTONES Y GALERÍA
    // ============================================================
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            galleryItems.forEach(el => el.classList.remove('active'));
            item.classList.add('active');

            const face = item.dataset.face;
            if (face) {
                handleFaceSelection(face);
            }
        });
    });

    const btnShuffle = document.getElementById('btn-shuffle');
    const btnReset = document.getElementById('btn-reset');
    const btnAutoSpin = document.getElementById('btn-auto-spin');

    if (btnShuffle) {
        btnShuffle.onclick = () => shuffleCube(10, 80);
    }

    if (btnReset) {
        btnReset.onclick = () => resetFullCube();
    }

    if (btnAutoSpin) {
        btnAutoSpin.onclick = () => {
            controls.autoRotate = !controls.autoRotate;
            btnAutoSpin.textContent = controls.autoRotate ? '⏸ Detener' : '▶ Auto-giro';
        };
    }

    // ============================================================
    // 9. ARRANQUE RÁPIDO INICIAL (~1 segundo)
    // ============================================================
    setTimeout(() => {
        shuffleCube(10, 75);
    }, 200);

    // ============================================================
    // 10. LOOP Y RESIZE
    // ============================================================
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    function render() {
        requestAnimationFrame(render);
        controls.update();
        renderer.render(scene, camera);
    }

    render();
})();