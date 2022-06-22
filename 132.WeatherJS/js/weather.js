class Weather {
  constructor() {
    this.apiKey = config.apikey;
    this.url = (city) =>
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}`;
  }
  async getWeatherByLocation(city) {
    const resp = await fetch(this.url(city));
    const respData = await resp.json();
    return respData;
  }
}
