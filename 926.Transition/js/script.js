// Transition
// Ported from flash project - http://wonderfl.net/c/4gvL
//
function Transition(){
	
	var canvas;
	var context;

	var width;
	var height;

	var oX;
	var oY;
	
	var v = 2;
	var obj_max = 60;
	
	var max = 20;
	var amax = 0;
	
	var firstParticle;
	
	var interval;
		
	this.initialize = function(){
		canvas  = document.getElementById("canvas");
		context = canvas.getContext('2d');
			
		width = window.innerWidth
		height = window.innerHeight
		
		oX = width/2;
		oY = height/2;
		
		canvas.width = width;
		canvas.height = height;
		
		createParticles();
				
		canvas.addEventListener('click', MouseDown, false);
		
		//Set interval - Bad! - I know!
		var interval = setInterval(Update, 20);
	}
	
	var createParticles = function(){
		
		var sr = 1;
		var vr = 0.00005;
		
		firstParticle = new Particle();
		var p = firstParticle;
		
		var i;
		for (i = 0; i < max; i++){
			p.ang = i * max;
			p.vang = 1;
			p.r = 10;
			p.vr = 0;
			p.x = oX;
			p.y = oY;
			
			if (i != max - 1){
				p.next = new Particle();
				p = p.next;
			}	
		}
	}
	
	//Point class.
	var Particle = function(){
		this.ang;
		this.vang;
		this.r;
		this.vr;	
		this.x;
		this.y;
		this.next; //Child
	}
	
	var Update = function(){
		
		var count = 0;	
		var p = firstParticle;
		
		while(p){
			count++;
			
			if(p.r > 400){
				
				p = p.next;
				continue;	
			
			}
			
			var ran = Math.random();

			if (ran < 0.1){
				
				p.vang = 0;
				p.vr = v;
			
			} else if (ran < 0.2){
				
				p.vang = -v;
				p.vr = 0;
					
			} else if (ran < 0.3){
				
				p.vang = v;
				p.vr = 0;
				
			} else if (ran < 0.304 && amax < obj_max){
				var newP = new Particle();
				newP.ang = p.ang;
				
				if(p.ang == 0){
					newP.vang = 0;
				} else {
					newP.vang = (Math.random() < 0.5) ? -1 : 1;
				}
				
				newP.r = p.r;
				
				if (p.vang == 0){
					
					newP.vr = 1;
				} else {
					
					newP.vr = 0;
				}
				
				newP.x = p.x;
				newP.y = p.y;
				
				newP.next = p.next;
				p.next = newP;
					
			}
			
			var r = p.ang + p.vang;
			p.r = p.r + p.vr;
	   		
	   		var ang = Math.PI/180 * r;
	   		
	   		var ax = p.r * Math.cos(ang);
	   		//console.log(ax);
	   		var ay = p.r * Math.sin(ang);
	   		
	   		var rr = Math.sqrt(ax * ax + ay * ay);
	   		
	   		var anga = Math.PI/180 * (r - (r - p.ang) / 2);
	   		
	   		var px = rr * Math.cos(anga);
	   		var py = rr * Math.sin(anga);
	   			
	   		//After all this maths, finally draw!
			context.beginPath(); 
			context.strokeStyle = '#000000';
	   		context.moveTo(p.x, p.y);
	   		context.quadraticCurveTo(px + oX, py + oY, ax + oX, ay + oY);
	   		context.stroke();
	   		context.closePath();
			
			p.x = ax + oX;
			p.y = ay + oY;
			p.ang = r;
			
			p = p.next;
		}
		
		amax = count;
	}
	
	//Clear the screen, 
	var MouseDown = function(e) {
		e.preventDefault();
		context.fillStyle = 'rgba(255, 255, 255, 1.0)';
		context.beginPath();
		context.rect(0, 0, width, height);
		context.closePath();
		context.fill();	
		//Restart!
		createParticles();
	}
}

var app = new Transition();
app.initialize();