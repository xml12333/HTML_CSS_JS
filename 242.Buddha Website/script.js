const closeBtn = document.getElementById("close");
const menuBtn = document.getElementById("menu");
const nav = document.getElementById("nav");

closeBtn.onclick = () => {
  nav.style.top = "-100vh";
};

menuBtn.onclick = () => {
  nav.style.top = "0";
};
