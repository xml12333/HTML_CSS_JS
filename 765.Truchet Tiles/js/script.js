const elementScale = 64;
let elementsPerRow, rows;
let intervals = [];

function updateDimensions() {
    elementsPerRow = Math.floor(window.innerWidth / (elementScale * 0.5)) + 1;
    rows = Math.floor(window.innerHeight / (elementScale * 0.8)) + 1;
}

function getRanInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rotateElement(element, random = true) {
    const direction = random ? (Math.random() < 0.5 ? 1 : -1) : 1;
    const currentRotation = parseInt(element.getAttribute('data-rotation') || '0');
    const newRotation = currentRotation + (90 * direction);
    element.style.transform = `rotate(${newRotation}deg)`;
    element.setAttribute('data-rotation', newRotation);
}

function startIntervals() {
    document.querySelectorAll('.cir').forEach(cir => {
        const intervalId = setInterval(() => rotateElement(cir), getRanInt(1000, 42000));
        intervals.push(intervalId);
    });
}

function clearIntervals() {
    intervals.forEach(clearInterval);
    intervals = [];
}

function createGrid() {
    const cirContainer = document.createElement("div");
    cirContainer.classList.add("cirContainer");
    cirContainer.style.setProperty('--size', `${elementScale}px`);
    document.querySelectorAll('.cirContainer').forEach(row => row.remove());

    updateDimensions();

    for (let i = 0; i < rows; i++) {
        const cirRow = document.createElement("div");
        cirRow.classList.add("cirRow");

        for (let j = 0; j < elementsPerRow; j++) {
            const cir = document.createElement("div");
            cir.classList.add("cir");
            cir.setAttribute("x", j);
            cir.setAttribute("y", i);

            if ( j % 2 == 0 && i % 2 == 0 || j % 2 == 1 && i % 2 == 1 ) { 
                cir.style.rotate = '90deg';
            }
            
            cir.addEventListener('mouseover', () => rotateElement(cir));
            cirRow.appendChild(cir);
        }
        cirContainer.appendChild(cirRow);
    }
    document.body.appendChild(cirContainer);
}

createGrid();
startIntervals();

let alt = 0;
document.body.addEventListener('click', () => {
    if (alt == 0){
        document.querySelectorAll('.cir').forEach((cir, index) => {
            const newRotation = index % 4 === 0 ? 90 : 0;
            cir.style.transform = `rotate(${newRotation}deg)`;
            cir.setAttribute('data-rotation', newRotation);
        });
        alt++;
    } else if (alt == 1){
        document.querySelectorAll('.cir').forEach((cir, index) => {
            const newRotation = index % 2 === 0 ? 90 : 0;
            cir.style.transform = `rotate(${newRotation}deg)`;
            cir.setAttribute('data-rotation', newRotation);
        });
        alt++
    } else if (alt == 2){
        document.querySelectorAll('.cir').forEach((cir, index) => {
            const newRotation = index % 3 === 0 ? 90 : 0;
            cir.style.transform = `rotate(${newRotation}deg)`;
            cir.setAttribute('data-rotation', newRotation);
        });
        alt++
    } else {
        document.querySelectorAll('.cir').forEach(cir => {
            cir.style.transform = 'rotate(0deg)';
            cir.setAttribute('data-rotation', 0);
        });
        alt = 0;
    }
});

document.body.addEventListener('mouseenter', clearIntervals);
document.body.addEventListener('mouseleave', startIntervals);

window.addEventListener('resize', () => {
    clearIntervals();
    createGrid();
    startIntervals();
});