let navigation = document.querySelector(".navigation");
let closeEl = document.querySelector(".close");
navigation.onclick = () => {
  navigation.classList.add("active");
};
closeEl.onclick = () => {
  navigation.classList.remove("active");
};
