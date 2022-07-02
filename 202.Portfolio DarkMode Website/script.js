const icon = document.getElementById("icon");

let localData = localStorage.getItem("theme");
if (!localData) {
  localStorage.setItem("theme", "light");
  localData = localStorage.getItem("theme");
}
if (localData === "light") {
  icon.src = "img/moon.png";
  document.body.classList.remove("dark-theme");
} else {
  document.body.classList.add("dark-theme");
  icon.src = "img/sun.png";
}
icon.onclick = () => {
  document.body.classList.toggle("dark-theme");
  if (document.body.classList.contains("dark-theme")) {
    icon.src = "img/sun.png";
    localStorage.setItem("theme", "dark");
  } else {
    icon.src = "img/moon.png";
    localStorage.setItem("theme", "light");
  }
};
