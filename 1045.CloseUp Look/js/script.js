import * as THREE from "https://esm.sh/three";
import { createTimeline, animate } from "https://esm.sh/animejs";
import { Pane } from "https://esm.sh/tweakpane";
import * as InfodumpPlugin from "https://esm.sh/tweakpane-plugin-infodump";
import * as EssentialsPlugin from "https://esm.sh/@tweakpane/plugin-essentials";


//SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color("#FF715B");

// CAMERA
const camera = new THREE.OrthographicCamera();

camera.position.set(0, 0, 1000);
camera.lookAt(0, 0, 0);
camera.near = 1;
camera.far = 2000;

const cameraAnchor = new THREE.Group();
cameraAnchor.name = "cameraAnchor";
cameraAnchor.add(camera);
scene.add(cameraAnchor);

//RENDERER
const canvas = document.querySelector("canvas.webgl");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});

//OBJECT TEMPLATE
class Grid {
  constructor(gridProperties) {
    this.drawn = false;
    this.shown = false;

    this.gridProperties = gridProperties;
    this.cellProperties = this.calculateCellProperties(gridProperties);

    // List of dithering threshold maps
    // Reference: http://caca.zoy.org/study/part2.html
    this.thresholdMaps = [
      {
        id: "bayer4x4",
        name: "Bayer 4x4",
        data: [
          0, 8, 2, 10,
          12, 4, 14, 6,
          3, 11, 1, 9,
          15, 7, 13, 5
        ]
      },
      {
        id: "bayer8x8",
        name: "Bayer 8x8",
        data: [
          0, 32, 8, 40, 2, 34, 10, 42,
          48, 16, 56, 24, 50, 18, 58, 26,
          12, 44, 4, 36, 14, 46, 6, 38,
          60, 28, 52, 20, 62, 30, 54, 22,
          3, 35, 11, 43, 1, 33, 9, 41,
          51, 19, 59, 27, 49, 17, 57, 25,
          15, 47, 7, 39, 13, 45, 5, 37,
          63, 31, 55, 23, 61, 29, 53, 21
        ]
      },
      {
        id: "halftone",
        name: "Halftone",
        data: [
          24, 10, 12, 26, 35, 47, 49, 37,
          8, 0, 2, 14, 45, 59, 61, 51,
          22, 6, 4, 16, 43, 57, 63, 53,
          30, 20, 18, 28, 33, 41, 55, 39,
          34, 46, 48, 36, 25, 11, 13, 27,
          44, 58, 60, 50, 9, 1, 3, 15,
          42, 56, 62, 52, 23, 7, 5, 17,
          32, 40, 54, 38, 31, 21, 19, 29
        ]
      },
      {
        id: "voidAndCluster",
        name: "Void and Cluster",
        data: [
          131, 187, 8, 78, 50, 18, 134, 89, 155, 102, 29, 95, 184, 73,
          22, 86, 113, 171, 142, 105, 34, 166, 9, 60, 151, 128, 40, 110,
          168, 137, 45, 28, 64, 188, 82, 54, 124, 189, 80, 13, 156, 56,
          7, 61, 186, 121, 154, 6, 108, 177, 24, 100, 38, 176, 93, 123,
          83, 148, 96, 17, 88, 133, 44, 145, 69, 161, 139, 72, 30, 181,
          115, 27, 163, 47, 178, 65, 164, 14, 120, 48, 5, 127, 153, 52,
          190, 58, 126, 81, 116, 21, 106, 77, 173, 92, 191, 63, 99, 12,
          76, 144, 4, 185, 37, 149, 192, 39, 135, 23, 117, 31, 170, 132,
          35, 172, 103, 66, 129, 79, 3, 97, 57, 159, 70, 141, 53, 94,
          114, 20, 49, 158, 19, 146, 169, 122, 183, 11, 104, 180, 2, 165,
          152, 87, 182, 118, 91, 42, 67, 25, 84, 147, 43, 85, 125, 68,
          16, 136, 71, 10, 193, 112, 160, 138, 51, 111, 162, 26, 194, 46,
          174, 107, 41, 143, 33, 74, 1, 101, 195, 15, 75, 140, 109, 90,
          32, 62, 157, 98, 167, 119, 179, 59, 36, 130, 175, 55, 0, 150
        ]
      },
    ];

    this.activeThresholdMapId = this.gridProperties.activeThresholdMapId || this.thresholdMaps[0].id;
  }

  calculateCellProperties(gridProperties) {
    const rows = gridProperties.rows || 1;
    const columns = gridProperties.columns || 1;
    const cellSize = gridProperties.cellSize || 1;
    const cellThickness = gridProperties.cellThickness || cellSize;
    const spacing = gridProperties.spacing || 1;

    const objectCount = rows * columns;

    const properties = new Array(objectCount);

    const positions = (i, rows, columns) => {
      // Calculate cell position on the grid based on index
      const row = Math.floor(i / columns);
      const column = i % columns;

      // Center the grid around origin
      const x = (column - (columns - 1) / 2) * spacing;
      const y = (-row + (rows - 1) / 2) * spacing;
      const z = 0;

      return {
        x,
        y,
        z,
        row,
        column
      };
    };


    for (let i = 0; i < objectCount; i++) {
      properties[i] = {};
      properties[i].id = i;

      const { x, y, z, row, column } = positions(i, rows, columns);
      properties[i].x = x;
      properties[i].y = y;
      properties[i].z = z;
      properties[i].row = row;
      properties[i].column = column;


      properties[i].cellSize = cellSize;
      properties[i].cellThickness = cellThickness;
    }

    return properties;
  }

  calculateAttributes() {

    // Helper function to calculate threshold for a matrix
    const calculateThreshold = (row, column, matrixConfig) => {
      const { data } = matrixConfig;
      const size = Math.sqrt(data.length);
      const scale = data.length;
      const matrixRow = row % size;
      const matrixColumn = column % size;
      const index = matrixColumn + matrixRow * size;
      return data[index] / scale;
    };

    // Create arrays for basic attributes
    const count = this.cellProperties.length;
    const rowArray = new Float32Array(count);
    const columnArray = new Float32Array(count);

    // Create threshold arrays
    const thresholdArrays = {};
    this.thresholdMaps.forEach(config => {
      thresholdArrays[config.id] = new Float32Array(count);
    });

    // Fill arrays in single loop

    for (let i = 0; i < count; i++) {
      const { row, column } = this.cellProperties[i];

      rowArray[i] = row;
      columnArray[i] = column;

      // Calculate thresholds for all matrices
      this.thresholdMaps.forEach(config => {
        thresholdArrays[config.id][i] = calculateThreshold(row, column, config);
      });
    };

    const attributes = {};
    attributes.aRow = new THREE.InstancedBufferAttribute(rowArray, 1);
    attributes.aColumn = new THREE.InstancedBufferAttribute(columnArray, 1);
    this.thresholdMaps.forEach(config => {
      attributes[config.id] = new THREE.InstancedBufferAttribute(thresholdArrays[config.id], 1);
    });

    // Return Three.js buffer attributes
    return attributes;

  }

  init() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const attributes = this.calculateAttributes();

    geometry.setAttribute("aRow", attributes.aRow);
    geometry.setAttribute("aColumn", attributes.aColumn);
    geometry.setAttribute("aThreshold", attributes[this.activeThresholdMapId]);

    const simplexNoise = `
      //
      // Description : Array and textureless GLSL 2D simplex noise function.
      //      Author : Ian McEwan, Ashima Arts.
      //  Maintainer : stegu
      //     Lastmod : 20110822 (ijm)
      //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
      //               Distributed under the MIT License. See LICENSE file.
      //               https://github.com/ashima/webgl-noise
      //               https://github.com/stegu/webgl-noise
      // 
    
      vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
    
      vec2 mod289(vec2 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
    
      vec3 permute(vec3 x) {
        return mod289(((x*34.0)+10.0)*x);
      }
    
      float snoise(vec2 v)
        {
        const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                            0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                           -0.577350269189626,  // -1.0 + 2.0 * C.x
                            0.024390243902439); // 1.0 / 41.0
      // First corner
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
    
      // Other corners
        vec2 i1;
        //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
        //i1.y = 1.0 - i1.x;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        // x0 = x0 - 0.0 + 0.0 * C.xx ;
        // x1 = x0 - i1 + 1.0 * C.xx ;
        // x2 = x0 - 1.0 + 2.0 * C.xx ;
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        
      // Permutations
        i = mod289(i); // Avoid truncation effects in permutation
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      		+ i.x + vec3(0.0, i1.x, 1.0 ));
        
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        
      // Gradients: 41 points uniformly over a line, mapped onto a diamond.
      // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)
        
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        
      // Normalise gradients implicitly by scaling m
      // Approximation of: m *= inversesqrt( a0*a0 + h*h );
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        
      // Compute final noise value at P
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
    `;

    const vertexShader = `      
      uniform float uRowSize;
      uniform float uColumnSize;
      uniform float uDitherProgress;
      uniform float uGridOffsetStart;
      uniform float uGridOffsetEnd;
      uniform sampler2D uTexture;

      attribute float aRow;
      attribute float aColumn;
      attribute float aThreshold;

      varying vec3 vColor;
      varying vec3 vNormal;

      mat3 scale(vec3 _scale){
          return mat3(_scale.x, 0.0, 0.0,
                  0.0, _scale.y, 0.0,
                  0.0, 0.0, _scale.z);
      }
      
      ${simplexNoise}

      void main() {
        vec2 st = vec2(aColumn, uRowSize - 1.0 - aRow) / vec2(uColumnSize - 1.0, uRowSize - 1.0);
        float bayerThreshold = aThreshold;
        float rowId = aRow / uRowSize;
        float columnId = aColumn / uColumnSize;

        vec4 textureColor = texture2D(uTexture, st);
        float initialColor = 0.0;
        float targetColor = textureColor.r;
        float borderWidth = 2.0;


        float cellDelayIndex = snoise(vec2(rowId, columnId) * 80.7);
        cellDelayIndex = smoothstep(-1.0, 1.0, cellDelayIndex);
        
        float animationDuration = 0.15;
        float animationDelay = cellDelayIndex * (1.0 - animationDuration);
        float animationEnd = animationDelay + animationDuration;
        float animationProgress = smoothstep(animationDelay, animationEnd, uDitherProgress);

        float ditheredColor = step(bayerThreshold, targetColor);
        float ditherProgress = smoothstep(0.0, 1.0, animationProgress); 
        float finalColor = mix(initialColor, ditheredColor, ditherProgress);
        
        //Check if border
        float isBorder = clamp(
          step(aColumn + 0.1, borderWidth) + 
          step(uColumnSize - borderWidth, aColumn) + 
          step(aRow + 0.1, borderWidth) + 
          step(uRowSize - borderWidth, aRow), 
        0.0, 1.0);
        
        //Change color to black if isBorder
        finalColor *= (1.0 - isBorder);
        
        float cellOffsetProgress = finalColor;
        float cellOffset = mix(uGridOffsetStart, uGridOffsetEnd, cellOffsetProgress);
        
        
        //Change color to black if isBorder
        finalColor *= (1.0 - isBorder);

        vec4 cellLocalPosition = vec4(position, 1.0);

        vec4 cellPosition = modelMatrix * instanceMatrix * cellLocalPosition;
        cellPosition.z += cellOffset;

        vec4 modelNormal = modelMatrix * instanceMatrix * vec4(normal, 0.0);

        gl_Position = projectionMatrix * viewMatrix * cellPosition;
        vColor = vec3(finalColor);
        vNormal = normalize(modelNormal.xyz);
      }
    `;

    const fragmentShader = `
        varying vec3 vColor;
        varying vec3 vNormal;

        void main() {
        float shadow = dot(normalize(vec3(0.0, 1.0, 1.0)), normalize(vNormal));
        vec3 color = vColor * (0.9 + 0.6 * shadow);
        color = clamp(vec3(0.0), vec3(1.0), color);
        gl_FragColor = vec4(color, 1.0);
        }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uRowSize: { value: this.gridProperties.rows || 1 },
        uColumnSize: { value: this.gridProperties.columns || 1 },
        uGridOffsetStart: { value: 0 },
        uGridOffsetEnd: { value: 0 },
        uTexture: { value: null },
        uDitherProgress: { value: 0 }
      }
    });

    //Add Image Texture
    if (this.gridProperties.gridType == 1 && this.gridProperties.image) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        this.gridProperties.image,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          material.uniforms.uTexture.value = texture;
          material.needsUpdate = true;
        }
      );
    }

    const mesh = new THREE.InstancedMesh(
      geometry,
      material,
      this.cellProperties.length
    );

    const group = new THREE.Group();
    group.add(mesh);

    this.group = group;
    this.geometry = geometry;
    this.material = material;
    this.instance = mesh;
    this.attributes = attributes;

    //Update Cell Position and Size
    for (let i = 0; i < this.cellProperties.length; i++) {
      const properties = this.cellProperties[i];
      const { x, y, z, cellSize, cellThickness } = properties;

      const objectRef = new THREE.Object3D();
      objectRef.position.set(x, y, z);
      objectRef.scale.set(cellSize, cellSize, cellThickness);
      objectRef.updateMatrix();

      this.instance.setMatrixAt(i, objectRef.matrix);
    }

    this.instance.instanceMatrix.needsUpdate = true;
    this.drawn = true;
  }

  showAt(scene) {
    if (!this.drawn) {
      this.init();
    }

    if (!this.shown) {
      scene.add(this.group);
      this.shown = true;
    }
  }

  hideFrom(scene) {
    if (this.shown) {
      scene.remove(this.group);
      this.shown = false;
    }
  }
}


//INITIATE OBJECTS
const imageGrid = new Grid({
  name: "image-grid",
  rows: 400,
  columns: 400,
  cellSize: 1,
  cellThickness: 0.5,
  spacing: 1,
  gridType: 1,
  cellColor: "#AAAAAA",
  image: 'https://assets.codepen.io/989082/dithering_object.jpg',
  activeThresholdMapId: "voidAndCluster"
});
imageGrid.showAt(scene);

//SET INITIAL States

//Initial Camera Position
camera.zoom = 70;
camera.updateProjectionMatrix();
cameraAnchor.position.set(180, 0, 0);
cameraAnchor.rotation.reorder("ZXY");
cameraAnchor.rotation.z = Math.PI * 0.25;
cameraAnchor.rotation.x = Math.PI * 0.35;

//Initial Object State
imageGrid.material.uniforms.uDitherProgress.value = 0.04;
imageGrid.material.uniforms.uGridOffsetStart.value = 0;
imageGrid.material.uniforms.uGridOffsetEnd.value = 0.35;

renderer.render(scene,camera);

///ANIMATE & RENDER

let isPlaying = true;
let animationPanel;
let animationPlayButton;
let pane;

//ANIMATION TIMELINE
const timeline = createTimeline({
  onUpdate: (self) => {
    const progress = self.iterationProgress;
    const zoomLevel = (1 - progress) * 99 + 1;
    animationPanel.value = zoomLevel;

    renderer.render(scene, camera);
  },
  onComplete: () => {
    isPlaying = false;
    animationPlayButton.title = "Restart Animation";
    animationPlayButton.disabled = false;
    animationPanel.disabled = false;
    pane.expanded = true;
  }
});

const updateDitherProgress = animate(imageGrid.material.uniforms.uDitherProgress, {
  value: 1,
  duration: 10000,
  ease: "linear"
});
timeline.sync(updateDitherProgress, 0);

const rotateCamera = animate(cameraAnchor.rotation, {
  x: 0,
  y: 0,
  z: 0,
  duration: 14000,
  ease: "inOutSine"
});
timeline.sync(rotateCamera, 0);

const zoomOut = animate(camera, {
  zoom: 0.9,
  duration: 14000,
  onUpdate: () => {
    camera.updateProjectionMatrix();
  },
  ease: "inOutSine"
});
timeline.sync(zoomOut, 0);

const panning = animate(cameraAnchor.position, {
  x: 0,
  duration: 5000,
  ease: "inOutCubic"
});
timeline.sync(panning, 9000);

// PANEL
pane = new Pane({ title: "About", expanded: false });
pane.registerPlugin(InfodumpPlugin);
pane.registerPlugin(EssentialsPlugin);

const aboutText = pane.addBlade({
  view: 'infodump',
  content: `
  This animation shows a close-up look at dithering patterns produced by various threshold maps.
  
  Try different maps from the options to see the unique patterns they produce.
  
  You can pause the animation at any time and play with the zoom level manually using the slider.
  
  ***
  If you want to know what dithering is, I made a visual article about dithering here: [https://visualrambling.space/dithering-part-1/](https://visualrambling.space/dithering-part-1/). 
  The next article, which will cover more about threshold maps is coming soon!
  `,
  markdown: true
});

const thresholdMapSeparator = pane.addBlade({
  view: 'separator'
});

const params = {
  scale: 25,
};

const thresholdMapsList = imageGrid.thresholdMaps ? imageGrid.thresholdMaps : [];
console.log(imageGrid.thresholdMaps)
pane.addBinding(imageGrid, 'activeThresholdMapId', {
  view: 'radiogrid',
  size: [2, Math.ceil(imageGrid.thresholdMaps.length / 2)],
  cells: (x, y) => ({
    title: `${thresholdMapsList[x + 2*y].name}`,
    value: thresholdMapsList[x + 2*y].id,
  }),
  groupName: 'map',
  label: 'Threshold Map',
}).on('change', (ev) => {
  imageGrid.geometry.setAttribute("aThreshold", imageGrid.attributes[ev.value]);
  imageGrid.geometry.attributes.aThreshold.needsUpdate = true;

  if (!isPlaying) {
    renderer.render(scene, camera);
  }
});


const animationSeparator = pane.addBlade({
  view: 'separator'
});

animationPanel = pane.addBlade({
  view: 'slider',
  label: 'Zoom',
  min: 1,
  max: 100,
  value: 100,
  disabled: true,
}).on('change', (ev) => {
  const time = 1 - ((ev.value - 1) / 99);
  timeline.seek(time * timeline.iterationDuration);

  if (timeline.progress === 1) {
    animationPlayButton.title = "Restart";
  }
  else if (!isPlaying) {
    animationPlayButton.title = "Resume";
  } else {
    animationPlayButton.title = "Pause";
  }
});

const animationButtonSeparator = pane.addBlade({
  view: 'separator'
});

animationPlayButton = pane.addButton({
  title: 'Pause',
  label: "Animation",
});

animationPlayButton.on('click', () => {
  if (timeline.progress === 1) {
    //Restart
    timeline.restart();
    isPlaying = true;
    animationPlayButton.title = "Pause";
    animationPanel.disabled = true;
  } else {
    if (isPlaying) {
      timeline.pause();
      isPlaying = false;
      animationPlayButton.title = "Resume";
      animationPanel.disabled = false;
    } else {
      timeline.play();
      isPlaying = true;
      animationPlayButton.title = "Pause";
      animationPanel.disabled = true;
    }
  }
});

//RESIZE FUNCTION
const resize = (width, height, pixelRatio) => {
  const boundingBoxSize = 400;
  const aspectRatio = width / height;

  //RESIZE CAMERA
  if (aspectRatio < 1) {
    camera.left = -boundingBoxSize / 2;
    camera.right = boundingBoxSize / 2;
    camera.top = boundingBoxSize / 2 / aspectRatio;
    camera.bottom = -boundingBoxSize / 2 / aspectRatio;
  } else {
    camera.left = (-boundingBoxSize / 2) * aspectRatio;
    camera.right = (boundingBoxSize / 2) * aspectRatio;
    camera.top = boundingBoxSize / 2;
    camera.bottom = -boundingBoxSize / 2;
  }

  camera.aspect = aspectRatio;
  camera.updateProjectionMatrix();

  //RESIZE RENDERER
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(pixelRatio, 2));

  if (!isPlaying) renderer.render(scene, camera);
};

//Init resize function for the 1st time
resize(window.innerWidth, window.innerHeight, window.devicePixelRatio);

//Reinit resize function on window resize
window.addEventListener("resize", () => {
  resize(window.innerWidth, window.innerHeight, window.devicePixelRatio);
});