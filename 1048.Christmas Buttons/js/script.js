/* Snow particles for button */
const snowBtn = document.getElementById("snowBtn");

setInterval(() => {
  const snow = document.createElement("span");
  snow.innerHTML = "❄";
  snow.style.left = Math.random() * 100 + "%";
  snow.style.fontSize = Math.random() * 10 + 10 + "px";
  snow.style.animationDuration = Math.random() * 2 + 3 + "s";
  snowBtn.appendChild(snow);

  setTimeout(() => snow.remove(), 5000);
}, 300);