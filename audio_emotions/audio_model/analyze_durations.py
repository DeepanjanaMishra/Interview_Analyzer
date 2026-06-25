import os
import soundfile as sf
import numpy as np

# Root folder containing resampled audio
DATA_ROOT = r"C:\Users\Deepanjana Mishra\OneDrive - BENNETT UNIVERSITY\Desktop\DTI_Project\resampled_16k"

durations = []

for root, dirs, files in os.walk(DATA_ROOT):
    for file in files:
        if file.lower().endswith(".wav"):
            file_path = os.path.join(root, file)
            try:
                with sf.SoundFile(file_path) as f:
                    duration_sec = len(f) / f.samplerate
                    durations.append(duration_sec)
            except RuntimeError as e:
                print(f"Error reading {file_path}: {e}")

durations = np.array(durations)

# --- Statistics ---
min_duration = durations.min()
max_duration = durations.max()
mean_duration = durations.mean()
median_duration = np.median(durations)

print("Audio Duration Statistics (seconds)")
print("----------------------------------")
print(f"Minimum duration : {min_duration:.3f}")
print(f"Maximum duration : {max_duration:.3f}")
print(f"Mean duration    : {mean_duration:.3f}")
print(f"Median duration  : {median_duration:.3f}")

# --- Duration Distribution (Histogram) ---
hist_counts, bin_edges = np.histogram(durations, bins=10)

print("\nDuration Distribution (Histogram)")
print("--------------------------------")
for i in range(len(hist_counts)):
    print(f"{bin_edges[i]:.2f} – {bin_edges[i+1]:.2f} sec : {hist_counts[i]} files")
