const toggles = document.querySelectorAll(".faq-toggle")

addMotion();

function addMotion() {
    toggles.forEach((toggle) => {
        toggle.addEventListener("click", () => {
            toggle.parentNode.classList.toggle("active");
        });
  });
}



