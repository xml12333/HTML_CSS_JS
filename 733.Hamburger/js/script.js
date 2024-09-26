/////////////////////////////////////////////////////
/////////////////////  ICON 1  //////////////////////
/////////////////////////////////////////////////////

///Initiation Variables
var icon_1 = document.getElementById("b1");
var topLine_1 = document.getElementById("top-line-1");
var middleLine_1 = document.getElementById("middle-line-1");
var bottomLine_1 = document.getElementById("bottom-line-1");
var state_1 = "menu";  // can be "menu" or "arrow"
var topLineY_1;
var middleLineY_1;
var bottomLineY_1;
var topLeftY_1;
var topRightY_1;
var bottomLeftY_1;
var bottomRightY_1;
var topLeftX_1;
var topRightX_1;
var bottomLeftX_1;
var bottomRightX_1;

///Animation Variables
var segmentDuration_1 = 15;
var menuDisappearDurationInFrames_1 = segmentDuration_1;
var arrowAppearDurationInFrames_1 = segmentDuration_1;
var arrowDisappearDurationInFrames_1 = segmentDuration_1;
var menuAppearDurationInFrames_1 = segmentDuration_1;
var menuDisappearComplete_1 = false;
var arrowAppearComplete_1 = false;
var arrowDisappearComplete_1 = false;
var menuAppearComplete_1 = false;
var currentFrame_1 = 1;

///Menu Disappear 
function menuDisappearAnimation_1() {
	currentFrame_1++;
	if ( currentFrame_1 <= menuDisappearDurationInFrames_1 ) {
		window.requestAnimationFrame( ()=> { 
			//top line
			topLineY_1 = AJS.easeInBack( 37, 50, menuDisappearDurationInFrames_1, currentFrame_1 );
			topLine_1.setAttribute( "d", "M30,"+topLineY_1+" L70,"+topLineY_1 );
			//bottom line
			bottomLineY_1 = AJS.easeInBack( 63, 50, menuDisappearDurationInFrames_1, currentFrame_1 );
			bottomLine_1.setAttribute( "d", "M30,"+bottomLineY_1+" L70,"+bottomLineY_1 );
			//recursion
			menuDisappearAnimation_1();
		});
	} else {
		middleLine_1.style.opacity = "0";
		currentFrame_1 = 1;
		menuDisappearComplete_1 = true;
		openMenuAnimation_1();
	}
}

///Cross Appear
function arrowAppearAnimation_1() {
	currentFrame_1++;
	if ( currentFrame_1 <= arrowAppearDurationInFrames_1 ) {
		window.requestAnimationFrame( ()=> { 
			//top line
			topLeftX_1 = AJS.easeOutBack( 30, 35, arrowAppearDurationInFrames_1, currentFrame_1 );
			topLeftY_1 = AJS.easeOutBack( 50, 35, arrowAppearDurationInFrames_1, currentFrame_1 );
			bottomRightX_1 = AJS.easeOutBack( 70, 65, arrowAppearDurationInFrames_1, currentFrame_1 );
			bottomRightY_1 = AJS.easeOutBack( 50, 65, arrowAppearDurationInFrames_1, currentFrame_1 );
			topLine_1.setAttribute( "d", "M" + topLeftX_1 + "," + topLeftY_1 + " L" + bottomRightX_1 + "," + bottomRightY_1 );
			//bottom line
			bottomLeftX_1 = AJS.easeOutBack( 30, 35, arrowAppearDurationInFrames_1, currentFrame_1 );
			bottomLeftY_1 = AJS.easeOutBack( 50, 65, arrowAppearDurationInFrames_1, currentFrame_1 );
			topRightX_1 = AJS.easeOutBack( 70, 65, arrowAppearDurationInFrames_1, currentFrame_1 );
			topRightY_1 = AJS.easeOutBack( 50, 35, arrowAppearDurationInFrames_1, currentFrame_1 );
			bottomLine_1.setAttribute( "d", "M" + bottomLeftX_1 + "," + bottomLeftY_1 + " L" + topRightX_1 + "," + topRightY_1 );
			//recursion
			arrowAppearAnimation_1();
		});
	} else {
		currentFrame_1 = 1;
		arrowAppearComplete_1 = true;
		openMenuAnimation_1();
	}
}

///Combined Open Menu Animation
function openMenuAnimation_1() {
	if ( !menuDisappearComplete_1 ) { 
		menuDisappearAnimation_1();
	} else if ( !arrowAppearComplete_1) {
		arrowAppearAnimation_1();
	}
}

///Cross Disappear
function arrowDisappearAnimation_1() {
	currentFrame_1++;
	if ( currentFrame_1 <= arrowDisappearDurationInFrames_1 ) {
		window.requestAnimationFrame( ()=> {
			//top line
			topLeftX_1 = AJS.easeInBack( 35, 30, arrowDisappearDurationInFrames_1, currentFrame_1 );
			topLeftY_1 = AJS.easeInBack( 35, 50, arrowDisappearDurationInFrames_1, currentFrame_1 );
			bottomRightX_1 = AJS.easeInBack( 65, 70, arrowDisappearDurationInFrames_1, currentFrame_1 );
			bottomRightY_1 = AJS.easeInBack( 65, 50, arrowDisappearDurationInFrames_1, currentFrame_1 );
			topLine_1.setAttribute( "d", "M" + topLeftX_1 + "," + topLeftY_1 + " L" + bottomRightX_1 + "," + bottomRightY_1 );
			//bottom line
			bottomLeftX_1 = AJS.easeInBack( 35, 30, arrowDisappearDurationInFrames_1, currentFrame_1 );
			bottomLeftY_1 = AJS.easeInBack( 65, 50, arrowDisappearDurationInFrames_1, currentFrame_1 );
			topRightX_1 = AJS.easeInBack( 65, 70, arrowDisappearDurationInFrames_1, currentFrame_1 );
			topRightY_1 = AJS.easeInBack( 35, 50, arrowDisappearDurationInFrames_1, currentFrame_1 );
			bottomLine_1.setAttribute( "d", "M" + bottomLeftX_1 + "," + bottomLeftY_1 + " L" + topRightX_1 + "," + topRightY_1 );
			//recursion
			arrowDisappearAnimation_1();
		});
	} else {
		middleLine_1.style.opacity = "1";
		currentFrame_1 = 1;
		arrowDisappearComplete_1 = true;
		closeMenuAnimation_1();
	}
}

///Menu Appear
function menuAppearAnimation_1() {
	currentFrame_1++;
	if ( currentFrame_1 <= menuAppearDurationInFrames_1 ) {
		window.requestAnimationFrame( ()=> {
			//top line
			topLineY_1 = AJS.easeOutBack( 50, 37, menuDisappearDurationInFrames_1, currentFrame_1 );
			topLine_1.setAttribute( "d", "M30,"+topLineY_1+" L70,"+topLineY_1 );
			//bottom line
			bottomLineY_1 = AJS.easeOutBack( 50, 63, menuDisappearDurationInFrames_1, currentFrame_1 );
			bottomLine_1.setAttribute( "d", "M30,"+bottomLineY_1+" L70,"+bottomLineY_1 );
			//recursion
			menuAppearAnimation_1();
		});
	} else {
		currentFrame_1 = 1;
		menuAppearComplete_1 = true;
		closeMenuAnimation_1();
	}
}

///Close Menu Animation
function closeMenuAnimation_1() {
	if ( !arrowDisappearComplete_1 ) {
		arrowDisappearAnimation_1();
	} else if ( !menuAppearComplete_1 ) {
		menuAppearAnimation_1();
	}
}

///Events
icon_1.addEventListener( "click", ()=> { 
  if ( state_1 === "menu" ) {
  	openMenuAnimation_1();
  	state_1 = "arrow";
  	arrowDisappearComplete_1 = false;
		menuAppearComplete_1 = false;
  } else if ( state_1 === "arrow" ) {
  	closeMenuAnimation_1();
  	state_1 = "menu";
  	menuDisappearComplete_1 = false;
		arrowAppearComplete_1 = false;
  }
});



/////////////////////////////////////////////////////
/////////////////////  ICON 2  //////////////////////
/////////////////////////////////////////////////////

///Initiation Variables
var icon_2 = document.getElementById("b2");
var topLine_2 = document.getElementById("top-line-2");
var middleLine_2 = document.getElementById("middle-line-2");
var bottomLine_2 = document.getElementById("bottom-line-2");
var state_2 = "menu";  // can be "menu" or "cross"
var topLineY_2;
var middleLineY_2;
var bottomLineY_2;
var topLeftY_2;
var topRightY_2;
var bottomLeftY_2;
var bottomRightY_2;
var topLeftX_2;
var topRightX_2;
var middleLeftX_2;
var middleRightX_2;
var bottomLeftX_2;
var bottomRightX_2;

///Animation Variables
var segmentDuration_2 = 25;
var menuDisappearDurationInFrames_2 = segmentDuration_2;
var crossAppearDurationInFrames_2 = Math.round( segmentDuration_2*0.35 );
var crossDisappearDurationInFrames_2 = Math.round( segmentDuration_2*0.6 );
var menuAppearDurationInFrames_2 = segmentDuration_2;
var menuDisappearComplete_2 = false;
var crossAppearComplete_2 = false;
var crossDisappearComplete_2 = true;
var menuAppearComplete_2 = true;
var currentFrame_2 = 0;
var lineDisappearDelay_2 = segmentDuration_2*0.2;
var lineAppearDelay_2 = lineDisappearDelay_2;
var lineDisappearDurationInFrames_2 = segmentDuration_2 - lineDisappearDelay_2*2;
var lineAppearDurationInFrames_2 = lineDisappearDurationInFrames_2;
var topLineOpacity_2 = 1;
var middleLineOpacity_2 = 1;
var bottomLineOpacity_2 = 1;

///Menu Disappear
function menuDisappearAnimation_2() {
	currentFrame_2++;
	if ( currentFrame_2 <= menuDisappearDurationInFrames_2 ) {
		window.requestAnimationFrame( ()=> { 
			//top line
      if ( currentFrame_2 <= lineDisappearDurationInFrames_2 ) {
        topLeftX_2 = AJS.easeInBack( 30, 130, lineDisappearDurationInFrames_2, currentFrame_2 );
        topRightX_2 = AJS.easeInBack( 70, 170, lineDisappearDurationInFrames_2, currentFrame_2 );
        topLine_2.setAttribute( "d", "M"+topLeftX_2+",37 L"+topRightX_2+",37 Z" );
        topLineOpacity_2 = AJS.linear( 1, 0, lineDisappearDurationInFrames_2*0.85, currentFrame_2 );
        topLine_2.style.opacity = topLineOpacity_2;
      }
      //middle line
      if ( currentFrame_2 > lineDisappearDelay_2 && currentFrame_2 <= lineDisappearDurationInFrames_2 + lineDisappearDelay_2 ) {
        middleLeftX_2 = AJS.easeInBack( 30, 130, lineDisappearDurationInFrames_2, currentFrame_2 - lineDisappearDelay_2 );
        middleRightX_2 = AJS.easeInBack( 70, 170, lineDisappearDurationInFrames_2, currentFrame_2 - lineDisappearDelay_2 );
        middleLine_2.setAttribute( "d", "M"+middleLeftX_2+",50 L"+middleRightX_2+",50 Z" );
        middleLineOpacity_2 = AJS.linear( 1, 0, lineDisappearDurationInFrames_2*0.85, currentFrame_2 - lineDisappearDelay_2 );
        middleLine_2.style.opacity = middleLineOpacity_2;
      }
      //bottom line
      if ( currentFrame_2 > lineDisappearDelay_2*2 ) {
        bottomLeftX_2 = AJS.easeInBack( 30, 130, lineDisappearDurationInFrames_2, currentFrame_2 - lineDisappearDelay_2*2 );
        bottomRightX_2 = AJS.easeInBack( 70, 170, lineDisappearDurationInFrames_2, currentFrame_2 - lineDisappearDelay_2*2 );
        bottomLine_2.setAttribute( "d", "M"+bottomLeftX_2+",63 L"+bottomRightX_2+",63 Z" );
        bottomLineOpacity_2 = AJS.linear( 1, 0, lineDisappearDurationInFrames_2*0.85, currentFrame_2 - lineDisappearDelay_2*2 );
        bottomLine_2.style.opacity = bottomLineOpacity_2;
      }
			//recursion
			menuDisappearAnimation_2();
		});
	} else {
		currentFrame_2 = 0;
		menuDisappearComplete_2 = true;
		openMenuAnimation_2();
	}
}

///Cross Appear
function crossAppearAnimation_2() {
	currentFrame_2++;
	if ( currentFrame_2 <= crossAppearDurationInFrames_2 ) {
		window.requestAnimationFrame( ()=> { 
			//top line
			topLeftX_2 = AJS.easeInQuad( -30, 35, crossAppearDurationInFrames_2, currentFrame_2 );
			topLeftY_2 = AJS.easeInQuad( -30, 35, crossAppearDurationInFrames_2, currentFrame_2 );
			bottomRightX_2 = AJS.easeInQuad( 0, 65, crossAppearDurationInFrames_2, currentFrame_2 );
			bottomRightY_2 = AJS.easeInQuad( 0, 65, crossAppearDurationInFrames_2, currentFrame_2 );
			topLine_2.setAttribute( "d", "M" + topLeftX_2 + "," + topLeftY_2 + " L" + bottomRightX_2 + "," + bottomRightY_2 );
      topLineOpacity_2 = AJS.easeInExpo( 0, 1, crossAppearDurationInFrames_2, currentFrame_2 );
      topLine_2.style.opacity = topLineOpacity_2;
			//bottom line
			bottomLeftX_2 = AJS.easeInQuad( -30, 35, crossAppearDurationInFrames_2, currentFrame_2 );
			bottomLeftY_2 = AJS.easeInQuad( 130, 65, crossAppearDurationInFrames_2, currentFrame_2 );
			topRightX_2 = AJS.easeInQuad( 0, 65, crossAppearDurationInFrames_2, currentFrame_2 );
			topRightY_2 = AJS.easeInQuad( 100, 35, crossAppearDurationInFrames_2, currentFrame_2 );
			bottomLine_2.setAttribute( "d", "M" + bottomLeftX_2 + "," + bottomLeftY_2 + " L" + topRightX_2 + "," + topRightY_2 );
      bottomLineOpacity_2 = AJS.easeInExpo( 0, 1, crossAppearDurationInFrames_2, currentFrame_2 );
      bottomLine_2.style.opacity = bottomLineOpacity_2;      
			//recursion
			crossAppearAnimation_2();
		});
	} else {
		currentFrame_2 = 0;
		crossAppearComplete_2 = true;
		openMenuAnimation_2();
	}
}

///Combined Open Menu Animation
function openMenuAnimation_2() {
	if ( !menuDisappearComplete_2 ) { 
		menuDisappearAnimation_2();
	} else if ( !crossAppearComplete_2) {
		crossAppearAnimation_2();
	}
}

///Cross Disappear
function crossDisappearAnimation_2() {
	currentFrame_2++;
	if ( currentFrame_2 <= crossDisappearDurationInFrames_2 ) {
		window.requestAnimationFrame( ()=> {
      //top line
			topLeftX_2 = AJS.easeInBack( 35, -30, crossDisappearDurationInFrames_2, currentFrame_2 );
			topLeftY_2 = AJS.easeInBack( 35, -30, crossDisappearDurationInFrames_2, currentFrame_2 );
			bottomRightX_2 = AJS.easeInBack( 65, 0, crossDisappearDurationInFrames_2, currentFrame_2 );
			bottomRightY_2 = AJS.easeInBack( 65, 0, crossDisappearDurationInFrames_2, currentFrame_2 );
			topLine_2.setAttribute( "d", "M" + topLeftX_2 + "," + topLeftY_2 + " L" + bottomRightX_2 + "," + bottomRightY_2 );
      topLineOpacity_2 = AJS.linear( 1, 0, crossDisappearDurationInFrames_2, currentFrame_2, crossDisappearDurationInFrames_2*0.75 );
      topLine_2.style.opacity = topLineOpacity_2;
			//bottom line
			bottomLeftX_2 = AJS.easeInBack( 35, -30, crossDisappearDurationInFrames_2, currentFrame_2 );
			bottomLeftY_2 = AJS.easeInBack( 65, 130, crossDisappearDurationInFrames_2, currentFrame_2 );
			topRightX_2 = AJS.easeInBack( 65, 0, crossDisappearDurationInFrames_2, currentFrame_2 );
			topRightY_2 = AJS.easeInBack( 35, 100, crossDisappearDurationInFrames_2, currentFrame_2 );
			bottomLine_2.setAttribute( "d", "M" + bottomLeftX_2 + "," + bottomLeftY_2 + " L" + topRightX_2 + "," + topRightY_2 );
      bottomLineOpacity_2 = AJS.linear( 1, 0, crossDisappearDurationInFrames_2, currentFrame_2, crossDisappearDurationInFrames_2*0.75 );
      bottomLine_2.style.opacity = bottomLineOpacity_2;
			//recursion
			crossDisappearAnimation_2();
		});
	} else {
		middleLine_2.style.opacity = "1";
		currentFrame_2 = 0;
		crossDisappearComplete_2 = true;
		closeMenuAnimation_2();
	}
}

///Menu Appear
function menuAppearAnimation_2() {
	currentFrame_2++;
	if ( currentFrame_2 <= menuAppearDurationInFrames_2 ) {
		window.requestAnimationFrame( ()=> {  
			//top line
      if ( currentFrame_2 <= lineAppearDurationInFrames_2 ) {
        topLeftX_2 = AJS.easeOutBack( 130, 30, lineAppearDurationInFrames_2, currentFrame_2 );
        topRightX_2 = AJS.easeOutBack( 170, 70, lineAppearDurationInFrames_2, currentFrame_2 );
        topLine_2.setAttribute( "d", "M"+topLeftX_2+",37 L"+topRightX_2+",37 Z" );
        topLineOpacity_2 = AJS.linear( -2, 1, lineAppearDurationInFrames_2, currentFrame_2 );
        topLine_2.style.opacity = topLineOpacity_2;
      }
			//middle line
			if ( currentFrame_2 > lineAppearDelay_2 && currentFrame_2 <= lineAppearDurationInFrames_2 + lineAppearDelay_2 ) {
        middleLeftX_2 = AJS.easeOutBack( 130, 30, lineAppearDurationInFrames_2, currentFrame_2 - lineAppearDelay_2 );
        middleRightX_2 = AJS.easeOutBack( 170, 70, lineAppearDurationInFrames_2, currentFrame_2 - lineAppearDelay_2 );
        middleLine_2.setAttribute( "d", "M"+middleLeftX_2+",50 L"+middleRightX_2+",50 Z" );
        middleLineOpacity_2 = AJS.easeOutBack( -2, 1, lineAppearDurationInFrames_2, currentFrame_2 - lineAppearDelay_2 );
        middleLine_2.style.opacity = middleLineOpacity_2;
			}
			//bottom line
			if ( currentFrame_2 > lineAppearDelay_2*2 ) {
        bottomLeftX_2 = AJS.easeOutBack( 130, 30, lineAppearDurationInFrames_2, currentFrame_2 - lineAppearDelay_2*2 );
        bottomRightX_2 = AJS.easeOutBack( 170, 70, lineAppearDurationInFrames_2, currentFrame_2 - lineAppearDelay_2*2 );
        bottomLine_2.setAttribute( "d", "M"+bottomLeftX_2+",63 L"+bottomRightX_2+",63 Z" );
        bottomLineOpacity_2 = AJS.easeOutBack( -2, 1, lineAppearDurationInFrames_2, currentFrame_2 - lineAppearDelay_2*2 );
        bottomLine_2.style.opacity = bottomLineOpacity_2;
			}
			//recursion
			menuAppearAnimation_2();
		});
	} else {
		currentFrame_2 = 0;
		menuAppearComplete_2 = true;
	}
}

///Close Menu Animation
function closeMenuAnimation_2() {
	if ( !crossDisappearComplete_2 ) {
		crossDisappearAnimation_2();
	} else if ( !menuAppearComplete_2 ) {
		menuAppearAnimation_2();
	}
}

///Events
icon_2.addEventListener( "click", ()=> { 
  if ( state_2 === "menu" ) {
  	openMenuAnimation_2();
  	state_2 = "cross";
  	crossDisappearComplete_2 = false;
		menuAppearComplete_2 = false;
  } else if ( state_2 === "cross" ) {
  	closeMenuAnimation_2();
  	state_2 = "menu";
  	menuDisappearComplete_2 = false;
		crossAppearComplete_2 = false;
  }
});



/////////////////////////////////////////////////////
/////////////////////  ICON 3  //////////////////////
/////////////////////////////////////////////////////

///Initiation Variables
var icon_3 = document.getElementById("b3");
var topLine_3 = document.getElementById("top-line-3");
var middleLine_3 = document.getElementById("middle-line-3");
var bottomLine_3 = document.getElementById("bottom-line-3");
var state_3 = "menu";  // can be "menu" or "cross"
var topLineY_3;
var middleLineY_3;
var bottomLineY_3;
var topLeftX_3;
var topRightX_3;
var middleLeftX_3;
var middleRightX_3;
var bottomLeftX_3;
var bottomRightX_3;
var topLeftY_3;
var topRightY_3;
var middleLeftY_3;
var middleRightY_3;
var bottomLeftY_3;
var bottomRightY_3;

///Animation Variables
var segmentDuration_3 = 20;
var menuDisappearDurationInFrames_3 = segmentDuration_3;
var crossAppearDurationInFrames_3 = segmentDuration_3*1.5;
var crossDisappearDurationInFrames_3 = segmentDuration_3*1.5;
var menuAppearDurationInFrames_3 = segmentDuration_3;
var menuDisappearComplete_3 = false;
var crossAppearComplete_3 = false;
var crossDisappearComplete_3 = true;
var menuAppearComplete_3 = true;
var currentFrame_3 = 0;
var cPt_3 = { x: 50, y: 50 };  // center point
var tlPt_3 = { x: 30, y: 37 };  // top right point
var trPt_3 = { x: 70, y: 37 };  // top left point
var mlPt_3 = { x: 30, y: 50 };  // middle right point
var mrPt_3 = { x: 70, y: 50 };  // middle left point
var blPt_3 = { x: 30, y: 63 };  // bottom right point
var brPt_3 = { x: 70, y: 63 };  // bottom left point
var topLineOpacity_3 = 1;
var middleLineOpacity_3 = 1;
var bottomLineOpacity_3 = 1;

///Position Rotation
function positionRotation( centerPoint, orbitPoint, angleInRads ) {
  var distance = Math.sqrt( Math.pow( orbitPoint.x-centerPoint.x, 2 ) + Math.pow( orbitPoint.y-centerPoint.y, 2 ) );
  orbitPoint.x = centerPoint.x + Math.cos( angleInRads ) * distance;
  orbitPoint.y = centerPoint.y + Math.sin( angleInRads ) * distance;
}

///Menu Disappear
function menuDisappearAnimation_3() {
	currentFrame_3++;
	if ( currentFrame_3 <= menuDisappearDurationInFrames_3 ) {
		window.requestAnimationFrame( ()=> { 
      var rotation = Math.PI*0.5;
			//top line
      var tlAng = AJS.easeInBack( 3.7179, 3.7179+rotation, menuDisappearDurationInFrames_3, currentFrame_3 );
      var trAng = AJS.easeInBack( 5.7068, 5.7068+rotation, menuDisappearDurationInFrames_3, currentFrame_3 );
      positionRotation( cPt_3, tlPt_3, tlAng );
      positionRotation( cPt_3, trPt_3, trAng );
      topLine_3.setAttribute( "d", "M"+tlPt_3.x+","+tlPt_3.y+" L"+trPt_3.x+","+trPt_3.y+" Z" );
      //middle line
      var mlAng = AJS.easeInBack( Math.PI, Math.PI+rotation, menuDisappearDurationInFrames_3, currentFrame_3 );
      var mrAng = AJS.easeInBack( 0, rotation, menuDisappearDurationInFrames_3, currentFrame_3 );
      positionRotation( cPt_3, mlPt_3, mlAng );
      positionRotation( cPt_3, mrPt_3, mrAng );
      middleLine_3.setAttribute( "d", "M"+mlPt_3.x+","+mlPt_3.y+" L"+mrPt_3.x+","+mrPt_3.y+" Z" );
      //bottom line
      var blAng = AJS.easeInBack( 2.5652, 2.5652+rotation, menuDisappearDurationInFrames_3, currentFrame_3 );
      var brAng = AJS.easeInBack( 0.5763, 0.5763+rotation, menuDisappearDurationInFrames_3, currentFrame_3 );
      positionRotation( cPt_3, blPt_3, blAng );
      positionRotation( cPt_3, brPt_3, brAng );
      bottomLine_3.setAttribute( "d", "M"+blPt_3.x+","+blPt_3.y+" L"+brPt_3.x+","+brPt_3.y+" Z" );
			//recursion
			menuDisappearAnimation_3();
		});
	} else {
		currentFrame_3 = 0;
		menuDisappearComplete_3 = true;
		openMenuAnimation_3();
	}
}

///Cross Appear
function crossAppearAnimation_3() {
	currentFrame_3++;
	if ( currentFrame_3 <= crossAppearDurationInFrames_3 ) {
    tlPt_3 = { x: 50, y: 28.7867 };
    trPt_3 = { x: 50, y: 71.2132 };
    mlPt_3 = { x: 28.7867, y: 50 };
    mrPt_3 = { x: 71.2132, y: 50 };
		window.requestAnimationFrame( ()=> { 
      var rotation = Math.PI*0.75;
			//top line
      var tlAng = AJS.easeOutBack( Math.PI, Math.PI+rotation, crossAppearDurationInFrames_3, currentFrame_3 );
      var trAng = AJS.easeOutBack( 0, rotation, crossAppearDurationInFrames_3, currentFrame_3 );
      positionRotation( cPt_3, tlPt_3, tlAng );
      positionRotation( cPt_3, trPt_3, trAng );
      topLine_3.setAttribute( "d", "M"+tlPt_3.x+","+tlPt_3.y+" L"+trPt_3.x+","+trPt_3.y+" Z" );
			//center line
      var mlAng = AJS.easeOutBack( Math.PI*1.5, Math.PI*1.5+rotation, crossAppearDurationInFrames_3, currentFrame_3 );
      var mrAng = AJS.easeOutBack( Math.PI*0.5, Math.PI*0.5+rotation, crossAppearDurationInFrames_3, currentFrame_3 );
      positionRotation( cPt_3, mlPt_3, mlAng );
      positionRotation( cPt_3, mrPt_3, mrAng );
      middleLine_3.setAttribute( "d", "M"+mlPt_3.x+","+mlPt_3.y+" L"+mrPt_3.x+","+mrPt_3.y+" Z" );
      //bottom line
      bottomLine_3.style.opacity = 0;
			//recursion
			crossAppearAnimation_3();
		});
	} else {
		currentFrame_3 = 0;
		crossAppearComplete_3 = true;
		openMenuAnimation_3();
	}
}

///Combined Open Menu Animation
function openMenuAnimation_3() {
	if ( !menuDisappearComplete_3 ) { 
		menuDisappearAnimation_3();
	} else if ( !crossAppearComplete_3) {
		crossAppearAnimation_3();
	}
}

///Cross Disappear
function crossDisappearAnimation_3() {
	currentFrame_3++;
	if ( currentFrame_3 <= crossDisappearDurationInFrames_3 ) {
		window.requestAnimationFrame( ()=> { 
      var rotation = Math.PI*0.75;
			//top line
      var tlAng = AJS.easeInBack( Math.PI*1.75, Math.PI*1.75+rotation, crossDisappearDurationInFrames_3, currentFrame_3 );
      var trAng = AJS.easeInBack( Math.PI*0.75, Math.PI*0.75+rotation, crossDisappearDurationInFrames_3, currentFrame_3 );
      positionRotation( cPt_3, tlPt_3, tlAng );
      positionRotation( cPt_3, trPt_3, trAng );
      topLine_3.setAttribute( "d", "M"+tlPt_3.x+","+tlPt_3.y+" L"+trPt_3.x+","+trPt_3.y+" Z" );
			//center line
      var mlAng = AJS.easeInBack( Math.PI*2.25, Math.PI*2.25+rotation, crossDisappearDurationInFrames_3, currentFrame_3 );
      var mrAng = AJS.easeInBack( Math.PI*1.25, Math.PI*1.25+rotation, crossDisappearDurationInFrames_3, currentFrame_3 );
      positionRotation( cPt_3, mlPt_3, mlAng );
      positionRotation( cPt_3, mrPt_3, mrAng );
      middleLine_3.setAttribute( "d", "M"+mlPt_3.x+","+mlPt_3.y+" L"+mrPt_3.x+","+mrPt_3.y+" Z" );
      //bottom line
      bottomLine_3.style.opacity = 0;
			//recursion
			crossDisappearAnimation_3();
		});
	} else {
		middleLine_3.style.opacity = "1";
		currentFrame_3 = 0;
		crossDisappearComplete_3 = true;
		closeMenuAnimation_3();
	}
}

///Menu Appear
function menuAppearAnimation_3() {
	currentFrame_3++;
	if ( currentFrame_3 <= menuAppearDurationInFrames_3 ) {
    tlPt_3 = { x: 37, y: 70 };
    trPt_3 = { x: 37, y: 30 };
    mlPt_3 = { x: 50, y: 70 };
    mrPt_3 = { x: 50, y: 30 };
    bottomLine_3.style.opacity = 1;
		window.requestAnimationFrame( ()=> {  
      var rotation = Math.PI*0.5;
			//top line
			var tlAng = AJS.easeOutBack( 2.1471, 2.1471+rotation, menuDisappearDurationInFrames_3, currentFrame_3 );
			var trAng = AJS.easeOutBack( 4.1360, 4.1360+rotation, menuDisappearDurationInFrames_3, currentFrame_3 );
			positionRotation( cPt_3, tlPt_3, tlAng );
			positionRotation( cPt_3, trPt_3, trAng );
			topLine_3.setAttribute( "d", "M"+tlPt_3.x+","+tlPt_3.y+" L"+trPt_3.x+","+trPt_3.y+" Z" );
      //middle line
      var mlAng = AJS.easeOutBack( Math.PI*0.5, Math.PI*0.5+rotation, menuDisappearDurationInFrames_3, currentFrame_3 );
      var mrAng = AJS.easeOutBack( Math.PI*1.5, Math.PI*1.5+rotation, menuDisappearDurationInFrames_3, currentFrame_3 );
      positionRotation( cPt_3, mlPt_3, mlAng );
      positionRotation( cPt_3, mrPt_3, mrAng );
      middleLine_3.setAttribute( "d", "M"+mlPt_3.x+","+mlPt_3.y+" L"+mrPt_3.x+","+mrPt_3.y+" Z" );
      //bottom line
      var blAng = AJS.easeOutBack( 0.9944, 0.9944+rotation, menuDisappearDurationInFrames_3, currentFrame_3 );
      var brAng = AJS.easeOutBack( 5.2887, 5.2887+rotation, menuDisappearDurationInFrames_3, currentFrame_3 );
      positionRotation( cPt_3, blPt_3, blAng );
      positionRotation( cPt_3, brPt_3, brAng );
      bottomLine_3.setAttribute( "d", "M"+blPt_3.x+","+blPt_3.y+" L"+brPt_3.x+","+brPt_3.y+" Z" );
			//recursion
			menuAppearAnimation_3();
		});
	} else {
		currentFrame_3 = 0;
		menuAppearComplete_3 = true;
	}
}

///Close Menu Animation
function closeMenuAnimation_3() {
	if ( !crossDisappearComplete_3 ) {
		crossDisappearAnimation_3();
	} else if ( !menuAppearComplete_3 ) {
		menuAppearAnimation_3();
	}
}

///Events
icon_3.addEventListener( "click", ()=> { 
  if ( state_3 === "menu" ) {
  	openMenuAnimation_3();
  	state_3 = "cross";
  	crossDisappearComplete_3 = false;
		menuAppearComplete_3 = false;
  } else if ( state_3 === "cross" ) {
  	closeMenuAnimation_3();
  	state_3 = "menu";
  	menuDisappearComplete_3 = false;
		crossAppearComplete_3 = false;
  }
});



/////////////////////////////////////////////////////
/////////////////////  ICON 4  //////////////////////
/////////////////////////////////////////////////////

///Initiation Variables
var icon_4 = document.getElementById("b4");
var topLine_4 = document.getElementById("top-line-4");
var middleLine_4 = document.getElementById("middle-line-4");
var bottomLine_4 = document.getElementById("bottom-line-4");
var state_4 = "menu";  // can be "menu" or "arrow"
var topLineY_4;
var middleLineY_4;
var bottomLineY_4;
var arrowLegY_4;
var arrowPointY_4;
var hideawayLinesOpacity_4;

///Animation Variables
var segmentDuration_4 = 25;
var menuDisappearDurationInFrames_4 = segmentDuration_4;
var arrowAppearDurationInFrames_4 = segmentDuration_4;
var menuAppearDurationInFrames_4 = segmentDuration_4*1.5;
var fadeInDurationInFrames_4 = segmentDuration_4;
var menuDisappearComplete_4 = false;
var arrowAppearComplete_4 = false;
var menuAppearComplete_4 = true;
var currentFrame_4 = 1;

///Collapse
function menuDisappearAnimation_4() {
	currentFrame_4++;
	if ( currentFrame_4 <= menuDisappearDurationInFrames_4 ) {
		window.requestAnimationFrame( ()=> { 
			//top line
			topLineY_4 = AJS.easeInOutBack( 37, 63, menuDisappearDurationInFrames_4, currentFrame_4 );
			topLine_4.setAttribute( "points", "30 "+topLineY_4+" 50 "+topLineY_4+" 70 "+topLineY_4 );
			//middle line
			middleLineY_4 = AJS.easeInOutBack( 50, 63, menuDisappearDurationInFrames_4, currentFrame_4 );
			middleLine_4.setAttribute( "d", "M30,"+middleLineY_4+" L70,"+middleLineY_4 );
			if ( middleLineY_4 >= 63) middleLine_4.style.opacity = "0";
			//bottom line
			if ( middleLineY_4 >= 63) bottomLine_4.style.opacity = "0";
			//recursion
			menuDisappearAnimation_4();
		});
	} else {
		bottomLine_4.style.opacity = "0";
		currentFrame_4 = 1;
		menuDisappearComplete_4 = true;
		openMenuAnimation_4();
	}
}

///Arrow Appear
function arrowAppearAnimation_4() {
	currentFrame_4++;
	if ( currentFrame_4 <= arrowAppearDurationInFrames_4 ) {
		window.requestAnimationFrame( ()=> { 
			//arrow
			arrowLegY_4 = AJS.easeOutBack( 63, 60, arrowAppearDurationInFrames_4, currentFrame_4 );
			arrowPointY_4 = AJS.easeOutBack( 63, 40, arrowAppearDurationInFrames_4, currentFrame_4 );
			topLine_4.setAttribute("points", "30 "+arrowLegY_4+" 50 "+arrowPointY_4+" 70 "+arrowLegY_4);
			//recursion
			arrowAppearAnimation_4();
		});
	} else {
		currentFrame_4 = 1;
		arrowAppearComplete_4 = true;
		menuAppearComplete_4 = false;
		openMenuAnimation_4();
	}
}

///Combined Open Menu Animation
function openMenuAnimation_4() {
	if ( !menuDisappearComplete_4 ) { 
		menuDisappearAnimation_4();
	} else if ( !arrowAppearComplete_4) {
		arrowAppearAnimation_4();
	}
}

///Menu Return
function menuAppearAnimation_4() {
	currentFrame_4++;
	if ( currentFrame_4 <= menuAppearDurationInFrames_4 ) {
		window.requestAnimationFrame( ()=> { 
			//arrow to top line
			arrowLegY_4 = AJS.easeOutBounce( 60, 37, menuAppearDurationInFrames_4, currentFrame_4 );
			arrowPointY_4 = AJS.easeOutBounce( 40, 37, menuAppearDurationInFrames_4, currentFrame_4 );
			topLine_4.setAttribute("points", "30 "+arrowLegY_4+" 50 "+arrowPointY_4+" 70 "+arrowLegY_4);
			//middle line
			middleLineY_4 = AJS.easeOutBounce( 68, 50, menuAppearDurationInFrames_4, currentFrame_4 );
			middleLine_4.setAttribute( "d", "M30,"+middleLineY_4+" L70,"+middleLineY_4 );
			//bottom line
			bottomLineY_4 = AJS.easeOutBounce( 68, 63, menuAppearDurationInFrames_4, currentFrame_4 );
			bottomLine_4.setAttribute( "d", "M30,"+bottomLineY_4+" L70,"+bottomLineY_4 );
			//middle and bottom lines opacity
			hideawayLinesOpacity_4 = AJS.linear( 0, 1, fadeInDurationInFrames_4, currentFrame_4 );
			middleLine_4.style.opacity = hideawayLinesOpacity_4;
			bottomLine_4.style.opacity = hideawayLinesOpacity_4;
			//recursion
			menuAppearAnimation_4();
		});
	} else {
		currentFrame_4 = 1;
		menuDisappearComplete_4 = false;
		arrowAppearComplete_4 = false;
		menuAppearComplete_4 = true;
	}
}

///Close Menu Animation
function closeMenuAnimation_4() {
	if ( !menuAppearComplete_4 ) {
		menuAppearAnimation_4();
	}
}

///Events
icon_4.addEventListener( "click", ()=> {
  if ( state_4 === "menu" ) {
  	openMenuAnimation_4();
  	state_4 = "arrow"
  } else if ( state_4 === "arrow" ) {
  	closeMenuAnimation_4();
  	state_4 = "menu"
  }
});



/////////////////////////////////////////////////////
/////////////////////  ICON 5  //////////////////////
/////////////////////////////////////////////////////


//Initiation Variables
var icon_5 = document.getElementById("b5");
var topLine_5 = document.getElementById("top-line-5");
var middleLine_5 = document.getElementById("middle-line-5");
var bottomLine_5 = document.getElementById("bottom-line-5");
var state_5 = "menu";  // can be "menu" or "arrow"
var topLineY_5;
var middleLineY_5;
var bottomLineY_5;
var topLeftY_5;
var topRightY_5;
var bottomLeftY_5;
var bottomRightY_5;
var topLeftX_5;
var topRightX_5;
var middleLeftX_5;
var middleRightX_5;
var bottomLeftX_5;
var bottomRightX_5;

///Animation Variables
var segmentDuration_5 = 25;
var menuDisappearDurationInFrames_5 = segmentDuration_5;
var arrowAppearDurationInFrames_5 = Math.round( segmentDuration_5*0.35 );
var arrowDisappearDurationInFrames_5 = Math.round( segmentDuration_5*0.35 );
var menuAppearDurationInFrames_5 = segmentDuration_5;
var menuDisappearComplete_5 = false;
var arrowAppearComplete_5 = false;
var arrowDisappearComplete_5 = true;
var menuAppearComplete_5 = true;
var currentFrame_5 = 0;
var lineDisappearDelay_5 = segmentDuration_5*0.2;
var lineAppearDelay_5 = lineDisappearDelay_5;
var lineDisappearDurationInFrames_5 = segmentDuration_5 - lineDisappearDelay_5*2;
var lineAppearDurationInFrames_5 = lineDisappearDurationInFrames_5;
var topLineOpacity_5 = 1;
var middleLineOpacity_5 = 1;
var bottomLineOpacity_5 = 1;

///Menu Disappear
function menuDisappearAnimation_5() {
	currentFrame_5++;
	if ( currentFrame_5 <= menuDisappearDurationInFrames_5 ) {
		window.requestAnimationFrame( ()=> { 
			//top line
      if ( currentFrame_5 <= lineDisappearDurationInFrames_5 ) {
        topLeftX_5 = AJS.easeInBack( 30, 130, lineDisappearDurationInFrames_5, currentFrame_5 );
        topRightX_5 = AJS.easeInBack( 70, 170, lineDisappearDurationInFrames_5, currentFrame_5 );
        topLine_5.setAttribute( "d", "M"+topLeftX_5+",37 L"+topRightX_5+",37 Z" );
        topLineOpacity_5 = AJS.linear( 1, 0, lineDisappearDurationInFrames_5*0.85, currentFrame_5 );
        topLine_5.style.opacity = topLineOpacity_5;
      }
      //middle line
      if ( currentFrame_5 > lineDisappearDelay_5 && currentFrame_5 <= lineDisappearDurationInFrames_5 + lineDisappearDelay_5 ) {
        middleLeftX_5 = AJS.easeInBack( 30, 130, lineDisappearDurationInFrames_5, currentFrame_5 - lineDisappearDelay_5 );
        middleRightX_5 = AJS.easeInBack( 70, 170, lineDisappearDurationInFrames_5, currentFrame_5 - lineDisappearDelay_5 );
        middleLine_5.setAttribute( "d", "M"+middleLeftX_5+",50 L"+middleRightX_5+",50 Z" );
        middleLineOpacity_5 = AJS.linear( 1, 0, lineDisappearDurationInFrames_5*0.85, currentFrame_5 - lineDisappearDelay_5 );
        middleLine_5.style.opacity = middleLineOpacity_5;
      }
      //bottom line
      if ( currentFrame_5 > lineDisappearDelay_5*2 ) {
        bottomLeftX_5 = AJS.easeInBack( 30, 130, lineDisappearDurationInFrames_5, currentFrame_5 - lineDisappearDelay_5*2 );
        bottomRightX_5 = AJS.easeInBack( 70, 170, lineDisappearDurationInFrames_5, currentFrame_5 - lineDisappearDelay_5*2 );
        bottomLine_5.setAttribute( "d", "M"+bottomLeftX_5+",63 L"+bottomRightX_5+",63 Z" );
        bottomLineOpacity_5 = AJS.linear( 1, 0, lineDisappearDurationInFrames_5*0.85, currentFrame_5 - lineDisappearDelay_5*2 );
        bottomLine_5.style.opacity = bottomLineOpacity_5;
      }
			//recursion
			menuDisappearAnimation_5();
		});
	} else {
		currentFrame_5 = 0;
		menuDisappearComplete_5 = true;
		openMenuAnimation_5();
	}
}

///Arrow Appear
function arrowAppearAnimation_5() {
	currentFrame_5++;
	if ( currentFrame_5 <= arrowAppearDurationInFrames_5 ) {
		window.requestAnimationFrame( ()=> { 
			//top line
			topLeftX_5 = AJS.easeInQuad( 110, 50, arrowAppearDurationInFrames_5, currentFrame_5 );
			topLeftY_5 = AJS.easeInQuad( 100, 40, arrowAppearDurationInFrames_5, currentFrame_5 );
			bottomRightX_5 = AJS.easeInQuad( 130, 70, arrowAppearDurationInFrames_5, currentFrame_5 );
			bottomRightY_5 = AJS.easeInQuad( 120, 60, arrowAppearDurationInFrames_5, currentFrame_5 );
			topLine_5.setAttribute( "d", "M" + topLeftX_5 + "," + topLeftY_5 + " L" + bottomRightX_5 + "," + bottomRightY_5 );
			topLineOpacity_5 = AJS.easeInExpo( 0, 1, arrowAppearDurationInFrames_5, currentFrame_5 );
			topLine_5.style.opacity = topLineOpacity_5;
			//bottom line
			bottomLeftX_5 = AJS.easeInQuad( -30, 30, arrowAppearDurationInFrames_5, currentFrame_5 );
			bottomLeftY_5 = AJS.easeInQuad( 120, 60, arrowAppearDurationInFrames_5, currentFrame_5 );
			topRightX_5 = AJS.easeInQuad( -10, 50, arrowAppearDurationInFrames_5, currentFrame_5 );
			topRightY_5 = AJS.easeInQuad( 100, 40, arrowAppearDurationInFrames_5, currentFrame_5 );
			bottomLine_5.setAttribute( "d", "M" + bottomLeftX_5 + "," + bottomLeftY_5 + " L" + topRightX_5 + "," + topRightY_5 );
      bottomLineOpacity_5 = AJS.easeInExpo( 0, 1, arrowAppearDurationInFrames_5, currentFrame_5 );
      bottomLine_5.style.opacity = bottomLineOpacity_5;      
			//recursion
			arrowAppearAnimation_5();
		});
	} else {
		currentFrame_5 = 0;
		arrowAppearComplete_5 = true;
		openMenuAnimation_5();
	}
}

///Combined Open Menu Animation
function openMenuAnimation_5() {
	if ( !menuDisappearComplete_5 ) { 
		menuDisappearAnimation_5();
	} else if ( !arrowAppearComplete_5) {
		arrowAppearAnimation_5();
	}
}

///Arrow Disappear
function arrowDisappearAnimation_5() {
	currentFrame_5++;
	if ( currentFrame_5 <= arrowDisappearDurationInFrames_5 ) {
		window.requestAnimationFrame( ()=> {
      //top line
			topLeftX_5 = AJS.easeInQuad( 50, 110, arrowAppearDurationInFrames_5, currentFrame_5 );
			topLeftY_5 = AJS.easeInQuad( 40, 100, arrowAppearDurationInFrames_5, currentFrame_5 );
			bottomRightX_5 = AJS.easeInQuad( 70, 130, arrowAppearDurationInFrames_5, currentFrame_5 );
			bottomRightY_5 = AJS.easeInQuad( 60, 120, arrowAppearDurationInFrames_5, currentFrame_5 );
			topLine_5.setAttribute( "d", "M" + topLeftX_5 + "," + topLeftY_5 + " L" + bottomRightX_5 + "," + bottomRightY_5 );
			topLineOpacity_5 = AJS.easeInExpo( 1, 0, arrowAppearDurationInFrames_5, currentFrame_5 );
			topLine_5.style.opacity = topLineOpacity_5;
			//bottom line
			bottomLeftX_5 = AJS.easeInQuad( 30, -30, arrowAppearDurationInFrames_5, currentFrame_5 );
			bottomLeftY_5 = AJS.easeInQuad( 60, 120, arrowAppearDurationInFrames_5, currentFrame_5 );
			topRightX_5 = AJS.easeInQuad( 50, -10, arrowAppearDurationInFrames_5, currentFrame_5 );
			topRightY_5 = AJS.easeInQuad( 40, 100, arrowAppearDurationInFrames_5, currentFrame_5 );
			bottomLine_5.setAttribute( "d", "M" + bottomLeftX_5 + "," + bottomLeftY_5 + " L" + topRightX_5 + "," + topRightY_5 );
      bottomLineOpacity_5 = AJS.easeInExpo( 1, 0, arrowAppearDurationInFrames_5, currentFrame_5 );
      bottomLine_5.style.opacity = bottomLineOpacity_5; 
			//recursion
			arrowDisappearAnimation_5();
		});
	} else {
		middleLine_5.style.opacity = "1";
		currentFrame_5 = 0;
		arrowDisappearComplete_5 = true;
		closeMenuAnimation_5();
	}
}

///Menu Appear
function menuAppearAnimation_5() {
	currentFrame_5++;
	if ( currentFrame_5 <= menuAppearDurationInFrames_5 ) {
		window.requestAnimationFrame( ()=> {  
			//top line
      if ( currentFrame_5 <= lineAppearDurationInFrames_5 ) {
        topLeftX_5 = AJS.easeOutBack( 130, 30, lineAppearDurationInFrames_5, currentFrame_5 );
        topRightX_5 = AJS.easeOutBack( 170, 70, lineAppearDurationInFrames_5, currentFrame_5 );
        topLine_5.setAttribute( "d", "M"+topLeftX_5+",37 L"+topRightX_5+",37 Z" );
        topLineOpacity_5 = AJS.linear( -2, 1, lineAppearDurationInFrames_5, currentFrame_5 );
        topLine_5.style.opacity = topLineOpacity_5;
      }
			//middle line
			if ( currentFrame_5 > lineAppearDelay_5 && currentFrame_5 <= lineAppearDurationInFrames_5 + lineAppearDelay_5 ) {
        middleLeftX_5 = AJS.easeOutBack( 130, 30, lineAppearDurationInFrames_5, currentFrame_5 - lineAppearDelay_5 );
        middleRightX_5 = AJS.easeOutBack( 170, 70, lineAppearDurationInFrames_5, currentFrame_5 - lineAppearDelay_5 );
        middleLine_5.setAttribute( "d", "M"+middleLeftX_5+",50 L"+middleRightX_5+",50 Z" );
        middleLineOpacity_5 = AJS.easeOutBack( -2, 1, lineAppearDurationInFrames_5, currentFrame_5 - lineAppearDelay_5 );
        middleLine_5.style.opacity = middleLineOpacity_5;
			}
			//bottom line
			if ( currentFrame_5 > lineAppearDelay_5*2 ) {
        bottomLeftX_5 = AJS.easeOutBack( 130, 30, lineAppearDurationInFrames_5, currentFrame_5 - lineAppearDelay_5*2 );
        bottomRightX_5 = AJS.easeOutBack( 170, 70, lineAppearDurationInFrames_5, currentFrame_5 - lineAppearDelay_5*2 );
        bottomLine_5.setAttribute( "d", "M"+bottomLeftX_5+",63 L"+bottomRightX_5+",63 Z" );
        bottomLineOpacity_5 = AJS.easeOutBack( -2, 1, lineAppearDurationInFrames_5, currentFrame_5 - lineAppearDelay_5*2 );
        bottomLine_5.style.opacity = bottomLineOpacity_5;
			}
			//recursion
			menuAppearAnimation_5();
		});
	} else {
		currentFrame_5 = 0;
		menuAppearComplete_5 = true;
	}
}

///Close Menu Animation
function closeMenuAnimation_5() {
	if ( !arrowDisappearComplete_5 ) {
		arrowDisappearAnimation_5();
	} else if ( !menuAppearComplete_5 ) {
		menuAppearAnimation_5();
	}
}

///Events
icon_5.addEventListener( "click", ()=> { 
  if ( state_5 === "menu" ) {
  	openMenuAnimation_5();
  	state_5 = "arrow";
  	arrowDisappearComplete_5 = false;
		menuAppearComplete_5 = false;
  } else if ( state_5 === "arrow" ) {
  	closeMenuAnimation_5();
  	state_5 = "menu";
  	menuDisappearComplete_5 = false;
		arrowAppearComplete_5 = false;
  }
});



/////////////////////////////////////////////////////
/////////////////////  ICON 6  //////////////////////
/////////////////////////////////////////////////////

///Initiation Variables
var icon_6 = document.getElementById("b6");
var topLine_6 = document.getElementById("top-line-6");
var middleLine_6 = document.getElementById("middle-line-6");
var bottomLine_6 = document.getElementById("bottom-line-6");
var state_6 = "menu";  // can be "menu" or "arrow"
var topLineY_6;
var middleLineY_6;
var bottomLineY_6;
var topLeftX_6;
var topRightX_6;
var middleLeftX_6;
var middleRightX_6;
var bottomLeftX_6;
var bottomRightX_6;
var topLeftY_6;
var topRightY_6;
var middleLeftY_6;
var middleRightY_6;
var bottomLeftY_6;
var bottomRightY_6;

///Animation Variables
var segmentDuration_6 = 20;
var menuDisappearDurationInFrames_6 = segmentDuration_6;
var arrowAppearDurationInFrames_6 = segmentDuration_6;
var arrowDisappearDurationInFrames_6 = segmentDuration_6;
var menuAppearDurationInFrames_6 = segmentDuration_6;
var menuDisappearComplete_6 = false;
var arrowAppearComplete_6 = false;
var arrowDisappearComplete_6 = true;
var menuAppearComplete_6 = true;
var currentFrame_6 = 0;
var cPt_6 = { x: 50, y: 50 };  // center point
var tlPt_6 = { x: 30, y: 37 };  // top right point
var trPt_6 = { x: 70, y: 37 };  // top left point
var mlPt_6 = { x: 30, y: 50 };  // middle right point
var mrPt_6 = { x: 70, y: 50 };  // middle left point
var blPt_6 = { x: 30, y: 63 };  // bottom right point
var brPt_6 = { x: 70, y: 63 };  // bottom left point


///Position Rotation
function positionRotation( centerPoint, orbitPoint, angleInRads ) {
  var distance = Math.sqrt( Math.pow( orbitPoint.x-centerPoint.x, 2 ) + Math.pow( orbitPoint.y-centerPoint.y, 2 ) );
  orbitPoint.x = centerPoint.x + Math.cos( angleInRads ) * distance;
  orbitPoint.y = centerPoint.y + Math.sin( angleInRads ) * distance;
}

///Menu Disappear
function menuDisappearAnimation_6() {
	currentFrame_6++;
	if ( currentFrame_6 <= menuDisappearDurationInFrames_6 ) {
		window.requestAnimationFrame( ()=> { 
      var rotation = Math.PI*0.5;  // menu disappear rotation
			//top line
      var tlAng = AJS.easeInBack( 3.7179, 3.7179+rotation, menuDisappearDurationInFrames_6, currentFrame_6 );
      var trAng = AJS.easeInBack( 5.7068, 5.7068+rotation, menuDisappearDurationInFrames_6, currentFrame_6 );
      positionRotation( cPt_6, tlPt_6, tlAng );
      positionRotation( cPt_6, trPt_6, trAng );
      topLine_6.setAttribute( "d", "M"+tlPt_6.x+","+tlPt_6.y+" L"+trPt_6.x+","+trPt_6.y+" Z" );
      //middle line
      var mlAng = AJS.easeInBack( Math.PI, Math.PI+rotation, menuDisappearDurationInFrames_6, currentFrame_6 );
      var mrAng = AJS.easeInBack( 0, rotation, menuDisappearDurationInFrames_6, currentFrame_6 );
      positionRotation( cPt_6, mlPt_6, mlAng );
      positionRotation( cPt_6, mrPt_6, mrAng );
      middleLine_6.setAttribute( "d", "M"+mlPt_6.x+","+mlPt_6.y+" L"+mrPt_6.x+","+mrPt_6.y+" Z" );
      //bottom line
      var blAng = AJS.easeInBack( 2.5652, 2.5652+rotation, menuDisappearDurationInFrames_6, currentFrame_6 );
      var brAng = AJS.easeInBack( 0.5763, 0.5763+rotation, menuDisappearDurationInFrames_6, currentFrame_6 );
      positionRotation( cPt_6, blPt_6, blAng );
      positionRotation( cPt_6, brPt_6, brAng );
      bottomLine_6.setAttribute( "d", "M"+blPt_6.x+","+blPt_6.y+" L"+brPt_6.x+","+brPt_6.y+" Z" );
			//recursion
			menuDisappearAnimation_6();
		});
	} else {
		currentFrame_6 = 0;
		menuDisappearComplete_6 = true;
		openMenuAnimation_6();
	}
}

///Arrow Appear
function arrowAppearAnimation_6() {
	currentFrame_6++;
	if ( currentFrame_6 <= arrowAppearDurationInFrames_6 ) {
    tlPt_6 = { x: 60, y: 30 };
    trPt_6 = { x: 40, y: 50 };
    mlPt_6 = { x: 40, y: 50 };
    mrPt_6 = { x: 60, y: 70 };
		window.requestAnimationFrame( ()=> { 
      var rotation = Math.PI*0.5;  // arrow appear rotation
			//top line
      var tlAng = AJS.easeOutBack( 5.1759, 5.1759+rotation, arrowAppearDurationInFrames_6, currentFrame_6 );
      var trAng = AJS.easeOutBack( Math.PI, Math.PI+rotation, arrowAppearDurationInFrames_6, currentFrame_6 );
      positionRotation( cPt_6, tlPt_6, tlAng );
      positionRotation( cPt_6, trPt_6, trAng );
      topLine_6.setAttribute( "d", "M"+tlPt_6.x+","+tlPt_6.y+" L"+trPt_6.x+","+trPt_6.y+" Z" );
			//center line
      var mlAng = AJS.easeOutBack( Math.PI, Math.PI+rotation, arrowAppearDurationInFrames_6, currentFrame_6 );
      var mrAng = AJS.easeOutBack( 1.1072, 1.1072+rotation, arrowAppearDurationInFrames_6, currentFrame_6 );
      positionRotation( cPt_6, mlPt_6, mlAng );
      positionRotation( cPt_6, mrPt_6, mrAng );
      middleLine_6.setAttribute( "d", "M"+mlPt_6.x+","+mlPt_6.y+" L"+mrPt_6.x+","+mrPt_6.y+" Z" );
      //bottom line
      bottomLine_6.style.opacity = 0;
			//recursion
			arrowAppearAnimation_6();
		});
	} else {
		currentFrame_6 = 0;
		arrowAppearComplete_6 = true;
		openMenuAnimation_6();
	}
}

///Combined Open Menu Animation
function openMenuAnimation_6() {
	if ( !menuDisappearComplete_6 ) { 
		menuDisappearAnimation_6();
	} else if ( !arrowAppearComplete_6) {
		arrowAppearAnimation_6();
	}
}

///Arrow Disappear
function arrowDisappearAnimation_6() {
	currentFrame_6++;
	if ( currentFrame_6 <= arrowDisappearDurationInFrames_6 ) {
		window.requestAnimationFrame( ()=> { 
      var rotation = Math.PI*0.5;  // arrow disapear rotation
			//top line
      var tlAng = AJS.easeInBack( 0.4635, 0.4635+rotation, arrowDisappearDurationInFrames_6, currentFrame_6 );
      var trAng = AJS.easeInBack( Math.PI*1.5, Math.PI*1.5+rotation, arrowDisappearDurationInFrames_6, currentFrame_6 );
      positionRotation( cPt_6, tlPt_6, tlAng );
      positionRotation( cPt_6, trPt_6, trAng );
      topLine_6.setAttribute( "d", "M"+tlPt_6.x+","+tlPt_6.y+" L"+trPt_6.x+","+trPt_6.y+" Z" );
			//center line
      var mlAng = AJS.easeInBack( Math.PI*1.5, Math.PI*1.5+rotation, arrowDisappearDurationInFrames_6, currentFrame_6 );
      var mrAng = AJS.easeInBack( 2.6779, 2.6779+rotation, arrowDisappearDurationInFrames_6, currentFrame_6 );
      positionRotation( cPt_6, mlPt_6, mlAng );
      positionRotation( cPt_6, mrPt_6, mrAng );
      middleLine_6.setAttribute( "d", "M"+mlPt_6.x+","+mlPt_6.y+" L"+mrPt_6.x+","+mrPt_6.y+" Z" );
      //bottom line
      bottomLine_6.style.opacity = 0;
			//recursion
			arrowDisappearAnimation_6();
		});
	} else {
		middleLine_6.style.opacity = "1";
		currentFrame_6 = 0;
		arrowDisappearComplete_6 = true;
		closeMenuAnimation_6();
	}
}

///Menu Appear
function menuAppearAnimation_6() {
	currentFrame_6++;
	if ( currentFrame_6 <= menuAppearDurationInFrames_6 ) {
    tlPt_6 = { x: 37, y: 70 };
    trPt_6 = { x: 37, y: 30 };
    mlPt_6 = { x: 50, y: 70 };
    mrPt_6 = { x: 50, y: 30 };
    bottomLine_6.style.opacity = 1;
		window.requestAnimationFrame( ()=> {  
      var rotation = Math.PI*0.5;  // menu appear rotation
			//top line
			var tlAng = AJS.easeOutBack( 2.1471, 2.1471+rotation, menuDisappearDurationInFrames_6, currentFrame_6 );
			var trAng = AJS.easeOutBack( 4.1360, 4.1360+rotation, menuDisappearDurationInFrames_6, currentFrame_6 );
			positionRotation( cPt_6, tlPt_6, tlAng );
			positionRotation( cPt_6, trPt_6, trAng );
			topLine_6.setAttribute( "d", "M"+tlPt_6.x+","+tlPt_6.y+" L"+trPt_6.x+","+trPt_6.y+" Z" );
      //middle line
      var mlAng = AJS.easeOutBack( Math.PI*0.5, Math.PI*0.5+rotation, menuDisappearDurationInFrames_6, currentFrame_6 );
      var mrAng = AJS.easeOutBack( Math.PI*1.5, Math.PI*1.5+rotation, menuDisappearDurationInFrames_6, currentFrame_6 );
      positionRotation( cPt_6, mlPt_6, mlAng );
      positionRotation( cPt_6, mrPt_6, mrAng );
      middleLine_6.setAttribute( "d", "M"+mlPt_6.x+","+mlPt_6.y+" L"+mrPt_6.x+","+mrPt_6.y+" Z" );
      //bottom line
      var blAng = AJS.easeOutBack( 0.9944, 0.9944+rotation, menuDisappearDurationInFrames_6, currentFrame_6 );
      var brAng = AJS.easeOutBack( 5.2887, 5.2887+rotation, menuDisappearDurationInFrames_6, currentFrame_6 );
      positionRotation( cPt_6, blPt_6, blAng );
      positionRotation( cPt_6, brPt_6, brAng );
      bottomLine_6.setAttribute( "d", "M"+blPt_6.x+","+blPt_6.y+" L"+brPt_6.x+","+brPt_6.y+" Z" );
			//recursion
			menuAppearAnimation_6();
		});
	} else {
		currentFrame_6 = 0;
		menuAppearComplete_6 = true;
	}
}

///Close Menu Animation
function closeMenuAnimation_6() {
	if ( !arrowDisappearComplete_6 ) {
		arrowDisappearAnimation_6();
	} else if ( !menuAppearComplete_6 ) {
		menuAppearAnimation_6();
	}
}

///Events
icon_6.addEventListener( "click", ()=> { 
  if ( state_6 === "menu" ) {
  	openMenuAnimation_6();
  	state_6 = "arrow";
  	arrowDisappearComplete_6 = false;
		menuAppearComplete_6 = false;
  } else if ( state_6 === "arrow" ) {
  	closeMenuAnimation_6();
  	state_6 = "menu";
  	menuDisappearComplete_6 = false;
		arrowAppearComplete_6 = false;
  }
});




///////////////// DEMO //////////////////

function playDemo() { 
  setTimeout( function() { icon_1.click(); }, 1000 );
  setTimeout( function() { icon_1.click(); }, 2000 );
  setTimeout( function() { icon_2.click(); }, 3000 );
  setTimeout( function() { icon_2.click(); }, 4000 );
  setTimeout( function() { icon_3.click(); }, 5000 );
  setTimeout( function() { icon_3.click(); }, 6000 );
  setTimeout( function() { icon_4.click(); }, 7000 );
  setTimeout( function() { icon_4.click(); }, 8000 );
  setTimeout( function() { icon_5.click(); }, 9000 );
  setTimeout( function() { icon_5.click(); }, 10000 );
  setTimeout( function() { icon_6.click(); }, 11000 );
  setTimeout( function() { icon_6.click(); playDemo(); }, 12000 );
}

document.addEventListener("DOMContentLoaded", function(event) { 
  //playDemo();
});