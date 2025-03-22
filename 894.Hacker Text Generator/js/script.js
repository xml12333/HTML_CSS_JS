class TextScramble {
      constructor(el) {
        this.el = el;
        this.charSets = {
          tech1: '!<>-_\\/[]{}—=+*^?#________',
          tech2: '!<>-_\\/[]{}—=+*^?#$%&()~',
          math: '01︎10︎101︎01︎+=-×÷',
          cryptic: '¥¤§Ω∑∆√∞≈≠≤≥',
          mixed: 'あ㐀明る日¥£€$¢₽₹₿',
          matrix1: 'ラドクリフマラソンわたしワタシんょンョたばこタバコとうきょうトウキョウ',
          matrix2: '日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ',
          matrix3: '字型大小女巧偉周年',
          matrix4: '九七二人入八力十下三千上口土夕大女子小山川五天中六円手文日月木水火犬王正出本右四左玉生田白目石立百年休先名字早気竹糸耳虫村男町花見貝赤足車学林空金雨青草音',
          emoji:  '❤️✨'
        };
        this.chars = this.charSets.tech1;
        this.update = this.update.bind(this);
        this.revealSpeed = 1;
        this.changeFrequency = 0.28;
        this.highlightColor = '#00ff88';
        this.glowIntensity = 8;
        this.activeGlowIntensity = 12;
      }
      
      setCharSet(setName) {
        if (this.charSets[setName]) {
          this.chars = this.charSets[setName];
          return true;
        }
        return false;
      }
      
      setRevealSpeed(speed) {
        // 1-10 scale, lower is faster
        this.revealSpeed = 11 - speed;
      }
      
      setChangeFrequency(freq) {
        // 1-100 scale
        this.changeFrequency = freq / 100;
      }
      
      setHighlightColor(color) {
        this.highlightColor = color;
      }
      
      setGlowIntensity(intensity) {
        this.glowIntensity = intensity;
        this.activeGlowIntensity = intensity + 4;
        document.getElementById('text').style.textShadow = `0 0 ${intensity}px currentColor`;
      }
      
      setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise(resolve => this.resolve = resolve);
        this.queue = [];
        
        for (let i = 0; i < length; i++) {
          const from = oldText[i] || '';
          const to = newText[i] || '';
          const start = Math.floor(Math.random() * (40 / this.revealSpeed));
          const end = start + Math.floor(Math.random() * (40 / this.revealSpeed));
          this.queue.push({ from, to, start, end });
        }
        
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
      }
      
      update() {
        let output = '';
        let complete = 0;
        
        for (let i = 0, n = this.queue.length; i < n; i++) {
          let { from, to, start, end, char } = this.queue[i];
          
          if (this.frame >= end) {
            complete++;
            output += to;
          } else if (this.frame >= start) {
            if (!char || Math.random() < this.changeFrequency) {
              char = this.randomChar();
              this.queue[i].char = char;
            }
            output += `<span class="scrambling" style="color: ${this.highlightColor}; text-shadow: 0 0 ${this.activeGlowIntensity}px currentColor;">${char}</span>`;
          } else {
            output += from;
          }
        }
        
        this.el.innerHTML = output;
        
        if (complete === this.queue.length) {
          this.resolve();
        } else {
          this.frameRequest = requestAnimationFrame(this.update);
          this.frame++;
        }
      }
      
      randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
      }
    }

    const phrases = [
      'Hello World',
      'Secret Message Revealed',
      'Access Granted',
      'System Online',
      'Loading Complete'
    ];

    let counter = 0;
    const el = document.getElementById('text');
    const fx = new TextScramble(el);

    function updateSettings() {
      const charSet = document.getElementById('charSet').value;
      const revealSpeed = parseInt(document.getElementById('revealSpeed').value);
      const changeFreq = parseInt(document.getElementById('changeFreq').value);
      
      fx.setCharSet(charSet);
      fx.setRevealSpeed(revealSpeed);
      fx.setChangeFrequency(changeFreq);
    }
    
    function updateColors() {
      const bgColor = document.getElementById('bgColor').value;
      const textColor = document.getElementById('textColor').value;
      
      document.body.style.backgroundColor = bgColor;
      document.body.style.color = textColor;
      fx.setHighlightColor(shiftColor(textColor, 40));
    }
    
    function updateGlow() {
      const glowIntensity = parseInt(document.getElementById('glowIntensity').value);
      fx.setGlowIntensity(glowIntensity);
    }
    
    function shiftColor(hex, lightnessDelta) {
      // Simple function to shift a color's lightness
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      
      const shift = (c) => {
        const newVal = Math.min(255, c + lightnessDelta);
        return newVal.toString(16).padStart(2, '0');
      };
      
      return `#${shift(r)}${shift(g)}${shift(b)}`;
    }

    function playAnimation() {
      const customText = document.getElementById('customText').value.trim();
      const text = customText || phrases[counter];
      
      fx.setText(text).then(() => {
        setTimeout(() => {
          if (!customText) {
            counter = (counter + 1) % phrases.length;
          }
        }, 2000);
      });
    }

    // Set initial colors
    updateColors();
    // Set initial settings
    updateSettings();
    // Set initial glow
    updateGlow();
    
    // Initial animation
    setTimeout(playAnimation, 1000);