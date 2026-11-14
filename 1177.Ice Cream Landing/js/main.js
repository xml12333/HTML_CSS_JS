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

/*=============== CHANGE HEADER STYLES ===============*/
const scrollHeader = () => {
  const header = document.getElementById("header");
  // Add the .scroll-header class if the bottom scroll of the viewport is greater than 50
  this.scrollY >= 50
    ? header.classList.add("scroll-header")
    : header.classList.remove("scroll-header");
};
window.addEventListener("scroll", scrollHeader);

/*=============== SWIPER HOME ===============*/
const swiperHome = new Swiper(".home__swiper", {
  loop: true,
  speed: 1200,
  loopedSlides: 3,
  grabCursor: true,
  effect: "creative",

  creativeEffect: {
    limitProgress: 3,
    // The ice cream that leaves falls down
    prev: {
      translate: [0, "250%", 0],
    },
    // The next ice cream waits on the right, smaller
    next: {
      translate: ["200px", 0, 0],
      scale: 0.7,
    },
  },

  breakpoints: {
    548: {
      creativeEffect: {
        next: { translate: ["240px", 0, 0], scale: 0.7 },
      },
    },
    768: {
      creativeEffect: {
        next: { translate: ["290px", 0, 0], scale: 0.7 },
      },
    },
    1150: {
      creativeEffect: {
        next: { translate: ["333px", 0, 0], scale: 0.7 },
      },
    },
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  autoplay: {
    delay: 3200,
    disableOnInteraction: false,
  },
});

/* Change background color */
const homeBg = document.querySelectorAll(".home__bg");

swiperHome.on("slideChange", () => {
  // Show only the background of the active ice cream
  homeBg.forEach((bg) => bg.classList.remove("active-bg"));
  homeBg[swiperHome.realIndex].classList.add("active-bg");
});

/* Move the small ice cream closer to the middle one (desktop) */
const moveIceCream = () => {
  // Pixels the small ice cream moves to the left
  const offset = window.innerWidth >= 1150 ? 120 : 0;

  swiperHome.slides.forEach((slide) => {
    const position = -slide.progress, // 1 = middle, 2 = small
      move = Math.min(Math.max(position - 1, 0), 1),
      scale = 1 - 0.3 * Math.min(Math.max(position, 0), 3);

    slide.querySelector(".home__img").style.translate =
      `${(-offset * move) / scale}px 0`;
  });
};

/* The movement lasts the same as the swiper transition */
const moveTransition = (swiper, duration) => {
  swiperHome.slides.forEach((slide) => {
    slide.querySelector(".home__img").style.transition =
      `filter .4s, translate ${duration}ms`;
  });
};

swiperHome.on("setTransition", moveTransition);
swiperHome.on("progress", moveIceCream);
moveIceCream();

/*=============== GSAP ANIMATION ===============*/
gsap.defaults({ opacity: 0, ease: "back.out(1.6)", duration: 1.4 });

const tl = gsap.timeline();
tl.from(".nav > *", { y: -30 }, ".3")
  .from(".home__swiper", { y: -200 }, ".9")
  .from(".home__title", { y: 120 }, "1.3")
  .from(".home__description, .home__buttons", { y: 120 }, "1.6")
  .from(".home__wave", { y: 200, ease: "back.out(0)" }, "1.9")
  .from(".home__bottom", { y: 200 }, "2.1");
