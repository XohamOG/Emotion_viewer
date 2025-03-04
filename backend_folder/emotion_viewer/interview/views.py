import random
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from .models import JobPosition, InterviewSession, CapturedData
from .serializers import JobPositionSerializer

class JobPositionViewSet(viewsets.ModelViewSet):
    queryset = JobPosition.objects.all()
    serializer_class = JobPositionSerializer

@api_view(["POST"])
def start_interview(request):
    job_id = request.data.get("job_id")
    if not job_id:
        return Response({"error": "Job ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    job = get_object_or_404(JobPosition, id=job_id)
    interview = InterviewSession.objects.create(job_position=job)

    return Response({"message": "Interview Started", "interview_id": interview.id})

@api_view(["POST"])
def upload_captured_data(request):
    interview_id = request.data.get("interview_id")
    file = request.FILES.get("file")
    data_type = request.data.get("data_type")

    if not interview_id or not file or not data_type:
        return Response({"error": "Missing fields"}, status=status.HTTP_400_BAD_REQUEST)

    # Validate data_type (only "image" or "audio" allowed)
    valid_data_types = ["image", "audio"]
    if data_type not in valid_data_types:
        return Response({"error": "Invalid data type. Must be 'image' or 'audio'."}, status=status.HTTP_400_BAD_REQUEST)

    # Get interview session or return 404 if not found
    interview = get_object_or_404(InterviewSession, id=interview_id)

    # Save uploaded file
    captured_data = CapturedData.objects.create(interview=interview, file=file, data_type=data_type)

    # Simulate AI emotion detection (Replace with actual AI model)
    emotions = ["Happy", "Sad", "Angry", "Neutral"]
    detected_emotion = random.choice(emotions)

    return Response({
        "message": "File uploaded",
        "file_url": captured_data.file.url,
        "emotion": detected_emotion
    })
