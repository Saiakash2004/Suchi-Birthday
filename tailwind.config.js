/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          dark: '#05030a',
          card: 'rgba(15, 10, 25, 0.45)',
          purple: '#180b30',
          glow: '#d946ef',
        },
        romantic: {
          pink: '#ec4899',
          rose: '#f43f5e',
          light: '#fbcfe8',
          gold: '#fbbf24',
        }
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        sans: ['Inter', 'sans-serif'],
        cursive: ['Great Vibes', 'cursive']
      },
      animation: {
        'shake': 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
        'star-glow': 'starGlow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' },
        },
        pulseSlow: {
          '0%, 100%': { transform: 'scale(1) opacity(0.85)', filter: 'drop-shadow(0 0 15px rgba(236,72,153,0.6))' },
          '50%': { transform: 'scale(1.05) opacity(1)', filter: 'drop-shadow(0 0 25px rgba(236,72,153,0.9))' },
        },
        starGlow: {
          '0%': { opacity: 0.3, transform: 'scale(0.8)' },
          '100%': { opacity: 1, transform: 'scale(1.2)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
