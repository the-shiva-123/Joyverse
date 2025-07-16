import { BrowserRouter, Routes, Route } from "react-router-dom";


// Page Components
import SignIn from './Pages/SignIn';
import Games from './components/GamesPage';
import SignUp from "./Pages/SignUp";
import Home from './components/Home';
import Profile from './Pages/Profile';
import MagicWordMatch from './Pages/games/MagicWordMatch';
import AnimalWordGame from './Pages/games/AnimalWordGame';
import Math from './Pages/games/MathJungleRun';
import WordWizar from './Pages/games/WordWizardAdventure';
import TherapistDashboard from './Pages/Therapist/TherapistDashboard';
import ChildProfile from './Pages/Therapist/ChildProfile';
import EmotionBackground from './components/EmotionBackground';
import AdminPage from "./Pages/AdminPage";


const App = () => {
   return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile/>}/>
         <Route path="/admin" element={<AdminPage />} />

       <Route path="/games" element={<Games/>}/>

        {/* Emotion-enabled game pages*/}
        <Route path="/games/word" element={
          <EmotionBackground>
            <MagicWordMatch />
          </EmotionBackground>
        } />

        <Route path="/games/animal-word" element={
          <EmotionBackground>
            <AnimalWordGame />
          </EmotionBackground>
        } />

        <Route path="/games/Math" element={
           <EmotionBackground>
            <Math />
          </EmotionBackground>
        } />

        <Route path="/games/adventure" element={
           <EmotionBackground>
            < WordWizar/>
          </EmotionBackground>
        } />

        

        

        {/* Dashboards */}
        <Route path="/therapist" element={<TherapistDashboard />} />
       <Route path="/child/:username" element={<ChildProfile />} />      
       </Routes>
    </BrowserRouter>
  );
};

export default App;
