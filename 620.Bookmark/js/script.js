const menuItems = document.querySelectorAll(".sidebar-menu__link");

const navItems = document.querySelectorAll(".nav-item");

menuItems.forEach((menuItem) => {
  menuItem.addEventListener("click", (e) => {
    if (!e.target.classList.contains("active")) {
      document
        .querySelector(".sidebar-menu__link.active")
        .classList.remove("active");
      e.target.classList.add("active");
    }
  });
});

navItems.forEach((navItem) => {
  navItem.addEventListener("click", (e) => {
    if (!e.target.classList.contains("active")) {
      document.querySelector(".nav-item.active").classList.remove("active");
      e.target.classList.add("active");
    }
  });
});

const cards = document.querySelectorAll(".card");
const mainContent = document.querySelector(".main-content");

cards.forEach((card) => {
  card.addEventListener("click", () => {
    console.log("");
    document.startViewTransition(() => {
      if (!card.classList.contains('active')) {
        mainContent.classList.add("expanded");
        card.classList.add("active");
      } else {
        card.classList.remove("active");
        mainContent.classList.remove("expanded");
      }
    });
  });
});
