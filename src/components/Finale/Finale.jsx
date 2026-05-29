import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Heart } from 'lucide-react';
import { loveConfig } from '../../config/loveConfig';
import audioManager from '../../utils/audioManager';
const StarBurst = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center">
      {Array.from({ length: 15 }).map((_, idx) => {
        const angle = (idx / 15) * Math.PI * 2;
        const velocity = 50 + Math.random() * 60;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        return (
          <motion.div
            key={idx}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: vx,
              y: vy,
              opacity: 0,
              scale: 0.1
            }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute w-2.5 h-2.5 rounded-full bg-[#fbbf24] shadow-[0_0_10px_#fbbf24]"
            style={{ top: '50%', left: '50%', marginLeft: '-5px', marginTop: '-5px' }}
          />
        );
      })}
    </div>
  );
};


export const Finale = ({ isMuted, toggleMute, onRestart, candlesBlown, onBlowCandles, sceneState, setSceneState, ceremonyStep, setCeremonyStep }) => {
  const [countdown, setCountdown] = useState(5);
  const [wishInput, setWishInput] = useState('');
  const [submitStatus, setSubmitStatus] = useState('idle'); // 'idle' | 'sending' | 'success'

  // wishStage: 'celebration' | 'quote'
  const [wishStage, setWishStage] = useState('celebration');
  
  const [isExtinguishing, setIsExtinguishing] = useState(false);
  const [heartPulseScale, setHeartPulseScale] = useState(1);
  const heartTimerRef = useRef(null);

  const getMessengerAnimation = () => {
    const isLantern = ['transforming', 'flying'].includes(ceremonyStep);
    const messengerWidth = isLantern ? 176 : 256;
    const messengerHeight = isLantern ? 256 : 160;
    const currentMarginLeft = isLantern ? '-88px' : '-128px';
    const currentMarginTop = isLantern ? '-128px' : '-100px';

    if (ceremonyStep === 'flying') {
      // Calculate target coordinates to land exactly on the centered star (top: 8, left: 50%)
      // Since wrapper is top: 30%, left: 50%, with marginLeft: -88px, marginTop: -128px
      // Center of wrapper is at left: 50%, top: 30%
      // Center of star is at left: 50%, top: 52px (8 * 4px = 32px top margin + 20px half of height)
      const targetX = 0;
      const targetY = 52 - (window.innerHeight * 0.3);

      return {
        width: 176,
        height: 256,
        marginLeft: '-88px',
        marginTop: '-128px',
        x: [0, 15, -20, 8, targetX],
        y: [0, targetY * 0.2, targetY * 0.55, targetY * 0.8, targetY],
        scale: [1.06, 0.85, 0.65, 0.45, 0.22],
        rotate: [0, 6, -8, 4, 0],
        opacity: [1, 1, 1, 0.9, 0], // fades out completely as it merges into the star
      };
    }
    
    if (ceremonyStep === 'envelope') {
      return {
        width: messengerWidth,
        height: messengerHeight,
        marginLeft: currentMarginLeft,
        marginTop: currentMarginTop,
        x: 0,
        y: 0,
        scale: 1.06, // camera push-in zoom!
        rotate: 0,
        opacity: 1,
      };
    }

    if (ceremonyStep === 'transforming') {
      return {
        width: messengerWidth,
        height: messengerHeight,
        marginLeft: currentMarginLeft,
        marginTop: currentMarginTop,
        x: 0,
        y: 0,
        scale: 1.06, // keeps zoom
        rotate: 0,
        opacity: 1,
      };
    }

    return {
      width: messengerWidth,
      height: messengerHeight,
      marginLeft: currentMarginLeft,
      marginTop: currentMarginTop,
      x: 0,
      y: 0,
      scale: 1.0,
      rotate: 0,
      opacity: 1,
    };
  };

  const getMessengerTransition = () => {
    if (ceremonyStep === 'flying') {
      return {
        duration: 4.5,
        ease: "easeInOut",
        times: [0, 0.2, 0.5, 0.8, 1.0],
      };
    }
    if (ceremonyStep === 'transforming') {
      return {
        duration: 3.8,
        ease: "easeInOut",
      };
    }
    // folding / envelope
    return {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
    };
  };

  // Sprinkles decoration data for the cake
  const topSprinkles = [
    { left: '12%', top: '30%', color: 'bg-pink-400', rotate: '12deg', w: 'w-3.5 h-1' },
    { left: '25%', top: '55%', color: 'bg-amber-400', rotate: '-15deg', w: 'w-3 h-1' },
    { left: '42%', top: '35%', color: 'bg-purple-400', rotate: '40deg', w: 'w-4 h-1.5' },
    { left: '60%', top: '50%', color: 'bg-cyan-400', rotate: '-25deg', w: 'w-3.5 h-1' },
    { left: '76%', top: '30%', color: 'bg-rose-400', rotate: '20deg', w: 'w-4 h-1' },
    { left: '88%', top: '45%', color: 'bg-amber-400', rotate: '-8deg', w: 'w-3 h-1.5' },
  ];

  const bottomSprinkles = [
    { left: '8%', top: '25%', color: 'bg-purple-400', rotate: '-12deg', w: 'w-4 h-1' },
    { left: '22%', top: '50%', color: 'bg-amber-400', rotate: '30deg', w: 'w-3.5 h-1.5' },
    { left: '38%', top: '30%', color: 'bg-cyan-400', rotate: '-20deg', w: 'w-4 h-1' },
    { left: '50%', top: '55%', color: 'bg-pink-400', rotate: '15deg', w: 'w-4.5 h-1.5' },
    { left: '66%', top: '25%', color: 'bg-rose-300', rotate: '35deg', w: 'w-3.5 h-1' },
    { left: '78%', top: '48%', color: 'bg-purple-400', rotate: '-18deg', w: 'w-4 h-1' },
    { left: '92%', top: '20%', color: 'bg-amber-400', rotate: '45deg', w: 'w-3 h-1.5' },
  ];

  // Reset states on restart
  useEffect(() => {
    if (sceneState === 'intro' || sceneState === 'main') {
      setCeremonyStep('invite');
      setCountdown(5);
      setWishInput('');
      setSubmitStatus('idle');
      setWishStage('celebration');
      setIsExtinguishing(false);
    }
  }, [sceneState]);

  // Stage 2: Countdown Ritual ticking
  useEffect(() => {
    if (sceneState !== 'finale-candles') return;
    if (ceremonyStep !== 'countdown') return;

    setCountdown(5);
    audioManager.playTickChime(); // first chime at 5

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) {
          audioManager.playTickChime();
          return prev - 1;
        } else {
          clearInterval(interval);
          audioManager.playCompletionChime(); // chime at 0
          
          setTimeout(() => {
            setCeremonyStep('entry');
          }, 1200);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sceneState, ceremonyStep]);

  // After candles are blown, handle celebration text timeouts
  useEffect(() => {
    if (!candlesBlown) return;
    if (sceneState !== 'finale') return;

    // Transition from happy birthday to final quote after 7.5 seconds of the fireworks show
    const timer = setTimeout(() => {
      setWishStage('quote');
    }, 7500);

    return () => clearTimeout(timer);
  }, [sceneState, candlesBlown]);

  // Trigger Ending Sequence (Slow Black Fade)
  useEffect(() => {
    if (wishStage !== 'quote' || sceneState !== 'finale') return;

    // Show the final quote for 9 seconds, then begin the slow fade out into stars
    const timer = setTimeout(() => {
      setSceneState('ending-fade');
      
      // Stop fireworks, slowly fade out ambient layers over 4.5s
      audioManager.fadeAudioOut(4.5);
      
      // Start heartbeat pulse sync loop
      let bpm = 70;
      const pulseHeart = () => {
        setHeartPulseScale(1.15);
        setTimeout(() => setHeartPulseScale(1), 160);
        
        if (bpm > 28) {
          bpm -= 2.2;
          const delay = (60 / bpm) * 1000;
          heartTimerRef.current = setTimeout(pulseHeart, delay);
        }
      };

      audioManager.startHeartbeatLoop(70, () => {
        setSceneState('black');
      });
      
      pulseHeart();

    }, 9000);

    return () => {
      clearTimeout(timer);
      if (heartTimerRef.current) clearTimeout(heartTimerRef.current);
    };
  }, [wishStage, sceneState, setSceneState]);

  // Stage 4: submit wish silently and progress the step chain
  const handleSealWish = () => {
    setSubmitStatus('sending');
    audioManager.playClick();

    const proceedToFolding = () => {
      setSubmitStatus('success');
      setTimeout(() => {
        setCeremonyStep('folding');
        
        // At T = 1.2s of folding, transition to envelope (seal wax stamp, music fades softer, zoom in)
        setTimeout(() => {
          setCeremonyStep('envelope');
          audioManager.playCompletionChime(); // wax stamp sound
          audioManager.setBgmVolume(loveConfig.audio.bgmVolume * 0.3, 1500); // Music becomes softer
          
          // At T = 3.2s (2.0s of envelope display), transition to transforming (envelope -> lantern morph)
          setTimeout(() => {
            setCeremonyStep('transforming');
            audioManager.playPaperRustle(); // soft paper sound for unfolding
            
            // At T = 7.0s (3.8s of transformation), transition to flying (ascension)
            setTimeout(() => {
              setCeremonyStep('flying');
              audioManager.boostWind(0.045, 4000); // ambient wind sounds increase
              
              // At T = 11.5s (4.5s of flying), transition to accepted (star birth)
              setTimeout(() => {
                setCeremonyStep('accepted');
                
                // At T = 14.5s (3.0s of acceptance display), transition to candles
                setTimeout(() => {
                  setCeremonyStep('candles');
                  audioManager.restoreAudioVolumes(2500); // Music swells back in
                }, 3000);
                
              }, 4500);
              
            }, 3800);
            
          }, 2000);
          
        }, 1200);
        
      }, 1500); // Show "Wish Sealed ✨" status for 1.5s
    };

    if (wishInput.trim()) {
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: loveConfig.web3formsKey,
          subject: '🌟 Suchi made a birthday wish!',
          from_name: 'Suchi\'s Birthday Universe',
          message: `✨ Wish: "${wishInput}"`,
        }),
      })
      .then(proceedToFolding)
      .catch(proceedToFolding);
    } else {
      proceedToFolding();
    }
  };

  const handleBlow = () => {
    if (ceremonyStep !== 'blow-prompt') return; // lockout blow until ready
    if (isExtinguishing || candlesBlown) return;
    setIsExtinguishing(true);
    setCeremonyStep('extinguished');
    audioManager.playBlowingCandles();
    
    // Play blowing action and trigger timelines in App.jsx
    setTimeout(() => {
      onBlowCandles();
    }, 700);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center relative select-none overflow-hidden px-4">
      {/* Ambient floating sparkle dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 25 }).map((_, idx) => (
          <div
            key={idx}
            className="absolute rounded-full float-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: 2 + Math.random() * 3,
              height: 2 + Math.random() * 3,
              background: ['#ec4899', '#fbbf24', '#a855f7', '#67e8f9'][Math.floor(Math.random() * 4)],
              boxShadow: `0 0 8px ${['#ec4899', '#fbbf24', '#a855f7', '#67e8f9'][Math.floor(Math.random() * 4)]}`,
              '--tx': `${(Math.random() - 0.5) * 60}px`,
              '--ty': `${-(20 + Math.random() * 50)}px`,
              '--duration': `${3 + Math.random() * 6}s`,
              '--delay': `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Dissolving wish text overlay */}
      <AnimatePresence>
        {isExtinguishing && wishInput.trim() && (
          <motion.div
            initial={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            animate={{ opacity: 0, y: -150, scale: 0.6, filter: 'blur(10px)' }}
            transition={{ duration: 2.0, ease: 'easeOut' }}
            className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none flex flex-col items-center"
          >
            <span className="font-cursive text-3xl md:text-4xl text-rose-350 font-semibold drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]">
              "{wishInput}"
            </span>
            <span className="text-[10px] text-pink-200 font-semibold uppercase tracking-[0.25em] mt-2.5 animate-pulse">
              rising to the stars... ✨
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ Centered Wish Star ══ */}
      <AnimatePresence>
        {['accepted', 'candles', 'blow-prompt', 'extinguished'].includes(ceremonyStep) && (
          <motion.div
            key="wish-star"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.8, 1.2], 
              opacity: 1,
              filter: ['drop-shadow(0 0 5px #fbbf24)', 'drop-shadow(0 0 20px #fbbf24)', 'drop-shadow(0 0 10px #fbbf24)']
            }}
            transition={{ duration: 1.5, type: "spring", damping: 12 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 text-[#fbbf24] text-4xl animate-pulse cursor-default flex items-center justify-center"
            style={{ width: '40px', height: '40px' }}
          >
            ⭐
            {ceremonyStep === 'accepted' && <StarBurst />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ Wish Messenger (Envelope-to-Lantern Morphing & Ascension) ══ */}
      <AnimatePresence>
        {['folding', 'envelope', 'transforming', 'flying'].includes(ceremonyStep) && (
          <motion.div
            key="wish-messenger"
            initial={{ 
              scale: 0.8, 
              opacity: 0, 
              x: 0, 
              y: 0, 
              rotate: 0,
              marginLeft: '-128px',
              marginTop: '-100px'
            }}
            animate={getMessengerAnimation()}
            exit={{ opacity: 0, scale: 0.6, filter: 'blur(12px)', transition: { duration: 0.6, ease: "easeIn" } }}
            transition={getMessengerTransition()}
            className="absolute z-50 pointer-events-none flex items-center justify-center"
            style={{
              top: '30%',
              left: '50%',
            }}
          >
            {/* The actual floating container with localized wind bobbing */}
            <div className={`relative flex items-center justify-center transition-all duration-[3000ms] ${
              ['transforming', 'flying'].includes(ceremonyStep) 
                ? 'lantern-bob-sway w-44 h-64 rounded-[40px_40px_12px_12px] lantern-pulse-glow bg-gradient-to-b from-[#fffef2] via-[#fffdf0]/90 to-[#fffce0]/75 border border-amber-200/35' 
                : 'w-64 h-40 bg-[#fffef9] border border-amber-200/20 rounded-b-xl shadow-xl'
            }`}
              style={{
                boxShadow: ['transforming', 'flying'].includes(ceremonyStep) 
                  ? undefined // handled by CSS lantern-pulse-glow
                  : '0 20px 45px rgba(217, 119, 6, 0.08)',
              }}
            >
              {/* Watercolor texture overlays */}
              {['transforming', 'flying'].includes(ceremonyStep) ? (
                // Sky Lantern watercolor paper texture overlay
                <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-multiply rounded-[40px_40px_12px_12px]" 
                     style={{ backgroundImage: 'radial-gradient(circle, #f59e0b 0%, transparent 90%)' }} />
              ) : (
                // Envelope inner borders
                <div className="absolute inset-0 border border-amber-200/10 rounded-b-xl pointer-events-none" />
              )}

              {/* Wish Letter Sheet content inside */}
              <motion.span
                animate={{
                  opacity: ['transforming', 'flying'].includes(ceremonyStep) ? 0.14 : 0.45,
                  scale: ['transforming', 'flying'].includes(ceremonyStep) ? 0.85 : 1.0,
                  y: ['transforming', 'flying'].includes(ceremonyStep) ? -20 : 0
                }}
                transition={{ duration: 2.0 }}
                className="font-cursive text-[#4a3135] text-sm text-center italic mt-4 max-w-[150px] break-words select-none pointer-events-none"
              >
                "{(wishInput.trim() ? wishInput.slice(0, 35) + (wishInput.length > 35 ? '...' : '') : 'A silent wish')}"
              </motion.span>

              {/* Envelope Flaps (drawn only when not transforming into lantern) */}
              {!['transforming', 'flying'].includes(ceremonyStep) && (
                <>
                  {/* Left Flap */}
                  <div 
                    className="absolute left-0 bottom-0 w-32 h-40 bg-[#fff6e6]/80 border-l border-amber-200/10"
                    style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)', zIndex: 6 }}
                  />
                  
                  {/* Right Flap */}
                  <div 
                    className="absolute right-0 bottom-0 w-32 h-40 bg-[#fff6e6]/80 border-r border-amber-200/10"
                    style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 50%)', zIndex: 6 }}
                  />
                  
                  {/* Bottom Flap */}
                  <div 
                    className="absolute left-0 bottom-0 w-64 h-20 bg-[#fffdf0]/90 border-b border-amber-200/20"
                    style={{ clipPath: 'polygon(0 100%, 100% 100%, 50% 0%)', zIndex: 7 }}
                  />
                  
                  {/* Top Flap rotating down */}
                  <motion.div
                    initial={{ rotateX: 0 }}
                    animate={{ rotateX: ceremonyStep === 'envelope' ? 180 : 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut", delay: 0.2 }}
                    className="absolute top-0 left-0 w-64 h-20 bg-[#fff5df] origin-top preserve-3d"
                    style={{
                      clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                      zIndex: 10,
                      backfaceVisibility: 'hidden',
                    }}
                  />

                  {/* Wax Seal Stamp (appears on 'envelope' step) */}
                  {ceremonyStep === 'envelope' && (
                    <motion.div
                      className="absolute bottom-[24px] left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 border border-amber-300 flex items-center justify-center shadow-lg z-25 text-white font-bold text-xs wax-seal-stamp"
                    >
                      ❤️
                    </motion.div>
                  )}
                </>
              )}

              {/* Lantern Features (Fades in when transforming) */}
              {['transforming', 'flying'].includes(ceremonyStep) && (
                <>
                  {/* Bottom Bamboo Frame */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="absolute bottom-0 left-0 right-0 h-2 bg-[#4a2e1b] rounded-b-md border-t border-[#654321]/30 z-10"
                  />

                  {/* Candle Flame (ignites and flickers) */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, delay: 1.0 }}
                    className="absolute bottom-3 left-1/2 w-6 h-10 rounded-full bg-gradient-to-t from-red-600 via-amber-400 to-yellow-100 z-10 lantern-flame"
                  />
                  
                  {/* Flame Bloom Aura */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.35, 0.5, 0.4, 0.55, 0.35] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-12 h-16 rounded-full bg-amber-400/25 blur-md pointer-events-none"
                  />
                </>
              )}
            </div>

            {/* Sparkle/Stardust Trail behind the flying lantern */}
            {ceremonyStep === 'flying' && (
              <div className="absolute top-[90%] left-1/2 -translate-x-1/2 overflow-visible w-1 h-1 pointer-events-none">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 0.9, 0],
                      scale: [0, 1.4, 0],
                      x: [0, 10 + (Math.random() - 0.3) * 45],
                      y: [0, 20 + Math.random() * 55]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.0,
                      delay: i * 0.08
                    }}
                    className="absolute text-romantic-gold w-2.5 h-2.5"
                    style={{ left: 0, top: 0 }}
                  >
                    <Sparkles className="w-full h-full fill-current" />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ Wish Ceremony Cards Overlay Layer ══ */}
      <AnimatePresence mode="wait">
        {['invite', 'countdown', 'entry', 'accepted', 'candles'].includes(ceremonyStep) && (
          <motion.div
            key={ceremonyStep}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, filter: 'blur(8px)', y: -10 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-[28%] md:top-[22%] z-40 w-full max-w-md px-4 flex flex-col items-center justify-center"
          >
            {/* Invite Step */}
            {ceremonyStep === 'invite' && (
              <div className="glass-panel-heavy rounded-[28px] p-8 text-center shadow-2xl border border-pink-100/50 flex flex-col items-center">
                <span className="text-xs uppercase tracking-[0.2em] text-[#5c4044]/60 font-semibold mb-2">
                  Before we celebrate...
                </span>
                <h3 className="font-cinzel text-3xl text-[#4a3135] tracking-[0.06em] font-bold mb-4">
                  Make a wish ✨
                </h3>
                <p className="text-sm text-[#5c4044]/80 leading-relaxed mb-8 max-w-xs">
                  Some wishes deserve to travel among the stars.
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    audioManager.playClick();
                    setCeremonyStep('countdown');
                  }}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-romantic-pink to-romantic-rose text-white text-xs tracking-[0.2em] font-bold uppercase transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Begin ✨
                </motion.button>
              </div>
            )}

            {/* Countdown Step */}
            {ceremonyStep === 'countdown' && (
              <div className="glass-panel rounded-[28px] p-10 text-center shadow-2xl flex flex-col items-center min-h-[220px] justify-center">
                <h3 className="font-cinzel text-lg uppercase tracking-[0.15em] text-[#5c4044]/70 font-bold mb-6">
                  Make a wish ✨
                </h3>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={countdown}
                    initial={{ scale: 0.6, opacity: 0, filter: 'blur(4px)' }}
                    animate={{ scale: [1, 1.25, 1], opacity: 1, filter: 'blur(0px)' }}
                    exit={{ scale: 1.3, opacity: 0, filter: 'blur(6px)' }}
                    transition={{ duration: 0.8 }}
                    className="font-cinzel text-7xl font-bold text-romantic-pink neon-text-pink h-20"
                  >
                    {countdown > 0 ? countdown : '✨'}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* Wish Input Step (Warm Ivory Watercolor Letter Sheet) */}
            {(ceremonyStep === 'entry' || ceremonyStep === 'sending') && (
              <div
                className="w-full max-w-sm p-8 rounded-[24px] shadow-2xl border border-amber-100 flex flex-col items-center bg-gradient-to-b from-[#fffef6] to-[#fffcf0] relative overflow-hidden text-center"
                style={{
                  boxShadow: '0 20px 45px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(217, 119, 6, 0.05)',
                }}
              >
                {/* Watercolor subtle warm gradient background texture wash */}
                <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply" 
                     style={{ backgroundImage: 'radial-gradient(circle, #f59e0b 0%, transparent 80%)' }} />
                
                <h3 className="font-cinzel text-xl text-[#4a3135] tracking-[0.06em] font-bold mb-4 relative z-10 leading-snug">
                  Seal your wish
                  <br />
                  <span className="text-amber-600 font-semibold">among the stars ✨</span>
                </h3>
                
                <div className="w-full mb-6 relative z-10">
                  <textarea
                    rows={4}
                    value={wishInput}
                    onChange={(e) => setWishInput(e.target.value)}
                    placeholder="Write your wish here..."
                    maxLength={100}
                    disabled={submitStatus !== 'idle'}
                    className="w-full px-5 py-4 text-base bg-[#fffaf0]/60 border border-amber-200/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-[#4a3135] font-cursive italic shadow-inner placeholder-[#5c4044]/45 resize-none leading-relaxed"
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={submitStatus === 'idle' ? handleSealWish : undefined}
                  disabled={submitStatus !== 'idle'}
                  className={`w-full py-4 rounded-full text-white text-xs tracking-[0.15em] font-bold uppercase transition-all shadow-md cursor-pointer z-10 ${
                    submitStatus === 'sending'
                      ? 'bg-amber-400/80 cursor-wait'
                      : submitStatus === 'success'
                      ? 'bg-emerald-500 shadow-[0_4px_15px_rgba(16,185,129,0.25)]'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
                  }`}
                >
                  {submitStatus === 'sending'
                    ? 'Sending Your Wish...'
                    : submitStatus === 'success'
                    ? 'Wish Sealed ✨'
                    : 'Seal My Wish ✨'}
                </motion.button>
              </div>
            )}

            {/* Accepted Star Step */}
            {ceremonyStep === 'accepted' && (
              <div className="text-center bg-black/35 backdrop-blur-md rounded-2xl py-6 px-8 border border-white/10 shadow-2xl">
                <p className="font-cinzel text-xl md:text-2xl text-amber-50 tracking-[0.1em] font-semibold text-shadow-md leading-relaxed">
                  Your wish now belongs
                  <br />
                  to the universe ✨
                </p>
              </div>
            )}

            {/* Blow Candle Ceremony Card */}
            {ceremonyStep === 'candles' && (
              <div className="glass-panel-heavy rounded-[28px] p-8 text-center shadow-2xl border border-pink-100/50 flex flex-col items-center bg-white/95">
                <span className="text-xs uppercase tracking-[0.2em] text-[#5c4044]/60 font-semibold mb-2">
                  One last thing...
                </span>
                <h3 className="font-cinzel text-2xl text-[#4a3135] tracking-[0.06em] font-bold mb-6">
                  Blow out the candles 🌬️
                </h3>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    audioManager.playClick();
                    setCeremonyStep('blow-prompt');
                  }}
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-romantic-pink to-romantic-rose text-white text-xs tracking-[0.15em] font-bold uppercase transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  I'm Ready
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {sceneState === 'finale-candles' || sceneState === 'candles-extinguished' ? (
          /* 🎂 Birthday Cake Screen */
          <motion.div
            key="candles-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20, filter: 'blur(12px)' }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center max-w-2xl w-full z-10 relative"
          >
            {/* Cake card wrapper (fades out slightly on blow, blurred during ceremony steps) */}
            <div 
              onClick={ceremonyStep === 'blow-prompt' ? handleBlow : undefined}
              className={`relative w-[340px] h-[220px] sm:w-[460px] sm:h-[290px] md:w-[600px] md:h-[360px] mx-auto mt-6 mb-8 flex flex-col justify-end items-center transition-all duration-1000 ${
                isExtinguishing ? 'opacity-85' : ''
              } ${ceremonyStep === 'blow-prompt' ? 'cursor-pointer hover:scale-[1.01]' : 'pointer-events-none'} ${
                (ceremonyStep !== 'blow-prompt' && ceremonyStep !== 'extinguished') ? 'filter blur-[4px] opacity-40' : 'filter blur-0 opacity-100'
              }`}
            >
              {/* Cherries */}
              <div className="absolute top-[32px] sm:top-[28px] md:top-[24px] left-[15%] sm:left-[18%] flex flex-col items-center pointer-events-none z-20">
                <div className="w-2 sm:w-2.5 h-6 sm:h-8 border-l-2 border-emerald-500 rounded-bl-full rotate-[15deg] origin-top-left" />
                <div className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 bg-gradient-to-tr from-red-600 via-rose-500 to-rose-400 rounded-full shadow-md relative mt-[-2px]">
                  <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-80" />
                </div>
              </div>

              <div className="absolute top-[32px] sm:top-[28px] md:top-[24px] right-[15%] sm:right-[18%] flex flex-col items-center pointer-events-none z-20">
                <div className="w-2 sm:w-2.5 h-6 sm:h-8 border-r-2 border-emerald-500 rounded-br-full rotate-[-15deg] origin-top-right" />
                <div className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 bg-gradient-to-tr from-red-600 via-rose-500 to-rose-400 rounded-full shadow-md relative mt-[-2px]">
                  <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-80" />
                </div>
              </div>

              {/* Candles */}
              <div className="flex gap-10 sm:gap-14 md:gap-18 mb-[-4px] z-10">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="flex flex-col items-center relative">
                    <div 
                      className="w-4 sm:w-5 md:w-6 h-16 sm:h-20 md:h-24 rounded-t-sm shadow-sm relative"
                      style={{
                        background: num % 2 === 0
                          ? 'repeating-linear-gradient(45deg, #f472b6, #f472b6 6px, #fffdfb 6px, #fffdfb 12px)'
                          : 'repeating-linear-gradient(-45deg, #f59e0b, #f59e0b 6px, #fffdfb 6px, #fffdfb 12px)',
                        border: '1px solid rgba(244,114,182,0.2)'
                      }}
                    >
                      {/* Flame */}
                      {!isExtinguishing ? (
                        <motion.div
                          animate={{
                            scale: [1, 1.15, 0.9, 1.1, 1],
                            y: [0, -1, 1, -2, 0],
                            rotate: [-2, 2, -1, 3, -1]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.4 + Math.random() * 0.3,
                            ease: "easeInOut"
                          }}
                          className="w-5 sm:w-6 md:w-8 h-8 sm:h-10 md:h-12 bg-gradient-to-t from-orange-400 via-yellow-300 to-white rounded-full blur-[0.5px] shadow-[0_0_24px_rgba(251,191,36,0.95)] origin-bottom absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5"
                        />
                      ) : (
                        /* Splitting smoke trail */
                        <motion.div
                          initial={{ scale: 0.2, opacity: 0.8, y: 0 }}
                          animate={{ scale: 2.2, opacity: 0, y: -45 }}
                          transition={{ duration: 0.6 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-400/40 rounded-full blur-xs"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cake layers */}
              <div className="w-[260px] sm:w-[360px] md:w-[440px] h-16 sm:h-20 md:h-24 bg-amber-50 border-b border-pink-100 rounded-t-3xl relative shadow-md">
                <div className="absolute top-0 left-0 right-0 flex justify-around px-4 translate-y-[-50%] z-0">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 bg-white rounded-full shadow-sm border border-pink-100/40 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-pink-200 rounded-full" />
                    </div>
                  ))}
                </div>

                {topSprinkles.map((sprinkle, idx) => (
                  <div
                    key={idx}
                    className={`absolute ${sprinkle.w} ${sprinkle.color} rounded-full opacity-85 pointer-events-none`}
                    style={{
                      left: sprinkle.left,
                      top: sprinkle.top,
                      transform: `rotate(${sprinkle.rotate})`,
                    }}
                  />
                ))}

                <div className="absolute bottom-0 left-0 right-0 h-4 flex justify-around overflow-hidden">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="w-8 sm:w-10 md:w-12 h-6 bg-romantic-pink rounded-b-full mt-[-2px] opacity-90 flex-shrink-0" />
                  ))}
                </div>
              </div>

              <div className="w-[300px] sm:w-[420px] md:w-[520px] h-20 sm:h-24 md:h-28 bg-[#faf3e3] border-b border-pink-100 relative shadow-md">
                {bottomSprinkles.map((sprinkle, idx) => (
                  <div
                    key={idx}
                    className={`absolute ${sprinkle.w} ${sprinkle.color} rounded-full opacity-85 pointer-events-none`}
                    style={{
                      left: sprinkle.left,
                      top: sprinkle.top,
                      transform: `rotate(${sprinkle.rotate})`,
                    }}
                  />
                ))}

                <div className="absolute bottom-0 left-0 right-0 h-4 flex justify-around overflow-hidden">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="w-9 sm:w-11 md:w-13 h-6 bg-romantic-pink rounded-b-full mt-[-2px] opacity-90 flex-shrink-0" />
                  ))}
                </div>
              </div>

              <div className="w-[340px] sm:w-[460px] md:w-[600px] h-5 sm:h-6 bg-slate-200/80 rounded-full shadow-lg relative z-10" />
              <div className="w-[160px] sm:w-[220px] md:w-[300px] h-5 sm:h-7 bg-gradient-to-b from-slate-100 to-slate-200 rounded-b-2xl border-t border-slate-300/40 shadow-md z-0" />
            </div>

            {/* Blow Prompt Button (only when step is blow-prompt) */}
            <AnimatePresence>
              {ceremonyStep === 'blow-prompt' && !candlesBlown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="mt-2"
                >
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBlow}
                    className="px-8 py-4 rounded-full bg-gradient-to-r from-romantic-pink to-romantic-rose text-white text-xs tracking-[0.15em] font-bold uppercase transition-all shadow-[0_5px_20px_rgba(236,72,153,0.3)] hover:shadow-[0_5px_25px_rgba(236,72,153,0.4)] active:scale-95 cursor-pointer animate-pulse"
                  >
                    Blow Out! 🌬️
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : ['single-gold', 'second-gold', 'finale'].includes(sceneState) && wishStage === 'celebration' ? (
          /* 🎉 Main Climax & Celebration reveal */
          <motion.div
            key="climax"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20, filter: 'blur(12px)' }}
            transition={{ duration: 1.5 }}
            className="flex flex-col items-center text-center max-w-3xl z-10"
          >
            {sceneState === 'finale' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                className="mb-6 animate-pulse"
              >
                <span className="pill-badge">
                  <Sparkles className="w-3 h-3 text-romantic-pink" />
                  the universe celebrates you
                </span>
              </motion.div>
            )}
            
            <div className="relative flex items-center justify-center py-6 px-4">
              <motion.h1
                initial={{ scale: 0.9, opacity: 0, filter: 'blur(12px)' }}
                animate={{ scale: 1, opacity: 0.95, filter: 'blur(0px)' }}
                transition={{ duration: 1.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="font-cinzel text-4xl sm:text-5xl md:text-7xl tracking-[0.06em] leading-tight font-bold text-amber-50 neon-text-gold"
              >
                Happy
                <br />
                Birthday
                <br />
                <span className="gradient-text-animated text-3xl sm:text-4xl md:text-5xl">
                  {loveConfig.recipientName} ❤️
                </span>
              </motion.h1>
            </div>

            {sceneState === 'finale' && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.8 }}
                transition={{ duration: 1.0, delay: 1.8 }}
                className="mt-10 text-sm md:text-base text-rose-100/70 font-medium tracking-wide max-w-lg leading-relaxed px-4 text-shadow-sm"
              >
                look up at the stars. every lantern, firework, and rose petal falling tonight is a wish for your happiness. 🌸
              </motion.p>
            )}
          </motion.div>
        ) : sceneState === 'finale' && wishStage === 'quote' ? (
          /* ✨ Climax Ending Quote Slide */
          <motion.div
            key="ending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(12px)' }}
            transition={{ duration: 2.5 }}
            className="flex flex-col items-center text-center max-w-2xl z-10"
          >
            <motion.p
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 3.0, ease: [0.16, 1, 0.3, 1] }}
              className="font-cursive text-3xl sm:text-4xl md:text-5xl text-pink-100 neon-text-pink font-semibold tracking-wide leading-relaxed italic"
            >
              "In every universe…
              <br />
              <span className="gradient-text-animated">I would still choose you.</span>"
            </motion.p>

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 1.08, 1], opacity: 0.85 }}
              transition={{
                scale: { repeat: Infinity, duration: 1.6, ease: "easeInOut" },
                opacity: { duration: 1.5, delay: 2.0 }
              }}
              className="mt-14 mb-8"
            >
              <div className="w-14 h-14 rounded-full bg-romantic-pink/15 border border-romantic-pink/35 flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.45)]">
                <span className="text-2xl animate-pulse">🌹</span>
              </div>
            </motion.div>
          </motion.div>
        ) : sceneState === 'ending-fade' ? (
          /* 💖 Slow-fade Pulsating Heart Visualizer */
          <motion.div
            key="heartbeat-fade"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.0 }}
            className="flex flex-col items-center text-center justify-center z-10"
          >
            <motion.div
              style={{ scale: heartPulseScale }}
              className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center"
            >
              <div className="absolute inset-[-15px] rounded-full border border-romantic-pink/15 animate-ping opacity-60" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-romantic-pink/25 to-romantic-gold/10 blur-[8px]" />
              
              <Heart className="w-16 h-16 md:w-20 md:h-20 text-romantic-pink fill-romantic-pink filter drop-shadow-[0_0_24px_rgba(236,72,153,0.5)]" />
            </motion.div>
            
            <p className="mt-8 text-xs font-cinzel text-pink-200/40 tracking-[0.25em] uppercase font-light">
              chosen forever
            </p>
          </motion.div>
        ) : sceneState === 'black' ? (
          /* 🌑 Complete Cinematic Fade to Black with Restart */
          <motion.div
            key="total-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 3.0 }}
            className="fixed inset-0 bg-[#070506] z-[99] flex flex-col items-center justify-center text-center px-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              whileHover={{ opacity: 0.8 }}
              transition={{ delay: 3.5, duration: 2.0 }}
              className="flex flex-col items-center gap-4 cursor-pointer"
              onClick={onRestart}
            >
              <RefreshCw className="w-5 h-5 text-white/50 animate-spin-slow" />
              <span className="text-[10px] text-white/40 tracking-[0.2em] uppercase font-light">
                tap to relive the journey
              </span>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Finale;
