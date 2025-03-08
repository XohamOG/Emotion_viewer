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

# Get the directory of the current script
CURRENT_DIR = os.path.dirname(__file__)

# Paths
FOLDER_PATH = os.path.join(CURRENT_DIR, "../../emotion_viewer/captures")  # Ensure correct folder path
OUTPUT_JSON = os.path.join(CURRENT_DIR, "../../../frontend/public/data/emoresults.json")  # Updated path

# Initialize MediaPipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)

# Initialize Audio Model
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

    def preprocess_audio(self, audio_data, sr):
        target_length = 3 * sr
        if len(audio_data) > target_length:
            audio_data = audio_data[:target_length]
        else:
            audio_data = np.pad(audio_data, (0, target_length - len(audio_data)))
            
        mfccs = librosa.feature.mfcc(
            y=audio_data,
            sr=sr,
            n_mfcc=13,
            n_fft=1024,
            hop_length=256,
            win_length=1024
        )
        
        target_length = 64
        if mfccs.shape[1] > target_length:
            mfccs = mfccs[:, :target_length]
        else:
            pad_width = ((0, 0), (0, target_length - mfccs.shape[1]))
            mfccs = np.pad(mfccs, pad_width, mode='constant')
            
        mfccs = (mfccs - np.mean(mfccs)) / (np.std(mfccs) + 1e-8)
        
        return torch.FloatTensor(mfccs)

    def predict_file(self, audio_path):
        audio_data, sr = librosa.load(audio_path, sr=16000)
        features = self.preprocess_audio(audio_data, sr)
        features = features.unsqueeze(0)
        
        with torch.no_grad():
            outputs = self.model(features.to(self.device))
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            prediction = torch.argmax(probabilities, dim=1)
        
        emotion = self.emotion_labels[prediction.item()]
        confidence = probabilities[0][prediction].item()
        
        mapped_emotion = "Stressed" if emotion in self.stress_emotions else "Confident"
        
        return mapped_emotion, confidence

# Initialize predictor
audio_predictor = EmotionPredictor('backend_folder/AI/emotion_model.pth')

def process_files():
    """Processes new files every 5 seconds."""
    # Load existing JSON data if the file exists
    if os.path.exists(OUTPUT_JSON):
        try:
            with open(OUTPUT_JSON, "r") as f:
                results_dict = json.load(f)
        except json.JSONDecodeError:
            print("Warning: JSON file was corrupted. Creating a new one.")
            results_dict = {}
    else:
        results_dict = {}

    # Ensure folder exists
    if not os.path.exists(FOLDER_PATH):
        print(f"Error: Folder {FOLDER_PATH} does not exist.")
        return

    # Process files in the folder
    for file_name in sorted(os.listdir(FOLDER_PATH)):  
        file_path = os.path.join(FOLDER_PATH, file_name)

        if not os.path.isfile(file_path) or file_name in results_dict:
            continue  # Skip non-file entries and already processed files

        print(f"Processing {file_name}...")

        if file_name.lower().endswith(('.jpg', '.jpeg', '.png')):  # Image Processing
            frame = cv2.imread(file_path)
            if frame is None:
                print(f"Warning: Could not read {file_name}")
                continue

            # Convert to RGB for MediaPipe
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(rgb_frame)  # Optional processing

            try:
                # Emotion analysis
                result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
                dominant_emotion = result[0]['dominant_emotion']

                # Determine stress status
                status = "Stressed" if dominant_emotion in ["fear", "disgust", "sad"] else "Confident"
            except Exception as e:
                print(f"Error processing {file_name}: {e}")
                status = "Unknown"

            # Store result
            results_dict[file_name] = {"type": "image", "status": status}

        elif file_name.lower().endswith(('.wav', '.mp3', '.flac')):  # Audio Processing
            try:
                status, confidence = audio_predictor.predict_file(file_path)
            except Exception as e:
                print(f"Error processing {file_name}: {e}")
                status = "Unknown"

            # Store result
            results_dict[file_name] = {"type": "audio", "status": status}

    # Save updated JSON
    try:
        with open(OUTPUT_JSON, "w") as f:
            json.dump(results_dict, f, indent=4)
        print(f"Updated results saved in {OUTPUT_JSON}")
    except Exception as e:
        print(f"Error saving JSON: {e}")

if __name__ == "__main__":
    while True:
        process_files()
        print("Waiting for 5 seconds before next scan...")
        time.sleep(5)
