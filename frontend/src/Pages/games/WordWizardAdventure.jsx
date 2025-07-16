import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import EmotionBackground from "../../components/EmotionBackground";

function EmotionListener() {
  useEffect(() => {
    const interval = setInterval(() => {
      const emotions = ["happy", "sad", "angry", "surprised", "neutral"];
      const random = emotions[Math.floor(Math.random() * emotions.length)];
      localStorage.setItem("currentEmotion", random);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return null;
}

function WordWizardAdventure({ currentEmotion }) {
  const [wordList] = useState([
    { word: "apple", hint: "A red or green fruit that keeps the doctor away." },
    { word: "house", hint: "Where you live with your family." },
    { word: "school", hint: "Where you go to learn." },
    { word: "rabbit", hint: "A small animal that hops and has long ears." },
    { word: "flower", hint: "A colorful plant that smells nice." },
    { word: "planet", hint: "Earth is one of these in the solar system." },
    { word: "friend", hint: "Someone you like to play with." },
    { word: "smile", hint: "What you do when you're happy." },
    { word: "water", hint: "You drink this when you're thirsty." },
    { word: "happy", hint: "Feeling good and cheerful." },
  ]);

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [scrambledWord, setScrambledWord] = useState("");
  const [guessInput, setGuessInput] = useState("");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [message, setMessage] = useState("");
  const [hintDisplay, setHintDisplay] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const inputRef = useRef(null);

  const sessionId = useRef(uuidv4());
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate(); // ✅ Back button navigation

  const shuffleWord = (word) => {
    let array = word.split("");
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join("");
  };

  const logGameSession = async (word, isCorrect, isFinal = false) => {
    const emotion = localStorage.getItem("currentEmotion") || "neutral";
    try {
      await axios.post("http://localhost:5000/backend/games/log-game-session", {
        userId: currentUser?._id,
        gameName: "WordWizardAdventure",
        sessionId: sessionId.current,
        questionNumber: currentWordIndex + 1,
        emotion,
        score: isCorrect ? 1 : 0,
        finalScore: isFinal ? score : undefined
      });
    } catch (err) {
      console.error("Game session log failed", err);
    }
  };

  const handleGuess = async () => {
    const correctWord = wordList[currentWordIndex].word;
    const isCorrect = guessInput.toLowerCase() === correctWord.toLowerCase();
    const isFinal = currentWordIndex === wordList.length - 1;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setMessage("✅ Correct! Spell cast successfully!");
      setGuessInput("");
      await logGameSession(correctWord, true, isFinal);
      setTimeout(() => nextWord(), 1000);
    } else {
      setMessage("❌ Incorrect spell. Try again!");
      await logGameSession(correctWord, false, isFinal);
    }
  };

  const nextWord = () => {
    if (currentWordIndex < wordList.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setLevel(prev => prev + 1);
      setHintDisplay("");
      setMessage("");
    } else {
      setIsGameOver(true);
    }
  };

  const handleHint = () => {
    if (score >= 1) {
      setScore(prev => prev - 1);
      setHintDisplay(`Hint: ${wordList[currentWordIndex].hint}`);
      setMessage("🔍 Hint used. Your magical guide offers a clue.");
    } else {
      setMessage("⚠️ Not enough magic points for a hint!");
    }
  };

  const restartGame = () => {
    setCurrentWordIndex(0);
    setScore(0);
    setLevel(1);
    setGuessInput("");
    setMessage("");
    setHintDisplay("");
    setIsGameOver(false);
    sessionId.current = uuidv4();
  };

  useEffect(() => {
    if (wordList.length > 0 && currentWordIndex < wordList.length) {
      setScrambledWord(shuffleWord(wordList[currentWordIndex].word));
      inputRef.current?.focus();
    }
  }, [currentWordIndex]);

  return (
    <div className="flex justify-center items-center min-h-screen p-5 text-gray-100 font-serif overflow-auto relative">
      <EmotionListener />

      {/* ✅ Back Button */}
      <button
        onClick={() => navigate("/games")}
        className="absolute top-6 left-6 text-blue-800 bg-white font-bold px-4 py-2 rounded-full shadow-lg z-50"
      >
        ← Back
      </button>

      <div className={`relative bg-gray-800 bg-opacity-90 rounded-3xl shadow-2xl p-10 text-center max-w-4xl w-full border-2 border-blue-600 flex flex-col items-center overflow-hidden
        ${currentEmotion === "happy" ? "ring-4 ring-yellow-400" : 
          currentEmotion === "sad" ? "ring-4 ring-blue-600" : 
          currentEmotion === "angry" ? "ring-4 ring-red-600" : ""}`}
      >
        <h1 className="font-['Creepster'] text-6xl text-red-500 mb-6 drop-shadow-lg tracking-wider">
          Word Wizard Adventure
        </h1>

        <p className="text-xl mb-8 leading-relaxed">
          Unscramble the magical words to cast your spells and become the ultimate Word Wizard!
        </p>

        <div className="bg-gray-700 bg-opacity-80 rounded-xl p-8 mb-6 w-full shadow-inner-lg">
          <div className="flex justify-between items-center mb-4 text-2xl font-bold text-yellow-300">
            <div>Level: {level}</div>
            <div>Score: {score}</div>
          </div>

          <div className="font-['Press_Start_2P'] text-5xl text-yellow-400 mb-6 tracking-widest break-all drop-shadow-xl">
            {scrambledWord}
          </div>

          <input
            ref={inputRef}
            type="text"
            placeholder="Enter your spell here"
            value={guessInput}
            onChange={(e) => setGuessInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGuess()}
            className="p-4 w-full rounded-lg text-2xl text-center bg-gray-600 text-gray-100 border-2 border-blue-700 focus:border-blue-500 outline-none shadow-md transition-all duration-300 placeholder-gray-400"
          />

          <div className="text-yellow-200 text-xl font-bold min-h-8 mt-4">{message}</div>
          <div className="text-gray-400 text-lg italic min-h-7 mt-2">{hintDisplay}</div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={handleGuess}
            className="btn bg-gradient-to-br from-green-500 to-green-700 hover:from-green-700 hover:to-green-500 focus:ring-green-400"
          >
            Cast Spell!
          </button>
          <button
            onClick={handleHint}
            className="btn bg-gradient-to-br from-orange-500 to-orange-700 hover:from-orange-700 hover:to-orange-500 focus:ring-orange-400"
          >
            Hint (-1 pt)
          </button>
          <button
            onClick={restartGame}
            className="btn bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-700 hover:to-purple-500 focus:ring-purple-400"
          >
            Restart Game
          </button>
        </div>
      </div>

      {isGameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-5 z-50">
          <div className="bg-gray-800 rounded-xl border-4 border-yellow-400 p-10 text-center shadow-3xl max-w-xl w-full animate-fade-in-down relative">
            <h2 className="font-['Creepster'] text-5xl text-red-500 mb-6 drop-shadow-lg">
              Game Over!
            </h2>
            <p className="text-3xl text-yellow-300 mb-8">Your final score: {score} points!</p>
            <button
              onClick={restartGame}
              className="btn bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-700 hover:to-blue-500 focus:ring-blue-400"
            >
              Play Again?
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WordWizardWithEmotion() {
  return (
    <EmotionBackground>
      {({ currentEmotion }) => <WordWizardAdventure currentEmotion={currentEmotion} />}
    </EmotionBackground>
  );
}
