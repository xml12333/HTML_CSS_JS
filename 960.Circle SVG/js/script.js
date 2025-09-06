"use strict";
const taperedRingPath = ({ cx = 150, cy = 150, r, thickStart, thickEnd, segments = 240, startAngle = -Math.PI / 2, }) => {
    const TAU = Math.PI * 2;
    const outer = [];
    const inner = [];
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const a = startAngle + t * TAU;
        const w = thickStart + (thickEnd - thickStart) * t;
        const ro = r + w / 2;
        const ri = r - w / 2;
        const xo = cx + ro * Math.cos(a);
        const yo = cy + ro * Math.sin(a);
        const xi = cx + ri * Math.cos(a);
        const yi = cy + ri * Math.sin(a);
        outer.push([xo, yo]);
        inner.push([xi, yi]);
    }
    const move = (p) => `M ${p[0].toFixed(3)} ${p[1].toFixed(3)}`;
    const line = (p) => `L ${p[0].toFixed(3)} ${p[1].toFixed(3)}`;
    let d = move(outer[0]);
    for (let i = 1; i < outer.length; i++)
        d += line(outer[i]);
    for (let i = inner.length - 1; i >= 0; i--)
        d += line(inner[i]);
    d += "Z";
    return d;
};
const configs = [];
for (let i = 0; i < 36; i++) {
    configs.push({
        r: 142 - (i * 4),
        thickStart: 3,
        thickEnd: 0,
        segments: 360,
        startAngle: Math.PI * (0.5 + (i * -0.04)),
        fill: "#fff",
    });
}
const TaperedRingMap = () => {
    return (React.createElement("svg", { viewBox: "0 0 300 300", width: 600, height: 600, style: { background: "#000" } }, configs.map((cfg, i) => {
        var _a;
        return (React.createElement("path", { key: i, d: taperedRingPath(cfg), fill: (_a = cfg.fill) !== null && _a !== void 0 ? _a : "#fff" }));
    })));
};
// React 18 render
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(TaperedRingMap, null));