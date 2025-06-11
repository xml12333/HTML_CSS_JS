const px = n => `${n}px`
  const randomN = max => Math.ceil(Math.random() * max)

  const elements = {
    inputWrapper: document.querySelector('.input-wrapper'),
    textInput: document.querySelector('.text-input'),
    messageWrapper: document.querySelector('.message-wrapper'),
    sendButton: document.querySelector('.send'),
  }
  class WorldObject {
    constructor(props) {
      Object.assign(this, {
        w: 'auto',
        h: 'auto',
        pos: { x: props.x || 0, y: props.y || 0 },
        grabPos: { prev: { x: 0, y: 0 }, now: { x: 0, y: 0 } },
        ...props,
      })
      if (props.add) this.addToWorld()
    }
    setStyles() {
      const {
        el,
        pos: { x, y },
        w,
        h,
        z,
      } = this
      Object.assign(el.style, {
        width: !isNaN(w) ? px(w) : w,
        height: !isNaN(h) ? px(h) : h,
        zIndex: !isNaN(z) ? z : y || 0,
      })
      if (this.moveWithTransform) {
        el.style.transform = `translate(${px(x || 0)}, ${px(y || 0)})`
      } else {
        Object.assign(el.style, {
          left: px(x || 0),
          top: px(y || 0),
        })
      }
    }
    addToWorld() {
      this.container.appendChild(this.el)
      this.setStyles()
    }
  }

  class Message extends WorldObject {
    constructor(props) {
      super({
        w: '100%',
        container: elements.messageWrapper,
        text: '',
        ...props,
      })
      this.el = Object.assign(document.createElement('div'), {
        className: `${this.isYou ? '' : 'reverse'} message`,
        innerHTML: this.isYou ? this.messageContent : this.typingMessage,
      })
      this.addToWorld()

      if (!this.isYou) {
        setTimeout(() => {
          this.el.innerHTML = this.messageContent
        }, 300 + randomN(5) * 500)
      }
    }
    get isYou() {
      return this.name === 'white'
    }
    get messageContent() {
      return `
          <div class="speech-bubble">${this.displayTextGradual(this.meow)}</div>
          <div class="icon cat ${this.name}"></div>
        `
    }
    get typingMessage() {
      return `
          <div class="typing-message">${this.name} is typing<span class="pulse">...</span></div>
        `
    }
    get meow() {
      return this.text
        ? this.text
            .split(' ')
            .map(t => {
                 return (
                'meow' +
                (t.includes('!') ? '!' : '') +
                (t.includes('?') ? '?' : '')
              )
            })
            .join(' ')
        : new Array(randomN(4)).fill('meow').join(' ') +
            (randomN(3) % 3 === 0 ? '!' : '')
    }
    displayTextGradual(text, delay = 0.01, offset = 0) {
      if (!text) return
      return [...text].reduce(
        (acc, l, i) =>
          (acc +=
            l === '§'
              ? '<br />'
              : `<span style="animation-delay: ${((i + offset) * delay).toFixed(
                  3
                )}s">${l}</span>`),
        ''
      )
    }
    remove() {
      this.el.remove()
      this.actor.bubble = null
    }
  }

  const setCatsToTalk = arr => {
    ;['sleepy', 'choco', 'biscuit'].forEach(cat => {
      if (randomN(2) % 2 === 0) arr.push(cat)
    })
  }

  const triggerCatTalk = () => {
    const catsToTalk = []

    while (!catsToTalk.length) setCatsToTalk(catsToTalk)
    catsToTalk.forEach(cat => {
      setTimeout(() => {
        new Message({
          text: elements.textInput.value,
          name: cat,
        })
      }, 200 + randomN(4) * 500)
    })
  }

  setTimeout(() => {
    elements.messageWrapper.appendChild(
      Object.assign(document.createElement('div'), {
        className: 'update',
        innerHTML: `- you and 3 other cats entered the chat -`,
      })
    )
    triggerCatTalk()
  }, 1000)

  const sendMessage = () => {
    if (!elements.textInput.value) return

    elements.inputWrapper.classList.add('load')
    setTimeout(() => {
      elements.inputWrapper.classList.remove('load')
      new Message({
        text: elements.textInput.value,
        name: 'white',
      })
      elements.textInput.value = ''
      setTimeout(() => {
        triggerCatTalk()
      }, randomN(4) * 300)
    }, 1300)
  }

  elements.sendButton.addEventListener('click', sendMessage)

  window.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage()
  })