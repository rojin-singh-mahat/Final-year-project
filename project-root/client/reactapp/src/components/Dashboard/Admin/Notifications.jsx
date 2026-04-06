import { useState, useEffect } from "react";
import { Bell, DollarSign, User, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const totalRevenue = notifications.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const successfulPayments = notifications.filter((item) => {
    const status = String(item.status || "").toLowerCase();
    return status === "completed" || status === "success";
  }).length;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16 text-stone-400">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl mb-2 font-['Cinzel'] font-bold bg-gradient-to-r from-amber-200 via-amber-300 to-orange-400 bg-clip-text text-transparent">
          Quest Purchases
        </h1>
        <p className="text-stone-400">Track your quest sales and user purchases</p>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-16 h-16 text-stone-500 mx-auto mb-4" />
          <p className="text-stone-400">No purchases yet</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1b222a]/90 border border-stone-700 rounded-xl p-4">
              <div className="text-stone-500 text-xs mb-1">TOTAL PURCHASES</div>
              <div className="text-2xl font-['Cinzel'] text-stone-100">{notifications.length}</div>
            </div>
            <div className="bg-[#1b222a]/90 border border-stone-700 rounded-xl p-4">
              <div className="text-stone-500 text-xs mb-1">SUCCESSFUL TRANSACTIONS</div>
              <div className="text-2xl font-['Cinzel'] text-emerald-300">{successfulPayments}</div>
            </div>
            <div className="bg-[#1b222a]/90 border border-stone-700 rounded-xl p-4">
              <div className="text-stone-500 text-xs mb-1">TOTAL REVENUE</div>
              <div className="text-2xl font-['Cinzel'] text-amber-300">NPR {totalRevenue.toLocaleString()}</div>
            </div>
          </div>

        <div className="space-y-4 mt-6">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-br from-[#1b222a]/95 to-[#131820]/70 border border-stone-700 rounded-2xl p-6 hover:border-cyan-300/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-amber-300" />
                    <h3 className="text-lg font-semibold text-stone-100">
                      रु {notification.amount} {notification.currency || "NPR"}
                    </h3>
                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/30">
                      {notification.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-stone-400">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-stone-500" />
                      <span>{notification.userId?.name || "Unknown User"}</span>
                      <span className="text-stone-500">({notification.userId?.email || "N/A"})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-stone-500" />
                      <span>{notification.questId?.title || "Quest Deleted"}</span>
                    </div>

                    <div className="text-xs text-stone-500">
                      Transaction ID: {notification.transactionId}
                    </div>

                    <div className="text-xs text-stone-500">
                      {new Date(notification.transactionDate).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        </>
      )}
    </div>
  );
}
