function getRandomEquation(target) {
	  const operations = ['+', '-', '*', '/'];
	  let a, b, op, result;

	  // Try up to 20 times to generate a valid expression
	  for (let i = 0; i < 20; i++) {
		op = operations[Math.floor(Math.random() * operations.length)];
		switch (op) {
		  case '+':
			a = Math.floor(Math.random() * target);
			b = target - a;
			result = a + b;
			break;
		  case '-':
			a = Math.floor(Math.random() * 60) + target;
			b = a - target;
			result = a - b;
			break;
		  case '*':
			b = Math.floor(Math.random() * 10) + 1;
			a = Math.floor(target / b);
			result = a * b;
			if (result !== target) continue;
			break;
		  case '/':
			b = Math.floor(Math.random() * 10) + 1;
			a = target * b;
			result = a / b;
			break;
		}

		if (result === target) {
		  return `${a} ${op} ${b}`;
		}
	  }

	  return `${target}`; // fallback
	}

	function updateClock() {
	  const now = new Date();
	  const h = now.getHours();
	  const m = now.getMinutes();
	  const s = now.getSeconds();

	  document.getElementById('hour').innerHTML = `<div>${getRandomEquation(h)}</div><div class='label'>Hour (${h})</div>`;
	  document.getElementById('minute').innerHTML = `<div>${getRandomEquation(m)}</div><div class='label'>Minute (${m})</div>`;
	  document.getElementById('second').innerHTML = `<div>${getRandomEquation(s)}</div><div class='label'>Second (${s})</div>`;
	}

	setInterval(updateClock, 1000);
	updateClock();