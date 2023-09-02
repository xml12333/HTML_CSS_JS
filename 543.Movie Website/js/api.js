"use strict";
const api_key = "4bd7fd3984e6e9eb6636a4415dbae0dd",
  imageBaseUrl = "https://image.tmdb.org/t/p/";

// fetch data from a server useng the 'url' and passes
// the result in JSON  data to a 'callback' function,
// along with an optional parameter if has 'optionParam'.

const fetchDataFromServer = function (url, callback, optionalParam) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => callback(data, optionalParam));
};

export { imageBaseUrl, api_key, fetchDataFromServer };
