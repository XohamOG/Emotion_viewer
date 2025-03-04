import cv2
import time
import threading
import mediapipe as mp
from deepface import DeepFace

# Initialize MediaPipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)

# Open webcam
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

# Variables for threading
last_capture_time = time.time()
capture_interval = 5  # Run emotion detection every 5 seconds
emotion_result = "Detecting..."
processing_emotion = False  # Flag to check if thread is running

def analyze_emotion(frame):
    """Runs DeepFace emotion detection in a separate thread."""
    global emotion_result, processing_emotion
    processing_emotion = True  # Mark as processing
    try:
        result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
        emotion_result = result[0]['dominant_emotion']
    except Exception as e:
        emotion_result = "Error"
    processing_emotion = False  # Done processing

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Check if it's time to analyze emotion
    current_time = time.time()
    if current_time - last_capture_time >= capture_interval and not processing_emotion:
        last_capture_time = current_time  # Reset timer
        threading.Thread(target=analyze_emotion, args=(frame.copy(),), daemon=True).start()

    # Display emotion result
    cv2.putText(frame, f"Emotion: {emotion_result}", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

    # Show the video feed
    cv2.imshow("Emotion Detection", frame)

    # Exit when 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release resources
cap.release()
cv2.destroyAllWindows()
