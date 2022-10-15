/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close')

/*===== MENU SHOW =====*/
/* Validate if constant exists */
if(navToggle){
    navToggle.addEventListener('click', () =>{
        navMenu.classList.add('show-menu')
    })
}

/*===== MENU HIDDEN =====*/
/* Validate if constant exists */
if(navClose){
    navClose.addEventListener('click', () =>{
        navMenu.classList.remove('show-menu')
    })
}

/*=============== REMOVE MENU MOBILE ===============*/
const navLink = document.querySelectorAll('.nav__link')

const linkAction = () =>{
    const navMenu = document.getElementById('nav-menu')
    // When we click on each nav__link, we remove the show-menu class
    navMenu.classList.remove('show-menu')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/*=============== SWIPER PROJECTS ===============*/
let projectsSwiper = new Swiper(".projects__container", {
    spaceBetween: 24,
    loop: 'true',

    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    pagination:{
        el: ".swiper-pagination",
    },
    breakpoints: {
        1200: {
          slidesPerView: 2,
          spaceBetween: -56,
        },
        
    },
});

/*=============== SWIPER TESTIMONIAL ===============*/
let testimonialSwiper = new Swiper(".testimonial__container", {
    grabCursor: true,
    spaceBetween: 24,
    loop: 'true',

    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
   
    breakpoints: {
        1200: {
          slidesPerView: 2,
          spaceBetween: -56,
        },
        
    },
});

/*=============== EMAIL JS ===============*/
const contactForm = document.getElementById("contact-form"),
  contactName = document.getElementById("contact-name"),
  contactEmail = document.getElementById("contact-email"),
  contactProject = document.getElementById("contact-project"),
  contactMessage = document.getElementById("contact-message");
const sendEmail = (e) => {
  e.preventDefault();
  // Check if the field has a value
  if (contactName.value === "" || contactEmail.value === '' || contactProject.value==='') {
    // Add and remove color
    contactMessage.classList.remove("color-blue");
    contactMessage.classList.add("color-red");
    // Show message
    contactMessage.textContent = "Write all the input fields";
    // Remove message three seconds
    setTimeout(() => {
      contactMessage.textContent = "";
    }, 3000);
  } else {
    // serviceID - templateID - #form - publicKey
    emailjs
      .sendForm("serviceID", "templateID", "#contact-form", "publicKey")
      .then(
        () => {
          // Show message and add color
          contactMessage.classList.add("color-blue");
          contactMessage.textContent = "Message sent.";
        },
        (error) => {
          // Mail sending error
          contactMessage.classList.add("color-red");
          contactMessage.textContent =
            "OOPS! SOMETHING HAS FAILED...:" + error.text;
        }
      );
    // Remove message after three seconds
    setTimeout(() => {
      contactMessage.textContent = "";
    }, 4000);
    // To clear the input field
    contactName.value = "";
    contactEmail.value = "";
    contactProject.value = "";
  }
};
contactForm.addEventListener("submit", sendEmail);


/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll('section[id]')
    
const scrollActive = () =>{
  	const scrollY = window.pageYOffset

	sections.forEach(current =>{
		const sectionHeight = current.offsetHeight,
			  sectionTop = current.offsetTop - 58,
			  sectionId = current.getAttribute('id'),
			  sectionsClass = document.querySelector('.nav__menu a[href*=' + sectionId + ']')

		if(scrollY > sectionTop && scrollY <= sectionTop + sectionHeight){
			sectionsClass.classList.add('active-link')
		}else{
			sectionsClass.classList.remove('active-link')
		}                                                    
	})
}
window.addEventListener('scroll', scrollActive)


/*=============== SHOW SCROLL UP ===============*/ 
const scrollUp = () =>{
	const scrollUp = document.getElementById('scroll-up')
    // When the scroll is higher than 350 viewport height, add the show-scroll class to the a tag with the scrollup class
	this.scrollY >= 350 ? scrollUp.classList.add('show-scroll')
						: scrollUp.classList.remove('show-scroll')
}
window.addEventListener('scroll', scrollUp)


/*=============== DARK LIGHT THEME ===============*/ 


/*=============== CHANGE BACKGROUND HEADER ===============*/


/*=============== SCROLL REVEAL ANIMATION ===============*/

