const slideImg = document.getElementById("slideImg");
let images = new Array("img/background.jpg", "img/pic-2.jpg", "img/pic-4.jpg");
let i = 0;
const len = images.length;
function slider() {
  if (i > len - 1) {
    i = 0;
  }
  slideImg.src = images[i];
  i++;
  setTimeout("slider()", 3000);
}

document.getElementsByTagName("body").onload = slider();
