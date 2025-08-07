const app = document.querySelector('.chromesthesia')
const audioCtx = new (window.AudioContext || window.webkitAudioContext)
const preview = app.querySelector('color-preview')

app.addEventListener('click', e => {
  const node = e.target
  if (node.tagName === 'COLOR-NOTE') {
    const color = window.getComputedStyle(node).getPropertyValue('background-color')
    app.style.setProperty('--active', color)
    preview.textContent = color
    /* Audio */
    const gainNode = audioCtx.createGain()
    const oscNode = audioCtx.createOscillator()
    gainNode.gain.value = 1
    gainNode.connect(audioCtx.destination)
    oscNode.type = 'triangle'
    oscNode.frequency.value = parseFloat(node.getAttribute('frequency'))
    oscNode.connect(gainNode)
    oscNode.start(0)
    oscNode.stop(audioCtx.currentTime + 1)
    gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.25);
  }
})