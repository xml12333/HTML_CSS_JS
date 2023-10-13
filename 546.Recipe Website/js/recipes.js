/**
 * @license MIT
 * @copyright 2023 Nikolay T.
 * @author Nikolay T.
 */

"use strict";
/**
 * Import
 */
import { fetchData } from "./api.js";
import { $skeletonCard, cardQueries } from "./global.js";
import { getTime } from "./module.js";

/**
 * Accordion
 */

const /** {NodeList} */ $accordions =
    document.querySelectorAll("[data-accordion]");

/**
 *
 * @param {NodeList} $element Accordion node
 */
const initAccordion = function ($element) {
  const /** {NodeElement} */ $button = $element.querySelector(
      "[data-accordion-btn]"
    );
  let isExpanded = false;
  $button.addEventListener("click", function () {
    isExpanded = isExpanded ? false : true;
    this.setAttribute("aria-expanded", isExpanded);
  });
};

for (const $accordion of $accordions) initAccordion($accordion);

/**
 * Filter bar toggle for mobile screen
 */

const /** {NodeElement} */ $filterBar =
    document.querySelector("[data-filter-bar]");
const /** {NodeList} */ $filterTogglers = document.querySelectorAll(
    "[data-filter-toggler]"
  );
const /** {NodeElement} */ $overlay = document.querySelector("[data-overlay]");

addEventOnElements($filterTogglers, "click", function () {
  $filterBar.classList.toggle("active");
  $overlay.classList.toggle("active");
  const bodyOverflow = document.body.style.overflow;
  document.body.style.overflow =
    bodyOverflow === "hidden" ? "visible" : "hidden";
});

/**
 * Filter submit and clear
 */
const /** {NodeElement} */ $filterSubmit = document.querySelector(
    "[data-filter-submit]"
  );
const /** {NodeElement} */ $filterClear = document.querySelector(
    "[data-filter-clear]"
  );
const /** {NodeElement} */ $filterSearch = $filterBar.querySelector(
    "input[name='search']"
  );

$filterSubmit.addEventListener("click", function () {
  const /** NodeList */ $filterCheckboxes =
      $filterBar.querySelectorAll("input:checked");
  const /** {Array} */ queries = [];
  if ($filterSearch.value) queries.push(["q", $filterSearch.value]);
  if ($filterCheckboxes.length) {
    for (const $checkbox of $filterCheckboxes) {
      const /** {String} */ key =
          $checkbox.parentElement.parentElement.dataset.filter;
      queries.push([key, $checkbox.value]);
    }
  }
  window.location = queries.length
    ? `./recipes.html?${queries.join("&").replace(/,/g, "=")}`
    : "./recipes.html";
});
