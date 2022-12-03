let menuToggle = document.querySelector(".menuToggle");
let navigation = document.querySelector(".navigation");
menuToggle.onclick = () => navigation.classList.toggle("active");

let list = document.querySelectorAll(".list");
function activeLink() {
  list.forEach((l) => {
    l.classList.remove("active");
    this.classList.add("active");
  });
}
list.forEach((l) => {
  l.addEventListener("click", activeLink);
});
