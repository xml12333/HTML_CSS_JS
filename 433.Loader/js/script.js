function getCursorPosition() {
    const x = event.clientX - window.innerWidth / 2;
    const y = event.clientY - window.innerHeight / 2;
    const angle = Math.atan2(y, x);
    const hue = (angle + Math.PI) / (2 * Math.PI) * 360;
    document.documentElement.style.setProperty('--user-hue', hue);
  }
  
  document.addEventListener('mousemove', getCursorPosition);
  