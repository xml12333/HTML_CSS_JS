let renderer, scene, camera;
let plane, material;
let textures = [];
let activeImage = 0;
let transitionImage = null;
let progress = 1;
let isAnimating = false;

const images = [
  {
    url: "https://cdn.prod.website-files.com/675835c7f4ae1fa1a79b3733/682c71c61f6db7df2e5218bc_collections-oranith-1.webp",
    title: "Image 1",
  },
  {
    url: "https://cdn.prod.website-files.com/675835c7f4ae1fa1a79b3733/682c71c6bd8971b3e73ee7c8_collections-anturax-1.webp",
    title: "Image 2",
  },
  {
    url: "https://cdn.prod.website-files.com/675835c7f4ae1fa1a79b3733/682c71c6648fdd5236d5b972_collections-oranith-2.webp",
    title: "Image 3",
  },
  {
    url: "https://cdn.prod.website-files.com/675835c7f4ae1fa1a79b3733/682c71c67e1e5c7edbcc0c3f_collections-anturax-3.webp",
    title: "Image 4",
  },
];
const imagesThumbnail = [
  {
    url: "https://cdn.prod.website-files.com/675835c7f4ae1fa1a79b3733/682c7c7c41d8916da35baa9c_card-Oraniths-1.webp",
    title: "Image 1",
  },
  {
    url: "https://cdn.prod.website-files.com/675835c7f4ae1fa1a79b3733/682c7c7c65d779e7cfe7a75a_card-anturax-1.webp",
    title: "Image 2",
  },
  {
    url: "https://cdn.prod.website-files.com/675835c7f4ae1fa1a79b3733/682c7c7c5225fefdd3302e57_card-Oraniths-2.webp",
    title: "Image 3",
  },
  {
    url: "https://cdn.prod.website-files.com/675835c7f4ae1fa1a79b3733/682c7c7c8c0dbe0a8563fe55_card-anturax-3.webp",
    title: "Image 4",
  },
];

const PIXELS = new Float32Array(
  [
    1, 1.5, 2, 2.5, 3, 1, 1.5, 2, 2.5, 3, 3.5, 4, 2, 2.5, 3, 3.5, 4, 4.5, 5,
    5.5, 6, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 20, 100,
  ].map((v) => v / 100)
);

function init() {
  const containerNext = document.getElementById("canvasWrapper");

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 10;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(450, 450);
  containerNext.appendChild(renderer.domElement);

  const loader = new THREE.TextureLoader();
  let loadCount = 0;
  images.forEach((img, idx) => {
    loader.load(img.url, (tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;

      textures[idx] = tex;
      loadCount++;
      if (loadCount === images.length) {
        createScene();
        animate();
      }
    });
  });

  createThumbnails();
}

function createScene() {
  const vertexShader = `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `;

  const fragmentShader = `
          uniform float uTime;
          uniform vec3 uFillColor;
          uniform float uProgress;
          uniform float uType;
          uniform float uPixels[36];
          uniform vec2 uTextureSize;
          uniform vec2 uElementSize;
          uniform sampler2D uTexture;
          varying vec2 vUv;

          vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
          vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
          vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
          vec3 fade3(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

          float mapf(float value, float min1, float max1, float min2, float max2) {
            float val = min2 + (value - min1) * (max2 - min2) / (max1 - min1);
            return clamp(val, min2, max2);
          }

          float quadraticInOut(float t) {
            float p = 2.0 * t * t;
            return t < 0.5 ? p : -p + (4.0 * t) - 1.0;
          }

          void main() {
            vec2 uv = vUv - vec2(0.5);
            float aspect1 = uTextureSize.x/uTextureSize.y;
            float aspect2 = uElementSize.x/uElementSize.y;
            if(aspect1>aspect2){uv *= vec2( aspect2/aspect1,1.);} 
            else{uv *= vec2( 1.,aspect1/aspect2);}
            uv += vec2(0.5);
            vec4 defaultColor = texture2D(uTexture, uv);

            if(uType==3.0){
              float progress = quadraticInOut(1.0-uProgress);
              float s = 50.0;
              float imageAspect = uTextureSize.x/uTextureSize.y;
              vec2 gridSize = vec2(
                s,
                floor(s/imageAspect)
              );

              float v = smoothstep(0.0, 1.0, vUv.y + sin(vUv.x*4.0+progress*6.0) * mix(0.3, 0.1, abs(0.5-vUv.x)) * 0.5 * smoothstep(0.0, 0.2, progress) + (1.0 - progress * 2.0));
              float mixnewUV = (vUv.x * 3.0 + (1.0-v) * 50.0)*progress;
              vec2 subUv = mix(uv, floor(uv * gridSize) / gridSize, mixnewUV);

              vec4 color = texture2D(uTexture, subUv);
              color.a =  mix(1.0, pow(v, 5.0) , step(0.0, progress));
              color.a = pow(v, 1.0);
              color.rgb = mix(color.rgb, uFillColor, smoothstep(0.5, 0.0, abs(0.5-color.a)) * progress);
              gl_FragColor = color;
            }
            gl_FragColor.rgb = pow(gl_FragColor.rgb,vec3(1.0/1.2));
          }
        `;

  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uFillColor: { value: new THREE.Color("#000000") },
      uProgress: { value: 1 },
      uType: { value: 3 },
      uPixels: { value: PIXELS },
      uTextureSize: { value: new THREE.Vector2(1, 1) },
      uElementSize: { value: new THREE.Vector2(1, 1) },
      uTexture: { value: textures[activeImage] },
    },
    transparent: true,
  });

  material.uniforms.uTextureSize.value.set(
    textures[activeImage].image.width,
    textures[activeImage].image.height
  );

  const geometry = new THREE.PlaneGeometry(8.3, 8.3);
  plane = new THREE.Mesh(geometry, material);
  scene.add(plane);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  updateAnimation();
}

function updateAnimation() {
  if (transitionImage !== null && isAnimating) {
    progress += 0.015;

    if (
      progress > 0.1 &&
      material.uniforms.uTexture.value !== textures[transitionImage]
    ) {
      material.uniforms.uTexture.value = textures[transitionImage];
      material.uniforms.uTextureSize.value.set(
        textures[transitionImage].image.width,
        textures[transitionImage].image.height
      );
    }

    if (progress >= 1) {
      progress = 1;
      activeImage = transitionImage;
      transitionImage = null;
      isAnimating = false;
    }
    material.uniforms.uProgress.value = progress;
  }
}

function createThumbnails() {
  const thumbsContainer = document.getElementById("thumbnails");
  imagesThumbnail.forEach((img, idx) => {
    const thumb = document.createElement("div");
    thumb.className = "thumbnail" + (idx === activeImage ? " active" : "");

    const thumbnailImg = document.createElement("img");
    thumbnailImg.src = img.url;
    thumbnailImg.alt = img.title;
    thumb.appendChild(thumbnailImg);

    const frame = document.createElement("div");
    frame.className = "frame";
    thumb.appendChild(frame);

    thumb.addEventListener("click", () => handleThumbnailClick(idx));

    thumbsContainer.appendChild(thumb);
  });
}

function handleThumbnailClick(index) {
  if (index === activeImage || isAnimating) return;
  transitionImage = index;
  progress = 0;
  isAnimating = true;

  const thumbs = document.querySelectorAll(".thumbnail");
  thumbs.forEach((t, i) => {
    t.classList.remove("active");
    if (i === index) t.classList.add("active");
  });
}

document.addEventListener("DOMContentLoaded", init);