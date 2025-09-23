/*=============== BUTTON HOVER EFFECTS ===============*/
const button = document.querySelector('.button')

button.addEventListener('mousemove', (e) => {
   // Contains the size and position of the button relative to the window (viewport)
   const rect = button.getBoundingClientRect()

   // Calculate the position (x, y) of the mouse to the top left edge of the button
   const x = e.clientX - rect.left,
         y = e.clientY - rect.top

   // Button center coordinates
   const centerX = rect.width / 2,
         centerY = rect.height / 2

   // Determines how far the pointer has moved from the center of the button
   // This is used to simulate light direction
   const offsetX = x - centerX,
         offsetY = y - centerY

   // Smooth the values so that mouse movement doesn't cause exaggerated shadows
   // Split (/5) = reduce the intensity of the effect
   // The larger the divider, the softer or more subtle the shadow.
   const shadowX = offsetX / 5, // shadowX y shadowY: external shadows
         shadowY = offsetY / 1.5

   const insetX = offsetX  / 22, // insetX y insetY: internal shadows
         insetY = offsetY / 8

   // Apply dynamic shadow
   button.style.boxShadow = `inset ${-insetX}px ${-insetY}px 2px var(--dark-color),
                             inset ${insetX}px ${insetY}px 2px var(--white-color),
                             ${shadowX}px ${shadowY}px 14px -14px var(--white-color),
                             ${shadowX * 3}px ${shadowY * 3}px 48px hsla(235, 32%, 4%, .6)`
})

// Reset the default shadow
button.addEventListener('mouseleave', () => {
   button.style.boxShadow = `inset 0 -2px 2px var(--dark-color),
                             inset 0 2px 2px var(--white-color),
                             0 18px 14px -14px var(--white-color),
                             -24px 40px 48px hsla(235, 32%, 4%, .6)`                          
})
