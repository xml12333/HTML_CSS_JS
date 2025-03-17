import zim from "https://zimjs.org/cdn/017/zim";

// REFERENCES for ZIM at https://zimjs.com
// see https://zimjs.com/intro.html for an intro example
// see https://zimjs.com/learn.html for video and code tutorials
// see https://zimjs.com/docs.html for documentation
// see https://codepen.io/topic/zim/ for ZIM on CodePen


const frame = new Frame(FIT, 1024, 768, interstellar, interstellar, ready);
function ready() {

  // given F (Frame), S (Stage), W (width), H (height)

  // https://en.wikipedia.org/wiki/Rose_(mathematics)

  const r = 50;
  const tile = new Tile(new Circle(r + 20, black.toAlpha(.4), pink, 2), 7, 5, 10, 10).
  scaleTo(S, 90, 90).center();

  function gcd(a, b) {
    if (!b) return a;
    return gcd(b, a % b);
  }

  tile.loop(circle => {
    const shape = new Shape(W, H).addTo(tile).s(blue).ss(2);
    const d = circle.tileCol + 1;
    const n = circle.tileRow + 1;
    const a = r;

    // https://math.stackexchange.com/questions/1493168/calculating-the-periodicity-of-a-rose-curve
    let g = gcd(n, d);
    let d1 = d / g;
    let deg = 180 * d1 * ((n / g * d1 % 2 == 0 ? 1 : 0) + 1);

    const dot = new Circle(5, white).addTo(tile);

    loop(deg, (i, t) => {
      const x = a * Math.cos(n / d * i * RAD) * Math.cos(i * RAD);
      const y = a * Math.cos(n / d * i * RAD) * Math.sin(i * RAD);
      if (i === 0) shape.mt(circle.x + x, circle.y + y);else
      shape.lt(circle.x + x, circle.y + y);
      dot.x = circle.x + x;
      dot.y = circle.y + y;
      if (i == t - 1) {
        shape.cp();
        dot.dispose();
      }
    }, null, .001);
  }, true); // loop backwards if changing the number of children in loop
  Ticker.always();

}

// Docs for items used:
// https://zimjs.com/docs.html?item=Frame
// https://zimjs.com/docs.html?item=Shape
// https://zimjs.com/docs.html?item=Circle
// https://zimjs.com/docs.html?item=loop
// https://zimjs.com/docs.html?item=loc
// https://zimjs.com/docs.html?item=scaleTo
// https://zimjs.com/docs.html?item=addTo
// https://zimjs.com/docs.html?item=center
// https://zimjs.com/docs.html?item=Tile
// https://zimjs.com/docs.html?item=toAlpha
// https://zimjs.com/docs.html?item=Ticker