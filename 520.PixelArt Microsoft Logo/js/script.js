const pixelNumber = 400;
const pixelSize = 4;

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }
    return array;
};

const pixelPerRow = Math.sqrt(pixelNumber);

const microsoftLogo = document.querySelector(".microsoft-logo");

const colors = ["red", "green", "blue", "yellow"];
const colorsLength = colors.length;

const particles = [];

for (let i = 0; i < colorsLength; i++) {
    const color = colors[i];
    const slotPos = microsoftLogo
        .querySelector(`div:nth-of-type(${i + 1})`)
        .getBoundingClientRect();

    let row = 0;
    let col = 0;

    for (let j = 0; j < pixelNumber; j++) {
        const div = document.createElement("span");
        div.classList.add(color);
        document.body.appendChild(div);
        particles.push(div);

        let topOffset = row * pixelSize;
        let leftOffset = col * pixelSize;

        div.style.setProperty("--top", `${slotPos.top + topOffset}px`);
        div.style.setProperty("--left", `${slotPos.left + leftOffset}px`);

        if (col + 1 === pixelPerRow) {
            row++;
            col = 0;
        } else {
            col++;
        }
    }
}

const groupSize = 50;
const groupedParticles = [];

const shuffledParticles = shuffleArray(particles);

for (let i = 0; i < shuffledParticles.length; i += groupSize) {
    groupedParticles.push(shuffledParticles.slice(i, i + groupSize));
}

function animate(particles) {
    const delay = 60;
    let currentIndex = 0;

    function animateNextGroup() {
        if (currentIndex >= particles.length) return;

        const group = particles[currentIndex];
        group.forEach((particle) => particle.classList.add("animate"));

        currentIndex++;
        setTimeout(animateNextGroup, delay);
    }

    animateNextGroup();
}

animate(groupedParticles);
