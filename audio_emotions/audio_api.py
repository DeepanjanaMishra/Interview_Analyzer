from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
import joblib
import librosa
import os
from pydub import AudioSegment

app = Flask(__name__)
CORS(app)

# ---------------- LOAD MODEL ----------------
try:
    model = tf.keras.models.load_model("audio_model/emotion_pretrained_model.keras")
    scaler = joblib.load("audio_model/scaler.pkl")
    print("✅ Audio model & scaler loaded successfully")
except Exception as e:
    print("❌ Error loading model/scaler:", e)

# ---------------- LABELS ----------------
labels = [
    "neutral",
    "calm",
    "happy",
    "sad",
    "angry",
    "fearful",
    "disgust",
    "surprised"
]

# ---------------- FEATURE EXTRACTION ----------------
def extract_features(file_path):
    print("📂 Loading WAV file:", file_path)

    audio, sr = librosa.load(file_path, sr=None)
    print("🎧 Audio length:", len(audio), "| SR:", sr)

    mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=39)
    mfcc = mfcc.T

    MAX_LEN = 301

    if len(mfcc) < MAX_LEN:
        mfcc = np.pad(mfcc, ((0, MAX_LEN - len(mfcc)), (0, 0)), mode='constant')
    else:
        mfcc = mfcc[:MAX_LEN]

    print("📊 MFCC final shape:", mfcc.shape)

    return mfcc

# ---------------- API ----------------
@app.route("/predict-audio", methods=["POST"])
def predict_audio():
    print("\n🚀 /predict-audio called")

    webm_path = "temp.webm"
    wav_path = "temp.wav"

    try:
        if "audio" not in request.files:
            print("❌ No audio file in request")
            return jsonify({"emotion": None})

        file = request.files["audio"]
        print("📥 Received file:", file.filename)

        # Save WEBM
        file.save(webm_path)

        file_size = os.path.getsize(webm_path)
        print("📦 File size:", file_size)

        # ✅ Skip only truly tiny files
        if file_size < 3000:
            print("⚠️ File too small, skipping")
            os.remove(webm_path)
            return jsonify({"emotion": None})

        # Convert WEBM → WAV
        try:
            audio = AudioSegment.from_file(webm_path, format="webm")
            audio.export(wav_path, format="wav")
            print("🔄 Converted to WAV:", wav_path)
        except Exception as e:
            print("⚠️ Conversion failed:", e)
            return jsonify({"emotion": None})

        # Extract features
        features = extract_features(wav_path)

        if features is None:
            print("⚠️ Feature extraction failed")
            return jsonify({"emotion": None})

        # 🔥 FIX SCALING (VERY IMPORTANT)
        features_2d = features.reshape(-1, 39)
        features_scaled = scaler.transform(features_2d)
        features = features_scaled.reshape(301, 39)

        # Add batch dimension
        features = np.expand_dims(features, axis=0)

        print("📦 Model input shape:", features.shape)

        # Predict
        preds = model.predict(features)
        print("🤖 Raw prediction:", preds)

        pred = np.argmax(preds)
        emotion = labels[pred]

        print("🎤 Final Predicted Emotion:", emotion)

        return jsonify({
            "emotion": emotion
        })

    except Exception as e:
        print("🔥 ERROR in /predict-audio:", str(e))
        return jsonify({"emotion": None})

    finally:
        # 🔥 CLEANUP ALWAYS
        if os.path.exists(webm_path):
            os.remove(webm_path)
        if os.path.exists(wav_path):
            os.remove(wav_path)

# ---------------- RUN ----------------
if __name__ == "__main__":
    print("🚀 Starting Audio Emotion Server on port 5002...")
    app.run(port=5002, debug=True)