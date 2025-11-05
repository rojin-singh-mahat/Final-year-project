// src/components/Taskbar.tsx
import { motion } from "framer-motion";
import { Home, Zap, Star, Award } from "lucide-react";

interface TaskbarItem {
  name: string;
  icon: JSX.Element;
  active?: boolean;
}

const items: TaskbarItem[] = [
  { name: "Home", icon: <Home /> },
  { name: "Quests", icon: <Zap /> },
  { name: "Achievements", icon: <Star /> },
  { name: "Badges", icon: <Award /> },
];

export default function Taskbar() {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "tween", duration: 0.3 }}
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-4xl bg-[#1a1a1a]/90 backdrop-blur-lg border border-[#282828] rounded-full flex justify-around items-center py-3 shadow-xl"
    >
      {items.map((item, i) => (
        <motion.button
          key={i}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`flex flex-col items-center text-gray-400 ${
            item.active ? "text-[#1DB954]" : ""
          }`}
        >
          {item.icon}
          <span className="text-xs mt-1">{item.name}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}
