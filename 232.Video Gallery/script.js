const closeBtn = document.querySelector(".close-btn");
const playBtns = Array.from(document.querySelectorAll(".play-btn"));
const videoPlayer = document.getElementById("video-player");
const video = document.getElementById("video");
closeBtn.onclick = () => {
  videoPlayer.style.display = "none";
};

playBtns.forEach((el, idx) => {
  el.onclick = () => {
    video.src = `img/vid${idx+1}.mp4`;
    videoPlayer.style.display = "block";
  };
});
