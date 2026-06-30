import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import { Bar as ChartBar } from "react-chartjs-2";
import { motion } from "framer-motion";

// Register Chart.js components required for the Bar chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  ChartLegend
);

// Define an array of colors for the PieChart segments
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

/**
 * Displays a child's profile, including their emotional data, game performance,
 */
export default function ChildProfile() {
  // useParams hook to extract the 'username' from the URL
  const { username } = useParams();

  // State to store the fetched profile data (user details, emotions, game plays, sessions)
  const [profileData, setProfileData] = useState({
    user: null, // Stores user-specific data
    emotions: [], // Stores emotion records
    gamePlays: [], // Stores game play records (deprecated, now combined with sessions)
    sessions: [] // Stores detailed game session data
  });

  // State to manage loading status
  const [loading, setLoading] = useState(true);
  // State to store any error messages during data fetching
  const [error, setError] = useState("");
  // State to store messages related to game suggestions (success/failure)
  const [suggestMessage, setSuggestMessage] = useState("");
  // State to track which game is currently being suggested (for UI feedback)
  const [suggestingGame, setSuggestingGame] = useState(null);

  // Hardcoded list of games available for suggestion
  const gamesList = [
    "Word Wizard Adventure",
    "Math Jungle Run",
    "Magic Word Match",
    "Animal Word Game",
  ];

  // useEffect hook to fetch data when the component mounts or username changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Set loading to true before fetching

        // Fetch user data from the backend
        const userRes = await fetch(
          `http://localhost:5000/backend/users/username/${username}`
        );
        // Throw an error if the user data fetch was not successful
        if (!userRes.ok) throw new Error("Failed to fetch user data");
        const userData = await userRes.json(); // Parse user data

        // Fetch game sessions data from the backend
        const sessionsRes = await fetch(
          `http://localhost:5000/backend/users/games/by-username/${username}`
        );
        // Parse sessions data; if fetch fails, default to an empty array
        const sessionsData = await sessionsRes.ok ? await sessionsRes.json() : [];

        // Combine emotion data from user profile and game sessions
        const combinedEmotions = [
          ...(userData.emotions || []), // Emotions directly from user data
          ...sessionsData.flatMap(session => // Emotions from questions within game sessions
            (session.questions || []).map(question => ({
              ...question,
              gameName: session.gameName, // Add gameName for context
              timestamp: session.timestamp // Add timestamp for sorting/display
            }))
          )
        ];

        // Combine game play data from user profile and game sessions
        const combinedGamePlays = [
          ...(userData.gamePlays || []), // Game plays directly from user data
          ...sessionsData.map(session => ({ // Game plays derived from sessions
            gameName: session.gameName,
            finalScore: session.finalScore,
            timestamp: session.timestamp
          }))
        ];

        // Update the profileData state with all fetched and combined data
        setProfileData({
          user: userData,
          emotions: combinedEmotions,
          gamePlays: combinedGamePlays, // Note: gamePlays might be redundant if sessions are comprehensive
          sessions: sessionsData
        });

      } catch (err) {
        console.error("Fetch error:", err); // Log the error to console
        setError(err.message); // Set the error message for display
      } finally {
        setLoading(false); // Set loading to false after fetch operation completes (success or failure)
      }
    };

    fetchData(); // Call the fetchData function
  }, [username]); // Dependency array: re-run effect if username changes

  /**
   * Handles the suggestion of a game to the child.
   * Sends a POST request to the backend to record the suggestion.
   * @param {string} gameName - The name of the game to suggest.
   */
  const handleSuggestGame = async (gameName) => {
    setSuggestingGame(gameName); // Set the game being suggested to update UI
    try {
      const res = await fetch(
        `http://localhost:5000/backend/users/suggest-game/${username}`,
        {
          method: "POST", // HTTP POST method
          headers: { "Content-Type": "application/json" }, // Specify content type as JSON
          body: JSON.stringify({ gameName }), // Send gameName in the request body
        }
      );
      const data = await res.json(); // Parse the response JSON
      if (res.ok) {
        setSuggestMessage(`"${gameName}" suggested successfully!`); // Success message
        // Optimistically update the UI with the newly suggested game
        setProfileData(prev => ({
          ...prev,
          user: {
            ...prev.user,
            suggestedGames: [...(prev.user.suggestedGames || []), gameName]
          }
        }));
      } else {
        throw new Error(data.message || "Suggestion failed"); // Throw error if response not ok
      }
    } catch (err) {
      setSuggestMessage(err.message); // Set error message for display
    } finally {
      setSuggestingGame(null); // Reset suggestingGame state
    }
  };

  // Conditional rendering for loading, error, and user not found states
  if (loading) return <div className="text-center p-8">Loading profile...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;
  if (!profileData.user) return <div className="text-center p-8">User not found</div>;

  // --- Data Processing for Charts ---

  // Calculate emotion counts for the Pie Chart
  const emotionCounts = profileData.emotions.reduce((acc, { emotion }) => {
    acc[emotion] = (acc[emotion] || 0) + 1; // Increment count for each emotion
    return acc;
  }, {});

  // Convert emotion counts into an array format suitable for Recharts PieChart
  const emotionData = Object.entries(emotionCounts).map(([name, value]) => ({
    name,
    value
  }));

  // Process game performance data from sessions
  const gamePerformance = profileData.sessions.reduce((acc, session) => {
    if (!acc[session.gameName]) {
      // Initialize if game not seen before
      acc[session.gameName] = {
        totalScore: 0,
        count: 0,
        sessions: []
      };
    }
    acc[session.gameName].totalScore += session.finalScore || 0; // Sum up scores
    acc[session.gameName].count += 1; // Count sessions per game
    acc[session.gameName].sessions.push(session); // Store session details
    return acc;
  }, {});

  // Convert game performance data into an array for charting (average score and session count)
  const gamePerformanceData = Object.entries(gamePerformance).map(([name, data]) => ({
    name,
    avgScore: Math.round(data.totalScore / data.count), // Calculate average score
    sessions: data.sessions.length // Total sessions for the game
  }));

  // Prepare data for Chart.js Bar chart
  const gamePlayChartData = {
    labels: gamePerformanceData.map(game => game.name), // Game names as labels
    datasets: [
      {
        label: 'Average Score', // Dataset for average scores
        data: gamePerformanceData.map(game => game.avgScore),
        backgroundColor: 'rgba(54, 162, 235, 0.6)', // Blue color
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Sessions Played', // Dataset for sessions played
        data: gamePerformanceData.map(game => game.sessions),
        backgroundColor: 'rgba(255, 99, 132, 0.6)', // Red color
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };

  // --- JSX Rendering ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-inter"> {/* Main container with responsive padding and Inter font */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} // Initial animation state for the main content
        animate={{ opacity: 1, y: 0 }} // Animation target state
        transition={{ duration: 0.5 }} // Animation duration
        className="max-w-6xl mx-auto" // Center content and limit max width
      >
        {/* Profile Header Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Child's initial avatar */}
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
              {profileData.user.username.charAt(0).toUpperCase()} {/* Display first letter of username */}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800">
                {profileData.user.username} {/* Display username */}
              </h1>
              {/* Profile details: Age, Parent Name, Emotion/Game Play counts */}
              <div className="flex flex-wrap gap-4 mt-2 text-sm">
                {profileData.user.childAge && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    Age: {profileData.user.childAge}
                  </span>
                )}
                {profileData.user.parentName && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    Parent: {profileData.user.parentName}
                  </span>
                )}
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                  {profileData.emotions.length} emotions recorded
                </span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                  {profileData.gamePlays.length} game plays
                </span>
              </div>
            </div>
          </div>
        </div> 

        {/* Stats Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Sessions Card */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Sessions</h3>
            <p className="text-2xl font-bold">{profileData.sessions.length}</p>
          </div>
          {/* Unique Games Card */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="text-sm font-medium text-gray-500">Unique Games</h3>
            <p className="text-2xl font-bold">
              {new Set(profileData.sessions.map(s => s.gameName)).size} {/* Count unique game names */}
            </p>
          </div>
          {/* Average Score Card */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="text-sm font-medium text-gray-500">Avg. Score</h3>
            <p className="text-2xl font-bold">
              {profileData.sessions.length > 0
                ? Math.round(
                    profileData.sessions.reduce((sum, s) => sum + (s.finalScore || 0), 0) /
                    profileData.sessions.length
                  ).toFixed(1) // Calculate and format average score
                : 0}
            </p>
          </div>
        </div>

     {/* Main Content Grid: Emotion Analysis, Game Suggestions, Game Performance, Recent Sessions */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Emotion Analysis Section - Now single column but still spans 2 columns */}
  <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
    <h2 className="text-xl font-bold mb-4">Emotion Analysis</h2>
    <div className="flex justify-center"> {/* Added flex container for centering */}
      <div className="h-64 w-full max-w-md"> {/* Constrained width and centered */}
        <h3 className="text-md font-semibold mb-2 text-center">Emotion Distribution</h3> {/* Centered title */}
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie
              data={emotionData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {emotionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" /> {/* Centered legend */}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>

          {/* Game Suggestions Section */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Game Suggestions</h2>
            <div className="space-y-3">
              {gamesList.map((game) => {
                const isSuggested = profileData.user.suggestedGames?.includes(game); // Check if game is already suggested
                return (
                  <div
                    key={game}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium">{game}</span>
                    <button
                      onClick={() => handleSuggestGame(game)} // Call suggest handler on click
                      disabled={isSuggested || suggestingGame === game} // Disable if already suggested or currently suggesting
                      className={`px-3 py-1 rounded text-sm ${
                        isSuggested
                          ? "bg-green-100 text-green-800 cursor-not-allowed" // Style for already suggested
                          : suggestingGame === game
                          ? "bg-gray-200 text-gray-600 cursor-wait" // Style for actively suggesting
                          : "bg-blue-600 text-white hover:bg-blue-700" // Default style
                      }`}
                    >
                      {isSuggested
                        ? "Suggested"
                        : suggestingGame === game
                        ? "Sending..."
                        : "Suggest"}
                    </button>
                  </div>
                );
              })}
            </div>
            {/* Suggestion message feedback */}
            {suggestMessage && (
              <p
                className={`mt-3 text-sm ${
                  suggestMessage.includes("failed") ? "text-red-600" : "text-green-600" // Dynamic color based on success/failure
                }`}
              >
                {suggestMessage}
              </p>
            )}
          </div>

          {/* Game Performance Section (Chart.js Bar Chart) */}
          <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Game Performance</h2>
            <div className="h-80"> {/* Fixed height for the chart */}
              <ChartBar
                data={gamePlayChartData} // Data for the bar chart
                options={{
                  responsive: true, // Make chart responsive
                  plugins: {
                    legend: {
                      position: "top", // Legend at the top
                    },
                    title: {
                      display: true,
                      text: "Game Performance Overview", // Chart title
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true, // Y-axis starts from zero
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
