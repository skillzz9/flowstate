from django.shortcuts import render

from rest_framework import generics
from .models import AudioLoop
from .serializers import AudioLoopSerializer

class AudioLoopList(generics.ListAPIView):
    queryset = AudioLoop.objects.all()
    serializer_class = AudioLoopSerializer
