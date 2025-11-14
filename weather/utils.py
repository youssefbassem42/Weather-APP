from django.conf import settings
import requests

def get_weather(city_name):
    url = f'https://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={settings.OPENWEATHER_API_KEY}'
    response = requests.get(url)
    return response.json()
