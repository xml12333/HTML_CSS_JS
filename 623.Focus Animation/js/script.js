"use strict";
console.clear();

(function () {
  const lapNum = 10;
  const roughness = 2.5;
  const strokeWidth = 1;
  const incrementRatio = 8;
  const color = "hsl(320deg, 100%, 90%)";
  const animation = true;
  const animInterval = 220;
  const ellipse = document.getElementById("rough");
  const content = document.getElementById("msg");
  //
  function run() {
    ellipse.width = window.innerWidth;
    ellipse.height = window.innerHeight;
    let cv = rough.canvas(ellipse);
    const elemRect = content.getBoundingClientRect();
    let w = elemRect.width;
    let h = elemRect.height;
    let centerX = elemRect.left + w / 2;
    let centerY = elemRect.top + h / 2;
    for (let i = 0; i < lapNum; i++) {
      w += strokeWidth * incrementRatio;
      h += strokeWidth * incrementRatio;
      cv.ellipse(centerX, centerY, w, h, {
        roughness: roughness,
        stroke: color,
        strokeWidth: strokeWidth
      });
    }
  }
  //
  window.onresize = run;

  if (animation) {
    let startTime = Date.now();
    let endTime;
    function anim(callback) {
      endTime = Date.now();
      if (endTime - startTime >= animInterval) {
        run();
        startTime = endTime;
      }
      window.requestAnimationFrame(anim);
    }
    anim();
  } else {
    run();
  }
})();
