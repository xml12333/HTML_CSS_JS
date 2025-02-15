// ---------------- Global Variables ----------------
let currentImage = null;
const baseFontSize = 7; // Base font size for ASCII art

// ---------------- Helper Functions ----------------

// Clamp a value between min and max.
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Generate a normalized 2D Gaussian kernel.
function gaussianKernel2D(sigma, kernelSize) {
  const kernel = [];
  const half = Math.floor(kernelSize / 2);
  let sum = 0;
  for (let y = -half; y <= half; y++) {
    const row = [];
    for (let x = -half; x <= half; x++) {
      const value = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
      row.push(value);
      sum += value;
    }
    kernel.push(row);
  }
  // Normalize the kernel.
  for (let y = 0; y < kernelSize; y++) {
    for (let x = 0; x < kernelSize; x++) {
      kernel[y][x] /= sum;
    }
  }
  return kernel;
}

// Convolve a 2D image (array) with a 2D kernel.
function convolve2D(img, kernel) {
  const height = img.length,
        width = img[0].length;
  const kernelSize = kernel.length,
        half = Math.floor(kernelSize / 2);
  const output = [];
  for (let y = 0; y < height; y++) {
    output[y] = [];
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const yy = y + ky - half;
          const xx = x + kx - half;
          let pixel = (yy >= 0 && yy < height && xx >= 0 && xx < width) ? img[yy][xx] : 0;
          sum += pixel * kernel[ky][kx];
        }
      }
      output[y][x] = sum;
    }
  }
  return output;
}

// Compute the Difference of Gaussians on a 2D grayscale image.
function differenceOfGaussians2D(gray, sigma1, sigma2, kernelSize) {
  const kernel1 = gaussianKernel2D(sigma1, kernelSize);
  const kernel2 = gaussianKernel2D(sigma2, kernelSize);
  const blurred1 = convolve2D(gray, kernel1);
  const blurred2 = convolve2D(gray, kernel2);
  const height = gray.length,
        width = gray[0].length;
  const dog = [];
  for (let y = 0; y < height; y++) {
    dog[y] = [];
    for (let x = 0; x < width; x++) {
      dog[y][x] = blurred1[y][x] - blurred2[y][x];
    }
  }
  return dog;
}

// Apply the Sobel operator to a 2D image, returning gradient magnitude and angle arrays.
function applySobel2D(img, width, height) {
  const mag = [],
        angle = [];
  for (let y = 0; y < height; y++) {
    mag[y] = [];
    angle[y] = [];
    for (let x = 0; x < width; x++) {
      mag[y][x] = 0;
      angle[y][x] = 0;
    }
  }
  const kernelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
  const kernelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let Gx = 0, Gy = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixel = img[y + ky][x + kx];
          Gx += pixel * kernelX[ky + 1][kx + 1];
          Gy += pixel * kernelY[ky + 1][kx + 1];
        }
      }
      const g = Math.sqrt(Gx * Gx + Gy * Gy);
      mag[y][x] = g;
      let theta = Math.atan2(Gy, Gx) * (180 / Math.PI);
      if (theta < 0) theta += 180;
      angle[y][x] = theta;
    }
  }
  return { mag, angle };
}

// Non-maximum suppression to thin out the edges.
function nonMaxSuppression(mag, angle, width, height) {
  const suppressed = [];
  for (let y = 0; y < height; y++) {
    suppressed[y] = [];
    for (let x = 0; x < width; x++) {
      suppressed[y][x] = 0;
    }
  }
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const currentMag = mag[y][x];
      let neighbor1 = 0, neighbor2 = 0;
      const theta = angle[y][x];
      if ((theta >= 0 && theta < 22.5) || (theta >= 157.5 && theta <= 180)) {
        // 0° direction: compare left and right.
        neighbor1 = mag[y][x - 1];
        neighbor2 = mag[y][x + 1];
      } else if (theta >= 22.5 && theta < 67.5) {
        // 45° direction: compare top-right and bottom-left.
        neighbor1 = mag[y - 1][x + 1];
        neighbor2 = mag[y + 1][x - 1];
      } else if (theta >= 67.5 && theta < 112.5) {
        // 90° direction: compare top and bottom.
        neighbor1 = mag[y - 1][x];
        neighbor2 = mag[y + 1][x];
      } else if (theta >= 112.5 && theta < 157.5) {
        // 135° direction: compare top-left and bottom-right.
        neighbor1 = mag[y - 1][x - 1];
        neighbor2 = mag[y + 1][x + 1];
      }
      suppressed[y][x] = (currentMag >= neighbor1 && currentMag >= neighbor2) ? currentMag : 0;
    }
  }
  return suppressed;
}

// ---------------- ASCII Art Generation Functions ----------------

// Generate standard ASCII art (non-DOG modes).
function generateASCII(img) {
  const edgeMethod = document.querySelector('input[name="edgeMethod"]:checked').value;
  if (edgeMethod === 'dog') {
    generateContourASCII(img);
    return;
  }
  
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const asciiWidth = parseInt(document.getElementById('asciiWidth').value, 10);
  const brightness = parseFloat(document.getElementById('brightness').value);
  const contrastValue = parseFloat(document.getElementById('contrast').value);
  const blurValue = parseFloat(document.getElementById('blur').value);
  const ditheringEnabled = document.getElementById('dithering').checked;
  const ditherAlgorithm = document.getElementById('ditherAlgorithm').value;
  const invertEnabled = document.getElementById('invert').checked;
  const ignoreWhite = document.getElementById('ignoreWhite').checked;
  const charset = document.getElementById('charset').value;
  
  let gradient;
  switch (charset) {
    case 'standard': gradient = "@%#*+=-:."; break;
    case 'blocks': gradient = "█▓▒░ "; break;
    case 'binary': gradient = "01"; break;
    case 'manual':
      const manualChar = document.getElementById('manualCharInput').value || "0";
      gradient = manualChar + " ";
      break;
    case 'hex': gradient = "0123456789ABCDEF"; break;
    case 'detailed':
    default: gradient = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'.";
      break;
  }
  
  const nLevels = gradient.length;
  const contrastFactor = (259 * (contrastValue + 255)) / (255 * (259 - contrastValue));
  const fontAspectRatio = 0.55;
  const asciiHeight = Math.round((img.height / img.width) * asciiWidth * fontAspectRatio);
  
  canvas.width = asciiWidth;
  canvas.height = asciiHeight;
  ctx.filter = blurValue > 0 ? `blur(${blurValue}px)` : "none";
  ctx.drawImage(img, 0, 0, asciiWidth, asciiHeight);
  
  const imageData = ctx.getImageData(0, 0, asciiWidth, asciiHeight);
  const data = imageData.data;
  let gray = [], grayOriginal = [];
  for (let i = 0; i < data.length; i += 4) {
    let lum = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
    if (invertEnabled) lum = 255 - lum;
    let adjusted = clamp(contrastFactor * (lum - 128) + 128 + brightness, 0, 255);
    gray.push(adjusted);
    grayOriginal.push(adjusted);
  }
  
  let ascii = "";
  if (document.querySelector('input[name="edgeMethod"]:checked').value === 'sobel') {
    const threshold = parseInt(document.getElementById('edgeThreshold').value, 10);
    gray = applyEdgeDetection(gray, asciiWidth, asciiHeight, threshold);
    for (let y = 0; y < asciiHeight; y++) {
      let line = "";
      for (let x = 0; x < asciiWidth; x++) {
        const idx = y * asciiWidth + x;
        if (ignoreWhite && grayOriginal[idx] === 255) {
          line += " ";
          continue;
        }
        const computedLevel = Math.round((gray[idx] / 255) * (nLevels - 1));
        line += gradient.charAt(computedLevel);
      }
      ascii += line + "\n";
    }
  } else if (ditheringEnabled) {
    if (ditherAlgorithm === 'floyd') {
      // Floyd–Steinberg dithering
      for (let y = 0; y < asciiHeight; y++) {
        let line = "";
        for (let x = 0; x < asciiWidth; x++) {
          const idx = y * asciiWidth + x;
          if (ignoreWhite && grayOriginal[idx] === 255) { line += " "; continue; }
          let computedLevel = Math.round((gray[idx] / 255) * (nLevels - 1));
          line += gradient.charAt(computedLevel);
          const newPixel = (computedLevel / (nLevels - 1)) * 255;
          const error = gray[idx] - newPixel;
          if (x + 1 < asciiWidth) { 
            gray[idx + 1] = clamp(gray[idx + 1] + error * (7 / 16), 0, 255); 
          }
          if (x - 1 >= 0 && y + 1 < asciiHeight) { 
            gray[idx - 1 + asciiWidth] = clamp(gray[idx - 1 + asciiWidth] + error * (3 / 16), 0, 255); 
          }
          if (y + 1 < asciiHeight) { 
            gray[idx + asciiWidth] = clamp(gray[idx + asciiWidth] + error * (5 / 16), 0, 255); 
          }
          if (x + 1 < asciiWidth && y + 1 < asciiHeight) { 
            gray[idx + asciiWidth + 1] = clamp(gray[idx + asciiWidth + 1] + error * (1 / 16), 0, 255); 
          }
        }
        ascii += line + "\n";
      }
    } else if (ditherAlgorithm === 'atkinson') {
      // Atkinson dithering
      for (let y = 0; y < asciiHeight; y++) {
        let line = "";
        for (let x = 0; x < asciiWidth; x++) {
          const idx = y * asciiWidth + x;
          if (ignoreWhite && grayOriginal[idx] === 255) { line += " "; continue; }
          let computedLevel = Math.round((gray[idx] / 255) * (nLevels - 1));
          line += gradient.charAt(computedLevel);
          const newPixel = (computedLevel / (nLevels - 1)) * 255;
          const error = gray[idx] - newPixel;
          const diffusion = error / 8;
          if (x + 1 < asciiWidth) { 
            gray[idx + 1] = clamp(gray[idx + 1] + diffusion, 0, 255); 
          }
          if (x + 2 < asciiWidth) { 
            gray[idx + 2] = clamp(gray[idx + 2] + diffusion, 0, 255); 
          }
          if (y + 1 < asciiHeight) {
            if (x - 1 >= 0) { 
              gray[idx - 1 + asciiWidth] = clamp(gray[idx - 1 + asciiWidth] + diffusion, 0, 255); 
            }
            gray[idx + asciiWidth] = clamp(gray[idx + asciiWidth] + diffusion, 0, 255);
            if (x + 1 < asciiWidth) { 
              gray[idx + asciiWidth + 1] = clamp(gray[idx + asciiWidth + 1] + diffusion, 0, 255); 
            }
          }
          if (y + 2 < asciiHeight) { 
            gray[idx + 2 * asciiWidth] = clamp(gray[idx + 2 * asciiWidth] + diffusion, 0, 255); 
          }
        }
        ascii += line + "\n";
      }
    } else if (ditherAlgorithm === 'noise') {
      // Noise dithering
      for (let y = 0; y < asciiHeight; y++) {
        let line = "";
        for (let x = 0; x < asciiWidth; x++) {
          const idx = y * asciiWidth + x;
          if (ignoreWhite && grayOriginal[idx] === 255) { line += " "; continue; }
          const noise = (Math.random() - 0.5) * (255 / nLevels);
          const noisyValue = clamp(gray[idx] + noise, 0, 255);
          let computedLevel = Math.round((noisyValue / 255) * (nLevels - 1));
          line += gradient.charAt(computedLevel);
        }
        ascii += line + "\n";
      }
    } else if (ditherAlgorithm === 'ordered') {
      // Ordered dithering using a 4x4 Bayer matrix.
      const bayer = [
        [0, 8, 2, 10],
        [12, 4, 14, 6],
        [3, 11, 1, 9],
        [15, 7, 13, 5]
      ];
      const matrixSize = 4;
      for (let y = 0; y < asciiHeight; y++) {
        let line = "";
        for (let x = 0; x < asciiWidth; x++) {
          const idx = y * asciiWidth + x;
          if (ignoreWhite && grayOriginal[idx] === 255) { line += " "; continue; }
          const p = gray[idx] / 255;
          const t = (bayer[y % matrixSize][x % matrixSize] + 0.5) / (matrixSize * matrixSize);
          let valueWithDither = p + t - 0.5;
          valueWithDither = Math.min(Math.max(valueWithDither, 0), 1);
          let computedLevel = Math.floor(valueWithDither * nLevels);
          if (computedLevel >= nLevels) computedLevel = nLevels - 1;
          line += gradient.charAt(computedLevel);
        }
        ascii += line + "\n";
      }
    }
  } else {
    // Simple mapping without dithering.
    for (let y = 0; y < asciiHeight; y++) {
      let line = "";
      for (let x = 0; x < asciiWidth; x++) {
        const idx = y * asciiWidth + x;
        if (ignoreWhite && grayOriginal[idx] === 255) { line += " "; continue; }
        const computedLevel = Math.round((gray[idx] / 255) * (nLevels - 1));
        line += gradient.charAt(computedLevel);
      }
      ascii += line + "\n";
    }
  }
  document.getElementById('ascii-art').textContent = ascii;
}

// Apply simple Sobel edge detection on a 1D grayscale array.
function applyEdgeDetection(gray, width, height, threshold) {
  let edges = new Array(width * height).fill(255);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let idx = y * width + x;
      let a = gray[(y - 1) * width + (x - 1)];
      let b = gray[(y - 1) * width + x];
      let c = gray[(y - 1) * width + (x + 1)];
      let d = gray[y * width + (x - 1)];
      let e = gray[y * width + x];
      let f = gray[y * width + (x + 1)];
      let g = gray[(y + 1) * width + (x - 1)];
      let h = gray[(y + 1) * width + x];
      let i = gray[(y + 1) * width + (x + 1)];
      let Gx = (-1 * a) + (0 * b) + (1 * c) +
               (-2 * d) + (0 * e) + (2 * f) +
               (-1 * g) + (0 * h) + (1 * i);
      let Gy = (-1 * a) + (-2 * b) + (-1 * c) +
               (0 * d) + (0 * e) + (0 * f) +
               (1 * g) + (2 * h) + (1 * i);
      let magVal = Math.sqrt(Gx * Gx + Gy * Gy);
      let normalized = (magVal / 1442) * 255;
      edges[idx] = normalized > threshold ? 0 : 255;
    }
  }
  return edges;
}

// Generate contour-based ASCII art using DoG and Sobel with non-maximum suppression.
// Now basic adjustments (brightness, contrast, blur, invert) are also applied.
function generateContourASCII(img) {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const asciiWidth = parseInt(document.getElementById('asciiWidth').value, 10);
  const brightness = parseFloat(document.getElementById('brightness').value);
  const contrastValue = parseFloat(document.getElementById('contrast').value);
  const blurValue = parseFloat(document.getElementById('blur').value);
  const invertEnabled = document.getElementById('invert').checked;
  const fontAspectRatio = 0.55;
  const asciiHeight = Math.round((img.height / img.width) * asciiWidth * fontAspectRatio);
  canvas.width = asciiWidth;
  canvas.height = asciiHeight;
  // Use blur filter if applicable.
  ctx.filter = blurValue > 0 ? `blur(${blurValue}px)` : "none";
  ctx.drawImage(img, 0, 0, asciiWidth, asciiHeight);
  
  const imageData = ctx.getImageData(0, 0, asciiWidth, asciiHeight);
  const data = imageData.data;
  let gray2d = [];
  const contrastFactor = (259 * (contrastValue + 255)) / (255 * (259 - contrastValue));
  for (let y = 0; y < asciiHeight; y++) {
    gray2d[y] = [];
    for (let x = 0; x < asciiWidth; x++) {
      const idx = (y * asciiWidth + x) * 4;
      let lum = 0.299 * data[idx] + 0.587 * data[idx+1] + 0.114 * data[idx+2];
      if (invertEnabled) lum = 255 - lum;
      lum = clamp(contrastFactor * (lum - 128) + 128 + brightness, 0, 255);
      gray2d[y][x] = lum;
    }
  }
  
  const sigma1 = 0.5, sigma2 = 1.0, kernelSize = 3;
  const dog = differenceOfGaussians2D(gray2d, sigma1, sigma2, kernelSize);
  const { mag, angle } = applySobel2D(dog, asciiWidth, asciiHeight);
  const suppressedMag = nonMaxSuppression(mag, angle, asciiWidth, asciiHeight);
  const threshold = parseInt(document.getElementById('dogEdgeThreshold').value, 10);
  
  let ascii = "";
  for (let y = 0; y < asciiHeight; y++) {
    let line = "";
    for (let x = 0; x < asciiWidth; x++) {
      if (suppressedMag[y][x] > threshold) {
        let adjustedAngle = (angle[y][x] + 90) % 180;
        let edgeChar = (adjustedAngle < 22.5 || adjustedAngle >= 157.5) ? "-" :
                       (adjustedAngle < 67.5) ? "/" :
                       (adjustedAngle < 112.5) ? "|" : "\\";
        line += edgeChar;
      } else {
        line += " ";
      }
    }
    ascii += line + "\n";
  }
  document.getElementById('ascii-art').textContent = ascii;
}

// ---------------- Download Function ----------------

function downloadPNG() {
  const preElement = document.getElementById('ascii-art');
  const asciiText = preElement.textContent;
  if (!asciiText.trim()) {
    alert("No ASCII art to download.");
    return;
  }
  
  // Split the ASCII art into lines.
  const lines = asciiText.split("\n");
  
  // Set a scaling factor (2x resolution for better quality).
  const scaleFactor = 2;
  
  // Define the border margin (in final pixels, then scaled)
  const borderMargin = 20 * scaleFactor;
  
  // Get computed style values from the pre element.
  const computedStyle = window.getComputedStyle(preElement);
  const baseFontSize = parseInt(computedStyle.fontSize, 10);
  const fontSize = baseFontSize * scaleFactor;
  
  // Create a temporary canvas to measure text dimensions.
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.font = `${fontSize}px Consolas, Monaco, "Liberation Mono", monospace`;
  
  // Determine the maximum line width.
  let maxLineWidth = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineWidth = tempCtx.measureText(lines[i]).width;
    if (lineWidth > maxLineWidth) {
      maxLineWidth = lineWidth;
    }
  }
  
  // Calculate the required text dimensions.
  const lineHeight = fontSize; // Basic line height.
  const textWidth = Math.ceil(maxLineWidth);
  const textHeight = Math.ceil(lines.length * lineHeight);
  
  // Create an offscreen canvas with extra space for the border margin.
  const canvasWidth = textWidth + 2 * borderMargin;
  const canvasHeight = textHeight + 2 * borderMargin;
  const offCanvas = document.createElement('canvas');
  offCanvas.width = canvasWidth;
  offCanvas.height = canvasHeight;
  const offCtx = offCanvas.getContext('2d');
  
  // Fill the background based on the current theme.
  const bgColor = document.body.classList.contains('light-mode') ? "#fff" : "#000";
  offCtx.fillStyle = bgColor;
  offCtx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Set the font and text styles.
  offCtx.font = `${fontSize}px Consolas, Monaco, "Liberation Mono", monospace`;
  offCtx.textBaseline = 'top';
  offCtx.fillStyle = document.body.classList.contains('light-mode') ? "#000" : "#eee";
  
  // Draw each line of the ASCII art onto the canvas with the margin offset.
  for (let i = 0; i < lines.length; i++) {
    offCtx.fillText(lines[i], borderMargin, borderMargin + i * lineHeight);
  }
  
  // Convert the canvas content to a blob and trigger a download.
  offCanvas.toBlob(function(blob) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ascii_art.png';
    a.click();
  });
}

// ---------------- Event Listeners ----------------

// File upload event.
document.getElementById('upload').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      currentImage = img;
      generateASCII(img);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// Update controls when changed.
document.getElementById('asciiWidth').addEventListener('input', updateSettings);
document.getElementById('brightness').addEventListener('input', updateSettings);
document.getElementById('contrast').addEventListener('input', updateSettings);
document.getElementById('blur').addEventListener('input', updateSettings);
document.getElementById('dithering').addEventListener('change', updateSettings);
document.getElementById('ditherAlgorithm').addEventListener('change', updateSettings);
document.getElementById('invert').addEventListener('change', updateSettings);
document.getElementById('ignoreWhite').addEventListener('change', updateSettings);
document.getElementById('theme').addEventListener('change', updateSettings);
document.getElementById('charset').addEventListener('change', function() {
  const manualControl = document.getElementById('manualCharControl');
  manualControl.style.display = (this.value === 'manual') ? 'flex' : 'none';
  updateSettings();
});
document.getElementById('zoom').addEventListener('input', updateSettings);

// Edge detection radio buttons.
document.querySelectorAll('input[name="edgeMethod"]').forEach(function(radio) {
  radio.addEventListener('change', function() {
    const method = document.querySelector('input[name="edgeMethod"]:checked').value;
    document.getElementById('sobelThresholdControl').style.display = (method === 'sobel') ? 'flex' : 'none';
    document.getElementById('dogThresholdControl').style.display = (method === 'dog') ? 'flex' : 'none';
    // Basic adjustments remain enabled in all modes.
    updateSettings();
  });
});
document.getElementById('edgeThreshold').addEventListener('input', updateSettings);
document.getElementById('dogEdgeThreshold').addEventListener('input', updateSettings);

// Reset and Copy buttons.
document.getElementById('reset').addEventListener('click', resetSettings);
document.getElementById('copyBtn').addEventListener('click', function() {
  const asciiText = document.getElementById('ascii-art').textContent;
  navigator.clipboard.writeText(asciiText).then(() => {
    alert('ASCII Art copied to clipboard!');
  }, () => {
    alert('Copy failed!');
  });
});
document.getElementById('downloadBtn').addEventListener('click', downloadPNG);

// ---------------- Update and Reset Functions ----------------

function updateSettings() {
  document.getElementById('asciiWidthVal').textContent = document.getElementById('asciiWidth').value;
  document.getElementById('brightnessVal').textContent = document.getElementById('brightness').value;
  document.getElementById('contrastVal').textContent = document.getElementById('contrast').value;
  document.getElementById('blurVal').textContent = document.getElementById('blur').value;
  document.getElementById('zoomVal').textContent = document.getElementById('zoom').value;
  document.getElementById('edgeThresholdVal').textContent = document.getElementById('edgeThreshold').value;
  document.getElementById('dogEdgeThresholdVal').textContent = document.getElementById('dogEdgeThreshold').value;
  
  // Update theme.
  const theme = document.getElementById('theme').value;
  document.body.classList.toggle('light-mode', theme === 'light');
  
  // Adjust ASCII art font size based on zoom.
  const zoomPercent = parseInt(document.getElementById('zoom').value, 10);
  const newFontSize = (baseFontSize * zoomPercent) / 100;
  const asciiArt = document.getElementById('ascii-art');
  asciiArt.style.fontSize = newFontSize + "px";
  asciiArt.style.lineHeight = newFontSize + "px";
  
  if (currentImage) {
    generateASCII(currentImage);
  }
}

function resetSettings() {
  document.getElementById('asciiWidth').value = 100;
  document.getElementById('brightness').value = 0;
  document.getElementById('contrast').value = 0;
  document.getElementById('blur').value = 0;
  document.getElementById('dithering').checked = true;
  document.getElementById('ditherAlgorithm').value = 'floyd';
  document.getElementById('invert').checked = false;
  document.getElementById('ignoreWhite').checked = true;
  document.getElementById('charset').value = 'detailed';
  document.getElementById('zoom').value = 100;
  document.getElementById('edgeNone').checked = true;
  document.getElementById('edgeThreshold').value = 100;
  document.getElementById('dogEdgeThreshold').value = 100;
  document.getElementById('sobelThresholdControl').style.display = 'none';
  document.getElementById('dogThresholdControl').style.display = 'none';
  // Re-enable basic adjustments.
  document.getElementById('brightness').disabled = false;
  document.getElementById('contrast').disabled = false;
  document.getElementById('blur').disabled = false;
  document.getElementById('invert').disabled = false;
  updateSettings();
}

window.addEventListener('load', function() {
  const defaultImg = new Image();
  defaultImg.crossOrigin = "Anonymous"; 
  defaultImg.src = "https://i.ibb.co/chHSSFQk/horse.png";
  defaultImg.onload = function() {
    currentImage = defaultImg;
    generateASCII(defaultImg);
  };
});