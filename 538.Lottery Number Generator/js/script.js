const app = document.getElementById('app')
const generate = document.getElementById('generate')
const result = document.getElementById('result')

generate.addEventListener('click', () => result.innerHTML = render())
generate.dispatchEvent(new Event('click'))

function render() {
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min).toString().padStart(2, '0');
  const rows = Array.from({ length: app.numberOfRows.valueAsNumber }, () => {
    const numbers = new Set();
    const bonus = new Set();
    while (numbers.size < app.numbersPerRow.valueAsNumber) {
      numbers.add(random(app.startNumber.valueAsNumber, app.endNumber.valueAsNumber))
    }
    while (bonus.size < app.bonusNumbers.valueAsNumber) {
      bonus.add(random(app.bonusStart.valueAsNumber, app.bonusEnd.valueAsNumber))
    }
    return [
      Array.from(numbers).sort().map(number => `<td>${number}</td>`).join(''),
      Array.from(bonus).sort().map(number => `<th>${number}</th>`).join('')
    ]
  })
  return `<tr>${rows.join('</tr><tr>')}</tr>`.replaceAll(',', '')
}