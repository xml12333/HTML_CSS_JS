import { codeToHtml } from 'https://esm.sh/shiki@1.0.0';
import gsap from 'https://cdn.skypack.dev/gsap@3.12.0';
import Matter from 'https://cdn.skypack.dev/matter-js';
import { Pane } from 'https://cdn.skypack.dev/tweakpane';
import * as TextareaPlugin from 'https://cdn.skypack.dev/@pangenerator/tweakpane-textarea-plugin';

const main = document.querySelector('main');
let render;
let characterBodies = [];
const config = {
  theme: 'dark',
  lang: 'javascript',
  //   code: `function calculateTotalPrice(cart) {
  //   var total = 0;

  //   for (var i = 0; i < cart.length; i++) {
  //     total += cart[i].price * (cart[i].quantity || "1");
  //     if (cart[i].category == 'electronics') {
  //       total -= (total * 0.1);  // 10% discount on electronics
  //     } else if (cart[i].category == 'clothing') {
  //       total -= 5;  // Flat discount
  //     }
  //     if (cart[i].id == 42) {
  //       total -= 10;
  //     }
  //   }

  //   total = Math.round(total * 100) / 100 + '';

  //   setTimeout(function() {
  //     total = (parseFloat(total) * 1.05).toFixed(2);
  //   }, 1);

  //   return total;
  // }`,
  code: `// fix this code
function getData() {
  for (let i = 0; i < 3; i++) {
    setTimeout(function() {
      console.log(i);
    }, 1000);
  }
}

getData();`,
  fizzy: false };


const ctrl = new Pane({
  title: 'Config',
  expanded: true });

ctrl.registerPlugin(TextareaPlugin);

let walls = [];
const createWalls = () => {
  if (walls.length) {
    for (const wall of walls) {
      Matter.Composite.remove(engine.world, wall);
    }
    walls = [];
  }
  requestAnimationFrame(() => {
    const thickness = 2000;
    walls = [
    Matter.Bodies.rectangle(
    window.innerWidth * 0.5,
    window.innerHeight * -1 - thickness * 0.5,
    window.innerWidth * 10,
    thickness,
    {
      collisionFilter: {
        category: 0x0001 },

      isStatic: true }),


    Matter.Bodies.rectangle(
    window.innerWidth * 0.5,
    window.innerHeight + thickness * 0.5,
    window.innerWidth * 10,
    thickness,
    {
      collisionFilter: {
        category: 0x0001 },

      isStatic: true }),


    Matter.Bodies.rectangle(
    window.innerWidth + thickness * 0.5,
    0,
    thickness,
    window.innerHeight * 10,
    {
      collisionFilter: {
        category: 0x0001 },

      isStatic: true }),


    Matter.Bodies.rectangle(
    thickness * -0.5,
    0,
    thickness,
    window.innerHeight * 10,
    {
      collisionFilter: {
        category: 0x0001 },

      isStatic: true })];



    Matter.Composite.add(engine.world, walls);
  });
};

const createCharacters = () => {
  const chars = Array.from(
  document.querySelectorAll('.line > span > span')).
  filter(node => node.textContent.trim() !== '');
  for (let i = 0; i < chars.length; i++) {
    const bounds = chars[i].getBoundingClientRect();

    const first = Math.random() > 0.5;
    const characterBody = Matter.Bodies.rectangle(
    bounds.x + bounds.width * 0.5,
    bounds.y + bounds.height * 0.5 + window.scrollY,
    bounds.width,
    bounds.height,
    {
      collisionFilter: {
        category: first ? 0x0002 : 0x0004,
        mask: first ? 0x0001 | 0x0002 : 0x0001 | 0x0004 },

      restitution: config.fizzy ? 1.28 : 1,
      elem: chars[i],
      startX: bounds.x + bounds.width * 0.5,
      startY: bounds.y + bounds.height * 0.5 + window.scrollY });


    chars[i].style.setProperty('--delay', Math.random());
    chars[i].style.setProperty('--speed', Math.random() * 0.2 + 0.1);
    characterBodies.push(characterBody);
  }
};
let detector;
const renderCode = async () => {
  gsap.ticker.remove(render);
  // Here we need to remove all bodies and add some new ones...
  if (characterBodies.length) {
    characterBodies.map(body => {
      Matter.Composite.remove(engine.world, body);
    });
  }
  // Reset the Array
  characterBodies = [];
  // Once you've cleared out the bodies, create the code
  const html = await codeToHtml(config.code, {
    lang: config.lang,
    theme: 'poimandres',
    transformers: [
    {
      span(node) {
        const newKidsOnTheBlock = [];
        const textContent = node.children[0].value.split('');
        for (let c = 0; c < textContent.length; c++) {
          newKidsOnTheBlock.push({
            type: 'element',
            tagName: 'span',
            properties: {
              class: 'character' },

            children: [
            {
              type: 'text',
              value: textContent[c] }] });



        }
        node.children = newKidsOnTheBlock;
      } }] });



  // Set the innerHTML
  main.innerHTML = html;
  // Now create your Matter Bodies
  createCharacters();
  // Add them to the world
  Matter.Composite.add(engine.world, characterBodies);
  // create walls
  createWalls();
  // Create collision detector
  // detector = Matter.Detector.create({
  //   bodies: characterBodies,
  // })
};

renderCode();

ctrl.
addBinding(config, 'code', {
  label: 'Code',
  view: 'textarea',
  rows: 6 }).

on('change', renderCode);
ctrl.
addBinding(config, 'lang', {
  label: 'Language',
  options: {
    JS: 'javascript',
    CSS: 'css',
    HTML: 'html' } }).


on('change', renderCode);
ctrl.
addBinding(config, 'fizzy', {
  label: 'Fizzy' }).

on('change', renderCode);
const update = () => {
  document.documentElement.dataset.theme = config.theme;
};

const sync = event => {
  if (
  !document.startViewTransition ||
  event.target.controller.view.labelElement.innerText !== 'Theme')

  return update();
  document.startViewTransition(() => update());
};

ctrl.on('change', sync);
update();

// Matter JS Engine code for characters
const engine = Matter.Engine.create({
  render: {
    options: {
      pixelRatio: window.devicePixelRatio } } });



engine.gravity.x = 0;
engine.gravity.y = 0;
engine.gravity.scale = 0.01;

// Static Bodies for the Viewport

render = () => {
  for (let c = 0; c < characterBodies.length; c++) {
    const char = characterBodies[c];
    const ty = char.position.y - char.startY;
    const tx = char.position.x - char.startX;
    char.elem.style.setProperty('--ty', Math.floor(ty));
    char.elem.style.setProperty('--tx', Math.floor(tx));
  }
  Matter.Engine.update(engine);
};

main.addEventListener('click', () => {
  gsap.ticker.add(render);
  main.dataset.active = true;
  engine.gravity.y = 0.25;
});

const reset = () => {
  engine.gravity.y = 0;
  for (let i = 0; i < characterBodies.length; i++) {
    const char = characterBodies[i];
    Matter.Body.setPosition(char, {
      x: char.startX,
      y: char.startY });

    gsap.ticker.remove(render);
    main.dataset.active = false;
    char.elem.style.setProperty('--tx', 0);
    char.elem.style.setProperty('--ty', 0);
  }
};

// Add mouse drag
const mouseConstraint = Matter.MouseConstraint.create(engine, {
  element: document.querySelector('header') });


// Remove the scroll interception so we can scroll past
mouseConstraint.mouse.element.removeEventListener(
'wheel',
mouseConstraint.mouse.mousewheel);

mouseConstraint.mouse.element.removeEventListener(
'DOMMouseScroll',
mouseConstraint.mouse.mousewheel);

Matter.Composite.add(engine.world, [mouseConstraint]);

ctrl.addButton({ title: 'Reset' }).on('click', reset);

window.addEventListener('resize', renderCode);