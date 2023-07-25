const themes = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b', '#000000', '#ffffff'];
const forms = ["", "border", "circle"];
const rounds = ["", "round", "left-round", "right-round", "no-round"];
const colors = ["", "fill"];
const badges = ["", "<span class='badge circle small-margin'>9</span>"];
const tooltips = ["", "<span class='tooltip'>Tooltip</span>"];
const menus = ["", "<menu><a>Item 1</a><a>Item 2</a><a>Item 3</a></menu>"];
const sizes = ["", "small", "medium", "large"];
const icons = ["<i>search</i>"];
const images = ["<img src='https://www.beercss.com/favicon.png'>"];
const positions = [0, 1, 2, 3];
const medias = [0, 1];

function getIndex(list) {
  return Math.floor(Math.random() * list.length);
}

function update() {
  const elements = document.querySelectorAll(".chip");
  for(let element of elements) {
    
    let position = positions[getIndex(positions)];
    let media = medias[getIndex(medias)];
    let form = forms[getIndex(forms)];
    let round = rounds[getIndex(rounds)];
    let badge = badges[getIndex(badges)];
    let tooltip = tooltips[getIndex(tooltips)];
    let color = colors[getIndex(colors)];
    let html = "<span>Chip</span>";
    
    if (form == "circle" || form == "square") position = 1;
    if (form == "border") color = "";
    
    if (position === 1) {
      html = !media
        ? icons[getIndex(icons)] + html 
        : images[getIndex(images)] + html;
    }
    
    if (position === 2) {
      html += !media
        ? icons[getIndex(icons)]
        : images[getIndex(images)];
    }
    
    if (position === 3) {
      html = !media
        ? icons[getIndex(icons)] + html + icons[getIndex(icons)]
        : images[getIndex(images)] + html + images[getIndex(images)];
    }
    
    if (badge) html += badge;
    
    if (tooltip) html += tooltip;
    
    let css = "chip";
    css += " " + form;
    css += " " + round;
    css += " " + color;
    css += " " + sizes[getIndex(sizes)];
    element.className = css;
    element.innerHTML = html;
  }
}

function updateMode() {
  ui("theme", themes[getIndex(themes)]);
  ui("mode", ui("mode") == "dark" ? "light" : "dark");
}

update();
setInterval(update, 3000);
setInterval(updateMode, 6000);