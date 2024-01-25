const getSize = (px) => window.innerWidth * px

const randomRangeExclusive = (min, max, excludeMin, excludeMax) => {
    let randomNumber
    do {
        randomNumber = Math.floor(Math.random() * (max - min + 1)) + min
    } while (randomNumber >= excludeMin && randomNumber <= excludeMax)
    return randomNumber
}

class Ball {
  constructor(canvas, isBomb = false) {
    this.canvas = canvas
    this.x = Math.random() * this.canvas.width
    this.y = Math.random() * this.canvas.height
    this.velX = randomRangeExclusive(-2, 2, -0.5, 0.5)
    this.velY = randomRangeExclusive(-2, 2, -0.5, 0.5)
    this.color = `hsla(${Math.random() * 200}, 90%, 70%, .7)`
    this.radius = getSize(.01)
    this.isBomb = isBomb
    this.bomb = isBomb
    this.bombTimer = 0
    this.expanding = true
  }

  makeBomb() {
    this.isBomb = true
    this.bomb = true
    this.bombTimer = 0
    this.velX = 0
    this.velY = 0
    this.expanding = true
    score++
    updateScoreDisplay()
  }

  draw(ctx) {
    if (this.radius > 0) {
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
      ctx.fillStyle = this.color
      ctx.fill()
      ctx.closePath()
    }
  }

  checkBombCollision(balls) {
    if (this.isBomb) {
      balls.forEach((ball) => {
        if (ball !== this && !ball.isBomb) {
          const dx = this.x - ball.x
          const dy = this.y - ball.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < this.radius + ball.radius) {
            ball.makeBomb()
          }
        }
      })
    }
  }

  update() {
    if (this.isBomb) {
      this.bombTimer++

      if (this.bombTimer < 60) { // Espandi per 1 secondo (60 frame a 60fps)
        this.radius += (getSize(.05) / 60) // Da 30px a 100px in 1 secondo
      } else if (this.bombTimer < 240) { // Rimani per altri 3 secondi
        // Non fare nulla, resta fermo
      } else if (this.bombTimer < 300) { // Riduci a 0 in 2 secondo
        this.radius -= (100 / 60)
      } else {
        this.radius = 0
        this.isBomb = false
        this.bomb = false
      }
    } else {
      if ((this.x + this.radius) > this.canvas.width || (this.x - this.radius) < 0) {
        this.velX = -this.velX
      }
      if ((this.y + this.radius) > this.canvas.height || (this.y - this.radius) < 0) {
        this.velY = -this.velY
      }
      this.x += this.velX
      this.y += this.velY
    }
  }
}

let score = 0
const maxBalls = 100
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')
document.body.appendChild(canvas)
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const handleResize = () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  balls.forEach((ball) => {
    ball.x = Math.min(ball.x, canvas.width)
    ball.y = Math.min(ball.y, canvas.height)
  })
}
window.addEventListener('resize', handleResize)

const $score = document.getElementById('score')
const updateScoreDisplay = () => {
  $score.textContent = score
}

let clicked = false
let balls = []

const init = () => {
  clicked = false
  balls = []
  score = 0
  updateScoreDisplay()
  for (let i = 0; i < maxBalls; i++) {
    balls.push(new Ball(canvas, false))
  }
}
init()

setTimeout(() => {
  init()
}, 1000)

const loop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.globalCompositeOperation = 'overlay'
  for (let i = 0; i < balls.length; i++) {
    balls[i].checkBombCollision(balls)
  }

  balls = balls.filter((ball) => ball.radius > 0)
  balls.forEach((ball) => {
    ball.draw(ctx)
    ball.update()
  })

  requestAnimationFrame(loop)
}
loop()

canvas.addEventListener('click', (event) => {
  if (clicked) return
  clicked = true
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const bombBall = new Ball(canvas, true)
  bombBall.x = x
  bombBall.y = y
  balls.push(bombBall)
})

const $restart = document.getElementById('restart')
$restart.addEventListener('click', init)