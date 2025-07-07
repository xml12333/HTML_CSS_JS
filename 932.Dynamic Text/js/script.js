const mouseFollower = document.querySelector(".mouse-follower");
let mouseX = 0,
  mouseY = 0;
let followerX = 0,
  followerY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function updateMouseFollower() {
  followerX += (mouseX - followerX) * 0.1;
  followerY += (mouseY - followerY) * 0.1;

  mouseFollower.style.left = followerX - 10 + "px";
  mouseFollower.style.top = followerY - 10 + "px";

  requestAnimationFrame(updateMouseFollower);
}
updateMouseFollower();

function createParticle() {
  const particle = document.createElement("div");
  particle.className = "particle";
  particle.style.left = Math.random() * window.innerWidth + "px";
  particle.style.animationDelay = Math.random() * 2 + "s";
  particle.style.animationDuration = Math.random() * 4 + 4 + "s";
  document.body.appendChild(particle);

  setTimeout(() => {
    particle.remove();
  }, 8000);
}

setInterval(createParticle, 1000);

class MagneticWords {
  constructor() {
    this.mouseX = 0;
    this.mouseY = 0;
    this.words = [];
    this.magneticRadius = 120;
    this.magneticStrength = 0.4;
    this.smoothing = 0.15;

    this.init();
  }

  init() {
    document.addEventListener("mousemove", (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.updateWords();
    });

    document.addEventListener("mouseleave", () => {
      this.resetWords();
    });

    this.updateWordsList();

    setInterval(() => this.updateWordsList(), 2000);
  }

  updateWordsList() {
    this.words = Array.from(document.querySelectorAll(".word")).map((word) => ({
      element: word,
      originalTransform: "",
      bounds: null,
      currentX: 0,
      currentY: 0,
      targetX: 0,
      targetY: 0,
    }));
  }

  updateWords() {
    this.words.forEach((wordData) => {
      const word = wordData.element;
      const rect = word.getBoundingClientRect();
      const wordCenterX = rect.left + rect.width / 2;
      const wordCenterY = rect.top + rect.height / 2;

      const deltaX = this.mouseX - wordCenterX;
      const deltaY = this.mouseY - wordCenterY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < this.magneticRadius) {
        const force = (this.magneticRadius - distance) / this.magneticRadius;
        wordData.targetX = deltaX * force * this.magneticStrength;
        wordData.targetY = deltaY * force * this.magneticStrength;

        word.classList.add("magnetic");
        word.style.zIndex = Math.floor(force * 100);
      } else {
        wordData.targetX = 0;
        wordData.targetY = 0;
        word.classList.remove("magnetic");
        word.style.zIndex = "";
      }

      wordData.currentX +=
        (wordData.targetX - wordData.currentX) * this.smoothing;
      wordData.currentY +=
        (wordData.targetY - wordData.currentY) * this.smoothing;

      if (distance > this.magneticRadius * 1.2) {
        word.classList.remove("magnetic");
        word.style.removeProperty("--hover-opacity");
      }

      const currentTransform = word.style.transform || "";
      const waveMatch = currentTransform.match(/translateX\([^)]+\)/);
      const waveTransform = waveMatch ? waveMatch[0] : "";

      const magneticDistance = Math.sqrt(
        wordData.currentX * wordData.currentX +
          wordData.currentY * wordData.currentY
      );
      const scale = 1 + (magneticDistance / 100) * 0.1;

      word.style.transform = `${waveTransform} translate(${wordData.currentX}px, ${wordData.currentY}px) scale(${scale})`;
    });
  }

  resetWords() {
    this.words.forEach((wordData) => {
      const word = wordData.element;
      word.classList.remove("magnetic");
      wordData.currentX = 0;
      wordData.currentY = 0;
      wordData.targetX = 0;
      wordData.targetY = 0;

      const currentTransform = word.style.transform || "";
      const waveMatch = currentTransform.match(/translateX\([^)]+\)/);
      const waveTransform = waveMatch ? waveMatch[0] : "";

      word.style.transform = waveTransform;
      word.style.zIndex = "";

      word.style.removeProperty("--hover-opacity");
      word.blur();
    });
  }
}

const magneticWords = new MagneticWords();

class EffectManager {
  constructor() {
    this.currentEffect = "zigzag";
    this.previousEffect = "zigzag";
    this.intensity = 15;
    this.columns = [];
    this.time = 0;
    this.transitionProgress = 1.0;
    this.transitionDuration = 800;
    this.transitionStartTime = 0;

    this.init();
  }

  init() {
    this.bindControls();
    this.startTime();
    this.updateColumnLayout();
  }

  bindControls() {
    document.querySelectorAll(".effect-number").forEach((button) => {
      button.addEventListener("click", () => {
        this.setEffect(button.dataset.effect);
        this.updateActiveButton(button);
      });
    });

    document.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      let effect = null;

      if (key === "1") {
        effect = "zigzag";
      } else if (key === "2") {
        effect = "orbital";
      } else if (key === "3") {
        effect = "spiral";
      } else if (key === "g") {
        effect = "glitch";
      }

      if (effect) {
        this.setEffect(effect);
        const button = document.querySelector(`[data-effect="${effect}"]`);
        this.updateActiveButton(button);
      }
    });

    const slider = document.getElementById("intensity-slider");
    const valueDisplay = document.getElementById("intensity-value");

    slider.addEventListener("input", (e) => {
      this.intensity = parseInt(e.target.value);
      valueDisplay.textContent = this.intensity;
    });
  }

  updateActiveButton(activeButton) {
    document.querySelectorAll(".effect-number").forEach((btn) => {
      btn.classList.remove("active");
    });
    if (activeButton) {
      activeButton.classList.add("active");
    }
  }

  setEffect(effect) {
    if (effect !== this.currentEffect) {
      this.previousEffect = this.currentEffect;
      this.currentEffect = effect;
      this.transitionProgress = 0.0;
      this.transitionStartTime = this.time;

      this.updateColumnLayout();
    }
  }

  updateColumnLayout() {
    const container = document.querySelector(".container");

    if (this.currentEffect === "spiral") {
      container.classList.add("single-column");
    } else {
      container.classList.remove("single-column");
    }
  }

  addColumn(column) {
    this.columns.push(column);
  }

  startTime() {
    const updateTime = () => {
      this.time += 16;

      if (this.transitionProgress < 1.0) {
        const elapsed = this.time - this.transitionStartTime;
        this.transitionProgress = Math.min(
          1.0,
          elapsed / this.transitionDuration
        );

        this.transitionProgress = this.easeInOutCubic(this.transitionProgress);
      }

      requestAnimationFrame(updateTime);
    };
    updateTime();
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  getEffectCurve(effect, y, t, isReverse = false, delta = 0) {
    const intensity = this.intensity + Math.abs(delta) * 0.08;
    t = t * 0.0005;

    switch (effect) {
      case "spiral":
        const spiralRadius = y * intensity * 0.5;
        const spiralAngle = y * Math.PI * 4 + t;
        return Math.cos(spiralAngle) * spiralRadius;

      case "zigzag":
        const zigzagPhase = (y * 8 + t * 0.01) % 2;
        return (
          (zigzagPhase < 1 ? zigzagPhase : 2 - zigzagPhase) * intensity * 2 -
          intensity
        );

      case "orbital":
        const orbitRadius = intensity * 0.8;
        const orbitSpeed = t * 0.002 + y * Math.PI * 2;
        return Math.cos(orbitSpeed) * orbitRadius * Math.sin(y * Math.PI);

      case "glitch":
        const glitchFreq = t * 0.006;
        const randomOffset = (Math.random() - 0.5) * intensity * 0.2;
        const digitalNoise =
          Math.sin(y * Math.PI * 25 + glitchFreq) * intensity * 0.3;
        const digitalNoise2 =
          Math.cos(y * Math.PI * 15 + glitchFreq * 1.2) * intensity * 0.15;
        const jumpEffect =
          Math.floor(glitchFreq * 6) % 8 === 0 ? intensity * 1 : 0;
        const microGlitch =
          Math.sin(y * Math.PI * 60 + glitchFreq * 2.5) * intensity * 0.08;
        return (
          digitalNoise + digitalNoise2 + randomOffset + jumpEffect + microGlitch
        );

      default:
        return Math.sin(y * Math.PI * 2 + t) * intensity;
    }
  }

  getCurve(y, t, isReverse = false, delta = 0) {
    if (this.transitionProgress >= 1.0) {
      return this.getEffectCurve(this.currentEffect, y, t, isReverse, delta);
    } else {
      const previousCurve = this.getEffectCurve(
        this.previousEffect,
        y,
        t,
        isReverse,
        delta
      );
      const currentCurve = this.getEffectCurve(
        this.currentEffect,
        y,
        t,
        isReverse,
        delta
      );

      return (
        previousCurve * (1 - this.transitionProgress) +
        currentCurve * this.transitionProgress
      );
    }
  }
}

const effectManager = new EffectManager();

document.addEventListener("mousemove", (e) => {
  window.mouseY = e.clientY;
});

const Utils = {
  lineBreak: function (text, max, container) {
    const getTotalWidth = (el) =>
      Array.from(el.children).reduce(
        (acc, child) => acc + child.getBoundingClientRect().width,
        0
      );

    const createNewLine = () => {
      const line = document.createElement("span");
      line.classList.add("line");
      return line;
    };

    const words = text.split(/\s/).map((w, i) => {
      const span = document.createElement("span");
      span.classList.add("word");

      const specialWords = [
        "universe",
        "quantum",
        "consciousness",
        "artificial",
        "intelligence",
        "mystery",
        "gravity",
        "time",
        "space",
      ];
      if (
        specialWords.some((special) =>
          w.toLowerCase().includes(special.toLowerCase())
        )
      ) {
        span.classList.add("special");
      }

      span.innerHTML = (i > 0 ? " " : "") + w;
      return span;
    });

    container.innerHTML = "";
    words.forEach((word) => container.appendChild(word));

    const adjustedMax = max - 40;

    if (getTotalWidth(container) > adjustedMax) {
      container.innerHTML = "";
      let currentLine = createNewLine();
      container.appendChild(currentLine);

      words.forEach((word) => {
        currentLine.appendChild(word);
        if (getTotalWidth(currentLine) > adjustedMax) {
          currentLine.removeChild(word);
          currentLine = createNewLine();
          currentLine.appendChild(word);
          container.appendChild(currentLine);
        }
      });
    } else {
      const line = createNewLine();
      words.forEach((word) => line.appendChild(word));
      container.innerHTML = "";
      container.appendChild(line);
    }

    Array.from(container.querySelectorAll(".line")).forEach((line) => {
      if (line.innerText.trim()) {
        line.innerHTML = `<span class="text">${line.innerHTML}</span>`;
      } else {
        line.remove();
      }
    });
  },

  getStyleNumber: function (el, property) {
    return Number(getComputedStyle(el)[property].replace("px", ""));
  },
};

class SmartText {
  constructor(options) {
    this.el = options.el;
    this.text = this.el.innerText;
    this.init();
  }

  init() {
    this.applyLineBreaks();
  }

  applyLineBreaks() {
    const parentWidth = this.el.parentElement?.clientWidth ?? window.innerWidth;
    const maxWidth = Math.min(parentWidth * 0.9, parentWidth - 60);
    Utils.lineBreak(this.text, maxWidth, this.el);
  }
}

class Column {
  constructor(options) {
    this.el = options.el;
    this.reverse = options.reverse || false;

    this.scroll = {
      ease: 0.05,
      current: 0,
      target: 0,
      last: 0,
    };

    this.touch = { prev: 0, start: 0 };
    this.speed = { t: 1, c: 1 };
    this.defaultSpeed = 0.5;
    this.target = 0;
    this.height = 0;
    this.direction = "";

    this.content = this.el.querySelector(".column-content");
    this.paragraphs = Array.from(this.content.querySelectorAll("p"));

    this.init();
  }

  init() {
    this.bindEvents();
    this.resize();
    this.render();
  }

  bindEvents() {
    window.addEventListener("resize", () => this.resize());
    window.addEventListener("wheel", (e) => this.wheel(e));
    document.addEventListener("touchstart", (e) => this.touchstart(e));
    document.addEventListener("touchmove", (e) => this.touchmove(e));
    document.addEventListener("touchend", (e) => this.touchend(e));
  }

  wheel(e) {
    let delta = e.wheelDeltaY || -1 * e.deltaY;
    delta *= 0.5;
    this.scroll.target += -delta;
  }

  touchstart(e) {
    this.touch.prev = this.scroll.current;
    this.touch.start = e.touches[0].clientY;
  }

  touchend(e) {
    this.target = 0;
  }

  touchmove(e) {
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const distance = (this.touch.start - y) * 2;
    this.scroll.target = this.touch.prev + distance;
  }

  splitText() {
    this.splits = [];
    const paragraphs = Array.from(this.content.querySelectorAll("p"));

    paragraphs.forEach((item, index) => {
      item.classList.add("smart-text");
      if (Math.random() > 0.7) {
        item.classList.add("drop-cap");
      }
      this.splits.push(new SmartText({ el: item }));
    });
  }

  updateChilds() {
    const h = this.content.scrollHeight;
    const ratio = h / this.winH;

    if (ratio < 3) {
      const copies = Math.min(Math.ceil((3 * this.winH) / h), 5);
      for (let i = 0; i < copies; i++) {
        Array.from(this.content.children).forEach((item) => {
          const clone = item.cloneNode(true);
          this.content.appendChild(clone);
        });
      }
    }
  }

  resize() {
    this.winW = window.innerWidth;
    this.winH = window.innerHeight;

    this.content.innerHTML = "";
    this.paragraphs.forEach((item) => {
      const clone = item.cloneNode(true);
      this.content.appendChild(clone);
    });

    this.splitText();
    this.updateChilds();

    this.scroll.target = 0;
    this.scroll.current = 0;
    this.speed.t = 0;
    this.speed.c = 0;
    this.paused = true;

    this.el.classList.add("no-transform");

    this.items = Array.from(this.content.children).map((item, i) => {
      const data = { el: item };
      data.width = data.el.clientWidth;
      data.height = data.el.clientHeight;
      data.left = data.el.offsetLeft;
      data.top = data.el.offsetTop;
      data.bounds = data.el.getBoundingClientRect();
      data.y = 0;
      data.extra = 0;

      data.lines = Array.from(data.el.querySelectorAll(".line")).map(
        (line, j) => {
          return {
            el: line,
            height: line.clientHeight,
            top: line.offsetTop,
            bounds: line.getBoundingClientRect(),
          };
        }
      );

      return data;
    });

    this.height = this.content.scrollHeight;
    this.speed.t = this.defaultSpeed;
    this.el.classList.remove("no-transform");
    this.paused = false;
  }

  curve(y, t = 0) {
    return effectManager.getCurve(y, t, this.reverse, this.delta);
  }

  updateElements(scroll, t) {
    if (this.items && this.items.length > 0) {
      const isReverse = this.reverse;

      this.items.forEach((item, j) => {
        item.isBefore = item.y + item.bounds.top > this.winH;
        item.isAfter = item.y + item.bounds.top + item.bounds.height < 0;

        if (!isReverse) {
          if (this.direction === "up" && item.isBefore) {
            item.extra -= this.height;
            item.isBefore = false;
            item.isAfter = false;
          }
          if (this.direction === "down" && item.isAfter) {
            item.extra += this.height;
            item.isBefore = false;
            item.isAfter = false;
          }
          item.y = -scroll + item.extra;
        } else {
          if (this.direction === "down" && item.isBefore) {
            item.extra -= this.height;
            item.isBefore = false;
            item.isAfter = false;
          }
          if (this.direction === "up" && item.isAfter) {
            item.extra += this.height;
            item.isBefore = false;
            item.isAfter = false;
          }
          item.y = scroll + item.extra;
        }

        item.lines.forEach((line, k) => {
          const posY = line.top + item.y;
          const progress = Math.min(Math.max(0, posY / this.winH), 1);
          const x = this.curve(progress, t);

          let additionalTransform = "";

          const applyEffectTransform = (effect, intensity) => {
            if (effect === "3d") {
              const depth =
                Math.sin(progress * Math.PI * 2 + t * 0.0005) * 0.5 + 0.5;
              const scale = 0.8 + depth * 0.4 * intensity;
              const perspective = depth * 50 * intensity;
              return ` scale(${scale}) translateZ(${perspective}px)`;
            } else if (effect === "spiral") {
              const rotation = progress * 360 + t * 0.05;
              return ` rotate(${rotation * intensity}deg)`;
            } else if (effect === "orbital") {
              const orbitY =
                Math.sin(t * 0.002 + progress * Math.PI * 2) * 10 * intensity;
              return ` translateY(${orbitY}px)`;
            } else if (effect === "glitch") {
              const glitchScale = 1 + (Math.random() - 0.5) * 0.03 * intensity;
              const glitchRotate = (Math.random() - 0.5) * intensity * 0.2;
              const glitchSkew = (Math.random() - 0.5) * intensity * 0.15;
              return ` scale(${glitchScale}) rotate(${glitchRotate}deg) skew(${glitchSkew}deg)`;
            }
            return "";
          };

          if (effectManager.transitionProgress >= 1.0) {
            additionalTransform = applyEffectTransform(
              effectManager.currentEffect,
              1.0
            );
          } else {
            const prevTransform = applyEffectTransform(
              effectManager.previousEffect,
              1 - effectManager.transitionProgress
            );
            const currTransform = applyEffectTransform(
              effectManager.currentEffect,
              effectManager.transitionProgress
            );
            additionalTransform = prevTransform + currTransform;
          }

          if (
            effectManager.currentEffect === "glitch" ||
            (effectManager.transitionProgress < 1.0 &&
              (effectManager.currentEffect === "glitch" ||
                effectManager.previousEffect === "glitch"))
          ) {
            line.el.classList.add("glitch");
            line.el.setAttribute("data-text", line.el.textContent);
          } else {
            line.el.classList.remove("glitch");
            line.el.removeAttribute("data-text");
          }

          line.el.style.transform = `translateX(${x}px)${additionalTransform}`;
        });

        item.el.style.transform = `translateY(${item.y}px)`;
      });
    }
  }

  render(t) {
    if (this.destroyed) return;

    if (!this.paused) {
      if (this.start === undefined) {
        this.start = t;
      }

      const elapsed = t - this.start;
      this.speed.c += (this.speed.t - this.speed.c) * 0.05;
      this.scroll.target += this.speed.c;
      this.scroll.current +=
        (this.scroll.target - this.scroll.current) * this.scroll.ease;
      this.delta = this.scroll.target - this.scroll.current;

      if (this.scroll.current > this.scroll.last) {
        this.direction = "down";
        this.speed.t = this.defaultSpeed;
      } else if (this.scroll.current < this.scroll.last) {
        this.direction = "up";
        this.speed.t = -this.defaultSpeed;
      }

      this.updateElements(this.scroll.current, elapsed);
      this.scroll.last = this.scroll.current;
    }

    requestAnimationFrame((t) => this.render(t));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const column1 = new Column({
    el: document.getElementById("column1"),
    reverse: false,
  });

  const column2 = new Column({
    el: document.getElementById("column2"),
    reverse: true,
  });

  effectManager.addColumn(column1);
  effectManager.addColumn(column2);
});