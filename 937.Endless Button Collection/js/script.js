window.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.getElementById("wrapper");

  for (let i = 0; i < 80; i++) {
    newButton();
  }
});

function scrollWrapper() {
  const wrapper = document.getElementById("wrapper");

  if (wrapper.scrollTop + wrapper.clientHeight >= wrapper.scrollHeight - 100) {
    for (let i = 0; i < 8; i++) {
      newButton();
    }
  }
}

function newButton() {
  const newButton = document.createElement("div");
  newButton.className = "button";
  newButton.style.fontSize = Math.random() + 0.5 * 10 + "vw";
  newButton.style.borderRadius = Math.random() * 10 + "vw";
  newButton.style.setProperty(
    "--bg",
    "rgb(" +
      Math.random() * 255 +
      "," +
      Math.random() * 255 +
      "," +
      Math.random() * 255 +
      ")"
  );
  newButton.style.transform =
    "scale(" +
    [Math.random() * 0.5 + 0.5] +
    ") rotate(" +
    Number(Math.random() * 60 - 30) +
    "deg)";
  wrapper.appendChild(newButton);
}