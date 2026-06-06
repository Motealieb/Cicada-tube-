/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Video, VideoCategory } from "../types";
import {
  Sparkles,
  Eye,
  ThumbsUp,
  Radio,
  Flame,
  FileVideo,
  Music,
  School,
  Gamepad2,
  Newspaper,
  Compass,
  Zap,
  Play
} from "lucide-react";

interface VideoFeedProps {
  videos: Video[];
  onSelectVideo: (video: Video) => void;
  searchQuery: string;
  isPremiumUser: boolean;
  onNavigateToUser: (username: string) => void;
  recommendedVideos: { video: Video; reason: string }[];
}

export default function VideoFeed({
  videos,
  onSelectVideo,
  searchQuery,
  isPremiumUser,
  onNavigateToUser,
  recommendedVideos,
}: VideoFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>(VideoCategory.ALL);

  // Filter categories shown as pill tags
  const categories = Object.values(VideoCategory).filter((c) => c !== VideoCategory.LIVE);

  // Filter video list based on category & search text
  const filteredVideos = videos.filter((video) => {
    const matchesCategory =
      selectedCategory === VideoCategory.ALL || video.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.uploaderName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (cat: VideoCategory) => {
    switch (cat) {
      case VideoCategory.ENTERTAINMENT:
        return <Flame className="h-3.5 w-3.5 shrink-0" />;
      case VideoCategory.EDUCATION:
        return <School className="h-3.5 w-3.5 shrink-0" />;
      case VideoCategory.MUSIC:
        return <Music className="h-3.5 w-3.5 shrink-0" />;
      case VideoCategory.GAMING:
        return <Gamepad2 className="h-3.5 w-3.5 shrink-0" />;
      case VideoCategory.NEWS:
        return <Newspaper className="h-3.5 w-3.5 shrink-0" />;
      default:
        return <FileVideo className="h-3.5 w-3.5 shrink-0" />;
    }
  };

  return (
    <div id="video-feed-container" className="flex flex-col space-y-8 animate-fade-in">
      {/* Immersive Featured Hero Banner */}
      <div
        id="feed-featured-hero"
        onClick={() => {
          if (videos.length > 0) {
            onSelectVideo(videos[0]);
          }
        }}
        className="flex-shrink-0 h-48 sm:h-64 md:h-72 rounded-3xl relative overflow-hidden group cursor-pointer shadow-2xl border border-zinc-800/10"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center group-hover:scale-[1.03] transition-transform duration-700" />

        <div className="absolute bottom-6 left-6 z-20 max-w-lg">
          <span className="bg-emerald-500 text-zinc-950 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider mb-2.5 inline-block">
            Featured Stream
          </span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1.5 leading-tight tracking-tight">
            Echoes of the Void: The Last Cicada Experiment
          </h1>
          <div className="flex items-center gap-3 text-[11px] font-medium text-zinc-350">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="font-semibold text-white">14.2k Watching</span>
            </div>
            <span>•</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-[10px]">Stridulation Synthesis</span>
          </div>
        </div>

        <button
          id="hero-play-btn"
          className="absolute bottom-6 right-6 z-20 w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-transform shadow-xl outline-none"
        >
          <Play className="h-5.5 w-5.5 fill-black pl-0.5" />
        </button>
      </div>

      {/* Dynamic Personalized Recommendations Shelf */}
      {searchQuery.trim() === "" && recommendedVideos && recommendedVideos.length > 0 && (
        <div
          id="personalized-recommendations-pulse"
          className="border border-zinc-900 bg-zinc-950 p-5 rounded-2xl space-y-4 shadow-[0_4px_25px_-12px_rgba(16,185,129,0.08)] bg-gradient-to-b from-[#0e1813]/25 via-zinc-950 to-zinc-950"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
              <span className="font-sans text-[11px] font-bold text-zinc-200 uppercase tracking-wider">
                Personalized For Your Spectrum
              </span>
            </div>
            <span className="font-mono text-[8px] text-emerald-500 font-bold uppercase tracking-wider bg-emerald-500/10 px-2.5 py-0.5 rounded">
              Rec Engine Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4.5">
            {recommendedVideos.slice(0, 3).map(({ video, reason }) => (
              <div
                key={`rec-${video.id}`}
                onClick={() => onSelectVideo(video)}
                className="group flex flex-col justify-between bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-900 hover:border-zinc-800 p-2.5 rounded-xl cursor-pointer transition duration-250 hover:shadow-lg"
              >
                <div>
                  <div className="aspect-video w-full rounded-lg overflow-hidden relative bg-zinc-950">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute bottom-1.5 right-1.5 bg-zinc-950/90 text-[8.5px] font-mono font-bold px-1 py-0.5 rounded text-zinc-300">
                      {video.duration}
                    </span>
                    <div className="absolute inset-0 bg-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-zinc-950/30">
                      <Play className="h-6 w-6 text-emerald-400 shrink-0" />
                    </div>
                  </div>

                  <h3 className="font-sans text-xs font-bold text-zinc-100 line-clamp-1 group-hover:text-emerald-400 transition mt-2">
                    {video.title}
                  </h3>

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToUser(video.uploaderName);
                    }}
                    className="font-sans text-[10.5px] text-zinc-450 hover:text-emerald-400 transition mt-0.5 hover:underline flex items-center space-x-1"
                  >
                    <span>{video.uploaderName}</span>
                  </div>
                </div>

                {/* Algorithmic Reason Capsule */}
                <div className="mt-3 pt-2 border-t border-zinc-900 flex items-center space-x-1.5 min-w-0">
                  <Zap className="h-3 w-3 text-emerald-400 shrink-0" />
                  <span className="font-sans text-[9px] font-medium text-emerald-400 truncate tracking-wide">
                    {reason}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Browse Feed Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
          <div className="flex items-center space-x-2">
            <Compass className="h-4.5 w-4.5 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white font-sans">
              Browse Soundscapes
            </h2>
          </div>
          {searchQuery && (
            <span className="font-mono text-[10px] text-zinc-500 uppercase">
              Filtered for: "{searchQuery}"
            </span>
          )}
        </div>

        {/* Category Selection Carousel */}
        <div
          id="category-pills-carousel"
          className="flex w-full items-center space-x-2 overflow-x-auto pb-1 scrollbar-none font-sans"
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                id={`pill-${category.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCategory(category);
                }}
                className={`flex items-center space-x-1.5 shrink-0 rounded-xl py-1.5 px-3.5 text-xs font-semibold tracking-wide transition-all duration-150 outline-none ${
                  isSelected
                    ? "bg-emerald-500 text-zinc-950 shadow-[0_3px_12px_rgba(16,185,129,0.2)]"
                    : "bg-zinc-900/60 border border-zinc-805 text-zinc-400 hover:border-zinc-750 hover:text-zinc-100"
                }`}
              >
                {category !== VideoCategory.ALL && getCategoryIcon(category)}
                <span>{category}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid List */}
      {filteredVideos.length === 0 ? (
        <div
          id="no-videos-found"
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-850 bg-zinc-900/10 py-16 text-center"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900">
            <FileVideo className="h-6 w-6 text-zinc-650 animate-pulse" />
          </div>
          <h3 className="mt-4 font-sans text-sm font-bold text-zinc-300">No signals matched</h3>
          <p className="mt-1 font-sans text-xs text-zinc-550 max-w-xs">
            We couldn't locate any frequency listings matching "{searchQuery}". Check your search terms.
          </p>
          <button
            id="clear-filters-action"
            onClick={() => {
              setSelectedCategory(VideoCategory.ALL);
            }}
            className="mt-4 rounded-lg bg-zinc-805 hover:bg-zinc-800 px-4 py-1.5 font-mono text-[11px] font-bold text-zinc-300 transition"
          >
            Reset Catalog Filters
          </button>
        </div>
      ) : (
        <div
          id="video-grid"
          className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredVideos.map((video) => {
            const isRestricted = video.isPremium && !isPremiumUser;
            return (
              <div
                key={video.id}
                id={`video-card-${video.id}`}
                onClick={() => onSelectVideo(video)}
                className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950 pb-3.5 transition duration-250 hover:border-zinc-800 hover:bg-zinc-900/40 hover:shadow-xl"
              >
                {/* Thumbnail viewport */}
                <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-[#0a0a0a]">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Duration tag */}
                  <span className="absolute bottom-2 right-2 bg-black/80 text-[10px] font-bold px-1.5 py-0.5 rounded text-zinc-300 group-hover:text-emerald-400">
                    {video.duration}
                  </span>

                  {/* Premium indicator overlay */}
                  {video.isPremium && (
                    <div className="absolute top-2.5 right-2.5 flex items-center space-x-1 rounded bg-emerald-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-zinc-950 shadow-[0_2px_8px_rgba(16,185,129,0.4)]">
                      <Sparkles className="h-2.5 w-2.5" />
                      <span>Premium</span>
                    </div>
                  )}

                  {/* Playing hover state overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/40 opacity-0 transition duration-250 group-hover:opacity-100">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-xl scale-90 group-hover:scale-100 transition duration-250">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5.5 w-5.5 pl-0.5"
                      >
                        <path d="M8 5.14v14l11-7-11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Details layout */}
                <div className="flex px-3 mt-3.5 space-x-3">
                  {/* Avatar wrapper */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToUser(video.uploaderName);
                    }}
                    className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-400 font-mono hover:rotate-12 transition cursor-pointer"
                  >
                    {video.uploaderName[0]}
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <h4 className="font-sans text-xs font-bold leading-snug text-zinc-100 line-clamp-2 group-hover:text-emerald-400 transition">
                      {video.title}
                    </h4>

                    {/* Uploader name */}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToUser(video.uploaderName);
                      }}
                      className="font-sans text-[10px] text-zinc-500 hover:text-emerald-400 transition mt-1 cursor-pointer hover:underline"
                    >
                      {video.uploaderName}
                    </span>

                    {/* Stats */}
                    <div className="flex items-center space-x-2 font-mono text-[9px] text-zinc-550 mt-1">
                      <span className="flex items-center space-x-0.5">
                        <Eye className="h-3 w-3 inline text-zinc-700" />
                        <span>{(video.views / 1000).toFixed(0)}K views</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-0.5">
                        <ThumbsUp className="h-2.5 w-2.5 inline text-zinc-700" />
                        <span>{(video.likes / 1000).toFixed(0)}K likes</span>
                      </span>
                      <span>•</span>
                      <span>{video.uploadedAt}</span>
                    </div>

                    {/* Restricted Warning Label */}
                    {isRestricted && (
                      <span className="font-mono text-[9px] font-bold text-emerald-500/80 mt-1.5 uppercase tracking-wider">
                        ★ Upgrade to stream
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
