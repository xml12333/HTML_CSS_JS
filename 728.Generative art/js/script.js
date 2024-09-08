//---

'use strict';

//---

console.clear();

//---

let w = 0;
let h = 0;

let renderIteration = 0;
let animationFrame = null;
let isTouchDevice = false;

const canvas = document.createElement( 'canvas' );
const context = canvas.getContext( '2d', { alpha: false } );

const border = { left: 1, top: 1, right: w, bottom: h };
const center = { x: 0, y: 0 };

let imageData = null;
let data = null;

const rgbColor = {

		r: Math.random() * 155 + 100,
		g: Math.random() * 155 + 100,
		b: Math.random() * 155 + 100,

};

const rgbPhase = {

		r: 0,
		g: 2,
		b: 4,

};

const rgbChangeSpeed = {

		r: 0.010,
		g: 0.007,
		b: 0.013,

};

const rgbMinBrightness = {

		r: 150,
		g: 100,
		b: 50,

};

//---

const sectorTiles = 20;
let sectorSizeX = 0;
let sectorSizeY = 0;
let sectors = new Map();
let sectorsX = 0;
let sectorsY = 0;

//---

let boidHolder = [];
let boidCount = 2048;
const boidPathLength = 128;
const boidRadius = 6;
const boidDiameter = boidRadius * 2;
let boidSpeed = 1;
const boidSpeedMin = 0;
const boidSpeedMax = 4;
const boidRadialSpeed = Math.PI / 60;
const boidVision = 50;
const boidVisionSquared = boidVision * boidVision;

const boidRadialSpeedMin = Math.PI / 10;
const boidRadialSpeedMax = Math.PI / 60;
const boidMaxRadius = 4;
const boidRepulsionDistance = 50;
const boidRepulsionDistanceSquared = boidRepulsionDistance * boidRepulsionDistance;

const ovumRadius = boidRepulsionDistance - boidSpeedMax - 1;
const ovumDiameter = ovumRadius * 2;
//---

let pointerInitialPos = { x: -ovumDiameter, y: -ovumDiameter };
let pointer = { x: 0, y: 0 };
let pointerPos = { x: 0, y: 0 };
let pointerDown = false;
let pointerActive = false;

//---

function init() {

		isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

		//---

		if ( isTouchDevice === true ) {

				boidCount *= 0.5;

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

		sectorSizeX = Math.floor( w / sectorTiles );
		sectorSizeY = Math.floor( h / sectorTiles );
		sectors = new Map();
		sectorsX = Math.ceil( w / sectorSizeX );
		sectorsY = Math.ceil( h / sectorSizeY );

		//---

		border.right = w;
		border.bottom = h;

		center.x = w / 2;
		center.y = h / 2;

		pointerPos.x = pointerInitialPos.x;
		pointerPos.y = pointerInitialPos.y;
		pointer.x = pointerInitialPos.x;
		pointer.y = pointerInitialPos.y;

		//---

		removeBoids();
		addBoids();

		//---

		if ( animationFrame != null ) {

				cancelAnimFrame( animationFrame );

		}

		// for ( let i = 0; i < boidPathLength - 1; i++ ) {

		//     draw();

		// }

		render();

}

//---

function removeBoids() {

		boidHolder = [];

}

function addBoids() {

		for ( let i = 0; i < boidCount; i++ ) {

				const boid = addBoid( Math.random() * w, Math.random() * h, i );

				boidHolder.push( boid );

		}

}

function addBoid( x, y, id ) {

		const boid = {};

		boid.x = x;
		boid.y = y;
		boid.key = '';
		boid.oldKey = '';
		boid.id = id;
		boid.heading = Math.random() * 2 * Math.PI - Math.PI;
		boid.path = [];

		boid.radialSpeed = 0;
		boid.speed = 0;

		for ( let i = 0; i < boidPathLength; i++ ) {

				const b = addBoidSub( x, y, '' );

				boid.path.push( b );

		}

		return boid;

}

function addBoidSub( x, y, key = '' ) {

		const boidSub = {};

		boidSub.x = x;
		boidSub.y = y;

		return boidSub;

}

//---

function getSectorKey( x, y ) {

		const sectorX = Math.floor( x / sectorSizeX );
		const sectorY = Math.floor( y / sectorSizeY );

		return `${ sectorX },${ sectorY }`;

}

function addBoidToSector( boid ) {

		const key = boid.key; 

		if ( sectors.has( key ) === false ) {

				sectors.set( key, new Set() );

		}

		sectors.get( key ).add( boid );

}

function removeBoidFromSector( boid ) {

		const key = boid.oldKey;

		if ( sectors.has( key ) === true ) {

				const sector = sectors.get( key );

				sector.delete( boid );

		}

}

//---

function getNeighbors( boid ) {

		const neighbors = [];
		const sectorKey = boid.key;
		const [ sectorX, sectorY ] = sectorKey.split( ',' ).map( Number );

		for ( let dx = -1; dx <= 1; dx++ ) {

				for ( let dy = -1; dy <= 1; dy++ ) {

						const neighborX = ( sectorX + dx + sectorsX ) % sectorsX;
						const neighborY = ( sectorY + dy + sectorsY ) % sectorsY;
						const neighborKey = `${ neighborX },${ neighborY }`;

						if ( sectors.has( neighborKey ) ) {

								const sectorBoids = sectors.get( neighborKey );

								sectorBoids.forEach( otherBoid => {

										if ( boid.id !== otherBoid.id && getDistanceSquared( boid, otherBoid, w, h ) < boidVisionSquared ) {

												neighbors.push( otherBoid );

										}

								} );

						}

				}

		}

		return neighbors;

}

function isInSameOrNeighborSector( boid1, boid2 ) {

		const [ sectorX1, sectorY1 ] = boid1.key.split( ',' ).map( Number );
		const [ sectorX2, sectorY2 ] = boid2.key.split( ',' ).map( Number );

		const isNeighborX = Math.abs( sectorX1 - sectorX2 ) <= 1;
		const isNeighborY = Math.abs( sectorY1 - sectorY2 ) <= 1;

		return isNeighborX && isNeighborY;

}

//---

function getDistanceSquared( boid1, boid2, width, height ) {

		const x0 = Math.min( boid1.x, boid2.x );
		const x1 = Math.max( boid1.x, boid2.x );
		const y0 = Math.min( boid1.y, boid2.y );
		const y1 = Math.max( boid1.y, boid2.y );

		const dx = Math.min( x1 - x0, x0 + width - x1 );
		const dy = Math.min( y1 - y0, y0 + height - y1 );

		return dx * dx + dy * dy;

}

//---

function wrap( value, min, max ) {

		const range = max - min;

		if ( value >= min && value < max ) {

				return value;

		}

		return ( ( value - min ) % range + range ) % range + min;

}

function clamp( value, limit ) {

		return Math.min( limit, Math.max( -limit, value ) );

}

function meanAngle( angle1, angle2 ) {

		const cos = Math.cos( angle1 );
		const sin = Math.sin( angle1 );

		const sumX = cos * 3 + Math.cos( angle2 );
		const sumY = sin * 3 + Math.sin( angle2 );

		return Math.atan2( sumY * 0.25, sumX * 0.25 );

}

//---

function clearImageData( fadeAmount = 1 ) {

		for ( let i = 0, l = data.length; i < l; i += 4 ) {

				data[ i ]     = Math.max( 0, data[ i     ] - fadeAmount );
				data[ i + 1 ] = Math.max( 0, data[ i + 1 ] - fadeAmount );
				data[ i + 2 ] = Math.max( 0, data[ i + 2 ] - fadeAmount );
				data[ i + 3 ] = 255;

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

function draw() {

		pointer.x += ( pointerPos.x - pointer.x ) / 10;
		pointer.y += ( pointerPos.y - pointer.y ) / 10;

		//---

		for ( let i = 0, l = boidHolder.length; i < l; i++ ) {

				const boid = boidHolder[ i ];

				//---

				boid.oldKey = getSectorKey( boid.x, boid.y );

				//---

				let alert = false;

				const dx = pointer.x - boid.x;
				const dy = pointer.y - boid.y;

				if ( pointerActive === true ) {

						const distSquared = dx * dx + dy * dy;

						alert = distSquared <= boidRepulsionDistanceSquared;


				}

				//---

				boid.speed += alert ? 1 : -0.025;
				boid.speed = Math.max( boidSpeedMin, Math.min( boid.speed, boidSpeedMax ) );

				boid.radialSpeed += alert ? 0.5 : -0.1;
				boid.radialSpeed = Math.min( boidRadialSpeedMin, Math.max( boid.radialSpeed, boidRadialSpeedMax ) );

				//---

				const heading = () => {

						let delta = wrap( target - boid.heading, -Math.PI, Math.PI );

						delta = clamp( delta, boid.radialSpeed );

						boid.heading = wrap( boid.heading + delta, -Math.PI, Math.PI );

				};

				//---

				let target = 0;

				const neighbors = getNeighbors( boid );
				const neighborsCount = neighbors.length;

				if ( neighborsCount > 0 ) {

						let meanhx = 0; 
						let meanhy = 0;

						let meanx = 0;
						let meany = 0;

						let mindist = boidDiameter * boidDiameter;
						let min = null;

						for ( let j = 0, m = neighborsCount; j < m; j++ ) {

								const b = neighbors[ j ];

								meanhx += Math.cos( b.heading );
								meanhy += Math.sin( b.heading );

								meanx += b.x;
								meany += b.y;

								const dist = getDistanceSquared( boid, b, w, h );

								if ( dist < mindist ) {

										mindist = dist;
										min = b;

								}

						}

						meanhx /= neighborsCount;
						meanhy /= neighborsCount;

						meanx /= neighborsCount;
						meany /= neighborsCount;

						//---

						if ( alert ) {

								target = Math.atan2( dy, dx ) + Math.PI;

						} else {

								if ( min ) {

										target = Math.atan2( boid.y - min.y, boid.x - min.x );

								} else {

										const meanh = Math.atan2( meanhy, meanhx );
										const center = Math.atan2( meany - boid.y, meanx - boid.x );

										target = meanAngle( meanh, center );

								}

						}

						heading();

				} else {

						if ( alert ) {

								target = Math.atan2( dy, dx ) + Math.PI;

								//---

								heading();

						} 

				}

				//---

				boid.x += Math.cos( boid.heading ) * ( boidSpeed + boid.speed );
				boid.y += Math.sin( boid.heading ) * ( boidSpeed + boid.speed );

				if ( boid.x > w ) {

						boid.x = 1;

				} else if ( boid.x < 1 ) {

						boid.x = w;

				}

				if ( boid.y > h ) {

						boid.y = 1;

				} else if ( boid.y < 1 ) {

						boid.y = h;

				}

				boid.key = getSectorKey( boid.x, boid.y );

				if ( boid.oldKey !== boid.key ) {

						removeBoidFromSector( boid );
						addBoidToSector( boid );

				}

				//---

				const b = boid.path.shift();

				b.x = boid.x;
				b.y = boid.y;

				boid.path.push( b );

				//---

				// for ( let j = 0, m = boid.path.length - 1; j < m; j++ ) {
				for ( let j = 0, m = boid.path.length - 1; j < m; j += 8 ) {

						const factor = j / m;

						const fadeFactor = factor * 155 + 100;

						const r = ( rgbColor.r * fadeFactor ) / 255;
						const g = ( rgbColor.g * fadeFactor ) / 255;
						const b = ( rgbColor.b * fadeFactor ) / 255;

						const b1 = boid.path[ j ];

						if ( boidSpeed + boid.speed <= 1 ) {

								setPixel( b1.x | 0, b1.y | 0, r, g, b, 255 );

						} else {

								const b2 = boid.path[ j + 1 ];

								const dx = Math.abs( b1.x - b2.x );
								const dy = Math.abs( b1.y - b2.y );

								if ( dx < center.x && dy < center.y ) {

										drawLine( b1.x | 0, b1.y | 0, b2.x | 0, b2.y | 0, r, g, b, 255 );

								}

						} 

				} 

		}

		//---

		rgbColor.r = Math.floor( Math.sin( rgbPhase.r ) * 127 + 128 );
		rgbColor.g = Math.floor( Math.sin( rgbPhase.g ) * 127 + 128 );
		rgbColor.b = Math.floor( Math.sin( rgbPhase.b ) * 127 + 128 );

		rgbColor.r = Math.max( rgbColor.r, rgbMinBrightness.r );
		rgbColor.g = Math.max( rgbColor.g, rgbMinBrightness.g );
		rgbColor.b = Math.max( rgbColor.b, rgbMinBrightness.b );

		rgbPhase.r += rgbChangeSpeed.r;
		rgbPhase.g += rgbChangeSpeed.g;
		rgbPhase.b += rgbChangeSpeed.b;

}

//---

function render( timestamp ) {

		if ( renderIteration % 10 === 0 ) {

				clearImageData();

		}

		//---

		draw();

		//---

		context.putImageData( imageData, 0, 0 );

		//---

		renderIteration++;

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

function cursorDownHandler( event ) {

		pointerDown = true;

}

function cursorUpHandler( event ) {

		pointerDown = false;

}

function cursorLeaveHandler( event ) {

		pointerPos = { x: pointerInitialPos.x, y: pointerInitialPos.y };
		pointerDown = false;
		pointerActive = false;

}

function cursorMoveHandler( event ) {

		pointerPos = getCursorPosition( canvas, event );
		pointerActive = true;

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

document.addEventListener( 'DOMContentLoaded', () => {

		init();

} );