/**
 * @copyright  Nikolay T. 2023
 * @author Nikolay T.
 */

"use strict";
// import
import { ripple } from "./utils/ripple.js";
import { addEventOnElements } from "./utils/event.js";
/**
 * Header on-scroll state
 */

const /** {Nodeelement} */ $header = document.querySelector("[data-header]");
window.addEventListener("scroll", () => {
  $header.classList[window.scrollY > 50 ? "add" : "remove"]("active");
});

/**
 * Add ripple effect
 */
const /** {NodeeList} */ $rippleElems =
    document.querySelectorAll("[data-ripple]");

$rippleElems.forEach(($rippleElems) => ripple($rippleElems));

/**
 * Navbar toggle for mobile screen
 */
const /** {NodeList} */ $navTogglers =
    document.querySelectorAll("[data-nav-toggler]");
const /** {NodeElement} */ $navbar =
    document.querySelector("[data-navigation]");
const /** {NodeElement} */ $scrim = document.querySelector("[data-scrim]");

addEventOnElements($navTogglers, "click", function () {
  $navbar.classList.toggle("show");
  $scrim.classList.toggle("active");
});

/**
 * Filter functionality
 */

window.filterObj = {};
