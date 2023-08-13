"use strict";

window.addEventListener("load", function () {
  let canv, ctx; // canvas and context
  let maxx, maxy; // canvas dimensions
  let lSegment, nbx, nby, offsx, offsy, posx, posy;
  let segs, nbRot, maxNbRot;
  let grid;
  let balls;

  const wSegment = 5;

  // for animation
  let messages;

  // shortcuts for Math.
  const mrandom = Math.random;
  const mfloor = Math.floor;
  const mround = Math.round;
  const mceil = Math.ceil;
  const mabs = Math.abs;
  const mmin = Math.min;
  const mmax = Math.max;

  const mPI = Math.PI;
  const mPIS2 = Math.PI / 2;
  const mPIS3 = Math.PI / 3;
  const m2PI = Math.PI * 2;
  const m2PIS3 = (Math.PI * 2) / 3;
  const msin = Math.sin;
  const mcos = Math.cos;
  const matan2 = Math.atan2;

  const mhypot = Math.hypot;
  const msqrt = Math.sqrt;

  const rac3 = msqrt(3);
  const rac3s2 = rac3 / 2;

  //------------------------------------------------------------------------

  function alea(mini, maxi) {
    // random number in given range

    if (typeof maxi == "undefined") return mini * mrandom(); // range 0..mini

    return mini + mrandom() * (maxi - mini); // range mini..maxi
  }
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function intAlea(mini, maxi) {
    // random integer in given range (mini..maxi - 1 or 0..mini - 1)
    //
    if (typeof maxi == "undefined") return mfloor(mini * mrandom()); // range 0..mini - 1
    return mini + mfloor(mrandom() * (maxi - mini)); // range mini .. maxi - 1
  }
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function arrayShuffle(array) {
    /* randomly changes the order of items in an array
           only the order is modified, not the elements
        */
    let k1, temp;
    for (let k = array.length - 1; k >= 1; --k) {
      k1 = intAlea(0, k + 1);
      temp = array[k];
      array[k] = array[k1];
      array[k1] = temp;
    } // for k
    return array;
  } // arrayShuffle
  //------------------------------------------------------------------------
  class EdgeLine {
    constructor(square, side) {
      this.s0 = { square, side };
      this.p0 = {
        x: posx[square.kx + [0, 1, 0, 0][side]],
        y: posy[square.ky + [0, 0, 1, 0][side]]
      };
      this.p1 = {
        x: posx[square.kx + [1, 1, 1, 0][side]],
        y: posy[square.ky + [0, 1, 1, 1][side]]
      };
      //  prevent segments from coming on outer edges of grid
      if (square.ky == 0 && side == 0) this.occupied = true; // top edge
      if (square.kx == nbx - 1 && side == 1) this.occupied = true; // right edge
      if (square.ky == nby - 1 && side == 2) this.occupied = true; // bottom edge
      if (square.kx == 0 && side == 3) this.occupied = true; // left edge
    }
  } // class EdgeLine
  //------------------------------------------------------------------------

  class Segment {
    constructor() {
      let kx, ky, kedge;
      // pick random edge of random square - unouccupied
      do {
        kx = intAlea(nbx);
        ky = intAlea(nby);
        kedge = intAlea(4);
      } while (grid[ky][kx].edges[kedge].edgeLine.occupied);

      this.edgeLine = grid[ky][kx].edges[kedge].edgeLine;
      this.edgeLine.occupied = true;
      this.color = alea(1) > 0.05 ? "white" : `hsl(${intAlea(360)} 100% 50%)`;
    } // constructor

    rotate() {
      /* initiates a rotation
          returns true if successful, false if failed (rotation was not possible or already in progress)
          */
      if (this.resting) return false;
      if (this.rotating) return false;

      let poss = [0, 1, 2, 3];
      this.tInit = performance.now();
      this.duration = alea(600, 800);

      otherPoss: while (poss.length) {
        let choice = poss.splice(intAlea(poss.length), 1)[0];
        let ssquare = choice & 2 ? this.edgeLine.s0 : this.edgeLine.s1; // choice of the square the segment will cross
        if (ssquare.square.occupied) continue otherPoss; // chosen square already occupied
        let dSide = choice & 1 ? 1 : 3; // choice of rotation (1 means ccw, 3 = -1 % 4 means cw)
        let nextSide = (ssquare.side + dSide) % 4;
        if (ssquare.square.edges[nextSide].edgeLine.occupied)
          continue otherPoss; // target side already occupied
        // found good move
        ssquare.square.edges[nextSide].edgeLine.occupied = true; // will occupy next side
        let kcenter = (ssquare.side + (choice & 1)) % 4;
        this.center = {
          x: posx[ssquare.square.kx + [0, 1, 1, 0][kcenter]],
          y: posy[ssquare.square.ky + [0, 0, 1, 1][kcenter]]
        };
        this.alpha0 = ((kcenter + (choice & 1)) * mPI) / 2; // initial angle
        this.alpha1 = this.alpha0 + ((choice & 1 ? -1 : 1) * mPI) / 2;
        ssquare.square.occupied = true;
        this.sSquare = ssquare;
        this.edgeLine.occupied = false;
        this.edgeLine = ssquare.square.edges[nextSide].edgeLine;
        this.edgeLine.occupied = true;
        this.rotating = true;
        this.tInit = performance.now();
        ++nbRot;
        return true;
      } // while poss.length
      return false; // found no good move
    } // rotate

    draw() {
      ctx.beginPath();
      ctx.lineWidth = wSegment;
      ctx.strokeStyle = this.color;

      if (this.rotating) {
        let dt = performance.now() - this.tInit;
        dt = mmin(1, dt / this.duration);
        let angle = this.alpha0 * (1 - dt) + this.alpha1 * dt;
        ctx.moveTo(this.center.x, this.center.y);
        ctx.lineTo(
          this.center.x + lSegment * mcos(angle),
          this.center.y + lSegment * msin(angle)
        );
        if (dt >= 1) {
          this.rotating = false;
          this.resting = true;
          this.duration = alea(800, 1200);
          this.tInit = performance.now();
          this.sSquare.square.occupied = false;
          --nbRot;
        }
      } else {
        ctx.moveTo(this.edgeLine.p0.x, this.edgeLine.p0.y);
        ctx.lineTo(this.edgeLine.p1.x, this.edgeLine.p1.y);
        if (this.resting && performance.now() - this.tInit > this.duration) {
          this.resting = false;
        }
      }
      ctx.stroke();
    } // draw
  } // class Segment

  //------------------------------------------------------------------------
  class Square {
    constructor(kx, ky) {
      // relies on the fact that grid squares are built in a given order
      let otherEdge;

      this.kx = kx;
      this.ky = ky;
      this.edges = [];
      // top edge
      this.edges[0] = {};
      if (this.ky == 0) {
        this.edges[0].edgeLine = new EdgeLine(this, 0);
      } else {
        otherEdge = grid[ky - 1][kx].edges[2];
        this.edges[0].edgeLine = otherEdge.edgeLine;
        this.edges[0].edgeLine.s1 = { square: this, side: 0 };
        this.edges[0].other = otherEdge;
        otherEdge.other = this.edges[0];
      }
      // right edge
      this.edges[1] = {};
      this.edges[1].edgeLine = new EdgeLine(this, 1);

      // bottom edge
      this.edges[2] = {};
      this.edges[2].edgeLine = new EdgeLine(this, 2);

      // leftt edge
      this.edges[3] = {};
      if (this.kx == 0) {
        this.edges[3].edgeLine = new EdgeLine(this, 3);
      } else {
        otherEdge = grid[ky][kx - 1].edges[1];
        this.edges[3].edgeLine = otherEdge.edgeLine;
        this.edges[3].edgeLine.s1 = { square: this, side: 3 };
        this.edges[3].other = otherEdge;
        otherEdge.other = this.edges[3];
      }
    } // constructor
  } // class Square
  //------------------------------------------------------------------------
  class Ball {
    constructor(radius) {
      do {
        this.kx = intAlea(nbx);
        this.ky = intAlea(nby);
      } while (grid[this.ky][this.kx].occupied);
      this.radius = radius;
      this.rad1 = this.radius / 2;
      this.dir = intAlea(4);
      let hue = intAlea(360);
      this.color = `hsl(${hue} 100% 50%)`;
      this.color1 = `hsl(${hue + 180} 100% 50%)`;
      this.moveStatus = 0;
      grid[this.ky][this.kx].occupied = true;
    }

    draw() {
      let x = posx[this.kx] + lSegment / 2;
      let y = posy[this.ky] + lSegment / 2;
      if (this.moveStatus > 0) {
        let alpha = mmin(1, (performance.now() - this.tInit) / this.duration);
        x += this.dx * alpha;
        y += this.dy * alpha;
      }
      ctx.beginPath();
      ctx.arc(x, y, this.radius, 0, m2PI);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, this.rad1, 0, m2PI);
      ctx.fillStyle = this.color1;
      ctx.fill();
    } // draw

    move() {
      switch (this.moveStatus) {
        case 0: // waiting to start move
          let dirs = arrayShuffle([0, 1, 3]); // changes in direction : forward, turn right, turn left
          dirs.push(2); // add half turn as a last chance

          let newDir, nextCell;
          trydirs: for (let k = 0; k < 4; ++k) {
            let dir = (this.dir + dirs[k]) % 4;
            if (grid[this.ky][this.kx].edges[dir].edgeLine.occupied)
              continue trydirs; // forbidden edge
            nextCell =
              grid[this.ky + [-1, 0, 1, 0][dir]][this.kx + [0, 1, 0, -1][dir]];
            if (nextCell.occupied) continue trydirs; // forbidden next cell
            newDir = dir;
            break trydirs;
          } // for k

          if (newDir === undefined) return; // can't start move
          this.tInit = performance.now();
          this.moveStatus = 1;
          this.dx = [0, lSegment, 0, -lSegment][newDir];
          this.dy = [-lSegment, 0, lSegment, 0][newDir];
          this.dir = newDir;
          this.nextCell = nextCell;
          this.nextCell.occupied = true;
          this.duration = intAlea(200, 400);
          break;

        case 1:
          if (performance.now() >= this.tInit + this.duration) {
            grid[this.ky][this.kx].occupied = false;
            this.kx = this.nextCell.kx;
            this.ky = this.nextCell.ky;
            this.nextCell.occupied = true;
            this.moveStatus = 0;
          }
          break;
      } // switch
    } // move
  } // class Ball
  //------------------------------------------------------------------------

  let animate;

  {
    // scope for animate

    let animState = 0;

    animate = function (tStamp) {
      let message;

      message = messages.shift();
      if (message && message.message == "reset") animState = 0;
      if (message && message.message == "click") animState = 0;
      window.requestAnimationFrame(animate);

      switch (animState) {
        case 0:
          if (startOver()) {
            ++animState;
          }
          break;

        case 1:
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, maxx, maxy);
          ctx.beginPath();
          ctx.lineWidth = wSegment;
          ctx.rect(posx[0], posy[0], lSegment * nbx, lSegment * nby);
          ctx.strokeStyle = "white";
          ctx.stroke();
          segs.forEach((seg) => {
            if (nbRot < maxNbRot) seg.rotate();
            seg.draw();
          }); // segs.forEach
          balls.forEach((ball) => {
            ball.move();
            ball.draw();
          });
          break;

        case 2:
          break;
      } // switch
    }; // animate
  } // scope for animate

  //------------------------------------------------------------------------
  //------------------------------------------------------------------------

  function startOver() {
    // canvas dimensions

    let kx, ky;
    let nbh, nbv;
    let nbSegments;

    maxx = window.innerWidth;
    maxy = window.innerHeight;

    canv.width = maxx;
    canv.height = maxy;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, maxx, maxy);

    lSegment = msqrt(maxx * maxy) / alea(15, 30);

    nbx = mfloor((maxx - 10) / lSegment);
    nby = mfloor((maxy - 10) / lSegment);
    // adjust lSegment to fill screen as completely as possible
    lSegment = mmin((maxx - 10) / nbx, (maxy - 10) / nby);

    nbx -= 0;
    nby -= 0;

    if (nbx < 2 || nby < 2) return; // pointless

    // positions of line / columns

    offsx = (maxx - nbx * lSegment) / 2;
    offsy = (maxy - nby * lSegment) / 2;
    posx = new Array(nbx + 1).fill(0).map((v, k) => offsx + k * lSegment);
    posy = new Array(nby + 1).fill(0).map((v, k) => offsy + k * lSegment);

    grid = [];
    for (let ky = 0; ky < nby; ++ky) {
      grid[ky] = [];
      for (let kx = 0; kx < nbx; ++kx) {
        grid[ky][kx] = new Square(kx, ky);
      } // for kx
    } // for ky

    // total numbers of segments, horizontal and vertical
    nbh = (nby + 1) * nbx;
    nbv = (nbx + 1) * nby;
    nbSegments = mround((nbh + nbv) * alea(0.3, 0.6));
    segs = [];

    for (let k = 0; k < nbSegments; ++k) {
      segs.push(new Segment());
    }
    /*
                segs.forEach(seg => {
                  ctx.beginPath();
                  ctx.lineWidth = wSegment;
                  ctx.strokeStyle = seg.color
                  let ln = seg.edgeLine;
                  ctx.moveTo(ln.p0.x, ln.p0.y);
                  ctx.lineTo(ln.p1.x, ln.p1.y);
                  ctx.stroke();
                })
        */
    nbRot = 0;

    maxNbRot = mround(nbSegments * alea(0.05, 0.1));

    balls = new Array(10).fill(0).map(() => new Ball(lSegment * 0.3));

    return true;
  } // startOver

  //------------------------------------------------------------------------

  function mouseClick(event) {
    messages.push({ message: "click" });
  } // mouseClick

  //------------------------------------------------------------------------
  //------------------------------------------------------------------------
  // beginning of execution

  {
    canv = document.createElement("canvas");
    canv.style.position = "absolute";
    document.body.appendChild(canv);
    ctx = canv.getContext("2d");
  } // création CANVAS
  canv.addEventListener("click", mouseClick);
  messages = [{ message: "reset" }];
  requestAnimationFrame(animate);
}); // window load listener