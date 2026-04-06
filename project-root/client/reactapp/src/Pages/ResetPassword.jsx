import { useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, Sparkles } from "lucide-react";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => params.get("token") || "", [params]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!token) {
      setError("Reset token missing or invalid.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.msg || "Unable to reset password.");
      } else {
        setStatus("Password reset successful. Redirecting to login...");
        setTimeout(() => navigate("/login"), 1200);
      }
    } catch (err) {
      setError("Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#111315] text-stone-100 flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none opacity-[0.18]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(120,130,150,0.35) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#1b222a]/95 border border-stone-700 rounded-2xl p-8 relative z-10"
      >
        <Link to="/login" className="inline-flex items-center gap-2 text-stone-400 hover:text-cyan-300 mb-5 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        <h1 className="text-3xl font-['Cinzel'] bg-gradient-to-r from-amber-200 via-amber-300 to-orange-500 bg-clip-text text-transparent mb-2">
          Reset Password
        </h1>
        <p className="text-stone-400 mb-6">Create a new password for your account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-2">New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0f141a] border border-stone-700 rounded-lg py-3 pl-10 pr-3 text-stone-100 placeholder-stone-500 focus:border-cyan-400 focus:outline-none"
                placeholder="At least 6 characters"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-[#0f141a] border border-stone-700 rounded-lg py-3 pl-10 pr-3 text-stone-100 placeholder-stone-500 focus:border-cyan-400 focus:outline-none"
                placeholder="Re-enter password"
              />
            </div>
          </div>

          {error && <div className="text-sm text-red-300 bg-red-900/25 border border-red-500/40 rounded-lg px-3 py-2">{error}</div>}
          {status && <div className="text-sm text-emerald-300 bg-emerald-900/25 border border-emerald-500/40 rounded-lg px-3 py-2">{status}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 text-[#20140a] font-['Cinzel'] font-bold rounded-lg inline-flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? "Resetting..." : "Reset Password"}
            {!loading && <Sparkles className="w-4 h-4" />}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
