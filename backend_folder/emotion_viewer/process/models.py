from django.db import models

class ProcessedFile(models.Model):
    FILE_TYPES = [("image", "Image"), ("audio", "Audio")]

    file = models.FileField(upload_to="captures/")
    file_type = models.CharField(max_length=10, choices=FILE_TYPES)
    result = models.TextField(blank=True, null=True)  # Store AI model output
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file_type} - {self.timestamp}"
