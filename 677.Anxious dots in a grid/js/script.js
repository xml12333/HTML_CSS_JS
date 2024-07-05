//---

'use strict';

//---

console.clear();

//---

let w = 0;
let h = 0;

let animationFrame = null;
let isTouchDevice = false;

const canvas = document.createElement( 'canvas' );
const context = canvas.getContext( '2d' );

let imageData = null;
let data = null;

const center = { x: w / 2, y: h / 2 };
const border = { left: 1, top: 1, right: w, bottom: h };

let pointerPos = { x: center.x, y: center.y };
let pointerDown = false;
let pointerMoveTimeout;

const pointerMoveTimeoutTime = 2500;

//---

const dotColorR = 25;
const dotColorG = 155;
const dotColorB = 200;
const dotColorA = 255;
const dotsRadius = 4;
const dotsDistance = 10;
const dotsDiameter = dotsRadius * 2;
const dotsSpeed = 10;
const dotsWobbleFactor = 0.95;
const dotsWobbleSpeed = 0.05;
const dotsMaxEscapeRouteLengthBasis = 100;
let dotsMaxEscapeRouteLength = 100;
const dotsMouseDistanceSensitivitySpeed = 5;
const dotsMouseDistanceSensitivityMax = 250;
const dotsMouseDistanceSensitivityMinBasis = 100;
let dotsMouseDistanceSensitivityMin = 100;
let dotsMouseDistanceSensitivity = dotsMouseDistanceSensitivityMin;
let dotsHolder = [];
let dotsCount = 0;

let introPath = [];
let introInterval = null;
let introIndex = 0;
let introPathCoordinatesCount = 256;
let introSpeedBasis = 10;
let introSpeed = introSpeedBasis;

//---

function init() {

		isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

		//---

		if ( isTouchDevice === true ) {

				canvas.addEventListener( 'touchmove', cursorMoveHandler, false );
				canvas.addEventListener( 'touchend', cursorLeaveHandler, false );
				canvas.addEventListener( 'touchcancel ', cursorLeaveHandler, false );

		} else {

				canvas.addEventListener( 'pointermove', cursorMoveHandler, false );
				canvas.addEventListener( 'pointerdown', cursorDownHandler, false );
				canvas.addEventListener( 'pointerup', cursorUpHandler, false );
				canvas.addEventListener( 'pointerleave', cursorLeaveHandler, false );

		}

		//---

		document.body.appendChild( canvas );

		window.addEventListener( 'resize', onResize, false );

		restart();

}

function onResize( event ) {

		restart();

}

function restart() {

		const innerWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		const innerHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

		//---

		w = innerWidth;
		h = innerHeight;

		//---

		canvas.width = w;
		canvas.height = h;

		imageData = context.getImageData( 0, 0, w, h );
		data = imageData.data;

		//---

		center.x = w / 2;
		center.y = h / 2;

		pointerPos.x = -10000;
		pointerPos.y = -10000;

		border.right = w;
		border.bottom = h;

		//---

		removeDots();
		addDots();

		//---

		if ( animationFrame != null ) {

				cancelAnimFrame( animationFrame );

		}

		render();

		//---

		initIntroPath( introPathCoordinatesCount );
		stopIntro();
		playIntro();

}

//---

function addDots() {

		const dotsPerRow = Math.floor( w / ( dotsDiameter + dotsDistance ) ) + dotsDiameter * 2;
		const dotsPerColumn = Math.floor( h / ( dotsDiameter + dotsDistance ) ) + dotsDiameter * 2;
		const dotsCount = dotsPerRow * dotsPerColumn;

		const xs = -dotsDiameter;
		const ys = -dotsDiameter;

		let dotIndex = 0;

		for ( let i = 0; i < dotsPerColumn; i++ ) {

				for ( let j = 0; j < dotsPerRow; j++ ) {

						const x = xs + j * ( dotsDistance + dotsDiameter );
						const y = ys + i * ( dotsDistance + dotsDiameter );

						const dot = addDot( x, y, dotsRadius, dotsDiameter, dotColorR, dotColorG, dotColorB, dotColorA );

						dot.neighborRightIndex = ( j < dotsPerRow - 1 ) ? dotIndex + 1 : -1;
						dot.neighborBottomIndex = ( i < dotsPerColumn - 1 ) ? dotIndex + dotsPerRow : -1;

						dotsHolder.push( dot );
						dotIndex++;

				}

		}

		for ( let i = 0, l = dotsHolder.length; i < l; i++ ) {

				const dot = dotsHolder[ i ];

				if ( dot.neighborRightIndex > -1 ) {

						dot.neighborRight = dotsHolder[ dot.neighborRightIndex ];

				}

				if ( dot.neighborBottomIndex > -1 ) {

						dot.neighborBottom = dotsHolder[ dot.neighborBottomIndex ];

				}

		}

}

function addDot( x, y, radius, diameter, r, g, b, a ) {

		const dot = {};

		dot.cx = x;
		dot.cy = y;
		dot.x = x;
		dot.y = y;
		dot.sx = 0;
		dot.sy = 0;
		dot.radius = radius;
		dot.r = radius;
		dot.minRadius = radius * 0.75;
		dot.maxRadius = radius * 2.5;
		dot.diameter = diameter;
		dot.color = {};
		dot.color.r = r;
		dot.color.g = g;
		dot.color.b = b;
		dot.color.a = a;
		dot.colorDark = {};
		dot.colorDark.r = Math.floor( r * 0.75 );
		dot.colorDark.g = Math.floor( g * 0.75 );
		dot.colorDark.b = Math.floor( b * 0.75 );
		dot.colorDark.a = Math.floor( a * 0.5 );
		dot.colorDraw = {};
		dot.colorDraw.r = r;
		dot.colorDraw.g = g;
		dot.colorDraw.b = b;
		dot.colorDraw.a = a;
		dot.activeTime = 0;
		dot.distance = 0;
		dot.neighborRightIndex = 0;
		dot.neighborBottomIndex = 0;
		dot.neighborRight = null;
		dot.neighborBottom = null;

		return dot;

}

function removeDots() {

		if ( dotsHolder.length > 0 ) {

				dotsHolder = [];

		}

}

//---

function initIntroPath( numPoints ) {

		introPath = [];

		const radiusX = w / 4;
		const radiusY = h / 3;
		const centerX = w / 2;
		const centerY = h / 2;

		for ( let i = 0; i < numPoints; i++ ) {

				const angle = ( i / numPoints ) * 2 * Math.PI;
				const x = centerX + radiusX * Math.cos( angle );
				const y = centerY + radiusY * Math.sin( 2 * angle ) / 2;

				introPath.push( { x, y } );

		}

}

function playIntro() {

		introInterval = setInterval( () => {

				const pos = introPath[ introIndex ];

				pointerPos = pos;

				introIndex++;

				if ( introIndex >= introPath.length - 1 ) {

						introIndex = 0;

				}

		}, introSpeed );

}

function stopIntro() {

		clearTimeout( pointerMoveTimeout );

		if ( introInterval !== null ) {

				clearInterval( introInterval );

				introInterval = null;

		}

}

//---

function cursorDownHandler( event ) {

		pointerDown = true;

}

function cursorUpHandler( event ) {

		pointerDown = false;

}

function cursorLeaveHandler( event ) {

		pointerPos = { x: -10000, y: -10000 };
		pointerDown = false;

}

function cursorMoveHandler( event ) {

		stopIntro();

		//---

		clearTimeout( pointerMoveTimeout );

		pointerMoveTimeout = setTimeout( () => {

				playIntro();

		}, pointerMoveTimeoutTime );

		//---

		pointerPos = getCursorPosition( canvas, event );

}

function getCursorPosition( element, event ) {

		const rect = element.getBoundingClientRect();
		const position = { x: 0, y: 0 };

		if ( event.type === 'mousemove' || event.type === 'pointermove' ) {

				position.x = event.pageX - rect.left; //event.clientX
				position.y = event.pageY - rect.top; //event.clientY

		} else if ( event.type === 'touchmove' ) {

				position.x = event.touches[ 0 ].pageX - rect.left;
				position.y = event.touches[ 0 ].pageY - rect.top;

		}

		return position;

}

//---

function clearImageData() {

		for ( let i = 0, l = data.length; i < l; i += 4 ) {

				data[ i ] = 0;
				data[ i + 1 ] = 0;
				data[ i + 2 ] = 0;
				data[ i + 3 ] = 0;

		}

}

function setPixel( x, y, r, g, b, a ) {

		const i = ( x + y * imageData.width ) * 4;

		data[ i ] = r;
		data[ i + 1 ] = g;
		data[ i + 2 ] = b;
		data[ i + 3 ] = a;

}

//---

function drawLine( x1, y1, x2, y2, r, g, b, a ) {

		const dx = Math.abs( x2 - x1 );
		const dy = Math.abs( y2 - y1 );

		const sx = ( x1 < x2 ) ? 1 : -1;
		const sy = ( y1 < y2 ) ? 1 : -1;

		let err = dx - dy;

		let lx = x1;
		let ly = y1;    

		while ( true ) {

				if ( lx > 0 && lx < w && ly > 0 && ly < h ) {

						setPixel( lx, ly, r, g, b, a );

				}

				if ( lx === x2 && ly === y2 ) {

						break;

				}

				const e2 = 2 * err;

				if ( e2 > -dx ) { 

						err -= dy; 
						lx += sx; 

				}

				if ( e2 < dy ) { 

						err += dx; 
						ly += sy; 

				}

		}

}

//---

function drawCircle( x, y, radius, r, g, b, a ) {

    const left = border.left;
    const right = border.right;
    const top = border.top;
    const bottom = border.bottom;
    
    if ( radius === 1 ) {

        if ( x > left && x < right && y > top && y < bottom ) {

            setPixel( x | 0, y | 0, r, g, b, a );

        }

        return;

    }

    const radiusSquared = radius * radius;
    const xStart = Math.max( x - radius, left );
    const xEnd = Math.min( x + radius, right );
    const yStart = Math.max( y - radius, top );
    const yEnd = Math.min( y + radius, bottom );

    for ( let x2d = xStart; x2d < xEnd; x2d++ ) {
        
        for ( let y2d = yStart; y2d < yEnd; y2d++ ) {

            const aa = x - x2d;
            const bb = y - y2d;
            const distanceSquared = aa * aa + bb * bb;

            if ( distanceSquared <= radiusSquared ) {

                setPixel( x2d | 0, y2d | 0, r, g, b, a );

            }

        }

    }

}

//---

function draw() {

		dotsMouseDistanceSensitivity = Math.min( dotsMouseDistanceSensitivityMax, Math.max( dotsMouseDistanceSensitivityMin, dotsMouseDistanceSensitivity + ( pointerDown ? dotsMouseDistanceSensitivitySpeed : -dotsMouseDistanceSensitivitySpeed ) ) );

		//---

		const l = dotsHolder.length;

		for ( let i = 0; i < l; i++ ) {

				const dot = dotsHolder[ i ];

				//---

				const a = pointerPos.x - dot.cx;
				const b = pointerPos.y - dot.cy;

				const dotActive = a * a + b * b <= dotsMouseDistanceSensitivity * dotsMouseDistanceSensitivity;

				if ( dotActive === true ) {

						const distX = pointerPos.x - dot.cx;
						const distY = pointerPos.y - dot.cy;

						dot.distance = Math.sqrt( distX * distX + distY * distY );

						//---

						const angle = Math.atan2( distY, distX );

						const dirX = Math.cos( angle ) * -1;
						const dirY = Math.sin( angle ) * -1;

						const targetPosX = dot.cx + dirX * dotsMaxEscapeRouteLength;
						const targetPosY = dot.cy + dirY * dotsMaxEscapeRouteLength;

						//---

						dot.x += ( targetPosX - dot.x ) / dotsSpeed;
						dot.y += ( targetPosY - dot.y ) / dotsSpeed;

						//---

						dot.activeTime = 1;

				} else {

						dot.distance = 0;
						dot.activeTime -= 0.005;

						//---

						if ( dot.activeTime > -2 ) {

								dot.sx = dot.sx * dotsWobbleFactor + ( dot.cx - dot.x ) * dotsWobbleSpeed;
								dot.sy = dot.sy * dotsWobbleFactor + ( dot.cy - dot.y ) * dotsWobbleSpeed;

								dot.x = Math.round( dot.x + dot.sx );
								dot.y = Math.round( dot.y + dot.sy );

						}

				}

				//---

				if ( dot.distance === 0 ) {

						dot.colorDraw.r = dot.color.r;
						dot.colorDraw.g = dot.color.g;
						dot.colorDraw.b = dot.color.b;

						dot.r = dot.radius;

				} else {

						const brightness = dot.distance / dotsMouseDistanceSensitivity;
						const clampedBrightness = Math.max( 0, Math.min( 1, brightness ) );
						const invertedBrightness = 1 - clampedBrightness;

						dot.colorDraw.r = dot.color.r + ( 255 - dot.color.r ) * invertedBrightness;
						dot.colorDraw.g = dot.color.g + ( 255 - dot.color.g ) * invertedBrightness;
						dot.colorDraw.b = dot.color.b + ( 255 - dot.color.b ) * invertedBrightness;

						dot.r = dot.minRadius + ( dot.maxRadius - dot.minRadius ) * ( 1 - clampedBrightness );

				}

				//---

				if ( dot.activeTime > 0 && dotsRadius >= 4 ) {

						drawCircle( dot.cx, dot.cy, dot.radius, dot.colorDark.r, dot.colorDark.g, dot.colorDark.b, dot.colorDark.a );

				}

		}

		dotsHolder = dotsHolder.sort( ( a, b ) => {

				return ( a.distance - b.distance );

		} );

		for ( let i = 0; i < l; i++ ) {

				const dot = dotsHolder[ i ];

				if ( dot.activeTime > 0 ) {

						drawLine( dot.cx, dot.cy, dot.x | 0, dot.y | 0, dot.colorDraw.r, dot.colorDraw.g, dot.colorDraw.b, dot.color.a );

				}

		}

		for ( let i = 0; i < l; i++ ) {

				const dot = dotsHolder[ i ];

				const dotR = dot.neighborRight;
				const dotB = dot.neighborBottom;

				if ( dotR !== null ) {

						drawLine( dot.x | 0, dot.y | 0, dotR.x | 0, dotR.y | 0, dot.colorDraw.r, dot.colorDraw.g, dot.colorDraw.b, dot.color.a );

				}

				if ( dotB !== null ) {

						drawLine( dot.x | 0, dot.y | 0, dotB.x | 0, dotB.y | 0, dot.colorDraw.r, dot.colorDraw.g, dot.colorDraw.b, dot.color.a );

				}

		}

		for ( let i = 0; i < l; i++ ) {

				const dot = dotsHolder[ i ];

				drawCircle( dot.x, dot.y, dot.r, dot.colorDraw.r, dot.colorDraw.g, dot.colorDraw.b, dot.color.a );

		}

}

//---

function render( timestamp ) {

		clearImageData();

		//---

		draw();

		//---

		context.putImageData( imageData, 0, 0 );

		//---

		animationFrame = requestAnimFrame( render );

}

window.requestAnimFrame = ( () => {

		return  window.requestAnimationFrame       ||
						window.webkitRequestAnimationFrame ||
						window.mozRequestAnimationFrame    ||
						window.msRequestAnimationFrame;

} )();

window.cancelAnimFrame = ( () => {

		return  window.cancelAnimationFrame       ||
						window.mozCancelAnimationFrame;

} )();

//---

document.addEventListener( 'DOMContentLoaded', () => {

		init();

} );