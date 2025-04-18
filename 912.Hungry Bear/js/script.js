const isNum = x => typeof x === 'number'
const px = n => `${n}px`
const getPagePos = (e, param) =>
e.targetTouches ? e.touches[0][`page${param}`] : e[`page${param}`]
const randomN = n => {
  return Math.round(-n - 0.5 + Math.random() * (2 * n + 1))
}

const wrapper = document.querySelector('.wrapper')

const addEvents = (target, event, action, array) => {
  array.forEach(a => target[`${event}EventListener`](a, action))
}

const mouse = {
  up: (t, e, a) => addEvents(t, e, a, ['mouseup', 'touchend']),
  move: (t, e, a) => addEvents(t, e, a, ['mousemove', 'touchmove']),
  down: (t, e, a) => addEvents(t, e, a, ['mousedown', 'touchstart']),
  enter: (t, e, a) => addEvents(t, e, a, ['mouseenter', 'touchstart']),
  leave: (t, e, a) => addEvents(t, e, a, ['mouseleave', 'touchmove']),
}

class Vector {
  constructor(props) {
    Object.assign(this, {
      x: 0,
      y: 0,
      ...props,
    })
  }
  get magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }
  setLength(length) {
    const angle = Math.atan2(this.y, this.x)
    this.x = Math.cos(angle) * length
    this.y = Math.sin(angle) * length
  }
  setXy(xy) {
    this.x = xy.x
    this.y = xy.y
  }
  addXy(xy) {
    this.x += xy.x
    this.y += xy.y
  }
  subtractXy(xy) {
    this.x -= xy.x
    this.y -= xy.y
  }
  multiplyXy(n) {
    this.x *= n
    this.y *= n
  }
}

class WorldObject {
  constructor(props) {
    Object.assign(this, {
      zOffset: 90,
      moveWithTransform: true,
      x: 0, y: 0,
      offset: { x: null, y: null },
      pos: new Vector({ x: props.x, y: props.y }),
      size: { w: 0, h: 0 },
      maxSize: { w: 0, h: 0 },
      ...props,
    })
    this.addToWorld()
  }
  get rect() {
    const { left, top } = this.el.getBoundingClientRect()
    return {
      left,
      top
    }
  }
  get distPos() {
    const { size: { w, h } } = this
    return {
      x: this.rect.left + (w / 2),
      y: this.rect.top + (h / 2)
    }
  }
  setOffset() {
    const { offset: { x, y } } = this
    if (isNum(this.offset.x) && isNum(this.offset.y)) {
      this.el.style.setProperty('--offset-x', px(x))
      this.el.style.setProperty('--offset-y', px(y))
    }
  }
  setSize(target = this) {
    const { size: { w, h }, maxSize: { w: mW, h: mH } } = target
    this.el.style.setProperty('--w', px(w))
    this.el.style.setProperty('--h', px(h))
    this.el.style.setProperty('--max-w', px(mW))
    this.el.style.setProperty('--max-h', px(mH))
  }
  setStyles() {
    const { pos: { x, y }, z } = this
    Object.assign(this.el.style, {
      left: px(x || 0),
      top: px(y || 0),
    })
    this.el.style.zIndex = z || 0
    this.el.style.transformOrigin = isNum(this.offset.x) & isNum(this.offset.y)
      ? `${this.offset.x}px ${this.offset.y}px`
    : `center`
  }
  distanceBetween(target) {
    return Math.round(
      Math.sqrt(
        Math.pow(target.distPos.x - this.distPos.x, 2) + Math.pow(target.distPos.y - this.distPos.y, 2)
      )
    )
  }
  addToWorld() {
    this.setSize()
    this.setOffset()
    if (!this.noPos) this.setStyles()
    this.container.appendChild(this.el)
  }
}

class Crumbs extends WorldObject {
  constructor(props) {
    super({
      el: Object.assign(document.createElement('div'), { className: `${props.type}-crumbs object` }),
      x: 0, y: 0,
      container: wrapper,
      ...props,
    })
    setTimeout(()=> {
      this.el.remove()
      this.food.crumbs = null 
    }, 1000)
  }
}

class Food extends WorldObject {
  constructor(props) {
    super({
      el: Object.assign(document.createElement('div'), { className: `food ${props.type} object` }),
      x: 0, y: 0,
      grabPos: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
      container: wrapper,
      eatCount: 0,
      eatInterval: null,
      ...props,
    })
    this.addDragEvent()
    this.setPos()
  }
  touchPos(e) {
    return {
      x: getPagePos(e, 'X'),
      y: getPagePos(e, 'Y'),
    }
  }
  addDragEvent() {
    mouse.down(this.el, 'add', this.onGrab)
  }
  drag = (e, x, y) => {
    if (e.type[0] === 'm') e.preventDefault()
    this.grabPos.a.x = this.grabPos.b.x - x
    this.grabPos.a.y = this.grabPos.b.y - y
    this.pos.subtractXy(this.grabPos.a)
    this.setStyles()
  }
  onGrab = e => {
    this.grabPos.b = this.touchPos(e)
    mouse.up(document, 'add', this.onLetGo)
    mouse.move(document, 'add', this.onDrag)
  }
  onDrag = e => {
    const { x, y } = this.touchPos(e)
    if (this.canMove) this.drag(e, x, y)

    this.grabPos.b.x = x
    this.grabPos.b.y = y
  }
  onLetGo = () => {
    mouse.up(document, 'remove', this.onLetGo)
    mouse.move(document, 'remove', this.onDrag)
  }
  eat() {
    if (!this.eatInterval) {
      this.eatInterval = setInterval(()=> {
        if (this.eatCount < 5) {
          this.crumbs = new Crumbs({
            type: this.type,
            size: { w: 0, h: 0 },
            maxSize: { w: 40, h: 40 },
            x: this.distPos.x + randomN(10),
            y: this.pos.y + randomN(10),
            food: this
          })
          this.eatCount++
          this.el.className = `food ${this.type} ${this.type}-eaten-${this.eatCount} object`
        } else {
          this.el.remove()
          this.bear.food = null
          clearInterval(this.eatInterval)
          this.eatInterval = null
          this.bear.el.className = 'bear object grow'
          this.bear.grow()
        }
      }, 500)
    }
  }
  setPos() {
    const { width, height } = wrapper.getBoundingClientRect()
    this.pos.setXy({
      x: width / 2 - 36,
      y: height - (height > 400 ? 200 : 100),
    })
    this.setStyles()
  }
}

class Bear extends WorldObject {
  constructor(props) {
    super({
      ...props,
      canMove: true,
      type: 'bear',
      el: Object.assign(document.createElement('div'), {
        className: 'bear object',
        innerHTML: `
            <div class="ears">
              <div class="inner-ears">
                <div class="ear round"></div>
                <div class="ear round"></div>
              </div>
            </div>
            <div class="face">
              <div class="inner-face">
                <div class="eye"></div>
                <div class="nose"></div>
                <div class="eye"></div>
              </div>
              <div class="cheeks">
                <div class="cheek-wrapper flex-center"></div>
                <div class="mouth-wrapper flex-center"></div>
                <div class="cheek-wrapper flex-center"></div>
              </div>
            </div>
            <div class="limbs">
              <div class="hands">
                <div class="hand"></div>
                <div class="hand flip"></div>
              </div>
              <div class="feet">
                <div class="foot round"></div>
                <div class="foot round"></div>
              </div>
            </div>
          `,
      })
    })

    const cheekWrappers = this.el.querySelectorAll('.cheek-wrapper')
    const mouthWrapper = this.el.querySelector('.mouth-wrapper')

    this.cheeks = [0, 1].map((i)=> new WorldObject({
      el: Object.assign(document.createElement('div'), { className: 'cheek round object' }),
      container: cheekWrappers[i],
      body: this,
      size: { w: 0, h: 0 },
      maxSize: { w: 40, h: 40 },
      noPos: true,
    }))
    this.mouth = new WorldObject({
      el: Object.assign(document.createElement('div'), { className: 'mouth object flex-center' }),
      container: mouthWrapper,
      body: this,
      size: { w: 20, h: 0 },
      maxSize: { w: 40, h: 30 },
      noPos: true,
    })

    mouse.move(document, 'add', () => {
      if (this.food) {
        if (this.mouth.distanceBetween(this.food) < 50) {
          this.el.classList.add('eating')
          wrapper.classList.remove('show-message')
          this.food.eat()
        } else {
          this.el.classList.remove('eating')
          clearInterval(this.food.eatInterval)
          this.food.eatInterval = null
        }
      }
    })

    this.createFood()

    window.addEventListener('resize', ()=> {
      if (this.food) this.food.setPos()
    })
  }
  grow() {
    this.el.className = 'bear object grow'

    setTimeout(()=> {
      this.el.classList.add('cheek-shrink')
      setTimeout(()=> {
        this.el.classList.remove ('cheek-shrink')
        this.createFood()
      }, 1000)
    }, 1000)

    setTimeout(()=> {
      this.size = { ...this.maxSize }
      this.maxSize = {
        w: this.size.w + 20,
        h: this.size.h + 10
      }
      this.el.classList.remove('grow')
      this.setSize()
    }, 1500)
  }
  createFood() {
    this.food = new Food({ 
      type: 'donut', 
      size: { w: 72, h: 54 }, 
      canMove: true, 
      bear: this 
    })
  }
}

new Bear({
  container: wrapper, 
  size: { w: 70, h: 90 },
  maxSize: { w: 90, h: 100 },
  offset: { x: null, y: null },
})