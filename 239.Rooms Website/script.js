const slide = document.getElementById("slide");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
let slideimages = new Array(
  "images/pic-1.jpg",
  "images/pic-2.jpg",
  "images/pic-3.jpg",
  "images/pic-4.jpg"
);
let i = 0;
nextBtn.onclick = () => {
  if (i < slideimages.length - 1) {
    slide.src = slideimages[i + 1];
    i++;
  }
};

backBtn.onclick = () => {
  if (i > 0) {
    slide.src = slideimages[i - 1];
    i--;
  }
};
