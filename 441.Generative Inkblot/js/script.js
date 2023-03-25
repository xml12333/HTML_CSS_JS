const body = document.body;
const group = document.getElementById("svgGroup");
 

// Instructions for making a circle
function drawCircle() { 
  // Make SVG circle
  let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("r", Math.floor(Math.random() * 60));
  circle.setAttribute("cx", Math.floor(Math.random() * 500) + 150); 
  circle.setAttribute("cy", Math.floor(Math.random() * 500));
  circle.setAttribute("opacity", "1" );
  circle.setAttribute("fill", "black");
  
  // Make SMIL animation
  let animation = document.createElementNS("http://www.w3.org/2000/svg", "animate");
  animation.setAttribute("attributeName", "opacity");
  animation.setAttribute("from", "0"); 
  animation.setAttribute("to", "1");
  animation.setAttribute("fill", "freeze");
  animation.setAttribute("dur", "200ms"); 
 
  // Append animation to circle, append circle to g
  circle.appendChild(animation);
  group.appendChild(circle);
  
  // Begin animation
  animation.beginElement();
}

// Draw a random circle every 5 milliseconds until limit is reached
function drawRandom() { 
  for (i = 0; i < 50; i++) {
    setTimeout( function timer(){
      drawCircle();
    }, i*3 );
  }
}

//Remove all SVG shapes from DOM
function removeAll() {
  while (group.firstChild) {
    group.removeChild(group.lastChild);
  }
}

//On click, remove all shapes and draw new shapes
body.addEventListener("click", function(){
  removeAll();
  drawRandom();
});

//On page load, draw new shapes
drawRandom();