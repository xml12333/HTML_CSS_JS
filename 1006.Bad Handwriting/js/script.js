const seed = 12;
const text = 'Life is full of small moments that shape who we are. Each day brings new chances to learn, connect, and grow. Even simple things like a quiet morning, a kind word, or a shared smile can leave a lasting mark. By paying attention to these moments, we find meaning in the ordinary.';

function seededRandom(seed) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function wrapLetters(str, element, seed = 1) {
  const fonts = [
    'caveat',
    'cedarville-cursive',
    'indie-flower',
    'nothing-you-could-do',
    'oooh-baby',
    'reenie-beanie',
    'shadows-into-light'
  ];

  const blacklist = {
    l: ['cedarville-cursive', 'oooh-baby', 'nothing-you-could-do']
  };

  const lastUsed = {};
  element.innerHTML = '';

  let currentSeed = seed;

  for (const char of str) {
    const lowerChar = char.toLowerCase();
    let availableFonts = fonts;

    if (blacklist[lowerChar]) {
      availableFonts = fonts.filter(f => !blacklist[lowerChar].includes(f));
    }

    if (lastUsed[lowerChar]) {
      availableFonts = availableFonts.filter(f => f !== lastUsed[lowerChar]);
    }

    const fontIndex = Math.floor(seededRandom(currentSeed) * availableFonts.length);
    const font = availableFonts[fontIndex] || fonts[0];
    lastUsed[lowerChar] = font;

    const span = document.createElement('span');
    span.className = font;
    span.textContent = char;
    element.appendChild(span);

    currentSeed++;
  }
}

const p = document.querySelector('p');
wrapLetters(text, p, seed);