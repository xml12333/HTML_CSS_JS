/**
 * @copyright  Nikolay T. 2023
 * @author Nikolay T.
 */

"use strict";
/**
 * Convert Object to Url
 * @param {Object} urlObj  url object
 * @returns url string
 */
export const urlEncode = (urlObj) => {
  return Object.entries(urlObj)
    .join("&")
    .replace(/,/g, "=")
    .replace(/#/g, "%23")
    .replace(/ /g, "%20");
};
