/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  User, 
  Shield, 
  Activity, 
  Wallet, 
  Bell, 
  Settings, 
  Sliders, 
  Radio, 
  Volume2, 
  Play, 
  Heart, 
  Eye, 
  FileText, 
  Coins, 
  CheckCircle,
  HelpCircle,
  Unlock,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { UserWallet, Notification, Video } from "../types";

interface UserDashboardProps {
  piUser: { username: string; uid: string } | null;
  wallet: UserWallet;
  videos: Video[];
  likedVideoIds: string[];
  viewedVideoIds: string[];
  subscribedUploaders: string[];
  notifications: Notification[];
  userBios: Record<string, string>;
  onNavigateToUser: (username: string) => void;
  onUpgradePremium: () => void;
  onDepositFunds: (amount: number) => void;
  onClearNotifications: () => void;
  setActiveTab: (tab: string) => void;
}

export default function UserDashboard({
  piUser,
  wallet,
  videos,
  likedVideoIds,
  viewedVideoIds,
  subscribedUploaders,
  notifications,
  userBios,
  onNavigateToUser,
  onUpgradePremium,
  onDepositFunds,
  onClearNotifications,
  setActiveTab,
}: UserDashboardProps) {
  // Soundscape Tuning synthesizer controls
  const [synthFreq, setSynthFreq] = useState<number>(440);
  const [synthDur, setSynthDur] = useState<number>(250);
  const [oscType, setOscType] = useState<OscillatorType>("sine");
  const [audioTesting, setAudioTesting] = useState<boolean>(false);
  const [hatchAlertEnabled, setHatchAlertEnabled] = useState<boolean>(true);
  const [lowDataMode, setLowDataMode] = useState<boolean>(false);
  const [depositAmt, setDepositAmt] = useState<number>(25);

  // Stats summaries
  const totalLikes = likedVideoIds.length;
  const totalViews = viewedVideoIds.length;
  const totalSubs = subscribedUploaders.length;
  const unreadNotifications = notifications.filter(n => !n.read).length;
  
  // Calculate total spent/tipped by reading history
  const totalTipsSent = wallet.history
    .filter(h => h.type === "tip_sent")
    .reduce((sum, h) => sum + h.amount, 0);

  const totalPremiumUnlocked = wallet.history
    .filter(h => h.type === "premium_unlock" || h.type === "premium_sub")
    .length > 0;

  // Retrieve current active user profile properties
  const currentUsername = piUser ? piUser.username : "m.tealieb2014";
  const userBio = userBios[currentUsername] || "Soundscape coordinator, periodical enthusiast, and global insect node observer.";

  // Visual oscillator canvas reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Frequency Synthesizer sound triggers
  const triggerBeep = (freq: number, durMs: number, type: OscillatorType) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.value = freq;

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durMs / 1000);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durMs / 1000);

      setAudioTesting(true);
      setTimeout(() => setAudioTesting(false), durMs);
    } catch (e) {
      console.warn("AudioContext init error: ", e);
    }
  };

  const handleTestTuningSynth = () => {
    triggerBeep(synthFreq, synthDur, oscType);
  };

  // Quick Preset Frequency setups
  const applyPresetFreq = (hz: number, type: OscillatorType) => {
    setSynthFreq(hz);
    setOscType(type);
    triggerBeep(hz, 200, type);
  };

  // Drawing background animated oscilloscope telemetry graphics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let tick = 0;
    const renderWaveform = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const amp = audioTesting ? 22 : 4;
      const freqMultiplier = audioTesting ? 0.045 : 0.015;

      // Vertical grids
      ctx.strokeStyle = "rgba(16, 185, 129, 0.03)";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 25) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
      ctx.lineWidth = audioTesting ? 2 : 1;
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.sin(x * freqMultiplier + tick) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      tick += 0.04;
      animationRef.current = requestAnimationFrame(renderWaveform);
    };

    renderWaveform();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [audioTesting]);

  return (
    <div id="user-dashboard-wrapper" className="animate-fade-in space-y-6 pb-12 max-w-6xl mx-auto">
      
      {/* Page Title & Overview */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-5">
        <div>
          <span className="font-mono text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest block mb-1">
            Centred Telemetry Node
          </span>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <Sliders className="h-6 w-6 text-emerald-400" />
            <span>Telemetry User Dashboard</span>
          </h1>
          <p className="font-sans text-xs text-zinc-400 mt-1">
            Check recent network transactions, customize custom soundwave alerts, and oversee your synchronized Transmitter telemetry data.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-mono text-[10px] text-zinc-500 uppercase">
            Active session:
          </span>
          <span className="bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded-xl font-mono text-[11px] text-emerald-400 font-bold">
            @{currentUsername}
          </span>
        </div>
      </div>

      {/* Grid Block Core Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. PROFILE TELEMETRY NODECARD */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl -z-10" />
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3.5">
              <div id="profile-nodecard-avatar" className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-sans text-2xl font-extrabold text-zinc-950 shadow-md">
                {currentUsername.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-mono text-[8px] font-bold text-zinc-550 uppercase tracking-widest block">
                  IDENTITY TRANSCEIVER
                </span>
                <h3 className="font-sans text-base font-bold text-white truncate mt-0.5">
                  @{currentUsername}
                </h3>
                <span className="font-sans text-[10px] text-emerald-400 font-medium flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Aligned Swarm Synced</span>
                </span>
              </div>
            </div>

            <div className="bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-850">
              <span className="font-mono text-[8px] text-zinc-550 uppercase tracking-wider font-extrabold block mb-1">
                Telemetry Station Bio
              </span>
              <p className="font-sans text-[11.5px] leading-relaxed text-zinc-350 italic">
                "{userBio}"
              </p>
            </div>

            {/* Profile Metrics Split lists */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-900 text-center">
              <div className="bg-zinc-900/40 p-2 rounded-xl">
                <span className="font-mono text-[8px] text-zinc-500 block uppercase font-bold">Liked</span>
                <span className="font-sans text-sm font-extrabold text-white block mt-1">{totalLikes}</span>
              </div>
              <div className="bg-zinc-900/40 p-2 rounded-xl">
                <span className="font-mono text-[8px] text-zinc-500 block uppercase font-bold">Views</span>
                <span className="font-sans text-sm font-extrabold text-white block mt-1">{totalViews}</span>
              </div>
              <div className="bg-zinc-900/40 p-2 rounded-xl">
                <span className="font-mono text-[8px] text-zinc-500 block uppercase font-bold">Followed</span>
                <span className="font-sans text-sm font-extrabold text-white block mt-1">{totalSubs}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-900 space-y-2">
            <button
              onClick={() => setActiveTab("profile")}
              className="w-full text-center py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-100 font-sans text-xs font-semibold border border-zinc-850 hover:border-zinc-700 transition cursor-pointer"
            >
              Configure Public Profile
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className="w-full text-center py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-sans text-xs font-bold transition cursor-pointer"
            >
              Reset / Change Identity
            </button>
          </div>
        </div>

        {/* 2. LEDGER WALLET HUB PREVIEW */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Wallet className="h-4 w-4 text-emerald-400" />
                <span>Wallet Seeding Ledgers</span>
              </h3>
              <span className="font-mono text-[10px] text-zinc-550">
                USD Balance
              </span>
            </div>

            {/* Giant Balance readout */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 rounded-2xl border border-zinc-850 flex items-center justify-between">
              <div>
                <span className="font-mono text-[8px] text-zinc-550 block font-bold uppercase tracking-wider">
                  Available Reserves
                </span>
                <span className="font-sans text-2xl font-extrabold text-emerald-400 block mt-1">
                  ${wallet.balance.toFixed(2)}
                </span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Coins className="h-5 w-5" />
              </div>
            </div>

            {/* Pi Network Info readout */}
            <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 text-left">
              <div className="flex justify-between items-center">
                <span className="font-sans text-[11px] font-bold text-amber-400 flex items-center space-x-1.5">
                  <span className="font-extrabold text-sm leading-none">π</span>
                  <span>Pi Blockchain Connectivity</span>
                </span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  piUser ? 'bg-amber-500/20 text-amber-300' : 'bg-zinc-900 text-zinc-500'
                }`}>
                  {piUser ? "ACTIVE SYNCED" : "SANDBOX"}
                </span>
              </div>
              <p className="font-sans text-[10px] text-zinc-400 mt-1 lines-clamp-2">
                {piUser 
                  ? "Pi payments module linked directly to security core. Double verified with Payments scope permissions." 
                  : "Using transient testnet environment. Click authenticate on top header to sync full Pi wallet ledger."
                }
              </p>
            </div>

            {/* Micro transaction quick list */}
            <div>
              <span className="font-mono text-[8px] text-zinc-550 uppercase tracking-widest font-extrabold block mb-2">
                Recent Ledger Logs ({wallet.history.slice(0, 2).length})
              </span>
              <div className="space-y-1.5">
                {wallet.history.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-left bg-zinc-900/30 p-2 rounded-xl text-[10px]">
                    <div className="min-w-0 pr-2">
                      <p className="font-sans font-bold text-zinc-300 truncate">{item.description}</p>
                      <p className="font-mono text-[8px] text-zinc-500 mt-0.5">{item.date}</p>
                    </div>
                    <span className={`font-mono font-bold shrink-0 ${
                      item.type === "tip_sent" || item.type === "premium_sub" || item.type === "withdrawal"
                        ? "text-rose-400"
                        : "text-emerald-400"
                    }`}>
                      {item.type === "tip_sent" || item.type === "premium_sub" || item.type === "withdrawal" ? "-" : "+"}
                      ${item.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick wallet actions */}
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-zinc-900">
            <button
              onClick={() => setActiveTab("wallet")}
              className="w-full text-center py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-100 font-sans text-xs font-semibold border border-zinc-850 hover:border-zinc-700 transition cursor-pointer"
            >
              Manage Wallet
            </button>
            <button
              onClick={() => onUpgradePremium()}
              className="w-full text-center py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-550 text-zinc-950 font-sans text-xs font-bold transition hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] cursor-pointer"
            >
              Upgrade Node
            </button>
          </div>
        </div>

        {/* 3. HARDWARE SYNTH TUNER */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                <span>Microtonal Synthesizer</span>
              </h3>
              <div className="px-1.5 py-0.5 bg-emerald-500/5 text-emerald-400 rounded text-[9px] font-mono font-bold border border-emerald-500/10">
                17-Year Swarm (Brood XIX)
              </div>
            </div>

            <div className="rounded-xl overflow-hidden bg-zinc-900 relative">
              <canvas ref={canvasRef} height={60} className="w-full h-[60px] block" />
              <div className="absolute inset-x-0 bottom-1 flex justify-center">
                <span className="font-mono text-[7px] text-zinc-650 uppercase tracking-widest leading-none">
                  Acoustic Oscilloscope Stream
                </span>
              </div>
            </div>

            {/* Slider tuning controls */}
            <div className="space-y-3">
              {/* Frequency slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-zinc-450">
                  <span className="font-bold flex items-center space-x-1">
                    <Sliders className="h-2.5 w-2.5" />
                    <span>Oscillator Base Frequency</span>
                  </span>
                  <span className="font-bold text-emerald-400">{synthFreq} Hz</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="3500"
                  value={synthFreq}
                  onChange={(e) => {
                    const hz = Number(e.target.value);
                    setSynthFreq(hz);
                    triggerBeep(hz, 50, oscType);
                  }}
                  className="w-full accent-emerald-500 bg-zinc-850 h-1 rounded cursor-pointer"
                />
              </div>

              {/* Duration slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-zinc-450">
                  <span className="font-bold">Emitted Pulse Duration</span>
                  <span className="font-bold text-emerald-400">{synthDur} ms</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  value={synthDur}
                  onChange={(e) => setSynthDur(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-zinc-850 h-1 rounded cursor-pointer"
                />
              </div>

              {/* Oscillator waveform switches */}
              <div className="space-y-1.5 text-left">
                <span className="text-[9.5px] font-mono text-zinc-500 font-bold block">
                  Select Waveshape Vector
                </span>
                <div className="grid grid-cols-4 gap-1">
                  {(["sine", "square", "triangle", "sawtooth"] as OscillatorType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setOscType(type);
                        triggerBeep(synthFreq, 120, type);
                      }}
                      className={`text-[9px] font-mono capitalize py-1 px-1.5 rounded transition ${
                        oscType === type
                          ? "bg-emerald-500 text-zinc-950 font-bold"
                          : "bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border border-zinc-850"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fast presets selection */}
              <div className="pt-2 border-t border-zinc-900 text-left">
                <span className="text-[9.5px] font-mono text-zinc-550 uppercase font-bold block mb-1">
                  Preset Swarm Frequencies
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => applyPresetFreq(85, "sine")}
                    className="text-[8px] font-mono font-bold bg-zinc-900 border border-zinc-850 text-zinc-450 hover:text-white px-2 py-0.5 rounded"
                  >
                    85Hz Drone
                  </button>
                  <button
                    onClick={() => applyPresetFreq(240, "triangle")}
                    className="text-[8px] font-mono font-bold bg-zinc-900 border border-zinc-850 text-zinc-450 hover:text-white px-2 py-0.5 rounded"
                  >
                    240Hz Brood
                  </button>
                  <button
                    onClick={() => applyPresetFreq(880, "sine")}
                    className="text-[8px] font-mono font-bold bg-zinc-900 border border-zinc-850 text-zinc-450 hover:text-white px-2 py-0.5 rounded"
                  >
                    880Hz Swarm
                  </button>
                  <button
                    onClick={() => applyPresetFreq(1800, "sawtooth")}
                    className="text-[8px] font-mono font-bold bg-zinc-900 border border-zinc-850 text-zinc-450 hover:text-white px-2 py-0.5 rounded"
                  >
                    1.8kHz Flutter
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleTestTuningSynth}
            className="w-full text-center py-2.5 rounded-xl bg-zinc-900 hover:bg-emerald-500 text-zinc-300 hover:text-zinc-950 font-sans text-xs font-bold border border-zinc-850 hover:border-emerald-500 transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-inner"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Harmonize Frequency Pulse</span>
          </button>
        </div>

      </div>

      {/* LOWER SECTION COMPREHENSIVE ACTIVITY & SETTINGS BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COMPONENT: RECENT SYSTEM SIGNAL NOTIFICATIONS (8 columns) */}
        <div className="lg:col-span-8 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <h3 className="font-sans text-xs font-bold text-zinc-350 uppercase tracking-widest flex items-center space-x-2">
              <Bell className="h-4 w-4 text-emerald-400" />
              <span>Personal Telemetry Broadcast Logs ({unreadNotifications} unread)</span>
            </h3>
            <button
              onClick={onClearNotifications}
              disabled={notifications.length === 0}
              className={`font-mono text-[9px] uppercase tracking-wider px-2.5 py-1 rounded transition border ${
                notifications.length === 0
                  ? "border-transparent text-zinc-600 cursor-not-allowed"
                  : "border-zinc-850 hover:border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              Clear Logs
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="py-12 border border-dashed border-zinc-900 rounded-2xl text-center space-y-2">
              <CheckCircle className="h-7 w-7 text-emerald-500/20 mx-auto" />
              <p className="font-sans text-xs text-zinc-550 leading-relaxed max-w-sm mx-auto">
                All telemetry lines report zero backlog. Perfect synchronization with incoming soundscape transmitters has been established.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3.5 relative overflow-hidden ${
                    item.read
                      ? "border-zinc-900 bg-zinc-950 text-zinc-400"
                      : "border-emerald-500/10 bg-emerald-500/5 text-zinc-100"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 block" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-sans text-xs font-bold text-zinc-200">
                        {item.title}
                      </span>
                      <span className="font-mono text-[8px] text-zinc-555">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-zinc-400 mt-1 leading-normal pr-5">
                      {item.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COMPONENT: PREFERENCES & CLIENT HARDENING TABS (4 columns) */}
        <div className="lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-4">
          <div className="border-b border-zinc-900 pb-3 text-left">
            <h3 className="font-sans text-xs font-bold text-zinc-350 uppercase tracking-widest flex items-center space-x-2">
              <Settings className="h-4 w-4 text-emerald-400" />
              <span>Transmitter Settings</span>
            </h3>
          </div>

          <div className="space-y-4">
            {/* Preferences 1: Hatch alert notification tone switcher */}
            <div className="flex items-center justify-between p-1">
              <div>
                <span className="font-sans text-xs font-bold text-zinc-350 block">Auditory Alarm Alerts</span>
                <span className="font-sans text-[10.5px] text-zinc-500 leading-normal block mt-0.5">
                  Play synthesizer beeps on active streaming events.
                </span>
              </div>
              <button
                onClick={() => {
                  setHatchAlertEnabled(!hatchAlertEnabled);
                  triggerBeep(330, 80, "sine");
                }}
                className={`transition duration-200 shrink-0 ${hatchAlertEnabled ? "text-emerald-400" : "text-zinc-650"}`}
              >
                {hatchAlertEnabled ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
              </button>
            </div>

            {/* Preferences 2: Eco Saver Low data mode */}
            <div className="flex items-center justify-between p-1 pt-3 border-t border-zinc-900/60">
              <div>
                <span className="font-sans text-xs font-bold text-zinc-350 block">High Fidelity Swarms</span>
                <span className="font-sans text-[10.5px] text-zinc-500 leading-normal block mt-0.5">
                  Toggle low data rate for continuous background ambient recordings.
                </span>
              </div>
              <button
                onClick={() => {
                  setLowDataMode(!lowDataMode);
                  triggerBeep(330, 80, "sine");
                }}
                className={`transition duration-200 shrink-0 ${lowDataMode ? "text-emerald-400" : "text-zinc-650"}`}
              >
                {lowDataMode ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
              </button>
            </div>

            {/* Quick action: Seeding ATM trigger inside dashboard */}
            <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-850 space-y-3 pt-3 text-left">
              <div>
                <span className="font-sans text-xs font-bold text-zinc-300 block">
                  Simulated Deposit Terminal
                </span>
                <span className="font-sans text-[10.5px] text-zinc-500 leading-snug block mt-0.5">
                  Need extra test funds? Top up your simulated wallet reserves.
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={depositAmt}
                  onChange={(e) => setDepositAmt(Number(e.target.value))}
                  className="w-1/2 rounded-xl bg-zinc-950 border border-zinc-800 py-1.5 px-2.5 font-mono text-xs text-white placeholder-zinc-700 outline-none focus:border-emerald-500/50"
                />
                <button
                  onClick={() => {
                    onDepositFunds(depositAmt);
                    triggerBeep(1200, 150, "sine");
                  }}
                  className="w-1/2 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-sans text-xs font-bold leading-none cursor-pointer text-center"
                >
                  Deposit ${depositAmt}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <div className="bg-zinc-900/20 border border-zinc-850 p-3 rounded-2xl text-[10px] text-zinc-500 leading-normal space-y-1 mt-1 text-left">
                <p className="font-sans font-bold text-zinc-400 flex items-center space-x-1">
                  <HelpCircle className="h-3 w-3 inline text-emerald-400" />
                  <span>Telemetry Node Verified</span>
                </p>
                <p className="font-sans">
                  Node aligns with the global Brood XIX taxidermy databases. Peer-to-peer Pi browser authentication manages direct client validation.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
