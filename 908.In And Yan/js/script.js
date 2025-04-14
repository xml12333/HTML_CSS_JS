// responsive blur
const updateBlur = () => {
  gb.setAttribute('stdDeviation', Math.min(window.innerWidth / 1600 * 10, 10));
};
updateBlur();
window.addEventListener('resize', updateBlur);