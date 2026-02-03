const musicBtn = document.getElementById("musicBtn");
const audio = document.getElementById("bgm");

musicBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    musicBtn.textContent = "⏸";
  } else {
    audio.pause();
    musicBtn.textContent = "♪";
  }
});