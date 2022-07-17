const svgCircle = document.getElementById("svgCircle");
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");
const step4 = document.getElementById("step4");
const step5 = document.getElementById("step5");
const main = document.getElementById("main");
const userBox = document.getElementById("userBox");

main.style.backgroundImage = "url(img/img-1.jpg)";
step1.onclick = () => {
  svgCircle.style.strokeDashoffset = "1004";
  main.style.backgroundImage = "url(img/img-2.jpg)";
  userBox.style.top = "-350px";
};
step2.onclick = () => {
  svgCircle.style.strokeDashoffset = "753";
  main.style.backgroundImage = "url(img/img-3.jpg)";
  userBox.style.top = "-800px";
};
step3.onclick = () => {
  svgCircle.style.strokeDashoffset = "502";
  main.style.backgroundImage = "url(img/img-4.jpg)";
  userBox.style.top = "-1250px";
};
step4.onclick = () => {
  svgCircle.style.strokeDashoffset = "251";
  main.style.backgroundImage = "url(img/img-5.jpg)";
  userBox.style.top = "-1700px";
};
step5.onclick = () => {
  svgCircle.style.strokeDashoffset = "0";
  main.style.backgroundImage = "url(img/img-1.jpg)";
  userBox.style.top = "100px";
};
