import { motion } from "framer-motion";
import { React } from "react";
import { TrendingUp } from "lucide-react";

export default function SkillProgress({skills = []}) {

    return(
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-6"
                  >
                    <h2 className="text-2xl mb-6 flex items-center gap-2">
                      Your Skill Progress
                      <TrendingUp className="w-6 h-6 text-[#1DB954]" />
                    </h2>
        
                    <div className="space-y-6">
                      {Object.entries(skills).map(([skill, progress], index) => (
                        <motion.div
                          key={skill}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white">{skill}</span>
                            <span className="text-[#1DB954]">{progress}%</span>
                          </div>
                          <div className="w-full bg-[#282828] rounded-full h-3 overflow-hidden">
                            <motion.div 
                              className="bg-gradient-to-r from-[#1DB954] to-[#8b5cf6] h-3 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1, delay: 0.9 + index * 0.1 }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
    )
}