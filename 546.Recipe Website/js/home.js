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
