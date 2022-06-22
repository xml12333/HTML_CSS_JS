const cpnBtn = document.querySelector(".cpnBtn");
const cpnCode = document.querySelector(".cpnCode");

cpnBtn.onclick = () => {
  navigator.clipboard.writeText(cpnCode.innerHTML);
  cpnBtn.innerText = "COPIED";
  
  setTimeout(() => {
    cpnBtn.innerText = "COPY CODE";
  }, 3000);
};
