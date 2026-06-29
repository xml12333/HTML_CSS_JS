//Day1 of RC (2nd batch)
//53:03min of stream of consciousness code line by line
//#wcchallenge waterfall
let theSpaceThatIsHeld;
let theDensityOfWhatIs;
let theWhole;
let amplitudes;
let elementsOfChange;
let theSymmetrishQuality;
function setup() {
  createCanvas(600, 600);
  whatIsThis();
  theSpaceThatIsHeld = random(width / 20, width / 10);
  theDensityOfWhatIs = int(random(200, 400));
  theWhole = [];
  amplitudes = random(width / 5, width / 3);
  elementsOfChange = [random(3, 10), random(3, 10), random(3, 10)];

  for (let i = 0; i < theDensityOfWhatIs; i++) {
    theWhole.push(new PartsOfTheWhole());
  }
  angleMode(DEGREES);
  theSymmetrishQuality = random([7, 8, 9, 10, 11, 12]);
}

function draw() {
  translate(width / 2, height / 2);
  rotate(-frameCount / 10);
  background(20, 70, 80, 10);
  for (let k = 0; k < theSymmetrishQuality; k++) {
    for (let i = 0; i < theWhole.length; i++) {
      push();
      rotate((180 / theSymmetrishQuality) * k);
      theWhole[i].flow();
      pop();
    }
  }
}

class PartsOfTheWhole {
  constructor() {
    this.x = random(-theSpaceThatIsHeld, theSpaceThatIsHeld);
    this.y = random(-height / 1.5, height / 1.5);
    this.l = random(width / 100, width / 20);
    this.tFactor = random(0.001, 0.2);
    this.light = color(random(200, 250), random(240, 255), 255, random(2, 30));
  }
  flow() {
    stroke(this.light);
    noFill();

    beginShape();
    for (let i = 0; i < this.l; i++) {
      vertex(
        this.x +
          amplitudes *
            cos(this.y + i) *
            sin(this.y / elementsOfChange[0] + i / elementsOfChange[0]) *
            cos(i * 2) -
          50 * sin(i / elementsOfChange[1]),
        this.y + i
      );
    }
    endShape();

    if (this.y >= height / 1.5) {
      this.y = -height / 1.5 - this.l;
    } else {
      this.y += this.tFactor;
    }
  }
}

function whatIsThis() {
  describe(
    "rotational symmetry of water-like lines moving from half of the mandala-like structure and the other parts runing two. The flow is curved like a river when followed, but is lost with some of the blur from transparency. The background is dark teal and the flow-lines are white but with light teal variations. The center pulses with star-like structure with and ebb and flow feel that almost makes the canvas move. "
  );
}

function mousePressed() {
  theSpaceThatIsHeld = random(width / 20, width / 10);
  theDensityOfWhatIs = int(random(200, 500));
  theWhole = [];
  amplitudes = random(width / 5, width / 3);
  elementsOfChange = [random(3, 10), random(3, 10), random(3, 10)];

  for (let i = 0; i < theDensityOfWhatIs; i++) {
    theWhole.push(new PartsOfTheWhole());
  }
  angleMode(DEGREES);
  theSymmetrishQuality = random([7, 8, 9, 10, 11, 12]);
}