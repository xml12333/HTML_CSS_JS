const randomArrayValue = arr => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min, max) => Math.random() * (max - min) + min;
const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);
const getPixelIndex = ({ x, y }, imageWidth) => (~~x + ~~y * imageWidth) * 4;

const PI2 = Math.PI * 2;

const ctx = document.querySelector('#canvas').getContext('2d');
class Poisson {
  constructor(r, k = 30) {
    this.r = r;
    this.k  = k;
    this.cellSize = Math.floor(this.r / Math.sqrt(2));

    this.grid = [];
    this.activeList = [];

    this.width = 0;
    this.height = 0;

    this.cols = 0;
    this.rows = 0;
  }

  init(width, height) {
    this.width = width;
    this.height = height;

    this.cols = Math.ceil(width / this.cellSize) + 1;
    this.rows = Math.ceil(height / this.cellSize) + 1;

    this.grid = new Array(this.cols).fill(-1).map(() => new Array(this.rows).fill(-1));
  }

  isPointFarEnough = (point) => {
    const { col, row } = this.getGridPosition(point);

    const xmin = Math.max(col - 1, 0);
    const xmax = Math.min(col + 1, this.cols - 1);
    const ymin = Math.max(row - 1, 0);
    const ymax = Math.min(row + 1, this.rows - 1);

    for (let x = xmin; x <= xmax; x++ ) {
      for (let y = ymin; y <= ymax; y++ ) {
        const cell = this.grid[x][y];

        if (cell !== -1) {
          const distance = distanceBetween(cell, point);

          if (distance < this.r) {
            return false;
          }
        }
      }
    }

    return true;
  };

  isPointValid(point) {
    if (point.x < 0 || point.x > this.width || point.y < 0 || point.y > this.height) {
      return false;
    }

    if (!this.isPointFarEnough(point)) {
      return false;
    }

    return true;
  }

  getGridPosition = (point) => ({
    col: Math.floor(point.x / this.cellSize),
    row: Math.floor(point.y / this.cellSize),
  });

  addPointToGrid(point) {
    const { col, row } = this.getGridPosition(point);

    this.grid[col][row] = point;

    this.activeList.push(point);
  };

  tryAdd() {
    const point = randomArrayValue(this.activeList);
    const validPoints = [];

    if (!point) {
      return false;
    }

    for (let i = 0; i < this.k; i++) {
      const angle = Math.random() * PI2;
      const length = randomBetween(this.r, this.r * 2);

      const point2 = {
        x: point.x + (Math.cos(angle) * length),
        y: point.y + (Math.sin(angle) * length),
      };

      if (this.isPointValid(point2)) {
        this.addPointToGrid(point2);

        validPoints.push(point2);
      }
    }

    if (!validPoints.length) {
      this.activeList = this.activeList.filter(p => p !== point);

      return false;
    }

    return validPoints;
  }
}

class Visual {
  constructor(ctx) {
    this.ctx = ctx;

    this.width = 0
    this.height = 0;
    this.imageData = [];
  }

  async init(imageUrl) {
    const image = await Visual.loadImage(imageUrl);

    this.width = image.width;
    this.height = image.height;

    // resize
    this.ctx.canvas.width = this.width;
    this.ctx.canvas.height= this.height;

    // paint image, get image data and clear canvas again
    this.ctx.drawImage(image, 0, 0);
    this.imageData = this.ctx.getImageData(0, 0, this.width, this.height).data;

    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  getPixelIndex({ x, y }) {
    return  (~~x + ~~y * this.width) * 4;
  };

  drawPoint(position, radius = 2) {
    const pixelIndex = this.getPixelIndex(position);

    const rgb = [
      this.imageData[pixelIndex],
      this.imageData[pixelIndex + 1],
      this.imageData[pixelIndex + 2],
    ];

    const lightness = rgb[0] + rgb[1] + rgb[2];
    const lightnessMax = 255 * 3;
    const lightnessFraction = 1 - (lightness / lightnessMax);

    const radiusLightness = 0.25 + (3 * lightnessFraction);

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.fillStyle = `rgba(${rgb.join(', ')})`;
    this.ctx.arc((position.x), (position.y), radiusLightness, 0, PI2);

    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  static loadImage(imageUrl) {
    const img = new Image();

    img.crossOrigin = '';

    return new Promise(function(resolve, reject) {
      img.addEventListener('load', () => {
        resolve(img);
      });

      img.src = imageUrl;
    });
  }
}

let rafId = null;

const start = async () => {
  cancelAnimationFrame(rafId);

  const visual = new Visual(ctx);
  await visual.init('../../625.Poisson Disk Sampling/img/rabit.JPG');

  const { width, height } = visual;

  const poisson = new Poisson(4);
  poisson.init(width, height);

  const pointsStart = [
    { x: 50, y: 50 },
    { x: width - 50, y: 50 },
    { x: width - 50, y: height - 50 },
    { x: 50, y: height - 50 },
    { x: width * 0.5, y: height * 0.5 },
  ];

  pointsStart.forEach((p) =>  {
    poisson.addPointToGrid(p);
    visual.drawPoint(p);
  })

  const loop = () => {
    for (let i = 0; i < 50; i++) {
      const points = poisson.tryAdd();

      if (points) {
        points.forEach(p => visual.drawPoint(p, 2));
      }
    }

    if (poisson.activeList.length) {
      rafId = requestAnimationFrame(loop);
    }
  };

  loop();
};

start();

ctx.canvas.addEventListener('click', start);
