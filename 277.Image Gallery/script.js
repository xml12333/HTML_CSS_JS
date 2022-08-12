const smallImg = document.getElementById("smallimg");
const imgBox = document.getElementById("img-box");
const li = Array.from(document.querySelectorAll("li"));
const btnMenu = document.getElementById("btn-menu");

li.forEach((el, idx) =>
  el.addEventListener("click", () => {
    smallImg.src = `img/img${idx + 1}.jpg`;
  })
);
btnMenu.onclick = () => {
  if (imgBox.className == "small") {
    imgBox.className = "full";
    btnMenu.innerHTML = "&#9776;";
  } else {
    imgBox.className = "small";
    btnMenu.innerHTML = "&#10006;";
  }
};
