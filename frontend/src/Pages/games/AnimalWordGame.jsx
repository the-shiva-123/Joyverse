import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';


import correctSoundFile from '../../assets/correct.mp3';
import wrongSoundFile from '../../assets/wrong.mp3';
import bgMusicFile from '../../assets/bg.mp3';

import cat from '../../assets/cat.jpg';
import lion from '../../assets/lion.jpg';
import pig from '../../assets/pig.jpg';
import spiderman from '../../assets/spiderman.jpg';
import barbie from '../../assets/barbie.jpg';
import chotabheem from '../../assets/chotabheem.jpg';

const animals = [
  { name: 'cat', word: 'CAT', img: cat },
  { name: 'lion', word: 'LION', img: lion },
  { name: 'pig', word: 'PIG', img: pig },
  { name: 'spiderman', word: 'SPIDERMAN', img: spiderman },
  { name: 'barbie', word: 'BARBIE', img: barbie },
  { name: 'chota bheem', word: 'CHOTABHEEM', img: chotabheem },
];

export default function AnimalWordGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [letters, setLetters] = useState([]);
  const [result, setResult] = useState([]);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [width, height] = useWindowSize();


  const correctSound = useRef(new Audio(correctSoundFile));
  const wrongSound = useRef(new Audio(wrongSoundFile));
  const bgMusic = useRef(new Audio(bgMusicFile));
  const sessionId = useRef(uuidv4());

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id;
  const navigate = useNavigate();
  const currentAnimal = animals[currentIndex];

  useEffect(() => {
    bgMusic.current.loop = true;
    bgMusic.current.volume = 0.4;

    const playMusicOnce = () => {
      bgMusic.current.play().catch(() => {});
    };

    window.addEventListener('click', playMusicOnce, { once: true });

    return () => {
      window.removeEventListener('click', playMusicOnce);
      bgMusic.current.pause();
      bgMusic.current.currentTime = 0;
      correctSound.current.pause();
      correctSound.current.currentTime = 0;
      wrongSound.current.pause();
      wrongSound.current.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (!gameOver) setupGame();
  }, [currentIndex]);

  const shuffle = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const setupGame = () => {
    setMessage('');
    setLetters(shuffle(currentAnimal.word.split('')));
    setResult(Array(currentAnimal.word.length).fill(''));
  };

  const handleDrop = (letter, index) => {
    if (result[index] === '') {
      const newResult = [...result];
      newResult[index] = letter;
      setResult(newResult);
      const updatedLetters = [...letters];
      updatedLetters.splice(updatedLetters.indexOf(letter), 1);
      setLetters(updatedLetters);
    }
  };

  const logGameSession = async (questionNumber, isCorrect, isFinal = false) => {
    const emotion = ['happy', 'sad', 'angry', 'surprised', 'neutral','disgust','fear'][Math.floor(Math.random() * 5)];
    try {
      await axios.post('http://localhost:5000/backend/games/log-game-session', {
        userId,
        gameName: 'AnimalWordGame',
        sessionId: sessionId.current,
        questionNumber,
        emotion,
        score: isCorrect ? 1 : 0,
        finalScore: isFinal ? score + (isCorrect ? 1 : 0) : undefined
      });
    } catch (error) {
      console.error("Error logging session:", error.message);
    }
  };

  const handleCheck = async () => {
    if (result.includes('')) {
      setMessage('Please fill all the boxes!');
      return;
    }

    const formed = result.join('');
    const isCorrect = formed === currentAnimal.word;
    const isFinal = currentIndex === animals.length - 1;

    if (isCorrect) {
      correctSound.current.play();
      setMessage(`✅ Correct! The word is "${formed}"`);
      const newScore = score + 1;
      setScore(newScore);

      await logGameSession(currentIndex + 1, true, isFinal);

      setTimeout(() => {
        if (!isFinal) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setGameOver(true);
        }
      }, 1000);
    } else {
      wrongSound.current.play();
      setMessage('❌ Incorrect! Try again.');

      await logGameSession(currentIndex + 1, false, isFinal);
      if (isFinal) {
        setGameOver(true);
      }
    }
  };

  const handleReplay = () => {
    setCurrentIndex(0);
    setScore(0);
    setGameOver(false);
    setMessage('');
    setupGame();
    sessionId.current = uuidv4();
  };

  const handleRefresh = () => setupGame();

  const handleBack = () => {
    bgMusic.current.pause();
    bgMusic.current.currentTime = 0;
    navigate(-1);
  };

  return (
    <div className="flex flex-col items-center justify-center text-center text-white px-4 py-10 relative">
      <button
        onClick={handleBack}
        className="absolute top-5 left-5 bg-white text-blue-700 font-bold px-4 py-2 rounded-full shadow hover:bg-blue-100"
      >
        ← Back
      </button>

      <h2 className="text-4xl font-extrabold mb-4 drop-shadow-lg">🧠 Word Game</h2>

      <div
        className="w-[220px] h-[220px] bg-white rounded-xl border-4 border-blue-800 shadow-lg mb-6 bg-cover bg-center"
        style={{ backgroundImage: `url(${currentAnimal.img})` }}
        role="img"
        aria-label="Animal image to guess"
      />

      <div className="flex flex-wrap justify-center gap-3 mb-5">
        {result.map((letter, index) => (
          <div
            key={index}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e.dataTransfer.getData('text/plain'), index)}
            className="w-14 h-14 bg-blue-100 border-4 border-blue-700 text-blue-900 text-xl font-bold flex items-center justify-center rounded-lg shadow-inner"
          >
            {letter}
          </div>
        ))}
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          const draggedLetter = e.dataTransfer.getData('text/plain');
          if (!letters.includes(draggedLetter) && result.includes(draggedLetter)) {
            setLetters([...letters, draggedLetter]);
            setResult(result.map(l => l === draggedLetter ? '' : l));
          }
        }}
        className="flex flex-wrap justify-center gap-3 mb-6"
      >
        {letters.map((letter, idx) => (
          <div
            key={idx}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', letter)}
            className="w-14 h-14 bg-white border-4 border-blue-700 text-blue-800 text-xl font-bold flex items-center justify-center rounded-lg shadow-md cursor-grab active:cursor-grabbing"
          >
            {letter}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-4">
        {!gameOver ? (
          <>
            <button
              onClick={handleCheck}
              className="bg-blue-800 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow-md"
            >
              Check
            </button>
            <button
              onClick={handleRefresh}
              className="bg-blue-500 hover:bg-blue-400 text-white font-semibold py-2 px-5 rounded-lg shadow"
            >
              Refresh
            </button>
          </>
        ) : (
          <button
            onClick={handleReplay}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md"
          >
            🔄 Play Again
          </button>
        )}
      </div>

      <div className="text-lg font-bold mt-2 text-white drop-shadow-sm">{message}</div>
      <div className="text-md font-semibold mt-1">
        Score: {score}/{animals.length}
        {gameOver && (
          <span className="ml-2">
            | Accuracy: {(score / animals.length * 100).toFixed(2)}%
          </span>
        )}
      </div>
      {gameOver && <Confetti width={width} height={height} />}

    </div>
  );
}