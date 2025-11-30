const eyesSVG = document.querySelector('#eyes');
const eyes = [
  {
    eye: eyesSVG.querySelector('#eye-left'),
    pupil: eyesSVG.querySelector('#pupil-left'),
    offsetX: 0
  },
  {
    eye: eyesSVG.querySelector('#eye-right'),
    pupil: eyesSVG.querySelector('#pupil-right'),
    offsetX: 0
  }
];

const updateEye = (ev, {eye, pupil, offsetX}) => {
  const eyeRect = eye.getBoundingClientRect();
  const centerX = eyeRect.left + eyeRect.width / 2;
  const centerY = eyeRect.top + eyeRect.height / 2;

  const distX = ev.clientX - centerX;
  const distY = ev.clientY - centerY;

  const pupilRect = pupil.getBoundingClientRect();
  const maxDistX = pupilRect.width / 2;
  const maxDistY = pupilRect.height / 2;

  const angle = Math.atan2(distY, distX);

  const newPupilX = offsetX + Math.min(maxDistX, Math.max(-maxDistX, Math.cos(angle) * maxDistX));
  const newPupilY = Math.min(maxDistY, Math.max(-maxDistY, Math.sin(angle) * maxDistY));
  
  const svgCTM = eyesSVG.getScreenCTM();
  const scaledPupilX = newPupilX / svgCTM.a; 
  const scaledPupilY = newPupilY / svgCTM.d;

  pupil.setAttribute('transform', `translate(${scaledPupilX}, ${scaledPupilY})`);
}

// Pupil position starts off-centre on the X axis
const calcOffset = () => {
  for (const props of eyes) {
    props.pupil.removeAttribute('transform');
    const eyeRect = props.eye.getBoundingClientRect();
    const pupilRect = props.pupil.getBoundingClientRect();
    props.offsetX = ((eyeRect.right - pupilRect.right) - (pupilRect.left - eyeRect.left)) / 2;
  }
}
calcOffset();

globalThis.addEventListener('resize', () => {
  calcOffset();
});

let frame = 0;
globalThis.addEventListener('mousemove', (ev) => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    for (const eye of eyes) {
      updateEye(ev, eye);
    }
  });
});