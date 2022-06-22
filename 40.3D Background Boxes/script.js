const boxesContainer = document.getElementById("boxes");
const btn = document.getElementById("btn");

function createBoxes() {
  for (let i = 0; i < 4; i++) {
    for (let x = 0; x < 4; x++) {
      const box = document.createElement("div");
      box.classList.add("box");
      box.style.backgroundPosition = `${-x * 125}px ${-i * 125}px`;
      boxesContainer.appendChild(box);
    }
  }
}

btn.addEventListener("click", () =>  boxesContainer.classList.toggle("big")
);

createBoxes();
