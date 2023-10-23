/**
 * @copyright  Nikolay T. 2023
 * @author Nikolay T.
 */

"use strict";
// import
import { ripple } from "./utils/ripple.js";
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
