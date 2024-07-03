import { Pane } from "https://cdn.skypack.dev/tweakpane";

// https://tweakpane.github.io/docs/quick-tour/
const pane = new Pane({ title: "Config", expanded: false });

const config = {
  count: 4
};

const prop = (name, value) => {
  document.documentElement.style.setProperty(`--${name}`, value);
};

pane
  .addBinding(config, "count", { min: 1, max: 4, step: 1 })
  .on("change", ({ value }) => prop("count", value));

// apply values from config
Object.keys(config).forEach((section) => {
  Object.keys(config[section]).forEach((key) => {
    const value = config[section][key];
    config[section][key] = undefined;
    pane.refresh();
    config[section][key] = value;
  });
});

pane.refresh();