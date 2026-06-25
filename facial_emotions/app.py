from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import os

app = Flask(__name__)
CORS(app)

# ---------------------------
# MODEL ARCHITECTURE (SAME AS TRAINING)
# ---------------------------

class EmotionCNN(nn.Module):
    def __init__(self):
        super(EmotionCNN, self).__init__()

        self.conv_layers = nn.Sequential(

            nn.Conv2d(1, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),

            nn.Conv2d(32, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),

            nn.MaxPool2d(2),

            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),

            nn.Conv2d(64, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),

            nn.MaxPool2d(2),

            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),

            nn.Conv2d(128, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),

            nn.MaxPool2d(2)
        )

        self.flatten = nn.Flatten()

        self.feature_layer = nn.Sequential(
            nn.Linear(128 * 6 * 6, 1024),
            nn.ReLU(),
            nn.Dropout(0.5),

            nn.Linear(1024, 256),
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


# ---------------------------
# LOAD MODEL
# ---------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "model saved after its training using cnn architecture")

device = torch.device("cpu")

model = EmotionCNN().to(device)
model.load_state_dict(torch.load(model_path, map_location=device))
model.eval()

print("✅ Model loaded successfully")

# ---------------------------
# TRANSFORM (SAME AS TEST)
# ---------------------------

transform = transforms.Compose([
    transforms.Grayscale(num_output_channels=1),
    transforms.Resize((48, 48)),
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

# ---------------------------
# LABELS (VERY IMPORTANT)
# ---------------------------

labels =["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"]

# ---------------------------
# API ROUTE
# ---------------------------


@app.route("/")
def home():
    return "ML API RUNNING"
@app.route("/predict", methods=["POST"])
def predict():
    try:
        print("API HIT")

        if "image" not in request.files:
            return jsonify({"error": "No image received"})
        file = request.files["image"]

        img = Image.open(file).convert("RGB")
        img = transform(img).unsqueeze(0).to(device)

        with torch.no_grad():
            outputs, _ = model(img)
            pred = torch.argmax(outputs, 1).item()

        emotion = labels[pred]
        print("Predicted index:", pred)
        print("Emotion:", emotion)

        return jsonify({
            "emotion": emotion
        })
        

    except Exception as e:
        return jsonify({
            "error": str(e)
        })
    
print(app.url_map)

# ---------------------------
# RUN SERVER
# ---------------------------

if __name__ == "__main__":
    app.run(port=5001, debug=True)
