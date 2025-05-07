const BALLSIZE = 42;
const IMPECTRADIUS = 210;

const balls = [];
const ballsDiv = document.querySelector('.balls');
const shadowsDiv = document.querySelector('.shadows');
const facesDiv = document.querySelector('.faces');
const baseLight = document.querySelector('.baseLight');

document.body.style.setProperty('--ball-size', `${BALLSIZE}px`);
for (let x = -7; x < 8; x = x + 2 ) {
  for (let y = -5; y < 6; y = y + 2) {
    createBall(x, y);
  }
}

function createBall(x, y) {
    const ball = {
        div: document.createElement('div'),
        shadow: document.createElement('div'),
        x: x * BALLSIZE,
        y: y * BALLSIZE,
    };
    ball.div.classList.add('ball');
    ball.div.style.left = `${ball.x - BALLSIZE / 2}px`;
    ball.div.style.top = `${ball.y - BALLSIZE / 2}px`;
    ball.div.style.setProperty('--hue', (x + y) * 3);

    ball.shadow.classList.add('shadow');
    ball.shadow.style.left = `${ball.x}px`;
    ball.shadow.style.top = `${ball.y - BALLSIZE / 2}px`;
    
    ballsDiv.appendChild(ball.div);
    shadowsDiv.appendChild(ball.shadow);

    balls.push(ball);
}

window.addEventListener('mousemove', (e) => {

    const mx = e.clientX - (window.innerWidth / 2);
    const my = e.clientY - (window.innerHeight / 2);

    baseLight.style.transform = `translate(${mx}px, ${my}px)`;

    balls.forEach((ball) => {
        const dx = ball.x - mx;
        const dy = ball.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < IMPECTRADIUS) {
            const distFactor = (IMPECTRADIUS - Math.min(dist, IMPECTRADIUS)) / IMPECTRADIUS;
            const angle = Math.atan2(dy, dx);

            ball.div.style.setProperty('--dist-factor', distFactor);
            ball.div.style.setProperty('--angle', angle);

            ball.shadow.style.setProperty('--dist-factor', distFactor);
            ball.shadow.style.setProperty('--angle', angle);
        }
    });
});