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

/*=============== GSAP ANIMATION ===============*/
gsap.defaults({ opacity: 0, duration: 1.5, y: 300, ease: "back.out(1.6)" });

const tl = gsap.timeline();
tl.from(".home__img-7", {}, ".3")
  .from(".home__img-5", {}, ".6")
  .from(".home__img-6", {}, ".9")
  .from(".home__img-4", {}, "1.2")
  .from(".home__img-2", {}, "1.5")
  .from(".home__img-3", {}, "1.8")
  .from(".home__img-1", {}, "2.1")
  .from(".home__description", {}, "1.5")
  .from(".home__title", {}, "2.1")
  .to(".home__img-7", {
    y: 25,
    opacity: 1,
    duration: 4,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  })
  .to(
    ".home__img-5",
    {
      y: 0,
      x: 50,
      opacity: 1,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    },
    "<",
  )
  .to(
    ".home__img-4",
    {
      y: 0,
      x: -50,
      opacity: 1,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    },
    "<",
  )
  .to(
    ".home__img-1",
    {
      scale: 0.8,
      y: 0,
      opacity: 1,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    },
    "<",
  );
