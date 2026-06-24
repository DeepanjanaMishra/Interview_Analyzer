import os

dataset_path = r"C:\Users\Deepanjana Mishra\OneDrive - BENNETT UNIVERSITY\Desktop\AI_ML_Project\Facial emotions"

splits = ["train", "test"]
emotions = ["angry","disgust","fear","happy","sad","surprise","neutral"]

for split in splits:
    print(f"\nChecking {split} folder:")
    for emotion in emotions:
        path = os.path.join(dataset_path, split, emotion)
        if os.path.exists(path):
            num_files = len(os.listdir(path))
            print(f"{emotion}: {num_files} images")
        else:
            print(f"{emotion}: Folder missing!")