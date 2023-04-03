import React, { memo, useState } from 'https://cdn.skypack.dev/react';
import ReactDOM from 'https://cdn.skypack.dev/react-dom';
const ORB_COUNT = 20;
const random = (min, max) => Math.floor(Math.random() * (max - min) + min);
const iterate = (count, mapper) => [...new Array(count)].map((_, i) => mapper(i));
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const Gooey = ({
  id
}) => /*#__PURE__*/React.createElement("filter", {
  id: id
}, /*#__PURE__*/React.createElement("feGaussianBlur", {
  in: "SourceGraphic",
  stdDeviation: "25",
  result: "blur"
}), /*#__PURE__*/React.createElement("feColorMatrix", {
  in: "blur",
  mode: "matrix",
  values: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 100 -5",
  result: "goo"
}), /*#__PURE__*/React.createElement("feComposite", {
  in: "SourceGraphic",
  in2: "goo",
  operator: "atop"
}));
const Blur = ({
  id
}) => /*#__PURE__*/React.createElement("filter", {
  id: id,
  x: "-50%",
  y: "-50%",
  width: "200%",
  height: "200%"
}, /*#__PURE__*/React.createElement("feGaussianBlur", {
  in: "SourceGraphic",
  stdDeviation: "20"
}));
const Gradient = ({
  id,
  hue
}) => {
  const h = hue + random(-40, 40);
  const f = [h, 80, 60];
  const t = [h + 20, 100, 30];
  return /*#__PURE__*/React.createElement("linearGradient", {
    id: id,
    x1: "70%",
    x2: "0%",
    y1: "70%",
    y2: "0%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    "stop-color": `hsl(${t[0]},${t[1]}%,${t[2]}%)`,
    "stop-opacity": "1"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    "stop-color": `hsl(${f[0]},${f[1]}%,${f[2]}%)`,
    "stop-opacity": "1"
  }));
};
const Orb = ({
  hue
}) => {
  const r = random(30, 100);
  const from = [random(0 - r, 1000 + r), random(0 - r, 1000 + r)];
  const to = [random(0 - r, 1000 + r), random(0 - r, 1000 + r)];
  const d = distance(from, to);
  const id = random(0, 1000);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: from[0],
    cy: to[0],
    r: r,
    fill: `url(#grad-${id})`,
    style: {
      '--duration': `${d / 15}s`,
      '--from-x': from[0],
      '--from-y': from[1],
      '--to-x': to[0],
      '--to-y': to[1]
    }
  }), /*#__PURE__*/React.createElement(Gradient, {
    id: `grad-${id}`,
    hue: hue
  }));
};
const Orbs = memo(({
  hue
}) => {
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 1000 1000",
    preserveAspectRatio: "xMinYMin slice",
    style: {
      background: `linear-gradient(hsl(${hue},${80}%,${90}%), hsl(${hue},${100}%,${80}%))`
    }
  }, /*#__PURE__*/React.createElement("g", {
    filter: "url(#blur)"
  }, /*#__PURE__*/React.createElement("g", {
    filter: "url(#gooey)"
  }, iterate(ORB_COUNT, i => /*#__PURE__*/React.createElement(Orb, {
    key: i,
    hue: hue
  })))), /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement(Gooey, {
    id: "gooey"
  }), /*#__PURE__*/React.createElement(Blur, {
    id: "blur"
  })));
});
const App = () => {
  const [hue, setHue] = useState(random(0, 360));
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Orbs, {
    hue: hue
  }), /*#__PURE__*/React.createElement("div", {
    className: "banner"
  }, /*#__PURE__*/React.createElement("h1", null, "Generative Gradient Blobs"), /*#__PURE__*/React.createElement("p", null, "These SVG blobs are randomly generated and animated. Each blob is given a unique gradient (within an initial hue range) and a movement trajectory. To maintain a uniform velocity, the animation duration is calculated based on the length of the trajectory."), /*#__PURE__*/React.createElement("button", {
    style: {
      '--hue': hue
    },
    onClick: () => setHue(random(0, 360))
  }, "Regenerate")));
};
ReactDOM.render( /*#__PURE__*/React.createElement(App, null), document.body);