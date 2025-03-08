import cv2
import os
import json
import numpy as np
import mediapipe as mp
from deepface import DeepFace

# Get the directory of the current script
CURRENT_DIR = os.path.dirname(__file__)

# Paths
FOLDER_PATH = os.path.join(CURRENT_DIR, "../../emotion_viewer/captures")  # Ensure correct folder path
OUTPUT_JSON = os.path.join(CURRENT_DIR, "../../../frontend/src/data/emoresults.json")  # Updated path

# Initialize MediaPipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)

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

# Debug: Ensure folder exists
if not os.path.exists(FOLDER_PATH):
    print(f"Error: Folder {FOLDER_PATH} does not exist.")
    exit()

# Process images in the folder
for img_name in sorted(os.listdir(FOLDER_PATH)):  
    img_path = os.path.join(FOLDER_PATH, img_name)

    if not os.path.isfile(img_path) or img_name in results_dict:
        continue  # Skip non-file entries and already processed images

    print(f"Processing {img_name}...")

    frame = cv2.imread(img_path)
    if frame is None:
        print(f"Warning: Could not read {img_name}")
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
        print(f"Error processing {img_name}: {e}")
        status = "Unknown"

    # Store result (only new images)
    results_dict[img_name] = status

# Save updated JSON
try:
    with open(OUTPUT_JSON, "w") as f:
        json.dump(results_dict, f, indent=4)
    print(f"Updated results saved in {OUTPUT_JSON}")
except Exception as e:
    print(f"Error saving JSON: {e}")
