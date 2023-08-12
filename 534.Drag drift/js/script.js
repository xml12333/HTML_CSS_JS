var mouse = {
    x: 0,
    y: 0
  };
  var target = document.getElementById("target");
  var ship = document.getElementById("ship");
  var lag = {
    x: 0,
    y: 0
  };
  document.addEventListener("mousemove", evt => {
    mouse.x = evt.clientX;
    mouse.y = evt.clientY;
  });
  document.addEventListener("touchmove", evt => {
    mouse.x = evt.touches[0].clientX;
    mouse.y = evt.touches[0].clientY;
  });
  var physics0 = 50; //# of steps between mouse and current location (sluggishness)
  var physics1 = .99; //friction
  var xspeed = 0; //accelerationX
  var yspeed = 0; //accelerationY
  
  var tarX = 0;
  var tarY = 0;
  var self = this;
  self.mouseEnabled = false;
  function ENTER_FRAME() {
    target.style.top = mouse.y + "px";
    target.style.left = mouse.x + "px";
    tarX = mouse.x;
    tarY = mouse.y;
    xspeed = (tarX - lag.x) / physics0 + xspeed * physics1;
    yspeed = (tarY - lag.y) / physics0 + yspeed * physics1;
    lag.x += xspeed / 50;
    lag.y += yspeed / 50;
    const angle = Math.atan2(lag.y + 200 - mouse.y, lag.x - mouse.x);
    const oppositeAngle = angle + Math.PI;
    const angleDegrees = angle * (180 / Math.PI);
    const oppositeAngleDegrees = oppositeAngle * (180 / Math.PI);
    ship.style.transform = `translate(${lag.x}px, ${lag.y + 200}px) rotate(${oppositeAngleDegrees}deg)`;
    requestAnimationFrame(ENTER_FRAME);
  }
  requestAnimationFrame(ENTER_FRAME);
  let isTouching = false;
  let touchOrigin = {
    x: 0,
    y: 0
  };
  let dragOrigin = {
    x: 0,
    y: 0
  };
  let playerOrigin = {
    x: 0,
    y: 0
  };
  let playerStart = {
    x: 0,
    y: 0
  };
  let xVelocity = 0;
  let yVelocity = 0;
  const playerSquare = document.getElementById("playerSquare");
  let startMarker = document.createElement("div");
  startMarker.classList.add('marker');
  document.body.append(startMarker);
  let dragMarker = document.createElement("div");
  dragMarker.classList.add('marker');
  document.body.append(dragMarker);
  
  // Touch start event
  document.addEventListener("mousedown", event => {
    console.log("mouse down");
    touchOrigin.x = dragOrigin.x = event.clientX;
    touchOrigin.y = dragOrigin.y = event.clientY;
  
    //startMarker.style.top = touchOrigin.y + "px";
    //startMarker.style.left = touchOrigin.x + "px";
  
    playerStart.x = playerOrigin.x;
    playerStart.y = playerOrigin.y;
    isTouching = true;
  });
  
  // Touch move event
  document.addEventListener("mousemove", event => {
    if (isTouching) {
      dragOrigin.x = event.clientX;
      dragOrigin.y = event.clientY;
  
      //dragMarker.style.top = dragOrigin.y + "px";
      //dragMarker.style.left = dragOrigin.x + "px";
  
      playerOrigin.x = playerStart.x + (dragOrigin.x - touchOrigin.x);
      playerOrigin.y = playerStart.y + (dragOrigin.y - touchOrigin.y);
    }
  });
  document.addEventListener("mouseup", event => {
    isTouching = false;
  });