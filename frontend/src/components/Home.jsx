import { Link, useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import image2 from '../assets/image2.jpg';
import image1 from '../assets/carousel-3.jpg';
import helperImg from '../assets/image10.png';
import dog from '../assets/dog.png';

export default function Boy() {
  const [user, setUser] = useState(null);


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <>
      <section
        className="relative h-screen w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${image1})` }}
      >
        <nav className="px-6 py-4 z-40 relative">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 flex-wrap">
            <div className="text-3xl font-extrabold text-white tracking-wide">
              Joy<span className="text-[#FFECB3]">Verse</span>
              <div className="text-sm md:text-base text-white mt-1">
                A Magical World for Young Explorers
              </div>
            </div>
            <div className="flex flex-wrap gap-6 justify-center">
              <Link to="/" className=" text-white font-bold px-4 py-2 hover:text-[#001F3F] transition transform hover:scale-105 ">Home</Link>
              {user ? (
              <Link to="/games" className="text-white font-bold px-4 py-2 hover:text-[#001F3F] transition transform hover:scale-105">Games</Link>
            ) : (
              <Link to="/SignIn" className="text-white font-bold px-4 py-2 hover:text-[#001F3F] transition transform hover:scale-105">Games</Link>
            )}
              {user ? (
                <Link to="/profile" className="text-white font-bold px-4 py-2 hover:text-[#001F3F] transition transform hover:scale-105">Profile</Link>
              ) : (
                <Link to="/SignIn" className="text-white font-bold px-4 py-2 hover:text-[#001F3F] transition transform hover:scale-105">Login</Link>
              )}
            </div>
          </div>
        </nav>

        <div className="absolute inset-0 bg-opacity-40 z-10" />

        <motion.img src={helperImg} alt="Helping Ride" className="absolute bottom-[2rem] left-4 w-128 h-auto z-30" animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
        <motion.img src={dog} alt="Dog" className="absolute bottom-[4rem] right-4 w-64 h-auto z-30" animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />

        <motion.div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-green-700 to-green-300 z-10 rounded-t-[30%]" animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />

        <motion.div className="absolute left-[8%] top-[27%] text-black text-xl z-30" animate={{ y: [0, -5, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>🕊️🕊️</motion.div>
        <motion.div className="absolute left-[35%] top-[14%] text-black text-2xl z-30" animate={{ y: [0, -6, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}>🕊️</motion.div>
        <motion.div className="absolute right-[10%] top-[27%] text-black text-xl z-30" animate={{ y: [0, -5, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>🕊️🕊️</motion.div>
        <motion.div className="absolute right-[35%] top-[20%] text-black text-2xl z-30" animate={{ y: [0, -6, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}>🕊️</motion.div>

        <div className="absolute inset-0 flex flex-col justify-center items-center text-center z-30 px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow tracking-wide">
            Welcome to <span className="text-[#FFECB3]">JoyVerse</span>!
          </h1>
          <p className="text-lg md:text-xl text-white font-semibold mb-8 max-w-2xl mx-auto">
            Step into a world of wonder, where learning feels like magic and every child becomes a joyful explorer!
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {user ? (
              <Link to="/games" className="bg-[#1A237E] text-white font-bold px-6 py-3 rounded-full shadow-lg hover:bg-[#FFECB3] hover:text-[#1A237E] hover:scale-110 transition transform">🎮 Play & Learn</Link>
            ) : (
              <Link to="/SignIn" className="bg-[#1A237E] text-white font-bold px-6 py-3 rounded-full shadow-lg hover:bg-[#FFECB3] hover:text-[#1A237E] hover:scale-110 transition transform">🎮 Play & Learn</Link>
            )}
            </div>
        </div>
      </section>
      


      {/* About Section */}
      <main className="min-h-screen bg-gradient-to-b from-[#C1E1C1] via-white to-[#87CEEB] px-6 flex flex-col justify-center font-poppins">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold mb-8 tracking-wide text-[#0077B6] text-center"
        >
          <span className="font-extrabold text-[#0077B6]">About</span> 🎉
        </motion.h1>

        <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">
          <motion.div 
            className="w-full md:w-1/2 rounded-xl overflow-hidden shadow-lg"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <img
              src={image2}
              alt="Children happily playing and learning in an interactive environment"
              className="w-full object-cover h-80 md:h-full"
              loading="lazy"
            />
          </motion.div>

          <motion.div
            className="text-[#004d40] w-full md:w-1/2 text-lg leading-relaxed"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="mb-6">
              At <span className="font-bold text-[#0077B6]">JoyVerse</span>, we believe that every child deserves a joyful and supportive learning journey — especially children with dyslexia.
            </p>
            <p className="mb-6">
              Our innovative platform combines cutting-edge AI technology with educational games designed to adapt to your child's emotions and learning pace.
            </p>
            <p className="mb-6">
              Whether your child feels curious, happy, or challenged, JoyVerse responds with gentle adjustments—making games more colorful, rewarding, or easier—to keep motivation high and learning stress-free.
            </p>
            <p>
              Join us in empowering young explorers to embrace their unique strengths, build resilience, and discover the magic of learning through play.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-12 text-center"
        >
        </motion.div>
      </main>

      {/* Why Kids Love JoyVerse */}
      <section className="min-h-screen bg-[#E0F7FA] px-6 py-16 flex flex-col justify-center">
        <h2 className="text-4xl font-extrabold text-[#0077B6] mb-10 text-center">
          Why Kids Love JoyVerse
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: "Creative Learning",
              text: "Fun, story-driven games spark imagination and boost memory retention. Every level is an adventure where curiosity leads the way!"
            },
            {
              title: "Smart Feedback",
              text: "JoyVerse uses AI to gently sense how your child feels, adjusting game challenges to keep them smiling and learning at their own pace."
            },
            {
              title: "Safe Space",
              text: "A warm and secure environment crafted for emotional safety. Here, kids can express themselves, try again, and grow with confidence."
            },
            {
              title: "Magical Rewards",
              text: "Every milestone unlocks colorful surprises, badges, and cheers! Our positive reinforcement helps build motivation and joy."
            },
            {
              title: "Personalized Journey",
              text: "No two learners are the same! JoyVerse adapts to every child’s rhythm—slower when needed, faster when they’re ready."
            },
            {
              title: "Play + Purpose",
              text: "Games aren’t just fun—they’re thoughtfully designed to develop focus, memory, literacy, and resilience in playful ways."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.6 + i * 0.1 }}
              className="bg-[#C1E1C1] p-6 rounded-2xl shadow-md hover:shadow-xl transition transform hover:scale-105"
            >
              <h3 className="text-2xl font-bold text-[#0077B6] mb-2">{feature.title}</h3>
              <p className="text-[#333333]">{feature.text}</p>
            </motion.div>
          ))}
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-[#87CEEB] text-[#004d40] py-8 px-4 mt-2">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6">
          <div>
            <h3 className="text-2xl font-extrabold mb-2">JoyVerse 🌟</h3>
            <p>Celebrating the colorful minds of young explorers!</p>
          </div>
          <div className="flex gap-6">
             <Link to="/" className="text-white font-bold px-4 py-2 hover:text-[#001F3F] transition transform hover:scale-105">Home</Link>
             <Link to="/games" className="text-white font-bold px-4 py-2 hover:text-[#001F3F] transition transform hover:scale-105">Games</Link>
             <Link to="/signin" className="text-white font-bold px-4 py-2 hover:text-[#001F3F] transition transform hover:scale-105">SuperAdmin</Link>
            
          </div>
          <div>© {new Date().getFullYear()} JoyVerse. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}