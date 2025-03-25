gsap.config({trialWarn: false});
let select = s => document.querySelector(s),
		toArray = s => gsap.utils.toArray(s),
		mainSVG = select('#mainSVG'),
		allLats = toArray('.lat'),
		startDuration = 2

gsap.set('svg', {
	visibility: 'visible'
})
let mainTl = gsap.timeline({
	defaults: {		
	ease: 'power3.inOut'
	}
});
mainTl.fromTo('#outline', {
	drawSVG: '75% 75%'
},{
	drawSVG: '-25% 75%',
	duration: startDuration
})
.add('lines')
.fromTo('.mid', {
	drawSVG: (c) => c % 2 ? '100% 100%' : '0% 0%'
},{
	drawSVG: (c) => c % 2 ? '100% 50%' : '0% 50%',
	duration: startDuration,
	
}, 'lines')
.from('.outer', {
	duration: startDuration,
	drawSVG: (c) => c % 2 ? '100% 100%' : '0% 0%' 
}, 'lines+=1')
allLats.forEach((i, c) => {
	let tl = gsap.timeline();
	tl.set(i, {
		strokeWidth: 4
	})
		.to(i, {
		morphSVG: {
			shape: '#globeEnd'
		},
		ease: 'none',
		duration: 2,
		repeat: -1
	})
	mainTl.add(tl, (startDuration*2+1) + (c/2.5))
})

//ScrubGSAPTimeline(tl)