import { Pane } from 'https://cdn.skypack.dev/tweakpane@4.0.4';
import { gsap } from 'https://cdn.skypack.dev/gsap@3.13.0';
import Draggable from 'https://cdn.skypack.dev/gsap@3.13.0/Draggable';
gsap.registerPlugin(Draggable);

const config = {
  theme: 'system',
  radius: 4,
  bridge: true,
  debug: false };


const ctrl = new Pane({
  title: 'config' });

ctrl.addBinding(config, 'bridge');
const debugCtrl = ctrl.addBinding(config, 'debug', {
  disabled: !config.bridge });

ctrl.addBinding(config, 'radius', {
  label: 'radius',
  min: 0,
  max: 30,
  step: 1 });


ctrl.addBinding(config, 'theme', {
  label: 'theme',
  options: {
    system: 'system',
    light: 'light',
    dark: 'dark' } });



const update = () => {
  document.documentElement.dataset.theme = config.theme;
  document.documentElement.dataset.bridge = config.bridge;
  document.documentElement.dataset.debug = config.debug;
  debugCtrl.disabled = !config.bridge;
  document.documentElement.style.setProperty('--pagination-radius', config.radius);
};

const sync = event => {
  if (
  !document.startViewTransition ||
  event.target.controller.view.labelElement.innerText !== 'theme')

  return update();
  document.startViewTransition(() => update());
};

ctrl.on('change', sync);

// tell styles if config is raw
const isRaw = new URLSearchParams(window.location.search).get('raw') === 'true';
if (isRaw) document.documentElement.dataset.raw = 'true';

// Draggable controls
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
update();

// Pagination logic
const pagination = document.querySelector('.pagination');
const paginationLinks = Array.from(pagination.querySelectorAll('.pagination__link:not(.pagination__link--arrow):not(.pagination__link--gap)'));
const prevButton = pagination.querySelector('.pagination__link--arrow[aria-label="Previous"]');
const nextButton = pagination.querySelector('.pagination__link--arrow[aria-label="Next"]');

// Function to update arrow states
const updateArrowStates = () => {
  const currentPageIndex = Array.from(paginationLinks).findIndex((link) =>
  link.getAttribute('aria-current') === 'page');


  // Disable previous button if on first page
  if (currentPageIndex === 0) {
    prevButton.setAttribute('aria-disabled', 'true');
    prevButton.classList.add('pagination__link--disabled');
    prevButton.removeAttribute('href');
  } else {
    prevButton.removeAttribute('aria-disabled');
    prevButton.classList.remove('pagination__link--disabled');
    // Set href to previous page
    const prevPageHref = paginationLinks[currentPageIndex - 1].getAttribute('href');
    prevButton.setAttribute('href', prevPageHref);
  }

  // Disable next button if on last page
  if (currentPageIndex === paginationLinks.length - 1) {
    nextButton.setAttribute('aria-disabled', 'true');
    nextButton.classList.add('pagination__link--disabled');
    nextButton.removeAttribute('href');
  } else {
    nextButton.removeAttribute('aria-disabled');
    nextButton.classList.remove('pagination__link--disabled');
    // Set href to next page
    const nextPageHref = paginationLinks[currentPageIndex + 1].getAttribute('href');
    nextButton.setAttribute('href', nextPageHref);
  }
};
// Function to set current page
const setCurrentPage = targetLink => {
  // Remove aria-current and current class from all links
  paginationLinks.forEach(link => {
    link.removeAttribute('aria-current');
    link.classList.remove('pagination__link--current');
  });

  // Add aria-current="page" and current class to target link
  targetLink.setAttribute('aria-current', 'page');
  targetLink.classList.add('pagination__link--current');
  const targetRect = targetLink.getBoundingClientRect();
  const parentRect = pagination.getBoundingClientRect();
  const offset = {
    x: targetRect.left - parentRect.left,
    y: targetRect.top - parentRect.top };

  pagination.style.setProperty('--pagination-active-x', offset.x);
  pagination.style.setProperty('--pagination-active-y', offset.y);
  pagination.style.setProperty('--pagination-active-width', targetRect.width);
  pagination.style.setProperty('--pagination-active-height', targetRect.height);
  // Update arrow states
  updateArrowStates();
};
const currentPage = Array.from(paginationLinks).find((link) =>
link.getAttribute('aria-current') === 'page');

setCurrentPage(currentPage);
// you want to enable the transitions in the next frame
requestAnimationFrame(() => {
  pagination.dataset.ready = true;
});
const handlePaginationClick = event => {
  // event.preventDefault();
  setCurrentPage(event.currentTarget);
};

// Handle arrow navigation
const handleArrowClick = event => {
  const isDisabled = event.currentTarget.getAttribute('aria-disabled') === 'true';
  if (isDisabled) {
    event.preventDefault();
    return;
  }

  const currentPageIndex = Array.from(paginationLinks).findIndex((link) =>
  link.getAttribute('aria-current') === 'page');


  if (event.currentTarget === prevButton && currentPageIndex > 0) {
    event.preventDefault();
    setCurrentPage(paginationLinks[currentPageIndex - 1]);
    paginationLinks[currentPageIndex - 1].focus();
  } else if (event.currentTarget === nextButton && currentPageIndex < paginationLinks.length - 1) {
    event.preventDefault();
    setCurrentPage(paginationLinks[currentPageIndex + 1]);
    paginationLinks[currentPageIndex + 1].focus();
  }
};

// Add click event listeners to pagination links
paginationLinks.forEach(link => {
  link.addEventListener('click', handlePaginationClick);
});

// Add click event listeners to arrow buttons
prevButton.addEventListener('click', handleArrowClick);
nextButton.addEventListener('click', handleArrowClick);

// Initialize arrow states
updateArrowStates();