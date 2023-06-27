function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function rgbToHsl(c) {
    var r = c.r / 255,
      g = c.g / 255,
      b = c.b / 255;
    var max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    var h,
      s,
      l = (max + min) / 2;
  
    if (max == min) {
      h = s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return new Array(h * 360, s * 100, l * 100);
  }
  function getaColor() {
    var colorob = {};
    colorob.r = getRandomInt(0, 255);
    colorob.g = getRandomInt(0, 255);
    colorob.b = getRandomInt(0, 255);
    colorob.avg = (colorob.r + colorob.g + colorob.b) / 3;
    colorob.hsl = rgbToHsl(colorob);
    return colorob;
  }
  let colors = [];
  let sortedcolors = [];
  function setupColors() {
    colors = [];
    for (var i = 0; 50 > i; i++) {
      var newcolor = getaColor();
      while (colors.indexOf(newcolor) !== -1) {
        // prevent duplicates
        newcolor = getaColor();
      }
      colors.push(newcolor);
    }
    sortedcolors = colors.sort(function (a, b) {
      var contentA = a.hsl[0];
      var contentB = b.hsl[0];
      return contentA > contentB ? -1 : contentA < contentB ? 1 : 0;
    });
  }
  function updateUI(rgbstring, avg) {
    if (avg >= 190) {
      document.querySelector(":root").style.setProperty("--iconbgcolor", "#000");
      document.querySelector(":root").style.setProperty("--fcolor", "#000");
    } else {
      document.querySelector(":root").style.setProperty("--iconbgcolor", "#fff");
      document.querySelector(":root").style.setProperty("--fcolor", "#fff");
    }
    document.querySelector(":root").style.setProperty("--bgcolor", rgbstring);
  }
  function writeColors() {
    var newhtml = "";
    for (var i = 0; sortedcolors.length > i; i++) {
      var rgbstring =
        "rgb(" +
        sortedcolors[i].r +
        ", " +
        sortedcolors[i].g +
        ", " +
        sortedcolors[i].b +
        ")";
      var avg = sortedcolors[i].avg;
      var hsl = sortedcolors[i].hsl;
  
      newhtml +=
        '<div style="left:' +
        hsl[1] +
        "%; top:" +
        hsl[2] +
        "%; transform: translateZ(" +
        hsl[0] +
        'px);" data-avg="' +
        avg +
        '" data-hsl="' +
        hsl +
        '"><div style="background:' +
        rgbstring +
        ';"></div><div style="background:' +
        rgbstring +
        ';"></div><div style="background:' +
        rgbstring +
        ';"></div><div style="background:' +
        rgbstring +
        ';"></div><div style="background:' +
        rgbstring +
        ';"></div><div style="background:' +
        rgbstring +
        ';"></div></div>';
      var numcolors = i + 1;
      $(".numbers").text(numcolors);
      updateUI(rgbstring, avg);
    }
    $(".colors").html(newhtml);
  }
  setupColors();
  $(function () {
    writeColors();
    $("body")
      .off("click", ".colors > div")
      .on("click", ".colors > div", function (e) {
        e.preventDefault();
        var selectvalue = $(this).find("div:first-child").css("background-color");
        var avg = parseFloat($(this).attr("data-avg"));
        updateUI(selectvalue, avg);
        $("body").append('<input id="copyme" readonly="true" />');
        $("#copyme").val(selectvalue);
        $("#copyme").select();
        document.execCommand("copy");
        $("#copyme").remove();
        $("#copied").remove();
        $("body").append(
          '<span id="copied">your color has been copied to clipboard</span>'
        );
        setTimeout(function () {
          $("#copied").fadeOut(1000);
        }, 500);
      })
      .off("click", "button")
      .on("click", "button", function () {
        setupColors();
        writeColors();
      });
  });
  