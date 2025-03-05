from django.db import models

# Create your models here.
from django.http import JsonResponse
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import (
    InterviewSession, 
    AnalysisResult, 
    VideoAnalysisPoint, 
    AudioAnalysisPoint, 
    AnalysisInsight
)
from .serializers import (
    InterviewSessionSerializer,
    AnalysisResultSerializer,
    VideoAnalysisPointSerializer,
    AudioAnalysisPointSerializer
)

# Import ML model functions - update this with your actual imports
from .ml_models import analyze_video_frame, analyze_audio_segment

@api_view(['POST'])
def analyze_interview(request):
    """
    Start analysis of an interview session
    """
    session_id = request.data.get('session_id')
    if not session_id:
        return Response({"error": "Session ID is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        session = InterviewSession.objects.get(id=session_id)
    except InterviewSession.DoesNotExist:
        return Response({"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Create analysis result record
    analysis = AnalysisResult.objects.create(
        session=session,
        status='PROCESSING'
    )
    
    # In a real-world scenario, you would trigger a Celery task here
    # For simplicity, we'll process directly in this view
    
    try:
        # Process video frames
        if session.video_capture:
            video_frames = extract_frames(session.video_capture.file.path)
            
            for frame_idx, frame in enumerate(video_frames):
                # Calculate timestamp based on frame index and FPS
                timestamp = frame_idx / 30.0  # assuming 30 FPS
                
                # Call your video ML model
                result = analyze_video_frame(frame)
                
                # Store the results
                VideoAnalysisPoint.objects.create(
                    analysis=analysis,
                    timestamp=timestamp,
                    confidence_score=result['confidence_score'],
                    confidence_category=result['category'],
                    feature_data=result['features']
                )
        
        # Process audio segments
        if session.audio_capture:
            # Implementation depends on how your audio is stored
            audio_segments = extract_audio_segments(session.audio_capture.file.path)
            
            for segment_idx, (start_time, end_time, segment) in enumerate(audio_segments):
                # Call your audio ML model
                result = analyze_audio_segment(segment)
                
                # Store the results
                AudioAnalysisPoint.objects.create(
                    analysis=analysis,
                    start_time=start_time,
                    end_time=end_time,
                    confidence_score=result['confidence_score'],
                    confidence_category=result['category'],
                    feature_data=result.get('features')
                )
        
        # Generate insights (this could be more sophisticated in a real system)
        generate_insights(analysis)
        
        # Update analysis record
        analysis.status = 'COMPLETED'
        analysis.completed_at = timezone.now()
        analysis.overall_confidence_score = calculate_overall_confidence(analysis)
        analysis.overall_confidence_category = categorize_confidence(analysis.overall_confidence_score)
        analysis.save()
        
        return Response({
            "status": "Analysis completed successfully",
            "analysis_id": analysis.id
        })
        
    except Exception as e:
        analysis.status = 'FAILED'
        analysis.error_message = str(e)
        analysis.save()
        return Response({
            "error": "Analysis failed",
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def extract_frames(video_path):
    """Extract frames from a video file"""
    # Implementation depends on your video processing library
    # Example with OpenCV:
    import cv2
    
    frames = []
    cap = cv2.VideoCapture(video_path)
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(frame)
    cap.release()
    
    return frames

def extract_audio_segments(audio_path, segment_duration=3.0):  # Changed to 3 seconds to match model
    """Extract audio segments from an audio file"""
    import librosa
    
    # Load audio with librosa instead of wave
    audio_data, sr = librosa.load(audio_path, sr=16000)  # Fixed sample rate for model
    
    segments = []
    segment_length = int(segment_duration * sr)
    
    # Split audio into segments
    for i in range(0, len(audio_data), segment_length):
        segment = audio_data[i:i+segment_length]
        if len(segment) < segment_length / 2:  # Skip very short segments
            continue
            
        start_time = i / sr
        end_time = min((i + len(segment)) / sr, len(audio_data) / sr)
        segments.append((start_time, end_time, segment))
    
    return segments

def generate_insights(analysis):
    """Generate insights from analysis data points"""
    # This is a simplified implementation
    # In a real system, you might use more sophisticated algorithms
    
    # Get all data points
    video_points = VideoAnalysisPoint.objects.filter(analysis=analysis).order_by('timestamp')
    audio_points = AudioAnalysisPoint.objects.filter(analysis=analysis).order_by('start_time')
    
    if not video_points and not audio_points:
        return
    
    # Find confidence peaks and drops in video
    if video_points:
        prev_score = None
        for i, point in enumerate(video_points):
            if prev_score is not None:
                # Detect significant changes
                if point.confidence_score - prev_score > 20:
                    AnalysisInsight.objects.create(
                        analysis=analysis,
                        timestamp=point.timestamp,
                        insight_type='CONFIDENCE_PEAK',
                        description='Significant confidence increase detected',
                        severity=min(10, int((point.confidence_score - prev_score) / 5))
                    )
                elif prev_score - point.confidence_score > 20:
                    AnalysisInsight.objects.create(
                        analysis=analysis,
                        timestamp=point.timestamp,
                        insight_type='CONFIDENCE_DROP',
                        description='Significant confidence decrease detected',
                        severity=min(10, int((prev_score - point.confidence_score) / 5))
                    )
            prev_score = point.confidence_score
    
    # Find stress peaks in audio
    if audio_points:
        for point in audio_points:
            if point.confidence_score < 30:
                AnalysisInsight.objects.create(
                    analysis=analysis,
                    timestamp=(point.start_time + point.end_time) / 2,
                    insight_type='STRESS_PEAK',
                    description='High stress detected in speech pattern',
                    severity=min(10, int((30 - point.confidence_score) / 3))
                )

def calculate_overall_confidence(analysis):
    """Calculate overall confidence score for the interview"""
    video_points = VideoAnalysisPoint.objects.filter(analysis=analysis)
    audio_points = AudioAnalysisPoint.objects.filter(analysis=analysis)
    
    video_avg = video_points.aggregate(models.Avg('confidence_score'))['confidence_score__avg'] or 0
    audio_avg = audio_points.aggregate(models.Avg('confidence_score'))['confidence_score__avg'] or 0
    
    # Weight video and audio differently if needed
    video_weight = 0.6
    audio_weight = 0.4
    
    if not video_points:
        return audio_avg
    if not audio_points:
        return video_avg
        
    return (video_avg * video_weight) + (audio_avg * audio_weight)

def categorize_confidence(score):
    """Convert numerical score to category"""
    if score >= 70:
        return 'Confident'
    elif score >= 40:
        return 'Neutral'
    else:
        return 'Stressed'

@api_view(['GET'])
def get_analysis_data(request, analysis_id):
    """
    Get time-series data for interview confidence/stress visualization
    """
    try:
        analysis = AnalysisResult.objects.get(id=analysis_id)
    except AnalysisResult.DoesNotExist:
        return Response({"error": "Analysis not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Get video analysis data points
    video_data = VideoAnalysisPoint.objects.filter(
        analysis=analysis
    ).values('timestamp', 'confidence_score', 'confidence_category')
    
    # Get audio analysis data points
    audio_data = AudioAnalysisPoint.objects.filter(
        analysis=analysis
    ).values('start_time', 'end_time', 'confidence_score', 'confidence_category')
    
    # Get key insights/markers
    insights = AnalysisInsight.objects.filter(
        analysis=analysis
    ).values('timestamp', 'insight_type', 'description', 'severity')
    
    # Format audio data to have a single timestamp (midpoint between start and end)
    formatted_audio_data = [
        {
            "timestamp": (point['start_time'] + point['end_time']) / 2,
            "confidence_score": point['confidence_score'],
            "confidence_category": point['confidence_category'],
            "type": "audio"
        }
        for point in audio_data
    ]
    
    # Format video data
    formatted_video_data = [
        {
            "timestamp": point['timestamp'],
            "confidence_score": point['confidence_score'],
            "confidence_category": point['confidence_category'],
            "type": "video"
        }
        for point in video_data
    ]
    
    # Format insights
    formatted_insights = [
        {
            "timestamp": point['timestamp'],
            "type": point['insight_type'],
            "description": point['description'],
            "severity": point['severity']
        }
        for point in insights
    ]
    
    # Final response with analysis metadata
    response_data = {
        "analysis_id": str(analysis.id),
        "session_title": analysis.session.title,
        "candidate_name": analysis.session.candidate.name,
        "overall_confidence": analysis.overall_confidence_score,
        "overall_category": analysis.overall_confidence_category,
        "video_data": formatted_video_data,
        "audio_data": formatted_audio_data,
        "insights": formatted_insights
    }
    
    return Response(response_data)
