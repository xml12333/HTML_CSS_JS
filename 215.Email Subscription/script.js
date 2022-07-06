const scriptURL = "<SCRIPT URL>";
const form = document.forms["submit-to-google-sheet"];
const msg = document.getElementById("msg");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  fetch(scriptURL, { method: "POST", body: new FormData(form) })
    .then((response) => {
      msg.innerHtml = "Thank You For Subscribing!";
      setTimeout(() => {
        msg.innerHtml = "";
      }, 4000);
      form.reset();
    })
    .catch((error) => console.error("Error!", error.message));
});
