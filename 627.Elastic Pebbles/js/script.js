"use strict";

window.addEventListener("load", function () {
  const DIST_BRIDSON_MIN = 0.1; // size of pattern - relative to canvas size
  const DIST_BRIDSON_MAX = 0.2;
  const SPEED = 0.6; // must be > 0. May be tuned for a better halo effect, depending on size and FPS

  let canv, ctx; // canvas and context
  let maxx, maxy; // canvas dimensions
  let tr, distBridson;
  let displayCycle;
  let polygons;
  let gr;

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
  /*	============================================================================
  This hash function is based upon Johannes Baagoe's carefully designed and efficient hash
  function for use with JavaScript.  It has a proven "avalanche" effect such
  that every bit of the input affects every bit of the output 50% of the time,
  which is good.	See: http://baagoe.com/en/RandomMusings/hash/avalanche.xhtml
  ============================================================================
*/
  /* This function returns a hash function depending on a seed.

      if no seed is provided (or a falsy value), Math.random() is used.
      The returned function always returns the same number in the range [0..1[ for the
      same value of the argument. This argument may be a String or a Number or anything else
      which can be 'toStringed'
      Two returned functions obtained with two equal seeds are equivalent.
      */

  function hashFunction(seed) {
    let n0 = 0xefc8249d;
    let n = n0;
    mash(seed || Math.random()); // pre-compute n for seed
    n0 = n; //

    function mash(data) {
      data = data.toString() + "U";
      n = n0;
      for (let i = 0; i < data.length; i++) {
        n += data.charCodeAt(i);
        var h = 0.02519603282416938 * n;
        n = h >>> 0;
        h -= n;
        h *= n;
        n = h >>> 0;
        h -= n;
        n += h * 0x100000000; // 2^32
      } // for
      return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    } // mash
    return mash;
  } // hashFunction(seed)

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function Noise1D(period, min = 0, max = 1, hash) {
    /* returns a 1D noise function.
           the (mandatory) hash function must return a value between 0 and 1. The hash function
           will be called with an integer number for a parameter.
          the returned function takes one parameter, and will always return the same value if called with the same parameter
          period should be > 1. The bigger period is, the smoother the output noise is

        suggestion : the hash parameter could be a function returned from a call to hashFunction above

        */

    let currx, y0, y1; // cached valued, to reduce number of calls to 'hash'
    let phase = hash(0); // to shift the phase of different generators between each other;

    return function (x) {
      let xx = x / period + phase;
      let intx = mfloor(xx);

      if (intx - 1 === currx) {
        // next integer interval
        ++currx;
        y0 = y1;
        y1 = min + (max - min) * hash(currx + 1);
      } else if (intx !== currx) {
        // unrelated interval
        currx = intx;
        y0 = min + (max - min) * hash(currx);
        y1 = min + (max - min) * hash(currx + 1);
      }
      let frac = xx - currx;
      let z = (3 - 2 * frac) * frac * frac;
      return z * y1 + (1 - z) * y0;
    };
  } // Noise1D
  /* example : noise = Noise1D (100, 0, maxy, hashFunction(seed));
   */

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
  function lerp(p0, p1, alpha) {
    return {
      x: (1 - alpha) * p0.x + alpha * p1.x,
      y: (1 - alpha) * p0.y + alpha * p1.y
    };
  }
  //------------------------------------------------------------------------
  //------------------------------------------------------------------------

  function generatePoints(t) {
    return t.points.map((p) => ({ x: p.x, y: p.y })); // shallow copy
  } // generate points

  //------------------------------------------------------------------------

  class SortedArray {
    /* creates a sorted array of any kind of things, by intersting them into an initially empty array
           the comparison function used for sorting is given to the constructor
           Things are inserted using .insert method
           sorted array is in the .tb property of the instance
        */
    /*
        the indexOf property lets you know if thing already existed according to fCompar, and at what index
        just use doInsert(no parameters) after indexOf to insert thing at found (not -1) index
        */

    /* CAUTION : if duplicates are allowed, indexOf is NOT garanteed to return the index of actual thing - only a thing
              which returns 0 when compared with given thing. Use regular Array.indexOf on instance.tb instead.
        */
    constructor(fCompar, keepDuplicates = false) {
      /* fCompar is the function which will be called to compare the things that will be inserted
          in  this.tb
              fCompar(a,b) must return  number < 0 if a must be placed before b
              == 0 if a and b are considered equal
              > 0 if a must be placed after b
          */
      this.tb = [];
      this.fCompar = fCompar;
      this.keepDuplicates = keepDuplicates;
    }

    indexOf(thing) {
      this.thing = thing;
      // search for place to insert thing, using comparison function this.fCompar
      // if found, returns the index of thing in this.tb, else returns -1
      // sets this.insertAt for future insertion

      let cmp;
      if (this.tb.length == 0) {
        this.insertAt = 0;
        return -1;
      }
      let a = 0,
        c = this.tb.length - 1;
      let b;

      do {
        b = Math.floor((a + c) / 2);
        cmp = this.fCompar(this.tb[b], thing);
        switch (true) {
          case cmp < 0: // thing after b
            if (b == c) {
              // beyond c
              this.insertAt = c + 1;
              return -1;
            }
            if (a == b) ++b; // not to stay on same interval, if its length is 1 or 2
            a = b; // after b : search (b, c) now
            break;
          case cmp == 0:
            this.insertAt = b;
            return b; // found !

          default:
            //thing before b
            if (b == a) {
              // before a
              this.insertAt = a;
              return -1;
            }
            c = b; // search (a, b) now
        }
      } while (true);
    } // indexOf

    doInsert() {
      // DO NOT CALL TWICE WITHOUT getting new (!= -1) indexOf
      this.tb.splice(this.insertAt, 0, this.thing);
    }

    insert(thing) {
      /* inserts thing */
      if (this.indexOf(thing) != -1 && !this.keepDuplicates) return; // already exists and refused
      this.tb.splice(this.insertAt, 0, thing);
    }
  } // class SortedArray
  //------------------------------------------------------------------------
  class Edge {
    constructor(p0, p1) {
      if (p0.kp <= p1.kp) {
        this.p0 = p0;
        this.p1 = p1;
      } else {
        this.p0 = p1;
        this.p1 = p0;
      }
      this.tris = []; // to record up to 2 triangles attached to this edge
    }

    attachTriangle(tri) {
      // includes a triangle in and edge's tris array
      // AND includes itself in this triangle's edges array
      // AND more

      if (!this.p0.tris.includes(tri)) this.p0.tris.push(tri);
      if (!this.p1.tris.includes(tri)) this.p1.tris.push(tri);

      if (!this.p0.edges.includes(this)) this.p0.edges.push(this);
      if (!this.p1.edges.includes(this)) this.p1.edges.push(this);

      if (tri.a == this.p0) {
        if (tri.b == this.p1) {
          this.tris[0] = tri;
          tri.edges[0] = this;
        } else {
          this.tris[1] = tri;
          tri.edges[2] = this;
        }
        return;
      }
      if (tri.b == this.p0) {
        if (tri.c == this.p1) {
          this.tris[0] = tri;
          tri.edges[1] = this;
        } else {
          this.tris[1] = tri;
          tri.edges[0] = this;
        }
        return;
      }
      if (tri.c == this.p0) {
        if (tri.a == this.p1) {
          this.tris[0] = tri;
          tri.edges[2] = this;
        } else {
          this.tris[1] = tri;
          tri.edges[1] = this;
        }
      }
    }
  } // class Edge
  //------------------------------------------------------------------------

  class Triangle {
    constructor(a, b, c) {
      this.a = a;
      this.b = b;
      this.c = c;
      this.vertices = [this.a, this.b, this.c];

      const m11 = 2 * (b.x - a.x);
      const m21 = 2 * (c.x - a.x);
      const m12 = 2 * (b.y - a.y);
      const m22 = 2 * (c.y - a.y);
      const c1 = b.x * b.x - a.x * a.x + b.y * b.y - a.y * a.y;
      const c2 = c.x * c.x - a.x * a.x + c.y * c.y - a.y * a.y;
      const det = m11 * m22 - m21 * m12;
      this.xc = (c1 * m22 - c2 * m12) / det;
      this.yc = (m11 * c2 - m21 * c1) / det;
      this.r = Math.hypot(this.xc - this.a.x, this.yc - this.a.y);
    } // constructor

    inCircumCircle(p) {
      return Math.hypot(p.x - this.xc, p.y - this.yc) < this.r;
    }
    hasEdge(p1, p2) {
      // (was written before the above "Edge" class)
      return (
        (p1 == this.a || p1 == this.b || p1 == this.c) &&
        (p2 == this.a || p2 == this.b || p2 == this.c)
      );
    }
    listTris() {
      let other;
      this.tris = [];
      this.edges.forEach((edge, kEdge) => {
        other = edge.tris[0] == this ? edge.tris[1] : edge.tris[0];
        if (other) this.tris[kEdge] = other;
      });
    } // listTris

    draw(fillStyle, lineWidth, strokeStyle) {
      ctx.beginPath();
      ctx.moveTo(this.a.x, this.a.y);
      ctx.lineTo(this.b.x, this.b.y);
      ctx.lineTo(this.c.x, this.c.y);
      ctx.closePath();
      if (fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.fill();
      }
      if (lineWidth) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
      }
    } // draw
  } // Triangle

  //------------------------------------------------------------------------
  class Delaunay {
    /* Delaunay based on based on https://en.wikipedia.org/wiki/Bowyer%E2%80%93Watson_algorithm
     */
    constructor(points, maxx, maxy, margin) {
      let triangulation, badTriangles, polygon;
      /* maxx and maxy are given here ONLY to determine the initial triangle, assuming
          all points are in a (-margin, -margin)-(maxx + margin, maxy + margin) rectangle
          actual extreme coordinates of points could be used instead of maxx and maxy
          maxx and maxy are both supposed > 0
          */

      /*   triangulation := empty triangle mesh data structure*/
      /* add super-triangle to triangulation // must be large enough to completely contain all the points in pointList */
      /* the super-triangle has a vertex in [-margin-1, -margin-1] and 2 sides parallel to the axis
          The 3rd side is a 45 degrees slanted line passing by [maxx + margin + 1, maxy + margin + 1]
          /!\ CAUTION : all triangles generated will have the same orientation as this initial super-triangle
          */
      const numPts = points.length;

      const pts = points.map((p, kp) => ({ x: p.x, y: p.y, kp })); // array of points - future vertices
      this.points = pts;
      let supert = [
        { x: -margin - 1, y: maxx + maxy + 3 * margin + 3 }, // points turning clockwise on a JS 2D canvas
        { x: -margin - 1, y: -margin - 1 },
        { x: maxx + maxy + 3 * margin + 3, y: -margin - 1 }
      ];
      triangulation = [new Triangle(...supert)];

      /*
             for each point in pointList do // add all the points one at a time to the triangulation
          */
      for (let kp = 0; kp < numPts; ++kp) {
        let point = pts[kp];

        /*
                  badTriangles := empty set
            */
        badTriangles = [];
        /*
                  for each triangle in triangulation do // first find all the triangles that are no longer valid due to the insertion
            */
        for (let kt = 0; kt < triangulation.length; ++kt) {
          if (triangulation[kt].inCircumCircle(point))
            badTriangles.push(triangulation[kt]);
        } // for kt

        polygon = [];
        for (let kt = 0; kt < badTriangles.length; ++kt) {
          let tri = badTriangles[kt];
          if (
            !badTriangles.some(
              (othertri) => othertri !== tri && othertri.hasEdge(tri.a, tri.b)
            )
          )
            polygon.push([tri.a, tri.b]);
          if (
            !badTriangles.some(
              (othertri) => othertri !== tri && othertri.hasEdge(tri.b, tri.c)
            )
          )
            polygon.push([tri.b, tri.c]);
          if (
            !badTriangles.some(
              (othertri) => othertri !== tri && othertri.hasEdge(tri.c, tri.a)
            )
          )
            polygon.push([tri.c, tri.a]);
        } // for kt

        /* remove bad triangles from triangulation */
        for (let kt = 0; kt < badTriangles.length; ++kt) {
          let tri = badTriangles[kt];
          triangulation.splice(triangulation.indexOf(tri), 1);
        } // for kt
        /* add triangulation new triangles built on point and polygon
         */
        polygon.forEach((edge) =>
          triangulation.push(new Triangle(point, edge[0], edge[1]))
        );
      } // points.forEach
      /* remove super-triangle */
      for (let kt = triangulation.length - 1; kt >= 0; --kt) {
        let tri = triangulation[kt];
        if (supert.includes(tri.a)) {
          triangulation.splice(kt, 1);
          continue;
        }
        if (supert.includes(tri.b)) {
          triangulation.splice(kt, 1);
          continue;
        }
        if (supert.includes(tri.c)) {
          triangulation.splice(kt, 1);
          continue;
        }
      }

      this.triangulation = triangulation;
    } // constructor

    //------------------------------------------------------------------------

    analyze() {
      this.points.forEach((p) => {
        p.tris = [];
        p.edges = [];
      });
      this.triangulation.forEach((tri) => (tri.edges = []));

      this.edgesList = new SortedArray((e0, e1) => {
        if (e0.p0.kp - e1.p0.kp) return e0.p0.kp - e1.p0.kp;
        else return e0.p1.kp - e1.p1.kp;
      });

      this.triangulation.forEach((tri) => {
        let ed = new Edge(tri.a, tri.b);
        let kedge = this.edgesList.indexOf(ed);
        if (kedge == -1) this.edgesList.doInsert();
        else ed = this.edgesList.tb[kedge];
        ed.attachTriangle(tri);
        ed = new Edge(tri.b, tri.c);
        kedge = this.edgesList.indexOf(ed);
        if (kedge == -1) this.edgesList.doInsert();
        else ed = this.edgesList.tb[kedge];
        ed.attachTriangle(tri);
        ed = new Edge(tri.c, tri.a);
        kedge = this.edgesList.indexOf(ed);
        if (kedge == -1) this.edgesList.doInsert();
        else ed = this.edgesList.tb[kedge];
        ed.attachTriangle(tri);
      });

      /* sort triangles around every point */

      this.points.forEach((p) => {
        const newEdges = [];
        const newTris = [];
        let edge0, tri;

        if (p.tris.length != p.edges.length) {
          // if point is on edge of complete figure
          edge0 = p.edges.find(
            (edge) =>
              (edge.p0 == p && edge.tris[0] && !edge.tris[1]) ||
              (edge.p1 == p && edge.tris[1] && !edge.tris[0])
          );
          if (edge0 === undefined) edge0 = p.edges[0];
        } else {
          edge0 = p.edges[0];
        }
        while (true) {
          /* find triangle with vertex p and edge edge0 starting from p and turning clockwise */
          newEdges.push(edge0);
          tri = edge0.tris[edge0.p0 == p ? 0 : 1];
          if (tri === undefined) break; // p was on perimeter, reached end
          newTris.push(tri);
          if (newEdges.length == p.edges.length) break; // made full revolution around p
          /* find other side of tri ending at p */
          switch (p) {
            case tri.a:
              edge0 = tri.edges[2];
              break; // ca
            case tri.b:
              edge0 = tri.edges[0];
              break; // ab
            case tri.c:
              edge0 = tri.edges[1];
              break;
          } // switch
        } // while (true)
        p.tris = newTris;
        p.edges = newEdges;
      });
    } // analyze
    drawEdges() {
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#ffffff80";
      this.edgesList.tb.forEach((edge) => {
        ctx.beginPath();
        ctx.moveTo(edge.p0.x, edge.p0.y);
        ctx.lineTo(edge.p1.x, edge.p1.y);
        ctx.stroke();
      });
    } // drawEdges
    //------------------------------------------------------------------------
    deleteSharps() {
      /* remove triangles with too sharp angles from the periphery of the triangulation */
      let sharps = [];
      let cosangle;
      let p0, p1, dx, dy, len;
      this.triangulation.forEach((tri) => {
        dx = [];
        dy = [];
        len = [];
        for (let k = 0; k < 3; ++k) {
          p0 = tri.vertices[k];
          p1 = tri.vertices[(k + 1) % 3];
          dx[k] = p1.x - p0.x;
          dy[k] = p1.y - p0.y;
          len[k] = mhypot(dx[k], dy[k]);
        }
        for (let k = 0; k < 3; ++k) {
          let k1 = (k + 1) % 3;
          cosangle = -(dx[k1] * dx[k] + dy[k] * dy[k1]) / len[k] / len[k1];
          if (cosangle > 0.9) {
            sharps.push(tri);
            break;
          } // very sharp angle
        }
      }); //

      while (sharps.length) {
        let found, kfound; // changed nothing (yet) during this loop
        kfound = sharps.findIndex(
          (tri) => tri.tris.filter(() => true).length < 3
        );
        if (kfound == -1) break; // no more triangle to remove
        found = sharps[kfound]; // found one to delete ...
        sharps.splice(kfound, 1); // remove from list
        /* remove  this triangle from
             - its neighbors' neighborhood
             - its edges
             if an edge becomes empty, remove it from edges AND points'edges
             - its vertices
             */
        found.tris.forEach((neigh) => {
          // neighbors' neighborhood
          let kn = neigh.tris.indexOf(found);
          delete neigh.tris[kn];
        });
        found.edges.forEach((ed) => {
          // edges
          let kn = ed.tris.indexOf(found);
          delete ed.tris[kn];
          if (ed.tris.reduce((sum, el) => (el ? 1 : 0), 0) == 0) {
            // edge becomes empty
            this.edgesList.tb.splice(this.edgesList.tb.indexOf(ed), 1);
            ed.p0.edges.splice(ed.p0.edges.indexOf(ed), 1);
            ed.p1.edges.splice(ed.p1.edges.indexOf(ed), 1);
            // the disappearance of the points will be processed when deleting vertices. Maybe, not sure it is useful
          }
        });
        found.vertices.forEach((p) => {
          // vertices
          p.tris.splice(p.tris.indexOf(found), 1);
          if (p.tris.length == 0) this.points.splice(this.points.indexOf(p), 1); // indices of points become pointless
        });
        tr.triangulation.splice(tr.triangulation.indexOf(found), 1);
      } // while
    } // deleteSharps
  } // Delaunay
  //------------------------------------------------------------------------
  class BridsonPoint {
    constructor(brid, x, y) {
      this.x = x;
      this.y = y;
      this.kx = Math.floor(x / brid.square);
      this.ky = Math.floor(y / brid.square);
    }
    distance(p) {
      return mhypot(this.x - p.x, this.y - p.y);
    } // distance
  } // BridsonPoint
  //------------------------------------------------------------------------
  class Bridson {
    /* based on https://sighack.com/post/poisson-disk-sampling-bridsons-algorithm */

    constructor(width, height, dist, nbTries) {
      /* area is 0..width, 0..height
          creates a set of points in this area */
      this.width = width;
      this.height = height;
      this.dist = dist;
      this.nbTries = nbTries;

      // create a grid with the right dimensions
      this.square = this.dist / Math.sqrt(2);
      this.nbx = mceil(width / this.square);
      this.nby = mceil(height / this.square);

      const terrain = new Array(this.nby)
        .fill(0)
        .map((v, ky) => new Array(this.nbx).fill(-1));
      this.terrain = terrain;
      const points = [];
      this.points = points;

      const list = [];
      this.list = list;
      // pick 1st point at random and record it
      let x = alea(width);
      let y = alea(height);
      list.push(new BridsonPoint(this, x, y)); // initialize list with a point
      points.push(list[0]);
      terrain[list[0].ky][list[0].kx] = list[0];

      while (list.length) {
        let posp = intAlea(list.length);
        let p = list[posp];
        let found = false;

        for (let k = 0; k < nbTries; ++k) {
          let p1 = this.rndr2r();
          p1 = new BridsonPoint(this, p.x + p1.x, p.y + p1.y);
          if (this.isAcceptable(p1)) {
            found = true;
          }
        } // for k
        if (!found) list.splice(posp, 1);
      } // while list.length
      // add each BridsonPoint its index in "points"
      points.forEach((p, k) => (p.kList = k));
    } // constructor

    rndr2r() {
      /* returns a random point at a distance from origin between this.dist and 2 * this.dist
              with constant density
          */
      //                    const r = this.dist * msqrt(1 + 3 * Math.random());  // that's the key!
      let rnd = Math.random();
      rnd *= rnd;
      const r = this.dist * (1 + rnd * rnd); // rnd ^ 4 : higher density at lower radius
      const th = Math.PI * Math.random() * 2;
      return { x: r * Math.cos(th), y: r * Math.sin(th) };
    } // rndr2r

    isAcceptable(p) {
      if (p.x < 0 || p.x >= this.width || p.y < 0 || p.y >= this.height)
        return false; // out of area !

      let kx0 = mmax(0, p.kx - 2),
        kx1 = mmin(p.kx + 2, this.nbx - 1);

      loop2: for (
        let kky = mmax(0, p.ky - 2);
        kky <= mmin(p.ky + 2, this.nby - 1);
        ++kky
      ) {
        for (let kkx = kx0; kkx <= kx1; ++kkx) {
          if (this.terrain[kky][kkx] != -1) {
            if (
              mhypot(
                p.x - this.terrain[kky][kkx].x,
                p.y - this.terrain[kky][kkx].y
              ) <= this.dist
            )
              return false;
          }
        } // for kkx
      } // for kky
      // this point is acceptable
      this.terrain[p.ky][p.kx] = p; // record new point
      this.list.push(p);
      this.points.push(p);
      return true;
    }

    closest(p) {
      /* finds closest point */
      /* tries points in a +/- n squares area around the point */
      let n = 1;
      let prox = 9e99;
      let closep;
      let p1, d;
      while (true) {
        for (
          let k = mmax(0, p.kx - n);
          k <= mmin(p.kx + n, this.nbx - 1);
          ++k
        ) {
          if (p.ky - n >= 0 && (p1 = this.terrain[p.ky - n][k])) check();
          if (p.ky + n < this.nby && (p1 = this.terrain[p.ky + n][k])) check();
        } // for k
        for (
          let k = mmax(0, p.ky - n + 1);
          k <= mmin(p.ky + n - 1, this.nby - 1);
          ++k
        ) {
          if (p.kx - n >= 0 && (p1 = this.terrain[k][p.kx - n])) check();
          if (p.kx + n < this.nbx && (p1 = this.terrain[k][p.kx + n])) check();
        } // for k
        if (closep) break;
        ++n;
      } // while
      return closep;
      function check() {
        d = p.distance(p1);
        if (d < prox) {
          closep = p1;
          prox = d;
        }
      } // check;
    }
  } // Bridson
  //------------------------------------------------------------------------
  class Polygon {
    constructor(p) {
      /* p is a point in a Delaunay triangulation */
      this.vertices = p.edges.map((edge) => edge.middle);
      let hue = intAlea(360);
      this.color = `hsl(${hue} ${intAlea(60, 100)}% ${intAlea(30, 70)}%)`;
      this.strokeColor = `hsl(${hue + 180} 100% 50%)`;
      this.strokeChoice = [
        "white",
        this.strokeColor,
        "black",
        this.strokeColor
      ];
    } // constructor

    draw(stroke) {
      let nextMiddle;
      ctx.beginPath();
      let p0 = lerp(this.vertices.at(-1), this.vertices[0], 0.5);
      ctx.moveTo(p0.x, p0.y);
      this.vertices.forEach((p, k) => {
        nextMiddle = lerp(
          p,
          this.vertices[(k + 1) % this.vertices.length],
          0.5
        );
        ctx.quadraticCurveTo(p.x, p.y, nextMiddle.x, nextMiddle.y);
      }); // p.edges.forEach
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
      if (stroke) {
        ctx.strokeStyle = this.strokeChoice[displayCycle];
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    } // draw
  } // class Polygon
  //------------------------------------------------------------------------
  function selectPolygons() {
    polygons = [];

    tr.edgesList.tb.forEach((edge) => {
      edge.fMiddle = Noise1D(
        intAlea(500 / SPEED, 1000 / SPEED),
        0.2,
        0.8,
        hashFunction()
      );
      edge.middle = lerp(edge.p0, edge.p1, edge.fMiddle(performance.now()));
    });

    tr.points.forEach((p) => {
      if (p.edges.length != p.tris.length) return; // need point with triangles all around it
      polygons.push(new Polygon(p));
    }); // tr.points.forEach
  } // selectPolygons
  //------------------------------------------------------------------------
  let animate;
  {
    // scope for animate

    let animState = 0;
    let tInit, duration;
    animate = function (tStamp) {
      let message;

      message = messages.shift();
      if (message && message.message == "reset") animState = 0;
      if (message && message.message == "click") animState = 0;
      window.requestAnimationFrame(animate);

      switch (animState) {
        case 0:
          startOver();
          animState = 99; // no transition
          break;

        case 99:
          ctx.fillStyle = ["#0000000f", "#ffffff0f"][displayCycle >> 1];
          ctx.fillRect(0, 0, maxx, maxy);
          tr.edgesList.tb.forEach((edge) => {
            let p = lerp(edge.p0, edge.p1, edge.fMiddle(performance.now()));
            edge.middle.x = p.x;
            edge.middle.y = p.y;
          });

          polygons.forEach((poly) => poly.draw(true));
      } // switch
    }; // animate
  } // scope for animate
  //------------------------------------------------------------------------
  //------------------------------------------------------------------------
  function startOver() {
    // canvas dimensions
    maxx = window.innerWidth;
    maxy = window.innerHeight;

    let lRef = msqrt(maxx * maxy);
    distBridson = lRef * alea(DIST_BRIDSON_MIN, DIST_BRIDSON_MAX);
    const margin = distBridson; // (hide periphery) or slighly negative values (see periphery) make sense */

    canv.width = maxx;
    canv.height = maxy;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ++displayCycle;
    displayCycle %= 4;

    ctx.fillStyle = ["#000000", "#ffffff"][displayCycle >> 1];
    ctx.fillRect(0, 0, maxx, maxy);

    let init = performance.now();
    let t = new Bridson(maxx + 2 * margin, maxy + 2 * margin, distBridson, 30);
    let points = generatePoints(t); // shallow copy of BridsonPoints, without all the stuff which was only useful to creating the points
    points.forEach((p) => {
      p.x -= margin;
      p.y -= margin;
    });
    tr = new Delaunay(points, maxx, maxy, margin);
    tr.analyze();
    tr.triangulation.forEach((tri) => tri.listTris());
    tr.deleteSharps();
    tr.points.forEach(
      (p) =>
        (p.neighbors = p.edges.map((edge) =>
          edge.p0 == p ? edge.p1 : edge.p0
        ))
    );
    selectPolygons();

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
    canv.setAttribute("title", "click me");
  } // creation CANVAS

  displayCycle = 3; // so that it will actually begin with 0
  canv.addEventListener("click", mouseClick);
  messages = [{ message: "reset" }];
  requestAnimationFrame(animate);
}); // window load listener
