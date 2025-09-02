const paths = document.querySelectorAll("svg path");
const hex = ["323a8f", "008059", "fd9e26", "c40001", "f01f47"];
const ez = (i) => CustomEase.create("ez", "M0,0 C0.6,0.16 " + (0.6-(i+1)/8) + ",1 1,1");
const tl = gsap.timeline({ repeat: -1 });

paths.forEach((p, i) => {
  const length = p.getTotalLength();
  tl.add(
    gsap.timeline()
    .set(p, { stroke: "#" + hex[i] })
    .from(p, { duration: 1.9, drawSVG: "0 35", ease: ez(5-i) })
    .to(p, { duration: 1.1, drawSVG: length - 35 + " 100%", ease: ez(i) }, "-=0.1")
    .to(p, { duration: 0.9, stroke: "#" + hex[4 - i], x: -240, ease: ez(i) }, "-=0.2")
  , 0);
});

// make it linger a bit to start
gsap.from(tl, { duration:2, timeScale: 0, ease: "sine.in" }); 

// toggle play/pause on click
window.onpointerup = () => { 
  const state = tl.isActive() ? 0 : 1
  gsap.to(tl, { timeScale: state });
  if ( !state ) gsap.to(tl, { progress: Math.round( tl.progress() ), ease: "sine" });
  gsap.to('svg', { filter: "saturate(" + state + ")" });
  gsap.to('body', { background: ["#111", "#211e1a"][state] });
}

// Safari doesn't render <use> very well, so dumb it down...
const ua = navigator.userAgent;
if ( ua.indexOf("Safari") > -1 && ua.indexOf("Chrome") === -1) {
  gsap.set('use', { display: "none" });
  gsap.set('svg', { "stroke-width": 25 });
}