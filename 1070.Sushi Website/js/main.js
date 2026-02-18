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

/*=============== SWIPER MENU ===============*/
const swiperTabs = new Swiper(".menu__tabs", {
  slidesPerView: "auto",
});
const swiperMenu = new Swiper(".menu__content", {
  loop: true,
  thumbs: {
    swiper: swiperTabs,
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
  origin: "top",
  distance: "60px",
  duration: 1500,
  delay: 300,
  easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  // reset: true, // Animation repeat
});
sr.reveal(`.home__title`, { origin: "top" });
sr.reveal(`.home__description`, { delay: 600, origin: "top" });
sr.reveal(`.home__data .button`, {
  delay: 900,
  distance: 0,
  scale: 0,
  origin: "top",
});
sr.reveal(`.home__blob`, { delay: 900, distance: "100px" });
sr.reveal(`.home__images img`, {
  delay: 1200,
  distance: 0,
  interval: 200,
  scale: 0,
});
sr.reveal(`.home__data img`, {
  delay: 1500,
  distance: 0,
  interval: 200,
  scale: 0,
});
sr.reveal(`.home__text`, { delay: 2100, distance: "120px" });
sr.reveal(`.about__data .section__title`);
sr.reveal(`.about__data .section__subtitle`, { delay: 600 });
sr.reveal(`.about__description`, { delay: 900 });
sr.reveal(`.about__data .button`, { delay: 1200, distance: 0, scale: 0 });
sr.reveal(`.about__blob`, { delay: 1200, origin: "left" });
sr.reveal(`.about__img`, { delay: 1500, origin: "right" });
sr.reveal(`.about__data img`, {
  delay: 1800,
  distance: 0,
  interval: 200,
  scale: 0,
});
sr.reveal(`.about__text`, { delay: 2100 });
sr.reveal(`.menu__button`, { interval: 100 });
sr.reveal(`.menu__content`, { delay: 600 });
sr.reveal(`.menu__text-1`, { delay: 900, origin: "top" });
sr.reveal(`.menu__text-2`, { delay: 1200 });
sr.reveal(`.new__data .section__title`);
sr.reveal(`.new__data .section__subtitle`, { delay: 600 });
sr.reveal(`.new__description`, { delay: 900 });
sr.reveal(`.new__blob`, { delay: 900, origin: "right" });
sr.reveal(`.new__images img`, {
  delay: 1200,
  distance: 0,
  interval: 200,
  scale: 0,
});
sr.reveal(`.new__data img`, {
  delay: 1500,
  distance: 0,
  interval: 200,
  scale: 0,
});
sr.reveal(`.new__text-1`, { delay: 2100 });
sr.reveal(`.new__text-2`, { delay: 2400 });
sr.reveal(`.contact__data`, { interval: 100 });
sr.reveal(`.contact__newsletter`, { delay: 600 });
sr.reveal(`.contact__text-1`, { delay: 1200, origin: "top" });
sr.reveal(`.contact__text-2`, { delay: 1500 });
sr.reveal(`.footer__container`, { distance: "20px" });
