if (typeof OPENWEATHER_API_KEY === "undefined") {
  alert("API key is missing. Please check config.js.");
  throw new Error("API key missing");
}

const weatherContainer = document.getElementById("weatherContainer");
const loadingEl = document.getElementById("loading");
const weatherDetailsEl = document.getElementById("weatherDetails");

async function fetchWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) {
    alert("Please enter a city name.");
    return;
  }
  await getWeatherDataByCity(city);
}

document.getElementById("locationBtn").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      getWeatherDataByCoords(latitude, longitude);
    },
    () => alert("Location access denied.")
  );
});

async function getWeatherDataByCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  await fetchAndDisplayWeather(url);
}

async function getWeatherDataByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  await fetchAndDisplayWeather(url);
}

async function fetchAndDisplayWeather(url) {
  showLoading(true);
  try {
    const weatherRes = await fetch(url);
    const weatherData = await weatherRes.json();

    if (!weatherRes.ok || !weatherData.main) {
      throw new Error("Invalid weather data");
    }

    const { name, main, weather, coord } = weatherData;

    document.getElementById("cityName").innerText = name;
    document.getElementById("temperature").innerText = `${main.temp.toFixed(1)}°C`;
    document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${coord.lat}&lon=${coord.lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const forecastRes = await fetch(forecastUrl);
    const forecastData = await forecastRes.json();

    displayForecast(forecastData.list);
    weatherDetailsEl.classList.remove("hidden");
  } catch (error) {
    console.error(error);
    alert("Failed to load weather data.");
  } finally {
    showLoading(false);
  }
}

function displayForecast(forecastList) {
  const forecastEl = document.getElementById("forecast");
  forecastEl.innerHTML = "";

  const grouped = {};

  forecastList.forEach(item => {
    const date = new Date(item.dt_txt);
    const day = date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(item);
  });

  const nextThreeDays = Object.keys(grouped).slice(1, 4); // skip today

  nextThreeDays.forEach(day => {
    const items = grouped[day];
    const sample = items[Math.floor(items.length / 2)];
    const icon = `https://openweathermap.org/img/wn/${sample.weather[0].icon}@2x.png`;
    const temp = sample.main.temp.toFixed(1);

    const card = document.createElement("div");
    card.className = "forecast-day";
    card.innerHTML = `<h4>${day}</h4><img src="${icon}" /><p>${temp}°C</p>`;
    forecastEl.appendChild(card);
  });
}

function showLoading(show) {
  loadingEl.classList.toggle("hidden", !show);
  weatherDetailsEl.classList.toggle("hidden", show);
}
