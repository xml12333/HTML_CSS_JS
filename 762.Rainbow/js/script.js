let canvas = document.querySelector("#canvas"),
    ctx = canvas.getContext("2d"),
    w=1500,
    h=260,
    midX,midY,
    particles = [];

let currentMaxParticles = 0;

const MaxParticles = 600,
    ConnectionDist = 50,
    MaxSpeed = 2.1,
    Msqrt = Math.sqrt,
    Mrandom = Math.random;

let attractPt = [
    // {x:0, y:h*.5, force:260},
    {x:0, y:h*.5, force:255},
    // {x:0, y:h*.5, force:260},
];
let repelPt = [
    // {x:0, y:h*.5, force:3, minDist:110},
    {x:0, y:h*.5, force:6, minDist:85},
    // {x:0, y:h*.5, force:3, minDist:110},
];
let showAttractRepel = false;

const handleResize = () => {
    w = canvas.width = window.innerWidth;
	h = canvas.height = window.innerHeight;

    for(let i=0; i<attractPt.length; i++){
        attractPt[i].x =  repelPt[i].x =  w/2;//(attractPt.length-1)*i;
        attractPt[i].y =  repelPt[i].y =  h/2;
    }

    midX = w / 2;
    midY = h / 2;
    
    if(w < 450){
        currentMaxParticles = Math.round(MaxParticles / 3);
    }
    else if(w >= 450 && w < 700){
        currentMaxParticles = Math.round(MaxParticles / 1.5);
    }
    else{
        currentMaxParticles = MaxParticles;
    }
}
window.onresize = () => handleResize();
handleResize();

const createParticles = () =>  {
    let vRange = 1.5,
        vMin = .5,
        vx, vy;
    for (let i = 0; i < MaxParticles; i++) {
        vx = Mrandom() * vRange + vMin;
        vy = Mrandom() * vRange + vMin;
        if(Mrandom() > .5){ vx *= -1; }
        if(Mrandom() > .5){ vy *= -1; }
        particles.push({
            x: Mrandom() * w,
            y: Mrandom() * h,
            xv: Mrandom() * vx,
            yv: Mrandom() * vy,
        });
    }
}

const update = () => {
    particles.forEach(p => {
        // move
        p.x += p.xv;
        p.y += p.yv;
        
        // keep in bounds
		if (p.x < 0) {
			p.x = 0;
			p.xv *= -1;
		}
		else if (p.x > w) {
			p.x = w;
			p.xv *= -1;
		}
		if (p.y < 0) {
			p.y = 0;
			p.yv *= -1;
		}
		else if (p.y > h) {
			p.y = h;
			p.yv *= -1;
		}

        // Attract
        attractPt.forEach(locus => {
            let dx = locus.x - p.x;
            let dy = locus.y - p.y;
            let distSQ = dx*dx + dy*dy;
            let dist = Msqrt(distSQ);
            force = locus.force / distSQ;
            p.xv += force * dx / dist;
            p.yv += force * dy / dist;
        }); 

        // Repel
        repelPt.forEach(locus => {
            let dx = locus.x - p.x;
            let dy = locus.y - p.y;
            let distSQ = dx*dx + dy*dy;
            let dist = Msqrt(distSQ);
            if (dist < locus.minDist) {
                let tx = locus.x - locus.minDist * dx / dist,
                ty = locus.y - locus.minDist * dy / dist;
                p.xv += (tx - p.x) * locus.force;
                p.yv += (ty - p.y) * locus.force;
            }
        });

        let speed = Msqrt(p.xv*p.xv + p.yv*p.yv);
        if (speed > MaxSpeed) {
            p.xv = MaxSpeed * p.xv / speed;
            p.yv = MaxSpeed * p.yv / speed;
        }

    });
}

const connect = () => {
    let p1, p2;
    for (let i = 0; i < currentMaxParticles-1; i++) {
        p1 = particles[i];
		
		let behind1 = false;
		if ((p1.x < midX && p1.xv > 0) || 
			(p1.x >= midX && p1.xv < 0) ||
			(p1.y < midY && p1.yv > 0) ||
			(p1.y >= midY && p1.yv < 0)) {
			behind1 = true;
		}
		
        p1.hue = getDistance(midX, p1.x, h*.5, p1.y) * 1.5 + 230; // Rainbow arc
        for (let j = i + 1; j < currentMaxParticles; j++) {
            p2 = particles[j];
			
			let behind2 = false;
			if ((p1.x < midX && p1.xv > 0) || 
				(p1.x >= midX && p1.xv < 0) ||
				(p1.y < midY && p1.yv > 0) ||
				(p1.y >= midY && p1.yv < 0)) {
				behind2 = true;
			}
			
            currentDist = getDistance(p2.x, p1.x, p2.y, p1.y);
            if (currentDist < ConnectionDist) {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                // ctx.strokeStyle = 'hsla(' + p1.hue + ', 50%, 50%, ' + (1 - currentDist * 90 / ConnectionDist * .01) + ')';
                ctx.strokeStyle = `hsla(${p1.hue}, ${behind1||behind2? 10 : 90}%, 50%, ${1 - currentDist * 90 / ConnectionDist * .01})`;
                ctx.lineTo(p2.x, p2.y, p1.x, p1.y);
                ctx.stroke();
            }
        }
    }
}

const getDistance = (x1, x2, y1, y2) => {
    let a = x1 - x2,
        b = y1 - y2;
    return Msqrt(a * a + b * b);
}

const animateLines = () => {
    canvas.width = w;
    // ctx.lineWidth = 3;


    update();
    connect();

    
	if(showAttractRepel){
		ctx.fillStyle = 'rgba(255, 50, 120, .1)';
		attractPt.forEach(locus => {
			ctx.beginPath();
			ctx.arc(locus.x, locus.y, locus.force, 0, Math.PI*2);
			ctx.fill();
		});
		ctx.fillStyle = 'rgba(255, 255, 255, .2)';
		repelPt.forEach(locus => {
			ctx.beginPath();
			ctx.arc(locus.x, locus.y, locus.minDist, 0, Math.PI*2);
			ctx.fill();
		});
	}
    

    requestAnimationFrame(animateLines);
}

createParticles();
animateLines();