const slides = document.querySelectorAll(".slide");
const left = document.getElementById("left");
const right = document.getElementById("right");
const carousel = document.getElementById("carousel");

const SLIDES_COUNT = slides.length;

let current_slide = 0;

right.addEventListener("click", () => {
  current_slide++;
  if (current_slide > SLIDES_COUNT - 1) {
    current_slide = 0;
  }
  updateCarousel();
});
left.addEventListener("click", () => {
  current_slide--;
  if (current_slide < 0) {
    current_slide = SLIDES_COUNT - 1;
  }
  updateCarousel();
});

function updateCarousel() {
  carousel.style.transform = `translateX(${
    -1 * current_slide * slides[0].offsetWidth
  }px)`;

  document.body.style.background = `#${slides[current_slide].getAttribute(
    "data-bg"
  )}`;
}
