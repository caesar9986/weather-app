import "./style.css";
import descriptionWeatherCode from "../descriptions.json";

// Типы TCoord и TWeather для координат городов и параметров погоды
type TCoord = {
  latitude: string;
  longitude: string;
};

type TWeather = {
  timezone: string;
  current: string;
  forecast_days: string;
  wind_speed_unit: string;
};

// Координаты и параметры города №1
const coorsCity1: TCoord = {
  latitude: "54.1944",
  longitude: "16.1722",
};

const weatherCity1: TWeather = {
  current: [
    "temperature_2m",
    "relative_humidity_2m",
    "precipitation",
    "wind_speed_10m",
    "weather_code",
  ].join(","),
  timezone: "Europe/Berlin",
  forecast_days: "1",
  wind_speed_unit: "ms",
};

// Координаты и параментры города №2
const coorsCity2: TCoord = {
  latitude: "59.9127",
  longitude: "10.7461",
};

const weatherCity2: TWeather = {
  current: [
    "temperature_2m",
    "relative_humidity_2m",
    "precipitation",
    "wind_speed_10m",
    "weather_code",
  ].join(","),
  timezone: "Europe/London",
  forecast_days: "1",
  wind_speed_unit: "ms",
};

// Координаты и параметры города №3
const coorsCity3: TCoord = {
  latitude: "40.710335",
  longitude: "-73.99309",
};

const weatherCity3: TWeather = {
  current: [
    "temperature_2m",
    "relative_humidity_2m",
    "precipitation",
    "wind_speed_10m",
    "weather_code",
  ].join(","),
  timezone: "America/New_York",
  forecast_days: "1",
  wind_speed_unit: "ms",
};

// Переменные для использования в подключении к стороннему ресурсу
const searchParamsCity1 = new URLSearchParams({
  ...coorsCity1,
  ...weatherCity1,
});
const searchParamsCity2 = new URLSearchParams({
  ...coorsCity2,
  ...weatherCity2,
});
const searchParamsCity3 = new URLSearchParams({
  ...coorsCity3,
  ...weatherCity3,
});

// Переменные с названиями городов
const titleCity1 = "Koszalin";
const titleCity2 = "Oslo";
const titleCity3 = "New York";

// Функция для создания контейнера в DOM дереве
function createBox(idBox: string, titleCity: string) {
  return `<div class="box-style box${idBox}">
    <div class="city">${titleCity}</div>
    <div class="time"></div>
    <div class="temperature"></div>
    <div class="description-main"></div>
    <div class="parameters-box">
      <div class="relative-humidity flex-box"><img src="" class="parameters-icons"><span class="relative-humidity-info"></span></div>
      <div class="precipitation flex-box"><img src="" class="parameters-icons"><span class="precipitation-info"></span></div>
      <div class="wind-speed flex-box"><img src="" class="parameters-icons"><span class="wind-speed-info"></span></div>
    </div>
    <img src="" class="icon-weather">
  </div>`;
}

// Создание контейнера на странице
document.body.insertAdjacentHTML("beforeend", createBox("1", titleCity1));
document.body.insertAdjacentHTML("beforeend", createBox("2", titleCity2));
document.body.insertAdjacentHTML("beforeend", createBox("3", titleCity3));

// Поиск контейнеров для дальнейшей загрузки информации в него
const searchBox1 = document.querySelector(".box1");
const searchBox2 = document.querySelector(".box2");
const searchBox3 = document.querySelector(".box3");

// Функция подключения к стороннему ресурсу и заполнения контейнера данными
async function requestGet(
  searchBox: Element | null,
  searchParams: URLSearchParams
) {

  // Проверка на наличие контейнера на сайте
  if (!searchBox) {
    console.error("Элемент с классом .box1 не найден");
    return;
  }

  // Поиск элементов в контейнере для заполнения данными
  const time = searchBox.querySelector(".time");
  const temperature = searchBox.querySelector(".temperature");
  const relativeHumidity = searchBox.querySelector(".relative-humidity-info");
  const precipitation = searchBox.querySelector(".precipitation-info");
  const windSpeed = searchBox.querySelector(".wind-speed-info");
  const searchWeatherName = searchBox.querySelector(".description-main");
  const icon = searchBox.querySelector(
    ".icon-weather"
  ) as HTMLImageElement | null;

  try {
    // Подключение к стороннему ресурсу
    const requestResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?${searchParams}`,
      {
        method: "GET",
      }
    );

    // Преобразование данных сайта в JSON формат
    const requestData = await requestResponse.json();

    // Проверка на тему браузера(светлая или темная)
    const isDarkTheme = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const theme = isDarkTheme ? "night" : "day";

    // Добавление описания и иконок погоды из файла description.json, так же иноки и описание меняются в зависимости от темы браузера
    const weatherCode =
      requestData.current.weather_code.toString() as keyof typeof descriptionWeatherCode;
    const weatherIcon = descriptionWeatherCode[weatherCode][theme].image;
    const weatherName = descriptionWeatherCode[weatherCode][theme].description;

    // Заполнение контейнера данными
    if (icon) {
      icon.src = weatherIcon;
    }
    if (time) {
      // Использование встроенного объекта Data для вывода времени на страницу, с помощью метода padStart выводим двойной 0
      let date = new Date(requestData.current.time);
      time.textContent =
        date.getHours() + ":" + date.getMinutes().toString().padStart(2, "0");
    }
    if (temperature) {
      temperature.textContent = `${requestData.current.temperature_2m} ${requestData.current_units.temperature_2m}`;
    }
    if (searchWeatherName) {
      searchWeatherName.textContent = weatherName;
    }
    if (relativeHumidity) {
      relativeHumidity.textContent = `${requestData.current.relative_humidity_2m} ${requestData.current_units.relative_humidity_2m}`;
    }
    if (precipitation) {
      precipitation.textContent = `${requestData.current.precipitation} ${requestData.current_units.precipitation}`;
    }
    if (windSpeed) {
      windSpeed.textContent = `${requestData.current.wind_speed_10m} ${requestData.current_units.wind_speed_10m}`;
    }
  }
  catch {
    console.error("Ошибка подключения open-meteo");
  }
}

// Вызов функций для 3-х разных городов
requestGet(searchBox1, searchParamsCity1);
requestGet(searchBox2, searchParamsCity2);
requestGet(searchBox3, searchParamsCity3);

// Функция для обновления запроса каждые 15 минут
setInterval(requestGet, 15 * 60 * 1000);