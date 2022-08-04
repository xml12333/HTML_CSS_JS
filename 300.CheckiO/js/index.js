(function () {
  var animateStart = function () {
    if (window.innerWidth > 770) {
      config.stop = false;
    }
  };
  var animateStop = function () {
    config.stop = true;
    console.log("in");
  };

  document
    .getElementById("background-container")
    .addEventListener("mouseenter", animateStart);
  document
    .getElementById("background-container")
    .addEventListener("mouseleave", animateStop);
  config.stop = true;
  //do not do any animation for mobile
  if (window.innerWidth <= 770) {
    config.stop = true;
  }
})();
