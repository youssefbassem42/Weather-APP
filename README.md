# 🌦️ Weather App

A simple and elegant weather application built with **Django (backend)** and **JavaScript (frontend)**.
It allows users to search for any city or country, fetch real-time weather based on current location, and displays full weather details with dynamic wallpapers.

---

## ✨ Features

### 🔍 1. Search for Any Country or City

Users can enter a city or country name, and the app fetches real-time weather using the OpenWeatherMap API.

---

### 📍 2. Fetch Current Location (Geolocation API)

A **location button** uses the browser's built-in **Geolocation API** to get the user's latitude and longitude.
The app then fetches current weather automatically.

---

### 🌤️ 3. Full Weather Details

The weather card displays comprehensive details such as:

* Temperature
* Weather condition (clear, rain, snow, etc.)
* Min / Max temperature
* Humidity
* Wind speed
* Feels like temperature
* Country + City name
* Local time (optional)

---

### 🖼️ 4. Automatic Dynamic Wallpaper

The background image changes based on the current weather condition:

* ☀️ Clear → sunny wallpaper
* ☁️ Clouds → cloudy wallpaper
* 🌧️ Rain → rainy wallpaper
* 🌨️ Snow → snow wallpaper
* 🌫️ Mist / Fog → misty wallpaper

This gives the app a **clean and immersive UI experience**.

---

## ⚙️ How It Works

### Backend (Django)

* Loads API key from `.env`
* Creates views that communicate with OpenWeather API
* Responds with JSON data to frontend requests

### Frontend (JavaScript)

* Handles search box input
* Fetches API data through Django endpoints
* Uses `navigator.geolocation` to get latitude/longitude
* Updates UI and applies dynamic background images

---

## 🚀 Getting Started

### 1. Install dependencies

```
pip install -r requirements.txt
```

### 2. Create `.env` and add your key

```
OPENWEATHER_API_KEY=your_api_key_here
```

### 3. Run the project

```
python manage.py runserver
```

## 📜 License

This project is open-source and free to use.


