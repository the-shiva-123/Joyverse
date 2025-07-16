import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TreatImg from '../../assets/treatment.jpg';

export default function TherapistDashboard() {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsersWithUserRole = async () => {
      try {
        const res = await fetch("http://localhost:5000/backend/users/role/user/all");
        if (!res.ok) throw new Error("Failed to fetch users.");
        const data = await res.json();
        setChildren(data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Unable to fetch children data.");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.role === "therapist" || currentUser?.role === "admin") {
      fetchUsersWithUserRole();
    } else {
      setError("Access denied. Only therapists or admins can view this page.");
      setLoading(false);
    }
  }, []);

  const handleChildClick = (username) => {
    navigate(`/child/${username}`);
  };

  return (
    <div className="font-sans bg-[#dff6e0] min-h-screen">
      {/* Header */}
      <header className="relative text-center overflow-hidden h-[350px] flex items-center justify-center">
        <motion.img
          src={TreatImg}
          alt="Therapist"
          initial={{ y: -200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute w-full h-full object-cover border-b-4 border-[#b2dfdb] brightness-75"
        />
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.8, ease: 'easeOut' }}
          className="relative text-white text-center p-6 rounded-xl"
        >
          <h1 className="text-3xl font-bold">
            Welcome {currentUser?.username || "Therapist"} to the Dashboard
          </h1>
          <p className="mt-2">Track children's growth, emotion, and game progress here</p>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-6">👩‍⚕️ Registered Children (Users)</h2>

        {loading ? (
          <p className="text-blue-600 text-lg">Loading children...</p>
        ) : error ? (
          <p className="text-red-600 text-lg">{error}</p>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-lg max-w-6xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse text-sm md:text-base">
              <thead>
                <tr className="bg-[#b3e5fc] text-[#01579b]">
                  <th className="p-3">Username</th>
                  <th className="p-3">Age</th>
                  <th className="p-3">Parent Name</th>
                  <th className="p-3">Contact</th>
                </tr>
              </thead>
              <tbody>
                {children.length > 0 ? (
                  children.map((child, index) => {
                    const recentEmotion = child.emotions?.[child.emotions.length - 1]?.emotion || "—";
                    return (
                      <tr key={index} className="border-b hover:bg-[#f0fdfa] transition">
                        <td
                          className="p-3 font-bold text-blue-700 cursor-pointer hover:underline"
                          onClick={() => handleChildClick(child.username)}
                        >
                          {child.username}
                        </td>
                        <td className="p-3">{child.childAge || '—'}</td>
                        <td className="p-3">{child.parentName || '—'}</td>
                        <td className="p-3">{child.parentContact || '—'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-gray-500">
                      No registered children found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm bg-[#f1f8e9] mt-10 text-[#666]">
        © 2025 JoyVerse | Helping Families Grow Together
      </footer>
    </div>
  );
}
