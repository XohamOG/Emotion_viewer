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
import os
import cv2
import numpy as np
import torch
import librosa
import threading
from deepface import DeepFace
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status, generics
from django.conf import settings
from .models import Capture
from .serializers import CaptureSerializer
from torch import nn

# ✅ Define the CNN model structure used during training
class EmotionCNN(nn.Module):
    def __init__(self, num_classes=8):
        super(EmotionCNN, self).__init__()

        self.features = nn.Sequential(
            nn.Conv2d(1, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),

            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),

            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
        )

        self._to_linear = 128 * 1 * 8  
        self.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(self._to_linear, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, num_classes)
        )

    def forward(self, x):
        if len(x.shape) == 3:
            x = x.unsqueeze(1)  # Add channel dimension
        x = self.features(x)
        x = x.view(x.size(0), -1)
        x = self.classifier(x)
        return x

# ✅ Load PyTorch model correctly
AUDIO_MODEL_PATH = r"D:\Quasar\Emotion_viewer\backend_folder\AI\emotion_model.pth"

try:
    checkpoint = torch.load(AUDIO_MODEL_PATH, map_location=torch.device("cpu"))
    audio_model = EmotionCNN(num_classes=8)
    audio_model.load_state_dict(checkpoint["model_state_dict"])
    audio_model.eval()
    EMOTION_LABELS = checkpoint["emotion_labels"]
except Exception as e:
    print(f"Error loading audio model: {e}")
    audio_model = None
    EMOTION_LABELS = []

# ✅ Global variables for image processing
emotion_result = "Detecting..."
processing_emotion = False

class CaptureUploadView(generics.CreateAPIView):
    queryset = Capture.objects.all()
    serializer_class = CaptureSerializer
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file_serializer = CaptureSerializer(data=request.data)
        if file_serializer.is_valid():
            file_serializer.save()
            file_path = os.path.join(settings.MEDIA_ROOT, file_serializer.data["file"])
            file_name = file_serializer.data["file"]

            # Ensure the file exists before processing
            if not os.path.exists(file_path):
                return Response({"error": f"File not found: {file_path}"}, status=status.HTTP_400_BAD_REQUEST)

            # Process Image or Audio
            if file_name.endswith((".png", ".jpg", ".jpeg")):
                result = self.process_image(file_path)
            elif file_name.endswith(".wav"):
                result = self.process_audio(file_path)
            else:
                result = "Unsupported file type"

            return Response({"message": "File processed", "result": result}, status=status.HTTP_200_OK)
        return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def process_image(self, file_path):
        """Runs DeepFace emotion detection asynchronously."""
        global emotion_result, processing_emotion
        if processing_emotion:
            return emotion_result  # Return last processed result if busy
        
        # ✅ Ensure OpenCV can read the file
        absolute_path = os.path.abspath(file_path)
        print(f"Processing Image: {absolute_path}")

        frame = cv2.imread(absolute_path)
        if frame is None:
            return "Error: Unable to read image file"

        processing_emotion = True  # Mark processing started

        def analyze_emotion():
            global emotion_result, processing_emotion
            try:
                result = DeepFace.analyze(frame, actions=["emotion"], enforce_detection=False)
                emotion_result = result[0]["dominant_emotion"]
            except Exception as e:
                emotion_result = f"Error: {e}"
            processing_emotion = False  # Mark processing done

        threading.Thread(target=analyze_emotion, daemon=True).start()
        return "Processing Image..."

    def process_audio(self, file_path):
        """Runs PyTorch model on an audio file."""
        if audio_model is None:
            return "Error: Audio model not loaded"

        try:
            print(f"Processing Audio: {file_path}")
            y, sr = librosa.load(file_path, sr=22050)
            mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13, n_fft=1024, hop_length=256, win_length=1024)

            # Ensure 64 time steps
            target_length = 64
            if mfccs.shape[1] > target_length:
                mfccs = mfccs[:, :target_length]
            else:
                mfccs = np.pad(mfccs, ((0, 0), (0, target_length - mfccs.shape[1])), mode="constant")

            # Normalize
            mfccs = (mfccs - np.mean(mfccs)) / (np.std(mfccs) + 1e-8)

            # Convert to tensor
            mfccs_tensor = torch.tensor(mfccs, dtype=torch.float32).unsqueeze(0).unsqueeze(0)  # Add batch & channel dim

            with torch.no_grad():
                prediction = audio_model(mfccs_tensor)
                predicted_emotion = torch.argmax(prediction).item()

            return EMOTION_LABELS[predicted_emotion] if EMOTION_LABELS else "Unknown"

        except Exception as e:
            return f"Audio Processing Error: {e}"
