const addXy = (a, b) => {
  a.x += b.x
  a.y += b.y
}

const subtractXy = (a, b) => {
  a.x -= b.x
  a.y -= b.y
}

const roundedPos = pos => {
  return {
    x: Math.round(pos.x),
    y: Math.round(pos.y),
  }
}

class Button {
  constructor({ className, btnText, action, offset, body }) {
    this.el = Object.assign(document.createElement('button'), {
      className: `dev btn ${className || ''}`,
      innerHTML: btnText || '',
    })
    if (action) this.el.addEventListener('click', () => action(this))
    body.appendChild(this.el)
    if (offset) this.setPos(offset)
  }
  setPos(pos) {
    this.el.style.transform = `translate(${px(pos.x)}, ${px(pos.y)})`
  }
}
class WorldObject {
  constructor({ pos = { x: 0, y: 0 }, el, offset = { x: 0, y: 0 } }) {
    Object.assign(this, {
      el,
      pos,
      lastPos: { x: null, y: null },
      offset,
      grabPos: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
      isGrabbed: false,
      isDraggable: true,
    })
  }
  distanceBetween(el) {
    return Math.round(
      Math.sqrt(
        Math.pow(this.pos.x - el.x, 2) + Math.pow(this.pos.y - el.y, 2),
      ),
    )
  }
  getNewPosBasedOnTarget = ({ el, maxDistance }) => {
    const fullDistance = this.distanceBetween(el)
    if (fullDistance <= 0) return this.pos
    const d = maxDistance < fullDistance ? maxDistance : fullDistance
    const remainingD = fullDistance - d

    return {
      x: Math.round((remainingD * this.pos.x + d * el.x) / fullDistance),
      y: Math.round((remainingD * this.pos.y + d * el.y) / fullDistance),
    }
  }
  setPos() {
    const { x, y } = this.pos
    if (this.lastPos.x === x && this.lastPos.y === y) return
    this.lastPos = { x, y }
    this.el.style.transform = `translate(${px(this.pos.x)}, ${px(this.pos.y)})`
  }
  addToWorld() {
    this.setPos()
    ;(this.container || wrapper.el).appendChild(this.el)
  }
  get corners() {
    const {
      pos: { x, y },
      size: { w, h },
    } = this
    // (a,c)--(b,c)
    //   | (pos) |
    // (a,d)--(b,d)
    return {
      a: x - w,
      b: x + w,
      c: y - h,
      d: y + h,
    }
  }
  isPosWithinArea(pos) {
    const { a, b, c, d } = this.corners
    const { x, y } = pos
    return x >= a && x <= b && y >= c && y <= d
  }
  drag = (x, y) => {
    this.grabPos.a.x = this.grabPos.b.x - x
    this.grabPos.a.y = this.grabPos.b.y - y
    subtractXy(this.pos, this.grabPos.a)
    this.setPos()

    if (this.group) {
      this.group.forEach(member => {
        if (member === this) return
        subtractXy(member.pos, this.grabPos.a)
        member.setPos()
      })
    }
    if (this.moveGravObjInContactWithDrag && this.gravObjsInContact)
      this.moveGravObjInContactWithDrag(this.grabPos.a)
  }
  onGrab = e => {
    if (wrapper.el.classList.contains('delete-mode')) {
      this.delete()
    } else {
      this.grabPos.b = { x: e.pageX, y: e.pageY }
      ;['pointerup', 'pointercancel'].forEach(action =>
        this.el.addEventListener(action, this.onLetGo),
      )
      this.el.addEventListener('pointermove', this.onDrag)
      this.el.classList.add('no-transition')
      this.base = null
    }
  }
  onDrag = e => {
    e.target.setPointerCapture(e.pointerId)
    this.drag(e.pageX, e.pageY)
    this.grabPos.b.x = e.pageX
    this.grabPos.b.y = e.pageY
    this.isGrabbed = true
  }
  onLetGo = () => {
    ;['pointerup', 'pointercancel'].forEach(action =>
      this.el.removeEventListener(action, this.onLetGo),
    )
    this.el.removeEventListener('pointermove', this.onDrag)
    world.removeObjectTransitions()
    this.isGrabbed = false

    this.el.classList.remove('no-transition')
    this.grabPos = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } }
  }
  clampDirection(dir, gravObj) {
    const {
      size: { w, h },
      pos: { x, y },
    } = this
    if (dir === 'd' && gravObj.pos.y > y - h / 2) gravObj.pos.y = y
    else if (dir === 'r' && gravObj.pos.x > x - w / 2) gravObj.pos.x = x
    else if (dir === 'u' && gravObj.pos.y < y + h / 2) gravObj.pos.y = y
    else if (dir === 'l' && gravObj.pos.x < x + w / 2) gravObj.pos.x = x
  }
  delete() {
    this.deleted = true
    this.el.remove()
    world.contactElements = world.contactElements.filter(el => el !== this)
    world.objects = world.objects.filter(o => o !== this)
    if (this.group)
      this.group.forEach(member => !member.deleted && member.delete())
    if (this.onPointerEnter) {
      this.el.removeEventListener('pointerenter', this.onPointerEnter)
      this.el.removeEventListener('pointerleave', this.onPointerLeave)
    }
  }
}

class Surface extends WorldObject {
  constructor(props) {
    super(props)
    world.contactElements.push(this)
  }
  get startX() {
    return this.pos.x - this.offset.x
  }
  get endX() {
    return this.pos.x + this.size.w + this.offset.x
  }
  get gravObjsInContact() {
    return world.objects.filter(o => o.elInContact === this)
  }
  moveGravObjInContactWithDrag(offset) {
    this.gravObjsInContact.forEach(o => {
      o.moveGravObjInContactWithDrag(offset)
      o.el.classList.add(this.transitionClass || 'no-transition')
      subtractXy(o.pos, offset || this.grabPos.a)
      o.setPos()
    })
  }
  isGravObjInContact(gravObj) {
    const isTouchingLine =
      Math.abs(gravObj.pos.y + gravObj.radius - this.pos.y + this.offset.y) <
      gravObj.velocity.y
    return (
      gravObj.pos.x > this.startX && gravObj.pos.x < this.endX && isTouchingLine
    )
  }
  triggerOnContact(gravObj) {
    if (this instanceof Box) gravObj.base = this.base || this
    gravObj.pos.y = this.pos.y - gravObj.radius - this.offset.y
    if (!gravObj.isLanded) gravObj.land(true)
  }
}

class PneumaticTube extends WorldObject {
  #directionMapping
  constructor({
    group = [],
    index = 0,
    pos = { x: 0, y: 0 },
    tubeConfig = '',
    prev = '',
    ports = ['d', 'u'],
    variant = 'entrance',
    isLast = true,
  }) {
    super({
      el: Object.assign(document.createElement('div'), {
        className: 'pneumatic-tube',
        innerHTML: `<div class="tube pix"></div>`,
      }),
      pos,
    })
    Object.assign(this, {
      size: {
        w: variant === 'entrance' ? 4 : 24,
        h: 24,
      },
      variant,
      group,
      prev,
      ports,
      index,
      buttons: [],
      isLast,
      expression: 'joy',
      tubeConfig,
    })
    this.tube = this.el.querySelector('.tube')
    this.updateTube()
    this.#directionMapping = { u: 'd', d: 'u', l: 'r', r: 'l' }
    //   - u -
    // l      r
    //   - d -
    this.el.setAttribute('variant', this.variant)

    this.group[this.index] = this
    this.el.style.zIndex = this.index + 1

    world.contactElements.push(this)
    this.addToWorld()
    if (this.tubeConfig.length) this.mapFromTubeConfig()
    else if (this.isLast) this.renderButtons()

    this.el.addEventListener('pointerenter', this.onPointerEnter)
    this.el.addEventListener('pointerleave', this.onPointerLeave)
  }
  onPointerEnter = () => {
    this.group.forEach(member => member.el.classList.add('el-group'))
  }
  onPointerLeave = () => {
    this.group.forEach(member => member.el.classList.remove('el-group'))
  }
  get config() {
    return (
      this.index === 0 && {
        type: 'pneumaticTube',
        props: {
          tubeConfig: this.group.reduce((acc, g) => (acc += g.ports[1]), ''),
          pos: roundedPos(this.pos),
        },
      }
    )
  }
  mapFromTubeConfig() {
    this.ports = [
      this.#directionMapping[this.tubeConfig[0]],
      this.tubeConfig[0],
    ]
    this.updateTube()
    this.tubeConfig.split('').forEach((c, i, arr) => {
      if (!i) return
      const prev = this.#directionMapping[arr[i - 1]]
      const ports = [prev, c]
      const { elOffset } = this.calculateOffset(arr[i - 1])
      this.group[i] = new PneumaticTube({
        prev,
        variant: this.getVariant(ports),
        group: this.group,
        index: i,
        pos: {
          x: this.group[i - 1].pos.x + elOffset.x,
          y: this.group[i - 1].pos.y + elOffset.y,
        },
        ports,
        isLast: i === this.tubeConfig.length - 1,
      })
    })
  }
  renderButtons() {
    this.buttons = ['u', 'r', 'l', 'd']
      .filter(d => d !== this?.prev)
      .map(dir => {
        const { btnOffset, elOffset } = this.calculateOffset(dir)

        return new Button({
          body: this.el,
          btnText: '+',
          offset: btnOffset,
          action: () => {
            this.removeButtons()
            this.ports[1] = dir
            if (this.variant === 'entrance')
              this.ports[0] = this.#directionMapping[dir]
            this.extendPneumaticTube(dir, elOffset)
          },
        })
      })
    if (this.index > 0) this.addDeleteButton()
  }
  calculateOffset(dir) {
    const h = this.size.h
    const w = h
    return {
      u: { btnOffset: { x: w, y: -h * 3 }, elOffset: { x: 0, y: -h * 2 } },
      d: { btnOffset: { x: w, y: h }, elOffset: { x: 0, y: h * 2 } },
      l: { btnOffset: { x: -w, y: -h }, elOffset: { x: -w * 2, y: 0 } },
      r: { btnOffset: { x: w * 3, y: -h }, elOffset: { x: w * 2, y: 0 } },
    }[dir]
  }
  updateTube() {
    this.walls = ['u', 'd', 'l', 'r'].filter(d => !this.ports.includes(d))

    const [a, b] = this.ports
    const d = this.variant === 'entrance' || this.isLast ? 28 : 15
    this.velocity = {
      x: a == 'l' || b == 'r' ? d : a == 'r' || b == 'l' ? -d : 0,
      y: a == 'u' || b == 'd' ? d : a == 'd' || b == 'u' ? -d : 0,
    }
    this.tube.style.transform = `rotate(${this.deg}deg)`
  }
  get deg() {
    const angleMap = {
      0: ['lr', 'rd', 'dr'],
      90: ['ud', 'dl', 'ld'],
      180: ['rl', 'ul', 'lu'],
      270: ['du', 'ur', 'ru'],
    }
    return Object.keys(angleMap).find(key =>
      angleMap[key].includes(this.ports[0] + this.ports[1]),
    )
  }
  addDeleteButton() {
    this.buttons.push(
      new Button({
        body: this.el,
        btnText: '-',
        offset: { x: this.size.w, y: -this.size.h },
        action: () => {
          this.removeButtons()
          this.el.remove()
          this.group[this.index - 1].renderButtons()
          this.group.pop()
          world.contactElements = world.contactElements.filter(o => o !== this)
        },
      }),
    )
  }
  getVariant(ports) {
    return ['ud', 'du', 'lr', 'rl'].includes(ports[0] + ports[1])
      ? 'straight'
      : 'elbow'
  }
  extendPneumaticTube(dir, offset) {
    this.tube.style.transform = `rotate(${this.deg}deg)`
    this.updateTube()
    if (this.variant !== 'entrance') {
      this.variant = this.getVariant(this.ports)
      this.el.setAttribute('variant', this.variant)
    }
    new PneumaticTube({
      prev: this.#directionMapping[dir],
      variant: 'straight',
      group: this.group,
      index: this.index + 1,
      pos: {
        x: this.pos.x + offset.x,
        y: this.pos.y + offset.y,
      },
      ports: [this.#directionMapping[dir], dir],
    })
  }
  removeButtons() {
    if (this.buttons.length) {
      this.buttons.forEach(b => b.el.remove())
      this.buttons.length = 0
    }
  }
  moveGravObj(gravObj) {
    gravObj.base = null
    addXy(gravObj.pos, this.velocity)
    gravObj.zIndex = this.index
    gravObj.el.style.zIndex = this.index
    this.walls.forEach(dir => this.clampDirection(dir, gravObj))
    if (this.index === this.group.length - 1) gravObj.resetZIndex()
  }
  isGravObjInContact(gravObj) {
    return this.isPosWithinArea(gravObj.pos) && gravObj.zIndex <= this.index
  }
  triggerOnContact(gravObj) {
    if (this.variant === 'entrance') gravObj.resetZIndex()
  }
}
class ConveyorBelt extends Surface {
  constructor({
    pos = { x: 0, y: 0 },
    moveDirection = -1,
    moduleNo = 1,
    isActive = false,
  }) {
    super({
      el: Object.assign(document.createElement('div'), {
        className: 'conveyor-belt el',
        innerHTML:
          '<div class="btn-wrapper slot"></div><div class="belt-wrapper slot"></div>',
      }),
      pos,
      offset: { x: 4, y: 0 },
    })
    Object.assign(this, {
      isActive,
      moveDirection: -1,
      moveDirection,
      moduleNo,
    })
    this.setSize()
    this.activate(isActive)
    this.addToWorld()
    this.el.style.setProperty('--move-direction', this.moveDirection)
    this.slots = this.el.querySelectorAll('.slot')
    this.renderBelt()
    this.buttons = [
      {
        btnText: '-',
        action: () => {
          if (this.moduleNo > 0) this.moduleNo--
          this.renderBelt()
        },
      },
      {
        btnText: '<',
        action: () => {
          this.activate(this.moveDirection !== 1 || !this.isActive)
          this.moveDirection = 1
          this.el.style.setProperty('--move-direction', this.moveDirection)
        },
      },
      {
        btnText: '>',
        action: () => {
          this.activate(this.moveDirection !== -1 || !this.isActive)
          this.moveDirection = -1
          this.el.style.setProperty('--move-direction', this.moveDirection)
        },
      },
      {
        btnText: '+',
        action: () => {
          this.moduleNo++
          this.renderBelt()
        },
      },
    ].map(p => new Button({ body: this.slots[0], ...p }))
  }
  get config() {
    return {
      type: 'conveyorBelt',
      props: {
        moduleNo: this.moduleNo,
        moveDirection: this.moveDirection,
        pos: roundedPos(this.pos),
        isActive: this.isActive,
      },
    }
  }
  get expression() {
    return this.isActive ? 'neutral' : 'sleepy'
  }
  activate(bool) {
    this.isActive = bool
    this.el.classList[bool ? 'add' : 'remove']('animate')
  }
  beltEdge(className) {
    return `<div class="belt-edge pix ${className || ''}"></div>`
  }
  renderBelt() {
    this.slots[1].innerHTML =
      this.beltEdge() +
      new Array(this.moduleNo || 1)
        .fill('')
        .reduce(acc => (acc += '<div class="belt-module pix"></div>'), '') +
      this.beltEdge('flip')
    this.setSize()
  }
  get modules() {
    return this.el.querySelectorAll('.belt-module')
  }
  get surfaceVelocity() {
    return {
      x: this.isActive ? -4 * this.moveDirection : 0,
      y: 0,
    }
  }
  setSize() {
    const { width, height } = this.el?.getBoundingClientRect()
    this.size = { w: width, h: height }
  }
  moveGravObj(gravObj) {
    if (gravObj.isLanded && !this.isGrabbed)
      addXy(gravObj.pos, this.surfaceVelocity)
  }
}

class Box extends Surface {
  constructor({ pos, color }) {
    super({
      el: Object.assign(document.createElement('div'), {
        className: 'box el',
      }),
      offset: { x: 10, y: 10 },
      pos,
    })
    this.color = color
    Object.assign(this, {
      defaultClass: 'box el',
      velocity: { x: 0, y: 12 },
      radius: 10,
      size: { w: 10, h: 10 },
      expression: 'neutral',
      zIndex: 0,
    })
    world.objects.push(this)
    this.el.style.setProperty('--bg', color || '#ffffff')
    this.addToWorld()
  }
  setExpression(expression) {
    this.expression = expression
    this.el.setAttribute('expression', expression)
  }
  get config() {
    return {
      type: 'box',
      props: {
        pos: roundedPos(this.pos),
        color: this.color,
      },
    }
  }
  get elInContact() {
    return (
      this.grabbedElInContact ||
      world.contactElements.find(el => {
        return el !== this && el.isGravObjInContact(this)
      })
    )
  }
  land(bool) {
    this.isLanded = bool
    this.el.classList[bool ? 'add' : 'remove']('on-ground')
  }
  hitCheckWalls() {
    if (this.pos.x + this.radius > wrapper.size.w)
      this.pos.x = wrapper.size.w - this.radius
    if (this.pos.x - this.radius < 0) this.pos.x = this.radius
    if (this.pos.y + this.radius > wrapper.size.h)
      this.pos.y = wrapper.size.h - this.radius
    if (this.pos.y - this.radius < 0) this.pos.y = this.radius
  }
  spaceOutObjects() {
    world.objects.forEach(o => {
      if (this === o) return
      const distanceBetweenObjects = this.distanceBetween(o.pos)
      if (distanceBetweenObjects < this.radius * 2) {
        const overlap = distanceBetweenObjects - this.radius * 2
        this.pos = this.getNewPosBasedOnTarget({
          el: o.pos,
          maxDistance: overlap / 2,
        })
      }
    })
  }
  resetZIndex() {
    this.zIndex = 0
    this.el.style.zIndex = 0
  }
  move() {
    if (this.isGrabbed) return
    const { elInContact } = this

    if (elInContact) {
      elInContact.triggerOnContact?.(this)
      elInContact.moveGravObj?.(this)
      this.setExpression(elInContact.expression || 'neutral')

      world.objects
        .filter(o => o.base === this)
        .forEach(d => {
          d.el.classList.add(elInContact.transitionClass)
          elInContact?.moveGravObj?.(d)
        })
    } else {
      addXy(this.pos, this.velocity)
      this.land(false)
      this.base = null
      this.resetZIndex()
      this.isGrabbed = false
      this.setExpression('surprise')
    }
    this.hitCheckWalls()
    this.spaceOutObjects()
    this.setPos()
  }
}

document.querySelectorAll('button').forEach(b => {
  b.addEventListener(
    'click',
    {
      'dev-mode': () =>
        [wrapper.el, nav].forEach(el => {
          el.classList.toggle('dev-mode')
          wrapper.el.classList.remove('delete-mode')
        }),
      belt: () => new ConveyorBelt({ moduleNo: 5, pos: { x: 20, y: 50 } }),
      tube: () => new PneumaticTube({ pos: { x: 80, y: 80 } }),
      box: () =>
        new Box({
          pos: { x: 100, y: 0 },
          color: ['#797979', '#42c6d2', '#fff'][Math.floor(Math.random() * 3)],
        }),
      delete: () => wrapper.el.classList.toggle('delete-mode'),
      download: () => world.saveConfig(),
    }[b.dataset.id],
  )
})

const world = {
  contactElements: [],
  objects: [],
  interval: null,
  isPaused: false,
  removeObjectTransitions() {
    this.objects.forEach(o => (o.el.className = o.defaultClass))
  },
  start() {
    clearInterval(this.interval)
    this.interval = setInterval(() => {
      if (this.isPaused) clearInterval(this.interval)
      this.objects.forEach(o => o.move && o.move())
      this.contactElements.sort((a, b) => a.pos.y - b.pos.y)
    }, 100)
  },
  saveConfig() {
    const data = this.contactElements.reduce((acc, o) => {
      if (o.config) acc.push(o.config)
      return acc
    }, [])
    const url = window.URL.createObjectURL(
      new Blob([JSON.stringify(data)], {
        type: 'text/plain',
      }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = `box_flow_system_config_${new Date().getTime()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  },
  readConfig(data) {
    const reader = new FileReader()
    reader.onload = e => {
      const configs = JSON.parse(e.target.result)
      if (configs.length) {
        this.contactElements.forEach(el => el.delete())
        this.renderFromConfigs(configs)
      }
    }
    reader.readAsText(data)
  },
  renderFromConfigs(configs) {
    configs.forEach(config => {
      try {
        new {
          box: Box,
          pneumaticTube: PneumaticTube,
          conveyorBelt: ConveyorBelt,
        }[config.type](config.props)
      } catch (e) {
        throw new Error(
          `error: something went wrong, perhaps the config is corrupt`,
        )
      }
    })
  },
}

document.getElementById('upload-config').addEventListener('change', e => {
  const data = e.target.files[0]
  if (data) {
    world.readConfig(data)
  }
})

const wrapper = {
  el: document.querySelector('.wrapper'),
  canDrag: false,
  pos: { x: 0, y: 0 },
  pointerPos: { x: 0, y: 0 },
}
const { width, height } = wrapper.el.getBoundingClientRect()
wrapper.size = { w: width, h: height }
const nav = document.querySelector('nav')
const px = n => (!isNaN(n) ? n + 'px' : 0)

window.addEventListener('pointermove', e => {
  if (wrapper.canDrag) {
    wrapper.el.style.transform = `translate(${px(e.pageX - wrapper.pointerPos.x)}, ${px(e.pageY - wrapper.pointerPos.y)})`
  }
})

window.addEventListener('pointerdown', e => {
  wrapper.pointerPos = {
    x: e.pageX - wrapper.pos.x,
    y: e.pageY - wrapper.pos.y,
  }
  if (e.target.nodeName === 'HTML') {
    wrapper.canDrag = true
  } else {
    const el = world.contactElements.find(
      o => e.target === o.el && o.isDraggable,
    )
    if (el) el.onGrab(e)
  }
})
;['pointercancel', 'pointerup'].forEach(action => {
  window.addEventListener(action, e => {
    // Ensures objects get released when unfocused
    if (action === 'pointerup') world.objects.forEach(o => o.onLetGo())
    wrapper.canDrag = false
    if (e.target.nodeName === 'HTML') {
      wrapper.pos = {
        x: e.pageX - wrapper.pointerPos.x,
        y: e.pageY - wrapper.pointerPos.y,
      }
    }
  })
})

world.renderFromConfigs([
  { type: 'box', props: { pos: { x: 755, y: 64 }, color: '#42c6d2' } },
  { type: 'box', props: { pos: { x: 736, y: 64 }, color: '#42c6d2' } },
  { type: 'box', props: { pos: { x: 580, y: 100 }, color: '#797979' } },
  { type: 'box', props: { pos: { x: 570, y: 103 }, color: '#797979' } },
  { type: 'box', props: { pos: { x: 672, y: 107 }, color: '#fff' } },
  {
    type: 'pneumaticTube',
    props: { tubeConfig: 'urrdddll', pos: { x: 695, y: 112 } },
  },
  { type: 'box', props: { pos: { x: 579, y: 127 }, color: '#fff' } },
  { type: 'box', props: { pos: { x: 602, y: 127 }, color: '#fff' } },
  { type: 'box', props: { pos: { x: 647, y: 127 }, color: '#42c6d2' } },
  { type: 'box', props: { pos: { x: 666, y: 127 }, color: '#42c6d2' } },
  {
    type: 'conveyorBelt',
    props: {
      moduleNo: 5,
      moveDirection: -1,
      pos: { x: 556, y: 137 },
      isActive: true,
    },
  },
  { type: 'box', props: { pos: { x: 234, y: 151 }, color: '#fff' } },
  { type: 'box', props: { pos: { x: 286, y: 151 }, color: '#42c6d2' } },
  {
    type: 'conveyorBelt',
    props: {
      moduleNo: 9,
      moveDirection: -1,
      pos: { x: 967, y: 159 },
      isActive: true,
    },
  },
  {
    type: 'conveyorBelt',
    props: {
      moduleNo: 6,
      moveDirection: -1,
      pos: { x: 107, y: 161 },
      isActive: true,
    },
  },
  { type: 'box', props: { pos: { x: 499, y: 168 }, color: '#797979' } },
  { type: 'box', props: { pos: { x: 499, y: 193 }, color: '#797979' } },
  { type: 'box', props: { pos: { x: 306, y: 223 }, color: '#42c6d2' } },
  { type: 'box', props: { pos: { x: 499, y: 243 }, color: '#42c6d2' } },
  {
    type: 'conveyorBelt',
    props: {
      moduleNo: 8,
      moveDirection: 1,
      pos: { x: 1150, y: 254 },
      isActive: true,
    },
  },
  { type: 'box', props: { pos: { x: 322, y: 265 }, color: '#42c6d2' } },
  { type: 'box', props: { pos: { x: 362, y: 265 }, color: '#797979' } },
  { type: 'box', props: { pos: { x: 398, y: 265 }, color: '#797979' } },
  {
    type: 'conveyorBelt',
    props: {
      moduleNo: 7,
      moveDirection: -1,
      pos: { x: 197, y: 275 },
      isActive: true,
    },
  },
  { type: 'box', props: { pos: { x: 499, y: 278 }, color: '#42c6d2' } },
  { type: 'box', props: { pos: { x: 672, y: 281 } } },
  { type: 'box', props: { pos: { x: 704, y: 289 }, color: '#42c6d2' } },
  {
    type: 'pneumaticTube',
    props: { tubeConfig: 'uuuurr', pos: { x: 499, y: 294 } },
  },
  {
    type: 'conveyorBelt',
    props: {
      moduleNo: 7,
      moveDirection: 1,
      pos: { x: 666, y: 299 },
      isActive: true,
    },
  },
  { type: 'box', props: { pos: { x: 1146, y: 304 }, color: '#fff' } },
  { type: 'box', props: { pos: { x: 456, y: 308 }, color: '#797979' } },
  { type: 'box', props: { pos: { x: 475, y: 308 }, color: '#42c6d2' } },
  { type: 'box', props: { pos: { x: 660, y: 313 }, color: '#797979' } },
  {
    type: 'conveyorBelt',
    props: {
      moduleNo: 7,
      moveDirection: -1,
      pos: { x: 326, y: 318 },
      isActive: true,
    },
  },
  {
    type: 'pneumaticTube',
    props: {
      tubeConfig: 'dlldddrrrrrrruulllddddlllll',
      pos: { x: 1144, y: 327 },
    },
  },
  { type: 'box', props: { pos: { x: 612, y: 366 }, color: '#42c6d2' } },
  { type: 'box', props: { pos: { x: 1129, y: 375 }, color: '#797979' } },
  {
    type: 'conveyorBelt',
    props: {
      moduleNo: 5,
      moveDirection: 1,
      pos: { x: 575, y: 376 },
      isActive: true,
    },
  },
  { type: 'box', props: { pos: { x: 488, y: 385 }, color: '#42c6d2' } },
  { type: 'box', props: { pos: { x: 300, y: 400 }, color: '#42c6d2' } },
  { type: 'box', props: { pos: { x: 1048, y: 420 }, color: '#42c6d2' } },
  { type: 'box', props: { pos: { x: 1354, y: 423 }, color: '#42c6d2' } },
  { type: 'box', props: { pos: { x: 506, y: 426 }, color: '#fff' } },
  {
    type: 'pneumaticTube',
    props: { tubeConfig: 'uldddrr', pos: { x: 488, y: 433 } },
  },
  { type: 'box', props: { pos: { x: 546, y: 446 }, color: '#fff' } },
  { type: 'box', props: { pos: { x: 506, y: 446 }, color: '#fff' } },
  {
    type: 'conveyorBelt',
    props: {
      moduleNo: 6,
      moveDirection: 1,
      pos: { x: 469, y: 456 },
      isActive: true,
    },
  },
  { type: 'box', props: { pos: { x: 196, y: 465 }, color: '#fff' } },
  { type: 'box', props: { pos: { x: 136, y: 465 }, color: '#fff' } },
  { type: 'box', props: { pos: { x: 440, y: 493 }, color: '#797979' } },
  { type: 'box', props: { pos: { x: 217, y: 510 }, color: '#797979' } },
  { type: 'box', props: { pos: { x: 440, y: 512 }, color: '#797979' } },
  { type: 'box', props: { pos: { x: 827, y: 517 }, color: '#797979' } },
  { type: 'box', props: { pos: { x: 1303, y: 519 }, color: '#fff' } },
  { type: 'box', props: { pos: { x: 1363, y: 519 }, color: '#fff' } },
  { type: 'box', props: { pos: { x: 121, y: 519 }, color: '#42c6d2' } },
  { type: 'box', props: { pos: { x: 467, y: 529 }, color: '#42c6d2' } },
  { type: 'box', props: { pos: { x: 485, y: 529 } } },
  { type: 'box', props: { pos: { x: 656, y: 539 }, color: '#797979' } },
  { type: 'box', props: { pos: { x: 636, y: 539 }, color: '#797979' } },
  { type: 'box', props: { pos: { x: 217, y: 555 }, color: '#42c6d2' } },
  { type: 'box', props: { pos: { x: 643, y: 559 }, color: '#797979' } },
  { type: 'box', props: { pos: { x: 800, y: 559 }, color: '#797979' } },
  {
    type: 'pneumaticTube',
    props: { tubeConfig: 'uurrdddlluu', pos: { x: 121, y: 561 } },
  },
  {
    type: 'pneumaticTube',
    props: { tubeConfig: 'urruuuuuuuuurr', pos: { x: 827, y: 565 } },
  },
  { type: 'box', props: { pos: { x: 533, y: 579 }, color: '#797979' } },
  { type: 'box', props: { pos: { x: 649, y: 579 }, color: '#42c6d2' } },
  { type: 'box', props: { pos: { x: 805, y: 579 }, color: '#42c6d2' } },
  { type: 'box', props: { pos: { x: 121, y: 579 }, color: '#42c6d2' } },
  { type: 'box', props: { pos: { x: 531, y: 599 }, color: '#fff' } },
  { type: 'box', props: { pos: { x: 647, y: 599 }, color: '#797979' } },
  { type: 'box', props: { pos: { x: 695, y: 599 }, color: '#797979' } },
  { type: 'box', props: { pos: { x: 739, y: 599 }, color: '#fff' } },
  { type: 'box', props: { pos: { x: 796, y: 599 }, color: '#fff' } },
  { type: 'box', props: { pos: { x: 819, y: 599 }, color: '#797979' } },
  { type: 'box', props: { pos: { x: 142, y: 609 }, color: '#42c6d2' } },
  {
    type: 'conveyorBelt',
    props: {
      moduleNo: 16,
      moveDirection: -1,
      pos: { x: 459, y: 609 },
      isActive: true,
    },
  },
  {
    type: 'conveyorBelt',
    props: {
      moduleNo: 12,
      moveDirection: 1,
      pos: { x: 763, y: 686 },
      isActive: true,
    },
  },
  {
    type: 'pneumaticTube',
    props: { tubeConfig: 'uuuuuuulllluuurr', pos: { x: 315, y: 736 } },
  },
  { type: 'box', props: { pos: { x: 400, y: 754 }, color: '#42c6d2' } },
  { type: 'box', props: { pos: { x: 347, y: 754 }, color: '#42c6d2' } },
  {
    type: 'pneumaticTube',
    props: { tubeConfig: 'uuuuuuuuuuuuurr', pos: { x: 47, y: 765 } },
  },
  { type: 'box', props: { pos: { x: 575, y: 774 }, color: '#42c6d2' } },
  { type: 'box', props: { pos: { x: 535, y: 774 }, color: '#fff' } },
  { type: 'box', props: { pos: { x: 436, y: 774 }, color: '#42c6d2' } },
  { type: 'box', props: { pos: { x: 387, y: 774 }, color: '#fff' } },
  { type: 'box', props: { pos: { x: 331, y: 774 }, color: '#fff' } },
  { type: 'box', props: { pos: { x: 268, y: 774 }, color: '#fff' } },
  { type: 'box', props: { pos: { x: 219, y: 774 }, color: '#797979' } },
  {
    type: 'conveyorBelt',
    props: {
      moduleNo: 68,
      moveDirection: 1,
      pos: { x: 12, y: 784 },
      isActive: true,
    },
  },
])

world.start()