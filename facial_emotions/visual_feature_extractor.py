import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image

# ------------------------
# Device (cross-platform)
# ------------------------
if torch.cuda.is_available():
    device = torch.device("cuda")
elif torch.backends.mps.is_available():
    device = torch.device("mps")
else:
    device = torch.device("cpu")

print("Using device:", device)

# ------------------------
# Same Model Architecture
# ------------------------
class EmotionCNN(nn.Module):
    def __init__(self):
        super(EmotionCNN, self).__init__()

        self.conv_layers = nn.Sequential(
            nn.Conv2d(1, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d(2)
        )

        self.flatten = nn.Flatten()

        self.feature_layer = nn.Sequential(
            nn.Linear(128 * 6 * 6, 256),
            nn.ReLU(),
            nn.Dropout(0.5)
        )

        self.classifier = nn.Linear(256, 7)

    def forward(self, x):
        x = self.conv_layers(x)
        x = self.flatten(x)
        features = self.feature_layer(x)
        output = self.classifier(features)
        return output, features

# ------------------------
# Load Model
# ------------------------
model = EmotionCNN().to(device)
model.load_state_dict(torch.load("facial_emotions/emotion_cnn.pth", map_location=device))
model.eval()

print("Model loaded successfully!")

# ------------------------
# Image Transform
# ------------------------
transform = transforms.Compose([
    transforms.Grayscale(num_output_channels=1),
    transforms.Resize((48, 48)),
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

# ------------------------
# Feature Extraction Function
# ------------------------
def extract_visual_features(image_path):
    image = Image.open(image_path)
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        _, features = model(image)

    return features.cpu().numpy()

# ------------------------
# Test the feature extractor
# ------------------------

test_image = r"C:\Users\Deepanjana Mishra\OneDrive - BENNETT UNIVERSITY\Desktop\AI_ML_Project\Facial emotions\test\happy\PrivateTest_218533.jpg"
test_image1 = r"C:\Users\Deepanjana Mishra\OneDrive - BENNETT UNIVERSITY\Desktop\AI_ML_Project\Facial emotions\test\sad\PrivateTest_2013992.jpg"

features = extract_visual_features(test_image)
features = extract_visual_features(test_image1)

print("Feature vector shape:", features.shape)
print("Feature vector:", features)