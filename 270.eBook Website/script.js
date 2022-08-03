const menuBtn = document.getElementById("menu-icon");
const mobileMenu = document.getElementById("mobile-menu");
menuBtn.onclick = () => {
  if (mobileMenu.style.height == "0px" || mobileMenu.style.height=="") {
    mobileMenu.style.height = "200px";
  } else {
    mobileMenu.style.height = "0px";
  }
};
