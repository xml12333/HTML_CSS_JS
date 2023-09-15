/**
 * @license MIT
 * @fileoverview All module functions
 * @copyright Nikolay T 2023 All rights reserved
 * @author Nikolay T.
 */
"use strict";
import { apikey } from "./local_settings.js";
/**
 * Fetch data from server
 * @param {string} URL API url
 * @param {*} callback callback
 */
export const fetchData = function (URL, callback) {
  fetch(`${URL}&appid=${apikey}`)
    .then((res) => res.json())
    .then((data) => callback(data));
};

export const url = {
  currentWeather(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/weather?${lat}&${lon}&units=metric`;
  },
  forecast(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric`;
  },
  airPollution(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}`;
  },
  reverseGeo(lat, lon) {
    return `https://api.openweathermap.org/geo/1.0/reverse?${lat}&${lon}&limit=5`;
  },
  /**
   * @param {string} query Search query e.g.: "London", "New York"
   */
  geo(query) {
    return `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5`;
  },
};
