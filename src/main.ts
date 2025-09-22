import "./style.css";
import descriptionWeatherCode from "../descriptions.json";

// Необходимые типы для проекта
type TCities = {
  title: string;
  timezone: string;
  cords: TCords;
};

type TCords = {
  latitude: string;
  longitude: string;
}

type TWeather = {
  current: string;
  forecast_days: string;
  wind_speed_unit: string;
};

type ResponseData = {
  city: string;
  temperature: string;
  relative_humidity: string;
  precipitation: string;
  wind_speed: string;
  time: string;
  description_main: string;
  icon_weather: string;
}

// Массив данных городов
const citiesParametrs: TCities[] = [
  {
    title: "Koszalin",
    cords: {
      latitude: "54.1944",
      longitude: "16.1722"
    },
    timezone: "Europe/Berlin"
  },
  {
    title: "Oslo",
    cords: {
      latitude: "59.9127",
      longitude: "10.7461"
    },
    timezone: "Europe/London"
  },
  {
    title: "New York",
    cords: {
      latitude: "40.710335",
      longitude: "-73.99309"
    },
    timezone: "America/New_York"
  }
]

// Поиск контейнера для загрузки карточек
const mainBox = document.querySelector(".main-box");

// Функция для обработки информации с API
async function loadData (cities: TCities) {
  // Объект с базовыми параметрами для всех карточек
  const baseParametrs: TWeather = {
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation",
      "wind_speed_10m",
      "weather_code",
    ].join(","),
    forecast_days: "1",
    wind_speed_unit: "ms"
  }

  // Fetch
  const searchParams = new URLSearchParams({
    ...baseParametrs,
    ...cities.cords,
    timezone: cities.timezone
  })

  const requestResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?${searchParams}`,
    {
      method: "GET",
    }
  );

  const requestData = await requestResponse.json();

  // Проверка на тему браузера(светлая или темная)
  const isDarkTheme = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
  const theme = isDarkTheme ? "night" : "day";

  // Подстановка данных из descriptions.json
  const weatherCode =
    requestData.current.weather_code.toString() as keyof typeof descriptionWeatherCode;
  const weatherIcon = descriptionWeatherCode[weatherCode][theme].image;
  const weatherName = descriptionWeatherCode[weatherCode][theme].description;

  const date = new Date(requestData.current.time);

  const requestDataForClient: ResponseData = {
    city: cities.title,
    temperature: `${requestData.current.temperature_2m} ${requestData.current_units.temperature_2m}`,
    relative_humidity: `${requestData.current.relative_humidity_2m} ${requestData.current_units.relative_humidity_2m}`,
    precipitation: `${requestData.current.precipitation} ${requestData.current_units.precipitation}`,
    wind_speed: `${requestData.current.wind_speed_10m} ${requestData.current_units.wind_speed_10m}`,
    time: date.getHours() + ":" + date.getMinutes().toString().padStart(2, "0"),
    description_main: weatherName,
    icon_weather: weatherIcon
  }

  return requestDataForClient
}

// Функция для подстановки данных в DOM дерево
async function init() {
  const forecasts = await Promise.all(
    citiesParametrs.map(city => loadData(city))
  )

  const forecastData = forecasts.map(forecast => createBox(forecast));

  if (mainBox) {
    mainBox.innerHTML = "";
    mainBox.insertAdjacentHTML("beforeend", forecastData.join(""));
  }
}

// Функция для создания контейнера в DOM дереве
// ВАЖНО!!! Вставить картинки
function createBox(request: ResponseData) {
  return `<div class="box-style">
    <div class="city">${request.city}</div>
    <div class="time">${request.time}</div>
    <div class="temperature">${request.temperature}</div>
    <div class="description-main">${request.description_main}</div>
    <div class="parameters-box">
      <div class="relative-humidity flex-box"><img src="" class="parameters-icons"><span class="relative-humidity-info">${request.relative_humidity}</span></div>
      <div class="precipitation flex-box"><img src="" class="parameters-icons"><span class="precipitation-info">${request.precipitation}</span></div>
      <div class="wind-speed flex-box"><img src="" class="parameters-icons"><span class="wind-speed-info">${request.wind_speed}</span></div>
    </div>
    <img src="${request.icon_weather}" class="icon-weather">
  </div>`;
}

init();

setInterval(init, 6000);