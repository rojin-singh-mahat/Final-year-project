import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Gamepad2, 
  Zap, 
  Trophy, 
  TrendingUp, 
  ChevronDown,
  ArrowRight,
  Target,
  BookOpen,
  Award
} from 'lucide-react';

export default function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark');
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Floating Orbs Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #1DB954 0%, transparent 70%)',
            top: '10%',
            left: '10%',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            bottom: '20%',
            right: '10%',
          }}
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #1DB954 0%, transparent 70%)',
            top: '50%',
            right: '20%',
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, -80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' 
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#1DB954] to-[#8b5cf6] rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span>SkillQuest</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="hover:text-[#1DB954] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#1DB954] transition-colors">How It Works</a>
            <a href="/login" className="px-4 py-2 border border-white/20 rounded-lg hover:border-[#1DB954] hover:text-[#1DB954] transition-colors">
              Sign In
            </a>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-block mb-6"
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[#1DB954] to-[#8b5cf6] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#1DB954]/20 mx-auto">
                <Trophy className="w-10 h-10 text-black" />
              </div>
            </motion.div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl mb-6 bg-gradient-to-r from-white via-[#1DB954] to-[#8b5cf6] bg-clip-text text-transparent leading-tight">
              Master Skills Through Quests
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Level up your tech skills with gamified micro-lessons
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a href="/register" className="px-8 py-4 bg-[#1DB954] hover:bg-[#1ed760] text-black rounded-xl shadow-2xl shadow-[#1DB954]/20 hover:scale-105 transition-transform flex items-center gap-2">
                Start Learning Free
                <ArrowRight className="w-5 h-5" />
              </a>
              <a href="/login" className="px-8 py-4 border-2 border-white/20 hover:border-[#1DB954] hover:text-[#1DB954] rounded-xl hover:scale-105 transition-transform">
                Sign In
              </a>
            </div>

            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-[#1DB954] rounded-full animate-pulse"></span>
              Join 1000+ learners • No credit card required
            </p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <ChevronDown className="w-8 h-8 text-[#1DB954]" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl mb-4">
              Why Choose <span className="text-[#1DB954]">SkillQuest</span>?
            </h2>
            <p className="text-xl text-gray-400">Premium learning experience designed for results</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Quest-Based Learning */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-[#1DB954]/50 p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#1DB954]/10 group cursor-pointer"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[#1DB954] to-[#8b5cf6] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-2xl mb-3 text-white">Quest-Based Learning</h3>
              <p className="text-gray-400 leading-relaxed">Turn boring lessons into exciting missions. Complete challenges, unlock achievements, and progress through skill trees like your favorite RPG game.</p>
            </motion.div>

            {/* Micro-Skills Focus */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-[#1DB954]/50 p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#1DB954]/10 group cursor-pointer"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[#1DB954] to-[#8b5cf6] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-2xl mb-3 text-white">Micro-Skills Focus</h3>
              <p className="text-gray-400 leading-relaxed">Master complex topics in bite-sized 5-15 minute sessions. Perfect for busy schedules. Learn during your coffee break, not your entire weekend.</p>
            </motion.div>

            {/* Earn Rewards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-[#1DB954]/50 p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#1DB954]/10 group cursor-pointer"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[#1DB954] to-[#8b5cf6] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-2xl mb-3 text-white">Earn Rewards</h3>
              <p className="text-gray-400 leading-relaxed">Collect points, badges, and level up your profile. Compete on leaderboards and showcase your achievements to potential employers.</p>
            </motion.div>

            {/* Track Progress */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-[#1DB954]/50 p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#1DB954]/10 group cursor-pointer"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[#1DB954] to-[#8b5cf6] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-2xl mb-3 text-white">Track Progress</h3>
              <p className="text-gray-400 leading-relaxed">Beautiful visual dashboards show your learning journey. See your skill growth, completion rates, and personalized recommendations.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-32 px-6 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl mb-4">
              Start Your Journey in <span className="text-[#8b5cf6]">3 Steps</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-20 left-0 right-0 h-1">
              <svg className="w-full h-full" preserveAspectRatio="none">
                <motion.line
                  x1="16%"
                  y1="50%"
                  x2="84%"
                  y2="50%"
                  stroke="#1DB954"
                  strokeWidth="2"
                  strokeDasharray="8 8"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </svg>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-[#1DB954] to-[#8b5cf6] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#1DB954]/20 mx-auto">
                    <Target className="w-12 h-12 text-black" />
                  </div>
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center text-black text-xl shadow-xl">
                    1
                  </div>
                </div>
                <h3 className="text-2xl mb-3 text-white">Choose Your Path</h3>
                <p className="text-gray-400">Browse technical skills from web development to data science. Pick what excites you.</p>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center"
              >
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-[#1DB954] to-[#8b5cf6] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#1DB954]/20 mx-auto">
                    <BookOpen className="w-12 h-12 text-black" />
                  </div>
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center text-black text-xl shadow-xl">
                    2
                  </div>
                </div>
                <h3 className="text-2xl mb-3 text-white">Complete Quests</h3>
                <p className="text-gray-400">Learn through interactive challenges. Each quest teaches a micro-skill in 5-15 minutes.</p>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-center"
              >
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-[#1DB954] to-[#8b5cf6] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#1DB954]/20 mx-auto">
                    <Award className="w-12 h-12 text-black" />
                  </div>
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center text-black text-xl shadow-xl">
                    3
                  </div>
                </div>
                <h3 className="text-2xl mb-3 text-white">Level Up</h3>
                <p className="text-gray-400">Earn XP, unlock badges, and watch your skills grow. Become a certified master.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-[#1DB954]/10 to-[#8b5cf6]/10 border border-[#1DB954]/20 p-8 rounded-2xl text-center hover:scale-105 transition-transform"
            >
              <div className="text-5xl md:text-6xl text-[#1DB954] mb-2">
                500+
              </div>
              <div className="text-lg text-gray-300">Skills Mastered</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gradient-to-br from-[#1DB954]/10 to-[#8b5cf6]/10 border border-[#1DB954]/20 p-8 rounded-2xl text-center hover:scale-105 transition-transform"
            >
              <div className="text-5xl md:text-6xl text-[#1DB954] mb-2">
                10,000+
              </div>
              <div className="text-lg text-gray-300">Quests Completed</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-[#1DB954]/10 to-[#8b5cf6]/10 border border-[#1DB954]/20 p-8 rounded-2xl text-center hover:scale-105 transition-transform"
            >
              <div className="text-5xl md:text-6xl text-[#1DB954] mb-2">
                95%
              </div>
              <div className="text-lg text-gray-300">Completion Rate</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-transparent to-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-6xl mb-8">
              Ready to <span className="text-[#1DB954]">Level Up</span> Your Skills?
            </h2>
            <a href="/register" className="inline-flex items-center gap-2 px-12 py-6 bg-[#1DB954] hover:bg-[#1ed760] text-black rounded-2xl shadow-2xl shadow-[#1DB954]/30 hover:scale-105 transition-transform mb-6">
              Get Started Free
              <Trophy className="w-6 h-6" />
            </a>
            <p className="text-sm text-gray-500">
              No credit card required • Start learning in 30 seconds
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[#1DB954] to-[#8b5cf6] rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-black" />
                </div>
                <span>SkillQuest</span>
              </div>
              <p className="text-gray-400 text-sm">
                Gamified learning that actually works. Master technical skills one quest at a time.
              </p>
            </div>
            <div className="flex flex-col md:items-end gap-3">
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-[#1DB954] transition-colors">About</a>
                <a href="#" className="text-gray-400 hover:text-[#1DB954] transition-colors">Contact</a>
                <a href="#" className="text-gray-400 hover:text-[#1DB954] transition-colors">Privacy</a>
                <a href="#" className="text-gray-400 hover:text-[#1DB954] transition-colors">Terms</a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-sm text-gray-500">
            © 2025 SkillQuest. All rights reserved. Built for learners who level up.
          </div>
        </div>
      </footer>
    </div>
  );
}