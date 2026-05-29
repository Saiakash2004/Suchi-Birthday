// Configuration for the cinematic universe made for her
export const loveConfig = {
  // Passcode to unlock the universe (DDMMYYYY)
  passcode: "30052005", // 30th May 2005 
  passcodes: ["30052005", "30052026"],

  // Romantic story elements
  recipientName: "Suchi",
  
  storyLines: [
    "Among billions of stars...",
    "somehow, I found you.",
    "And my universe changed forever. ✨"
  ],

  // Memories Timeline
  memories: [
    {
      id: 1,
      date: "August 12, 2022",
      title: "The Beginning of Us",
      description: "The day you entered my life and made everything brighter. That first conversation, the laughter, and the spark that started it all.",
      image: "1.jpeg", 
      location: "Under the starlit sky",
      voiceNote: null // Optional: Add voice note path here e.g. "/audio/voice1.mp3"
    },
    {
      id: 2,
      date: "December 24, 2023",
      title: "Our First Sunset Together",
      description: "Sitting side-by-side, watching the gold and purple hues wash over the sky. I knew then that every sunset in my life had to be shared with you.",
      image: "2.jpeg", 
      location: "The Beach Vista",
      voiceNote: null
    },
    {
      id: 3,
      date: "October 10, 2024",
      title: "Cozy Late Nights",
      description: "Whispering our deepest dreams, fears, and hopes into the silence of the night. That was when our souls truly intertwined.",
      image: "3.jpeg", 
      location: "Cozy Balcony Cafe",
      voiceNote: null
    },
    {
      id: 4,
      date: "February 14, 2025",
      title: "Laughter in the Rain",
      description: "When the unexpected downpour caught us off guard. Instead of running, we laughed, danced, and embraced the magic of the moment.",
      image: "4.jpeg", 
      location: "Downtown Streets",
      voiceNote: null
    }
  ],

  // "Reasons I Love You" orbiting cards
  reasons: [
    {
      id: 1,
      short: "Your Smile",
      full: "Your smile is my absolute favorite view. It lights up the darkest rooms and heals my roughest days instantly.",
      icon: "✨"
    },
    {
      id: 2,
      short: "Your Kindness",
      full: "The gentle way you care for everyone around you. Your heart is so pure and full of warmth.",
      icon: "💖"
    },
    {
      id: 3,
      short: "Your Laughter",
      full: "That sweet, musical sound that fills my heart. It's my absolute favorite melody in the entire world.",
      icon: "🎵"
    },
    {
      id: 4,
      short: "Your Grace",
      full: "The elegance and strength you carry yourself with. You inspire me to be a better person every single day.",
      icon: "🌸"
    },
    {
      id: 5,
      short: "Your Dreamy Eyes",
      full: "When I look into your eyes, I see a peaceful, beautiful galaxy that I want to explore for the rest of my life.",
      icon: "💫"
    },
    {
      id: 6,
      short: "How Safe I Feel",
      full: "Just holding your hand makes all the chaos of the world vanish. With you, I am finally home.",
      icon: "🏠"
    }
  ],

  // Deeply emotional love letter details
  loveLetter: {
    salutation: "To My Lovely Potti 💖,",
    paragraphs: [
      "Happy Birthday, my love! Today, the universe celebrates the birth of its most beautiful creation. Having you in my life is the greatest gift I could have ever dreamed of.",
      "Every single moment spent with you feels like a beautiful dream that I never want to wake up from. You bring a sense of peace, warmth, and joy to my soul that is beyond words. You are my compass, my anchor, and my starry sky.",
      "On this special day, I want to promise you that in every universe, through every galaxy, and across every lifetime... I will always find you, and I will always choose you. Your happiness is my ultimate goal.",
      "May your day be as lovely, and magical as you are to me. Cheers to you, to us, and to the beautiful journey ahead for us."
    ],
    closing: "Forever and always yours,",
    signature: "Your Love ❤️"
  },

  // Audio setup
  audio: {
    // Royalty free beautiful emotional piano track path (we will provide fallback Web Audio synthesiser)
    bgmUrl: "https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3",
    // Volume levels
    bgmVolume: 0.35,
    sfxVolume: 0.5
  },

  // Silent wish delivery (Web3Forms)
  web3formsKey: "eb999817-5d36-4533-bb80-63d416ca38cb"
};
