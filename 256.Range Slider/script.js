const slider = document.getElementById("slider");
const selector = document.getElementById("selector");
const selectValue = document.getElementById("selectValue");
const progressBar = document.getElementById("progressBar");
selectValue.innerHTML = slider.value;

slider.oninput = (e) => {
  selector.style.left = e.target.value + "%";
  progressBar.style.width = e.target.value + "%";
  selectValue.innerHTML = e.target.value;
};
