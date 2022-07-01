const selectField = document.getElementById("selectField");
const selectText = document.getElementById("selectText");
const list = document.getElementById("list");
const arrowIcon = document.getElementById("arrowIcon");
const options = document.getElementsByClassName("options");

for (option of options) {
  option.onclick = (e) => {
    selectText.innerHTML = e.target.textContent;
    list.classList.toggle("hide");
    arrowIcon.classList.toggle("rotate");
  };
}

selectField.onclick = () => {
  list.classList.toggle("hide");
  arrowIcon.classList.toggle("rotate");
};
