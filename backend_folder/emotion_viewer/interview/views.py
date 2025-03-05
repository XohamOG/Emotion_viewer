from rest_framework import generics
from .models import JobPosition, Candidate
from .serializers import JobPositionSerializer, CandidateSerializer

# Job API
class JobPositionListCreate(generics.ListCreateAPIView):
    queryset = JobPosition.objects.all()
    serializer_class = JobPositionSerializer

# Candidate API
class CandidateListCreate(generics.ListCreateAPIView):
    queryset = Candidate.objects.all()
    serializer_class = CandidateSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status, generics
from django.conf import settings
from Reports.models import Capture, InterviewSession, AnalysisResult
from Reports.serializers import CaptureSerializer
from Reports.tasks import process_interview_data  # You'll need to create this

class CaptureUploadView(generics.CreateAPIView):
    queryset = Capture.objects.all()
    serializer_class = CaptureSerializer
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        session_id = request.data.get('session_id')
        capture_type = request.data.get('type')  # 'video' or 'audio'
        
        if not session_id or not capture_type:
            return Response(
                {"error": "Both session_id and type are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            session = InterviewSession.objects.get(id=session_id)
        except InterviewSession.DoesNotExist:
            return Response(
                {"error": "Interview session not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        file_serializer = CaptureSerializer(data=request.data)
        if file_serializer.is_valid():
            capture = file_serializer.save()
            
            # Update the session with the new capture
            if capture_type == 'video':
                session.video_capture = capture
            elif capture_type == 'audio':
                session.audio_capture = capture
            session.save()

            # Create or update analysis result
            analysis, created = AnalysisResult.objects.get_or_create(
                session=session,
                defaults={'status': 'PENDING'}
            )

            # Trigger processing if both video and audio are uploaded
            if session.video_capture and session.audio_capture:
                analysis.status = 'PROCESSING'
                analysis.save()
                # Trigger async processing task
                process_interview_data.delay(analysis.id)

            return Response({
                "message": f"{capture_type.capitalize()} uploaded successfully",
                "file_url": settings.MEDIA_URL + file_serializer.data["file"],
                "session_id": str(session.id),
                "analysis_id": str(analysis.id),
                "status": analysis.status
            }, status=status.HTTP_201_CREATED)
            
        return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)