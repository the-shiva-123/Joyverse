import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const AdminPage = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("pending");
  const [deleteConfirm, setDeleteConfirm] = useState(null); // Track which therapist is being confirmed for deletion

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        setLoading(true);
        setMessage({ text: "", type: "" });
        
        const endpoint = selectedTab === "pending" 
          ? "/backend/users/therapist/requests/pending"
          : "/backend/users/therapist/approved";
        
        const res = await fetch(`http://localhost:5000${endpoint}`);
        const data = await res.json();

        if (res.ok) {
          setTherapists(data);
        } else {
          setMessage({ text: data.message || "Failed to load therapists", type: "error" });
        }
      } catch (err) {
        console.error("Error:", err);
        setMessage({ text: "Network error loading requests", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, [selectedTab]);

  const approveTherapist = async (username) => {
    try {
      setMessage({ text: "Processing approval...", type: "info" });
      
      const res = await fetch(
        `http://localhost:5000/backend/users/therapist/approve/${username}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: `✅ ${username} approved successfully`, type: "success" });
        setTherapists(prev => prev.filter(t => t.username !== username));
        
        setTimeout(() => {
          setMessage(prev => prev.type === "success" ? { text: "", type: "" } : prev);
        }, 3000);
      } else {
        setMessage({ text: data.message || "Approval failed", type: "error" });
      }
    } catch (err) {
      console.error("Approval error:", err);
      setMessage({ text: "Server error during approval", type: "error" });
    }
  };

  const deleteTherapist = async (userId) => {
    try {
      setMessage({ text: "Deleting therapist...", type: "info" });
      
      const res = await fetch(
        `http://localhost:5000/backend/users/delete/${userId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: `✅ Therapist deleted successfully`, type: "success" });
        setTherapists(prev => prev.filter(t => t._id !== userId));
        setDeleteConfirm(null);
        
        setTimeout(() => {
          setMessage(prev => prev.type === "success" ? { text: "", type: "" } : prev);
        }, 3000);
      } else {
        setMessage({ text: data.message || "Deletion failed", type: "error" });
      }
    } catch (err) {
      console.error("Deletion error:", err);
      setMessage({ text: "Server error during deletion", type: "error" });
    }
  };

  const filteredTherapists = therapists.filter(therapist =>
    therapist.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (therapist.email && therapist.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-center text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Admin Dashboard
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Manage therapist accounts and approvals
        </p>

        {message.text && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-3 mb-6 rounded-lg text-center ${
              message.type === "success"
                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
                : message.type === "error"
                ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200"
                : "bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 border border-blue-200"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-200">
          <div className="flex border-b bg-gradient-to-r from-indigo-50 to-purple-50">
            <button
              className={`px-6 py-3 font-medium transition-all ${
                selectedTab === "pending"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-white shadow-sm"
                  : "text-gray-500 hover:text-indigo-500"
              }`}
              onClick={() => setSelectedTab("pending")}
            >
              Pending Approval
            </button>
            <button
              className={`px-6 py-3 font-medium transition-all ${
                selectedTab === "approved"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-white shadow-sm"
                  : "text-gray-500 hover:text-indigo-500"
              }`}
              onClick={() => setSelectedTab("approved")}
            >
              Approved Therapists
            </button>
          </div>

          <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-blue-50">
            <input
              type="text"
              placeholder="Search therapists..."
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : filteredTherapists.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                {selectedTab === "pending"
                  ? "No pending therapist requests"
                  : "No approved therapists found"}
              </div>
            ) : (
              <ul className="space-y-4">
                {filteredTherapists.map((therapist) => (
                  <motion.li
                    key={therapist._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col md:flex-row justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:from-blue-50 hover:to-purple-50 transition-all border border-gray-200 shadow-sm"
                  >
                    <div className="flex-1 mb-4 md:mb-0">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {therapist.username}
                      </h3>
                      <div className="text-sm text-gray-600 mt-1">
                        <p>Email: {therapist.email || "Not provided"}</p>
                        <p>Registered: {new Date(therapist.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {selectedTab === "pending" ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => approveTherapist(therapist.username)}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setMessage({ text: "Reject feature coming soon", type: "info" });
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 rounded-lg hover:from-gray-300 hover:to-gray-400 transition-all shadow-sm"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-800 rounded-full text-sm border border-emerald-200">
                          Approved
                        </span>
                        {deleteConfirm === therapist._id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => deleteTherapist(therapist._id)}
                              className="px-3 py-1 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg text-sm shadow-md"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-1 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 rounded-lg text-sm shadow-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(therapist._id)}
                            className="px-3 py-1 bg-gradient-to-r from-red-100 to-rose-100 text-rose-800 rounded-lg text-sm hover:from-red-200 hover:to-rose-200 transition-all border border-red-200 shadow-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg shadow border border-indigo-100">
            <h3 className="text-indigo-500 font-medium">Total Pending</h3>
            <p className="text-2xl font-bold text-indigo-700">
              {selectedTab === "pending" ? therapists.length : "—"}
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-lg shadow border border-emerald-100">
            <h3 className="text-emerald-500 font-medium">Total Approved</h3>
            <p className="text-2xl font-bold text-emerald-700">
              {selectedTab === "approved" ? therapists.length : "—"}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4 rounded-lg shadow border border-purple-100">
            <h3 className="text-purple-500 font-medium">Showing</h3>
            <p className="text-2xl font-bold text-purple-700">
              {filteredTherapists.length} of {therapists.length}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPage;