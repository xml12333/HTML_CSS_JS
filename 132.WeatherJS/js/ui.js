class UI {
  constructor() {
    this.location = document.getElementById("w-location");
    this.wdesc = document.getElementById("w-desc");
    this.wstring = document.getElementById("w-string");
    this.details = document.getElementById("w-details");
    this.icon = document.getElementById("w-icon");
    this.humidity = document.getElementById("w-humidity");
    this.feelsLike = document.getElementById("w-feels-like");
    this.dewpoint = document.getElementById("w-dewpoint");
    this.wind = document.getElementById("w-wind");
  }

  paint(weather) {
    this.location.textContent = `${weather.name} ,${weather.sys.country}`;
    this.wdesc.textContent = this.capitalizeFirstLetter(
      weather.weather[0].description
    );
    this.wstring.textContent = this.KtoC(weather.main.temp) +' C';
    this.icon.setAttribute(
      "src",
      `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`
    );
    this.humidity.textContent = `Reletive Humidity: ${weather.main.humidity}`;
    this.feelsLike.textContent = `Feels like: ${this.KtoC(
      weather.main.feels_like
    )}`;
    this.dewpoint.textContent = `Pressure: ${weather.main.pressure}`;
    this.wind.textContent = `Wind speed: ${weather.wind.speed}`;
  }
  KtoC(K) {
    return Math.floor(K - 273.15);
  }
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
