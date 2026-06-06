/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Video, Comment, UserWallet } from "../types";
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
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.75);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  
  // Global liking derivation
  const isLiked = likedVideoIds.includes(video.id);
  const [showShareTooltip, setShowShareTooltip] = useState<boolean>(false);

  // Comments state
  const [localComments, setLocalComments] = useState<Comment[]>(video.comments);
  const [commentInput, setCommentInput] = useState<string>("");
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);

  const handleToggleLikeComment = (commentId: string) => {
    const isCommentLiked = likedCommentIds.includes(commentId);
    if (isCommentLiked) {
      setLikedCommentIds((prev) => prev.filter((id) => id !== commentId));
      setLocalComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, likes: Math.max(0, c.likes - 1) } : c))
      );
      triggerSound(350, 80, "sine");
    } else {
      setLikedCommentIds((prev) => [...prev, commentId]);
      setLocalComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c))
      );
      triggerSound(880, 80, "sine");
    }
  };

  // Tipping states
  const [tipSuccessMsg, setTipSuccessMsg] = useState<string>("");
  const [tipErrorMsg, setTipErrorMsg] = useState<string>("");

  // Ad simulation states
  const [adActive, setAdActive] = useState<boolean>(false);
  const [adTimeRemaining, setAdTimeRemaining] = useState<number>(5);
  const [adsEncountered, setAdsEncountered] = useState<boolean>(false);

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
    
    // Trigger ad if monetized and NOT premium, only if not yet encountered
    if (video.monetized && !isPremiumUser && !adsEncountered) {
      setAdActive(true);
      setAdTimeRemaining(6);
      setIsPlaying(false);
    } else {
      setAdActive(false);
      setIsPlaying(true);
    }
  }, [video, isPremiumUser]);

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

  // Canvas render animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameCount = 0;
    canvas.width = 720;
    canvas.height = 405;

    const render = () => {
      frameCount++;
      const w = canvas.width;
      const h = canvas.height;

      // Dark futuristic overlay background
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, w, h);

      if (adActive) {
        // Draw Ad Graphic visualizer
        ctx.fillStyle = "rgba(245, 158, 11, 0.05)";
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = "rgba(245, 158, 11, 0.2)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < w; i += 20) {
          ctx.moveTo(i, 0);
          ctx.lineTo(i - 100, h);
        }
        ctx.stroke();

        ctx.font = "bold 20px sans-serif";
        ctx.fillStyle = "#f59e0b";
        ctx.textAlign = "center";
        ctx.fillText("CICADA SPRAY REPELLENT INC.", w / 2, h / 2 - 30);

        ctx.font = "13px monospace";
        ctx.fillStyle = "#a1a1aa";
        ctx.fillText("Keeping Swarms Safe and Quiet Nationwide", w / 2, h / 2);

        // Rotating golden shield
        ctx.strokeStyle = "#f59e0b";
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
              ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
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
  }, [video, isPlaying, adActive]);

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
      author: "m.tealieb2014",
      avatarColor: "bg-amber-500",
      text: commentInput.trim(),
      likes: 0,
      timestamp: "Just now",
    };

    setLocalComments([newComment, ...localComments]);
    setCommentInput("");
    triggerSound(440, 120, "triangle");
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
          text: `Thank you so much m.tealieb2014 for your wonderful tip of $${amount}! This support fuels my channel. 💚`,
          likes: 5,
          timestamp: "Just now",
          isCreator: true,
        };
        setLocalComments((prev) => [creatorCommentResponse, ...prev]);
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
              <div className="flex justify-between items-center bg-zinc-900/90 rounded-xl px-4 py-2 border border-emerald-500/10">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest">
                    Sponsored Ad Stream
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

              {/* Countdown actions bottom panel */}
              <div className="flex justify-end items-end w-full">
                {adTimeRemaining > 1 ? (
                  <div className="rounded-lg bg-zinc-900/95 border border-zinc-800 px-4 py-2 font-mono text-xs text-zinc-350">
                    Video resumes in <span className="text-emerald-500 font-bold">{adTimeRemaining - 1}s</span>
                  </div>
                ) : (
                  <button
                    onClick={handleCompleteAd}
                    className="flex items-center space-x-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2 font-mono text-xs font-bold transition shadow-lg active:scale-95"
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

              {/* Speed configurations */}
              <div className="flex items-center space-x-3.5">
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
