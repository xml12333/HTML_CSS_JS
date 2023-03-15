splitText();

gsap.to('svg', {
  repeat: -1,
  duration: 10,
  rotate: 360,
  ease: "steps(40)" // stop motion happpen
});
gsap.to('h1 span', {
  repeat: -1,
  duration: 1,
  y: 'random(6, -6)',
  rotate: 'random(8, -8)',
  scale: 'random(0.8, 1.1)',
  ease: "steps(2)", // stop motion happpen
  repeatRefresh: true,
  stagger: 0.1
});

var scrollAnim = gsap.timeline({
  scrollTrigger: {
    trigger: "body",
    scrub: 0.6, // process by scrolling
    // markers: true, // for DEBUG
    toggleActions: 'restart none none none'
  }
});
scrollAnim
  .to('.svgbox--1', {
    x: '50vw',
    ease: "steps(30)",
  })
  .to('.svgbox--2', {
    x: '-50vw',
    ease: "steps(20)",
  }, '<')
  .to('h1', {
    y: -30,
    ease: "steps(6)"
  }, '<');

function splitText() {
	var texts = Array.apply(null,document.querySelectorAll('[data-split]'));
  texts.forEach(function(item, index, arr){
  var text = item.innerText;
  var arrSplitText = text.split('');
  arrSplitText.forEach(function(t, i){
    if (arrSplitText[i] === ' ') {
      arrSplitText[i] = "<span>&nbsp;</span>";
    } else {
      arrSplitText[i] = "<span>" + arrSplitText[i] + "</span>";
    }
    item.innerHTML = arrSplitText.join('');
  });
  // for(var i = 0; i < arrSplitText.length; i++) {	
  //   if (arrSplitText[i] === ' ') {
  //     arrSplitText[i] = "<span>&nbsp;</span>";
  //   } else {
  //     arrSplitText[i] = "<span>" + text[i] + "</span>";
  //   }
  //   item.innerHTML = arrSplitText.join('');
  // }
  });
}
