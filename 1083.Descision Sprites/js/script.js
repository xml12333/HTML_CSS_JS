class RoundButton {
    constructor(container, config) {
        var _a;
        this.cframe = 0;
        this.animId = null;
        this.hovering = false;
        this.reversing = false;
        // Create <a>
        this.element = document.createElement("a");
        this.element.className = "button";
        this.element.href = "#";
        this.element.setAttribute("role", "button");
        if (config.isActive)
            this.element.classList.add("active");
        // Sprite setup
        this.width = config.width;
        this.height = config.height;
        this.totalFrames = config.totalFrames;
        this.columns = config.columns;
        this.fps = (_a = config.fps) !== null && _a !== void 0 ? _a : 30;
        this.onClick = config.onClick;
        this.onHoverStart = config.onHoverStart;
        this.onReverseComplete = config.onReverseComplete;
        Object.assign(this.element.style, {
            width: `${this.width}px`,
            height: `${this.height}px`,
            display: "inline-block",
            backgroundImage: `url(${config.sprite})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "0px 0px",
            cursor: "pointer"
        });
        container.appendChild(this.element);
        // Bind
        this.animate = this.animate.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.handleClick = this.handleClick.bind(this);
        // Events
        this.element.addEventListener("mouseover", this.handleMouseOver);
        this.element.addEventListener("mouseout", this.handleMouseOut);
        this.element.addEventListener("click", this.handleClick);
        this.renderFrame();
    }
    handleClick(e) {
        var _a;
        e.preventDefault();
        const clickedEl = e.currentTarget;
        document.querySelectorAll(".button").forEach((btn) => {
            btn.classList.remove("active");
        });
        clickedEl.classList.add("active");
        (_a = this.onClick) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    handleMouseOver() {
        var _a;
        this.hovering = true;
        this.reversing = false;
        (_a = this.onHoverStart) === null || _a === void 0 ? void 0 : _a.call(this);
        if (!this.animId) {
            this.animate();
        }
    }
    handleMouseOut() {
        this.hovering = false;
        this.reversing = true;
        if (!this.animId) {
            this.animate();
        }
    }
    animate() {
        var _a;
        this.renderFrame();
        if (this.hovering) {
            this.cframe = (this.cframe + 1) % this.totalFrames;
        }
        else if (this.reversing) {
            this.cframe--;
            if (this.cframe <= 0) {
                this.cframe = 0;
                this.reversing = false;
                this.animId = null;
                (_a = this.onReverseComplete) === null || _a === void 0 ? void 0 : _a.call(this);
                return;
            }
        }
        else {
            this.animId = null;
            return;
        }
        setTimeout(() => {
            this.animId = requestAnimationFrame(this.animate);
        }, 1000 / this.fps);
    }
    renderFrame() {
        const col = this.cframe % this.columns;
        const row = Math.floor(this.cframe / this.columns);
        this.element.style.backgroundPosition = `${-col * this.width}px ${-row * this.height}px`;
    }
}
class SpriteAnimator {
    constructor(spriteSheets, sheetIndex, frameWidth, frameHeight, columns, fps = 24, totalFrames = 121, classString) {
        this.currentFrame = 0;
        this.currentSpriteIndex = 0;
        this.nextIdleIndex = 0;
        this.nextClickIndex = 0;
        this.intervalId = null;
        this.preloaded = new Set();
        this.queuedClick = false;
        this.playingClick = false;
        this.allSpriteSheets = spriteSheets;
        this.currentSpriteIndex = sheetIndex;
        this.spriteSheets = this.allSpriteSheets[this.currentSpriteIndex];
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.columns = columns;
        this.fps = fps;
        this.totalFrames = totalFrames;
        // Container setup
        this.containerEl = document.createElement("div");
        this.containerEl.classList.add("container");
        this.containerEl.classList.add("waiting");
        if (classString)
            this.containerEl.classList.add(classString);
        this.containerEl.title = "click and ask a question.";
        this.messageEl = document.createElement("div");
        this.messageEl.classList.add("message");
        this.messageEl.innerHTML = "one moment, thinking";
        this.containerEl.appendChild(this.messageEl);
        this.questionEl = document.createElement("div");
        this.questionEl.classList.add("question");
        this.questionEl.innerHTML = "ask a question and click me";
        this.containerEl.appendChild(this.questionEl);
        this.element = document.createElement("div");
        this.element.classList.add("sprite");
        this.containerEl.appendChild(this.element);
        document.body.appendChild(this.containerEl);
        this.preloadElement = document.createElement("div");
        this.preloadElement.classList.add("preload");
        this.containerEl.appendChild(this.preloadElement);
        this.setSpriteSheet(this.pickRandomIndex(11, 37));
        this.nextIdleIndex = this.pickRandomIndex(11, 37);
        this.nextClickIndex = this.pickRandomIndex(0, 10);
        this.preload(this.nextIdleIndex);
        this.preload(this.nextClickIndex);
        this.containerEl.addEventListener("click", () => {
            this.containerEl.classList.add("clicked");
            this.queuedClick = true;
        });
    }
    setSpriteGroup(index) {
        if (this.currentSpriteIndex === index)
            return;
        this.currentSpriteIndex = index;
        this.spriteSheets = this.allSpriteSheets[this.currentSpriteIndex];
        this.nextIdleIndex = this.pickRandomIndex(11, 37);
        this.setSpriteSheet(this.nextIdleIndex);
    }
    pickRandomIndex(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    preload(index) {
        const sheet = this.spriteSheets[index];
        if (this.preloaded.has(sheet.url))
            return;
        const img = new Image();
        img.src = sheet.url;
        img.onload = () => {
            this.preloaded.add(sheet.url);
            if (this.preloaded.size === this.spriteSheets.length) {
                this.preloadElement.remove();
            }
        };
        this.preloadElement.appendChild(img);
    }
    setSpriteSheet(index) {
        const sheet = this.spriteSheets[index];
        this.element.style.backgroundImage = `url(${sheet.url})`;
        this.currentFrame = 0;
    }
    updateSprite() {
        const col = this.currentFrame % this.columns;
        const row = Math.floor(this.currentFrame / this.columns);
        const xOffset = -(col * this.frameWidth);
        const yOffset = -(row * this.frameHeight);
        this.element.style.backgroundPosition = `${xOffset}px ${yOffset}px`;
        this.currentFrame++;
        if (this.currentFrame === 2) {
            if (this.playingClick) {
                this.nextIdleIndex = this.pickRandomIndex(11, 37);
                this.nextClickIndex = this.pickRandomIndex(0, 10);
                this.preload(this.nextIdleIndex);
                this.preload(this.nextClickIndex);
            }
            else {
                this.nextIdleIndex = this.pickRandomIndex(11, 37);
                this.nextClickIndex = this.pickRandomIndex(0, 10);
                this.preload(this.nextIdleIndex);
                this.preload(this.nextClickIndex);
            }
        }
        if (this.currentFrame >= this.totalFrames) {
            this.stop();
            if (this.playingClick) {
                // Click animation just finished
                this.playingClick = false;
                this.containerEl.classList.add("waiting"); // show waiting message again
                this.setSpriteSheet(this.nextIdleIndex);
                this.start();
            }
            else if (this.queuedClick) {
                // User just clicked — start click animation
                this.queuedClick = false;
                this.playingClick = true;
                this.containerEl.classList.remove("waiting"); // hide waiting message
                this.containerEl.classList.remove("clicked");
                this.setSpriteSheet(this.nextClickIndex);
                this.start();
            }
            else {
                // Normal idle transition
                this.containerEl.classList.add("waiting");
                this.setSpriteSheet(this.nextIdleIndex);
                this.start();
            }
        }
    }
    start() {
        if (this.intervalId !== null)
            return;
        this.intervalId = window.setInterval(() => this.updateSprite(), 1000 / this.fps);
    }
    stop() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}
const charSheet = [
    [
        {
            url: "https://assets.codepen.io/163598/ex01-yes-01-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-yes-02-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-maybe-02-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-ask-01-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-ask-02-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-yes-03-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-yes-04-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-maybe-01-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-no-01-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-no-02-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-no-03-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-01-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-02-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-03-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-04-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-05-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-06-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-07-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-08-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-09-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-10-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-11-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-12-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-13-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-14-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-12-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-15-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-16-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-17-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-18-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-19-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-20-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-21-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-22-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-23-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-24-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-25-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex01-26-sprite.png"
        }
    ],
    [
        {
            url: "https://assets.codepen.io/163598/ex02-yes-01-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-yes-02-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-no-04-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-maybe-01-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-maybe-02-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-yes-03-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-no-01-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-no-02-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-no-03-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-ask-01-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-ask-02-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-01-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-02-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-03-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-04-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-05-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-06-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-07-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-24-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-09-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-10-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-11-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-12-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-13-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-14-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-12-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-25-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-16-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-17-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-18-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-19-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-20-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-21-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-22-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-23-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-24-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-25-sprite.png"
        },
        {
            url: "https://assets.codepen.io/163598/ex02-26-sprite.png"
        }
    ]
];
const indexSheet = [
    {
        url: "https://assets.codepen.io/163598/ex01-00-sprite.png"
    },
    {
        url: "https://assets.codepen.io/163598/ex02-00-sprite.png"
    }
];
window.addEventListener("DOMContentLoaded", () => {
    const sheetIndex = 0;
    const man1 = new SpriteAnimator(charSheet, sheetIndex, 320, 320, 5, 24);
    man1.start();
    const container = document.getElementById("charSelect");
    const classes = ["blue", "red"];
    document.body.classList.add(`${classes[sheetIndex]}`);
    for (let i = 0; i < indexSheet.length; i++) {
        new RoundButton(container, {
            sprite: indexSheet[i].url,
            width: 75,
            height: 75,
            totalFrames: 121,
            columns: 5,
            onClick: () => {
                document.body.className = "";
                document.body.classList.add(`${classes[i]}`);
                man1.setSpriteGroup(i);
            },
            fps: 120,
            isActive: i == sheetIndex
        });
    }
});
export {};