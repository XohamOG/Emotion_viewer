from rest_framework import serializers
from .models import JobPosition, InterviewSession, CapturedData

class JobPositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosition
        fields = "__all__"  # Automatically includes 'title' and 'description'

class InterviewSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewSession
        fields = "__all__"

class CapturedDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = CapturedData
        fields = "__all__"
