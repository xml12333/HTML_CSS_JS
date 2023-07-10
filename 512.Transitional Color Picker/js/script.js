const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

class ColorElement {
  constructor(initialColor) {
    this.root = this.createRoot()
    this.addCopyIcon()
    this.updateColor(initialColor)
  }

  get element() {
    return this.root
  }

  createRoot() {
    const element = document.createElement('div')
    element.classList.add('transition-color-picker__color')
    return element
  }

  updateColor(color) {
    this.color = color
    this.root.style.setProperty('--color', this.color)
  }

  addCopyIcon() {
    const div = document.createElement('div')
    div.classList.add(
      'transition-color-picker__icon',
      'transition-color-picker__copy-icon'
    )
    const copySvg = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    )
    copySvg.setAttribute('viewBox', '0 0 32 32')
    const copyPath = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    )

    copyPath.setAttribute(
      'd',
      'm25 2h-14a3 3 0 0 0 -3 3v1h-1a3 3 0 0 0 -3 3v18a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-1h1a3 3 0 0 0 3-3v-18a3 3 0 0 0 -3-3zm-3 25a1 1 0 0 1 -1 1h-14a1 1 0 0 1 -1-1v-18a1 1 0 0 1 1-1h1v15a3 3 0 0 0 3 3h11zm4-4a1 1 0 0 1 -1 1h-14a1 1 0 0 1 -1-1v-18a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1z'
    )
    copyPath.setAttribute('fill', 'currentColor')

    copySvg.appendChild(copyPath)
    div.appendChild(copySvg)

    const successSvg = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    )
    successSvg.setAttribute('viewBox', '0 -65 512 512')
    const successPath = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    )

    successPath.setAttribute(
      'd',
      'm444.175781 0-260.871093 242.011719-110.324219-117.734375-72.980469 68.386718 178.234375 190.207032 333.765625-309.351563zm0 0'
    )
    successPath.setAttribute('fill', 'currentColor')

    successSvg.appendChild(successPath)

    successSvg.style.opacity = 0

    div.appendChild(successSvg)

    this.root.addEventListener('click', () => {
      navigator.clipboard.writeText(this.color)
      copySvg.style.opacity = 0
      successSvg.style.opacity = 1
      setTimeout(() => {
        copySvg.style.opacity = 1
        successSvg.style.opacity = 0
      }, 1000)
    })

    this.root.appendChild(div)
  }
}

class ColorElementInput {
  constructor(initialColor, className) {
    this.root = this.createRoot(className)
    this.picker = this.createPicker()

    this.addPickerIcon()

    this.updateColor(initialColor)

    this.root.appendChild(this.picker)
  }

  get element() {
    return this.root
  }

  createRoot(className) {
    const element = document.createElement('label')
    element.classList.add('transition-color-picker__color', className)
    return element
  }

  createPicker() {
    const picker = document.createElement('input')
    picker.classList.add('transition-color-picker__input')
    picker.type = 'color'
    picker.value = this.color

    picker.addEventListener('input', () => {
      this.updateColor(picker.value)
      this.changeCallback(picker.value)
    })

    return picker
  }

  addPickerIcon() {
    const div = document.createElement('div')
    div.classList.add('transition-color-picker__icon')
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 24 24')
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')

    path.setAttribute(
      'd',
      'm21.251 3.827a4.263 4.263 0 0 0 -6.5-.59 4.292 4.292 0 0 0 -.97 1.52 6.24 6.24 0 0 1 -1.39 2.37l-.26-.26a1 1 0 0 0 -1.41 0 1.008 1.008 0 0 0 0 1.42l.26.26-7.538 7.532a4.925 4.925 0 0 0 -1.19 5.041 1.035 1.035 0 0 0 .63.63 5.048 5.048 0 0 0 1.57.25 4.9 4.9 0 0 0 3.47-1.44l7.539-7.541.26.26a.97.97 0 0 0 .7.3 1.005 1.005 0 0 0 .71-1.71l-.26-.26.22-.22a4.754 4.754 0 0 1 1.97-1.1 4.232 4.232 0 0 0 2.18-1.61 4.28 4.28 0 0 0 .009-4.852zm-14.751 15.322a2.86 2.86 0 0 1 -2.47.82 2.891 2.891 0 0 1 .82-2.47l7.539-7.541 1.65 1.65z'
    )
    path.setAttribute('fill', 'currentColor')

    svg.appendChild(path)
    div.appendChild(svg)
    this.root.appendChild(div)
  }

  onChange(cb) {
    this.changeCallback = cb
  }

  updateColor(color) {
    this.color = color
    this.root.style.setProperty('--color', this.color)
  }
}

class DragSpaceDetector {
  #host
  #onDragCallback

  #startX = 0
  #isDragging = false
  #preventPicker = false
  #minOffsetX = 0
  #maxOffsetX
  #startTranslateX = 0

  constructor(host) {
    this.#host = host

    this.makeToDraggable()
  }

  get #to() {
    return this.#host._toColorInput
  }

  get #from() {
    return this.#host._fromColorInput
  }

  get #toRect() {
    return this.#to.element.getBoundingClientRect()
  }

  get #fromRect() {
    return this.#from.element.getBoundingClientRect()
  }

  onDrag(cb) {
    this.#onDragCallback = cb
  }

  makeToDraggable() {
    this.#to.element.addEventListener('click', (e) => {
      if (this.#preventPicker) {
        e.preventDefault()
      }
      this.#preventPicker = false
    })

    this.#to.element.addEventListener('pointerdown', (e) => {
      this.#to.element.style.position = 'fixed'
      this.#host.removeHelper()
      document.body.style.cursor = 'grabbing'
      this.#to.element.classList.add(
        'transition-color-picker__to-color--dragging'
      )
      this.#startTranslateX = this.#host.container.getBoundingClientRect().right
      this.#to.element.style.transform = `translateX(${
        this.#startTranslateX
      }px)`
      this.#startX = e.clientX
      this.#minOffsetX = this.#fromRect.right - this.#toRect.left
      this.#maxOffsetX =
        window.innerWidth - this.#toRect.left - this.#toRect.width
      this.#isDragging = true
      this.#host.root.style.setProperty(
        '--full-width',
        `${this.#host.fullWidth}px`
      )
    })

    document.addEventListener('pointerup', (e) => {
      if (!this.#isDragging) return
      this.#isDragging = false
      document.body.style.cursor = ''
      this.#to.element.classList.remove(
        'transition-color-picker__to-color--dragging'
      )
      this.#to.element.style.transform = `translateX(0)`
      this.#to.element.style.position = ''
      this.#host.root.style.setProperty(
        '--full-width',
        `${this.#host.fullWidth}px`
      )
    })

    document.addEventListener('pointermove', (e) => {
      if (!this.#isDragging) return
      this.#preventPicker = true
      this.#host.root.style.setProperty(
        '--last-transition-color',
        this.#host._lastTransitionColor
      )
      const offsetX = e.clientX - this.#startX
      const currentOffsetX =
        offsetX < this.#minOffsetX
          ? this.#minOffsetX
          : offsetX > this.#maxOffsetX
          ? this.#maxOffsetX
          : offsetX
      this.#to.element.style.transform = `translateX(${
        this.#startTranslateX + currentOffsetX
      }px)`
      const numberOfColorsToAdd = Math.floor(
        (this.#toRect.left - this.#fromRect.right) / this.#host.colorSize
      )
      this.#host.root.style.setProperty(
        '--full-width',
        `${this.#host.fullWidth}px`
      )
      this.#onDragCallback(numberOfColorsToAdd)
    })
  }
}

class TransitionColorPicker {
  _fromColorInput
  _toColorInput
  #numberOfTransitionColors = 0

  constructor(root) {
    this.root = root

    this.addFromColorInput()

    this.addTransitionColorsContainer()

    this.addToColorInput()

    this.addShadow()

    this.addBackColor()

    this.#numberOfTransitionColors = +this.root.dataset.transitionLength || 0

    this.updateTransitionColors()

    const detector = new DragSpaceDetector(this)

    detector.onDrag((total) => {
      if (total !== this.#numberOfTransitionColors) {
        this.#numberOfTransitionColors = total
        this.updateTransitionColors()
      }
    })

    if (this.root.hasAttribute('data-helper')) {
      this.addHelper()
    }

    this.root.style.setProperty('--full-width', `${this.fullWidth}px`)
  }

  addHelper() {
    const div = document.createElement('div')
    div.classList.add('transition-color-picker__helper')
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '-10 0 309 309.33333')
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path')

    path1.setAttribute(
      'd',
      'm74.832031 138.667969h-21.332031v-90.667969c0-20.535156 16.800781-37.332031 37.332031-37.332031 20.535157 0 37.335938 16.796875 37.335938 37.332031h-21.335938c0-8.800781-7.199219-16-16-16-8.796875 0-16 7.199219-16 16zm0 0'
    )
    path1.setAttribute('fill', 'currentColor')
    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path')

    path2.setAttribute(
      'd',
      'm234.832031 85.332031h-21.332031v-37.332031c0-8.800781-7.199219-16-16-16s-16 7.199219-16 16h-21.332031c0-20.535156 16.796875-37.332031 37.332031-37.332031s37.332031 16.796875 37.332031 37.332031zm0 0'
    )
    path2.setAttribute('fill', 'currentColor')
    const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path')

    path3.setAttribute(
      'd',
      'm144.167969 309.332031c-79.46875 0-144-64.53125-144-144v-46.664062c0-21.066407 15.730469-39.203125 36.53125-42.269531l25.867187-3.730469 3.066406 21.066406-25.867187 3.730469c-10.398437 1.46875-18.265625 10.535156-18.265625 21.070312v46.664063c0 67.601562 55.066406 122.667969 122.667969 122.667969 67.597656 0 122.664062-55.066407 122.664062-122.667969v-96c0-8.800781-7.199219-16-16-16-8.796875 0-16 7.199219-16 16h-21.332031c0-20.53125 16.800781-37.332031 37.332031-37.332031 20.535157 0 37.335938 16.800781 37.335938 37.332031v96c0 79.601562-64.535157 144.132812-144 144.132812zm0 0'
    )
    path3.setAttribute('fill', 'currentColor')
    const path4 = document.createElementNS('http://www.w3.org/2000/svg', 'path')

    path4.setAttribute(
      'd',
      'm181.5 85.332031h-21.332031v-48c0-8.796875-7.203125-16-16-16-8.800781 0-16 7.203125-16 16v48h-21.335938v-48c0-20.53125 16.800781-37.332031 37.335938-37.332031 20.53125 0 37.332031 16.800781 37.332031 37.332031zm0 0'
    )
    path4.setAttribute('fill', 'currentColor')

    svg.appendChild(path1)
    svg.appendChild(path2)
    svg.appendChild(path3)
    svg.appendChild(path4)
    div.appendChild(svg)
    this._toColorInput.element.appendChild(div)
  }

  removeHelper() {
    this.root.querySelector('.transition-color-picker__helper')?.remove()
  }

  get fullWidth() {
    return (
      this._toColorInput.element.getBoundingClientRect().right -
      this._fromColorInput.element.getBoundingClientRect().left
    )
  }

  get colorSize() {
    return parseInt(
      getComputedStyle(this.root).getPropertyValue('--color-size')
    )
  }

  addFromColorInput() {
    this._fromColorInput = new ColorElementInput(
      this.root.dataset.fromColor || '#000',
      'transition-color-picker__from-color'
    )

    this._fromColorInput.onChange(() => {
      this.container.innerHTML = ''
      this.updateTransitionColors()
    })

    this.root.appendChild(this._fromColorInput.element)
  }

  addShadow() {
    const shadow = document.createElement('div')
    shadow.classList.add('transition-color-picker__shadow')
    this.root.appendChild(shadow)
  }

  addBackColor() {
    const backColor = document.createElement('div')
    backColor.classList.add('transition-color-picker__back-color')
    this.root.appendChild(backColor)
  }

  get _lastTransitionColor() {
    if (this.container.children.length === 0) return this._toColorInput.color

    return [...this.container.children]
      .at(-1)
      ?.style.getPropertyValue('--color')
  }

  addToColorInput() {
    this._toColorInput = new ColorElementInput(
      this.root.dataset.toColor || '#000',
      'transition-color-picker__to-color'
    )

    this._toColorInput.onChange(() => {
      this.container.innerHTML = ''
      this.updateTransitionColors()
    })

    this.root.appendChild(this._toColorInput.element)
  }

  toHex(value) {
    value = value.toString(16)
    return value.length === 1 ? '0' + value : value
  }

  getColorAt(ratio) {
    const fromColor = this._fromColorInput.color
    const toColor = this._toColorInput.color
    const r = clamp(
      Math.ceil(
        parseInt(fromColor.substring(1, 3), 16) * ratio +
          parseInt(toColor.substring(1, 3), 16) * (1 - ratio)
      ),
      0,
      255
    )
    const g = clamp(
      Math.ceil(
        parseInt(fromColor.substring(3, 5), 16) * ratio +
          parseInt(toColor.substring(3, 5), 16) * (1 - ratio)
      ),
      0,
      255
    )
    const b = clamp(
      Math.ceil(
        parseInt(fromColor.substring(5, 7), 16) * ratio +
          parseInt(toColor.substring(5, 7), 16) * (1 - ratio)
      ),
      0,
      255
    )

    return '#' + this.toHex(r) + this.toHex(g) + this.toHex(b)
  }

  addTransitionColorsContainer() {
    this.container = document.createElement('div')
    this.container.classList.add('transition-color-picker__container')
    this.root.appendChild(this.container)
  }

  updateTransitionColors() {
    this.container.innerHTML = ''
    const total = this.#numberOfTransitionColors + 2
    for (let index = this.#numberOfTransitionColors + 1; index >= 0; index--) {
      if (index === 0) continue
      if (index === total - 1) continue
      const ratio = index / (total - 1)
      const colorItem = new ColorElement(this.getColorAt(ratio))
      this.container.appendChild(colorItem.element)
    }
  }
}

Array.from(document.querySelectorAll('.transition-color-picker')).map(
  (el) => new TransitionColorPicker(el)
)
