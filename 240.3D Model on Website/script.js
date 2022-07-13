const stopBtn = document.getElementById("stop");
const runBtn = document.getElementById("run");
const waveBtn = document.getElementById("wave");
const model = document.getElementById("model");
stopBtn.onclick = () => {
  model.animationName = "none";
};
runBtn.onclick = () => {
  model.animationName = "Running";
};
waveBtn.onclick = () => {
  model.animationName = "Wave";
};
