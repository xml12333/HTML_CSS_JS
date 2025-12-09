gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

ScrollSmoother.create({
  smooth: 1,
  effects: true,
  normalizeScroll: true
});

gsap
  .timeline({
    scrollTrigger: {
      trigger: ".hero-container",
      start: "top top",
      end: "+=150%",
      pin: true,
      scrub: 1
      // markers: true
    }
  })
  .to(".hero__cover-img", {
    scale: 2,
    z: 350,
    transformOrigin: "center center",
    ease: "power1.inOut"
  })
  .to(
    ".hero__cover",
    {
      "--overlay-opacity": 0,
      ease: "power1.inOut"
    },
    "<" // sync with image zoom
  )
  .to(
    ".hero__bg",
    {
      scale: 1.1,
      filter: "blur(0px) brightness(1)",
      ease: "power1.inOut"
    },
    "<"
  )
  .to(
    ".hero__title",
    {
      scale: 1,
      xPercent: -50,
      yPercent: -50,
      opacity: 1,
      filter: "blur(0px)",
      ease: "power1.inOut"
    },
    "<"
  );

const splitLetters = SplitText.create(
  document.querySelector(".opacity-reveal")
);
gsap.set(splitLetters.chars, { opacity: "0.2", y: 0 });

gsap
  .timeline({
    scrollTrigger: {
      trigger: ".section-stick",
      pin: true,
      start: "center center",
      end: "+=1500",
      //markers: true,
      scrub: 1
    }
  })
  .to(splitLetters.chars, {
    opacity: "1",
    duration: 1,
    ease: "none",
    stagger: 1
  })
  .to({}, { duration: 10 })
  .to(".opacity-reveal", {
    opacity: "0",
    scale: 1.2,
    duration: 50
  });