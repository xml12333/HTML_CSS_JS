//add hovered class in selectred list item
let list = document.querySelectorAll(".navigation li");
function activeLink() {
  list.forEach((item) => {
    item.classList.remove("hovered");
    this.classList.add("hovered");
  });
}
list.forEach((item) => {
  item.addEventListener("mouseover", activeLink);
});

// menuToggle
let toggle = document.querySelector(".toggle");
let main = document.querySelector(".main");
let navigation = document.querySelector(".navigation");

toggle.onclick = ()=>{
  navigation.classList.toggle('active')
  main.classList.toggle('active')
  
}