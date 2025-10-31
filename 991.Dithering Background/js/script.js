console.clear();

const PARAMS = {
  c1: "#99d4d8",
  co1: 20,
  c2: "#2889ac",
  co2: 40,
  c3: "#48678f",
  co3: 60,
  c4: "#8478ac",
  co4: 80,
  c5: "#fd98b3",
  feDisplacementMap_scale: 1.4,
  // feTurbulence_baseFrequency: 4.5,
  // ang1: 12.5,
  // ang2: 25,
  // size: 10,
  diffscale: ["feDisplacementMap_scale", "feTurbulence_baseFrequency"]
};

const minmax = { min: 0, max: 90, step: 0.1 };
const minmax50 = { min: 0, max: 15, step: 0.01 };

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
      setSVGProp(`${property}`, val.value);
    });
  } else {
    // run the property through the onChange and hook up with custom function
    f1.addInput(PARAMS, `${property}`, minmax).on("change", (val) => {
      setCustomProp(`${property}`, val.value);
    });
  }
}

function setSVGProp(prop, val) {
  // Split the property string into element name and attribute
  const [element, attribute] = prop.split("_");

  // Convert attribute to camelCase for proper SVG naming (if needed)
  // const attributeName = attribute
  //   .toLowerCase()
  //   .replace(/(?:^|_)([a-z])/g, (_, letter) => letter.toUpperCase());

  // Find the element
  const filterElement = document.querySelector(element);

  if (filterElement) {
    console.log(filterElement, attribute)
    filterElement.setAttribute(attribute.toLowerCase(), val);
  }
}
// function setSVGProp (prop, val) {
//   // console.log(prop, val);
//   let SVGprop = document.getElementsByTagName(prop);
//   // console.log(SVGprop[0]);
//   SVGprop[0].setAttribute('scale', val);
// }

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