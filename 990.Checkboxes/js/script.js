document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(EasePack);

  const roughSlide = {
    element: document.getElementById("rough-slide-toggle-control"),
    handler: svgSlideEffect,
    offset: 0.015,
    duration: 0.4,
    random: true,
    ease: RoughEase.ease.config({ strength: 5, points: 20 })
  };

  const elasticSlide = {
    element: document.getElementById("elastic-slide-toggle-control"),
    handler: svgSlideEffect,
    offset: 0.015,
    duration: 1.8,
    random: true,
    ease: "elastic.out(1.4, 0.4)"
  };

  const uniformRoughSlide = {
    element: document.getElementById("uniform-rough-slide-toggle-control"),
    handler: svgSlideEffect,
    offset: 0.015,
    duration: 0.4,
    random: false,
    ease: RoughEase.ease.config({ strength: 3, points: 15 })
  };

  const uniformElasticSlide = {
    element: document.getElementById("uniform-elastic-slide-toggle-control"),
    handler: svgSlideEffect,
    offset: 0.015,
    duration: 1.8,
    random: false,
    ease: "elastic.out(1.4, 0.4)"
  };

  new SvgToggleEffect(roughSlide);
  new SvgToggleEffect(elasticSlide);
  new SvgToggleEffect(uniformRoughSlide);
  new SvgToggleEffect(uniformElasticSlide);
});

class SvgToggleEffect {
  constructor(effect) {
    effect.element.addEventListener("change", () => {
      this.nodes = [
        ...effect.element.nextElementSibling.querySelectorAll(".switch rect")
      ];

      if (effect.random) {
        this.randomizeArray(this.nodes);
      }

      if (effect.element.checked) {
        effect.handler(
          this.nodes,
          false,
          effect.duration,
          effect.offset,
          effect.ease
        );
      } else {
        effect.handler(
          this.nodes,
          true,
          effect.duration,
          effect.offset,
          effect.ease
        );
      }
    });
  }

  randomizeArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

const svgSlideEffect = (
  nodes = [],
  reverse = false,
  duration = 100,
  offset = 10,
  ease = "elastic.out(1.4, 0.4)"
) => {
  gsap.to(nodes, {
    duration: duration,
    ease: ease,
    x: reverse ? 0 : 48,
    stagger: offset,
    overwrite: true
  });
};