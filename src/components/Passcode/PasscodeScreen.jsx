import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lock, Unlock, Delete, Heart } from 'lucide-react';
import { loveConfig } from '../../config/loveConfig';
import audioManager from '../../utils/audioManager';

// Floating ambient particles for the passcode background
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 3 + Math.random() * 4,
    duration: 5 + Math.random() * 8,
    delay: Math.random() * 5,
    tx: (Math.random() - 0.5) * 80,
    ty: -(30 + Math.random() * 60),
    color: ['#ec4899', '#fbbf24', '#f43f5e', '#ff85a2'][Math.floor(Math.random() * 4)]
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full float-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 1.5}px ${p.color}`,
            opacity: 0.6,
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

export const PasscodeScreen = ({ sceneState, setSceneState, setUnlocked }) => {
  const [code, setCode] = useState('');
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [keypadDisabled, setKeypadDisabled] = useState(false);
  const [lastPressedKey, setLastPressedKey] = useState(null);

  const handleInteractionStart = () => {
    audioManager.init();
  };

  const handleKeyPress = useCallback((num) => {
    handleInteractionStart();
    if (keypadDisabled) return;
    if (code.length >= 8) return;

    audioManager.playClick();
    setLastPressedKey(num);
    setTimeout(() => setLastPressedKey(null), 150);

    const newCode = code + num;
    setCode(newCode);

    if (newCode.length === 8) {
      validatePasscode(newCode);
    }
  }, [code, keypadDisabled]);

  const handleDelete = useCallback(() => {
    handleInteractionStart();
    if (keypadDisabled) return;
    if (code.length === 0) return;

    audioManager.playClick();
    setCode(code.slice(0, -1));
  }, [code, keypadDisabled]);

  const handleClear = useCallback(() => {
    handleInteractionStart();
    if (keypadDisabled) return;
    audioManager.playClick();
    setCode('');
  }, [keypadDisabled]);

  const validatePasscode = (inputCode) => {
    const isValid = Array.isArray(loveConfig.passcodes)
      ? loveConfig.passcodes.includes(inputCode)
      : inputCode === loveConfig.passcode;

    if (isValid) {
      setKeypadDisabled(true);
      setSuccessMessage('✨ unlocking our universe ✨');
      audioManager.playSuccessWarp();

      setSceneState('dissolving');

      setTimeout(() => {
        setSceneState('heart');
        setSuccessMessage('💖 loading precious memories...');
      }, 5000);

      setTimeout(() => {
        setUnlocked(true);
        setSceneState('main');
      }, 8000);

    } else {
      setIsError(true);
      setKeypadDisabled(true);
      setErrorMessage("hmm… that doesn't feel right 🥺");
      audioManager.playErrorBuzzer();

      setTimeout(() => {
        setIsError(false);
        setCode('');
        setErrorMessage('');
        setKeypadDisabled(false);
      }, 1200);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (keypadDisabled) return;

      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, handleDelete, handleClear, keypadDisabled]);

  // Date format hint labels
  const slotLabels = ['D', 'D', 'M', 'M', 'Y', 'Y', 'Y', 'Y'];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-transparent select-none"
      onClick={handleInteractionStart}
    >
      <FloatingParticles />

      <AnimatePresence mode="wait">
        {sceneState === 'intro' && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(12px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-sm mx-4"
          >
            {/* ══ Main Card ══ */}
            <div className={`
              glass-genz rounded-[28px] px-6 py-8 md:px-8 md:py-10
              transition-all duration-300
              ${isError ? 'animate-shake' : ''}
            `}
              style={{
                boxShadow: isError
                  ? '0 15px 40px rgba(244,63,94,0.15), 0 10px 30px rgba(74,49,53,0.08)'
                  : '0 15px 40px rgba(236,72,153,0.12), 0 10px 30px rgba(74,49,53,0.05)'
              }}
            >
              {/* ── Top Pill Badge ── */}
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="pill-badge"
                >
                  <Sparkles className="w-3 h-3" />
                  private universe
                </motion.div>
              </div>

              {/* ── Lock Icon with Animated Ring ── */}
              <div className="flex justify-center mb-5">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="relative"
                >
                  {/* Outer glow ring */}
                  <div className="absolute inset-[-8px] rounded-full border border-romantic-pink/20 animate-pulse" />
                  <div className="absolute inset-[-16px] rounded-full border border-romantic-pink/10" />

                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-romantic-pink/15 to-romantic-gold/10 border border-romantic-pink/20 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-romantic-pink" />
                  </div>
                </motion.div>
              </div>

              {/* ── Title Typography ── */}
              <div className="text-center mb-1">
                <h1 className="font-cinzel text-[17px] md:text-xl text-[#4a3135]/95 tracking-[0.08em] leading-relaxed font-medium">
                  only one person can unlock
                </h1>
                <h1 className="font-cinzel text-[17px] md:text-xl gradient-text-animated tracking-[0.08em] leading-relaxed font-semibold">
                  this universe
                </h1>
              </div>

              <p className="text-center text-[11px] text-[#4a3135]/60 tracking-[0.15em] uppercase font-semibold mt-2 mb-6">
                enter your special date ✨
              </p>

              {/* ── DDMMYYYY Code Slots ── */}
              <div className="flex justify-center gap-[6px] mb-2">
                {Array.from({ length: 8 }).map((_, idx) => {
                  const char = code[idx];
                  const isActive = idx === code.length;
                  const isFilled = !!char;
                  // Separator visual between DD | MM | YYYY
                  const showSeparator = idx === 2 || idx === 4;

                  return (
                    <React.Fragment key={idx}>
                      {showSeparator && (
                        <div className="flex items-center px-[2px]">
                          <span className="text-[#4a3135]/25 text-lg font-extralight">/</span>
                        </div>
                      )}
                      <motion.div
                        animate={isFilled ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.15 }}
                        className={`
                          w-9 h-11 md:w-10 md:h-12 rounded-xl flex flex-col items-center justify-center
                          transition-all duration-200 relative overflow-hidden
                          ${isFilled
                            ? 'bg-gradient-to-b from-romantic-pink/10 to-romantic-gold/5 border border-romantic-pink/40 shadow-[0_4px_12px_rgba(236,72,153,0.12)]'
                            : isActive
                              ? 'bg-white/90 border border-romantic-pink/30 shadow-[0_4px_12px_rgba(236,72,153,0.08)]'
                              : 'bg-white/40 border border-[#4a3135]/15'
                          }
                        `}
                      >
                        {isFilled ? (
                          <span className="text-base font-semibold text-[#4a3135] font-mono tracking-wider">
                            {char}
                          </span>
                        ) : (
                          <span className={`text-[9px] tracking-wider font-semibold ${isActive ? 'text-[#4a3135]/60' : 'text-[#4a3135]/25'}`}>
                            {slotLabels[idx]}
                          </span>
                        )}

                        {/* Active blinking cursor line */}
                        {isActive && !isFilled && (
                          <motion.div
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="absolute bottom-2 w-4 h-[1.5px] bg-romantic-pink/60 rounded-full"
                          />
                        )}
                      </motion.div>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* ── Error Message ── */}
              <div className="h-7 flex items-center justify-center mb-1">
                <AnimatePresence>
                  {errorMessage && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[11px] text-rose-600 font-semibold tracking-wider animate-pulse"
                    >
                      {errorMessage}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Gen Z Keypad Grid ── */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <motion.button
                    key={num}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleKeyPress(num.toString())}
                    onMouseEnter={() => audioManager.playHoverTick()}
                    className={`
                      key-btn h-[52px] rounded-2xl
                      bg-white/40 hover:bg-white/80
                      border border-romantic-pink/15 hover:border-romantic-pink/30
                      flex items-center justify-center
                      text-[17px] font-light text-[#4a3135]/80 hover:text-[#4a3135]
                      transition-all duration-200 holo-shimmer
                      ${lastPressedKey === num.toString() ? 'bg-romantic-pink/15 border-romantic-pink/30 text-[#4a3135] font-semibold' : ''}
                    `}
                  >
                    {num}
                  </motion.button>
                ))}

                {/* Clear */}
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleClear}
                  onMouseEnter={() => audioManager.playHoverTick()}
                  className="key-btn h-[52px] rounded-2xl bg-white/40 hover:bg-red-50 border border-red-200/40 hover:border-red-300/50 flex items-center justify-center text-[10px] font-medium text-red-600/70 hover:text-red-600 tracking-[0.15em] uppercase transition-all duration-200"
                >
                  clear
                </motion.button>

                {/* Zero */}
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleKeyPress('0')}
                  onMouseEnter={() => audioManager.playHoverTick()}
                  className={`
                    key-btn h-[52px] rounded-2xl
                    bg-white/40 hover:bg-white/80
                    border border-romantic-pink/15 hover:border-romantic-pink/30
                    flex items-center justify-center
                    text-[17px] font-light text-[#4a3135]/80 hover:text-[#4a3135]
                    transition-all duration-200 holo-shimmer
                    ${lastPressedKey === '0' ? 'bg-romantic-pink/15 border-romantic-pink/30 text-[#4a3135] font-semibold' : ''}
                  `}
                >
                  0
                </motion.button>

                {/* Delete */}
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleDelete}
                  onMouseEnter={() => audioManager.playHoverTick()}
                  className="key-btn h-[52px] rounded-2xl bg-white/40 hover:bg-white/80 border border-[#4a3135]/15 hover:border-[#4a3135]/35 flex items-center justify-center text-[#4a3135]/50 hover:text-[#4a3135]/80 transition-all duration-200"
                >
                  <Delete className="w-[18px] h-[18px]" />
                </motion.button>
              </div>

              {/* ── Bottom Hint ── */}
              <p className="text-center text-[9px] text-[#4a3135]/40 tracking-[0.2em] uppercase mt-5 font-semibold">
                hint: her birthday · dd/mm/yyyy
              </p>
            </div>
          </motion.div>
        )}

        {/* ══ Transition Cinematic Loading Screen ══ */}
        {(sceneState === 'dissolving' || sceneState === 'heart' || sceneState === 'warp') && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(15px)' }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 flex flex-col items-center justify-center text-center px-6 z-50 bg-[#070506]/40 backdrop-blur-md"
          >
            {/* Pulsating glowing heart spinner */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                filter: ['drop-shadow(0 0 10px rgba(236,72,153,0.3))', 'drop-shadow(0 0 25px rgba(236,72,153,0.6))', 'drop-shadow(0 0 10px rgba(236,72,153,0.3))']
              }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="mb-8"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-romantic-pink/20 to-romantic-gold/15 border border-romantic-pink/30 flex items-center justify-center shadow-lg">
                <Heart className="w-9 h-9 text-romantic-pink fill-romantic-pink" />
              </div>
            </motion.div>

            {/* Loading text with step updates */}
            <motion.h2
              key={successMessage}
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 0.95, y: 0 }}
              exit={{ scale: 1.05, opacity: 0, y: -10 }}
              transition={{ duration: 0.85, ease: "easeInOut" }}
              className="font-cinzel text-lg md:text-2xl font-bold tracking-[0.12em] text-white leading-relaxed mb-6 h-8"
            >
              {successMessage}
            </motion.h2>

            {/* Elegant glassmorphic progress bar container */}
            <div className="w-64 h-2 bg-white/10 border border-white/5 rounded-full overflow-hidden p-[2px] shadow-inner">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 7.0, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-romantic-pink via-pink-400 to-romantic-gold rounded-full"
              />
            </div>

            {/* Mini status indicator */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.0 }}
              className="text-[9px] text-white/50 tracking-[0.2em] uppercase font-light mt-4"
            >
              initializing systems...
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PasscodeScreen;
