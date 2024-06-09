document.addEventListener("DOMContentLoaded", function () {
  var cards = document.querySelectorAll("a.card");
  var background = document.querySelector(".background");

  // Store the index of the last hovered card
  var lastHoveredCardIndex = localStorage.getItem("lastHoveredCardIndex") || 0;

  // Set the background to the last hovered card by default
  var cardRect = cards[lastHoveredCardIndex].getBoundingClientRect();
  var x = cardRect.left + window.scrollX + cardRect.width / 2;
  var y = cardRect.top + window.scrollY + cardRect.height / 2;

  background.style.width = cardRect.width + "px";
  background.style.height = cardRect.height + "px";
  background.style.transform = `translate(${x - cardRect.width / 2}px, ${
    y - cardRect.height / 2
  }px)`;
  background.style.opacity = "0"; // Set opacity to 0 when the page loads

  cards.forEach(function (card, index) {
    card.addEventListener("mouseenter", function (e) {
      // If the card is zoomed in, return early to prevent the hover effect
      if (card.classList.contains("zoomed")) {
        return;
      }

      var rect = card.getBoundingClientRect();
      x = rect.left + window.scrollX + rect.width / 2;
      y = rect.top + window.scrollY + rect.height / 2;

      background.style.width = rect.width + "px";
      background.style.height = rect.height + "px";
      background.style.transform = `translate(${x - rect.width / 2}px, ${
        y - rect.height / 2
      }px)`;
      background.style.opacity = "1"; // Change opacity to 1 when a card is hovered over
      background.style.top = "0%";
      background.style.left = "0%";
      background.style.transformOrigin = "center";
      // Store the index of the hovered card
      localStorage.setItem("lastHoveredCardIndex", index);
    });

    card.addEventListener("mouseleave", function (e) {
      background.style.opacity = "0"; // Change opacity back to 0 when the mouse leaves a card
      // Reset the background size when the mouse leaves the card
      background.style.width = "0px";
      background.style.height = "0px";
    });

    card.addEventListener("click", function () {
      if (card.classList.contains("zoomed")) {
        card.classList.remove("zoomed");
        card.style.transform = "none";
        card.style.position = "relative";
        card.style.width = "unset";
        card.style.height = "unset";
        card.style.top = "0";
        card.style.left = "0";
        card.style.zIndex = "0";

        // Remove the 'overflow' class from the body when a card is unzoomed
        document.body.classList.remove("overflow");

        // Remove the 'opacity-0' class from other <a> tags when a card is unzoomed
        cards.forEach(function (otherCard) {
          if (otherCard !== card) {
            otherCard.classList.remove("opacity-0");
          }
        });
      } else {
        card.classList.add("zoomed");
        card.style.position = "fixed";
        card.style.top = "50%";
        card.style.left = "50%";
        requestAnimationFrame(function () {
          card.style.transform = "translate(-50%, -50%)";
        });
        card.style.width = "90vw";
        card.style.height = "90vh";
        card.style.zIndex = "1000";

        // Add the 'overflow' class to the body when a card is zoomed
        document.body.classList.add("overflow");

        // Add the 'opacity-0' class to other <a> tags when a card is zoomed
        cards.forEach(function (otherCard) {
          if (otherCard !== card) {
            otherCard.classList.add("opacity-0");
          }
        });
      }
    });
  });
});