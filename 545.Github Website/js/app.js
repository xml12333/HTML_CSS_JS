/**
 * @license MIT
 * @author Nikolay T.
 * @copyright Nikolay T. 2023
 */

"use strict";
/**
 * @param {NodeList} elements  Elements node array
 * @param {string} eventType  Event Type e.g.: "click", "mouseover"
 * @param {Function} callback  Callback function
 */
const addEventOnElements = function (elements, eventType, callback) {
  for (const element of elements) element.addEventListener(eventType, callback);
};

/**
 * Header scrol state
 */

const /** {NodeElement} */ $header = document.querySelector("[data-header]");
window.addEventListener("scroll", function () {
  $header.classList[this.window.scrollY > 50 ? "add" : "remove"]("active");
});

/**
 * Search toggle
 */
const /**{NodeElement} */ $searchToggler = document.querySelector(
    "[data-search-toggler]"
  );
const /**{NodeElement} */ $searchField = document.querySelector(
    "[data-search-field]"
  );

let /** {Boolean} */ isExpanded = false;

$searchToggler.addEventListener("click", function () {
  $header.classList.toggle("search-active");
  isExpanded = isExpanded ? false : true;
  this.setAttribute("aria-expanded", isExpanded);
  $searchField.focus();
});
