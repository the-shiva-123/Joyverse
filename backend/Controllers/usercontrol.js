// backend/Controllers/usercontrol.js

import GameSession from "../models/GameSession.js"; // optional, if used in future
import User from "../models/UserModel.js";

// Log emotion and score for a specific question in a game
export const logEmotionAndScore = async (req, res) => {
  const { userId, gameName, sessionId, questionNumber, emotion, score } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Push emotion and score to the user's emotions array
    user.emotions.push({
      gameName,
      questionNumber,
      emotion,
      score,
      timestamp: new Date(),
    });

    await user.save();
    res.status(200).json({ message: "Emotion and score logged successfully" });
  } catch (error) {
    console.error("Logging error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Log the final score of a game session
export const logFinalScore = async (req, res) => {
  const { userId, gameName, finalScore } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Append final score to user's gamePlays array
    user.gamePlays.push({ gameName, finalScore, playedAt: new Date() });

    await user.save();
    res.status(200).json({ message: "Final score saved successfully" });
  } catch (error) {
    console.error("Score saving error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
