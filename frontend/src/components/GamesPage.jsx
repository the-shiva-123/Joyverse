import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { motion } from 'framer-motion';

// Images
import gameImage from '../assets/carousel-3.jpg';
import helperImg from '../assets/image10.png';
import animalWordGameImage from '../assets/Animal.png';
import MagicImage from '../assets/Magic.png';
import WordWizardImage from '../assets/WordWizard.png';
import Image from '../assets/Math.png';

export default function Games() {
  const [user, setUser] = useState(null);
  const [gameCardsData, setGameCardsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          const response = await fetch(`http://localhost:5000/backend/users/username/${parsedUser.username}`);
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            
            const gamesToShow = getGamesForUser(userData);
            setGameCardsData(gamesToShow);
          } else {
            setUser(parsedUser);
            setGameCardsData(getGamesForUser(parsedUser));
          }
        } else {
          setGameCardsData(getDefaultGames());
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setGameCardsData(getGamesForUser(parsedUser));
        } else {
          setGameCardsData(getDefaultGames());
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const allGames = {
    "Magic Word Match": {
      label: "Magic Word Match",
      image: MagicImage,
      description: "Games that adapt to your emotions while learning new words!",
      link: "/games/word",
    },
    "Animal Word Game": {
      label: "Animal Word Game",
      image: animalWordGameImage,
      description: "Drag and drop letters to guess animal names!",
      link: "/games/animal-word",
    },
    "Math Jungle Run": {
      label: "Math Jungle Run",
      image: Image,
      description: "Solve puzzles and dodge obstacles in the math jungle!",
      link: "/games/math",
    },
    "Word Wizard Adventure": {
      label: "Word Wizard Adventure",
      image: WordWizardImage,
      description: "Explore magical words with your emotions in play!",
      link: "/games/adventure",
    },
  };

  const getDefaultGames = () => [
    allGames["Magic Word Match"],
    allGames["Animal Word Game"],
  ].filter(Boolean);

  const getGamesForUser = (user) => {
    // Therapists see all games
    if (user?.role === 'therapist') {
      return Object.values(allGames);
    }
    
    // Users with suggestions see only those games
    if (user?.suggestedGames?.length > 0) {
      return user.suggestedGames
        .map(name => allGames[name])
        .filter(game => game);
    }
    
    // Regular users see default games
    return getDefaultGames();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading games...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <section
        className="relative flex-grow w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${gameImage})` }}
      >
        {/* Navbar */}
        <nav className="px-6 py-4 z-40 relative">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 flex-wrap">
            <div className="text-3xl font-extrabold text-white tracking-wide">
              Joy<span className="text-[#FFECB3]">Verse</span>
              <div className="text-base md:text-lg text-white mt-1">Fun Meets Learning!</div>
            </div>
            <div className="flex flex-wrap gap-6 justify-center">
              <Link to="/" className="text-white font-bold px-5 py-2 hover:scale-105 transition text-base">Home</Link>
              {user ? (
                <Link to="/profile" className="text-white font-bold px-5 py-2 hover:text-[#001F3F] transition transform hover:scale-105 text-base">Profile</Link>
              ) : (
                <Link to="/SignIn" className="text-white font-bold px-5 py-2 hover:text-[#001F3F] transition transform hover:scale-105 text-base">Login</Link>
              )}
            </div>
          </div>
        </nav>

        {/* Game Cards Section */}
        <section className="min-h-[calc(100vh-200px)] px-4 py-20">
          <motion.h2
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-extrabold text-center text-[#001F3F] mb-14"
          >
            {user?.role === 'therapist' 
              ? " All Available Games" 
              : user?.suggestedGames?.length > 0
                ? "Suggested Games"
                : " Games "}
          </motion.h2>

          {/* Helper Character */}
          {user?.role !== 'therapist' && (
            <motion.img
              src={helperImg}
              alt="Helper Character"
              className="absolute bottom-[2rem] left-4 w-128 h-auto z-30"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          <motion.div
            className="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-t from-green-700 to-green-300 z-10 rounded-t-[30%]"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Game Cards Layout */}
          <div className="relative z-50 max-w-6xl mx-auto">
            {gameCardsData.length > 0 ? (
              gameCardsData.length === 2 ? (
                <div className="flex justify-center gap-10 flex-wrap">
                  {gameCardsData.map((game, index) => (
                    <motion.div
                      key={index}
                      whileInView={{ opacity: 1, y: 0 }}
                      initial={{ opacity: 0, y: 40 }}
                      transition={{ duration: 0.5 + index * 0.2 }}
                      className="w-72 rounded-2xl shadow-xl bg-white bg-opacity-90 overflow-hidden cursor-pointer"
                    >
                      <GameCard game={game} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gameCardsData.map((game, index) => (
                    <motion.div
                      key={index}
                      whileInView={{ opacity: 1, y: 0 }}
                      initial={{ opacity: 0, y: 40 }}
                      transition={{ duration: 0.5 + index * 0.2 }}
                      className="rounded-2xl shadow-xl bg-white bg-opacity-90 overflow-hidden cursor-pointer"
                    >
                      <GameCard game={game} />
                    </motion.div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center text-lg text-white bg-white bg-opacity-70 p-6 rounded-xl max-w-md mx-auto">
                {user?.role === 'therapist'
                  ? "No games available yet"
                  : "Your therapist hasn't suggested any games yet"}
              </div>
            )}
          </div>
        </section>
      </section>

      {/* Footer Section */}
      <footer className="bg-[#87CEEB] text-[#004d40] py-8 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6">
          <div>
            <h3 className="text-2xl font-extrabold mb-2">JoyVerse 🌟</h3>
            <p>Celebrating the colorful minds of young explorers!</p>
          </div>
          <div className="flex gap-6">
            <Link to="/" className="text-white font-bold px-4 py-2 hover:text-[#001F3F] transition transform hover:scale-105">Home</Link>
            <Link to="/games" className="text-white font-bold px-4 py-2 hover:text-[#001F3F] transition transform hover:scale-105">Games</Link>
          </div>
          <div>© {new Date().getFullYear()} JoyVerse. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

// GameCard component
const GameCard = ({ game }) => (
  <div className="relative group">
    <div className="absolute top-3 left-3 bg-white bg-opacity-80 px-3 py-1 rounded text-sm font-semibold text-[#1A237E] shadow">
      {game.label}
    </div>
    <img
      src={game.image}
      alt={game.label}
      className="w-full h-44 object-cover transition-opacity duration-500 group-hover:opacity-30"
    />
    <div
      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{ backgroundColor: 'rgba(76, 175, 80, 0.8)' }}
    >
      <Link
        to={game.link}
        className="text-white font-bold px-5 py-2 rounded-full bg-green-600 hover:bg-green-700 text-base transition"
      >
        Play Now
      </Link>
    </div>
    <p className="text-[#333] text-sm p-6 pt-4">{game.description}</p>
  </div>
);