"use strict";

let canv, ctx; // canvas and context
//            let maxx, maxy;   // canvas dimensions
let tr;
let maxx, maxy;
let screenh, screenw;
let img1, img2;
let oimg1, oimg2;

// for animation
const messages = [];

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
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function lerp(p0, p1, alpha) {
  const uma = 1 - alpha;
  return {
    x: uma * p0.x + alpha * p1.x,
    y: uma * p0.y + alpha * p1.y,
  };
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function cutQ(quadra, alpha) {
  // cut quadratic
  /* quadra is a set of 3 points definining a quadratic Bézier curve
      this function returns a set of 2 quadratic curves (sets of 3 points) repsenting a division of the 2 initial curves,
      cut at an intermediate point defined by alpha (0..1)
      the two sub-arcs share a common point, and re-use copies of quadra
      caution : alpha is not a length ratio, it is only the value of the t variable of the parametric equation of the curve
      */
  const pa = lerp(quadra[0], quadra[1], alpha);
  const pb = lerp(quadra[1], quadra[2], alpha);
  const pc = lerp(pa, pb, alpha);
  return [
    [quadra[0], pa, pc],
    [pc, pb, quadra[2]],
  ];
} // cutQ

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
    // includes a triangle in an edge's tris array
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
    this.edges = [];
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
    this.g = {
      x: (this.a.x + this.b.x + this.c.x) / 3,
      y: (this.a.y + this.b.y + this.c.y) / 3,
    };
  } // listTris

  //------------------------------------------------------------------------
  inTriangle(p) {
    let va = { x: this.a.x - p.x, y: this.a.y - p.y };
    let vb = { x: this.b.x - p.x, y: this.b.y - p.y };
    let vc = { x: this.c.x - p.x, y: this.c.y - p.y };
    if (va.x * vb.y - va.y * vb.x < 0) return false;
    if (vb.x * vc.y - vb.y * vc.x < 0) return false;
    if (vc.x * va.y - vc.y * va.x < 0) return false;
    return true;
  } // inTriangle
} // Triangle

//------------------------------------------------------------------------
function createPath(tr) {
  tr.triangulation.forEach((tri) => {
    delete tri.path;
    delete tri.links;
  });
  let tri, l1, l2;

  const path = [];

  // begin with triangle close to the center - arbitrary choice
  const picked = [
    tr.triangulation.find((tri) =>
      tri.inTriangle({ x: screenw / 2, y: screenh / 2 })
    ),
  ];

  path.tr0 = picked[0]; // root of path
  while (picked.length) {
    tri = picked[intAlea(picked.length)];

    pwet: while (true) {
      let ntri = tri;

      path.push(tri);
      tri.path = path;
      let possibles = [];
      tri.edges.forEach((edge) => {
        let otherTri = edge.tris[0] === tri ? edge.tris[1] : edge.tris[0];
        if (!otherTri) return; // no other triangle here
        if (
          otherTri.vertices.find((vert) => !vert.tris.find((ttri) => ttri.path))
        )
          possibles.push(otherTri);
      });
      while (possibles.length) {
        tri = possibles.splice(intAlea(possibles.length), 1)[0];
        picked.push(tri);
        // record which sides is connected to which triangle
        // on tri side
        let kedge = ntri.edges.findIndex((edge) => tri.edges.includes(edge));

        ntri.links = ntri.links || [];
        ntri.links.push((l1 = { kedge, tri: ntri }));
        kedge = tri.edges.findIndex((edge) => ntri.edges.includes(edge));

        tri.links = tri.links || [];
        tri.links.push((l2 = { kedge, tri }));
        l1.reciprocal = l2;
        l2.reciprocal = l1;
        if (ntri == path.tr0) break; // because we want tr0 to be at the end of a branch
        continue pwet;
      } // while possibles.length
      picked.splice(picked.indexOf(ntri), 1); // no more possibilities on this triangles, throw it
      break;
    } // while true;
  } // while (picked.length)
  return path;
} // createPath

//------------------------------------------------------------------------
function smoothPath(path) {
  path.forEach((tri) => (tri.picked = false));

  // replace actual centroid of triangle by point at 1/2 lenth of median if only 2 links
  path.forEach((tri) => {
    if (tri.links.length != 2) return;
    // base side is the one not in the kedges of the links
    let kbase = [0, 1, 2];
    kbase.splice(tri.links[0].kedge, 1);
    kbase.splice(kbase.indexOf(tri.links[1].kedge), 1);
    kbase = kbase[0];
    tri.g = lerp(tri.vertices[kbase], tri.vertices[(kbase + 1) % 3], 0.5); // middle of base
    tri.g = lerp(tri.g, tri.vertices[(kbase + 2) % 3], 0.5); // middle of base
  });

  (function smoothSubPath(tri) {
    let ntri, pinterm, nlink;

    if (tri.picked) return; // already processed
    tri.picked = true; // will be processed now
    if (tri.links.length == 2) tri.curved = true;
    tri.links.forEach((link) => {
      if (link.pinterm) return; // this link already studied coming from other side

      ntri = link.reciprocal.tri;
      pinterm = lerp(tri.g, ntri.g, 0.5);
      link.pinterm = pinterm;
      link.reciprocal.pinterm = pinterm;
      smoothSubPath(ntri);
    });
  })(
    // smoothSubPath
    path.tr0
  );
} // smoothPath

//------------------------------------------------------------------------
function createInnerPerimeter(path) {
  /* "walks" around the path, starting from path.tr0.g and turning cw like the external perimeter
      describes this "inner perimeter" as a list of links, the first being travelled from edge to center, the second from center to edge
      remark : two consecutive links may be the same (U-turn at the end of branches)
      */

  let nlink, tri;
  let link = path.tr0.links[0]; // we know there is only one for this first
  const innerp = [];

  do {
    innerp.push(link);
    tri = link.tri; // current triangle

    // find next link , beginning by the 1st clockwise
    nlink = tri.links.find((l) => l.kedge == (link.kedge + 1) % 3);
    if (!nlink) nlink = tri.links.find((l) => l.kedge == (link.kedge + 2) % 3);
    if (!nlink) nlink = link; // (U turn)
    innerp.push(nlink);

    link = nlink.reciprocal;
  } while (link !== path.tr0.links[0]);

  return innerp;
} // createInnerPerimeter

//------------------------------------------------------------------------
function createPerimeter(tr, path) {
  // after createPath, create a closed path with the edges of triangles surrounding the path
  let tri, kp;
  if (path.length == 1) return; // special case, will be studied later
  const perim = [];
  tri = path.tr0;

  // find starting point, vertex of 1st triangle which does not belong to neighbor triangle
  kp = tri.vertices.findIndex(
    (p) => !tri.links[0].reciprocal.tri.vertices.includes(p)
  );

  let p0 = tri.vertices[kp];
  perim.push(p0);
  p0.ktriafter = p0.ktribefore = p0.tris.indexOf(tri);
  p0.kper = 0;
  let p = p0;
  while (true) {
    // search for the point which comes after p = tri.vertices[kp]

    if (
      (!p.edges[0].tris[0] || !p.edges[0].tris[1]) &&
      p.tris[0].path == path
    ) {
      kp = 1;
      tri = p.tris[0];
      p.ktriafter = 0;
    } else {
      tri = p.tris.find(
        (tri, k) =>
          tri.path == path &&
          (!p.tris[(k + p.tris.length - 1) % p.tris.length] ||
            p.tris[(k + p.tris.length - 1) % p.tris.length].path != path)
      );
      p.ktriafter = p.tris.indexOf(tri);
    }

    kp = (tri.vertices.indexOf(p) + 1) % 3;
    p = tri.vertices[kp];
    p.ktribefore = p.tris.indexOf(tri);

    if (p == p0) break;
    p.kper = perim.length; // index of point in perimeter
    perim.push(p);
  } // while (true)

  let prevp = perim[perim.length - 1];
  perim.forEach((p, k) => {
    let n = p.ktribefore - p.ktriafter;
    if (n < 0) n += p.tris.length;
    p.nbTrisPer = n + 1; // number of triangles involved in perimeter
    let np = lerp(prevp, p, 0.5);
    prevp.pafter = np;
    p.pbefore = np;
    prevp = p;
  });
  return perim;
} // createPerimeter
//------------------------------------------------------------------------
function matchPerimeters(inner, outer) {
  /* will attach every point in outer the list of correponding links from inner
       (this list may be empty in the case of a U-turn of the perimeter)
      */
  let anim = [],
    anim1,
    arcs;
  /* let us begin as if entering simulate we have just processed the last link of inner perimeter */
  let kinner = 1;
  outer.forEach((pouter) => {
    pouter.inner = [];
    if (pouter.nbTrisPer == 1) {
      // special case for U-turns
      let tri = pouter.tris[pouter.ktribefore];
      anim.push([
        [tri.g, tri.g, tri.g],
        [pouter.pbefore, pouter, pouter.pafter],
      ]);
    } else {
      /* cut the outer perimeter bezier quadratic into as many parts as required to match every inner perimeter corresponding part
       */
      let nbParts = (pouter.nbTrisPer - 1) * 2;
      let initArc = [pouter.pbefore, pouter, pouter.pafter];
      for (let k = 0; k < nbParts; ++k) {
        if (k == nbParts - 1) {
          // no need to cut for the last piece !
          anim1 = [initArc];
        } else {
          arcs = cutQ(initArc, 1 / (nbParts - k));
          anim1 = [arcs[0]];
          initArc = arcs[1];
        }
        /* done with the outer part. inner, now */
        let link = inner[kinner++];
        if (kinner >= inner.length) kinner = 0; // only useful for last point
        if (link.tri.links.length != 2) {
          // inner is a straight line segment
          let pts = [link.tri.g, link.pinterm];
          if (k & 1) pts.reverse(); // for link entering the triangle (tested by parity of k...)
          anim1.unshift([pts[0], lerp(pts[0], pts[1], 0.5), pts[1]]);
        } else {
          // inner is a quadratic
          let outlink =
            link.tri.links[0] == link ? link.tri.links[1] : link.tri.links[0];
          arcs = cutQ([link.pinterm, link.tri.g, outlink.pinterm], 0.5); // will be done twice, sorry
          if (!(k & 1)) arcs[0].reverse();
          anim1.unshift(arcs[0]);
        } // inner is a quadratic
        anim.push(anim1);
      } // for k
    } // not U_turn
  }); // outer.forEach;
  return anim;
} // matchPerimeters

//------------------------------------------------------------------------
function createExternalPaths(tr) {
  /* make list of "external triangles" not involved in path created at createPath */
  let l1, l2;
  const listeTris = tr.triangulation.filter((tri) => !tri.path);

  const externalPaths = [];

  while (listeTris.length) {
    /* pick a triangle */
    let tri = listeTris[intAlea(listeTris.length)];
    const picked = [tri]; // list of triangles to start from to continue a path being created
    const path = [];
    // simulate we are coming from some side - (fake)

    while (picked.length) {
      tri = picked[intAlea(picked.length)];

      pwet: while (true) {
        let ntri = tri;

        if (!path.includes(tri)) path.push(tri);
        tri.path = path;

        let possibles = [];
        tri.edges.forEach((edge) => {
          let otherTri = edge.tris[0] === tri ? edge.tris[1] : edge.tris[0];
          if (!otherTri) return; // no other triangle here
          if (otherTri.path) return;
          possibles.push(otherTri);
        });
        while (possibles.length) {
          tri = possibles.splice(intAlea(possibles.length), 1)[0];
          if (!picked.includes(tri)) picked.push(tri);
          // record which sides is connected to which triangle
          // on tri side
          let kedge = ntri.edges.findIndex((edge) => tri.edges.includes(edge));

          ntri.links = ntri.links || [];
          ntri.links.push((l1 = { kedge, tri: ntri }));
          kedge = tri.edges.findIndex((edge) => ntri.edges.includes(edge));

          tri.links = tri.links || [];
          tri.links.push((l2 = { kedge, tri }));
          l1.reciprocal = l2;
          l2.reciprocal = l1;

          continue pwet;
        } // while possibles.length
        picked.splice(picked.indexOf(ntri), 1); // no more possibilities on this triangles, throw it
        break;
      } // while true;
    } // while (picked.length)
    externalPaths.push(path);
    path.forEach((tri) => listeTris.splice(listeTris.indexOf(tri), 1)); // remove its triangles from listeTris
    /* check for singularity and reject if found
        singularity : at leat one one of the vertices inside path in completely surrounded by triangles of path
        */
    if (
      path.some((tri) =>
        tri.vertices.some(
          (v) =>
            v.tris.length == v.edges.length &&
            v.tris.every((t) => t.path == tri.path)
        )
      )
    ) {
      return false;
    }
  } // while (listeTris.length)

  /* search suitable starting triangle for each path */
  externalPaths.forEach((path) => {
    path.tr0 = path.find((tri) => tri.links && tri.links.length == 1);
    /* path.tr0 MAY be undefined (if and only if path.length == 1) */
  });

  return externalPaths;
} // createExternalPaths

//------------------------------------------------------------------------

class Delaunay {
  /* based on https://en.wikipedia.org/wiki/Bowyer%E2%80%93Watson_algorithm
   */
  /* version which does not only return the triangles, but describes the relations between vertices, edges, and triangles
   */

  constructor(points, maxx, maxy) {
    /* maxx and maxy are given here ONLY to determine the initial triangle, assuming
        all points are in a (0, 0)-(maxx, maxy) rectangle
        actual extreme coordinates of points could be used instead of maxx and maxy
        maxx and maxy are both supposed > 0
        */

    let triangulation, badTriangles, polygon;

    /*   triangulation := empty triangle mesh data structure*/
    /* add super-triangle to triangulation // must be large enough to completely contain all the points in pointList */
    /* the super-triangle has a vertex in [-1, -1] and 2 sides parallel to the axis
        The 3rd side is a 45 degrees slanted line passing by [maxx + 1, maxy + 1]
        /!\ CAUTION : all triangles generated will have the same orientation as this initial super-triangle
        */
    const numPts = points.length;

    const pts = points.map((p, kp) => ({
      x: p.x,
      y: p.y,
      kp,
      tris: [],
      edges: [],
    })); // array of points - future vertices
    this.points = pts;
    let supert = [
      { x: -1, y: maxx + maxy + 3 }, // points turning clockwise on a JS 2D canvas
      { x: -1, y: -1 },
      { x: maxx + maxy + 3, y: -1 },
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
      // delete values - only useful for 2nd pass of analyze
      p.edges = [];
      p.tris = [];
    });
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

      this.triangulation.splice(this.triangulation.indexOf(found), 1);
    } // while

    /* now, got to re-index edges and tris at vertices on perimeter, so that edges on the external side is between indices 0 and max */
    this.analyze();
  } // deleteSharps
} // Delaunay

//------------------------------------------------------------------------
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
    //
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
      for (let k = mmax(0, p.kx - n); k <= mmin(p.kx + n, this.nbx - 1); ++k) {
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
function drawAnimPath(anim, alpha, path) {
  // just the canvas path - no stroke, no fill
  let s0, s1, p, pa, pb;
  anim.forEach((seg, k) => {
    (s0 = seg[0]), (s1 = seg[1]);
    if (k == 0) {
      p = lerp(s0[0], s1[0], alpha);
      path.moveTo(p.x, p.y);
    }
    if (alpha != 0) {
      pa = lerp(s0[1], s1[1], alpha);
      pb = lerp(s0[2], s1[2], alpha);
      path.quadraticCurveTo(pa.x, pa.y, pb.x, pb.y);
    }
  });
  path.closePath();
  return path;
} // drawAnimPath
//--------------------------------------------------------------------
function img1Loaded() {
  if (img1.width == 0) return; // abnormal, give up
  oimg1.width = img1.width;
  oimg1.height = img1.height;
  anyLoaded();
} // img1Loaded
//--------------------------------------------------------------------
function img2Loaded() {
  if (img1.width == 0) return; // abnormal, give up
  oimg2.width = img2.width;
  oimg2.height = img2.height;
  anyLoaded();
} // img2Loaded

//--------------------------------------------------------------------

function anyLoaded() {
  let refx, refy;
  let w, h, ofsx, ofsy;

  if (oimg1.width) {
    refx = oimg1.width;
    refy = oimg1.height;
  } else {
    refx = oimg2.width;
    refy = oimg2.height;
  }

  maxx = window.innerWidth;
  maxy = window.innerHeight;

  if (refx / refy > maxx / maxy) {
    screenw = maxx;
    screenh = (maxx / refx) * refy;
  } else {
    screenh = maxy;
    screenw = (maxy / refy) * refx;
  }

  canv.width = screenw;
  canv.height = screenh;
  canv.style.left = (maxx - screenw) / 2 + "px";
  canv.style.top = (maxy - screenh) / 2 + "px";

  oimg1.canv = oimg1.canv || document.createElement("canvas");
  oimg2.canv = oimg2.canv || document.createElement("canvas");

  oimg1.canv.width = oimg2.canv.width = screenw;
  oimg1.canv.height = oimg2.canv.height = screenh;

  oimg1.ctx = oimg1.canv.getContext("2d");
  oimg2.ctx = oimg2.canv.getContext("2d");

  // prepare fake black picture
  oimg1.ctx.setfillStyle = "black";
  oimg1.ctx.fillRect(0, 0, screenw, screenh);
  oimg2.ctx.setfillStyle = "black";
  oimg2.ctx.fillRect(0, 0, screenw, screenh);
  // copy and resize picture to context
  if (img1.width) {
    if (img1.width / img1.height > screenw / screenh) {
      h = img1.height;
      w = (screenw * h) / screenh;
    } else {
      w = img1.width;
      h = (screenh * w) / screenw;
    }
    ofsx = (img1.width - w) / 2;
    ofsy = (img1.height - h) / 2;
    oimg1.ctx.drawImage(img1, ofsx, ofsy, w, h, 0, 0, screenw, screenh);
  }
  oimg1.pattern = oimg1.ctx.createPattern(oimg1.canv, "repeat");

  if (img2.width) {
    if (img2.width / img2.height > screenw / screenh) {
      h = img2.height;
      w = (screenw * h) / screenh;
    } else {
      w = img2.width;
      h = (screenh * w) / screenw;
    }
    ofsx = (img2.width - w) / 2;
    ofsy = (img2.height - h) / 2;
    oimg2.ctx.drawImage(img2, ofsx, ofsy, w, h, 0, 0, screenw, screenh);
  }
  oimg2.pattern = oimg2.ctx.createPattern(oimg2.canv, "repeat");

  messages.push({ message: "ready" });
} // anyLoaded

//------------------------------------------------------------------------
//------------------------------------------------------------------------

let animate;

{
  // scope for animate

  let animState = 0;
  let anim0;
  let anims;
  let alpha;
  let outer;
  let inner;
  let external;

  animate = function (tStamp) {
    let message;
    let p;
    let s0, s1, pa, pb;
    let anim;
    let path;

    message = messages.shift();
    if (message && message.message == "ready" && img1.width && img2.width)
      animState = 1;
    window.requestAnimationFrame(animate);
    switch (animState) {
      case 0:
        break;

      case 1:
        startOver();
        path = createPath(tr);
        smoothPath(path);
        outer = createPerimeter(tr, path); // must be done before createExternalPaths

        external = createExternalPaths(tr);
        if (!external) {
          animState = 1;
          return;
        }
        inner = createInnerPerimeter(path);
        anim0 = matchPerimeters(inner, outer);
        ++animState;
        break;

      case 2:
        anims = [];
        external.forEach((path) => {
          if (path.length > 1) {
            let perim = createPerimeter(tr, path);
            smoothPath(path);
            inner = createInnerPerimeter(path);
            anim = matchPerimeters(inner, perim);
          } else {
            // only one triangle : directly build anim
            const tri = path[0];
            const pa = lerp(tri.a, tri.b, 0.5);
            const pb = lerp(tri.b, tri.c, 0.5);
            const pc = lerp(tri.c, tri.a, 0.5);
            anim = [
              [
                [tri.g, tri.g, tri.g],
                [pa, tri.b, pb],
              ],
              [
                [tri.g, tri.g, tri.g],
                [pb, tri.c, pc],
              ],
              [
                [tri.g, tri.g, tri.g],
                [pc, tri.a, pa],
              ],
            ];
          }
          anims.push(anim);
        });

        alpha = 0.05;
        ++animState;
        break;

      case 3:
        ctx.rect(0, 0, screenw, screenh);
        ctx.fillStyle = oimg1.pattern;
        ctx.fill();

        path = drawAnimPath(anim0, alpha, new Path2D());
        ctx.fillStyle = oimg2.pattern;
        ctx.fill(path);
        alpha += 0.02;
        if (alpha > 1.01) {
          ++animState;
          alpha = 1.01;
        }
        break;

      case 4:
        ctx.rect(0, 0, screenw, screenh);
        ctx.fillStyle = oimg1.pattern;
        ctx.fill();
        path = new Path2D();
        anims.forEach((anim) => {
          drawAnimPath(anim, alpha, path);
        });
        path.rect(-1, -1, screenw + 2, screenh + 2);
        ctx.fillStyle = oimg2.pattern;
        ctx.fill(path, "evenodd");
        alpha -= 0.02;
        if (alpha <= 0) {
          ctx.rect(0, 0, screenw, screenh);
          ctx.fillStyle = oimg2.pattern;
          ctx.fill();
          ++animState;
        }
        break;

      case 5:
        if (message && message.message == "click") {
          [oimg1, oimg2] = [oimg2, oimg1];
          animState = 1;
          break;
        }
    } // switch
  }; // animate
} // scope for animate

//------------------------------------------------------------------------
//------------------------------------------------------------------------

function startOver() {
  // canvas dimensions
  /*
              maxx = window.innerWidth;
              maxy = window.innerHeight;

              canv.width = screenw;
              canv.height = screenh;
              canv.style.left = (maxx - screenw) / 2 + 'px';
              canv.style.top = (maxy - screenh) / 2 + 'px';
              /*
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
              */
  const distBridson = msqrt(screenw * screenh) / alea(20, 40);
  const margin = 1.5 * distBridson; // distBrinson or 0 or slightly negative values make sense

  let t = new Bridson(
    screenw + 2 * margin,
    screenh + 2 * margin,
    distBridson,
    30
  );
  let points = generatePoints(t);
  tr = new Delaunay(points, screenw + 2 * margin, screenh + 2 * margin);
  tr.points.forEach((p) => {
    p.x -= margin;
    p.y -= margin;
  });
  tr.triangulation.forEach((tri) => {
    tri.xc -= margin;
    tri.yc -= margin;
  });
  tr.analyze();
  tr.triangulation.forEach((tri) => tri.listTris());
  tr.deleteSharps();

  return true;
} // startOver

//------------------------------------------------------------------------

function mouseClick(event) {
  messages.push({ message: "click", event });
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

canv.addEventListener("click", mouseClick);

img1 = new Image();
oimg1 = {}; // associated object is empty
img1.addEventListener("load", img1Loaded);

img2 = new Image();
oimg2 = {}; // associated object is empty
img2.addEventListener("load", img2Loaded);

requestAnimationFrame(animate);

//  img1.src = './Mona_Lisa.jpg'
//  img2.src = './Meisje_met_de_parel.jpg';

img1.src = "/618.Transition/img/Mona_Lisa.jpg";
img2.src =
  "/618.Transition/img/Meisje_met_de_parel.jpg";
