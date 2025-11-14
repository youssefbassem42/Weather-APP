from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_GET
import requests


def home(request):
    return render(request, "index.html")


def _fetch_openweather_data(params: dict):
    api_key = settings.OPENWEATHER_API_KEY
    base_url = "https://api.openweathermap.org/data/2.5/weather"
    query = {**params, "appid": api_key, "units": "metric"}
    response = requests.get(base_url, params=query, timeout=10)
    response.raise_for_status()
    return response.json()


@require_GET
def get_current_weather(request):
    lat = request.GET.get("lat")
    lon = request.GET.get("lon")
    city = request.GET.get("city")

    params = None
    if city:
        params = {"q": city}
    elif lat and lon:
        params = {"lat": lat, "lon": lon}

    if params is None:
        return JsonResponse({"error": "Missing coordinates or city"}, status=400)

    try:
        weather_payload = _fetch_openweather_data(params)
    except requests.exceptions.HTTPError as exc:
        status = exc.response.status_code if exc.response else 502
        message = exc.response.json().get("message", "Unable to fetch weather") if exc.response else str(exc)
        return JsonResponse({"error": message}, status=status)
    except requests.exceptions.RequestException:
        return JsonResponse({"error": "Weather service unreachable"}, status=503)

    return JsonResponse(weather_payload)
