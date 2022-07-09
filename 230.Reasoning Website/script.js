const slider = document.getElementById("slider");
const active = document.getElementById("active");
const line1 = document.getElementById("line1");
const line2 = document.getElementById("line2");
const line3 = document.getElementById("line3");
const line4 = document.getElementById("line4");

line1.onclick = () => {
  slider.style.transform = "translateX(0)";
  active.style.top = '0px'
};
line2.onclick = () => {
  slider.style.transform = "translateX(-25%)";
  active.style.top = '80px'
};
line3.onclick = () => {
  slider.style.transform = "translateX(-50%)";
  active.style.top = '160px'
};
line4.onclick = () => {
  slider.style.transform = "translateX(-100%)";
  active.style.top = '240px'
};
