from django.db import models

class JobPosition(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

class InterviewSession(models.Model):
    job_position = models.ForeignKey(JobPosition, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class CapturedData(models.Model):
    interview = models.ForeignKey(InterviewSession, on_delete=models.CASCADE)
    file = models.FileField(upload_to="uploads/")
    data_type = models.CharField(max_length=10, choices=[("image", "Image"), ("audio", "Audio")])
    timestamp = models.DateTimeField(auto_now_add=True)
