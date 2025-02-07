var cube = document.getElementById("cube");
var cubeWrap = document.getElementById("cube-wrap");
var isDragging = false;

var currentX, currentY, initialX, initialY;
var xOffset = 0,
  yOffset = 0;

// For desktop
cubeWrap.addEventListener("mousedown", dragStart, false);
cubeWrap.addEventListener("mouseup", dragEnd, false);
cubeWrap.addEventListener("mousemove", drag, false);

// For mobile touch
cubeWrap.addEventListener("touchstart", dragStart, false);
cubeWrap.addEventListener("touchend", dragEnd, false);
cubeWrap.addEventListener("touchmove", drag, false);

function dragStart(e) {
  e = e.type == "touchstart" ? e.touches[0] : e; // For touch event
  initialX = e.clientX - xOffset;
  initialY = e.clientY - yOffset;

  // Check if the target is cubeWrap or a child of cubeWrap
  if (cubeWrap.contains(e.target)) {
    isDragging = true;
  }
}


function dragEnd() {
  initialX = currentX;
  initialY = currentY;
  isDragging = false;
}

function drag(e) {
  if (isDragging) {
    e = e.type == "touchmove" ? e.touches[0] : e; // For touch event
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;
    xOffset = currentX;
    yOffset = currentY;

    setTranslate(currentX, currentY, cube);
  }
}

function setTranslate(xPos, yPos, el) {
  el.style.transform = "rotateX(" + (-yPos) + "deg) rotateY(" + (-xPos) + "deg)"; 
}