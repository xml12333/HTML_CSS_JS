"use strict";
// add event on multiple elements
const addEventOnElement = function (elements, eventType, callback) {
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].addEventListener(eventType, callback);
  }
};
// toggle search box in mobile device || small screen
const searchBox = document.querySelector("[search-box]");
const searchTogglers = document.querySelectorAll("[search-toggler]");

addEventOnElement(searchTogglers, "click", function () {
  searchBox.classList.toggle("active");
});

// store movieId in 'localStorage' when you click any movie card
const getMovieDetail = function(movieId){
  window.localStorage.setItem("movieId", String(movieId))
}