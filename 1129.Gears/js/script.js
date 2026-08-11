(() => {
  "use strict";

  // Two gears of the same module: teeth count sets the size, and the ratio is
  // fixed by the count. Nothing here is faked — B's angle is derived from A's.
  const NA = 24, NB = 16, MOD = 5;
  const rA = NA * MOD / 2, rB = NB * MOD / 2;   // pitch radii
  const D = rA + rB;                            // centre distance
  const RATIO = NA / NB;                        // 1.5 turns of B per turn of A
  const SPEED = 60;                             // degrees of A per second

  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const CYCLE = 360 * (NB / gcd(NA, NB));       // A-degrees between realignments

  const stage = document.getElementById("stage");
  const wrap = document.getElementById("flashwrap");
  const out = { ta: 0, tb: 0, next: 0, met: 0 };
  for (const k in out) out[k] = document.getElementById(k);

  // ── one gear, drawn as line work ──────────────────────────────────────────
  const pol = (r, deg) => {
    const a = deg * Math.PI / 180;
    return [r * Math.cos(a), r * Math.sin(a)];
  };

  function toothPath(n, i, r) {
    const s = 360 / n, a = i * s;
    const root = r - 1.25 * MOD, tip = r + MOD;
    const pts = [
      pol(root, a - s * 0.30), pol(tip, a - s * 0.11),
      pol(tip, a + s * 0.11), pol(root, a + s * 0.30),
    ];
    return "M" + pts.map(p => p[0].toFixed(2) + "," + p[1].toFixed(2)).join("L");
  }

  function buildGear(g, n, r, markIndex, markKind) {
    const ns = "http://www.w3.org/2000/svg";
    const el = (t, attrs, cls) => {
      const e = document.createElementNS(ns, t);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      if (cls) e.setAttribute("class", cls);
      g.appendChild(e);
      return e;
    };

    el("circle", { r: r, cx: 0, cy: 0 }, "guide dash");        // pitch circle
    el("circle", { r: r - 1.25 * MOD, cx: 0, cy: 0 }, "guide"); // root circle

    let d = "";
    for (let i = 0; i < n; i++) d += toothPath(n, i, r) + " ";
    el("path", { d }, "tooth");

    el("circle", { r: r * 0.22, cx: 0, cy: 0 }, "hub");
    el("line", { x1: -r * 0.34, y1: 0, x2: r * 0.34, y2: 0 }, "guide");
    el("line", { x1: 0, y1: -r * 0.34, x2: 0, y2: r * 0.34 }, "guide");

    // the marked feature: a tooth on the driver, the gap it drops into on the
    // driven wheel
    const s = 360 / n, root = r - 1.25 * MOD, tip = r + MOD;
    const p = markKind === "gap"
      ? [pol(tip, s * 0.11), pol(root, s * 0.30),
         pol(root, s * 0.70), pol(tip, s * 0.89)]
      : [pol(root, -s * 0.30), pol(tip, -s * 0.11),
         pol(tip, s * 0.11), pol(root, s * 0.30)];
    el("path", {
      d: "M" + p.map(q => q[0].toFixed(2) + "," + q[1].toFixed(2)).join("L"),
      transform: "rotate(" + markIndex * s + ")",
    }, "mark");
  }

  const gA = document.getElementById("gearA");
  const gB = document.getElementById("gearB");
  buildGear(gA, NA, rA, 0, "tooth");
  buildGear(gB, NB, rB, 0, "gap");

  // ── the coupling ─────────────────────────────────────────────────────────
  // A tooth of A sits at 0° pointing at B, so B needs a gap there: offset its
  // rotation by half a tooth. From then on φ = φ0 − θ·(NA/NB). That single
  // line is the whole link.
  const PHI0 = 180 - 180 / NB;
  let theta = 0, prevCycle = 0, met = 0;

  function place() {
    const phi = PHI0 - theta * RATIO;
    gA.setAttribute("transform", "rotate(" + theta + ")");
    gB.setAttribute("transform", "translate(" + D + ",0) rotate(" + phi + ")");

    const turns = theta / 360;
    out.ta.textContent = Math.abs(turns).toFixed(2);
    out.tb.textContent = Math.abs(turns * RATIO).toFixed(2);
    const rem = ((CYCLE - (theta % CYCLE + CYCLE) % CYCLE) % CYCLE) / 360;
    out.next.textContent = rem.toFixed(2);

    const c = Math.floor(theta / CYCLE);
    if (c !== prevCycle) {
      prevCycle = c;
      out.met.textContent = ++met;
      wrap.classList.remove("flash");
      void wrap.getBoundingClientRect();
      wrap.classList.add("flash");
    }
  }

  // ── drive and drag ability ───────────────────────────────────────────────────────
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let dragging = false, grabbed = null, lastAngle = 0, last = 0;

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.1) || 0;
    last = now;
    if (!dragging && !calm) theta += SPEED * dt;
    place();
  }

  function localPoint(e) {
    const r = stage.getBoundingClientRect();
    const vb = stage.viewBox.baseVal;
    return {
      x: vb.x + (e.clientX - r.left) / r.width * vb.width,
      y: vb.y + (e.clientY - r.top) / r.height * vb.height,
    };
  }

  const angleTo = (p, cx) => Math.atan2(p.y, p.x - cx) * 180 / Math.PI;

  stage.addEventListener("pointerdown", e => {
    const p = localPoint(e);
    // whichever wheel you actually grabbed is the one you're turning
    grabbed = Math.hypot(p.x, p.y) < Math.hypot(p.x - D, p.y) ? "A" : "B";
    lastAngle = angleTo(p, grabbed === "A" ? 0 : D);
    dragging = true;
    stage.classList.add("turning");
    stage.setPointerCapture(e.pointerId);
  });

  stage.addEventListener("pointermove", e => {
    if (!dragging) return;
    const p = localPoint(e);
    const a = angleTo(p, grabbed === "A" ? 0 : D);
    let d = a - lastAngle;
    if (d > 180) d -= 360; else if (d < -180) d += 360;
    lastAngle = a;
    theta += grabbed === "A" ? d : -d / RATIO;
  });

  const release = () => { dragging = false; stage.classList.remove("turning"); };
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);

  stage.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") { theta += 15; e.preventDefault(); }
    if (e.key === "ArrowLeft") { theta -= 15; e.preventDefault(); }
  });

  place();
  requestAnimationFrame(now => { last = now; requestAnimationFrame(frame); });
})();