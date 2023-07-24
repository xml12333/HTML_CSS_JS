import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const leavesVS = /*glsl*/`
    uniform sampler2D uNoiseMap;
    uniform vec3 uBoxMin, uBoxSize, uRaycast;
    uniform float uTime;
    varying vec3 vObjectPos, vNormal, vWorldNormal; 
    varying float vCloseToGround;
    
    vec4 getTriplanar(sampler2D tex){
        vec4 xPixel = texture(tex, (vObjectPos.xy + uTime) / 3.);
        vec4 yPixel = texture(tex, (vObjectPos.yz + uTime) / 3.);
        vec4 zPixel = texture(tex, (vObjectPos.zx + uTime) / 3.);
        vec4 combined = (xPixel + yPixel + zPixel) / 6.0;
        combined.xyz = combined.xyz * vObjectPos; 
        return combined;
    }
    
    void main(){
        mat4 mouseDisplace = mat4(1.);
        vec3 vWorldPos = vec3(modelMatrix * instanceMatrix * mouseDisplace * vec4(position, 1.));
        vCloseToGround = clamp(vWorldPos.y, 0., 1.);
        float offset = clamp(0.8 - distance(uRaycast, instanceMatrix[3].xyz), 0., 999.); 
        offset = (pow(offset, 0.8) / 2.0) * vCloseToGround;
        mouseDisplace[3].xyz = vec3(offset);
        vNormal = normalMatrix * mat3(instanceMatrix) * mat3(mouseDisplace) * normalize(normal); 
        vWorldNormal = vec3(modelMatrix * instanceMatrix * mouseDisplace * vec4(normal, 0.));
        vObjectPos = ((vWorldPos - uBoxMin) * 2.) / uBoxSize - vec3(1.0); 
        vec4 noiseOffset = getTriplanar(uNoiseMap) * vCloseToGround; 
        vec4 newPos = instanceMatrix * mouseDisplace * vec4(position, 1.); 
        newPos.xyz = newPos.xyz + noiseOffset.xyz;
        gl_Position =  projectionMatrix * modelViewMatrix * newPos;
    }
`
const leavesFS = /*glsl*/`
    #include <common> 
    #include <lights_pars_begin>
    uniform vec3 uColorA, uColorB, uColorC;
    uniform float uTime;
    varying vec3 vObjectPos, vNormal, vWorldNormal; 
    varying float vCloseToGround;
    
    vec3 mix3 (vec3 v1, vec3 v2, vec3 v3, float fa){
        vec3 m; 
        fa > 0.7 ? m = mix(v2, v3, (fa - .5) * 2.) : m = mix(v1, v2, fa * 2.);
        return m;
    }

    float getPosColors(){
        float p = 0.;
        p = smoothstep(0.2, 0.8, distance(vec3(0.), vObjectPos));
        p = p * (-(vWorldNormal.g / 2.) + 0.5) * (- vObjectPos.y / 9. + 0.5); 
        return p;
    }
    float getDiffuse(){
        float intensity;
        for (int i = 0; i < directionalLights.length(); i++){
            intensity = dot(directionalLights[i].direction, vNormal);
            intensity = smoothstep(0.55, 1., intensity) * 0.2 
                        + pow(smoothstep(0.55, 1., intensity), 0.5);
        }
        return intensity;
    }

    void main(){
        float gradMap = (getPosColors() + getDiffuse()) * vCloseToGround / 2. ;
        vec4 c = vec4(mix3(uColorA, uColorB, uColorC, gradMap), 1.0);
        gl_FragColor = vec4(pow(c.xyz,vec3(0.454545)), c.w);
				//gl_FragColor = vec4(c.xyz, c.w);
    }
`

// GENERAL DEFINITIONS
const scene = new THREE.Scene();
const loader = new GLTFLoader();
const camera = new THREE.PerspectiveCamera(35, window.innerWidth/window.innerHeight, 0.001, 1000);
const renderer = new THREE.WebGLRenderer({alpha: true});
const controls = new OrbitControls(camera, renderer.domElement);
const dummy = new THREE.Object3D();
const matrix = new THREE.Matrix4();
const pointer = new THREE.Vector2(); 
const raycaster = new THREE.Raycaster();
const dlight01 = new THREE.DirectionalLight(0xcccccc, 1.8);
const tree = {group: new THREE.Group()};
const noiseMap = new THREE.TextureLoader().load('img/noise.png');
const poleTexture = new THREE.TextureLoader().load('img/texture.jpg');
poleTexture.rotation = 100 * 0.01745329252; // WTF???
const rayPlane = new THREE.Mesh(new THREE.PlaneGeometry(100,100,1,1), undefined);
// MATERIALS
const leavesMat = new THREE.ShaderMaterial({
  lights: true,
  side: THREE.DoubleSide,
  uniforms: {
    ...THREE.UniformsLib.lights,
    uTime: {value: 0.},
    uColorA: {value: new THREE.Color(0xb45252)},
    uColorB: {value: new THREE.Color(0xd3a068)},
    uColorC: {value: new THREE.Color(0xede19e)},
    uBoxMin: {value: new THREE.Vector3(0,0,0)},
    uBoxSize: {value: new THREE.Vector3(10,10,10)},
    uRaycast: {value: new THREE.Vector3(0,0,0)},
    uNoiseMap: {value: noiseMap},
  },
  vertexShader: leavesVS,
  fragmentShader: leavesFS,
})
// GLTF LOADING 
 loader.loadAsync("img/tree.glb")
  .then(obj => {
	document.getElementById("previewHack").style.display = "none";
  tree.pole = obj.scene.getObjectByName("Pole");
  tree.pole.material = new THREE.MeshToonMaterial({map: tree.pole.material.map});
  // Each vertex of crown mesh will be a leaf
  // Crown mesh won't be visible in scene
  tree.crown = obj.scene.getObjectByName("Leaves");
  // For object space shader
  tree.bbox = new THREE.Box3().setFromObject(tree.crown);
  leavesMat.uniforms.uBoxMin.value.copy(tree.bbox.min); 
  leavesMat.uniforms.uBoxSize.value.copy(tree.bbox.getSize(new THREE.Vector3())); 
  tree.leavesCount = tree.crown.geometry.attributes.position.count;
  tree.whenDied = new Array(tree.leavesCount);
  tree.deadID = []; 
  tree.leafGeometry = obj.scene.getObjectByName("Leaf").geometry; 
  tree.leaves = new THREE.InstancedMesh(tree.leafGeometry, leavesMat, tree.leavesCount); 
  for (let i = 0; i < tree.leavesCount; i++) { 
    dummy.position.x = tree.crown.geometry.attributes.position.array[i*3];
    dummy.position.y = tree.crown.geometry.attributes.position.array[i*3+1];
    dummy.position.z = tree.crown.geometry.attributes.position.array[i*3+2];
    dummy.lookAt(dummy.position.x + tree.crown.geometry.attributes.normal.array[i*3],
                 dummy.position.y + tree.crown.geometry.attributes.normal.array[i*3+1],
                 dummy.position.z + tree.crown.geometry.attributes.normal.array[i*3+2]);
    dummy.scale.x = (Math.random() * 0.2 + 0.8);
    dummy.scale.y = (Math.random() * 0.2 + 0.8);
    dummy.scale.z = (Math.random() * 0.2 + 0.8);
    dummy.updateMatrix();
    tree.leaves.setMatrixAt(i, dummy.matrix);
  }
  tree.group.add(tree.pole, tree.leaves);
  for (let i = 0; i < 24; i++)
    tree.deadID.push(Math.floor(Math.random() * tree.leavesCount)); 
})
// INIT
document.body.appendChild(renderer.domElement); 
renderer.setSize(window.innerWidth, window.innerHeight);
dlight01.position.set(3,6,-3);
dlight01.lookAt(0,2.4,0);
rayPlane.visible = false;
camera.position.set(-7,1,-12);
controls.target = new THREE.Vector3(0,2.4,0);
controls.maxPolarAngle = Math.PI * 0.5; 
controls.enableDamping = true;
controls.autoRotate = true;
controls.enablePan = false;
controls.touches = {TWO: THREE.TOUCH.ROTATE,};
scene.add(dlight01, tree.group, rayPlane);
noiseMap.wrapS = THREE.RepeatWrapping;
noiseMap.wrapT = THREE.RepeatWrapping;
// MAIN LOOP
animate()
function animate () {
	requestAnimationFrame(animate);
  leavesMat.uniforms.uTime.value += 0.01; 

  if (tree.deadID){
    tree.deadID = tree.deadID.map(i => {
      tree.leaves.getMatrixAt(i, matrix);
      matrix.decompose(dummy.position, dummy.rotation, dummy.scale);
      if (dummy.position.y > 0) {
        dummy.position.y -= 0.04;
        dummy.position.x += Math.random()/5 - 0.11;
        dummy.position.z += Math.random()/5 - 0.11;
        dummy.rotation.x += 0.2;
        dummy.updateMatrix();
        tree.leaves.setMatrixAt(i, dummy.matrix);
        return(i);
      }
    })
    tree.leaves.instanceMatrix.needsUpdate = true; 
  } 

  controls.update(); 
  renderer.render(scene, camera); 
}
// EVENTS
window.addEventListener("resize", () => {
  camera.aspect = document.body.clientWidth / document.body.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( document.body.clientWidth, document.body.clientHeight );
})
document.addEventListener("mousemove", (e) => pointerMove(e))
// MISC
killRandom();
function killRandom() {
  if (tree.deadID)
    tree.deadID.push(Math.floor(Math.random() * tree.leavesCount)); 
  setTimeout(killRandom, Math.random() * 1500);
}
function pointerMove(e) {
    pointer.set((e.clientX / window.innerWidth) * 2 - 1,
              -(e.clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects([tree.leaves, rayPlane]);
  if (intersects[0]){
    // for smooth transition between background and tree
    rayPlane.position.copy(intersects[0].point);
    rayPlane.position.multiplyScalar(0.9);
    rayPlane.lookAt(camera.position);
    leavesMat.uniforms.uRaycast.value = intersects[0].point;
    if (Math.random()*5 > 3)
      tree.deadID.push(intersects[0].instanceId);
  }
}
