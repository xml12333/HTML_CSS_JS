const enhance = () => {
    document.querySelectorAll(".word").forEach((word) => {
      const letters = word.innerText.split("");
      word.innerHTML = null;
      letters.forEach((letter) => {
        word.innerHTML += `<span class="letter">${letter}</span>`;
      });
    });
  };
  enhance();