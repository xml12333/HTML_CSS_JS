gsap.config({trialWarn: false});
MorphSVGPlugin.convertToPath("#spiral circle, .dot");
let select = s => document.querySelector(s),
  selectAll = s =>  document.querySelectorAll(s),
		mainSVG = select('#mainSVG'),
		container = select('#container'),
		dot = select('.dot'),
		colorArray = ["ef476f","f78c6b","ffd166","c1d375","83d483","06d6a0","0cb0a9","118ab2","375297","5c197b"].reverse()

let allCircles = gsap.utils.toArray('#spiral path').reverse();

gsap.set(container, {
	svgOrigin: '400 300'
})

function blendEases(startEase, endEase, blender) {
    var s = gsap.parseEase(startEase),
        e = gsap.parseEase(endEase),
        blender = gsap.parseEase(blender || "power3.inOut");
    return function(v) {
      var b = blender(v);
      return s(v) * (1 - b) + e(v) * b;
    };
}



let mainTl = gsap.timeline();
const createFish = (obj) => {
	
	let num = obj.num;
	let duration = 1;
	let allDots = [];
	while(--num > -1) {
		let clone = dot.cloneNode(true);
		container.appendChild(clone);
		allDots.push(clone);
		clone.setAttribute('fill', obj.fill);
	}
	gsap.set(allDots, {
		attr: {
			//r: (obj.id + 1) * 3
		},
		transformOrigin: '50% 50%',
		scale:gsap.utils.distribute({
			base: 0,
			amount: 1,
			from: 'end',
			ease:'power2.inOut'
		}),
	opacity:gsap.utils.distribute({
			base: 0,
			amount: 1,
			from: 'end',
			ease:'expo.in'
		})

	})
	let tl = gsap.timeline({
		repeat: -1,
		defaults: {
			duration: duration
		}
	});
	tl
	.to(allDots, {
		duration: 1,//(obj.id + 1) * 0.079,
		motionPath: {
			path: obj.path,
			align: obj.path,
			alignOrigin: [0.5, 0.5],		
			start: (obj.direction) ? obj.start : obj.start + 1,
			end: (obj.direction) ? obj.start + 1 : obj.start 
		},
		stagger: {
			each: 0.003
		},
		ease: blendEases('back.in', 'elastic(1, 0.03)')
	})

	mainTl.add(tl, obj.id * (0.01))

}

const init = () => {

	for(let i = 0; i < allCircles.length; i++) {
		let startPos = i / allCircles.length;
		let obj = {num: 60, fill:`#${colorArray[i]}`, start: 0 , direction: 1, id: i, path: allCircles[i]}
		createFish(obj);
		
		 if(i >= allCircles.length-1) {			
			gsap.to(container, {
				duration:1.1817*2,			
				rotation: -360,
				repeat: -1,
				ease: 'linear'
			})			
		} 
		
	}



}
init();
mainTl.seek(100);
gsap.globalTimeline.timeScale(0.5)