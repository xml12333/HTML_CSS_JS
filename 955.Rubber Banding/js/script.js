import { Vec2 } from "https://esm.sh/wtc-math";
import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js";

console.clear();


// --- SETTINGS ---
const settings = {
  numPoints: 8,
  padding: 100,
  ropeEnds: .5,
  dimensions: new Vec2(window.innerWidth, window.innerHeight),
  dpr: 2,
  ballRadius: window.innerWidth/30,
  rafid: 0,
  lineWidth: window.innerWidth/80,
  linePadding: 0,
  anchorPadding: 100,
  drawPoints: true,
  debug: false,
  speed: 1,
  foreground: "#EEE",
  background: "#33333A",
}
// --- PANE ---
const pane = new Pane();
const f1 = pane.addFolder({
  title: "Config",
  expanded: false
});
const pointSetting = f1.addBinding(settings, "numPoints", {
  step: 1,
  min: 1,
  max: 50,
});
pointSetting.on('change', (e) => {
  const diff = e.value - points.length;
  if(diff < 0) {
    points.splice(diff, Math.abs(diff));
  } else if(diff > 0) {
    points.push(...new Array(diff)
      .fill(null)
      .map((
        makePoint
      )));
  }
})
f1.addBinding(settings, "anchorPadding", {
  min: -100,
  max: 200,
})
f1.addBinding(settings, "ropeEnds", {
  min: .3,
  max: .7,
})
const radiusSetting = f1.addBinding(settings, "ballRadius", {
  min: 0,
  max: 100,
})
const linewidthSetting = f1.addBinding(settings, "lineWidth", {
  min: 0,
  max: 30,
})
const linepaddinSgetting = f1.addBinding(settings, "linePadding", {
  min: 0,
  max: 30,
})
function metricChange() {
  settings.lineDistance = settings.ballRadius+settings.lineWidth/2+settings.linePadding;
}
radiusSetting.on("change", metricChange)
linewidthSetting.on("change", metricChange)
linepaddinSgetting.on("change", metricChange)
f1.addBinding(settings, "drawPoints")
f1.addBinding(settings, "debug")
f1.addBinding(settings, "speed", {
  min: 0,
  max: 5,
})
f1.addBinding(settings, "foreground")
f1.addBinding(settings, "background")
settings.lineDistance = settings.ballRadius+settings.lineWidth/2+settings.linePadding;

// --- CANVAS setup ---
const c = document.createElement('canvas');
c.width = window.innerWidth*settings.dpr;
c.height = window.innerHeight*settings.dpr;
document.body.appendChild(c);
const ctx = c.getContext('2d');
ctx.save();
// ctx.imageSmoothingEnabled= false
ctx.scale(settings.dpr,settings.dpr);


// --- Functions ---
// Basic 2d cross product
const crossp = (a, b) => {
  return a.x*b.y - a.y*b.x;
}
// Finds the tangent points on one segment (defined by 2 points)
// start is the tangent for point 1
// end is the tangent for point 2
//       t1-----------------t2
//       |                  |
//    +--|--+            +--|--+
//    |  p1 |------------|  p2 |
//    +--|--+            +--|--+
//       |                  |
//       start(p1)         end(p2)
//
// The 'normal' vector is the line from the center (p1) to the tangent point (t1) and from the center (p2) to the tangent point (t2).
// The tangent points (t1 and t2) are offset from p1 and p2 by the radius along the normal vector.
// If you turn on "debug" in the settings, you'll see the difference between the normal and the two tangents that make up the arc.
const getTangentPoints = (p1, p2, radius = settings.lineDistance) => {
  // Vector from the first to the second circle's center
  const dir = p2.subtractNew(p1).normalise();
  // The normal vector, rotated 90 degrees CW, points "outward" from the hull line
  // Vec2(-dir.y, dir.x) will produce a CCW rotation, making it look like the hull is wrapped around the innter side.
  const normal = new Vec2(dir.y, -dir.x);
  // The tangent points are offset from the centers by the radius along the normal
  const t1 = p1.addNew(normal.scaleNew(radius));
  const t2 = p2.addNew(normal.scaleNew(radius));
  return { start: t1, end: t2, radius, normal };
};
// Makes a point, used in maps when initializing or updating the points array.
function makePoint() {
  const os = Math.random() - .5;
  const v = new Vec2(
    settings.padding + Math.random()*(settings.dimensions.width-settings.padding*2), 
    0
  ) // Just setting a random x position.
  v.os = os; // Time offset, used for sinewave animation
  v.dir = Math.sign(Math.random()-.5)*Math.random()*2; // Direction - 1 = forward, -1 = backward.
  return v;
}
// Find hull. This function implements Jarvis March, also known as the Gift Wrapping algorithm, to find the convex hull of a set of points. The convex hull is the smallest convex polygon that contains all the points. Imagine a set of nails on a board; the convex hull is the shape a rubber band would form if stretched around all the nails.
// Sort the array and find the start point (making sure the left-most point is also at index 0)
// From the current point on the hull, the algorithm "wraps" around the set of points by finding the next point that creates the largest counter-clockwise (CCW) turn. It does this by iterating through all other points and using a cross product calculation. The cross product of two vectors tells you the orientation of the vectors relative to each other.
// If the cross product is positive, the new candidate point is to the "left" of the current best candidate, making it a better choice for the hull.
// If the cross product is negative, the new candidate point is to the "right" and is ignored.
function findHull(ps, debugCross = new Map()) {
  ps.sort((a, b) => a.x - b.x); // Sort the points left-to-right
  const startPoint = ps[0]
  const hull = [startPoint.clone()];
  let currentPoint = startPoint, nextPoint;
  let i = 0;
  do {
    if(i++ > 1000) break; // Break out condition
    nextPoint = ps[0] === currentPoint ? ps[1] : ps[0];
    for(let i = 0; i < ps.length; i++) {
      const cp = ps[i]; // Candidate point
      if(cp === currentPoint) continue;

      // Vector between current and next best candidate
      const pq = nextPoint.subtractNew(currentPoint);
      // Vector between current and new candidate
      const pr = cp.subtractNew(currentPoint);
      
      // The cross returns the direction between the vectors
      // If cross is CCW (greater than 0) then the new candidate is a better candidate than the current
      // Otherwise, if the're colinear (on the same line), we pick the one that's farthest
      // Otherwise we continue
      const cross = crossp(pr, pq);
      // const cross = pr.cross(pq); // vec2 cross is borked
      

      if(cross > 0) {
        nextPoint = cp;
      } else if(cross === 0) {
        if(pr.lengthSquared > pr.lengthSquared)
          nextPoint = cp;
      } else {
        debugCross.set(cp, [cp, Math.max(1,Math.abs(cross))]);
        // debugCross.push([cp, Math.max(1,Math.abs(cross))])
      }
    }
    hull.push(nextPoint.clone());
    currentPoint = nextPoint;
    
  } while(currentPoint !== startPoint)
    
  return hull;
}



// Create the points array
const points = new Array(settings.numPoints)
  .fill(null)
  .map((
    makePoint
  ));


function draw(ps, hull, debugCross) {
 
  ctx.fillStyle = settings.background;
  ctx.fillRect(0,0,settings.dimensions.width,settings.dimensions.height);
  // ctx.fillStyle = "rgba(240,240,240,.8)"
  // ctx.fillRect(0,0,c.width,c.height);
  ctx.fillStyle = settings.foreground
  ctx.strokeStyle = settings.foreground
  ctx.font = "12px sans";

  // Draw the points
  if(settings.drawPoints) {
    ps.forEach(((p, i) => {
      ctx.beginPath();
      ctx.arc(...p, settings.ballRadius, 0, Math.PI * 2, false);
      ctx.fill();
      // ctx.fillText(i, ...p.addNew(new Vec2(10, -10)))
    }));
  }
  
  if(settings.debug) {
    debugCross.forEach((c, v) => {
      // console.log(c,v)
      ctx.beginPath();
      ctx.fillStyle="#6666ff";
      ctx.arc(...c[0], Math.max(1,c[1]*.0001), 0, Math.PI*2)
      ctx.fill()
    })
  }

  // Draw the hull
  const l = hull.length -1 ; // Segment length
  let currentSegment = getTangentPoints(hull[l-1], hull[0]);
  ctx.lineWidth = settings.lineWidth;
  // ctx.beginPath();
  // ctx.fillStyle="#FF6666";
  // ctx.arc(...currentSegment.end, 10, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(...currentSegment.end);
  const debugSegments = [];
  const debugPoints = [];
  for(let i = 0; i < l;i++) {
    const c = hull[i];   // current point
    const n = hull[i+1]; // next point

    // We just came from the previous point, so we are at a tangent point on c.
    // Now we need to draw an arc around c to the start of the next segment.
  
    // Find where the next line segment *starts* on the current circle
    const nextSegment = getTangentPoints(c,n);
    
    if(settings.debug) {
      const pointnormal = currentSegment.
        normal.
        add(nextSegment.normal).
        normalise().
        scale(settings.ballRadius+Math.max(10, settings.lineWidth*2)); // Find the normal between the two segment normals, which will be the half way point, or the point normal
      debugSegments.push([c,c.addNew(pointnormal)])
      debugPoints.push([currentSegment.start, currentSegment.end]);
    }

    const sv = currentSegment.end.subtractNew(c);
    const ev = nextSegment.start.subtractNew(c);

    ctx.arc(...c, settings.lineDistance, sv.angle, ev.angle);
    ctx.lineTo(...nextSegment.end);
    currentSegment = nextSegment;
  }
  // hull.forEach((p, i) => {
  //   i==0 ? ctx.moveTo(...p) : ctx.lineTo(...p);
  // });
  ctx.stroke()
  if(settings.debug) {
    ctx.save();
    ctx.strokeStyle="#FF6666";
    ctx.fillStyle="#FF6666";
    ctx.lineWidth=Math.max(2, settings.lineWidth/2);
    debugSegments.forEach(s => {
      ctx.beginPath();
      ctx.moveTo(...s[0]);
      ctx.lineTo(...s[1]);
      ctx.stroke();
    })
    debugPoints.forEach(p => {
      p.forEach(p => {
        ctx.beginPath();
        ctx.arc(...p, 5, 0, Math.PI*2);
        ctx.fill();
      })
    })
    ctx.restore();
  }
}

function runLoop(delta) {
  
  // Animate the points. Just a sinewave and basic movement back and forth
  points.forEach(((p, i) => {
    const ha = settings.dimensions.height / 2;
    const s = Math.sin(delta*.002 * settings.speed + p.os*10);
    p.y = ha + (s**2-.5)*2 * (ha - settings.padding);
    p.x += 2*p.dir * settings.speed;
    if(p.x-settings.lineDistance < 0) {
      p.dir*=-1;
      p.x = settings.lineDistance+1;
    }
    else if(p.x+settings.lineDistance > window.innerWidth) {
      p.dir*=-1;
      p.x = window.innerWidth-settings.lineDistance-1;
    } 
  }));
  
  // Create this frame's points array, including anchor points
  const ay = settings.dimensions.height*settings.ropeEnds; // Anchor point y
  // loop points - the points to draw, which includes the two anchor points.
  const ps = [...points,new Vec2(settings.anchorPadding, ay),new Vec2(settings.dimensions.width-settings.anchorPadding, ay)]

  // Find the hull
  const debugCross = new Map()
  const hull = findHull(ps, debugCross);
  
  // Draw the points and the hull
  draw(ps, hull, debugCross);
  
  settings.rafid = requestAnimationFrame(runLoop);
}

settings.rafid = requestAnimationFrame(runLoop);

window.addEventListener('resize', (e) => {
  settings.dimensions = new Vec2(window.innerWidth, window.innerHeight);
  c.width = window.innerWidth*settings.dpr;
  c.height = window.innerHeight*settings.dpr;
  ctx.restore();
  ctx.scale(settings.dpr,settings.dpr);
  cancelAnimationFrame(settings.rafid)
  settings.rafid = requestAnimationFrame(runLoop);
})