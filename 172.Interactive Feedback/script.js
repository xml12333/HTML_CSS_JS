const stars = document.querySelectorAll(".fas");
const emoji = document.getElementById("emoji");
stars.forEach((item, idx) => {
  stars[idx].onclick = () => {
    let i = 0;
    for (i; i <= idx; i++) {
      stars[i].style.color = "#ffd93b";
    }
    for (i; i < stars.length; i++) {
      stars[i].style.color = "#e4e4e4";
    }
    emoji.style.transform = `translateX(${idx * -100}px)`;
  };
});
