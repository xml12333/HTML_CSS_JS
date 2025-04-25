import { Pane } from 'https://cdn.skypack.dev/tweakpane@4.0.4';

const config = {
  theme: 'system',
  animatebg: false,
  items: 4,
  size: 70,
  border: 8,
  column: 40,
  movement: 0.72,
  transition: 0.18,
  ltr: true,
  ringed: true,
  offset: -3,
  debug: false };


const peeps = [
{
  avatar:
  'https://assets.codepen.io/605876/cropped-headshot--saturated-low-res.jpg',
  name: 'Jhey' },

{
  avatar:
  'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/22.jpg',
  name: 'Kelly' },

{
  avatar:
  'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/32.jpg',
  name: 'Elias' },

{
  avatar:
  'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/76.jpg',
  name: 'Drew' },

{
  avatar:
  'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/36.jpg',
  name: 'Maxine' },

{
  avatar:
  'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/14.jpg',
  name: 'Matt' },

{
  avatar:
  'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/40.jpg',
  name: 'Vicky' },

{
  avatar:
  'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/93.jpg',
  name: 'Marcos' },

{
  avatar:
  'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/64.jpg',
  name: 'Constance' },

{
  avatar:
  'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/49.jpg',
  name: 'Jill' }];



const container = document.querySelector('.container');
const items = document.querySelector('.items');
const generateItems = () => {
  items.innerHTML = `
    ${new Array(config.items).
  fill(0).
  map(
  (_, index) => {var _peeps$index;return `
      <li>
        <span class="name">${Array.from(peeps[index].name).
    map((char, index) => `<span style="--i: ${index};">${char}</span>`).
    join('')}</span>
        <div class="avatar-holder">
          <span class="avatar">
            <img src="${(_peeps$index = peeps[index]) === null || _peeps$index === void 0 ? void 0 : _peeps$index.avatar}" alt=""/>
          </span>
        </div>
      </li>
    `;}).

  join('')}
  `;
};

const ctrl = new Pane({
  title: 'config',
  expanded: true });


const update = () => {
  document.documentElement.dataset.theme = config.theme;
  document.documentElement.dataset.debug = config.debug;
  document.documentElement.dataset.ringed = config.ringed;
  document.documentElement.dataset.ltr = config.ltr;
  document.documentElement.dataset.animateBg = config.animatebg;
  container.style.setProperty('--size', config.size);
  container.style.setProperty('--column', config.column);
  container.style.setProperty('--border', config.border);
  container.style.setProperty('--movement', config.movement);
  container.style.setProperty('--transition', config.transition);
  container.style.setProperty('--offset', config.offset);
};

const sync = event => {
  if (
  !document.startViewTransition ||
  event.target.controller.view.labelElement.innerText !== 'Theme')

  return update();
  document.startViewTransition(() => update());
};

ctrl.
addBinding(config, 'items', {
  label: 'items',
  min: 2,
  max: 10,
  step: 1 }).

on('change', () => generateItems());
const setup = ctrl.addFolder({ title: 'setup' });
setup.addBinding(config, 'ltr', {
  label: 'ltr' });

setup.addBinding(config, 'size', {
  label: 'size(px)',
  min: 40,
  max: 200,
  step: 1 });

setup.addBinding(config, 'column', {
  label: 'column(px)',
  min: 0,
  max: 200,
  step: 1 });

setup.addBinding(config, 'border', {
  label: 'border(px)',
  min: 0,
  max: 20,
  step: 1 });

const motion = ctrl.addFolder({ title: 'motion' });
motion.addBinding(config, 'movement', {
  label: 'movement',
  min: 0,
  max: 1,
  step: 0.01 });

motion.addBinding(config, 'transition', {
  label: 'transition(s)',
  min: 0,
  max: 1,
  step: 0.01 });

const ring = ctrl.addFolder({ title: 'ring text' });
ring.addBinding(config, 'ringed', {
  label: 'ringed' });

ring.addBinding(config, 'offset', {
  min: -5,
  max: 5,
  step: 0.1,
  label: 'offset(ch)' });

ctrl.addBinding(config, 'animatebg', {
  label: 'animate bg' });

ctrl.addBinding(config, 'debug', {
  label: 'debug' });


ctrl.addBinding(config, 'theme', {
  label: 'Theme',
  options: {
    System: 'system',
    Light: 'light',
    Dark: 'dark' } });



ctrl.on('change', sync);
update();
generateItems();