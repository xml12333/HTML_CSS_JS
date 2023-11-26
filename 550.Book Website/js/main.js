/*=============== SEARCH ===============*/
const searchButton = document.getElementById("search-button"),
  searchClose = document.getElementById("search-close"),
  searchContent = document.getElementById("search-content");

/*===== SEARCH SHOW =====*/
/* Validate if constant exists */
if (searchButton) {
  searchButton.addEventListener("click", () => {
    searchContent.classList.add("show-search");
  });
}

/*===== SEARCH HIDDEN =====*/
/* Validate if constant exists */
if (searchClose) {
  searchClose.addEventListener("click", () => {
    searchContent.classList.remove("show-search");
  });
}

/*=============== LOGIN ===============*/
const loginButton = document.getElementById("login-button"),
  loginClose = document.getElementById("login-close"),
  loginContent = document.getElementById("login-content");

/*===== LOGIN SHOW =====*/
/* Validate if constant exists */
if (loginButton) {
  loginButton.addEventListener("click", () => {
    loginContent.classList.add("show-login");
  });
}

/*===== LOGIN HIDDEN =====*/
/* Validate if constant exists */
if (loginClose) {
  loginClose.addEventListener("click", () => {
    loginContent.classList.remove("show-login");
  });
}
/*=============== ADD SHADOW HEADER ===============*/

/*=============== HOME SWIPER ===============*/
let swiperHome = new Swiper(".home__swiper", {
  loop: true,
  spaceBeetween: -24,
  slidesPerView: "auto",
  centeredSlides: "auto",
  grabCursor: true,

  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
  },
  breakpoints: {
    1220: {
      spaceBeetween: -32,
    },
  },
});
/*=============== FEATURED SWIPER ===============*/

/*=============== NEW SWIPER ===============*/

/*=============== TESTIMONIAL SWIPER ===============*/

/*=============== SHOW SCROLL UP ===============*/

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/

/*=============== DARK LIGHT THEME ===============*/

/*=============== SCROLL REVEAL ANIMATION ===============*/
