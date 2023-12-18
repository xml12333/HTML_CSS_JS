"use strict";

/**
 * Module import
 */
import { addEventOnElements, getGreetingMsg } from "./utils.js";
/**
 * Toggle sidebar in small screen
 */

const /** {HTMLElement} */ $sidebar = document.querySelector("[data-sidebar]");
const /** {Array<HTMLElement} */ $sidebarTogglers = document.querySelectorAll(
    "[data-sidebar-toggler]"
  );
const /** {HTMLElement} */ $overlay = document.querySelector(
    "[data-sidebar-overlay]"
  );

addEventOnElements($sidebarTogglers, "click", function () {
  $sidebar.classList.toggle("active");
  $overlay.classList.toggle("active");
});

/**
 * show greeting message on homepage
 */
const /** {HTMLElement} */ $greetElem =
    document.querySelector("[data-greeting]");
const /** {number} */ currentHour = new Date().getHours();
$greetElem.textContent = getGreetingMsg(currentHour);

/**
 * Show current date on homepage
 */
const /** {HTMLElement} */ $currentDateElem = document.querySelector(
    "[data-current-date]"
  );

$currentDateElem.textContent = new Date().toDateString().replace(" ", ", ");
