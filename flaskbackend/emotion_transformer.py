import torch
import torch.nn as nn
import torch.nn.functional as F
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from torch.utils.data import Dataset, DataLoader
import math



train_df = pd.read_csv(r'C:\Users\dell\OneDrive\Desktop\JoyVerse\test_faces_mesh.csv')
test_df = pd.read_csv(r'C:\Users\dell\OneDrive\Desktop\JoyVerse\train_faces_mesh.csv')


X_train = train_df.iloc[:, :-1].values.astype(np.float32)
y_train = train_df.iloc[:, -1].values
X_test = test_df.iloc[:, :-1].values.astype(np.float32)
y_test = test_df.iloc[:, -1].values


scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

label_encoder = LabelEncoder()
y_train = label_encoder.fit_transform(y_train)
y_test = label_encoder.transform(y_test)



class FaceMeshDataset(Dataset):
    def __init__(self, X, y):
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y = torch.tensor(y, dtype=torch.long)

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]

train_dataset = FaceMeshDataset(X_train, y_train)
test_dataset = FaceMeshDataset(X_test, y_test)

train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=32)



class PositionalEncoding(nn.Module):
    def __init__(self, dim, max_len=5000):
        super().__init__()
        pe = torch.zeros(max_len, dim)
        position = torch.arange(0, max_len).unsqueeze(1).float()
        div_term = torch.exp(torch.arange(0, dim, 2).float() * (-math.log(10000.0) / dim))
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        self.pe = pe.unsqueeze(0)

    def forward(self, x):
        return x + self.pe[:, :x.size(1)].to(x.device)

class TransformerBlock(nn.Module):
    def __init__(self, embed_dim, heads, ff_hidden_dim, dropout=0.2):
        super().__init__()
        self.attn = nn.MultiheadAttention(embed_dim, heads, dropout=dropout, batch_first=True)
        self.ff = nn.Sequential(
            nn.Linear(embed_dim, ff_hidden_dim),
            nn.ReLU(),
            nn.Linear(ff_hidden_dim, embed_dim)
        )
        self.norm1 = nn.LayerNorm(embed_dim)
        self.norm2 = nn.LayerNorm(embed_dim)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        attn_output, _ = self.attn(x, x, x)
        x = self.norm1(x + self.dropout(attn_output))
        ff_output = self.ff(x)
        x = self.norm2(x + self.dropout(ff_output))
        return x

# -------------------------------
# Step 4: Emotion Transformer
# -------------------------------

class EmotionTransformer(nn.Module):
    def __init__(self, input_size, embed_dim=128, num_heads=4, ff_dim=256, num_classes=7, num_layers=4):
        super().__init__()
        self.embedding = nn.Linear(input_size, embed_dim)
        self.embedding_dropout = nn.Dropout(0.3)
        self.pos_encoder = PositionalEncoding(embed_dim)
        self.transformer_blocks = nn.Sequential(*[
            TransformerBlock(embed_dim, num_heads, ff_dim) for _ in range(num_layers)
        ])
        self.classifier = nn.Linear(embed_dim, num_classes)

    def forward(self, x):
        x = self.embedding_dropout(self.embedding(x).unsqueeze(1))
        x = self.pos_encoder(x)
        x = self.transformer_blocks(x)
        x = x.mean(dim=1)
        return self.classifier(x)



device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = EmotionTransformer(input_size=X_train.shape[1])
model.to(device)

optimizer = torch.optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-5)
scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=2)

criterion = nn.CrossEntropyLoss()

num_epochs = 5
best_accuracy = 0.0
best_model = None

print("\n\U0001f9e0 Training Transformer Model...")
for epoch in range(1, num_epochs + 1):
    model.train()
    total_loss = 0
    for inputs, labels in train_loader:
        inputs, labels = inputs.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    avg_loss = total_loss / len(train_loader)

    
    model.eval()
    correct, total = 0, 0
    with torch.no_grad():
        for inputs, labels in test_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            _, predicted = torch.max(outputs, 1)
            correct += (predicted == labels).sum().item()
            total += labels.size(0)
    accuracy = 100 * correct / total
    scheduler.step(avg_loss)

    if accuracy > best_accuracy:
        best_accuracy = accuracy
        best_model = model.state_dict()

    print(f"Epoch {epoch}: Loss = {avg_loss:.4f}, Accuracy = {accuracy:.2f}%")

torch.save(best_model, "joyverse_model.pth")
print(f"\n\u2705 Best Test Accuracy: {best_accuracy:.2f}%")
print("\u2705 Model saved as joyverse_model.pth")



def load_model_and_predict(keypoints):
    global label_encoder
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = EmotionTransformer(input_size=len(keypoints))
    model.load_state_dict(torch.load("joyverse_model.pth", map_location=device))
    model.eval()
    model.to(device)

    x = torch.tensor(keypoints, dtype=torch.float32).unsqueeze(0).to(device)
    with torch.no_grad():
        output = model(x)
        _, predicted = torch.max(output, 1)
        emotion_index = predicted.item()
    return label_encoder.inverse_transform([emotion_index])[0]
