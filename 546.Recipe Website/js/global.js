/**
 * @license MIT
 * @copyright 2023 Nikolay T.
 * @author Nikolay T.
 */

"use strict";
/**
 * Add event on multiple elements
 * @param {NodeList} $elements NodeList
 * @param {String} eventType  Event type string
 * @param {Function} callback  Callback function
 */
window.addEventOnElements = function (elements, eventType, callback) {
  for (const element of elements) element.addEventListener(eventType, callback);
};

