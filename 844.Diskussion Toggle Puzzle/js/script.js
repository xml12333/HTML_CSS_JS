const circles = document.querySelectorAll('.circle');
const arrows = document.querySelectorAll('.arrow');
let clickAllowed = true;

function handleClick(index, direction, force = false) {
    if (!clickAllowed && !force) return;
    if (!force) {
        clickAllowed = false;
        setTimeout(() => clickAllowed = true, 1000);
    }
    if (direction === 'left') {
        circles[index].dataset.pos++;
        circles[index].querySelectorAll('div').forEach(node => {
            node.dataset.static = (Number(node.dataset.static) - 1 + 6) % 6;
        });
    } else {
        circles[index].dataset.pos--;
        circles[index].querySelectorAll('div').forEach(node => {
            node.dataset.static = (Number(node.dataset.static) + 1) % 6;
        });
    }
    circles[index].style.rotate = `${ -60 * circles[index].dataset.pos }deg`;
    clockwiseUpCheck();
}

arrows.forEach((arrow, i) => {
    const leftArrow = arrow.querySelector('.left');
    const rightArrow = arrow.querySelector('.right');
    leftArrow.addEventListener('click', () => handleClick(i, 'left'));
    rightArrow.addEventListener('click', () => handleClick(i, 'right'));
});

function checkTransfer(fro, tow){
    let [froLet, froStatic] = [fro[0], fro[1]];
    let [towLet, towStatic] = [tow[0], tow[1]];
    let froEle = document.querySelector(`.circle#${froLet} [data-static="${froStatic}"]`);
    let towEle = document.querySelector(`.circle#${towLet} [data-static="${towStatic}"]`);
    if (froEle.dataset.cur != "" && towEle.dataset.cur == "") {
        towEle.dataset.cur = froEle.dataset.cur;
        froEle.dataset.cur = '';
    }
}

function clockwiseUpCheck(){
    setTimeout(() => {
        checkTransfer('A5', 'B0');
        checkTransfer('B4', 'C0');
        checkTransfer('C5', 'D0');
        checkTransfer('D4', 'A0');
        checkTransfer('B5', 'D5');
        checkSolution();
    }, 1000);
}

function shuffle(times = 10, delay = 10) {
    let count = 0;
    const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * arrows.length);
        const randomDir = Math.random() > 0.5 ? 'left' : 'right';
        handleClick(randomIndex, randomDir, true);
        count++;
        if (count >= times) {
            clearInterval(interval);
        }
    }, delay);
}

const shuffleBtn = document.querySelector('.shuffle');
shuffleBtn.addEventListener('click', () => shuffle(800) );

const checkVis = document.querySelector('.solved');
function checkSolution(){
    let check = true;
    circles.forEach(circle => {
        let contents = circle.querySelectorAll('div[data-cur]');
        contents.forEach(content => {
            if( content.dataset.cur !== "" && circle.id.toLowerCase() !== content.dataset.cur ) {
                check = false;
            }
        });
    });
    checkVis.innerHTML = check ? "SOLVED" : "UNSOLVED";
    if (check) { 
        checkVis.classList.add('true');
    } else {
        checkVis.classList.remove('true'); 
    }
}