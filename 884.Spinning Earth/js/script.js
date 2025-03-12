const UI = {
  bands: document.querySelector('#bands'),
  world: document.querySelector('.world')
}

const render = ({ bands }) => {
  UI.world.style.setProperty('--bands', bands)
  UI.world.innerHTML = Array
    .from({ length: bands }, (_, i) => `
      <div class="band" style="--i: ${i}"></div>
    `)
    .join('')
}

UI.bands.addEventListener('input', (e) => {
  render({ bands: +e.target.value })
})

render({ bands: 150 })