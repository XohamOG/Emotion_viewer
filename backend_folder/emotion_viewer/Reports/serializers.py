from rest_framework import serializers
from .models import EmotionReport

class EmotionReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmotionReport
        fields = ['id', 'timestamp', 'emotion', 'confidence_score', 'image_path']

class EmotionSummarySerializer(serializers.Serializer):
    emotion = serializers.CharField()
    count = serializers.IntegerField()
    average_confidence = serializers.FloatField()

class TimeSeriesEmotionSerializer(serializers.Serializer):
    timestamp = serializers.DateTimeField()
    emotion = serializers.CharField()
    confidence_score = serializers.FloatField()