import os
import zipfile
import tensorflow as tf
from tensorflow import keras
from keras import Sequential
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Flatten, Dropout
from tensorflow.keras.applications import VGG16
from tensorflow.keras.preprocessing import image_dataset_from_directory
from tensorflow.keras import mixed_precision

# Enable GPU memory growth for efficient usage
gpus = tf.config.experimental.list_physical_devices("GPU")
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
    except RuntimeError as e:
        print(e)

# Enable mixed precision for faster training
mixed_precision.set_global_policy("mixed_float16")

# Enable XLA JIT compilation for speedup
tf.config.optimizer.set_jit(True)

# Set dataset directory
DATASET_DIR = r"D:\Realtime_emotion_analysis\img\dataset"

# Load pre-trained VGG16 model (without top layers)
conv_base = VGG16(weights="imagenet", include_top=False, input_shape=(150, 150, 3))
conv_base.trainable = False  # Freeze convolutional layers

# Build model with additional dropout for better generalization
model = Sequential([
    conv_base,
    Flatten(),
    Dense(512, activation="relu"),
    Dropout(0.3),  # Prevent overfitting
    Dense(256, activation="relu"),
    Dense(7, activation="softmax", dtype="float32")  # Ensure proper dtype
])

# Compile with mixed precision optimizer
opt = keras.optimizers.Adam(learning_rate=0.0005)
model.compile(optimizer=opt, loss="categorical_crossentropy", metrics=["accuracy"])

# Load dataset using tf.data pipeline
batch_size = 128  # Increase batch size for better GPU utilization
train_dataset = image_dataset_from_directory(
    DATASET_DIR,
    image_size=(150, 150),
    batch_size=batch_size,
    validation_split=0.2,
    subset="training",
    seed=42,
    label_mode="categorical"  # Ensure one-hot encoding
).cache().prefetch(buffer_size=tf.data.AUTOTUNE)  # Cache and prefetch for speed

val_dataset = image_dataset_from_directory(
    DATASET_DIR,
    image_size=(150, 150),
    batch_size=batch_size,
    validation_split=0.2,
    subset="validation",
    seed=42,
    label_mode="categorical"
).cache().prefetch(buffer_size=tf.data.AUTOTUNE)

# Train with full GPU power
history = model.fit(train_dataset, epochs=10, validation_data=val_dataset)

# Save model in TensorFlow's SavedModel format
saved_model_path = r"D:\Realtime_emotion_analysis\saved_model"
model.save(saved_model_path, save_format="tf")
print(f"Model saved in {saved_model_path}")
