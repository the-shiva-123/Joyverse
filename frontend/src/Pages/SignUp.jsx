import { useState } from "react";
import { useNavigate } from "react-router-dom";
import image from "../assets/carousel-3.jpg";
import { FiUser, FiLock, FiMail, FiPhone, FiCalendar, FiArrowRight, FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";

const SignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    parentName: "",
    parentContact: "",
    childAge: "",
    email: "",
    isTherapist: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
  const newErrors = {};
  
  if (!formData.username.trim()) newErrors.username = "Required";
  else if (formData.username.length < 3) newErrors.username = "Min 3 chars";
  
  if (!formData.password) newErrors.password = "Required"; // Only checking if password exists
  
  if (formData.isTherapist) {
    if (!formData.email) newErrors.email = "Required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email";
  } else {
    if (!formData.parentName.trim()) newErrors.parentName = "Required";
    if (!formData.parentContact) newErrors.parentContact = "Required";
    else if (!/^\d{10}$/.test(formData.parentContact)) newErrors.parentContact = "Invalid phone";
    if (!formData.childAge) newErrors.childAge = "Required";
    else if (formData.childAge < 3 || formData.childAge > 12) newErrors.childAge = "3-12 only";
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const selectDashboardType = (isTherapist) => {
    setFormData({
      ...formData,
      isTherapist,
      email: isTherapist ? "" : formData.email,
      parentName: isTherapist ? formData.parentName : "",
      parentContact: isTherapist ? formData.parentContact : "",
      childAge: isTherapist ? formData.childAge : ""
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/backend/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: formData.isTherapist ? "therapist" : "user"
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Account created successfully!");
        navigate("/signin");
      } else {
        alert(data.message || "Sign up failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Signup failed");
      setLoading(false);
    }
  };

  // Dashboard selection screen
  if (formData.isTherapist === null) {
    return (
      <section
        className="min-h-screen w-full bg-cover bg-center flex items-center justify-center p-4"
        style={{ 
          backgroundImage: `url(${image})`,
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-opacity-30"></div>
        
        <div className="relative w-full max-w-2xl p-8 rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)'
          }}
        >
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-blue-200 opacity-40 blur-xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-indigo-200 opacity-40 blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-blue-100 rounded-full">
                <FiUser className="text-blue-600 text-3xl" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
              Create Account
            </h2>
            <p className="text-center text-gray-600 mb-8">
              Select your dashboard type
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <button
                onClick={() => selectDashboardType(false)}
                className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-400 transition-all bg-white hover:bg-blue-50"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-blue-100 rounded-full mb-4">
                    <FiUser className="text-blue-600 text-2xl" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-xl mb-2">User Dashboard</h3>
                  <p className="text-gray-600">Start Playing the Games!!</p>
                </div>
              </button>

              <button
                onClick={() => selectDashboardType(true)}
                className="p-6 rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all bg-white hover:bg-purple-50"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-purple-100 rounded-full mb-4">
                    <FiUser className="text-purple-600 text-2xl" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-xl mb-2">Therapist Dashboard</h3>
                  <p className="text-gray-600">Monitor your Users</p>
                </div>
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => navigate("/signin")}
                className="text-blue-600 hover:text-blue-800 transition duration-300 flex items-center justify-center mx-auto"
              >
                Already have an account? <span className="font-semibold ml-1">Sign In</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Sign-up form
  return (
    <section
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center p-4"
      style={{ 
        backgroundImage: `url(${image})`,
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-opacity-30"></div>
      
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md p-8 rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)'
        }}
      >
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-blue-200 opacity-40 blur-xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-indigo-200 opacity-40 blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <button
              type="button"
              onClick={() => selectDashboardType(null)}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <FiArrowLeft className="mr-1" /> Back
            </button>
            <div className="p-3 bg-blue-100 rounded-full">
              <FiUser className="text-blue-600 text-xl" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            {formData.isTherapist ? "Therapist Sign Up" : "User Sign Up"}
          </h2>
          <p className="text-center text-gray-600 mb-8">
            {formData.isTherapist ? "Create your professional account" : "Register to start playing"}
          </p>

          <div className="mb-6">
            <div className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${focusedField === 'username' ? 'ring-2 ring-blue-400 bg-blue-50' : 'bg-gray-100'}`}>
              <FiUser className="text-gray-500 mr-3" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none"
                required
                placeholder="Username"
              />
            </div>
            {errors.username && <p className="text-xs text-red-600 mt-1">{errors.username}</p>}
          </div>

          {/* Email for therapist */}
          {formData.isTherapist && (
            <div className="mb-6">
              <div className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${focusedField === 'email' ? 'ring-2 ring-blue-400 bg-blue-50' : 'bg-gray-100'}`}>
                <FiMail className="text-gray-500 mr-3" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none"
                  placeholder="Professional email"
                  required
                />
              </div>
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>
          )}

          {/* Parent fields for user */}
          {!formData.isTherapist && (
            <>
              <div className="mb-6">
                <div className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${focusedField === 'parentName' ? 'ring-2 ring-blue-400 bg-blue-50' : 'bg-gray-100'}`}>
                  <FiUser className="text-gray-500 mr-3" />
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('parentName')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none"
                    placeholder="Parent's name"
                    required
                  />
                </div>
                {errors.parentName && <p className="text-xs text-red-600 mt-1">{errors.parentName}</p>}
              </div>

              <div className="mb-6">
                <div className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${focusedField === 'parentContact' ? 'ring-2 ring-blue-400 bg-blue-50' : 'bg-gray-100'}`}>
                  <FiPhone className="text-gray-500 mr-3" />
                  <input
                    type="tel"
                    name="parentContact"
                    value={formData.parentContact}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('parentContact')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none"
                    placeholder="Parent's phone"
                    required
                    maxLength={10}
                  />
                </div>
                {errors.parentContact && <p className="text-xs text-red-600 mt-1">{errors.parentContact}</p>}
              </div>

              <div className="mb-6">
                <div className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${focusedField === 'childAge' ? 'ring-2 ring-blue-400 bg-blue-50' : 'bg-gray-100'}`}>
                  <FiCalendar className="text-gray-500 mr-3" />
                  <input
                    type="number"
                    name="childAge"
                    value={formData.childAge}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('childAge')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none"
                    placeholder="Child's age"
                    required
                    min="1"
                    max="18"
                  />
                </div>
                {errors.childAge && <p className="text-xs text-red-600 mt-1">{errors.childAge}</p>}
              </div>
            </>
          )}

          <div className="mb-8">
            <div className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${focusedField === 'password' ? 'ring-2 ring-blue-400 bg-blue-50' : 'bg-gray-100'}`}>
              <FiLock className="text-gray-500 mr-3" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none"
                required
                placeholder="Password"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-gray-700 ml-2"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
            }`}
          >
            <span>
              {loading ? "Creating Account..." : "Create Account"}
            </span>
            {!loading && <FiArrowRight />}
          </button>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/signin")}
              className="text-gray-600 hover:text-blue-600 transition duration-300 flex items-center justify-center mx-auto"
            >
              Already have an account? <span className="font-semibold ml-1 text-blue-600">Sign In</span>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default SignUp;