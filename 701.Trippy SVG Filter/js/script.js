const img = document.querySelector('#img')
const displacement = document.querySelector('#displacement')
const colorMatrix = document.querySelector('#colorMatrix')
const buttons = document.querySelectorAll('button')

const mouseFunction = (mouse) => {
  const clientX = mouse.offsetX ? mouse.offsetX : mouse.touches[0].offsetX;
  const clientY = mouse.offsetY ? mouse.offsetY : mouse.touches[0].offsetY;

	const displacementValue = (clientX - img.offsetWidth / 2) / 5
  if (clientX > img.offsetWidth / 2 + 20) {
    displacement.setAttribute('scale', displacementValue)
  } else if (clientX < img.offsetWidth / 2 - 20) {
    displacement.setAttribute('scale', displacementValue)
  } else {
    displacement.setAttribute('scale', 0)
  }
	
	const colorMatrixValue = (clientY - img.offsetHeight / 2) / 5
  if (clientY > img.offsetHeight / 2 + 20) {
		colorMatrix.setAttribute('values', colorMatrixValue)
		img.style.transform = `skewX(${colorMatrixValue / 10}deg)`
  } else if (clientY < img.offsetHeight / 2 - 20) {
		colorMatrix.setAttribute('values', colorMatrixValue)
		img.style.transform = `skewX(${colorMatrixValue / 10}deg)`
  } else {
		colorMatrix.setAttribute('values', 0)
		img.style.transform = `skewX(0)`
  }
};

// In a PROD case we should use a "throttle function" for these events
img.addEventListener("mousemove", mouseFunction);
img.addEventListener("touchstart", mouseFunction);

buttons.forEach(button => {
	button.addEventListener('click', () => {
		buttons.forEach(button => button.classList.remove('button-active'))
		button.classList.add('button-active')
				const buttonContent = button.innerHTML;
		displacement.setAttribute('xChannelSelector', buttonContent[0])
		displacement.setAttribute('yChannelSelector', buttonContent[1])
	})
})