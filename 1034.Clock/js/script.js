import React, { useState, useEffect, useRef } from "https://esm.sh/react@19";
import { createRoot } from "https://esm.sh/react-dom@19/client";

const H = { h: 0, m: 180 },
V = { h: 270, m: 90 },
TL = { h: 180, m: 270 },
TR = { h: 0, m: 270 },
BL = { h: 180, m: 90 },
BR = { h: 0, m: 90 },
E = { h: 135, m: 135 };

const digits = [
[
BR, H, H, BL,
V, BR, BL, V,
V, V, V, V,
V, V, V, V,
V, TR, TL, V,
TR, H, H, TL],

[
BR, H, BL, E,
TR, BL, V, E,
E, V, V, E,
E, V, V, E,
BR, TL, TR, BL,
TR, H, H, TL],

[
BR, H, H, BL,
TR, H, BL, V,
BR, H, TL, V,
V, BR, H, TL,
V, TR, H, BL,
TR, H, H, TL],

[
BR, H, H, BL,
TR, H, BL, V,
E, BR, TL, V,
E, TR, BL, V,
BR, H, TL, V,
TR, H, H, TL],

[
BR, BL, BR, BL,
V, V, V, V,
V, TR, TL, V,
TR, H, BL, V,
E, E, V, V,
E, E, TR, TL],

[
BR, H, H, BL,
V, BR, H, TL,
V, TR, H, BL,
TR, H, BL, V,
BR, H, TL, V,
TR, H, H, TL],

[
BR, H, H, BL,
V, BR, H, TL,
V, TR, H, BL,
V, BR, BL, V,
V, TR, TL, V,
TR, H, H, TL],

[
BR, H, H, BL,
TR, H, BL, V,
E, E, V, V,
E, E, V, V,
E, E, V, V,
E, E, TR, TL],

[
BR, H, H, BL,
V, BR, BL, V,
V, TR, TL, V,
V, BR, BL, V,
V, TR, TL, V,
TR, H, H, TL],

[
BR, H, H, BL,
V, BR, BL, V,
V, TR, TL, V,
TR, H, BL, V,
BR, H, TL, V,
TR, H, H, TL]];



const normalizeAngle = (next, prev) => {
  const delta = ((next - prev) % 360 + 360) % 360;
  return prev + delta;
};

const getTimeDigits = () => {
  const now = new Date();
  return [
  now.getHours(),
  now.getMinutes(),
  now.getSeconds()].
  flatMap(val => String(val).padStart(2, "0").split("").map(Number));
};

const randomAngle = () => Math.floor(Math.random() * 360);

const Clock = ({ h, m, initial }) => {
  const prev = useRef({ h: 0, m: 0 });
  const hourAngle = normalizeAngle(h, prev.current.h);
  const minuteAngle = normalizeAngle(m, prev.current.m);
  prev.current = { h: hourAngle, m: minuteAngle };

  return /*#__PURE__*/(
    React.createElement("div", {
      className: "clock",
      style: {
        "--hour-angle": initial ? randomAngle() : hourAngle,
        "--minute-angle": initial ? randomAngle() : minuteAngle,
        "--dur": initial ? 1 : 0.4 } }));



};

const App = () => {
  const [time, setTime] = useState(Array(6).fill(0));
  const [initial, setInitial] = useState(true);

  useEffect(() => {
    let updateTimerId;
    const updateTime = () => {
      setTime(getTimeDigits());
      const now = Date.now();
      const delay = 1000 - now % 1000;
      updateTimerId = setTimeout(updateTime, delay);
    };

    const initialTimerId = setTimeout(() => {
      setInitial(false);
      updateTime();
    }, 600);

    return () => {
      clearTimeout(updateTimerId);
      clearTimeout(initialTimerId);
    };
  }, []);

  return /*#__PURE__*/(
    React.createElement("div", { className: "app" },
    time.map((t, i) => /*#__PURE__*/
    React.createElement("div", { key: i },
    digits[t].map(({ h, m }, j) => /*#__PURE__*/React.createElement(Clock, { key: j, h: h, m: m, initial: initial }))))));




};

createRoot(document.getElementById('root')).render( /*#__PURE__*/React.createElement(App, null));