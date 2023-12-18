"use strict";

/**
 * Attaches a tooltip behavior to a given DOM element.
 * When the element is hovered over, a tooktip with the specified content is displayed.
 * The tooltip is automatically positioned below the element.
 *
 * @param {HTMLElement} $element  - The DOM element to which the tooltip behavior is addred.
 */
export const Tooltip = function ($element) {
  const /** {HTMLElement} */ $tooltip = document.createElement("span");
  $tooltip.classList.add("tooltip", "text-body-small");
  $element.addEventListener("mouseenter", function () {
    $tooltip.textContent = this.dataset.tooltip;
    const { top, left, height, width } = this.getBoundingClientRect();
    $tooltip.style.top = top + height + 4 + "px";
    $tooltip.style.left = left + width / 2 + "px";
    $tooltip.style.transform = "translate(-50%, 0)";
    document.body.appendChild($tooltip);
  });
  $element.addEventListener("mouseleave", $tooltip.remove.bind($tooltip));
};
