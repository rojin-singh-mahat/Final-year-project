import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Swords,
  Sparkles,
  ArrowRight,
  Scroll,
} from "lucide-react";
import OAuthGoogle from "../components/GoogleAuth/OAuthGoogle";

const REGISTER_ART =
  "https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const FALLBACK_ART =
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1800&q=80";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const FORBIDDEN_EMAIL_TYPO_SUFFIXES = [".con", ".conm", ".cmo", ".cm", ".coom", ".comm"];
const STRONG_PASSWORD_REGEX = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const ALLOWED_EMAIL_DOMAIN = "@gmail.com";

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
  const [artSrc, setArtSrc] = useState(REGISTER_ART);

  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 3}s`,
        duration: `${3 + Math.random() * 2}s`,
      })),
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const normalizedEmail = String(email || "").trim().toLowerCase();
    const isEmailValid = EMAIL_REGEX.test(normalizedEmail)
      && !normalizedEmail.includes("..")
      && normalizedEmail.endsWith(ALLOWED_EMAIL_DOMAIN)
      && !FORBIDDEN_EMAIL_TYPO_SUFFIXES.some((suffix) => normalizedEmail.endsWith(suffix));

    if (!isEmailValid) {
      setError("Please enter a valid @gmail.com email address.");
      setLoading(false);
      return;
    }

    if (!STRONG_PASSWORD_REGEX.test(password || "")) {
      setError("Password must be at least 8 characters and include at least 1 number and 1 symbol.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const API = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: normalizedEmail, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.msg || "Registration failed");
      } else {
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
    <div className="h-screen bg-[#141210] text-amber-50 relative overflow-hidden p-0">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.15] mix-blend-overlay z-0"
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/black-scales.png')",
        }}
      ></div>
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-black/80 via-transparent to-black/90 z-0"></div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-500/30 rounded-full animate-pulse"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 h-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full max-w-6xl grid grid-cols-1 lg:grid-cols-[minmax(360px,420px),1fr] bg-stone-900/65 border-2 border-stone-700 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.75)]"
        >
          <div className="p-5 md:p-6 lg:p-7 backdrop-blur-sm border-r border-stone-700/70 overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <Swords className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_18px_rgba(34,211,238,0.8)]" />
                <div className="absolute inset-0 bg-cyan-400 blur-2xl opacity-40"></div>
              </div>
              <h1 className="font-['Cinzel'] text-3xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700">
                SkillQuest
              </h1>
            </div>

            <p className="font-['Cinzel'] text-xl text-amber-300 mb-1">Forge Your Character</p>
            <p className="font-['Merriweather'] text-stone-400 text-sm mb-4">Create your account and begin the quest.</p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-['Cinzel'] tracking-wider text-stone-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Choose a username"
                    required
                    className="w-full bg-stone-950/70 border-2 border-stone-700 rounded-lg pl-10 pr-4 py-3 text-amber-50 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-['Cinzel'] tracking-wider text-stone-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-stone-950/70 border-2 border-stone-700 rounded-lg pl-10 pr-4 py-3 text-amber-50 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-['Cinzel'] tracking-wider text-stone-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create your password"
                    required
                    className="w-full bg-stone-950/70 border-2 border-stone-700 rounded-lg pl-10 pr-10 py-3 text-amber-50 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-amber-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-stone-500">Use 8+ chars with at least 1 number and 1 symbol.</p>
              </div>

              <div>
                <label className="block text-xs font-['Cinzel'] tracking-wider text-stone-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    className="w-full bg-stone-950/70 border-2 border-stone-700 rounded-lg pl-10 pr-10 py-3 text-amber-50 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-amber-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-500/40 text-red-300 text-sm rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 border-2 border-amber-900 rounded-lg font-['Cinzel'] font-bold text-amber-50 shadow-[0_0_24px_rgba(245,158,11,0.4)] disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-amber-100/40 border-t-amber-100 rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    Continue
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-stone-700"></div>
                <span className="font-['Cinzel'] text-xs text-stone-400">OR</span>
                <div className="h-px flex-1 bg-stone-700"></div>
              </div>

              <OAuthGoogle />

              <div className="pt-1 text-sm text-stone-300">
                Already an adventurer?{" "}
                <Link to="/login" className="text-cyan-400 hover:text-cyan-300">
                  Enter the realm
                </Link>
              </div>
            </form>

            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-2 text-stone-500 hover:text-stone-300 text-sm"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Return to Landing Page
            </Link>
          </div>

          <div className="relative hidden lg:block h-full">
            <img
              src={artSrc}
              alt="Fantasy path artwork"
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setArtSrc(FALLBACK_ART)}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_28%,rgba(34,211,238,0.2),transparent_45%),radial-gradient(circle_at_78%_70%,rgba(251,191,36,0.24),transparent_35%)]"></div>

            <div className="absolute top-8 right-8 bg-black/45 border border-amber-400/40 rounded-xl px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-amber-300">
                <Scroll className="w-4 h-4" />
                <span className="font-['Cinzel'] text-xs tracking-wide">Quest Initiation</span>
              </div>
            </div>

            <div className="absolute bottom-10 left-10 right-10">
              <h2 className="font-['Cinzel'] text-4xl leading-tight text-amber-200 mb-3 drop-shadow-2xl">
                Start Your Legend.
              </h2>
              <p className="font-['Merriweather'] text-stone-200/90 max-w-xl">
                Create your profile, claim your first quest, and step into a world where every lesson earns glory.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
