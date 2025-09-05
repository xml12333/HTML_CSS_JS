const image = new Image();
image.src = "https://assets.codepen.io/163598/bayer.gif"; // your image URL
image.crossOrigin = "anonymous";

let viewWidth = window.innerWidth;
let viewHeight = window.innerHeight;

const glcanvas = document.getElementById("canvas");
const gl = glcanvas.getContext("webgl2");

// Resize the canvas to match
glcanvas.width = viewWidth;
glcanvas.height = viewHeight;

// Shader programs
const mainInfo = twgl.createProgramInfo(gl, ["vertexShader", "mainShader"]);
const programInfo = twgl.createProgramInfo(gl, [
"vertexShader",
"fragmentShader"]);


// Fullscreen quad buffers
const arrays = {
  position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
  texcoord: { numComponents: 2, data: [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1] } };

const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
const fbufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

// Image texture
let textures;
image.onload = () => {
  textures = twgl.createTextures(gl, {
    u_texture: {
      src: image,
      min: gl.LINEAR_MIPMAP_LINEAR,
      mag: gl.LINEAR,
      wrap: [gl.CLAMP, gl.CLAMP],
      auto: true } });



  requestAnimationFrame(render);
};

// Ping-pong buffers
const attachments = [
{
  format: gl.RGBA,
  type: gl.UNSIGNED_BYTE,
  min: gl.LINEAR,
  wrap: [gl.REPEAT, gl.REPEAT] }];



let readBuffer = twgl.createFramebufferInfo(
gl,
attachments,
viewWidth,
viewHeight);

let writeBuffer = twgl.createFramebufferInfo(
gl,
attachments,
viewWidth,
viewHeight);


twgl.resizeCanvasToDisplaySize(gl.canvas);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// Track last render time
let then = 0;

window.addEventListener("resize", () => {
  viewWidth = window.innerWidth;
  viewHeight = window.innerHeight;

  glcanvas.width = viewWidth;
  glcanvas.height = viewHeight;

  twgl.resizeFramebufferInfo(
  gl,
  readBuffer,
  attachments,
  viewWidth,
  viewHeight);

  twgl.resizeFramebufferInfo(
  gl,
  writeBuffer,
  attachments,
  viewWidth,
  viewHeight);


  twgl.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
});

function render(time) {
  if (!textures) return; // wait until the image is loaded

  time *= 0.001;
  const deltaTime = time - then;
  then = time;

  // --- PASS 1: render into writeBuffer using readBuffer as last frame ---
  twgl.bindFramebufferInfo(gl, writeBuffer);

  const bufferUniforms = {
    u_time: time,
    u_delta: deltaTime,
    iChannel0: readBuffer.attachments[0],
    u_texture: textures.u_texture,
    u_resolution: [viewWidth, viewHeight] };


  gl.useProgram(programInfo.program);
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
  twgl.setUniforms(programInfo, bufferUniforms);
  twgl.drawBufferInfo(gl, bufferInfo);

  // --- Swap buffers ---
  [readBuffer, writeBuffer] = [writeBuffer, readBuffer];

  // --- PASS 2: draw readBuffer to screen ---
  twgl.bindFramebufferInfo(gl, null);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const mainUniforms = {
    u_time: time,
    iChannel0: readBuffer.attachments[0],
    u_resolution: [viewWidth, viewHeight] };


  gl.useProgram(mainInfo.program);
  twgl.setBuffersAndAttributes(gl, mainInfo, fbufferInfo);
  twgl.setUniforms(mainInfo, mainUniforms);
  twgl.drawBufferInfo(gl, fbufferInfo);

  requestAnimationFrame(render);
}