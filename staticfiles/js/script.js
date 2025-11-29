const dom = {
  app: document.getElementById("weather-app"),
  temp: document.getElementById("current-temp"),
  city: document.getElementById("current-city"),
  time: document.getElementById("current-time"),
  date: document.getElementById("current-date"),
  condition: document.getElementById("weather-condition"),
  icon: document.getElementById("weather-icon"),
  cloud: document.getElementById("cloud-cover"),
  humidity: document.getElementById("humidity"),
  windSpeed: document.getElementById("wind-speed"),
  windDirection: document.getElementById("wind-direction"),
  form: document.getElementById("location-form"),
  cityInput: document.getElementById("city-input"),
  cityShortcuts: document.querySelectorAll(".city"),
  useLocationBtn: document.getElementById("use-location-btn"),
  statusBanner: document.getElementById("status-banner"),
  statusMessage: document.getElementById("status-message"),
  errorMessage: document.getElementById("error-message"),
};

const STATIC_BASE = document.body.dataset.staticUrl || "/static/";

const WALLPAPER_MAP = {
  day: {
    Clear: "images/day/clear.jpg",
    Clouds: "images/day/cloudy.jpg",
    Rain: "images/day/rainy.jpg",
    Drizzle: "images/day/rainy.jpg",
    Snow: "images/day/snowy.jpg",
    Thunderstorm: "images/day/rainy.jpg",
    Mist: "images/day/cloudy.jpg",
    Smoke: "images/day/cloudy.jpg",
    Haze: "images/day/cloudy.jpg",
    Dust: "images/day/cloudy.jpg",
    Fog: "images/day/cloudy.jpg",
    Sand: "images/day/cloudy.jpg",
    Ash: "images/day/cloudy.jpg",
    Squall: "images/day/rainy.jpg",
    Tornado: "images/day/rainy.jpg",
  },
  night: {
    Clear: "images/night/clear.jpg",
    Clouds: "images/night/cloudy.jpg",
    Rain: "images/night/rainy.jpg",
    Drizzle: "images/night/rainy.jpg",
    Snow: "images/night/snowy.jpg",
    Thunderstorm: "images/night/rainy.jpg",
    Mist: "images/night/cloudy.jpg",
    Smoke: "images/night/cloudy.jpg",
    Haze: "images/night/cloudy.jpg",
    Dust: "images/night/cloudy.jpg",
    Fog: "images/night/cloudy.jpg",
    Sand: "images/night/cloudy.jpg",
    Ash: "images/night/cloudy.jpg",
    Squall: "images/night/rainy.jpg",
    Tornado: "images/night/rainy.jpg",
  },
};

const DEFAULT_WALLPAPER = "images/day/clear.jpg";

function showStatus(message, variant = "info", timeout = 3000) {
  if (!dom.statusBanner || !dom.statusMessage) return;
  dom.statusBanner.hidden = false;
  dom.statusBanner.className = `status-banner ${variant}`;
  dom.statusMessage.textContent = message;

  if (timeout) {
    setTimeout(() => {
      dom.statusBanner.hidden = true;
    }, timeout);
  }
}

function showError(message) {
  if (!dom.errorMessage) return;
  dom.errorMessage.hidden = false;
  dom.errorMessage.textContent = message;
}

function clearError() {
  if (!dom.errorMessage) return;
  dom.errorMessage.hidden = true;
  dom.errorMessage.textContent = "";
}

function buildWallpaperPath(condition, isDaytime) {
  const palette = isDaytime ? WALLPAPER_MAP.day : WALLPAPER_MAP.night;
  return palette[condition] || DEFAULT_WALLPAPER;
}

function formatWind(speedMs = 0) {
  return `${Math.round(speedMs * 3.6)} km/h`;
}

function formatDirection(deg = 0) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(deg / 45) % 8;
  return `${deg.toFixed(0)}° (${directions[index]})`;
}

function formatLocalTime(timestamp, timezoneOffset) {
  if (!timestamp || typeof timestamp !== "number") {
    const now = new Date();
    return {
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: now.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" }),
    };
  }
  const localMillis = (timestamp + (timezoneOffset || 0)) * 1000;
  const localDate = new Date(localMillis);
  return {
    time: localDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    date: localDate.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" }),
  };
}

function setWallpaper(condition, isDaytime) {
  if (!dom.app) return;
  const path = buildWallpaperPath(condition, isDaytime);
  dom.app.style.backgroundImage = `url(${STATIC_BASE}${path})`;
}

function renderWeather(data) {
  const { main = {}, name = "--", weather = [], wind = {}, clouds = {}, dt, timezone } = data;

  const weatherState = weather[0] || { main: "Clear", description: "" };
  const condition = weatherState.main;
  const iconCode = weatherState.icon;
  const isDaytime = iconCode ? iconCode.includes("d") : true;
  const { time, date } = formatLocalTime(dt, timezone);

  dom.temp.textContent = `${Math.round(main.temp ?? 0)}°`;
  dom.city.textContent = name || "Unknown";
  dom.time.textContent = time;
  dom.date.textContent = date;
  dom.condition.textContent = weatherState.description || condition;
  dom.icon.src = iconCode ? `https://openweathermap.org/img/wn/${iconCode}@2x.png` : "";
  dom.icon.alt = weatherState.description || condition;
  dom.cloud.textContent = `${clouds.all ?? "--"}%`;
  dom.humidity.textContent = `${main.humidity ?? "--"}%`;
  dom.windSpeed.textContent = formatWind(wind.speed || 0);
  dom.windDirection.textContent =
    typeof wind.deg === "number" ? formatDirection(wind.deg) : "--°";

  setWallpaper(condition, isDaytime);
}

async function fetchWeather(params) {
  clearError();
  showStatus("Fetching weather...", "info", 1500);
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`/weather/current/?${query}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Unable to fetch weather");
  }

  return data;
}

function handleGeolocationSuccess(position) {
  const { latitude, longitude } = position.coords;
  fetchWeather({ lat: latitude, lon: longitude })
    .then((data) => {
      renderWeather(data);
      showStatus(`Weather updated for ${data.name}`, "success");
    })
    .catch((error) => {
      showError(error.message);
      showStatus("Unable to load location weather", "error");
    });
}

function handleGeolocationError(error) {
  console.error("Location error:", error);
  showError("We couldn't access your GPS. Please search for a city instead.");
  showStatus("Location permission denied", "error");
}

function requestLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser.");
    return;
  }
  navigator.geolocation.getCurrentPosition(handleGeolocationSuccess, handleGeolocationError, {
    enableHighAccuracy: true,
    timeout: 10000,
  });
}

function handleSearchSubmit(event) {
  event.preventDefault();
  const value = dom.cityInput.value.trim();
  if (!value) {
    showError("Please type a city name before searching.");
    return;
  }

  fetchWeather({ city: value })
    .then((data) => {
      renderWeather(data);
      dom.cityInput.value = "";
      showStatus(`Weather updated for ${data.name}`, "success");
    })
    .catch((error) => {
      showError(error.message);
      showStatus("Search failed", "error");
    });
}

function handleCityShortcutClick(event) {
  const { city } = event.currentTarget.dataset;
  if (!city) return;
  dom.cityInput.value = city;
  fetchWeather({ city })
    .then((data) => {
      renderWeather(data);
      showStatus(`Weather updated for ${data.name}`, "success");
    })
    .catch((error) => {
      showError(error.message);
      showStatus("Search failed", "error");
    });
}

function init() {
  setWallpaper("Clear", true);
  showStatus("Tap 'Use my location' or search for a city");
  dom.useLocationBtn?.addEventListener("click", requestLocation);
  dom.form?.addEventListener("submit", handleSearchSubmit);
  dom.cityShortcuts.forEach((cityBtn) =>
    cityBtn.addEventListener("click", handleCityShortcutClick)
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

