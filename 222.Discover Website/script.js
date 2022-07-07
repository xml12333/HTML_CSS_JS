const prev = document.getElementById("prev");
const next = document.getElementById("next");
const thumbnail = document.getElementsByClassName("thumbnail");
const hero = document.getElementById("hero");
let idx = 1;
next.onclick = () => {
  thumbnail[idx-1].classList.remove("active");
  if (idx <= thumbnail.length - 1) {
    idx++;
  } else {
    idx = 1;
  }
  hero.style.backgroundImage = `url("img/bg${idx}.png")`;
  thumbnail[idx-1].classList.add("active");
};

prev.onclick = () => {
  thumbnail[idx-1].classList.remove("active");
  if (idx > 1) {
    idx--;
  } else {
    idx = thumbnail.length;
  }
  console.log(idx);
  hero.style.backgroundImage = `url("img/bg${idx}.png")`;
  thumbnail[idx-1].classList.add("active");
};
