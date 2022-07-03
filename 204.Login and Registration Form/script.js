const buttonReg = document.querySelector(".card-front .btn");
const buttonLogin = document.querySelector(".card-back .btn");
const card = document.getElementById("card");

buttonReg.onclick = () => {
    card.style.transform="rotateY(-180deg)"
};

buttonLogin.onclick = () => {
    card.style.transform="rotateY(0deg)"
};