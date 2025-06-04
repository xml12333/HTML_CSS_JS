import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';

let density = 5;
let distance = 0;
let speed = 200;
const directions = ['top', 'right', 'bottom', 'left'];
let isPaused = false;
const images = ["https://picsum.photos/id/106/900/500","https://picsum.photos/id/115/900/500","https://picsum.photos/id/116/900/500","https://picsum.photos/id/124/900/500","https://picsum.photos/id/126/900/500","https://picsum.photos/id/130/900/500","https://picsum.photos/id/143/900/500","https://picsum.photos/id/152/900/500","https://picsum.photos/id/167/900/500","https://picsum.photos/id/190/900/500","https://picsum.photos/id/191/900/500","https://picsum.photos/id/193/900/500","https://picsum.photos/id/195/900/500","https://picsum.photos/id/204/900/500","https://picsum.photos/id/227/900/500","https://picsum.photos/id/251/900/500","https://picsum.photos/id/253/900/500","https://picsum.photos/id/256/900/500","https://picsum.photos/id/257/900/500","https://picsum.photos/id/259/900/500","https://picsum.photos/id/271/900/500","https://picsum.photos/id/274/900/500","https://picsum.photos/id/277/900/500","https://picsum.photos/id/278/900/500","https://picsum.photos/id/289/900/500","https://picsum.photos/id/291/900/500","https://picsum.photos/id/296/900/500","https://picsum.photos/id/299/900/500","https://picsum.photos/id/306/900/500","https://picsum.photos/id/308/900/500","https://picsum.photos/id/318/900/500","https://picsum.photos/id/327/900/500","https://picsum.photos/id/337/900/500","https://picsum.photos/id/339/900/500","https://picsum.photos/id/376/900/500","https://picsum.photos/id/381/900/500","https://picsum.photos/id/392/900/500","https://picsum.photos/id/395/900/500","https://picsum.photos/id/402/900/500","https://picsum.photos/id/411/900/500","https://picsum.photos/id/419/900/500","https://picsum.photos/id/424/900/500","https://picsum.photos/id/428/900/500"];

function preloadImages(srcArray, callback) {
  let loaded = 0;
  srcArray.forEach(src => {
    const img = new Image();
    img.onload = () => {
      loaded++;
      if (loaded === srcArray.length) callback();
    };
    img.src = src;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  preloadImages(images, () => { renderWalls(); });
});

const allGridElements = [];
let intervalId;

function renderWalls() {
  const gridContainer = document.querySelector('.inf-grid-hero-container');
  gridContainer.style.setProperty('--grid-sz', density);
  gridContainer.style.setProperty('--rev-dis', distance);

  allGridElements.length = 0;

  directions.forEach(dir => {
    const parent = document.querySelector(`.${dir}`);
    if (!parent) return;
    parent.innerHTML = '';
    const total = density * density;
    for (let i = 1; i <= total; i++) {
      const div = document.createElement('div');
      div.classList.add(`${dir.charAt(0)}${i}`);
      parent.appendChild(div);
      allGridElements.push(div);
    }
  });

  startImageInterval();
}

let loadedCount = 0;
let totalElementsToLoad = 0;

function startImageInterval() {
  if (intervalId) clearInterval(intervalId);
  loadedCount = 0;
  totalElementsToLoad = allGridElements.length;

  intervalId = setInterval(() => {
    if (isPaused) return;
    const unloadedElements = allGridElements.filter(el => !el.classList.contains('loaded'));
    if (unloadedElements.length === 0) return;

    const randomElement = unloadedElements[Math.floor(Math.random() * unloadedElements.length)];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    randomElement.style.background = `url('${randomImage}')`;
    randomElement.classList.add('loaded');
    loadedCount++;

    randomElement.addEventListener('click', () => { 
      randomElement.classList.add('selected');
      randomElement.parentNode.classList.add('selectedPane');
      pauseInterval();
    });

    if (loadedCount >= totalElementsToLoad) {
      clearInterval(intervalId);
      document.dispatchEvent(new Event('allImagesLoaded'));
    }
  }, speed);
}

function pauseInterval() {
  isPaused = true;
}

function resumeInterval() {
document.querySelector('.selected')?.classList.remove('selected');
document.querySelector('.selectedPane')?.classList.remove('selectedPane');
  if (!isPaused) return;
  isPaused = false;
  startImageInterval();
}

document.getElementById('back-btn').addEventListener('click', resumeInterval);

document.querySelector('.button').addEventListener('click', () => {
  const newValue = distance === 100 ? 0 : 100;
  animateDistance(newValue, 1000);
});

function animateDistance(toValue, duration = 600) {
  const el = document.querySelector('.inf-grid-hero-container');
  const fromValue = distance;
  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    distance = fromValue + (toValue - fromValue) * eased;
    el.style.setProperty('--rev-dis', distance.toFixed(2));
    PARAMS.distance = Math.round(distance);
    pane.refresh();
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

document.addEventListener('allImagesLoaded', () => {
  document.body.classList.add('all-loaded');
  console.log(`
    Trigger for all images being loaded. 
    Idea maybe to unload after a set time of loaded and refresh?
  `);
});

/* js gui */
const PARAMS = {
  size: density,
  distance: 0,
  speed: speed,
};

const pane = new Pane();
const size = pane.addBinding( PARAMS, 'size', {min: 2, max: 8, step: 1});
size.on('change', function(ev) {
  density = ev.value;
  renderWalls();
});
const dis = pane.addBinding( PARAMS, 'distance', {min: 0, max: 100, step: 1} );
dis.on('change', function(ev) {
  distance = ev.value;
  document.querySelector('.inf-grid-hero-container').style.setProperty('--rev-dis', distance);
});
const spd = pane.addBinding( PARAMS, 'speed', {min: 50, max: 400, step: 50} );
spd.on('change', function(ev) {
  speed = ev.value;
  startImageInterval();
});