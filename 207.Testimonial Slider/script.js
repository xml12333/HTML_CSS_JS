const slide = document.getElementById("slide");
const btnArray = Array.from(document.getElementsByClassName("btn"));
btnArray.forEach((el, idx) => {
  el.onclick = (e) => {
    slide.style.transform = `translateX(${idx * -800}px)`;
    for (let i = 0; i < btnArray.length; i++) {
      btnArray[i].classList.remove("active");
    }
    e.target.classList.add("active");
  };
});
