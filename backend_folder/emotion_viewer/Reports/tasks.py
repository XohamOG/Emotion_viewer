from celery import shared_task
from .models import AnalysisResult
from .ml_models import analyze_video_frame, analyze_audio_segment
from .views import extract_frames, extract_audio_segments, generate_insights

@shared_task
def process_interview_data(analysis_id):
    """Process uploaded interview data asynchronously"""
    try:
        analysis = AnalysisResult.objects.get(id=analysis_id)
        session = analysis.session

        # Process video if available
        if session.video_capture:
            video_frames = extract_frames(session.video_capture.file.path)
            for frame_idx, frame in enumerate(video_frames):
                timestamp = frame_idx / 30.0  # assuming 30 FPS
                result = analyze_video_frame(frame)
                analysis.video_points.create(
                    timestamp=timestamp,
                    confidence_score=result['confidence_score'],
                    confidence_category=result['category'],
                    feature_data=result['features']
                )

        # Process audio if available
        if session.audio_capture:
            audio_segments = extract_audio_segments(session.audio_capture.file.path)
            for start_time, end_time, segment in audio_segments:
                result = analyze_audio_segment(segment)
                analysis.audio_points.create(
                    start_time=start_time,
                    end_time=end_time,
                    confidence_score=result['confidence_score'],
                    confidence_category=result['category'],
                    feature_data=result.get('features')
                )

        # Generate insights and update analysis
        generate_insights(analysis)
        
        # Update analysis status
        analysis.status = 'COMPLETED'
        analysis.save()

    except Exception as e:
        if analysis:
            analysis.status = 'FAILED'
            analysis.error_message = str(e)
            analysis.save()
        raise