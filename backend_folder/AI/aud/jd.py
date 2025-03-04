import torch
import torch.nn as nn
import torch.nn.functional as F
import torchaudio
import numpy as np
from torch.optim import Adam
from torch.optim.lr_scheduler import ReduceLROnPlateau

class ImprovedEmotionCNN(nn.Module):
    def _init_(self):
        super(ImprovedEmotionCNN, self)._init_()
        
        # 1. Improved Feature Extraction Layers
        self.conv1 = nn.Sequential(
            nn.Conv2d(1, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.Dropout2d(0.2)
        )
        
        self.conv2 = nn.Sequential(
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.Dropout2d(0.2)
        )
        
        # 2. Attention Mechanism
        self.attention = SelfAttention(128)
        
        # 3. Residual Connections
        self.residual_block = ResidualBlock(128)
        
        # 4. Enhanced Classification Layers
        self.classifier = nn.Sequential(
            nn.Linear(128 * 8 * 8, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 8)  # 8 emotion classes
        )
        
    def forward(self, x):
        # Initial convolutions
        x = self.conv1(x)
        x = F.max_pool2d(x, 2)
        
        x = self.conv2(x)
        x = F.max_pool2d(x, 2)
        
        # Apply attention
        x = self.attention(x)
        
        # Residual processing
        x = self.residual_block(x)
        
        # Classification
        x = x.view(x.size(0), -1)
        x = self.classifier(x)
        return x

class SelfAttention(nn.Module):
    def _init_(self, in_channels):
        super(SelfAttention, self)._init_()
        self.query = nn.Conv2d(in_channels, in_channels//8, 1)
        self.key = nn.Conv2d(in_channels, in_channels//8, 1)
        self.value = nn.Conv2d(in_channels, in_channels, 1)
        self.gamma = nn.Parameter(torch.zeros(1))
        
    def forward(self, x):
        batch_size, channels, width, height = x.size()
        
        q = self.query(x).view(batch_size, -1, width*height)
        k = self.key(x).view(batch_size, -1, width*height)
        v = self.value(x).view(batch_size, -1, width*height)
        
        attention = F.softmax(torch.bmm(q.permute(0, 2, 1), k), dim=2)
        out = torch.bmm(v, attention.permute(0, 2, 1))
        out = out.view(batch_size, channels, width, height)
        
        return self.gamma * out + x

class ResidualBlock(nn.Module):
    def _init_(self, channels):
        super(ResidualBlock, self)._init_()
        self.conv1 = nn.Conv2d(channels, channels, 3, padding=1)
        self.bn1 = nn.BatchNorm2d(channels)
        self.conv2 = nn.Conv2d(channels, channels, 3, padding=1)
        self.bn2 = nn.BatchNorm2d(channels)
        
    def forward(self, x):
        residual = x
        x = F.relu(self.bn1(self.conv1(x)))
        x = self.bn2(self.conv2(x))
        x += residual
        x = F.relu(x)
        return x

class AudioDataAugmentation:
    def _init_(self):
        self.time_stretch = torchaudio.transforms.TimeStretch()
        self.pitch_shift = torchaudio.transforms.PitchShift(sample_rate=16000)
        
    def augment(self, audio):
        """Apply various augmentations to audio data"""
        augmented = []
        
        # Original audio
        augmented.append(audio)
        
        # Time stretching
        stretch_rates = [0.9, 1.1]
        for rate in stretch_rates:
            stretched = self.time_stretch(audio, rate)
            augmented.append(stretched)
        
        # Pitch shifting
        shift_steps = [-2, 2]
        for steps in shift_steps:
            shifted = self.pitch_shift(audio, steps)
            augmented.append(shifted)
        
        # Add noise
        noise_level = 0.005
        noisy = audio + torch.randn_like(audio) * noise_level
        augmented.append(noisy)
        
        return augmented

def train_improved_model(model, train_loader, val_loader, num_epochs=100):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    
    # 1. Advanced Optimizer
    optimizer = Adam(model.parameters(), lr=0.001, weight_decay=1e-5)
    
    # 2. Learning Rate Scheduler
    scheduler = ReduceLROnPlateau(
        optimizer,
        mode='min',
        factor=0.5,
        patience=5,
        verbose=True
    )
    
    # 3. Class Weights for Imbalanced Data
    class_weights = calculate_class_weights(train_loader)
    criterion = nn.CrossEntropyLoss(weight=class_weights.to(device))
    
    best_val_acc = 0.0
    
    for epoch in range(num_epochs):
        # Training
        model.train()
        train_loss = 0.0
        correct = 0
        total = 0
        
        for batch_idx, (inputs, targets) in enumerate(train_loader):
            inputs, targets = inputs.to(device), targets.to(device)
            
            # Mixed precision training
            with torch.cuda.amp.autocast():
                outputs = model(inputs)
                loss = criterion(outputs, targets)
            
            optimizer.zero_grad()
            loss.backward()
            
            # Gradient clipping
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            
            optimizer.step()
            
            train_loss += loss.item()
            _, predicted = outputs.max(1)
            total += targets.size(0)
            correct += predicted.eq(targets).sum().item()
        
        # Validation
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        
        with torch.no_grad():
            for inputs, targets in val_loader:
                inputs, targets = inputs.to(device), targets.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, targets)
                
                val_loss += loss.item()
                _, predicted = outputs.max(1)
                val_total += targets.size(0)
                val_correct += predicted.eq(targets).sum().item()
        
        # Update learning rate
        val_acc = 100. * val_correct / val_total
        scheduler.step(val_loss)
        
        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), 'best_emotion_model.pth')
        
        print(f'Epoch: {epoch+1}')
        print(f'Train Acc: {100.*correct/total:.2f}%')
        print(f'Val Acc: {val_acc:.2f}%')

def calculate_class_weights(dataloader):
    """Calculate class weights for imbalanced dataset"""
    class_counts = torch.zeros(8)
    for _, labels in dataloader:
        for label in labels:
            class_counts[label] += 1
    
    total = class_counts.sum()
    class_weights = total / (len(class_counts) * class_counts)
    return class_weights