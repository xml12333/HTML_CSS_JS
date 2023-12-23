"use strict";
/**
 * Light and dark mode
 */
const /** {NoteElement} */ $themeBtn =
    document.querySelector("[data-theme-btn]");
const /** {NoteElement} */ $HTML = document.documentElement;
let /** {Boolean | String} */ isDark = window.matchMedia(
    "(prefers-color-scheme:dark)"
  ).matches;

if (sessionStorage.getItem("theme")) {
  $HTML.dataset.theme = sessionStorage.getItem("theme");
} else {
  $HTML.dataset.theme = isDark ? "dark" : "light";
}
const changeTheme = () => {
  $HTML.dataset.theme =
    sessionStorage.getItem("theme") === "light" ? "dark" : "light";
  sessionStorage.setItem("theme", $HTML.dataset.theme);
};
$themeBtn.addEventListener("click", changeTheme);
