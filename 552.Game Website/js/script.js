"use strict";

/**
 * Add event on multiple elements
 * @param {NodeList} $elements NodeList
 * @param {String} eventType  Event type string
 * @param {Function} callback  Callback function
 */
window.addEventOnElements = function (elements, eventType, callback) {
  for (const element of elements) element.addEventListener(eventType, callback);
};

/**
 * Mobile navbar
 * navbar will show after clicking menu button
 */

const navbar = document.querySelector("[data-navbar]");
const navToggler = document.querySelector("[data-nav-toggler]");
const navLinks = document.querySelectorAll("[data-nav-link]");

const toggleNav = function () {
  navbar.classList.toggle("active");
  this.classList.toggle("active");
};
navToggler.addEventListener("click", toggleNav);

const navClose = () => {
  navbar.classList.remove("active");
  navToggler.classList.remove("active");
};
addEventOnElements(navLinks, "click", navClose);

/**
 * Header
 * header will be active after scrolled down to 100px of screen
 */

const header = document.querySelector("[data-header]");
const activeEl = function () {
  if (window.scrollY > 100) {
    header.classList.add("active");
  } else {
    header.classList.remove("active");
  }
};
window.addEventListener("scroll", activeEl);

/**
 * Button hover ripple effect
 */
const buttons = document.querySelectorAll("[data-btn]");
const buttonHoverRipple = function (event) {
  this.style.setProperty("--top", `${event.offsetY}px`);
  this.style.setProperty("--left", `${event.offsetX}px`);
};

addEventOnElements(buttons, "mousemove", buttonHoverRipple);