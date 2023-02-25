import gsap from "https://cdn.skypack.dev/gsap@3.11.0";
import { ScrollTrigger } from "https://cdn.skypack.dev/gsap@3.11.0/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

gsap.defaults({
  duration: 2,
  ease: "power1.inOut"
});

gsap
  .timeline({
    scrollTrigger: {
      scrub: 1,
    }
  })
  .to("ul", {
    scale: 1,
    rotate: 270
  })
  .to(
    "img",
    {
      rotate: -270
    },
    0
  );
