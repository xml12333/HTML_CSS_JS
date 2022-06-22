const FShoes1 = document.getElementById("front-shoes-1");
const FShoes2 = document.getElementById("front-shoes-2");
const BShoes1 = document.getElementById("back-shoes-1");
const BShoes2 = document.getElementById("back-shoes-2");
const FImg = document.getElementById("frontImg");
const BImg = document.getElementById("backImg");

const productBox = document.getElementById("product-box");

FShoes2.onclick = () => {
  productBox.style.transform = "rotateY(-180deg)";
  FImg.style.left = "650px";
  BImg.style.left = "20px";
  FImg.style.transform = "rotate(-30deg)";
  BImg.style.transform = "rotate(0deg)";
};
BShoes1.onclick = () => {
  productBox.style.transform = "rotateY(0deg)";
  FImg.style.left = "20px";
  BImg.style.left = "-650px";
  FImg.style.transform = "rotate(0deg)";
  BImg.style.transform = "rotate(-30deg)";
};
