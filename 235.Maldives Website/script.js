const backVideo = document.getElementById("backVideo");
const playBtn = document.getElementById("playBtn");
const icon = document.getElementById("icon");

playBtn.onclick = () => {
  backVideo.style.display = "block";
    console.log(backVideo.paused)
  if (backVideo.paused) {
    backVideo.play();
    icon.src = "img/pause.png";
  } else {
    backVideo.pause();
    icon.src = "img/play.png";
  }
};
