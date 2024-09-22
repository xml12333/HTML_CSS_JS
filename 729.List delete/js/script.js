var animations = [];
animations.push(
  anime({
    targets: "li:nth-child(2) .avatar",
    translateY: {
      value: 150,
      duration: 500,
      delay: 1000,
      easing: "easeInOutQuad"
    }
  })
);
animations.push(
  anime({
    targets: "li:nth-child(2) .lines",
    translateX: {
      value: 500,
      duration: 500,
      delay: 1050,
      easing: "easeInOutQuad"
    },
    complete: () => {
      document.querySelector("#destroy").style.opacity = 1;
      document.querySelector("li:nth-child(2)").style.background =
        "transparent";
    }
  })
);
animations.push(
  anime({
    targets: "path",
    scale: {
      value: 0,
      duration: el => {
        return 500 + Math.random() * 200;
      },
      delay: el => {
        return 1600 + Math.random() * 200;
      },
      easing: "easeInQuad"
    },
    rotate: {
      value: el => {
        return Math.random() * 50 - 25;
      },
      duration: el => {
        return 500 + Math.random() * 200;
      },
      delay: el => {
        return 1600 + Math.random() * 200;
      },
      easing: "easeInQuad"
    }
  })
);
animations.push(
  anime({
    targets: "li:nth-child(2)",
    height: {
      value: 0,
      duration: 500,
      delay: 1900,
      easing: "easeInOutQuad"
    },
    marginTop: {
      value: [20, 0],
      duration: 500,
      delay: 1900,
      easing: "easeInOutQuad"
    },
    padding: {
      value: [20, 0],
      duration: 500,
      delay: 1900,
      easing: "easeInOutQuad"
    }
  })
);

setInterval(() => {
  animations.forEach(function(animation) {
    animation.restart();
    document.querySelector("#destroy").style.opacity = 0;
    document.querySelector("li:nth-child(2)").style.background = "#fff";
    document.querySelector("li:nth-child(2)").style.padding = "20px";
    document.querySelector("li:nth-child(2)").style.marginTop = "20px";
    document.querySelector("li:nth-child(2)").style.height = "100%";
    document.querySelector("li:nth-child(2) .avatar").style.transform = "none";
    document.querySelector("li:nth-child(2) .lines").style.transform = "none";
  });
}, 4000);