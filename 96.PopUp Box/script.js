const btn = document.getElementById("btn");
const btnOk = document.getElementById("btnOk");
const popup = document.getElementById("popup");

btn.onclick = () => {
  popup.classList.toggle("open-popup");
};

btnOk.onclick = () => {
  popup.classList.toggle("open-popup");
};
