const form = document.getElementById("form-containter");
const inputfield = document.getElementById("inputfield");
const popup = document.getElementById("popup-container");
const message = document.getElementById("message");
const popupBtn = document.getElementById("popup-btn-ok");
const popupEl = popup.querySelector(".popup");
form.addEventListener("submit", (e) => {
  if (inputfield.value) {
    message.innerHTML = `
    <h2>
    Well, 
    <span class="site"> ${inputfield.value}</span>, 
    you're ok.
    </h2>`;
    window.setTimeout(() => popupBtn.focus(), 0);
    popupEl.style.background = "#333";
    popupEl.style.color = "#f6f7d7";
  } else {
    window.setTimeout(() => popupBtn.focus(), 0);
    popupEl.style.background = "#FF9A00";
    popupEl.style.color = "#333";
    message.innerHTML = `<h2> Congratulations! <br> You can't type your name!</h2>`;
  }
  popup.style.display = "flex";
  inputfield.value = ''
  e.preventDefault();
});
popupBtn.addEventListener("click", () => {
  popup.style.display = "none";
});
document.addEventListener('focusin', function() {
    console.log('focused: ', document.activeElement)
  }, true);