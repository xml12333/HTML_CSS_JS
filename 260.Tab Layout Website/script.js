const content = document.querySelectorAll(".content");
const btn = document.querySelectorAll(".btn");

const change = (i) => {
  Array.from(content).forEach((el, idx) => {
    console.log(el, i);
    if (idx === i) {
      el.style.transform = "translateX(0)";
      el.style.transitionDelay = "0.3s";
    } else {
      el.style.transform = "translateX(100%)";
      el.style.transitionDelay = "0";
    }
  });
};
Array.from(btn).forEach((el, idx) => {
  el.onclick = () => {
    change(idx);
    Array.from(btn).forEach((el) => (el.style.color = "#000"));

    el.style.color = "#ff7846";
  };
});
