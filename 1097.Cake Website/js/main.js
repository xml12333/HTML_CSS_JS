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

/*=============== HOME SWIPER ===============*/
const swiperHome = new Swiper(".home__swiper", {
  loop: true,
  grabCursor: true,
  speed: 800,
  effect: "creative",
  creativeEffect: {
    prev: {
      translate: ["-120%", 0, -500],
      rotate: [0, 0, -45],
      opacity: 0,
    },
    next: {
      translate: ["120%", 0, -500],
      rotate: [0, 0, 45],
      opacity: 0,
    },
  },
  // autoplay:{
  //   delay: 300,
  //   disableOnInteraction: false,
  // }
});
/*=============== PRODUCTS SWIPER ===============*/
const swiperTabs = new Swiper(".product__tabs", {
  slidesPerView: "auto",
});
const swiperProducts = new Swiper(".product__content", {
  loop: true,
  spaceBetween: 32,
  thumbs: {
    swiper: swiperTabs,
  },
});

/*=============== NEW SWIPER ===============*/
const swiperNew = new Swiper(".new__swiper", {
  loop: true,
  grabCursor: true,
  centeredSlides: "auto",
  slidesPerView: "auto",
  speed: 600,
  effect: "creative",
  creativeEffect: {
    limitProgress: 2,
    prev: {
      translate: ["-32%", 0, 0],
      scale: 0.58,
    },
    next: {
      translate: ["32%", 0, 0],
      scale: 0.58,
    },
  },
  navigation: {
    nextEl: ".new .swiper-button-next",
    prevEl: ".new .swiper-button-prev",
  },
  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
  },
});
/*=============== SHOW SCROLL UP ===============*/
const scrollUp = () => {
  const scrollUp = document.getElementById("scroll-up");
  // When the scroll is higher than 350 viewport height, add the show-scroll class to the a tag with the scrollup class
  this.scrollY >= 350
    ? scrollUp.classList.add("show-scroll")
    : scrollUp.classList.remove("show-scroll");
};
window.addEventListener("scroll", scrollUp);
/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll("section[id]");

const scrollActive = () => {
  const scrollY = window.pageYOffset;

  sections.forEach((current) => {
    const sectionHeight = current.offsetHeight,
      sectionTop = current.offsetTop - 58,
      sectionId = current.getAttribute("id"),
      sectionsClass = document.querySelector(
        ".nav__menu a[href*=" + sectionId + "]",
      );

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      sectionsClass.classList.add("active-link");
    } else {
      sectionsClass.classList.remove("active-link");
    }
  });
};
window.addEventListener("scroll", scrollActive);
/*=============== SCROLL REVEAL ANIMATION ===============*/
const sr = ScrollReveal({
  origin: "bottom",
  distance: "60px",
  duration: 1500,
  delay: 300,
  easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
});
sr.reveal(".home__title", { origin: "top" });
sr.reveal(".home__description", { delay: 600, origin: "top" });
sr.reveal(".home__data .button", {
  delay: 900,
  distance: 0,
  scale: 0,
  origin: "top",
});
sr.reveal(".home__base", { delay: 900 });
sr.reveal(".home__swiper", { delay: 1200, origin: "top" });
sr.reveal(".home__blob", { delay: 1500, scale: 0 });
sr.reveal(".home__data img", {
  delay: 1200,
  distance: 0,
  interval: 200,
  scale: 0,
});
sr.reveal(".home__leaf-1, .home__leaf-2, .home__sticker-3, .home__sticker-4", {
  delay: 2400,
  distance: 0,
  interval: 200,
  scale: 0,
});

sr.reveal(".about__cupcake-1, .about__cupcake-2", {
  rotate: { x: 0, y: 0, z: 120 },
});
sr.reveal(".about__data .section__title", { delay: 900 });
sr.reveal(".about__description", { delay: 1200 });
sr.reveal(".about__data .button", { delay: 1500, distance: 0, scale: 0 });
sr.reveal(".about__blob", { delay: 1800, origin: "right" });
sr.reveal(".about__img", { delay: 2100, origin: "left" });
sr.reveal(".about__leaf, .about__cupcake-3", {
  delay: 2700,
  distance: 0,
  interval: 200,
  scale: 0,
});
sr.reveal(".about__data img", {
  delay: 3000,
  distance: 0,
  interval: 200,
  scale: 0,
});
