import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Calendar, MapPin, X, Volume2, Sparkles } from 'lucide-react';
import { loveConfig } from '../../config/loveConfig';
import audioManager from '../../utils/audioManager';

// Bezier interpolation helper for fairy light positioning
const getBezierPoint = (p0, p1, p2, t) => {
  const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
  const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
  return { x, y };
};

// Individual Hanging Polaroid Component
const HangingPolaroid = ({ memory, index, onClick, onHoverChange, isHovered, wireData }) => {
  const cardRef = useRef(null);
  
  // Motion values for tilt interaction
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for camera tilt feel
  const rotateX = useSpring(useTransform(y, [-100, 100], [12, -12]), { stiffness: 100, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-12, 12]), { stiffness: 100, damping: 18 });
  const liftY = useSpring(0, { stiffness: 120, damping: 15 });
  const shadowSpread = useSpring(10, { stiffness: 120, damping: 15 });
  
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Lerp coordinates based on cursor position relative to card center
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseEnter = () => {
    liftY.set(-8);
    shadowSpread.set(24);
    onHoverChange(memory.id);
    audioManager.playHoverTick();
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    liftY.set(0);
    shadowSpread.set(10);
    onHoverChange(null);
  };

  // Staggered base card hanging rotations
  const baseRotate = index % 2 === 0 ? (index === 0 ? -2.5 : -1.2) : (index === 1 ? 2.0 : 1.5);
  
  // Custom emotional captions for the polaroids
  const emotionalCaptions = [
    " 🌸",
    "💞",
    "💝",
    "❤️"
  ];

  return (
    <motion.div
      ref={cardRef}
      style={{
        rotateX,
        rotateY,
        y: liftY,
        rotate: baseRotate,
        perspective: 1000,
        transformStyle: 'preserve-3d',
        boxShadow: useTransform(
          shadowSpread,
          [10, 24],
          [
            '0 8px 22px rgba(74,49,53,0.06), 0 2px 6px rgba(74,49,53,0.03)',
            '0 24px 50px rgba(74,49,53,0.14), 0 8px 20px rgba(74,49,53,0.07)'
          ]
        )
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(memory.id)}
      className="bg-[#faf8f4] p-3 pb-7 border border-[#e8e2d7] rounded-[3px] cursor-pointer select-none relative transition-all duration-300 w-52 md:w-60"
    >
      {/* 📎 Realistic Wooden Clothes Pin/Clip */}
      <div 
        className="absolute top-[-16px] left-[50%] -translate-x-1/2 w-3.5 h-8 bg-[#d2b48c] border border-[#8b5a2b]/35 shadow-sm z-30 flex flex-col items-center justify-between py-1"
        style={{ transform: 'translateZ(10px)' }}
      >
        {/* Metal spring clip wraps */}
        <div className="w-[10px] h-[2px] bg-slate-500/80 shadow-xs mt-1" />
        <div className="w-1.5 h-[1px] bg-slate-400/40" />
      </div>

      {/* Picture Frame area (damaged corners aspect ratio) */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-200 rounded-[2px] border border-[#e4ded0] shadow-inner mb-3">
        <img
          src={`/images/${memory.image}`}
          alt={memory.title}
          className={`w-full h-full object-cover transition-all duration-1000 ease-out grayscale-[10%] ${
            isHovered ? 'scale-105 grayscale-0' : ''
          }`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Handwritten Caption on larger bottom border */}
      <div className="text-center mt-2 px-1">
        <span className="font-cursive text-[17px] text-[#4a3135]/95 tracking-wide leading-none select-none block">
          {emotionalCaptions[index]}
        </span>
      </div>
    </motion.div>
  );
};

// Local Floating Dust Particle Overlay inside focus modal
const ModalDustOverlay = () => {
  const dustCount = 18;
  const particles = useMemo(() => {
    return Array.from({ length: dustCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 3,
      duration: 6 + Math.random() * 8,
      delay: Math.random() * -5,
      tx: (Math.random() - 0.5) * 80,
      ty: -(40 + Math.random() * 60)
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full float-particle bg-romantic-gold/30"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            boxShadow: '0 0 6px rgba(251,191,36,0.2)',
            opacity: 0.5,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            '--duration': `${p.duration}s`,
            '--delay': `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export const MemoryTimeline = () => {
  const [activeMemoryId, setActiveMemoryId] = useState(null);
  const [isPlayingLullaby, setIsPlayingLullaby] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState(null);

  // SVG Catenary Wire configurations (viewBox 0 0 1200 320)
  const wires = [
    {
      id: 1,
      p0: { x: 0, y: 50 },
      p1: { x: 180, y: 190 }, // Lowest control point
      p2: { x: 360, y: 80 },
      hangX: 180,
      hangY: 125,
      memoryIdx: 0,
      swayDuration: 4.5
    },
    {
      id: 2,
      p0: { x: 280, y: 70 },
      p1: { x: 460, y: 180 },
      p2: { x: 640, y: 60 },
      hangX: 460,
      hangY: 120,
      memoryIdx: 1,
      swayDuration: 5.2
    },
    {
      id: 3,
      p0: { x: 560, y: 80 },
      p1: { x: 740, y: 200 },
      p2: { x: 920, y: 90 },
      hangX: 740,
      hangY: 140,
      memoryIdx: 2,
      swayDuration: 4.8
    },
    {
      id: 4,
      p0: { x: 840, y: 60 },
      p1: { x: 1020, y: 175 },
      p2: { x: 1200, y: 75 },
      hangX: 1020,
      hangY: 119,
      memoryIdx: 3,
      swayDuration: 5.0
    }
  ];

  // Calculate coordinates along wires for placing fairy lights
  const getWireLights = (wire) => {
    const lightsCount = 7;
    const points = [];
    for (let i = 1; i < lightsCount; i++) {
      const t = i / lightsCount;
      // Skip the exact center hook point to avoid overlapping polaroid clothes pin
      if (Math.abs(t - 0.5) < 0.1) continue;
      
      const pt = getBezierPoint(wire.p0, wire.p1, wire.p2, t);
      points.push({
        id: `${wire.id}-${i}`,
        x: pt.x,
        y: pt.y,
        delay: Math.random() * 1.5,
        speed: 1.2 + Math.random() * 1.0
      });
    }
    return points;
  };

  const handleCardClick = (id) => {
    // Play instant camera shutter sound
    audioManager.playCameraShutter();
    setActiveMemoryId(id);
    setIsPlayingLullaby(false);
  };

  const handleCloseModal = (e) => {
    if (e) e.stopPropagation();
    audioManager.playClick();
    setActiveMemoryId(null);
    setIsPlayingLullaby(false);
  };

  const triggerVoiceNote = (e) => {
    e.stopPropagation();
    audioManager.playClick();
    
    if (isPlayingLullaby) {
      setIsPlayingLullaby(false);
    } else {
      setIsPlayingLullaby(true);
      audioManager.playTimelineLullaby();
      
      setTimeout(() => {
        setIsPlayingLullaby(false);
      }, 2500);
    }
  };

  const activeMemory = loveConfig.memories.find(m => m.id === activeMemoryId);

  return (
    <div className="w-full min-h-screen pt-16 pb-24 px-4 flex flex-col items-center justify-start select-none relative">
      {/* Chapter Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.0 }}
        className="text-center mb-2 z-10"
      >

        <h2 className="font-cinzel text-3xl md:text-5xl text-[#4a3135]/95 tracking-[0.06em] mt-2">
          your precious <span className="gradient-text-animated font-semibold">timeline</span> 🌹
        </h2>
        <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-romantic-pink/50 to-transparent mx-auto mt-5" />
      </motion.div>

      {/* Hanging System (SVG Wires + Fairy Lights + Polaroids) */}
      <div className="w-full max-w-6xl mx-auto relative h-[440px] md:h-[500px] mt-4 px-4 z-10 select-none">
        
        {/* Responsive scaling viewBox container */}
        <svg 
          viewBox="0 0 1200 350" 
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        >
          {/* Render individual wire curves */}
          {wires.map(wire => (
            <path
              key={wire.id}
              d={`M ${wire.p0.x} ${wire.p0.y} Q ${wire.p1.x} ${wire.p1.y} ${wire.p2.x} ${wire.p2.y}`}
              fill="none"
              stroke="#5c4044"
              strokeWidth="1.2"
              className="opacity-25"
            />
          ))}
        </svg>

        {/* Render each Wire Group with independent sway */}
        {wires.map(wire => {
          const lights = getWireLights(wire);
          const memory = loveConfig.memories[wire.memoryIdx];
          const isWireHovered = hoveredCardId === memory?.id;

          return (
            <motion.div
              key={wire.id}
              animate={{ 
                y: [0, 4, 0],
                rotate: [-0.6, 0.6, -0.6]
              }}
              transition={{
                repeat: Infinity,
                duration: wire.swayDuration,
                ease: "easeInOut"
              }}
              style={{ originX: `${(wire.p0.x + wire.p2.x) / 24}%`, originY: '0%' }}
              className="absolute inset-0 pointer-events-none overflow-visible"
            >
              {/* Fairy Lights along Bezier curve */}
              {lights.map(light => (
                <div
                  key={light.id}
                  className="absolute rounded-full transition-all duration-500"
                  style={{
                    left: `${(light.x / 1200) * 100}%`,
                    top: `${(light.y / 350) * 100}%`,
                    width: isWireHovered ? '9px' : '6px',
                    height: isWireHovered ? '9px' : '6px',
                    transform: 'translate(-50%, -50%)',
                    background: isWireHovered ? '#fbbf24' : '#fef3c7',
                    boxShadow: isWireHovered 
                      ? '0 0 10px #fbbf24, 0 0 20px #d97706, 0 0 35px #d97706' 
                      : '0 0 6px #fbbf24, 0 0 12px #d97706',
                    animation: `flicker ${light.speed}s infinite alternate ${light.delay}s`
                  }}
                />
              ))}

              {/* Hanging Polaroid Card at lowest point of curve */}
              <div
                className="absolute pointer-events-auto"
                style={{
                  left: `${(wire.hangX / 1200) * 100}%`,
                  top: `${(wire.hangY / 350) * 100}%`,
                  transform: 'translate(-50%, 0)'
                }}
              >
                {memory && (
                  <HangingPolaroid
                    memory={memory}
                    index={wire.memoryIdx}
                    onClick={handleCardClick}
                    onHoverChange={setHoveredCardId}
                    isHovered={hoveredCardId === memory.id}
                    wireData={wire}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.5 }}
        viewport={{ once: true }}
        className="text-[9px] text-[#4a3135]/45 tracking-[0.2em] uppercase mt-8 z-10 font-semibold"
      >
        hover to feel the depth · click to open memory 🌸
      </motion.p>

      {/* Cinematic Focus Mode Overlay */}
      <AnimatePresence>
        {activeMemoryId && activeMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1b1012]/45 backdrop-blur-2xl select-none cursor-zoom-out"
          >
            {/* Ambient dust and light bleed layer */}
            <ModalDustOverlay />
            
            <motion.div
              initial={{ scale: 0.88, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.88, y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 150 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl rounded-[24px] bg-[#faf8f4] p-5 pb-9 md:p-6 md:pb-12 border border-[#e2dcd0] shadow-[0_30px_90px_rgba(31,20,22,0.35)] flex flex-col md:flex-row cursor-default max-h-[90vh] relative overflow-hidden"
            >
              {/* Wooden clip visual on expanded card */}
              <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-4 h-9 bg-[#c8ab7e] rounded-xs border border-[#8b5a2b]/30 shadow-xs z-35" />

              {/* Polaroid Image pane */}
              <div className="w-full md:w-[48%] aspect-square md:h-auto relative overflow-hidden bg-slate-200 border border-[#e4ded0] shadow-inner rounded-[2px]">
                <img
                  src={`/images/${activeMemory.image}`}
                  alt={activeMemory.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/20 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Polaroid details pane */}
              <div className="w-full md:w-[52%] p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      {/* Date Stamp */}
                      <span className="pill-badge text-[9px] mb-3 select-none">
                        <Calendar className="w-3 h-3 text-romantic-pink/60" />
                        {activeMemory.date}
                      </span>
                      <h3 className="font-cinzel text-xl md:text-2xl text-[#4a3135] mt-3 tracking-wide font-bold">
                        {activeMemory.title}
                      </h3>
                    </div>
                    
                    {/* Close Trigger */}
                    <button
                      onClick={handleCloseModal}
                      className="w-8 h-8 rounded-full bg-black/5 hover:bg-romantic-rose/15 hover:text-romantic-rose border border-[#4a3135]/15 flex items-center justify-center transition-all duration-200 text-[#4a3135]/60 active:scale-90"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="w-12 h-[1px] bg-gradient-to-r from-romantic-pink to-transparent mt-4" />

                  {/* Description typed out caption */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 1.0 }}
                    className="mt-6 text-sm md:text-base text-[#5c4044] leading-[1.8] font-medium"
                  >
                    {activeMemory.description}
                  </motion.p>
                </div>

                <div className="mt-8 border-t border-[#4a3135]/8 pt-5 flex flex-wrap items-center justify-between gap-4 text-xs text-[#8a6f72]">
                  {/* Location Pin */}
                  <span className="flex items-center gap-1.5 font-semibold text-[#4a3135]/70">
                    <MapPin className="w-4 h-4 text-romantic-pink/50 animate-bounce" />
                    {activeMemory.location}
                  </span>

                  {/* Voice note play visualizer waveform */}
                  <div className="flex items-center gap-2">
                    <AnimatePresence>
                      {isPlayingLullaby && (
                        <motion.div
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 'auto', opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          className="overflow-hidden flex items-end gap-[3px] h-5 px-2"
                        >
                          {Array.from({ length: 12 }).map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{ height: [4, 18, 5, 16, 4][i % 5] }}
                              transition={{ repeat: Infinity, duration: 0.8 + (i * 0.08), ease: "easeInOut" }}
                              className="w-[3px] bg-romantic-pink rounded-full"
                            />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button 
                      onClick={triggerVoiceNote}
                      className="pill-badge hover:bg-romantic-pink/20 transition-colors cursor-pointer flex items-center gap-1.5 py-1 px-3 border border-romantic-pink/20 select-none"
                    >
                      <Volume2 className="w-3 h-3 text-romantic-pink" />
                      <span>{isPlayingLullaby ? 'stop note' : 'play note'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemoryTimeline;
