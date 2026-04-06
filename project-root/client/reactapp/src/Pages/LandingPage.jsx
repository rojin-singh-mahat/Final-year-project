import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Swords,
  Scroll,
  Trophy,
  Users,
  Star,
  Sparkles,
  Shield,
  Zap,
  ChevronRight,
} from "lucide-react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80";

function ImageWithFallback({ src, alt, className }) {
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setCurrentSrc(FALLBACK_IMAGE)}
    />
  );
}

export default function LandingPage({ onStartQuest }) {
  const navigate = useNavigate();

  const handleStartQuest = () => {
    if (typeof onStartQuest === "function") {
      onStartQuest();
      return;
    }
    navigate("/register");
  };

  const stats = [
    { icon: Users, label: "50,000+", sublabel: "Learners" },
    { icon: Scroll, label: "100,000+", sublabel: "Quests Completed" },
    { icon: Trophy, label: "250+", sublabel: "Skills to Master" },
  ];

  const testimonials = [
    {
      name: "Sir Marcus the Developer",
      level: "Level 42",
      quote:
        "SkillQuest transformed my coding journey from tedious tutorials into an epic adventure. I actually look forward to learning every day!",
      achievement: "JavaScript Master",
    },
    {
      name: "Lady Elena the Designer",
      level: "Level 38",
      quote:
        "The quest system keeps me motivated. Every completed challenge feels like slaying a dragon. My skills have never grown faster!",
      achievement: "UI/UX Champion",
    },
    {
      name: "Wizard Alexei",
      level: "Level 55",
      quote:
        "The daily quests and leaderboards turned learning into a healthy competition. I have mastered 12 new skills in just 6 months!",
      achievement: "Python Archmage",
    },
  ];

  const floatingRunes = [
    { top: "18%", left: "12%", delay: 0 },
    { top: "30%", left: "84%", delay: 0.4 },
    { top: "62%", left: "16%", delay: 0.8 },
    { top: "74%", left: "78%", delay: 1.2 },
    { top: "44%", left: "50%", delay: 1.6 },
    { top: "22%", left: "58%", delay: 2.0 },
  ];

  return (
    <div className="min-h-screen bg-[#111315] text-stone-100 relative overflow-x-hidden">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.15] mix-blend-overlay z-0"
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/black-scales.png')",
        }}
      ></div>
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-[#08090b]/90 via-transparent to-[#0b0d11]/95 z-0"></div>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1695841396762-5971f8f48ce8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpZXZhbCUyMGNhc3RsZSUyMGxpYnJhcnklMjBteXN0aWNhbHxlbnwxfHx8fDE3NzM0MDY5NTl8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Mystical Castle Library"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#111315]/60 to-[#111315]"></div>
        </div>

        <div className="absolute inset-0 z-10 pointer-events-none">
          {floatingRunes.map((rune, idx) => (
            <motion.div
              key={idx}
              className="absolute w-2.5 h-2.5 rounded-full bg-cyan-300/75 shadow-[0_0_18px_rgba(34,211,238,0.8)]"
              style={{ top: rune.top, left: rune.left }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.25, 0.9, 0.25],
                scale: [0.85, 1.3, 0.85],
              }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: rune.delay,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.div
              animate={{ rotate: [0, 4, -4, 0], y: [0, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Swords className="w-16 h-16 md:w-20 md:h-20 text-cyan-300" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="font-['Cinzel'] text-6xl md:text-8xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-orange-500"
            >
              SkillQuest
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-['Cinzel'] text-xl md:text-3xl text-amber-200 tracking-wide mb-4"
          >
            Begin Your Quest for Knowledge
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-['Merriweather'] text-base md:text-lg text-stone-300 max-w-2xl mx-auto mb-12"
          >
            Master new skills through epic adventures. Transform learning into an immersive RPG experience where every lesson conquered brings you closer to greatness.
          </motion.p>

          <motion.button
            onClick={handleStartQuest}
            className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 rounded-xl transition-transform duration-300 hover:scale-[1.03]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <Sparkles className="w-6 h-6 text-amber-50 group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-['Cinzel'] text-xl font-bold text-[#20140a] tracking-wide">
              Start Your Quest
            </span>
            <ChevronRight className="w-6 h-6 text-[#20140a] group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-16 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="relative p-5 bg-[#1b222a]/90 rounded-2xl transition-all group"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                whileHover={{ y: -4 }}
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 md:w-7 md:h-7 text-cyan-200" />
                </div>
                <p className="font-['Cinzel'] text-xl md:text-2xl font-bold text-amber-200">
                  {stat.label}
                </p>
                <p className="font-['Merriweather'] text-xs md:text-sm text-stone-300">
                  {stat.sublabel}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-[#111315] to-[#131820]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-['Cinzel'] text-4xl md:text-5xl font-bold text-center text-amber-200 mb-4">
            Every Lesson is an Adventure
          </h2>
          <p className="font-['Merriweather'] text-stone-300 text-center max-w-2xl mx-auto mb-16">
            Experience learning like never before with our immersive quest-based system
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <motion.div
              className="relative group h-full"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55 }}
            >
              <div className="relative bg-[#1c232d] rounded-2xl p-8 h-full md:min-h-[560px]">
                <div className="relative mb-6 h-48 rounded-xl overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1677295922463-147d7f2f718c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwcXVlc3QlMjBhZHZlbnR1cmUlMjBtYXB8ZW58MXx8fHwxNzczNDA2OTU5fDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Quest Map"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-opacity"
                  />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/25 flex items-center justify-center">
                    <Scroll className="w-6 h-6 text-amber-200" />
                  </div>
                  <h3 className="font-['Cinzel'] text-2xl font-bold text-amber-200">Quest-Based Learning</h3>
                </div>
                <p className="font-['Merriweather'] text-stone-200 leading-relaxed">
                  Navigate through skill trees displayed as glowing stone tablets. Each course is a pathway to mastery, with challenges that feel like epic quests rather than boring lessons.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="relative group h-full"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: 0.08 }}
            >
              <div className="relative bg-[#1a2530] rounded-2xl p-8 h-full md:min-h-[560px]">
                <div className="mb-6 flex flex-col gap-4 min-h-48 justify-center">
                  <div className="relative h-8 rounded-full overflow-hidden bg-[#0f141a]">
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-700 via-cyan-500 to-cyan-400"
                      animate={{ width: ["22%", "65%", "48%", "65%"] }}
                      transition={{ duration: 4.5, ease: "easeInOut" }}
                    ></motion.div>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-['Cinzel'] font-bold text-white">
                      Level 15 - 650 / 1000 XP
                    </span>
                  </div>
                  <div className="flex gap-3 justify-center">
                    {[Shield, Trophy, Star].map((Icon, i) => (
                      <motion.div
                        key={i}
                        className="w-16 h-16 rounded-xl bg-amber-500/20 flex items-center justify-center"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 2.6, delay: i * 0.2 }}
                      >
                        <Icon className="w-8 h-8 text-amber-200" />
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-cyan-200" />
                  </div>
                  <h3 className="font-['Cinzel'] text-2xl font-bold text-cyan-200">Track Your Progress</h3>
                </div>
                <p className="font-['Merriweather'] text-stone-200 leading-relaxed">
                  Gain XP with every completed lesson, level up your character, and unlock achievements. Watch your skills grow with visual progress tracking that makes learning addictive.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="relative group h-full"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: 0.14 }}
            >
              <div className="relative bg-[#1d2528] rounded-2xl p-8 h-full md:min-h-[560px]">
                <div className="relative mb-6 h-48 rounded-xl overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1676115388797-5f448ad78e44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmNpZW50JTIwc2Nyb2xsJTIwcGFyY2htZW50fGVufDF8fHx8MTc3MzQwNTY2Nnww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Ancient Scroll"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-opacity"
                  />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-emerald-200" />
                  </div>
                  <h3 className="font-['Cinzel'] text-2xl font-bold text-emerald-200">Daily Quests</h3>
                </div>
                <p className="font-['Merriweather'] text-stone-200 leading-relaxed">
                  Build learning habits with daily challenges that offer bonus XP and rare achievements. Complete your daily quests to maintain your streak and climb the leaderboards.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="relative group h-full"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: 0.2 }}
            >
              <div className="relative bg-[#232032] rounded-2xl p-8 h-full md:min-h-[560px]">
                <div className="relative mb-6 h-48 rounded-xl overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1749704492960-c17ed9b91db5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJyaW9yJTIwa25pZ2h0JTIwdHJhaW5pbmd8ZW58MXx8fHwxNzczNDA2OTYwfDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Warriors Training"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-opacity"
                  />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-200" />
                  </div>
                  <h3 className="font-['Cinzel'] text-2xl font-bold text-purple-200">Compete and Connect</h3>
                </div>
                <p className="font-['Merriweather'] text-stone-200 leading-relaxed">
                  Join a community of fellow learners. Compare your progress on leaderboards, share achievements, and inspire each other to reach new heights in your learning journey.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-[#131820] to-[#111315]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-['Cinzel'] text-4xl md:text-5xl font-bold text-center text-amber-200 mb-4">
            Tales from Fellow Adventurers
          </h2>
          <p className="font-['Merriweather'] text-stone-300 text-center max-w-2xl mx-auto mb-16">
            Hear from those who have conquered their learning quests
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-[#1b2129] rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600"></div>
                    <div>
                      <p className="font-['Cinzel'] text-amber-200 font-bold">{testimonial.name}</p>
                      <p className="font-['Merriweather'] text-xs text-stone-400">{testimonial.level}</p>
                    </div>
                  </div>
                  <p className="font-['Merriweather'] text-stone-200 italic mb-4 leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="pt-4 bg-white/5 rounded-lg px-3 py-2">
                    <p className="font-['Cinzel'] text-sm text-cyan-200">{testimonial.achievement}</p>
                  </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block w-full">
            <div className="bg-gradient-to-r from-[#1f2732] to-[#2a2435] rounded-3xl p-12">
              <h2 className="font-['Cinzel'] text-4xl md:text-5xl font-bold text-amber-200 mb-6">
                Your Quest Awaits
              </h2>
              <p className="font-['Merriweather'] text-stone-200 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of learners who have transformed their skills into legendary achievements. Start your journey today.
              </p>
              <motion.button
                onClick={handleStartQuest}
                className="group inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 rounded-xl transition-transform duration-300 hover:scale-[1.03]"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <Sparkles className="w-7 h-7 text-[#20140a] group-hover:rotate-180 transition-transform duration-500" />
                <span className="font-['Cinzel'] text-2xl font-bold text-[#20140a] tracking-wide">
                  Begin Your Adventure
                </span>
                <ChevronRight className="w-7 h-7 text-[#20140a] group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-8 px-6 bg-[#0e1013]">
        <div className="max-w-6xl mx-auto text-center">
          <p className="font-['Merriweather'] text-stone-400 text-sm">
            Copyright 2026 SkillQuest. Embark on your learning adventure.
          </p>
        </div>
      </footer>
    </div>
  );
}
