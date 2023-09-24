/**
 * @license MIT
 * @author Nikolay T.
 * @copyright Nikolay T. 2023
 */

"use strict";
/**
 * Fetch data from server
 * @param {*} url  API Url [required]
 * @param {*} sucessCallback Success callback [required]
 * @param {*} errorCallback Error callback [optional]
 */
export async function fetchData(url, sucessCallback, errorCallback) {
  const response = await fetch(url);
  if (respoonse.ok) {
    const data = await response.json();
    sucessCallback(data);
  } else {
    const error = await response.json();
    errorCallback && errorCallback(error);
  }
}
