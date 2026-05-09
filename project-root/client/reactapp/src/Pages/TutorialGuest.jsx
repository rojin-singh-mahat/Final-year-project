import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LessonPlayer from "../components/Dashboard/User/LessonPlayer";
import { FALLBACK_TUTORIAL_QUEST } from "../utils/tutorialQuest";

export default function TutorialGuest() {
  const navigate = useNavigate();
  const [questData, setQuestData] = useState(FALLBACK_TUTORIAL_QUEST);
  const [loadingQuest, setLoadingQuest] = useState(true);
  const [showClaimGate, setShowClaimGate] = useState(false);
  const completionHandledRef = useRef(false);

  useEffect(() => {
    const loadTutorialQuest = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/quests`);
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) {
          setLoadingQuest(false);
          return;
        }

        const tutorialQuest = data.find((quest) => {
          const title = String(quest?.title || "").toLowerCase();
          const tags = Array.isArray(quest?.hashtags)
            ? quest.hashtags.map((tag) => String(tag || "").toLowerCase())
            : [];
          return title.includes("tutorial") || tags.includes("tutorial");
        });

        if (tutorialQuest) {
          setQuestData(tutorialQuest);
        }
      } catch (err) {
        console.error("Failed to load tutorial quest:", err);
      } finally {
        setLoadingQuest(false);
      }
    };

    loadTutorialQuest();
  }, []);

  if (loadingQuest) {
    return <div className="min-h-screen bg-[#0f131a] text-stone-100 p-8">Preparing tutorial...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0f131a] text-stone-100 relative">
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between bg-black/0 backdrop-blur-[1px]">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-stone-300 hover:text-stone-100 text-sm font-semibold"
          >
            Back
          </button>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => navigate("/login?next=%2Fdashboard")}
              className="text-cyan-200/90 hover:text-cyan-100 text-sm font-semibold tracking-wide"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-amber-200/90 hover:text-amber-100 text-sm font-semibold tracking-wide"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

      <div className="pt-14">
        <LessonPlayer
          quest={questData}
          onClose={() => {
            if (completionHandledRef.current) return;
            navigate("/");
          }}
          onComplete={() => {
            completionHandledRef.current = true;
            setShowClaimGate(true);
          }}
        />
      </div>

      {showClaimGate && (
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-2xl bg-[#151b24] p-6"
          >
            <h2 className="font-['Cinzel'] text-2xl text-amber-200 mb-2">Continue Your Journey?</h2>
            <p className="text-stone-300 text-sm mb-5">
              You completed the tutorial. Continue to register and claim your starter XP + badge, or go back to the landing page.
            </p>
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-cyan-200 hover:text-cyan-100 font-semibold"
              >
                Not Now
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-amber-200 hover:text-amber-100 font-semibold"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
