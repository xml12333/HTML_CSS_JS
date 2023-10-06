/**
 * @license MIT
 * @copyright 2023 Nikolay T.
 * @author Nikolay T.
 */

"use strict";
import { app_key, app_id } from "./local_settings";
window.ACCESS_POINT = "https://api.edamam.com/api/recipes/v2";
const /** {String} */ APP_ID = app_id;
const /** {String} */ APP_KEY = app_key;
const /** {String} */ TYPE = "public";

/**
 *
 * @param {Array} queries Query array
 * @param {Function} successCallback Success callback function
 */
export const fetchData = async function (queries, successCallback) {
  const /** {String} */ query = queries
      ?.join("&")
      .replace(/, /g, "=")
      .replace(/ /g, "%20")
      .replace(/\+/g, "%2B");
  const /** {String} */ url = `${ACCESS_POINT}?app_id=${APP_ID}&app_key=${APP_KEY}&type=${TYPE}${
      query ? `&${query}` : ""
    }`;

  const /** {Object} */ response = await fetch(url);
  if (response.ok) {
    const data = await response.json();
    successCallback(data);
  }
};
