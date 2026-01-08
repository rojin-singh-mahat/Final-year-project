/*eslint-disable unused-imports*/

import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { User,Eye, EyeOff, Mail, Lock, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import OAuthGoogle from '../components/GoogleAuth/OAuthGoogle';

export default function Register() {
  const navigate = useNavigate();
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
      const API = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Log full error for dev visibility
        console.error("Registration error:", data);

        // Display backend message if available, else generic
        setError(data?.msg || "Registration failed");
      } else {
        // Redirect to check-email page with email param
        navigate(`/check-email?email=${encodeURIComponent(email)}`);
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

      <div className="relative z-10 w-full max-w-[480px] mx-4">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1DB954] to-[#8b5cf6] rounded-xl flex items-center justify-center shadow-lg shadow-[#1DB954]/20">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <span className="text-2xl text-white">SkillQuest</span>
            </div>
            <h2 className="text-3xl text-white mb-2">Create your account</h2>
            <p className="text-gray-400">Sign up to start your learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Pick a username" required className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]/20 outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input id="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]/20 outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input id="register-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" required className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-gray-500 focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]/20 outline-none transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" required className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-gray-500 focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]/20 outline-none transition-all" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">{error}</div>}

            <button type="submit" disabled={loading} className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black py-4 rounded-xl transition-all shadow-lg shadow-[#1DB954]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (<><div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /></>) : (<><span>Sign Up</span><ArrowRight className="w-5 h-5" /></>)}
              </button>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-500 text-sm">OR</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <OAuthGoogle />

            <p className="text-center text-gray-400 text-sm mt-6">Already have an account? <Link to="/login" className="text-[#1DB954] hover:text-[#1ed760]">Log in</Link></p>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs">Protected by encryption • Your data is safe</p>
        </div>
      </div>
    </div>
  );
}

