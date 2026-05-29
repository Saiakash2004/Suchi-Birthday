import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * FallingPetals - Creates a beautiful rain of CSS rose petals
 * @param {number} count - Number of petals (default 18)
 * @param {boolean} active - Whether petals are visible
 */
export const FallingPetals = ({ count = 18, active = true }) => {
  const petals = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const colors = [
        'rgba(220, 38, 38, 0.7)',   // deep red
        'rgba(236, 72, 153, 0.6)',  // hot pink
        'rgba(244, 114, 182, 0.5)', // light pink
        'rgba(190, 18, 60, 0.65)',  // rose
        'rgba(251, 113, 133, 0.5)', // salmon pink
        'rgba(225, 29, 72, 0.6)',   // crimson
      ];
      return {
        id: i,
        left: `${Math.random() * 100}%`,
        size: 8 + Math.random() * 14,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: 6 + Math.random() * 8,
        delay: Math.random() * 10,
        sway1: (Math.random() - 0.5) * 100,
        sway2: (Math.random() - 0.5) * 80,
        sway3: (Math.random() - 0.5) * 120,
        sway4: (Math.random() - 0.5) * 60,
      };
    });
  }, [count]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[4] overflow-hidden">
      {petals.map(p => (
        <div
          key={p.id}
          className="petal"
          style={{
            left: p.left,
            '--fall-duration': `${p.duration}s`,
            '--fall-delay': `${p.delay}s`,
            '--sway1': `${p.sway1}px`,
            '--sway2': `${p.sway2}px`,
            '--sway3': `${p.sway3}px`,
            '--sway4': `${p.sway4}px`,
          }}
        >
          <div
            className="petal-shape"
            style={{
              '--petal-size': `${p.size}px`,
              '--petal-color': p.color,
              background: `linear-gradient(135deg, ${p.color}, ${p.color.replace(/[\d.]+\)$/, '0.3)')})`,
            }}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * FloatingHearts - Rising heart emojis with Valentine vibe
 * @param {number} count - Number of hearts
 */
export const FloatingHearts = ({ count = 8 }) => {
  const hearts = useMemo(() => {
    const emojis = ['🌹', '💗', '🩷', '💕', '🌸', '🪷', '❤️'];
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: `${5 + Math.random() * 90}%`,
      size: 14 + Math.random() * 16,
      duration: 8 + Math.random() * 10,
      delay: Math.random() * 12,
      rotate: -30 + Math.random() * 60,
    }));
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[3] overflow-hidden">
      {hearts.map(h => (
        <div
          key={h.id}
          className="floating-heart"
          style={{
            left: h.left,
            fontSize: h.size,
            '--heart-duration': `${h.duration}s`,
            '--heart-delay': `${h.delay}s`,
            '--heart-rotate': `${h.rotate}deg`,
          }}
        >
          {h.emoji}
        </div>
      ))}
    </div>
  );
};

/**
 * FlowerCornerDecoration - Places floral imagery at screen corners
 */
export const FlowerCornerDecoration = ({ position = 'top-right', opacity = 0.35, size = 200 }) => {
  const positionClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0 -scale-x-100',
    'bottom-right': 'bottom-0 right-0 -scale-y-100',
    'bottom-left': 'bottom-0 left-0 -scale-x-100 -scale-y-100',
  };

  return (
    <div 
      className={`flower-corner ${positionClasses[position]} float-flower`}
      style={{ opacity }}
    >
      <img 
        src="/images/flower_corner.png" 
        alt="" 
        style={{ width: size, height: size }}
        className="object-contain"
      />
    </div>
  );
};

/**
 * BouquetDecoration - A floating bouquet image with glow aura
 */
export const BouquetDecoration = ({ className = '', size = 250 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className={`bouquet-glow float-flower ${className}`}
    >
      <img 
        src="/images/rose_bouquet.png" 
        alt="Rose Bouquet" 
        style={{ width: size, height: size }}
        className="object-contain drop-shadow-[0_0_20px_rgba(236,72,153,0.2)]"
      />
    </motion.div>
  );
};

/**
 * FloralWreath - A circular wreath frame, perfect for the finale
 */
export const FloralWreath = ({ children, size = 350 }) => {
  return (
    <div className="relative flex items-center justify-center">
      <motion.img
        src="/images/floral_wreath.png"
        alt=""
        initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
        animate={{ opacity: 0.6, scale: 1, rotate: 0 }}
        transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: size, height: size }}
        className="absolute object-contain drop-shadow-[0_0_30px_rgba(236,72,153,0.15)] mix-blend-screen"
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

/**
 * SingleRoseAccent - A decorative single rose with subtle animation
 */
export const SingleRoseAccent = ({ className = '', size = 120 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: -15, x: -20 }}
      whileInView={{ opacity: 0.5, rotate: 0, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.0, ease: 'easeOut' }}
      className={`pointer-events-none ${className}`}
    >
      <img 
        src="/images/single_rose.png" 
        alt="" 
        style={{ width: size, height: size }}
        className="object-contain mix-blend-screen drop-shadow-[0_0_15px_rgba(220,38,38,0.2)]"
      />
    </motion.div>
  );
};

export default FallingPetals;
