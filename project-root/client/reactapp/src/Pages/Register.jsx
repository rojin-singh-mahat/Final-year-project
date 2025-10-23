import React, { useState } from "react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if(password != confirmPassword){
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
       // Log full error for dev visibility
    console.error("Registration error:", data);

    // Display backend message if available, else generic
    setError(data?.msg||"backend didn't send any message here. what did you even try?");
      } else {
        localStorage.setItem("token", data.token);
        window.location.href = "/login";
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#121212] overflow-hidden flex items-center justify-center">
      {/* Grid background */}
      <div className="absolute inset-0">
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
        />
        {/* Vertical shimmer lines */}
        {Array.from({ length: 30 }).map((_, i) => {
          const color = i % 2 === 0 ? "#1DB954" : "#8b5cf6";
          return (
            <div
              key={`v-${i}`}
              className="absolute w-px h-full opacity-40"
              style={{
                left: `${i * 50}px`,
                background: `linear-gradient(to bottom, transparent, ${color}, transparent)`,
                animation: `shimmer 2s linear ${(i % 5) * 0.3}s infinite`,
              }}
            />
          );
        })}
        {/* Horizontal shimmer lines */}
        {Array.from({ length: 30 }).map((_, i) => {
          const color = i % 2 === 0 ? "#1DB954" : "#8b5cf6";
          return (
            <div
              key={`h-${i}`}
              className="absolute h-px w-full opacity-40"
              style={{
                top: `${i * 50}px`,
                background: `linear-gradient(to right, transparent, ${color}, transparent)`,
                animation: `shimmer 2s linear ${(i % 5) * 0.3}s infinite`,
              }}
            />
          );
        })}

        <style>{`
          @keyframes shimmer {
            0% { transform: translateY(-100%); opacity: 0; }
            50% { opacity: 0.4; }
            100% { transform: translateY(100%); opacity: 0; }
          }
        `}</style>
      </div>

      {/* sign up Card */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-[450px] bg-[#1a1a1a] border border-[#282828] rounded-2xl p-12 shadow-2xl border-t-2 border-t-[#1DB954]/30 space-y-5"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">🎮 SkillQuest</h1>
          <p className="text-gray-400 text-sm mt-1">Level up your skills</p>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-white text-2xl font-bold">Get started</h2>
          <p className="text-gray-400 text-sm mt-1">
            Make an account to access the contents
          </p>
        </div>
{/*username field*/}
        <div className="space-y-5">
          <div>
            <label className="block text-gray-500 text-xs font-semibold tracking-wider mb-1">
              USERNAME
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a username"
              className="w-full bg-[#121212] border border-[#282828] rounded-lg px-4 py-3 text-white text-sm focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954]/20 outline-none"
            />
          </div>
{/*email field*/}
          <div>
            <label className="block text-gray-500 text-xs font-semibold tracking-wider mb-1">
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-[#121212] border border-[#282828] rounded-lg px-4 py-3 text-white text-sm focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954]/20 outline-none"
            />
          </div>

          {/* Password field with show/hide */}
        <div className="relative">
          <label className="block text-gray-500 text-xs font-semibold tracking-wider mb-1">
            PASSWORD
          </label>
          <input
            type={showPassword ? "text" : "password"} // <- toggle type
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full bg-[#121212] border border-[#282828] rounded-lg px-4 py-3 pr-10 text-white text-sm focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954]/20 outline-none"
          />
          {/* Eye icon */}
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-11 -translate-y-1/2 text-gray-400 cursor-pointer select-none"
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-5-9-7s4-7 9-7a10.05 10.05 0 011.875.175M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3l18 18M10.477 10.477A3 3 0 0113.523 13.523M9.879 9.879A3 3 0 0114.121 14.121M12 5c5 0 9 5 9 7 0 .667-.167 1.333-.477 2M3 12c0 2 4 7 9 7a10.05 10.05 0 004.477-1.175M3 3l18 18"
                />
              </svg>
            )}
          </span>
        </div>
{/*confirm password field */}
        <div className="relative">
          <label className="block text-gray-500 text-xs font-semibold tracking-wider mb-1">
            CONFIRM PASSWORD
          </label>
          <input
            type={showConfirmPassword ? "text" : "password"} // <- toggle type
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className="w-full bg-[#121212] border border-[#282828] rounded-lg px-4 py-3 pr-10 text-white text-sm focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954]/20 outline-none"
          />
          {/* Eye icon */}
          <span
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-11 -translate-y-1/2 text-gray-400 cursor-pointer select-none"
          >
            {showConfirmPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-5-9-7s4-7 9-7a10.05 10.05 0 011.875.175M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3l18 18M10.477 10.477A3 3 0 0113.523 13.523M9.879 9.879A3 3 0 0114.121 14.121M12 5c5 0 9 5 9 7 0 .667-.167 1.333-.477 2M3 12c0 2 4 7 9 7a10.05 10.05 0 004.477-1.175M3 3l18 18"
                />
              </svg>
            )}
          </span>
        </div>
        </div>

        {error && <p className="text-[#ef4444] text-sm">{error}</p>}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1DB954] text-black font-bold py-4 rounded-full uppercase text-sm tracking-wider mt-8 hover:bg-[#1ed760] hover:scale-105 active:scale-95 transition-all duration-200"
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        <div className="flex items-center my-6">
          <hr className="flex-1 border-[#282828]" />
          <span className="mx-3 text-gray-500 text-xs">OR</span>
          <hr className="flex-1 border-[#282828]" />
        </div>

        <div className="space-y-3">
          <button className="w-full border border-[#282828] text-gray-300 py-3 rounded-full flex items-center justify-center hover:border-[#1DB954] transition">
            Continue with Google
          </button>
          <button className="w-full border border-[#282828] text-gray-300 py-3 rounded-full flex items-center justify-center hover:border-[#8b5cf6] transition">
            Continue with GitHub
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{" "}
          <a href="login" className="text-[#1DB954] hover:text-[#8b5cf6]">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}

