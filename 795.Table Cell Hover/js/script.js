import { Pane } from 'https://cdn.skypack.dev/tweakpane@4.0.4';

const config = {
  theme: 'dark',
  hue: Math.floor(Math.random() * 359) };


const ctrl = new Pane({
  title: 'Config',
  expanded: false });


const update = () => {
  document.documentElement.dataset.theme = config.theme;
  document.documentElement.style.setProperty('--hue', config.hue);
};

const sync = event => {
  if (
  !document.startViewTransition ||
  event.target.controller.view.labelElement.innerText !== 'Theme')

  return update();
  document.startViewTransition(() => update());
};

ctrl.addBinding(config, 'hue', {
  min: 0,
  max: 359,
  step: 1,
  label: 'hue' });


ctrl.addBinding(config, 'theme', {
  label: 'Theme',
  options: {
    System: 'system',
    Light: 'light',
    Dark: 'dark' } });



ctrl.on('change', sync);
update();