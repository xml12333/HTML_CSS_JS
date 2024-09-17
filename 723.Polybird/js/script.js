new Vue({
  el: "#app",
  mounted() {
    TweenMax.set(`.polygons path`, { scale: 0, opacity: 0, transformOrigin: '50% 50%' });
    TweenMax.set(`.feet`, { scale: 0, opacity: 0, transformOrigin: '50% 50%' });
    TweenMax.staggerTo(`.polygons path`, 0.35, {
      scale: 1, opacity: 1, ease: Back.easeOut.config(1.6) },
    0.03);
    TweenMax.to(`.feet`, 1, { scale: 1, opacity: 1, ease: Sine.easeOut, delay: 2.3 });
  } });