var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var NUM_MICE = 100;
var Agent = /** @class */ (function () {
    function Agent(type, pos, boundingBox) {
        this.type = type;
        this.pos = pos;
        this.boundingBox = boundingBox;
    }
    return Agent;
}());
var Mouse = /** @class */ (function (_super) {
    __extends(Mouse, _super);
    function Mouse(pos, boundingBox) {
        var _this = _super.call(this, 'mouse', pos, boundingBox) || this;
        _this.color = "hsl(0, 0%, ".concat(Math.random() * 100, "%)");
        _this.target = pos;
        _this.angle = 0;
        _this.rotationSpeed = Math.random() * 0.5; // rotation speed in radians
        _this.speed = Math.random() * 0.1; // speed of moving towards the target
        return _this;
    }
    Mouse.prototype.update = function () {
        var distance = Math.hypot(this.target.x - this.pos.x, this.target.y - this.pos.y);
        if (distance < 1) {
            // new random target location
            this.target = {
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight
            };
        }
        else {
            // move to target with easing
            var dx = this.target.x - this.pos.x;
            var dy = this.target.y - this.pos.y;
            // calculate the desired angle of rotation
            var desiredAngle = Math.atan2(dy, dx);
            // calculate the difference in current angle and the desired angle
            var diff = desiredAngle - this.angle;
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
    };
    Mouse.prototype.render = function (context) {
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
    };
    return Mouse;
}(Agent));
var App = /** @class */ (function () {
    function App() {
        this.mice = [];
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        for (var i = 0; i < NUM_MICE; i++) {
            //
            this.mice.push(new Mouse({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }, { x: 0, y: 0, w: 10 + Math.random() * 20, h: 5 + Math.random() * 10 }));
        }
        document.body.appendChild(this.canvas);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.loop();
    }
    App.prototype.update = function () {
        // Update logic goes here
        // this.mouse.update()
        for (var i = 0; i < NUM_MICE; i++) {
            this.mice[i].update();
        }
    };
    App.prototype.render = function () {
        // Render logic goes here
        // this.mouse.render(this.ctx)
        for (var i = 0; i < NUM_MICE; i++) {
            this.mice[i].render(this.ctx);
        }
    };
    App.prototype.loop = function (t) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.update();
        this.render();
        requestAnimationFrame(this.loop.bind(this));
    };
    return App;
}());
var app = new App();
