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

/*=============== CHANGE HEADER STYLES ===============*/

const scrollHeader = () => {
  const header = document.getElementById("header");
  // When the scroll is greater than 50 viewport height, add the scroll-header class to the header tag
  this.scrollY >= 50
    ? header.classList.add("scroll-header")
    : header.classList.remove("scroll-header");
};
window.addEventListener("scroll", scrollHeader);

/*=============== SWIPER JS ===============*/
const swiperTumbs = new Swiper(".home__thumbs", {
  slidesPerView: "auto",
  direction: "vertical",
});
const swiperHome = new Swiper(".home__swiper", {
  loop: true,
  direction: "vertical",
  speed: 500,
  effect: "creative",
  creativeEffect: {
    prev: {
      translate: [100, -200, -100],
      opacity: 0,
    },
    next: {
      translate: [100, 200, 100],
      opacity: 0,
    },
  },
  breakpoints: {
    1150: {
      creativeEffect: {
        prev: {
          translate: [200, -500, -100],
        },
        next: {
          translate: [200, 500, 100],
        },
      },
    },
  },
  thumbs: {
    swiper: swiperTumbs,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});

/*=============== GSAP ANIMATION ===============*/

/*=============== BUTTON MOUSE MOVE ===============*/
