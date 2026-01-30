import * as THREE from 'three';
        import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

        // --- 1. Parameters ---
        const params = {
            // Scene
            backgroundColor: '#050505',

            // Stream
            quantity: 500,       
            speed: 0.8,          
            spreadEdge: 10.0,    
            spreadCenter: 0.17,  
            curvePower: 1.5,   
            deformation: 0.38,
            
            baseSize: 1.0,
            minScale: 0.18,       
            borderRadius: 0.1,
            
            logoSize: 1.5, 
            
            grayLeft: true,
        };

        // --- 2. Scene Setup ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(params.backgroundColor);

        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 0, 14);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Linear color space to keep stream images bright/raw
        document.body.appendChild(renderer.domElement);

        // --- 3. Center Group (Logo Only) ---
        const centerGroup = new THREE.Group();
        centerGroup.position.z = 2.0; 
        scene.add(centerGroup);

        let logoMesh = null;

        const defaultLogoSvg = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0id2hpdGUiIC8+Cjwvc3ZnPg==`;
        
        let logoTexture = new THREE.TextureLoader().load(defaultLogoSvg, (tex) => {
            // Logo needs sRGB to be correct
            tex.colorSpace = THREE.SRGBColorSpace;
            updateCenter(); 
        });

        function updateCenter() {
            if (logoMesh) {
                centerGroup.remove(logoMesh);
                if(logoMesh.geometry) logoMesh.geometry.dispose();
                if(logoMesh.material) logoMesh.material.dispose();
                logoMesh = null;
            }

            if (!logoTexture || !logoTexture.image) return;

            const img = logoTexture.image;
            const aspect = img.width / img.height;
            const geo = new THREE.PlaneGeometry(1.0 * aspect, 1.0);

            const mat = new THREE.MeshBasicMaterial({ 
                map: logoTexture,
                transparent: true,
                side: THREE.DoubleSide,
                color: 0xffffff
            });
            
            logoMesh = new THREE.Mesh(geo, mat);
            centerGroup.add(logoMesh);
            centerGroup.scale.set(params.logoSize, params.logoSize, 1);
        }

        // --- 4. Shaders ---
        
        const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
            }
        `;

        const fragmentShaderCombined = `
            varying vec2 vUv;
            uniform sampler2D map;
            uniform float uGray;
            uniform float uRadius;
            uniform float uAspect;
            
            float sdRoundedBox(vec2 p, vec2 b, float r) {
                vec2 q = abs(p) - b + r;
                return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
            }

            void main() {
                vec4 color = texture2D(map, vUv);
                
                float grayVal = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                vec3 finalColor = mix(color.rgb, vec3(grayVal), uGray);
                
                vec2 centered = vUv - 0.5;
                centered.x *= uAspect;
                vec2 halfSize = vec2(0.5 * uAspect, 0.5);
                float r = clamp(uRadius, 0.0, 0.5);
                float d = sdRoundedBox(centered, halfSize, r);
                float alpha = 1.0 - smoothstep(0.0, 0.02, d);
                
                gl_FragColor = vec4(finalColor, color.a * alpha);
                if (gl_FragColor.a < 0.01) discard;
            }
        `;

        // --- 5. Assets ---

        const defaultUrls = [
            'https://picsum.photos/id/10/300/200', 
            'https://picsum.photos/id/12/200/300', 
            'https://picsum.photos/id/17/200/200',
            'https://picsum.photos/id/28/400/250',
            'https://picsum.photos/id/42/200/280'
        ];

        let leftAssets = [];
        let rightAssets = [];

        function loadTexture(url) {
            return new Promise((resolve) => {
                const loader = new THREE.TextureLoader();
                loader.load(url, (tex) => {
                    // No sRGB here to keep stream raw/bright
                    const img = tex.image;
                    const aspect = img.width / img.height;
                    resolve({ texture: tex, aspect: aspect });
                }, undefined, () => resolve(null));
            });
        }

        function readFile(file) {
            return new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        }

        async function loadDefaults() {
            try {
                const promises = defaultUrls.map(url => loadTexture(url));
                const results = await Promise.all(promises);
                const loaded = results.filter(r => r !== null);
                leftAssets = [...loaded];
                rightAssets = [...loaded];
            } catch(e) { console.error(e); }
            
            document.getElementById('loading').style.opacity = 0;
            initStream();
        }

        loadDefaults();

        // --- 6. Stream System ---

        let meshes = []; 
        let particles = [];
        const dummy = new THREE.Object3D();
        const STREAM_LENGTH = 40.0;

        function initStream() {
            meshes.forEach(mObj => {
                if (mObj.mesh) {
                    scene.remove(mObj.mesh);
                    if (mObj.mesh.geometry) mObj.mesh.geometry.dispose();
                    if (mObj.mesh.material) mObj.mesh.material.dispose();
                }
            });
            meshes = [];
            particles = [];

            const totalQ = Math.floor(params.quantity);
            const countLeft = Math.floor(totalQ / 2);
            const countRight = totalQ - countLeft;

            // --- LEFT STREAM ---
            if(leftAssets.length > 0 && countLeft > 0) {
                const spacing = STREAM_LENGTH / countLeft;
                const baseCountPerAsset = Math.ceil(countLeft / leftAssets.length);
                
                leftAssets.forEach((asset, assetIndex) => {
                    const geo = new THREE.PlaneGeometry(1.0 * asset.aspect, 1.0);
                    const mat = new THREE.ShaderMaterial({
                        uniforms: { 
                            map: { value: asset.texture },
                            uGray: { value: params.grayLeft ? 1.0 : 0.0 },
                            uRadius: { value: params.borderRadius },
                            uAspect: { value: asset.aspect }
                        },
                        vertexShader: vertexShader,
                        fragmentShader: fragmentShaderCombined,
                        side: THREE.DoubleSide,
                        transparent: true
                    });

                    const mesh = new THREE.InstancedMesh(geo, mat, baseCountPerAsset);
                    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
                    scene.add(mesh);
                    meshes.push({ mesh: mesh, assetIndex: assetIndex, side: 'left' });
                });

                for(let i=0; i < countLeft; i++) {
                    const assetIndex = i % leftAssets.length;
                    const meshObj = meshes.find(m => m.side === 'left' && m.assetIndex === assetIndex);
                    const instanceId = particles.filter(p => p.mesh === meshObj.mesh).length;
                    
                    if(instanceId < meshObj.mesh.count) {
                        particles.push({
                            mesh: meshObj.mesh,
                            instanceId: instanceId,
                            side: 'left',
                            x: - (i * spacing), 
                            yFactor: (Math.random() - 0.5) * 2,
                            zOffset: (Math.random() - 0.5) * 4,
                            speedVar: 0.9 + Math.random() * 0.2,
                            maxDist: STREAM_LENGTH
                        });
                    }
                }
            }

            // --- RIGHT STREAM ---
            if(rightAssets.length > 0 && countRight > 0) {
                const spacing = STREAM_LENGTH / countRight;
                const baseCountPerAsset = Math.ceil(countRight / rightAssets.length);

                rightAssets.forEach((asset, assetIndex) => {
                    const geo = new THREE.PlaneGeometry(1.0 * asset.aspect, 1.0);
                    const mat = new THREE.ShaderMaterial({
                        uniforms: { 
                            map: { value: asset.texture },
                            uGray: { value: 0.0 },
                            uRadius: { value: params.borderRadius },
                            uAspect: { value: asset.aspect }
                        },
                        vertexShader: vertexShader,
                        fragmentShader: fragmentShaderCombined,
                        side: THREE.DoubleSide,
                        transparent: true
                    });

                    const mesh = new THREE.InstancedMesh(geo, mat, baseCountPerAsset);
                    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
                    scene.add(mesh);
                    meshes.push({ mesh: mesh, assetIndex: assetIndex, side: 'right' });
                });

                for(let i=0; i < countRight; i++) {
                    const assetIndex = i % rightAssets.length;
                    const meshObj = meshes.find(m => m.side === 'right' && m.assetIndex === assetIndex);
                    const instanceId = particles.filter(p => p.mesh === meshObj.mesh).length;

                    if(instanceId < meshObj.mesh.count) {
                        particles.push({
                            mesh: meshObj.mesh,
                            instanceId: instanceId,
                            side: 'right',
                            x: (i * spacing),
                            yFactor: (Math.random() - 0.5) * 2,
                            zOffset: (Math.random() - 0.5) * 4,
                            speedVar: 0.9 + Math.random() * 0.2,
                            maxDist: STREAM_LENGTH
                        });
                    }
                }
            }
        }

        // --- 7. Animation ---
        const SCREEN_EDGE_X = 16; 

        function animate() {
            requestAnimationFrame(animate);

            const calculateTransform = (absX, zOffset) => {
                let t = absX / SCREEN_EDGE_X;
                if(t > 1) t = 1;

                const curveFactor = Math.pow(t, params.curvePower);
                const heightLimit = params.spreadCenter + (params.spreadEdge - params.spreadCenter) * curveFactor;

                const scaleFactor = params.minScale + (1.0 - params.minScale) * t;
                const finalScale = scaleFactor * params.baseSize;

                const influence = Math.exp(-t * 12.0); 
                const squash = (params.deformation * influence) + (1.0 * (1.0 - influence));

                return { heightLimit, finalScale, squash };
            };

            particles.forEach(p => {
                p.x += params.speed * p.speedVar * 0.02;

                if (p.side === 'left') {
                    if (p.x > 0.0) {
                        p.x -= p.maxDist; 
                        p.yFactor = (Math.random() - 0.5) * 2;
                    }
                } else {
                    if (p.x > p.maxDist) {
                        p.x -= p.maxDist;
                        p.yFactor = (Math.random() - 0.5) * 2;
                    }
                }

                const dist = Math.abs(p.x);
                const { heightLimit, finalScale, squash } = calculateTransform(dist, p.zOffset);

                // Anti-stuck logic for center
                let renderScale = finalScale;
                if (dist < 0.2) renderScale = 0.0;

                const y = p.yFactor * heightLimit;
                const z = p.zOffset * 0.5;

                dummy.position.set(p.x, y, z);
                dummy.rotation.set(0,0,0);
                dummy.scale.set(renderScale, renderScale * squash, 1);
                dummy.updateMatrix();

                p.mesh.setMatrixAt(p.instanceId, dummy.matrix);
            });

            meshes.forEach(mObj => {
                mObj.mesh.material.uniforms.uRadius.value = params.borderRadius;
                mObj.mesh.instanceMatrix.needsUpdate = true;
            });

            renderer.render(scene, camera);
        }

        animate();

        // --- 8. GUI ---
        const gui = new GUI({ title: 'Control Panel', width: 320 });

        const fGlobal = gui.addFolder('Global Settings');
        fGlobal.addColor(params, 'backgroundColor').name('Background').onChange(c => {
            scene.background.set(c);
        });
        
        const fStream = gui.addFolder('Stream Settings');
        fStream.add(params, 'quantity', 10, 1000, 10).name('Quantity').onFinishChange(() => setTimeout(initStream, 10));
        fStream.add(params, 'speed', 0.0, 5.0).name('Speed');
        fStream.add(params, 'baseSize', 0.1, 3.0).name('Image Size').onFinishChange(() => setTimeout(initStream, 10));
        fStream.add(params, 'borderRadius', 0.0, 0.5).name('Border Radius');

        const fShape = gui.addFolder('Flow Shape');
        fShape.add(params, 'curvePower', 1.0, 5.0).name('Curve Power');
        fShape.add(params, 'spreadEdge', 2.0, 20.0).name('Width (Edge)');
        fShape.add(params, 'spreadCenter', 0.0, 2.0).name('Width (Center)');
        fShape.add(params, 'deformation', 0.1, 1.0).name('Squash (Center)');
        fShape.add(params, 'minScale', 0.01, 1.0).name('Min Scale (Center)');

        const fCenter = gui.addFolder('Logo Settings');
        fCenter.add(params, 'logoSize', 0.1, 5.0).name('Size').onChange(v => centerGroup.scale.set(v, v, 1));
        
        const fContent = gui.addFolder('Content');
        
        fContent.add(params, 'grayLeft').name('Gray Left Stream').onChange(v => {
            meshes.forEach(mObj => {
                if(mObj.side === 'left') {
                    mObj.mesh.material.uniforms.uGray.value = v ? 1.0 : 0.0;
                    mObj.mesh.material.needsUpdate = true;
                }
            });
        });
        
        const actions = {
            upLogo: () => document.getElementById('logoInput').click(),
            upLeft: () => document.getElementById('leftInput').click(),
            upRight: () => document.getElementById('rightInput').click()
        };
        
        fContent.add(actions, 'upLogo').name('Upload Logo');
        fContent.add(actions, 'upLeft').name('Upload Left Images');
        fContent.add(actions, 'upRight').name('Upload Right Images');

        // --- Handlers ---

        document.getElementById('logoInput').addEventListener('change', (e) => {
            const f = e.target.files[0];
            if(f) readFile(f).then(res => {
                const img = new Image();
                img.src = res;
                img.onload = () => {
                    logoTexture = new THREE.Texture(img);
                    // Logo needs sRGB
                    logoTexture.colorSpace = THREE.SRGBColorSpace;
                    logoTexture.needsUpdate = true;
                    updateCenter();
                }
            });
            e.target.value = '';
        });

        const handleUpload = async (e, isLeft) => {
            const files = Array.from(e.target.files);
            if(!files.length) return;
            
            const loaderEl = document.getElementById('loading');
            loaderEl.innerText = "Processing Images...";
            loaderEl.style.opacity = 1;

            try {
                const promises = files.map(f => readFile(f).then(url => loadTexture(url)));
                const results = await Promise.all(promises);
                const loaded = results.filter(r => r !== null);
                
                const oldAssets = isLeft ? leftAssets : rightAssets;
                oldAssets.forEach(a => {
                    if(a && a.texture) a.texture.dispose();
                });

                if(isLeft) leftAssets = loaded;
                else rightAssets = loaded;
                
                initStream();
            } catch (error) {
                console.error("Upload Error:", error);
                alert("Failed to load images. See console.");
            } finally {
                loaderEl.style.opacity = 0;
                e.target.value = '';
            }
        };

        document.getElementById('leftInput').addEventListener('change', e => handleUpload(e, true));
        document.getElementById('rightInput').addEventListener('change', e => handleUpload(e, false));

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });