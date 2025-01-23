const canvas = document.createElement('canvas')
const c = canvas.getContext('2d')
canvas.width = innerWidth
canvas.height = innerHeight
document.body.append(canvas)

let bg = 'black'
c.fillStyle = bg
c.fillRect(0, 0, canvas.width, canvas.height)

let down = false
let xys = []
let idx = 0
let branchers = {}

setInterval(() => {
  for (let i in branchers) {
    for (let j in branchers[i]) branchers[i][j]()
  }
}, 16)

function branch(lidx, x, y, ang, a = .4) {
  let rr = Math.random() * 1 + .1
  let vx = Math.cos(ang) * rr
  let vy = Math.sin(ang) * rr
  let af = .002 + Math.random() * .01
  if (Math.random() < .01) af = 1;
  let death = 20 + Math.random() * 20
  if (Math.random() < .002) {
    death = 30 + Math.random() * 70
    a = 1
  }
  let life = 0
  let asf = 0
  const t = () => {
    a -= af
    asf += (a - asf) / 8
    col = `rgba(255, 255, 255, ${asf})`
    ang += Math.random() * .02 - .01
    let vx = Math.cos(ang) * rr
    let vy = Math.sin(ang) * rr
    let wx = Math.random() * 1 - .5
    let wy = Math.random() * 1 - .5
    x += vx
    y += vy
    x += wx
    y += wy
    c.fillStyle = col
    c.fillRect(x, y, 1, 1)
    life++
    if (life > death) {
      if (a > 0) {
        branch(lidx, x, y, ang, a)
        branch(lidx, x, y, ang -
          Math.random() * .8 + .4, asf)
      }
      delete branchers[lidx][t.id]
    }
  }
  t.id = idx
  if (!branchers[lidx]) branchers[lidx] = {}
  branchers[lidx][idx] = t
  idx++
  return t;
}

let lidx = 0
function letter(ps) {
  c.fillStyle = bg
  for (let i = 0; i < ps.length; i += 2) {
    c.fillRect(ps[i] - 3, ps[i + 1] - 3, 6, 6)
  }

  c.strokeStyle = 'white'
  c.beginPath()
  c.moveTo(ps[0], ps[1])
  let branches = []
  for (let i = 2; i < ps.length; i += 2) {
    if (Math.random() < .001) continue
    c.lineTo(ps[i], ps[i + 1])
    const dx = ps[i] - ps[i - 2]
    const dy = ps[i + 1] - ps[i - 1]
    let ang = Math.atan2(dy, dx) + Math.PI / 2
    for (let j = 0; j < 3; j++) {
      if (Math.random() < .5) ang += Math.PI
      branches.push([lidx, ps[i], ps[i + 1], ang])
    }
  }
  c.stroke()
  for (let i = 0; i < branches.length; i++) {
    branch.apply(null, branches[i])
  }
  lidx++
}

onpointerdown = e => {
  down = true
  xys = []
}
onpointermove = e => {
  if (down) {
    c.fillStyle = 'red'
    c.fillRect(e.clientX, e.clientY, 2, 2)
    xys.push(e.clientX, e.clientY)
  }
}
onpointerup = e => {
  down = false
  letter(xys)
  xys = []
}