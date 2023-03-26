
let select = s => document.querySelector(s),
  selectAll = s =>  document.querySelectorAll(s),
		mainSVG = select('#mainSVG'),
		colorArray = ['#4390d1', '#ec93d1', '#f4e073', '#47b081', '#877788', '#e4cc98'],
		allRibbons = gsap.utils.toArray('#ribbon path'),
		ribbonEase = CustomEase.create("custom", "M0,0 C0.2,0 0.327,0.248 0.46,0.454 0.605,0.68 0.704,1 1,1 "),
		ribbonEaseIn = CustomEase.create("custom", "M0,0 C0.2,0 0.236,0.164 1,1 ");

gsap.set('svg', {
	visibility: 'visible'
})
gsap.set(allRibbons, {
	stroke: gsap.utils.wrap(colorArray)
})
let tl = gsap.timeline({repeat: -1});
tl.fromTo(allRibbons, {
	drawSVG: gsap.utils.wrap(['100% 84%','100% 84%','100% 83.8%',  '100% 85%',  '100% 84%', '100% 85%'])
}, {
	duration: 2,
	//drawSVG: gsap.utils.wrap(['10% 46%', '10% 46%', '10% 46.2%', '10% 45%', '10% 46%', '10% 45%']),
	drawSVG: gsap.utils.wrap(['0% 16%', '0% 16%', '0% 16.2%', '0% 15%', '0% 16%', '0% 15%']),
	stagger: {
		each: 0.12,
},
		ease: ribbonEase
})

 .to('#ribbon', {
	duration: tl.recent().duration(),
	x: 276,
	ease: 'linear'
}, 0) 

gsap.config({trialWarn: false});