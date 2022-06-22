let select = document.getElementById("select");
let list = document.getElementById("list");
let selectText = document.getElementById("select-text");
let inputfield = document.getElementById("inputfield");
const options = document.querySelectorAll(".options");

select.onclick = () => {
  list.classList.toggle("active");
};
options.forEach((option) => {
  option.onclick = (e) => {
    selectText.innerHTML = e.target.innerHTML;
    inputfield.placeholder = `Search in: ${selectText.innerHTML}`
  };
});
