const video = document.getElementById("video");
const stop = document.getElementById("stop");
const play = document.getElementById("play");
const progress = document.getElementById("progress");
const timestamp = document.getElementById("timestamp");

function togglevideoStatus() {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}

function updatePlayIcon() {
  if (video.paused) {
    play.innerHTML = '<i class="fa fa-play fa-2x"></i>';
  } else {
    play.innerHTML = '<i class="fa fa-pause fa-2x"></i>';
  }
}
function updateProgress() {
  progress.value = (video.currentTime / video.duration) * 100;
  let mins = Math.floor(video.currentTime/60)
  if(mins < 10){
      mins = '0'+String(mins)
  }
  let secs = Math.floor(video.currentTime%60)
  if(secs < 10){
    secs = '0'+String(secs)
  }

  timestamp.innerHTML = `${mins}:${secs}`
}
function setVideoProgress() {
  video.currentTime = (+progress.value * video.duration) / 100;
}
function stopVideo() {
  video.currentTime = 0;
  video.pause();
}

video.addEventListener("click", togglevideoStatus);
video.addEventListener("pause", updatePlayIcon);
video.addEventListener("play", updatePlayIcon);
video.addEventListener("timeupdate", updateProgress);

play.addEventListener("click", togglevideoStatus);
stop.addEventListener("click", stopVideo);
progress.addEventListener("change", setVideoProgress);
