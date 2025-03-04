from django.db import models

class JobPosition(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()

    def __str__(self):
        return self.title

class Candidate(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    job = models.ForeignKey(JobPosition, on_delete=models.CASCADE, related_name="candidates")

    def __str__(self):
        return self.name


class Capture(models.Model):
    file = models.FileField(upload_to="captures/")
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file.name
