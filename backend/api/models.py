from django.db import models

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class AudioLoop(models.Model):
    # The display name and description
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    
    # Technical Metadata
    bpm = models.IntegerField()
    key = models.CharField(max_length=20)
    duration = models.FloatField()
    
    # Categorization for organisation
    GENRE_CHOICES = [
        ('lofi', 'Lofi'),
        ('ambient', 'Ambient'),
        ('synthwave', 'Synthwave'),
        ('nature', 'Nature/Textures'),
    ]
    genre = models.CharField(max_length=50, choices=GENRE_CHOICES)
    
    # Type to help users identify the type of loop and for organisation. 
    TYPE_CHOICES = [
        ('beat', 'Beat / Rhythm'),
        ('bass', 'Bassline'),
        ('chord', 'Chords / Pad'),
        ('melody', 'Melodic Lead'),
        ('texture', 'Atmospheric Texture'),
        ('vocal', 'Vocal/Chop'),
    ]
    loop_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='beat')

    # The actual file upload
    audio_file = models.FileField(upload_to='loops/')

    # When the file was created for database pruposes
    created_at = models.DateTimeField(auto_now_add=True)

    tags = models.ManyToManyField(Tag, blank=True)

    def __str__(self):
        return f"{self.name} ({self.bpm} BPM - {self.key})"