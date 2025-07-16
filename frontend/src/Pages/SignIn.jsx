import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import image from "../assets/carousel-3.jpg";
import { FiLogIn, FiUser, FiLock, FiArrowRight } from "react-icons/fi";

const SignIn = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    localStorage.removeItem("user");
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/backend/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        const { user } = data;
        localStorage.setItem("user", JSON.stringify(user));

        // ✅ Redirect based on role
        switch (user.role) {
          case "admin":
            navigate("/admin");
            break;
          case "therapist":
            navigate("/therapist");
            break;
          case "parent":
            navigate("/parentdashboard");
            break;
          default:
            navigate("/");
        }
      } else {
        alert(data.message || "Invalid username or password");
      }
    } catch (error) {
      console.error("Login error:", error.message);
      alert("Login failed: " + error.message);
      setLoading(false);
    }
  };

  return (
    <section
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center p-4"
      style={{ 
        backgroundImage: `url(${image})`,
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0  bg-opacity-30"></div>
      
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
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-blue-100 rounded-full">
              <FiLogIn className="text-blue-600 text-3xl" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Welcome Back
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Sign in to access your account
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
          </div>

          <div className="mb-8">
            <div className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${focusedField === 'password' ? 'ring-2 ring-blue-400 bg-blue-50' : 'bg-gray-100'}`}>
              <FiLock className="text-gray-500 mr-3" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none"
                required
                placeholder="Password"
              />
            </div>
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
              {loading ? "Signing In..." : "Sign In"}
            </span>
            {!loading && <FiArrowRight />}
          </button>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-gray-600 hover:text-blue-600 transition duration-300 flex items-center justify-center mx-auto"
            >
              Don't have an account? <span className="font-semibold ml-1 text-blue-600">Sign Up</span>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default SignIn;