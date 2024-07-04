const phrases = [
  'Hydrating Plant Material',
  'Realigning Bark Textures',
  'Reevaluating Vehicle Use',
  'Calculating Maximum Growth',
  'Planning Rooftop Garden',
  'Sweetening Fall Harvest',
  'Reticulating Leaf Configuration',
  'Harvesting Firewood Branches',
  'Welcoming Passing Dogs',
  'Enforcing Reforestation',
  'Withering Summer Leaves',
  'Cultivating Nearby Fields',
].map(value => ({ value, sort: Math.random() }))
.sort((a, b) => a.sort - b.sort)
.map(({ value }) => value)

const nextPhrase = () => {
  message = document.createElement('p')
  phrase = phrases.pop()
  message.innerText = phrase
  messages.appendChild(message)
  phrases.unshift(phrase)
  messages.removeChild(messages.children[0])
}

nextPhrase()
setTimeout(nextPhrase, 100)
setInterval(nextPhrase, 2500)