import torch
import librosa
import numpy as np
from datetime import datetime
import sounddevice as sd
import soundfile as sf
import os
from jd import EmotionCNN

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
        
        mapped_emotion = "STRESS" if emotion in self.stress_emotions else "CONFIDENT"
        
        return mapped_emotion, confidence

    def record_and_predict(self, duration=3, sr=16000):
        print("Recording...")
        audio_data = sd.rec(int(duration * sr), samplerate=sr, channels=1)
        sd.wait()
        audio_data = audio_data.flatten()
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"recording_{timestamp}.wav"
        sf.write(filename, audio_data, sr)
        
        features = self.preprocess_audio(audio_data, sr)
        features = features.unsqueeze(0)
        
        with torch.no_grad():
            outputs = self.model(features.to(self.device))
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            prediction = torch.argmax(probabilities, dim=1)
        
        emotion = self.emotion_labels[prediction.item()]
        confidence = probabilities[0][prediction].item()
        
        mapped_emotion = "STRESS" if emotion in self.stress_emotions else "CONFIDENT"
        
        return mapped_emotion, confidence, filename

def main():
    os.makedirs("recordings", exist_ok=True)
    predictor = EmotionPredictor('backend_folder\AI\emotion_model.pth')
    print("Looking for model at:", os.path.abspath('backend_folder\AI\emotion_model.pth'))
    
    while True:
        print("\nEmotion Recognition Menu:")
        print("1. Predict from audio file")
        print("2. Record and predict")
        print("3. Exit")
        
        choice = input("\nEnter your choice (1-3): ")
        
        if choice == '1':
            audio_path = input("Enter the path to audio file: ")
            try:
                emotion, confidence = predictor.predict_file(audio_path)
                print(f"\nPredicted emotion: {emotion}")
                print(f"Confidence: {confidence:.2%}")
            except Exception as e:
                print(f"Error: {str(e)}")
                
        elif choice == '2':
            try:
                emotion, confidence, filename = predictor.record_and_predict()
                print(f"\nRecording saved as: {filename}")
                print(f"Predicted emotion: {emotion}")
                print(f"Confidence: {confidence:.2%}")
            except Exception as e:
                print(f"Error: {str(e)}")
                
        elif choice == '3':
            print("Goodbye!")
            break
            
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()