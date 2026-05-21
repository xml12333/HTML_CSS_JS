'use strict';

//---

console.clear();
console.log( 'Wire Curtain Playground' );

//---

let gui = null;
let stats = null;
let statsShow = false;

let w = 0;
let h = 0;

let animationFrame = null;
let isTouchDevice = false;

const canvas = document.createElement( 'canvas' );
const context = canvas.getContext( '2d', { willReadFrequently: false, alpha: false } );

let imageData = null;
let data = null;
let imageDataWidth = 0;
let imageDataBufferUint32 = null;

const center = { x: w * 0.5, y: h * 0.5 };

let borderTop = 0;
let borderBottom = 0;
let borderLeft = 0;
let borderRight = 0;

let pointerPos = { x: center.x, y: center.y };
let pointerPosFollow = { x: center.x, y: center.y };
let pointerPosFollowSpeed = 5;
let pointerDownButton = -1;
let pointerActive = false;
let pointerMoveTimeout;

const pointerMoveTimeoutTime = 2500;

//---

let clearColor32 = 0;

let colorBackgroundR = 35;
let colorBackgroundG = 0;
let colorBackgroundB = 0;

//---

const WIRE_POINT_PINNED = 1;

let wireCount = 768;
let wireJoints = 32;
let wireIterations = 8;
let wireGravity = 0.65;
let wireFriction = 0.97; // 0.938

let wirePointFollowSpeed = 32;

const wirePointMouseDistanceSensitivitySpeed = 2.5;
let wirePointMouseDistanceSensitivityMax = 512;
let wirePointMouseDistanceSensitivityMin = 256;
let wirePointMouseDistanceSensitivity = wirePointMouseDistanceSensitivityMin;

//---

let wirePointsX = null;
let wirePointsY = null;
let wirePointsOldX = null;
let wirePointsOldY = null;
let wirePointsFlag = null;
let wirePointsInitialX = null;
let wirePointsInitialY = null;

let wireJointsPointA = null;
let wireJointsPointB = null;
let wireJointsLength = null;

let wirePointStart = null;
let wirePointCount = null;
let wireJointStart = null;
let wireJointCount = null;

let wireZ = null;

let wireJointColorR = 210;
let wireJointColorG = 85;
let wireJointColorB = 0;
let wirePointColorR = 255;
let wirePointColorG = 125;
let wirePointColorB = 0;

//---

let curtainTrianglesPointA = null;
let curtainTrianglesPointB = null;
let curtainTrianglesPointC = null;

let curtainStripShade = null;

let curtainColorR = 210;
let curtainColorG = 0;
let curtainColorB = 0;

let curtainLightWavePrimaryFrequency = 0.45;
let curtainLightWavePrimaryAmplitude = 18;
let curtainLightWaveSecondaryFrequency = 1.1;
let curtainLightWaveSecondaryAmplitude = 4;

// let curtainColorCount = 0;
let curtainTrianglesPerWireStrip = 0;

//---

let lightX = 0.4;
let lightY = 0.0;
let lightZ = 1.0;

let lightAmbient = 0.35;
let lightDiffuse = 0.65;

//---

let renderDebugJoints = false;
let renderDebugPoints = false;
let renderDebugCircles = false;
let renderDebugTriangles = false;
let renderDebugDiagonalJoints = false;
let renderDebugQuads = false;

let renderShadedJoints = true;
let renderShadedTriangles = false;
let renderShadedCheckerboard = false;

//---

let introPath = [];
let introInterval = null;
let introIndex = 0;
let introPathCoordinatesCount = 512;
let introSpeedBasis = 10;
let introSpeed = introSpeedBasis;
let introEnabled = true;

//---

function init() {

    isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

    //---

    canvas.oncontextmenu = ( event ) => {

        event.preventDefault();

    };

    if ( isTouchDevice === true ) {

        canvas.addEventListener( 'touchmove', cursorMoveHandler, false );
        canvas.addEventListener( 'touchend', cursorLeaveHandler, false );
        canvas.addEventListener( 'touchcancel ', cursorLeaveHandler, false );

    } else {

        canvas.addEventListener( 'pointermove', cursorMoveHandler, false );
        canvas.addEventListener( 'pointerdown', cursorDownHandler, false );
        canvas.addEventListener( 'pointerup', cursorUpHandler, false );
        canvas.addEventListener( 'pointerenter', cursorEnterHandler, false );
        canvas.addEventListener( 'pointerleave', cursorLeaveHandler, false );

    }

    document.body.appendChild( canvas );

    //---

    stats = new Stats();

    document.body.appendChild( stats.domElement );

    if ( statsShow === true ) {

        stats.domElement.style.display = 'block';
        stats.domElement.style.pointerEvents = 'initial';

    } else {

        stats.domElement.style.display = 'none';
        stats.domElement.style.pointerEvents = 'none';

    }

    //---

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

    imageData = context.createImageData( w, h );
    data = imageData.data;
    imageDataWidth = imageData.width;
    imageDataBufferUint32 = new Uint32Array( imageData.data.buffer );

    borderTop = 0;
    borderBottom = imageData.height;
    borderLeft = 0;
    borderRight = imageData.width;

    //---

    setClearImageData( colorBackgroundR, colorBackgroundG, colorBackgroundB );

    clearImageData();

    context.putImageData( imageData, 0, 0 );

    //---
    
    center.x = w * 0.5;
    center.y = h * 0.5;

    pointerPos.x = center.x;
    pointerPos.y = center.y;

    pointerPosFollow.x = center.x;
    pointerPosFollow.y = center.y;

    //---

    initWires();

    //---
    
    if ( animationFrame !== null ) {
    
        cancelAnimFrame( animationFrame );
    
    }
    
    render();

    //---

    initIntroPath( introPathCoordinatesCount );

    if ( introEnabled === true ) {

        stopIntro();
        playIntro();

    }

}

//---

function initWires() {

    const wireTotalPointCount = wireCount * wireJoints;
    const wireTotalJointCount = wireCount * ( wireJoints - 1 );

    const curtainCellCount = ( wireCount - 1 ) * ( wireJoints - 1 );
    const curtainTriangleCount = curtainCellCount * 2;

    curtainTrianglesPerWireStrip = ( wireJoints - 1 ) * 2;

    //---

    wirePointsX = new Float32Array( wireTotalPointCount );
    wirePointsY = new Float32Array( wireTotalPointCount );
    wirePointsOldX = new Float32Array( wireTotalPointCount );
    wirePointsOldY = new Float32Array( wireTotalPointCount );
    wirePointsFlag = new Uint8Array( wireTotalPointCount );
    wirePointsInitialX = new Float32Array( wireTotalPointCount );
    wirePointsInitialY = new Float32Array( wireTotalPointCount );

    wireJointsPointA = new Uint32Array( wireTotalJointCount );
    wireJointsPointB = new Uint32Array( wireTotalJointCount );
    wireJointsLength = new Float32Array( wireTotalJointCount );

    wirePointStart = new Uint16Array( wireCount );
    wirePointCount = new Uint16Array( wireCount );
    wireJointStart = new Uint16Array( wireCount );
    wireJointCount = new Uint16Array( wireCount );

    wireZ = new Float32Array( wireCount );

    curtainTrianglesPointA = new Uint16Array( curtainTriangleCount );
    curtainTrianglesPointB = new Uint16Array( curtainTriangleCount );
    curtainTrianglesPointC = new Uint16Array( curtainTriangleCount );

    //---

    let wirePointIndex = 0;
    let wireJointIndex = 0;
    let wireTriangleIndex = 0;

    //---

    console.log( 'Wires:', wireCount );
    console.log( 'Wire Points:', wireTotalPointCount );
    console.log( 'Wire Joints:', wireTotalJointCount );
    console.log( 'Wire Triangles:', curtainTriangleCount );

    //---

    const create = ( wCount, wStartX, wStartY, wEndX, wEndY, wDir ) => {

        const wireDistance = wEndX / ( wCount - 1 );

        console.log( 'Wire distance:', wireDistance );

        for ( let i = 0; i < wCount; i++ ) {

            const wirePositionXStart = wStartX + wireDistance * i;
            const wirePositionYStart = wStartY;

            const wirePositionXEnd = wirePositionXStart;
            const wirePositionYEnd = wEndY - 1;

            const dx = wirePositionXEnd - wirePositionXStart;
            const dy = wirePositionYEnd - wirePositionYStart;

            const distanceSquared = dx * dx + dy * dy; 

            let distance = 0;

            if ( dx === 0 ) {

                distance = Math.abs( dy );

            } else if ( dy === 0 ) {

                distance = Math.abs( dx );

            } else {

                distance = Math.sqrt( distanceSquared );

            }

            const wireJointLengthCurrent = distance / ( wireJoints - 1 );
            const WirePointStartCurrent = wirePointIndex;

            //---

            wirePointStart[ i ] = wirePointIndex;
            wirePointCount[ i ] = wireJoints;

            wireJointStart[ i ] = wireJointIndex;
            wireJointCount[ i ] = wireJoints - 1;

            //---

            for ( let j = 0; j < wireJoints; j++ ) {

                const wirePointX = wirePositionXStart;
                const wirePointY = wirePositionYStart + j * wireJointLengthCurrent;

                wirePointsX[ wirePointIndex ] = wirePointX;
                wirePointsY[ wirePointIndex ] = wirePointY;
                wirePointsOldX[ wirePointIndex ] = wirePointX;
                wirePointsOldY[ wirePointIndex ] = wirePointY;
                wirePointsFlag[ wirePointIndex ] = j === 0 ? WIRE_POINT_PINNED : 0;
                wirePointsInitialX[ wirePointIndex ] = wirePointX;
                wirePointsInitialY[ wirePointIndex ] = wirePointY;

                wirePointIndex++;

            }

            for ( let j = 0; j < wireJoints - 1; j++ ) {

                wireJointsPointA[ wireJointIndex ] = WirePointStartCurrent + j;
                wireJointsPointB[ wireJointIndex ] = WirePointStartCurrent + j + 1;
                wireJointsLength[ wireJointIndex ] = wireJointLengthCurrent;

                wireJointIndex++;

            }

        }

        //---

        for ( let i = 0, l = wCount - 1; i < l; i++ ) {

            const wireAPointStart = wirePointStart[ i ];
            const wireBPointStart = wirePointStart[ i + 1 ];

            for ( let pointIndex = 0; pointIndex < wireJoints - 1; pointIndex++ ) {

                const a0 = wireAPointStart + pointIndex;
                const a1 = wireAPointStart + pointIndex + 1;

                const b0 = wireBPointStart + pointIndex;
                const b1 = wireBPointStart + pointIndex + 1;

                curtainTrianglesPointA[ wireTriangleIndex ] = a0;
                curtainTrianglesPointB[ wireTriangleIndex ] = b0;
                curtainTrianglesPointC[ wireTriangleIndex ] = b1;

                wireTriangleIndex++;

                curtainTrianglesPointA[ wireTriangleIndex ] = a0;
                curtainTrianglesPointB[ wireTriangleIndex ] = b1;
                curtainTrianglesPointC[ wireTriangleIndex ] = a1;

                wireTriangleIndex++;

            }

            //---

            wireZ[ i ] = Math.sin( i * curtainLightWavePrimaryFrequency ) * curtainLightWavePrimaryAmplitude + Math.sin( i * curtainLightWaveSecondaryFrequency ) * curtainLightWaveSecondaryAmplitude;
        
        }

        initCurtainStripShading( wCount );

    };

    create( wireCount, 0, 0, w, h - wireJoints, 0 );

}

function initCurtainStripShading( wCount ) {

    curtainStripShade = new Float32Array( wCount - 1 );

    const lightLength = Math.sqrt( lightX * lightX + lightY * lightY + lightZ * lightZ );

    const lx = lightX / lightLength;
    const ly = lightY / lightLength;
    const lz = lightZ / lightLength;

    const wireSpacing = w / wCount;

    for ( let i = 0; i < wCount - 1; i++ ) {

        const zLeft = wireZ[ i ];
        const zRight = wireZ[ i + 1 ];

        const hx = wireSpacing;
        const hy = 0;
        const hz = zRight - zLeft;

        const vx = 0;
        const vy = 1;
        const vz = 0;

        let nx = hy * vz - hz * vy;
        let ny = hz * vx - hx * vz;
        let nz = hx * vy - hy * vx;

        const normalLength = Math.sqrt( nx * nx + ny * ny + nz * nz );

        if ( normalLength > 0.0001 ) {

            nx /= normalLength;
            ny /= normalLength;
            nz /= normalLength;

        }

        let shade = nx * lx + ny * ly + nz * lz;

        if ( shade < 0 ) shade = 0;

        shade = lightAmbient + shade * lightDiffuse;

        curtainStripShade[ i ] = shade;

    }

}

//---

function initIntroPath( numPoints ) {

    introPath = [];

    const radiusX = w / 3;
    const radiusY = h / 2;
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

        pointerPos = introPath[ introIndex ];

        introIndex < introPath.length - 1 ? introIndex++ : introIndex = 0;

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

    pointerDownButton = event.button;

}

function cursorUpHandler( event ) {

    pointerDownButton = -1;

}

function cursorEnterHandler( event ) {

    pointerActive = true;

}

function cursorLeaveHandler( event ) {

    pointerActive = false;
    pointerDownButton = -1;

}

function cursorMoveHandler( event ) {

    stopIntro();

    //---

    clearTimeout( pointerMoveTimeout );

    if ( introEnabled === true ) {

        pointerMoveTimeout = setTimeout( () => {

            playIntro();

        }, pointerMoveTimeoutTime );

    }

    //---

    pointerPos = getCursorPosition( canvas, event );

}

function getCursorPosition( element, event ) {

    const rect = element.getBoundingClientRect();
    const position = { x: 0, y: 0 };

    if ( event.type === 'mousemove' || event.type === 'pointermove' ) {

        position.x = event.pageX - rect.left;
        position.y = event.pageY - rect.top;

    } else if ( event.type === 'touchmove' ) {

        position.x = event.touches[ 0 ].pageX - rect.left;
        position.y = event.touches[ 0 ].pageY - rect.top;

    }

    return position;

}

//---

function drawLineFast( x1, y1, x2, y2, r, g, b, a ) {

    const color = ( a << 24 ) | ( b << 16 ) | ( g << 8 ) | r;

    const left   = borderLeft   | 0;
    const right  = borderRight  | 0;
    const top    = borderTop    | 0;
    const bottom = borderBottom | 0;

    const wStride = imageDataWidth | 0;
    const buf = imageDataBufferUint32;

    if ( y1 === y2 ) {

        const y = y1 | 0;

        if ( y >= top && y < bottom ) {

            let xA = x1 | 0, xB = x2 | 0;

            if ( xA > xB ) { const t = xA; xA = xB; xB = t; }
            if ( xB < left || xA >= right ) return;

            xA = xA < left  ? left  : xA;
            xB = xB >= right ? right - 1 : xB;

            let ptr = ( y * wStride + xA ) | 0;

            for ( let x = xA; x <= xB; x++ ) {

                buf[ ptr++ ] = color;

            }

        }

        return;

    }

    if ( x1 === x2 ) {

        const x = x1 | 0;

        if ( x >= left && x < right ) {

            let yA = y1 | 0, yB = y2 | 0;

            if ( yA > yB ) { const t = yA; yA = yB; yB = t; }
            if ( yB < top || yA >= bottom ) return;

            yA = yA < top    ? top    : yA;
            yB = yB >= bottom ? bottom - 1 : yB;

            let ptr = ( yA * wStride + x ) | 0;

            for ( let y = yA; y <= yB; y++ ) { 
                
                buf[ ptr ] = color; 
                
                ptr += wStride; 
            
            }

        }

        return;

    }

    let x = x1 | 0;
    let y = y1 | 0;

    const xEnd = x2 | 0;
    const yEnd = y2 | 0;

    const sx = ( x < xEnd ) ? 1 : -1;
    const sy = ( y < yEnd ) ? 1 : -1;

    let dx = ( xEnd - x ) * sx;
    let dy = ( yEnd - y ) * sy;

    let err = dx - dy;

    let ptr = ( y * wStride + x ) | 0;

    const stepX = sx;
    const stepY = ( sy * wStride ) | 0;

    while ( true ) {

        if ( x >= left && x < right && y >= top && y < bottom ) {

            buf[ ptr ] = color;

        }

        if ( x === xEnd && y === yEnd ) {

            break;

        } 

        const e2 = err << 1;

        if ( e2 > -dy ) {

            err -= dy;
            x   += sx;
            ptr += stepX;

        }

        if ( e2 <  dx ) {

            err += dx;
            y   += sy;
            ptr += stepY;

        }

    }

}

//---

function drawCircleFast( cx, cy, radius, r, g, b, a ) {

    radius = radius | 0; 
    
    if ( radius <= 0 ) {

        return;

    }

    const color = ( a << 24 ) | ( b << 16 ) | ( g << 8 ) | r;

    const buf    = imageDataBufferUint32;
    const stride = imageDataWidth | 0;

    const left   = borderLeft   | 0;
    const right  = borderRight  | 0;
    const top    = borderTop    | 0;
    const bottom = borderBottom | 0;

    let x = radius;
    let y = 0;
    let err = 1 - x;

    const hspan = ( yRow, xa, xb ) => {

        if ( yRow < top || yRow >= bottom ) return;
        if ( xa > xb ) { const t = xa; xa = xb; xb = t; }
        if ( xb < left || xa >= right ) return;

        xa = xa < left ? left : xa;
        xb = xb >= right ? right - 1 : xb;

        let ptr = (yRow * stride + xa) | 0;

        for ( let xw = xa; xw <= xb; xw++ ) {

            buf[ ptr++ ] = color;

        }

    }

    while ( x >= y ) {

        const yTop    = ( cy - y ) | 0;
        const yBottom = ( cy + y ) | 0;
        const yTop2   = ( cy - x ) | 0;
        const yBottom2= ( cy + x ) | 0;

        hspan( yTop   , ( cx - x ) | 0, ( cx + x ) | 0 );
        hspan( yBottom, ( cx - x ) | 0, ( cx + x ) | 0 );

        if ( x !== y ) {

            hspan( yTop2   , ( cx - y ) | 0, ( cx + y ) | 0 );
            hspan( yBottom2, ( cx - y ) | 0, ( cx + y ) | 0 );

        }

        y++;

        if ( err < 0 ) {

            err += ( y << 1 ) + 1;

        } else {

            x--;
            err += ( ( y - x ) << 1 ) + 1;

        }

    }

}

//---

function drawCircleFastOutline( cx, cy, radius, r, g, b, a ) {

    radius = radius | 0; 
    
    if ( radius <= 0 ) {

        return;

    }

    const color = ( a << 24 ) | ( b << 16 ) | ( g << 8 ) | r;

    const buf    = imageDataBufferUint32;
    const stride = imageDataWidth | 0;

    const left   = borderLeft   | 0;
    const right  = borderRight  | 0;
    const top    = borderTop    | 0;
    const bottom = borderBottom | 0;

    const pset = ( px, py ) => {

        if ( px >= left && px < right && py >= top && py < bottom ) {

            buf[ ( py * stride + px ) | 0 ] = color;

        }

    }

    let x = radius;
    let y = 0;
    let err = 1 - x;

    while ( x >= y ) {

        pset( ( cx + x ) | 0, ( cy + y ) | 0 );
        pset( ( cx - x ) | 0, ( cy + y ) | 0 );
        pset( ( cx + x ) | 0, ( cy - y ) | 0 );
        pset( ( cx - x ) | 0, ( cy - y ) | 0 );

        pset( ( cx + y ) | 0, ( cy + x ) | 0 );
        pset( ( cx - y ) | 0, ( cy + x ) | 0 );
        pset( ( cx + y ) | 0, ( cy - x ) | 0 );
        pset( ( cx - y ) | 0, ( cy - x ) | 0 );

        y++;

        if ( err < 0 ) {

            err += ( y << 1 ) + 1;

        } else {

            x--;
            err += ( ( y - x ) << 1 ) + 1;

        }

    }

}

//---

function drawTriangleFast( p0X, p0Y, p1X, p1Y, p2X, p2Y, r, g, b, a ) {

    let minPX = p0X;
    if ( p1X < minPX ) minPX = p1X;
    if ( p2X < minPX ) minPX = p2X;

    let minPY = p0Y;
    if ( p1Y < minPY ) minPY = p1Y;
    if ( p2Y < minPY ) minPY = p2Y;

    let maxPX = p0X;
    if ( p1X > maxPX ) maxPX = p1X;
    if ( p2X > maxPX ) maxPX = p2X;

    let maxPY = p0Y;
    if ( p1Y > maxPY ) maxPY = p1Y;
    if ( p2Y > maxPY ) maxPY = p2Y;

    let minX = minPX | 0;
    let minY = minPY | 0;
    let maxX = ( maxPX + 1 ) | 0;
    let maxY = ( maxPY + 1 ) | 0;

    if ( minX < borderLeft ) minX = borderLeft;
    if ( minY < borderTop ) minY = borderTop;
    if ( maxX > borderRight ) maxX = borderRight;
    if ( maxY > borderBottom ) maxY = borderBottom;

    if ( minX >= maxX || minY >= maxY ) {

        return;

    }

    const A0 = ( p1Y - p2Y ); 
    const B0 = ( p2X - p1X );
    const C0 = ( p1X * p2Y - p2X * p1Y );
    const A1 = ( p2Y - p0Y );
    const B1 = ( p0X - p2X );
    const C1 = ( p2X * p0Y - p0X * p2Y );
    const A2 = ( p0Y - p1Y );
    const B2 = ( p1X - p0X );
    const C2 = ( p0X * p1Y - p1X * p0Y );

    const dE0dx = A0; 
    const dE0dy = B0;
    const dE1dx = A1; 
    const dE1dy = B1;
    const dE2dx = A2; 
    const dE2dy = B2;

    let E0_row = A0 * minX + B0 * minY + C0;
    let E1_row = A1 * minX + B1 * minY + C1;
    let E2_row = A2 * minX + B2 * minY + C2;

    const color = ( a << 24 ) | ( b << 16 ) | ( g << 8 ) | r;

    for ( let y = minY; y < maxY; y++ ) {

        let E0 = E0_row;
        let E1 = E1_row; 
        let E2 = E2_row;

        let ptr = y * imageDataWidth + minX;

        for ( let x = minX; x < maxX; x++ ) {

            if ( E0 >= 0 && E1 >= 0 && E2 >= 0 ) {

                imageDataBufferUint32[ ptr ] = color;

            }

            E0 += dE0dx; 
            E1 += dE1dx; 
            E2 += dE2dx; 
            
            ptr++;

        }

        E0_row += dE0dy; 
        E1_row += dE1dy; 
        E2_row += dE2dy;

    }
    
}

//---

function draw() {

    wirePointMouseDistanceSensitivity = Math.min( wirePointMouseDistanceSensitivityMax, Math.max( wirePointMouseDistanceSensitivityMin, wirePointMouseDistanceSensitivity + ( pointerDownButton === 0 ? wirePointMouseDistanceSensitivitySpeed : -wirePointMouseDistanceSensitivitySpeed ) ) );

    const mouseDistanceThresholdSquared = wirePointMouseDistanceSensitivity * wirePointMouseDistanceSensitivity;

    //---

    pointerPosFollow.x += ( pointerPos.x - pointerPosFollow.x ) / pointerPosFollowSpeed;
    pointerPosFollow.y += ( pointerPos.y - pointerPosFollow.y ) / pointerPosFollowSpeed;

    const px = pointerPosFollow.x;
    const py = pointerPosFollow.y;

    //---
    
    for ( let i = 0, l = wirePointsX.length; i < l; i++ ) {

        if ( wirePointsFlag[ i ] & WIRE_POINT_PINNED ) continue;

        //---
        /* update wire mouse influence */
        const dx = px - wirePointsInitialX[ i ];
        const dy = py - wirePointsInitialY[ i ];

        const distanceSquared = dx * dx + dy * dy;

        if ( distanceSquared <= mouseDistanceThresholdSquared && distanceSquared > 0.0001 ) {

            const distance = Math.sqrt( distanceSquared );
            const distanceInv = 1 / distance;

            const dirX = -dx * distanceInv;
            const dirY = -dy * distanceInv;

            const influence = 1 - distanceSquared / mouseDistanceThresholdSquared;
            const escapeLength = wirePointMouseDistanceSensitivity * influence;

            const targetPosX = wirePointsInitialX[ i ] + dirX * escapeLength;
            const targetPosY = wirePointsInitialY[ i ] + dirY * escapeLength;

            const moveX = ( targetPosX - wirePointsX[ i ] ) / wirePointFollowSpeed;
            const moveY = ( targetPosY - wirePointsY[ i ] ) / wirePointFollowSpeed;

            wirePointsX[ i ] += moveX;
            wirePointsY[ i ] += moveY;

            wirePointsOldX[ i ] += moveX * 0.95;
            wirePointsOldY[ i ] += moveY * 0.05;

        }

        const vx = ( wirePointsX[ i ] - wirePointsOldX[ i ] ) * wireFriction;
        const vy = ( wirePointsY[ i ] - wirePointsOldY[ i ] ) * wireFriction;

        wirePointsOldX[ i ] = wirePointsX[ i ];
        wirePointsOldY[ i ] = wirePointsY[ i ];

        wirePointsX[ i ] += vx;
        wirePointsY[ i ] += vy + wireGravity;


    }

    //---
    /* solve wire joints & constrain wire points */

    for ( let j = 0; j < wireIterations; j++ ) {

        /* solve wire joints */
        for ( let i = 0, l = wireJointsPointA.length; i < l; i++ ) {

            const pointAIndex = wireJointsPointA[ i ];
            const pointBIndex = wireJointsPointB[ i ];

            const dx = wirePointsX[ pointBIndex ] - wirePointsX[ pointAIndex ];
            const dy = wirePointsY[ pointBIndex ] - wirePointsY[ pointAIndex ];

            const distanceSquared = dx * dx + dy * dy;

            if ( distanceSquared === 0 ) continue;

            let distance = 0;

            if ( dx === 0 ) {

                distance = Math.abs( dy ); // special optimization case

            } else {

                distance = Math.sqrt( distanceSquared );

            }

            const difference = ( distance - wireJointsLength[ i ] ) / distance;

            const offsetX = dx * 0.5 * difference;
            const offsetY = dy * 0.5 * difference;

            const pointAFlags = wirePointsFlag[ pointAIndex ];
            const pointBFlags = wirePointsFlag[ pointBIndex ];

            const pointAIsLocked = !!( pointAFlags & WIRE_POINT_PINNED );
            const pointBIsLocked = !!( pointBFlags & WIRE_POINT_PINNED );

            if ( pointAIsLocked && pointBIsLocked ) {

                continue;

            } else if ( pointAIsLocked ) {

                wirePointsX[ pointBIndex ] -= dx * difference;
                wirePointsY[ pointBIndex ] -= dy * difference;

            } else if ( pointBIsLocked ) {

                wirePointsX[ pointAIndex ] += dx * difference;
                wirePointsY[ pointAIndex ] += dy * difference;

            } else {

                wirePointsX[ pointAIndex ] += offsetX;
                wirePointsY[ pointAIndex ] += offsetY;

                wirePointsX[ pointBIndex ] -= offsetX;
                wirePointsY[ pointBIndex ] -= offsetY;

            }

        }

    }

    //---
    /* draw triangles */

    if ( renderShadedTriangles === true || renderDebugTriangles === true || renderDebugDiagonalJoints === true || renderShadedCheckerboard === true || renderDebugQuads === true ) {

        let currentWireStripIndex = -1;

        let shade = 1;
        let colorR = curtainColorR;
        let colorG = curtainColorG;
        let colorB = curtainColorB;

        let checkerboardIteration = 0;

        for ( let i = 0, l = curtainTrianglesPointA.length; i < l; i++ ) {

            const a = curtainTrianglesPointA[ i ];
            const b = curtainTrianglesPointB[ i ];
            const c = curtainTrianglesPointC[ i ];

            const ax = wirePointsX[ a ];
            const ay = wirePointsY[ a ];

            const bx = wirePointsX[ b ];
            const by = wirePointsY[ b ];

            const cx = wirePointsX[ c ];
            const cy = wirePointsY[ c ];

            //---

            if ( renderShadedTriangles === true ) {

                const wireStripIndex = ( i / curtainTrianglesPerWireStrip ) | 0;

                if ( wireStripIndex !== currentWireStripIndex ) {

                    currentWireStripIndex = wireStripIndex;

                    shade = curtainStripShade[ wireStripIndex ];

                    colorR = ( curtainColorR * shade ) | 0;
                    colorG = ( curtainColorG * shade ) | 0;
                    colorB = ( curtainColorB * shade ) | 0;

                }

                //---

                drawTriangleFast( ax, ay, bx, by, cx, cy, colorR, colorG, colorB, 255 );

            }

            //---

            if ( renderShadedCheckerboard === true ) {

                if ( ( i % 4 ) < 2 ) {

                    const wireStripIndex = ( i / curtainTrianglesPerWireStrip ) | 0;

                    if ( wireStripIndex !== currentWireStripIndex ) {

                        currentWireStripIndex = wireStripIndex;

                        shade = curtainStripShade[ wireStripIndex ];

                        colorR = ( curtainColorR * shade ) | 0;
                        colorG = ( curtainColorG * shade ) | 0;
                        colorB = ( curtainColorB * shade ) | 0;

                    }

                    //---

                    drawTriangleFast( ax, ay, bx, by, cx, cy, colorR, colorG, colorB, 255 );

                }

            }

            //---

            if ( renderDebugTriangles === true ) {

                // draw only second triangle to save on performance
                if ( i % 2 !== 0 ) {

                    drawLineFast( ax, ay, bx, by, wireJointColorR, wireJointColorG, wireJointColorB, 255 );
                    drawLineFast( bx, by, cx, cy, wireJointColorR, wireJointColorG, wireJointColorB, 255 );
                    drawLineFast( cx, cy, ax, ay, wireJointColorR, wireJointColorG, wireJointColorB, 255 );

                } 

            }

            //---

            if ( renderDebugDiagonalJoints === true ) {

                // draw only second line to save on performance
                if ( i % 2 !== 0 ) {

                    drawLineFast( ax, ay, bx, by, wireJointColorR, wireJointColorG, wireJointColorB, 255 );

                } 

            }

            //---

            if ( renderDebugQuads === true ) {

                // draw only second quad to save on performance
                if ( i % 2 !== 0 ) {

                    drawLineFast( bx, by, cx, cy, wireJointColorR, wireJointColorG, wireJointColorB, 255 );
                    drawLineFast( cx, cy, ax, ay, wireJointColorR, wireJointColorG, wireJointColorB, 255 );

                } 

            }

        }

    }

    //---
    /* draw joints */

    if ( renderDebugJoints === true || renderShadedJoints === true ) {

        let currentWireStripIndex = -1;

        let shade = 1;
        let colorR = curtainColorR;
        let colorG = curtainColorG;
        let colorB = curtainColorB;

        for ( let i = 0, l = wireJointsPointA.length; i < l; i++ ) {

            const wireStripIndex = ( i / curtainTrianglesPerWireStrip ) | 0;

            if ( wireStripIndex !== currentWireStripIndex ) {

                currentWireStripIndex = wireStripIndex;

                shade = curtainStripShade[ wireStripIndex ];

                colorR = ( curtainColorR * shade ) | 0;
                colorG = ( curtainColorG * shade ) | 0;
                colorB = ( curtainColorB * shade ) | 0;

            }

            //---

            const pointAIndex = wireJointsPointA[ i ];
            const pointBIndex = wireJointsPointB[ i ];

            const pointAX = wirePointsX[ pointAIndex ] | 0;
            const pointAY = wirePointsY[ pointAIndex ] | 0;
            const pointBX = wirePointsX[ pointBIndex ] | 0;
            const pointBY = wirePointsY[ pointBIndex ] | 0;

            //---

            if ( renderShadedJoints === true ) {

                drawLineFast(
                    pointAX,
                    pointAY,
                    pointBX,
                    pointBY,
                    colorR,
                    colorG,
                    colorB,
                    255
                );

            } else {

                drawLineFast(
                    pointAX,
                    pointAY,
                    pointBX,
                    pointBY,
                    wireJointColorR,
                    wireJointColorG,
                    wireJointColorB,
                    255
                );

            }

        }

    }

    //---
    /* draw points */

    if ( renderDebugPoints === true || renderDebugCircles === true ) {

        for ( let i = 0, l = wirePointsX.length; i < l; i++ ) {

            const pointX = wirePointsX[ i ] | 0;
            const pointY = wirePointsY[ i ] | 0;

            if ( renderDebugPoints === true ) {

                drawCircleFast(
                    pointX,
                    pointY,
                    1,
                    wirePointColorR,
                    wirePointColorG,
                    wirePointColorB,
                    255
                );

            }

            if ( renderDebugCircles === true ) {

                drawCircleFastOutline(
                    pointX,
                    pointY,
                    9,
                    wirePointColorR,
                    wirePointColorG,
                    wirePointColorB,
                    255
                );

            }

        }

    }

}

//---

function setClearImageData( r = 0, g = 0, b = 0, a = 255 ) {

    clearColor32 = ( a << 24 ) | ( b << 16 ) | ( g << 8 ) | r;

}

function clearImageData() {

    imageDataBufferUint32.fill( clearColor32 );

}

//---



//---

function render( timestamp ) {

    clearImageData();

    //---

    draw();

    //---

    context.putImageData( imageData, 0, 0 );
    
    //---

    stats.update();

    //---

    animationFrame = requestAnimFrame( render );

}

//---

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

function initGUI() {

    const updateWireCount = ( v ) => {

        wireCount = v;

        initWires();

    };

    const updateWireJoints = ( v ) => {

        wireJoints = v;

        initWires();

    };

    const updateWireIterations = ( v ) => {

        wireIterations = v;

    };

    const updateWireGravity = ( v ) => {

        wireGravity = v;

    };

    const updateWireFriction = ( v ) => {

        wireFriction = v;

    };

    const updateWireFollowSpeed = ( v ) => {

        wirePointFollowSpeed = v;

    };

    const updateWireDistanceSensitivityMin = ( v ) => {

        wirePointMouseDistanceSensitivityMin = v;

    };

    const updateWireDistanceSensitivityMax = ( v ) => {

        wirePointMouseDistanceSensitivityMax = v;

    };

    const updateDraw = ( property ) => {

        const state = guiSetting[ property ];

        // console.log( property, state );

        switch ( property ) {

            case 'debug joints':
                renderDebugJoints = state;
                if (state === true) {

                    updateGUIArray( gui, [ 'debug triangles', 'debug quads', 'shaded joints' ], false );

                }
                break;
            case 'debug points':
                renderDebugPoints = state;
                break;
            case 'debug circles':
                renderDebugCircles = state;
                break;
            case 'debug triangles':
                renderDebugTriangles = state;
                if (state === true) {

                    updateGUIArray( gui, [ 'debug joints', 'debug diagonal joints', 'debug quads', 'shaded joints', 'shaded triangles' ], false );

                }
                break;
            case 'debug diagonal joints':
                renderDebugDiagonalJoints = state;
                if (state === true) {

                    updateGUIArray( gui, [ 'debug joints', 'debug quads', 'debug triangles', 'shaded joints', 'shaded triangles' ], false );

                }
                break;
            case 'debug quads':
                renderDebugQuads = state;
                if (state === true) {

                    updateGUIArray( gui, [ 'debug joints', 'debug triangles', 'shaded joints', 'shaded triangles', 'shaded checkerboard' ], false );

                }
                break;
            case 'shaded joints':
                renderShadedJoints = state;
                if (state === true) {

                    updateGUIArray( gui, [ 'debug joints', 'debug triangles', 'debug diagonal joints', 'debug quads', 'shaded triangles', 'shaded checkerboard' ], false );

                }
                break;
            case 'shaded triangles':
                renderShadedTriangles = state;
                if (state === true) {

                    updateGUIArray( gui, [ 'debug joints', 'debug points', 'debug circles', 'debug triangles', 'debug diagonal joints', 'debug quads', 'shaded joints', 'shaded checkerboard' ], false );

                }
                break;
            case 'shaded checkerboard':
                renderShadedCheckerboard = state;
                if (state === true) {

                    updateGUIArray( gui, [ 'debug joints', 'debug points', 'debug circles', 'debug triangles', 'debug diagonal joints', 'debug quads', 'shaded joints', 'shaded triangles' ], false );
                
                }
                break;

        }

    };

    const updateColor = ( property ) => {

        const color = guiSetting[ property ];

        const r = Math.floor( color[ 0 ] );
        const g = Math.floor( color[ 1 ] );
        const b = Math.floor( color[ 2 ] );

        switch ( property ) {

            case 'color base':
                curtainColorR = r;
                curtainColorG = g;
                curtainColorB = b;
                initCurtainStripShading( wireCount );
                break;
            case 'color background':
                colorBackgroundR = r;
                colorBackgroundG = g;
                colorBackgroundB = b;
                setClearImageData( colorBackgroundR, colorBackgroundG, colorBackgroundB );
                break;
            case 'color debug 1':
                wireJointColorR = r;
                wireJointColorG = g;
                wireJointColorB = b;

                break;
            case 'color debug 2':
                wirePointColorR = r;
                wirePointColorG = g;
                wirePointColorB = b;

                break;

        }

    };

    const updateLight = ( property ) => {

        const state = guiSetting[ property ];

        switch ( property ) {

            case 'light direction x':
                lightX = state;
                break;
            case 'light direction y':
                lightY = state;
                break;
            case 'light direction z':
                lightZ = state;
                break;
            case 'light ambient':
                lightAmbient = state;
                lightDiffuse = 1 - state;
                refreshGUI( gui, guiSetting, 'light diffuse', lightDiffuse );
                break;
            case 'light diffuse':
                lightDiffuse = state;
                lightAmbient = 1 - state;
                refreshGUI( gui, guiSetting, 'light ambient', lightAmbient );
                break;
            case 'light fold frequency':
                curtainLightWavePrimaryFrequency = state;
                initWires();
                break;
            case 'light fold amplitude':
                curtainLightWavePrimaryAmplitude = state;
                initWires();
                break;
            case 'light detail frequency':
                curtainLightWaveSecondaryFrequency = state;
                initWires();
                break;
            case 'light detail amplitude':
                curtainLightWaveSecondaryAmplitude = state;
                initWires();
                break;

        }

        initCurtainStripShading( wireCount );

    };

    const updateStats = ( v ) => {

        statsShow = v;

        if ( statsShow === true ) {

            stats.domElement.style.display = 'block';
            stats.domElement.style.pointerEvents = 'initial';

        } else {

            stats.domElement.style.display = 'none';
            stats.domElement.style.pointerEvents = 'none';

        }

    }

    const updateAutoAnimation = ( v ) => {

        introEnabled = v;

        stopIntro();

        if ( introEnabled === true ) {

            playIntro();

        }

    };

    const linkTo = () => {
        
        window.open( 'https://x.com/niklaswebdev', '_parent' );

    };

    //---

    const guiSetting = {

        'wire count': wireCount,
        'wire joints': wireJoints,
        'wire iterations': wireIterations,

        'wire gravity': wireGravity,
        'wire friction': wireFriction,

        'wire follow speed': wirePointFollowSpeed,

        'wire dist sens min': wirePointMouseDistanceSensitivityMin,
        'wire dist sens max': wirePointMouseDistanceSensitivityMax,

        'debug joints': renderDebugJoints,
        'debug points': renderDebugPoints,
        'debug circles': renderDebugCircles,
        'debug triangles': renderDebugTriangles,
        'debug diagonal joints': renderDebugDiagonalJoints,
        'debug quads': renderDebugQuads,

        'shaded joints': renderShadedJoints,
        'shaded triangles': renderShadedTriangles,
        'shaded checkerboard': renderShadedCheckerboard,

        'light direction x': lightX,
        'light direction y': lightY,
        'light direction z': lightZ,

        'light ambient': lightAmbient,
        'light diffuse': lightDiffuse,

        'light fold frequency': curtainLightWavePrimaryFrequency,
        'light fold amplitude': curtainLightWavePrimaryAmplitude,
        'light detail frequency': curtainLightWaveSecondaryFrequency,
        'light detail amplitude': curtainLightWaveSecondaryAmplitude,

        'color base': [ curtainColorR, curtainColorG, curtainColorB ],
        'color background': [ colorBackgroundR, colorBackgroundG, colorBackgroundB ],

        'animation Enabled': introEnabled,

        'color debug 1': [ wireJointColorR, wireJointColorG, wireJointColorB ],
        'color debug 2': [ wirePointColorR, wirePointColorG, wirePointColorB ],
        
        'show stats': statsShow,

        '@niklaswebdev': linkTo,

    };

    //---

    gui = new dat.GUI();

    const guiFolderWires = gui.addFolder( 'wires' );

    guiFolderWires.add( guiSetting, 'wire count' ).name( 'count' ).min( 32 ).max( 2048 ).step( 1 ).onChange( updateWireCount );
    guiFolderWires.add( guiSetting, 'wire joints' ).name( 'joints' ).min( 16 ).max( 128 ).step( 1 ).onChange( updateWireJoints );
    guiFolderWires.add( guiSetting, 'wire iterations' ).name( 'iterations' ).min( 1 ).max( 32 ).step( 1 ).onChange( updateWireIterations );
    
    guiFolderWires.add( guiSetting, 'wire gravity' ).name( 'gravity' ).min( 0.01 ).max( 0.99 ).step( 0.01 ).onChange( updateWireGravity );
    guiFolderWires.add( guiSetting, 'wire friction' ).name( 'friction' ).min( 0.01 ).max( 0.99 ).step( 0.01 ).onChange( updateWireFriction );

    const guiSubFolderWiresInteraction = guiFolderWires.addFolder( 'interaction' );

    guiSubFolderWiresInteraction.add( guiSetting, 'wire follow speed' ).name( 'follow speed' ).min( 1 ).max( 64 ).step( 1 ).onChange( updateWireFollowSpeed );
    guiSubFolderWiresInteraction.add( guiSetting, 'wire dist sens min' ).name( 'follow sensitivity min' ).min( 100 ).max( 256 ).step( 2 ).onChange( updateWireDistanceSensitivityMin );
    guiSubFolderWiresInteraction.add( guiSetting, 'wire dist sens max' ).name( 'follow sensitivity max' ).min( 300 ).max( 512 ).step( 2 ).onChange( updateWireDistanceSensitivityMax );

    const guiFolderRendering = gui.addFolder( 'rendering' );
    const guiSubFolderRenderingDebug = guiFolderRendering.addFolder( 'debug' );
    
    guiSubFolderRenderingDebug.add( guiSetting, 'debug joints' ).name( 'joints' ).onChange( updateDraw.bind( this, 'debug joints' ) );
    guiSubFolderRenderingDebug.add( guiSetting, 'debug points' ).name( 'points' ).onChange( updateDraw.bind( this, 'debug points' ) );
    guiSubFolderRenderingDebug.add( guiSetting, 'debug circles' ).name( 'circles' ).onChange( updateDraw.bind( this, 'debug circles' ) );
    guiSubFolderRenderingDebug.add( guiSetting, 'debug triangles' ).name( 'triangles' ).onChange( updateDraw.bind( this, 'debug triangles' ) );
    guiSubFolderRenderingDebug.add( guiSetting, 'debug diagonal joints' ).name( 'diagonal joints' ).onChange( updateDraw.bind( this, 'debug diagonal joints' ) );
    guiSubFolderRenderingDebug.add( guiSetting, 'debug quads' ).name( 'quads' ).onChange( updateDraw.bind( this, 'debug quads' ) );

    const guiSubFolderRenderingShaded = guiFolderRendering.addFolder( 'shaded' );

    guiSubFolderRenderingShaded.add( guiSetting, 'shaded joints' ).name( 'joints' ).onChange( updateDraw.bind( this, 'shaded joints' ) );
    guiSubFolderRenderingShaded.add( guiSetting, 'shaded triangles' ).name( 'triangles' ).onChange( updateDraw.bind( this, 'shaded triangles' ) );
    guiSubFolderRenderingShaded.add( guiSetting, 'shaded checkerboard' ).name( 'checkerboard' ).onChange( updateDraw.bind( this, 'shaded checkerboard' ) );

    const guiFolderLighting = gui.addFolder( 'lighting' );
    const guiSubFolderLightingDirection = guiFolderLighting.addFolder( 'direction' );

    guiSubFolderLightingDirection.add( guiSetting, 'light direction x' ).name( 'x' ).min( -1 ).max( 1 ).step( 0.1 ).onChange( updateLight.bind( this, 'light direction x' ) );
    guiSubFolderLightingDirection.add( guiSetting, 'light direction y' ).name( 'y' ).min( -1 ).max( 1 ).step( 0.1 ).onChange( updateLight.bind( this, 'light direction y' ) );
    guiSubFolderLightingDirection.add( guiSetting, 'light direction z' ).name( 'z' ).min( -1 ).max( 1 ).step( 0.1 ).onChange( updateLight.bind( this, 'light direction z' ) );

    const guiSubFolderLightingIntensity = guiFolderLighting.addFolder( 'intensity' );

    guiSubFolderLightingIntensity.add( guiSetting, 'light ambient' ).name( 'ambient' ).min( 0 ).max( 1 ).step( 0.01 ).onChange( updateLight.bind( this, 'light ambient' ) );
    guiSubFolderLightingIntensity.add( guiSetting, 'light diffuse' ).name( 'diffuse' ).min( 0 ).max( 1 ).step( 0.01 ).onChange( updateLight.bind( this, 'light diffuse' ) );

    const guiSubFolderLightingSurface = guiFolderLighting.addFolder( 'surface' );

    guiSubFolderLightingSurface.add( guiSetting, 'light fold frequency' ).name( 'fold frequency' ).min( 0 ).max( 2 ).step( 0.01 ).onChange( updateLight.bind( this, 'light fold frequency' ) );
    guiSubFolderLightingSurface.add( guiSetting, 'light fold amplitude' ).name( 'fold amplitude' ).min( 0 ).max( 20 ).step( 0.1 ).onChange( updateLight.bind( this, 'light fold amplitude' ) );
    guiSubFolderLightingSurface.add( guiSetting, 'light detail frequency' ).name( 'detail frequency' ).min( 0 ).max( 4 ).step( 0.01 ).onChange( updateLight.bind( this, 'light detail frequency' ) );
    guiSubFolderLightingSurface.add( guiSetting, 'light detail amplitude' ).name( 'detail amplitude' ).min( 0 ).max( 20 ).step( 0.1 ).onChange( updateLight.bind( this, 'light detail amplitude' ) );

    const guiFolderColors = gui.addFolder( 'colors' );

    guiFolderColors.addColor( guiSetting, 'color base' ).name( 'base' ).onChange( updateColor.bind( this, 'color base' ) );
    guiFolderColors.addColor( guiSetting, 'color background' ).name( 'background' ).onChange( updateColor.bind( this, 'color background' ) );

    const guiFolderAnimation = gui.addFolder( 'animation' );

    guiFolderAnimation.add( guiSetting, 'animation Enabled' ).name( 'enabled' ).onChange( updateAutoAnimation );

    const guiFolderDebugging = gui.addFolder( 'debugging' );
    const guiSubFolderDebuggingColors = guiFolderDebugging.addFolder( 'colors' );

    guiSubFolderDebuggingColors.addColor( guiSetting, 'color debug 1' ).name( 'primary' ).onChange( updateColor.bind( this, 'color debug 1' ) );
    guiSubFolderDebuggingColors.addColor( guiSetting, 'color debug 2' ).name( 'secondary' ).onChange( updateColor.bind( this, 'color debug 2' ) );

    guiFolderDebugging.add( guiSetting, 'show stats' ).onChange( updateStats );

    //---

    guiFolderWires.open();
    guiSubFolderWiresInteraction.close();
    guiFolderRendering.open();
    guiSubFolderRenderingDebug.close();
    guiSubFolderRenderingShaded.open();
    guiFolderLighting.close();
    guiSubFolderLightingDirection.open();
    guiSubFolderLightingIntensity.open();
    guiSubFolderLightingSurface.open();
    guiFolderColors.close();
    guiFolderAnimation.close();
    guiFolderDebugging.close();
    guiSubFolderDebuggingColors.close();

    //---

    gui.add( guiSetting, '@niklaswebdev' );
    gui.close();

    gui.width = 300;

}

//---

function updateGUIArray( gui, properties, value ) {

    properties.forEach( property => updateGUI( gui, property, value ) );

}

function updateGUI( gui, property, value ) {

    for ( let i in gui.__controllers ) {

        if ( gui.__controllers[ i ].property === property ) {

            gui.__controllers[ i ].setValue( value );

        }

    }

    for ( let f in gui.__folders ) {

        updateGUI( gui.__folders[ f ], property, value );

    }

}

//---

function refreshGUIArray( gui, guiSetting, properties, value ) {

    properties.forEach( property => refreshGUI( gui, guiSetting, property, value ) );

}

function refreshGUI( gui, guiSetting, property, value ) {

    if ( value ) {

        guiSetting[ property ] = value;

    }

    for ( let i in gui.__controllers ) {

        if ( gui.__controllers[ i ].property === property ) {

            gui.__controllers[ i ].updateDisplay();

        }

    }

    for ( let f in gui.__folders ) {

        refreshGUI( gui.__folders[ f ], guiSetting, property, null );

    }

}

//---

document.addEventListener( 'DOMContentLoaded', () => {

    init();
    initGUI();

} );