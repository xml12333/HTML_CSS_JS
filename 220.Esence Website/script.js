const btn = document.getElementsByClassName("btn");
const pic = document.getElementById("picture");

btnArray = Array.from(btn);
btnArray.forEach((el, idx) => {
  el.addEventListener("click", (e) => {
    const current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace("active", "");
    e.target.className += " active";
    pic.src = `img/pic${idx+1}.png`;
  });
});
