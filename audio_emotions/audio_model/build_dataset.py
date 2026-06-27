import os
import numpy as np

FEATURE_ROOT = r"C:\Users\Deepanjana Mishra\OneDrive - BENNETT UNIVERSITY\Desktop\DTI_Project\features_mfcc"

emotion_to_label = {
    "neutral": 0,
    "calm": 1,
    "happy": 2,
    "sad": 3,
    "angry": 4,
    "fearful": 5,
    "disgust": 6,
    "surprised": 7
}

ravdess_emotion_map = {
    "01": "neutral",
    "02": "calm",
    "03": "happy",
    "04": "sad",
    "05": "angry",
    "06": "fearful",
    "07": "disgust",
    "08": "surprised"
}

emotion_aliases = {
    "fear": "fearful",
    "fearful": "fearful",
    "surprise": "surprised",
    "surprised": "surprised"
}


X = []
y = []

for root, dirs, files in os.walk(FEATURE_ROOT):
    for file in files:
        if file.endswith(".npy"):
            file_path = os.path.join(root, file)

            # --- Load features ---
            features = np.load(file_path)

            # --- Determine dataset source ---
            if "RAVDESS" in root:
                # Filename format: 03-01-01-01-01-01-01.npy
                emotion_id = file.split("-")[2]
                emotion = ravdess_emotion_map[emotion_id]

            elif "TESS" in root:
                # Folder name contains emotion
                folder_name = os.path.basename(root).lower()
                emotion = folder_name.split("_")[-1]

            else:
                continue

            emotion = emotion_aliases.get(emotion, emotion)
            label = emotion_to_label[emotion]


            X.append(features)
            y.append(label)

X = np.array(X)
y = np.array(y)

print("Dataset built successfully")
print("X shape:", X.shape)
print("y shape:", y.shape)

# Save final tensors
np.save("X_dataset.npy", X)
np.save("y_labels.npy", y)
