const red = document.querySelector("#red");
const yellow = document.querySelector("#yellow");

let frame = 1;

setInterval(() => {
  frame = frame === 10 ? 1 : frame + 1;
  const frameString = frame.toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false
  });
  red.style.backgroundImage = `url('./img/RED-${frameString}.png')`;
  yellow.style.backgroundImage = `url('./img/YELLOW-${frameString}.png')`;
}, 140);