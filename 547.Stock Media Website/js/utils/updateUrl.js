/**
 * @copyright  Nikolay T. 2023
 * @author Nikolay T.
 */

"use strict";
/**
 * Import
 */
import { urlEncode } from "./urlEncode.js";

/**
 *
 * @param {Object}} filterObj  Filter object
 * @param {String} searchType Search type eg. 'videos' or 'photos'
 */
export const updeteUrl = (filterObj, searchType) => {
  setTimeout(() => {
    const /** {String} */ root = window.location.origin;
    const /** {String} */ searchQuery = urlEncode(filterObj);
    const /** {String} */ loc = window.location.pathname.substring(
        1,
        window.location.pathname.lastIndexOf("/")
      );
    const /** {String} */ dirName = loc.substring(
        0,
        loc.indexOf("/") < 0 ? loc.length : loc.indexOf("/")
      );
    window.location = `${root}/${dirName}/pages/${searchType}/${searchType}.html?${searchQuery}`;
  });
};
