import numpy as np
import librosa
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from datasets import load_dataset
import warnings
warnings.filterwarnings('ignore')

class EmotionDataset(Dataset):
    def __init__(self, dataset_split):
        self.dataset = dataset_split
        self.emotion_to_idx = {
            'ANG': 0, 'CAL': 1, 'DIS': 2, 'FEA': 3,
            'HAP': 4, 'NEU': 5, 'SAD': 6, 'SUR': 7
        }
        
    def __len__(self):
        return len(self.dataset)
    
    def __getitem__(self, idx):
        try:
            sample = self.dataset[idx]
            
            # Get audio data directly from the array field
            audio_data = sample['file_path']['array']
            sr = sample['file_path']['sampling_rate']
            
            # Ensure audio is the right length (3 seconds)
            target_length = 3 * sr
            if len(audio_data) > target_length:
                audio_data = audio_data[:target_length]
            else:
                audio_data = np.pad(audio_data, (0, target_length - len(audio_data)))
            
            # Extract MFCC features with fixed size
            mfccs = librosa.feature.mfcc(
                y=audio_data, 
                sr=sr, 
                n_mfcc=13,
                n_fft=1024,  # Reduced FFT window size
                hop_length=256,  # Reduced hop length
                win_length=1024  # Explicit window length
            )
            
            # Resize MFCCs to fixed dimensions using interpolation
            target_length = 64  # Reduced target length for time dimension
            if mfccs.shape[1] > target_length:
                mfccs = mfccs[:, :target_length]
            else:
                pad_width = ((0, 0), (0, target_length - mfccs.shape[1]))
                mfccs = np.pad(mfccs, pad_width, mode='constant')
            
            # Normalize the features
            mfccs = (mfccs - np.mean(mfccs)) / (np.std(mfccs) + 1e-8)
            
            # Convert emotion label to numeric index
            emotion_idx = self.emotion_to_idx[sample['emotion']]
            
            return torch.FloatTensor(mfccs), torch.tensor(emotion_idx, dtype=torch.long)
            
        except Exception as e:
            print(f"Error processing sample {idx}: {str(e)}")
            # Return a zero tensor and first emotion class as fallback
            return torch.zeros((13, 64)), torch.tensor(0, dtype=torch.long)
class EmotionCNN(nn.Module):
    def __init__(self, num_classes):
        super(EmotionCNN, self).__init__()
        
        # Input shape: (batch_size, 1, 13, 64)
        self.features = nn.Sequential(
            # First block
            nn.Conv2d(1, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),  # Output: (32, 6, 32)
            
            # Second block
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),  # Output: (64, 3, 16)
            
            # Third block
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),  # Output: (128, 1, 8)
        )
        
        # Calculate the size of the flattened features
        self._to_linear = 128 * 1 * 8  # = 1024
        
        # Classifier
        self.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(self._to_linear, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, num_classes)
        )

    def forward(self, x):
        # Add channel dimension if necessary
        if len(x.shape) == 3:
            x = x.unsqueeze(1)
            
        # For debugging - print shapes
        # print(f"Input shape: {x.shape}")
        
        # Feature extraction
        x = self.features(x)
        # print(f"After features: {x.shape}")
        
        # Flatten
        x = x.view(x.size(0), -1)
        # print(f"After flatten: {x.shape}")
        
        # Classification
        x = self.classifier(x)
        return x

def train_model(model, train_loader, val_loader, criterion, optimizer, num_epochs=10):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    model = model.to(device)
    
    best_val_acc = 0.0
    
    for epoch in range(num_epochs):
        # Training phase
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        for batch_idx, (inputs, labels) in enumerate(train_loader):
            try:
                inputs, labels = inputs.to(device), labels.to(device)
                
                # Print shapes for the first batch of first epoch
                if epoch == 0 and batch_idx == 0:
                    print(f"\nDebug shapes:")
                    x = inputs.unsqueeze(1)
                    print(f"Initial shape: {x.shape}")
                    x = model.features(x)
                    print(f"After features: {x.shape}")
                    x = x.view(x.size(0), -1)
                    print(f"After flatten: {x.shape}")
                
                optimizer.zero_grad()
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()
                
                running_loss += loss.item()
                _, predicted = outputs.max(1)
                total += labels.size(0)
                correct += predicted.eq(labels).sum().item()
                
                if batch_idx % 50 == 0:
                    print(f'Epoch {epoch+1}/{num_epochs} - Batch {batch_idx}/{len(train_loader)} - '
                          f'Loss: {loss.item():.4f} - Acc: {100.*correct/total:.2f}%')
            
            except Exception as e:
                print(f"Error in batch {batch_idx}: {str(e)}")
                print(f"Input shape: {inputs.shape}")
                continue
        
        train_accuracy = 100. * correct / total if total > 0 else 0
        
        # Validation phase
        model.eval()
        val_loss = 0.0
        correct = 0
        total = 0
        
        with torch.no_grad():
            for inputs, labels in val_loader:
                try:
                    inputs, labels = inputs.to(device), labels.to(device)
                    outputs = model(inputs)
                    val_loss += criterion(outputs, labels).item()
                    _, predicted = outputs.max(1)
                    total += labels.size(0)
                    correct += predicted.eq(labels).sum().item()
                except Exception as e:
                    print(f"Error in validation: {str(e)}")
                    continue
        
        val_accuracy = 100. * correct / total if total > 0 else 0
        
        # Save best model
        if val_accuracy > best_val_acc:
            best_val_acc = val_accuracy
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'val_acc': val_accuracy,
            }, 'best_emotion_model.pth')
        
        print(f'\nEpoch {epoch + 1}/{num_epochs}')
        print(f'Training Loss: {running_loss/len(train_loader):.4f}')
        print(f'Training Accuracy: {train_accuracy:.2f}%')
        print(f'Validation Loss: {val_loss/len(val_loader):.4f}')
        print(f'Validation Accuracy: {val_accuracy:.2f}%')
        print('--------------------')

def main():
    print("Loading dataset...")
    dataset = load_dataset("stapesai/ssi-speech-emotion-recognition")
    
    # Create datasets
    train_dataset = EmotionDataset(dataset['train'])
    val_dataset = EmotionDataset(dataset['validation'])
    
    # Test a single sample
    first_input, first_label = train_dataset[0]
    print(f"\nFirst sample shape: {first_input.shape}")
    print(f"First label: {first_label}")
    
    # Create data loaders with smaller batch size
    train_loader = DataLoader(
        train_dataset, 
        batch_size=32, 
        shuffle=True,
        num_workers=0,  # No multiprocessing
        pin_memory=True
    )
    
    val_loader = DataLoader(
        val_dataset, 
        batch_size=32,
        num_workers=0,  # No multiprocessing
        pin_memory=True
    )
    
    # Initialize model, loss function, and optimizer
    model = EmotionCNN(num_classes=8)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    # Train the model
    print("\nStarting training...")
    train_model(model, train_loader, val_loader, criterion, optimizer)
    
    # Save the final model
    print("\nSaving final model...")
    emotion_labels = ['ANG', 'CAL', 'DIS', 'FEA', 'HAP', 'NEU', 'SAD', 'SUR']
    torch.save({
        'model_state_dict': model.state_dict(),
        'emotion_labels': emotion_labels
    }, 'emotion_model.pth')
    
    print("Training completed and model saved!")
    return model, emotion_labels

if __name__ == "__main__":
    model, emotion_labels = main()