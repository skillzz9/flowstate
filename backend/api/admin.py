from django.contrib import admin
from .models import AudioLoop, Tag

admin.site.register(Tag)

@admin.register(AudioLoop)
class AudioLoopAdmin(admin.ModelAdmin):
    list_display = ('name', 'loop_type', 'bpm', 'key')
    # This allows you to search for tracks by their tags in the admin!
    filter_horizontal = ('tags',)