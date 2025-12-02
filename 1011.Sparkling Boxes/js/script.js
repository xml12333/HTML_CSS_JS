import AttractionCursor from "https://cdn.jsdelivr.net/npm/threejs-components@0.0.26/build/cursors/attraction1.min.js"

const app = AttractionCursor(document.getElementById('canvas'), {
  particles: {
    attractionIntensity: 0.75,
    size: 1.5,  
  },
})

const button1 = document.getElementById('colors-btn')

button1.addEventListener('click', () => {
  app.particles.light1.color.set(Math.random() * 0xffffff)
  app.particles.light2.color.set(Math.random() * 0xffffff)
})