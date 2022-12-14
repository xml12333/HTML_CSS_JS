VanillaTilt.init(document.querySelectorAll(".sci li a"), {
    max: 30,
    speed: 400,
    glare: true,
    "max-glare" : 1,
});


let list = document.querySelectorAll(".sci li");
let bg = document.querySelector(".container");
list.forEach((el) => {
  el.addEventListener("mouseenter", (e) => {
    let color = e.target.getAttribute("data-color");
    bg.style.backgroundColor = color;
  });
  el.addEventListener("mouseleave", (e) => {
    bg.style.backgroundColor = '#fff';
  });
});
