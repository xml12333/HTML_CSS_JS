const $el = document.querySelector(".handwritten");
const animations = $el.getAnimations({ subtree: true });
const replay = document.querySelector("#replay");

await Promise.all(animations.map((a) => a.finished));

replay.classList.add("fade-in");

replay.addEventListener("click", () => {
  animations.forEach((anim) => {
    anim.cancel();
    anim.play();
  });
});
