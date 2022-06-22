let links = document.getElementsByClassName("link");
function removeActive() {
  for (link of links) {
    link.classList.remove("active");
  }
}
for (link of links) {
  link.onclick = function () {
    removeActive();
    this.classList.add("active");
  };
}
