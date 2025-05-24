gsap.registerPlugin(ScrollTrigger, SplitText, Physics2DPlugin);

function initFallingTextGravity() {
  new SplitText("[data-drop-text]", {
    type: "lines, chars",
    autoSplit: true, // resplit split if the element resizes and it's split by lines
    linesClass: "line",
    onSplit(self) {
      // use a context to collect up all the animations
      let ctx = gsap.context(() => {
        self.lines.forEach((line) => { // loop around the lines
          // only one timeline per line rather than one per element
          gsap
            .timeline({
              scrollTrigger: {
                once: true, // only fire once
                trigger: line, // use the line as a trigger
                start: "top top-=10" // adjust offset as you see fit
              }
            })
            .to(line.children, { // target the children
              duration: "random(1.5, 3)", // Use GSAP utils for randomized values
              physics2D: {
                velocity: "random(500, 1000)",
                angle: 90,
                gravity: 3000
              },
              rotation: "random(-90, 90)",
              ease: "none"
            })
            .to(
              line.children,
              {
                autoAlpha: 0,
                duration: 0.2
              },
              "-=.2"
            );
        });
      });

      return ctx; // return our animations so GSAP can clean them up when onSplit fires
    }
  });
}

// Initialize Falling Text with Gravity
document.addEventListener("DOMContentLoaded", () => {
  initFallingTextGravity();
});