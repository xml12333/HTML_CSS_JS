const form = document.getElementById("form");
const messageEl = document.getElementById("message-popup");
const popupBtn = document.getElementById("popup-btn-ok");
const popup = document.getElementById("popup-container");

form.onsubmit = () => {
  sendEmail();
  return false;
};

function sendEmail() {
  Email.send({
    Host: "smtp.yourisp.com",
    Username: "username",
    Password: "password",
    To: "them@website.com",
    From: "you@isp.com",
    Subject: "Contact from form",
    Body:
      "Name: " +
      document.getElementById("name").value +
      "<br> Email: " +
      document.getElementById("email").value +
      "<br> Phone no: " +
      document.getElementById("phone").value +
      "<br> Message: " +
      document.getElementById("message").value,
  }).then((message) => {
    
    messageEl.innerHTML = `
    <h2>
    ${message}
    }}
    </h2>`;
    console.log(message)
    console.log(messageEl)
    popup.style.display = "flex";
  });
}

popupBtn.addEventListener("click", () => {
  popup.style.display = "none";
});
