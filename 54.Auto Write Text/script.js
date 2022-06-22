const text =
  "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto fugit voluptatum eos? Repellat quasi dicta nulla voluptate rem odio, nostrum quaerat! Doloremque pariatur, aspernatur deleniti beatae quibusdam assumenda necessitatibus sint.";
let index = 0;
function writeText() {
  document.body.innerHTML = text.slice(0, index);
  index++;
  if (index > text.length - 1) {
    index = 0;
  }
}

setInterval(writeText,100)
