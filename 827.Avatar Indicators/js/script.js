/*

    javascript just for demo the values changing from slider
    not needed in final solution

*/

const appEl = document.querySelector("#app");
let unit = 'px';

const inputs = [
  { id: "size", property: "--status-size" },
  { id: "angle", property: "--status-angle", suffix: "deg" },
  { id: "offset", property: "--status-offset" },
  { id: "gap", property: "--status-gap" }
];

inputs.forEach(({ id, property, suffix }) => {
  const inputEl = document.querySelector(`#${id} input`);
  const labelEl = document.querySelector(`#${id} label`);
  inputEl.addEventListener("input", (e) => {
    const value = e.target.value;
    appEl.style.setProperty(property, value + (suffix ?? unit));
    labelEl.querySelector("em").innerText = value + (suffix ?? unit);
  });
});

const unitEl = document.querySelector("#unit input");
const unitLabel = document.querySelector("#unit label");
unitEl.addEventListener("input", (e) => {
  unit = e.target.checked ? "%" : "px";
  inputs.forEach(({ id }) => {
    const inputEl = document.querySelector(`#${id} input`);
    inputEl.dispatchEvent(new Event("input", { bubbles: true }));
  });
});