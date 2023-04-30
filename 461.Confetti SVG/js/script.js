function confetti(el, params) {
	if (!el){
		console.error('Must have element to populate the confetti!');
		return;
	}
	const defaultProperties = {
		colors: 'random', 
		delay: 100,
		drop: window.innerHeight,
		fadeout: true,
		flakes: 100,
		speed: 6000,
		spin: true,
		spread: 400,
		type: 'default'
	};
	
	// properties passed in from user onto the defaults
	const c = Object.assign(defaultProperties, params);

	const randInt = (min, max) => {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};
	
	let hh = c.drop;	
	let ww = c.spread;

	let animatedConfetti = ``;
	// make sure number of flakes is a number
	if (!c.flakes || Number.isNaN(c.flakes * 1)) {
		c.flakes = 100;
	}
	for (let i = 0; i < c.flakes; i++) {
		let conId = `con${randInt(0, 1000)}fet${randInt(0, 1000)}ti${randInt(0, 1000)}`;
		let confettiDur = `${randInt(c.speed / 2, c.speed)}`;
		let confettiSpin = ``;
		let confettiType = ``;
		if (c.spin) {
			confettiSpin = `<animateTransform attributeName="transform"
                          attributeType="XML"
                          type="rotate"
                          from="0 0 0"
                          to="${(Math.random() < 0.5 ? -1 : 1) * 360} 0 0"
                          dur="${randInt(c.speed/6, c.speed/2)}ms"
													begin="-${randInt(1, 10) / 10}s"
                          repeatCount="indefinite"/>`;
		}
		// are we using an array of colors or random ones?
		let confettiColor = ``;
		if (c.colors == 'random' || !Array.isArray(c.colors)) {
			confettiColor = `rgb(${randInt(0, 255)}, ${randInt(0, 255)}, ${randInt(0, 255)})`;
		} else {
			confettiColor = c.colors[randInt(0, c.colors.length-1)];
		}
		
		// what type of confetti is it?
		switch (c.type) {
			case 'XO':
			case 'xo':
				if (randInt(0, 1) == 1) {
				// O shape
				confettiType = `<circle id="${conId}" stroke="${confettiColor}" stroke-width="${randInt(1,	3)}" fill="none" cx="0" cy="0" r="${randInt(4, 7)}" filter="url(#blur${randInt(1, 2)})">
		${confettiSpin}
		</circle>`;
			} else {
				// X shape
				confettiType = `<path id="${conId}" fill="${confettiColor}" d="M -5 1 H -1 V 5 A 1 1 0 0 0 1 5 V 1 H 5 A 1 1 0 0 0 5 -1 H 1 V -5 A 1 1 0 0 0 -1 -5 V -1 H -5 A 1 1 0 0 0 -5 1"  filter="url(#blur${randInt(1, 2)})">
		${confettiSpin}
		</path>`;
			}
				break;
			case 'code':
				confettiType = `<text id="${conId}" fill="${confettiColor}" stroke-width="${randInt(1,	3)}" fill="none" x="0" y="0" dominant-baseline="middle" text-anchor="middle" filter="url(#blur${randInt(1, 2)})">${randInt(0,1)}
		${confettiSpin}
		</text>`;
				break;
			case 'circle':
				confettiType = `<circle id="${conId}" fill="${confettiColor}" cx="0" cy="0" r="${randInt(4, 7)}" filter="url(#blur${randInt(1, 2)})">
		${confettiSpin}
		</circle>`;
				break;
			case 'flower':
				confettiType = `<g filter="url(#blur${randInt(1, 2)})" id="${conId}">
				<path fill="${confettiColor}" d="M -2 -2 C -4 -10 4 -10 2 -2 L 2 2 C 4 10 -4 10 -2 2 L -2 -2 M 0 -2.828 C 4.242 -9.9 9.9 -4.242 2.828 0 L 0 2.828 C -4.242 9.9 -9.9 4.242 -2.828 0 L 0 -2.828 M -2.828 0 C -9.9 -4.242 -4.242 -9.9 0 -2.828 L 2.828 0 C 9.9 4.242 4.242 9.9 0 2.828 L -2.828 0 M 2 -2 C 10 -4 10 4 2 2 L -2 2 C -10 4 -10 -4 -2 -2 L 2 -2" filter="drop-shadow(rgba(0, 0, 0, ${randInt(0,10)/10}) 0px 0px ${randInt(0,10)/10}px)" />
			<path fill="rgb(${randInt(0,255)}, ${randInt(0,255)}, ${randInt(0,255)})" d="M 0 -2 C -4 -10 4 -10 0 -2 L 0 2 C 4 10 -4 10 0 2 L 0 0 M 2 -2 C 4.242 -9.9 9.9 -4.242 2 -2 L -2 2 C -4.242 9.9 -9.9 4.242 -2 2 M -2 -2 C -9.9 -4.242 -4.242 -9.9 -2 -2 L 2 2 C 9.9 4.242 4.242 9.9 2 2 L 0 0 M 2 0 C 10 -4 10 4 2 0 L -2 0 C -10 4 -10 -4 -2 0 L 2 0" />
			<circle fill="rgb(${randInt(0,255)}, ${randInt(0,255)}, ${randInt(0,255)})" cx="0" cy="0" r="2.8" stroke="rgb(${randInt(0,255)}, ${randInt(0,255)}, ${randInt(0,255)})" stroke-width="0.4" />
			${confettiSpin}
			</g>`;
				break;
			case 'square':
				let hhww = randInt(4,12);
				confettiType = `<rect id="${conId}" fill="rgb(${randInt(0,255)}, ${randInt(0,255)}, ${randInt(0,255)})" x="0" y="0" height="${hhww}" width="${hhww}" filter="url(#blur${randInt(1, 2)})">
					${confettiSpin}
				</rect>`;
				break;
			case 'music':
				if (randInt(0, 1) == 1) {
					// 1 note
					confettiType = `<path id="${conId}" fill="${confettiColor}" d="M -3.6 9.6 C -4.9 8.6 -4.2 6.8 -2.3 5.7 C -1.4 5.1 -0.9 5.1 0 5.1 C 0.4 5.1 1.2 5.4 1.2 5.4 L 1.2 -10.2 L 1.8 -10.2 L 1.8 -9.4 C 1.8 -9.1 1.8 -9.1 1.8 -9 C 2.1 -7.6 2.5 -7.1 4.1 -5.4 C 6.1 -3.2 6.4 -1.8 6.4 0 C 6.4 1.5 5 5 4.8 5.1 C 5.1 3.8 6 2 6 0 C 6 -1 5.7 -2.1 4.8 -3 C 4.1 -3.8 2 -5 2 -4 L 2 7 C 2 8 2 8 1 9 C -0.3 9.9 -2.5 10.6 -3.6 9.6 Z"  filter="url(#blur${randInt(1, 2)})">
				${confettiSpin}
			</path>`;
				} else {
					confettiType = `<path id="${conId}" fill="${confettiColor}" d="M -12.6 9.6 C -13.9 8.6 -13.2 6.8 -11.3 5.7 C -10.4 5.1 -9.9 5.1 -9 5 C -8 5 -8 5 -8 5 V -10 H 9 V 7 C 9 8 9 8 8 9 C 6.7 9.9 4.5 10.6 3.4 9.6 C 2.1 8.6 2.8 6.8 4.7 5.7 C 5.6 5.1 6.1 5.1 7 5 C 8 5 8 5 8 5 V -8 H -7 V 7 C -7 8 -7 8 -8 9 C -9.3 9.9 -11.5 10.6 -12.6 9.6 Z"  filter="url(#blur${randInt(1, 2)})">
				${confettiSpin}
			</path>`;
				}
				break;
			case 'rect':
			case 'default':
			default:
				confettiType = `<rect id="${conId}" fill="rgb(${randInt(0,255)}, ${randInt(0,255)}, ${randInt(0,255)})" x="0" y="0" height="${randInt(6,18)}" width="${randInt(4,7)}" filter="url(#blur${randInt(1, 2)})">
					${confettiSpin}
				</rect>`;
		}

		// add confetti to group
		animatedConfetti += `<g transform="translate(${randInt(ww * -0.3,	ww * 0.3)} 0) scale(1.${randInt(0, 1)})">
		${confettiType}		
	</g>
	<animateMotion xlink:href="#${conId}" dur="${confettiDur}ms" begin="0s" fill="freeze" repeatCount="none">
		<mpath xlink:href="#motionPath${randInt(1, 2)}" />
	</animateMotion>`;
	}
	
	const elemRect = el.getBoundingClientRect(),
				centerY = elemRect.top + (elemRect.bottom - elemRect.top) / 2,
				centerX  = elemRect.left - (elemRect.left - elemRect.right) / 2;
	let overlayId = `conf${randInt(0,1000)}etti${randInt(0,1000)}ver${randInt(0,1000)}lay`
	let svg = `<svg id="${overlayId}" viewBox="0 0 ${ww} ${hh}" height="1" width="1" preserveAspectRatio="none" style="
	left:${centerX}px; 
	pointer-events:none; 
	position:fixed; 
	top:${centerY}px; 
	transform:translate(-50%,-50%); 
	transition:${c.speed/10}ms; 
	user-select:none; 
	z-index:99999">
	<filter id="blur1" x="-100%" y="-100%" width="300%" height="300%">
		<feGaussianBlur in="SourceGraphic" stdDeviation="0" />
	</filter>
	<filter id="blur2" x="-100%" y="-100%" width="300%" height="300%">
		<feGaussianBlur in="SourceGraphic" stdDeviation="1" />
	</filter>
	<path id="motionPath1" fill="none" stroke="none" d="M ${ww * 0.5} -${hh * 0} Q ${ww * 0.3} ${hh * 0.25} ${ww * 0.5} ${hh * 0.5} Q ${ww * 0.7} ${hh * 0.75} ${ww * 0.5} ${hh * 1.1}" />
	<path id="motionPath2" fill="none" stroke="none" d="M ${ww * 0.5} -${hh * 0} Q ${ww * 0.7} ${hh * 0.25} ${ww * 0.5} ${hh * 0.5} Q ${ww * 0.3} ${hh * 0.75} ${ww * 0.5} ${hh * 1.1}" />
	${animatedConfetti}
</svg>`;

	//Make it a node to avoid the dangerous "document.body.innerHTML = svg"
	let wrapper = document.createElement("div");
	wrapper.innerHTML = svg;
	let doc = wrapper.firstChild;

	document.body.appendChild(doc);
	//make it the height and width
	setTimeout(() => {
		doc.style.height = `${hh}px`;
		doc.style.width = `${ww}px`;
	}, c.delay);
	// are we fading the confetti out?
	if (c.fadeout) {
		setTimeout(() => {
			const element = document.getElementById(overlayId);
			if (element) {
				element.style.opacity = 0;
				element.style.transition = `${c.speed/4}ms`;
			}
		}, c.speed/4);
	}
	setTimeout(() => {
		const element = document.getElementById(overlayId);
		element?.remove();
	}, c.speed);
}

document.querySelector('.default').addEventListener('click', (el) => {
	confetti(el.target, {spread: 300, drop: 300});
});
document.querySelector('.code').addEventListener('click', (el) => {
	confetti(el.target, {type: 'code', spread: 300, flakes: 100, speed: 5000, delay:10, fadeout:true, drop: 300, colors: ['lime','black']});
});
document.querySelector('.flower').addEventListener('click', (el) => {
	confetti(el.target, {type: 'flower', spread: 300, flakes: 100, speed: 5000, delay:10, fadeout:true, drop: 300});
});
document.querySelector('.xo').addEventListener('click', (el) => {
	confetti(el.target, {type: 'XO', spread: 300, flakes: 100, speed: 5000, delay:10, fadeout:true, drop: 300, colors: ['#DADF3C','#A7EC6F','#74B9A2','#4186D5','#0E53F6']});
});
document.querySelector('.overThere').addEventListener('click', (el) => {
	confetti(document.querySelector('.overThere2'), {type: 'circle', spin: false, spread: 300, flakes: 50, speed: 5000, delay:10, fadeout:true, drop: 300, colors: ["#FD827F","#CA4F4C","#971C19"]});
});
document.querySelector('.square').addEventListener('click', (el) => {
	confetti(el.target, {type: 'square', spread: 300, flakes: 100, speed: 5000, delay:10, fadeout:true, drop: 300, colors: ['#DADF3C','#A7EC6F','#74B9A2','#4186D5','#0E53F6']});
});
document.querySelector('.music').addEventListener('click', (el) => {
	confetti(el.target, {type: 'music', spin: false, spread: 300, flakes: 40, speed: 5000, delay:10, fadeout:true, drop: 300, colors: ['#000']});
});