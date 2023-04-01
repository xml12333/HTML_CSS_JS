let value = {
    x: 0
  };
  const input = document.querySelector('input[type=range]');
  const radios = document.querySelectorAll('container input');
  
  const p = document.querySelector('p');
  input.addEventListener('change', onChange);
  
  const popAudio = new Audio('https://assets.codepen.io/127738/pop.wav');
  
  let force = 0;
  let first = true;
  function onChange () {
    if (first) {
      first = false;
      gsap.to(p, {
        opacity: 0,
        ease: 'power2.out'
      });
    }
    force = parseInt(input.value);
    value.x = force;
    gsap.to(value, {
      x: 0,
      duration: (value.x / 100) + 0.1,
      ease: 'elastic.out(1, 0.5)',
      onUpdate: () => {
        input.value = Math.abs(value.x);
      }
    });
    
    radios.forEach(radio => {
      gsap.killTweensOf(radio);
      let angle = Math.random() * Math.PI;
      let r = (force / 100 + 0.05 + Math.random() * 0.4) * innerHeight * 0.5;
      let x = Math.cos(angle) * r;
      let y = Math.sin(angle) * -r;
      let rotation = (force * Math.random() * 0.8 + 0.2) * 2;
      if (Math.random() > 0.5) {
        rotation *= -1;
      }
      
      popAudio.play();
      
      
      gsap.timeline()
      .set(radio, {
        opacity: 0,
        x: 0,
        y: 0,
        rotation: 0
      })
      .to(radio, {
        opacity: 1,
        duration: 0.1
      }, 0.1)
      .to(radio, {
        x: x,
        y: y,
        rotation: rotation,
        duration: () => Math.random() + 0.3,
        ease: 'power2.out'
      }, 0.1)
      .to(radio, {
        opacity: 0,
        duration: 0.2
      }, '+=1')
    });
  }
  