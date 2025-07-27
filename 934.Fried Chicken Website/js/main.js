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

/*=============== ADD SHADOW HEADER ===============*/
const shadowHeader = () => {
  const header = document.getElementById("header");
  // When the scroll is greater than 50 viewport height, add the scroll-header class to the header tag
  this.scrollY >= 50
    ? header.classList.add("shadow-header")
    : header.classList.remove("shadow-header");
};
window.addEventListener("scroll", shadowHeader);

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
        ".nav__list a[href*=" + sectionId + "]"
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
  duration: 2000,
  delay: 300,
  // reset: true, // Animations repeat
});

sr.reveal(".home__data, .about__data, .footer__container");
sr.reveal(".home__images", { delay: 1000 });
sr.reveal(".home__dam-1", { delay: 1000, scale: 0, rotate: { z: 45 } });
sr.reveal(".home__dam-2, .home__dam-3", {
  delay: 1400,
  scale: 0,
  rotate: { z: 45 },
});
sr.reveal(".home__dam-4", { delay: 1700, scale: 0, rotate: { z: 45 } });
sr.reveal(".home__dam-5", { delay: 1800, scale: 0, rotate: { z: 45 } });
sr.reveal(".about__img-1", { delay: 600, origin: "right" });
sr.reveal(".about__img-2", { delay: 800, origin: "left" });
sr.reveal(".about__tooltip-1", { delay: 1600, origin: "left" });
sr.reveal(".about__tooltip-1", { delay: 1800, origin: "right" });
sr.reveal(".order__card:nth-child(1)", { origin: "right" });
sr.reveal(".order__card:nth-child(2)", { origin: "left" });
sr.reveal(".order__tooltip-1", { delay: 800, origin: "right" });
sr.reveal(".order__tooltip-2", { delay: 800, origin: "left" });
sr.reveal(".combo__titles", { origin: "bottom" });
sr.reveal(".combo__img", { delay: 1000 });
sr.reveal(".combo__data", { delay: 1600 });
sr.reveal(".combo__numbers", { delay: 1600, origin: "bottom" });
sr.reveal(".contact__data", { origin: "right" });
sr.reveal(".contact__info", { origin: "left" });
sr.reveal(".contact__img-1", {
  delay: 1000,
  distance: 0,
  scale: 0,
  rotate: { z: -45 },
});
sr.reveal(".contact__img-2", {
  delay: 1200,
  distance: 0,
  scale: 0,
  rotate: { z: 45 },
});
sr.reveal(".contact__dam-1", { delay: 1400, scale: 0, rotate: { z: 45 } });
sr.reveal(".contact__dam-2", { delay: 1600, scale: 0, rotate: { z: 45 } });
sr.reveal(".contact__dam-3", { delay: 1800, scale: 0, rotate: { z: 45 } });
sr.reveal(".contact__dam-4", { delay: 2000, scale: 0, rotate: { z: 45 } });
