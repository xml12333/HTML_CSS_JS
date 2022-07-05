const song = document.getElementById("song");
const icon = document.getElementById("icon");

icon.onclick = () => {
  if (song.paused) {
    song.play();
    icon.src = "img/pause.png";
  }else{
    song.pause();
    icon.src = "img/play.png";
  }
};
