import os
import librosa
import numpy as np

# INPUT: duration-normalized audio
INPUT_ROOT = r"C:\Users\Deepanjana Mishra\OneDrive - BENNETT UNIVERSITY\Desktop\DTI_Project\normalized_3s"

# OUTPUT: extracted features
OUTPUT_ROOT = r"C:\Users\Deepanjana Mishra\OneDrive - BENNETT UNIVERSITY\Desktop\DTI_Project\features_mfcc"

SAMPLE_RATE = 16000
N_MFCC = 13
N_FFT = int(0.025 * SAMPLE_RATE)      # 25 ms
HOP_LENGTH = int(0.010 * SAMPLE_RATE) # 10 ms

for root, dirs, files in os.walk(INPUT_ROOT):
    for file in files:
        if file.lower().endswith(".wav"):
            input_path = os.path.join(root, file)

            # Preserve folder structure
            relative_path = os.path.relpath(root, INPUT_ROOT)
            output_dir = os.path.join(OUTPUT_ROOT, relative_path)
            os.makedirs(output_dir, exist_ok=True)

            output_path = os.path.join(
                output_dir,
                file.replace(".wav", ".npy")
            )

            try:
                # Load audio
                y, sr = librosa.load(input_path, sr=SAMPLE_RATE)

                # --- MFCC ---
                mfcc = librosa.feature.mfcc(
                    y=y,
                    sr=sr,
                    n_mfcc=N_MFCC,
                    n_fft=N_FFT,
                    hop_length=HOP_LENGTH
                )

                # --- Delta features ---
                delta = librosa.feature.delta(mfcc)
                delta2 = librosa.feature.delta(mfcc, order=2)

                # Stack features: (features, time) → (time, features)
                features = np.vstack([mfcc, delta, delta2]).T

                # Save features
                np.save(output_path, features)

            except Exception as e:
                print(f"Failed to process {input_path}: {e}")

print("MFCC feature extraction complete.")
