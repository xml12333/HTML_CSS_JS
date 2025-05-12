// GSAP registration
gsap.registerPlugin(CustomEase);
// Custom eases - make sure they're created only once
if (!CustomEase.get("circleEase")) {
  CustomEase.create("circleEase", "0.68, -0.55, 0.265, 1.55");
  CustomEase.create("bounceOut", "0.22, 1.2, 0.36, 1");
  CustomEase.create("slowStart", "0.5, 0, 0.1, 1");
  CustomEase.create("elasticOut", "0.64, 0.57, 0.67, 1.53");
  CustomEase.create("fastSpin", ".17,.67,.83,.67");
  CustomEase.create("smoothFlip", "0.45, 0, 0.55, 1");
}
// Animation configurations
const animationConfigs = {
  "dots-grid": {
    init: (element) => {
      gsap.set(element.querySelectorAll(".dot"), {
        scale: 1,
        opacity: 1,
        x: 0,
        y: 0
      });
    },
    activate: (element) => {
      const dots = element.querySelectorAll(".dot");
      gsap.to(dots[0], {
        x: 30,
        y: 30,
        scale: 1.2,
        ease: "circleEase",
        duration: 0.6
      });
      gsap.to(dots[1], {
        opacity: 0,
        scale: 5,
        ease: "circleEase",
        duration: 0.6
      });
      gsap.to(dots[2], {
        x: -30,
        y: 30,
        scale: 1.2,
        ease: "circleEase",
        duration: 0.6
      });
      gsap.to(dots[3], {
        opacity: 0,
        scale: 5,
        ease: "circleEase",
        duration: 0.6
      });
      gsap.to(dots[4], {
        scale: 1.2,
        ease: "circleEase",
        duration: 0.6
      });
      gsap.to(dots[5], {
        opacity: 0,
        scale: 5,
        ease: "circleEase",
        duration: 0.3
      });
      gsap.to(dots[6], {
        x: 30,
        y: -30,
        scale: 1.2,
        ease: "circleEase",
        duration: 0.6
      });
      gsap.to(dots[7], {
        opacity: 0,
        scale: 5,
        ease: "circleEase",
        duration: 0.6
      });
      gsap.to(dots[8], {
        x: -30,
        y: -30,
        scale: 1.2,
        ease: "circleEase",
        duration: 0.6
      });
    },
    deactivate: (element) => {
      gsap.to(element.querySelectorAll(".dot"), {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        ease: "circleEase",
        duration: 0.6
      });
    }
  },
  "text-morph": {
    init: (element) => {
      gsap.set(element.querySelector(".text-container .menu"), {
        y: 0
      });
      gsap.set(element.querySelector(".text-container .close"), {
        y: 20
      });
      gsap.set(element.querySelector(".circle"), {
        x: 0,
        scaleX: 1,
        borderRadius: "50%"
      });
    },
    activate: (element) => {
      // Text transition
      gsap.to(element.querySelector(".text-container .menu"), {
        y: -20,
        ease: "power2.inOut",
        duration: 0.5
      });
      gsap.to(element.querySelector(".text-container .close"), {
        y: 0,
        ease: "power2.inOut",
        duration: 0.5
      });
      // Dot quick extend and contract animation
      const tl = gsap.timeline();
      tl.to(element.querySelector(".circle"), {
        x: -20,
        scaleX: 2.5,
        borderRadius: "4px",
        ease: "power1.out",
        duration: 0.2
      }).to(
        element.querySelector(".circle"),
        {
          x: 0,
          scaleX: 1,
          borderRadius: "50%",
          ease: "power1.in",
          duration: 0.2
        },
        ">=0"
      );
    },
    deactivate: (element) => {
      // Text transition
      gsap.to(element.querySelector(".text-container .menu"), {
        y: 0,
        ease: "power2.inOut",
        duration: 0.5
      });
      gsap.to(element.querySelector(".text-container .close"), {
        y: 20,
        ease: "power2.inOut",
        duration: 0.5
      });
      // Dot quick extend and contract animation
      const tl = gsap.timeline();
      tl.to(element.querySelector(".circle"), {
        x: -20,
        scaleX: 2.5,
        borderRadius: "4px",
        ease: "power1.out",
        duration: 0.2
      }).to(
        element.querySelector(".circle"),
        {
          x: 0,
          scaleX: 1,
          borderRadius: "50%",
          ease: "power1.in",
          duration: 0.2
        },
        ">=0"
      );
    }
  },
  "plus-morph": {
    init: (element) => {
      gsap.set(element.querySelector(".horizontal"), {
        rotation: 0
      });
      gsap.set(element.querySelector(".vertical"), {
        rotation: 0
      });
      gsap.set(element, {
        rotation: 0
      });
    },
    activate: (element) => {
      gsap.to(element, {
        rotation: 405,
        ease: "power1.inOut",
        duration: 0.7
      });
    },
    deactivate: (element) => {
      gsap.to(element, {
        rotation: 0,
        ease: "power1.inOut",
        duration: 0.7
      });
    }
  },
  "circle-pulse": {
    init: (element) => {
      gsap.set(element.querySelector(".circle"), {
        scale: 1
      });
      gsap.set(element.querySelector(".ring"), {
        scale: 0.5,
        opacity: 0
      });
      gsap.set(element.querySelector(".wave"), {
        scale: 0.5,
        opacity: 0
      });
      gsap.set(element.querySelectorAll(".particle"), {
        x: 0,
        y: 0,
        scale: 1
      });
    },
    activate: (element) => {
      // Center circle animation
      gsap.to(element.querySelector(".circle"), {
        scale: 0.7,
        ease: "power2.out",
        duration: 0.4
      });
      // Simple ring expansion
      gsap.to(element.querySelector(".ring"), {
        scale: 1.5,
        width: 12,
        height: 12,
        opacity: 0.8,
        ease: "power2.out",
        duration: 0.5
      });
      // Wave expansion
      gsap.to(element.querySelector(".wave"), {
        scale: 2.5,
        width: 12,
        height: 12,
        opacity: 0.4,
        ease: "power1.out",
        duration: 0.8
      });
      // Particles placed evenly around center
      const particles = element.querySelectorAll(".particle");
      particles.forEach((particle, i) => {
        const angle = (i / particles.length) * Math.PI * 2;
        const distance = 24;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        gsap.to(particle, {
          x: x,
          y: y,
          ease: "power2.out",
          duration: 0.5,
          delay: i * 0.05
        });
      });
    },
    deactivate: (element) => {
      // Simple reset animations
      gsap.to(element.querySelector(".circle"), {
        scale: 1,
        ease: "power2.out",
        duration: 0.4
      });
      gsap.to(element.querySelector(".ring"), {
        scale: 0.5,
        width: 12,
        height: 12,
        opacity: 0,
        ease: "power2.in",
        duration: 0.4
      });
      gsap.to(element.querySelector(".wave"), {
        scale: 0.5,
        width: 12,
        height: 12,
        opacity: 0,
        ease: "power2.in",
        duration: 0.4
      });
      gsap.to(element.querySelectorAll(".particle"), {
        x: 0,
        y: 0,
        ease: "power2.in",
        duration: 0.4
      });
    }
  },
  "cube-spin": {
    init: (element) => {
      gsap.set(element.querySelector(".cube"), {
        rotationY: 0
      });
    },
    activate: (element) => {
      gsap.to(element.querySelector(".cube"), {
        rotationY: -450,
        ease: "circleEase",
        duration: 1.2
      });
    },
    deactivate: (element) => {
      gsap.to(element.querySelector(".cube"), {
        rotationY: 0,
        ease: "circleEase",
        duration: 1.2
      });
    }
  },
  "stacked-circles": {
    init: (element) => {
      const circles = element.querySelectorAll(".circle");
      const positions = [0, 5, 10, 15, 20];
      const opacities = [1, 0.8, 0.6, 0.4, 0.2];
      circles.forEach((circle, i) => {
        gsap.set(circle, {
          x: positions[i],
          opacity: opacities[i]
        });
      });
    },
    activate: (element) => {
      const circles = element.querySelectorAll(".circle");
      gsap.to(circles[0], {
        x: -40,
        ease: "circleEase",
        duration: 0.6
      });
      gsap.to(circles[1], {
        x: -20,
        ease: "circleEase",
        duration: 0.6
      });
      gsap.to(circles[2], {
        x: 0,
        ease: "circleEase",
        duration: 0.6
      });
      gsap.to(circles[3], {
        x: 20,
        ease: "circleEase",
        duration: 0.6
      });
      gsap.to(circles[4], {
        x: 40,
        ease: "circleEase",
        duration: 0.6
      });
    },
    deactivate: (element) => {
      const circles = element.querySelectorAll(".circle");
      const positions = [0, 5, 10, 15, 20];
      circles.forEach((circle, i) => {
        gsap.to(circle, {
          x: positions[i],
          ease: "circleEase",
          duration: 0.6
        });
      });
    }
  },
  "rotating-circles": {
    init: (element) => {
      const circles = element.querySelectorAll(".circle");
      const containerWidth = 60; // Width of the container
      const circleWidth = 10; // Width of each circle
      const spacing = -2; // Negative spacing for overlap
      const totalWidth = (circleWidth + spacing) * 5 + circleWidth; // Total width of all circles including overlap
      const startX = (containerWidth - totalWidth) / 2; // Starting X position to center the line
      // Set initial horizontal line position - centered in the container with overlap
      circles.forEach((circle, index) => {
        gsap.set(circle, {
          left: startX + (circleWidth + spacing) * index,
          top: "50%",
          opacity: 1 - index * 0.1, // Decreasing opacity
          transform: "translateY(-50%)",
          zIndex: 6 - index // Decreasing z-index
        });
      });
    },
    activate: (element) => {
      const circles = element.querySelectorAll(".circle");
      const centerX = 30; // Center X position
      const centerY = 30; // Center Y position
      // Kill any existing animations
      gsap.killTweensOf(circles);
      gsap.killTweensOf(element);
      // Create a timeline for the animation
      const tl = gsap.timeline();
      // STEP 1: Briefly gather all circles to exact center
      tl.to(circles, {
        left: centerX,
        top: centerY,
        xPercent: -50,
        yPercent: -50,
        opacity: 1, // Make all circles full white
        duration: 0.2, // Very quick animation
        ease: "power2.inOut",
        stagger: 0.02 // Quick stagger
      });
      // STEP 2: Arrange them in a circle
      // Calculate positions for a perfect circle
      const radius = 15; // Radius for the circle
      // Position circles in a perfect circle formation
      const angles = [270, 330, 30, 90, 150, 210]; // Angles in degrees (starting from top, going clockwise)
      // Animate each circle to its position in the circle
      circles.forEach((circle, index) => {
        const angle = (angles[index] * Math.PI) / 180; // Convert to radians
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        tl.to(
          circle,
          {
            left: x,
            top: y,
            xPercent: -50,
            yPercent: -50,
            duration: 0.4,
            ease: "power2.out", // Smoother easing to prevent jumping
            delay: 0.05 * index // Sequential delay based on index
          },
          0.3
        ); // Start after the gather animation
      });
    },
    deactivate: (element) => {
      const circles = element.querySelectorAll(".circle");
      const centerX = 30; // Center X position
      const centerY = 30; // Center Y position
      // Create a timeline for the reverse animation
      const tl = gsap.timeline();
      // STEP 1: Gather all circles back to center
      tl.to(circles, {
        left: centerX,
        top: centerY,
        xPercent: -50,
        yPercent: -50,
        duration: 0.3,
        ease: "power2.inOut",
        stagger: 0.02
      });
      // STEP 2: Return to the horizontal line with overlap
      const containerWidth = 60; // Width of the container
      const circleWidth = 10; // Width of each circle
      const spacing = -2; // Negative spacing for overlap
      const totalWidth = (circleWidth + spacing) * 5 + circleWidth; // Total width of all circles including overlap
      const startX = (containerWidth - totalWidth) / 2; // Starting X position to center the line
      // Animate each circle back to its original position in the line
      circles.forEach((circle, index) => {
        tl.to(
          circle,
          {
            left: startX + (circleWidth + spacing) * index,
            top: "50%",
            xPercent: 0,
            yPercent: -50,
            opacity: 1 - index * 0.1, // Decreasing opacity
            zIndex: 6 - index, // Decreasing z-index
            duration: 0.25,
            ease: "power2.out" // Smoother easing to prevent jumping
          },
          index === 0 ? "+=0.2" : "-=0.15"
        ); // Overlap for all except the first one
      });
    }
  },
  "isometric-cube": {
    init: (element) => {
      // Set initial isometric view
      gsap.set(element.querySelector(".cube"), {
        rotateX: 35.264, // Standard isometric X angle
        rotateY: 45, // Standard isometric Y angle
        rotateZ: 0
      });
    },
    activate: (element) => {
      const cube = element.querySelector(".cube");
      // Create a timeline for the rotation
      const tl = gsap.timeline();
      // Rotate around the Y axis while maintaining the isometric view
      // Add an extra full rotation (360 degrees) to make it spin more
      tl.to(cube, {
        rotateY: 45 + 180 + 360, // Maintain 45° Y rotation + 180° to show back face + 360° extra rotation
        duration: 0.8,
        ease: "power2.inOut"
      });
    },
    deactivate: (element) => {
      const cube = element.querySelector(".cube");
      // Create a timeline for the rotation back
      const tl = gsap.timeline();
      // Rotate back to show the front face with the + symbol
      // Add an extra full rotation (360 degrees) to make it spin more
      tl.to(cube, {
        rotateY: 45 + 360, // Back to original 45° Y rotation + 360° extra rotation
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: function () {
          // Reset to 45 degrees after animation completes
          gsap.set(cube, {
            rotateY: 45
          });
        }
      });
    }
  },
  "expanding-circles": {
    init: (element) => {
      const circles = element.querySelectorAll(
        ".circle:not(.extra):not(.micro)"
      );
      const extraCircles = element.querySelectorAll(".circle.extra");
      const microCircles = element.querySelectorAll(".circle.micro");
      const centerX = 30; // Center X position
      const centerY = 30; // Center Y position
      const radius = 15; // Radius for the initial circle
      // Position the initial 6 circles in a perfect circle
      circles.forEach((circle, i) => {
        const angle = (i * 60 * Math.PI) / 180; // 60 degrees apart
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        gsap.set(circle, {
          left: x,
          top: y,
          xPercent: -50,
          yPercent: -50
        });
      });
      // Hide the extra circles initially
      gsap.set(extraCircles, {
        opacity: 0,
        scale: 0
      });
      // Hide the micro circles initially
      gsap.set(microCircles, {
        opacity: 0,
        scale: 0
      });
    },
    activate: (element) => {
      const circles = element.querySelectorAll(
        ".circle:not(.extra):not(.micro)"
      );
      const extraCircles = element.querySelectorAll(".circle.extra");
      const microCircles = element.querySelectorAll(".circle.micro");
      const centerX = 30; // Center X position
      const centerY = 30; // Center Y position
      // Kill any existing animations
      gsap.killTweensOf(circles);
      gsap.killTweensOf(extraCircles);
      gsap.killTweensOf(microCircles);
      gsap.killTweensOf(element);
      // Create a timeline for the animation
      const tl = gsap.timeline();
      // STEP 1: Start rotating the initial circle formation with acceleration
      // Use a custom ease that starts slow, accelerates in the middle, and slows down at the end
      tl.to(element, {
        rotation: 360, // Full rotation
        duration: 1.2, // Longer duration for more control
        ease: "power1.inOut" // Slow start, fast middle, slow end
      });
      // STEP 2: During the fastest part of the rotation (middle), add the extra circles
      // Position and show the extra circles between the existing ones
      const radius = 15; // Same radius as initial circles
      // Position the extra circles at 30, 90, 150, 210, 270, 330 degrees (between the original circles)
      extraCircles.forEach((circle, index) => {
        const angle = ((index * 60 + 30) * Math.PI) / 180; // 60 degrees apart, offset by 30 degrees
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        // Position and show the extra circles during the fastest part of the rotation
        tl.to(
          circle,
          {
            left: x,
            top: y,
            xPercent: -50,
            yPercent: -50,
            opacity: 1,
            scale: 1,
            duration: 0.1, // Very fast appearance
            ease: "power1.out"
          },
          0.5
        ); // Start at the middle of the rotation (fastest part)
      });
      // STEP 3: Very quickly show the micro circles to fill the gaps
      // Position the micro circles to fill the gaps between all circles
      microCircles.forEach((circle, index) => {
        const angle = (index * 30 * Math.PI) / 180; // 30 degrees apart for more density
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        // Position and show the micro circles with a very fast animation
        tl.to(
          circle,
          {
            left: x,
            top: y,
            xPercent: -50,
            yPercent: -50,
            opacity: 0.8,
            scale: 1,
            duration: 0.05, // Extremely fast appearance
            ease: "power1.out"
          },
          0.55
        ); // Right after the extra circles, still during the fastest part
      });
      // STEP 4: Scale down all circles slightly to make room
      tl.to(
        [...circles, ...extraCircles],
        {
          scale: 0.8,
          duration: 0.1, // Very fast scale
          ease: "power1.inOut"
        },
        0.55
      ); // At the same time as the micro circles
    },
    deactivate: (element) => {
      const circles = element.querySelectorAll(
        ".circle:not(.extra):not(.micro)"
      );
      const extraCircles = element.querySelectorAll(".circle.extra");
      const microCircles = element.querySelectorAll(".circle.micro");
      // Create a timeline for the reverse animation
      const tl = gsap.timeline();
      // STEP 1: Start rotating back
      tl.to(element, {
        rotation: 720, // Two full rotations for the reverse
        duration: 1.2,
        ease: "power1.inOut"
      });
      // STEP 2: Hide the micro circles first
      tl.to(
        microCircles,
        {
          opacity: 0,
          scale: 0,
          duration: 0.2,
          ease: "power1.in"
        },
        0.3
      );
      // STEP 3: Scale up the remaining circles back to original size
      tl.to(
        [...circles, ...extraCircles],
        {
          scale: 1,
          duration: 0.2,
          ease: "power1.out"
        },
        0.4
      );
      // STEP 4: Hide the extra circles
      tl.to(
        extraCircles,
        {
          opacity: 0,
          scale: 0,
          duration: 0.2,
          ease: "power1.in"
        },
        0.5
      );
    }
  }
};
// Initialize animations and set up corner effects on page load
document.addEventListener("DOMContentLoaded", function () {
  // Initialize all menu animations
  document.querySelectorAll(".menu-container").forEach((container) => {
    const menuElement = container.children[0];
    const type = menuElement.className;
    // Apply initial state if config exists
    if (animationConfigs[type] && animationConfigs[type].init) {
      animationConfigs[type].init(menuElement);
    }
    // Click event handler
    container.addEventListener("click", () => {
      const isActive = menuElement.classList.toggle("active");
      // Run animation based on state and check if config exists
      if (animationConfigs[type]) {
        if (isActive && animationConfigs[type].activate) {
          animationConfigs[type].activate(menuElement);
        } else if (!isActive && animationConfigs[type].deactivate) {
          animationConfigs[type].deactivate(menuElement);
        }
      }
    });
  });
  // Setup corner animations
  const containers = document.querySelectorAll(".animation-container");
  containers.forEach((container) => {
    const corners = container.querySelectorAll(".corner");
    // Set initial state
    gsap.set(corners, {
      opacity: 0
    });
    // Create hover animation
    container.addEventListener("mouseenter", () => {
      gsap.to(corners, {
        opacity: 1,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.out"
      });
    });
    // Create leave animation
    container.addEventListener("mouseleave", () => {
      gsap.to(corners, {
        opacity: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.in"
      });
    });
  });
});