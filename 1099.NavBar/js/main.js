/*=============== SHOW MENU ===============*/
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

/*=============== REMOVE MENU MOBILE ===============*/
const navLink = document.querySelectorAll('.nav__link')

const linkAction = () =>{
   const navMenu = document.getElementById('nav-menu')
   // When we click on each nav__link, we remove the show-menu class
   navMenu.classList.remove('show-menu')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/*=============== NAVBAR SCROLL EFFECT ===============*/
let lastScroll = 0 // Previous scroll position

const scrollNav = () => {
   const header = document.getElementById('header'),
         currentScroll = window.scrollY

   // If the header scrolls down beyond 800px, collapse the header
   if (currentScroll > lastScroll && currentScroll >= 800) {
      header.classList.add('scroll-nav')
   } else {
      header.classList.remove('scroll-nav')
   }

   // Save the current scroll position to compare it in the next event
   lastScroll = currentScroll
}
window.addEventListener('scroll', scrollNav)
