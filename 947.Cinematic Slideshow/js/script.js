import * as THREE from "https://esm.sh/three";
import { Pane } from "https://cdn.skypack.dev/tweakpane@4.0.4";

const preloaderStyle = document.createElement("style");
preloaderStyle.textContent = `
.image-slider, [data-image-slider-init] {
  opacity: 0;
  transition: opacity 1.5s ease-in;
  pointer-events: none;
}

.image-slider.loaded, [data-image-slider-init].loaded {
  opacity: 1;
  pointer-events: auto;
}
`;
document.head.appendChild(preloaderStyle);

function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function hexToRgb(hex) {
  if (hex.startsWith("#")) {
    return [
      Number.parseInt(hex.slice(1, 3), 16),
      Number.parseInt(hex.slice(3, 5), 16),
      Number.parseInt(hex.slice(5, 7), 16)
    ];
  }
  const match = hex.match(/\d+/g);
  return match
    ? [
        Number.parseInt(match[0]),
        Number.parseInt(match[1]),
        Number.parseInt(match[2])
      ]
    : [255, 255, 255];
}

function interpolateColor(color1, color2, t, opacity = 1) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const r = Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * t);
  const g = Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * t);
  const b = Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * t);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

class SliderLoadingManager {
  constructor() {
    this.overlay = null;
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    this.startTime = null;
    this.duration = 3000; // 3 seconds
    this.createLoadingScreen();
  }

  createLoadingScreen() {
    this.overlay = document.createElement("div");
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #000000;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;

    // Create canvas for Line Pulse Wave animation
    this.canvas = document.createElement("canvas");
    this.canvas.width = 300;
    this.canvas.height = 300;

    this.ctx = this.canvas.getContext("2d");
    this.overlay.appendChild(this.canvas);
    document.body.appendChild(this.overlay);

    // Start the Line Pulse Wave animation
    this.startAnimation();
  }

  startAnimation() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    let time = 0;
    let lastTime = 0;

    const dotRings = [
      { radius: 20, count: 8 },
      { radius: 35, count: 12 },
      { radius: 50, count: 16 },
      { radius: 65, count: 20 },
      { radius: 80, count: 24 }
    ];

    // Red color scheme
    const colors = {
      primary: "#ff0000",
      accent: "#ff6666"
    };

    const animate = (timestamp) => {
      if (!this.startTime) this.startTime = timestamp;

      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      time += deltaTime * 0.001;

      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw center dot
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
      const rgb = hexToRgb(colors.primary);
      this.ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.9)`;
      this.ctx.fill();

      // Draw Line Pulse Wave animation
      dotRings.forEach((ring, ringIndex) => {
        for (let i = 0; i < ring.count; i++) {
          const angle = (i / ring.count) * Math.PI * 2;
          const radiusPulse = Math.sin(time * 2 - ringIndex * 0.4) * 3;
          const x = centerX + Math.cos(angle) * (ring.radius + radiusPulse);
          const y = centerY + Math.sin(angle) * (ring.radius + radiusPulse);

          const opacityWave =
            0.4 + Math.sin(time * 2 - ringIndex * 0.4 + i * 0.2) * 0.6;
          const isActive = Math.sin(time * 2 - ringIndex * 0.4 + i * 0.2) > 0.6;

          // Draw line from center to point
          this.ctx.beginPath();
          this.ctx.moveTo(centerX, centerY);
          this.ctx.lineTo(x, y);
          this.ctx.lineWidth = 0.8;

          if (isActive) {
            const accentRgb = hexToRgb(colors.accent);
            this.ctx.strokeStyle = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${
              accentRgb[2]
            }, ${opacityWave * 0.7})`;
          } else {
            const primaryRgb = hexToRgb(colors.primary);
            this.ctx.strokeStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${
              primaryRgb[2]
            }, ${opacityWave * 0.5})`;
          }
          this.ctx.stroke();

          // Draw dot at the end of the line
          this.ctx.beginPath();
          this.ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          if (isActive) {
            const accentRgb = hexToRgb(colors.accent);
            this.ctx.fillStyle = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${opacityWave})`;
          } else {
            const primaryRgb = hexToRgb(colors.primary);
            this.ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, ${opacityWave})`;
          }
          this.ctx.fill();
        }
      });

      // Check if we should complete the loading
      if (timestamp - this.startTime >= this.duration) {
        this.complete();
        return;
      }

      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  complete() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.overlay) {
      this.overlay.style.opacity = "0";
      this.overlay.style.transition = "opacity 0.8s ease";
      setTimeout(() => {
        this.overlay?.remove();
        // Start the main slider with fade-in effect
        initSliderAfterPreloader();

        // Fade in slider content after it's ready
        setTimeout(() => {
          const sliders = document.querySelectorAll("[data-image-slider-init]");
          sliders.forEach((slider) => {
            slider.classList.add("loaded");
          });
        }, 500);
      }, 800);
    }
  }
}

let sliderInitialized = false;

function initImageSlider() {
  // This will be called after preloader completes
  if (sliderInitialized) return;
  sliderInitialized = true;

  const sliders = document.querySelectorAll("[data-image-slider-init]");
  sliders.forEach((slider) => {
    const imageCollection = [
      "https://assets.codepen.io/7558/horror-01.jpg",
      "https://assets.codepen.io/7558/horror-02.jpg",
      "https://assets.codepen.io/7558/horror-03.jpg",
      "https://assets.codepen.io/7558/horror-04.jpg",
      "https://assets.codepen.io/7558/horror-05.jpg"
    ];

    const slideData = [
      {
        title: "Awakening Abyss",
        description: "Eldritch Emergence",
        number: "∅1",
        paragraphLines: [
          "Archived VHS documentary footage captures the moment",
          "an ancient cosmic entity ruptures frozen silence."
        ],
        prompt:
          "Extreme footage of icy Cthulhu-like horror rising out of a shattering ice sinkhole. VHS dystopian documentary style, eerie retro science fiction, dark future photography fused with 3D Zdzislaw Beksinski surrealism. Downward vertigo angle, madness, haunted atmosphere, static, glitches, and digital noise. Saturated, vibrant colors with cold blue highlights and fractured light.",
        caption: "Eldritch emergence in cracked ice"
      },
      {
        title: "Fractured Signal",
        description: "Glitch Documentary",
        number: "∅2",
        paragraphLines: [
          "The broadcast distorts as forbidden knowledge leaks",
          "through corrupted frames and spectral interference."
        ],
        prompt:
          "Glitch-heavy VHS transmission of a forbidden signal, blending cosmic horror iconography with retro-futuristic decay. Strange symbols bleeding through static, warped depths suggesting an otherworldly intelligence. Heavy digital noise, color aberrations, and surreal background shapes borrowing from Beksinski's dreamlike textures. Sense of paranoia and collapsing reality.",
        caption: "Corrupted broadcast of the unknown"
      },
      {
        title: "Echoes of the Deep",
        description: "Haunted Vision",
        number: "∅3",
        paragraphLines: [
          "Submerged memories resurface in spectral echoes,",
          "reminding viewers that the abyss remembers."
        ],
        prompt:
          "Eerie underwater surrealism showing the slow emergence of a drowned cosmic entity, lit by dying neon and flickering VHS artifacts. Documentary-style overlay with timestamps, phantom reflections, and faint, impossible geometry. Atmospheric fog, subtle demonic undertones, and a sense that the depths are watching back.",
        caption: "Submerged cosmic remembrance"
      },
      {
        title: "Glitching Sanctum",
        description: "Digital Cultifacts",
        number: "∅4",
        paragraphLines: [
          "A sacred data temple collapses into noise,",
          "its ritual code leaking forbidden patterns."
        ],
        prompt:
          "Dark future interior of a collapsing digital shrine, where eldritch runes are rendered as corrupted code. Mixed media: 3D Beksinski-inspired architecture dissolving into pixel shards, VHS tracking errors tearing the scene, and occult imagery flickering in neon. Vertigo-inducing perspective, heavy contrast between shadow and glitch-lit form.",
        caption: "Ritual code corruption"
      },
      {
        title: "Frozen Leviathan",
        description: "Apocalyptic Witness",
        number: "∅5",
        paragraphLines: [
          "The last frame holds the frozen titan—half-buried,",
          "its silence a prophecy of an unraveling world."
        ],
        prompt:
          "Dystopian aftermath shot of a gigantic eldritch leviathan encased in fractured ice, seen through a damaged documentary lens. Grainy VHS overlay, color bleeding, and subtle animation glitches hinting at latent motion. Sky warped with surreal auroras; the scene balances frozen stillness with impending doom.",
        caption: "Stilled titanic omen"
      }
    ];

    // Enhanced configuration with all settings including Analog Decay
    const config = {
      totalImages: imageCollection.length,
      transitionDuration: 1.8,
      scrollThrottleDelay: 1000,
      touchThreshold: 10,
      // Current state
      currentEffect: "datamosh",
      currentEffectPreset: "Default",
      // Global settings that affect all effects
      globalIntensity: 1.0,
      speedMultiplier: 1.0,
      colorShiftAmount: 0.3,
      distortionStrength: 1.0,
      noiseLevel: 0.5,
      // Effect-specific settings
      datamoshBlockSize: 1.0,
      datamoshCorruptionFreq: 1.0,
      datamoshQuantization: 1.0,
      datamoshDisplacement: 1.0,
      datamoshTemporal: 1.0,
      pixelSortDirection: 0.5,
      pixelSortThreshold: 1.0,
      pixelSortBandWidth: 1.0,
      pixelSortSeparation: 1.0,
      pixelSortSensitivity: 1.0,
      staticDensity: 1.0,
      staticWaveSpeed: 1.0,
      staticAnalogNoise: 1.0,
      staticChannelShift: 1.0,
      staticFlicker: 1.0,
      sweepWidth: 1.0,
      sweepLayers: 1.0,
      sweepChromaticAberration: 1.0,
      sweepEdgeGlow: 1.0,
      sweepFadeTiming: 1.0,
      wipeAngle: 0.0,
      wipeAberrationStrength: 1.0,
      wipeEdgeWidth: 1.0,
      wipeColorBleeding: 1.0,
      wipeTransitionCurve: 1.0,
      // Analog Decay settings
      analogGrain: 1.0,
      analogBleeding: 1.0,
      analogVSync: 1.0,
      analogScanlines: 1.0,
      analogVignette: 1.0,
      analogJitter: 1.0,
      analogChroma: 1.0
    };

    // Effect presets including Analog Decay
    const effectPresets = {
      datamosh: {
        Subtle: {
          datamoshBlockSize: 1.5,
          datamoshCorruptionFreq: 0.6,
          datamoshQuantization: 0.4,
          datamoshDisplacement: 0.3,
          datamoshTemporal: 0.8
        },
        Default: {
          datamoshBlockSize: 1.0,
          datamoshCorruptionFreq: 1.0,
          datamoshQuantization: 1.0,
          datamoshDisplacement: 1.0,
          datamoshTemporal: 1.0
        },
        Intense: {
          datamoshBlockSize: 0.5,
          datamoshCorruptionFreq: 1.8,
          datamoshQuantization: 1.6,
          datamoshDisplacement: 2.0,
          datamoshTemporal: 1.4
        },
        Minimal: {
          datamoshBlockSize: 2.0,
          datamoshCorruptionFreq: 0.3,
          datamoshQuantization: 0.2,
          datamoshDisplacement: 0.1,
          datamoshTemporal: 0.5
        }
      },
      pixelSort: {
        Gentle: {
          pixelSortDirection: 0.2,
          pixelSortThreshold: 0.6,
          pixelSortBandWidth: 1.4,
          pixelSortSeparation: 0.5,
          pixelSortSensitivity: 0.7
        },
        Default: {
          pixelSortDirection: 0.5,
          pixelSortThreshold: 1.0,
          pixelSortBandWidth: 1.0,
          pixelSortSeparation: 1.0,
          pixelSortSensitivity: 1.0
        },
        Chaos: {
          pixelSortDirection: 0.8,
          pixelSortThreshold: 1.5,
          pixelSortBandWidth: 0.6,
          pixelSortSeparation: 1.8,
          pixelSortSensitivity: 1.4
        },
        Ordered: {
          pixelSortDirection: 0.0,
          pixelSortThreshold: 0.8,
          pixelSortBandWidth: 1.8,
          pixelSortSeparation: 0.3,
          pixelSortSensitivity: 0.9
        }
      },
      digitalStatic: {
        Soft: {
          staticDensity: 0.6,
          staticWaveSpeed: 0.7,
          staticAnalogNoise: 0.5,
          staticChannelShift: 0.4,
          staticFlicker: 0.3
        },
        Default: {
          staticDensity: 1.0,
          staticWaveSpeed: 1.0,
          staticAnalogNoise: 1.0,
          staticChannelShift: 1.0,
          staticFlicker: 1.0
        },
        Storm: {
          staticDensity: 1.7,
          staticWaveSpeed: 2.0,
          staticAnalogNoise: 1.6,
          staticChannelShift: 1.8,
          staticFlicker: 1.5
        },
        Vintage: {
          staticDensity: 0.8,
          staticWaveSpeed: 0.4,
          staticAnalogNoise: 1.3,
          staticChannelShift: 0.2,
          staticFlicker: 0.8
        }
      },
      staticSweep: {
        Clean: {
          sweepWidth: 1.2,
          sweepLayers: 0.7,
          sweepChromaticAberration: 0.6,
          sweepEdgeGlow: 1.1,
          sweepFadeTiming: 0.8
        },
        Default: {
          sweepWidth: 1.0,
          sweepLayers: 1.0,
          sweepChromaticAberration: 1.0,
          sweepEdgeGlow: 1.0,
          sweepFadeTiming: 1.0
        },
        Brutal: {
          sweepWidth: 0.7,
          sweepLayers: 1.8,
          sweepChromaticAberration: 1.7,
          sweepEdgeGlow: 0.9,
          sweepFadeTiming: 1.5
        },
        Smooth: {
          sweepWidth: 1.5,
          sweepLayers: 0.5,
          sweepChromaticAberration: 0.4,
          sweepEdgeGlow: 1.3,
          sweepFadeTiming: 0.6
        }
      },
      glitchWipe: {
        Smooth: {
          wipeAngle: 15.0,
          wipeAberrationStrength: 0.6,
          wipeEdgeWidth: 1.3,
          wipeColorBleeding: 0.5,
          wipeTransitionCurve: 0.8
        },
        Default: {
          wipeAngle: 0.0,
          wipeAberrationStrength: 1.0,
          wipeEdgeWidth: 1.0,
          wipeColorBleeding: 1.0,
          wipeTransitionCurve: 1.0
        },
        Aggressive: {
          wipeAngle: -25.0,
          wipeAberrationStrength: 1.8,
          wipeEdgeWidth: 0.7,
          wipeColorBleeding: 1.6,
          wipeTransitionCurve: 1.4
        },
        Diagonal: {
          wipeAngle: 35.0,
          wipeAberrationStrength: 1.2,
          wipeEdgeWidth: 0.9,
          wipeColorBleeding: 1.1,
          wipeTransitionCurve: 1.1
        }
      },
      analogDecay: {
        Vintage: {
          analogGrain: 0.7,
          analogBleeding: 0.5,
          analogVSync: 0.3,
          analogScanlines: 0.8,
          analogVignette: 1.2,
          analogJitter: 0.4,
          analogChroma: 0.6
        },
        Default: {
          analogGrain: 1.0,
          analogBleeding: 1.0,
          analogVSync: 1.0,
          analogScanlines: 1.0,
          analogVignette: 1.0,
          analogJitter: 1.0,
          analogChroma: 1.0
        },
        Corrupted: {
          analogGrain: 1.8,
          analogBleeding: 1.6,
          analogVSync: 2.0,
          analogScanlines: 1.4,
          analogVignette: 0.8,
          analogJitter: 1.8,
          analogChroma: 1.5
        },
        Minimal: {
          analogGrain: 0.3,
          analogBleeding: 0.2,
          analogVSync: 0.1,
          analogScanlines: 0.5,
          analogVignette: 1.5,
          analogJitter: 0.2,
          analogChroma: 0.3
        }
      }
    };

    let state = {
      currentImageIndex: 0,
      isTransitioning: false,
      scrollingEnabled: true,
      lastScrollTimestamp: 0,
      touchStartPosition: 0,
      isTouchActive: false,
      // WebGL state
      renderer: null,
      scene: null,
      camera: null,
      shaderMaterial: null,
      slideTextures: [],
      texturesLoaded: false,
      startTime: Date.now()
    };

    // Tweakpane state
    let pane = null;
    let effectFolders = {};
    let currentEffectFolder = null;
    let isApplyingPreset = false;

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D uTexture1;
      uniform sampler2D uTexture2;
      uniform float uProgress;
      uniform vec2 uResolution;
      uniform vec2 uTexture1Size;
      uniform vec2 uTexture2Size;
      uniform float uTime;
      uniform int uEffectType;
      
      // Enhanced settings uniforms
      uniform float uGlobalIntensity;
      uniform float uSpeedMultiplier;
      uniform float uColorShiftAmount;
      uniform float uDistortionStrength;
      uniform float uNoiseLevel;
      
      // Datamosh uniforms
      uniform float uDatamoshBlockSize;
      uniform float uDatamoshCorruptionFreq;
      uniform float uDatamoshQuantization;
      uniform float uDatamoshDisplacement;
      uniform float uDatamoshTemporal;
      
      // Pixel Sort uniforms
      uniform float uPixelSortDirection;
      uniform float uPixelSortThreshold;
      uniform float uPixelSortBandWidth;
      uniform float uPixelSortSeparation;
      uniform float uPixelSortSensitivity;
      
      // Digital Static uniforms
      uniform float uStaticDensity;
      uniform float uStaticWaveSpeed;
      uniform float uStaticAnalogNoise;
      uniform float uStaticChannelShift;
      uniform float uStaticFlicker;
      
      // Static Sweep uniforms
      uniform float uSweepWidth;
      uniform float uSweepLayers;
      uniform float uSweepChromaticAberration;
      uniform float uSweepEdgeGlow;
      uniform float uSweepFadeTiming;
      
      // Glitch Wipe uniforms
      uniform float uWipeAngle;
      uniform float uWipeAberrationStrength;
      uniform float uWipeEdgeWidth;
      uniform float uWipeColorBleeding;
      uniform float uWipeTransitionCurve;
      
      // Analog Decay uniforms
      uniform float uAnalogGrain;
      uniform float uAnalogBleeding;
      uniform float uAnalogVSync;
      uniform float uAnalogDropout;
      uniform float uAnalogScanlines;
      uniform float uAnalogVignette;
      uniform float uAnalogJitter;
      uniform float uAnalogChroma;
      
      varying vec2 vUv;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      float random(float x) {
        return fract(sin(x) * 43758.5453123);
      }

      vec2 getCoverUV(vec2 uv, vec2 textureSize) {
        vec2 s = uResolution / textureSize;
        float scale = max(s.x, s.y);
        vec2 scaledSize = textureSize * scale;
        vec2 offset = (uResolution - scaledSize) * 0.5;
        return (uv * uResolution - offset) / scaledSize;
      }

      vec4 sampleTexture(sampler2D tex, vec2 uv, vec2 texSize) {
        vec2 coverUV = getCoverUV(uv, texSize);
        coverUV = clamp(coverUV, 0.0, 1.0);
        return texture2D(tex, coverUV);
      }

      vec4 applyWhiteGlitchOverlay(vec4 color, vec2 uv, float intensity, float effectType) {
        float time = uTime * uSpeedMultiplier * 2.0;
        
        float glitchSize = 1500.0;
        vec2 glitchUV = floor(uv * glitchSize) / glitchSize;
        float glitchRandom = random(glitchUV + floor(time * 12.0));
        
        float whiteGlitch = step(0.98, glitchRandom) * uNoiseLevel;
        
        float fineNoise = random(uv * 3000.0 + time * 0.5);
        float whiteNoise = step(0.995, fineNoise) * uNoiseLevel;
        
        float scanlineGlitch = 0.0;
        float scanY = floor(uv.y * 800.0);
        float scanRandom = random(vec2(scanY, floor(time * 8.0)));
        if (scanRandom > 0.99) {
          float scanlineNoise = random(uv * vec2(2000.0, 1.0) + time);
          scanlineGlitch = step(0.7, scanlineNoise) * 0.3 * uNoiseLevel;
        }
        
        float glitchIntensity = 0.4 * uGlobalIntensity;
        
        float totalWhiteGlitch = (whiteGlitch + whiteNoise + scanlineGlitch) * glitchIntensity * intensity;
        
        vec3 result = color.rgb;
        result = mix(result, vec3(1.0), totalWhiteGlitch * 0.6);
        
        float grain = (random(uv * 2500.0 + time * 0.1) - 0.5) * 0.03 * uNoiseLevel;
        result += vec3(grain) * glitchIntensity * intensity;
        
        return vec4(result, color.a);
      }

      // Enhanced Datamosh Effect
      vec4 datamoshEffect(vec2 uv, float progress) {
        vec4 img1 = sampleTexture(uTexture1, uv, uTexture1Size);
        vec4 img2 = sampleTexture(uTexture2, uv, uTexture2Size);
        
        float time = uTime * uSpeedMultiplier * 2.0 * uDatamoshTemporal;
        
        float corruptionIntensity;
        if (progress < 0.3) {
          corruptionIntensity = smoothstep(0.0, 0.3, progress);
        } else if (progress < 0.7) {
          corruptionIntensity = 1.0;
        } else {
          corruptionIntensity = 1.0 - smoothstep(0.7, 1.0, progress);
        }
        
        vec2 blockSize = vec2(32.0, 24.0) * uDatamoshBlockSize;
        vec2 blockUV = floor(uv * blockSize) / blockSize;
        float blockRand = random(blockUV);
        
        float corruptionThreshold = 1.0 - corruptionIntensity * 1.4 * uDatamoshCorruptionFreq;
        float isCorrupted = step(corruptionThreshold, blockRand) * corruptionIntensity;
        
        vec2 distortion = vec2(
          sin(blockRand * 6.28 + time * 3.0) * 0.075,
          cos(blockRand * 4.71 + time * 2.5) * 0.06
        ) * isCorrupted * uDatamoshDisplacement * uDistortionStrength;
        
        vec4 sourceImg = mix(img2, img1, step(progress, 0.5));
        vec4 corruptedImg;
        if (progress < 0.5) {
          corruptedImg = sampleTexture(uTexture1, uv + distortion, uTexture1Size);
        } else {
          corruptedImg = sampleTexture(uTexture2, uv + distortion, uTexture2Size);
        }
        
        if (isCorrupted > 0.1) {
          float colorCorrupt = random(blockUV.x + time * 0.1) * uColorShiftAmount;
          if (colorCorrupt < 0.3) {
            corruptedImg.rgb = corruptedImg.gbr;
          } else if (colorCorrupt < 0.6) {
            corruptedImg.rgb = corruptedImg.brg;
          }
          
          float quantLevels = 6.0 / uDatamoshQuantization;
          corruptedImg.rgb = floor(corruptedImg.rgb * quantLevels) / quantLevels;
        }
        
        vec4 result = mix(sourceImg, corruptedImg, isCorrupted);
        
        float finalBlend = smoothstep(0.0, 1.0, progress);
        if (corruptionIntensity < 0.1) {
          result = mix(img1, img2, finalBlend);
        }
        
        result = applyWhiteGlitchOverlay(result, uv, corruptionIntensity * 0.8 * uGlobalIntensity, 0.0);
        
        return result;
      }

      // Enhanced Pixel Sort Effect
      vec4 pixelSortEffect(vec2 uv, float progress) {
        vec4 img1 = sampleTexture(uTexture1, uv, uTexture1Size);
        vec4 img2 = sampleTexture(uTexture2, uv, uTexture2Size);
        
        float time = uTime * uSpeedMultiplier * 1.5;
        
        float sortIntensity;
        if (progress < 0.2) {
          sortIntensity = smoothstep(0.0, 0.2, progress);
        } else if (progress < 0.8) {
          sortIntensity = 1.0;
        } else {
          sortIntensity = 1.0 - smoothstep(0.8, 1.0, progress);
        }
        
        float bandHeight = 0.08 * uPixelSortBandWidth;
        float bandIndex = floor(uv.y / bandHeight);
        float bandRandom = random(bandIndex + floor(time * 0.5));
        
        float sortThreshold = 1.0 - sortIntensity * uPixelSortThreshold;
        float shouldSort = step(sortThreshold, bandRandom);
        
        float imageMorphProgress = smoothstep(0.0, 1.0, progress);
        vec4 baseImg = mix(img1, img2, imageMorphProgress);
        
        vec2 sortedUV = uv;
        vec4 result = baseImg;
        
        if (shouldSort > 0.5 && sortIntensity > 0.1) {
          vec4 sortingSample1 = sampleTexture(uTexture1, uv, uTexture1Size);
          vec4 sortingSample2 = sampleTexture(uTexture2, uv, uTexture2Size);
          vec4 sortingSample = mix(sortingSample1, sortingSample2, imageMorphProgress);
          
          float brightness = dot(sortingSample.rgb, vec3(0.299, 0.587, 0.114)) * uPixelSortSensitivity;
          
          float sortDirection = mix(-1.0, 1.0, uPixelSortDirection);
          float sortOffset = (brightness - 0.5) * 0.25 * sortIntensity * sortDirection * uDistortionStrength;
          sortOffset += sin(uv.y * 15.0 + time * 2.0) * 0.08 * sortIntensity;
          
          sortedUV.x += sortOffset;
          
          vec4 sortedImg1 = sampleTexture(uTexture1, sortedUV, uTexture1Size);
          vec4 sortedImg2 = sampleTexture(uTexture2, sortedUV, uTexture2Size);
          vec4 sortedImg = mix(sortedImg1, sortedImg2, imageMorphProgress);
          
          float separation = 0.015 * sortIntensity * uPixelSortSeparation;
          
          vec4 sample1_r = sampleTexture(uTexture1, sortedUV + vec2(separation, 0.0), uTexture1Size);
          vec4 sample2_r = sampleTexture(uTexture2, sortedUV + vec2(separation, 0.0), uTexture2Size);
          float r = mix(sample1_r.r, sample2_r.r, imageMorphProgress);
          
          vec4 sample1_g = sampleTexture(uTexture1, sortedUV, uTexture1Size);
          vec4 sample2_g = sampleTexture(uTexture2, sortedUV, uTexture2Size);
          float g = mix(sample1_g.g, sample2_g.g, imageMorphProgress);
          
          vec4 sample1_b = sampleTexture(uTexture1, sortedUV - vec2(separation, 0.0), uTexture1Size);
          vec4 sample2_b = sampleTexture(uTexture2, sortedUV - vec2(separation, 0.0), uTexture2Size);
          float b = mix(sample1_b.b, sample2_b.b, imageMorphProgress);
          
          sortedImg = vec4(r, g, b, 1.0);
          
          result = sortedImg;
        }
        
        if (sortIntensity < 0.1) {
          result = mix(img1, img2, imageMorphProgress);
        }
        
        result = applyWhiteGlitchOverlay(result, uv, sortIntensity * 0.6 * uGlobalIntensity, 1.0);
        
        return result;
      }

      // Enhanced Digital Static Effect
      vec4 digitalStaticEffect(vec2 uv, float progress) {
        vec4 img1 = sampleTexture(uTexture1, uv, uTexture1Size);
        vec4 img2 = sampleTexture(uTexture2, uv, uTexture2Size);
        
        float time = uTime * uSpeedMultiplier * 3.0 * uStaticWaveSpeed;
        
        float wavePos = progress * 1.4 - 0.2;
        float waveWidth = 0.3;
        float distanceFromWave = abs(uv.y - wavePos);
        float staticIntensity = 1.0 - smoothstep(0.0, waveWidth, distanceFromWave);
        
        float noise = random(uv * uResolution.xy + time * 0.1) * uStaticDensity;
        float staticMask = step(0.3, noise) * staticIntensity;
        
        float analogNoise = random(uv * 500.0 + time * 0.05) - 0.5;
        analogNoise *= staticIntensity * uStaticAnalogNoise;
        
        vec4 staticImg = img2;
        if (staticIntensity > 0.1) {
          staticImg.rgb = mix(staticImg.rgb, vec3(noise), staticMask * 0.8);
          staticImg.rgb += analogNoise * 0.3;
          
          float shift = sin(time + uv.y * 10.0) * 0.02 * staticIntensity * uStaticChannelShift;
          float r = sampleTexture(uTexture2, uv + vec2(shift, 0.0), uTexture2Size).r;
          float g = sampleTexture(uTexture2, uv, uTexture2Size).g;
          float b = sampleTexture(uTexture2, uv - vec2(shift, 0.0), uTexture2Size).b;
          staticImg = vec4(r, g, b, 1.0);
          
          // Gradually fade flicker based on wave position and intensity
          float flickerFade = staticIntensity * smoothstep(0.8, 0.2, progress);
          float flicker = sin(time * 30.0) * 0.1 * uStaticFlicker * flickerFade;
          staticImg.rgb *= (1.0 + flicker);
        }
        
        float reveal = step(uv.y, wavePos + waveWidth * 0.5);
        vec4 result = mix(img1, staticImg, reveal);
        
        result = applyWhiteGlitchOverlay(result, uv, staticIntensity * uGlobalIntensity, 2.0);
        
        return result;
      }

      // Enhanced Static Sweep Effect
      vec4 staticSweepEffect(vec2 uv, float progress) {
        vec4 img1 = sampleTexture(uTexture1, uv, uTexture1Size);
        vec4 img2 = sampleTexture(uTexture2, uv, uTexture2Size);
        
        if (progress < 0.01 || progress > 0.99) {
          return mix(img1, img2, smoothstep(0.0, 1.0, progress));
        }
        
        float time = uTime * uSpeedMultiplier * 2.5;
        
        float sweepPos = progress * 1.4 - 0.2;
        float isRevealed = step(uv.x, sweepPos);
        
        float distanceFromSweep = abs(uv.x - sweepPos);
        float effectZoneWidth = 0.25 * uSweepWidth;
        
        float adjustedProgress = pow(progress, uSweepFadeTiming);
        
        float masterIntensity;
        if (adjustedProgress < 0.15) {
          masterIntensity = smoothstep(0.0, 0.15, adjustedProgress) * 0.4;
        } else if (adjustedProgress < 0.35) {
          masterIntensity = 0.4 + smoothstep(0.15, 0.35, adjustedProgress) * 0.5;
        } else if (adjustedProgress < 0.65) {
          masterIntensity = 0.9 + sin(adjustedProgress * 20.0) * 0.1 * uSweepLayers;
        } else if (adjustedProgress < 0.85) {
          masterIntensity = 0.9 - smoothstep(0.65, 0.85, adjustedProgress) * 0.6;
        } else {
          masterIntensity = 0.3 - smoothstep(0.85, 1.0, adjustedProgress) * 0.25;
        }
        
        float baseEffectStrength = (1.0 - smoothstep(0.0, effectZoneWidth, distanceFromSweep)) * masterIntensity * uGlobalIntensity;
        
        float staticNoise1 = random(uv * 120.0 * uSweepLayers + time * 0.8);
        float staticNoise2 = random(uv * 200.0 + time * 1.3);
        float staticNoise3 = random(uv * 80.0 + time * 0.5);
        float combinedStatic = mix(mix(staticNoise1, staticNoise2, 0.6), staticNoise3, 0.3);
        
        float staticMask = step(0.3, combinedStatic) * baseEffectStrength;
        
        float analogNoise = (random(uv * 300.0 + time * 0.1) - 0.5) * 2.0;
        analogNoise *= random(vec2(time * 0.02)) * baseEffectStrength;
        
        float rgbSeparationAmount = 0.04 * baseEffectStrength * uSweepChromaticAberration;
        float rgbTimeOffset = time * 3.0 + uv.y * 12.0;
        
        vec2 rgbOffset1 = vec2(sin(rgbTimeOffset) * rgbSeparationAmount, 0.0);
        vec2 rgbOffset2 = vec2(-sin(rgbTimeOffset * 1.3) * rgbSeparationAmount * 0.7, 0.0);
        vec2 rgbOffset3 = vec2(cos(rgbTimeOffset * 0.8) * rgbSeparationAmount * 0.5, 0.0);
        
        vec4 currentImg = mix(img1, img2, isRevealed);
        
        if (baseEffectStrength > 0.05) {
          float r, g, b;
          
          if (isRevealed > 0.5) {
            r = sampleTexture(uTexture2, uv + rgbOffset1, uTexture2Size).r;
            g = sampleTexture(uTexture2, uv + rgbOffset2, uTexture2Size).g;
            b = sampleTexture(uTexture2, uv + rgbOffset3, uTexture2Size).b;
          } else {
            r = sampleTexture(uTexture1, uv + rgbOffset1, uTexture1Size).r;
            g = sampleTexture(uTexture1, uv + rgbOffset2, uTexture1Size).g;
            b = sampleTexture(uTexture1, uv + rgbOffset3, uTexture1Size).b;
          }
          
          vec4 glitchedImg = vec4(r, g, b, 1.0);
          
          glitchedImg.rgb = mix(glitchedImg.rgb, vec3(combinedStatic), staticMask * 0.7);
          glitchedImg.rgb += vec3(analogNoise) * 0.25;
          
          float edgeGlow = 1.0 - smoothstep(0.0, 0.02, distanceFromSweep);
          glitchedImg.rgb += vec3(0.8, 0.4, 1.0) * edgeGlow * 0.5 * masterIntensity * uSweepEdgeGlow;
          
          currentImg = mix(currentImg, glitchedImg, baseEffectStrength);
        }
        
        currentImg = applyWhiteGlitchOverlay(currentImg, uv, masterIntensity * 1.2 * uGlobalIntensity, 3.0);
        
        return currentImg;
      }

      // Enhanced Glitch Wipe Effect
      vec4 glitchWipeEffect(vec2 uv, float progress) {
        vec4 img1 = sampleTexture(uTexture1, uv, uTexture1Size);
        vec4 img2 = sampleTexture(uTexture2, uv, uTexture2Size);
        
        if (progress < 0.01 || progress > 0.99) {
          return mix(img1, img2, smoothstep(0.0, 1.0, progress));
        }
        
        float time = uTime * uSpeedMultiplier * 2.0;
        
        vec2 wipeUV = uv;
        float angleRad = radians(uWipeAngle);
        mat2 rotation = mat2(cos(angleRad), -sin(angleRad), sin(angleRad), cos(angleRad));
        wipeUV = rotation * (wipeUV - 0.5) + 0.5;
        
        float curvedProgress = pow(progress, uWipeTransitionCurve);
        
        float wipePos = curvedProgress * 1.2 - 0.1;
        float wipeEdge = wipePos + sin(wipeUV.y * 20.0 + time) * 0.02;
        float isRevealed = step(wipeUV.x, wipeEdge);
        
        float distanceFromWipe = abs(wipeUV.x - wipeEdge);
        
        float caIntensity;
        if (curvedProgress < 0.2) {
          caIntensity = smoothstep(0.0, 0.2, curvedProgress);
        } else if (curvedProgress < 0.75) {
          caIntensity = 1.0;
        } else {
          caIntensity = 1.0 - smoothstep(0.75, 0.95, curvedProgress);
        }
        
        float caZone = (1.0 - smoothstep(0.0, 0.12 * uWipeEdgeWidth, distanceFromWipe)) * caIntensity * uGlobalIntensity;
        
        vec4 currentImg = mix(img1, img2, isRevealed);
        
        if (caZone > 0.05) {
          float baseShift = sin(time * 3.0 + wipeUV.y * 15.0) * 0.035 * caZone * uWipeAberrationStrength;
          float secondaryShift = cos(time * 2.0 + wipeUV.x * 10.0) * 0.02 * caZone;
          
          float totalShift = baseShift + secondaryShift;
          
          float bleeding = uWipeColorBleeding;
          
          float r, g, b;
          if (isRevealed > 0.5) {
            r = sampleTexture(uTexture2, uv + vec2(totalShift * 2.5 * bleeding, totalShift * 0.5), uTexture2Size).r;
            g = sampleTexture(uTexture2, uv + vec2(totalShift * 0.5, -totalShift * 0.3), uTexture2Size).g;
            b = sampleTexture(uTexture2, uv - vec2(totalShift * 2.0 * bleeding, totalShift * 0.7), uTexture2Size).b;
          } else {
            r = sampleTexture(uTexture1, uv + vec2(totalShift * 2.5 * bleeding, totalShift * 0.5), uTexture1Size).r;
            g = sampleTexture(uTexture1, uv + vec2(totalShift * 0.5, -totalShift * 0.3), uTexture1Size).g;
            b = sampleTexture(uTexture1, uv - vec2(totalShift * 2.0 * bleeding, totalShift * 0.7), uTexture1Size).b;
          }
          
          vec4 chromaticImg = vec4(r, g, b, 1.0);
          
          float edgeGlow = 1.0 - smoothstep(0.0, 0.015, distanceFromWipe);
          chromaticImg.rgb += vec3(1.0, 0.6, 0.9) * edgeGlow * 0.4 * caIntensity;
          
          float digitalNoise = random(uv * 200.0 + time * 0.1) * uNoiseLevel;
          chromaticImg.rgb += vec3(digitalNoise - 0.5) * 0.1 * caZone;
          
          currentImg = mix(currentImg, chromaticImg, caZone);
        }
        
        currentImg = applyWhiteGlitchOverlay(currentImg, uv, caIntensity * 0.9 * uGlobalIntensity, 4.0);
        
        return currentImg;
      }

      // NEW: Analog Decay Effect
      vec4 analogDecayEffect(vec2 uv, float progress) {
        vec4 img1 = sampleTexture(uTexture1, uv, uTexture1Size);
        vec4 img2 = sampleTexture(uTexture2, uv, uTexture2Size);
        
        float time = uTime * uSpeedMultiplier * 1.8;
        
        // Basic image transition
        float transitionMask = smoothstep(0.4, 0.6, progress + sin(uv.y * 8.0 + time) * 0.1);
        vec4 baseImg = mix(img1, img2, transitionMask);
        
        // Analog Jitter - temporal instability
        vec2 jitteredUV = uv;
        if (uAnalogJitter > 0.1) {
          float jitterAmount = (random(vec2(floor(time * 60.0))) - 0.5) * 0.003 * uAnalogJitter;
          jitteredUV.x += jitterAmount;
          jitteredUV.y += (random(vec2(floor(time * 30.0) + 1.0)) - 0.5) * 0.001 * uAnalogJitter;
        }
        
        // VHS-style vertical sync roll
        if (uAnalogVSync > 0.1) {
          float vsyncRoll = sin(time * 2.0 + uv.y * 100.0) * 0.02 * uAnalogVSync;
          float vsyncChance = step(0.95, random(vec2(floor(time * 4.0))));
          jitteredUV.y += vsyncRoll * vsyncChance;
        }
        
        vec4 currentImg = mix(baseImg, mix(
          sampleTexture(uTexture1, jitteredUV, uTexture1Size),
          sampleTexture(uTexture2, jitteredUV, uTexture2Size),
          transitionMask
        ), 0.8);
        
        // Film grain
        if (uAnalogGrain > 0.1) {
          float grain = (random(uv * 1500.0 + time * 0.1) - 0.5) * 0.15 * uAnalogGrain;
          currentImg.rgb += vec3(grain);
        }
        
        // Color bleeding/channel separation
        if (uAnalogBleeding > 0.1) {
          float bleedAmount = 0.008 * uAnalogBleeding;
          float offsetPhase = time * 1.5 + uv.y * 20.0;
          
          vec2 redOffset = vec2(sin(offsetPhase) * bleedAmount, 0.0);
          vec2 blueOffset = vec2(-sin(offsetPhase * 1.1) * bleedAmount * 0.8, 0.0);
          
          float r = mix(
            sampleTexture(uTexture1, jitteredUV + redOffset, uTexture1Size).r,
            sampleTexture(uTexture2, jitteredUV + redOffset, uTexture2Size).r,
            transitionMask
          );
          float g = currentImg.g;
          float b = mix(
            sampleTexture(uTexture1, jitteredUV + blueOffset, uTexture1Size).b,
            sampleTexture(uTexture2, jitteredUV + blueOffset, uTexture2Size).b,
            transitionMask
          );
          
          currentImg = vec4(r, g, b, 1.0);
        }
        
        // Scanlines
        if (uAnalogScanlines > 0.1) {
          float scanlinePattern = sin(uv.y * 800.0) * 0.5 + 0.5;
          float scanlineIntensity = 0.05 * uAnalogScanlines;
          currentImg.rgb *= (1.0 - scanlinePattern * scanlineIntensity);
        }
        
        // Random dropouts (signal loss areas)
        if (uAnalogDropout > 0.1) {
          float dropoutSize = 100.0;
          vec2 dropoutUV = floor(uv * dropoutSize) / dropoutSize;
          float dropoutRandom = random(dropoutUV + floor(time * 8.0));
          
          float dropoutThreshold = 1.0 - uAnalogDropout * 0.02;
          float isDropout = step(dropoutThreshold, dropoutRandom);
          
          if (isDropout > 0.5) {
            float dropoutNoise = random(uv * 500.0 + time);
            currentImg.rgb = mix(currentImg.rgb, vec3(dropoutNoise * 0.3), 0.8);
          }
        }
        
        // Chromatic aberration
        if (uAnalogChroma > 0.1) {
          float chromaAmount = 0.01 * uAnalogChroma;
          float chromaPhase = time * 0.5 + uv.x * 5.0;
          
          vec2 chromaOffset = vec2(cos(chromaPhase) * chromaAmount, sin(chromaPhase) * chromaAmount * 0.5);
          
          float r = mix(
            sampleTexture(uTexture1, jitteredUV + chromaOffset, uTexture1Size).r,
            sampleTexture(uTexture2, jitteredUV + chromaOffset, uTexture2Size).r,
            transitionMask
          );
          float g = currentImg.g;
          float b = mix(
            sampleTexture(uTexture1, jitteredUV - chromaOffset, uTexture1Size).b,
            sampleTexture(uTexture2, jitteredUV - chromaOffset, uTexture2Size).b,
            transitionMask
          );
          
          currentImg = vec4(r, g, b, 1.0);
        }
        
        // Vignetting
        if (uAnalogVignette > 0.1) {
          vec2 vignetteUV = (uv - 0.5) * 2.0;
          float vignette = 1.0 - dot(vignetteUV, vignetteUV) * 0.3 * uAnalogVignette;
          currentImg.rgb *= vignette;
        }
        
        // Final analog-style overlay
        currentImg = applyWhiteGlitchOverlay(currentImg, uv, 0.3 * uGlobalIntensity, 5.0);
        
        return currentImg;
      }

      void main() {
        if (uEffectType == 0) {
          gl_FragColor = datamoshEffect(vUv, uProgress);
        } else if (uEffectType == 1) {
          gl_FragColor = pixelSortEffect(vUv, uProgress);
        } else if (uEffectType == 2) {
          gl_FragColor = digitalStaticEffect(vUv, uProgress);
        } else if (uEffectType == 3) {
          gl_FragColor = staticSweepEffect(vUv, uProgress);
        } else if (uEffectType == 4) {
          gl_FragColor = glitchWipeEffect(vUv, uProgress);
        } else {
          gl_FragColor = analogDecayEffect(vUv, uProgress);
        }
      }
    `;

    function getEffectIndex(effectName) {
      const effectMap = {
        datamosh: 0,
        pixelSort: 1,
        digitalStatic: 2,
        staticSweep: 3,
        glitchWipe: 4,
        analogDecay: 5
      };
      return effectMap[effectName] || 0;
    }

    // Setup Tweakpane
    function setupPane() {
      pane = new Pane({
        title: "Glitch Slider Controls"
      });

      // General Settings
      const generalFolder = pane.addFolder({
        title: "General Settings"
      });

      generalFolder.addBinding(config, "globalIntensity", {
        label: "Global Intensity",
        min: 0.1,
        max: 2.0,
        step: 0.1
      });

      generalFolder.addBinding(config, "speedMultiplier", {
        label: "Speed Multiplier",
        min: 0.1,
        max: 3.0,
        step: 0.1
      });

      generalFolder.addBinding(config, "colorShiftAmount", {
        label: "Color Shift",
        min: 0.0,
        max: 2.0,
        step: 0.1
      });

      generalFolder.addBinding(config, "distortionStrength", {
        label: "Distortion",
        min: 0.1,
        max: 3.0,
        step: 0.1
      });

      generalFolder.addBinding(config, "noiseLevel", {
        label: "Noise Level",
        min: 0.0,
        max: 2.0,
        step: 0.1
      });

      // Timing controls
      const timingFolder = pane.addFolder({
        title: "Timing"
      });

      timingFolder.addBinding(config, "transitionDuration", {
        label: "Transition Duration",
        min: 0.5,
        max: 5.0,
        step: 0.1
      });

      // Effect Selection
      const effectFolder = pane.addFolder({
        title: "Effect Selection"
      });

      effectFolder.addBinding(config, "currentEffect", {
        label: "Effect Type",
        options: {
          Datamosh: "datamosh",
          "Pixel Sort": "pixelSort",
          "Digital Static": "digitalStatic",
          "Static Sweep": "staticSweep",
          "Glitch Wipe": "glitchWipe",
          "Analog Decay": "analogDecay"
        }
      });

      // Effect Presets
      const presetsFolder = pane.addFolder({
        title: "Effect Presets"
      });

      presetsFolder.addBinding(config, "currentEffectPreset", {
        label: "Preset",
        options: getPresetOptions(config.currentEffect)
      });

      // Effect Settings
      setupEffectFolders();

      // Set initial effect folder visibility
      updateEffectFolderVisibility(config.currentEffect);

      // Event handling
      pane.on("change", (event) => {
        if (isApplyingPreset) return;

        if (event.target.key === "currentEffect") {
          handleEffectChange(config.currentEffect);
        } else if (event.target.key === "currentEffectPreset") {
          applyEffectPreset(config.currentEffect, config.currentEffectPreset);
        } else {
          if (
            !isApplyingPreset &&
            !event.target.key.includes("currentEffect") &&
            !event.target.key.includes("global") &&
            !event.target.key.includes("Duration")
          ) {
            config.currentEffectPreset = "Custom";
            pane.refresh();
          }
          updateShaderUniforms();
        }
      });

      // Style and fix z-index
      setTimeout(() => {
        const paneElement = document.querySelector(".tp-dfwv");
        if (paneElement) {
          paneElement.style.position = "fixed";
          paneElement.style.top = "20px";
          paneElement.style.right = "20px";
          paneElement.style.zIndex = "99999";
          paneElement.style.visibility = "hidden"; // Use visibility instead of display
          paneElement.style.opacity = "0"; // Also set opacity to 0
        }
      }, 100);
    }

    function getPresetOptions(effectName) {
      if (effectPresets[effectName]) {
        const presets = effectPresets[effectName];
        const options = {};
        Object.keys(presets).forEach((key) => {
          options[key] = key;
        });
        options["Custom"] = "Custom";
        return options;
      }
      return {
        Default: "Default",
        Custom: "Custom"
      };
    }

    function setupEffectFolders() {
      // Datamosh folder
      effectFolders.datamosh = pane.addFolder({
        title: "Datamosh Settings"
      });
      effectFolders.datamosh.addBinding(config, "datamoshBlockSize", {
        label: "Block Size",
        min: 0.1,
        max: 3.0,
        step: 0.1
      });
      effectFolders.datamosh.addBinding(config, "datamoshCorruptionFreq", {
        label: "Corruption Freq",
        min: 0.1,
        max: 3.0,
        step: 0.1
      });
      effectFolders.datamosh.addBinding(config, "datamoshQuantization", {
        label: "Quantization",
        min: 0.1,
        max: 2.0,
        step: 0.1
      });
      effectFolders.datamosh.addBinding(config, "datamoshDisplacement", {
        label: "Displacement",
        min: 0.1,
        max: 3.0,
        step: 0.1
      });
      effectFolders.datamosh.addBinding(config, "datamoshTemporal", {
        label: "Temporal",
        min: 0.1,
        max: 2.0,
        step: 0.1
      });

      // Pixel Sort folder
      effectFolders.pixelSort = pane.addFolder({
        title: "Pixel Sort Settings"
      });
      effectFolders.pixelSort.addBinding(config, "pixelSortDirection", {
        label: "Direction",
        min: 0.0,
        max: 1.0,
        step: 0.1
      });
      effectFolders.pixelSort.addBinding(config, "pixelSortThreshold", {
        label: "Threshold",
        min: 0.1,
        max: 2.0,
        step: 0.1
      });
      effectFolders.pixelSort.addBinding(config, "pixelSortBandWidth", {
        label: "Band Width",
        min: 0.1,
        max: 3.0,
        step: 0.1
      });
      effectFolders.pixelSort.addBinding(config, "pixelSortSeparation", {
        label: "Separation",
        min: 0.1,
        max: 3.0,
        step: 0.1
      });
      effectFolders.pixelSort.addBinding(config, "pixelSortSensitivity", {
        label: "Sensitivity",
        min: 0.1,
        max: 2.0,
        step: 0.1
      });

      // Digital Static folder
      effectFolders.digitalStatic = pane.addFolder({
        title: "Digital Static Settings"
      });
      effectFolders.digitalStatic.addBinding(config, "staticDensity", {
        label: "Density",
        min: 0.1,
        max: 3.0,
        step: 0.1
      });
      effectFolders.digitalStatic.addBinding(config, "staticWaveSpeed", {
        label: "Wave Speed",
        min: 0.1,
        max: 3.0,
        step: 0.1
      });
      effectFolders.digitalStatic.addBinding(config, "staticAnalogNoise", {
        label: "Analog Noise",
        min: 0.1,
        max: 2.0,
        step: 0.1
      });
      effectFolders.digitalStatic.addBinding(config, "staticChannelShift", {
        label: "Channel Shift",
        min: 0.1,
        max: 2.0,
        step: 0.1
      });
      effectFolders.digitalStatic.addBinding(config, "staticFlicker", {
        label: "Flicker",
        min: 0.0,
        max: 2.0,
        step: 0.1
      });

      // Static Sweep folder
      effectFolders.staticSweep = pane.addFolder({
        title: "Static Sweep Settings"
      });
      effectFolders.staticSweep.addBinding(config, "sweepWidth", {
        label: "Width",
        min: 0.1,
        max: 3.0,
        step: 0.1
      });
      effectFolders.staticSweep.addBinding(config, "sweepLayers", {
        label: "Layers",
        min: 0.1,
        max: 3.0,
        step: 0.1
      });
      effectFolders.staticSweep.addBinding(config, "sweepChromaticAberration", {
        label: "Chromatic Aberration",
        min: 0.1,
        max: 3.0,
        step: 0.1
      });
      effectFolders.staticSweep.addBinding(config, "sweepEdgeGlow", {
        label: "Edge Glow",
        min: 0.0,
        max: 2.0,
        step: 0.1
      });
      effectFolders.staticSweep.addBinding(config, "sweepFadeTiming", {
        label: "Fade Timing",
        min: 0.1,
        max: 3.0,
        step: 0.1
      });

      // Glitch Wipe folder
      effectFolders.glitchWipe = pane.addFolder({
        title: "Glitch Wipe Settings"
      });
      effectFolders.glitchWipe.addBinding(config, "wipeAngle", {
        label: "Angle",
        min: -45.0,
        max: 45.0,
        step: 1.0
      });
      effectFolders.glitchWipe.addBinding(config, "wipeAberrationStrength", {
        label: "Aberration Strength",
        min: 0.1,
        max: 3.0,
        step: 0.1
      });
      effectFolders.glitchWipe.addBinding(config, "wipeEdgeWidth", {
        label: "Edge Width",
        min: 0.1,
        max: 3.0,
        step: 0.1
      });
      effectFolders.glitchWipe.addBinding(config, "wipeColorBleeding", {
        label: "Color Bleeding",
        min: 0.1,
        max: 3.0,
        step: 0.1
      });
      effectFolders.glitchWipe.addBinding(config, "wipeTransitionCurve", {
        label: "Transition Curve",
        min: 0.1,
        max: 3.0,
        step: 0.1
      });

      // NEW: Analog Decay folder
      effectFolders.analogDecay = pane.addFolder({
        title: "Analog Decay Settings"
      });
      effectFolders.analogDecay.addBinding(config, "analogGrain", {
        label: "Film Grain",
        min: 0.0,
        max: 3.0,
        step: 0.1
      });
      effectFolders.analogDecay.addBinding(config, "analogBleeding", {
        label: "Color Bleeding",
        min: 0.0,
        max: 3.0,
        step: 0.1
      });
      effectFolders.analogDecay.addBinding(config, "analogVSync", {
        label: "VSync Roll",
        min: 0.0,
        max: 3.0,
        step: 0.1
      });
      effectFolders.analogDecay.addBinding(config, "analogScanlines", {
        label: "Scanlines",
        min: 0.0,
        max: 3.0,
        step: 0.1
      });
      effectFolders.analogDecay.addBinding(config, "analogVignette", {
        label: "Vignetting",
        min: 0.0,
        max: 3.0,
        step: 0.1
      });
      effectFolders.analogDecay.addBinding(config, "analogJitter", {
        label: "Temporal Jitter",
        min: 0.0,
        max: 3.0,
        step: 0.1
      });
      effectFolders.analogDecay.addBinding(config, "analogChroma", {
        label: "Chromatic Aberration",
        min: 0.0,
        max: 3.0,
        step: 0.1
      });
    }

    function updateEffectFolderVisibility(currentEffect) {
      Object.keys(effectFolders).forEach((effectName) => {
        if (effectFolders[effectName]) {
          effectFolders[effectName].hidden = effectName !== currentEffect;
        }
      });
      currentEffectFolder = effectFolders[currentEffect];
    }

    function handleEffectChange(newEffect) {
      if (state.shaderMaterial) {
        state.shaderMaterial.uniforms.uEffectType.value = getEffectIndex(
          newEffect
        );
      }

      updateEffectFolderVisibility(newEffect);

      const presetsFolder = pane.children.find(
        (child) => child.title === "Effect Presets"
      );
      if (presetsFolder) {
        const oldBinding = presetsFolder.children.find(
          (child) => child.key === "currentEffectPreset"
        );
        if (oldBinding) {
          presetsFolder.remove(oldBinding);
        }

        presetsFolder.addBinding(config, "currentEffectPreset", {
          label: "Preset",
          options: getPresetOptions(newEffect)
        });
      }

      config.currentEffectPreset = "Default";
      applyEffectPreset(newEffect, "Default");
      pane.refresh();
    }

    function applyEffectPreset(effectName, presetName) {
      if (effectPresets[effectName] && effectPresets[effectName][presetName]) {
        isApplyingPreset = true;
        Object.assign(config, effectPresets[effectName][presetName]);
        updateShaderUniforms();
        pane.refresh();
        setTimeout(() => {
          isApplyingPreset = false;
        }, 100);
      }
    }

    function updateShaderUniforms() {
      if (!state.shaderMaterial) return;

      const uniforms = state.shaderMaterial.uniforms;

      // Global uniforms
      if (uniforms.uGlobalIntensity)
        uniforms.uGlobalIntensity.value = config.globalIntensity;
      if (uniforms.uSpeedMultiplier)
        uniforms.uSpeedMultiplier.value = config.speedMultiplier;
      if (uniforms.uColorShiftAmount)
        uniforms.uColorShiftAmount.value = config.colorShiftAmount;
      if (uniforms.uDistortionStrength)
        uniforms.uDistortionStrength.value = config.distortionStrength;
      if (uniforms.uNoiseLevel) uniforms.uNoiseLevel.value = config.noiseLevel;

      // Effect-specific uniforms
      if (uniforms.uDatamoshBlockSize)
        uniforms.uDatamoshBlockSize.value = config.datamoshBlockSize;
      if (uniforms.uDatamoshCorruptionFreq)
        uniforms.uDatamoshCorruptionFreq.value = config.datamoshCorruptionFreq;
      if (uniforms.uDatamoshQuantization)
        uniforms.uDatamoshQuantization.value = config.datamoshQuantization;
      if (uniforms.uDatamoshDisplacement)
        uniforms.uDatamoshDisplacement.value = config.datamoshDisplacement;
      if (uniforms.uDatamoshTemporal)
        uniforms.uDatamoshTemporal.value = config.datamoshTemporal;

      if (uniforms.uPixelSortDirection)
        uniforms.uPixelSortDirection.value = config.pixelSortDirection;
      if (uniforms.uPixelSortThreshold)
        uniforms.uPixelSortThreshold.value = config.pixelSortThreshold;
      if (uniforms.uPixelSortBandWidth)
        uniforms.uPixelSortBandWidth.value = config.pixelSortBandWidth;
      if (uniforms.uPixelSortSeparation)
        uniforms.uPixelSortSeparation.value = config.pixelSortSeparation;
      if (uniforms.uPixelSortSensitivity)
        uniforms.uPixelSortSensitivity.value = config.pixelSortSensitivity;

      if (uniforms.uStaticDensity)
        uniforms.uStaticDensity.value = config.staticDensity;
      if (uniforms.uStaticWaveSpeed)
        uniforms.uStaticWaveSpeed.value = config.staticWaveSpeed;
      if (uniforms.uStaticAnalogNoise)
        uniforms.uStaticAnalogNoise.value = config.staticAnalogNoise;
      if (uniforms.uStaticChannelShift)
        uniforms.uStaticChannelShift.value = config.staticChannelShift;
      if (uniforms.uStaticFlicker)
        uniforms.uStaticFlicker.value = config.staticFlicker;

      if (uniforms.uSweepWidth) uniforms.uSweepWidth.value = config.sweepWidth;
      if (uniforms.uSweepLayers)
        uniforms.uSweepLayers.value = config.sweepLayers;
      if (uniforms.uSweepChromaticAberration)
        uniforms.uSweepChromaticAberration.value =
          config.sweepChromaticAberration;
      if (uniforms.uSweepEdgeGlow)
        uniforms.uSweepEdgeGlow.value = config.sweepEdgeGlow;
      if (uniforms.uSweepFadeTiming)
        uniforms.uSweepFadeTiming.value = config.sweepFadeTiming;

      if (uniforms.uWipeAngle) uniforms.uWipeAngle.value = config.wipeAngle;
      if (uniforms.uWipeAberrationStrength)
        uniforms.uWipeAberrationStrength.value = config.wipeAberrationStrength;
      if (uniforms.uWipeEdgeWidth)
        uniforms.uWipeEdgeWidth.value = config.wipeEdgeWidth;
      if (uniforms.uWipeColorBleeding)
        uniforms.uWipeColorBleeding.value = config.wipeColorBleeding;
      if (uniforms.uWipeTransitionCurve)
        uniforms.uWipeTransitionCurve.value = config.wipeTransitionCurve;

      // NEW: Analog Decay uniforms
      if (uniforms.uAnalogGrain)
        uniforms.uAnalogGrain.value = config.analogGrain;
      if (uniforms.uAnalogBleeding)
        uniforms.uAnalogBleeding.value = config.analogBleeding;
      if (uniforms.uAnalogVSync)
        uniforms.uAnalogVSync.value = config.analogVSync;
      if (uniforms.uAnalogDropout)
        if (uniforms.uAnalogScanlines)
          uniforms.uAnalogScanlines.value = config.analogScanlines;
      if (uniforms.uAnalogVignette)
        uniforms.uAnalogVignette.value = config.analogVignette;
      if (uniforms.uAnalogJitter)
        uniforms.uAnalogJitter.value = config.analogJitter;
      if (uniforms.uAnalogChroma)
        uniforms.uAnalogChroma.value = config.analogChroma;
    }

    function loadImageTexture(src) {
      return new Promise((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        const timeout = setTimeout(() => reject(new Error("Timeout")), 10000);
        loader.load(
          src,
          (texture) => {
            clearTimeout(timeout);
            texture.minFilter = texture.magFilter = THREE.LinearFilter;
            texture.userData = {
              size: new THREE.Vector2(texture.image.width, texture.image.height)
            };
            resolve(texture);
          },
          undefined,
          (error) => {
            clearTimeout(timeout);
            reject(error);
          }
        );
      });
    }

    function createFeaturedImageWrapper(imageIndex, transitionDirection) {
      const featuredWrapper = document.createElement("div");
      featuredWrapper.className = "featured-image-wrapper";
      featuredWrapper.setAttribute("data-featured-wrapper", "");
      const featuredImage = document.createElement("img");
      featuredImage.src = imageCollection[imageIndex];
      featuredImage.alt = `Featured fashion portrait ${imageIndex + 1}`;
      featuredWrapper.appendChild(featuredImage);

      const initialClipPath =
        transitionDirection === "down"
          ? "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)"
          : "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";
      featuredWrapper.style.clipPath = initialClipPath;
      return featuredWrapper;
    }

    // Updated createTextElements with ScrambleText integration
    function createTextElements(slideIndex, transitionDirection) {
      const newNumber = document.createElement("span");
      newNumber.textContent = slideData[slideIndex].number;
      gsap.set(newNumber, {
        y: transitionDirection === "down" ? 20 : -20
      });

      const newTitle = document.createElement("h1");
      newTitle.textContent = slideData[slideIndex].title;
      gsap.set(newTitle, {
        y: transitionDirection === "down" ? 60 : -60
      });

      const newDescription = document.createElement("p");
      newDescription.textContent = slideData[slideIndex].description;
      gsap.set(newDescription, {
        y: transitionDirection === "down" ? 24 : -24
      });

      // Create paragraph lines with larger movement values
      const newParagraphLines = slideData[slideIndex].paragraphLines.map(
        (lineText, index) => {
          const lineSpan = document.createElement("span");
          lineSpan.textContent = lineText;
          gsap.set(lineSpan, {
            y: transitionDirection === "down" ? 35 : -35
          });
          return lineSpan;
        }
      );

      return {
        newNumber,
        newTitle,
        newDescription,
        newParagraphLines
      };
    }

    function getNextImageIndex(direction) {
      if (direction === "down") {
        return state.currentImageIndex === config.totalImages - 1
          ? 0
          : state.currentImageIndex + 1;
      } else {
        return state.currentImageIndex === 0
          ? config.totalImages - 1
          : state.currentImageIndex - 1;
      }
    }

    // Updated executeSlideTransition with ScrambleText integration
    function executeSlideTransition(transitionDirection) {
      if (
        state.isTransitioning ||
        !state.scrollingEnabled ||
        !state.texturesLoaded
      )
        return;

      state.isTransitioning = true;
      state.scrollingEnabled = false;

      const nextIndex = getNextImageIndex(transitionDirection);

      const currentTexture = state.slideTextures[state.currentImageIndex];
      const nextTexture = state.slideTextures[nextIndex];
      if (!currentTexture || !nextTexture) return;

      // Get DOM elements
      const featuredImageContainer = slider.querySelector(
        "[data-featured-image]"
      );
      const currentFeaturedWrapper = featuredImageContainer.querySelector(
        "[data-featured-wrapper]"
      );

      const numberContainer = slider.querySelector("[data-slide-number]");
      const titleContainer = slider.querySelector("[data-slide-title]");
      const descriptionContainer = slider.querySelector(
        "[data-slide-description]"
      );
      const paragraphLine1Container = slider.querySelector(
        "[data-paragraph-line-1]"
      );
      const paragraphLine2Container = slider.querySelector(
        "[data-paragraph-line-2]"
      );

      const currentNumber = numberContainer.querySelector("span");
      const currentTitle = titleContainer.querySelector("h1");
      const currentDescription = descriptionContainer.querySelector("p");
      const currentParagraphLine1 = paragraphLine1Container.querySelector(
        "span"
      );
      const currentParagraphLine2 = paragraphLine2Container.querySelector(
        "span"
      );

      // Create new elements
      const newFeaturedWrapper = createFeaturedImageWrapper(
        nextIndex,
        transitionDirection
      );
      const {
        newNumber,
        newTitle,
        newDescription,
        newParagraphLines
      } = createTextElements(nextIndex, transitionDirection);

      // Add new elements to DOM
      featuredImageContainer.appendChild(newFeaturedWrapper);
      numberContainer.appendChild(newNumber);
      titleContainer.appendChild(newTitle);
      descriptionContainer.appendChild(newDescription);
      paragraphLine1Container.appendChild(newParagraphLines[0]);
      paragraphLine2Container.appendChild(newParagraphLines[1]);

      // Set initial position for featured image
      gsap.set(newFeaturedWrapper.querySelector("img"), {
        y: transitionDirection === "down" ? "-50%" : "50%"
      });

      // Update shader uniforms
      state.shaderMaterial.uniforms.uTexture1.value = currentTexture;
      state.shaderMaterial.uniforms.uTexture2.value = nextTexture;
      state.shaderMaterial.uniforms.uTexture1Size.value =
        currentTexture.userData.size;
      state.shaderMaterial.uniforms.uTexture2Size.value =
        nextTexture.userData.size;

      state.currentImageIndex = nextIndex;

      // Create transition timeline with ScrambleText
      const transitionTimeline = gsap.timeline({
        onComplete: () => {
          // Cleanup old elements
          [
            currentFeaturedWrapper,
            currentNumber,
            currentTitle,
            currentDescription,
            currentParagraphLine1,
            currentParagraphLine2
          ].forEach((element) => {
            if (element && element.parentNode) {
              element.parentNode.removeChild(element);
            }
          });

          // Reset shader
          state.shaderMaterial.uniforms.uProgress.value = 0;
          state.shaderMaterial.uniforms.uTexture1.value = nextTexture;
          state.shaderMaterial.uniforms.uTexture1Size.value =
            nextTexture.userData.size;

          state.isTransitioning = false;
          setTimeout(() => {
            state.scrollingEnabled = true;
            state.lastScrollTimestamp = Date.now();
          }, 100);
        }
      });

      const featuredClipPath =
        transitionDirection === "down"
          ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
          : "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)";

      // Background shader transition
      transitionTimeline.fromTo(
        state.shaderMaterial.uniforms.uProgress,
        { value: 0 },
        {
          value: 1,
          duration: config.transitionDuration,
          ease: "cubic-bezier(0.77,0,0.18,1)"
        },
        0
      );

      // Featured image transitions
      transitionTimeline.to(
        newFeaturedWrapper,
        {
          clipPath: featuredClipPath,
          duration: config.transitionDuration,
          ease: "cubic-bezier(0.77,0,0.18,1)"
        },
        0
      );

      transitionTimeline.to(
        currentFeaturedWrapper.querySelector("img"),
        {
          y: transitionDirection === "down" ? "50%" : "-50%",
          duration: config.transitionDuration,
          ease: "cubic-bezier(0.77,0,0.18,1)"
        },
        0
      );

      transitionTimeline.to(
        newFeaturedWrapper.querySelector("img"),
        {
          y: "0%",
          duration: config.transitionDuration,
          ease: "cubic-bezier(0.77,0,0.18,1)"
        },
        0
      );

      // Text transitions with ScrambleText + movement
      // Number with scramble
      transitionTimeline.to(
        currentNumber,
        {
          y: transitionDirection === "down" ? -20 : 20,
          duration: config.transitionDuration,
          ease: "cubic-bezier(0.77,0,0.18,1)"
        },
        0
      );
      transitionTimeline.to(
        newNumber,
        {
          y: 0,
          duration: config.transitionDuration,
          ease: "cubic-bezier(0.77,0,0.18,1)"
        },
        0
      );
      transitionTimeline.to(
        newNumber,
        {
          duration: 0.8,
          scrambleText: {
            text: slideData[nextIndex].number,
            chars: "∅øΩ§∆◊¶†‡0123456789",
            revealDelay: 0.3,
            speed: 0.4
          }
        },
        0.2
      );

      // Title with scramble
      transitionTimeline.to(
        currentTitle,
        {
          y: transitionDirection === "down" ? -60 : 60,
          duration: config.transitionDuration,
          ease: "cubic-bezier(0.77,0,0.18,1)"
        },
        0.02
      );
      transitionTimeline.to(
        newTitle,
        {
          y: 0,
          duration: config.transitionDuration,
          ease: "cubic-bezier(0.77,0,0.18,1)"
        },
        0.02
      );
      transitionTimeline.to(
        newTitle,
        {
          duration: 1.2,
          scrambleText: {
            text: slideData[nextIndex].title,
            chars: "!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            revealDelay: 0.4,
            speed: 0.3
          }
        },
        0.3
      );

      // Description with scramble
      transitionTimeline.to(
        currentDescription,
        {
          y: transitionDirection === "down" ? -24 : 24,
          duration: config.transitionDuration,
          ease: "cubic-bezier(0.77,0,0.18,1)"
        },
        0.04
      );
      transitionTimeline.to(
        newDescription,
        {
          y: 0,
          duration: config.transitionDuration,
          ease: "cubic-bezier(0.77,0,0.18,1)"
        },
        0.04
      );
      transitionTimeline.to(
        newDescription,
        {
          duration: 1.0,
          scrambleText: {
            text: slideData[nextIndex].description,
            chars: "!<>-_\\/[]{}—=+*^?#abcdefghijklmnopqrstuvwxyz",
            revealDelay: 0.5,
            speed: 0.35
          }
        },
        0.4
      );

      // Paragraph Line 1 with scramble
      transitionTimeline.to(
        currentParagraphLine1,
        {
          y: transitionDirection === "down" ? -35 : 35,
          duration: config.transitionDuration,
          ease: "cubic-bezier(0.77,0,0.18,1)"
        },
        0.06
      );
      transitionTimeline.to(
        newParagraphLines[0],
        {
          y: 0,
          duration: config.transitionDuration,
          ease: "cubic-bezier(0.77,0,0.18,1)"
        },
        0.06
      );
      transitionTimeline.to(
        newParagraphLines[0],
        {
          duration: 1.4,
          scrambleText: {
            text: slideData[nextIndex].paragraphLines[0],
            chars: "01!<>-_\\/[]{}—=+*^?#________",
            revealDelay: 0.6,
            speed: 0.25
          }
        },
        0.5
      );

      // Paragraph Line 2 with scramble
      transitionTimeline.to(
        currentParagraphLine2,
        {
          y: transitionDirection === "down" ? -35 : 35,
          duration: config.transitionDuration,
          ease: "cubic-bezier(0.77,0,0.18,1)"
        },
        0.08
      );
      transitionTimeline.to(
        newParagraphLines[1],
        {
          y: 0,
          duration: config.transitionDuration,
          ease: "cubic-bezier(0.77,0,0.18,1)"
        },
        0.08
      );
      transitionTimeline.to(
        newParagraphLines[1],
        {
          duration: 1.4,
          scrambleText: {
            text: slideData[nextIndex].paragraphLines[1],
            chars: "01!<>-_\\/[]{}—=+*^?#________",
            revealDelay: 0.7,
            speed: 0.25
          }
        },
        0.6
      );
    }

    function handleScrollInteraction(scrollDirection) {
      const currentTimestamp = Date.now();
      if (state.isTransitioning || !state.scrollingEnabled) return;
      if (
        currentTimestamp - state.lastScrollTimestamp <
        config.scrollThrottleDelay
      )
        return;

      state.lastScrollTimestamp = currentTimestamp;
      executeSlideTransition(scrollDirection);
    }

    async function initializeRenderer() {
      const canvas = slider.querySelector("[data-webgl-canvas]");
      if (!canvas) return;

      state.scene = new THREE.Scene();
      state.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      state.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: false,
        alpha: false
      });
      state.renderer.setSize(window.innerWidth, window.innerHeight);
      state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Create shader material with all uniforms including Analog Decay
      state.shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTexture1: { value: null },
          uTexture2: { value: null },
          uProgress: { value: 0.0 },
          uTime: { value: 0.0 },
          uResolution: {
            value: new THREE.Vector2(window.innerWidth, window.innerHeight)
          },
          uTexture1Size: { value: new THREE.Vector2(1, 1) },
          uTexture2Size: { value: new THREE.Vector2(1, 1) },
          uEffectType: { value: getEffectIndex(config.currentEffect) },

          // Global uniforms
          uGlobalIntensity: { value: config.globalIntensity },
          uSpeedMultiplier: { value: config.speedMultiplier },
          uColorShiftAmount: { value: config.colorShiftAmount },
          uDistortionStrength: { value: config.distortionStrength },
          uNoiseLevel: { value: config.noiseLevel },

          // Datamosh uniforms
          uDatamoshBlockSize: { value: config.datamoshBlockSize },
          uDatamoshCorruptionFreq: { value: config.datamoshCorruptionFreq },
          uDatamoshQuantization: { value: config.datamoshQuantization },
          uDatamoshDisplacement: { value: config.datamoshDisplacement },
          uDatamoshTemporal: { value: config.datamoshTemporal },

          // Pixel Sort uniforms
          uPixelSortDirection: { value: config.pixelSortDirection },
          uPixelSortThreshold: { value: config.pixelSortThreshold },
          uPixelSortBandWidth: { value: config.pixelSortBandWidth },
          uPixelSortSeparation: { value: config.pixelSortSeparation },
          uPixelSortSensitivity: { value: config.pixelSortSensitivity },

          // Digital Static uniforms
          uStaticDensity: { value: config.staticDensity },
          uStaticWaveSpeed: { value: config.staticWaveSpeed },
          uStaticAnalogNoise: { value: config.staticAnalogNoise },
          uStaticChannelShift: { value: config.staticChannelShift },
          uStaticFlicker: { value: config.staticFlicker },

          // Static Sweep uniforms
          uSweepWidth: { value: config.sweepWidth },
          uSweepLayers: { value: config.sweepLayers },
          uSweepChromaticAberration: { value: config.sweepChromaticAberration },
          uSweepEdgeGlow: { value: config.sweepEdgeGlow },
          uSweepFadeTiming: { value: config.sweepFadeTiming },

          // Glitch Wipe uniforms
          uWipeAngle: { value: config.wipeAngle },
          uWipeAberrationStrength: { value: config.wipeAberrationStrength },
          uWipeEdgeWidth: { value: config.wipeEdgeWidth },
          uWipeColorBleeding: { value: config.wipeColorBleeding },
          uWipeTransitionCurve: { value: config.wipeTransitionCurve },

          // NEW: Analog Decay uniforms
          uAnalogGrain: { value: config.analogGrain },
          uAnalogBleeding: { value: config.analogBleeding },
          uAnalogVSync: { value: config.analogVSync },
          uAnalogScanlines: { value: config.analogScanlines },
          uAnalogVignette: { value: config.analogVignette },
          uAnalogJitter: { value: config.analogJitter },
          uAnalogChroma: { value: config.analogChroma }
        },
        vertexShader,
        fragmentShader
      });

      const geometry = new THREE.PlaneGeometry(2, 2);
      const mesh = new THREE.Mesh(geometry, state.shaderMaterial);
      state.scene.add(mesh);

      // Load textures
      for (let i = 0; i < imageCollection.length; i++) {
        try {
          const texture = await loadImageTexture(imageCollection[i]);
          state.slideTextures.push(texture);
        } catch (error) {
          console.warn(`Failed to load image ${i}:`, error);
        }
      }

      if (state.slideTextures.length >= 2) {
        state.shaderMaterial.uniforms.uTexture1.value = state.slideTextures[0];
        state.shaderMaterial.uniforms.uTexture2.value = state.slideTextures[1];
        state.shaderMaterial.uniforms.uTexture1Size.value =
          state.slideTextures[0].userData.size;
        state.shaderMaterial.uniforms.uTexture2Size.value =
          state.slideTextures[1].userData.size;
        state.texturesLoaded = true;
        state.scrollingEnabled = true;
      }

      // Render loop
      const render = () => {
        requestAnimationFrame(render);
        state.shaderMaterial.uniforms.uTime.value =
          (Date.now() - state.startTime) * 0.001;
        state.renderer.render(state.scene, state.camera);
      };
      render();
    }

    function initEventListeners() {
      // Mouse wheel
      window.addEventListener(
        "wheel",
        (wheelEvent) => {
          wheelEvent.preventDefault();
          const scrollDirection = wheelEvent.deltaY > 0 ? "down" : "up";
          handleScrollInteraction(scrollDirection);
        },
        { passive: false }
      );

      // Touch events
      window.addEventListener(
        "touchstart",
        (touchStartEvent) => {
          state.touchStartPosition = touchStartEvent.touches[0].clientY;
          state.isTouchActive = true;
        },
        { passive: false }
      );

      window.addEventListener(
        "touchmove",
        (touchMoveEvent) => {
          touchMoveEvent.preventDefault();
          if (
            !state.isTouchActive ||
            state.isTransitioning ||
            !state.scrollingEnabled
          )
            return;

          const touchCurrentPosition = touchMoveEvent.touches[0].clientY;
          const touchDifference =
            state.touchStartPosition - touchCurrentPosition;

          if (Math.abs(touchDifference) > config.touchThreshold) {
            state.isTouchActive = false;
            const swipeDirection = touchDifference > 0 ? "down" : "up";
            handleScrollInteraction(swipeDirection);
          }
        },
        { passive: false }
      );

      window.addEventListener("touchend", () => {
        state.isTouchActive = false;
      });

      // Keyboard shortcuts
      document.addEventListener("keydown", (e) => {
        e.preventDefault();

        switch (e.code) {
          case "KeyH":
            const paneElement = document.querySelector(".tp-dfwv");
            if (paneElement) {
              const isHidden = paneElement.style.visibility === "hidden";
              if (isHidden) {
                paneElement.style.visibility = "visible";
                paneElement.style.opacity = "1";
              } else {
                paneElement.style.visibility = "hidden";
                paneElement.style.opacity = "0";
              }
              console.log(isHidden ? "Settings opened" : "Settings closed");
            }
            break;

          case "Digit1":
            config.currentEffect = "datamosh";
            handleEffectChange(config.currentEffect);
            console.log("Switched to: Datamosh");
            break;
          case "Digit2":
            config.currentEffect = "pixelSort";
            handleEffectChange(config.currentEffect);
            console.log("Switched to: Pixel Sort");
            break;
          case "Digit3":
            config.currentEffect = "digitalStatic";
            handleEffectChange(config.currentEffect);
            console.log("Switched to: Digital Static");
            break;
          case "Digit4":
            config.currentEffect = "staticSweep";
            handleEffectChange(config.currentEffect);
            console.log("Switched to: Static Sweep");
            break;
          case "Digit5":
            config.currentEffect = "glitchWipe";
            handleEffectChange(config.currentEffect);
            console.log("Switched to: Glitch Wipe");
            break;
          case "Digit6":
            config.currentEffect = "analogDecay";
            handleEffectChange(config.currentEffect);
            console.log("Switched to: Analog Decay");
            break;

          case "KeyP":
            cyclePresets();
            break;

          case "Equal":
          case "NumpadAdd":
            config.globalIntensity = Math.min(
              2.0,
              config.globalIntensity + 0.1
            );
            updateShaderUniforms();
            if (pane) pane.refresh();
            console.log(`Intensity: ${config.globalIntensity.toFixed(1)}`);
            break;
          case "Minus":
          case "NumpadSubtract":
            config.globalIntensity = Math.max(
              0.1,
              config.globalIntensity - 0.1
            );
            updateShaderUniforms();
            if (pane) pane.refresh();
            console.log(`Intensity: ${config.globalIntensity.toFixed(1)}`);
            break;

          case "BracketRight":
            config.speedMultiplier = Math.min(
              3.0,
              config.speedMultiplier + 0.1
            );
            updateShaderUniforms();
            if (pane) pane.refresh();
            console.log(`Speed: ${config.speedMultiplier.toFixed(1)}`);
            break;
          case "BracketLeft":
            config.speedMultiplier = Math.max(
              0.1,
              config.speedMultiplier - 0.1
            );
            updateShaderUniforms();
            if (pane) pane.refresh();
            console.log(`Speed: ${config.speedMultiplier.toFixed(1)}`);
            break;

          case "KeyR":
            resetToDefaults();
            break;
        }
      });

      // Resize handler
      window.addEventListener("resize", () => {
        if (state.renderer && state.shaderMaterial) {
          state.renderer.setSize(window.innerWidth, window.innerHeight);
          state.shaderMaterial.uniforms.uResolution.value.set(
            window.innerWidth,
            window.innerHeight
          );
        }
      });
    }

    // Helper functions
    function cyclePresets() {
      const currentPresets = Object.keys(
        effectPresets[config.currentEffect] || {}
      );
      if (currentPresets.length === 0) return;

      const currentIndex = currentPresets.indexOf(config.currentEffectPreset);
      const nextIndex = (currentIndex + 1) % currentPresets.length;
      const nextPreset = currentPresets[nextIndex];

      config.currentEffectPreset = nextPreset;
      applyEffectPreset(config.currentEffect, nextPreset);
      console.log(`Preset: ${config.currentEffect} - ${nextPreset}`);
    }

    function resetToDefaults() {
      config.globalIntensity = 1.0;
      config.speedMultiplier = 1.0;
      config.colorShiftAmount = 0.3;
      config.distortionStrength = 1.0;
      config.noiseLevel = 0.5;
      config.transitionDuration = 1.8;

      config.currentEffectPreset = "Default";
      applyEffectPreset(config.currentEffect, "Default");
      console.log("Reset to defaults");
    }

    // Initialize everything
    setupPane();
    initializeRenderer();
    initEventListeners();
  });
}

function initSliderAfterPreloader() {
  // Small delay to ensure smooth transition
  setTimeout(() => {
    initImageSlider();
  }, 100);
}

// Initialize with preloader
document.addEventListener("DOMContentLoaded", function () {
  // Start with preloader instead of directly initializing slider
  const loadingManager = new SliderLoadingManager();
});