import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Zap, ArrowRight } from "lucide-react";
import OAuthGoogle from "../components/OAuthGoogle";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
      } else {
        //clear the tokens first
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");

        if(rememberMe)
        {
          localStorage.setItem("token", data.token);
        } else{
          sessionStorage.setItem("token", data.token);
        }
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden flex items-center justify-center">
      {/* Floating Orbs Background - Same as Landing Page */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #1DB954 0%, transparent 70%)',
            top: '10%',
            left: '10%',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            bottom: '20%',
            right: '10%',
          }}
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #1DB954 0%, transparent 70%)',
            top: '50%',
            right: '20%',
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, -80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Back to Home Link */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-gray-400 hover:text-[#1DB954] transition-colors"
      >
        <ArrowRight className="w-4 h-4 rotate-180" />
        <span className="text-sm">Back to Home</span>
      </Link>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[480px] mx-4"
      >
        {/* Glassmorphism Card */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center gap-2 mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#1DB954] to-[#8b5cf6] rounded-xl flex items-center justify-center shadow-lg shadow-[#1DB954]/20">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <span className="text-2xl text-white">SkillQuest</span>
            </motion.div>
            <h2 className="text-3xl text-white mb-2">Welcome back</h2>
            <p className="text-gray-400">Sign in to continue your journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
              <div>
              <label htmlFor="email" className="block text-gray-400 text-sm mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
              <div>
              <label htmlFor="password" className="block text-gray-400 text-sm mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-gray-500 focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#1DB954] focus:ring-[#1DB954] focus:ring-offset-0"
                />
                <span className="group-hover:text-white transition-colors">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-[#8b5cf6] hover:text-[#a78bfa] transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black py-4 rounded-xl transition-all shadow-lg shadow-[#1DB954]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-500 text-sm">OR</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* OAuth Button */}
            <OAuthGoogle onClick={() => { console.log("Google OAuth"); }} />

            {/* Sign Up Link */}
            <p className="text-center text-gray-400 text-sm mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#1DB954] hover:text-[#1ed760] transition-colors">
                Sign up
              </Link>
            </p>
          </form>
        </div>

        {/* Bottom Decoration */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs">
            Protected by encryption • Your data is safe
          </p>
        </div>
      </motion.div>
    </div>
  );
}
