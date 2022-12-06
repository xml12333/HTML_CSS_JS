const show = (anything) => {
  document.querySelector(".textBox").value = anything;
};

let dropdown = document.querySelector('.dropdown')
dropdown.onclick = ()=>{
    dropdown.classList.toggle('active')
}