console.clear();

const PARAMS = {
  movex: 100,
  movey: 100,
  speedx: 0.16,
  speedy: 0.48,
  opacity: 0.3,
  bgcolor: "#aaaaaa",
  bgcolor2: "#444444",
  diffscale: [
    "speedx",
    "speedy",
    "opacity",
    "trackroundness",
    "thumbradius"
  ]
};

const minmax = { min: 0, max: 200, step: 1 };
const minmax50 = { min: 0, max: 2, step: 0.01 };

const pane = new Tweakpane.Pane();

const f1 = pane.addFolder({
  title: 'Controls',
});
// loop through all PARAMS and add onChange handler
for (const [property, value] of Object.entries(PARAMS)) {
  // console.log("xxx", `${property}::: ${PARAMS[property]}`);
  if (isInArray(property, PARAMS.diffscale)) {
    // console.log("diffscale");
    f1.addInput(PARAMS, `${property}`, minmax50).on("change", (val) => {
      setCustomProp(`${property}`, val.value);
    });
  } else {
    // run the property through the onChange and hook up with custom function
    f1.addInput(PARAMS, `${property}`, minmax).on("change", (val) => {
      setCustomProp(`${property}`, val.value);
    });
  }
}

function setCustomProp(prop, val, unit = "") {
  var elem = document.querySelector('input[type="range"]');
  // if(typeof val == 'number') { unit = 'px' }
  document.documentElement.style.setProperty("--" + prop, val + unit);
}

//FUNCTIONS
function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

// Fullscreen - idea from here: https://codepen.io/nocni_sovac/pen/bGMmJqR/57c415999e9f8fcd0d3eb635433fc63e?editors=1010