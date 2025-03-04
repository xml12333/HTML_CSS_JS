let iconState = 0; // Current visible icon index (0, 1, or 2)
let previousState = null; // Previous visible icon index

function updateIcons() {
  const containers = document.querySelectorAll(".icon-container");
  containers.forEach((container) => {
    const icons = container.querySelectorAll(".icon");
    icons.forEach((icon, index) => {
      // Remove all animation and state classes
      icon.classList.remove("showing", "hiding", "hidden");
      if (index === iconState) {
        icon.classList.add("showing"); // Animate to visible
      } else if (index === previousState) {
        icon.classList.add("hiding"); // Animate to hidden
      } else {
        icon.classList.add("hidden"); // Stay hidden
      }
    });
  });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons(); // Assuming Lucide icons are used
  updateIcons(); // Set initial state with animation
});

// Handle button clicks
function handleClick() {
  previousState = iconState; // Store current state
  iconState = (iconState + 1) % 3; // Cycle to next icon
  updateIcons(); // Update animations
}

document
  .querySelector(".contrast-button")
  .addEventListener("click", handleClick);
document.querySelector(".normal-button").addEventListener("click", handleClick);