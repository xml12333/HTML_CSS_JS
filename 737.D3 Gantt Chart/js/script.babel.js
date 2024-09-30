const composite = document.querySelector('#composite');
const morphology = document.querySelector('#morphology');
const image = document.querySelector('#image');

const min = 2;
const max = 20;
let counter = min;
const step = 4;
let direction = 'forward';
let imagesCounter = 0;
const pausa = 2; // seconds

const images = [
  'https://ic.pics.livejournal.com/yoksel/1816728/2403141/2403141_original.jpg',
  'https://ic.pics.livejournal.com/yoksel/1816728/2404025/2404025_original.jpg',
  'https://ic.pics.livejournal.com/yoksel/1816728/2415467/2415467_original.jpg',
  'https://ic.pics.livejournal.com/yoksel/1816728/2450837/2450837_original.jpg',
  'https://ic.pics.livejournal.com/yoksel/1816728/2454600/2454600_original.jpg',
  'https://ic.pics.livejournal.com/yoksel/1816728/2454000/2454000_original.jpg'
]
 
function changeSeed() {
  if (counter <= min) {
    image.setAttribute('filter', 'url(#pixels)');
  }
  
  if (direction === 'forward') {
    counter += step;
    
    if (counter >= max) {
      direction = 'backward';
      image.setAttribute('xlink:href', images[imagesCounter]);
      imagesCounter++;
      
      if(imagesCounter === images.length) {
        imagesCounter = 0;
      }
    }
  }
  else {
    counter -= step;
    
    if (counter <= min) {
      direction = 'forward';
    }
  }
  composite.setAttribute('width', counter);
  composite.setAttribute('height', counter);
  morphology.setAttribute('radius', Math.ceil(counter / 1.95));
  colormatrix.setAttribute('values', 1 - counter / max);
  
  let time = 75;
  
  if (counter <= min) {
    time = pausa * 1000;  
    image.setAttribute('filter', 'none');
  }
  
  setTimeout(changeSeed, time);
}
 
window.requestAnimationFrame(changeSeed);