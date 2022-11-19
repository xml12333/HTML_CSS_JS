// Events on Scroll
function scrollEvents() {
  const section = document.querySelectorAll(".section");
  const links = document.querySelectorAll(".nav__link");
  const menu = document.querySelector(".nav__list");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((link) => {
            const linkHref = link.getAttribute("href").replace("#", "");
            if (linkHref === entry.target.id) {
              link.classList.add("active");
            } else {
              link.classList.remove("active");
            }
          });
        }
      });
    },
    {
      threshold: 0.8,
    }
  );
  section.forEach((section) => {
    observer.observe(section);
  });
  menu.addEventListener("click", (e) => {
    if (e.target.classList.contains("nav__link")) {
      e.preventDefault();
      const sectionId = e.target.getAttribute("href").replace("#", "");
      window.scrollTo({
        top: document.getElementById(sectionId).offsetTop,
        behavior: "smooth",
      });
    }
  });
}

scrollEvents();

// Animate Progress bar
function animateProgressBar() {
  const progress = document.querySelector(".progress__bar");
  // number from top of page
  const scrollValue = document.documentElement.scrollTop;
  // height all papge
  const documentHeight = document.documentElement.scrollHeight;
  // screen height
  const viewportHeight = document.documentElement.clientHeight;
  // difference page height and screen height
  const height = documentHeight - viewportHeight;
  // procent
  const scrollPercent = (scrollValue / height) * 100;
  // progress style
  progress.style.width = scrollPercent + "%";
}
window.addEventListener("scroll", animateProgressBar);
