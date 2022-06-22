const time = document.getElementById("current-time");
let d = new Date();
time.innerHTML = d.toLocaleTimeString();
setInterval(() => {
  let d = new Date();
  time.innerHTML = d.toLocaleTimeString();
}, 1000);
