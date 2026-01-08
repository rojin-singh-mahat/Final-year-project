import { React, useState, useEffect } from "react";
import AdminView from "../components/Dashboard/Admin/AdminView";
import UserView from "../components/Dashboard/User/UserView";
import { getUserData } from "../utils/auth";

export default function Dashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');

  useEffect(() => {
    async function loadUser() {
      const user = await getUserData();
      setUserData(user);
      setIsAdmin(user.role === 'admin');
    }
    loadUser();
  }, []);

  if (!userData) return <div className="p-10">Loading dashboard...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">      
      <main className="ml-60 flex-1 p-8">
        {isAdmin ? (
          <AdminView activeNav={activeNav} setActiveNav={setActiveNav} />
        ) : (
          <UserView activeNav={activeNav} setActiveNav={setActiveNav} userData={userData} setUserData={setUserData}/>
        )}
      </main>
    </div>
  );
}
