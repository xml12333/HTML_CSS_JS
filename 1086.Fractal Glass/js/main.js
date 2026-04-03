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

/*=============== GSAP ANIMATION ===============*/
gsap.defaults({ opacity: 0, ease: "power4.out", duration: 1.4 });
const t1 = gsap.timeline();
const splitTitle = SplitText.create(".home__title", { type: "chars" });
t1.from(".home__box", { duration: 0.2 }, ".3")
  .from(".home__bg", { scale: 0.5 }, ".6")
  .from(".nav > *", { y: -30 }, "1.5")
  .from(".home__icon", { y: 90 }, "1.8")
  .from(splitTitle.chars, { y: 300, autoAlpha: 0, stagger: 0.05 }, "2.1")
  .from(".home__description", { y: 90 }, "3.3")
  .from(".home__buttons", { y: 90 }, "3.6")
  .to(".home__bg", {
    scale: 1.5,
    opacity: 1,
    duration: 8,
    ease: "power1.inOut",
    repeat: -1,
    yoyo: true,
    transformOrigin: "center center",
  });
