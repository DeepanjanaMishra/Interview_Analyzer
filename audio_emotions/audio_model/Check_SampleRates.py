import os
import soundfile as sf

root_folders = [
    #r"C:\Users\Deepanjana Mishra\OneDrive - BENNETT UNIVERSITY\Desktop\AI_ML_Project\RAVDESS",
    #r"C:\Users\Deepanjana Mishra\OneDrive - BENNETT UNIVERSITY\Desktop\AI_MLProject\TESS"
    r"C:\Users\Deepanjana Mishra\OneDrive - BENNETT UNIVERSITY\Desktop\AI_ML_Project\resampled_16k"
]

sample_rates = set()

for root_folder in root_folders:
    for root, dirs, files in os.walk(root_folder):
        for file in files:
            if file.lower().endswith(".wav"):
                file_path = os.path.join(root, file)
                try:
                    with sf.SoundFile(file_path) as f:
                        sr = f.samplerate
                        sample_rates.add(sr)
                except RuntimeError as e:
                    print(f"Error reading {file_path}: {e}")

print("Unique sample rates found:", sample_rates)
