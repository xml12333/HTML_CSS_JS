/* neon_trails.js — complete build with Code Exporter + PNG export
 * - Strict 45° grid angles: 0,45,90,135,180,225,270,315
 * - Branching: never reuse parent angle; unique angles per node
 * - Center-biased spawns; round end caps; glow strength honored
 * - Camera drift with optional tilt lock
 * - PNG export (offscreen; waits 2 frames to avoid blank captures)
 * - Code Exporter: Normal / Slim Raw / Slim Eval (settings baked in)
 */

let __neonCtl = null;

/* ===========================
   Core Animation
   =========================== */
function neonAnimation(settings) {
  const v = settings.canvas || document.getElementById("view");
  if (!v) throw new Error("Canvas element not found. Provide settings.canvas or #view.");

  const onScreen = !settings.canvas;
  const dpr = onScreen ? (window.devicePixelRatio || 1) : 1;

  const x = v.getContext("2d", { alpha: false });
  const b = document.createElement("canvas");
  const y = b.getContext("2d", { alpha: true });

  let W, H, rafId = null, running = true;

  function sizeToCanvas() {
    if (onScreen) {
      W = innerWidth * dpr;
      H = innerHeight * dpr;
      v.width = W; v.height = H;
    } else {
      W = v.width; H = v.height;
    }
    b.width = W * 2;
    b.height = H * 2;
  }
  sizeToCanvas();
  if (onScreen) window.addEventListener("resize", sizeToCanvas);

  // ---- Settings with defaults ----
  const st = {
    // buckets
    tr: [], jn: [],

    // limits
    lim: +settings.lim || 200,
    spawn: +settings.spawn || 0.02,

    // visuals
    col: (settings.col || "").trim() || 0,
    lineMulticolor: !!settings.lineMulticolor,
    circleMulticolor: !!settings.circleMulticolor,
    circleMode: settings.circleMode || "stroke",
    circleColor: settings.circleColor || "#FF0077",

    // glow
    lineGlow: !!settings.lineGlow,
    glowStrength: +settings.glowStrength || 12,

    // circles
    hideCircles: !!settings.hideCircles,
    circleSize: +settings.circleSize || 5,

    // branching (+ safety)
    alwaysBranch: !!settings.alwaysBranch,
    forwardBranchChance: settings.forwardBranchChance != null ? +settings.forwardBranchChance : 0.12,
    backBranchChance: settings.backBranchChance != null ? +settings.backBranchChance : 0.08,
    branchDensity: Math.max(1, Math.min(5, (settings.branchDensity | 0) || 2)),

    // timing preset
    timing: settings.timing || settings.timingPreset || "original",
    growTimeMin: 1500, growTimeMax: 2500,
    holdTimeMin: 1000, holdTimeMax: 2000,
    fadeTime: 1200,

    // camera
    lockTilt: !!settings.lockTilt,
    driftX: +settings.driftX || 200,
    driftY: +settings.driftY || 150,
  };

  // timing presets
  if (st.timing === "slow") {
    st.growTimeMin = 2200; st.growTimeMax = 3600;
    st.holdTimeMin = 1400; st.holdTimeMax = 2400;
    st.fadeTime = 1600;
  } else if (st.timing === "fast") {
    st.growTimeMin = 900; st.growTimeMax = 1500;
    st.holdTimeMin = 500; st.holdTimeMax = 900;
    st.fadeTime = 800;
  }

  // Safety cap with alwaysBranch
  if (st.alwaysBranch && st.lim > 300) st.lim = 300;

  // ---- Angle system (strict) ----
  const RAD = Math.PI / 180;
  const allowedAnglesDeg = [0, 45, 90, 135, 180, 315];
  const allowedSet = new Set(allowedAnglesDeg);
  const TURN_REL_CHOICES = [45, 90];

  // ---- Helpers ----
  const r = (a = 1, b = 0) => Math.random() * (a - b) + b;
  const ch = a => a[(Math.random() * a.length) | 0];
  const normDeg = d => ((d % 360) + 360) % 360;

  function pickTurnFrom(baseDeg) {
    const cands = new Set();
    for (const d of TURN_REL_CHOICES) {
      const a1 = normDeg(baseDeg + d), a2 = normDeg(baseDeg - d);
      if (allowedSet.has(a1)) cands.add(a1);
      if (allowedSet.has(a2)) cands.add(a2);
    }
    const arr = [...cands];
    return arr.length ? ch(arr) : baseDeg;
  }

  // bias spawns to center
  function centerBiasCoord() {
    return 0.5 + (Math.random() - 0.5) * Math.random();
  }

  // ---- Trail factory ----
  function mk(p, aDeg) {
    const s = p || { x: centerBiasCoord() * b.width, y: centerBiasCoord() * b.height };
    const baseDeg = (typeof aDeg === "number") ? normDeg(aDeg) : ch(allowedAnglesDeg);
    const base = baseDeg * RAD;

    const L1 = r(80, 120);
    const p1 = { x: s.x + Math.cos(base) * L1, y: s.y + Math.sin(base) * L1 };

    const turnDeg = pickTurnFrom(baseDeg);
    const turn = turnDeg * RAD;
    const L2 = r(80, 160);
    const p2 = { x: p1.x + Math.cos(turn) * L2, y: p1.y + Math.sin(turn) * L2 };

    const L3 = r(100, 200);
    const p3 = { x: p2.x + Math.cos(turn) * L3, y: p2.y + Math.sin(turn) * L3 };

    return {
      pts: [s, p1, p2, p3],
      h: st.col || ch([170, 180, 190, 200]),
      b: performance.now(),
      dt: r(st.growTimeMax, st.growTimeMin),
      ht: r(st.holdTimeMax, st.holdTimeMin),
      ft: st.fadeTime,
      bs: 0, be: 0
    };
  }

  const segLen = a => { let l = 0; for (let i = 0; i < a.length - 1; i++) l += Math.hypot(a[i + 1].x - a[i].x, a[i + 1].y - a[i].y); return l; };

  function drawCircle(xc, yc, rad, alpha, isEnd = false) {
    if (st.circleMode === "none" || st.hideCircles) return;
    let style = st.circleColor;
    if (st.circleMulticolor) {
      const hue = isEnd ? (Date.now() / 20) % 360 : (Date.now() / 10) % 360;
      style = `hsla(${hue},90%,60%,${alpha})`;
    }
    if (st.circleMode === "fill" || st.circleMode === "both") {
      y.fillStyle = style; y.beginPath(); y.arc(xc, yc, rad, 0, Math.PI * 2); y.fill();
    }
    if (st.circleMode === "stroke" || st.circleMode === "both") {
      y.globalCompositeOperation = "destination-out"; y.beginPath(); y.arc(xc, yc, rad - 1.5 * dpr, 0, Math.PI * 2); y.fill();
      y.globalCompositeOperation = "source-over"; y.strokeStyle = style; y.lineWidth = 1.5 * dpr; y.beginPath(); y.arc(xc, yc, rad, 0, Math.PI * 2); y.stroke();
    }
  }

  function dr(t, n) {
    const A = n - t.b, PL = segLen(t.pts);
    let al = 1, p = 0;
    if (A < t.dt) { p = A / t.dt; al = p; }
    else if (A < t.dt + t.ht) { p = 1; }
    else if (A < t.dt + t.ht + t.ft) { p = 1; al = 1 - (A - t.dt - t.ht) / t.ft; }
    else { t.d = 1; return; }

    al *= .8; const DL = PL * p;
    const lineStyle = st.lineMulticolor
      ? `hsla(${(Date.now() / 15) % 360},100%,60%,${al})`
      : st.col || `hsla(${t.h},70%,70%,${al})`;

    y.strokeStyle = lineStyle;
    y.lineWidth = 1.5 * dpr;
    y.lineCap = "round";
    if (st.lineGlow) { y.shadowBlur = st.glowStrength * dpr; y.shadowColor = lineStyle; }
    else { y.shadowBlur = 0; y.shadowColor = "transparent"; }

    y.beginPath(); y.moveTo(t.pts[0].x, t.pts[0].y);
    let rem = DL;
    for (let i = 0; i < t.pts.length - 1; i++) {
      const A = t.pts[i], B = t.pts[i + 1], SL = Math.hypot(B.x - A.x, B.y - A.y);
      if (rem >= SL) { y.lineTo(B.x, B.y); rem -= SL; }
      else { const tp = rem / SL; y.lineTo(A.x + (B.x - A.x) * tp, A.y + (B.y - A.y) * tp); break; }
    }
    y.stroke();

    if (!st.hideCircles) drawCircle(t.pts[0].x, t.pts[0].y, (st.circleSize) * dpr, al, false);

    if (p >= 1) {
      if (!st.hideCircles) drawCircle(t.pts[3].x, t.pts[3].y, st.circleSize * dpr, al, true);

      // ---- Branching: ensure uniqueness and never same as parent direction
      // Forward
      const doForward = st.alwaysBranch || Math.random() < st.forwardBranchChance;
      if (!t.be && st.tr.length < st.lim && doForward) {
        t.be = 1;
        const dx = t.pts[3].x - t.pts[2].x, dy = t.pts[3].y - t.pts[2].y;
        const parentDeg = normDeg(Math.atan2(dy, dx) * 180 / Math.PI);
        const used = new Set();
        for (let k = 0; k < st.branchDensity; k++) {
          const cand = pickTurnFrom(parentDeg);
          if (cand === parentDeg) continue;     // no same-angle branch
          if (used.has(cand)) continue;          // unique per node
          used.add(cand);
          st.tr.push(mk(t.pts[3], cand));
          if (st.tr.length >= st.lim) break;
        }
      }
      // Back
      const doBack = st.alwaysBranch || Math.random() < st.backBranchChance;
      if (!t.bs && st.tr.length < st.lim && doBack) {
        t.bs = 1;
        const dx = t.pts[1].x - t.pts[0].x, dy = t.pts[1].y - t.pts[0].y;
        const parentDeg = normDeg((Math.atan2(dy, dx) * 180 / Math.PI) + 180);
        const used = new Set();
        for (let k = 0; k < st.branchDensity; k++) {
          const cand = pickTurnFrom(parentDeg);
          if (cand === parentDeg) continue;
          if (used.has(cand)) continue;
          used.add(cand);
          st.tr.push(mk(t.pts[0], cand));
          if (st.tr.length >= st.lim) break;
        }
      }
    }
  }

  // ---- Camera (fills black; optional tilt) ----
  function cam(n) {
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.fillStyle = "#000"; // solid black background (for clean exports)
    x.fillRect(0, 0, W, H);

    const px = Math.sin(n * .0002) * st.driftX;
    const py = Math.cos(n * .00015) * st.driftY;
    const rot = st.lockTilt ? 0 : Math.sin(n * .00007) * .05;
    const z = 1.08 + .04 * Math.sin(n * .0001);

    x.translate(W / 2, H / 2);
    x.rotate(rot);
    x.scale(z, z);
    x.translate(-b.width / 2 + px, -b.height / 2 + py);
  }

  function loop(n) {
    if (!running) return;

    y.setTransform(1, 0, 0, 1, 0, 0);
    y.clearRect(0, 0, b.width, b.height);

    if (Math.random() < st.spawn && st.tr.length < st.lim) st.tr.push(mk());

    // draw & prune
    for (let i = st.tr.length - 1; i >= 0; i--) {
      dr(st.tr[i], n);
      if (st.tr[i].d) st.tr.splice(i, 1);
    }

    cam(n);
    x.drawImage(b, 0, 0);

    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);

  return {
    stop() { running = false; if (rafId) cancelAnimationFrame(rafId); },
  };
}

/* ===========================
   Settings (reads DOM IDs in your Slim)
   =========================== */
function getCurrentSettings() {
  const v = id => document.getElementById(id)?.value;
  const c = id => document.getElementById(id)?.checked;

  return {
    // limits / spawn
    lim: +v("lim") || 200,
    spawn: +v("spawn") || 0.02,

    // visuals
    col: v("color") || "#FF0077",
    lineMulticolor: c("lineMulticolor"),
    circleMulticolor: c("circleMulticolor"),
    circleMode: v("circleMode") || "stroke",
    circleColor: v("circleColor") || "#FF0077",

    // glow
    lineGlow: c("lineGlow"),
    glowStrength: +v("glowStrength") || 12,

    // dots
    hideCircles: c("hideCircles"),
    circleSize: +v("circleSize") || 5,

    // branching
    alwaysBranch: c("alwaysBranch"),
    forwardBranchChance: v("forwardBranchChance") != null ? +v("forwardBranchChance") : 0.12,
    backBranchChance: v("backBranchChance") != null ? +v("backBranchChance") : 0.08,
    branchDensity: v("branchDensity") != null ? Math.max(1, Math.min(5, (+v("branchDensity") | 0))) : 2,

    // timing preset
    timingPreset: v("timingPreset") || "original",
    timing: v("timingPreset") || "original",

    // camera
    lockTilt: c("lockTilt"),
    driftX: +v("driftX") || 200,
    driftY: +v("driftY") || 150
  };
}

/* ===========================
   PNG Export (offscreen instance)
   =========================== */
const EXPORT_W = 1920;
const EXPORT_H = 1080;

function snapshotPNG() {
  const src = document.getElementById("view");
  if (!src) {
    console.error("No #view canvas found for export.");
    return;
  }

  const tmp = document.createElement("canvas");
  tmp.width = EXPORT_W;
  tmp.height = EXPORT_H;
  const ctx = tmp.getContext("2d");

  // Fill background solid black
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, tmp.width, tmp.height);

  // Source size
  const sw = src.width;
  const sh = src.height;
  const sAspect = sw / sh;
  const dAspect = EXPORT_W / EXPORT_H;

  let dw, dh, dx, dy;

  if (sAspect > dAspect) {
    // Source wider than target → fit width
    dw = EXPORT_W;
    dh = EXPORT_W / sAspect;
    dx = 0;
    dy = (EXPORT_H - dh) / 2;
  } else {
    // Source taller than target → fit height
    dh = EXPORT_H;
    dw = EXPORT_H * sAspect;
    dx = (EXPORT_W - dw) / 2;
    dy = 0;
  }

  // Draw scaled with aspect preserved
  ctx.drawImage(src, 0, 0, sw, sh, dx, dy, dw, dh);

  // Save as PNG
  tmp.toBlob(b => {
    const a = document.createElement("a");
    const url = URL.createObjectURL(b);
    a.href = url;
    a.download = `trPaper_${Date.now()}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }, "image/png");
}

/* ===========================
   Code Exporter
   - Normal (readable IIFE)
   - Slim Raw (minified with newlines)
   - Slim Eval (base64 single line)
   =========================== */

// ---- Normal: readable IIFE with settings baked in ----
function buildNormalIIFE(s) {
  // Fully functional embedded engine; uses window DPR; creates fixed full-screen canvas
  return `(()=>{/* tr.Paper (normal export) */
const dpr=window.devicePixelRatio||1;
const v=document.createElement("canvas");
Object.assign(v.style,{position:"fixed",inset:"0",width:"100%",height:"100%",zIndex:"999999",pointerEvents:"none"});
document.body.appendChild(v);
const x=v.getContext("2d",{alpha:false}),b=document.createElement("canvas"),y=b.getContext("2d");
let W,H;function RS(){W=innerWidth*dpr;H=innerHeight*dpr;v.width=W;v.height=H;b.width=W*2;b.height=H*2}RS();onresize=RS;
const st=${JSON.stringify({
  ...s,
  timing: s.timing || s.timingPreset || "original",
  lim: +s.lim, spawn: +s.spawn,
  forwardBranchChance: s.forwardBranchChance!=null?+s.forwardBranchChance:0.12,
  backBranchChance: s.backBranchChance!=null?+s.backBranchChance:0.08,
  branchDensity: s.branchDensity!=null?+s.branchDensity:2
})};
st.tr=[];st.jn=[];
if(st.timing==="slow"){st.growTimeMin=2200;st.growTimeMax=3600;st.holdTimeMin=1400;st.holdTimeMax=2400;st.fadeTime=1600}
else if(st.timing==="fast"){st.growTimeMin=900;st.growTimeMax=1500;st.holdTimeMin=500;st.holdTimeMax=900;st.fadeTime=800}
else {st.growTimeMin=st.growTimeMin||1500;st.growTimeMax=st.growTimeMax||2500;st.holdTimeMin=st.holdTimeMin||1000;st.holdTimeMax=st.holdTimeMax||2000;st.fadeTime=st.fadeTime||1200}
if(st.alwaysBranch&&st.lim>300)st.lim=300;

const RAD=Math.PI/180, AL=[0,45,90,135,180,225,270,315], AS=new Set(AL), TURN=[45,90];
const r=(a=1,b=0)=>Math.random()*(a-b)+b, ch=a=>a[(Math.random()*a.length)|0], ND=d=>((d%360)+360)%360;
const centerBias=()=>0.5+(Math.random()-0.5)*Math.random();

function pickTurn(base){const c=new Set;for(const d of TURN){const a1=ND(base+d),a2=ND(base-d);if(AS.has(a1))c.add(a1);if(AS.has(a2))c.add(a2)}const arr=[...c];return arr.length?ch(arr):base}
function mk(p,aDeg){const s=p||{x:centerBias()*b.width,y:centerBias()*b.height}, bd=(typeof aDeg==="number")?ND(aDeg):ch(AL), ba=bd*RAD;
  const p1={x:s.x+Math.cos(ba)*r(80,120),y:s.y+Math.sin(ba)*r(80,120)}, td=pickTurn(bd), ta=td*RAD;
  const p2={x:p1.x+Math.cos(ta)*r(80,160),y:p1.y+Math.sin(ta)*r(80,160)}, p3={x:p2.x+Math.cos(ta)*r(100,200),y:p2.y+Math.sin(ta)*r(100,200)};
  return{pts:[s,p1,p2,p3],h:st.col||ch([170,180,190,200]),b:performance.now(),dt:r(st.growTimeMax,st.growTimeMin),ht:r(st.holdTimeMax,st.holdTimeMin),ft:st.fadeTime,bs:0,be:0}}
const len=a=>{let l=0;for(let i=0;i<a.length-1;i++)l+=Math.hypot(a[i+1].x-a[i].x,a[i+1].y-a[i].y);return l}
function dot(xc,yc,rad,al,end){if(st.circleMode==="none"||st.hideCircles)return;let style=st.circleColor;if(st.circleMulticolor){const hue=end?(Date.now()/20)%360:(Date.now()/10)%360;style=\`hsla(\${hue},90%,60%,\${al})\`;}
  if(st.circleMode==="fill"||st.circleMode==="both"){y.fillStyle=style;y.beginPath();y.arc(xc,yc,rad,0,7);y.fill()}
  if(st.circleMode==="stroke"||st.circleMode==="both"){y.globalCompositeOperation="destination-out";y.beginPath();y.arc(xc,yc,rad-1.5*dpr,0,7);y.fill();y.globalCompositeOperation="source-over";y.strokeStyle=style;y.lineWidth=1.5*dpr;y.beginPath();y.arc(xc,yc,rad,0,7);y.stroke()}}
function dr(t,n){const A=n-t.b,PL=len(t.pts);let al=1,p=0;if(A<t.dt){p=A/t.dt;al=p}else if(A<t.dt+t.ht){p=1}else if(A<t.dt+t.ht+t.ft){p=1;al=1-(A-t.dt-t.ht)/t.ft}else{t.d=1;return}
  al*=.8;const DL=PL*p,ls=st.lineMulticolor?\`hsla(\${(Date.now()/15)%360},100%,60%,\${al})\`:st.col||\`hsla(\${t.h},70%,70%,\${al})\`;y.strokeStyle=ls;y.lineWidth=1.5*dpr;y.lineCap="round";if(st.lineGlow){y.shadowBlur=st.glowStrength*dpr;y.shadowColor=ls}else{y.shadowBlur=0;y.shadowColor="transparent"}
  y.beginPath();y.moveTo(t.pts[0].x,t.pts[0].y);let rem=DL;for(let i=0;i<t.pts.length-1;i++){const A=t.pts[i],B=t.pts[i+1],SL=Math.hypot(B.x-A.x,B.y-A.y);if(rem>=SL){y.lineTo(B.x,B.y);rem-=SL}else{const tp=rem/SL;y.lineTo(A.x+(B.x-A.x)*tp,A.y+(B.y-A.y)*tp);break}}y.stroke();
  if(!st.hideCircles)dot(t.pts[0].x,t.pts[0].y,st.circleSize*dpr,al,false);
  if(p>=1){if(!st.hideCircles)dot(t.pts[3].x,t.pts[3].y,st.circleSize*dpr,al,true);
    const F=st.alwaysBranch||Math.random()<st.forwardBranchChance;if(!t.be&&st.tr.length<st.lim&&F){t.be=1;const dx=t.pts[3].x-t.pts[2].x,dy=t.pts[3].y-t.pts[2].y,parent=ND(Math.atan2(dy,dx)*180/Math.PI),used=new Set;for(let k=0;k<st.branchDensity;k++){const cand=pickTurn(parent);if(cand===parent)continue;if(used.has(cand))continue;used.add(cand);st.tr.push(mk(t.pts[3],cand));if(st.tr.length>=st.lim)break}}
    const Bk=st.alwaysBranch||Math.random()<st.backBranchChance;if(!t.bs&&st.tr.length<st.lim&&Bk){t.bs=1;const dx=t.pts[1].x-t.pts[0].x,dy=t.pts[1].y-t.pts[0].y,parent=ND((Math.atan2(dy,dx)*180/Math.PI)+180),used=new Set;for(let k=0;k<st.branchDensity;k++){const cand=pickTurn(parent);if(cand===parent)continue;if(used.has(cand))continue;used.add(cand);st.tr.push(mk(t.pts[0],cand));if(st.tr.length>=st.lim)break}}}}
function cam(n){x.setTransform(1,0,0,1,0,0);x.fillStyle="#000";x.fillRect(0,0,W,H);const px=Math.sin(n*.0002)*${s.driftX||200},py=Math.cos(n*.00015)*${s.driftY||150},rot=${s.lockTilt?0:"Math.sin(n*.00007)*.05"},z=1.08+.04*Math.sin(n*.0001);x.translate(W/2,H/2);x.rotate(rot);x.scale(z,z);x.translate(-b.width/2+px,-b.height/2+py)}
function loop(n){y.setTransform(1,0,0,1,0,0);y.clearRect(0,0,b.width,b.height);if(Math.random()<${+s.spawn||0.02}&&st.tr.length<st.lim)st.tr.push(mk());for(let i=st.tr.length-1;i>=0;i--){dr(st.tr[i],n);if(st.tr[i].d)st.tr.splice(i,1)}cam(n);x.drawImage(b,0,0);requestAnimationFrame(loop)}
requestAnimationFrame(loop);
})();`;
}

// ---- Slim Raw: aggressively minified (but with line breaks) ----
function buildSlimRaw(s) {
  const st = {
    ...s,
    timing: s.timing || s.timingPreset || "original",
    lim: +s.lim, spawn: +s.spawn,
    forwardBranchChance: s.forwardBranchChance!=null?+s.forwardBranchChance:0.12,
    backBranchChance: s.backBranchChance!=null?+s.backBranchChance:0.08,
    branchDensity: s.branchDensity!=null?+s.branchDensity:2
  };
  return [
`(()=>{let v=document.createElement("canvas");v.style="position:fixed;inset:0;width:100%;height:100%;z-index:999999;pointer-events:none";document.body.appendChild(v);`,
`let x=v.getContext("2d",{alpha:false}),p=devicePixelRatio||1,b=document.createElement("canvas"),y=b.getContext("2d"),W,H;function R(){W=innerWidth*p;H=innerHeight*p;v.width=W;v.height=H;b.width=W*2;b.height=H*2}R();onresize=R;`,
`let st=${JSON.stringify(st)};st.tr=[];st.jn=[];if(st.timing==="slow"){st.growTimeMin=2200;st.growTimeMax=3600;st.holdTimeMin=1400;st.holdTimeMax=2400;st.fadeTime=1600}else if(st.timing==="fast"){st.growTimeMin=900;st.growTimeMax=1500;st.holdTimeMin=500;st.holdTimeMax=900;st.fadeTime=800}else{st.growTimeMin=st.growTimeMin||1500;st.growTimeMax=st.growTimeMax||2500;st.holdTimeMin=st.holdTimeMin||1000;st.holdTimeMax=st.holdTimeMax||2000;st.fadeTime=st.fadeTime||1200}if(st.alwaysBranch&&st.lim>300)st.lim=300;`,
`let RAD=Math.PI/180,AL=[0,45,90,135,180,225,270,315],AS=new Set(AL),TR=[45,90],r=(a=1,b=0)=>Math.random()*(a-b)+b,ch=a=>a[(Math.random()*a.length)|0],ND=d=>((d%360)+360)%360,CB=()=>0.5+(Math.random()-0.5)*Math.random();`,
`function PT(base){let c=new Set;for(let d of TR){let a1=ND(base+d),a2=ND(base-d);if(AS.has(a1))c.add(a1);if(AS.has(a2))c.add(a2)}let a=[...c];return a.length?ch(a):base}`,
`function mk(p,a){let s=p||{x:CB()*b.width,y:CB()*b.height},bd=typeof a==="number"?ND(a):ch(AL),ba=bd*RAD,p1={x:s.x+Math.cos(ba)*r(80,120),y:s.y+Math.sin(ba)*r(80,120)},td=PT(bd),ta=td*RAD,p2={x:p1.x+Math.cos(ta)*r(80,160),y:p1.y+Math.sin(ta)*r(80,160)},p3={x:p2.x+Math.cos(ta)*r(100,200),y:p2.y+Math.sin(ta)*r(100,200)};return{pts:[s,p1,p2,p3],h:st.col||ch([170,180,190,200]),b:performance.now(),dt:r(st.growTimeMax,st.growTimeMin),ht:r(st.holdTimeMax,st.holdTimeMin),ft:st.fadeTime,bs:0,be:0}}`,
`function L(a){let l=0;for(let i=0;i<a.length-1;i++)l+=Math.hypot(a[i+1].x-a[i].x,a[i+1].y-a[i].y);return l}`,
`function DOT(xc,yc,R,al,end){if(st.circleMode==="none"||st.hideCircles)return;let sc=st.circleColor;if(st.circleMulticolor){let h=end?(Date.now()/20)%360:(Date.now()/10)%360;sc=\`hsla(\${h},90%,60%,\${al})\`;}if(st.circleMode==="fill"||st.circleMode==="both"){y.fillStyle=sc;y.beginPath();y.arc(xc,yc,R,0,7);y.fill()}if(st.circleMode==="stroke"||st.circleMode==="both"){y.globalCompositeOperation="destination-out";y.beginPath();y.arc(xc,yc,R-1.5*p,0,7);y.fill();y.globalCompositeOperation="source-over";y.strokeStyle=sc;y.lineWidth=1.5*p;y.beginPath();y.arc(xc,yc,R,0,7);y.stroke()}}`,
`function DR(t,n){let A=n-t.b,PL=L(t.pts),al=1,pct=0;if(A<t.dt){pct=A/t.dt;al=pct}else if(A<t.dt+t.ht){pct=1}else if(A<t.dt+t.ht+t.ft){pct=1;al=1-(A-t.dt-t.ht)/t.ft}else{t.d=1;return}al*=.8;let DL=PL*pct,ls=st.lineMulticolor?\`hsla(\${(Date.now()/15)%360},100%,60%,\${al})\`:st.col||\`hsla(\${t.h},70%,70%,\${al})\`;y.strokeStyle=ls;y.lineWidth=1.5*p;y.lineCap="round";if(st.lineGlow){y.shadowBlur=st.glowStrength*p;y.shadowColor=ls}else{y.shadowBlur=0;y.shadowColor="transparent"}y.beginPath();y.moveTo(t.pts[0].x,t.pts[0].y);let rem=DL;for(let i=0;i<t.pts.length-1;i++){let A=t.pts[i],B=t.pts[i+1],SL=Math.hypot(B.x-A.x,B.y-A.y);if(rem>=SL){y.lineTo(B.x,B.y);rem-=SL}else{let q=rem/SL;y.lineTo(A.x+(B.x-A.x)*q,A.y+(B.y-A.y)*q);break}}y.stroke();if(!st.hideCircles)DOT(t.pts[0].x,t.pts[0].y,st.circleSize*p,al,false);if(pct>=1){if(!st.hideCircles)DOT(t.pts[3].x,t.pts[3].y,st.circleSize*p,al,true);let F=st.alwaysBranch||Math.random()<st.forwardBranchChance;if(!t.be&&st.tr.length<st.lim&&F){t.be=1;let dx=t.pts[3].x-t.pts[2].x,dy=t.pts[3].y-t.pts[2].y,parent=ND(Math.atan2(dy,dx)*180/Math.PI),used=new Set;for(let k=0;k<st.branchDensity;k++){let cand=PT(parent);if(cand===parent)continue;if(used.has(cand))continue;used.add(cand);st.tr.push(mk(t.pts[3],cand));if(st.tr.length>=st.lim)break}}let Bk=st.alwaysBranch||Math.random()<st.backBranchChance;if(!t.bs&&st.tr.length<st.lim&&Bk){t.bs=1;let dx=t.pts[1].x-t.pts[0].x,dy=t.pts[1].y-t.pts[0].y,parent=ND((Math.atan2(dy,dx)*180/Math.PI)+180),used=new Set;for(let k=0;k<st.branchDensity;k++){let cand=PT(parent);if(cand===parent)continue;if(used.has(cand))continue;used.add(cand);st.tr.push(mk(t.pts[0],cand));if(st.tr.length>=st.lim)break}}}}`,
`function CAM(n){x.setTransform(1,0,0,1,0,0);x.fillStyle="#000";x.fillRect(0,0,W,H);let px=Math.sin(n*.0002)*${s.driftX||200},py=Math.cos(n*.00015)*${s.driftY||150},rot=${s.lockTilt?0:"Math.sin(n*.00007)*.05"},z=1.08+.04*Math.sin(n*.0001);x.translate(W/2,H/2);x.rotate(rot);x.scale(z,z);x.translate(-b.width/2+px,-b.height/2+py)}`,
`function LOOP(n){y.setTransform(1,0,0,1,0,0);y.clearRect(0,0,b.width,b.height);if(Math.random()<${+s.spawn||0.02}&&st.tr.length<st.lim)st.tr.push(mk());for(let i=st.tr.length-1;i>=0;i--){DR(st.tr[i],n);if(st.tr[i].d)st.tr.splice(i,1)}CAM(n);x.drawImage(b,0,0);requestAnimationFrame(LOOP)}requestAnimationFrame(LOOP)})();`
  ].join("\n");
}

// ---- Slim Eval: base64 single line wrapper ----
function buildSlimEvalFromRaw(slimRaw) {
  const singleLine = slimRaw.replace(/\s*\n\s*/g, "");
  return `eval(atob("${btoa(singleLine)}"))`;
}

// ---- Export current code to textarea + clipboard ----
function exportCode() {
  const s = getCurrentSettings();
  const modeEl = document.getElementById("outputMode");
  const mode = modeEl ? modeEl.value : "normal";

  let code = "";
  if (mode === "normal") code = buildNormalIIFE(s);
  else if (mode === "slimRaw") code = buildSlimRaw(s);
  else code = buildSlimEvalFromRaw(buildSlimRaw(s));

  const ta = document.getElementById("codeOut");
  if (ta) {
    ta.value = code;
    ta.focus();
    ta.select();
  }

  // Clipboard
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).catch(()=>{});
  } else {
    try { document.execCommand("copy"); } catch {}
  }

  const helper = document.getElementById("copyHelper");
  if (helper) { helper.textContent = "Copied!"; setTimeout(()=> helper.textContent = "", 1400); }
}

/* ===========================
   UI Glue
   =========================== */
function applyFromUI() {
  const s = getCurrentSettings();
  if (__neonCtl) __neonCtl.stop();
  __neonCtl = neonAnimation(s);
}

document.addEventListener("DOMContentLoaded", () => {
  // Inputs auto-apply
  document.querySelectorAll("#settings input, #settings select, #settings textarea").forEach(el => {
    el.addEventListener("input", applyFromUI);
    el.addEventListener("change", applyFromUI);
  });

  // Start
  if (document.getElementById("view")) applyFromUI();

  // Tabs
  const tabs = document.querySelectorAll("#settings .tab");
  const panels = document.querySelectorAll("#settings .tab-panel");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      const tgt = tab.getAttribute("data-target");
      document.getElementById(tgt)?.classList.add("active");
    });
  });
  if (tabs.length && panels.length) { tabs[0].classList.add("active"); panels[0].classList.add("active"); }

  // PNG export
  document.getElementById("btnSnapPNG")?.addEventListener("click", snapshotPNG);

  // (If your Slim still shows video button, disable it gracefully)
  const vidBtn = document.getElementById("btnExportVideo");
  if (vidBtn) {
    vidBtn.addEventListener("click", () => {
      alert("Video export is disabled in this build. Use PNG export instead.");
    });
  }

  // Code exporter
  document.getElementById("btnExportCode")?.addEventListener("click", exportCode);
  document.getElementById("codeOut")?.addEventListener("click", exportCode);
});


