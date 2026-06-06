/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Video, VideoCategory, UserWallet, CreatorAnalytics, Comment, Notification } from "./types";
import { SEED_VIDEOS, MOCK_STREAM } from "./data";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import VideoFeed from "./components/VideoFeed";
import VideoPlayer from "./components/VideoPlayer";
import LiveStreamView from "./components/LiveStreamView";
import CreatorStudio from "./components/CreatorStudio";
import WalletHub from "./components/WalletHub";
import UserProfile from "./components/UserProfile";

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>("home");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [profileUsername, setProfileUsername] = useState<string>("m.tealieb2014");

  // Global Video List State
  const [videos, setVideos] = useState<Video[]>(SEED_VIDEOS);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Subscribed Uploaders Tracking Lists
  const [subscribedUploaders, setSubscribedUploaders] = useState<string[]>([]);
  const [bellSubscriptions, setBellSubscriptions] = useState<string[]>([]);

  // User Profile Bios Store
  const [userBios, setUserBios] = useState<Record<string, string>>({
    "m.tealieb2014": "Soundscape coordinator, periodical enthusiast, and global insect node observer.",
    "Stridulation Beats": "Synthesizing bio-acoustic signals since the 13-year hatch. Field recordings paired with rare modular synthesis.",
    "Deep Wild Biology": "Field biologist researching Brood XIX periodical swarm vectors and soundscape taxonomy.",
    "Triton Cinematic": "Audio-visual sci-fi blocks and electronic subfrequencies designed for high-amplitude subwoofers.",
    "SpeedyBugs": "Entomology optimization specialist. Glitch-art microtones and faster-than-light periodical hatch beats.",
    "Apex Financial News": "Economic entomology, natural resource futures tracker, and periodic trade cycle forecasts.",
    "Synthesizer Pro": "Step-by-step modular guide tutorials, electronic larva triggers, and frequency filtering.",
    "Cicada Network LIVE": "Continuous global broadcasts of background hums and environmental telemetry streams."
  });

  // Client History states for Personalized Recommendation Engine
  const [viewedVideoIds, setViewedVideoIds] = useState<string[]>([]);
  const [likedVideoIds, setLikedVideoIds] = useState<string[]>([]);

  // Notifications State Center
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "init-notif-1",
      type: "system",
      title: "Welcome to Cicada Network!",
      message: "Establish bio-frequency syncing nodes. Premium features are ready.",
      timestamp: "10m ago",
      read: false
    },
    {
      id: "init-notif-2",
      type: "upload",
      title: "Recommended for You",
      message: "Deep Wild Biology uploaded: Periodical Hatch Secrets: Understanding Swarms",
      timestamp: "1h ago",
      channelName: "Deep Wild Biology",
      videoId: "v-bio",
      read: true
    }
  ]);

  // User Wallet State
  const [wallet, setWallet] = useState<UserWallet>({
    balance: 45.0, // starting funds
    isPremiumUser: false,
    premiumCost: 9.99,
    history: [
      {
        id: "ledger-init-1",
        type: "tip_received",
        amount: 25.0,
        description: "Initial platform testing currency grant",
        date: "2026-06-06 09:12"
      }
    ]
  });

  // Creator Studio & Analytics state
  const [analytics, setAnalytics] = useState<CreatorAnalytics>({
    totalViews: 3892010,
    totalWatchTimeHours: 421000,
    totalSubscribers: 1548200,
    totalRevenue: 2840.5,
    adRevenue: 1890.0,
    tipRevenue: 450.5,
    premiumRevenue: 500.0,
    monthlyRevenueData: [
      { month: "Jan", amount: 200 },
      { month: "Feb", amount: 350 },
      { month: "Mar", amount: 600 },
      { month: "Apr", amount: 550 },
      { month: "May", amount: 800 },
      { month: "Jun", amount: 2840.5 }
    ]
  });

  // Dynamic recommendation engine resolver
  const getFavoriteCategory = (): string | null => {
    if (viewedVideoIds.length === 0) return null;
    const counts: Record<string, number> = {};
    viewedVideoIds.forEach((id) => {
      const v = videos.find((item) => item.id === id);
      if (v) {
        counts[v.category] = (counts[v.category] || 0) + 1;
      }
    });
    
    let maxCount = 0;
    let favorite: string | null = null;
    Object.entries(counts).forEach(([cat, val]) => {
      if (val > maxCount) {
        maxCount = val;
        favorite = cat;
      }
    });
    return favorite;
  };

  const favoriteCategory = getFavoriteCategory();

  // Create personal scoring
  const recommendedVideos = videos
    .map((video) => {
      let score = 0;
      let reason = "Popular in Global Network";

      // 1. Core views popularity indicator
      score += Math.log10(video.views + 1) * 3;
      score += Math.log10(video.likes + 1) * 1.5;

      // 2. Subscribed Creator matching
      if (subscribedUploaders.includes(video.uploaderName)) {
        score += 80;
        reason = `From your subscribed uploader: ${video.uploaderName}`;
      }

      // 3. Category matching (Favorite category gets priority)
      if (favoriteCategory && video.category === favoriteCategory) {
        score += 45;
        if (reason === "Popular in Global Network") {
          reason = `Based on your interest in ${video.category}`;
        }
      }

      // 4. Liking habits matching
      const hasLikedUploader = videos
        .filter((v) => likedVideoIds.includes(v.id))
        .some((v) => v.uploaderName === video.uploaderName);
      if (hasLikedUploader) {
        score += 35;
        if (reason === "Popular in Global Network") {
          reason = `Interactivity with ${video.uploaderName}`;
        }
      }

      // 5. Already Watched (Watched videos are heavily deprioritized in recom shelf)
      if (viewedVideoIds.includes(video.id)) {
        score -= 60;
      }

      // 6. Premium Bonus
      if (video.isPremium) {
        score += 15;
      }

      return {
        video,
        score,
        reason,
      };
    })
    .sort((a, b) => b.score - a.score)
    // Filter out user's own videos to focus on discovering other channels
    .filter((item) => item.video.uploaderName !== "m.tealieb2014");

  // Navigation handlers
  const handleNavigateToUser = (username: string) => {
    setSelectedVideo(null);
    setProfileUsername(username);
    setSelectedVideo(null); // Clear video theater view
    setActiveTab("profile");
  };

  // Toggle subscriber notifications bell
  const handleToggleBellSubscription = (channelName: string) => {
    if (bellSubscriptions.includes(channelName)) {
      setBellSubscriptions((prev) => prev.filter((name) => name !== channelName));
    } else {
      setBellSubscriptions((prev) => [...prev, channelName]);
    }
  };

  // Notification action handlers
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSelectNotification = (notif: Notification) => {
    // Mark specifically as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );

    // Play related video node
    if (notif.videoId) {
      const match = videos.find((v) => v.id === notif.videoId);
      if (match) {
        handleSelectVideo(match);
        return;
      }
    }

    // Inspect related creator profile
    if (notif.channelName) {
      handleNavigateToUser(notif.channelName);
    }
  };

  // Upgrades user to premium
  const handleUpgradePremium = () => {
    if (wallet.isPremiumUser) return;

    if (wallet.balance >= wallet.premiumCost) {
      setWallet((prev) => ({
        ...prev,
        balance: prev.balance - prev.premiumCost,
        isPremiumUser: true,
        history: [
          ...prev.history,
          {
            id: `ledger-prem-${Date.now()}`,
            type: "premium_unlock",
            amount: prev.premiumCost,
            description: "Purchased Cicada Premium Subscription (Adblock unlocked)",
            date: new Date().toISOString().replace("T", " ").substring(0, 16)
          }
        ]
      }));

      // Distribute portion to overall network split
      setAnalytics((prev) => ({
        ...prev,
        totalRevenue: prev.totalRevenue + 5.0,
        premiumRevenue: prev.premiumRevenue + 5.0,
        monthlyRevenueData: prev.monthlyRevenueData.map((d, index) =>
          index === prev.monthlyRevenueData.length - 1 ? { ...d, amount: d.amount + 5.0 } : d
        )
      }));

      // Sync alert
      const premiumAlert: Notification = {
        id: `prem-notif-${Date.now()}`,
        type: "system",
        title: "Node Premium Upgrade Approved!",
        message: "Your account is high-frequency synced. Ads disabled globally.",
        timestamp: "Just now",
        read: false
      };
      setNotifications((prev) => [...prev, premiumAlert]);
    } else {
      setActiveTab("wallet");
    }
  };

  // Add capital to user wallet
  const handleDepositFunds = (amount: number) => {
    setWallet((prev) => ({
      ...prev,
      balance: prev.balance + amount,
      history: [
        ...prev.history,
        {
          id: `ledger-dep-${Date.now()}`,
          type: "tip_received",
          amount: amount,
          description: `Deposited $${amount.toFixed(2)} virtual transfer into account`,
          date: new Date().toISOString().replace("T", " ").substring(0, 16)
        }
      ]
    }));
  };

  // Deduct user wallet
  const handleDeductWallet = (amount: number, description: string, targetVideoId?: string): boolean => {
    if (wallet.balance < amount) return false;

    setWallet((prev) => ({
      ...prev,
      balance: prev.balance - amount,
      history: [
        ...prev.history,
        {
          id: `ledger-ded-${Date.now()}`,
          type: "tip_sent",
          amount: amount,
          description: description,
          date: new Date().toISOString().replace("T", " ").substring(0, 16)
        }
      ]
    }));

    // Tipping payouts
    if (targetVideoId) {
      const matchVideo = videos.find((v) => v.id === targetVideoId);
      if (matchVideo) {
        setVideos((prev) =>
          prev.map((v) => (v.id === targetVideoId ? { ...v, earnings: (v.earnings || 0) + amount } : v))
        );

        if (matchVideo.uploaderName === "m.tealieb2014") {
          setAnalytics((prev) => {
            const addedRev = amount * 0.9;
            const updatedTotal = prev.totalRevenue + addedRev;
            return {
              ...prev,
              totalRevenue: updatedTotal,
              tipRevenue: prev.tipRevenue + addedRev,
              monthlyRevenueData: prev.monthlyRevenueData.map((d, index) =>
                index === prev.monthlyRevenueData.length - 1 ? { ...d, amount: d.amount + addedRev } : d
              )
            };
          });
        }
      }
    }

    return true;
  };

  // Subscribing handler
  const handleRegisterSubscriber = (uploaderName: string) => {
    const alreadySubscribed = subscribedUploaders.includes(uploaderName);
    
    if (alreadySubscribed) {
      setSubscribedUploaders((prev) => prev.filter((name) => name !== uploaderName));
      // Remove bell as well if unsubscribing
      setBellSubscriptions((prev) => prev.filter((name) => name !== uploaderName));
    } else {
      setSubscribedUploaders((prev) => [...prev, uploaderName]);
      // Standardize bell as active by default for subscription alerts
      setBellSubscriptions((prev) => [...prev, uploaderName]);

      // Push a personalized notification from that creator
      setTimeout(() => {
        const creatorWelcomeAlert: Notification = {
          id: `channel-notif-${Date.now()}`,
          type: "upload",
          title: `Welcome to ${uploaderName}!`,
          message: `${uploaderName} has approved your frequency alignment. Get ready for upload telemetry.`,
          timestamp: "Just now",
          channelName: uploaderName,
          read: false
        };
        setNotifications((prev) => [...prev, creatorWelcomeAlert]);
      }, 500);
    }
  };

  // Cash out creator funds
  const handleWithdrawFunds = () => {
    if (analytics.totalRevenue <= 0) return;

    const withdrawnAmount = analytics.totalRevenue;

    setAnalytics((prev) => ({
      ...prev,
      totalRevenue: 0,
      monthlyRevenueData: prev.monthlyRevenueData.map((d, index) =>
        index === prev.monthlyRevenueData.length - 1 ? { ...d, amount: d.amount - withdrawnAmount } : d
      )
    }));

    setWallet((prev) => ({
      ...prev,
      balance: prev.balance + withdrawnAmount,
      history: [
        ...prev.history,
        {
          id: `ledger-with-${Date.now()}`,
          type: "withdrawal",
          amount: withdrawnAmount,
          description: `Withdrew uploader profits of $${withdrawnAmount.toFixed(2)} to physical balance`,
          date: new Date().toISOString().replace("T", " ").substring(0, 16)
        }
      ]
    }));
  };

  // Save biology description setup
  const handleSaveBio = (username: string, updatedBio: string) => {
    setUserBios((prev) => ({
      ...prev,
      [username]: updatedBio
    }));
  };

  // Video selected handler
  const handleSelectVideo = (video: Video) => {
    setSelectedVideo(video);

    // Track play counts
    if (!viewedVideoIds.includes(video.id)) {
      setViewedVideoIds((prev) => [...prev, video.id]);
    }
  };

  // Video globally liked handler
  const handleToggleLikeVideo = (videoId: string) => {
    if (likedVideoIds.includes(videoId)) {
      setLikedVideoIds((prev) => prev.filter((id) => id !== videoId));
      setVideos((prev) =>
        prev.map((v) => (v.id === videoId ? { ...v, likes: Math.max(0, v.likes - 1) } : v))
      );
    } else {
      setLikedVideoIds((prev) => [...prev, videoId]);
      setVideos((prev) =>
        prev.map((v) => (v.id === videoId ? { ...v, likes: v.likes + 1 } : v))
      );
    }
  };

  // Upload complete - pushes newly structured format custom video to feed catalog
  const handlePublishCustomVideo = (newVideo: Video) => {
    setVideos((prev) => [newVideo, ...prev]);

    // Send a system upload notification
    const uploadNotification: Notification = {
      id: `sys-upload-${Date.now()}`,
      type: "system",
      title: "Content Sync Complete!",
      message: `Your video "${newVideo.title}" was approved. Initial tip vectors are listening.`,
      timestamp: "Just now",
      videoId: newVideo.id,
      read: false
    };
    setNotifications((prev) => [...prev, uploadNotification]);
  };

  // Navigation route router rendering
  const renderTabContent = () => {
    if (selectedVideo) {
      return (
        <VideoPlayer
          video={selectedVideo}
          wallet={wallet}
          isPremiumUser={wallet.isPremiumUser}
          onDeductWallet={handleDeductWallet}
          onRegisterSubscriber={handleRegisterSubscriber}
          isSubscribed={subscribedUploaders.includes(selectedVideo.uploaderName)}
          onClose={() => setSelectedVideo(null)}
          likedVideoIds={likedVideoIds}
          onToggleLikeVideo={handleToggleLikeVideo}
          onNavigateToUser={handleNavigateToUser}
        />
      );
    }

    switch (activeTab) {
      case "profile":
        return (
          <UserProfile
            username={profileUsername}
            loggedInUsername="m.tealieb2014"
            isPremium={wallet.isPremiumUser}
            videos={videos}
            subscribedUploaders={subscribedUploaders}
            onRegisterSubscriber={handleRegisterSubscriber}
            onSelectVideo={handleSelectVideo}
            userBios={userBios}
            onSaveBio={handleSaveBio}
            bellSubscriptions={bellSubscriptions}
            onToggleBellSubscription={handleToggleBellSubscription}
          />
        );
      case "live":
        return (
          <LiveStreamView
            stream={MOCK_STREAM}
            wallet={wallet}
            onDeductWallet={handleDeductWallet}
          />
        );
      case "studio":
        return (
          <CreatorStudio
            analytics={analytics}
            videos={videos}
            onAddVideo={handlePublishCustomVideo}
            onWithdrawFunds={handleWithdrawFunds}
            walletBalance={wallet.balance}
          />
        );
      case "wallet":
        return (
          <WalletHub
            wallet={wallet}
            analytics={analytics}
            onDepositFunds={handleDepositFunds}
            onUpgradePremium={handleUpgradePremium}
            onWithdrawFunds={handleWithdrawFunds}
          />
        );
      default:
        return (
          <VideoFeed
            videos={videos}
            onSelectVideo={handleSelectVideo}
            searchQuery={searchQuery}
            isPremiumUser={wallet.isPremiumUser}
            onNavigateToUser={handleNavigateToUser}
            recommendedVideos={recommendedVideos}
          />
        );
    }
  };

  return (
    <div id="cicada-app-wrapper" className="flex min-h-screen flex-col bg-[#0a0a0a] text-zinc-100 antialiased selection:bg-emerald-500/10 selection:text-emerald-450">
      {/* Top Header Row */}
      <Header
        wallet={wallet}
        onUpgradePremium={handleUpgradePremium}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedVideo(null);
          setActiveTab(tab);
        }}
        onNavigateToUser={handleNavigateToUser}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onDismissNotification={handleDismissNotification}
        onSelectNotification={handleSelectNotification}
        videos={videos}
        onSelectVideo={handleSelectVideo}
      />

      {/* Main Body Scaffold */}
      <div id="cicada-main-scaffold" className="flex flex-1">
        {/* Left Side menu rail */}
        <Sidebar
          activeTab={selectedVideo ? "" : activeTab}
          setActiveTab={(tab) => {
            setSelectedVideo(null);
            setSearchQuery("");
            setActiveTab(tab);
          }}
          isPremium={wallet.isPremiumUser}
          subscribedUploaders={subscribedUploaders}
          onNavigateToUser={handleNavigateToUser}
        />

        {/* Scrollable primary router viewport */}
        <main
          id="cicada-view-scroller"
          className="flex-1 overflow-y-auto px-4 py-6 md:p-8 max-w-7xl mx-auto h-[calc(100vh-4rem)] scrollbar-thin scrollbar-track-zinc-950 scrollbar-thumb-zinc-900"
        >
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
