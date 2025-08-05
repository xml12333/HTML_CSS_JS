var eps = document.querySelector('.slider').style;
eps.setProperty("--vol", '50' );


const knob = document.querySelector('.knob');

function calculateDegree(e) {
  const x1 = window.innerWidth / 2;
  const y1 = window.innerHeight / 2;
  const x2 = e.clientX;
  const y2 = e.clientY;
  const deltax = x1 - x2;
  const deltay = y1 - y2;
  const rad = Math.atan2(deltay, deltax);
  let deg = rad * (180 / Math.PI);
  return deg;
}


knob.addEventListener("mousedown", function (e) {

  knob.addEventListener("mousemove", rotate);
  
    function rotate(e) {
	
      const result = Math.floor(calculateDegree(e) - 180);
      knob.style.transform = 'rotate('+result+'deg)';
	  
	  /*
	  let val = Math.floor(calculateDegree(e) + 360);
	  if(val>443 && val<540) val -=443;
	  if(val>179 && val<444) val -=90;
	  console.log(val);
	  */
	  
	  let val = Math.floor(calculateDegree(e) + 90);
	  
	  let ran=0; 
	  
	  if(val>0 && val<181) ran =  val / 180;
	  
	  if(val>180) ran =  Math.abs((val - 360) / 180);
	  
	  if(val<0) ran =  Math.abs(val) / 180;
	  
	  //console.log(result+ ' , ' +val+ ' , ' + ran);
	  
	  let num = Math.floor(ran * 100);
	  if(num<10) num = '0'+num; 
	  if(num==100) num = '99';
	  
	  document.querySelector('.number').innerHTML = num;
	  
	  eps.setProperty("--vol", Math.floor(ran * 100) );
	  sound.volume = ran;
    }

    knob.addEventListener("mouseup", function () {
      knob.removeEventListener("mousemove", rotate);
    });
	
	
});


const mute = document.querySelector('.mute');
const sound = document.querySelector('#sound');
mute.addEventListener("click", function () {
	//sound.play();
	this.classList.toggle('muted');
	return sound.paused ? sound.play() : sound.pause();
});