import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import tensorflow as tf
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling1D
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input

# =========================
# Load dataset
# =========================

X = np.load("X_dataset.npy")
y = np.load("y_labels.npy")

num_classes = len(np.unique(y))

print("Loaded data:")
print("X shape:", X.shape)
print("y shape:", y.shape)

# =========================
# Dataset split
# =========================

X_train, X_temp, y_train, y_temp = train_test_split(
    X, y,
    test_size=0.30,
    random_state=42,
    stratify=y
)

X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp,
    test_size=0.50,
    random_state=42,
    stratify=y_temp
)

print("\nDataset split:")
print("X_train:", X_train.shape)
print("X_val:", X_val.shape)
print("X_test:", X_test.shape)

# =========================
# Feature scaling
# =========================

scaler = StandardScaler()

X_train_r = X_train.reshape(-1, X_train.shape[-1])
X_val_r = X_val.reshape(-1, X_val.shape[-1])
X_test_r = X_test.reshape(-1, X_test.shape[-1])

X_train_scaled = scaler.fit_transform(X_train_r).reshape(X_train.shape)
X_val_scaled = scaler.transform(X_val_r).reshape(X_val.shape)
X_test_scaled = scaler.transform(X_test_r).reshape(X_test.shape)

joblib.dump(scaler, "scaler.pkl")
print("Scaler saved!")


# =========================
# Label encoding
# =========================

y_train_cat = to_categorical(y_train, num_classes)
y_val_cat = to_categorical(y_val, num_classes)
y_test_cat = to_categorical(y_test, num_classes)

# =========================
# Prebuilt/pretrained model
# =========================

timesteps = X.shape[1]
features = X.shape[2]

inputs = Input(shape=(timesteps, features))

# Prebuilt LSTM backbone (standard architecture)
x = tf.keras.layers.Bidirectional(
    tf.keras.layers.LSTM(128, return_sequences=True)
)(inputs)

x = tf.keras.layers.Bidirectional(
    tf.keras.layers.LSTM(64, return_sequences=True)
)(x)

x = GlobalAveragePooling1D()(x)

x = Dense(64, activation="relu")(x)
x = Dropout(0.3)(x)

outputs = Dense(num_classes, activation="softmax")(x)

model = Model(inputs, outputs)

# =========================
# Compile model
# =========================

model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# =========================
# Training
# =========================

early_stop = EarlyStopping(
    monitor="val_loss",
    patience=5,
    restore_best_weights=True
)

history = model.fit(
    X_train_scaled,
    y_train_cat,
    validation_data=(X_val_scaled, y_val_cat),
    epochs=50,
    batch_size=32,
    callbacks=[early_stop],
    verbose=1
)

# =========================
# Evaluation
# =========================

val_loss, val_accuracy = model.evaluate(X_val_scaled, y_val_cat, verbose=0)
print(f"\nValidation Accuracy: {val_accuracy:.4f}")

test_loss, test_accuracy = model.evaluate(X_test_scaled, y_test_cat, verbose=0)
print(f"Test Accuracy: {test_accuracy:.4f}")

# =========================
# Save model
# =========================

model.save("emotion_pretrained_model.keras")
print("Model saved as emotion_pretrained_model.keras")