const grid = document.querySelector('.grid');
const gridBackgrounds = grid === null || grid === void 0 ? void 0 : grid.querySelectorAll('.grid__background');
const gridCentralCell = grid === null || grid === void 0 ? void 0 : grid.querySelector('.grid__cell--central');
const audio = document.querySelector('audio');

// ['horizontal', 'vertical']
const gridPositions = [
['1fr 4vw 1fr', '2fr 7.11vw 3fr'],
['5fr 4vw 2fr', '1fr 7.11vw 1fr'],
['1fr 4vw 3fr', '4fr 7.11vw 2fr']];

const visibleClass = 'visible';
const spacingVerticalCSSVar = '--spacing-vertical';
const spacingHorizontalCSSVar = '--spacing-horizontal';

const defaultRootStyles = window.getComputedStyle(document.documentElement);
const defaultSpacingVertical = defaultRootStyles.getPropertyValue(spacingVerticalCSSVar);
const defaultSpacingHorizontal = defaultRootStyles.getPropertyValue(spacingHorizontalCSSVar);

let currentStep = 1;
let totalSteps = gridPositions.length;

function animateZoom() {
  const isFinalStep = currentStep === totalSteps;
  const rootStyles = document.documentElement.style;

  // Zoom-in vertical
  setTimeout(() => {
    // Play audio
    audio === null || audio === void 0 ? void 0 : audio.play();

    rootStyles.setProperty(spacingVerticalCSSVar, gridPositions[currentStep - 1][0]);
  }, 1000);

  // Zoom-in horizontal
  setTimeout(() => {
    rootStyles.setProperty(spacingHorizontalCSSVar, gridPositions[currentStep - 1][1]);
  }, 3000);

  // Zoom-out
  setTimeout(() => {
    // Show new step background within grid cell
    gridCentralCell.children[currentStep - 1].classList.add(visibleClass);

    // Reset grid spacing
    rootStyles.setProperty(spacingVerticalCSSVar, defaultSpacingVertical);
    rootStyles.setProperty(spacingHorizontalCSSVar, defaultSpacingHorizontal);
  }, 4500);

  // Next step
  setTimeout(() => {
    // Increment step
    currentStep++;

    // Remove previous step cell background
    gridCentralCell.children[currentStep - 2].classList.remove(visibleClass);

    // Swap previous step grid background with new step grid background
    gridBackgrounds[currentStep - 2].classList.remove(visibleClass);
    gridBackgrounds[currentStep - 1].classList.add(visibleClass);

    if (!isFinalStep) {
      animateZoom();
    }
  }, 5500);
}

function duplicateBackgrounds() {
  gridBackgrounds.forEach((background, i) => {
    // Duplicate grid backgrounds (excluding first background)
    if (i > 0) {
      // Append to central cell for zoom/scale effect
      gridCentralCell.appendChild(background.cloneNode());
    }
  });
}

duplicateBackgrounds();
animateZoom();