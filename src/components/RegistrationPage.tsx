/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { User, Shield, Radio, Volume2, Sparkles, Wand2, CreditCard, Check, AlertCircle, RefreshCw } from "lucide-react";

interface RegistrationPageProps {
  onRegister: (userData: {
    username: string;
    displayName: string;
    bio: string;
    isCreator: boolean;
    avatarColor: string;
    initialBalance: number;
    subFrequencyNode: string;
  }) => void;
  currentUsername?: string;
}

export default function RegistrationPage({ onRegister, currentUsername = "m.tealieb2014" }: RegistrationPageProps) {
  // Form State
  const [username, setUsername] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isCreator, setIsCreator] = useState<boolean>(true);
  const [subFrequencyNode, setSubFrequencyNode] = useState<string>("17-Year Swarm (Brood XIX)");
  const [avatarColor, setAvatarColor] = useState<string>("bg-emerald-600");
  const [bio, setBio] = useState<string>("");
  const [initialBalance, setInitialBalance] = useState<number>(50);
  const [piWalletSynced, setPiWalletSynced] = useState<boolean>(false);
  const [piWalletBalance, setPiWalletBalance] = useState<number>(10);

  // Status/Validation State
  const [usernameError, setUsernameError] = useState<string>("");
  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [registerLoading, setRegisterLoading] = useState<boolean>(false);

  // Audio Sync State
  const [activeFrequency, setActiveFrequency] = useState<number>(440);
  const [isChirping, setIsChirping] = useState<boolean>(false);

  // Visual Wave Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const AVATAR_COLORS = [
    { class: "bg-emerald-600", label: "Emerald Green" },
    { class: "bg-amber-600", label: "Amber Yellow" },
    { class: "bg-teal-600", label: "Bio Teal" },
    { class: "bg-orange-600", label: "Larva Orange" },
    { class: "bg-purple-600", label: "Transcendence Purple" },
    { class: "bg-indigo-600", label: "Deep Twilight Indigo" },
  ];

  const FREQUENCY_NODES = [
    {
      name: "17-Year Swarm (Brood XIX)",
      frequency: 240,
      description: "Low-pitch environmental taxonomy, research-driven audio logs, and continuous underground telemetry.",
    },
    {
      name: "13-Year Swarm (Brood XIII)",
      frequency: 880,
      description: "Fast-tempo bio-rhythms, rapid gaming stream speedruns, and active electronic frequency synthesis.",
    },
    {
      name: "High-Frequency Stridulation",
      frequency: 1800,
      description: "Glitch-art wing flutters, percussion microtonal triggers, and high-frequency modular loops.",
    },
    {
      name: "Ambient Drone Lab (Hums)",
      frequency: 85,
      description: "Continuous subfrequency background drones, meditation environments, and relaxing twilight hums.",
    },
  ];

  const CICADA_THEMED_USERNAMES = [
    "brood_x_node",
    "stridulation_lab",
    "larval_dreamer",
    "sub_frequency_transceiver",
    "bio_acoustic_swarm",
    "canopy_synthesizer",
    "environmental_telemetry",
    "periodic_hatch_tracker",
    "nineteen_year_oscillator"
  ];

  // Synthesizer Trigger
  const triggerAudio = (freq: number, durMs: number = 200, type: OscillatorType = "sine") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.value = freq;
      setActiveFrequency(freq);

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durMs / 1000);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durMs / 1000);

      // Trigger wave visual spike info
      setIsChirping(true);
      setTimeout(() => setIsChirping(false), durMs);
    } catch (e) {
      console.warn("Audio Context blocked or not ready: ", e);
    }
  };

  // Generate theme credentials username
  const handleRandomizeUsername = () => {
    const randomIndex = Math.floor(Math.random() * CICADA_THEMED_USERNAMES.length);
    const suffix = Math.floor(Math.random() * 90) + 10;
    const generated = `${CICADA_THEMED_USERNAMES[randomIndex]}_${suffix}`;
    setUsername(generated);
    triggerAudio(1200, 150, "sine");
  };

  // Validate credentials on change
  useEffect(() => {
    if (username.length > 0 && username.length < 3) {
      setUsernameError("Transmitter ID must be at least 3 characters");
    } else if (username.includes(" ")) {
      setUsernameError("Spaces are not permitted in transmitter handles");
    } else {
      setUsernameError("");
    }
  }, [username]);

  // Sync virtual wallet action
  const handleTogglePiWallet = () => {
    setPiWalletSynced((p) => !p);
    triggerAudio(piWalletSynced ? 250 : 1600, 180, "sine");
  };

  // Canvas visual wave generator animation loops
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const amp = isChirping ? 18 : 6;
      const freqMultiplier = isChirping ? 0.05 : 0.02;
      const cycleCount = 3;

      // Draw background grid lines
      ctx.strokeStyle = "rgba(16, 185, 129, 0.04)";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 15) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Draw standard Sine base-noise waves
      ctx.beginPath();
      ctx.strokeStyle = isChirping ? "rgba(16, 185, 129, 0.6)" : "rgba(16, 185, 129, 0.25)";
      ctx.lineWidth = isChirping ? 2 : 1;

      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.sin(x * freqMultiplier + phase) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Second phase modulation wave
      ctx.beginPath();
      ctx.strokeStyle = isChirping ? "rgba(245, 158, 11, 0.5)" : "rgba(245, 158, 11, 0.15)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.cos(x * freqMultiplier * 1.5 - phase * 1.2) * (amp * 0.7);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += 0.05;
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isChirping]);

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || usernameError) {
      triggerAudio(150, 400, "sawtooth");
      setUsernameError("Please enter a valid unique transmitter username");
      return;
    }

    if (!displayName.trim()) {
      triggerAudio(150, 400, "sawtooth");
      setDisplayName(username); // fallback to username
    }

    setRegisterLoading(true);
    triggerAudio(1000, 300, "sine");
    setTimeout(() => {
      triggerAudio(1800, 450, "sine");
      setRegisterLoading(false);
      setFormSubmitted(true);

      // Execute outer dispatch integration
      onRegister({
        username: username.replace("@", "").trim(),
        displayName: displayName.trim() || username,
        bio: bio.trim() || `Transmitting sub-harmonics aligning with ${subFrequencyNode} spectrum nodes.`,
        isCreator,
        avatarColor,
        initialBalance: initialBalance + (piWalletSynced ? piWalletBalance : 0),
        subFrequencyNode
      });
    }, 1800);
  };

  return (
    <div id="registration-container" className="animate-fade-in py-2 max-w-5xl mx-auto space-y-6">
      
      {/* Header Info Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <span className="font-mono text-[9px] font-bold text-emerald-500 uppercase tracking-widest block mb-1">
            Transceiver Core Syncer
          </span>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <Radio className="h-6 w-6 text-emerald-500 animate-pulse" />
            <span>Register Secure Transmitter Node</span>
          </h1>
          <p className="font-sans text-xs text-zinc-400 mt-1 max-w-xl">
            Establish your frequency vectors on the Cicada Tube platform. Set custom bios, custom nodes, link simulated Pi blockchain layers, and unlock instant tipping vectors.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 shrink-0">
          <Shield className="h-4 w-4 text-emerald-400" />
          <span className="font-mono text-[10px] text-zinc-500 font-semibold uppercase">
            Platform Protocol 2.0 Synced
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Input form details */}
        <div className="lg:col-span-7 bg-zinc-950/60 border border-zinc-900 rounded-3xl p-5 md:p-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Username/Transceiver Handle */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-sans text-xs font-bold text-zinc-300 flex items-center space-x-1.5">
                  <User className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Transmitter Username (Unique Handle)</span>
                </label>
                <button
                  type="button"
                  onClick={handleRandomizeUsername}
                  className="font-mono text-[10px] text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider flex items-center space-x-1 border border-emerald-500/10 hover:border-emerald-500/30 px-2 py-0.5 rounded bg-emerald-500/5"
                >
                  <Wand2 className="h-2.5 w-2.5" />
                  <span>Suggest Cicada Name</span>
                </button>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-sans font-extrabold text-zinc-500 text-sm">
                  @
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. cyber_shroud"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 py-2.5 pl-8 pr-4 font-sans text-xs text-zinc-100 placeholder-zinc-650 focus:border-emerald-500/50 focus:bg-zinc-900 outline-none transition font-semibold"
                />
              </div>
              {usernameError ? (
                <p className="font-sans text-[10.5px] text-rose-400 flex items-center space-x-1">
                  <AlertCircle className="h-3 h-3" />
                  <span>{usernameError}</span>
                </p>
              ) : username.length >= 3 ? (
                <p className="font-sans text-[10.5px] text-emerald-400 flex items-center space-x-1">
                  <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping" />
                  <span>Transmitter ID @{username} is available for telemetry broadcasts</span>
                </p>
              ) : null}
            </div>

            {/* Display / Station Name */}
            <div className="space-y-2">
              <label className="font-sans text-xs font-bold text-zinc-300 block">
                Public Transmitter Sign (Display Name)
              </label>
              <input
                type="text"
                placeholder="e.g. Swarm Vector Observer"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 py-2.5 px-3.5 font-sans text-xs text-zinc-100 placeholder-zinc-650 focus:border-emerald-500/50 focus:bg-zinc-900 outline-none transition font-semibold"
              />
            </div>

            {/* Custom password */}
            <div className="space-y-2">
              <label className="font-sans text-xs font-bold text-zinc-300 block">
                Secure Transmitter Keyphrase (Password)
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordSuccess(e.target.value.length >= 6);
                }}
                className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 py-2.5 px-3.5 font-sans text-xs text-zinc-100 placeholder-zinc-650 focus:border-emerald-500/50 focus:bg-zinc-900 outline-none transition font-semibold"
              />
              {password && password.length < 6 && (
                <p className="font-sans text-[10px] text-amber-500 leading-normal">
                  Fidelity Alert: Enter at least 6 characters for high encryption security
                </p>
              )}
            </div>

            {/* Persona Transmitter Mode Selector */}
            <div className="space-y-2.5">
              <label className="font-sans text-xs font-bold text-zinc-300 block">
                Operational Transmission Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="persona-viewer-btn"
                  onClick={() => {
                    setIsCreator(false);
                    triggerAudio(440, 100);
                  }}
                  className={`flex flex-col items-start p-3 rounded-2xl border text-left transition active:scale-[0.98] ${
                    !isCreator
                      ? "border-emerald-500/50 bg-emerald-500/5 text-zinc-100"
                      : "border-zinc-850 bg-zinc-900/30 text-zinc-400 hover:border-zinc-800"
                  }`}
                >
                  <span className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${!isCreator ? 'text-emerald-400' : 'text-zinc-600'}`}>
                    Explorer Profile
                  </span>
                  <span className="font-sans text-xs font-bold">Soundscape Listener</span>
                  <span className="font-sans text-[10px] text-zinc-500 mt-1 leading-snug">
                    Watch signals, configure deep alarms, tip transceivers, and sync Pi.
                  </span>
                </button>

                <button
                  type="button"
                  id="persona-creator-btn"
                  onClick={() => {
                    setIsCreator(true);
                    triggerAudio(880, 100);
                  }}
                  className={`flex flex-col items-start p-3 rounded-2xl border text-left transition active:scale-[0.98] ${
                    isCreator
                      ? "border-emerald-500/50 bg-emerald-500/5 text-zinc-100"
                      : "border-zinc-850 bg-zinc-900/30 text-zinc-400 hover:border-zinc-800"
                  }`}
                >
                  <span className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${isCreator ? 'text-emerald-400' : 'text-zinc-600'}`}>
                    Broadcaster Profile
                  </span>
                  <span className="font-sans text-xs font-bold">Content Creator</span>
                  <span className="font-sans text-[10px] text-zinc-500 mt-1 leading-snug">
                    Upload telemetry soundscapes, track viewers, and receive direct Pi ledger support.
                  </span>
                </button>
              </div>
            </div>

            {/* Sub-Frequency Choice Node */}
            <div className="space-y-2">
              <label className="font-sans text-xs font-bold text-zinc-300 block">
                Primary Sub-Frequency Swarm Interest
              </label>
              <div className="space-y-1.5">
                {FREQUENCY_NODES.map((node) => (
                  <button
                    key={node.name}
                    type="button"
                    onClick={() => {
                      setSubFrequencyNode(node.name);
                      triggerAudio(node.frequency, 220, "triangle");
                    }}
                    className={`w-full flex items-start justify-between p-2.5 rounded-xl border text-left transition ${
                      subFrequencyNode === node.name
                        ? "border-zinc-700 bg-zinc-900 text-white"
                        : "border-transparent bg-transparent text-zinc-400 hover:bg-zinc-900/20"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center space-x-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          subFrequencyNode === node.name ? "bg-emerald-400 animate-ping" : "bg-zinc-700"
                        }`} />
                        <span className="font-sans text-xs font-bold truncate">{node.name}</span>
                      </div>
                      <p className="font-sans text-[10px] text-zinc-500 leading-normal mt-0.5 line-clamp-1">
                        {node.description}
                      </p>
                    </div>
                    <div className="shrink-0 font-mono text-[9px] text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                      Sync {node.frequency}Hz
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Holographic Avatar Color Theme */}
            <div className="space-y-2">
              <label className="font-sans text-xs font-bold text-zinc-300 block">
                Hologram Identity Accent Color
              </label>
              <div className="flex flex-wrap gap-2.5">
                {AVATAR_COLORS.map((col) => (
                  <button
                    key={col.class}
                    type="button"
                    onClick={() => {
                      setAvatarColor(col.class);
                      triggerAudio(600, 100);
                    }}
                    title={col.label}
                    className={`h-7 w-7 rounded-full transition flex items-center justify-center shrink-0 border-2 ${col.class} ${
                      avatarColor === col.class
                        ? "border-white scale-110 shadow-lg"
                        : "border-transparent opacity-65 hover:opacity-100"
                    }`}
                  >
                    {avatarColor === col.class && (
                      <Check className="h-3 w-3 text-white" strokeWidth={4} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated initial balance config */}
            <div className="pt-3 border-t border-zinc-900 space-y-4">
              
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-sans text-xs font-bold text-zinc-300">
                    Seed Transmitter Initial Funds ($)
                  </h4>
                  <p className="font-sans text-[10.5px] text-zinc-500 leading-snug mt-0.5">
                    Select mock currency to trigger instant tipping and premium testing.
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  ${initialBalance.toFixed(2)}
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="500"
                step="5"
                value={initialBalance}
                onChange={(e) => {
                  setInitialBalance(Number(e.target.value));
                  triggerAudio(100 + Number(e.target.value), 40);
                }}
                className="w-full accent-emerald-500 bg-zinc-850 h-1.5 rounded-lg cursor-pointer"
              />

              {/* simulated Pi network linkage checkbox */}
              <div
                onClick={handleTogglePiWallet}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  piWalletSynced
                    ? "border-amber-500/30 bg-amber-500/5 text-amber-400"
                    : "border-zinc-850 bg-zinc-900/10 text-zinc-400 hover:border-zinc-800"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className={`p-2 rounded-xl shrink-0 ${piWalletSynced ? 'bg-amber-500/15 text-amber-400' : 'bg-zinc-900 text-zinc-600'}`}>
                    <span className="font-extrabold text-sm leading-none shrink-0">π</span>
                  </div>
                  <div className="text-left">
                    <span className="font-sans text-xs font-bold block">
                      Sync Simulated Pi Wallet Ledger
                    </span>
                    <span className="font-sans text-[10px] text-zinc-500 leading-normal block mt-0.5">
                      Verify test suite connection to receive 10.0 π test tokens directly.
                    </span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center justify-center">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    piWalletSynced ? 'bg-amber-500 border-amber-400 text-zinc-950' : 'border-zinc-700 bg-transparent'
                  }`}>
                    {piWalletSynced && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Bio field */}
            <div className="space-y-2">
              <label className="font-sans text-xs font-bold text-zinc-300 block">
                Transmitter Public Profile Bio Note
              </label>
              <textarea
                rows={2}
                maxLength={200}
                placeholder={`Transmitting frequencies around the ${subFrequencyNode} coordinate...`}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl border border-zinc-850 bg-zinc-900/60 py-2.5 px-3.5 font-sans text-xs text-zinc-100 placeholder-zinc-650 focus:border-emerald-500/50 focus:bg-zinc-900 outline-none transition font-semibold"
              />
              <p className="text-right font-mono text-[9px] text-zinc-600">
                {200 - bio.length} chars remaining
              </p>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={registerLoading || !!usernameError}
              className={`w-full py-3 rounded-2xl font-sans text-sm font-bold text-zinc-950 tracking-wider flex items-center justify-center space-x-2.5 transition transform cursor-pointer active:scale-98 ${
                !!usernameError
                  ? "bg-zinc-900 text-zinc-600 border border-zinc-850 cursor-not-allowed"
                  : registerLoading
                  ? "bg-emerald-600 text-zinc-900"
                  : "bg-emerald-500 hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse"
              }`}
            >
              {registerLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-1.5" />
                  <span>Configuring Transmitter Node...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4.5 w-4.5" />
                  <span>REGISTER SECURE TRANSCEIVER NODE</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Holographic proof of transmitter */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Audio frequency wave visualizer widget */}
          <div className="bg-zinc-950 border border-zinc-900 p-4.5 rounded-3xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans text-xs font-bold text-zinc-300 flex items-center space-x-1.5">
                <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Audio Wave Sync Alignment</span>
              </span>
              <span className="font-mono text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/10 leading-none">
                {activeFrequency} Hz
              </span>
            </div>
            
            <div className="rounded-xl overflow-hidden bg-zinc-900 relative">
              <canvas
                ref={canvasRef}
                height={85}
                className="w-full h-[85px] block"
              />
              <div className="absolute inset-x-0 bottom-1 flex justify-center">
                <span className="font-mono text-[8px] text-zinc-600 uppercase tracking-widest leading-none">
                  Telemetry Monitor
                </span>
              </div>
            </div>
          </div>

          {/* Holographic identity profile certificate preview */}
          <div className="relative group">
            
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-amber-500/5 rounded-3xl blur-md -z-10 group-hover:blur-lg transition duration-300" />
            
            <div className="bg-[#0b0b0b] border border-zinc-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-left min-h-[340px] flex flex-col justify-between">
              
              {/* Top Row */}
              <div className="flex items-start justify-between border-b border-zinc-900 pb-4">
                <div>
                  <span className="font-mono text-[8px] uppercase tracking-wider text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-400/20 px-2 py-0.5 rounded">
                    Proof of Alignment
                  </span>
                  <h3 className="font-sans text-lg font-extrabold text-zinc-100 tracking-tight mt-1 px-0.5">
                    CICADA TUBE TRANSCEIVER
                  </h3>
                </div>
                <div className="h-8 w-8 bg-zinc-900 border border-zinc-850 rounded flex items-center justify-center font-mono text-zinc-600 text-[10px] font-bold">
                  ID-26
                </div>
              </div>

              {/* Hologram details card visual elements */}
              <div className="my-6 space-y-4">
                <div className="flex items-center space-x-4">
                  {/* Avatar Icon Accent */}
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl font-extrabold tracking-tighter text-white/90 border border-white/10 uppercase shadow-md shrink-0 ${avatarColor}`}>
                    {username ? username.charAt(0) : "?"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-550 font-bold">
                      NODE OPERATOR SIGN
                    </p>
                    <h5 className="font-sans text-base font-bold text-zinc-100 truncate mt-0.5">
                      {displayName || "Unnamed Observer"}
                    </h5>
                    <p className="font-sans text-xs text-emerald-400 font-semibold truncate">
                      @{username || "awaiting_handle"}
                    </p>
                  </div>
                </div>

                {/* Sub Metadata rows */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 border-t border-zinc-900/60">
                  <div>
                    <span className="font-mono text-[8px] text-zinc-550 block font-bold">TRANSMISSION MODE</span>
                    <span className="font-sans text-xs font-semibold text-zinc-300 block mt-0.5">
                      {isCreator ? "🔴 Broadcaster Node" : "🟢 Auditory Explorer"}
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-[8px] text-zinc-550 block font-bold">FREQUENCY SPECTRA</span>
                    <span className="font-sans text-xs font-semibold text-zinc-300 block mt-0.5 truncate">
                      {subFrequencyNode}
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-[8px] text-zinc-550 block font-bold">NODE BALANCE</span>
                    <span className="font-mono text-xs font-bold text-zinc-300 block mt-0.5">
                      ${initialBalance.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-[8px] text-zinc-550 block font-bold">SIMULATED PI WALLET</span>
                    <span className="font-sans text-xs font-bold text-zinc-300 flex items-center space-x-1 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${piWalletSynced ? 'bg-amber-400' : 'bg-zinc-700'}`} />
                      <span className="truncate">{piWalletSynced ? `${piWalletBalance}.0 π Synced` : "Disconnected"}</span>
                    </span>
                  </div>
                </div>

                {/* Simulated Biomap sensor bio */}
                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900/85">
                  <span className="font-mono text-[8px] text-zinc-555 uppercase font-bold tracking-wider block mb-1">
                    Telemetry System Bio
                  </span>
                  <p className="font-sans text-[10.5px] text-zinc-455 font-medium leading-normal italic line-clamp-2">
                    {bio || `Monitoring local environmental frequencies aligning with ${subFrequencyNode} protocols.`}
                  </p>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="border-t border-zinc-900 pt-3 flex items-center justify-between font-mono text-[8px] text-zinc-600 uppercase font-bold">
                <span>Node Status: Operational</span>
                <span>Fidelity 99.8%</span>
              </div>

            </div>
          </div>

          {/* Quick onboarding guidelines */}
          <div className="bg-zinc-950/40 p-4 border border-zinc-900 rounded-2xl text-left space-y-2.5">
            <h4 className="font-sans text-xs font-bold text-white flex items-center space-x-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>Transmitter Guidelines</span>
            </h4>
            <ul className="text-[10px] font-sans text-zinc-450 space-y-1 pl-4 list-disc leading-normal font-medium">
              <li>Keep passwords secure for credential-free local session persistence.</li>
              <li>Toggle between your Explorer node and Broadcaster studio dynamically in the side menu.</li>
              <li>Tip other transmitter signals peer-to-peer using either Pi Wallet tokens or standard credit deposit ledgers.</li>
            </ul>
          </div>
          
        </div>

      </div>
    </div>
  );
}
