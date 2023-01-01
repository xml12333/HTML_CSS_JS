const getMeta = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });

(async () => {
  const img = await getMeta("img/bg2.png");
  console.log("Img:" + img.naturalWidth + " " + img.naturalHeight);
  console.log("Screen:" + window.innerWidth + " " + window.innerHeight);
  console.log(
    "Center:" +
      (img.naturalWidth - window.innerWidth) +
      " " +
      (img.naturalHeight - window.innerHeight)
  );
  ImageDistortion();
})();

function ImageDistortion(blockWidth, blockWidth) {
  let container = document.querySelector(".container");
  for (let i = 0; i < 20; i++) {
    for (let x = 0; x < 20; x++) {
      let block = document.createElement("div");
      block.classList.add("block");
      block.style.backgroundPosition = `${-x * 5}vw ${-i * 5}vh`;
      container.appendChild(block);
    }
  }
  let block = document.querySelectorAll(".block");
//   block.forEach((el) => (el.style.backgroundAttachment = "fixed"));
  let animation = anime.timeline({
    targets: block,
    easing: "easeInOutExpo",
    loop: true,
    delay: anime.stagger(10, { start: 50 }),
  });

  animation
    .add({
      scale: 0,
      translateX: function () {
        return anime.random(360, 2100);
      },
      translateY: function () {
        return anime.random(360, -2100);
      },
      rotate: function () {
        return anime.random(-360, 360);
      },
      duration: function () {
        return anime.random(500, 3000);
      },
    })
    .add({
      scale: 1,
      translateX: 0,
      translateY: 0,
      rotate: 0,
      duration: function () {
        return anime.random(500, 3000);
      },
    });
}
