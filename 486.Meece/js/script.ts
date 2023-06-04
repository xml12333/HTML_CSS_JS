const NUM_MICE = 100

abstract class Agent {
    type: string;
    pos: { x: number, y: number };
    boundingBox: { x: number, y: number, w: number, h: number };
  
    constructor(type: string, pos: { x: number, y: number }, boundingBox: { x: number, y: number, w: number, h: number }) {
        this.type = type;
        this.pos = pos;
        this.boundingBox = boundingBox;
    }

    abstract update(): void;

    abstract render(context: CanvasRenderingContext2D): void;
}

class Mouse extends Agent {
    private target: { x: number, y: number };
    private angle: number;
    private rotationSpeed: number;
    private color = `hsl(0, 0%, ${Math.random()*100}%)`
    private speed: number;

    constructor(pos: { x: number = 0, y: number = 0 }, boundingBox: { x: number = 0, y: number = 0, w: number, h: number }) {
        super('mouse', pos, boundingBox);
        this.target = pos;
        this.angle = 0;
        this.rotationSpeed = Math.random() * 0.5;  // rotation speed in radians
        this.speed = Math.random() * 0.1; // speed of moving towards the target
    }

    update(): void {
        const distance = Math.hypot(this.target.x - this.pos.x, this.target.y - this.pos.y);
        if (distance < 1) {
            // new random target location
            this.target = {
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight
            };
        } else {
            // move to target with easing
            const dx = this.target.x - this.pos.x;
            const dy = this.target.y - this.pos.y;

            // calculate the desired angle of rotation
            const desiredAngle = Math.atan2(dy, dx);

            // calculate the difference in current angle and the desired angle
            let diff = desiredAngle - this.angle;

            // normalize it to (-PI, PI)
            diff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;

            // calculate the new angle by adding a fraction of the difference to the old angle
            this.angle += diff * this.rotationSpeed;

            // Only move when the difference in angle is small enough (say, less than 5 degrees)
            if (Math.abs(diff) < Math.PI / 36) {
                this.pos.x += dx * this.speed;
                this.pos.y += dy * this.speed;
            }
        }
    }

    render(context: CanvasRenderingContext2D): void {
        context.save(); // save the current canvas state

        // translate and rotate the canvas to the position and angle of the mouse
        context.translate(this.pos.x, this.pos.y);
        context.rotate(this.angle);

        context.beginPath();
        context.moveTo(0, -this.boundingBox.h / 2);
        context.lineTo(0, this.boundingBox.h / 2);
        context.lineTo(this.boundingBox.w, 0);
        context.closePath();
        context.fillStyle = this.color;
        context.fill();

        // Draw pink nose
        context.beginPath();
        context.arc(this.boundingBox.w, 0, 3, 0, 2 * Math.PI);
        context.fillStyle = 'pink';
        context.fill();

        context.restore(); // restore the previous canvas state
    }
}



class App {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mice: Mouse[] = []

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    for(let i = 0; i < NUM_MICE; i ++) {
      //
      this.mice.push(
        new Mouse({x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight}, {x:0, y:0, w:10 +  Math.random()*20, h:5 +  Math.random()*10})
      )
    }

    document.body.appendChild(this.canvas);
    
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.loop();
  }

  private update() {
    // Update logic goes here
    // this.mouse.update()
    for(let i = 0; i < NUM_MICE; i ++) {
     this.mice[i].update()
    }
  }

  private render() {
    // Render logic goes here
    // this.mouse.render(this.ctx)
    for(let i = 0; i < NUM_MICE; i ++) {
     this.mice[i].render(this.ctx);
    }
  }

  private loop(t) {
    this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
    this.update();
    this.render();
    requestAnimationFrame(this.loop.bind(this));
  }
}

const app = new App();