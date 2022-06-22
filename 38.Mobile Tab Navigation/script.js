var contents = document.querySelectorAll(".content");
var listItems = document.querySelectorAll("nav ul li");

listItems.forEach((item, idx) => {
  item.addEventListener("click", () => {
    console.log(contents);
    hideAllContents();
    hideAllItems();
    item.classList.add("active");
    contents[idx].classList.add("show");
  });
});

function hideAllContents() {
  contents.forEach((content) => content.classList.remove("show"));
}
function hideAllItems() {
  listItems.forEach((item) => item.classList.remove("active"));
}
