import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import image1 from "../assets/carousel-3.jpg";
import { FiEdit2, FiSave, FiX, FiLogOut, FiUser, FiShield, FiMail, FiPhone, FiCalendar } from "react-icons/fi";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: "",
    profileName: "",
    parentName: "",
    parentContact: "",
    childAge: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserData(parsedUser);
      setEditData({
        username: parsedUser.username,
        profileName: parsedUser.profileName || "",
        parentName: parsedUser.parentName || "",
        parentContact: parsedUser.parentContact || "",
        childAge: parsedUser.childAge || ""
      });
    } else {
      alert("Please login first");
      navigate("/signin");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/signin");
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (editData.username.trim() === "") {
      alert("Username cannot be empty");
      return;
    }
    
    const updatedUser = { ...userData, ...editData };
    setUserData(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setIsEditing(false);
    alert("Profile updated successfully");
  };

  if (!userData) return null;

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-2xl">
          {/* Profile Sidebar */}
          <div className="w-full md:w-1/3 bg-indigo-700 text-white p-8 flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full bg-indigo-500 flex items-center justify-center text-4xl font-bold">
                {userData.username.charAt(0).toUpperCase()}
              </div>
              <button 
                onClick={handleEditToggle}
                className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md text-indigo-700 hover:bg-indigo-100 transition"
              >
                {isEditing ? <FiX size={18} /> : <FiEdit2 size={18} />}
              </button>
            </div>
            
            <h2 className="text-2xl font-bold mb-1">{userData.profileName || userData.username}</h2>
            <div className="flex items-center bg-indigo-600 px-4 py-1 rounded-full mb-6">
              <FiShield className="mr-2" />
              <span className="text-sm font-medium">{userData.role}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full py-2 px-4 rounded-lg bg-white text-indigo-700 font-semibold hover:bg-indigo-50 transition"
            >
              <FiLogOut className="mr-2" />
              Logout
            </button>
          </div>
          
          {/* Profile Content */}
          <div className="w-full md:w-2/3 p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile Information</h1>
            
            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={editData.username}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                
                {userData.profileName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Name</label>
                    <input
                      type="text"
                      name="profileName"
                      value={editData.profileName}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                )}
                
                {userData.parentName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                    <input
                      type="text"
                      name="parentName"
                      value={editData.parentName}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                )}
                
                {userData.parentContact && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Contact</label>
                    <input
                      type="text"
                      name="parentContact"
                      value={editData.parentContact}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                )}
                
                {userData.childAge && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Child Age</label>
                    <input
                      type="text"
                      name="childAge"
                      value={editData.childAge}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                )}
                
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center py-3 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                  >
                    <FiSave className="mr-2" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="flex-1 flex items-center justify-center py-3 px-4 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    <FiX className="mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="p-3 bg-indigo-100 rounded-lg mr-4 text-indigo-700">
                    <FiUser size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Username</h3>
                    <p className="text-lg font-semibold text-gray-800">{userData.username}</p>
                  </div>
                </div>
                
                {userData.profileName && (
                  <div className="flex items-start">
                    <div className="p-3 bg-indigo-100 rounded-lg mr-4 text-indigo-700">
                      <FiUser size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Profile Name</h3>
                      <p className="text-lg font-semibold text-gray-800">{userData.profileName}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <div className="p-3 bg-indigo-100 rounded-lg mr-4 text-indigo-700">
                    <FiShield size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Role</h3>
                    <p className="text-lg font-semibold text-gray-800">{userData.role}</p>
                  </div>
                </div>
                
                {userData.parentName && (
                  <div className="flex items-start">
                    <div className="p-3 bg-indigo-100 rounded-lg mr-4 text-indigo-700">
                      <FiUser size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Parent Name</h3>
                      <p className="text-lg font-semibold text-gray-800">{userData.parentName}</p>
                    </div>
                  </div>
                )}
                
                {userData.parentContact && (
                  <div className="flex items-start">
                    <div className="p-3 bg-indigo-100 rounded-lg mr-4 text-indigo-700">
                      <FiPhone size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Parent Contact</h3>
                      <p className="text-lg font-semibold text-gray-800">{userData.parentContact}</p>
                    </div>
                  </div>
                )}
                
                {userData.childAge && (
                  <div className="flex items-start">
                    <div className="p-3 bg-indigo-100 rounded-lg mr-4 text-indigo-700">
                      <FiCalendar size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Child Age</h3>
                      <p className="text-lg font-semibold text-gray-800">{userData.childAge}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <div className="p-3 bg-indigo-100 rounded-lg mr-4 text-indigo-700">
                    <FiMail size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Password</h3>
                    <p className="text-lg font-semibold text-gray-800">••••••••</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;