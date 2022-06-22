const nameError = document.getElementById("name-error");
const phoneError = document.getElementById("phone-error");
const emailError = document.getElementById("email-error");
const messageError = document.getElementById("message-error");
const submitError = document.getElementById("submit-error");
const contactName = document.getElementById("contact-name");
const contactPhone = document.getElementById("contact-phone");
const contactEmail = document.getElementById("contact-email");
const contactMessage = document.getElementById("contact-message");
const submitBtn = document.getElementById("submitBtn");

contactName.onkeyup = validateName;
contactPhone.onkeyup = validatePhone;
contactEmail.onkeyup = validateEmail;
contactMessage.onkeyup = validateMessage;
submitBtn.onclick = validateForm;

function validateName() {
  const name = contactName.value;
  if (name.length == 0) {
    nameError.innerHTML = "Name is required";
    return false;
  }
  if (!name.match(/^[A-Za-z]+\s{1}[A-Za-z]+$/)) {
    nameError.innerHTML = "Write full name";
    return false;
  }
  nameError.innerHTML = `<i class="fas fa-check-circle"></i>`;
  return true;
}

function validatePhone() {
  const phone = contactPhone.value;
  if (phone.length == 0) {
    phoneError.innerHTML = "Phone № is required";
    return false;
  }

  if (!phone.match(/^[0-9]{3}\s?[0-9]{3}\s?[0-9]{4}$/)) {
    phoneError.innerHTML = "Phone № is invalid";
    return false;
  }
  phoneError.innerHTML = `<i class="fas fa-check-circle"></i>`;
  return true;
}

function validateEmail() {
  const email = contactEmail.value;
  if (email.length == 0) {
    emailError.innerHTML = "Email is required";
    return false;
  }

  if (!email.match(/^[A-Za-z\._\-0-9]*[@][A-Za-z]+[\.][a-z]{2,4}$/)) {
    emailError.innerHTML = "Email is invalid";
    return false;
  }
  emailError.innerHTML = `<i class="fas fa-check-circle"></i>`;
  return true;
}

function validateMessage() {
  const message = contactMessage.value;
  let required = 30;
  let left = required - message.length;
  if (left > 0) {
    messageError.innerHTML = left + " more characters required";
    return false;
  }
  messageError.innerHTML = `<i class="fas fa-check-circle"></i>`;
  return true;
}

function validateForm() {
  if (!validateName() || !validatePhone || !validateEmail || !validateMessage) {
    submitError.style.display = "block";
    submitError.innerHTML = "Please fix error to submit";
    setTimeout(() => {
      submitError.style.display = "none";
    }, 3000);
    return false;
  }
}
