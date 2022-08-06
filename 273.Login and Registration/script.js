const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const loginForm = document.getElementById("login");
const registerForm = document.getElementById("register");
const btnBackground = document.getElementById('btn');

registerBtn.onclick = () => {
  loginForm.style.left = "-400px";
  registerForm.style.left = "50px";
  btnBackground.style.left = "110px";
};
loginBtn.onclick = () => {
  loginForm.style.left = "50px";
  registerForm.style.left = "450px";
  btnBackground.style.left = "0px";
};
