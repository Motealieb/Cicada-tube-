/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { LiveStream, UserWallet } from "../types";
import { DEFAULT_AI_CHAT_MESSAGES } from "../data";
import { Send, Tv, Eye, Sparkles, DollarSign, Volume2, VolumeX, Flame } from "lucide-react";

interface LiveStreamViewProps {
  stream: LiveStream;
  wallet: UserWallet;
  onDeductWallet: (amount: number, desc: string) => boolean;
}

interface ChatMsg {
  id: string;
  user: string;
  text: string;
  avatarColor: string;
  isSuperChat?: boolean;
  amount?: number;
  color?: string;
  timestamp: string;
}

export default function LiveStreamView({ stream, wallet, onDeductWallet }: LiveStreamViewProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [liveViewers, setLiveViewers] = useState<number>(stream.viewerCount);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    { id: "cm-s1", user: "BeatMaker99", text: "Absolute masterpiece stream tonight, love from Berlin! ✨", avatarColor: "bg-amber-600", isSuperChat: true, amount: 15.0, color: "from-amber-600 to-amber-500", timestamp: "5m ago" },
    { id: "cm-s2", user: "BioNerd", text: "Supporting the continuous nature broadcast, we love periodical swarms!", avatarColor: "bg-purple-600", isSuperChat: true, amount: 50.0, color: "from-purple-600 to-indigo-600", timestamp: "2m ago" }
  ]);
  const [chatInput, setChatInput] = useState<string>("");

  // Tipping states
  const [superChatAmount, setSuperChatAmount] = useState<number>(10);
  const [superChatMessage, setSuperChatMessage] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const chatScrollerRef = useRef<HTMLDivElement | null>(null);

  // Sound generator
  const triggerBeep = (freq: number, type: OscillatorType = "sine") => {
    if (isMuted) return;
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
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  // Scroll chat down when posts arrive
  useEffect(() => {
    if (chatScrollerRef.current) {
      chatScrollerRef.current.scrollTop = chatScrollerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Handle rolling chat message arrival simulator
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        // Randomly adjust viewers
        setLiveViewers((prev) => Math.max(12000, prev + Math.floor((Math.random() - 0.5) * 20)));

        // Create random user post
        const activeUsersList = ["HatchLover", "GreenLeaf7", "CicadaBeats", "SoundScapist", "EntoFan_8", "LarvaStudying", "SummerSolstice", "BassVibe"];
        const colors = ["bg-blue-600", "bg-emerald-600", "bg-indigo-600", "bg-amber-600", "bg-rose-600", "bg-sky-600", "bg-yellow-600"];
        
        const randomUser = activeUsersList[Math.floor(Math.random() * activeUsersList.length)];
        const randomText = DEFAULT_AI_CHAT_MESSAGES[Math.floor(Math.random() * DEFAULT_AI_CHAT_MESSAGES.length)];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newMsg: ChatMsg = {
          id: `chat-${Date.now()}-${Math.random()}`,
          user: randomUser,
          text: randomText,
          avatarColor: randomColor,
          timestamp: "Just now"
        };

        setChatMessages((prev) => [...prev.slice(-35), newMsg]); // Keep last 35 to prevent scroll memory leaks
        
        // Quiet atmospheric click sound to keep broadcast authentic
        if (Math.random() > 0.8) {
          triggerBeep(330, "sine");
        }
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isMuted]);

  // Audio equalizer equalizer animation canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameCount = 0;
    canvas.width = 640;
    canvas.height = 360;

    const render = () => {
      frameCount++;
      const w = canvas.width;
      const h = canvas.height;

      // Dark futuristic aesthetic
      ctx.fillStyle = "#0c0a09";
      ctx.fillRect(0, 0, w, h);

      // Procedural sound equalizer
      ctx.fillStyle = "rgba(245, 158, 11, 0.04)";
      ctx.fillRect(0, h / 2 - 80, w, 160);

      const barWidth = 6;
      const barGap = 4;
      const barsCount = Math.floor(w / (barWidth + barGap));

      for (let i = 0; i < barsCount; i++) {
        const factor = Math.sin(i * 0.08 + frameCount * 0.05) * Math.cos(i * 0.03 + frameCount * 0.1);
        const barHeight = isPlaying
          ? (50 + factor * 80) * (1 + Math.sin(frameCount * 0.03) * 0.25)
          : 4;

        // Custom golden gradient spectrum
        const gradient = ctx.createLinearGradient(0, h / 2 - barHeight / 2, 0, h / 2 + barHeight / 2);
        gradient.addColorStop(0, "#e11d48"); // Rose top
        gradient.addColorStop(0.5, "#f59e0b"); // Gold center
        gradient.addColorStop(1, "#10b981"); // Emerald bottom

        ctx.fillStyle = gradient;
        ctx.fillRect(i * (barWidth + barGap), h / 2 - barHeight / 2, barWidth, barHeight);
      }

      // Draw pulsating network circles overlaid
      if (isPlaying) {
        ctx.fillStyle = "rgba(245, 158, 11, 0.2)";
        for (let j = 0; j < 3; j++) {
          const r = ((frameCount + j * 90) % 270) * 0.5;
          ctx.strokeStyle = `rgba(245, 158, 11, ${Math.max(0, 1 - r / 135) * 0.2})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Brand tag watermark
      ctx.fillStyle = "rgba(244, 244, 245, 0.4)";
      ctx.font = "bold 9px monospace";
      ctx.fillText("⚫ RECORDING CH 1 BROADCAST", 20, 25);
      ctx.fillText("📡 24,000 HZ FIELD MICROPHONE ACTIVE", 20, 38);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  // Submit standard chat msg
  const handleSubmitChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMsg = {
      id: `chat-u-${Date.now()}`,
      user: "m.tealieb2014",
      text: chatInput.trim(),
      avatarColor: "bg-amber-500",
      timestamp: "Just now"
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    triggerBeep(880, "triangle");
  };

  // Submit tipping Super Chat msg
  const handleSendSuperChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (superChatAmount <= 0) return;

    const desc = `Direct stream support: Super Chat of $${superChatAmount.toFixed(2)}`;
    const success = onDeductWallet(superChatAmount, desc);

    if (success) {
      setErrorMsg("");
      setSuccessMsg(`Super Chat contribution of $${superChatAmount.toFixed(2)} posted!`);
      
      const scColors = ["from-amber-600 to-amber-500", "from-rose-600 to-amber-500", "from-purple-600 to-indigo-600", "from-emerald-600 to-teal-600"];
      const selectColor = scColors[Math.round(superChatAmount) % scColors.length];

      const superChatMsg: ChatMsg = {
        id: `superchat-${Date.now()}`,
        user: "m.tealieb2014",
        text: superChatMessage.trim() || "Supporting this awesome stream!",
        avatarColor: "bg-amber-500",
        isSuperChat: true,
        amount: superChatAmount,
        color: selectColor,
        timestamp: "Just now"
      };

      setChatMessages((prev) => [...prev, superChatMsg]);
      setSuperChatMessage("");
      triggerBeep(1200, "sine");

      // Auto clear success indicator
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      setSuccessMsg("");
      setErrorMsg("Insufficient Balance to trigger Super Chat. Go to Wallet tab to load capital.");
      triggerBeep(150, "sawtooth");
    }
  };

  return (
    <div id="live-stream-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stream equalizer camera view */}
      <div id="stream-display-col" className="lg:col-span-2 space-y-4">
        {/* Stream Canvas Player frame */}
        <div className="relative overflow-hidden rounded-2xl bg-stone-950 border border-zinc-90 w-full group shadow-2xl">
          <canvas
            ref={canvasRef}
            className="w-full aspect-video block cursor-pointer"
            onClick={() => setIsPlaying(!isPlaying)}
          />

          {/* Broadcast live markers */}
          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 rounded-full bg-rose-600 px-3 py-1 font-mono text-[10px] font-bold text-white uppercase tracking-wider animate-pulse shadow-md">
              <span className="h-1.5 w-1.5 rounded-full bg-white block animate-ping" />
              <span>Simulated Stream Live</span>
            </div>
            
            <div className="flex items-center space-x-1 rounded-full bg-zinc-950/80 border border-zinc-800/80 px-2.5 py-1 font-mono text-[10px] font-bold text-zinc-350">
              <Eye className="h-3.5 w-3.5 text-zinc-500" />
              <span>{liveViewers.toLocaleString()} view count</span>
            </div>
          </div>

          {/* Quick muting toggle overlay */}
          <div className="absolute bottom-4 right-4 z-10">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="rounded-full bg-zinc-950/90 border border-zinc-800 p-2 text-zinc-300 hover:text-amber-400 hover:scale-105 active:scale-95 transition shadow-lg"
            >
              {isMuted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        {/* Stream detailed markers */}
        <div id="live-details-card" className="border border-zinc-900 rounded-2xl bg-zinc-950 p-4 space-y-3.5">
          <div className="flex items-start justify-between flex-wrap gap-2.5">
            <div className="space-y-1">
              <h2 className="font-sans text-sm md:text-md font-bold tracking-tight text-zinc-100 leading-snug">
                {stream.title}
              </h2>
              <div className="flex items-center space-x-3 text-zinc-500 font-mono text-[10px]">
                <span>Host: <span className="text-zinc-350 font-bold">{stream.streamerName}</span></span>
                <span>•</span>
                <span>Cicada Network Station</span>
                <span>•</span>
                <span className="text-emerald-500 font-bold uppercase">{stream.category}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1.5 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1.5 rounded-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-400 block animate-ping" />
              <span className="font-mono text-[10px] font-bold text-emerald-400">Broadcaster Online</span>
            </div>
          </div>

          <hr className="border-zinc-900" />

          {/* General content background notes */}
          <div className="space-y-1">
            <h5 className="font-mono text-[9px] uppercase tracking-wider text-zinc-550 font-bold">
              Broadcast Intent Details
            </h5>
            <p className="font-sans text-xs text-zinc-400 leading-relaxed font-light">
              This continuously simulated nature equalizing monitor captures regional environmental stridulation events based on Brood conversions. Chat dynamically responds to biological metrics. Send Super Chats to see live tipping simulations!
            </p>
          </div>
        </div>

        {/* Super Chat Contribution form widget */}
        <div id="superchat-form-box" className="border border-zinc-900 rounded-2xl bg-zinc-950 p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
            <span className="font-sans text-xs font-bold text-zinc-100 uppercase tracking-wider">
              Pin a Super Chat Payment
            </span>
          </div>

          <p className="font-sans text-[11px] text-zinc-400">
            Deduct virtual coins from your balance to lock a glowing highlight message on the sidebar chat scroller!
          </p>

          <form onSubmit={handleSendSuperChat} className="space-y-3">
            <div className="grid grid-cols-4 gap-2.5">
              {[5, 10, 25, 50].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setSuperChatAmount(val)}
                  className={`py-2 rounded-xl text-center border font-mono text-xs transition duration-200 ${
                    superChatAmount === val
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-extrabold shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-750"
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2.5">
              <input
                id="superchat-text-input"
                type="text"
                maxLength={90}
                placeholder="Write a custom spotlight message..."
                value={superChatMessage}
                onChange={(e) => setSuperChatMessage(e.target.value)}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 px-4 text-xs text-zinc-200 placeholder-zinc-550 focus:border-emerald-500/40 outline-none"
              />
              <button
                id="superchat-send-action"
                type="submit"
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-zinc-950 font-sans text-xs font-bold px-4 py-2.5 hover:from-emerald-400 hover:to-teal-500 transition active:scale-95 shadow-md flex items-center space-x-1"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Tip Super Chat</span>
              </button>
            </div>

            {/* Notifications */}
            {successMsg && (
              <div className="text-xs border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 px-3 py-2 rounded-lg animate-fade-in font-sans">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="text-xs border border-rose-500/20 bg-rose-500/5 text-rose-400 px-3 py-2 rounded-lg animate-shake font-sans">
                {errorMsg}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Live scroll chat sidebar */}
      <div id="live-chat-col" className="lg:col-span-1 space-y-4">
        <div className="border border-zinc-900 rounded-2xl bg-zinc-950 p-4 h-[calc(100vh-10rem)] flex flex-col justify-between shadow-lg">
          <div className="space-y-4 flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-bold text-zinc-100 uppercase tracking-widest flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 block animate-pulse" />
                <span>Rolling Live Chat</span>
              </span>
              <span className="font-mono text-[9px] text-zinc-500 font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                AI Streams Connected
              </span>
            </div>

            {/* Message window scroller */}
            <div
              ref={chatScrollerRef}
              id="live-scroller-box"
              className="flex-1 overflow-y-auto space-y-3.5 pr-1"
            >
              {chatMessages.map((msg) => (
                <div key={msg.id} id={`chat-line-${msg.id}`}>
                  {msg.isSuperChat ? (
                    /* Display Super Chat block */
                    <div className={`rounded-xl overflow-hidden border border-emerald-500/25 bg-gradient-to-r ${msg.color || 'from-emerald-600 to-teal-500'} p-2.5 text-zinc-950 font-sans shadow-md`}>
                      <div className="flex justify-between items-center text-[10.5px] font-bold border-b border-zinc-950/20 pb-1.5">
                        <div className="flex items-center space-x-1.5 leading-none">
                          <div className="h-4.5 w-4.5 rounded-full bg-zinc-950 text-emerald-400 font-bold text-[8.5px] flex items-center justify-center font-mono">
                            {msg.user[0]}
                          </div>
                          <span className="text-zinc-900">{msg.user}</span>
                        </div>
                        <span className="bg-zinc-950 text-white rounded px-1.5 py-0.5 text-[9px] font-mono font-extrabold tracking-wider leading-none shadow">
                          ${msg.amount?.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11.5px] mt-1.5 font-medium leading-normal text-zinc-950">
                        {msg.text}
                      </p>
                    </div>
                  ) : (
                    /* Display normal chat row */
                    <div className="flex items-start space-x-2.5">
                      <div className={`h-6 w-6 shrink-0 rounded-full ${msg.avatarColor} text-zinc-950 font-bold text-[9px] flex items-center justify-center font-mono mt-0.5`}>
                        {msg.user[0]}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-baseline space-x-1.5">
                          <span className="font-sans text-[11px] font-semibold text-zinc-350 truncate">
                            {msg.user}
                          </span>
                          <span className="font-mono text-[8px] text-zinc-650 font-semibold">
                            {msg.timestamp}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-zinc-400 font-light pr-1">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Prompt submit form footer */}
          <form onSubmit={handleSubmitChat} className="border-t border-zinc-905 pt-3 flex items-center space-x-2">
            <input
              id="live-chat-input"
              type="text"
              placeholder="Send live chat message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              maxLength={70}
              className="flex-1 rounded-full border border-zinc-900 bg-zinc-900/60 py-2 px-4 text-xs font-sans text-zinc-200 placeholder-zinc-550 focus:border-emerald-500/30 outline-none"
            />
            <button
              id="live-chat-action"
              type="submit"
              disabled={!chatInput.trim()}
              className="rounded-full bg-emerald-500 text-zinc-900 p-2 hover:bg-emerald-400 disabled:opacity-35 transition active:scale-95"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
