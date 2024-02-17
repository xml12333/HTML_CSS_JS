document.getElementById('app')
app.innerHTML = 
  render(15, 0, '#643A6B') +
  render(15, 180, '#AE445A') +
  render(15, 90, '#2E8A99') +
  render(15, 270, '#F39F5A')
 
function render(items, offset = 0, color = "red") {
  const rad = 180 / items;
  const delay = 4000 / items;
  return [...Array(items).keys()]
  .map(
    (index) =>
      `<i style="--_bg:${color};--_deg:${rad * index + offset}deg;--_del:${
        delay * index
      }ms;"></i>`,
  )
  .join("");
}