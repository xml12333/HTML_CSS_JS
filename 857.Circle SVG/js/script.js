const { useState, useEffect } = React;

const Burst = ({ gap, radiusDiff, maxRadius, fill }) => /*#__PURE__*/
React.createElement("svg", { "aria-hidden": "true", viewBox: "-2000 -2000 4000 4000", fill: fill },
[...Array(36)].map((_, gIndex) => /*#__PURE__*/
React.createElement("g", { key: gIndex, transform: `rotate(${gIndex * 10})` },
[...Array(9)].map((_, circleIndex) => /*#__PURE__*/
React.createElement("circle", {
  key: circleIndex,
  cx: 2000 - maxRadius - circleIndex * gap,
  r: maxRadius - circleIndex * radiusDiff })))));







const App = () => {
  const [gap, setGap] = useState(160);
  const [maxRadius, setMaxRadius] = useState(60);
  const [radiusDiff, setRadiusDiff] = useState(7);
  const [fill, setFill] = useState('#CCDCFF');
  const [background, setBackground] = useState('#E6EDFF');

  useEffect(() => {
    document.body.style.background = background;
  }, [background]);

  return /*#__PURE__*/(
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("div", { class: "controls" }, /*#__PURE__*/
    React.createElement("label", null, "Document background", /*#__PURE__*/

    React.createElement("input", { type: "color", value: background, onInput: e => setBackground(e.target.value) })), /*#__PURE__*/

    React.createElement("label", null, "Fill", /*#__PURE__*/

    React.createElement("input", { type: "color", value: fill, onChange: e => setFill(e.target.value) })), /*#__PURE__*/

    React.createElement("label", null, "Gap: ",
    gap, /*#__PURE__*/
    React.createElement("input", { type: "range", value: gap, onChange: e => setGap(e.target.value), max: "200" })), /*#__PURE__*/

    React.createElement("label", null, "maxRadius: ",
    maxRadius, /*#__PURE__*/
    React.createElement("input", { type: "range", value: maxRadius, onChange: e => setMaxRadius(e.target.value), max: "100" })), /*#__PURE__*/

    React.createElement("label", null, "radiusDiff: ",
    radiusDiff, /*#__PURE__*/
    React.createElement("input", { type: "range", value: radiusDiff, onChange: e => setRadiusDiff(e.target.value), max: "10" }))), /*#__PURE__*/


    React.createElement(Burst, { gap: gap, radiusDiff: radiusDiff, maxRadius: maxRadius, fill: fill })));


};

ReactDOM.render( /*#__PURE__*/React.createElement(App, null), document.getElementById('app'));