console.clear();

const letters = {
  a: [0, 1],
  b: [4, 2],
  c: [2, 2],
  d: [2, 1],
  e: [2, 0],
  f: [3, 1],
  g: [4, 1],
  h: [5, 1],
  i: [7, 0],
  j: [6, 1],
  k: [7, 1],
  l: [8, 1],
  m: [6, 2],
  n: [5, 2],
  o: [8, 0],
  p: [9, 0],
  q: [0, 0],
  r: [3, 0],
  s: [1, 1],
  t: [4, 0],
  u: [6, 0],
  v: [3, 2],
  w: [1, 0],
  x: [1, 2],
  y: [5, 0],
  z: [0, 2]
};

const keys = document.querySelector(".keys");
const q = keys.querySelector('[letter="q"]');

const input = document.querySelector("input");
const button = document.querySelector("button");
const stepText = document.querySelector(".currentStep");

button.addEventListener("click", setNewWord);

let runPath = [];
function setNewWord() {
  q.classList.remove("light");
  runPath = remoteControl(input.value).split(", ");
  nextStep(0, 0);
}

function nextStep(x, y) {
  if (runPath.length > 0) {
    switch (runPath[0]) {
      case "up":
        y--;
        break;

      case "down":
        y++;
        break;

      case "left":
        x--;
        break;

      case "right":
        x++;
        break;
    }

    const key = keys.querySelector(`.key:nth-child(${10 * y + x + 1})`);
    key.classList.add(runPath[0] === "select" ? "select" : "light");

    if (runPath[0] === "select") {
      stepText.innerText = `Select (${key
        .getAttribute("letter")
        .toUpperCase()})`;
      stepText.classList.add("select");
    } else {
      stepText.innerText =
        runPath[0].charAt(0).toUpperCase() + runPath[0].slice(1);
      stepText.classList.remove("select");
      stepText.classList.add("light");
      setTimeout(() => {
        stepText.classList.remove("light");
      }, 50);
    }

    runPath.shift();

    setTimeout(() => {
      key.classList.remove("select");
      key.classList.remove("light");
      nextStep(x, y);
    }, 250);
  } else {
    stepText.innerText = input.value.toLowerCase().replace(/[^a-z]+/g, "");
    setTimeout(() => {
      q.classList.add("light");
      stepText.innerText = "";
    }, 500);
  }
}

const {
  core: { describe, it, expect, run },
  prettify
} = window.jestLite;

function remoteControl(word) {

  let currentXY = letters["q"];
  const wordArray = word
    .toLowerCase()
    .replace(/[^a-z]+/g, "")
    .split("");
  const path = [];

  wordArray.forEach((letter) => {
    const nextXY = letters[letter];
    for (let i = currentXY[1]; i < nextXY[1]; i++) {
      path.push("down");
    }
    for (let i = nextXY[1]; i < currentXY[1]; i++) {
      path.push("up");
    }
    for (let i = currentXY[0]; i < nextXY[0]; i++) {
      path.push("right");
    }
    for (let i = nextXY[0]; i < currentXY[0]; i++) {
      path.push("left");
    }
    path.push("select");
    currentXY = nextXY;
  });

  return path.join(", ");
}

// This week's default test suite includes only one possible button path for each tested word. In these paths, when the next letter is on another row the directions move up or down first, before moving left or right. Could you create a test suite that can validate different paths through the keys?

describe("remoteControl", (word) => {
  it("checks if ", () => {
    expect(remoteControl("car")).toBe(
      "down, down, right, right, select, up, left, left, select, up, right, right, right, select"
    );
    expect(remoteControl("queen")).toBe(
      "select, right, right, right, right, right, right, select, left, left, left, left, select, select, down, down, right, right, right, select"
    );
    expect(remoteControl("code")).toBe(
      "down, down, right, right, select, up, up, right, right, right, right, right, right, select, down, left, left, left, left, left, left, select, up, select"
    );
  });
});

prettify.toHTML(run(), document.body);
