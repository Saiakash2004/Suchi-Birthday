# 🌸 Suchi's Birthday Universe

> A premium, cinematic, interactive digital art installation — an Apple-level storytelling website built with love.

Designed as a slow, emotionally magical experience that feels handcrafted. Built with React 19, Vite, Tailwind CSS v4, Three.js (React Three Fiber), Framer Motion, and a custom Web Audio synthesizer.

---

## Table of Contents

- [Design Philosophy](#-design-philosophy)
- [Complete User Flow](#-complete-user-flow)
  - [Stage 1 — Passcode Lock Screen](#-stage-1--passcode-lock-screen)
  - [Stage 2 — The Discovery (Opening)](#-stage-2--the-discovery-opening)
  - [Stage 3 — Nostalgia (Memory Timeline)](#-stage-3--nostalgia-memory-timeline)
  - [Stage 4 — Devotion (Reasons I Love You)](#-stage-4--devotion-reasons-i-love-you)
  - [Stage 5 — Deepest Feelings (Love Letter)](#-stage-5--deepest-feelings-love-letter)
  - [Stage 6 — The Birthday Wish & Celebration](#-stage-6--the-birthday-wish--celebration)
  - [Stage 7 — Cinematic Ending](#-stage-7--cinematic-ending)
- [Technology Stack](#️-technology-stack)
- [Project Structure](#-project-structure)
- [Configuration & Customization](#️-configuration--customization)
- [Local Development](#-local-development)
- [Deployment](#-deployment)
- [Technical Deep-Dives](#-technical-deep-dives)
- [License](#-license)

---

## 🎨 Design Philosophy

| Principle | Implementation |
|-----------|---------------|
| **Watercolor Warmth** | Fixed hand-painted watercolor backdrop (`public/images/watercolor_bg.png`) behind the entire scrollable interface |
| **Iridescent Glassmorphism** | Translucent white panels with glowing pink drop shadows and animated gradient borders (`glass-genz`) |
| **Cinematic Pacing** | Scroll-linked gradient transitions, timed reveals, and slow-fade emotional beats |
| **Premium Typography** | Cinzel serif headings, Great Vibes cursive, Outfit body — warm berry/charcoal tones (`#4a3135`) |
| **3D Depth Layering** | Transparent Three.js canvas blending nebula shaders, starfields, bokeh, and fireworks over the watercolor |
| **No Overstimulation** | Rose gold, pink, gold, warm white palette only — no neon, no clutter, no cheap effects |

---

## 🚀 Complete User Flow

### 🔒 Stage 1 — Passcode Lock Screen

**Component:** `src/components/Passcode/PasscodeScreen.jsx`

```
User sees → Dark screen with Gen Z-styled passcode slots (DD/MM/YYYY format)
         → Enters passcode: 30052005 or 30052026
         → Wrong digit → card shakes + failure SFX
         → Correct → particles morph into 3D beating heart → camera flies through → unlocks
```

- Custom keypad with hover glow tracking (`--mx`, `--my` CSS variables)
- 8-slot input with individual digit validation
- Three.js particle cloud morphs from random grid → parametric heart equation
- Camera warp-speed animation transitions into the main experience

---

### 📖 Stage 2 — The Discovery (Opening)

**Component:** `src/App.jsx` (Section 1)

```
User sees → "Among billions of stars..."
         → "somehow, I found you."
         → Scroll indicator arrow bouncing below
```

- Staggered Framer Motion fade-in with blur transitions
- Animated gradient text effect on the second line
- Scroll progress begins tracking via Lenis smooth scroll

---

### 🌸 Stage 3 — Nostalgia (Memory Timeline)

**Component:** `src/components/Timeline/MemoryTimeline.jsx`

```
User sees → Floating Polaroid cards scattered across the screen
         → Hovering tilts the card in 3D (mouse-coordinate spring physics)
         → Clicking opens a cinematic focus modal with the full memory
```

**Features:**
- **Polaroid Design** — Thick white borders, realistic instant-film proportions, handwritten cursive captions
- **3D Mouse Tilt** — `perspective(800px) rotateX/Y` transforms driven by cursor position
- **Focus Modal** — Heavy background blur, dust particle overlay, cinematic photo presentation
- **Audio Waveform Visualizer** — Synthesized C-major pentatonic music-box arpeggio with bouncing waveform bars
- **SVG Wire Paths** — Catenary curves with Bezier interpolation for clothespin hanging effect
- **Proximity Fairy Lights** — Warm tungsten lights along wires that brighten on cursor proximity

---

### 🌹 Stage 4 — Devotion (Reasons I Love You)

**Component:** `src/components/Reasons/ReasonsSection.jsx`

```
User sees → Responsive grid of glassmorphic cards
         → Each card shows an icon + short reason
         → Clicking flips the card → reveals the full heartfelt message
```

- Click SFX + card flip animation
- Animated heartbeat indicator on expanded cards
- Six customizable reasons with emoji icons

---

### 💌 Stage 5 — Deepest Feelings (Love Letter)

**Component:** `src/components/LoveLetter/LoveLetter.jsx`

```
User sees → A realistic 3D envelope with a red wax seal
         → Clicking the seal → seal splits → flap folds open → letter slides out
         → Text appears character by character (typewriter effect)
```

**Features:**
- **3D Envelope Fold** — CSS `perspective` + `rotateX` transforms for realistic paper folding
- **Wax Seal Split** — Left/right halves rotate outward with spring physics
- **Paced Typewriter** — Characters fade in sequentially with natural pauses at commas and periods
- **Emotional Pacing** — Reading speed tuned for a slow, relaxed emotional experience

---

### 🎂 Stage 6 — The Birthday Wish & Celebration

**Component:** `src/components/Finale/Finale.jsx`

This is the climax — a multi-phase interactive sequence:

#### Phase 1: Make a Wish ✨

```
User sees → Beautiful CSS birthday cake with animated flickering candle flames
         → "Make a wish ✨" heading
         → Text input: "Type your silent wish here..."
         → "Seal Wish ✨" button
```

- The wish input is optional (user can leave it empty)
- **Silent Wish Delivery**: When "Seal Wish" is clicked, the wish is silently sent to the creator's email via [Web3Forms](https://web3forms.com) — the user sees nothing, no loading, no redirect
- Configured via `web3formsKey` in `loveConfig.js`

#### Phase 2: Countdown Timer (6 seconds)

```
User sees → Ticking countdown: 6... 5... 4... 3... 2... 1... ✨
         → Soft chime plays on each tick
         → Completion chime sweeps at 0
```

- Animated number transitions with scale + opacity spring effects
- Synthesized bell/chime ticks via Web Audio API

#### Phase 3: Blow Candles Popup

```
User sees → Glassmorphic modal card scales into view
         → "Blow candles! 🌬️"
         → Shows their sealed wish in quotes (if entered)
         → Pulsing "Blow Out! 🌬️" button
```

- Glassmorphic card with backdrop blur, spring entrance animation
- The user's typed wish displayed back to them one final time

#### Phase 4: The Blow-Out & Dark Transition

```
User clicks "Blow Out" →
  T+0.0s: Flames extinguish → smoke rises → BGM fades out
  T+0.0s: Screen background fades from watercolor cream → solid black void (#070506)
  T+0.0s: Typed wish text floats upward, dissolving into the stars
  T+1.5s: 🔇 Complete silence — only drifting smoke in darkness
```

- Watercolor background class removed dynamically
- Background-color transition: `2.5s ease-in-out`
- Wish dissolution animation: `scale(0.6)`, `y: -150`, `blur(10px)`, `opacity: 0`

#### Phase 5: Firework Rockets in the Dark Void

```
  T+1.5s: 🚀 Single gold rocket launches from bottom → WHOOSH → BOOM
          Golden Chrysanthemum explosion
          "Happy Birthday Suchi ❤️" blooms in glowing gold text

  T+3.0s: 🚀 Second pink rocket launches → BOOM
          Pink Peony spherical expansion

  T+4.0s: 🏮 Lanterns begin rising in the dark sky
          Full celebration mode activates

  T+5.0s: 🎵 BGM swells back in
          Rose petal / gold heart confetti rain begins falling
          Name-spelling firework launches → particles morph into "SUCHI ❤️"
```

**Firework Types:**
| Type | Pattern | Colors |
|------|---------|--------|
| Golden Chrysanthemum | Outward radial vectors with gravity trails | `#fbbf24` (Gold) |
| Pink Peony | Uniform spherical ring expansion | `#fda4af` (Rose) |
| Heart Burst | Particles explode into parametric heart shell | Theme pinks |
| Name Spelling | Particles converge to pre-computed letter grid: S-U-C-H-I ❤️ | `#fbbf24` (Gold) |

---

### 💫 Stage 7 — Cinematic Ending

```
  T+11.5s: Final quote fades in:
           "In every universe... I would still choose you."

  T+20.5s: Quote fades out → screen enters ending sequence:
           → Fireworks stop
           → A single glowing heart appears, pulsating
           → Synthesized heartbeat plays: 70 BPM → slows to 28 BPM
           → Heart pulse visual syncs with the slowing rhythm
           → Screen slowly fades to complete black void

  Final:   → Subtle restart icon appears in the darkness
           → "tap to relive the journey"
```

- Heartbeat synthesized via dual sine wave oscillators (lub-dub pattern)
- Visual heart scale syncs with audio BPM via `requestAnimationFrame` loop
- Complete fade to `#070506` with 3-second transition

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 19 + Vite | Fast HMR, modern JSX, production bundling |
| **Styling** | Tailwind CSS v4 + Vanilla CSS | Utility classes + custom keyframe animations |
| **3D Graphics** | Three.js / React Three Fiber | Starfields, nebula shaders, fireworks, lanterns, heart morph |
| **Animation** | Framer Motion | Page transitions, spring physics, card flips, modal entrances |
| **Scrolling** | Lenis | Kinetic smooth scrolling with easing curves |
| **Audio** | Custom Web Audio API Synthesizer | Wind ambience, heartbeat loops, chimes, clicks, firework booms |
| **Wish Delivery** | Web3Forms API | Silent email notification of birthday wish |

---

## 📂 Project Structure

```
suchi-bday/
├── public/
│   ├── favicon.svg                    # Heart tab icon
│   ├── icons.svg                      # UI icon sprites
│   └── images/                        # Watercolor textures, Polaroid photos
│
├── src/
│   ├── components/
│   │   ├── Finale/
│   │   │   └── Finale.jsx             # Birthday cake, wish input, countdown,
│   │   │                              # blow-out popup, celebration text, ending
│   │   ├── Galaxy/
│   │   │   └── UniverseCanvas.jsx     # Three.js canvas: nebula shader, starfield,
│   │   │                              # bokeh, lanterns, fireworks, confetti, camera
│   │   ├── LoveLetter/
│   │   │   └── LoveLetter.jsx         # 3D envelope fold, wax seal, typewriter text
│   │   ├── Passcode/
│   │   │   └── PasscodeScreen.jsx     # Lock screen, keypad, digit validation
│   │   ├── Reasons/
│   │   │   └── ReasonsSection.jsx     # Flippable "Reasons I Love You" card grid
│   │   ├── Timeline/
│   │   │   └── MemoryTimeline.jsx     # Polaroid cards, 3D tilt, focus modal,
│   │   │                              # SVG wires, fairy lights, audio visualizer
│   │   └── Valentine/
│   │       └── FloralDecorations.jsx  # Floating heart rain CSS particles
│   │
│   ├── config/
│   │   └── loveConfig.js              # ⚙️ All customizable content (see below)
│   │
│   ├── utils/
│   │   └── audioManager.js            # Web Audio synthesizer: wind, hum, heartbeat,
│   │                                  # clicks, chimes, firework booms, arpeggio
│   │
│   ├── App.jsx                        # Main orchestrator: scroll tracking, scene
│   │                                  # state machine, background transitions,
│   │                                  # blow-out timeline, Lenis init
│   ├── index.css                      # Tailwind imports, design tokens, keyframes,
│   │                                  # glassmorphism, shimmer, petals, scrollbar
│   └── main.jsx                       # React DOM root entry point
│
├── package.json
├── vite.config.js
└── README.md
```

---

## ⚙️ Configuration & Customization

All personalizable content lives in **`src/config/loveConfig.js`**:

```javascript
export const loveConfig = {
  passcode: "30052005",              // DD/MM/YYYY unlock code (legacy fallback)
  passcodes: ["30052005", "30052026"], // DD/MM/YYYY valid unlock codes list
  recipientName: "Suchi",            // Name used in celebrations

  storyLines: [...],                 // Opening narrative text
  memories: [...],                   // Timeline Polaroid cards (date, title, description, image)
  reasons: [...],                    // "Reasons I Love You" cards (short, full, icon)
  loveLetter: {                      // Envelope letter content
    salutation, paragraphs,
    closing, signature
  },

  audio: {
    bgmUrl: "...",                   // Background music URL
    bgmVolume: 0.35,
    sfxVolume: 0.5
  },

  web3formsKey: "your-key-here"      // Silent wish delivery (get free key at web3forms.com)
};
```

### What You Can Customize

| Field | What it controls |
|-------|-----------------|
| `passcodes` | The list of valid unlock codes on the lock screen |
| `passcode` | The fallback unlock code on the lock screen |
| `recipientName` | Name displayed in "Happy Birthday ___" and firework spelling |
| `storyLines` | The opening narrative lines |
| `memories[]` | Each Polaroid card's date, title, description, and image |
| `reasons[]` | Each "Reasons I Love You" card's content |
| `loveLetter` | The entire letter text, salutation, and signature |
| `audio.bgmUrl` | Background music track URL |
| `web3formsKey` | Web3Forms access key for silent wish emails |

---

## 💻 Local Development

### Prerequisites
- Node.js 18+ and npm

### Install & Run

```bash
# Install dependencies
npm install

# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server runs at `http://localhost:5173` (or next available port).

---

## 🌐 Deployment

The production build outputs static files to `dist/`. Deploy to any static hosting:

| Platform | Command |
|----------|---------|
| **Vercel** | `vercel --prod` or connect GitHub repo |
| **Netlify** | Drag `dist/` folder to Netlify dashboard |
| **GitHub Pages** | Use `gh-pages` package or GitHub Actions |
| **Cloudflare Pages** | Connect repo, set build command: `npm run build`, output: `dist` |

---

## 🔬 Technical Deep-Dives

### Web Audio Synthesizer (`audioManager.js`)

The entire soundscape is procedurally generated — no audio files needed for SFX:

| Sound | Synthesis Method |
|-------|-----------------|
| **Celestial Wind** | White noise → bandpass filter sweeping 80–400 Hz |
| **Space Hum** | 3 detuned sine oscillators at 55/110/82.5 Hz |
| **Heartbeat** | Dual sine sweeps (60→5 Hz) timed as lub-dub pairs, BPM decreasing |
| **Glass Click** | High-Q resonant sine at 2400 Hz, 50ms decay |
| **Tick Chime** | Bell tone at 1200 Hz with harmonic overtones |
| **Firework Boom** | Filtered noise burst with exponential decay |
| **Blowing Wind** | Bandpass-filtered white noise sweeping 800→100 Hz |

### Three.js Depth System (`UniverseCanvas.jsx`)

Three visual layers create cinematic depth:

| Layer | Z-Depth | Content |
|-------|---------|---------|
| **Background** | -4.5 | Custom GLSL fragment shader: FBM noise → watercolor nebula clouds |
| **Midground** | -12 to -25 | Starfield (2000 particles) + floating lanterns + firework rockets |
| **Foreground** | +2 to +8 | Blurred rose-pink bokeh particles (shallow DOF effect) |

### Scene State Machine (`App.jsx`)

The application uses a string-based state machine managed via `sceneState`:

```
intro → dissolving → heart → warp → main → finale-candles →
candles-extinguished → single-gold → second-gold → finale →
ending-fade → black
```

Scroll-driven states (`main`, `finale-candles`) are managed by Lenis scroll events.
Blow-out states (`candles-extinguished` → `finale`) are timed via `setTimeout` chains.
Ending states (`ending-fade` → `black`) are driven by the heartbeat BPM decay loop.

---

## 📄 License

Created with ❤️ for Suchi.
