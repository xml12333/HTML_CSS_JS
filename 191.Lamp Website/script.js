const turnOnOff = document.getElementById("turnOnOff");
const light = document.getElementById("light");
turnOnOff.onclick = () => {
  turnOnOff.classList.toggle("active");
  light.classList.toggle("on");
};
