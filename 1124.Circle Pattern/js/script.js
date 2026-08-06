const circleElements = document.querySelectorAll(".circle");

document.body.addEventListener("mousemove", (e) => {
  const percentX = e.clientX / window.innerWidth;
  const percentY = e.clientY / window.innerHeight;
  const amplitude = 0 + 500 * percentX + "px";
  const scale = 0 + 10 * percentY;
  Array.from(circleElements).forEach((element) => {
    element.setAttribute(
      "style",
      `animation: none; --amplitude: ${amplitude}; --scale: ${scale};`
    );
  });
});

document.body.addEventListener("touchmove", (e) => {
  const percentX = e.touches[0].clientX / window.innerWidth;
  const percentY = e.touches[0].clientY / window.innerHeight;
  const amplitude = 0 + 500 * percentX + "px";
  const scale = 0 + 10 * percentY;
  Array.from(circleElements).forEach((element) => {
    element.setAttribute(
      "style",
      `animation: none; --amplitude: ${amplitude}; --scale: ${scale};`
    );
  });
});

document.body.addEventListener("mouseleave", (e) => {
  Array.from(circleElements).forEach((element) => {
    element.removeAttribute("style");
  });
});