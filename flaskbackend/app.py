from flask import Flask, request, jsonify # Flask for API, request for POST data, jasonify for JSON response
from flask_cors import CORS   # Enables Cross-Origin Resource Sharing (for frontend-backend communication)
import torch    # PyTorch for deep learning model
import numpy as np # usefull for processing the data
from emotion_transformer import EmotionTransformer # Import your custom model architecture

app = Flask(__name__)
CORS(app) # Allow request from different domians
 
# Set the device: GPU if available, else CPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load pre-trained model
model = EmotionTransformer(input_size=1404)  # 468 landmarks x 3 coords
model.load_state_dict(torch.load(r'D:\FinalProject\flaskbackend\joyverse_model.pth',map_location=device))
model.to(device)
model.eval() # Set model to the evaluation mode

# Define the endpoints
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json() # Get JSON from POST request
    landmarks = data.get('landmarks') # Extract landmarks from data
    # If landmarks are not provided or not of expected size, return fallback emotion
    if not landmarks or len(landmarks) != 1404:
        return jsonify({'emotion': 'neutral'})
    
    # Convert landmarks to a tensor and add batch dimension
    input_tensor = torch.tensor(landmarks, dtype=torch.float32).unsqueeze(0).to(device)

    # Predict emotion using the model
    with torch.no_grad():   # Inference mode (no gradient calculation needed)
        output = model(input_tensor) # Get output scores for each emotion
        predicted = torch.argmax(output, dim=1).item() # Get index of highest score


    # Map prediction index to emotion label
    emotion_map = {
        0: "happy",
        1: "sad",
        2: "angry",
        3: "neutral",
        4: "surprise",
        5: "fear",
        6: "disgust"
    }
    emotion = emotion_map.get(predicted, "unknown") # Default to unknown if index not in map

    print(f"🧠 Received: {len(landmarks)} values → Predicted: {predicted} → Emotion: {emotion}")
    return jsonify({'emotion': emotion})


# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
