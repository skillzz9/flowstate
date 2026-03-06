from rest_framework import serializers
from .models import AudioLoop, Tag

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['name']

class AudioLoopSerializer(serializers.ModelSerializer):
    # This ensures your Next.js app gets ["Atmospheric", "Intense"] 
    # instead of [1, 3]
    tags = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name'
    )

    class Meta:
        model = AudioLoop
        fields = ['id', 'name', 'description', 'bpm', 'key', 'loop_type', 'genre', 'tags', 'audio_file']