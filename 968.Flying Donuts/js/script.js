'use strict';

//---

console.clear();

//---

const DEBUG = false;

const MATH_PI = Math.PI;
const MATH_PI180 = MATH_PI / 180;
const MATH_PI2 = MATH_PI * 2;

let stats = null;

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

let depthBuffer = null;
let depthWidth = 0;
let depthHeight = 0;

const center = { x: w * 0.5, y: h * 0.5 };
const border = { left: 1, top: 1, right: w, bottom: h };

let borderTop = 0;
let borderBottom = 0;
let borderLeft = 0;
let borderRight = 0;

let pointerPos = { x: center.x, y: center.y };
let pointerDownButton = -1;
let pointerActive = false;

//---

const rotationSpeed = -1.00;
const rotationSpeedFactor = { x: rotationSpeed / center.x, y: rotationSpeed / center.y };

const fov = 500;

let torusSceneObjectsHolder = [];
let torusSpeed = 10;
const torusSpeedMin = torusSpeed;
const torusSpeedMax = 120;
let torusRotation = 0;
let torusRotationSpeed = 0.25;
const torusRotationSpeedMin = torusRotationSpeed;
const torusRotationSpeedMax = torusRotationSpeed * 4;

const torusCount = 512;
const torusDiameter = 104;
const torusMaxZ = -fov + torusDiameter;
const torusDistance = 8000;

const torusGlazeColors = [ { r: 255, g: 143, b: 188 }, { r: 254, g: 223, b: 9 }, { r: 126, g: 55, b: 73 }, { r: 254, g: 254, b: 254 }, { r: 0, g: 194, b: 215 }, { r: 103, g: 194, b: 46 }, { r: 247, g: 0, b: 45 } ];
const torusDoughColors = [ { r: 251, g: 171, b: 24 }/*, { r: 204, g: 144, b: 108 }*/ ];
const torusMaxRadialSegments = 12;
const torusMaxTubularSegments = 20;
const torusQualityReductionFactor = 1.3;
const torusQualityLevels = 5;
const torusModelMappings = [

    { percent: 0.00, index: 0 },
    { percent: 0.34, index: 1 },
    { percent: 0.54, index: 2 },
    { percent: 0.74, index: 3 },
    { percent: 0.84, index: 4 },

];

const torusModelIndexGet = ( distancePercent ) => {

    for ( let i = torusModelMappings.length - 1; i >= 0; i-- ) {

        if ( distancePercent >= torusModelMappings[ i ].percent ) {

            return torusModelMappings[ i ].index;

        }

    }

    return 0;

};

const lightRotationSpeed = -2.00;
const lightRotationSpeedFactor = { x: 0, y: 0 };
const lightBrightness = 1;

const lightVector = { x: 0, y: 0, z: -fov * 0.5 };
const cameraVector = { x: 0, y: 0, z: -fov };

//---
// for new clearImageData function

let clearPixelData = null;
let clearRowSize = 0;
let clearRow = null;

let bgColorR = 254;
let bgColorG = 217;
let bgColorB = 15;

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

    depthWidth  = w;
    depthHeight = h;
    depthBuffer = new Float32Array( depthWidth * depthHeight );
    depthBuffer.fill( Infinity );

    borderTop = 0;
    borderBottom = imageData.height;
    borderLeft = 0;
    borderRight = imageData.width;

    //---

    setClearImageData();

    //---
    
    center.x = w * 0.5;
    center.y = h * 0.5;
    
    pointerPos.x = 0;
    pointerPos.y = 0;
    
    border.right = w;
    border.bottom = h;

    lightRotationSpeedFactor.x = lightRotationSpeed / center.x;
    lightRotationSpeedFactor.y = lightRotationSpeed / center.y;

    //---

    removeSceneObjects();

    addTori();

    addLight( lightVector.x, lightVector.y, lightVector.z );
    normalizeLight();

    //---
    
    if ( animationFrame != null ) {
    
        cancelAnimFrame( animationFrame );
    
    }
    
    render();

}

//---

function removeSceneObjects() {

    torusSceneObjectsHolder = [];

}

//---

function addTori() {

    const l = torusCount;

    for ( let i = 0; i < l; i++ ) {

        const radiusX = Math.random() * 2200 + 200;
        const radiusY = Math.random() * 2200 + 200;

        const numOfItems = Math.ceil( Math.random() * l );

        const x = radiusX * Math.cos( i * ( MATH_PI2 / numOfItems ) );
        const y = radiusY * Math.sin( i * ( MATH_PI2 / numOfItems ) );
        const z = Math.round( Math.random() * torusDistance );

        const torus = addTorus( x, y, z, torusDiameter * 0.5, torusDiameter * 0.25, torusMaxRadialSegments, torusMaxTubularSegments, MATH_PI2, torusQualityLevels );

        torus.distance = torusDistance - z;

        torusSceneObjectsHolder.push( torus );

    }

}

function addTorus( x, y, z, radius = 1, tube = 0.4, radialSegments = 12, tubularSegments = 48, arc = MATH_PI2, qualiltyLevels = 4 ) {

    const torus = {};

    torus.type = 'torus';

    torus.x = x;
    torus.y = y;
    torus.z = z;
    torus.radius = radius;
    torus.tube = tube;
    torus.radialSegments = radialSegments;
    torus.tubularSegments = tubularSegments;
    torus.arc = arc;

    torus.ox = x;
    torus.oy = y;

    torus.rotationXSpeed = Math.random() + 0.25;
    torus.rotationYSpeed = Math.random() + 0.25;

    torus.rotationXDir = Math.random() < 0.5 ? -1 : 1;
    torus.rotationYDir = Math.random() < 0.5 ? -1 : 1;

    torus.rotationX = Math.random() * 1000;
    torus.rotationY = Math.random() * 1000;

    torus.distance = 0;
    torus.distanceTotal = Math.round( torusDistance - torusMaxZ );

    torus.colorDough = torusDoughColors[ Math.floor( Math.random() * torusDoughColors.length ) ];
    torus.colorGlaze = torusGlazeColors[ Math.floor( Math.random() * torusGlazeColors.length ) ];

    const { vertices, faces } = createTorus( radius, tube, radialSegments, tubularSegments, arc );

    torus.vertices = vertices;
    torus.faces = faces;

    torus.models = [];

    for ( let i = 0; i < qualiltyLevels - 0; i++ ) {

        const rSegments = Math.floor( radialSegments / Math.pow( torusQualityReductionFactor, qualiltyLevels - 1 - i ) );
        const tSegments = Math.floor( tubularSegments / Math.pow( torusQualityReductionFactor, qualiltyLevels - 1 - i ) );

        torus.models.push( createTorus( radius, tube, rSegments, tSegments, arc ) );

    }

    return torus;

}

function createTorus( radius = 1, tube = 0.4, radialSegments = 12, tubularSegments = 48, arc = MATH_PI2 ) {

    const vertices = [];
    const faces = [];

    const test = radialSegments * 0.5;

    for ( let j = 0; j <= radialSegments; j++ ) {

        for ( let i = 0; i <= tubularSegments; i++ ) {

            const u = i / tubularSegments * arc;
            const v = j / radialSegments * MATH_PI2;

            //---

            const vertex = {};

            vertex.x = ( radius + tube * Math.cos( v ) ) * Math.cos( u );
            vertex.y = ( radius + tube * Math.cos( v ) ) * Math.sin( u );
            vertex.z = tube * Math.sin( v );

            vertex.ox = vertex.x;
            vertex.oy = vertex.y;
            vertex.oz = vertex.z;

            vertices.push( vertex );

        }

    }

    for ( let j = 1; j <= radialSegments; j++ ) {

        for ( let i = 1; i <= tubularSegments; i++ ) {

            const a = ( tubularSegments + 1 ) * j + i - 1;
            const b = ( tubularSegments + 1 ) * ( j - 1 ) + i - 1;
            const c = ( tubularSegments + 1 ) * ( j - 1 ) + i;
            const d = ( tubularSegments + 1 ) * j + i;

            faces.push( [

                vertices[ a ],
                vertices[ b ],
                vertices[ d ],
                faces.length,

            ] );
            
            faces.push( [

                vertices[ b ],
                vertices[ c ],
                vertices[ d ],
                faces.length,

            ] );

        }

    }

    return { vertices, faces };

}

//---

function addLight( x, y, z, radius = 100 ) {

    const light = {};

    light.type = 'light';
    light.x = x;
    light.y = y;
    light.z = z;
    light.radius = radius;

    torusSceneObjectsHolder.push( light );

}

function normalizeLight() {

    const lx = lightVector.x, ly = lightVector.y, lz = lightVector.z;
    const lm = Math.sqrt( lx * lx + ly * ly + lz * lz ) || 1;

    lightVector.x = lx / lm;
    lightVector.y = ly / lm;
    lightVector.z = lz / lm;

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

function setPixel( x, y, r, g, b, a ) {

    const i = ( x + y * imageDataWidth ) * 4;

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

function drawTriangleFast( p0X, p0Y, p0Z, p1X, p1Y, p1Z, p2X, p2Y, p2Z, r, g, b, a ) {

    let minX = Math.max( borderLeft,   Math.floor( Math.min( p0X, p1X, p2X ) ) ) | 0;
    let minY = Math.max( borderTop,    Math.floor( Math.min( p0Y, p1Y, p2Y ) ) ) | 0;
    let maxX = Math.min( borderRight,  Math.ceil ( Math.max( p0X, p1X, p2X ) ) ) | 0;
    let maxY = Math.min( borderBottom, Math.ceil ( Math.max( p0Y, p1Y, p2Y ) ) ) | 0;

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

    const denom0 = A0 * p0X + B0 * p0Y + C0;
    const denom1 = A1 * p1X + B1 * p1Y + C1;
    const denom2 = A2 * p2X + B2 * p2Y + C2;

    if ( denom0 === 0 || denom1 === 0 || denom2 === 0 ) {

        return;

    }

    const z0c = p0Z / denom0;
    const z1c = p1Z / denom1;
    const z2c = p2Z / denom2;

    const dz_dx = dE0dx * z0c + dE1dx * z1c + dE2dx * z2c;
    const dz_dy = dE0dy * z0c + dE1dy * z1c + dE2dy * z2c;

    let z_row = E0_row * z0c + E1_row * z1c + E2_row * z2c;

    const color = ( a << 24 ) | ( b << 16 ) | ( g << 8 ) | r;

    const buf = imageDataBufferUint32;
    const zbuf = depthBuffer;
    const stride = imageDataWidth;

    for ( let y = minY; y < maxY; y++ ) {

        let E0 = E0_row;
        let E1 = E1_row; 
        let E2 = E2_row;

        let z = z_row;

        let ptr = y * stride + minX;

        for ( let x = minX; x < maxX; x++ ) {

            if ( E0 >= 0 && E1 >= 0 && E2 >= 0 ) {

                if ( z < zbuf[ ptr ] ) {

                    zbuf[ ptr ] = z;
                    buf[ ptr ]  = color;

                }

            }

            E0 += dE0dx; 
            E1 += dE1dx; 
            E2 += dE2dx; 
            
            z  += dz_dx;
            
            ptr++;

        }

        E0_row += dE0dy; 
        E1_row += dE1dy; 
        E2_row += dE2dy;

        z_row  += dz_dy;

    }

}

function drawTriangleOutline( p0X, p0Y, p1X, p1Y, p2X, p2Y, r, g, b, a ) {

    drawLine( p0X, p0Y, p1X, p1Y, r, g, b, a );
    drawLine( p1X, p1Y, p2X, p2Y, r, g, b, a );
    drawLine( p2X, p2Y, p0X, p0Y, r, g, b, a );

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

    let scale = 0;

    //---

    let cX = center.x;
    let cY = center.y;

    const camVecX = cameraVector.x;
    const camVecY = cameraVector.y;
    const camVecZ = cameraVector.z;

    const lightVecX = lightVector.x;
    const lightVecY = lightVector.y;
    const lightVecZ = lightVector.z;

    //---

    if ( pointerActive === true && pointerDownButton !== 1 ) {

        if ( pointerDownButton !== 2 ) {

            torusSpeed = Math.min( torusSpeed + 1, torusSpeedMax );

            //---

            torusRotationSpeed = Math.min( torusRotationSpeed + 0.005, torusRotationSpeedMax );

            //---
        
            cX += ( pointerPos.x - cX ) * 0.015;
            cY += ( pointerPos.y - cY ) * 0.015;

        } else {

            torusSpeed = Math.max( torusSpeed - 1, 0 );

            //---

            torusRotationSpeed = Math.max( torusRotationSpeed - 0.01, 0 );

            //---

            cX += ( ( w * 0.5 ) - cX ) * 0.025;
            cY += ( ( h * 0.5 ) - cY ) * 0.025;

        }

    } else {

        torusSpeed = Math.max( torusSpeed - 0.5, torusSpeedMin );

        //---

        torusRotationSpeed = Math.max( torusRotationSpeed - 0.0025, torusRotationSpeedMin );

        //---

        cX += ( ( w * 0.5 ) - cX ) * 0.015;
        cY += ( ( h * 0.5 ) - cY ) * 0.015;
        
    }

    if ( pointerDownButton === 0 ) {

        torusRotation += torusRotationSpeed;

    } else {

        torusRotation -= torusRotationSpeed;

    }

    //---

    torusSceneObjectsHolder = torusSceneObjectsHolder.sort( ( a, b ) => {

        return b.z - a.z;

    } );

    //---

    for ( let i = 0, l = torusSceneObjectsHolder.length; i < l; i++ ) {

        const sceneObject = torusSceneObjectsHolder[ i ];

        if ( sceneObject.type === 'torus' ) {

            const torus = sceneObject;

            //---
            //torus z position
            
            if ( pointerDownButton === 0 ) {

                torus.z += torusSpeed;
                torus.distance -= torusSpeed;

                if ( torus.z > torusDistance ) {

                    torus.z = torusMaxZ;
                    torus.distance = torusDistance;

                }

            } else {

                torus.z -= torusSpeed;
                torus.distance += torusSpeed;

                if ( torus.z < torusMaxZ ) {

                    torus.z = torusDistance;

                    torus.distance = 0;

                } 

            }

            //---
            // distance percent

            const distancePercent = Math.max( 0, Math.min( 1, torus.distance / torus.distanceTotal ) );
            const distancePercentColor = Math.min( distancePercent * 2, 1 );

            //---

            if ( distancePercent > 0 ) {

                //---
                // torus rotation around axis

                const radians = MATH_PI180 * torusRotation;

                const cos = Math.cos( radians );
                const sin = Math.sin( radians );

                torus.x = cos * torus.ox + sin * torus.oy;
                torus.y = cos * torus.oy - sin * torus.ox;

                //---
                // torus rotation

                if ( pointerDownButton === 0 ) {

                    torus.rotationX -= torus.rotationXSpeed * torus.rotationXDir;
                    torus.rotationY -= torus.rotationYSpeed * torus.rotationYDir;

                } else if ( pointerDownButton === 2 ) {

                    torus.rotationX = torus.rotationX;
                    torus.rotationY = torus.rotationY;

                } else {

                    torus.rotationX += torus.rotationXSpeed * torus.rotationXDir;
                    torus.rotationY += torus.rotationYSpeed * torus.rotationYDir;

                }

                const ax = torus.rotationX * MATH_PI180;
                const ay = torus.rotationY * MATH_PI180;

                const sinX = Math.sin( ax );
                const cosX = Math.cos( ax );
                const sinY = Math.sin( ay );
                const cosY = Math.cos( ay );

                //---
                // choose torus model

                const modelIndex = torusModelIndexGet( distancePercent );
                const model = torus.models[ modelIndex ];

                //---

                const torusX = torus.x;
                const torusY = torus.y;
                const torusZ = torus.z;

                //---

                for ( let j = 0, k = model.vertices.length; j < k; j++ ) {

                    const vertex = model.vertices[ j ];

                    const px = vertex.ox;
                    const py = vertex.oy;
                    const pz = vertex.oz;

                    const rx = px;                       
                    const rz = py * sinY + pz * cosY;

                    const normalx = rx * cosX + rz * sinX;
                    const normaly = py * cosY + pz * -sinY;
                    const normalz = rx * -sinX + rz * cosX;

                    vertex.x = normalx + torusX;
                    vertex.y = normaly + torusY;
                    vertex.z = normalz + torusZ;

                };

                //---

                for ( let j = 0, k = model.faces.length; j < k; j++ ) {

                    const face = model.faces[ j ];

                    //---

                    const vertex0 = face[ 0 ];
                    const vertex1 = face[ 1 ];
                    const vertex2 = face[ 2 ];

                    //---

                    const vertex0X = vertex0.x;
                    const vertex0Y = vertex0.y;
                    const vertex0Z = vertex0.z;
                    const vertex1X = vertex1.x;
                    const vertex1Y = vertex1.y;
                    const vertex1Z = vertex1.z;
                    const vertex2X = vertex2.x;
                    const vertex2Y = vertex2.y;
                    const vertex2Z = vertex2.z;

                    //---

                    const centerX = ( vertex0X + vertex1X + vertex2X ) / 3;
                    const centerY = ( vertex0Y + vertex1Y + vertex2Y ) / 3;
                    const centerZ = ( vertex0Z + vertex1Z + vertex2Z ) / 3;

                    //---

                    const ux = vertex1X - vertex0X;
                    const uy = vertex1Y - vertex0Y;
                    const uz = vertex1Z - vertex0Z;

                    const vx = vertex2X - vertex0X;
                    const vy = vertex2Y - vertex0Y;
                    const vz = vertex2Z - vertex0Z;

                    let normalX = uy * vz - uz * vy;
                    let normalY = uz * vx - ux * vz;
                    let normalZ = ux * vy - uy * vx;

                    const length = Math.sqrt( normalX * normalX + normalY * normalY + normalZ * normalZ );

                    normalX /= length;
                    normalY /= length;
                    normalZ /= length;

                    //---

                    const viewVectorX = centerX - camVecX;
                    const viewVectorY = centerY - camVecY;
                    const viewVectorZ = centerZ - camVecZ;

                    const dotProductView = normalX * viewVectorX + normalY * viewVectorY + normalZ * viewVectorZ;

                    if ( dotProductView < 0 ) {

                        //---
                        // calc color + light

                        let colorValueR = 0;
                        let colorValueG = 0;
                        let colorValueB = 0;

                        if ( distancePercentColor > 0.55 ) {

                            const ldot = Math.max( 0, normalX * lightVecX + normalY * lightVecY + normalZ * lightVecZ );
                            const lightFactor = ( 1 - ( 0.5 + 0.5 * ldot ) ) * lightBrightness;

                            //---

                            const torusFaceColor = vertex2.oz > 0 ? torus.colorGlaze : torus.colorDough;

                            const tFCR = torusFaceColor.r;
                            const tFCG = torusFaceColor.g;
                            const tFCB = torusFaceColor.b;

                            colorValueR = Math.abs( tFCR - ( tFCR * lightFactor ) | 0 );
                            colorValueG = Math.abs( tFCG - ( tFCG * lightFactor ) | 0 );
                            colorValueB = Math.abs( tFCB - ( tFCB * lightFactor ) | 0 );

                            colorValueR = Math.floor( ( bgColorR * ( 1 - distancePercentColor ) ) + ( colorValueR * distancePercentColor ) );
                            colorValueG = Math.floor( ( bgColorG * ( 1 - distancePercentColor ) ) + ( colorValueG * distancePercentColor ) );
                            colorValueB = Math.floor( ( bgColorB * ( 1 - distancePercentColor ) ) + ( colorValueB * distancePercentColor ) );

                        } else {


                            const torusFaceColor = vertex2.oz > 0 ? torus.colorGlaze : torus.colorDough;

                            colorValueR = Math.floor( ( bgColorR * ( 1 - distancePercentColor ) ) + ( torusFaceColor.r * distancePercentColor ) );
                            colorValueG = Math.floor( ( bgColorG * ( 1 - distancePercentColor ) ) + ( torusFaceColor.g * distancePercentColor ) );
                            colorValueB = Math.floor( ( bgColorB * ( 1 - distancePercentColor ) ) + ( torusFaceColor.b * distancePercentColor ) );

                        }

                        //---
                    
                        scale = fov / ( fov + vertex0Z );

                        const v0X2d = vertex0X * scale + cX;
                        const v0Y2d = vertex0Y * scale + cY;

                        scale = fov / ( fov + vertex1Z );

                        const v1X2d = vertex1X * scale + cX;
                        const v1Y2d = vertex1Y * scale + cY;

                        scale = fov / ( fov + vertex2Z );

                        const v2X2d = vertex2X * scale + cX;
                        const v2Y2d = vertex2Y * scale + cY;

                        //---

                        if ( DEBUG === true ) {

                            drawTriangleOutline( v1X2d | 0, v1Y2d | 0, v0X2d | 0, v0Y2d | 0, v2X2d | 0, v2Y2d | 0, 0, 0, 0, 255 );

                        } else {

                            drawTriangleFast( v1X2d, v1Y2d, vertex1Z, v0X2d, v0Y2d, vertex0Z, v2X2d, v2Y2d, vertex2Z, colorValueR, colorValueG, colorValueB, 255 );

                        }
                        
                    }

                }

            }

        }

        if ( sceneObject.type === 'light' ) {

            const light = sceneObject;

            //---

            if ( pointerDownButton === 2 ) {

                //---
                // calc light position

                const fx = lightRotationSpeedFactor.x * pointerPos.x - lightRotationSpeed;
                const fy = lightRotationSpeed - lightRotationSpeedFactor.y * pointerPos.y;

                const ax = fx * MATH_PI180;
                const ay = fy * MATH_PI180;

                const sinX = Math.sin( ax );
                const cosX = Math.cos( ax );
                const sinY = Math.sin( ay );
                const cosY = Math.cos( ay );

                const rx = light.x;
                const rz = light.y * sinY + light.z * cosY;

                light.x = rx * cosX + rz * sinX;
                light.y = light.y * cosY + light.z * -sinY;
                light.z = rx * -sinX + rz * cosX;

                //---
                // update lightVector position

                lightVector.x = light.x;
                lightVector.y = light.y;
                lightVector.z = light.z;

                normalizeLight();

                //---
                // draw light

                scale = fov / ( fov + light.z ); 

                const lightX2d = light.x * scale + w / 2;
                const lightY2d = light.y * scale + h / 2;

                const lightRadius = light.radius * scale;
                const lightRadius05 = lightRadius * 0.5;

                drawCircle( lightX2d | 0, lightY2d | 0, lightRadius05, 255, 255, 255, 255 );

            }

        }

    }

}

//---

function setClearImageData() {

    clearPixelData = [ bgColorR, bgColorG, bgColorB, 255 ];
    clearRowSize = w * 4;
    clearRow = new Uint8ClampedArray( clearRowSize );

    for ( let i = 0; i < clearRowSize; i += 4 ) {

        clearRow.set( clearPixelData, i );

    }

}

function clearImageData() {

    for ( let y = 0; y < h; y++ ) {

        data.set( clearRow, y * clearRowSize );

    }

}

//---

function render( timestamp ) {

    if ( pointerDownButton !== 1 ) {

        clearImageData();

    }

    //---

    depthBuffer.fill( Infinity );

    //---

    draw();

    //---

    context.putImageData( imageData, 0, 0 );
    
    //---

    stats.update();

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