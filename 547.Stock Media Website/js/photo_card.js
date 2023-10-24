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
 * Create photo card
 */

export const photoCard = (photo) => {
  const /** {String} */ root = window.location.origin;
  const /** {String} */ loc = window.location.pathname;
  const /** {String} */ dirName = loc.substring(1, loc.lastIndexOf("/"));
  console.log(photo);
  const {
    alt,
    avg_color: backdropColor,
    width,
    height,
    id,
    src: { large },
  } = photo;
  const /** {NodeElement} */ $card = document.createElement("div");
  $card.classList.add("card", "grid-item");
  $card.style.backgroundColor = backdropColor;

  $card.innerHTML = `
    <figure class="card-banner" style="--width: ${width}; --height: ${height}">
      <img
        src="${large}"
        width="${width}"
        height="${height}"
        loading="lazy"
        class="img-cover"
        alt="${alt}"
      />
    </figure>
    <div class="card-content">
      <button
        class="icon-btn small"
        aria-label="Add to favorite"
        data-ripple
        data-toggle-btn
      >
        <span class="material-symbols-outlined" aria-hidden="true"
          >favorite</span
        >
        <div class="state-layer"></div>
      </button>
    </div>
    <a href="${root}/${dirName}/pages/photos/photo_detail.html?id=${id}" class="state-layer"></a>
  `;
  const /** {NodeElement} */ $cardBanner = $card.querySelector("img");
  $cardBanner.style.opacity = 0;
  $cardBanner.addEventListener("load", function () {
    this.animate(
      {
        opacity: 1,
      },
      { duration: 400, fill: "forwards" }
    );
  });
  const /** {NodeList} */ $rippleElems = [
      $card,
      $card.querySelector("[data-ripple]"),
    ];
  $rippleElems.forEach(($rippleElems) => ripple($rippleElems));
  return $card;
};
