"use strict";

/**
 * Preloader
 */
const preloader = document.querySelector("[data-preloader]");
window.addEventListener("DOMContentLoaded", function () {
  preloader.classList.add("loaded");
  this.document.body.classList.add("loaded");
});
