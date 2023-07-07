function randInt(max) {
    return Math.floor(Math.random() * max);
  }
  
  // var gridContainer = document.getElementById("grid__container");
  var gridItems = document.querySelectorAll(".grid__item");
  
  function generateBlocks() {
    for (gridItem of gridItems) {
      var FILLED = randInt(3);
      var ROTATED = randInt(6) * 45;
      var CIRCLE = randInt(2);
      var backgroundColour = "";
      var borderColour = "";
      var fontColour = "white";
      var borderRadius = "10%";
  
      switch(FILLED) {
        case 0: 
          backgroundColour = "hsla(" + randInt(360) + "deg, 75%, 100%, 0%)";
          borderColour="4px solid hsl(" + randInt(360) + "deg, 75%, 75%)";
          break;
        case 1: 
          backgroundColour = "hsla(" + randInt(360) + "deg, 75%, 75%, 100%)";
          break;
        case 2: 
          backgroundColour = "transparent";
          fontColour = "black";
          break;
      }
  
      switch(CIRCLE) {
        case 1:
          borderRadius="50%";
      }
  
      gridItem.setAttribute("style", `
                        background-color: ${backgroundColour};
                        border: ${borderColour};
                        transform: rotate(${ROTATED}deg);
                        color: ${fontColour};
                        border-radius: ${borderRadius};
                        `);
  
    }
  }
  
  generateBlocks();