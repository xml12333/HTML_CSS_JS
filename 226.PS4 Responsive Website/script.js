const menu = document.getElementById("menu");
const menulist = document.getElementById("menulist");
menulist.style.maxHeight = "0px";
menu.onclick = () => {
  if (menulist.style.maxHeight == "0px") {
    menulist.style.maxHeight = "130px";
  } else {
    menulist.style.maxHeight = "0px";
  }
};
