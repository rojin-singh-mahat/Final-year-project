import { React, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import AdminView from "../components/Dashboard/Admin/AdminView";
import UserView from "../components/Dashboard/User/UserView";
import { getUserData } from "../utils/auth";

export default function Dashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const user = await getUserData();
      setUserData(user);
      setIsAdmin(user?.role === 'admin');
      setAuthChecked(true);
    }
    loadUser();
  }, []);

  if (!authChecked) return <div className="min-h-screen bg-[#111315] text-stone-100 p-10">Loading dashboard...</div>;

  if (!userData) {
    return <Navigate to="/tutorial" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#111315] text-stone-100 relative overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.12] mix-blend-overlay z-0"
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/black-scales.png')",
        }}
      ></div>
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-[#08090b]/90 via-transparent to-[#0b0d11]/95 z-0"></div>
      <main className="ml-60 flex-1 p-8">
        {isAdmin ? (
          <AdminView
            activeNav={activeNav}
            setActiveNav={setActiveNav}
            userData={userData}
            setUserData={setUserData}
          />
        ) : (
          <UserView activeNav={activeNav} setActiveNav={setActiveNav} userData={userData} setUserData={setUserData}/>
        )}
      </main>
    </div>
  );
}
