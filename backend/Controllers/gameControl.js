import GameSession from '../models/GameSession.js';

export const logEmotionAndScore = async (req, res) => {
  const { userId, gameName, questionNumber, emotion, score, finalScore } = req.body;

  try {
    let session = await GameSession.findOne({ userId, gameName });

    if (!session) {
      session = new GameSession({ userId, gameName, questions: [] });
    }

    session.questions.push({ questionNumber, emotion, score });

    if (finalScore !== undefined) {
      session.finalScore = finalScore;
    }

    await session.save();
    res.status(200).json({ message: 'Session updated', session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
