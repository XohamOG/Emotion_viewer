import cv2
import os
import json
import numpy as np
import mediapipe as mp
import torch
import librosa
import time
from deepface import DeepFace
from jd import EmotionCNN
from datetime import datetime

# Get the directory of the current script
CURRENT_DIR = os.path.dirname(__file__)

# Paths
FOLDER_PATH = os.path.abspath(os.path.join(CURRENT_DIR, "../../emotion_viewer/media/captures"))
OUTPUT_JSON = os.path.abspath(os.path.join(CURRENT_DIR, "../../../frontend/public/data/emoresults.json"))

# Initialize MediaPipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)

# Initialize Audio Model
class EmotionPredictor:
    def __init__(self, model_path='backend_folder/AI/emotion_model.pth'):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"❌ Model file not found: {model_path}")

        checkpoint = torch.load(model_path, map_location=self.device)
        self.model = EmotionCNN(num_classes=8)
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model.to(self.device)
        self.model.eval()
        
        self.emotion_labels = ['ANG', 'CAL', 'DIS', 'FEA', 'HAP', 'NEU', 'SAD', 'SUR']
        self.stress_emotions = {'ANG', 'SAD', 'DIS', 'SUR', 'FEA'}

    def preprocess_audio(self, audio_data, sr):
        target_length = 3 * sr
        audio_data = audio_data[:target_length] if len(audio_data) > target_length else np.pad(audio_data, (0, target_length - len(audio_data)))
        
        mfccs = librosa.feature.mfcc(
            y=audio_data,
            sr=sr,
            n_mfcc=13,
            n_fft=1024,
            hop_length=256,
            win_length=1024
        )
        
        target_length = 64
        mfccs = mfccs[:, :target_length] if mfccs.shape[1] > target_length else np.pad(mfccs, ((0, 0), (0, target_length - mfccs.shape[1])), mode='constant')
        mfccs = (mfccs - np.mean(mfccs)) / (np.std(mfccs) + 1e-8)
        
        return torch.FloatTensor(mfccs)

    def predict_file(self, audio_path):
        audio_data, sr = librosa.load(audio_path, sr=16000)
        features = self.preprocess_audio(audio_data, sr).unsqueeze(0)

        with torch.no_grad():
            outputs = self.model(features.to(self.device))
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            prediction = torch.argmax(probabilities, dim=1)
        
        emotion = self.emotion_labels[prediction.item()]
        confidence = probabilities[0][prediction].item()
        
        return "Stressed" if emotion in self.stress_emotions else "Confident", confidence

# Initialize predictor
audio_predictor = EmotionPredictor()

def load_existing_results():
    """Loads existing JSON data to avoid re-processing."""
    if os.path.exists(OUTPUT_JSON):
        try:
            with open(OUTPUT_JSON, "r") as f:
                return json.load(f)
        except json.JSONDecodeError:
            print("⚠️ Warning: JSON file corrupted. Creating a new one.")
    return {}

def save_results(results_dict):
    """Safely saves the results to the JSON file."""
    try:
        with open(OUTPUT_JSON, "w") as f:
            json.dump(results_dict, f, indent=4)
        print(f"✅ Updated results saved in {OUTPUT_JSON}")
    except Exception as e:
        print(f"❌ Error saving JSON: {e}")

def process_files():
    """Processes new files in real time and updates JSON."""
    if not os.path.exists(FOLDER_PATH):
        print(f"❌ Error: Folder {FOLDER_PATH} does not exist.")
        return

    results_dict = load_existing_results()
    processed_files = set(results_dict.keys())

    while True:
        files = sorted(os.listdir(FOLDER_PATH))  # Get latest files
        new_files = [f for f in files if f not in processed_files]  # Identify new files

        for file_name in new_files:
            file_path = os.path.join(FOLDER_PATH, file_name)
            if not os.path.isfile(file_path):
                continue

            print(f"🔄 Processing {file_name}...")
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            # Image Processing
            if file_name.lower().endswith(('.jpg', '.jpeg', '.png')):
                frame = cv2.imread(file_path)
                if frame is None:
                    print(f"⚠️ Warning: Could not read {file_name}")
                    continue

                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                face_mesh.process(rgb_frame)

                try:
                    result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
                    dominant_emotion = result[0]['dominant_emotion']
                    status = "Stressed" if dominant_emotion in ["fear", "disgust", "sad"] else "Confident"
                except Exception as e:
                    print(f"⚠️ Error processing {file_name}: {e}")
                    status = "Unknown"

                results_dict[file_name] = {"type": "image", "status": status, "timestamp": timestamp}

            # Audio Processing
            elif file_name.lower().endswith(('.wav', '.mp3', '.flac')):
                try:
                    status, confidence = audio_predictor.predict_file(file_path)
                except Exception as e:
                    print(f"⚠️ Error processing {file_name}: {e}")
                    status = "Unknown"

                results_dict[file_name] = {"type": "audio", "status": status, "timestamp": timestamp}

            processed_files.add(file_name)  # Mark file as processed
            save_results(results_dict)  # Save JSON after each update

        print("⏳ Waiting for new files...")
        time.sleep(7)  # Sleep before checking again

if __name__ == "__main__":
    process_files()
