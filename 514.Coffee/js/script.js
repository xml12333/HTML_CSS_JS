let options = document.querySelectorAll(".options div");
let cup = document.querySelector(".cup");
let title = document.querySelector(".title");

function formatOption(option) {
    return option.toLowerCase().replace(/\s/g, "-");
}

options.forEach((option) => {
    option.addEventListener("click", function() {
        options.forEach((opt) => {
            cup.classList.remove(formatOption(opt.textContent));
        });
        cup.classList.add(formatOption(this.textContent));
        title.innerHTML = this.textContent;
    });
});