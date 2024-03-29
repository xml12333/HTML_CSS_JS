const triggerOpen = document.querySelectorAll("[trigger-button]");
const triggerClose = document.querySelectorAll("[close-button]");
const overlay = document.querySelector("[data-overlay]");
for (let i = 0; i < triggerOpen.length; i++) {
  let currentId = triggerOpen[i].dataset.target,
    targetEl = document.querySelector(`#${currentId}`);

  const openData = function () {
    targetEl.classList.remove("active");
    overlay.classList.remove("active");
  };
  triggerOpen[i].addEventListener("click", function () {
    targetEl.classList.add("active");
    overlay.classList.add("active");
  });
  targetEl
    .querySelector("[close-button]")
    .addEventListener("click", function () {
      overlay.addEventListener("click", openData);
    });
}
