/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Home, Tv, Film, Wallet, ShieldCheck, HeartHandshake, Users, Sparkles, Sliders } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isPremium: boolean;
  subscribedUploaders: string[];
  onNavigateToUser: (username: string) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isPremium,
  subscribedUploaders,
  onNavigateToUser,
}: SidebarProps) {
  const menuItems = [
    {
      id: "home",
      label: "Home Feed",
      icon: Home,
      description: "Explore recommendations",
    },
    {
      id: "dashboard",
      label: "User Dashboard",
      icon: Sliders,
      description: "Statistics & sound syner",
    },
    {
      id: "live",
      label: "Live Broadcasts",
      icon: Tv,
      description: "Periodical live streams",
    },
    {
      id: "register",
      label: "Register Node",
      icon: ShieldCheck,
      description: "Initialize transmission",
    },
    {
      id: "studio",
      label: "Creator Studio",
      icon: Film,
      description: "Upload & track revenue",
    },
    {
      id: "wallet",
      label: "Wallet & Ads",
      icon: Wallet,
      description: "Direct tips & transfers",
    },
  ];

  // Helper for dynamic channel visual node
  const getChannelColor = (name: string) => {
    const bgColors = [
      "bg-orange-500",
      "bg-blue-500",
      "bg-purple-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-rose-500"
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return bgColors[sum % bgColors.length];
  };

  return (
    <aside
      id="cicada-sidebar"
      className="flex h-[calc(100vh-4rem)] w-16 flex-col items-center justify-between border-r border-zinc-800/50 bg-[#0f0f0f] py-4 shadow-lg md:w-60 md:items-start md:px-4"
    >
      {/* Navigation Groups */}
      <div id="sidebar-nav-group" className="w-full space-y-6">
        <div>
          <div className="hidden px-2 mb-3 md:block">
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-550">
              Navigation
            </p>
          </div>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-tab-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                  }}
                  title={item.label}
                  className={`group flex h-10 w-10 items-center justify-center rounded-xl transition duration-200 md:w-full md:justify-start md:px-3 ${
                    isActive
                      ? "bg-emerald-500/10 border-l-2 border-emerald-500 text-emerald-400"
                      : "text-zinc-400 hover:bg-zinc-800/40 hover:text-white"
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-emerald-400" : "text-zinc-400 group-hover:text-zinc-200"}`} />
                  <div className="hidden flex-col items-start pl-3 text-left md:flex">
                    <span className="font-sans text-xs font-semibold tracking-wide">{item.label}</span>
                    <span className="font-mono text-[8.5px] text-zinc-500 -mt-0.5 group-hover:text-zinc-400">
                      {item.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Connected Subscribers */}
        <div className="hidden md:block w-full">
          <div className="px-2 mb-3">
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-550">
              Subscribed Nodes ({subscribedUploaders.length})
            </p>
          </div>

          {subscribedUploaders.length === 0 ? (
            <div className="px-2 py-4 border border-dashed border-zinc-900 rounded-xl text-center">
              <Users className="h-4 w-4 text-zinc-650 mx-auto mb-1 animate-pulse" />
              <p className="text-[10px] font-sans text-zinc-550 leading-normal">
                Follow creators to see subscriber nodes.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {subscribedUploaders.map((uploaderName) => (
                <div
                  key={uploaderName}
                  id={`sidebar-sub-node-${uploaderName.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => onNavigateToUser(uploaderName)}
                  className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-xl hover:bg-zinc-900/60 cursor-pointer group transition"
                >
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${getChannelColor(uploaderName)}`} />
                  <span className="font-sans text-xs font-medium text-zinc-300 group-hover:text-white truncate">
                    {uploaderName}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding Info */}
      <div id="sidebar-footer-group" className="w-full space-y-4">
        {/* Short Premium advert box on sidebar */}
        {!isPremium && (
          <div
            id="sidebar-premium-ad-card"
            className="hidden md:flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <div className="text-[10px] uppercase font-bold text-emerald-500 mb-1">Creator Program</div>
            <div className="text-xs font-semibold mb-2 text-zinc-200">Earn from your content</div>
            <button
              id="sidebar-upgrade-action"
              onClick={() => setActiveTab("wallet")}
              className="w-full py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-emerald-400 transition"
            >
              Start Monetizing
            </button>
          </div>
        )}

        <div id="sidebar-meta-col" className="flex flex-col items-center md:items-start md:px-2 text-zinc-500">
          <div className="hidden md:flex items-center space-x-1.5 opacity-50 hover:opacity-100 transition cursor-pointer mb-2">
            <HeartHandshake className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-mono text-[9px] tracking-wider uppercase font-semibold">
              Cicada Creator Fund
            </span>
          </div>
          <span className="font-mono text-[9px] font-medium block opacity-45">
            © 2026 Cicada Media
          </span>
          <span className="font-mono text-[7px] font-medium block opacity-30 mt-0.5 uppercase tracking-tight">
            Node Server 3000 Verified
          </span>
        </div>
      </div>
    </aside>
  );
}
