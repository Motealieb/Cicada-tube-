/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Video, Comment, UserWallet, Advertisement } from "../types";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Sparkles,
  ThumbsUp,
  Share2,
  DollarSign,
  Send,
  Check,
  AlertCircle,
  Clock,
  ExternalLink
} from "lucide-react";

interface VideoPlayerProps {
  video: Video;
  wallet: UserWallet;
  onDeductWallet: (amount: number, desc: string, uploaderId?: string) => boolean;
  onRegisterSubscriber: (uploaderName: string) => void;
  isSubscribed: boolean;
  onClose: () => void;
  isPremiumUser: boolean;
  
  // Dynamic connected states
  likedVideoIds: string[];
  onToggleLikeVideo: (videoId: string) => void;
  onNavigateToUser: (username: string) => void;
  onPiTipCreator?: (amount: number, callback: (success: boolean) => void) => void;
  onUpdateWatchProgress?: (videoId: string, progressPercent: number) => void;
  piUser?: { username: string; uid: string } | null;
  onAddComment?: (videoId: string, comment: Comment) => void;
  onLikeComment?: (videoId: string, commentId: string, liked: boolean) => void;
  advertisements?: Advertisement[];
}

export default function VideoPlayer({
  video,
  wallet,
  onDeductWallet,
  onRegisterSubscriber,
  isSubscribed,
  onClose,
  isPremiumUser,
  likedVideoIds,
  onToggleLikeVideo,
  onNavigateToUser,
  onPiTipCreator,
  onUpdateWatchProgress,
  piUser,
  onAddComment,
  onLikeComment,
  advertisements = [],
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.75);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [resolution, setResolution] = useState<string>("1080p");
  
  // Global liking derivation
  const isLiked = likedVideoIds.includes(video.id);
  const [showShareTooltip, setShowShareTooltip] = useState<boolean>(false);
  const currentUsername = piUser ? piUser.username : "m.tealieb2014";

  // Comments state
  const [localComments, setLocalComments] = useState<Comment[]>(video.comments);
  const [commentInput, setCommentInput] = useState<string>("");
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);

  const handleToggleLikeComment = (commentId: string) => {
    const isCommentLiked = likedCommentIds.includes(commentId);
    let newLiked = false;
    if (isCommentLiked) {
      setLikedCommentIds((prev) => prev.filter((id) => id !== commentId));
      setLocalComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, likes: Math.max(0, c.likes - 1) } : c))
      );
      triggerSound(350, 80, "sine");
      newLiked = false;
    } else {
      setLikedCommentIds((prev) => [...prev, commentId]);
      setLocalComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c))
      );
      triggerSound(880, 80, "sine");
      newLiked = true;
    }
    if (onLikeComment) {
      onLikeComment(video.id, commentId, newLiked);
    }
  };

  // Tipping states
  const [tipSuccessMsg, setTipSuccessMsg] = useState<string>("");
  const [tipErrorMsg, setTipErrorMsg] = useState<string>("");

  // Ad simulation states
  const [adActive, setAdActive] = useState<boolean>(false);
  const [adTimeRemaining, setAdTimeRemaining] = useState<number>(5);
  const [adsEncountered, setAdsEncountered] = useState<boolean>(false);
  const [activeAd, setActiveAd] = useState<Advertisement | null>(null);
  const [adClickedMessage, setAdClickedMessage] = useState<string>("");

  // Ref pointers
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Total calculated length
  const durationParts = video.duration.split(":");
  const totalSeconds =
    durationParts.length === 2
      ? parseInt(durationParts[0], 10) * 60 + parseInt(durationParts[1], 10)
      : 120; // fallback 2 mins

  // Reset ad triggers when video swaps
  useEffect(() => {
    setLocalComments(video.comments);
    setLikedCommentIds([]);
    setCurrentTime(0);
    setTipSuccessMsg("");
    setTipErrorMsg("");
    setAdClickedMessage("");
    
    // Trigger ad if monetized and NOT premium, only if not yet encountered
    if (video.monetized && !isPremiumUser && !adsEncountered) {
      setAdActive(true);
      setAdTimeRemaining(6);
      setIsPlaying(false);
      
      // Select an advertisement dynamically
      if (advertisements && advertisements.length > 0) {
        const randomIndex = Math.floor(Math.random() * advertisements.length);
        const chosenAd = advertisements[randomIndex];
        setActiveAd(chosenAd);
        // Safely record impression locally
        chosenAd.impressions = (chosenAd.impressions || 0) + 1;
      } else {
        setActiveAd({
          id: "default-ad-1",
          brandName: "CICADA SPRAY REPELLENT INC.",
          slogan: "Keeping Swarms Safe and Quiet Nationwide",
          actionText: "Quiet Swarms Now",
          themeColor: "amber",
          cost: 0,
          creator: "Cicada Network",
          impressions: 42000,
          clicks: 1240,
          createdAt: ""
        });
      }
    } else {
      setAdActive(false);
      setIsPlaying(true);
    }
  }, [video, isPremiumUser, advertisements]);

  // Ad timer count
  useEffect(() => {
    let timer: any;
    if (adActive && adTimeRemaining > 0) {
      timer = setInterval(() => {
        setAdTimeRemaining((prev) => {
          if (prev <= 1) {
            handleCompleteAd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [adActive, adTimeRemaining]);

  const handleCompleteAd = () => {
    setAdActive(false);
    setAdsEncountered(true);
    setIsPlaying(true);
  };

  // Sound Synth Generator in Browser! Correctly matches user play inputs
  const triggerSound = (freq: number, durMs: number, type: OscillatorType = "sine") => {
    if (isMuted || volume === 0) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durMs / 1000);
      
      osc.start();
      osc.stop(ctx.currentTime + durMs / 1000);
    } catch (e) {
      // Audio context disabled or restricted by iframe permissions
    }
  };

  // Video Time updates simulation
  useEffect(() => {
    let interval: any;
    if (isPlaying && !adActive) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalSeconds) {
            setIsPlaying(false);
            return totalSeconds;
          }
          // Cycle mock synthesizer clicks to simulate stridulations / beat synthesis!
          if (Math.round(prev) % 4 === 0 && Math.random() > 0.6) {
            if (video.id === "v-lofi") {
              triggerSound(220, 250, "sine"); // lo fi beat kick
            } else if (video.id === "v-bio") {
              triggerSound(7200, 80, "triangle"); // cicada high chirp
            } else if (video.id === "v-movie") {
              triggerSound(80, 500, "sawtooth"); // dramatic trailer boom
            } else if (video.id === "v-g1") {
              triggerSound(880, 100, "square"); // arcade click
            } else {
              triggerSound(1500, 150, "sine"); // wing fluttering
            }
          }
          return prev + 1 * playbackSpeed;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, adActive, totalSeconds, playbackSpeed, video, isMuted, volume]);

  // Synchronize watch progress state back to parent container
  useEffect(() => {
    if (onUpdateWatchProgress && totalSeconds > 0) {
      const percentage = Math.min(100, Math.round((currentTime / totalSeconds) * 100));
      onUpdateWatchProgress(video.id, percentage);
    }
  }, [currentTime, totalSeconds, video.id, onUpdateWatchProgress]);

  // Canvas render animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameCount = 0;
    
    // Set dynamic simulated stream source resolution
    let renderW = 1280;
    let renderH = 720;
    if (resolution === "1085p" || resolution === "1080p") {
      renderW = 1920;
      renderH = 1080;
    } else if (resolution === "480p") {
      renderW = 640;
      renderH = 360; // low resolution scaling looks blockier
    } else if (resolution === "720p") {
      renderW = 1280;
      renderH = 720;
    }
    
    canvas.width = renderW;
    canvas.height = renderH;

    const render = () => {
      frameCount++;
      const w = canvas.width;
      const h = canvas.height;

      // Dark futuristic overlay background
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, w, h);

      if (adActive) {
        // Map theme color of the chosen advertisement campaign
        const adColor = activeAd?.themeColor === "emerald" 
          ? { primary: "#10b981", rgb: "16, 185, 129" }
          : activeAd?.themeColor === "crimson"
          ? { primary: "#ef4444", rgb: "239, 68, 68" }
          : activeAd?.themeColor === "blue"
          ? { primary: "#0ea5e9", rgb: "14, 165, 233" }
          : { primary: "#f59e0b", rgb: "245, 158, 11" }; // amber default

        // Draw Ad Graphic visualizer
        ctx.fillStyle = `rgba(${adColor.rgb}, 0.05)`;
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = `rgba(${adColor.rgb}, 0.2)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < w; i += 20) {
          ctx.moveTo(i, 0);
          ctx.lineTo(i - 100, h);
        }
        ctx.stroke();

        ctx.font = "bold 20px sans-serif";
        ctx.fillStyle = adColor.primary;
        ctx.textAlign = "center";
        ctx.fillText(activeAd?.brandName || "CICADA CORPS SPONSOR", w / 2, h / 2 - 30);

        ctx.font = "13px monospace";
        ctx.fillStyle = "#a1a1aa";
        ctx.fillText(activeAd?.slogan || "Always Supporting Organic Decibels", w / 2, h / 2);

        // Rotating campaign orb shield
        ctx.strokeStyle = adColor.primary;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2 + 60, 20 + Math.sin(frameCount * 0.05) * 5, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Render theme based animations
        switch (video.id) {
          case "v-lofi":
            // Lofi Beats visualizer: Retro record spinning with warm soundwaves
            ctx.strokeStyle = "#d97706";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, 80 + Math.sin(frameCount * 0.03) * 6, 0, Math.PI * 2);
            ctx.stroke();

            // Vinyl rings
            for (let r = 20; r < 75; r += 12) {
              ctx.strokeStyle = "rgba(217, 119, 6, 0.15)";
              ctx.beginPath();
              ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Wave equalizer at bottom
            ctx.fillStyle = "rgba(217, 119, 6, 0.7)";
            for (let i = 40; i < w - 40; i += 12) {
              const frequencyHeight = 25 + Math.sin(i * 0.05 + frameCount * 0.08) * 20 * (isPlaying ? 1 : 0.1);
              ctx.fillRect(i, h - 35 - frequencyHeight, 5, frequencyHeight);
            }

            // Cozy coffee mug steaming
            ctx.fillStyle = "#a1a1aa";
            ctx.font = "11px sans-serif";
            ctx.fillText("☕ Stridulation Lounge • Playing Cozy Beats", 45, 45);
            break;

          case "v-bio":
            // Biology DNA double-helix spiral rotators
            ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
            ctx.font = "11px monospace";
            ctx.fillText("Evolutionary Cycles (Prime Numbers 13 & 17)", 45, 45);

            const nodesCount = 18;
            for (let i = 0; i < nodesCount; i++) {
              const x = 100 + (i * (w - 200)) / (nodesCount - 1);
              const angleVal = i * 0.4 + frameCount * 0.02;
              const y1 = h / 2 + Math.sin(angleVal) * 55;
              const y2 = h / 2 - Math.sin(angleVal) * 55;

              // Draw connector link
              ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(x, y1);
              ctx.lineTo(x, y2);
              ctx.stroke();

              // Node 1
              ctx.fillStyle = "#10b981";
              ctx.beginPath();
              ctx.arc(x, y1, 5, 0, Math.PI * 2);
              ctx.fill();

              // Node 2
              ctx.fillStyle = "#047857";
              ctx.beginPath();
              ctx.arc(x, y2, 5, 0, Math.PI * 2);
              ctx.fill();
            }
            break;

          case "v-movie":
            // Nebula and meteor trailer visual
            ctx.font = "bold 11px sans-serif";
            ctx.fillStyle = "#ef4444";
            ctx.fillText("💥 TRITON FILM EXCLUSIVE PREVIEW", 45, 45);

            // Expanding sound blasts
            const scale = (frameCount % 120) / 120;
            ctx.strokeStyle = `rgba(239, 68, 68, ${1 - scale})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, scale * 160, 0, Math.PI * 2);
            ctx.stroke();

            // Glitch text overlay
            if (isPlaying && Math.random() > 0.96) {
              ctx.font = "bold 32px monospace";
              ctx.fillStyle = "rgba(239, 68, 68, 0.8)";
              ctx.fillText("THE EMERGENT", w / 2 + (Math.random() - 0.5) * 15, h / 2);
            } else {
              ctx.font = "bold 28px serif";
              ctx.fillStyle = "#f3f4f6";
              ctx.textAlign = "center";
              ctx.fillText("T H E   E M E R G E N T", w / 2, h / 2);
            }
            break;

          case "v-g1":
            // Gaming speedy layout: moving character on grid
            ctx.fillStyle = "rgba(245, 158, 11, 0.3)";
            ctx.font = "bold 11px monospace";
            ctx.fillText("🎮 WORLD RECORD ATTEMPT IN PROGRESS (Any% Glitchless)", 35, 40);

            // Draw game grid lines traveling back
            ctx.strokeStyle = "rgba(245,158,11,0.15)";
            ctx.lineWidth = 1.5;
            const offset = (frameCount * 3) % 40;
            for (let y = h / 2; y < h; y += 15) {
              ctx.beginPath();
              ctx.moveTo(0, y);
              ctx.lineTo(w, y);
              ctx.stroke();
            }

            // Draw character
            const insectX = w / 2 - 100;
            const insectY = h - 60 - Math.abs(Math.sin(frameCount * 0.1) * 25);
            ctx.fillStyle = "#f59e0b";
            ctx.beginPath();
            ctx.arc(insectX, insectY, 12, 0, Math.PI * 2);
            ctx.fill();

            // Wings flapping lines
            ctx.strokeStyle = "#e11d48";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(insectX, insectY);
            ctx.lineTo(insectX - 18, insectY - 12 - (frameCount % 4) * 3);
            ctx.moveTo(insectX, insectY);
            ctx.lineTo(insectX - 18, insectY + 6 + (frameCount % 4) * 3);
            ctx.stroke();

            // Stats box
            ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            ctx.fillRect(w - 180, 25, 150, 60);
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 1;
            ctx.strokeRect(w - 180, 25, 145, 55);

            ctx.fillStyle = "#bef264";
            ctx.font = "9px monospace";
            ctx.fillText(`Timer: 02:${(frameCount % 60).toString().padStart(2, "0")}.04`, w - 170, 45);
            ctx.fillText("Cl Climb Glitch: OPTIMAL", w - 170, 60);
            break;

          default:
            // Custom user upload or generic layout with nice butterfly/insect equalizers
            ctx.fillStyle = "#71717a";
            ctx.font = "11px sans-serif";
            ctx.fillText(`📁 Cicada Hub Player • Playing: ${video.title}`, 45, 45);

            // Circular ripples
            for (let i = 0; i < 4; i++) {
              const r = ((frameCount + i * 60) % 240) * 1.5;
              ctx.strokeStyle = `rgba(245, 158, 11, ${Math.max(0, 1 - r / 360) * 0.15})`;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(w / 2, r, r, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Center pulsating glow bulb
            const fluxRadius = 30 + Math.sin(frameCount * 0.08) * 8;
            ctx.fillStyle = "rgba(245, 158, 11, 0.1)";
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, fluxRadius * 1.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#f59e0b";
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, fluxRadius * 0.8, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
      }

      // Draw resolution compression effects on the stream if quality is lower than HD
      if (resolution === "480p" && !adActive) {
        // Draw compression macroblocks (creative and high-impact)
        if (Math.random() > 0.35 && isPlaying) {
          ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
          const blockSize = 64;
          const cols = Math.ceil(w / blockSize);
          const rows = Math.ceil(h / blockSize);
          // Scatter 8 artifacts
          for (let k = 0; k < 6; k++) {
            const rx = Math.floor(Math.random() * cols) * blockSize;
            const ry = Math.floor(Math.random() * rows) * blockSize;
            ctx.fillRect(rx, ry, blockSize, blockSize);
          }
        }
        
        // Add random static noise dots
        ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
        for (let j = 0; j < 35; j++) {
          const px = Math.random() * w;
          const py = Math.random() * h;
          ctx.fillRect(px, py, 2.5, 2.5);
        }
      }

      // Live watermark matching selected resolution
      if (!adActive) {
        ctx.fillStyle = "rgba(10, 10, 10, 0.75)";
        ctx.fillRect(w - 240, 20, 220, 28);
        
        let strokeColor = "rgba(234, 179, 8, 0.6)"; // Amber gold for 1080p
        let fontColor = "#fbbf24";
        let tierLabel = "Ultra HD 1080p";
        if (resolution === "720p") {
          strokeColor = "rgba(16, 185, 129, 0.6)"; // Emerald green for 720p
          fontColor = "#34d399";
          tierLabel = "HD 720p Ready";
        } else if (resolution === "480p") {
          strokeColor = "rgba(161, 161, 170, 0.4)"; // Gray for 480p
          fontColor = "#a1a1aa";
          tierLabel = "SD 480p Bandwidth";
        }

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(w - 240, 20, 220, 28);

        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = fontColor;
        ctx.fillText(`STREAM: ${tierLabel}`, w - 130, 37);
      }

      // Draw standard play/paused visual indicators on canvas center briefly if altered
      if (!isPlaying && !adActive) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "rgba(244, 244, 245, 0.9)";
        ctx.beginPath();
        ctx.moveTo(w / 2 - 12, h / 2 - 18);
        ctx.lineTo(w / 2 + 18, h / 2);
        ctx.lineTo(w / 2 - 12, h / 2 + 18);
        ctx.fill();
      }

      // Continuous loop
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [video, isPlaying, adActive, resolution]);

  // Handle subscriber clicking
  const handleToggleSubscribe = () => {
    onRegisterSubscriber(video.uploaderName);
    triggerSound(580, 150, "sine");
  };

  // Handle liking
  const handleLike = () => {
    onToggleLikeVideo(video.id);
    triggerSound(isLiked ? 350 : 880, 100, "sine");
  };

  // Convert seconds into standard timestamp MM:SS
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  // Add a comment to the thread
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment: Comment = {
      id: `comment-u-${Date.now()}`,
      author: currentUsername,
      avatarColor: "bg-amber-500",
      text: commentInput.trim(),
      likes: 0,
      timestamp: "Just now",
    };

    setLocalComments([newComment, ...localComments]);
    setCommentInput("");
    triggerSound(440, 120, "triangle");

    if (onAddComment) {
      onAddComment(video.id, newComment);
    }
  };

  const [piTipLoading, setPiTipLoading] = useState<boolean>(false);

  const handlePiTipCreator = (val: number) => {
    if (!onPiTipCreator) {
      setTipErrorMsg("Your Pi wallet must be synced, or credentials fully loaded, to use Pi payments.");
      setTimeout(() => setTipErrorMsg(""), 5000);
      return;
    }
    setPiTipLoading(true);
    setTipSuccessMsg("");
    setTipErrorMsg("");
    onPiTipCreator(val, (success) => {
      setPiTipLoading(false);
      if (success) {
        setTipSuccessMsg(`Success! Synced blockchain ledger: Paid ${val} π to ${video.uploaderName}!`);
        triggerSound(1800, 350, "sine");
        setTimeout(() => setTipSuccessMsg(""), 6000);
        
        // Inject creator response simulation to thread context!
        setTimeout(() => {
          const creatorCommentResponse: Comment = {
            id: `comment-pi-t-${Date.now()}`,
            author: video.uploaderName,
            avatarColor: "bg-emerald-600",
            text: `Wow, thank you so much for the real Pi tip of ${val} π! Having true peer-to-peer web3 backing is an absolute game-changer! 🚀🪙`,
            likes: 12,
            timestamp: "Just now",
            isCreator: true,
          };
          setLocalComments((prev) => [creatorCommentResponse, ...prev]);
          if (onAddComment) {
            onAddComment(video.id, creatorCommentResponse);
          }
        }, 1500);
      } else {
        setTipErrorMsg("Pi checkout failed: transaction cancelled or declined by server.");
        setTimeout(() => setTipErrorMsg(""), 6000);
      }
    });
  };

  // Creator tipping flow
  const handleTipCreator = (amount: number) => {
    // Deduct user wallet
    const success = onDeductWallet(
      amount,
      `Tippped $${amount} to ${video.uploaderName} for "${video.title}"`,
      video.id
    );

    if (success) {
      setTipErrorMsg("");
      setTipSuccessMsg(`Successfully tipped $${amount.toFixed(2)} to ${video.uploaderName}!`);
      triggerSound(1800, 350, "sine");

      // Inject creator response simulation to thread context!
      setTimeout(() => {
        const creatorCommentResponse: Comment = {
          id: `comment-t-${Date.now()}`,
          author: video.uploaderName,
          avatarColor: "bg-emerald-600",
          text: `Thank you so much ${currentUsername} for your wonderful tip of $${amount}! This support fuels my channel. 💚`,
          likes: 5,
          timestamp: "Just now",
          isCreator: true,
        };
        setLocalComments((prev) => [creatorCommentResponse, ...prev]);
        if (onAddComment) {
          onAddComment(video.id, creatorCommentResponse);
        }
      }, 1500);
    } else {
      setTipSuccessMsg("");
      setTipErrorMsg("Insufficient Funds! Go to \"Wallet & Ads\" sidebar to load money first.");
      triggerSound(140, 200, "sawtooth");
    }
  };

  const handleShareVideo = () => {
    setShowShareTooltip(true);
    triggerSound(600, 100, "sine");
    setTimeout(() => setShowShareTooltip(false), 2000);
  };

  return (
    <div id="video-player-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Visual theater viewport and uploader info details row */}
      <div id="player-column-parent" className="lg:col-span-2 space-y-4">
        {/* Main interactive media player box wrapper */}
        <div className="relative overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-90 w-full group/player shadow-2xl">
          {/* Simulated HTML5 Canvas renderer */}
          <canvas
            ref={canvasRef}
            className="w-full aspect-video block cursor-pointer"
            onClick={() => {
              if (!adActive) setIsPlaying(!isPlaying);
            }}
          />

          {/* Ad countdown overlay interface */}
          {adActive && (
            <div className="absolute inset-0 z-25 flex flex-col justify-between p-4 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950">
              <div className="flex justify-between items-center bg-zinc-900/95 rounded-xl px-4 py-2 border border-zinc-800 shadow-md">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-widest truncate max-w-[180px] sm:max-w-none">
                    Sponsored Ad Stream • {activeAd?.brandName || "CICADA CORPS"}
                  </span>
                </div>
                {!isPremiumUser && (
                  <button
                    onClick={() => onDeductWallet(0, "Initiating Premium offer")}
                    className="flex items-center space-x-1 border border-emerald-500/30 hover:border-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 transition"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Skip All Ads Forever ($9.99)</span>
                  </button>
                )}
              </div>

              {/* Dynamic Campaign Card content in middle */}
              <div className="flex flex-col items-start bg-zinc-950/90 border border-zinc-900 rounded-xl p-4 max-w-sm backdrop-blur-md self-start text-left ml-2 sm:ml-4 shadow-xl translate-y-2 animate-fade-in">
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Campaign Partner
                  </span>
                  <span className="font-mono text-[8px] text-zinc-500">Node Ref #{activeAd?.id.substring(0, 8)}</span>
                </div>
                <h3 className="text-zinc-100 font-bold text-sm tracking-tight mt-1.5">{activeAd?.brandName || "Cicada Corp Private Sponsor"}</h3>
                <p className="text-zinc-400 text-xs mt-1 leading-relaxed font-normal">{activeAd?.slogan || "Always Supporting Open-Decibel Streams Worldwide"}</p>
                
                {adClickedMessage ? (
                  <div className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1.5 mt-3 rounded-lg leading-snug animate-fade-in">
                    {adClickedMessage}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (activeAd) {
                        activeAd.clicks = (activeAd.clicks || 0) + 1;
                        triggerSound(880, 80, "sine");
                        setAdClickedMessage(`🚀 Visited campaign link! CTA action: "${activeAd.actionText}" registered successfully inside index ledger.`);
                        setTimeout(() => setAdClickedMessage(""), 4500);
                      }
                    }}
                    className="flex items-center space-x-2 mt-3.5 py-1.5 px-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-[11px] font-bold transition shadow-lg shrink-0 border border-emerald-400/20"
                  >
                    <span>{activeAd?.actionText || "Get Started"}</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                )}
                
                <span className="text-[9px] font-mono text-zinc-550 mt-2 block">
                  Financed by creator @{activeAd?.creator || "System"}. Cost allocation: ${activeAd?.cost.toFixed(2) || "0.00"}
                </span>
              </div>

              {/* Countdown actions bottom panel */}
              <div className="flex justify-between items-center w-full px-2">
                <span className="text-[9px] font-mono text-zinc-500 hidden sm:inline">
                  Any user can publish an ad from the "Wallet & Ads" dashboard.
                </span>
                {adTimeRemaining > 1 ? (
                  <div className="rounded-lg bg-zinc-900/95 border border-zinc-800 px-4 py-2 font-mono text-xs text-zinc-350 ml-auto">
                    Video resumes in <span className="text-emerald-500 font-bold">{adTimeRemaining - 1}s</span>
                  </div>
                ) : (
                  <button
                    onClick={handleCompleteAd}
                    className="flex items-center space-x-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2 font-mono text-xs font-bold transition shadow-lg active:scale-95 ml-auto"
                  >
                    <span>Skip Video Ad</span>
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Player controls toolbar overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent p-3 flex flex-col space-y-2 opacity-0 group-hover/player:opacity-100 transition duration-300 z-10">
            {/* Timeline slider bar progress line */}
            <div className="relative w-full h-1 bg-zinc-800 rounded-full overflow-hidden cursor-pointer">
              <div
                className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full transition-all duration-200"
                style={{ width: `${(currentTime / totalSeconds) * 100}%` }}
              />
            </div>

            {/* Icons toolbar strip */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={adActive}
                  className="text-zinc-300 hover:text-emerald-400 transition"
                >
                  {isPlaying ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5" />}
                </button>

                <button
                  onClick={() => setCurrentTime(0)}
                  disabled={adActive}
                  className="text-zinc-400 hover:text-zinc-100 transition"
                  title="Replay video"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                {/* Volume slider controls */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-zinc-400 hover:text-zinc-100 transition"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-16 accent-emerald-500 h-1 cursor-pointer bg-zinc-800 rounded-full appearance-none"
                  />
                </div>

                {/* Simulated timestamp info */}
                <span className="font-mono text-xs text-zinc-400">
                  {formatTime(currentTime)} / {video.duration}
                </span>
                
                {/* Visual live indicator */}
                {video.category === "Live Broadcasts" && (
                  <span className="h-4 px-1.5 rounded bg-rose-600 text-[10px] font-bold text-white uppercase tracking-wider flex items-center justify-center">
                    Simulated LIVE
                  </span>
                )}
              </div>

              {/* Speed & Quality configurations */}
              <div className="flex items-center space-x-3.5">
                {/* Resolution Quality Selector */}
                <div className="flex items-center space-x-1 border border-zinc-800 rounded px-1.5 py-0.5 bg-zinc-900/60 font-mono text-[10px]">
                  <span className="text-zinc-500">Quality:</span>
                  <select
                    id="video-resolution-select"
                    className="outline-none bg-transparent hover:text-zinc-100 text-zinc-300 text-[10px] text-center cursor-pointer font-bold border-none"
                    value={resolution}
                    onChange={(e) => {
                      setResolution(e.target.value);
                      triggerSound(950, 60, "sine");
                    }}
                    title="Change video stream resolution quality"
                  >
                    <option value="1080p" className="bg-zinc-900 text-zinc-300">1080p (FHD)</option>
                    <option value="720p" className="bg-zinc-900 text-zinc-300">720p (HD)</option>
                    <option value="480p" className="bg-zinc-900 text-zinc-300">480p (SD)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-1 border border-zinc-800 rounded px-1.5 py-0.5 bg-zinc-900/60 font-mono text-[10px]">
                  <span className="text-zinc-500">Speed:</span>
                  <select
                    className="outline-none bg-transparent hover:text-zinc-100 text-zinc-300 text-xs text-center cursor-pointer font-bold border-none"
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                  >
                    <option value="0.5" className="bg-zinc-900 text-zinc-300">0.5x</option>
                    <option value="1" className="bg-zinc-900 text-zinc-300">1.0x</option>
                    <option value="1.5" className="bg-zinc-900 text-zinc-300">1.5x</option>
                    <option value="2" className="bg-zinc-900 text-zinc-300">2.0x</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    const canvas = canvasRef.current;
                    if (canvas?.requestFullscreen) canvas.requestFullscreen();
                  }}
                  disabled={adActive}
                  className="text-zinc-400 hover:text-zinc-100 transition"
                >
                  <Maximize className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Video details metadata */}
        <div id="video-details-card" className="border border-zinc-900 rounded-2xl bg-zinc-950 p-4 space-y-4">
          <div className="space-y-1">
            <div className="flex items-start justify-between">
              <h2 className="font-sans text-sm md:text-md font-bold tracking-tight text-zinc-100 leading-snug">
                {video.title}
              </h2>
              <button
                id="theater-close-btn"
                onClick={onClose}
                className="rounded-lg bg-zinc-900 border border-zinc-800/80 p-1.5 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100 text-zinc-400 transition"
                title="Back to feed"
              >
                Close View
              </button>
            </div>
            
            <div className="flex flex-wrap items-center space-x-3.5 font-mono text-[11px] text-zinc-500 pt-1">
              <span>{(video.views / 1000).toFixed(0)}K views</span>
              <span>•</span>
              <span>Released {video.uploadedAt}</span>
              <span>•</span>
              <span className="text-emerald-500 uppercase font-semibold">{video.category}</span>
            </div>
          </div>

          <hr className="border-zinc-900" />

          {/* Social actions bar & subscribing channel info */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Creator Profile Detail */}
            <div className="flex items-center space-x-3">
              <div
                onClick={() => onNavigateToUser(video.uploaderName)}
                className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-zinc-950 font-bold flex items-center justify-center font-mono hover:rotate-12 transition2 cursor-pointer"
                title="View Creator Profile"
              >
                {video.uploaderName[0]}
              </div>
              <div className="flex flex-col">
                <span
                  onClick={() => onNavigateToUser(video.uploaderName)}
                  className="font-sans text-xs font-bold text-zinc-100 flex items-center space-x-1 cursor-pointer hover:text-emerald-400 transition hover:underline"
                  title="View Creator Profile"
                >
                  <span>{video.uploaderName}</span>
                  <Check className="h-3 w-3 bg-emerald-500 text-zinc-950 rounded-full p-0.5 inline-block" />
                </span>
                <span className="font-mono text-[10px] text-zinc-550">
                  {((video.uploaderSubscribers + (isSubscribed ? 1 : 0)) / 1000).toFixed(1)}K subscribers
                </span>
              </div>

              {/* Sub Button */}
              <button
                id="uploader-sub-action"
                onClick={handleToggleSubscribe}
                className={`ml-4 rounded-full py-1.5 px-4 text-xs font-semibold tracking-wide transition active:scale-95 ${
                  isSubscribed
                    ? "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200"
                    : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 hover:shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                }`}
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            </div>

            {/* Like and general share actions row */}
            <div className="flex items-center space-x-2.5">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1.5 rounded-full py-1.5 px-4.5 border text-xs font-semibold transition active:scale-95 ${
                  isLiked
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <ThumbsUp className="h-4.5 w-4.5 mr-1" />
                <span>{isLiked ? (video.likes + 1).toLocaleString() : video.likes.toLocaleString()}</span>
              </button>

              <div className="relative">
                <button
                  onClick={handleShareVideo}
                  className="flex items-center space-x-1 rounded-full py-1.5 px-3.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-semibold transition"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  <span>Share</span>
                </button>
                {showShareTooltip && (
                  <div className="absolute bottom-10 left-1/2 -translate-y-1 -translate-x-1/2 bg-zinc-900 text-zinc-200 border border-zinc-800 text-[10px] font-mono rounded px-2.5 py-1 shadow-md w-32 text-center animate-bounce">
                    Link copied to clipboard!
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="border-zinc-900" />

          {/* Description section */}
          <div className="space-y-1.5">
            <h5 className="font-mono text-[9px] uppercase tracking-wider text-zinc-550 font-bold">
              Video Description
            </h5>
            <p className="font-sans text-xs text-zinc-400 leading-relaxed font-normal whitespace-pre-wrap">
              {video.description}
            </p>
          </div>
        </div>

        {/* Creator tipping portal panel box */}
        {video.monetized && (
          <div id="tipping-portal" className="border border-zinc-900 rounded-2xl bg-zinc-950 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4.5 w-4.5 text-emerald-500" />
                <h3 className="font-sans text-xs font-bold text-zinc-100 uppercase tracking-wider">
                  Support Creator with Cash Tips
                </h3>
              </div>
              <span className="font-mono text-[10px] text-zinc-550">
                Direct split: 90% creator, 10% platform
              </span>
            </div>

            <p className="font-sans text-[11px] text-zinc-400">
              Show your appreciation for uploader <span className="text-emerald-400 font-semibold">{video.uploaderName}</span>. Tipping deducts instantly from your virtual wallet balance and increases uploader metrics!
            </p>

            {/* Price values strip button items */}
            <div className="grid grid-cols-4 gap-2.5 pt-1">
              {[2, 5, 10, 20].map((val) => (
                <button
                  key={val}
                  id={`btn-tip-${val}`}
                  onClick={() => handleTipCreator(val)}
                  className="flex flex-col items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-2.5 hover:border-emerald-500/35 hover:bg-emerald-500/5 hover:-translate-y-0.5 transition"
                >
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  <span className="font-mono font-bold text-xs text-zinc-100">${val}</span>
                  <span className="font-mono text-[8px] text-zinc-500 mt-0.5">SEND TIP</span>
                </button>
              ))}
            </div>

            {/* Pi Network Tipping Option */}
            <div className="flex items-center space-x-2 my-2 mt-3">
              <div className="h-px bg-zinc-900 flex-1"></div>
              <span className="font-sans text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center space-x-1 shrink-0">
                <span className="text-amber-400 font-extrabold text-xs">π</span>
                <span>or support with Pi Blockchain network</span>
              </span>
              <div className="h-px bg-zinc-900 flex-1"></div>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {[0.1, 0.5, 1.0, 5.0].map((val) => (
                <button
                  key={`pi-tip-${val}`}
                  id={`btn-pi-tip-${val}`}
                  disabled={piTipLoading}
                  onClick={() => handlePiTipCreator(val)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2.5 transition active:scale-95 ${
                    piTipLoading
                      ? "border-zinc-900 bg-zinc-950/40 text-zinc-600 cursor-not-allowed"
                      : "border-amber-500/20 bg-amber-500/5 hover:border-amber-400 hover:bg-amber-500/10 text-amber-400"
                  }`}
                >
                  {piTipLoading ? (
                    <div className="w-4 h-4 border-2 border-amber-500/20 border-t-amber-400 rounded-full animate-spin my-1" />
                  ) : (
                    <span className="font-extrabold text-amber-400 text-sm font-sans my-0.5">π</span>
                  )}
                  <span className="font-mono font-bold text-xs text-zinc-100">{val} π</span>
                  <span className="font-mono text-[8.5px] text-amber-500/80 mt-0.5 uppercase tracking-wide">
                    {piTipLoading ? "Syncing" : "Send Pi"}
                  </span>
                </button>
              ))}
            </div>


            {/* Error and success reporting grids */}
            {tipSuccessMsg && (
              <div className="flex items-center space-x-2 text-xs border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 px-3.5 py-2.5 rounded-xl animate-fade-in font-sans">
                <Sparkles className="h-4 w-4 shrink-0 text-emerald-500 animate-spin" />
                <span>{tipSuccessMsg}</span>
              </div>
            )}

            {tipErrorMsg && (
              <div className="flex items-center space-x-2 text-xs border border-rose-500/20 bg-rose-500/5 text-rose-400 px-3.5 py-2.5 rounded-xl animate-shake font-sans">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{tipErrorMsg}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Discussion comments section right column panel */}
      <div id="comments-column" className="lg:col-span-1 space-y-4">
        <div className="border border-zinc-900 rounded-2xl bg-zinc-950 p-4 h-[calc(100vh-10rem)] flex flex-col justify-between">
          <div className="space-y-4 flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-xs font-bold text-zinc-100 uppercase tracking-wider">
                Comments ({localComments.length})
              </h3>
              <span className="font-mono text-[9px] text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                Moderation Enabled
              </span>
            </div>

            {/* Comment Scroll Body list */}
            <div id="comments-scroller" className="flex-1 overflow-y-auto space-y-4 pr-1">
              {localComments.map((comment) => (
                <div key={comment.id} id={`comment-row-${comment.id}`} className="space-y-1.5 border-b border-zinc-900 pb-3 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`h-6.5 w-6.5 rounded-full ${comment.avatarColor} text-zinc-950 font-bold text-[10px] flex items-center justify-center font-mono`}>
                        {comment.author[0]}
                      </div>
                      <span className={`font-sans text-xs font-bold ${comment.isCreator ? 'text-emerald-400' : 'text-zinc-200'}`}>
                        {comment.author}
                      </span>
                      {comment.isCreator && (
                        <span className="font-mono text-[7.5px] font-bold text-zinc-950 bg-emerald-500 px-1 rounded uppercase tracking-tight">
                          Creator
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[9px] text-zinc-550">
                      {comment.timestamp}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-zinc-400 pl-8 font-light">
                    {comment.text}
                  </p>
                  
                  {/* Action upvote row for individual comments */}
                  <div className="pl-8 flex items-center pt-1 animate-fade-in">
                    <button
                      id={`comment-like-${comment.id}`}
                      type="button"
                      onClick={() => handleToggleLikeComment(comment.id)}
                      className={`flex items-center space-x-1.5 focus:outline-none transition-all duration-200 active:scale-95 group/btn ${
                        likedCommentIds.includes(comment.id)
                          ? "text-emerald-400 font-semibold"
                          : "text-zinc-500 hover:text-zinc-350"
                      }`}
                      title={likedCommentIds.includes(comment.id) ? "Unlike comment" : "Like comment"}
                    >
                      <ThumbsUp className={`h-3 w-3 transition-transform duration-200 ${
                        likedCommentIds.includes(comment.id)
                          ? "scale-110 fill-emerald-400/20 text-emerald-400"
                          : "group-hover/btn:scale-110"
                      }`} />
                      <span className="font-mono text-[10px] select-none">
                        {comment.likes}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comment submission form layout */}
          <form onSubmit={handleAddComment} className="border-t border-zinc-900 pt-3 flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                id="comment-input-field"
                type="text"
                placeholder="Say something nice about this video..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                maxLength={200}
                className="w-full rounded-full border border-zinc-800 bg-zinc-900/60 py-2 pl-4 pr-10 text-xs font-sans text-zinc-200 placeholder-zinc-550 focus:border-emerald-500/50 focus:bg-zinc-900/80 outline-none"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[8px] text-zinc-600">
                {commentInput.length}/200
              </span>
            </div>
            <button
              id="comment-submit-action"
              type="submit"
              disabled={!commentInput.trim()}
              className="rounded-full bg-emerald-500 text-zinc-900 p-2 hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500 transition active:scale-95"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
