const openBtn = document.getElementById('open')
const closeBtn= document.getElementById('close')
const popup = document.querySelector('.popup-container')
openBtn.addEventListener('click',()=>{
    popup.classList.add('active')
})

closeBtn.addEventListener('click',()=>{
    popup.classList.remove('active')
})