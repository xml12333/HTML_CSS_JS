import gsap from 'https://cdn.skypack.dev/gsap@3.13.0';
import { Pane } from 'https://cdn.skypack.dev/tweakpane@4.0.4';

const config = {
  theme: 'dark',
  baseFrequency: 0.03,
  numOctaves: 2,
  type: 'turbulence',
  scale: 22,
  radius: 100,
  width: 4 };


const ctrl = new Pane({
  title: 'config' });


const update = () => {
  document.documentElement.dataset.theme = config.theme;
  document.documentElement.style.setProperty('--radius', config.radius);
  document.documentElement.style.setProperty('--width', config.width);
  gsap.set('feTurbulence', {
    attr: {
      type: config.type,
      baseFrequency: config.baseFrequency,
      numOctaves: config.numOctaves } });


  gsap.set('feDisplacementMap', {
    attr: {
      scale: config.scale } });


};

const sync = event => {
  if (
  !document.startViewTransition ||
  event.target.controller.view.labelElement.innerText !== 'theme')

  return update();
  document.startViewTransition(() => update());
};

ctrl.addBinding(config, 'type', {
  options: {
    turbulence: 'turbulence',
    noise: 'noise' } });



ctrl.addBinding(config, 'baseFrequency', {
  min: 0,
  max: 1,
  step: 0.01 });

ctrl.addBinding(config, 'numOctaves', {
  min: 0,
  max: 10,
  step: 1 });

ctrl.addBinding(config, 'scale', {
  min: 0,
  max: 100,
  step: 1 });

ctrl.addBinding(config, 'radius', {
  min: 0,
  max: 150,
  step: 1 });

ctrl.addBinding(config, 'width', {
  min: 1,
  max: 10,
  step: 1 });

ctrl.addBinding(config, 'theme', {
  label: 'theme',
  options: {
    system: 'system',
    light: 'light',
    dark: 'dark' } });



ctrl.on('change', sync);
update();

const proxy = {
  one: 0 };


gsap.fromTo(proxy, {
  one: 0 },
{
  one: 1000,
  snap: {
    one: 1 },

  repeat: -1,
  duration: 20,
  ease: 'none',
  repeatRefresh: true,
  onUpdate: () => {
    gsap.set('#noise feTurbulence', { attr: {
        seed: proxy.one } });

    gsap.set('#noise2 feTurbulence', { attr: {
        seed: proxy.one + 10 } });

  } });

gsap.ticker.fps(24);
// gsap.to('feTurbulence', {
//   one: 100,
//   attr: {
//     seed: () => gsap.utils.random(0, 100, 1),
//   },
//   snap: {
//     one: 1,
//     attr: {
//       seed: 1,
//     }
//   },
//   onUpdate: () => {
//     console.info(this.one)
//   },
//   ease: 'none',
//   duration: 1,
//   repeat: -1,
//   repeatRefresh: true,
// })