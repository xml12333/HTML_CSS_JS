/**
 * @copyright  Nikolay T. 2023
 * @author Nikolay T.
 */

"use strict";
/**
 * Import
 */
import { ripple } from "./utils/ripple.js";

/**
 * Create collection card
 * @param {Object} collection Collection object
 * @returns {Node} Collection card
 */
export const collectionCard = (collection) => {
  const /** {String} */ root = window.location.origin;
  const /** {String} */ loc = window.location.pathname;
  const /** {String} */ dirName = loc.substring(1, loc.lastIndexOf("/"));
  const { id, title, media_count } = collection;
  const /** {NodeElement} */ $card = document.createElement("div");
  $card.classList.add("grid-card", "two-line", "list-item");
  $card.setAttribute("title", title);
  $card.innerHTML = `
    <div>
      <h3 class="body-large">
       ${title}
      </h3>
      <p class="body-medium label">${media_count}</p>
    </div>
    <a href="${root}/${dirName}/pages/collections/collection_detail.html?id=${id}&title=${title}" class="state-layer"></a>
  `;
  ripple($card);
  return $card;
};
