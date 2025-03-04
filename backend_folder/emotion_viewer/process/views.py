from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
from .models import ProcessedFile
from .serializers import ProcessedFileSerializer
import cv2
import numpy as np
import os
from deepface import DeepFace
import tensorflow as tf
import librosa

# Load the pre-trained audio model
AUDIO_MODEL_PATH = os.path.join(settings.BASE_DIR, "process", "emotion_model.h5")
audio_model = tf.keras.models.load_model(AUDIO_MODEL_PATH)

class ProcessPendingFiles(APIView):
    """Fetches unprocessed files and updates them with AI results."""
    def get(self, request, *args, **kwargs):
        pending_files = ProcessedFile.objects.filter(result__isnull=True)

        for file in pending_files:
            file_path = os.path.join(settings.MEDIA_ROOT, file.file.name)

            if file.file_type == "image":
                result = self.process_image(file_path)
            elif file.file_type == "audio":
                result = self.process_audio(file_path)
            else:
                result = "Unsupported file type"

            # Update database with AI result
            file.result = result
            file.save()

        return Response({"message": "Processing complete", "processed_files": len(pending_files)}, status=200)

    def process_image(self, file_path):
        """Run DeepFace emotion detection on an image."""
        frame = cv2.imread(file_path)
        try:
            result = DeepFace.analyze(frame, actions=["emotion"], enforce_detection=False)
            return result[0]["dominant_emotion"]
        except Exception as e:
            return "Error: " + str(e)

    def process_audio(self, file_path):
        """Run the .h5 model on an audio file."""
        try:
            y, sr = librosa.load(file_path, sr=22050)
            mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
            mfccs = np.mean(mfccs.T, axis=0)
            mfccs = mfccs.reshape(1, -1)

            prediction = audio_model.predict(mfccs)
            predicted_emotion = np.argmax(prediction)

            # Emotion mapping (adjust as per model)
            emotion_labels = ["Happy", "Sad", "Neutral", "Angry", "Surprised"]
            return emotion_labels[predicted_emotion]
        except Exception as e:
            return "Error: " + str(e)

class GetProcessedResults(APIView):
    """Returns all processed files and their results."""
    def get(self, request, *args, **kwargs):
        processed_files = ProcessedFile.objects.exclude(result__isnull=True)
        serializer = ProcessedFileSerializer(processed_files, many=True)
        return Response(serializer.data, status=200)
