"use strict";

const NB_BARS = 10;
const NB_EDDIES = 7;
const BASE_SPEED = 2; // for bars only

const MAX_LIFETIME = 5000;

let canv, ctx; // canvas and context
let maxx, maxy; // canvas dimensions
let lRef;
let perpMode;
let mouse = {};

let fx, speed, perNoise; // for noise field
let bars, eddies;
let fieldFunction;
let colorizer, filler;

// for animation
let messages;
// user interface
let ui, uiv;

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
const mexp = Math.exp;

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
function distance(pa, pb) {
  return mhypot(pa.x - pb.x, pa.y - pb.y);
} // distance
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
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 */
function rgbToHsl(r, g, b) {
  (r /= 255), (g /= 255), (b /= 255);
  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, l];
} // function rgbToHsl
//------------------------------------------------------------------------
// User Interface (controls)
//------------------------------------------------------------------------
function toggleMenu() {
  if (menu.classList.contains("hidden")) {
    menu.classList.remove("hidden");
    this.innerHTML = "close controls";
  } else {
    menu.classList.add("hidden");
    this.innerHTML = "controls";
  }
} // toggleMenu

//------------------------------------------------------------------------

function getCoerce(name, min, max, isInt) {
  let parse = isInt ? parseInt : parseFloat;
  let ctrl = ui[name];
  let x = parse(ctrl.value, 10);
  if (isNaN(x)) {
    x = uiv[name];
  }
  x = mmax(x, min);
  x = mmin(x, max);
  ctrl.value = uiv[name] = x;
}

//------------------------------------------------------------------------
function prepareUI() {
  // toggle menu handler

  document.querySelector("#controls").addEventListener("click", toggleMenu);

  ui = {}; // User Interface HTML elements
  uiv = {}; // User Interface values of controls

  [
    "paintmode",
    "colorchoicemode",
    "color",
    "displaycolor",
    "mode",
    "clear",
    "lwidth",
    "clearsamefield",
    "fibrosity"
  ].forEach((ctrlName) => (ui[ctrlName] = document.getElementById(ctrlName)));
  const rect = ui.displaycolor.getBoundingClientRect();
  ui.displaycolor.width = rect.width - 2; // -2 for border - not that important
  ui.displaycolor.height = rect.height - 2;
  registerControl("paintmode", readUIInt, "input");
  registerControl("colorchoicemode", readColorChoiceMode, "input");
  registerControl("color", readColor, "input");
  registerControl("mode", readUIInt, "input");
  registerControl("lwidth", readUIFloat, "input");
  registerControl("fibrosity", readCoerced, "input", displayColor);
  ui.clear.addEventListener("click", () => messages.push({ message: "reset" }));
  ui.clearsamefield.addEventListener("click", clearSameField);
  readUI();
} // prepareUI

//------------------------------------------------------------------------
function readUI() {
  if (ui.registered) {
    for (const ctrl in ui.registered) ui.registered[ctrl].readF();
  }
  displayColor();
  readColorChoiceMode.call(ui.colorchoicemode);
} // readUI

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function registerControl(
  controlName,
  readFunction,
  changeEvent,
  changedFunction
) {
  /* provides simple way to associate controls with their read / update / changeEvent / changed functions
            since many (but not all) controls work almost the same way */
  /* changeEvent and changedFunction are optional */

  const ctrl = ui[controlName];
  ui.registered = ui.registered || [];
  ui.registered.push(ctrl); // NEVER register a control twice !!!
  ctrl.readF = readFunction;
  if (changeEvent) {
    ctrl.addEventListener(changeEvent, (event) => {
      readFunction.call(ctrl);
      if (changedFunction) changedFunction.call(ctrl, event);
    });
  }
} // registerControl
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function readUIFloat() {
  uiv[this.id] = parseFloat(this.value);
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function readUIInt() {
  uiv[this.id] = parseInt(this.value);
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function readUICheck() {
  uiv[this.id] = this.checked;
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function readColor() {
  const raw = this.value;
  const color = { raw };
  color.r = parseInt(raw.substring(1, 3), 16);
  color.g = parseInt(raw.substring(3, 5), 16);
  color.b = parseInt(raw.substring(5, 7), 16);
  const hsl = rgbToHsl(color.r, color.g, color.b);
  color.h = 360 * hsl[0];
  color.s = 100 * hsl[1];
  color.l = 100 * hsl[2];
  uiv[this.id] = color;
  displayColor();
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function readColorChoiceMode() {
  readUIInt.call(this);
  if (uiv.colorchoicemode) {
    ui.color.removeAttribute("disabled"); // manual;
  } else {
    ui.color.setAttribute("disabled", ""); // automatic
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function readCoerced() {
  /* the element will be read with getCoerce with values given by its min, max and step attributes
              (integer value if step == 1)
            */
  let min = this.getAttribute("min");
  let max = this.getAttribute("max");
  let step = this.getAttribute("step");
  getCoerce(this.id, min, max, step == 1);
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function displayColor() {
  let ctx = ui.displaycolor.getContext("2d");

  ctx.lineWidth = 1;
  for (let ky = 0; ky < ui.displaycolor.height; ++ky) {
    ctx.beginPath();
    ctx.moveTo(0, ky);
    ctx.lineTo(ui.displaycolor.width, ky);
    ctx.strokeStyle = lineColor();
    ctx.stroke();
  }
}

//------------------------------------------------------------------------
/*
 * A fast javascript implementation of simplex noise by Jonas Wagner
 *
 * Based on a speed-improved simplex noise algorithm for 2D, 3D and 4D in Java.
 * Which is based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * With Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 *
 *
 * Copyright (C) 2012 Jonas Wagner
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
(function () {
  "use strict";

  var F2 = 0.5 * (Math.sqrt(3.0) - 1.0),
    G2 = (3.0 - Math.sqrt(3.0)) / 6.0,
    F3 = 1.0 / 3.0,
    G3 = 1.0 / 6.0,
    F4 = (Math.sqrt(5.0) - 1.0) / 4.0,
    G4 = (5.0 - Math.sqrt(5.0)) / 20.0;

  function SimplexNoise(random) {
    if (!random) random = Math.random;
    this.p = new Uint8Array(256);
    this.perm = new Uint8Array(512);
    this.permMod12 = new Uint8Array(512);
    for (var i = 0; i < 256; i++) {
      this.p[i] = random() * 256;
    }
    for (i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  SimplexNoise.prototype = {
    grad3: new Float32Array([
      1,
      1,
      0,
      -1,
      1,
      0,
      1,
      -1,
      0,

      -1,
      -1,
      0,
      1,
      0,
      1,
      -1,
      0,
      1,

      1,
      0,
      -1,
      -1,
      0,
      -1,
      0,
      1,
      1,

      0,
      -1,
      1,
      0,
      1,
      -1,
      0,
      -1,
      -1
    ]),
    noise2D: function (xin, yin) {
      var permMod12 = this.permMod12,
        perm = this.perm,
        grad3 = this.grad3;
      var n0 = 0,
        n1 = 0,
        n2 = 0; // Noise contributions from the three corners
      // Skew the input space to determine which simplex cell we're in
      var s = (xin + yin) * F2; // Hairy factor for 2D
      var i = Math.floor(xin + s);
      var j = Math.floor(yin + s);
      var t = (i + j) * G2;
      var X0 = i - t; // Unskew the cell origin back to (x,y) space
      var Y0 = j - t;
      var x0 = xin - X0; // The x,y distances from the cell origin
      var y0 = yin - Y0;
      // For the 2D case, the simplex shape is an equilateral triangle.
      // Determine which simplex we are in.
      var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
      if (x0 > y0) {
        i1 = 1;
        j1 = 0;
      } // lower triangle, XY order: (0,0)->(1,0)->(1,1)
      else {
        i1 = 0;
        j1 = 1;
      } // upper triangle, YX order: (0,0)->(0,1)->(1,1)
      // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
      // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
      // c = (3-sqrt(3))/6
      var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
      var y1 = y0 - j1 + G2;
      var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
      var y2 = y0 - 1.0 + 2.0 * G2;
      // Work out the hashed gradient indices of the three simplex corners
      var ii = i & 255;
      var jj = j & 255;
      // Calculate the contribution from the three corners
      var t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 >= 0) {
        var gi0 = permMod12[ii + perm[jj]] * 3;
        t0 *= t0;
        n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0); // (x,y) of grad3 used for 2D gradient
      }
      var t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 >= 0) {
        var gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3;
        t1 *= t1;
        n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1);
      }
      var t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 >= 0) {
        var gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3;
        t2 *= t2;
        n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2);
      }
      // Add contributions from each corner to get the final noise value.
      // The result is scaled to return values in the interval [-1,1].
      return 70.0 * (n0 + n1 + n2);
    }
  };

  window.SimplexNoise = SimplexNoise;
})();
/* end of simplex noise */

//------------------------------------------------------------------------
function virtualIntersection(p0, p1, p2, p3) {
  /* intersection of straight lines defined by (p0,p1) with (p2,p3)
            even if segments do not actually intersect

            "false" is returned in special cases (cross product of segments = 0)
            */

  const discri = (p1.y - p0.y) * (p3.x - p2.x) - (p1.x - p0.x) * (p3.y - p2.y);
  let xs =
    p0.x * (p1.y - p0.y) * (p3.x - p2.x) -
    p2.x * (p1.x - p0.x) * (p3.y - p2.y) +
    (p2.y - p0.y) * (p1.x - p0.x) * (p3.x - p2.x);
  if (discri == 0) return false; // though intersection may exist
  xs /= discri;
  // y se calcule comme x, en permutant les x et les y (ce qui change discri en -discri)
  let ys =
    p0.y * (p1.x - p0.x) * (p3.y - p2.y) -
    p2.y * (p1.y - p0.y) * (p3.x - p2.x) +
    (p2.x - p0.x) * (p1.y - p0.y) * (p3.y - p2.y);
  ys = -ys / discri;

  return { x: xs, y: ys };
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function actualIntersection(p0, p1, p2, p3) {
  /* calculates virtualIntersection
             returns false if virtualIntersection returned false, of if segments do not actually intersect
             will return false if
             */

  let p = virtualIntersection(p0, p1, p2, p3);
  if (p == false) return false;
  if (!isBetween(p, p0, p1)) return false;
  if (!isBetween(p, p2, p3)) return false;
  return p;
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function isBetween(p, p0, p1) {
  /* based on sign of dot product p-p0 . p-p1,
             In fact, tells if point p is in circle of diameter p0-p1
             */
  return (p0.x - p.x) * (p1.x - p.x) + (p0.y - p.y) * (p1.y - p.y) <= 0;
}

//------------------------------------------------------------------------
/*
 * A fast javascript implementation of simplex noise by Jonas Wagner
 *
 * Based on a speed-improved simplex noise algorithm for 2D, 3D and 4D in Java.
 * Which is based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * With Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 *
 *
 * Copyright (C) 2012 Jonas Wagner
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
(function () {
  "use strict";

  var F2 = 0.5 * (Math.sqrt(3.0) - 1.0),
    G2 = (3.0 - Math.sqrt(3.0)) / 6.0,
    F3 = 1.0 / 3.0,
    G3 = 1.0 / 6.0,
    F4 = (Math.sqrt(5.0) - 1.0) / 4.0,
    G4 = (5.0 - Math.sqrt(5.0)) / 20.0;

  function SimplexNoise(random) {
    if (!random) random = Math.random;
    this.p = new Uint8Array(256);
    this.perm = new Uint8Array(512);
    this.permMod12 = new Uint8Array(512);
    for (var i = 0; i < 256; i++) {
      this.p[i] = random() * 256;
    }
    for (i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  SimplexNoise.prototype = {
    grad3: new Float32Array([
      1,
      1,
      0,
      -1,
      1,
      0,
      1,
      -1,
      0,

      -1,
      -1,
      0,
      1,
      0,
      1,
      -1,
      0,
      1,

      1,
      0,
      -1,
      -1,
      0,
      -1,
      0,
      1,
      1,

      0,
      -1,
      1,
      0,
      1,
      -1,
      0,
      -1,
      -1
    ]),
    noise2D: function (xin, yin) {
      var permMod12 = this.permMod12,
        perm = this.perm,
        grad3 = this.grad3;
      var n0 = 0,
        n1 = 0,
        n2 = 0; // Noise contributions from the three corners
      // Skew the input space to determine which simplex cell we're in
      var s = (xin + yin) * F2; // Hairy factor for 2D
      var i = Math.floor(xin + s);
      var j = Math.floor(yin + s);
      var t = (i + j) * G2;
      var X0 = i - t; // Unskew the cell origin back to (x,y) space
      var Y0 = j - t;
      var x0 = xin - X0; // The x,y distances from the cell origin
      var y0 = yin - Y0;
      // For the 2D case, the simplex shape is an equilateral triangle.
      // Determine which simplex we are in.
      var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
      if (x0 > y0) {
        i1 = 1;
        j1 = 0;
      } // lower triangle, XY order: (0,0)->(1,0)->(1,1)
      else {
        i1 = 0;
        j1 = 1;
      } // upper triangle, YX order: (0,0)->(0,1)->(1,1)
      // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
      // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
      // c = (3-sqrt(3))/6
      var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
      var y1 = y0 - j1 + G2;
      var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
      var y2 = y0 - 1.0 + 2.0 * G2;
      // Work out the hashed gradient indices of the three simplex corners
      var ii = i & 255;
      var jj = j & 255;
      // Calculate the contribution from the three corners
      var t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 >= 0) {
        var gi0 = permMod12[ii + perm[jj]] * 3;
        t0 *= t0;
        n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0); // (x,y) of grad3 used for 2D gradient
      }
      var t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 >= 0) {
        var gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3;
        t1 *= t1;
        n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1);
      }
      var t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 >= 0) {
        var gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3;
        t2 *= t2;
        n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2);
      }
      // Add contributions from each corner to get the final noise value.
      // The result is scaled to return values in the interval [-1,1].
      return 70.0 * (n0 + n1 + n2);
    }
  };

  window.SimplexNoise = SimplexNoise;
})();
/* end of simple noise */

function noiseField(p) {
  /* compute field at a given point */

  let dx = p.x - maxx / 2;
  let dy = p.y - maxy / 2;

  let angle = fx(dx / perNoise, dy / perNoise) * mPI; // non-uniform distribution -> tendency to go to the right

  let rad = mhypot(dx, dy);

  /*  since noise2D does not return a uniform distribution, the particles have
            a tendency to go to the right (angle 0)
            The following lines spread the particles in all directions away from the centre,
            except in a small central area to avoid discontinuity */

  if (mhypot(dx, dy) > 1) {
    // arbitrary radius of 1
    angle += matan2(dy, dx);
  }

  return { dx: speed * mcos(angle), dy: speed * msin(angle) }; //
} // noiseField

//------------------------------------------------------------------------

class Eddy {
  /*
   * The Eddy class inspired in very large part by Alex Andrix's work on Codepen
   * https://codepen.io/alexandrix/pen/jgyWww
   * @author Alex Andrix <alex@alexandrix.com>
   * @since 2019
   */

  constructor() {
    this.x = alea(-0.02, maxx / lRef + 0.02);
    this.y = alea(-0.02, maxy / lRef + 0.02);

    this.coeffR = 0.001 * alea(0.7, 1.3); // coefficient for radial velocity
    this.radius = 0.2 + alea(-0.1, 0.1); // radius where angular velocity is max
    this.coeffA1 = 0.017 * alea(0.8, 1.2); // coefficient in exponent for angular velocity
    this.coeffA2 = 0.01 * alea(0.8, 1.2); // multiplying coefficient for angular velocity
    this.dir = mrandom() > 0.5 ? 1 : -1; // direction of rotation
  } // constructor

  field(p) {
    const dx = p.x / lRef - this.x;
    const dy = p.y / lRef - this.y;
    const r = mmax(0.0001, mhypot(dx, dy)); // distance particle - centre of the eddy
    const s = dy / r; // sine of angle
    const c = dx / r; // cosine of angle
    // angular velocity
    const deltar = r - this.radius;
    const av =
      this.coeffA2 * mexp((-deltar * deltar) / this.coeffA1) * this.dir;
    // radial velocity
    const rv = -deltar * this.coeffR;
    return { fx: rv * c - av * r * s, fy: rv * s + av * r * c };
  } // field
} // class Eddy
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function eddiesField(p) {
  let dx = 0,
    dy = 0,
    fx,
    fy;
  eddies.forEach((eddy) => {
    ({ fx, fy } = eddy.field(p));
    dx += fx;
    dy += fy;
  });
  return { dx: lRef * dx, dy: lRef * dy };
}

//------------------------------------------------------------------------
//------------------------------------------------------------------------
class Bar {
  /* each "Bar" is an infinite straight line
            the field generated by each is simply parallel to the bar, and just decreases with the distance
            */
  constructor() {
    this.p0 = { x: alea(maxx), y: alea(maxy) };
    this.dir = alea(m2PI);
    this.ux = mcos(this.dir);
    this.uy = msin(this.dir);
    this.p1 = { x: this.p0.x + this.ux, y: this.p0.y + this.uy };
    this.f0 = BASE_SPEED * alea(0.8, 1.2); // force at distance 0
    this.d0 = lRef * 0.1 * alea(0.8, 1.5); // distance where force is divided by e (2.71828...)
    this.isPerp = [false, Math.random() > 0.5, true][perpMode];
  } // constructor

  field(p) {
    let dist;
    const intersection = virtualIntersection(this.p0, this.p1, p, {
      x: p.x + this.uy,
      y: p.y - this.ux
    });
    dist = distance(p, intersection);
    let k = this.f0 * Math.exp(-dist / this.d0);
    if (this.isPerp) return { fx: k * this.uy, fy: -k * this.ux };
    return { fx: k * this.ux, fy: k * this.uy };
  } // field
} // class Bar

//------------------------------------------------------------------------
function barsField(p) {
  let dx = 0,
    dy = 0,
    fx,
    fy;
  bars.forEach((bar) => {
    ({ fx, fy } = bar.field(p));
    dx += fx;
    dy += fy;
  });
  return { dx, dy };
}
//------------------------------------------------------------------------
function fiberedColor(color) {
  // apply fibrosity to color
  // create a lum about color.lum
  const dlum = uiv.fibrosity * 60;
  let lmin = color.l - dlum / 2;
  let lmax = color.l + dlum / 2;
  if (lmax > 100) {
    lmin -= lmax - 100;
    lmax = 100;
  } // stay in the 0..100 range
  if (lmin < 0) {
    lmax -= lmin;
    lmin = 0;
  }
  const l = alea(lmin, lmax);
  // create a sat about color.s
  const dsat = uiv.fibrosity * 60;
  let smin = color.s - dsat / 2;
  let smax = color.s + dsat / 2;
  if (smax > 100) {
    smin -= smax - 100;
    smax = 100;
  } // stay in the 0..100 range
  if (smin < 0) {
    smax -= smin;
    smin = 0;
  }
  const s = color.s < 1 ? 0 : alea(smin, smax); // B/W if input sat is very low
  return `hsl(${color.h} ${s}% ${l}%)`;
}

//------------------------------------------------------------------------
function lineColor() {
  return fiberedColor({ h: uiv.color.h, s: uiv.color.s, l: uiv.color.l });
}
//------------------------------------------------------------------------
class HalfParticle {
  constructor(x, y, neg) {
    this.x = x;
    this.y = y;
    this.nbout = 0; // number of consecutive off-screen steps
    this.positions = [{ x: this.x, y: this.y }]; // array of positions, initialized with 1st position
    this.neg = neg;
    this.TTL = MAX_LIFETIME;
  }
  move(points) {
    let dx, dy;
    let prevx = this.x,
      prevy = this.y;
    if (prevx >= 0 && prevx < maxx && prevy >= 0 && prevy < maxy) {
      this.nbout = 0;
    } else {
      ++this.nbout;
      if (this.nbout > 10) return false; // 10 steps offscreen, declare dead
    }
    ({ dx, dy } = fieldFunction(this));

    if (this.neg) {
      this.x -= dx;
      this.y -= dy;
      points.push({ x: this.x, y: this.y });
    } else {
      this.x += dx;
      this.y += dy;
      points.unshift({ x: this.x, y: this.y });
    }

    this.positions.push({ x: this.x, y: this.y });
    if (this.positions.length > 100) {
      // limit history to 100 steps
      this.positions.shift();
      if (
        mhypot(this.x - this.positions[0].x, this.y - this.positions[0].y) < 1
      )
        return false; // particle moves too slowly, declare dead
    }
    if (--this.TTL < 0) return false; // particle too old - probably on a closed orbit
    return true; // still alive
  } // move
} // class HalfParticle

//------------------------------------------------------------------------

class Particle {
  constructor(x, y) {
    this.points = [{ x, y }];

    this.hp0 = new HalfParticle(x, y, true);
    this.hp1 = new HalfParticle(x, y, false);

    this.lineWidth = uiv.lwidth;
    while (this.move());
    this.color = uiv.colorchoicemode ? lineColor() : colorizer.getColor(this);
  }

  move() {
    if (this.hp0) if (!this.hp0.move(this.points)) delete this.hp0; // move half-particle if it exists
    if (this.hp1) if (!this.hp1.move(this.points)) delete this.hp1; // move half-particle if it exists
    return this.hp0 || this.hp1;
  }
} // class Particle

//------------------------------------------------------------------------
class Colorizer {
  /* for "auto" color only */
  constructor() {
    do {
      this.ax0 = alea(0.5, 3);
      this.ay0 = alea(0.5, 3);
      this.ax1 = alea(0.5, 3);
      this.ay1 = alea(0.5, 3);
      this.sumaxy01 =
        (this.ax0 + this.ax1) * maxx + (this.ay0 + this.ay1) * maxy;
    } while (this.sumaxy01 < 2 * lRef);
    this.hue0 = alea(360);
    /*
                do {
                    this.bx0 = alea(0.5, 3);
                    this.by0 = alea(0.5, 3);
                    this.bx1 = alea(0.5, 3);
                    this.by1 = alea(0.5, 3);
                    this.sumbxy01 = (this.bx0 + this.bx1) * maxx + (this.by0 + this.by1) * maxy;
                } while (this.sumaxy01 < 2 * lRef);
                this.sat0 = alea(1);
                */
  }

  getColor(partic) {
    const p0 = partic.points[0];
    const p1 = partic.points.at(-1);
    let v =
      ((p0.x * this.ax0 + p0.y * this.ay0 + p1.x * this.ax1 + p1.y * this.ay1) *
        4) /
      this.sumaxy01; // range 0..3
    let v0 = mfloor(v);
    v -= v0;
    if (v0 & 1) v = 1 - v; // v transformed by triangular function to be in range 0..1 and continuous
    const hue = v * 360 + this.hue0;
    /*
                                v = (p0.x * this.bx0 + p0.y * this.by0 + p1.x * this.bx1 + p1.y * this.by1) * 5 / this.sumbxy01 + this.sat0; // range 0..3
                                v0 = mfloor(v);
                                v -= v0;
                                if (v0 & 1) v = 1 - v; // v transformed by triangular function to be in range 0..1 and continuous
                                const sat = 40 + 60 * v;
                */
    const sat = 100; // 40 + 60 * v; finally, 100% sat is better

    return fiberedColor({ h: hue, s: sat, l: 50 });
  } // getColor
} // colorizer
//------------------------------------------------------------------------
class Filler {
  constructor() {
    this.grid = new Array(maxy)
      .fill(0)
      .map((v, ky) =>
        new Array(maxx).fill(0).map((v, kx) => ({ kx, ky, count: 0 }))
      );
    this.cells = [];
    this.grid.forEach((row) => row.forEach((cell) => this.cells.push(cell)));
    arrayShuffle(this.cells);
    this.ptr = 0; // "pointer" to pick from this.cells
    this.limit = 1000;
  }

  sort() {
    this.cells.sort((a, b) => a.count - b.count);
  }

  getPoint() {
    if (this.ptr > this.limit) {
      this.sort();
      this.ptr = 0;
    }
    let p = this.cells[this.ptr++];
    return { x: p.kx + alea(1), y: p.ky + alea(1) };
  } // getPoint

  usePoint(p) {
    const kx = mround(p.y);
    const ky = mround(p.x);
    let row, cell;
    if ((row = this.grid[ky]) && (cell = row[kx])) ++cell.count;
  }
} // class Filler
//------------------------------------------------------------------------

let animate;

{
  // scope for animate

  let animState = 0;
  let prevx, prevy;
  animate = function (tStamp) {
    let message, p;

    message = messages.shift();
    if (message && message.message == "reset") animState = 0;

    window.requestAnimationFrame(animate);

    switch (animState) {
      case 0:
        if (startOver()) {
          ++animState;
        }
        break;

      case 1:
        if (uiv.paintmode == 1) {
          if (prevx === mouse.x && prevy === mouse.y) return; // no move
          prevx = mouse.x;
          prevy = mouse.y;
          if (mouse.buttons !== 1) return; // manual and no button
          p = new Particle(mouse.x, mouse.y);
        } else {
          p = filler.getPoint();
          p = new Particle(p.x, p.y);
        }

        ctx.beginPath();
        p.points.forEach((p, k) => {
          if (k == 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
          if (uiv.paintmode == 1) filler.usePoint(p);
        });
        ctx.lineWidth = p.lineWidth;
        ctx.strokeStyle = p.color;
        ctx.stroke();
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

  maxx = window.innerWidth;
  maxy = window.innerHeight;

  canv.width = maxx;
  canv.height = maxy;
  //      ctx.lineJoin = 'round';
  //      ctx.lineCap = 'round';

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, maxx, maxy);
  lRef = msqrt(maxx * maxy);

  colorizer = new Colorizer();

  switch (uiv.mode) {
    case 0: // parallel
    case 1: // mixed
    case 2: // perpendicular
      fieldFunction = barsField;
      bars = new Array(NB_BARS).fill(0).map(() => new Bar());
      perpMode = uiv.mode;
      break;

    case 3: // noise
      fieldFunction = noiseField;
      speed = 1.5;
      perNoise = (maxx / 3) * alea(0.8, 1.2);
      fx = (function () {
        let f = new SimplexNoise();
        return function (x, y) {
          return (
            (f.noise2D(x, y) +
              f.noise2D(1.876 * x, 1.876 * y) / 2 +
              f.noise2D(3.723 * x, 3.723 * y) / 4) /
            1.75
          );
        };
      })();
      break;

    case 4:
      fieldFunction = eddiesField;
      eddies = new Array(NB_EDDIES).fill(0).map(() => new Eddy());
      break;
  }
  if (uiv.paintmode == 0) filler = new Filler();

  return true;
} // startOver

function clearSameField() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, maxx, maxy);
  filler = new Filler();
  colorizer = new Colorizer();
}
//------------------------------------------------------------------------

function mouseClick(event) {
  messages.push({ message: "click", event: event });
} // mouseClick

//------------------------------------------------------------------------

function mouseMove(event) {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
  mouse.moved = true;
  mouse.buttons = event.buttons;
} // mouseClick

//------------------------------------------------------------------------
//------------------------------------------------------------------------
// beginning of execution

canv = document.createElement("canvas");
canv.style.position = "absolute";
document.body.appendChild(canv);
ctx = canv.getContext("2d");
//    canv.addEventListener('click', mouseClick);
canv.addEventListener("mousemove", mouseMove);

prepareUI();
/*
            document.querySelector("div.message").addEventListener("click", () => document.querySelector("div.message").style.display = "none");
            if (location.pathname.includes('/fullcpgrid/')) { // special for Codepen miniature
              document.querySelector("div.message").style.display = "none"
            }
        */
messages = [{ message: "reset" }];
requestAnimationFrame(animate);