/*=============== SHOW & CLOSE MENU ===============*/
const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close')

/* Show menu */
if(navToggle){
   navToggle.addEventListener('click', () =>{
      navMenu.classList.add('show-menu')
   })
}

/* Hide menu */
if(navClose){
   navClose.addEventListener('click', () =>{
      navMenu.classList.remove('show-menu')
   })
}

/*=============== REMOVE MOBILE MENU ===============*/
const navLink = document.querySelectorAll('.nav__link')

const linkAction = () =>{
   const navMenu = document.getElementById('nav-menu')
   // When we click on each nav__link, we remove the show-menu class
   navMenu.classList.remove('show-menu')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/*=============== CHANGE HEADER STYLES ===============*/
const scrollHeader = () => {
  const header = document.getElementById("header");
  // When the scroll is greater than 50 viewport height, add the scroll-header class to the header tag
  this.scrollY >= 50
    ? header.classList.add("scroll-header")
    : header.classList.remove("scroll-header");
};
window.addEventListener("scroll", scrollHeader);

/*=============== SWIPER CASES ===============*/
const swiperCase = new Swiper('.case__swiper', {
   loop: true,
   grabCursor: true,
   slidesPerView: 'auto',
   centeredSlides: 'auto',
   spaceBetween: 16,
   speed: 600,
   effect: 'creative',
   creativeEffect: {
      limitProgress: 2,
      prev: {
         translate: ['-100%', 0, 0],
         scale: 0.85,
      },
      next: {
         translate: ['100%', 0, 0],
         scale: 0.85,
      },
   },

   navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
   },
   // autoplay: {
   //    delay: 3000,
   //    disableOnInteraction: false,
   // },
})


/*=============== QUESTIONS FAQS ===============*/
const questionsCards = document.querySelectorAll('.questions__card'),
      questionsButtons = document.querySelectorAll('.questions__button')

questionsButtons.forEach(button => {
   button.addEventListener('click', () => {
      const currentCard = button.closest('.questions__card'), // Get the class of the clicked button and ⬇
            isOpen = currentCard.classList.contains('questions-open') // Checks if the card is already open (returns true or false)

      // Close all other services data
      questionsCards.forEach(card => {
         card.classList.replace('questions-open', 'questions-close')
      })

      // If the clicked card was closed, it opens it.
      if(!isOpen){
         currentCard.classList.replace('questions-close', 'questions-open')
      }
   })
})

/*=============== SWIPER CLIENTS ===============*/
const swiperClients = new Swiper('.clients__swiper', {
   loop: true,
   grabCursor: true,
   slidesPerView: 'auto',
   centeredSlides: 'auto',
   spaceBetween: 16,
   speed: 600,

   navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
   },
   autoplay: {
      delay: 3000,
      disableOnInteraction: false,
   },
})

/*=============== CONTACT EMAIL JS ===============*/
const contactForm = document.getElementById('contact-form'),
      contactMessage = document.getElementById('contact-message')

const sendEmail = async (e) => {
   // Prevent the page from reloading
   e.preventDefault() 

   /*
      The code for sending emails is a sample test.

      Create your account at https://www.emailjs.com/ 
      and follow the instructions in the video and images 
      to send emails with your account.
   */
   
   try {
      // serviceID - templateID - #form - publicKey
      await emailjs.sendForm('service_8ii265v', 'template_85g6ftk', '#contact-form', 'VQaq6RG_bXgUd7BNm')

      // Show sent message
      contactMessage.textContent = 'Message sent successfully ✅'
      
      // Clear input fields
      contactForm.reset()
   } catch (error) {
      // Show error message
      contactMessage.textContent = 'Message not sent (service error) ❌'
      console.log(error)
   } finally {
      // Remove message after five seconds
      setTimeout(() => contactMessage.textContent = '', 5000)
   }
}
contactForm.addEventListener('submit', sendEmail)


/*=============== CURRENT YEAR OF THE FOOTER ===============*/ 
const textYear = document.getElementById('footer-date'), 
      currentYear = new Date().getFullYear()

// Each year it is updated to the current year
textYear.textContent = currentYear

/*=============== SHOW SCROLL UP ===============*/ 
const scrollUp = () =>{
	const scrollUp = document.getElementById('scroll-up')
   // Add the .scroll-header class if the bottom scroll of the viewport is greater than 350
	this.scrollY >= 350 ? scrollUp.classList.add('show-scroll')
						     : scrollUp.classList.remove('show-scroll')
}
window.addEventListener('scroll', scrollUp)

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/


/*=============== SCROLL REVEAL ===============*/
