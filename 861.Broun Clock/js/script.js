// Import Tweakpane as a module
import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js";
// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Create clock hour marks and numbers
  const hourMarksContainer = document.getElementById("clock-hour-marks");
  // Create hour numbers and minute markers with perfect spacing
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0) {
      // Hour number (every 5 minutes)
      const hourIndex = i / 5;
      const hourNumber = document.createElement("div");
      hourNumber.className = "clock-number";
      // Calculate position for numbers - perfectly centered around the clock
      const angle = (i * 6 * Math.PI) / 180;
      const radius = 145; // Distance from center
      const left = 175 + Math.sin(angle) * radius - 15;
      const top = 175 - Math.cos(angle) * radius - 10;
      hourNumber.style.left = `${left}px`;
      hourNumber.style.top = `${top}px`;
      hourNumber.textContent = hourIndex === 0 ? "12" : hourIndex.toString();
      hourMarksContainer.appendChild(hourNumber);
    } else {
      // Minute marker (line)
      const minuteMarker = document.createElement("div");
      minuteMarker.className = "minute-marker";
      minuteMarker.style.transform = `rotate(${i * 6}deg)`;
      hourMarksContainer.appendChild(minuteMarker);
    }
  }
  // Set fixed light angles
  document.documentElement.style.setProperty("--primary-light-angle", "-45deg");
  document.documentElement.style.setProperty("--dark-edge-angle", "135deg");
  // Set fixed glossy overlay
  const glossyOverlay = document.getElementById("glass-glossy-overlay");
  if (glossyOverlay) {
    glossyOverlay.style.background = `linear-gradient(135deg, 
      rgba(255, 255, 255, 0.9) 0%, 
      rgba(255, 255, 255, 0.7) 15%, 
      rgba(255, 255, 255, 0.5) 25%,
      rgba(255, 255, 255, 0.3) 50%, 
      rgba(255, 255, 255, 0.2) 75%, 
      rgba(255, 255, 255, 0.1) 100%)`;
    glossyOverlay.style.filter = "blur(10px)";
  }
  // Set fixed reflection overlay
  const reflectionOverlay = document.getElementById("glass-reflection-overlay");
  if (reflectionOverlay) {
    reflectionOverlay.style.transform = "rotate(-15deg)";
    reflectionOverlay.style.filter = "blur(10px)";
  }
  // Initialize Tweakpane
  initTweakpane();
  // Set the initial CSS variables
  document.documentElement.style.setProperty("--inner-shadow-opacity", "0.15");
  document.documentElement.style.setProperty("--reflection-opacity", "0.5");
  document.documentElement.style.setProperty("--glossy-opacity", "0.3");
  // Start the clock animation
  startClock();
  // Add keyboard shortcut to toggle Tweakpane visibility
  document.addEventListener("keydown", function (event) {
    if (event.key === "h" || event.key === "H") {
      const tweakpaneContainer = document.getElementById("tweakpane-container");
      if (tweakpaneContainer) {
        tweakpaneContainer.style.display =
          tweakpaneContainer.style.display === "none" ? "block" : "none";
      }
    }
  });
});
// Variables for the seconds hand
let secondsAngle = 0;
let animationFrameId = null;
let secondsMode = "smooth"; // Default to smooth movement
// Function to start the clock
function startClock() {
  // Get the current time for hour and minute hands
  updateHourAndMinuteHands();
  // Start the seconds hand animation based on the selected mode
  animateSecondHand();
}
// Function to update hour and minute hands based on real time
function updateHourAndMinuteHands() {
  const now = new Date();
  const berlinTime = new Date(
    now.toLocaleString("en-US", {
      timeZone: "Europe/Berlin"
    })
  );
  const hours = berlinTime.getHours() % 12;
  const minutes = berlinTime.getMinutes();
  const hourHand = document.getElementById("hour-hand");
  const minuteHand = document.getElementById("minute-hand");
  if (hourHand && minuteHand) {
    const hoursDegrees = hours * 30 + (minutes / 60) * 30;
    const minutesDegrees = minutes * 6;
    hourHand.style.transform = `rotate(${hoursDegrees}deg)`;
    minuteHand.style.transform = `rotate(${minutesDegrees}deg)`;
  }
  // Update date display with simple month and day format
  const dateDisplay = document.getElementById("clock-date");
  if (dateDisplay) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    const month = months[berlinTime.getMonth()];
    const day = berlinTime.getDate();
    dateDisplay.textContent = `${month} ${day}`;
  }
  // Update timezone display
  const timezoneDisplay = document.getElementById("clock-timezone");
  if (timezoneDisplay) {
    timezoneDisplay.textContent = "Berlin";
  }
  // Update hour and minute hands every minute
  setTimeout(updateHourAndMinuteHands, 60000);
}
// Function to animate the seconds hand based on the selected mode
function animateSecondHand() {
  // Cancel any existing animation
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  const secondHandContainer = document.getElementById("second-hand-container");
  const secondHandShadow = document.getElementById("second-hand-shadow");
  if (!secondHandContainer) return;
  // Different animation modes
  switch (secondsMode) {
    case "tick1": // Tick every second (60 ticks per minute)
      animateTickMode(secondHandContainer, secondHandShadow, 6, 1); // 6 degrees per tick, 1 tick per second
      break;
    case "tick2": // Half-second ticks (120 ticks per minute)
      animateTickMode(secondHandContainer, secondHandShadow, 3, 2); // 3 degrees per tick, 2 ticks per second
      break;
    case "highFreq": // High-frequency sweep (8 ticks per second)
      animateTickMode(secondHandContainer, secondHandShadow, 0.75, 8); // 0.75 degrees per tick, 8 ticks per second
      break;
    case "smooth": // Smooth movement over 60 seconds
    default:
      animateSmoothMode(secondHandContainer, secondHandShadow);
      break;
  }
}
// Function to animate with ticking motion
function animateTickMode(
  secondHandContainer,
  secondHandShadow,
  degreesPerTick,
  ticksPerSecond
) {
  let lastTickTime = 0;
  const intervalMs = 1000 / ticksPerSecond;

  function tick() {
    // Get current time
    const now = new Date();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    // Calculate the current time in milliseconds within the minute
    const timeInMs = seconds * 1000 + milliseconds;
    // Calculate which tick we should be on
    const tickIndex = Math.floor(timeInMs / intervalMs);
    const currentTickTime = tickIndex * intervalMs;
    // Only update if we've moved to a new tick
    if (currentTickTime !== lastTickTime) {
      lastTickTime = currentTickTime;
      // Calculate the angle based on the tick index
      // For high-frequency ticks, we need to ensure we complete a full rotation in 60 seconds
      const totalTicksInRotation = ticksPerSecond * 60; // Total ticks in a full rotation
      const currentTick = tickIndex % totalTicksInRotation;
      secondsAngle = currentTick * (360 / totalTicksInRotation);
      // Apply the rotation with a snap motion
      secondHandContainer.style.transition = "none";
      secondHandContainer.style.transform = `rotate(${secondsAngle}deg)`;
      if (secondHandShadow) {
        secondHandShadow.style.transition = "none";
        secondHandShadow.style.transform = `rotate(${secondsAngle + 0.5}deg)`;
      }
    }
    // Schedule the next check
    setTimeout(tick, 10); // Check frequently to catch the exact tick moments
  }
  // Start ticking
  tick();
}
// Function to animate with smooth motion
function animateSmoothMode(secondHandContainer, secondHandShadow) {
  function animate() {
    // Get current time with millisecond precision
    const now = new Date();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    // Calculate the exact angle based on real time
    // Each second is 6 degrees (360/60), and we add the millisecond fraction
    secondsAngle = seconds * 6 + (milliseconds / 1000) * 6;
    // Apply the rotation smoothly
    secondHandContainer.style.transition = "none"; // Changed to none for smoother movement
    secondHandContainer.style.transform = `rotate(${secondsAngle}deg)`;
    if (secondHandShadow) {
      secondHandShadow.style.transition = "none"; // Changed to none for smoother movement
      secondHandShadow.style.transform = `rotate(${secondsAngle + 0.5}deg)`;
    }
    // Request next frame for smooth animation
    animationFrameId = requestAnimationFrame(animate);
  }
  // Start animation
  animate();
}
// Initialize Tweakpane
function initTweakpane() {
  try {
    // Initialize Tweakpane with the imported module
    const pane = new Pane({
      container: document.getElementById("tweakpane-container"),
      title: "Clock Settings"
    });
    // Create folders for organization
    const visibilityFolder = pane.addFolder({
      title: "Visibility"
    });
    const shadowsFolder = pane.addFolder({
      title: "Shadows"
    });
    const colorsFolder = pane.addFolder({
      title: "Colors"
    });
    const effectsFolder = pane.addFolder({
      title: "Effects"
    });
    // Visibility controls
    const params = {
      minuteMarkerOpacity: 1,
      innerShadowOpacity: 0.15,
      reflectionOpacity: 1,
      glossyOpacity: 0.8,
      showNumbers: true,
      hourNumberColor: "rgba(50, 50, 50, 0.9)",
      minuteMarkerColor: "rgba(80, 80, 80, 0.5)",
      handColor: "rgba(50, 50, 50, 0.9)",
      secondHandColor: "rgba(255, 107, 0, 1)",
      shadowLayer1: 0.1,
      shadowLayer2: 0.1,
      shadowLayer3: 0.1,
      secondsMode: "smooth" // Default to smooth
    };
    // Visibility controls
    visibilityFolder
      .addBinding(params, "minuteMarkerOpacity", {
        min: 0,
        max: 1,
        step: 0.1,
        label: "Minute Markers"
      })
      .on("change", (ev) => {
        document.documentElement.style.setProperty(
          "--minute-marker-opacity",
          ev.value
        );
      });
    visibilityFolder
      .addBinding(params, "reflectionOpacity", {
        min: 0,
        max: 1,
        step: 0.1,
        label: "Reflection"
      })
      .on("change", (ev) => {
        document.documentElement.style.setProperty(
          "--reflection-opacity",
          ev.value
        );
      });
    visibilityFolder
      .addBinding(params, "glossyOpacity", {
        min: 0,
        max: 1,
        step: 0.1,
        label: "Glossy Effect"
      })
      .on("change", (ev) => {
        document.documentElement.style.setProperty(
          "--glossy-opacity",
          ev.value
        );
      });
    // Add toggle for numbers
    visibilityFolder
      .addBinding(params, "showNumbers", {
        label: "Show Numbers"
      })
      .on("change", (ev) => {
        document.documentElement.style.setProperty(
          "--hour-number-opacity",
          ev.value ? "1" : "0"
        );
      });
    // Shadow controls - separated into inner and outer
    shadowsFolder
      .addBinding(params, "innerShadowOpacity", {
        min: 0,
        max: 1,
        step: 0.1,
        label: "Inner Shadow"
      })
      .on("change", (ev) => {
        document.documentElement.style.setProperty(
          "--inner-shadow-opacity",
          ev.value
        );
        // Update inner shadow elements directly
        const innerShadowElements = [
          document.querySelector(".glass-edge-shadow"),
          document.querySelector(".glass-dark-edge")
        ];
        innerShadowElements.forEach((element) => {
          if (element) {
            element.style.opacity = ev.value;
          }
        });
      });
    // Add controls for the box-shadow layers in glass-clock-face
    shadowsFolder
      .addBinding(params, "shadowLayer1", {
        min: 0,
        max: 0.5,
        step: 0.01,
        label: "Shadow Layer 1"
      })
      .on("change", (ev) => {
        document.documentElement.style.setProperty(
          "--shadow-layer1-opacity",
          ev.value
        );
      });
    shadowsFolder
      .addBinding(params, "shadowLayer2", {
        min: 0,
        max: 0.5,
        step: 0.01,
        label: "Shadow Layer 2"
      })
      .on("change", (ev) => {
        document.documentElement.style.setProperty(
          "--shadow-layer2-opacity",
          ev.value
        );
      });
    shadowsFolder
      .addBinding(params, "shadowLayer3", {
        min: 0,
        max: 0.5,
        step: 0.01,
        label: "Shadow Layer 3"
      })
      .on("change", (ev) => {
        document.documentElement.style.setProperty(
          "--shadow-layer3-opacity",
          ev.value
        );
      });
    // Color controls
    colorsFolder
      .addBinding(params, "hourNumberColor", {
        label: "Hour Numbers"
      })
      .on("change", (ev) => {
        document.documentElement.style.setProperty(
          "--hour-number-color",
          ev.value
        );
      });
    colorsFolder
      .addBinding(params, "minuteMarkerColor", {
        label: "Minute Markers"
      })
      .on("change", (ev) => {
        document.documentElement.style.setProperty(
          "--minute-marker-color",
          ev.value
        );
      });
    colorsFolder
      .addBinding(params, "handColor", {
        label: "Hour/Minute Hands"
      })
      .on("change", (ev) => {
        document.documentElement.style.setProperty("--hand-color", ev.value);
      });
    colorsFolder
      .addBinding(params, "secondHandColor", {
        label: "Second Hand"
      })
      .on("change", (ev) => {
        document.documentElement.style.setProperty(
          "--second-hand-color",
          ev.value
        );
      });
    // Add seconds mode control with new options
    effectsFolder
      .addBinding(params, "secondsMode", {
        options: {
          "Smooth Movement": "smooth",
          "Tick Every Second": "tick1",
          "Half-Second Ticks": "tick2",
          "High-Frequency Sweep": "highFreq"
        },
        label: "Seconds Mode"
      })
      .on("change", (ev) => {
        secondsMode = ev.value;
        animateSecondHand(); // Restart animation with new mode
      });
    // Effects controls
    const effectsParams = {
      lightAngle: -45,
      darkEdgeAngle: 135
    };
    effectsFolder
      .addBinding(effectsParams, "lightAngle", {
        min: -180,
        max: 180,
        step: 1,
        label: "Light Angle"
      })
      .on("change", (ev) => {
        // Update the CSS variable
        document.documentElement.style.setProperty(
          "--primary-light-angle",
          `${ev.value}deg`
        );
      });
    effectsFolder
      .addBinding(effectsParams, "darkEdgeAngle", {
        min: -180,
        max: 180,
        step: 1,
        label: "Dark Edge Angle"
      })
      .on("change", (ev) => {
        // Update the CSS variable
        document.documentElement.style.setProperty(
          "--dark-edge-angle",
          `${ev.value}deg`
        );
      });
    // Add button to reset all settings
    pane
      .addButton({
        title: "Reset All Settings"
      })
      .on("click", () => {
        // Reset all parameters
        params.minuteMarkerOpacity = 1;
        params.innerShadowOpacity = 0.15;
        params.reflectionOpacity = 0.5;
        params.glossyOpacity = 0.3;
        params.showNumbers = true;
        params.hourNumberColor = "rgba(50, 50, 50, 0.9)";
        params.minuteMarkerColor = "rgba(80, 80, 80, 0.5)";
        params.handColor = "rgba(50, 50, 50, 0.9)";
        params.secondHandColor = "rgba(255, 107, 0, 1)";
        params.shadowLayer1 = 0.1;
        params.shadowLayer2 = 0.1;
        params.shadowLayer3 = 0.1;
        params.secondsMode = "smooth";
        effectsParams.lightAngle = -45;
        effectsParams.darkEdgeAngle = 135;
        // Apply all resets to CSS variables
        document.documentElement.style.setProperty(
          "--minute-marker-opacity",
          "1"
        );
        document.documentElement.style.setProperty(
          "--inner-shadow-opacity",
          "0.15"
        );
        document.documentElement.style.setProperty(
          "--reflection-opacity",
          "0.5"
        );
        document.documentElement.style.setProperty("--glossy-opacity", "0.3");
        document.documentElement.style.setProperty(
          "--hour-number-opacity",
          "1"
        );
        document.documentElement.style.setProperty(
          "--hour-number-color",
          "rgba(50, 50, 50, 0.9)"
        );
        document.documentElement.style.setProperty(
          "--minute-marker-color",
          "rgba(80, 80, 80, 0.5)"
        );
        document.documentElement.style.setProperty(
          "--hand-color",
          "rgba(50, 50, 50, 0.9)"
        );
        document.documentElement.style.setProperty(
          "--second-hand-color",
          "rgba(255, 107, 0, 1)"
        );
        document.documentElement.style.setProperty(
          "--primary-light-angle",
          "-45deg"
        );
        document.documentElement.style.setProperty(
          "--dark-edge-angle",
          "135deg"
        );
        document.documentElement.style.setProperty(
          "--shadow-layer1-opacity",
          "0.1"
        );
        document.documentElement.style.setProperty(
          "--shadow-layer2-opacity",
          "0.1"
        );
        document.documentElement.style.setProperty(
          "--shadow-layer3-opacity",
          "0.1"
        );
        // Update seconds mode
        secondsMode = "smooth";
        animateSecondHand();
        // Update all shadow elements directly
        const innerShadowElements = [
          document.querySelector(".glass-edge-shadow"),
          document.querySelector(".glass-dark-edge")
        ];
        innerShadowElements.forEach((element) => {
          if (element) {
            element.style.opacity = 0.15;
          }
        });
        const outerShadowElement = document.querySelector(
          ".glass-effect-shadow"
        );
        if (outerShadowElement) {
          outerShadowElement.style.opacity = 1;
        }
        // Refresh the pane to show updated values
        pane.refresh();
      });
    console.log("Tweakpane initialized successfully");
  } catch (error) {
    console.error("Error initializing Tweakpane:", error);
  }
}