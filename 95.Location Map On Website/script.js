const checkbox = document.querySelector(".container");
const iframe = document.querySelector("iframe");
checkbox.addEventListener("change", () => {
  checkbox.classList.toggle("dark");
  iframe.style.filter =
    iframe.style.filter == "invert(100%)" ? "invert(0%)" : "invert(100%)";
});
