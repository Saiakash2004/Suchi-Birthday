import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MailOpen, X, Sparkles } from 'lucide-react';
import { loveConfig } from '../../config/loveConfig';
import audioManager from '../../utils/audioManager';

// Premium letter-by-letter fade in component that avoids layout shifts.
// Renders ALL characters (including spaces) as flat inline spans — no
// inline-block word wrappers, which were causing huge structural gaps.
const RenderedPartText = ({ part, revealedCount, hasCompletedReveal }) => {
  const chars = useMemo(() => {
    const result = [];
    const textChars = Array.from(part.text);
    textChars.forEach((char, i) => {
      result.push({ char, absIdx: part.startIndex + i });
    });
    return result;
  }, [part]);

  return (
    <>
      {chars.map((c) => {
        const isRevealed = hasCompletedReveal || revealedCount > c.absIdx;
        return (
          <motion.span
            key={c.absIdx}
            initial={{ opacity: 0 }}
            animate={isRevealed ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'inline' }}
          >
            {c.char}
          </motion.span>
        );
      })}
    </>
  );
};

export const LoveLetter = () => {
  // States: 'closed' | 'cracking' | 'folding' | 'sliding' | 'expanded'
  const [letterState, setLetterState] = useState('closed');

  // Compute parts and lengths of the love letter
  const letterParts = useMemo(() => {
    const partsList = [];
    let absoluteStartIndex = 0;

    const getCharLength = (str) => Array.from(str).length;

    // 1. Salutation
    const salutationText = loveConfig.loveLetter.salutation;
    const salutationLen = getCharLength(salutationText);
    partsList.push({
      id: 'salutation',
      type: 'salutation',
      text: salutationText,
      startIndex: absoluteStartIndex,
      endIndex: absoluteStartIndex + salutationLen
    });
    absoluteStartIndex += salutationLen;

    // 2. Paragraphs
    loveConfig.loveLetter.paragraphs.forEach((para, idx) => {
      const paraLen = getCharLength(para);
      partsList.push({
        id: `para-${idx}`,
        type: 'paragraph',
        text: para,
        startIndex: absoluteStartIndex,
        endIndex: absoluteStartIndex + paraLen
      });
      absoluteStartIndex += paraLen;
    });

    // 3. Closing
    const closingText = loveConfig.loveLetter.closing;
    const closingLen = getCharLength(closingText);
    partsList.push({
      id: 'closing',
      type: 'closing',
      text: closingText,
      startIndex: absoluteStartIndex,
      endIndex: absoluteStartIndex + closingLen
    });
    absoluteStartIndex += closingLen;

    // 4. Signature
    const signatureText = loveConfig.loveLetter.signature;
    const signatureLen = getCharLength(signatureText);
    partsList.push({
      id: 'signature',
      type: 'signature',
      text: signatureText,
      startIndex: absoluteStartIndex,
      endIndex: absoluteStartIndex + signatureLen
    });
    absoluteStartIndex += signatureLen;

    return {
      parts: partsList,
      totalLength: absoluteStartIndex
    };
  }, []);

  const flatCharacters = useMemo(() => {
    const chars = [];
    letterParts.parts.forEach(part => {
      const textArray = Array.from(part.text);
      textArray.forEach(c => {
        chars.push(c);
      });
    });
    return chars;
  }, [letterParts]);

  const [revealedCount, setRevealedCount] = useState(0);
  const [hasCompletedReveal, setHasCompletedReveal] = useState(false);

  const handleSealClick = () => {
    if (letterState !== 'closed') return;
    
    // Play glass click and paper rustle
    audioManager.playClick();
    audioManager.playPaperRustle();
    
    // Start step-by-step opening sequence
    setLetterState('cracking');

    // Step 2: Open top flap after seal crack
    setTimeout(() => {
      setLetterState('folding');
    }, 550);

    // Step 3: Slide paper out of envelope
    setTimeout(() => {
      setLetterState('sliding');
    }, 1100);

    // Step 4: Expand modal to read
    setTimeout(() => {
      setLetterState('expanded');
    }, 1800);
  };

  const handleClose = (e) => {
    if (e) e.stopPropagation();
    audioManager.playClick();
    audioManager.playPaperRustle();
    
    // Complete transition so they don't have to wait on next open
    setHasCompletedReveal(true);
    setRevealedCount(letterParts.totalLength);
    
    // Reverse state
    setLetterState('closed');
  };

  // Manage automatic continuous letter-by-letter reveal when letter is expanded
  useEffect(() => {
    if (letterState !== 'expanded') {
      // If we closed before typing finished, reset for next time unless completed
      if (!hasCompletedReveal) {
        setRevealedCount(0);
      }
      return;
    }

    if (hasCompletedReveal) {
      setRevealedCount(letterParts.totalLength);
      return;
    }

    let index = 0;
    let timer = null;

    const revealNext = () => {
      if (index < flatCharacters.length) {
        setRevealedCount(index + 1);
        
        const char = flatCharacters[index];
        index++;

        let delay = 22; // Base speed: 22ms per char
        if (char === '.' || char === '!' || char === '?') {
          delay = 320; // Pause at end of sentence
        } else if (char === ',') {
          delay = 140; // Pause at comma
        }

        timer = setTimeout(revealNext, delay);
      } else {
        setHasCompletedReveal(true);
      }
    };

    timer = setTimeout(revealNext, 100);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [letterState, hasCompletedReveal, flatCharacters, letterParts.totalLength]);

  const salutationPart = letterParts.parts.find(p => p.type === 'salutation');
  const paragraphParts = letterParts.parts.filter(p => p.type === 'paragraph');
  const closingPart = letterParts.parts.find(p => p.type === 'closing');
  const signaturePart = letterParts.parts.find(p => p.type === 'signature');

  return (
    <div className="w-full min-h-screen py-24 px-4 flex flex-col items-center justify-center relative select-none">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.0 }}
        className="text-center mb-20 z-10"
      >

        <h2 className="font-cinzel text-3xl md:text-5xl text-[#4a3135]/95 tracking-[0.06em] mt-2">
          a love <span className="gradient-text-animated font-semibold">letter</span>
        </h2>
        <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-romantic-pink/50 to-transparent mx-auto mt-5" />
      </motion.div>

      {/* 3D Interactive Envelope Scene */}
      <div className="relative z-10 flex items-center justify-center mt-4">
        <div className="relative w-80 h-56 md:w-[360px] md:h-[240px]" style={{ perspective: '1200px' }}>
          
          <motion.div
            className="relative w-full h-full transform-gpu"
            style={{ transformStyle: 'preserve-3d' }}
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* 1. Envelope Back Body (Cream pocket container) */}
            <div 
              className="absolute inset-0 rounded-[20px] bg-amber-50 shadow-md border border-amber-200/40"
              style={{ transform: 'translateZ(0px)' }}
            />

            {/* 2. Paper Sheet Peek/Slide out */}
            <motion.div
              animate={
                letterState === 'sliding' || letterState === 'expanded'
                  ? { y: -90, scale: 0.95, z: 2 }
                  : letterState === 'folding'
                  ? { y: -15, scale: 0.98, z: 2 }
                  : { y: 0, scale: 1, z: 2 }
              }
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute top-3 left-5 right-5 bottom-3 rounded-lg bg-[#fcf9f2] border border-amber-100 p-4 shadow-sm"
              style={{ transform: 'translateZ(1px)' }}
            >
              {/* Fake paragraph preview lines on the peaking paper */}
              <div className="flex flex-col gap-2 mt-2 opacity-35">
                <div className="h-1.5 bg-[#4a3135]/40 rounded-full w-[70%]" />
                <div className="h-1.5 bg-[#4a3135]/40 rounded-full w-[85%]" />
                <div className="h-1.5 bg-[#4a3135]/40 rounded-full w-[50%]" />
              </div>
            </motion.div>

            {/* 3. Fold Triangles (Left, Right, Bottom covers overlaying paper) */}
            {/* Left triangle */}
            <div 
              className="absolute inset-0 rounded-[20px] pointer-events-none"
              style={{ 
                clipPath: 'polygon(0 0, 0 100%, 50% 50%)', 
                background: '#fce7f3', 
                border: '1px solid rgba(244,114,182,0.1)',
                transform: 'translateZ(3px)' 
              }} 
            />
            {/* Right triangle */}
            <div 
              className="absolute inset-0 rounded-[20px] pointer-events-none"
              style={{ 
                clipPath: 'polygon(100% 0, 100% 100%, 50% 50%)', 
                background: '#fce7f3', 
                border: '1px solid rgba(244,114,182,0.1)',
                transform: 'translateZ(3px)' 
              }} 
            />
            {/* Bottom cover triangle */}
            <div 
              className="absolute inset-0 rounded-[20px] pointer-events-none"
              style={{ 
                clipPath: 'polygon(0 100%, 100% 100%, 50% 50%)', 
                background: '#fbcfe8',
                border: '1px solid rgba(244,114,182,0.15)',
                transform: 'translateZ(4px)' 
              }} 
            />

            {/* 4. Top Flap with 3D Rotate */}
            <motion.div
              animate={
                letterState !== 'closed' && letterState !== 'cracking'
                  ? { rotateX: 180, zIndex: 1 }
                  : { rotateX: 0, zIndex: 5 }
              }
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute top-0 left-0 right-0 h-1/2 rounded-t-[20px] origin-top border-b border-pink-200/20"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                background: 'linear-gradient(to bottom, #fbcfe8, #f472b6)',
                transformStyle: 'preserve-3d',
                transform: 'translateZ(5px)',
                backfaceVisibility: 'hidden',
              }}
            />

            {/* 5. Splitting Wax Seal (Only visible when closed/cracking) */}
            {letterState === 'closed' || letterState === 'cracking' ? (
              <div 
                onClick={handleSealClick}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center cursor-pointer z-40 active:scale-95 transition-transform"
                style={{ transform: 'translate3d(-50%, -50%, 6px)' }}
              >
                {/* Left Wax Half */}
                <motion.div
                  animate={letterState === 'cracking' ? { x: -24, rotate: -25, opacity: 0 } : { x: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute w-7 h-14 bg-gradient-to-br from-romantic-rose to-red-600 rounded-l-full border-y border-l border-red-400/40 shadow-md flex items-center justify-end pr-[2px] overflow-hidden"
                >
                  <span className="text-xl select-none translate-x-[9px]">🌹</span>
                </motion.div>

                {/* Right Wax Half */}
                <motion.div
                  animate={letterState === 'cracking' ? { x: 24, rotate: 25, opacity: 0 } : { x: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute w-7 h-14 bg-gradient-to-br from-romantic-rose to-red-600 rounded-r-full border-y border-r border-red-400/40 shadow-md flex items-center justify-start pl-[2px] overflow-hidden"
                >
                  <span className="text-xl select-none -translate-x-[9px]">🌹</span>
                </motion.div>
              </div>
            ) : null}

            {/* Tap instruction badge */}
            {letterState === 'closed' && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-35 flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-[#4a3135]/65 tracking-[0.2em] uppercase font-bold text-center animate-pulse">
                  tap seal to read 💌
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Cinematic Expanded Letter Focus View */}
      <AnimatePresence>
        {letterState === 'expanded' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4a3135]/40 backdrop-blur-xl cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.88, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.88, y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 140 }}
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={() => {
                setHasCompletedReveal(true);
                setRevealedCount(letterParts.totalLength);
              }}
              title="Double click to show full letter"
              data-lenis-prevent
              className="relative w-full max-w-2xl bg-gradient-to-b from-[#fefbf6] to-[#f7eee0] text-[#2c1d11] p-8 md:p-12 rounded-[28px] shadow-[0_30px_90px_rgba(74,49,53,0.3)] border border-amber-200/40 flex flex-col max-h-[85vh] overflow-y-auto cursor-default select-text"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-amber-100/70 hover:bg-romantic-rose/15 hover:text-romantic-rose border border-amber-200/50 flex items-center justify-center transition-all duration-200 text-amber-800 active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header Filigree */}
              <div className="flex items-center justify-center gap-3 mb-8 select-none">
                <div className="w-14 h-[0.5px] bg-gradient-to-r from-transparent to-amber-500/45" />
                <span className="text-xl">🌹</span>
                <MailOpen className="w-5 h-5 text-amber-600/70 animate-pulse" />
                <span className="text-xl">🌹</span>
                <div className="w-14 h-[0.5px] bg-gradient-to-l from-transparent to-amber-500/45" />
              </div>

              {/* Letter Text Body */}
              <div className="font-cursive text-xl md:text-2xl text-left leading-[2] tracking-normal flex-grow px-2">
                <p className="font-cinzel text-xs font-bold tracking-[0.2em] text-amber-800/80 not-italic mb-8 uppercase select-none text-left">
                  <RenderedPartText part={salutationPart} revealedCount={revealedCount} hasCompletedReveal={hasCompletedReveal} />
                </p>

                {/* Paragraphs displaying sequentially using word-wrapped letter reveals */}
                {paragraphParts.map((part) => (
                  <p key={part.id} className="mb-6 indent-8 text-amber-950/90 font-medium leading-relaxed tracking-normal text-left">
                    <RenderedPartText part={part} revealedCount={revealedCount} hasCompletedReveal={hasCompletedReveal} />
                  </p>
                ))}

                {/* Sign-off, displaying only after text typing reaches the end */}
                {(hasCompletedReveal || revealedCount > closingPart.startIndex) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.0 }}
                    className="mt-12 text-right pr-4 select-none"
                  >
                    <p className="text-xs font-cinzel text-amber-800/70 tracking-[0.15em] not-italic mb-2 uppercase text-right">
                      <RenderedPartText part={closingPart} revealedCount={revealedCount} hasCompletedReveal={hasCompletedReveal} />
                    </p>
                    <p className="text-2xl font-bold font-cursive text-romantic-rose tracking-normal text-right">
                      <RenderedPartText part={signaturePart} revealedCount={revealedCount} hasCompletedReveal={hasCompletedReveal} />
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={(hasCompletedReveal || revealedCount >= signaturePart.endIndex) ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        {" "}🌹
                      </motion.span>
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Red Wax Seal stamp visual at the bottom */}
              <div className="mt-10 flex justify-center select-none">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-romantic-rose to-red-600 shadow-[0_4px_18px_rgba(244,63,94,0.25)] border border-red-400/40 flex items-center justify-center text-xl">
                  🌹
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoveLetter;
