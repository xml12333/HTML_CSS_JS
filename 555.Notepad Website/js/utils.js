"use strict";
/**
 * Add event on multiple elements
 * @param {NodeList} $elements NodeList
 * @param {String} eventType  Event type string
 * @param {Function} callback  Callback function
 */
const addEventOnElements = function (elements, eventType, callback) {
  for (const element of elements) element.addEventListener(eventType, callback);
};

/**
 * Generates a greeting message based on the current hour of the day
 *
 * @param {number} currentHour  - The current hour (0-23) to determine the appropriate greeting.
 * @returns {string} A greeting message with a salutation corresponding to the time of day
 */
const getGreetingMsg = function (currentHour) {
  const /** {string} */ greeting =
      currentHour < 5
        ? "Night"
        : currentHour < 12
        ? "Morning"
        : currentHour < 15
        ? "Noon"
        : currentHour < 17
        ? "Afternoon"
        : currentHour < 20
        ? "Evening"
        : "Night";
  return `Good ${greeting}`;
};

export { addEventOnElements, getGreetingMsg };
