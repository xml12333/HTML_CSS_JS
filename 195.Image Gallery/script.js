const closeBtn = document.getElementById("closeBtn");
const fullImg = document.getElementById("fullImg");
const imgEl = document.getElementById("img");
const imges = document.querySelectorAll(".img-gallery img");

const imgesArr = Array.from(imges);
imgesArr.forEach((img) => {
  img.onclick = () => {
    fullImg.style.display = "flex";
    imgEl.src = img.src;
  };
});

closeBtn.onclick = () => {
    fullImg.style.display = "none";
};
