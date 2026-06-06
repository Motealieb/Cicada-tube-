/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { Video, VideoCategory, CreatorAnalytics, Comment } from "../types";
import {
  Upload,
  BarChart3,
  Users,
  Eye,
  Clock,
  DollarSign,
  Video as VideoIcon,
  CheckCircle,
  FileText,
  AlertCircle,
  TrendingUp,
  Coins
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CreatorStudioProps {
  analytics: CreatorAnalytics;
  videos: Video[];
  onAddVideo: (newVideo: Video) => void;
  onWithdrawFunds: () => void;
  walletBalance: number;
}

export default function CreatorStudio({
  analytics,
  videos,
  onAddVideo,
  onWithdrawFunds,
  walletBalance,
}: CreatorStudioProps) {
  // Upload states
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  // Form states
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [videoDesc, setVideoDesc] = useState<string>("");
  const [videoCategory, setVideoCategory] = useState<VideoCategory>(VideoCategory.ENTERTAINMENT);
  const [videoMonetized, setVideoMonetized] = useState<boolean>(true);
  const [videoPremium, setVideoPremium] = useState<boolean>(false);

  // Drag over actions handler
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Drop actions handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setVideoTitle(file.name.split(".").slice(0, -1).join(".") || file.name);
    }
  };

  // Manual select handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setVideoTitle(file.name.split(".").slice(0, -1).join(".") || file.name);
    }
  };

  // Submit complete uploaded form details
  const handleSubmitUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) return;

    // Create a client-side object URL for real localized playback!
    const customBlobUrl = selectedFile ? URL.createObjectURL(selectedFile) : "";

    // Generate fallback visuals
    const unsplashCollection = [
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600"
    ];
    const defaultThumbUrl = unsplashCollection[Math.floor(Math.random() * unsplashCollection.length)];

    const seedComment: Comment = {
      id: `comment-sys-${Date.now()}`,
      author: "Cicada_System_Moderator",
      avatarColor: "bg-zinc-800",
      text: "System check completed. Ad integrations established. Monetization ready. Welcome to Cicada Tube!",
      likes: 1,
      isCreator: false,
      timestamp: "Just now"
    };

    const newVideo: Video = {
      id: `video-cust-${Date.now()}`,
      title: videoTitle.trim(),
      description: videoDesc.trim() || `No description provided. Uploaded file: ${selectedFile?.name || "unspecified.mp4"}. Enjoy this custom client-side video stream!`,
      category: videoCategory,
      duration: "03:45", // Simulated default length representer
      views: 10,
      likes: 1,
      uploaderName: "m.tealieb2014",
      uploaderSubscribers: 1,
      uploadedAt: "Just now",
      videoUrl: customBlobUrl || "custom_upload",
      thumbnailUrl: defaultThumbUrl,
      comments: [seedComment],
      isPremium: videoPremium,
      monetized: videoMonetized,
      earnings: 0.0,
      videoBlobUrl: customBlobUrl
    };

    onAddVideo(newVideo);
    setUploadSuccess(true);

    // Reset fields
    setTimeout(() => {
      setSelectedFile(null);
      setVideoTitle("");
      setVideoDesc("");
      setVideoCategory(VideoCategory.ENTERTAINMENT);
      setVideoMonetized(true);
      setVideoPremium(false);
      setUploadSuccess(false);
    }, 2800);
  };

  return (
    <div id="creator-studio-container" className="space-y-6">
      {/* Overview Head section */}
      <div id="studio-overview" className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-5 gap-4">
        <div>
          <h1 className="font-sans font-bold text-md text-zinc-150 tracking-tight">
            Creator Dashboard & Analytics
          </h1>
          <p className="font-sans text-xs text-zinc-500 mt-1 leading-snug">
            Manage your digital library, study monetization split trends, and distribute content.
          </p>
        </div>

        {/* Action cash out */}
        <div className="flex items-center space-x-3.5">
          <div className="flex flex-col text-right hidden md:block">
            <span className="font-mono text-[9px] text-zinc-550 uppercase font-semibold">Creator Revenue Balance</span>
            <span className="font-mono text-xs font-bold text-emerald-400">${analytics.totalRevenue.toFixed(2)}</span>
          </div>
          <button
            id="withdraw-revenue-btn"
            onClick={onWithdrawFunds}
            disabled={analytics.totalRevenue <= 0}
            className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-2.5 font-sans text-xs font-bold text-zinc-950 hover:from-emerald-400 hover:to-teal-400 active:scale-95 transition disabled:opacity-30 disabled:hover:from-emerald-500"
          >
            <Coins className="h-4.5 w-4.5" />
            <span>Withdraw Earnings</span>
          </button>
        </div>
      </div>

      {/* Grid of 4 analytical widgets */}
      <div id="metrics-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-zinc-900 bg-zinc-950 p-4 rounded-xl flex items-center space-x-3.5 shadow-sm">
          <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-550 font-semibold">Total Channel Views</p>
            <h4 className="font-mono text-sm font-bold text-zinc-100 mt-0.5">{analytics.totalViews.toLocaleString()}</h4>
          </div>
        </div>

        <div className="border border-zinc-900 bg-zinc-950 p-4 rounded-xl flex items-center space-x-3.5 shadow-sm">
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-550 font-semibold">Watch Time (Hours)</p>
            <h4 className="font-mono text-sm font-bold text-zinc-100 mt-0.5">{analytics.totalWatchTimeHours.toLocaleString()}</h4>
          </div>
        </div>

        <div className="border border-zinc-900 bg-zinc-950 p-4 rounded-xl flex items-center space-x-3.5 shadow-sm">
          <div className="rounded-lg bg-emerald-550/10 p-2 text-emerald-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-550 font-semibold">Subscribers count</p>
            <h4 className="font-mono text-sm font-bold text-zinc-100 mt-0.5">{analytics.totalSubscribers.toLocaleString()}</h4>
          </div>
        </div>

        <div className="border border-zinc-900 bg-zinc-950 p-4 rounded-xl flex items-center space-x-3.5 shadow-sm">
          <div className="rounded-lg bg-emerald-550/15 p-2 text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-550 font-semibold">Total revenue split</p>
            <h4 className="font-mono text-sm font-bold text-emerald-400 mt-0.5">${analytics.totalRevenue.toFixed(2)}</h4>
          </div>
        </div>
      </div>

      {/* Main split: left chart details/splits, right upload form panel */}
      <div id="studio-main-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics and Splits layout column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Area Chart Recharts */}
          <div className="border border-zinc-900 bg-zinc-950 p-4 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <BarChart3 className="h-4.5 w-4.5 text-emerald-400" />
                <h3 className="font-sans text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Revenue Growth Chart
                </h3>
              </div>
              <span className="flex items-center space-x-1 font-mono text-[9px] text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                <TrendingUp className="h-3 w-3" />
                <span>+12.4% This Month</span>
              </span>
            </div>

            {/* Recharts Area Container */}
            <div className="h-60 w-full font-mono text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analytics.monthlyRevenueData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(63, 63, 70, 0.2)" />
                  <XAxis dataKey="month" stroke="#71717a" tickLine={false} />
                  <YAxis stroke="#71717a" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#09090b",
                      border: "1px solid #27272a",
                      borderRadius: "8px"
                    }}
                    labelStyle={{ color: "#a1a1aa", fontFamily: "monospace" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#revenueGlow)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue distribution pie categories breakdown cards */}
          <div className="border border-zinc-900 bg-zinc-950 p-4 rounded-2xl">
            <h3 className="font-sans text-xs font-bold text-zinc-200 uppercase tracking-wider mb-4">
              Revenue Stream Breakdown
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-900/40 border border-zinc-900/60 rounded-xl p-3.5">
                <span className="font-mono text-[9px] text-zinc-550 block font-semibold uppercase">Channel Ad Shares</span>
                <span className="font-mono font-bold text-sm text-zinc-100 block mt-1">${analytics.adRevenue.toFixed(2)}</span>
                <div className="w-full h-1 bg-zinc-805 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${(analytics.adRevenue / analytics.totalRevenue) * 105}%` }} />
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-900/60 rounded-xl p-3.5">
                <span className="font-mono text-[9px] text-zinc-550 block font-semibold uppercase">Super Chat & Tips</span>
                <span className="font-mono font-bold text-sm text-zinc-100 block mt-1">${analytics.tipRevenue.toFixed(2)}</span>
                <div className="w-full h-1 bg-zinc-805 rounded-full mt-2 overflow-hidden">
                  <div className="bg-purple-500 h-full" style={{ width: `${(analytics.tipRevenue / analytics.totalRevenue) * 105}%` }} />
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-900/60 rounded-xl p-3.5">
                <span className="font-mono text-[9px] text-zinc-550 block font-semibold uppercase">Premium Platform Split</span>
                <span className="font-mono font-bold text-sm text-zinc-100 block mt-1">${analytics.premiumRevenue.toFixed(2)}</span>
                <div className="w-full h-1 bg-zinc-805 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${(analytics.premiumRevenue / analytics.totalRevenue) * 105}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload form Panel right column */}
        <div className="lg:col-span-1">
          <div className="border border-zinc-900 bg-zinc-950 p-5 rounded-2xl space-y-4">
            <div className="flex items-center space-x-1.5">
              <Upload className="h-4.5 w-4.5 text-emerald-500 animate-bounce" />
              <h3 className="font-sans text-xs font-bold text-zinc-200 uppercase tracking-wider">
                Upload New Content
              </h3>
            </div>

            {uploadSuccess ? (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-3.5 animate-scale-up">
                <CheckCircle className="h-12 w-12 text-emerald-500" />
                <h4 className="font-sans font-bold text-xs text-zinc-250">File Upload Complete!</h4>
                <p className="font-sans text-[11px] text-zinc-500 max-w-xs">
                  Your custom video <span className="text-emerald-400 font-semibold">"{videoTitle}"</span> has been merged into the platform catalog. Back on the Home feed, filter by your category to play it!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitUpload} className="space-y-4 font-sans">
                {/* Drag and Drop Zone Area */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("hidden-file-picker")?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                    dragActive
                      ? "border-emerald-500 bg-emerald-500/5"
                      : selectedFile
                      ? "border-emerald-500/40 bg-zinc-900/20"
                      : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/40"
                  }`}
                >
                  <input
                    id="hidden-file-picker"
                    type="file"
                    accept="video/*,audio/*,image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="space-y-2">
                      <FileText className="h-8 w-8 text-emerald-500 mx-auto" />
                      <p className="text-xs font-bold text-zinc-300 truncate max-w-[180px]">
                        {selectedFile.name}
                      </p>
                      <span className="font-mono text-[9px] text-zinc-550 block">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <VideoIcon className="h-8 w-8 text-zinc-600 mx-auto" />
                      <p className="text-xs font-semibold text-zinc-400">
                        Drag & Drop media here
                      </p>
                      <span className="text-[10px] text-zinc-550 block leading-tight">
                        Supports video files or click to browse local folders
                      </span>
                    </div>
                  )}
                </div>

                {/* Form fields */}
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-550 font-bold block">
                      Video Title
                    </label>
                    <input
                      id="upload-title-input"
                      type="text"
                      required
                      placeholder="Title this upload..."
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      className="w-full rounded-xl border border-zinc-850 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 placeholder-zinc-550 outline-none focus:border-emerald-500/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">
                      Short Description
                    </label>
                    <textarea
                      id="upload-desc-input"
                      rows={2}
                      placeholder="Tell viewers what your video is about..."
                      value={videoDesc}
                      onChange={(e) => setVideoDesc(e.target.value)}
                      className="w-full rounded-xl border border-zinc-850 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 placeholder-zinc-550 outline-none focus:border-emerald-500/40 resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">
                      Category
                    </label>
                    <select
                      id="upload-category"
                      value={videoCategory}
                      onChange={(e) => setVideoCategory(e.target.value as VideoCategory)}
                      className="w-full rounded-xl border border-zinc-850 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 outline-none focus:border-emerald-500/40 cursor-pointer"
                    >
                      <option value={VideoCategory.ENTERTAINMENT}>Entertainment</option>
                      <option value={VideoCategory.EDUCATION}>Education</option>
                      <option value={VideoCategory.MUSIC}>Music</option>
                      <option value={VideoCategory.GAMING}>Gaming</option>
                      <option value={VideoCategory.NEWS}>News</option>
                    </select>
                  </div>

                  {/* Monetization & Premium triggers */}
                  <div className="space-y-2.5 bg-zinc-900/30 border border-zinc-900 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-zinc-300">Enable Ad Monetization</span>
                        <span className="text-[10px] text-zinc-550 leading-tight">Allow sponsor video ad overlays</span>
                      </div>
                      <input
                        id="toggle-monetization"
                        type="checkbox"
                        checked={videoMonetized}
                        onChange={(e) => setVideoMonetized(e.target.checked)}
                        className="accent-emerald-500 h-4 w-4 cursor-pointer"
                      />
                    </div>

                    <hr className="border-zinc-900" />

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-zinc-300">Premium Subscribers Only</span>
                        <span className="text-[10px] text-zinc-550 leading-tight">Restrict standard tier viewer nodes</span>
                      </div>
                      <input
                        id="toggle-premium-exclusive"
                        type="checkbox"
                        checked={videoPremium}
                        onChange={(e) => setVideoPremium(e.target.checked)}
                        className="accent-emerald-500 h-4 w-4 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit trigger button */}
                <button
                  id="trigger-confirm-upload"
                  type="submit"
                  disabled={!videoTitle.trim()}
                  className="w-full rounded-xl bg-emerald-500 text-zinc-950 font-bold py-2.5 text-xs transition active:scale-95 hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500 uppercase tracking-widest mt-2 flex items-center justify-center space-x-1"
                >
                  <Upload className="h-4 w-4" />
                  <span>Publish Media Node</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
