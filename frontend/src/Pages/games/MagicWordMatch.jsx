import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import correctSoundFile from '../../assets/correct.mp3';
import wrongSoundFile from '../../assets/wrong.mp3';

import bananaImg from '../../assets/banana.jpg';
import grapesImg from '../../assets/grapes.jpg';
import orangeImg from '../../assets/orange.jpg';
import mangoImg from '../../assets/mango.jpg';
import pearImg from '../../assets/pear.jpg';
import pineappleImg from '../../assets/pineapple.jpg';
import cherryImg from '../../assets/cherry.jpg';
import kiwiImg from '../../assets/kiwi.jpg';
import appleImg from '../../assets/apple.jpg';

const wordData = [
  { emoji: '🍌', correct: 'banana', options: ['banan', 'banaan', 'banana'], img: bananaImg },
  { emoji: '🍇', correct: 'grapes', options: ['grapes', 'graeps', 'greaps'], img: grapesImg },
  { emoji: '🍊', correct: 'orange', options: ['oragne', 'orange', 'ornage'], img: orangeImg },
  { emoji: '🥭', correct: 'mango', options: ['mangoo', 'mango', 'mgnao'], img: mangoImg },
  { emoji: '🍐', correct: 'pear', options: ['pare', 'pear', 'peaar'], img: pearImg },
  { emoji: '🍍', correct: 'pineapple', options: ['pinapple', 'pineapple', 'pineaple'], img: pineappleImg },
  { emoji: '🍒', correct: 'cherry', options: ['cherri', 'cheery', 'cherry'], img: cherryImg },
  { emoji: '🥝', correct: 'kiwi', options: ['kiwee', 'kiwi', 'kiwwi'], img: kiwiImg },
  { emoji: '🍎', correct: 'apple', options: ['aplep', 'apple', 'alppe'], img: appleImg },
];

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

export default function MagicWordMatch() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [progress, setProgress] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const sessionId = useRef(uuidv4());

  const navigate = useNavigate();
  const correctAudio = useRef(null);
  const wrongAudio = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // Initialize audio and cleanup
  useEffect(() => {
    correctAudio.current = new Audio(correctSoundFile);
    wrongAudio.current = new Audio(wrongSoundFile);

    return () => {
      correctAudio.current.pause();
      wrongAudio.current.pause();
    };
  }, []);

  // Shuffle options on question change
  useEffect(() => {
    if (currentIndex < wordData.length) {
      const options = [...wordData[currentIndex].options];
      setShuffledOptions(options.sort(() => Math.random() - 0.5));
    }
  }, [currentIndex]);

  const logGameSession = async (questionNumber, emotion, isCorrect, isFinal = false) => {
    try {
      await axios.post('http://localhost:5000/backend/games/log-game-session', {
        userId: currentUser?._id,
        gameName: 'MagicWordMatch',
        sessionId: sessionId.current,
        questionNumber,
        emotion,
        score: isCorrect ? 1 : 0,
        finalScore: isFinal ? score + (isCorrect ? 1 : 0) : undefined
      });
    } catch (err) {
      console.error('Failed to log game session:', err);
      // Optionally show error to user
      setFeedback('⚠️ Failed to save progress');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  const handleAnswer = async (selectedOption) => {
    const isCorrect = selectedOption === wordData[currentIndex].correct;
    const emotion = localStorage.getItem('currentEmotion') || 'neutral';
    const questionNum = currentIndex + 1;
    const isFinal = currentIndex === wordData.length - 1;

    // Play sound and show feedback
    (isCorrect ? correctAudio.current : wrongAudio.current).play();
    setFeedback(isCorrect ? '✅ Correct!' : '❌ Try Again!');

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Log to backend
    await logGameSession(questionNum, emotion, isCorrect, isFinal);

    setTimeout(() => {
      setFeedback('');
      if (!isFinal) {
        setCurrentIndex(prev => prev + 1);
        setProgress(prev => prev + 1);
      } else {
        setProgress(wordData.length);
        setGameOver(true);
      }
    }, 1000);
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setFeedback('');
    setProgress(0);
    setGameOver(false);
    sessionId.current = uuidv4(); // New session ID for new game
  };

  const currentWord = wordData[currentIndex];

  return (
    <div className="min-h-screen bg-cover bg-center p-6 flex flex-col items-center justify-center text-center relative">
      <EmotionListener />

      <button
        onClick={() => navigate('/games')}
        className="absolute top-6 left-6 text-blue-800 bg-white font-bold px-4 py-2 rounded-full shadow hover:bg-blue-50 transition-colors"
      >
        ← Back
      </button>

      <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-3">
        🍓 Magic Word Match
      </h1>

      <div className="bg-transparent rounded-xl p-8 w-full max-w-3xl shadow-xl">
        <div className="h-4 rounded-full mb-6 overflow-hidden bg-white">
          <motion.div
            className="h-full bg-emerald-400"
            initial={{ width: 0 }}
            animate={{ width: `${(progress / wordData.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {!gameOver ? (
          <>
            <motion.div
              key={currentIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-[220px] h-[220px] rounded-xl border-4 border-blue-800 shadow-lg mb-6 mx-auto bg-contain bg-no-repeat bg-center"
              style={{ backgroundImage: `url(${currentWord.img})` }}
            />

            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Spell this fruit correctly:</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {shuffledOptions.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05, backgroundColor: '#a7f3d0' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAnswer(option)}
                  className="bg-emerald-300 hover:bg-emerald-400 px-6 py-3 rounded-xl text-lg font-bold shadow-md text-gray-800 border-2 border-emerald-500 transition-colors"
                >
                  {option}
                </motion.button>
              ))}
            </div>

            <motion.div
              animate={{ scale: feedback ? [1, 1.1, 1] : 1, opacity: feedback ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className={`text-2xl font-bold h-10 ${
                feedback.includes('✅') ? 'text-green-600' : feedback.includes('⚠️') ? 'text-yellow-500' : 'text-red-500'
              }`}
            >
              {feedback}
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-20"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-8 rounded-2xl text-center max-w-md w-full shadow-2xl border-4 border-indigo-600"
            >
              <div className="text-7xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold mb-2 text-indigo-800">Great Job!</h2>
              <p className="text-lg mb-6 text-gray-700">
                You spelled {score} out of {wordData.length} fruits correctly.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/games')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg font-bold shadow-lg transition-colors"
                >
                  🎮 More Games
                </button>
                <button
                  onClick={resetGame}
                  className="bg-lime-600 hover:bg-lime-700 text-white px-5 py-3 rounded-lg font-bold shadow-lg transition-colors"
                >
                  🔄 Play Again
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {!gameOver && (
        <div className="relative w-full h-24 mt-8 max-w-4xl overflow-hidden">
          <motion.div
            className="absolute bottom-0 text-6xl"
            animate={{
              x: (score / wordData.length) * (window.innerWidth > 768 ? 600 : window.innerWidth - 100),
            }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            {currentWord.emoji}
          </motion.div>
        </div>
      )}
    </div>
  );
}