const btn = document.getElementsByClassName("btn");
const banner = document.getElementById("banner");

const btnArr = Array.from(btn);
btnArr.forEach((el, idx) => {
  el.onclick = () => {
    banner.src = `images/pic${idx + 1}.png`;
    banner.classList.add("zoom");
    setTimeout(() => {
      banner.classList.remove("zoom");
    }, 500);
    for (b of btnArr) {
      b.classList.remove("active");
    }
    el.classList.add("active");
  };
});
