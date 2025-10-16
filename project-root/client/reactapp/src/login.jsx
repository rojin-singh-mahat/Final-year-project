// src/pages/Login.jsx
import React, {useState} from "react";

export default function Login() {
    const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", { // adjust URL
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
      } else {
        // Success! Store token, redirect, etc.
        localStorage.setItem("token", data.token);
        console.log("Logged in:", data);
        // e.g., redirect to dashboard
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#121212] relative overflow-hidden flex items-center justify-center px-4 -m-4">
      {/* Grid lines background */}
      <div className="absolute inset-0">
        {/* Static grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
        linear-gradient(#282828 1px, transparent 1px),
        linear-gradient(90deg, #282828 1px, transparent 1px)
        `,
            backgroundSize: "50px 50px",
            opacity: 0.3,
          }}
        ></div>

        {/* Glowing lines aligned to grid with alternating colors and staggered animation */}
        {Array.from({ length: 30 }).map((_, i) => {
          const color = i % 2 === 0 ? "#1DB954" : "#8b5cf6"; // alternate green/purple
          const delay = Math.random() * 2; // random start delay for each line
          return (
            <div
              key={`v-${i}`}
              className="absolute w-px h-full opacity-40"
              style={{
                left: `${i * 50}px`,
                background: `linear-gradient(to bottom, transparent, ${color}, transparent)`,
                animation: `shimmer 3s linear ${delay}s infinite`,
              }}
            />
          );
        })}

        {Array.from({ length: 30 }).map((_, i) => {
          const color = i % 2 === 0 ? "#1DB954" : "#8b5cf6"; // alternate green/purple
          const delay = Math.random() * 2;
          return (
            <div
              key={`h-${i}`}
              className="absolute h-px w-full opacity-40"
              style={{
                top: `${i * 50}px`,
                background: `linear-gradient(to right, transparent, ${color}, transparent)`,
                animation: `shimmer 3s linear ${delay}s infinite`,
              }}
            />
          );
        })}

        <style>
          {`
            @keyframes shimmer {
                0% { transform: translateY(-100%); opacity: 0; }
                50% { opacity: 0.4; }
                100% { transform: translateY(100%); opacity: 0; }
            }
             `}
        </style>
      </div>

      {/* Login Card */}
      <form onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-[450px] bg-[#1a1a1a] border border-[#282828] rounded-2xl p-12 shadow-2xl border-t-2 border-t-[#1DB954]/30">
{/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">🎮 SkillQuest</h1>
          <p className="text-gray-400 text-sm mt-1">Level Up Your Skills</p>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h2 className="text-white text-2xl font-bold">Welcome back</h2>
          <p className="text-gray-400 text-sm mt-1">
            Sign in to continue your journey
          </p>
        </div>

        {/* Input Fields */}
        <div className="space-y-5">
          <div>
            <label className="block text-gray-500 text-xs font-semibold tracking-wider mb-1">
              EMAIL
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-[#121212] border border-[#282828] rounded-lg px-4 py-3 text-white text-sm focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954]/20 outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-500 text-xs font-semibold tracking-wider mb-1">
              PASSWORD
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full bg-[#121212] border border-[#282828] rounded-lg px-4 py-3 text-white text-sm focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954]/20 outline-none"
            />
          </div>
        </div>

        {/* Remember + Forgot */}
        <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="accent-[#1DB954]" />
            <span>Remember me</span>
          </label>
          <a href="#" className="text-[#8b5cf6] hover:underline">
            Forgot password?
          </a>
        </div>

        {/* Login Button */}
        <button className="w-full bg-[#1DB954] text-black font-bold py-4 rounded-full uppercase text-sm tracking-wider mt-8 hover:bg-[#1ed760] hover:scale-105 active:scale-95 transition-all duration-200">
          Sign In
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-1 border-[#282828]" />
          <span className="mx-3 text-gray-500 text-xs">OR</span>
          <hr className="flex-1 border-[#282828]" />
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          <button className="w-full border border-[#282828] text-gray-300 py-3 rounded-full flex items-center justify-center hover:border-[#1DB954] transition">
            Continue with Google
          </button>
          <button className="w-full border border-[#282828] text-gray-300 py-3 rounded-full flex items-center justify-center hover:border-[#8b5cf6] transition">
            Continue with GitHub
          </button>
        </div>

        {/* Register Link */}
        <p className="text-center text-gray-400 text-sm mt-6">
          Don't have an account?{" "}
          <a href="#" className="text-[#1DB954] hover:text-[#8b5cf6]">
            Sign up
          </a>
        </p>
      </form>

        

    </div>
  );
}
