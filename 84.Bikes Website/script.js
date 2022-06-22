let redBtn = document.querySelector(".color-select div.red");
let blueBtn = document.querySelector(".color-select div.blue");
let blackBtn = document.querySelector(".color-select div.black");
let bike = document.getElementById("bike");

redBtn.onclick = () => {
  bike.style.backgroundImage = "url(img/BMW1.png)";
};
blueBtn.onclick = () => {
  bike.style.backgroundImage = "url(img/BMW2.png)";
};
blackBtn.onclick = () => {
  bike.style.backgroundImage = "url(img/BMW3.png)";
};
