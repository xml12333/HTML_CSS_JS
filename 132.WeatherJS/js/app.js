const weather = new Weather();
const ui = new UI();
const storage = new Storage();

const weatherLocation = storage.getLocationData();

document.addEventListener("DOMContentLoaded", getWeather);

document.getElementById("w-change-btn").addEventListener("click", (e) => {
  const city = document.getElementById("city").value;
  getWeather(city);
  storage.setLocationData(city);
  $("#locModal").modal("hide");
});

function getWeather(cityName) {
  cityName = weatherLocation.city;
  weather.getWeatherByLocation(cityName).then((data) => {
    ui.paint(data);
  });
}
