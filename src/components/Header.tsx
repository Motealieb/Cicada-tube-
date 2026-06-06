/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Search, Wallet, Sparkles, Bell, Trash2, Check, Video as VideoIcon, TrendingUp, Compass, User, CornerDownLeft } from "lucide-react";
import { UserWallet, Notification, Video } from "../types";

interface HeaderProps {
  wallet: UserWallet;
  onUpgradePremium: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNavigateToUser: (username: string) => void;
  
  // Notification states
  notifications: Notification[];
  onMarkAllRead: () => void;
  onDismissNotification: (id: string) => void;
  onSelectNotification: (notif: Notification) => void;

  // Search suggestion integration
  videos?: Video[];
  onSelectVideo?: (video: Video) => void;
}

export default function Header({
  wallet,
  onUpgradePremium,
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  onNavigateToUser,
  notifications,
  onMarkAllRead,
  onDismissNotification,
  onSelectNotification,
  videos,
  onSelectVideo,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Suggestions panel states
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const TRENDING_SEARCHES = [
    "Lofi Beats",
    "Understanding Swarms",
    "Brood XIX and XIII",
    "Stridulation Synthesis",
    "Cicada Speedrun",
    "Science of Cicadas"
  ];

  const queryLower = searchQuery.toLowerCase().trim();

  // Find matching videos
  const matchedVideos = queryLower
    ? (videos || []).filter(v =>
        v.title.toLowerCase().includes(queryLower) ||
        v.description.toLowerCase().includes(queryLower) ||
        v.uploaderName.toLowerCase().includes(queryLower)
      ).slice(0, 4)
    : [];

  // Find matching uploader names
  const ALL_CHANNELS = [
    "Stridulation Beats",
    "Deep Wild Biology",
    "Triton Cinematic",
    "SpeedyBugs",
    "Apex Financial News",
    "Synthesizer Pro",
    "Cicada Network LIVE"
  ];
  const matchedChannels = queryLower
    ? ALL_CHANNELS.filter(c => c.toLowerCase().includes(queryLower)).slice(0, 2)
    : [];

  // Intermediary suggestions mapped element
  interface SearchSuggestionAction {
    id: string;
    type: "trending" | "category" | "video" | "channel" | "auto";
    label: string;
    sublabel?: string;
    thumbnailUrl?: string;
    icon?: React.ReactNode;
    onSelect: () => void;
  }

  const suggestions: SearchSuggestionAction[] = [];

  if (!queryLower) {
    // Empty state suggestions
    TRENDING_SEARCHES.forEach((term, index) => {
      suggestions.push({
        id: `trending-${index}`,
        type: "trending",
        label: term,
        icon: <TrendingUp className="h-3.5 w-3.5" />,
        onSelect: () => {
          setSearchQuery(term);
          if (activeTab !== "home" && activeTab !== "profile") setActiveTab("home");
          setIsFocused(false);
        }
      });
    });

    // Color categories mapping
    const categoryList = [
      { name: "Music", label: "Acoustic streams & synth rhythms" },
      { name: "Education", label: "Research nodes & biology logs" },
      { name: "Gaming", label: "Cicada simulation speedruns" },
    ];
    categoryList.forEach((cat, index) => {
      suggestions.push({
        id: `category-${index}`,
        type: "category",
        label: cat.name,
        sublabel: cat.label,
        icon: <Compass className="h-3.5 w-3.5 text-emerald-400" />,
        onSelect: () => {
          setSearchQuery(cat.name);
          setActiveTab("home");
          setIsFocused(false);
        }
      });
    });
  } else {
    // Matching Videos results
    matchedVideos.forEach((v) => {
      suggestions.push({
        id: `video-${v.id}`,
        type: "video",
        label: v.title,
        sublabel: `by ${v.uploaderName}`,
        thumbnailUrl: v.thumbnailUrl,
        onSelect: () => {
          if (onSelectVideo) {
            onSelectVideo(v);
          } else {
            setSearchQuery(v.title);
            setActiveTab("home");
          }
          setIsFocused(false);
        }
      });
    });

    // Matching Channels results
    matchedChannels.forEach((channel, index) => {
      suggestions.push({
        id: `channel-${index}`,
        type: "channel",
        label: channel,
        sublabel: "Active Transmitter • View Profile",
        icon: <User className="h-3.5 w-3.5 text-emerald-400" />,
        onSelect: () => {
          onNavigateToUser(channel);
          setIsFocused(false);
        }
      });
    });

    // Fallback automatic broad-search search trigger
    suggestions.push({
      id: "search-anyway",
      type: "auto",
      label: `Execute query search: "${searchQuery}"`,
      sublabel: "Filter system index",
      icon: <Search className="h-3.5 w-3.5 text-zinc-500" />,
      onSelect: () => {
        setIsFocused(false);
      }
    });
  }

  // Handle keyboard events (ArrowUp, ArrowDown, Enter, ESC, Tab)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
        e.preventDefault();
        suggestions[focusedIndex].onSelect();
      } else {
        setIsFocused(false);
      }
    } else if (e.key === "Escape") {
      setIsFocused(false);
      e.currentTarget.blur();
    }
  };

  // Reset focus index whenever the user alters query search string
  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchQuery]);

  return (
    <header
      id="cicada-header"
      className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-zinc-800/50 bg-[#0a0a0a]/90 backdrop-blur-md px-4 md:px-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.8)]"
    >
      {/* Brand Logo and Custom Navigation */}
      <div className="flex items-center gap-6">
        <div
          id="header-brand"
          className="flex cursor-pointer items-center space-x-2.5 transition active:scale-95"
          onClick={() => {
            setSearchQuery("");
            setActiveTab("home");
          }}
        >
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <div className="w-4 h-4 border-2 border-white rounded-full opacity-80" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-sans">
            CICADA <span className="text-emerald-500 font-extrabold font-black">TUBE</span>
          </span>
        </div>

        {/* Mini header nav matching the sleek specs */}
        <nav className="hidden lg:flex gap-6 ml-4">
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveTab("home");
            }}
            className={`text-sm font-semibold transition ${
              activeTab === "home" ? "text-emerald-500" : "text-zinc-400 hover:text-white"
            }`}
          >
            Browse
          </button>
          <button
            onClick={() => setActiveTab("live")}
            className={`text-sm font-semibold transition ${
              activeTab === "live" ? "text-emerald-500" : "text-zinc-400 hover:text-white"
            }`}
          >
            Live Streams
          </button>
          <button
            onClick={() => onNavigateToUser("m.tealieb2014")}
            className={`text-sm font-semibold transition ${
              activeTab === "profile" ? "text-emerald-500" : "text-zinc-400 hover:text-white"
            }`}
          >
            My Node
          </button>
        </nav>
      </div>      {/* Global Search Bar */}
      <div id="header-search-container" className="hidden max-w-sm md:max-w-md w-full sm:flex items-center mx-4 relative">
        <div className="relative w-full group">
          <input
            id="global-search-input"
            type="text"
            placeholder="Search the global soundscape..."
            value={searchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeTab !== "home" && activeTab !== "profile") setActiveTab("home");
            }}
            className="w-full rounded-full border border-zinc-805 bg-zinc-900/80 py-1.8 pl-10 pr-4 font-sans text-sm text-zinc-100 placeholder-zinc-650 outline-none ring-1 ring-transparent transition focus:border-emerald-500/50 focus:bg-zinc-900 focus:ring-emerald-500/20 font-medium"
            autoComplete="off"
          />
          <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-550" />
          {searchQuery && (
            <button
              id="clear-search-btn"
              onClick={() => {
                setSearchQuery("");
                setIsFocused(true);
              }}
              onMouseDown={(e) => e.preventDefault()}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-zinc-500 hover:text-zinc-300 bg-zinc-850 hover:bg-zinc-800 px-1.5 py-0.5 rounded"
            >
              ESC
            </button>
          )}

          {/* Real-time Suggestions Dropdown */}
          {isFocused && suggestions.length > 0 && (
            <div
              id="search-suggestions-dropdown"
              onMouseDown={(e) => e.preventDefault()}
              className="absolute top-full left-0 right-0 mt-2 z-50 w-full rounded-2xl border border-zinc-850 bg-zinc-950 p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.95)] max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-track-zinc-950 scrollbar-thumb-zinc-900 animate-scale-up"
            >
              <div className="px-2 pb-1.5 pt-1 border-b border-zinc-900 flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">
                  {!queryLower ? "Trending Swarms" : "Frequency Matches"}
                </span>
                <span className="font-mono text-[8.5px] text-zinc-600 font-bold uppercase tracking-wider">
                  {suggestions.length} Signals
                </span>
              </div>

              <div className="space-y-1 mt-2">
                {suggestions.map((item, index) => {
                  const isSelected = index === focusedIndex;
                  return (
                    <div
                      key={item.id}
                      id={`suggestion-${item.id}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        item.onSelect();
                      }}
                      onMouseEnter={() => setFocusedIndex(index)}
                      className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500/10 border-emerald-500/25 text-white"
                          : "bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-9 h-6.5 rounded object-cover border border-zinc-850 shrink-0"
                          />
                        ) : (
                          <div className={`p-1.5 rounded-lg shrink-0 ${
                            isSelected ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-900 text-zinc-650"
                          }`}>
                            {item.icon}
                          </div>
                        )}
                        <div className="min-w-0 text-left">
                          <p className="font-sans text-xs font-semibold truncate leading-tight">
                            {item.label}
                          </p>
                          {item.sublabel && (
                            <p className="font-sans text-[10.5px] text-zinc-500 truncate leading-normal mt-0.5 font-medium">
                              {item.sublabel}
                            </p>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center space-x-1 shrink-0 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[8px] uppercase tracking-normal font-bold">
                          <span>Sync</span>
                          <CornerDownLeft className="h-2 w-2" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Suggestions guide footer */}
              <div className="mt-2.5 pt-2 border-t border-zinc-900/80 px-2 flex items-center justify-between font-mono text-[8px] text-zinc-550 uppercase font-semibold tracking-wider">
                <span>↑↓ Navigate Node</span>
                <span>Enter to Select</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action tray */}
      <div id="header-actions" className="flex items-center space-x-3.5 relative">
        {/* Notification Bell with Dropdown Toggle */}
        <div className="relative">
          <button
            id="header-notification-bell"
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-xl border transition relative ${
              showNotifications
                ? "bg-zinc-850 border-zinc-700 text-emerald-400"
                : "bg-zinc-900 border-zinc-805 text-zinc-400 hover:border-zinc-750 hover:text-white"
            }`}
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div
              id="notifications-dropdown-menu"
              className="absolute right-0 mt-3 w-80 rounded-2xl bg-zinc-950 border border-zinc-850 p-4 shadow-2xl animate-scale-up z-50 text-left space-y-3"
            >
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-emerald-400" />
                  <span className="font-sans text-xs font-bold text-white uppercase tracking-wider">
                    Notifications ({unreadCount})
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      onMarkAllRead();
                    }}
                    className="flex items-center space-x-1 font-mono text-[9px] text-emerald-400 hover:text-emerald-300"
                    title="Mark all as read"
                  >
                    <Check className="h-3 w-3" />
                    <span>Read All</span>
                  </button>
                )}
              </div>

              {/* List */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-zinc-650 font-sans text-xs">
                    No new notification pulses.
                  </div>
                ) : (
                  notifications.slice().reverse().map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        onSelectNotification(notif);
                        setShowNotifications(false);
                      }}
                      className={`p-2.5 rounded-xl border transition text-left cursor-pointer ${
                        notif.read
                          ? "bg-zinc-900/30 border-zinc-900/60 hover:bg-zinc-900/80"
                          : "bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1">
                            {!notif.read && (
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                            )}
                            <h5 className="font-sans text-[11.5px] font-bold text-zinc-100 truncate">
                              {notif.title}
                            </h5>
                          </div>
                          <p className="font-sans text-[10.5px] text-zinc-400 mt-0.5 leading-snug line-clamp-2">
                            {notif.message}
                          </p>
                          <span className="font-mono text-[8.5px] text-zinc-600 block mt-1">
                            {notif.timestamp}
                          </span>
                        </div>

                        {/* Interactive dismiss cross */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDismissNotification(notif.id);
                          }}
                          className="text-zinc-600 hover:text-rose-400 p-0.5 rounded transition shrink-0"
                          title="Dismiss notification"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Wallet Indicator */}
        <button
          id="header-wallet-btn"
          onClick={() => setActiveTab("wallet")}
          className={`flex items-center space-x-2 rounded-xl py-1.5 px-3 border transition ${
            activeTab === "wallet"
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
              : "border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900"
          }`}
        >
          <Wallet className="h-4 w-4 text-emerald-500" />
          <span className="font-mono text-xs font-bold tracking-tight text-zinc-100">
            ${wallet.balance.toFixed(2)}
          </span>
        </button>

        {/* Premium Upgrade Button */}
        {wallet.isPremiumUser ? (
          <div
            id="premium-status-indicator"
            className="hidden lg:flex items-center space-x-1 rounded-full bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400 font-sans shadow-[0_0_15px_rgba(16,185,129,0.05)]"
          >
            <Sparkles className="h-3 w-3 text-emerald-400 animate-spin" />
            <span>Premium</span>
          </div>
        ) : (
          <button
            id="go-premium-btn"
            onClick={onUpgradePremium}
            className="hidden sm:flex items-center space-x-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition hover:from-emerald-400 hover:to-teal-300 active:scale-95 shadow-[0_4px_12px_rgba(16,185,129,0.25)]"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Go Premium</span>
          </button>
        )}

        {/* Profile Avatar Widget */}
        <div
          id="profile-container"
          onClick={() => onNavigateToUser("m.tealieb2014")}
          className="flex items-center space-x-2 border-l border-zinc-800 pl-3.5 cursor-pointer hover:opacity-80 transition"
        >
          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-emerald-500/40 bg-zinc-900 hover:border-emerald-400 transition">
            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-emerald-400 bg-gradient-to-tr from-emerald-500/20 to-teal-400/10">
              M
            </div>
            {wallet.isPremiumUser && (
              <div className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 text-[6px] font-bold text-zinc-950 border border-zinc-950">
                ★
              </div>
            )}
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="font-sans text-xs font-semibold text-zinc-200">m.tealieb2014</span>
            <span className="font-mono text-[9px] text-zinc-500 uppercase font-bold leading-tight">
              {wallet.isPremiumUser ? "Premium Node" : "Free Explorer"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
