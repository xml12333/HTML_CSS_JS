const textBox = document.getElementById("textBox");
const prevText = document.getElementById("prevText");
const file = document.getElementById("file");
const imgBox = document.getElementById("imgBox");

textBox.onkeyup = textBox.onkeypress = (e) => {
  prevText.innerHTML = e.target.value;
};

file.onchange = (e) => {
  imgBox.style.backgroundImage = `url(${URL.createObjectURL(
    e.target.files[0]
  )})`;
};
