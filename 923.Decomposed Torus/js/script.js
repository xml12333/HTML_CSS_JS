// https://discourse.threejs.org/t/how-to-displace-and-color-a-hovered-triangle-and-its-neighbours-of-a-mesh/83816

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


// general setup, boring, skip to the next comment

console.clear( );

var scene = new THREE.Scene();
    scene.background = new THREE.Color( 'gainsboro' );

var camera = new THREE.PerspectiveCamera( 30, innerWidth/innerHeight );
    camera.position.set( 0, 0, 10 );
    camera.lookAt( scene.position );

var renderer = new THREE.WebGLRenderer( {antialias: true} );
    renderer.setSize( innerWidth, innerHeight );
    renderer.setAnimationLoop( animationLoop );
    document.body.appendChild( renderer.domElement );
			
window.addEventListener( "resize", (event) => {
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix( );
    renderer.setSize( innerWidth, innerHeight );
});

var controls = new OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true;

var light = new THREE.DirectionalLight( 'white', 1.5 );
    scene.add( light );


// next comment


// non-indexed geometry of torus
var geo = new THREE.TorusGeometry( 2, 0.5, 6, 16 ).toNonIndexed();

// the torus mesh
var object = new THREE.Mesh(
			geo,
    	new THREE.MeshPhongMaterial( {
					color: 'royalblue',
					shininess: 510,
					flatShading: true,
					side: THREE.DoubleSide,
					vertexColors: true,
					transparent: true
			} )
    );	
		scene.add( object );

// get the position attribute and make 
// a copy into ori (to store original values)
var pos = geo.getAttribute( 'position' );
var ori = pos.clone();

// add color attribute for vertices
// but will late use only the alpha
var colors = [];
for( var i=0; i<pos.count; i++ )
{
		colors.push( 0.3, 1, 0.5, 1 );
}

geo.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 4 ));

// get normals and vertex colors
var nor = geo.getAttribute( 'normal' );
var col = geo.getAttribute( 'color' );

// dummy variables
var n = new THREE.Vector3();
var v = new THREE.Vector3();

// explode a single plate by its index
// distance is from 0 to 1,
// transparency is set based on distance
function explodePlate( idx, distance )
{
		n.fromBufferAttribute( nor, 6*idx );
		for( var i=0; i<6; i++ )
		{
				v.fromBufferAttribute( ori, 6*idx+i );
				v.addScaledVector( n, distance );
				pos.setXYZ( 6*idx+i, ...v ); 
				col.setW( 6*idx+i, 1-4*distance ); 
		}
}


function animationLoop( t )
{
		object.rotation.set( t/3000, t/2000, 0 );
	
		for( var i=0; i<pos.count/6; i++ )
		{
				explodePlate( i, (Math.sin(t/200+i*i)/2+1/2)/5 );
		}
	
		pos.needsUpdate = true;
		col.needsUpdate = true;

    controls.update( );
		light.position.copy( camera.position );
    renderer.render( scene, camera );
}