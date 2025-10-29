import gsap from 'https://cdn.skypack.dev/gsap@3.13.0';
import Draggable from 'https://cdn.skypack.dev/gsap@3.13.0/Draggable';
import { Pane } from 'https://cdn.skypack.dev/tweakpane@4.0.4';
gsap.registerPlugin(Draggable);

const section = document.querySelector('section');
const column = section.querySelector('.column');
let detailsElements = section.querySelectorAll('details[name="feature"]');
const nextButton = section.querySelector('button[data-action="next"]');
const previousButton = section.querySelector('button[data-action="previous"]');
const exitButton = section.querySelector('button[data-action="exit"]');

const config = {
  theme: 'dark',
  debug: false };


const ctrl = new Pane({
  title: 'config',
  expanded: true });


const update = () => {
  document.documentElement.dataset.theme = config.theme;
  document.documentElement.dataset.debug = config.debug;
};

const sync = event => {
  if (
  !document.startViewTransition ||
  event.target.controller.view.labelElement.innerText !== 'theme')

  return update();
  document.startViewTransition(() => update());
};


ctrl.addButton({ title: 'reset' }).on('click', () => {
  const currentIndex = getOpenDetails();

  if (currentIndex !== -1) {
    // Close the currently open details
    detailsElements[currentIndex].open = false;
  }
  const details = column.innerHTML;
  column.innerHTML = '';
  requestAnimationFrame(() => {
    column.innerHTML = details;
    detailsElements = section.querySelectorAll('details[name="feature"]');
  });
});

ctrl.addBinding(config, 'debug');

ctrl.addBinding(config, 'theme', {
  label: 'theme',
  options: {
    system: 'system',
    light: 'light',
    dark: 'dark' } });



ctrl.on('change', sync);
update();

// make tweakpane panel draggable
const tweakClass = 'div.tp-dfwv';
const d = Draggable.create(tweakClass, {
  type: 'x,y',
  allowEventDefault: true,
  trigger: tweakClass + ' button.tp-rotv_b' });

document.querySelector(tweakClass).addEventListener('dblclick', () => {
  gsap.to(tweakClass, {
    x: `+=${d[0].x * -1}`,
    y: `+=${d[0].y * -1}`,
    onComplete: () => {
      gsap.set(tweakClass, { clearProps: 'all' });
    } });

});

// Navigation functionality for details elements
// Find the currently open details element
const getOpenDetails = () => {
  return Array.from(detailsElements).findIndex(details => details.open);
};

// Navigate to next details
nextButton === null || nextButton === void 0 ? void 0 : nextButton.addEventListener('click', () => {
  const currentIndex = getOpenDetails();

  // Only proceed if there's currently an open details element
  if (currentIndex !== -1) {
    // Close current
    detailsElements[currentIndex].open = false;
    // Open next (wrap to first if at end)
    const nextIndex = (currentIndex + 1) % detailsElements.length;
    detailsElements[nextIndex].open = true;
  }
});

// Navigate to previous details
previousButton === null || previousButton === void 0 ? void 0 : previousButton.addEventListener('click', () => {
  const currentIndex = getOpenDetails();

  // Only proceed if there's currently an open details element
  if (currentIndex !== -1) {
    // Close current
    detailsElements[currentIndex].open = false;
    // Open previous (wrap to last if at beginning)
    const previousIndex = (currentIndex - 1 + detailsElements.length) % detailsElements.length;
    detailsElements[previousIndex].open = true;
  }
});

// Exit current details
exitButton === null || exitButton === void 0 ? void 0 : exitButton.addEventListener('click', () => {
  const currentIndex = getOpenDetails();

  if (currentIndex !== -1) {
    // Close the currently open details
    detailsElements[currentIndex].open = false;
  }
});

// the nuance here is that you only want to set open after something has become open
// default will be that we are in off state until something is open
const syncState = async () => {
  // if (inactive) {
  if (!section.matches(':has([open])')) {
    section.dataset.checkingDetails = false;
  } else {
    await Promise.allSettled(section.getAnimations({ subtree: true }).map(a => a.finished));
    section.dataset.checkingDetails = true;
  }
};

section.addEventListener('toggle', syncState, true);