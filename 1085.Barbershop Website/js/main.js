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

/*=============== SWIPER WORKS ===============*/
const swiperWork = new Swiper(".work__swiper", {
  loop: true,
  slidesPerView: "auto",
  spaceBeetween: 24,
  grabCursor: true,
  pagination: {
    el: ".work__data .swiper-pagination",
    type: "fraction",
  },
  navigation: {
    nextEl: ".work__data .swiper-button-next",
    prevEl: ".work__data .swiper-button-prev",
  },
});

/*=============== SWIPER TESTIMONIAL ===============*/
const swiperTestimonial = new Swiper(".service__swiper", {
  loop: true,
  slidesPerView: "auto",
  spaceBeetween: 56,
  grabCursor: true,
  pagination: {
    el: ".service__swiper .swiper-pagination",
  },
  navigation: {
    nextEl: ".service__swiper .swiper-button-next",
    prevEl: ".service__swiper .swiper-button-prev",
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

/*=============== GSAP ANIMATION ===============*/
const reveal = (selector, options = {}) => {
  gsap.from(selector, {
    scrollTrigger: selector,
    opacity: 0,
    duration: 1,
    y: 100,
    delay: 0.3,
    ease: "power2.out",
    ...options,
  });
};

/* Home animation */
const t1 = gsap.timeline({});
t1.fromTo(
  ".home__bg, .home__shadow",
  {
    y: -800,
    scale: 0.3,
    opacity: 0,
  },
  {
    y: 0,
    scale: 0.3,
    opacity: 1,
    duration: 1,
    ease: "power3.out",
  },
);
t1.to(".home__bg, .home__shadow", {
  scale: 1,
  duration: 1,
  ease: "back.out(0.5)",
});
/* Home background animation */
t1.to(".home__bg", {
  scale: 1.08,
  duration: 8,
  ease: "power1.inOut",
  repeat: -1,
  yoyo: true,
  transformOrigin: "center center",
});
reveal(".home__logo", {
  y: 0,
  scale: 0.3,
  delay: 1.9,
  ease: "elastic.out(0.8,0.5)",
});
reveal(".home__title", { delay: 2.2 });
reveal(".home__description", { delay: 2.5 });
reveal(".home__data .button", { delay: 2.8 });
/* The nav animation only works in the home section */
if (window.scrollY < 100) {
  reveal(".nav > *", { delay: 1.6, y: -30 });
} else {
  gsap.set(".nav > *", { opacity: 1, y: 0 });
}
/* About animation */
reveal(".about__data > *", { stagger: 0.2 });
reveal(".about__img", { delay: 0.9 });
const aboutCounter = document.querySelectorAll(".about__counter");
aboutCounter.forEach((el) => {
  gsap.from(el, {
    textContent: 0,
    duration: 3,
    ease: "power1.out",
    snap: { textContent: 1 },
    scrollTrigger: { trigger: el, once: true },
  });
});

/* Work animation */
reveal(".work__data .section__title", {});
reveal(".work__description", { delay: 0.6 });
reveal(".work__data .swiper-pagination", { delay: 0.9 });
reveal(".work__data :is(.swiper-button-prev, .swiper-button-next", {
  delay: 1.2,
});
reveal(".work__swiper", { delay: 0.9 });
/* Service animation */
reveal(".service__data .section__title", {});
reveal(".service__plan", { delay: 0.6, stagger: 0.2 });
reveal(".service__swiper ", { delay: 0.9, stagger: 0.2 });
/* Expert animation */
reveal(".extert .section__title", {});
reveal(".expert__description", { delay: 0.6 });
reveal(".expert__card", { delay: 0.9, stagger: 0.2 });
/* Contact animation */
reveal(".contact__data .section__title", {});
reveal(".contact__description", { delay: 0.6 });
reveal(".contact__data .button", { delay: 0.9, y: 0, scale: 0 });
reveal(".contact__map", { delay: 0.9 });
reveal(".contact__card", { delay: 1.2, stagger: 0.2 });
/* Footer animation */
reveal(".footer__container", {});
