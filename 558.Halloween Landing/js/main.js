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

/*=============== CHANGE BACKGROUND HEADER ===============*/
const bgHeader = () => {
  const header = document.getElementById("header");
  // When the scroll is greater than 50 viewport height, add the scroll-header class to the header tag
  this.scrollY >= 50
    ? header.classList.add("bg-header")
    : header.classList.remove("bg-header");
};
window.addEventListener("scroll", bgHeader);
/*=============== GSAP ANIMATION ===============*/
gsap.from(".home__shadow", 1.5, { opacity: 0, y: -300, delay: 0.2 });
gsap.from(".home__points", 1.5, { opacity: 0, y: -300, delay: 0.4 });
gsap.from(".home__grass", 1.5, {
  opacity: 0,
  y: 300,
  delay: 0.2,
  ease: "elastic.out(1, .5)",
});
gsap.from(".home__pumpkin", 1.5, {
  opacity: 0,
  y: -300,
  delay: 0.6,
  ease: "bounce.out",
});
gsap.from(".home__stone", 1.5, {
  opacity: 0,
  y: 300,
  delay: 0.8,
  ease: "elastic.out(1, .5)",
});
gsap.from(".home__moon", 1.5, {
  opacity: 0,
  y: 300,
  delay: 1.5,
  ease: "elastic.out(1, .5)",
});
gsap.from(".home__titles", 1.5, {
  opacity: 0,
  y: -300,
  delay: 1.5,
  ease: "elastic.out(1, .5)",
});
gsap.from(".home__tree", 1.5, {
  opacity: 0,
  y: 300,
  delay: 2,
  ease: "elastic.out(1, .5)",
});
gsap.from(".home__data", 1.5, {
  opacity: 0,
  y: 200,
  delay: 2,
  ease: "elastic.out(1, .5)",
});