const navItems = document.querySelector("#nav__items");
const openNavBtn = document.querySelector("#open__nav-btn");
const closeNavBtn = document.querySelector("#close__nav-btn");

openNavBtn.addEventListener("click", () => {
  navItems.style.display = "flex";
  openNavBtn.style.display = "none";
  closeNavBtn.style.display = "inline-block";
});

const closeNav = () => {
  navItems.style.display = "none";
  openNavBtn.style.display = "inline-block";
  closeNavBtn.style.display = "none";
};
closeNavBtn.addEventListener("click", closeNav);

if (window.innerWidth < 1024) {
  document.querySelectorAll("#nav__items li a").forEach((navItem) => {
    navItem.addEventListener("click", () => {
      closeNav();
    });
  });
}

window.addEventListener("scroll", () => {
  document
    .querySelector("nav")
    .classList.toggle("windows-scroll", window.scrollY > 0);
});
// swiper
var swiper = new Swiper(".mySwiper", {
  slidesPerView: 3,
  spaceBetween: 30,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  breakpoints: {
    600: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: 3,
    },
  },
});
/*=============== EMAIL JS ===============*/
const contactForm = document.getElementById("contact-form"),
  contactMessage = document.getElementById("contact-message");

const sendEmail = (e) => {
  e.preventDefault();
  // serviceID - templateID - #form - publicKey
  emailjs
    .sendForm(
      "service_sgjqhkw",
      "template_j9b17gd",
      "#contact-form",
      "SFutWE3kaxt2qE2eO"
    )
    .then(
      () => {
        // Show sent message
        contactMessage.textContent = "Message sent successfully ✅";
        // Remove message after five seconds
        setTimeout(() => {
          contactMessage.textContent = "";
        }, 5000);
        // Clear input fields
        contactForm.reset();
      },
      () => {
        // Show error message
        contactMessage.textContent = "Message not sent (service error) ❌";
      }
    );
};
contactForm.addEventListener("submit", sendEmail);
