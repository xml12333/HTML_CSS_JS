const points = [
[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1],
[1, -1, -1], [1, -1, 1], [1, 1, 1], [1, 1, -1]].
map(n => Vector.from(n).rotateZX(EIGHTH_PI).rotateXY(QUARTER_PI));
const lines = [
[0, 1], [1, 2], [2, 3], [3, 0],
[4, 5], [5, 6], [6, 7], [7, 4],
[0, 4], [1, 5], [2, 6], [3, 7]].
map(([a, b]) => [points[a], points[b]]);
const particles = [];

function setup() {
  for (const [a, b] of lines) {
    for (let i = 0; i < 600; i++) {
      const l = random();
      const t = (abs(l - 0.5) + random(0.625)) * -TAU;
      const p = Vector.lerp(a, b, l);
      particles.push({ p, t });
    }
  }
}

function draw(e) {
  const time = e * 0.0003;
  const time2 = time * 2;
  const d = 1500;
  const di = 1 / d;
  const r = (p, t, o) => {
    const m = ease.sine.inOut(sin(time2 + t + o) + 1, 100, 100, 2);
    const v = p._.mult(m).rotateYZ(time);
    v.multXY((v.z + d) * di);
    return v;
  };
  beginPath();
  for (const { p, t } of particles) {
    line(r(p, t, 0), r(p, t, 0.05));
  }
  stroke(hsl(0, 0, 100));
}