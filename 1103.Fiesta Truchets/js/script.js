function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;} // Mouse Class for movments and attaching to dom //
class Mouse {
  constructor(element) {_defineProperty(this, "reset",



















    () => {
      this.x =
      ~~(document.documentElement.clientWidth, window.innerWidth || 0) / 2;
      this.y =
      ~~(document.documentElement.clientHeight, window.innerHeight || 0) / 2;
    });this.element = element || window;this.drag = false;this.x = ~~(document.documentElement.clientWidth, window.innerWidth || 0) / 2;this.y = ~~(document.documentElement.clientHeight, window.innerHeight || 0) / 2;this.getCoordinates = this.getCoordinates.bind(this);this.events = ["mouseenter", "mousemove"];this.events.forEach(eventName => {this.element.addEventListener(eventName, this.getCoordinates);});this.element.addEventListener("mousedown", () => {this.drag = true;});this.element.addEventListener("mouseup", () => {this.drag = false;});window.addEventListener("resize", this.reset);}
  getCoordinates(event) {
    event.preventDefault();
    if (this.drag) {
      this.x = event.pageX;
      this.y = event.pageY;
    }
  }}


// WEBGL BOOTSTRAP TWGL.js
const glcanvas = document.getElementById("canvas");
const gl = glcanvas.getContext("webgl2");

// Shader code in HTML window - Fragment Shader //
const programInfo = twgl.createProgramInfo(gl, [
"vertexShader",
"fragmentShader"]);


const arrays = {
  position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0] };


const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
const mouse = new Mouse(glcanvas);
let umouse = [gl.canvas.width / 2, gl.canvas.height / 2, 0, 0];
let tmouse = umouse;

// RENDER LOOP
const render = time => {
  twgl.resizeCanvasToDisplaySize(gl.canvas, 1.0);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  let uniforms;
  const factor = 0.15;
  umouse = [mouse.x, mouse.y, 0];
  tmouse[0] = tmouse[0] - (tmouse[0] - umouse[0]) * factor;
  tmouse[1] = tmouse[1] - (tmouse[1] - umouse[1]) * factor;
  tmouse[2] = mouse.drag ? 1 : -1;

  uniforms = {
    u_time: time * 0.001,
    u_mouse: tmouse,
    u_resolution: [gl.canvas.width, gl.canvas.height] };


  gl.useProgram(programInfo.program);
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
  twgl.setUniforms(programInfo, uniforms);
  twgl.drawBufferInfo(gl, bufferInfo);

  requestAnimationFrame(render);
};

// DOM READY
window.addEventListener("DOMContentLoaded", event => {
  requestAnimationFrame(render);
});