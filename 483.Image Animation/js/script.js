class GridAnimation {
    constructor(el, row = 13, col = 9) {
      this.element = el;
      this.fragments = el.children;
      this.row = row;
      this.col = col;
      this.duration = 2000;
      this.delayDelta = 70;
      this.type = null;
  
      this.randomIntBetween = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
      };
  
      this.element.style.setProperty("--row", this.row);
      this.element.style.setProperty("--col", this.col);
      this.element.addEventListener("click", this.trigger);
    }
  
    trigger = () => {
      if (this.fragments.length > 0) this.clear();
      this.element.classList.add("hide");
      this.animate();
    };
  
    setType = (type) => {
      this.type = type;
    };
  
    clear = () => {
      while (this.element.hasChildNodes()) {
        this.element.removeChild(this.element.firstChild);
      }
    };
  
    animate = () => {
      if (this.type === null) return;
      const x = this.col - 1;
      const y = this.row - 1;
      for (let i = 0; i < this.row; i++) {
        for (let j = 0; j < this.col; j++) {
          const fragment = document.createElement("div");
          fragment.className = "fragment";
          fragment.style.setProperty("--x", j);
          fragment.style.setProperty("--y", i);
  
          let delay = 0;
          switch (this.type) {
            case 0:
              delay = i * 2;
              break;
            case 1:
              delay = j * 2;
              break;
            case 2:
              delay = this.randomIntBetween(0, x + y);
              break;
            case 3:
              delay = x + y - (j + i);
              break;
            case 4:
              delay = i + j;
              break;
            case 5:
              delay = x - i + j;
              break;
            case 6:
              delay = i + (y - j);
              break;
            case 7:
              delay = Math.abs((x + y) / 2 - (j + i));
              break;
            case 8:
              delay = (x + y) / 2 - Math.abs((x + y) / 2 - (j + i));
              break;
            case 9:
              delay =
                (x + y) / 2 - Math.abs((x + y) / 2 - (j + i)) * Math.cos(i + j);
              break;
            case 10:
              delay = Math.abs((x + y) / 2 - (x - j + i));
              break;
            case 11:
              delay = Math.abs((x + y) / 2 - Math.abs((x + y) / 2 - (x - j + i)));
              break;
            case 12:
              delay = Math.abs(x / 2 - j) + Math.abs(y / 2 - i);
              break;
            case 13:
              delay = x / 2 - Math.abs(x / 2 - j) + (x / 2 - Math.abs(y / 2 - i));
              break;
          }
  
          const isOdd = (i + j) % 2 === 0;
          fragment.style.setProperty(
            "--rotateX",
            `rotateX(${isOdd ? -180 : 0}deg)`
          );
          fragment.style.setProperty(
            "--rotateY",
            `rotateY(${isOdd ? 0 : -180}deg)`
          );
          fragment.style.setProperty("--delay", delay * this.delayDelta + "ms");
          fragment.style.setProperty("--duration", this.duration + "ms");
          this.element.appendChild(fragment);
  
          const timer = setTimeout(() => {
            fragment.style.willChange = "initial";
            fragment.style.transform = "initial";
            fragment.style.animation = "initial";
            fragment.style.backfaceVisibility = "initial";
            fragment.style.opacity = 1;
            clearTimeout(timer);
          }, this.duration + delay * this.delayDelta);
        }
      }
    };
  }
  
  document.querySelectorAll(".box").forEach((box, index) => {
    const gridAnimation = new GridAnimation(box);
    const type = parseInt(box.getAttribute("data-i"));
    gridAnimation.setType(type);
    if (index === 0) gridAnimation.trigger();
  });
  