var config = {},
  CANVAS = "canvas",
  SVG = "svg";

$(function () {
  var $body = $(document.body),
    $window = $(window);

  // Background
  var canvas = document.createElement("canvas");

  backgroundEnabled =
    canvas.getContext &&
    canvas.getContext("2d") &&
    $("#background-container").css("display") != "none";

  if (backgroundEnabled) {
    config.background = {
      enabled: true,

      RENDER: {
        // Takes all the information in a Scene and renders it to a context.
        // A Scene sits at the very top of the stack. It simply manages arrays of Mesh & Light objects.
        renderer: "svg",
      },

      MESH: {
        ambient: "#6e7082", // Default
        diffuse: "#FFFFFF", // Default
        width: 1.1, // Triangle Width
        height: 1.1, // Triangle Height
        depth: 15, // Transparency of the triangles
        segments: 15, // Number of triangles to display in 1 row
        slices: 13, // Number of triangles to display in 1 column
        xRange: 0.1, // Wideness of the triangles in X Position
        yRange: 0.37, // Wideness of the triangles in Y Position
        zRange: 1.0, // Wideness of the triangles in Z Position
        speed: 0.0028, // Speed of the moving traingles
      },

      LIGHT: {
        autopilot: true, // Set this to true if you want the light to follow your mouse cursor
        ambient: "#322a3f",
        diffuse: "#383047",
        count: 2, // Contrast
        zOffset: 56,

        xyScalar: 1,
        speed: 0.001,
        gravity: 1200,
        dampening: 0.15,
        minLimit: 8,
        maxLimit: null,
        minDistance: 20,
        maxDistance: 400,
        draw: false, // Set to true if you want to just draw a background image (static).
      },
    };

    // Ready made themes!
    // The styles replaces the daufault colors when a class is defined on the body tag.
    if ($body.hasClass("theme-ice")) {
      config.background.LIGHT.ambient = "#1165A4";
      config.background.LIGHT.diffuse = "#514311";
    } else if ($body.hasClass("theme-nature")) {
      config.background.LIGHT.ambient = "#00935B";
      config.background.LIGHT.diffuse = "#02480A";
    } else if ($body.hasClass("theme-sea")) {
      config.background.LIGHT.ambient = "#76E4CE";
      config.background.LIGHT.diffuse = "#0E411F";
      config.background.LIGHT.zOffset = 100;
    } else if ($body.hasClass("theme-candy")) {
      config.background.LIGHT.ambient = "#A42D71";
      config.background.LIGHT.diffuse = "#4E2F1B";
    } else if ($body.hasClass("theme-peach")) {
      config.background.LIGHT.ambient = "#FF7171";
      config.background.LIGHT.diffuse = "#895321";
      config.background.LIGHT.zOffset = 100;
    } else if ($body.hasClass("theme-light")) {
      config.background.LIGHT.ambient = "#DBAA95";
      config.background.LIGHT.diffuse = "#4F460B";
    } else if ($body.hasClass("theme-darkness")) {
      config.background.LIGHT.ambient = "#3C3C3C";
      config.background.LIGHT.diffuse = "#494949";
      config.background.LIGHT.zOffset = 200;
    }

    // Initialize the background
    initBackground();
  }
});
