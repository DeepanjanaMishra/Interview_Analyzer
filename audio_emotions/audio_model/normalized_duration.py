import os
import librosa
import soundfile as sf
import numpy as np

# INPUT: resampled audio
INPUT_ROOT = r"C:\Users\Deepanjana Mishra\OneDrive - BENNETT UNIVERSITY\Desktop\DTI_Project\resampled_16k"

# OUTPUT: duration-normalized audio
OUTPUT_ROOT = r"C:\Users\Deepanjana Mishra\OneDrive - BENNETT UNIVERSITY\Desktop\DTI_Project\normalized_3s"

TARGET_SR = 16000
TARGET_DURATION_SEC = 3.0
TARGET_LENGTH = int(TARGET_SR * TARGET_DURATION_SEC)

for root, dirs, files in os.walk(INPUT_ROOT):
    for file in files:
        if file.lower().endswith(".wav"):
            input_path = os.path.join(root, file)

            # Preserve folder structure
            relative_path = os.path.relpath(root, INPUT_ROOT)
            output_dir = os.path.join(OUTPUT_ROOT, relative_path)
            os.makedirs(output_dir, exist_ok=True)

            output_path = os.path.join(output_dir, file)

            try:
                # Load audio (already 16 kHz)
                y, sr = librosa.load(input_path, sr=TARGET_SR)

                current_length = len(y)

                if current_length < TARGET_LENGTH:
                    # --- Pad with silence ---
                    pad_length = TARGET_LENGTH - current_length
                    y = np.pad(y, (0, pad_length), mode="constant")

                elif current_length > TARGET_LENGTH:
                    # --- Center trim ---
                    start = (current_length - TARGET_LENGTH) // 2
                    end = start + TARGET_LENGTH
                    y = y[start:end]

                # Save normalized audio
                sf.write(output_path, y, TARGET_SR)

            except Exception as e:
                print(f"Failed to process {input_path}: {e}")

print("Duration normalization complete. All files are exactly 3.0 seconds.")
