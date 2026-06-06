/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Video, UserWallet } from "../types";
import {
  User,
  Settings,
  Mail,
  Users,
  Award,
  Video as VideoIcon,
  BookOpen,
  Calendar,
  Check,
  Edit2,
  Lock,
  Globe,
  Bell,
  BellOff,
  Sparkles,
  Play
} from "lucide-react";

interface UserProfileProps {
  username: string; // user whose profile we are viewing
  loggedInUsername: string; // current logged in user name
  isPremium: boolean;
  videos: Video[];
  subscribedUploaders: string[];
  onRegisterSubscriber: (uploader: string) => void;
  onSelectVideo: (video: Video) => void;
  // Handler for saving edited user profiles
  userBios: Record<string, string>;
  onSaveBio: (username: string, bio: string) => void;
  // Notifications setting
  bellSubscriptions: string[];
  onToggleBellSubscription: (channel: string) => void;
  watchProgress?: Record<string, number>;
}

export default function UserProfile({
  username,
  loggedInUsername,
  isPremium,
  videos,
  subscribedUploaders,
  onRegisterSubscriber,
  onSelectVideo,
  userBios,
  onSaveBio,
  bellSubscriptions,
  onToggleBellSubscription,
  watchProgress,
}: UserProfileProps) {
  const isMe = username === loggedInUsername;
  const isSubscribed = subscribedUploaders.includes(username);
  const isBellActive = bellSubscriptions.includes(username);

  // Editable bio states
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [editedBio, setEditedBio] = useState<string>(
    userBios[username] || "Soundscape designer, regular periodic larva, and bio-frequency explorer."
  );

  // Subsections inside profile
  const [profileTab, setProfileTab] = useState<"videos" | "about">("videos");

  // Get uploaded videos
  const userVideos = videos.filter(
    (video) => video.uploaderName.toLowerCase() === username.toLowerCase()
  );

  // Calculate stats
  const totalViews = userVideos.reduce((sum, v) => sum + v.views, 0);
  const totalLikes = userVideos.reduce((sum, v) => sum + v.likes, 0);

  const handleSaveBioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBio(username, editedBio);
    setIsEditingBio(false);
  };

  // Simulated Avatar Colors or fallback
  const getAvatarColor = (name: string) => {
    const colors = [
      "from-emerald-500 to-teal-500",
      "from-indigo-600 to-teal-400",
      "from-purple-600 to-emerald-500",
      "from-orange-500 to-rose-500",
      "from-blue-600 to-emerald-400"
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  return (
    <div id="user-profile-layout" className="space-y-6">
      {/* Banner / Header background */}
      <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800/80">
        <div className="absolute inset-0 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
        {/* Abstract design element to look hyper-sleek */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-40 bg-emerald-500/5 blur-3xl rounded-full" />
        <div className="absolute right-10 bottom-4 text-xs font-mono text-zinc-650 flex items-center space-x-1.5 uppercase font-bold tracking-widest bg-zinc-950/80 border border-zinc-850 px-3 py-1 rounded-full">
          <Globe className="h-3.5 w-3.5 text-emerald-500" />
          <span>Cicada Network Node</span>
        </div>
      </div>

      {/* Profile Details Bar */}
      <div className="relative flex flex-col md:flex-row md:items-end justify-between px-3 md:px-6 -mt-16 pb-4 border-b border-zinc-900 gap-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
          {/* Avatar frame */}
          <div className={`h-24 w-24 shrink-0 rounded-full bg-gradient-to-tr ${getAvatarColor(username)} p-0.5 shadow-2xl`}>
            <div className="h-full w-full rounded-full bg-zinc-950 flex items-center justify-center text-2xl font-sans font-black text-white">
              {username[0].toUpperCase()}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="font-sans font-bold text-lg text-zinc-100 tracking-tight">
                {username}
              </h2>
              {isMe && (
                <span className="text-[9.5px] font-mono text-zinc-950 bg-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Self Node
                </span>
              )}
              {!isMe && isSubscribed && (
                <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Subscribed
                </span>
              )}
            </div>

            <p className="font-sans text-xs text-zinc-400 max-w-lg leading-relaxed">
              {userBios[username] || "No biological frequency biography added yet. Complete your profile bio details!"}
            </p>

            <div className="flex items-center justify-center sm:justify-start space-x-4 text-zinc-500 font-mono text-[10.5px]">
              <span className="flex items-center space-x-1">
                <Users className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-bold text-zinc-300">
                  {((isMe ? 12 : userVideos.length ? userVideos[0].uploaderSubscribers : 142) + (isSubscribed ? 1 : 0)).toLocaleString()}
                </span>
                <span className="text-zinc-650 uppercase">Subscribers</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <VideoIcon className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-bold text-zinc-300">{userVideos.length}</span>
                <span className="text-zinc-650 uppercase">Videos</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action controllers */}
        <div className="flex items-center justify-center space-x-2.5 shrink-0">
          {isMe ? (
            <button
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="flex items-center space-x-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2 font-sans text-xs font-bold text-zinc-200 hover:border-emerald-500/40 hover:text-white transition active:scale-95"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>{isEditingBio ? "Cancel Edit" : "Edit Bio"}</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onRegisterSubscriber(username)}
                className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 font-sans text-xs font-bold transition active:scale-95 duration-250 ${
                  isSubscribed
                    ? "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-850 hover:text-white"
                    : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                }`}
              >
                <span>{isSubscribed ? "Unsubscribe" : "Subscribe"}</span>
              </button>

              {/* Notification Bell toggle */}
              {isSubscribed && (
                <button
                  onClick={() => onToggleBellSubscription(username)}
                  title={isBellActive ? "All upload notifications on" : "Mute upload notifications"}
                  className={`p-2 rounded-xl border transition ${
                    isBellActive
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                      : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {isBellActive ? (
                    <Bell className="h-4 w-4 animate-bounce" />
                  ) : (
                    <BellOff className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Bio Editor Block (shows if editing card) */}
      {isEditingBio && (
        <form onSubmit={handleSaveBioSubmit} className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl space-y-3 font-sans max-w-xl">
          <h3 className="font-mono text-[9px] uppercase tracking-wider text-emerald-500 font-bold">
            Write Your Creator Spectrum Biography
          </h3>
          <textarea
            required
            rows={3}
            value={editedBio}
            onChange={(e) => setEditedBio(e.target.value)}
            className="w-full text-xs rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-200 p-3 outline-none focus:border-emerald-500/50 resize-none font-sans"
            placeholder="Tell other periodical network nodes who you are..."
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-1 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-sans text-xs font-bold rounded-lg transition"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Save Bio Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* Tabs and Content Section */}
      <div className="space-y-4">
        {/* Navigation line */}
        <div className="flex items-center space-x-5 border-b border-zinc-900/60 pb-1 font-sans">
          <button
            onClick={() => setProfileTab("videos")}
            className={`font-sans text-xs font-bold py-2 px-1 relative transition ${
              profileTab === "videos" ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Uploaded Videos
            {profileTab === "videos" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setProfileTab("about")}
            className={`font-sans text-xs font-bold py-2 px-1 relative transition ${
              profileTab === "about" ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Creator Node Stats
            {profileTab === "about" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab display */}
        {profileTab === "videos" ? (
          <div>
            {userVideos.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-zinc-900 rounded-xl bg-zinc-900/10">
                <VideoIcon className="h-8 w-8 text-zinc-700 mx-auto animate-pulse mb-3" />
                <h4 className="font-sans font-bold text-xs text-zinc-400">Biological Spectrum catalog is empty</h4>
                <p className="font-sans text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
                  {isMe
                    ? "Go to the Creator Studio tab to publish your first audio or video node files!"
                    : "This creator node has not registered any media uploads on this epoch."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {userVideos.map((video) => (
                  <div
                    key={video.id}
                    id={`profile-video-${video.id}`}
                    onClick={() => onSelectVideo(video)}
                    className="group border border-zinc-900 bg-zinc-950/60 hover:bg-zinc-900/40 hover:border-emerald-500/15 transition rounded-xl overflow-hidden cursor-pointer flex flex-col justify-between"
                  >
                    <div className="aspect-video relative overflow-hidden bg-zinc-900">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute bottom-2 right-2 rounded bg-zinc-950/90 px-1 text-[9.5px] font-mono text-zinc-300">
                        {video.duration}
                      </span>
                      <div className="absolute inset-0 bg-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-zinc-950/30">
                        <Play className="h-8 w-8 text-emerald-400 shrink-0" />
                      </div>

                      {/* Watch progress indicator bar */}
                      {watchProgress && watchProgress[video.id] !== undefined && watchProgress[video.id] > 0 && (
                        <div className="absolute bottom-0 left-0 w-full h-[4px] bg-zinc-900/85 z-20 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300 rounded-r"
                            style={{ width: `${watchProgress[video.id]}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="font-sans text-xs font-bold text-zinc-200 line-clamp-1 group-hover:text-emerald-400 transition">
                        {video.title}
                      </h4>
                      <p className="font-mono text-[9.5px] text-zinc-500 mt-1.5">
                        {video.views.toLocaleString()} views • {video.uploadedAt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
            <div className="border border-zinc-900 bg-zinc-950 p-4 rounded-xl">
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-550 block font-bold">
                Platform Views Earned
              </span>
              <h4 className="font-mono font-black text-sm text-zinc-150 block mt-1.5">{totalViews.toLocaleString()}</h4>
              <span className="font-sans text-[10px] text-zinc-600 block mt-0.5">Across all content assets</span>
            </div>

            <div className="border border-zinc-900 bg-zinc-950 p-4 rounded-xl">
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-550 block font-bold">
                Community Approvals
              </span>
              <h4 className="font-mono font-black text-sm text-zinc-150 block mt-1.5">{totalLikes.toLocaleString()}</h4>
              <span className="font-sans text-[10px] text-zinc-600 block mt-0.5">Frequencies up-voted</span>
            </div>

            <div className="border border-zinc-900 bg-zinc-950 p-4 rounded-xl">
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-550 block font-bold">
                Affiliation Epoch
              </span>
              <h4 className="font-mono font-black text-sm text-zinc-150 block mt-1.5">June 2026</h4>
              <span className="font-sans text-[10px] text-zinc-600 block mt-0.5">17-year Periodical cycle</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
