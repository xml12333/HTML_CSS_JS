document.addEventListener("DOMContentLoaded", () => {
  const videos = document.querySelectorAll(".layer");
  const offsetBetweenStart = 0.07;
  const maxOffset = 200;
  let loaded = 0;
  
  const syncVideos = () => videos.forEach((v, i) => v.currentTime = i * offsetBetweenStart);
  
  videos.forEach((v) => {
    v.addEventListener("loadeddata", () => {
      loaded++;
      if (loaded === videos.length) {
        videos.forEach((v) => (v.currentTime = 0));
        requestAnimationFrame(() => {
          videos.forEach((v, i) => {
            v.pause();
            const delay = i * offsetBetweenStart;
            setTimeout(() => {
              v.play().catch(() => {}); 
            }, delay * 1000);
          });
        });
      }
    });
  });
  
  const green = document.querySelector(".layer-green");
  const red = document.querySelector(".layer-red");
  const blue = document.querySelector(".layer-blue");
  let centerX = window.innerWidth / 2;
  
  window.addEventListener("resize", () => {
    centerX = window.innerWidth / 2;
  });
  
  let target = 0;
  let current = 0;
  function animate() {
    current += (target - current) * 0.1;
    red.style.transform = `translateX(${current * maxOffset}px)`;
    green.style.transform = `translateX(${current * maxOffset * 0.6}px)`;
    blue.style.transform = `translateX(${current * maxOffset * 0.4}px)`;
    requestAnimationFrame(animate);
  }
  
  animate();
  
  window.addEventListener("mousemove", (e) => {
    const dx = e.clientX - centerX;
    target = Math.max(-1, Math.min(1, dx / centerX));
  });
  
  function resetTarget(snap = false) {
    target = 0;
    if (snap) current = 0;
    syncVideos(); // Maintient le décalage au retour
  }
  
  window.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget) resetTarget();
  });
  window.addEventListener('pointerout', (e) => {
    if (!e.relatedTarget) resetTarget();
  });
  window.addEventListener('mouseleave', () => resetTarget());
  window.addEventListener('blur', () => resetTarget());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) resetTarget();
  });
  window.addEventListener('touchend', () => resetTarget());
  window.addEventListener('touchcancel', () => resetTarget());
});