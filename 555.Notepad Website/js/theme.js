"use strict";

/**
 * Toggles the theme between 'light' and 'dark'
 * Manages the theme setting in the DOM and local storage
 */
const toggleTheme = function () {
  const /**{string} */ currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";
  const /** {string} */ newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
};

/**
 * Initialize the theme
 */
const /** {string | null} */ storedTheme = localStorage.getItem("theme");
const /** {Boolean} */ systemThemeIsDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
const /** {string} */ initialTheme =
    storedTheme ?? (systemThemeIsDark ? "dark" : "light");
document.documentElement.setAttribute("data-theme", initialTheme);
/**
 * Attach toggleTheme to theme button click event
 */
window.addEventListener("DOMContentLoaded", function () {
  const /** {HTMLElement} */ $themeBtn =
      this.document.querySelector("[data-theme-btn]");
  if ($themeBtn) $themeBtn.addEventListener("click", toggleTheme);
});
