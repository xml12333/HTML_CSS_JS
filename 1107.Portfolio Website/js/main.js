/*=============== SHOW & CLOSE MENU ===============*/
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

/*=============== REMOVE MOBILE MENU ===============*/
const navLink = document.querySelectorAll(".nav__link, .nav__contact");

const linkAction = () => {
  const navMenu = document.getElementById("nav-menu");
  // When we click on each nav__link, we remove the show-menu class
  navMenu.classList.remove("show-menu");
};
navLink.forEach((n) => n.addEventListener("click", linkAction));

/*=============== HOME TEXT CIRCULAR ===============*/
const homeText = document.getElementById("home-text"),
  letters = homeText.textContent.trim().split(""),
  angleStep = 360 / letters.length;
homeText.textContent = "";
letters.forEach((char, i) => {
  const span = document.createElement("span");
  span.textContent = char;
  span.style.transform = `rotate(${i * angleStep}deg)`;
  homeText.appendChild(span);
});

/*=============== HOME TYPED JS ===============*/
const typedHome = new Typed("#home-typed", {
  strings: ["Freelancer", "Web Developer", "SEO Specialist"],
  typeSpeed: 60,
  backSpeed: 30,
  backDelay: 2000,
  loop: true,
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

/*=============== SWIPER WORK ===============*/
const swiperWork = new Swiper(".work__swiper", {
  loop: true,
  spaceBetween: 24,
  slidesPerView: "auto",
  grabCursor: true,
  speed: 600,

  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
  },
});
/*=============== SERVICES ACCORDION ===============*/
const servicesCards = document.querySelectorAll(".services__card"),
  servicesButtons = document.querySelectorAll(".services__button");
servicesButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const currentCard = button.closest(".services__card");
    isOpen = currentCard.classList.contains("services-open");
    servicesCards.forEach((card) => {
      card.classList.replace("services-open", "services-close");
    });
    if (!isOpen) {
      currentCard.classList.replace("services-close", "services-open");
    }
  });
});
/*=============== TESTIMONIALS OF DUPLICATE CARDS ===============*/
const tracks = document.querySelectorAll(".testimonials__content");
tracks.forEach((track) => {
  const cards = [...track.children];
  for (const card of cards) {
    track.appendChild(card.cloneNode(true));
  }
});
/*=============== CONTACT EMAIL JS ===============*/
const contactForm = document.getElementById("contact-form"),
  contactMessage = document.getElementById(".contact-message");
const sendEmail = async (e) => {
  e.preventDefault();

  try {
    // serviceID - templateID - #form - publicKey
    await emailjs.sendForm("", "", "#contact-form", "");
    contactMessage.textContent = "Message sent successfully ✅";
    contactForm.reset();
  } catch {
    contactMessage.textContent = "Message not sent (service error) ❌";
  } finally {
    setTimeout(() => (contactMessage.textContent = ""), 5000);
  }
};
contactForm.addEventListener("submit", sendEmail);
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

/*=============== CUSTOM CURSOR ===============*/
const cursor = document.querySelector(".cursor");
let mouseX = 0,
  mouseY = 0;

const cursorMove = () => {
  cursor.style.left = `${mouseX}px`;
  cursor.style.top = `${mouseY}px`;
  cursor.style.transform = `translate(-50%, -50%)`;
  requestAnimationFrame(cursorMove);
};
document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});
cursorMove();

const a = document.querySelectorAll("a");
a.forEach((item) => {
  item.addEventListener("mouseover", () => {
    cursor.classList.add("hide-cursor");
  });
  item.addEventListener("mouseleave", () => {
    cursor.classList.remove("hide-cursor");
  });
});
/*=============== SCROLLREVEAL ANIMATION ===============*/
const sr = ScrollReveal({
  origin: "bottom",
  distance: "60px",
  duration: 1200,
  delay: 300,
  easing: "cubic-bezier(0.34,1.56,0.64,1)",
  // reset: true, //Animations repeat
});

sr.reveal(".home__subtitle");
sr.reveal(".home__title", { delay: 600 });
sr.reveal(".home__description", { delay: 900 });
sr.reveal(".home__box-1", { delay: 1200, rotate: { z: -20 } });
sr.reveal(".home__box-2", { delay: 1300, rotate: { z: -30 } });
sr.reveal(".home__box-3", { delay: 1400, rotate: { z: -40 } });
sr.reveal(".home__img", { delay: 1700, distance: "-60px" });
sr.reveal(".home__circle", { delay: 2000, distance: "-100px" });

sr.reveal(".about__title");
sr.reveal(".about__description", { delay: 600 });
sr.reveal(".about__button", { delay: 900 });

sr.reveal(".work__swiper");
sr.reveal(".services__card:nth-child(odd)", {
  interval: 200,
  origin: "left",
  distance: "100px",
});
sr.reveal(".services__card:nth-child(even)", {
  interval: 200,
  origin: "right",
  distance: "100px",
});

sr.reveal(".skills__description");
sr.reveal(".skills__card", { delay: 600, interval: 200 });
sr.reveal(".skills__profession", { delay: 900 });
sr.reveal(".skills__list", { delay: 1200, interval: 200 });

sr.reveal(".testimonials__container");

sr.reveal(".contact__form");
sr.reveal(".contact__link", { delay: 600, interval: 200 });

sr.reveal(".footer__container");
