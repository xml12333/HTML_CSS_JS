/*********
 * made by Matthias Hurrle (@atzedent)
 */
let editMode = false // set to false to hide the code editor on load
let playOnLoad = true // set to true to start the shader automatically on load, otherwise click the play button
let resolution = .5 // set 1 for full resolution or to .5 to start with half resolution on load
let renderDelay = 1000 // delay in ms before rendering the shader after a change
let startTime = 0
let elapsedTime = 0
let interactionFrameRequested = false
let dpr = Math.max(1, resolution * window.devicePixelRatio)
let frm, source, editor, renderer, pointers
window.onload = init

function resize() {
  const { innerWidth: width, innerHeight: height } = window

  canvas.width = width * dpr
  canvas.height = height * dpr

  if (renderer) {
    renderer.updateScale(dpr)
    renderInteractionFrame()
  }
}
function toggleView() {
  editor.hidden = btnToggleView.checked
  canvas.style.setProperty('--canvas-z-index', btnToggleView.checked ? 0 : -1)
}
function reset() {
  let shader = source
  editor.text = shader ? shader.textContent : renderer.defaultSource
  renderThis()
}
function toggleResolution() {
  resolution = btnToggleResolution.checked ? .5 : 1
  dpr = Math.max(1, resolution * window.devicePixelRatio)
  pointers.updateScale(dpr)
  resize()
}
function update() {
  renderer.updateMouse(pointers.first)
  renderer.updatePointerCount(pointers.count)
  renderer.updatePointerCoords(pointers.coords)
  renderer.updateMove(pointers.move)
  renderer.updateZoom(pointers.zoomed)
  renderer.updateWheel(pointers.wheel)
}
function loop(now) {
  elapsedTime = now - startTime
  update()
  renderer.render(elapsedTime)
  frm = requestAnimationFrame(loop)
}
async function renderThis() {
  editor.clearError()
  const result = renderer.test(editor.text)

  if (result) {
    editor.setError(result)
  } else {
    renderer.updateShader(editor.text)
  }
  const wasPlaying = !!frm
  cancelAnimationFrame(frm) // Always cancel the previous frame!
  frm = null

  if (wasPlaying || playOnLoad) {
    play()
  } else {
    renderer.render(elapsedTime)
  }
}
const play = () => {
  if (frm) return
  startTime = performance.now() - elapsedTime
  loop(performance.now())
  btnPlayStop.checked = true
}
const stop = () => {
  if (frm) {
    elapsedTime = performance.now() - startTime
  }
  cancelAnimationFrame(frm)
  frm = null
  btnPlayStop.checked = false
}
function togglePlayStop() {
  if (btnPlayStop.checked) {
    playOnLoad = true
    play()
  } else {
    playOnLoad = false
    stop()
  }
}
const debounce = (fn, delay) => {
  let timerId
  return (...args) => {
    clearTimeout(timerId)
    timerId = setTimeout(() => fn.apply(this, args), delay)
  }
}
const render = debounce(renderThis, renderDelay)
function renderInteractionFrame() {
  if (frm || interactionFrameRequested || !renderer || !pointers) return
  interactionFrameRequested = true
  requestAnimationFrame(() => {
    interactionFrameRequested = false
    if (frm) return
    update()
    renderer.render(elapsedTime)
  })
}
function init() {
  source = document.querySelector("script[type='x-shader/x-fragment']")

  document.title = "Grid Run"

  renderer = new Renderer(canvas, dpr)
  pointers = new PointerHandler(canvas, dpr)
  editor   = new Editor(codeEditor, error, indicator)
  editor.text = source.textContent
  renderer.setup()
  renderer.init()

  if (!editMode) {
    btnToggleView.checked = true
    toggleView()
  }
  if (resolution === .5) {
    btnToggleResolution.checked = true
    toggleResolution()
  }
  canvas.addEventListener('shader-error', e => editor.setError(e.detail))
  pointers.onchange = renderInteractionFrame
  resize()

  if (renderer.test(source.textContent) === null) {
    renderer.updateShader(source.textContent)
  }
  elapsedTime = 0
  startTime = performance.now()
  renderThis()
  window.onresize = resize
  window.addEventListener("keydown", e => {
    if (e.key === "L" && e.ctrlKey) {
      e.preventDefault()
      btnToggleView.checked = !btnToggleView.checked
      toggleView()
    }
  })
}
class Renderer {
  #vertexSrc = "#version 300 es\nprecision highp float;\nin vec4 position;\nvoid main(){gl_Position=position;}"
  #fragmtSrc = "#version 300 es\nprecision highp float;\nout vec4 O;\nuniform float time;\nuniform vec2 resolution;\nvoid main() {\n\tvec2 uv=gl_FragCoord.xy/resolution;\n\tO=vec4(uv,sin(time)*.5+.5,1);\n}"
  #vertices = [-1, 1, -1, -1, 1, 1, 1, -1]
  constructor(canvas, scale) {
    this.canvas = canvas
    this.scale = scale
    this.gl = canvas.getContext("webgl2")
    this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale)
    this.shaderSource = this.#fragmtSrc
    this.mouseMove = [0, 0]
    this.mouseCoords = [0, 0]
    this.pointerCoords = [0, 0]
    this.nbrOfPointers = 0
    this.zoom = 0
    this.wheel = [0, 0]
    this.startRandom = Math.random()
  }
  get defaultSource() { return this.#fragmtSrc }
  updateShader(source) {
    this.reset()
    this.shaderSource = source
    this.setup()
    this.init()
  }
  updateMove(deltas) {
    this.mouseMove = deltas
  }
  updateZoom(zoom) {
    this.zoom = zoom
  }
  updateWheel(wheel) {
    this.wheel = wheel
  }
  updateMouse(coords) {
    this.mouseCoords = coords
  }
  updatePointerCoords(coords) {
    this.pointerCoords = coords
  }
  updatePointerCount(nbr) {
    this.nbrOfPointers = nbr
  }
  updateScale(scale) {
    this.scale = scale
    this.gl.viewport(0, 0, this.canvas.width * scale, this.canvas.height * scale)
  }
  compile(shader, source) {
    const gl = this.gl
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader))
      this.canvas.dispatchEvent(new CustomEvent('shader-error', { detail: gl.getShaderInfoLog(shader) }))
    }
  }
  test(source) {
    let result = null
    const gl = this.gl
    const shader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      result = gl.getShaderInfoLog(shader)
    }
    if (!gl.getShaderParameter(shader, gl.DELETE_STATUS)) {
      gl.deleteShader(shader)
    }
    return result
  }
  reset() {
    const { gl, program, vs, fs } = this
    if (!program || gl.getProgramParameter(program, gl.DELETE_STATUS)) return
    if (!gl.getShaderParameter(vs, gl.DELETE_STATUS)) {
      gl.detachShader(program, vs)
      gl.deleteShader(vs)
    }
    if (!gl.getShaderParameter(fs, gl.DELETE_STATUS)) {
      gl.detachShader(program, fs)
      gl.deleteShader(fs)
    }
    gl.deleteProgram(program)
  }
  setup() {
    const gl = this.gl
    this.vs = gl.createShader(gl.VERTEX_SHADER)
    this.fs = gl.createShader(gl.FRAGMENT_SHADER)
    this.compile(this.vs, this.#vertexSrc)
    this.compile(this.fs, this.shaderSource)
    this.program = gl.createProgram()
    gl.attachShader(this.program, this.vs)
    gl.attachShader(this.program, this.fs)
    gl.linkProgram(this.program)

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(this.program))
    }
  }
  init() {
    const { gl, program } = this
    this.buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.#vertices), gl.STATIC_DRAW)

    const position = gl.getAttribLocation(program, "position")

    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    program.resolution = gl.getUniformLocation(program, "resolution")
    program.time = gl.getUniformLocation(program, "time")
    program.daytime = gl.getUniformLocation(program, "daytime")
    program.move = gl.getUniformLocation(program, "move")
    program.touch = gl.getUniformLocation(program, "touch")
    program.pointerCount = gl.getUniformLocation(program, "pointerCount")
    program.pointers = gl.getUniformLocation(program, "pointers")
    program.zoom = gl.getUniformLocation(program, "zoom")
    program.wheel = gl.getUniformLocation(program, "wheel") 
    program.startRandom = gl.getUniformLocation(program, "startRandom")
  }
  render(now = 0) {
    const { gl, program, buffer, canvas, mouseMove, mouseCoords, pointerCoords, nbrOfPointers, zoom, wheel, startRandom } = this
    const daytime = new Date()
    if (!program || gl.getProgramParameter(program, gl.DELETE_STATUS)) return

    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.uniform2f(program.resolution, canvas.width, canvas.height)
    gl.uniform1f(program.time, now * 1e-3)
    gl.uniform4f(program.daytime, daytime.getHours(), daytime.getMinutes(), daytime.getSeconds(), daytime.getMilliseconds())
    gl.uniform2f(program.move, ...mouseMove)
    gl.uniform2f(program.touch, ...mouseCoords)
    gl.uniform1i(program.pointerCount, nbrOfPointers)
    gl.uniform2fv(program.pointers, pointerCoords)
    gl.uniform1f(program.zoom, zoom)
    gl.uniform2f(program.wheel, ...wheel)
    gl.uniform1f(program.startRandom, startRandom)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  clear() {
    const { gl } = this
    gl.clear(gl.COLOR_BUFFER_BIT)
  }
}
class PointerHandler {
  constructor(element, scale) {
    this.scale = scale
    this.active = false
    this.onchange = null
    this.pointers = new Map()
    this.lastCoords = [0, 0]
    this.moves = [0, 0]
    this.zoom = 0
    this.wheelDelta = 0
    this.wheelOffset = 0
    this.ex = 0
    this.ey = 0
    const emit = () => {
      if (typeof this.onchange === 'function') {
        this.onchange()
      }
    }
    const map = (element, scale, x, y) => [x * scale, element.height - y * scale]
    element.addEventListener("pointerdown", (e) => {
      this.active = true
      this.pointers.set(e.pointerId, map(element, this.getScale(), e.clientX, e.clientY))
      this.ex = e.clientX
      this.ey = e.clientY
      emit()
    })
    element.addEventListener("pointerup", (e) => {
      if (this.count === 1) {
        this.lastCoords = this.first
      }
      this.pointers.delete(e.pointerId)
      this.active = this.pointers.size > 0
      emit()
    })
    element.addEventListener("pointerleave", (e) => {
      if (this.count === 1) {
        this.lastCoords = this.first
      }
      this.pointers.delete(e.pointerId)
      this.active = this.pointers.size > 0
      emit()
    })
    element.addEventListener("pointermove", (e) => {
      if (!this.active) return
      const mapped = map(element, this.getScale(), e.clientX, e.clientY)
      this.lastCoords = mapped
      this.pointers.set(e.pointerId, mapped)
      this.moves = [this.moves[0] + (e.clientX - this.ex), this.moves[1] + (this.ey - e.clientY)]
      this.ex = e.clientX
      this.ey = e.clientY
      emit()
    })
    element.addEventListener("wheel", (e) => {
      this.zoom = lerp(this.zoom, Math.max(-1, Math.min(1, this.zoom + e.deltaY)), .05)
      // Bei Richtungswechsel sofort anpassen, sonst interpolieren
      if (this.wheelDelta * e.deltaY < 0) {
        this.wheelDelta = e.deltaY
      } else {
        this.wheelDelta = lerp(this.wheelDelta, e.deltaY, .05)
      }
      this.wheelOffset += this.wheelDelta
      emit()
    }, { passive: true })
  }
  getScale() {
    return this.scale
  }
  updateScale(scale) { this.scale = scale }
  reset() {
    this.pointers.clear()
    this.active = false
    this.lastCoords = [0, 0]
    this.moves = [0, 0]
    this.zoom = 0
    this.wheelDelta = 0
    this.wheelOffset = 0
  }
  get count() {
    return this.pointers.size
  }
  get move() {
    return this.moves
  }
  get zoomed() {
    return this.zoom
  }
  get wheel() {
    return [this.wheelDelta, this.wheelOffset] || [0, 0]
  }
  get coords() {
    return this.pointers.size > 0 ? Array.from(this.pointers.values()).map((p) => [...p]).flat() : [0, 0]
  }
  get first() {
    return this.pointers.values().next().value || this.lastCoords
  }
}
function lerp(a, b, t) {
  return a + (b - a) * t
}
class Editor {
  constructor(textarea, errorfield, errorindicator) {
    this.textarea = textarea
    this.errorfield = errorfield
    this.errorindicator = errorindicator
    textarea.addEventListener('keydown', this.handleKeydown.bind(this))
    textarea.addEventListener('scroll', this.handleScroll.bind(this))
  }
  get hidden() { return this.textarea.classList.contains('hidden') }
  set hidden(value) { value ? this.#hide() : this.#show() }
  get text() { return this.textarea.value }
  set text(value) { this.textarea.value = value }
  get scrollTop() { return this.textarea.scrollTop }
  set scrollTop(value) { this.textarea.scrollTop = value }
  setError(message) {
    this.errorfield.innerHTML = message
    this.errorfield.classList.add('opaque')
    const match = message.match(/ERROR: \d+:(\d+):/)
    const lineNumber = match ? parseInt(match[1]) : 0
    const overlay = document.createElement('pre')

    overlay.classList.add('overlay')
    overlay.textContent = '\n'.repeat(lineNumber)

    document.body.appendChild(overlay)

    const offsetTop = parseInt(getComputedStyle(overlay).height)

    this.errorindicator.style.setProperty('--top', offsetTop + 'px')
    this.errorindicator.style.visibility = 'visible'

    document.body.removeChild(overlay)
  }
  clearError() {
    this.errorfield.textContent = ''
    this.errorfield.classList.remove('opaque')
    this.errorfield.blur()
    this.errorindicator.style.visibility = 'hidden'
  }
  focus() {
    this.textarea.focus()
  }
  #hide() {
    for (const el of [this.errorindicator, this.errorfield, this.textarea]) {
      el.classList.add('hidden')
    }
  }
  #show() {
    for (const el of [this.errorindicator, this.errorfield, this.textarea]) {
      el.classList.remove('hidden')
    }
    this.focus()
  }
  handleScroll() {
    this.errorindicator.style.setProperty('--scroll-top', `${this.textarea.scrollTop}px`)
  }
  handleKeydown(event) {
    if (event.key === "Tab") {
      event.preventDefault()
      this.handleTabKey(event.shiftKey)
    } else if (event.key === "Enter") {
      event.preventDefault()
      this.handleEnterKey()
    }
  }
  handleTabKey(shiftPressed) {
    if (this.#getSelectedText() !== "") {
      if (shiftPressed) {
        this.#unindentSelectedText()
        return
      }
      this.#indentSelectedText()
    } else {
      this.#indentAtCursor()
    }
  }
  #getSelectedText() {
    const editor = this.textarea
    const start = editor.selectionStart
    const end = editor.selectionEnd
    return editor.value.substring(start, end)
  }
  #indentAtCursor() {
    const editor = this.textarea
    const cursorPos = editor.selectionStart

    document.execCommand('insertText', false, '\t')
    editor.selectionStart = editor.selectionEnd = cursorPos + 1
  }
  #indentSelectedText() {
    const editor = this.textarea
    const cursorPos = editor.selectionStart
    const selectedText = this.#getSelectedText()
    const lines = selectedText.split('\n')
    const indentedText = lines.map(line => '\t' + line).join('\n')

    document.execCommand('insertText', false, indentedText)
    editor.selectionStart = cursorPos
  }
  #unindentSelectedText() {
    const editor = this.textarea
    const cursorPos = editor.selectionStart
    const selectedText = this.#getSelectedText()
    const lines = selectedText.split('\n')
    const indentedText = lines.map(line => line.replace(/^\t/, '').replace(/^ /, '')).join('\n')

    document.execCommand('insertText', false, indentedText)
    editor.selectionStart = cursorPos
  }
  handleEnterKey() {
    const editor = this.textarea
    const visibleTop = editor.scrollTop
    const cursorPosition = editor.selectionStart

    let start = cursorPosition - 1
    while (start >= 0 && editor.value[start] !== '\n') {
      start--
    }

    let newLine = ''
    while (start < cursorPosition - 1 && (editor.value[start + 1] === ' ' || editor.value[start + 1] === '\t')) {
      newLine += editor.value[start + 1]
      start++
    }

    document.execCommand('insertText', false, '\n' + newLine)
    editor.selectionStart = editor.selectionEnd = cursorPosition + 1 + newLine.length
    editor.scrollTop = visibleTop // Prevent the editor from scrolling
    const lineHeight = editor.scrollHeight / editor.value.split('\n').length
    const line = editor.value.substring(0, cursorPosition).split('\n').length

    // Do the actual layout calculation in order to get the correct scroll position
    const visibleBottom = editor.scrollTop + editor.clientHeight
    const lineTop = lineHeight * (line - 1)
    const lineBottom = lineHeight * (line + 2)

    // If the cursor is outside the visible range, scroll the editor
    if (lineTop < visibleTop) editor.scrollTop = lineTop
    if (lineBottom > visibleBottom) editor.scrollTop = lineBottom - editor.clientHeight
  }
}