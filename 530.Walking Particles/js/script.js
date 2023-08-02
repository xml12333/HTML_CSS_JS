// Reverse engineered from ( original at bottom)
// https://twitter.com/takawo/status/1166578237755011077

let vectors = [];
let amount = 8000;
let speed = 1;
let size = 10;

function setup() {
  createCanvas(windowWidth,windowHeight)
  background(10)
  
  stroke(200,200,200, 10)
  
  for ( var i = 0; i < amount; i++ ) {
    vectors.push(createVector(random(width),random(height)))
  }
}

function draw() {
  for ( vector of vectors) {
    let randomisation = noise(vector.x/99, vector.y/99) * TAU;
    
    vector.add(cos(randomisation),sin(randomisation))
    
    point(
      constrain(vector.x, 100, width-100),
      constrain(vector.y, 100, height-100)
    )
  }
}

// frame=0,
// particles=[],
// artboard=800
// function draw() {
  
//   if ( frame > 100 ) return;
    
//   if(frame==0){
//       createCanvas(artboard,artboard);
//       for(i=0;i<artboard*10;i++){
//           particles[i]=createVector(random(artboard),random(artboard))
//       }
//       background(20)
//     }
//     for(particle of particles){
//         particle.add(
//           cos(move=noise(particle.x/99,particle.y/99)*TAU),
//           sin(move)
//         )
//         stroke(artboard,frame)
//         point(
//           constrain( particle.x, d=artboard/10, e=artboard-d ),
//           constrain( particle.y, d, e )
//         )
//     }
//     frame++
// } 