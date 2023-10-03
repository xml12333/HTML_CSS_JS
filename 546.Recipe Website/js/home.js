/**
 * @license MIT
 * @copyright 2023 Nikolay T.
 * @author Nikolay T.
 */

"use strict";
/**
 * Home page Search
 */

const /** {NodeElement} */ $searchField = document.querySelector(
    "[data-search-field]"
  );
const /** {NodeElement} */ $searchBtn =
    document.querySelector("[data-search-btn]");

$searchBtn.addEventListener("click", function () {
  if ($searchField.value)
    window.location = `./recipes.html?q=${$searchField.value}`;
});

/**
 * Search submit when press "Enter"
 */
$searchField.addEventListener("keydown", (e) => {
  if (e.key === "Enter") $searchBtn.click();
});

/**
 * Tab panel navigation
 */
const /** {NodeList} */ $tabBtns = document.querySelectorAll("[data-tab-btn]");
const /** {NodeList} */ $tabPanels =
    document.querySelectorAll("[data-tab-panel]");

let /** {NodeElement} */ [$lastActiveTabPanel] = $tabPanels;
let /** {NodeElement} */ [$lastActiveTabBtn] = $tabBtns;

addEventOnElements($tabBtns, "click", function () {
  $lastActiveTabPanel.setAttribute("hidden", "");
  $lastActiveTabBtn.setAttribute("aria-selected", false);
  $lastActiveTabBtn.setAttribute("tabindex", -1);

  const /** {NodeElement} */ $currentTabPanel = document.querySelector(
      `#${this.getAttribute("aria-controls")}`
    );
  $currentTabPanel.removeAttribute("hidden");
  this.setAttribute("aria-selected", true);
  this.setAttribute("tabindex", 0);

  $lastActiveTabPanel = $currentTabPanel;
  $lastActiveTabBtn = this;
});

/**
 * Navigate Tab with arrow key
 */

addEventOnElements($tabBtns, "keydown", function (e) {
  const /** {NodeElement} */ $nextElement = this.nextElementSibling;
  const /** {NodeElement} */ $previousElement = this.previousElementSibling;
  if (e.key === "ArrowRight" && $nextElement) {
    this.setAttribute("tabindex", -1);
    $nextElement.setAttribute("tabindex", 0);
    $nextElement.focus();
  } else if (e.key === "ArrowLeft" && $previousElement) {
    this.setAttribute("tabindex", -1);
    $previousElement.setAttribute("tabindex", 0);
    $previousElement.focus();
  } else if (e.key === "Tab") {
    this.setAttribute("tabindex", -1);
    $lastActiveTabBtn.setAttribute("tabindex", 0);
  }
});
