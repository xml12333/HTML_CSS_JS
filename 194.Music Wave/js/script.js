const playEl = document.getElementById("play");
const stopEl = document.getElementById("stop");
const volumeEl = document.getElementById("volume");

var wavesurfer = WaveSurfer.create({
  container: "#waveform",
  waveColor: "#dde5ec",
  progressColor: "#03cebf",
  barWidth: 4,
  height: 90,
  responsive: true,
  hideScrollbar: true,
  barRadius: 4,
});
wavesurfer.load("media/baa.mp3");

playEl.onclick = () => {
  wavesurfer.playPause();
  if (playEl.src.includes("play.png")) {
    playEl.src = "media/pause.png";
  } else {
    playEl.src = "media/play.png";
  }
};
stopEl.onclick = () => {
  wavesurfer.stop();
  playEl.src = "media/play.png";
};
volumeEl.onclick = () => {
  wavesurfer.toggleMute();
  if (volumeEl.src.includes("volume.png")) {
    volumeEl.src = "media/mute.png";
  } else {
    volumeEl.src = "media/volume.png";
  }
};

wavesurfer.on("finish", () => {
  playEl.src = "media/play.png";
  wavesurfer.stop();
});
