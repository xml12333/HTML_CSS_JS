import { Pane } from 'https://cdn.skypack.dev/tweakpane@4.0.4';

const config = {
  theme: 'light',
  reveal: false };


const ctrl = new Pane({
  title: 'Config',
  expanded: true });


const update = () => {
  document.documentElement.dataset.theme = config.theme;
  document.documentElement.dataset.reveal = config.reveal;
};

const sync = event => {
  if (
  !document.startViewTransition ||
  event.target.controller.view.labelElement.innerText !== 'Theme')

  return update();
  document.startViewTransition(() => update());
};

ctrl.addBinding(config, 'theme', {
  label: 'Theme',
  options: {
    System: 'system',
    Light: 'light',
    Dark: 'dark' } });



ctrl.addBinding(config, 'reveal', {
  label: 'Reveal' });


ctrl.on('change', sync);
update();

if (
!CSS.supports('(animation-timeline: view()) and (animation-range: 0 100%)'))
{
  class Slider {
    constructor(element) {
      const input = element.querySelector('[type=range]');
      const sync = () => {
        const val = (input.value - input.min) / (input.max - input.min);
        element.style.setProperty('--slider-complete', Math.round(val * 100));
      };
      console.info('polyfilling scroll animation for input:', element);
      input.addEventListener('input', sync);
      input.addEventListener('pointerdown', ({ x, y }) => {
        const { left, top, height, width } = input.getBoundingClientRect();
        const vertical = height > width;
        const range =
        Number.parseInt(input.max, 10) - Number.parseInt(input.min, 10);
        const ratio = vertical ? (y - top) / height : (x - left) / width;
        // alert(ratio, val)
        const val = Number.parseInt(input.min, 10) + Math.floor(range * ratio);
        input.value = val;
        sync();
      });
      sync();
    }}

  const sliders = document.querySelectorAll('.slider');
  for (const slider of sliders) new Slider(slider);
}

// To cross-check the input value with the visual value
// const input = document.querySelector('.slider input')
// input.addEventListener('input', () => {
//   console.info({
//     val: input.value,
//     complete: Math.round(
//       ((input.value - input.min) / (input.max - input.min)) * 100
//     ),
//   })
// })