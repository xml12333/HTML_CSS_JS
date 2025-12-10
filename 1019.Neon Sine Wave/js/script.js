(() => {
  const canvas = document.getElementById('canvas');
  const gl = canvas.getContext('webgl', { antialias:true });
  const logEl = document.getElementById('log');
  if(!gl){ logEl.style.display='block'; logEl.textContent='WebGL not supported'; return; }

  // Vertex shader
  const vsSrc = `attribute vec2 a_position; void main(){gl_Position=vec4(a_position,0.0,1.0);}`;
  
  // Fragment shader implementing the GLSL code
  const fsSrc = `
  precision highp float;
  uniform vec2 r;
  uniform float t;
  void main(){
	vec2 FC = gl_FragCoord.xy;
	vec2 p = (FC*2.0 - r)/r.y;
	vec3 c = vec3(0.0);

	for(float i=-15.0;i<15.0;i++){
	  float x = i*0.12;
	  float a = x*5.0 - t*2.0;
	  float y = sin(a)*0.1;
	  vec2 q = p - vec2(x,0.0);
	  float h = max(abs(q.y) - abs(y), abs(q.x) - 0.01);
	  c += vec3(0.0,0.8,1.0)*0.003/h;
	  c += vec3(0.8,0.0,0.5)*0.006/length(p - vec2(x,y));
	}

	gl_FragColor = vec4(c,1.0);
  }`;

  function compileShader(src, type){
	const s = gl.createShader(type);
	gl.shaderSource(s, src);
	gl.compileShader(s);
	if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
	  throw new Error((type===gl.VERTEX_SHADER?'Vertex':'Fragment')+' shader compile error:\\n'+gl.getShaderInfoLog(s));
	}
	return s;
  }

  function linkProgram(vs,fs){
	const p = gl.createProgram();
	gl.attachShader(p,vs);
	gl.attachShader(p,fs);
	gl.bindAttribLocation(p,0,'a_position');
	gl.linkProgram(p);
	if(!gl.getProgramParameter(p, gl.LINK_STATUS)){
	  throw new Error('Program link error:\\n'+gl.getProgramInfoLog(p));
	}
	return p;
  }

  let program;
  try{
	const vs=compileShader(vsSrc, gl.VERTEX_SHADER);
	const fs=compileShader(fsSrc, gl.FRAGMENT_SHADER);
	program=linkProgram(vs,fs);
  }catch(e){
	logEl.style.display='block';
	logEl.textContent=e.message;
	console.error(e);
	return;
  }

  gl.useProgram(program);

  // Fullscreen triangle
  const buf=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const posLoc=gl.getAttribLocation(program,'a_position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc,2,gl.FLOAT,false,0,0);

  const uRes = gl.getUniformLocation(program,'r');
  const uTime = gl.getUniformLocation(program,'t');

  let startTime = performance.now();
  let running = true;
  let useDPR = true;

  function resizeCanvas(){
	const dpr = useDPR ? window.devicePixelRatio||1 : 1;
	const w = Math.floor(window.innerWidth*dpr);
	const h = Math.floor(window.innerHeight*dpr);
	if(canvas.width!==w || canvas.height!==h){
	  canvas.width=w;
	  canvas.height=h;
	  canvas.style.width=window.innerWidth+'px';
	  canvas.style.height=window.innerHeight+'px';
	  gl.viewport(0,0,w,h);
	}
  }
  window.addEventListener('resize',resizeCanvas);
  resizeCanvas();

  function render(){
	if(!running) return;
	resizeCanvas();
	const t = (performance.now() - startTime)*0.001;
	gl.uniform2f(uRes,canvas.width,canvas.height);
	gl.uniform1f(uTime,t);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES,0,3);
	requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // UI
  document.getElementById('play').onclick=()=>{
	running=!running;
	const btn = document.getElementById('play');
	if(running){
	  startTime = performance.now() - (parseFloat(btn.dataset.t||'0')||0)*1000;
	  btn.textContent='Pause';
	  requestAnimationFrame(render);
	}else{
	  btn.dataset.t = ((performance.now() - startTime)*0.001).toString();
	  btn.textContent='Play';
	}
  };

  document.getElementById('screenshot').onclick=()=>{
	const a = document.createElement('a');
	a.href = canvas.toDataURL('image/png');
	a.download='screenshot.png';
	a.click();
  };

  document.getElementById('toggle-dpr').onclick=()=>{
	useDPR = !useDPR;
	resizeCanvas();
	const t = (performance.now() - startTime)*0.001;
	gl.uniform2f(uRes,canvas.width,canvas.height);
	gl.uniform1f(uTime,t);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES,0,3);
  };
})();