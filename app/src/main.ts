import './style.css'
import descriptionWeatherCode from '../descriptions.json'

// https://api.open-meteo.com/v1/forecast?latitude=54.1944&longitude=16.1722&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m&timezone=Europe%2FBerlin&forecast_days=1&wind_speed_unit=ms

type ICoord = {
  latitude: string,
  longitude: string,
}

type IWeather = {
  // timezone: string,
  current: string,
  forecast_days: string,
  wind_speed_unit: string
}

const coors: ICoord = {
  latitude: "54.1944",
  longitude: "16.1722"
}

const weather: IWeather = {
  current: ['temperature_2m', 'relative_humidity_2m', 'precipitation', 'rain', 'wind_speed_10m', 'weather_code'].join(","),
  // timezone: 'Europe%2FBerlin',
  forecast_days: "1",
  wind_speed_unit: 'ms'
}

const searchParams = new URLSearchParams({
  ...coors,
  ...weather
})

const titleCity = 'Koszalin';

async function requestGet() {
  const city = document.querySelector(".city");
  const time = document.querySelector(".time")
  const temperature = document.querySelector(".temperature");
  const relativeHumidity = document.querySelector(".relative_humidity");
  const precipitation = document.querySelector(".precipitation");
  const rain = document.querySelector(".rain");
  const windSpeed = document.querySelector(".wind_speed");
  const icon = document.querySelector(".icon") as HTMLImageElement | null;
  const requestResponse = await fetch(`https://api.open-meteo.com/v1/forecast?${searchParams}`, {
    method: "GET"
  })
  const requestData = await requestResponse.json();
  const weatherCode = requestData.current.weather_code.toString() as keyof typeof descriptionWeatherCode;
  const weatherIcon = descriptionWeatherCode[weatherCode].day.image;

  if (city) {
    city.textContent = titleCity;
  }
  if (icon) {
  icon.src =  weatherIcon;
  }
  if (time) {
    time.textContent = requestData.current.time;
  }
  if (temperature) {
    temperature.textContent = `${requestData.current.temperature_2m} ${requestData.current_units.temperature_2m}`;
  }
  if (relativeHumidity) {
    relativeHumidity.textContent = `${requestData.current.relative_humidity_2m} ${requestData.current_units.relative_humidity_2m}`;
  }
  if (precipitation) {
    precipitation.textContent = `${requestData.current.precipitation} ${requestData.current_units.precipitation}`;
  }
  if (rain) {
    rain.textContent = `${requestData.current.rain} ${requestData.current_units.rain}`;
  }
  if (windSpeed) {
    windSpeed.textContent = `${requestData.current.wind_speed_10m} ${requestData.current_units.wind_speed_10m}`;
  }
}

requestGet();

setInterval(requestGet, 15 * 60 * 1000);