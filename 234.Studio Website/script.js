const btn = Array.from(document.getElementsByClassName("btn"));
const gallery = document.getElementById("gallery");

btn.forEach((el, idx) => {
  el.onclick = () => {
    gallery.src = `img/pic${idx + 1}.jpg`;
    let current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace("active", "");
    el.className += " active";
  };
});
