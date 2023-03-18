gsap.config({trialWarn: false});
console.clear();
let select = s => document.querySelector(s),
		q = gsap.utils.selector(document),
		toArray = s => gsap.utils.toArray(s),
		pizzaSpinDuration = 4,
		mainSVG = select('#mainSVG'),
		pizzaBase = select('#pizzaBase'),
		allIngredients = toArray('.ingredient'),
		allMushrooms = toArray('.mushroom'),
		allSalami = toArray('.salami'),
		allOlive = toArray('.olive'),
		allPeppers = toArray('.pepper')

gsap.set('svg', {
	visibility: 'visible'
})
let pizzaProp = gsap.getProperty('#pizzaBase');

function addToPizza(el) {
	let pizzaRot = pizzaProp('rotation');
	//console.log(pizzaRot)
	gsap.set(el, {
		rotation: 360-pizzaRot,
		svgOrigin: '400 300'
	})
	pizzaBase.appendChild(el);
	
}

function reset () {
	
	allIngredients.forEach((c) => {
		select('#ingredientGroup').appendChild(c);
		gsap.set(c, {
			rotation: 0,
			y: 0
		})
	})
	gsap.set('#egg .eggBits', {
		scale: 0,
		svgOrigin: '400 300'		
		
	}) 	
	gsap.set('#eggShine', {
		opacity: 0	
	}) 	
}
let tl = gsap.timeline({repeat: -1, onRepeat: reset});
tl.to('#pizzaBase', {
	duration: pizzaSpinDuration,
	rotation: -360,
	repeat: 2,
	svgOrigin: '400 300',
	ease: 'none'
})
.to('#egg', {
	duration: pizzaSpinDuration,
	rotation: -360,
	repeat: 2,
	ease: 'none'
}, 0)

.to(allMushrooms, {
	duration: 1.2,
	opacity: 1,
	y: '+=158',
	stagger: {
		each: pizzaSpinDuration/allMushrooms.length,
		//from: 'random',
		onComplete:function(){
      //fade out each target when it completes
      addToPizza(this.targets()[0])
    }
	},
	ease: 'power3.in'
}, 0.47)
.to(allPeppers, {
	opacity: 1,
	y: '+=200',
	stagger: {
		each: pizzaSpinDuration/allPeppers.length,
		//from: 'random',
		onComplete:function(){
      //fade out each target when it completes
      addToPizza(this.targets()[0])
    }
	},
	ease: 'power1.in'
}, 1)
.to(allSalami, {
	opacity: 1,
	//duration: 0.5,
	y: '+=152',
	stagger: {
		each: pizzaSpinDuration/allSalami.length,
		//from: 'random',
		onComplete:function(){
      //fade out each target when it completes
      addToPizza(this.targets()[0])
    }
	},
	ease: 'power3.in'
}, 1.5)
.to(allOlive, {
	opacity: 1,
	//duration: 0.5,
	y: '+=180',
	stagger: {
		each: pizzaSpinDuration/allOlive.length,
		//from: 'random',
		onComplete:function(){
      //fade out each target when it completes
      addToPizza(this.targets()[0])
    }
	},
	ease: 'power3.in'
}, 0.78)

.to('#egg .eggBits', {
	duration: 1,
	scale: 1,
	stagger: {
		amount: 0.2
	},
	//opacity: 1,
	ease: 'elastic(0.6, 0.5)'
}, '-=4')
.to('#eggShine', {
	opacity: 0.6,
}, '-=3.65')
.to('.ingredient, #egg, #eggShine', {
	opacity: 0
}, '-=0.5')
gsap.globalTimeline.timeScale(1.25)
//.call(addToPizza, [mushroom])
reset()
//ScrubGSAPTimeline(tl)