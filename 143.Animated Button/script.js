const btn = document.getElementById("btn");
const btnText = document.getElementById("btnText");

btn.onclick = () => {
  btnText.innerHTML = "Thanks";
  btn.classList.add("active");
};
