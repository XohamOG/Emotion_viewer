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
from .models import Capture
from .serializers import CaptureSerializer

class CaptureUploadView(generics.CreateAPIView):
    queryset = Capture.objects.all()
    serializer_class = CaptureSerializer
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file_serializer = CaptureSerializer(data=request.data)
        if file_serializer.is_valid():
            file_serializer.save()
            return Response(
                {"message": "File uploaded successfully", "file_url": settings.MEDIA_URL + file_serializer.data["file"]},
                status=status.HTTP_201_CREATED
            )
        return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)