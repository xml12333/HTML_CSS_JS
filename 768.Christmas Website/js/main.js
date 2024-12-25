/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById("nav-menu"),
  navToggle = document.getElementById("nav-toggle"),
  navClose = document.getElementById("nav-close");

/*===== MENU SHOW =====*/
/* Validate if constant exists */
if (navToggle) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.add("show-menu");
  });
}

/*===== MENU HIDDEN =====*/
/* Validate if constant exists */
if (navClose) {
  navClose.addEventListener("click", () => {
    navMenu.classList.remove("show-menu");
  });
}

/*=============== REMOVE MENU MOBILE ===============*/
const navLink = document.querySelectorAll(".nav__link");

const linkAction = () => {
  const navMenu = document.getElementById("nav-menu");
  // When we click on each nav__link, we remove the show-menu class
  navMenu.classList.remove("show-menu");
};
navLink.forEach((n) => n.addEventListener("click", linkAction));

/*=============== ADD BLUR HEADER ===============*/
const blurHeader = () => {
  const header = document.getElementById("header");
  // When the scroll is greater than 50 viewport height, add the scroll-header class to the header tag
  this.scrollY >= 50
    ? header.classList.add("blur-header")
    : header.classList.remove("blur-header");
};
window.addEventListener("scroll", blurHeader);

/*=============== GSAP ANIMATION ===============*/
gsap.from(".home__img-11", 1, { opacity: 0, y: 200, delay: 0.1 });
gsap.from(".home__img-14", 1, { opacity: 0, y: 200, delay: 0.5 });
gsap.from(".home__img-15", 1, { opacity: 0, y: 200, delay: 0.8 });
gsap.from(".home__img-16", 1, { opacity: 0, y: 200, delay: 1.1 });
gsap.from(".home__img-10", 1, {
  opacity: 0,
  y: 200,
  delay: 1.5,
  ease: "back.out(1.2)",
});
gsap.from(".home__img-5", 1, {
  opacity: 0,
  y: 200,
  delay: 2,
  ease: "bounce.out",
});
gsap.from(".home__img-8", 1, {
  opacity: 0,
  y: 200,
  delay: 2.5,
  ease: "bounce.out",
});
gsap.from(".home__img-3", 1, {
  opacity: 0,
  x: -100,
  rotation: -20,
  delay: 3,
  ease: "back.out(1.2)",
});
gsap.from(".home__img-2", 1, {
  opacity: 0,
  x: -100,
  rotation: -20,
  delay: 3.5,
  ease: "back.out(1.2)",
});
gsap.from(".home__img-1", 1, {
  opacity: 0,
  x: -100,
  rotation: -20,
  delay: 4,
  ease: "back.out(1.2)",
});
gsap.from(".home__img-6", 1, {
  opacity: 0,
  x: 100,
  rotation: 20,
  delay: 3.5,
  ease: "back.out(1.2)",
});
gsap.from(".home__img-9", 1, {
  opacity: 0,
  x: 100,
  rotation: 20,
  delay: 4,
  ease: "back.out(1.2)",
});
gsap.from(".home__img-7", 1, {
  opacity: 0,
  y: 200,
  delay: 4.5,
  ease: "bounce.out",
});
gsap.from(".home__img-4", 1, {
  opacity: 0,
  y: 200,
  delay: 5,
  ease: "bounce.out",
});
gsap.from(".home__img-13", 1, {
  opacity: 0,
  y: 200,
  delay: 5.5,
  ease: "back.out(1.2)",
});
gsap.from(".home__img-12", 1, {
  opacity: 0,
  y: 200,
  delay: 5.5,
  ease: "back.out(1.2)",
});
gsap.from(".home__title", 1, {
  opacity: 0,
  y: 200,
  delay: 6,
  ease: "back.out(1.2)",
});
