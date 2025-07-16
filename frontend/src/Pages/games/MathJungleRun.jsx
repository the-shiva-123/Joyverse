import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import EmotionBackground from "../../components/EmotionBackground";

function EmotionListener() {
  useEffect(() => {
    const interval = setInterval(() => {
      const emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral'];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      localStorage.setItem('currentEmotion', randomEmotion);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return null;
}

const generateQuestion = () => {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const correct = a + b;
  const options = [correct];
  while (options.length < 3) {
    const wrong = Math.floor(Math.random() * 20) + 1;
    if (!options.includes(wrong)) options.push(wrong);
  }
  return {
    question: `${a} + ${b} = ?`,
    correct,
    options: options.sort(() => Math.random() - 0.5),
  };
};

function MathJungleRunGame({ currentEmotion }) {
  const navigate = useNavigate();
  const [questionData, setQuestionData] = useState(generateQuestion());
  const [score, setScore] = useState(0);
  const [animalX, setAnimalX] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [questionCount, setQuestionCount] = useState(1);

  const sessionId = useRef(uuidv4());
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const logGameSession = async (questionNumber, isCorrect, isFinal = false) => {
    const emotion = localStorage.getItem("currentEmotion") || "neutral";
    try {
      await axios.post("http://localhost:5000/backend/games/log-game-session", {
        userId: currentUser?._id,
        gameName: "MathJungleRun",
        sessionId: sessionId.current,
        questionNumber,
        emotion,
        score: isCorrect ? 1 : 0,
        finalScore: isFinal ? score + (isCorrect ? 1 : 0) : undefined
      });
    } catch (err) {
      console.error("Failed to log game session:", err);
    }
  };

  const handleAnswer = async (option) => {
    const isCorrect = option === questionData.correct;
    const isFinal = questionCount >= 10;
    
    setFeedback(isCorrect ? '✅ Correct!' : '❌ Try Again!');
    await logGameSession(questionCount, isCorrect, isFinal);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setAnimalX(prev => prev + 100);
    }

    setTimeout(async () => {
      if (isFinal) {
        alert(`🎉 Game Over! Your final score is ${score + (isCorrect ? 1 : 0)}/10`);
        setQuestionData(generateQuestion());
        setQuestionCount(1);
        setScore(0);
        setAnimalX(0);
        sessionId.current = uuidv4();
      } else {
        setQuestionData(generateQuestion());
        setQuestionCount(prev => prev + 1);
      }
      setFeedback('');
    }, 1000);
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-start relative">
      <EmotionListener />

      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 flex items-center text-white hover:text-yellow-300 transition-colors"
      >
        <FiArrowLeft className="mr-1" />
        Back
      </button>

      <h1 className="text-4xl font-bold text-white text-center mb-6 drop-shadow-lg">
        🦁 Math Jungle Run
      </h1>

      <motion.div
        animate={{ x: animalX }}
        transition={{ type: 'spring', stiffness: 80 }}
        className="text-7xl mb-4"
      >
        🐵
      </motion.div>

      <div className="bg-white bg-opacity-80 rounded-xl p-6 max-w-xl mx-auto text-center shadow-lg w-full backdrop-blur-sm">
        <h2 className="text-2xl font-semibold mb-4">{questionData.question}</h2>
        <div className="flex justify-center gap-4 mb-4 flex-wrap">
          {questionData.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(option)}
              className="bg-green-400 hover:bg-green-500 px-6 py-2 rounded-xl text-lg font-bold shadow"
            >
              {option}
            </button>
          ))}
        </div>
        <div className="text-xl font-medium text-blue-700 min-h-[30px]">{feedback}</div>
        <div className="mt-4 text-gray-800 text-lg font-semibold">⭐ Score: {score}</div>
        <div className="text-sm mt-1 text-gray-600">Question {questionCount}/10</div>
      </div>
    </div>
  );
}

export default function MathJungleRun() {
  return (
    <EmotionBackground>
      {({ currentEmotion }) => <MathJungleRunGame currentEmotion={currentEmotion} />}
    </EmotionBackground>
  );
}