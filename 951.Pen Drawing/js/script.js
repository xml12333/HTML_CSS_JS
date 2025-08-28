const c = document.querySelector('#c')
const ctx = c.getContext('2d')

const dpr = Math.min(2, window.devicePixelRatio)

c.style.imageRendering = 'pixelated'
c.style.width = '100vw'
c.style.height = '100vh'

let prevTime = 0

const setup = () => {
  c.width = window.innerWidth * dpr
  c.height = window.innerHeight * dpr
}

function getPos(index, wireSpacing = 1) {
    if (index === 0) return [0, 0]; // Центральная проволока

    // Определяем уровень (слой) и позицию внутри уровня
    let level = 1;
    let wiresInLevel = 6;
    let totalWires = 1; // Центральная проволока

    while (index >= totalWires + wiresInLevel) {
        totalWires += wiresInLevel;
        wiresInLevel += 6; // Каждый новый уровень +6 проволок
        level++;
    }

    // Угол поворота для текущей проволоки
    const positionInLevel = index - totalWires;
    const angle = (positionInLevel / wiresInLevel) * Math.PI * 2;

    // Координаты (с учетом расстояния между проволоками)
    const radius = level * wireSpacing;
    return [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
    ];
}

const animate = (time) => {
  requestAnimationFrame(animate)
  const delta = time - prevTime
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.01)'
  ctx.fillRect(0, 0, c.width, c.height)
  
  const cx = c.width / 2
  const cy = c.height / 2
  const t = performance.now() * 0.001
  
  const count = 100
  ctx.fillStyle = 'black'
  const radius = 50
  const diameter = radius * 2
  
  for (let i = 0; i < count; i++) {
    const [x, y] = getPos(i)
    
    const angle1 = i * 17 - t * 0.5
    const angle2 = Math.sin(i * 13 + t)
    
    ctx.beginPath()
    ctx.arc(
      (Math.sin(angle1) * 100) 
      + cx + x * diameter 
      + Math.cos(angle2) * 100
      ,
      (Math.cos(angle1) * 100) 
      + cy + y * diameter 
      + Math.sin(angle2) * 100
      ,
      radius * (Math.cos(0.05 * t + i) * 0.5 + 0.5) * 0.1,
      0,
      Math.PI * 2
    )
    
    ctx.fill()
  }
  
  prevTime = time 
}

window.addEventListener('resize', () => {
  setup()
})

setup()

requestAnimationFrame(animate);