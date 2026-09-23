/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById("nav-menu"),
  navToggle = document.getElementById("nav-toggle"),
  navClose = document.getElementById("nav-close");

/* Show menu */
if (navToggle) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.add("show-menu");
  });
}

/* Hide menu */
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

/*=============== SWIPER HOME ===============*/
const swiperHome = new Swiper(".home__swiper", {
  loop: true,
  speed: 800,
  effect: "fade",
  parallax: true,

  // Navigation arrow
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  autoplay: {
    delay: 3200,
    disableonInteraction: false,
  },
});

/*=============== CHANGE HEADER STYLES ===============*/
const scrollHeader = () => {
  const header = document.getElementById("header");
  // When the scroll is greater than 50 viewport height, add the scroll-header class to the header tag
  this.scrollY >= 50
    ? header.classList.add("scroll-header")
    : header.classList.remove("scroll-header");
};
window.addEventListener("scroll", scrollHeader);

/*=============== GSAP ANIMATION ===============*/
gsap.defaults({ opacity: 0, ease: "back.out(1.6)", duration: 1.4 });
const tl = gsap.timeline();
tl.from(".nav > *", { y: -30 }, ".3")
  .from(".home__image", { y: -200 }, ".9")
  .from(".home__name", { y: -200 }, "1.3")
  .from(".home__data", { y: 120 }, "1.8")
  .from(
    ".home .swiper-button-prev, .home .swiper-button-next",
    { y: 120 },
    "2.1",
  );
