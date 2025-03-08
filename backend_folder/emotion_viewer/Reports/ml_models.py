import torch
import librosa
import numpy as np
from pathlib import Path
import cv2
import mediapipe as mp
from deepface import DeepFace
from backend_folder.AI.img.jd import EmotionCNN  # Assuming you have the CNN model definition in emotion_cnn.py

class EmotionPredictor:
    def __init__(self, model_path='emotion_model.pth'):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        checkpoint = torch.load(model_path, map_location=self.device)
        
        self.model = EmotionCNN(num_classes=8)
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model.to(self.device)
        self.model.eval()
        
        self.emotion_labels = ['ANG', 'CAL', 'DIS', 'FEA', 'HAP', 'NEU', 'SAD', 'SUR']
        self.stress_emotions = {'ANG', 'SAD', 'DIS', 'SUR', 'FEA'}

    def analyze_segment(self, audio_data, sr=16000):
        features = self.preprocess_audio(audio_data, sr)
        features = features.unsqueeze(0)
        
        with torch.no_grad():
            outputs = self.model(features.to(self.device))
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            prediction = torch.argmax(probabilities, dim=1)
        
        emotion = self.emotion_labels[prediction.item()]
        confidence = probabilities[0][prediction].item() * 100  # Convert to percentage
        
        category = "STRESS" if emotion in self.stress_emotions else "CONFIDENT"
        
        return {
            'confidence_score': confidence,
            'category': category,
            'features': {
                'emotion': emotion,
                'probabilities': probabilities[0].cpu().numpy().tolist()
            }
        }

    def preprocess_audio(self, audio_data, sr):
        # Your existing preprocess_audio implementation
        ...

class VideoEmotionPredictor:
    def __init__(self):
        # Initialize MediaPipe Face Mesh
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(refine_landmarks=True)
        self.stress_emotions = {'angry', 'fear', 'sad', 'disgust'}

    def analyze_frame(self, frame):
        try:
            # Run DeepFace analysis
            result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
            emotion = result[0]['dominant_emotion']
            
            # Get emotion probabilities
            emotions_dict = result[0]['emotion']
            confidence = max(emotions_dict.values())
            
            # Map emotion to confidence category
            category = "STRESS" if emotion.lower() in self.stress_emotions else "CONFIDENT"
            
            return {
                'confidence_score': confidence,
                'category': category,
                'features': {
                    'emotion': emotion,
                    'probabilities': emotions_dict
                }
            }
        except Exception as e:
            return {
                'confidence_score': 0,
                'category': 'NEUTRAL',
                'features': {
                    'emotion': 'error',
                    'probabilities': {},
                    'error': str(e)
                }
            }

# Initialize both predictors
emotion_predictor = EmotionPredictor(
    model_path=Path(__file__).parent.parent / 'AI' / 'emotion_model.pth'
)

video_predictor = VideoEmotionPredictor()

def analyze_audio_segment(audio_segment):
    """Analyze an audio segment using the emotion prediction model"""
    return emotion_predictor.analyze_segment(audio_segment)

def analyze_video_frame(frame):
    """Analyze a video frame using the video emotion predictor"""
    return video_predictor.analyze_frame(frame)
