google.charts.load("current", { packages: ["corechart", "bar"] });

google.charts.setOnLoadCallback(drawChart);
google.charts.setOnLoadCallback(drawBarColors);
google.charts.setOnLoadCallback(drawLineChart);
google.charts.setOnLoadCallback(drawColumnchart);
function drawBarColors() {
  var data = google.visualization.arrayToDataTable([
    ["City", "2010 Population", "2000 Population"],
    ["New York City, NY", 8175000, 8008000],
    ["Los Angeles, CA", 3792000, 3694000],
    ["Chicago, IL", 2695000, 2896000],
    ["Houston, TX", 2099000, 1953000],
    ["Philadelphia, PA", 1526000, 1517000],
  ]);

  var options = {
    title: "Population of Largest U.S. Cities",
    chartArea: { width: "50%" },
    colors: ["#b0120a", "#ffab91"],
    hAxis: {
      title: "Total Population",
      minValue: 0,
    },
    vAxis: {
      title: "City",
    },
  };
  var chart = new google.visualization.BarChart(
    document.getElementById("chart_div")
  );
  chart.draw(data, options);
}

function drawChart() {
  var data = google.visualization.arrayToDataTable([
    ["Task", "Hours per Day"],
    ["Work", 11],
    ["Eat", 2],
    ["Commute", 2],
    ["Watch TV", 2],
    ["Sleep", 7],
  ]);

  var options = {
    title: "My Daily Activities",
  };

  var chart = new google.visualization.PieChart(
    document.getElementById("piechart")
  );

  chart.draw(data, options);
}

function drawLineChart() {
  var data = google.visualization.arrayToDataTable([
    ["Year", "Sales", "Expenses"],
    ["2004", 1000, 400],
    ["2005", 1170, 460],
    ["2006", 660, 1120],
    ["2007", 1030, 540],
  ]);

  var options = {
    title: "Company Performance",
    curveType: "function",
    legend: { position: "bottom" },
  };

  var chart = new google.visualization.LineChart(
    document.getElementById("curve_chart")
  );

  chart.draw(data, options);
}

function drawColumnchart() {
  var data = google.visualization.arrayToDataTable([
    ["Year", "Sales", "Expenses", "Profit"],
    ["2014", 1000, 400, 200],
    ["2015", 1170, 460, 250],
    ["2016", 660, 1120, 300],
    ["2017", 1030, 540, 350],
  ]);

  var options = {
    chart: {
      title: "Company Performance",
      subtitle: "Sales, Expenses, and Profit: 2014-2017",
    },
  };

  var chart = new google.charts.Bar(
    document.getElementById("columnchart_material")
  );

  chart.draw(data, google.charts.Bar.convertOptions(options));
}
