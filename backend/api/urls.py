from django.urls import path
from .views import AudioLoopList

urlpatterns = [
    path('loops/', AudioLoopList.as_view(), name='loop-list'),
]