const slide = document.getElementById("slide");
const upArrow = document.getElementById("upArrow");
const downArrow = document.getElementById("downArrow");
const card = document.querySelectorAll(".card");
let cardArr = Array.from(card);
let scrollSize = 300;
let x = 0;
upArrow.onclick = () => {
  if (x > -1 * (cardArr.length-1) * scrollSize) {
    x = x - scrollSize;
    slide.style.top = x + "px";
  }
};

downArrow.onclick = () => {
  if (x < 0) {
    x = x + scrollSize;
    slide.style.top = x + "px";
  }
};
