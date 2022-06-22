class TypeWriter {
  constructor(txtElement, words, wait = 3000, el, correctWord) {
    this.txtElement = txtElement;
    this.words = words;
    this.txt = "";
    this.wordIndex = 0;
    this.wait = parseInt(wait, 10);
    this.type();
    this.isDeleting = false;
    this.el = el;
    this.correctWord = correctWord;
  }

  type() {
    // Current index of word
    const current = this.wordIndex % this.words.length;
    // Get full text of current word
    const fullTxt = this.words[current];
    // Check if deleting
    if (this.isDeleting) {
      // Remove char
      this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
      // Add char
      this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    // Insert txt into element
    this.txtElement.innerHTML = `<span class="txt">${this.txt}</span>`;

    // Initial Type Speed
    let typeSpeed = 300;

    if (this.isDeleting) {
      typeSpeed /= 2;
    }

    // If word is complete
    if (!this.isDeleting && this.txt === fullTxt) {
      // Make pause at end
      typeSpeed = this.wait;
      // Set delete to true
      this.isDeleting = true;
    } else if (this.isDeleting && this.txt === "") {
      this.isDeleting = false;
      // Move to next word
      this.wordIndex++;
      // Pause before start typing
      typeSpeed = 500;
    }
    if (this.words[current].length == this.txt.length) {
      if (this.correctWord == this.words[current]) {
        this.el.classList.add("true");
      } else {
        this.el.classList.add("false");
      }
    }
    if (this.txt.length == 0) {
      if (this.correctWord == this.words[current]) {
        this.el.classList.remove("true");
      } else {
        this.el.classList.remove("false");
      }
    }
    setTimeout(() => this.type(), typeSpeed);
  }
}

// Init On DOM Load
document.addEventListener("DOMContentLoaded", init);

// Init App
function init() {
  const txtElement = document.querySelector(".txt-type");
  const words = JSON.parse(txtElement.getAttribute("data-words"));
  const wait = txtElement.getAttribute("data-wait");

  const constraction = document.querySelector(".constraction");
  const correctWord = txtElement.getAttribute("data-correct-word");

  // Init TypeWriter
  new TypeWriter(txtElement, words, wait, constraction, correctWord);
}
