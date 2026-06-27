import os
import librosa
import soundfile as sf

# INPUT DATASETS
input_folders = [
    r"C:\Users\Deepanjana Mishra\OneDrive - BENNETT UNIVERSITY\Desktop\AI_ML_Project\Project_code\audio_emotions\RAVDESS",
    r"C:\Users\Deepanjana Mishra\OneDrive - BENNETT UNIVERSITY\Desktop\AI_ML_Project\Project_code\audio_emotions\TESS"
]

# OUTPUT ROOT
output_root = r"C:\Users\Deepanjana Mishra\OneDrive - BENNETT UNIVERSITY\Desktop\AI_ML_Project\Project_code\audio_emotions\resampled_16k"

TARGET_SR = 16000

for input_root in input_folders:
    dataset_name = os.path.basename(input_root)
    output_dataset_root = os.path.join(output_root, dataset_name)

    for root, dirs, files in os.walk(input_root):
        for file in files:
            if file.lower().endswith(".wav"):
                input_path = os.path.join(root, file)

                # Preserve folder structure
                relative_path = os.path.relpath(root, input_root)
                output_dir = os.path.join(output_dataset_root, relative_path)
                os.makedirs(output_dir, exist_ok=True)

                output_path = os.path.join(output_dir, file)

                try:
                    y, sr = librosa.load(input_path, sr=None)

                    if sr != TARGET_SR:
                        y = librosa.resample(y, orig_sr=sr, target_sr=TARGET_SR)

                    sf.write(output_path, y, TARGET_SR)

                except Exception as e:
                    print(f"Failed to process {input_path}: {e}")

print("Resampling complete. All files saved at 16 kHz.")
