import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Swords,
  Sparkles,
  ArrowRight,
  Shield,
} from "lucide-react";
import OAuthGoogle from "../components/GoogleAuth/OAuthGoogle";

const LOGIN_ART =
  "https://images.unsplash.com/photo-1550100136-e092101726f4?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const FALLBACK_ART =
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1800&q=80";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [artSrc, setArtSrc] = useState(LOGIN_ART);

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

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.msg || data.message || "Login failed";
        setError(msg);
      } else {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");

        if (rememberMe) {
          localStorage.setItem("token", data.token);
        } else {
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

            <p className="font-['Cinzel'] text-xl text-amber-300 mb-1">Welcome Back</p>
            <p className="font-['Merriweather'] text-stone-400 text-sm mb-4">Continue where you left off.</p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-['Cinzel'] tracking-wider text-stone-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
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
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-stone-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-600 bg-stone-900"
                  />
                  Remember me
                </label>
                <button type="button" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  Forgot password?
                </button>
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
                    Entering...
                  </>
                ) : (
                  <>
                    Enter the Realm
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
                Haven't registered yet?{" "}
                <Link to="/register" className="text-cyan-400 hover:text-cyan-300">
                  Begin your quest
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
              alt="Fantasy realm artwork"
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setArtSrc(FALLBACK_ART)}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.2),transparent_45%),radial-gradient(circle_at_75%_70%,rgba(251,191,36,0.2),transparent_35%)]"></div>

            <div className="absolute top-8 right-8 bg-black/45 border border-cyan-400/40 rounded-xl px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-cyan-300">
                <Shield className="w-4 h-4" />
                <span className="font-['Cinzel'] text-xs tracking-wide">Protected Gateway</span>
              </div>
            </div>

            <div className="absolute bottom-10 left-10 right-10">
              <h2 className="font-['Cinzel'] text-4xl leading-tight text-amber-200 mb-3 drop-shadow-2xl">
                Return to the Realm.
              </h2>
              <p className="font-['Merriweather'] text-stone-200/90 max-w-xl">
                Your quests, rewards, and progress await. Pick up where your legend paused.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
