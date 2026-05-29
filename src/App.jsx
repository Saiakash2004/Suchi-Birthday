import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { loveConfig } from './config/loveConfig';
import audioManager from './utils/audioManager';
import UniverseCanvas from './components/Galaxy/UniverseCanvas';
import PasscodeScreen from './components/Passcode/PasscodeScreen';
import MemoryTimeline from './components/Timeline/MemoryTimeline';
import ReasonsSection from './components/Reasons/ReasonsSection';
import LoveLetter from './components/LoveLetter/LoveLetter';
import Finale from './components/Finale/Finale';
import { FloatingHearts } from './components/Valentine/FloralDecorations';
import Lenis from 'lenis';

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [sceneState, setSceneState] = useState('intro');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [ceremonyStep, setCeremonyStep] = useState('invite');
  
  const mouseCoords = useRef({ x: 0, y: 0 });
  const cursorX = useSpring(0, { damping: 25, stiffness: 400 });
  const cursorY = useSpring(0, { damping: 25, stiffness: 400 });
  const cursorScale = useSpring(1, { damping: 20, stiffness: 300 });

  const scrollContainerRef = useRef(null);
  const lenisRef = useRef(null);

  // Custom Cursor follow with hover scale
  useEffect(() => {
    const moveCursor = (e) => {
      mouseCoords.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseCoords.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target.closest('button, a, [role="button"], .cursor-pointer');
      if (target) {
        cursorScale.set(2.5);
      } else {
        cursorScale.set(1);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY, cursorScale]);

  // Initialize Lenis smooth scroll once passcode is unlocked
  const candlesBlownRef = useRef(false);
  useEffect(() => {
    candlesBlownRef.current = candlesBlown;
  }, [candlesBlown]);

  useEffect(() => {
    if (!unlocked) return;

    const initTimer = setTimeout(() => {
      const lenis = new Lenis({
        duration: 2.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.75,
      });

      lenisRef.current = lenis;

      const handleScroll = () => {
        if (window.scrollY === 0) return;

        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.max(0, Math.min(1, window.scrollY / (scrollHeight || 1)));
        setScrollProgress(progress);

        // State controller lockouts for ending sequences — never override during blow-out timeline
        const isCurrentlyLocked = document.body.classList.contains('ending-locked');
        if (isCurrentlyLocked) return;

        if (progress > 0.94) {
          setSceneState(candlesBlownRef.current ? 'finale' : 'finale-candles');
        } else {
          setSceneState('main');
        }
      };

      lenis.on('scroll', handleScroll);

      const raf = (time) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      
      requestAnimationFrame(raf);
    }, 100);

    return () => {
      clearTimeout(initTimer);
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, [unlocked]);

  // Catch sceneState ending lockouts
  useEffect(() => {
    const lockoutStates = ['candles-extinguished', 'single-gold', 'second-gold', 'finale', 'ending-fade', 'black'];
    if (lockoutStates.includes(sceneState)) {
      document.body.classList.add('ending-locked');
      if (lenisRef.current) {
        lenisRef.current.stop();
      }
    } else {
      document.body.classList.remove('ending-locked');
      if (lenisRef.current) {
        lenisRef.current.start();
      }
    }
  }, [sceneState]);


  const handleRestart = () => {
    audioManager.playClick();
    
    document.body.classList.remove('ending-locked');
    if (lenisRef.current) {
      lenisRef.current.start();
      lenisRef.current.scrollTo(0, { immediate: true });
    }
    
    setUnlocked(false);
    setScrollProgress(0);
    setCandlesBlown(false);
    setSceneState('intro');
    setCeremonyStep('invite');
  };

  const handleToggleMute = (e) => {
    if (e) e.stopPropagation();
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
  };

  // Determine full-screen background overlay lighting color transitions
  const getBackdropStyle = () => {
    if (!unlocked) {
      return {
        background: 'radial-gradient(circle, rgba(38,20,23,0.85) 0%, rgba(20,11,13,0.96) 100%)',
        transition: 'background 2.0s ease-in-out',
      };
    }
    
    if (sceneState === 'black') {
      return {
        background: '#070506',
        transition: 'background 3.0s ease-in-out',
      };
    }

    if (['candles-extinguished', 'single-gold', 'second-gold', 'finale', 'ending-fade'].includes(sceneState)) {
      return {
        background: '#070506',
        transition: 'background 2.5s ease-in-out',
      };
    }

    // Interactive scroll-progress maps for chapters
    if (scrollProgress < 0.16) {
      return {
        background: 'rgba(255,251,249, 0.4)',
        transition: 'background 1.5s ease-in-out',
      };
    } else if (scrollProgress >= 0.16 && scrollProgress < 0.40) {
      return {
        background: 'radial-gradient(circle, rgba(254,245,247, 0.4) 0%, rgba(253,230,236, 0.58) 100%)',
        transition: 'background 1.5s ease-in-out',
      };
    } else if (scrollProgress >= 0.40 && scrollProgress < 0.65) {
      return {
        background: 'radial-gradient(circle, rgba(255,251,245, 0.35) 0%, rgba(254,232,224, 0.52) 100%)',
        transition: 'background 1.5s ease-in-out',
      };
    } else if (scrollProgress >= 0.65 && scrollProgress < 0.88) {
      return {
        background: 'radial-gradient(circle, rgba(254,250,238, 0.4) 0%, rgba(252,235,202, 0.62) 100%)',
        transition: 'background 1.5s ease-in-out',
      };
    } else {
      return {
        background: 'radial-gradient(circle, rgba(255,247,249, 0.25) 0%, rgba(254,220,232, 0.5) 100%)',
        transition: 'background 1.5s ease-in-out',
      };
    }
  };

  return (
    <div className={`relative min-h-screen select-none ${['candles-extinguished','single-gold','second-gold','finale','ending-fade','black'].includes(sceneState) ? '' : 'watercolor-bg-fixed'} ${unlocked ? 'custom-cursor-enabled' : ''}`}
      style={['candles-extinguished','single-gold','second-gold','finale','ending-fade','black'].includes(sceneState) ? { backgroundColor: '#070506', transition: 'background-color 2.5s ease-in-out' } : {}}
    >
      
      {/* 3D WebGL Canvas Layer */}
      <UniverseCanvas 
        sceneState={sceneState} 
        scrollProgress={scrollProgress} 
        mouseCoords={mouseCoords}
        ceremonyStep={ceremonyStep}
      />

      {/* Dynamic Background Light Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none transition-all duration-[2500ms] z-[1]" 
        style={getBackdropStyle()} 
      />

      {/* Floating Hearts — only after unlock */}
      {unlocked && !['ending-fade', 'black', 'candles-extinguished', 'single-gold', 'second-gold'].includes(sceneState) && (
        <FloatingHearts count={12} />
      )}

      {/* Custom Mouse Follower Rings */}
      {unlocked && sceneState !== 'black' && (
        <>
          <motion.div
            style={{ 
              x: cursorX, 
              y: cursorY,
              scale: cursorScale,
              translateX: '-50%',
              translateY: '-50%',
            }}
            className="fixed w-2.5 h-2.5 bg-romantic-pink rounded-full pointer-events-none z-[9999] hidden lg:block"
          />
          <motion.div
            style={{ 
              x: cursorX, 
              y: cursorY,
              scale: cursorScale,
              translateX: '-50%',
              translateY: '-50%',
            }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="fixed w-8 h-8 border border-romantic-pink/45 rounded-full pointer-events-none z-[9998] hidden lg:block"
          />
        </>
      )}

      {/* Sound HUD button */}
      {sceneState !== 'intro' && sceneState !== 'black' && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleToggleMute}
          className="fixed top-6 right-6 z-40 w-10 h-10 rounded-full glass-genz flex items-center justify-center transition-all duration-300 text-[#4a3135]/70 hover:text-romantic-pink"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </motion.button>
      )}

      {/* Passcode Entry Screen */}
      <AnimatePresence>
        {!unlocked && (
          <PasscodeScreen 
            sceneState={sceneState} 
            setSceneState={setSceneState} 
            setUnlocked={setUnlocked} 
          />
        )}
      </AnimatePresence>

      {/* Main Chapters Content */}
      {unlocked && (
        <div ref={scrollContainerRef} className="relative z-10 w-full flex flex-col">
          
          {/* ═══ Section 1: Opening Typewriter Story ═══ */}
          <section className="min-h-screen w-full flex flex-col items-center justify-center px-6 relative">
            <div className="max-w-2xl text-center z-10">
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.8 }}
                className="font-cinzel text-2xl md:text-4xl lg:text-5xl leading-relaxed text-[#4a3135]/90 tracking-[0.06em] font-light"
              >
                {loveConfig.storyLines[0]}
              </motion.h2>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 2.0 }}
                className="font-cinzel text-2xl md:text-4xl lg:text-5xl leading-relaxed gradient-text-animated tracking-[0.06em] mt-3 font-semibold"
              >
                {loveConfig.storyLines[1]}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.0, delay: 3.5 }}
                className="mt-8 flex flex-col items-center gap-2"
              >
                <span className="text-[10px] text-[#4a3135]/50 tracking-[0.25em] uppercase font-light font-semibold">
                  scroll to explore
                </span>
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                >
                  <ChevronDown className="w-4 h-4 text-[#4a3135]/40" />
                </motion.div>
              </motion.div>
            </div>
            
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 section-divider" />
          </section>

          {/* ═══ Section 2: Memory Timeline Polaroids ═══ */}
          <section className="relative w-full">
            <MemoryTimeline />
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 section-divider" />
          </section>

          {/* ═══ Section 3: Reasons I Love You Cards ═══ */}
          <section className="relative w-full">
            <ReasonsSection />
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 section-divider" />
          </section>

          {/* ═══ Section 4: Interactive Foldable Envelope Letter ═══ */}
          <section className="relative w-full">
            <LoveLetter />
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 section-divider" />
          </section>

          {/* ═══ Section 5: Celebration Finale Climax ═══ */}
          <section className="relative w-full">
            <Finale 
              isMuted={isMuted} 
              toggleMute={handleToggleMute} 
              onRestart={handleRestart} 
              candlesBlown={candlesBlown}
              sceneState={sceneState}
              setSceneState={setSceneState}
              ceremonyStep={ceremonyStep}
              setCeremonyStep={setCeremonyStep}
              onBlowCandles={() => {
                console.log('[BLOW] onBlowCandles fired');
                setCandlesBlown(true);
                // Stage 1: Extinguish BGM and candles immediately
                setSceneState('candles-extinguished');
                audioManager.fadeAudioOut(0.4);
                
                // Stage 2: 1.5s silent pause -> T = 1.5s: launch first single gold firework rocket
                setTimeout(() => {
                  console.log('[BLOW] → single-gold');
                  setSceneState('single-gold');
                }, 1500);

                // T = 3.0s: launch second rocket
                setTimeout(() => {
                  console.log('[BLOW] → second-gold');
                  setSceneState('second-gold');
                }, 3000);

                // T = 4.0s: lanterns rise, full celebration state
                setTimeout(() => {
                  console.log('[BLOW] → finale');
                  setSceneState('finale');
                }, 4000);

                // T = 5.0s: music swells back in
                setTimeout(() => {
                  audioManager.restoreAudioVolumes(2.5);
                }, 5000);
              }}
            />
          </section>

        </div>
      )}
    </div>
  );
}
