/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Video, VideoCategory, LiveStream } from "./types";

export const SEED_VIDEOS: Video[] = [
  {
    id: "v-lofi",
    title: "Lofi Beats to Hatch to (Relaxing Brood Ambient Ambient)",
    description: "Relax, study, or hatch with these cozy vintage beats. Perfect for periodical larvae waiting underground for 17 years. Enjoy the warm crackle of vinyl paired with gentle outdoor insect soundscapes.",
    category: VideoCategory.MUSIC,
    duration: "24:00",
    views: 1248000,
    likes: 84300,
    uploaderName: "Stridulation Beats",
    uploaderSubscribers: 250000,
    uploadedAt: "2 days ago",
    videoUrl: "music_lofi",
    thumbnailUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=600",
    isPremium: false,
    monetized: true,
    earnings: 249.50,
    comments: [
      { id: "c1", author: "Larva_Cozy", avatarColor: "bg-amber-600", text: "Been listening underground since 2009. Best release ever.", likes: 1420, timestamp: "1 day ago" },
      { id: "c2", author: "Nyctophile", avatarColor: "bg-indigo-600", text: "That acoustic guitar section at 4:20 is pure bliss.", likes: 832, timestamp: "18 hours ago" },
      { id: "c3", author: "BugStudier", avatarColor: "bg-emerald-600", text: "Perfect audio background as I write my entomology thesis!", likes: 211, timestamp: "5 hours ago", isCreator: true }
    ]
  },
  {
    id: "v-bio",
    title: "The 17-Year Hatch: Understanding Brood XIX and XIII Convergences",
    description: "Deep dive into one of nature's most spectacular synchronous phenomenon. Periodical cicadas emerge in the billions. In this comprehensive biological analysis, we explore soil temperature triggers, prime number evasion theories, and evolutionary survival calculations.",
    category: VideoCategory.EDUCATION,
    duration: "14:22",
    views: 450120,
    likes: 31200,
    uploaderName: "Deep Wild Biology",
    uploaderSubscribers: 810000,
    uploadedAt: "1 week ago",
    videoUrl: "education_science",
    thumbnailUrl: "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&q=80&w=600",
    isPremium: false,
    monetized: true,
    earnings: 1125.00,
    comments: [
      { id: "c4", author: "Dr_Swarms", avatarColor: "bg-teal-600", text: "The mathematical optimization of 13 and 17 as prime number cycles is brilliant evolutionary camouflage to disrupt predator lifecycles.", likes: 539, timestamp: "6 days ago" },
      { id: "c5", author: "MacroExplorer", avatarColor: "bg-orange-600", text: "I appreciate the detailed explanation of soil heat triggers. Outstanding graphics!", likes: 110, timestamp: "4 days ago" }
    ]
  },
  {
    id: "v-movie",
    title: "THE EMERGENT - Official Sci-Fi Teaser Trailer (2026)",
    description: "They slept for centuries underneath our cities. Now, Triton Studios presents an epochal sci-fi cinematic showdown. This summer, the world is about to hear the great, loud rhythm of the Earth. Watch the exclusive world premiere trailer.",
    category: VideoCategory.ENTERTAINMENT,
    duration: "2:15",
    views: 3124000,
    likes: 295000,
    uploaderName: "Triton Cinematic",
    uploaderSubscribers: 5400000,
    uploadedAt: "Yesterday",
    videoUrl: "entertainment_movie",
    thumbnailUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=600",
    isPremium: false,
    monetized: true,
    earnings: 3125.40,
    comments: [
      { id: "c6", author: "SciFi_Guy", avatarColor: "bg-red-600", text: "This looks absolutely wild. The sound design of the wings buzzing is terrifying!", likes: 12053, timestamp: "23 hours ago" },
      { id: "c7", author: "VFX_Spec", avatarColor: "bg-stone-700", text: "The scale of that swarm rendering is CGI history.", likes: 4522, timestamp: "20 hours ago" }
    ]
  },
  {
    id: "v-g1",
    title: "CICADA SIMULATOR 2026 - Any% Glitchless Speedrun (02:18)",
    description: "World Record Run alert! Running the latest Cicada Arcade Simulator. Successfully executed the optimal warm soil jump and standard tree-stridulation sequence. Shaved 4.2 seconds off old glitchless runner records using the wings-thrust slide maneuver.",
    category: VideoCategory.GAMING,
    duration: "5:40",
    views: 189000,
    likes: 12400,
    uploaderName: "SpeedyBugs",
    uploaderSubscribers: 89000,
    uploadedAt: "3 days ago",
    videoUrl: "gaming_retro",
    thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600",
    isPremium: false,
    monetized: true,
    earnings: 89.20,
    comments: [
      { id: "c8", author: "GamerBroX", avatarColor: "bg-yellow-600", text: "How did you manage that tree climb glitch so consistently?! Inspiring speedrun.", likes: 89, timestamp: "2 days ago" },
      { id: "c9", author: "ArcadeFlyer", avatarColor: "bg-blue-600", text: "Sub-2:20 is crazy! GG!", likes: 45, timestamp: "1 day ago" }
    ]
  },
  {
    id: "v-news",
    title: "Global Brood Emergence Spells Economic Windfall for Eco-Tourism",
    description: "As states prepare for historic bug emerges, eco-tourism is reaching unprecedented heights. From local themed foods to sound safaris, experts predict billions of dollars injected into regional economies. National Science Network brings the full details.",
    category: VideoCategory.NEWS,
    duration: "8:50",
    views: 94000,
    likes: 4200,
    uploaderName: "Apex Financial News",
    uploaderSubscribers: 1200000,
    uploadedAt: "4 days ago",
    videoUrl: "news_report",
    thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600",
    isPremium: false,
    monetized: true,
    earnings: 215.10,
    comments: [
      { id: "c10", author: "EarthInvestor", avatarColor: "bg-emerald-600", text: "Nature based assets always find a way to thrive.", likes: 72, timestamp: "3 days ago" }
    ]
  },
  {
    id: "v-premium",
    title: "[PREMIUM EXCLUSIVE] Mastering Stridulation Synthesis (Synthesizer Tutorial)",
    description: "Exclusively for Premium Subscribers of Cicada Tube. We break down the complex mechanics of producing biological-sounding synthesizer textures inside customizable modular systems. Explore custom phase modulation grids, filter decay, and noise layers.",
    category: VideoCategory.MUSIC,
    duration: "18:15",
    views: 12000,
    likes: 1800,
    uploaderName: "Synthesizer Pro",
    uploaderSubscribers: 180000,
    uploadedAt: "5 days ago",
    videoUrl: "music_synth",
    thumbnailUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=600",
    isPremium: true,
    monetized: true,
    earnings: 640.00,
    comments: [
      { id: "c11", author: "OscillatorUser", avatarColor: "bg-purple-600", text: "This content alone is worth my Premium subscription! That custom noise bandpass is extremely clean.", likes: 218, timestamp: "5 days ago" }
    ]
  }
];

export const MOCK_STREAM: LiveStream = {
  id: "stream-lofi",
  title: "🔴 24/7 Lofi Cicada Stream - Chill ambient soundscapes & biology loops",
  streamerName: "Cicada Network LIVE",
  viewerCount: 14592,
  category: VideoCategory.LIVE,
  streamUrl: "live_ambient",
  thumbnailUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=600",
  activeTips: [
    { id: "t1", user: "BeatMaker99", amount: 15.00, message: "Absolute masterpiece stream tonight, love from Berlin!", color: "from-amber-600 to-amber-500" },
    { id: "t2", user: "BioNerd", amount: 50.00, message: "Supporting the continuous nature broadcast, we love periodical swarms!", color: "from-purple-600 to-indigo-600" }
  ]
};

export const DEFAULT_AI_CHAT_MESSAGES = [
  "Wow, this visual looks super trippy! 🌟",
  "How long underground again? 17? That's insane math.",
  "Check the sound frequency! That's a solid 7kHz wave.",
  "Just subbed! Loving the aesthetic of Cicada Tube.",
  "Is that a natural field recording? Sound quality is 10/10.",
  "Hello from Tokyo! Periodic broods are amazing.",
  "Wait, speedrunner style cicada simulation exists?! I must buy that.",
  "Can I tip creator Studio coins here?",
  "This lofi and outdoor rain sound is keeping me super focused.",
  "Who else is here during a real swarm?",
  "Brood XIX represent! Illinois is absolute noise right now.",
  "Monetization on this channel is well-deserved, very high quality tutorial.",
  "Love this modern dark UI. Cicada wing animations are fire."
];
