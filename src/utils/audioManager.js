// Procedural Audio Synthesizer & Howler integration for the romantic cinematic experience
import { Howl } from 'howler';
import { loveConfig } from '../config/loveConfig';

class AudioManager {
  constructor() {
    this.ctx = null;
    this.bgm = null;
    this.isPlayingSynthBgm = false;
    this.synthBgmInterval = null;
    this.isMuted = false;
    this.hasUnlockedAudio = false;
    
    // Ambient sound variables
    this.windSource = null;
    this.windFilter = null;
    this.windGain = null;
    this.windModulator = null;
    this.humOscs = [];
    this.humGain = null;
    
    // Heartbeat variables
    this.heartbeatTimer = null;
  }

  // Initialize Web Audio Context on first interaction
  init() {
    if (this.hasUnlockedAudio) return;
    
    // Create AudioContext
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
    }
    
    this.hasUnlockedAudio = true;
    
    // Start ambient celestial wind and space drone
    this.startAmbience();
    
    // Attempt to load and play mp3 BGM using Howler
    try {
      this.bgm = new Howl({
        src: [loveConfig.audio.bgmUrl],
        html5: true, // Use HTML5 audio to prevent CORS issues on larger files
        loop: true,
        volume: loveConfig.audio.bgmVolume,
        onloaderror: (id, error) => {
          console.warn("BGM load error, falling back to procedural synth:", error);
          this.startProceduralPianoBgm();
        },
        onplayerror: (id, error) => {
          console.warn("BGM play error, falling back to procedural synth:", error);
          this.startProceduralPianoBgm();
        }
      });
      
      this.bgm.play();
    } catch (e) {
      console.warn("Failed to initialize BGM Howl, starting synth fallback:", e);
      this.startProceduralPianoBgm();
    }
  }

  // Play a procedurally generated soft piano note
  playPianoNote(frequency, duration = 1.5, volume = 0.15) {
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Use a triangle wave for soft, flute-like/rhodes piano tone
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

    // Filter to remove sharp high frequencies, making it soft and ambient
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);

    // Soft envelope setup
    const now = this.ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    // Smooth attack
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.1);
    // Exponential decay and release
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  // Play soft chime bell note
  playBellTone(freq, duration = 1.0, vol = 0.1) {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Play a soft, beautiful arpeggiated music box lullaby for the memory timeline
  playTimelineLullaby() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    
    // Play sweet arpeggiated melody sweep: C5 - E5 - G5 - C6 - B5 - G5 - E5 - C5
    const notes = [523.25, 659.25, 783.99, 1046.50, 987.77, 783.99, 659.25, 523.25];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.isMuted) {
          this.playBellTone(freq, 2.0, loveConfig.audio.sfxVolume * 0.08);
        }
      }, idx * 220);
    });
  }

  // Synthesize an instant-camera mechanical click-clack shutter sound
  playCameraShutter() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    
    try {
      // 1. Shutter Mirror Flip Click (quick high oscillator burst)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(1800, now);
      osc1.frequency.exponentialRampToValueAtTime(300, now + 0.035);
      
      gain1.gain.setValueAtTime(loveConfig.audio.sfxVolume * 0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.035);
      
      // 2. Shutter Curtain Sweep (bandpass filtered noise burst)
      const bufferSize = this.ctx.sampleRate * 0.12; // 120ms sweep
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now + 0.02);
      filter.frequency.exponentialRampToValueAtTime(150, now + 0.12);
      filter.Q.setValueAtTime(3.5, now);
      
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(loveConfig.audio.sfxVolume * 0.28, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      noise.start(now + 0.02);
      noise.stop(now + 0.12);

      // 3. Mirror Reset Clack (low mechanical tone 100ms later)
      const clackTime = now + 0.09;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(180, clackTime);
      osc2.frequency.exponentialRampToValueAtTime(40, clackTime + 0.04);
      
      gain2.gain.setValueAtTime(loveConfig.audio.sfxVolume * 0.12, clackTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, clackTime + 0.04);
      
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(clackTime);
      osc2.stop(clackTime + 0.04);
    } catch (e) {
      console.warn("Failed to synthesize camera shutter SFX:", e);
    }
  }

  // Synthesize a soft countdown ticking chime
  playTickChime() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    
    try {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, now);
      
      gainNode.gain.setValueAtTime(loveConfig.audio.sfxVolume * 0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      
      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(now + 0.1);
    } catch (e) {
      console.warn("Failed to play tick chime:", e);
    }
  }

  // Synthesize a beautiful harmonic chime sweep when wish timer completes
  playCompletionChime() {
    if (!this.ctx || this.isMuted) return;
    
    try {
      [1046.50, 1318.51, 1567.98].forEach((freq, idx) => {
        setTimeout(() => {
          if (!this.isMuted && this.ctx) {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            
            gainNode.gain.setValueAtTime(loveConfig.audio.sfxVolume * 0.12, this.ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);
            
            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(this.ctx.currentTime + 1.2);
          }
        }, idx * 100);
      });
    } catch (e) {
      console.warn("Failed to play completion chime:", e);
    }
  }

  // Continuous Ambient Sound Loop (filtered noise and space drones)
  startAmbience() {
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    this.stopAmbience();

    try {
      // 1. Celestial Wind Ambience (filtered noise)
      const bufferSize = this.ctx.sampleRate * 2.0; // 2 seconds of noise loop
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      this.windSource = this.ctx.createBufferSource();
      this.windSource.buffer = buffer;
      this.windSource.loop = true;
      
      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = 'bandpass';
      this.windFilter.frequency.setValueAtTime(350, this.ctx.currentTime);
      this.windFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);
      
      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0.015, this.ctx.currentTime); // very low hum
      
      this.windSource.connect(this.windFilter);
      this.windFilter.connect(this.windGain);
      this.windGain.connect(this.ctx.destination);
      
      this.windSource.start();
      
      // Modulate wind frequency slowly to simulate gusts
      this.windModulator = setInterval(() => {
        if (this.windFilter && this.ctx && !this.isMuted) {
          const targetFreq = 180 + Math.random() * 400;
          this.windFilter.frequency.exponentialRampToValueAtTime(targetFreq, this.ctx.currentTime + 2.5);
        }
      }, 3000);

      // 2. Space Hum (subtle low sine drone chord: C2 + G2 + C3)
      this.humOscs = [];
      this.humGain = this.ctx.createGain();
      this.humGain.gain.setValueAtTime(0.025, this.ctx.currentTime);
      this.humGain.connect(this.ctx.destination);
      
      [65.41, 98.00, 130.81].forEach((freq) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.connect(this.humGain);
        osc.start();
        this.humOscs.push(osc);
      });
    } catch (e) {
      console.warn("Failed to start ambience synthesis:", e);
    }
  }

  stopAmbience() {
    if (this.windSource) {
      try { this.windSource.stop(); } catch(e){}
      this.windSource = null;
    }
    if (this.windModulator) {
      clearInterval(this.windModulator);
      this.windModulator = null;
    }
    if (this.humOscs && this.humOscs.length > 0) {
      this.humOscs.forEach(o => {
        try { o.stop(); } catch(e){}
      });
      this.humOscs = [];
    }
  }

  // Synthesize single heart pulse (lub-dub)
  playHeartbeat() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    
    try {
      // Lub (First beat)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, now);
      osc1.frequency.exponentialRampToValueAtTime(5, now + 0.15);
      gain1.gain.setValueAtTime(loveConfig.audio.sfxVolume * 0.45, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);
      
      // Dub (Second beat, ~150ms later)
      const dubTime = now + 0.13;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(50, dubTime);
      osc2.frequency.exponentialRampToValueAtTime(5, dubTime + 0.17);
      gain2.gain.setValueAtTime(loveConfig.audio.sfxVolume * 0.35, dubTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, dubTime + 0.17);
      
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(dubTime);
      osc2.stop(dubTime + 0.17);
    } catch (e) {
      console.warn("Failed to synthesize heartbeat:", e);
    }
  }

  // Start continuous heartbeat slowing down loop (ending sequence)
  startHeartbeatLoop(initialRate = 72, onSlowDownComplete) {
    this.stopHeartbeatLoop();
    if (!this.ctx || this.isMuted) return;

    let rate = initialRate;
    const playNext = () => {
      this.playHeartbeat();
      
      // Gradually decelerate heart rate
      if (rate > 28) {
        rate -= 2.0;
        const intervalMs = (60 / rate) * 1000;
        this.heartbeatTimer = setTimeout(playNext, intervalMs);
      } else {
        // Slow down finishes, fade to total silence
        if (onSlowDownComplete) onSlowDownComplete();
      }
    };
    
    playNext();
  }

  stopHeartbeatLoop() {
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Generates a soft, romantic procedural piano melody loop in the key of C Major / A Minor
  startProceduralPianoBgm() {
    if (this.isPlayingSynthBgm || this.isMuted) return;
    this.isPlayingSynthBgm = true;

    // Chords progression: Cmaj7 - Am9 - Fmaj7 - G6/G11
    const progressions = [
      [130.81, 164.81, 196.00, 246.94], // Cmaj7 (C3, E3, G3, B3)
      [110.00, 146.83, 174.61, 220.00], // Am9 (A2, D3, F3, A3)
      [87.31, 130.81, 174.61, 218.08],  // Fmaj7 (F2, C3, F3, A3)
      [98.00, 146.83, 196.00, 246.94]   // G6 (G2, D3, G3, B3)
    ];
    
    // Melody notes (pentatonic scale for always-harmonious sounds)
    const melodyNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // C4, D4, E4, G4, A4, C5, D5, E5
    
    let cycle = 0;
    
    const playMeasure = () => {
      if (!this.isPlayingSynthBgm || this.isMuted) return;
      
      const currentChord = progressions[cycle % progressions.length];
      
      // Play arpeggiated chord notes slowly
      currentChord.forEach((freq, idx) => {
        setTimeout(() => {
          this.playPianoNote(freq, 4.0, loveConfig.audio.bgmVolume * 0.4);
        }, idx * 600);
      });

      // Overlay a gentle random melody note every 1-2 seconds
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          if (Math.random() > 0.3) {
            const randomMelodyNote = melodyNotes[Math.floor(Math.random() * melodyNotes.length)];
            // Play melody note softer and higher
            this.playPianoNote(randomMelodyNote, 2.5, loveConfig.audio.bgmVolume * 0.25);
          }
        }, i * 1500 + Math.random() * 400);
      }

      cycle++;
    };

    // Trigger immediately
    playMeasure();
    // Run every 6 seconds per chord progression
    this.synthBgmInterval = setInterval(playMeasure, 6000);
  }

  stopProceduralPianoBgm() {
    if (this.synthBgmInterval) {
      clearInterval(this.synthBgmInterval);
      this.synthBgmInterval = null;
    }
    this.isPlayingSynthBgm = false;
  }

  // Synthesize Keypad Glass Click / Bell Highlights
  playClick() {
    if (!this.ctx || this.isMuted) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, this.ctx.currentTime); // A5
    osc1.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.12);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1760, this.ctx.currentTime); // Octave up
    osc2.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

    gainNode.gain.setValueAtTime(loveConfig.audio.sfxVolume * 0.12, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.12);
    osc2.stop(this.ctx.currentTime + 0.12);
  }

  // Synthesize Keypad Hover Glass Chimes
  playHoverTick() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1600, this.ctx.currentTime);
    gainNode.gain.setValueAtTime(loveConfig.audio.sfxVolume * 0.015, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  // Synthesize Error Buzzer (Soft red shake)
  playErrorBuzzer() {
    if (!this.ctx || this.isMuted) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    // Two detuned low saws for a soft ominous buzzer
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(110, this.ctx.currentTime);
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(111.5, this.ctx.currentTime);

    // Warm lowpass filter to make it gentle and romantic, not harsh
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, this.ctx.currentTime);

    gainNode.gain.setValueAtTime(loveConfig.audio.sfxVolume * 0.3, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.45);
    osc2.stop(this.ctx.currentTime + 0.45);
  }

  // Synthesize Success Portal Warp Swoosh
  playSuccessWarp() {
    if (!this.ctx || this.isMuted) return;
    
    // Trigger a celebratory major chord impact
    [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
      setTimeout(() => {
        this.playPianoNote(freq, 3.5, loveConfig.audio.sfxVolume * 0.3);
      }, i * 100);
    });

    // Create a sweeping bandpass space filter sweep (warp sound)
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const noiseGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 1.8);

    filter.type = 'bandpass';
    filter.Q.setValueAtTime(5, now);
    filter.frequency.setValueAtTime(100, now);
    filter.frequency.exponentialRampToValueAtTime(2500, now + 1.8);

    noiseGain.gain.setValueAtTime(loveConfig.audio.sfxVolume * 0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    osc.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 2.0);
  }

  // Synthesize Firework Explosion Sound
  playFirework() {
    if (!this.ctx || this.isMuted) return;
    
    const now = this.ctx.currentTime;
    
    // Sub-bass thud
    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(150, now);
    bassOsc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
    
    bassGain.gain.setValueAtTime(loveConfig.audio.sfxVolume * 0.4, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    bassOsc.connect(bassGain);
    bassGain.connect(this.ctx.destination);
    
    bassOsc.start(now);
    bassOsc.stop(now + 0.35);

    // Crackle noise (white-noise-like filter)
    const bufferSize = this.ctx.sampleRate * 0.5; // 0.5s duration
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1200, now);
    noiseFilter.Q.setValueAtTime(8, now);

    const noiseGain2 = this.ctx.createGain();
    noiseGain2.gain.setValueAtTime(loveConfig.audio.sfxVolume * 0.12, now + 0.05);
    noiseGain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain2);
    noiseGain2.connect(this.ctx.destination);

    noise.start(now + 0.05);
    noise.stop(now + 0.5);

    // Optional happy spark note
    const tones = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const randomTone = tones[Math.floor(Math.random() * tones.length)];
    setTimeout(() => {
      this.playPianoNote(randomTone, 1.2, loveConfig.audio.sfxVolume * 0.15);
    }, 50);
  }

  // Synthesize Envelope Paper unfolding crackle + magical wind chimes arpeggio
  playPaperRustle() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    
    // Create high-frequency noise bursts (rustling paper)
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3000, now);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(loveConfig.audio.sfxVolume * 0.06, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.3);

    // Layered magical wind chimes arpeggio (C major pentatonic bell sweep)
    const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBellTone(freq, 1.2, loveConfig.audio.sfxVolume * 0.08);
      }, idx * 60);
    });
  }

  // Synthesize soft wind/whoosh sound for blowing candles
  playBlowingCandles() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    
    // Create soft wind noise (bandpass filtered white noise sweeping down)
    const bufferSize = this.ctx.sampleRate * 0.8; // 0.8s blow
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.8);
    filter.Q.setValueAtTime(3, now);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(loveConfig.audio.sfxVolume * 0.25, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.8);
  }

  // Fade out music and ambient synth sounds slowly over duration
  fadeAudioOut(duration = 3.0) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Fade Howler BGM
    if (this.bgm && this.bgm.playing()) {
      this.bgm.fade(this.bgm.volume(), 0.0, duration * 1000);
    }
    
    // Fade hum gain
    if (this.humGain) {
      this.humGain.gain.linearRampToValueAtTime(0, now + duration);
    }

    // Fade wind gain
    if (this.windGain) {
      this.windGain.gain.linearRampToValueAtTime(0, now + duration);
    }
  }

  // Restore audio to normal volume levels
  restoreAudioVolumes(duration = 2.0) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    if (this.bgm) {
      this.bgm.fade(this.bgm.volume(), loveConfig.audio.bgmVolume, duration * 1000);
    }
    
    if (this.humGain) {
      this.humGain.gain.linearRampToValueAtTime(0.025, now + duration);
    }

    if (this.windGain) {
      this.windGain.gain.linearRampToValueAtTime(0.015, now + duration);
    }
  }

  setBgmVolume(volume, durationMs = 1000) {
    if (this.bgm) {
      this.bgm.fade(this.bgm.volume(), volume, durationMs);
    }
  }

  boostWind(volume = 0.05, duration = 3.0) {
    if (this.ctx && this.windGain && !this.isMuted) {
      const now = this.ctx.currentTime;
      this.windGain.gain.linearRampToValueAtTime(volume, now + duration);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      if (this.bgm) this.bgm.mute(true);
      this.stopProceduralPianoBgm();
      this.stopAmbience();
      this.stopHeartbeatLoop();
    } else {
      if (this.bgm) {
        this.bgm.mute(false);
        if (!this.bgm.playing()) this.bgm.play();
      } else {
        this.startProceduralPianoBgm();
      }
      this.startAmbience();
    }
    return this.isMuted;
  }
}

// Singleton audio manager
export const audioManager = new AudioManager();
export default audioManager;
