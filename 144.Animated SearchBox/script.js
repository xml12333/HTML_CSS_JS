const searchBox = document.getElementById("searchBox");
const googleIcon = document.getElementById("googleIcon");

googleIcon.onclick = () => {
  searchBox.classList.toggle("active");
};
