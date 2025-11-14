from django.urls import path
from .views import home, get_current_weather

urlpatterns = [
    path('weather/', home),
    path("weather/current/", get_current_weather, name="current_weather"),

]
