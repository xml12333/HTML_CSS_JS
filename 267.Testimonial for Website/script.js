const userText = Array.from(document.getElementsByClassName("user-text"));
const userPics = Array.from(document.getElementsByClassName("user-pic"));
userPics.forEach((el, idx) => {
  el.onclick = () => {
    userPics.forEach((pic) => {
      pic.classList.remove("active-pic");
    });
    userText.forEach((text, tIdx) => {
      text.style.opacity = 0;
      if (idx == tIdx) {
        text.classList.remove("active-text");
      } else {
        setTimeout(() => {
          text.classList.remove("active-text");
        }, 250);
      }
    });

    userText[idx].classList.add("active-text");
    setTimeout(() => {
      userText[idx].style.opacity = 1;
    }, 250);

    el.classList.add("active-pic");
  };
});
