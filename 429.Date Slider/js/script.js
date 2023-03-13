gsap.config({trialWarn: false});
let select = s => document.querySelector(s),
  selectAll = s =>  document.querySelectorAll(s),
		mainSVG = select('#mainSVG'),
		numDays = 10,
		char = select('.char'),
		allDays = [],
		allDecades = [],
		allCenturies = [],
		allMilleniums = [],
		startPosX = 460,
		startPosY = 500,
		spacerX = 110,
		spacerY = 140,
		slide = CustomEase.create("custom", "M0,0 C0.2,0 0.546,0.033 0.638,0.472 0.734,0.934 0.806,1 1,1 ");


const build = () => {
	gsap.set('svg', {
		visibility: 'visible'
	})
	gsap.set('#maskGrid', {
		rotation: 30,
		transformOrigin: '50% 50%'
	})
	gsap.to('#maskGrid', {
		duration: 0.5,
		y: -6,
		repeat: -1,
		ease: 'linear'
	}, 0)
	gsap.to('#turbulence', {
	duration: 1,
	attr: {
		seed: '+=100'
	},
	repeat: -1,
	//repeatDelay: 0.1,
	ease: 'rough({strength: 1, points: 10, clamp: false, template:linear , taper: none, randomize: true})'
	//ease: 'linear'
}, 0)

	for(let i = 0; i < numDays; i++) {
		//day
		let day = char.cloneNode(true);
		select('#dayContainer').appendChild(day);
		allDays.push(day);
		let posY = startPosY + (i * spacerY) ;		
		day.innerHTML = (numDays - 1) - i;
		gsap.set(day, {
			x: startPosX,
			y: posY
		})
		
		//decade 
		let decade = char.cloneNode(true);
		select('#decadeContainer').appendChild(decade);
		allDecades.push(decade);
		 posY = startPosY + (i * spacerY) ;		
		decade.innerHTML = (numDays - 1) - i;
		gsap.set(decade, {
			x: startPosX - (spacerX),
			y: posY
		})		
		//century
		let century = char.cloneNode(true);
		select('#centuryContainer').appendChild(century);
		allCenturies.push(century);
		 posY = startPosY + (i * spacerY) ;		
		century.innerHTML = (numDays - 1) - i;
		gsap.set(century, {
			x: startPosX - (spacerX * 2),
			y: posY
		})
		
		//millenium
		let millenium = char.cloneNode(true);
		select('#milleniumContainer').appendChild(millenium);
		allMilleniums.push(millenium);
		 posY = startPosY + (i * spacerY) ;		
		millenium.innerHTML = (numDays - 1) - i;
		gsap.set(millenium, {
			x: startPosX - (spacerX * 3),
			y: posY
		})	
		
	}
	
}
build();


let dayTl = gsap.timeline();
dayTl.to(allDays, {
	duration: numDays,
	y: `+=${spacerY * numDays}`,
	repeat: -1,
  modifiers: {
    y: gsap.utils.unitize(y => parseInt(y) % (spacerY * numDays))		
  },		
	ease: 'linear'
})


let decadeTl = gsap.timeline();
decadeTl.to(allDecades, {
	duration: numDays,
	y: `+=${spacerY * numDays}`,
	repeat: -1,
  modifiers: {
    y: gsap.utils.unitize(y => parseInt(y) % (spacerY * numDays))		
  },			
	ease: 'linear'
})


let centuryTl = gsap.timeline();
centuryTl.to(allCenturies, {
	duration: numDays,
	y: `+=${spacerY * numDays}`,
	repeat: -1,
  modifiers: {
    y: gsap.utils.unitize(y => parseInt(y) % (spacerY * numDays))		
  },		
	ease: 'linear'
})

let milleniumTl = gsap.timeline();
milleniumTl.to(allMilleniums, {
	duration: numDays,
	y: `+=${spacerY * numDays}`,
	repeat: -1,
  modifiers: {
    y: gsap.utils.unitize(y => parseInt(y) % (spacerY * numDays))		
  },		
	ease: 'linear'
})

const setDate = (obj) => {
	let fromDate = obj.from.toString().split('');
	let toDate = obj.to.toString().split('');
	dayTl.pause(10+ parseInt(fromDate[3]));
	decadeTl.pause(10+ parseInt(fromDate[2]));
	centuryTl.pause(10+ parseInt(fromDate[1]));
	milleniumTl.pause(10+ parseInt(fromDate[0]));
	
	dayTl.tweenTo( 50 + parseInt(toDate[3]), {delay: obj.delay, duration: obj.duration, ease: slide})
	decadeTl.tweenTo( 40 + parseInt(toDate[2]), {delay: obj.delay, duration: obj.duration + 0.3,  ease: slide});
	centuryTl.tweenTo( 30 + parseInt(toDate[1]), {delay: obj.delay, duration: obj.duration + 0.7, ease: slide})
	milleniumTl.tweenTo( 20 + parseInt(toDate[0]), {delay: obj.delay, duration: obj.duration + 0.9,  ease: slide})	
		
}
const reset = (num) => {
	let date = num.toString().split('');
	dayTl.pause(parseInt(date[3]));
	decadeTl.pause(parseInt(date[2]));
	centuryTl.pause(parseInt(date[1]));
	milleniumTl.pause(parseInt(date[0]));
	gsap.from('#counter', {
		opacity: 0
	})

}
//edit this!
mainSVG.onclick = (e) => {
	reset(1985);
	setDate({from: 1985, to: 2023, delay: 3, duration: 3});
}
reset(1901)
setDate({from: 1901, to: 2023, delay: 3, duration: 3});

