from django.db import models
import uuid
from interview.models import Candidate  # Adjust this import based on your actual app structure

class Capture(models.Model):
    """Stores captured video and audio files"""
    file = models.FileField(upload_to="captures/")
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Capture at {self.timestamp}"

class InterviewSession(models.Model):
    """Session data for a candidate interview"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='interview_sessions')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    duration = models.IntegerField(help_text="Duration in seconds", null=True, blank=True)
    
    # Link to the actual capture data
    video_capture = models.ForeignKey(
        Capture, 
        on_delete=models.SET_NULL, 
        related_name='video_sessions', 
        null=True, 
        blank=True
    )
    audio_capture = models.ForeignKey(
        Capture, 
        on_delete=models.SET_NULL, 
        related_name='audio_sessions', 
        null=True, 
        blank=True
    )
    
    def __str__(self):
        return f"{self.candidate.name} - {self.title}"
    
    class Meta:
        ordering = ['-created_at']

class AnalysisResult(models.Model):
    """Overall analysis results for an interview session"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(InterviewSession, on_delete=models.CASCADE, related_name='analysis_results')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=[
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed')
    ], default='PENDING')
    error_message = models.TextField(blank=True, null=True)
    
    # Aggregated results
    overall_confidence_score = models.FloatField(null=True, blank=True)
    overall_confidence_category = models.CharField(max_length=50, null=True, blank=True)
    
    def __str__(self):
        return f"Analysis for {self.session.title}"

class VideoAnalysisPoint(models.Model):
    """Time series data from video analysis"""
    analysis = models.ForeignKey(AnalysisResult, on_delete=models.CASCADE, related_name='video_points')
    timestamp = models.FloatField(help_text="Timestamp in seconds from start of interview")
    confidence_score = models.FloatField()
    confidence_category = models.CharField(max_length=50)
    # Store any additional features that might be useful
    feature_data = models.JSONField(null=True, blank=True, help_text="Raw features used for analysis")
    
    class Meta:
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['analysis', 'timestamp']),
        ]

class AudioAnalysisPoint(models.Model):
    """Time series data from audio analysis"""
    analysis = models.ForeignKey(AnalysisResult, on_delete=models.CASCADE, related_name='audio_points')
    start_time = models.FloatField(help_text="Start timestamp in seconds")
    end_time = models.FloatField(help_text="End timestamp in seconds")
    confidence_score = models.FloatField()
    confidence_category = models.CharField(max_length=50)
    feature_data = models.JSONField(null=True, blank=True, help_text="Raw features used for analysis")
    
    class Meta:
        ordering = ['start_time']
        indexes = [
            models.Index(fields=['analysis', 'start_time']),
        ]

class AnalysisInsight(models.Model):
    """Key insights and markers in an interview analysis"""
    analysis = models.ForeignKey(AnalysisResult, on_delete=models.CASCADE, related_name='insights')
    timestamp = models.FloatField(help_text="Timestamp in seconds from start of interview")
    insight_type = models.CharField(max_length=50, choices=[
        ('CONFIDENCE_PEAK', 'Confidence Peak'),
        ('CONFIDENCE_DROP', 'Confidence Drop'),
        ('STRESS_PEAK', 'Stress Peak'),
        ('STRESS_DROP', 'Stress Drop'),
        ('KEY_MOMENT', 'Key Moment')
    ])
    description = models.TextField()
    severity = models.IntegerField(default=1, help_text="1-10 scale of importance")
    
    class Meta:
        ordering = ['timestamp']