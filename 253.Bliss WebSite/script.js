const imgBtn = document.getElementById("imgBtn");

imgBtn.onclick = () => {
  if (clouds.style.animationPlayState == "paused") {
    clouds.style.animationPlayState = "running";
    airplane.style.animationPlayState = "running";
    hotairballon.style.animationPlayState = "running";
    imgBtn.src = 'img/pause.png'
  } else {
    clouds.style.animationPlayState = "paused";
    airplane.style.animationPlayState = "paused";
    hotairballon.style.animationPlayState = "paused";
    imgBtn.src = 'img/play.png'
  }
};
