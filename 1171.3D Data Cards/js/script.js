gsap.registerPlugin(ScrollTrigger);

// Compute arc circumferences for stroke-dashoffset draw-on
document.querySelectorAll(".arc").forEach((arc) => {
  const r = parseFloat(arc.getAttribute("r"));
  const c = 2 * Math.PI * r;
  arc.style.strokeDasharray = c;
  arc.style.strokeDashoffset = c;
});

// ============================================================
// INITIAL STATES
// ============================================================
gsap.set(".top-divider .line", { scaleX: 0, transformOrigin: "center" });
gsap.set(".top-divider .dot", { scale: 0 });
gsap.set(".pill", { y: 80, opacity: 0, scale: 0.96 });
gsap.set(".tools-tile .t", { y: 16, opacity: 0 });
gsap.set(".label-tile .lbl", { y: 16, opacity: 0 });
gsap.set("#reinvent", { opacity: 0, y: 10 });
gsap.set(".f-card", { opacity: 0 });
gsap.set(".cta-inner", { opacity: 0 });

// ============================================================
// INTRO TIMELINE
// ============================================================
const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
intro
  .to(
    ".top-divider .line",
    { scaleX: 1, duration: 0.9, ease: "power3.inOut" },
    0.1
  )
  .to(
    ".top-divider .dot",
    { scale: 1, duration: 0.6, ease: "back.out(1.8)" },
    0.6
  )
  .to(
    ".arc",
    {
      strokeDashoffset: (i, el) => {
        const r = parseFloat(el.getAttribute("r"));
        return 2 * Math.PI * r * 0.5; // draw half
      },
      duration: 2.4,
      stagger: 0.12,
      ease: "power2.inOut"
    },
    0.4
  )
  .to(
    ".pill",
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 1.1,
      stagger: 0.15,
      ease: "back.out(1.3)"
    },
    0.6
  )
  .to(
    ".label-tile .lbl",
    {
      y: 0,
      opacity: 1,
      duration: 0.7,
      stagger: 0.15
    },
    1.0
  )
  .to(
    ".tools-tile .t",
    {
      y: 0,
      opacity: 1,
      duration: 0.55,
      stagger: { each: 0.04, from: "start" }
    },
    1.15
  )
  .to("#reinvent", { opacity: 1, y: 0, duration: 0.8 }, 1.9);

// ============================================================
// CONTINUOUS: subtle pill float + arc shimmer
// ============================================================
document.querySelectorAll(".pill").forEach((pill, i) => {
  gsap.to(pill, {
    y: `+=${4 + i * 1.5}`,
    duration: 3.2 + i * 0.4,
    delay: 2.2 + i * 0.15,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1
  });
});

gsap.to(".arc", {
  opacity: 0.4,
  duration: 3,
  stagger: 0.3,
  delay: 2.5,
  ease: "sine.inOut",
  yoyo: true,
  repeat: -1
});

// ============================================================
// PILL HOVER: 3D tilt + lift
// ============================================================
document.querySelectorAll(".pill").forEach((pill) => {
  pill.addEventListener("mousemove", (e) => {
    const r = pill.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(pill, {
      rotateX: -py * 6,
      rotateY: px * 6,
      y: -6,
      duration: 0.5,
      ease: "power2.out",
      transformPerspective: 1200,
      overwrite: "auto"
    });
  });
  pill.addEventListener("mouseleave", () => {
    gsap.to(pill, {
      rotateX: 0,
      rotateY: 0,
      y: 0,
      duration: 0.8,
      ease: "elastic.out(1, 0.6)",
      overwrite: "auto"
    });
  });
});

// Tools click ripple
document.querySelectorAll(".tools-tile .t").forEach((t) => {
  t.addEventListener("click", () => {
    gsap.fromTo(
      t,
      { scale: 1 },
      {
        scale: 0.94,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      }
    );
  });
});

// ============================================================
// MOUSE PARALLAX ON POSTER
// ============================================================
const poster = document.querySelector(".poster");
let mx = 0,
  my = 0,
  tx = 0,
  ty = 0;
poster.addEventListener("mousemove", (e) => {
  const r = poster.getBoundingClientRect();
  mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
  my = ((e.clientY - r.top) / r.height - 0.5) * 2;
});
poster.addEventListener("mouseleave", () => {
  mx = 0;
  my = 0;
});

function parallax() {
  tx += (mx - tx) * 0.05;
  ty += (my - ty) * 0.05;
  const arcs = document.getElementById("arcs");
  if (arcs) arcs.style.translate = `${tx * 18}px ${ty * 10}px`;
  requestAnimationFrame(parallax);
}
parallax();

// ============================================================
// SCROLL: pills shift and reveal arcs
// ============================================================
ScrollTrigger.create({
  trigger: ".poster",
  start: "top top",
  end: "bottom top",
  scrub: 0.8,
  onUpdate: (self) => {
    const p = self.progress;
    // Pills slide horizontally in different directions
    const pills = document.querySelectorAll(".pill");
    gsap.set(pills[0], { x: -180 * p, rotation: -2 * p });
    gsap.set(pills[1], { x: 0, scale: 1 - 0.04 * p });
    gsap.set(pills[2], { x: 180 * p, rotation: 2 * p });
    // Arcs expand outward
    gsap.set("#arcs", { scale: 1 + 0.15 * p });
    // Reinvent fades
    gsap.set("#reinvent", { opacity: 1 - p * 1.6 });
  }
});

// ============================================================
// FEATURED GRID REVEAL
// ============================================================
gsap.from(".eyebrow, .featured-head h2, .featured-head p", {
  opacity: 0,
  y: 30,
  duration: 0.3,
  stagger: 0.1,
  ease: "power3.out",
  scrollTrigger: { trigger: ".featured-head", start: "top 0%" }
});

gsap.to(".f-card", {
  opacity: 1,
  y: 0,
  duration: 0.5,
  stagger: 0.1,
  ease: "power3.out",
  scrollTrigger: { trigger: ".featured-grid", start: "top 0%" }
});
gsap.fromTo(
  ".f-card",
  {
    y: 70,
    scale: 0.94
  },
  {
    y: 0,
    scale: 1,
    duration: 1,
    stagger: 0.1,
    ease: "back.out(1.3)",
    scrollTrigger: { trigger: ".featured-grid", start: "top 0%" }
  }
);

// Mini tile hover effect inside f-cards
document.querySelectorAll(".f-card").forEach((card) => {
  const mini = card.querySelector(".f-mini");
  card.addEventListener("mouseenter", () => {
    gsap.to(mini, {
      rotate: -8,
      y: -4,
      scale: 1.08,
      duration: 0.5,
      ease: "back.out(1.6)"
    });
  });
  card.addEventListener("mouseleave", () => {
    gsap.to(mini, {
      rotate: 0,
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: "elastic.out(1, 0.6)"
    });
  });
});

// ============================================================
// CTA REVEAL + COUNTERS
// ============================================================
gsap.to(".cta-inner", {
  opacity: 1,
  y: 0,
  duration: 1.2,
  ease: "power3.out",
  scrollTrigger: { trigger: ".cta-section", start: "top 80%" }
});
gsap.from(".cta-inner", {
  y: 80,
  scale: 0.95,
  duration: 1.2,
  ease: "power3.out",
  scrollTrigger: { trigger: ".cta-section", start: "top 80%" }
});

ScrollTrigger.create({
  trigger: ".cta-section",
  start: "top 75%",
  onEnter: () => {
    document.querySelectorAll(".cta-stat .num").forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const span = el.querySelector("span");
      gsap.to(
        { v: 0 },
        {
          v: target,
          duration: 1.8,
          ease: "power2.out",
          onUpdate: function () {
            span.textContent = Math.floor(this.targets()[0].v).toLocaleString();
          }
        }
      );
    });
  },
  once: true
});