import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { loveConfig } from '../../config/loveConfig';
import audioManager from '../../utils/audioManager';

export const ReasonsSection = ({ onReasonClick }) => {
  const [selectedReasonId, setSelectedReasonId] = useState(null);

  const handleCardClick = (id) => {
    audioManager.playClick();
    setSelectedReasonId(id === selectedReasonId ? null : id);
    if (onReasonClick) onReasonClick();
  };

  return (
    <div className="w-full min-h-screen py-24 px-4 flex flex-col items-center justify-center relative select-none">
      {/* Section Title */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.0 }}
        className="text-center mb-16 z-10"
      >

        <h2 className="font-cinzel text-3xl md:text-5xl text-[#4a3135]/95 tracking-[0.06em] mt-2">
          reasons i <span className="gradient-text-animated font-semibold">love you</span> 🌺
        </h2>
        <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-romantic-pink/50 to-transparent mx-auto mt-5" />
      </motion.div>

      {/* Grid of Reasons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl w-full px-4 z-10">
        {loveConfig.reasons.map((reason, index) => {
          const isSelected = selectedReasonId === reason.id;
          
          return (
            <motion.div
              key={reason.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => handleCardClick(reason.id)}
              className={`
                relative cursor-pointer p-6 rounded-[20px] 
                transition-all duration-300 
                flex flex-col items-center text-center justify-center 
                h-[180px] overflow-hidden
                ${isSelected 
                  ? 'glass-genz scale-[1.02] z-20' 
                  : 'glass-panel border border-romantic-pink/15 hover:border-romantic-pink/30 hover:bg-white/85'
                }
              `}
              whileHover={{ y: isSelected ? 0 : -4 }}
              onMouseEnter={() => !isSelected && audioManager.playHoverTick()}
              style={{
                boxShadow: isSelected 
                  ? '0 12px 35px rgba(236, 72, 153, 0.12), 0 10px 30px rgba(74,49,53,0.06)' 
                  : '0 8px 32px rgba(74, 49, 53, 0.05)'
              }}
            >
              <AnimatePresence mode="wait">
                {!isSelected ? (
                  <motion.div
                    key="front"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-3xl mb-3 filter drop-shadow-[0_0_12px_rgba(236,72,153,0.3)]">
                      {reason.icon}
                    </span>
                    <h3 className="font-cinzel text-[15px] text-[#4a3135] font-bold tracking-wider">
                      {reason.short}
                    </h3>
                    <span className="text-[8px] text-romantic-pink/70 uppercase tracking-[0.2em] mt-3 font-semibold">
                      tap to reveal →
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center justify-center h-full px-2"
                  >
                    <Heart className="w-4 h-4 text-romantic-pink mb-3 fill-romantic-pink animate-pulse" />
                    <p className="text-[12px] md:text-[13px] text-[#5c4044] leading-relaxed font-semibold">
                      "{reason.full}"
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.5 }}
        viewport={{ once: true }}
        className="text-[9px] text-[#4a3135]/45 tracking-[0.2em] uppercase mt-14 z-10 font-semibold"
      >
        tap the cards to feel the love ✨
      </motion.p>
    </div>
  );
};

export default ReasonsSection;
