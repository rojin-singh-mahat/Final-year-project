import { useState, useEffect } from "react";
import { Bell, DollarSign, User, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <div className="text-center py-16 text-[#b3b3b3]">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl mb-2 bg-gradient-to-r from-white via-[#1DB954] to-[#8b5cf6] bg-clip-text text-transparent">
          Quest Purchases
        </h1>
        <p className="text-[#b3b3b3]">Track your quest sales and user purchases</p>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-16 h-16 text-[#808080] mx-auto mb-4" />
          <p className="text-[#b3b3b3]">No purchases yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] border border-[#282828] rounded-2xl p-6 hover:border-[#1DB954]/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-[#1DB954]" />
                    <h3 className="text-lg font-semibold text-white">
                      रु {notification.amount} {notification.currency || "NPR"}
                    </h3>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      {notification.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-[#b3b3b3]">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#808080]" />
                      <span>{notification.userId?.name || "Unknown User"}</span>
                      <span className="text-[#808080]">({notification.userId?.email || "N/A"})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#808080]" />
                      <span>{notification.questId?.title || "Quest Deleted"}</span>
                    </div>

                    <div className="text-xs text-[#808080]">
                      Transaction ID: {notification.transactionId}
                    </div>

                    <div className="text-xs text-[#808080]">
                      {new Date(notification.transactionDate).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
