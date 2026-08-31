/*=============== TABS BUTTONS WITH SMOOTH ANIMATION ===============*/ 
const tabs = document.querySelectorAll('[data-target]'),
      tabContents = document.querySelectorAll('[data-content]')

tabs.forEach((tab) => {
   tab.addEventListener('click', () => {
      const targetSelector = tab.dataset.target,
            targetContent = document.querySelector(targetSelector),
            currentContent = document.querySelector('[data-content].main-active')

      // Avoid re-triggering if the same tab is clicked
      if(targetContent === currentContent) return

      // Switch active button
      tabs.forEach((t) => t.classList.remove('main-active'))
      tab.classList.add('main-active')

      // Fade out current content
      currentContent.classList.remove('show')

      currentContent.addEventListener('transitionend', function handler(){
         currentContent.classList.remove('main-active')
         currentContent.removeEventListener('transitionend', handler)

         // Fade in new content
         targetContent.classList.add('main-active')

         requestAnimationFrame(() => {
            requestAnimationFrame(() => {
               targetContent.classList.add('show')
            })
         })
      }, { once: true })
   })
})

/*=============== INITIAL FADE IN ON LOAD ===============*/
window.addEventListener('load', () => {
   const initialContent = document.querySelector('[data-content].main-active')
   requestAnimationFrame(() => {
      requestAnimationFrame(() => {
         initialContent.classList.add('show')
      })
   })
})

/*=============== SCROLL REVEAL ANIMATION ===============*/
