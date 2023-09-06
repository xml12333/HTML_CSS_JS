"use strict";
import {API_KEY_TMBDB} from "./local_settings.js"
const api_key = API_KEY_TMBDB,
  imageBaseUrl = "https://image.tmdb.org/t/p/";

// fetch data from a server useng the 'url' and passes
// the result in JSON  data to a 'callback' function,
// along with an optional parameter if has 'optionParam'.

const fetchDataFromServer = function (url, callback, optionalParam) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      callback(data, optionalParam)});
};

export { imageBaseUrl, api_key, fetchDataFromServer };
