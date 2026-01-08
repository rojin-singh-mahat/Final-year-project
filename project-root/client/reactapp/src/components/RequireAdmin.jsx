import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RequireAdmin({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAdmin() {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.user && data.user.role === "admin") {
          setIsAdmin(true);
        } else {
          navigate("/dashboard");
        }
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }
    checkAdmin();
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Checking admin access...</div>;
  return isAdmin ? children : null;
}
