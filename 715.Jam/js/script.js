console.clear();

select = e => document.querySelector(e);
selectAll = e => document.querySelectorAll(e);

const container = select('.container');
const jamTime = 6;
const jamDist = 700;
let master = gsap.timeline({ delay: 1 });

function animateJam() {
    let tl = gsap.timeline({ 
        defaults: {
            duration: jamTime,
            ease: "power4"
        },
        repeat: -1
    });
    tl.from('.a', {
        x: jamDist*1
    })
    .from('.jm', {
        x: -jamDist*1.5
    }, 0)
    .from('.dot', {
        x: -jamDist/1.4
    }, 0)
    .to('.a', {
        x: -jamDist*2,
        ease: "power4.in"
    }, jamTime)
    .to('.jm', {
        x: jamDist*2,
        ease: "power4.in"
    }, jamTime)
    .to('.dot', {
        x: jamDist*1.1,
        ease: "power4.in"
    }, jamTime)
    
    return tl;
}

function animateText() {
    let tl = gsap.from('span', {
        x: -100,
        opacity: 0,
        stagger: 0.1,
        duration: 4,
        ease: "power4"
    })
    return tl;
}

function init() {
    resize();
    gsap.set(container, { autoAlpha: 1 });
    master.add(animateJam()).add(animateText(), 0);
    container.onclick = () => {
        console.log('click');
        master.restart();
    }
}

function resize() {
	let vh = window.innerHeight;
	// let sh = container.offsetHeight;
    let sh = 1008;
	let scaleFactor = vh/sh;
	if(scaleFactor<1) {
		gsap.set(container, { scale: scaleFactor });
	}
    else {
        gsap.set(container, { scale: 1 });
    }
}

window.onresize = resize;

window.onload = () => {
	init();
};