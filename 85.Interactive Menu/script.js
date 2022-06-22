const menu = document.getElementById("menu");
const closeBtn = document.getElementById("close-menu");
const openBtn = document.getElementById("open-menu");

closeBtn.onclick = () => {
  menu.classList.add("close");
};

openBtn.onclick = () => {
  menu.classList.toggle("close");
};
