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

/**
 * Tab navigation
 */
const /**{NodeList} */ $tabBtns = document.querySelectorAll("[data-tab-btn]");
const /**{NodeList} */ $tabPanels =
    document.querySelectorAll("[data-tab-panel]");

let /**{NodeElement} */ [$lastActiveTabBtn] = $tabBtns;
let /**{NodeElement} */ [$lastActiveTabPanel] = $tabPanels;

addEventOnElements($tabBtns, "click", function () {
  $lastActiveTabBtn.setAttribute("aria-selected", "false");
  $lastActiveTabPanel.setAttribute("hidden", "");
  this.setAttribute("aria-selected", "true");
  const /**{NodeElement} */ $currentTabPanel = document.querySelector(
      `#${this.getAttribute("aria-controls")}`
    );
  $currentTabPanel.removeAttribute("hidden");

  $lastActiveTabBtn = this;
  $lastActiveTabPanel = $currentTabPanel;
});

/**
 * Keyboard accessibility for tab buttons
 */
addEventOnElements($tabBtns, "keydown", function (e) {
  const /**{NodeElement} */ $nextElement = this.nextElementSibling;
  const /**{NodeElement} */ $previousElement = this.previousElementSibling;
  if (e.key === "ArrowRight" && $nextElement) {
    this.setAttribute("tabindex", "-1");
    $nextElement.setAttribute("tabindex", "0");
    $nextElement.focus();
  } else if (e.key==="ArrowLeft" && $previousElement){
    this.setAttribute("tabindex", "-1");
    $previousElement.setAttribute("tabindex", "0");
    $previousElement.focus();
  }
});
