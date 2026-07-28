/*=============== INPUT JS ===============*/
const showHiddenPass = (password, iconPass) => {
   const input = document.getElementById(password),
         icon = document.getElementById(iconPass)

   icon.addEventListener('click', () => {
      input.type === 'password' ? input.type = 'text'
                                : input.type = 'password'

      icon.classList.toggle('ri-lock-2-line')
      icon.classList.toggle('ri-eye-line')
   })
}
showHiddenPass('inputPass','inputIcon')
