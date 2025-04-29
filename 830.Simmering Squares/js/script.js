const boardSize = 15;
const sqrCount = 60;

const sqrsDiv = document.querySelector('.sqrs');
const sqrs = [];

for (let i = 0 ; i < sqrCount ; i++) {
	setTimeout(() => newSqr(i), i * 60);
}

function newSqr(ix) {
	let sqr;
	
	if (sqrs[ix]) {
		sqr = sqrs[ix];
				
		switch (sqr.a) {
			case 0:
				sqr.y++;
				break;
			case 1:
				sqr.x--;
				break;
			case 2:
				sqr.y--;
				break;
			case 3:
				sqr.x++;
				break;
    	}
		
		if (sqr.x < 0 || sqr.x >= boardSize || sqr.y < 0 || sqr.y >= boardSize) {
			sqr.x = Math.floor(boardSize / 2);
			sqr.y= Math.floor(boardSize / 2);
			sqr.a = Math.floor(Math.random() * 4);
		} else {
			sqr.a = (sqr.a + 3 + Math.floor(Math.random() * 3)) % 4;
		}
		

	} else {
		
		div = document.createElement('div');
		div.className = 'sqr';		
		div.addEventListener("animationend", () => {
			newSqr(ix)
		});
		div.style.setProperty('--hue', ix * 360 / sqrCount);
		div.style.setProperty('--duration', `${Math.floor(Math.random() * 400) + 800}ms`);

		sqr = {
			div: div,
			x: Math.floor(boardSize / 2),
			y: Math.floor(boardSize / 2),
			a: Math.floor(Math.random() * 4)
		}
		
		sqrsDiv.appendChild(div);
		sqrs[ix] = sqr;
	}

	sqr.div.style.setProperty('--x', sqr.x);
	sqr.div.style.setProperty('--y', sqr.y);
	sqr.div.style.setProperty('--a', sqr.a);
	sqr.div.innerHTML = '<div></div>';
}