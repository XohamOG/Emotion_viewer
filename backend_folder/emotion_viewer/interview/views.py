from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import JobPosition, InterviewSession, CapturedData
from .serializers import JobPositionSerializer, InterviewSessionSerializer, CapturedDataSerializer

class JobPositionViewSet(viewsets.ModelViewSet):
    queryset = JobPosition.objects.all()
    serializer_class = JobPositionSerializer

@api_view(["POST"])
def start_interview(request):
    job_id = request.data.get("job_id")
    if not job_id:
        return Response({"error": "Job ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    job = JobPosition.objects.get(id=job_id)
    interview = InterviewSession.objects.create(job_position=job)
    return Response({"message": "Interview Started", "interview_id": interview.id})

@api_view(["POST"])
def upload_captured_data(request):
    interview_id = request.data.get("interview_id")
    file = request.FILES.get("file")
    data_type = request.data.get("data_type")

    if not interview_id or not file or not data_type:
        return Response({"error": "Missing fields"}, status=status.HTTP_400_BAD_REQUEST)

    interview = InterviewSession.objects.get(id=interview_id)
    captured_data = CapturedData.objects.create(interview=interview, file=file, data_type=data_type)

    return Response({"message": "File uploaded", "file_url": captured_data.file.url})
