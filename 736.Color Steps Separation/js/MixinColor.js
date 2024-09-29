const vueMixinColorFunctions = {
    created() {
      // console.log('color mixin called')
    },
    methods: {
      randomHex() {
        return '#' + ( '00' + Math.floor( Math.random() * 16777216 ).toString(16) ).substr(-6)
      },
      hexArray(hex) {
        return /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      },
      rgbObjectFromHex(hex) {
        const result = this.hexArray(hex)
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        } : null;
      },
      rgbArrayFromHex(hex) {
        const rgb = this.rgbObjectFromHex(hex)
        return [rgb.r, rgb.g, rgb.b]
      },
      hslObjectFromHex(hex) {
        const hsl = {}
        const rgb = this.rgbObjectFromHex(hex)
  
        rgb.r /= 255, rgb.g /= 255, rgb.b /= 255
        let max = Math.max(rgb.r, rgb.g, rgb.b)
        let min = Math.min(rgb.r, rgb.g, rgb.b)
        
        hsl.l = (max + min) / 2
  
        if ( max == min ) {
          hsl.h = hsl.s = 0 // achromatic
        } else {
          let d = max - min
          
          hsl.s = hsl.l > 0.5 ? (d / (2 - max - min)) : (d / (max + min))
  
          switch(max) {
            case rgb.r: 
              hsl.h = (rgb.g - rgb.b) / d + (rgb.g < rgb.b ? 6 : 0)
              break
            case rgb.g: 
              hsl.h = (rgb.b - rgb.r) / d + 2
              break
            case rgb.b:
              hsl.h = (rgb.r - rgb.g) / d + 4
              break
          }
          
          hsl.h /= 6;
        }
        
        return {
          h: Math.round(hsl.h * 360),
          s: Math.round(hsl.s * 100),
          l: Math.round(hsl.l * 100),
        }
      },
      hslArrayFromHex(hex) {
        const hsl = this.hslObjectFromHex(hex)
        return [hsl.h, hsl.s, hsl.l]
      },
      hexToRgb(hex) {
        const rgb = this.rgbObjectFromHex(hex)
        return `rgb(${rgb.r},${rgb.g},${rgb.b})`
      },
      hexToRgbArray(hex) {
        const rgb = this.rgbObjectFromHex(hex)
        return `${rgb.r}, ${rgb.g}, ${rgb.b}`
      },
      hexToHsl(hex) {
        const hsl = this.hslObjectFromHex(hex)
        return `hsl(${hsl.h},${hsl.s}%,${hsl.l}%)`
      },
      rgbChannelToHex(channel) {
        return channel.toString(16).padStart(2, '0');
      },
      rgbToHex(r, g, b) {
        return "#" + [r,g,b].map(x=>Math.round(x).toString(16).padStart(2,0) ).join('');
      },
      rgbArrayToHex (color) {
        return this.rgbToHex(color[0], color[1], color[2]) 
      },
      hslToRgbObject(h, s, l) {
        let r, g, b;
  
        if(s == 0){
          r = g = b = l; // achromatic
        } else {
          const hue2rgb = function hue2rgb(p, q, t) {
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            
            return p;
          }
  
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
  
          
          r = hue2rgb(p, q, h + 1/3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1/3);
        }
  
        console.log(r, g, b);
  
        return {
          r: Math.round(r * 255),
          g: Math.round(g * 255),
          b: Math.round(b * 255)
        }
      },
      hslToRgb(h, s, l) {
        let a = s*Math.min(l,1-l);
        let f = (n,k=(n+h/30)%12) => l - a*Math.max(Math.min(k-3,9-k,1),-1);
        return [f(0),f(8),f(4)];
      },
      hslToHex(h, s, l) {
        l /= 100;
        
        const a = s * Math.min(l, 1 - l) / 100;
        
        const hex = n => {
          const k = (n + h / 30) % 12;
          const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
          
          return Math.round(255 * color).toString(16).padStart(2, '0');
        }
        
        return `#${hex(0)}${hex(8)}${hex(4)}`;
      },
      brightness(hex) {
        const rgb = this.rgbObjectFromHex(hex)
        return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
      },
      foregroundAdjust(hex, test, lightHex, darkHex) {
        test = test || 154
        lightHex = lightHex || '#fff'
        darkHex = darkHex || '#000'
        return this.brightness(hex) < test ? lightHex : darkHex
      },
      interpolateColor(color1, color2, factor) {
        if (arguments.length < 3) { 
          factor = 0.5
        }
        const result = color1.slice()
        
        for (var i = 0; i < 3; i++) {
          result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]))
        }
        return result
      },
      interpolateColors(color1, color2, steps) {
        let stepFactor = 1 / (steps - 1)
        let interpolatedColorArray = []
  
        color1 = this.rgbArrayFromHex(color1).map(Number)
        color2 = this.rgbArrayFromHex(color2).map(Number)
  
        for (var i = 0; i < steps; i++) {
          interpolatedColorArray.push(this.interpolateColor(color1, color2, stepFactor * i))
        }
  
        return interpolatedColorArray
      }
    },
  }