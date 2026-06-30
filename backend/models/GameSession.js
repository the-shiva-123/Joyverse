import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionNumber: Number,
  emotion: String,
  score: Number,
});

const gameSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gameName: String,
  questions: [questionSchema],
  finalScore: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('GameSession', gameSessionSchema);
