/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum VideoCategory {
  ALL = "All",
  ENTERTAINMENT = "Entertainment",
  EDUCATION = "Education",
  MUSIC = "Music",
  GAMING = "Gaming",
  NEWS = "News",
  LIVE = "Live Broadcasts"
}

export interface Comment {
  id: string;
  author: string;
  avatarColor: string;
  text: string;
  likes: number;
  timestamp: string;
  isCreator?: boolean;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  category: VideoCategory;
  duration: string;
  views: number;
  likes: number;
  uploaderName: string;
  uploaderSubscribers: number;
  uploadedAt: string;
  videoUrl: string; // fallback if playing real/simulated video
  thumbnailUrl: string;
  comments: Comment[];
  isPremium?: boolean;
  monetized?: boolean;
  earnings?: number;
  videoBlobUrl?: string; // used for custom user uploads
}

export interface LiveStream {
  id: string;
  title: string;
  streamerName: string;
  viewerCount: number;
  category: VideoCategory;
  streamUrl: string;
  thumbnailUrl: string;
  activeTips: { id: string; user: string; amount: number; message: string; color: string }[];
}

export interface CreatorAnalytics {
  totalViews: number;
  totalWatchTimeHours: number;
  totalSubscribers: number;
  totalRevenue: number;
  adRevenue: number;
  tipRevenue: number;
  premiumRevenue: number;
  monthlyRevenueData: { month: string; amount: number }[];
}

export interface UserWallet {
  balance: number;
  isPremiumUser: boolean;
  premiumCost: number;
  history: {
    id: string;
    type: "tip_sent" | "tip_received" | "ad_earning" | "premium_sub" | "withdrawal" | "premium_unlock" | "ad_spend";
    amount: number;
    description: string;
    date: string;
  }[];
}

export interface Advertisement {
  id: string;
  brandName: string;
  slogan: string;
  actionText: string;
  themeColor: "amber" | "emerald" | "crimson" | "blue";
  cost: number;
  creator: string;
  impressions: number;
  clicks: number;
  createdAt: string;
}

export interface UserProfile {
  username: string;
  avatarColor: string;
  bio: string;
  subscribers: number;
  isCreator: boolean;
  viewsCount?: number;
  likedVideoIds?: string[];
  viewedVideoIds?: string[];
}

export interface Notification {
  id: string;
  type: "upload" | "system" | "tip";
  title: string;
  message: string;
  timestamp: string;
  channelName?: string;
  videoId?: string;
  read: boolean;
}


export interface UserProfile {
  username: string;
  avatarColor: string;
  bio: string;
  subscribers: number;
  isCreator: boolean;
  viewsCount?: number;
  likedVideoIds?: string[];
  viewedVideoIds?: string[];
}

export interface Notification {
  id: string;
  type: "upload" | "system" | "tip";
  title: string;
  message: string;
  timestamp: string;
  channelName?: string;
  videoId?: string;
  read: boolean;
}

