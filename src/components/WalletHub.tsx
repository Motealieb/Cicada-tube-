/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { UserWallet, CreatorAnalytics, Advertisement } from "../types";
import {
  Wallet,
  Sparkles,
  CreditCard,
  TrendingDown,
  TrendingUp,
  Award,
  ArrowRightLeft,
  ChevronDown,
  DollarSign,
  Briefcase,
  Layers,
  ArrowDownCircle,
  Clock,
  PlusCircle,
  Megaphone,
  BarChart3,
  CheckCircle,
  ExternalLink,
  Target
} from "lucide-react";

interface WalletHubProps {
  wallet: UserWallet;
  analytics: CreatorAnalytics;
  onDepositFunds: (amount: number) => void;
  onUpgradePremium: () => void;
  onWithdrawFunds: () => void;
  onPiUpgradePremium?: (callback: (success: boolean) => void) => void;
  advertisements?: Advertisement[];
  onCreateAdvertisement?: (adData: { brandName: string; slogan: string; actionText: string; themeColor: "amber" | "emerald" | "crimson" | "blue" }, budget: number) => boolean;
  currentUsername?: string;
}

export default function WalletHub({
  wallet,
  analytics,
  onDepositFunds,
  onUpgradePremium,
  onWithdrawFunds,
  onPiUpgradePremium,
  advertisements = [],
  onCreateAdvertisement,
  currentUsername = "m.tealieb2014"
}: WalletHubProps) {
  const [depositAmount, setDepositAmount] = useState<number>(20);
  const [atmSuccessMsg, setAtmSuccessMsg] = useState<string>("");
  const [piUpgradeLoading, setPiUpgradeLoading] = useState<boolean>(false);
  const [piUpgradeSuccessMsg, setPiUpgradeSuccessMsg] = useState<string>("");
  const [piUpgradeErrorMsg, setPiUpgradeErrorMsg] = useState<string>("");

  // Sub Tab
  const [walletTab, setWalletTab] = useState<"ledger" | "marketing">("ledger");

  // Ad Creator States
  const [brandName, setBrandName] = useState<string>("");
  const [slogan, setSlogan] = useState<string>("");
  const [actionText, setActionText] = useState<string>("Visit Website");
  const [themeColor, setThemeColor] = useState<"amber" | "emerald" | "crimson" | "blue">("emerald");
  const [budget, setBudget] = useState<number>(10);
  const [adSuccessMsg, setAdSuccessMsg] = useState<string>("");
  const [adErrorMsg, setAdErrorMsg] = useState<string>("");

  const playSynthesizerApprove = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (_) {}
  };

  const handleCreateAdCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    setAdErrorMsg("");
    setAdSuccessMsg("");

    if (!brandName.trim() || !slogan.trim() || !actionText.trim()) {
      setAdErrorMsg("Provide a valid Brand Name, campaign slogan, and clear button CTA label!");
      return;
    }

    if (budget < 5) {
      setAdErrorMsg("A minimum campaign allocation budget of $5.00 is required.");
      return;
    }

    if (wallet.balance < budget) {
      setAdErrorMsg(`Insufficient Funds! You need $${budget.toFixed(2)} to publish this campaign. Go to the Virtual ATM top-up panel to load more funds.`);
      return;
    }

    if (onCreateAdvertisement) {
      const success = onCreateAdvertisement({
        brandName,
        slogan,
        actionText,
        themeColor
      }, budget);

      if (success) {
        playSynthesizerApprove();
        setAdSuccessMsg(`Success! Your Sponsored Campaign "${brandName.toUpperCase()}" is now broadcasting.`);
        setBrandName("");
        setSlogan("");
        setActionText("Visit Website");
        setBudget(10);
        setTimeout(() => setAdSuccessMsg(""), 6000);
      } else {
        setAdErrorMsg("An unexpected failure occurred while writing to ledger nodes.");
      }
    }
  };

  const handlePiUpgrade = () => {
    if (!onPiUpgradePremium) {
      setPiUpgradeErrorMsg("Pi credentials not loaded. Please log in first.");
      setTimeout(() => setPiUpgradeErrorMsg(""), 5000);
      return;
    }
    setPiUpgradeLoading(true);
    setPiUpgradeSuccessMsg("");
    setPiUpgradeErrorMsg("");
    onPiUpgradePremium((success) => {
      setPiUpgradeLoading(false);
      if (success) {
        setPiUpgradeSuccessMsg("Success! cicada-premium unlocked via Pi blockchain.");
        setTimeout(() => setPiUpgradeSuccessMsg(""), 5000);
      } else {
        setPiUpgradeErrorMsg("Pi Ledger declined or was canceled.");
        setTimeout(() => setPiUpgradeErrorMsg(""), 5000);
      }
    });
  };

  const handleDepositClick = (amount: number) => {
    onDepositFunds(amount);
    setAtmSuccessMsg(`Success! Synthesized $${amount.toFixed(2)} virtual transfer into your wallet.`);
    setTimeout(() => setAtmSuccessMsg(""), 4000);
  };

  return (
    <div id="wallet-hub-root" className="space-y-6">
      {/* Upper header */}
      <div id="wallet-intro" className="border-b border-zinc-900 pb-5">
        <h1 className="font-sans font-bold text-md text-zinc-150 tracking-tight">
          Wallet, Ads & Monetization
        </h1>
        <p className="font-sans text-xs text-zinc-500 mt-1 leading-snug">
          Synthesize virtual deposits, buy premium access, configure ad revenue metrics, and view ledger transactions.
        </p>
      </div>

      {/* Wallet Balance Cards split */}
      <div id="wallet-balances-row" className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* User Balance */}
        <div className="border border-zinc-900 bg-zinc-950 p-5 rounded-2xl relative overflow-hidden shadow-md flex flex-col justify-between h-44">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-bold text-zinc-400">User Wallet Balance</span>
              <Wallet className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="font-mono text-xl font-extrabold text-zinc-100 mt-2.5">
              ${wallet.balance.toFixed(2)}
            </h2>
            <p className="font-sans text-[10px] text-zinc-550 mt-1">
              Used for Super Chats, creator tips, and subscription upgrades.
            </p>
          </div>

          <div className="absolute top-1/2 right-0 -translate-y-1/2 scale-150 translate-x-12 opacity-5 pointer-events-none text-zinc-600">
            <Wallet className="h-28 w-28" />
          </div>
        </div>

        {/* Creator Studio Revenue */}
        <div className="border border-zinc-900 bg-zinc-950 p-5 rounded-2xl relative overflow-hidden shadow-md flex flex-col justify-between h-44">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-bold text-zinc-400 font-normal">Creator Earned Revenue</span>
              <Award className="h-5 w-5 text-emerald-500" />
            </div>
            <h2 className="font-mono text-xl font-extrabold text-emerald-400 mt-2.5">
              ${analytics.totalRevenue.toFixed(2)}
            </h2>
            <p className="font-sans text-[10px] text-zinc-550 mt-1">
              Accumulated automatically from ad impressions, tips, and platforms splits.
            </p>
          </div>

          {analytics.totalRevenue > 0 && (
            <button
              onClick={onWithdrawFunds}
              className="w-full text-center py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 font-sans text-xs font-semibold text-emerald-400 transition"
            >
              Withdraw Creator Profit
            </button>
          )}
        </div>

        {/* Premium Badge status */}
        <div className="border border-zinc-900 bg-zinc-950 p-5 rounded-2xl relative overflow-hidden shadow-md flex flex-col justify-between min-h-44 space-y-3.5">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-bold text-zinc-400">Subscription Status</span>
              <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
            </div>
            <h3 className="font-sans text-sm font-extrabold text-emerald-400 mt-2.5">
              {wallet.isPremiumUser ? "Active Premium Account" : "Free Tier Account"}
            </h3>
            <p className="font-sans text-[10.5px] text-zinc-500 mt-1">
              {wallet.isPremiumUser
                ? "Congratulations! Ads are blocked, full-spectrum biological streams fully accessible!"
                : "Standard account. Subject to video sponsorship ad overlays."}
            </p>
          </div>

          {!wallet.isPremiumUser && (
            <div className="space-y-2">
              <button
                onClick={onUpgradePremium}
                className="w-full text-center py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 font-sans text-xs font-bold text-zinc-950 hover:from-emerald-400 hover:to-teal-400 transition cursor-pointer"
              >
                Get Premium Access ($9.99)
              </button>

              <button
                disabled={piUpgradeLoading}
                onClick={handlePiUpgrade}
                className={`w-full text-center py-2.5 rounded-xl border font-sans text-xs font-extrabold flex items-center justify-center space-x-1 transition cursor-pointer ${
                  piUpgradeLoading
                    ? "border-zinc-900 bg-zinc-950 text-zinc-650 cursor-not-allowed"
                    : "border-amber-500/30 bg-amber-550/10 text-amber-400 hover:bg-amber-550/20 hover:border-amber-400"
                }`}
              >
                {piUpgradeLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-amber-500/20 border-t-amber-400 rounded-full animate-spin mr-1.5" />
                ) : (
                  <span className="font-extrabold text-amber-450 text-sm leading-none mr-1.5">π</span>
                )}
                <span>Upgrade Premium (1.0 π)</span>
              </button>
            </div>
          )}

          {piUpgradeSuccessMsg && (
            <div className="text-[10px] bg-emerald-500/5 text-emerald-400 border border-emerald-500/20 rounded-xl px-3 py-1.5 animate-fade-in font-sans">
              {piUpgradeSuccessMsg}
            </div>
          )}

          {piUpgradeErrorMsg && (
            <div className="text-[10px] bg-rose-500/5 text-rose-450 border border-rose-500/20 rounded-xl px-3 py-1.5 animate-shake font-sans">
              {piUpgradeErrorMsg}
            </div>
          )}
        </div>

      </div>

      {/* Dynamic Tab Selector for Ledger or Ads Marketing Center */}
      <div className="flex border-b border-zinc-90 w-full mb-6">
        <button
          onClick={() => setWalletTab("ledger")}
          className={`px-5 py-3 font-sans text-xs font-bold border-b-2 transition outline-none cursor-pointer ${
            walletTab === "ledger"
              ? "border-emerald-500 text-emerald-400 font-extrabold"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Transaction Ledger & ATM
        </button>
        <button
          onClick={() => {
            setWalletTab("marketing");
            playSynthesizerApprove();
          }}
          className={`px-5 py-3 font-sans text-xs font-bold border-b-2 transition flex items-center space-x-2 outline-none cursor-pointer ${
            walletTab === "marketing"
              ? "border-emerald-500 text-emerald-400 font-extrabold"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Megaphone className="h-4 w-4" />
          <span>Sponsorship Ads Manager</span>
          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-tight">
            Any user can Advertise
          </span>
        </button>
      </div>

      {walletTab === "ledger" ? (
        /* Main split ledger table details & simulated ATM deposits */
        <div id="wallet-main-row" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        {/* Ledger logs (Transaction History) left column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-zinc-900 bg-zinc-950 p-4 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <ArrowRightLeft className="h-4.5 w-4.5 text-emerald-400" />
                <h3 className="font-sans text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Transaction Audit Log
                </h3>
              </div>
              <span className="font-mono text-[9px] text-zinc-650">
                Authorized Ledger Nodes
              </span>
            </div>

            {/* List entries */}
            {wallet.history.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-zinc-900 rounded-xl">
                <ArrowRightLeft className="h-8 w-8 text-zinc-700 mx-auto opacity-40 animate-pulse" />
                <p className="font-sans text-xs text-zinc-500 mt-2">
                  No transaction ledger rows found in memory cache.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {wallet.history.slice().reverse().map((item) => {
                  const isPositive =
                    item.type === "tip_received" ||
                    item.type === "ad_earning" ||
                    item.type === "premium_sub";
                  return (
                    <div
                      key={item.id}
                      id={`ledger-row-${item.id}`}
                      className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`rounded-lg p-2 ${
                            isPositive
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-rose-500/10 text-rose-500"
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-sans text-xs font-bold text-zinc-200 truncate">
                            {item.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="font-mono text-[8.5px] uppercase text-zinc-550 border border-zinc-800 px-1 py-0.2 rounded bg-zinc-900">
                              {item.type.replace("_", " ")}
                            </span>
                            <span className="font-mono text-[8.5px] text-zinc-600">
                              {item.date}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`font-mono font-bold text-xs shrink-0 pl-3 ${
                          isPositive ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isPositive ? "+" : "-"}${item.amount.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Virtual ATM top-up details right column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="border border-zinc-900 bg-zinc-950 p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center space-x-1.5">
              <CreditCard className="h-4.5 w-4.5 text-emerald-400" />
              <h3 className="font-sans text-xs font-bold text-zinc-200 uppercase tracking-wider">
                Virtual ATM Simulator
              </h3>
            </div>

            <p className="font-sans text-[11px] text-zinc-400 leading-relaxed font-normal">
              Need more funds to tip creators or buy Premium? Synthesize mock deposits directly into your user wallet! Enjoy unlimited testing tokens.
            </p>

            <div className="space-y-3">
              {/* Preloaded buttons to tap */}
              <div className="grid grid-cols-3 gap-2">
                {[10, 25, 100].map((amount) => (
                  <button
                    key={amount}
                    id={`atm-dep-${amount}`}
                    onClick={() => handleDepositClick(amount)}
                    className="flex flex-col items-center justify-center rounded-xl border border-zinc-850 bg-zinc-900/60 p-2 text-zinc-300 hover:border-emerald-500/35 hover:bg-emerald-500/5 hover:-translate-y-0.5 transition outline-none"
                  >
                    <ArrowDownCircle className="h-4 w-4 text-emerald-400 mb-0.5" />
                    <span className="font-mono font-bold text-xs">${amount}</span>
                  </button>
                ))}
              </div>

              {/* Success output alert banner */}
              {atmSuccessMsg && (
                <div className="text-[11px] border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 px-3 py-2 rounded-xl animate-fade-in font-sans">
                  {atmSuccessMsg}
                </div>
              )}
            </div>

            <hr className="border-zinc-900/60" />

            {/* Platform monetization structure card */}
            <div className="rounded-xl bg-zinc-900/30 border border-zinc-900 p-3.5 space-y-2.5">
              <span className="font-mono text-[9px] text-zinc-550 block font-bold uppercase tracking-wider">
                Platform Commission Fee Schedule
              </span>
              <ul className="space-y-1.5 text-[10.5px] font-sans text-zinc-400">
                <li className="flex justify-between">
                  <span>Ad revenue split:</span>
                  <span className="font-mono text-zinc-200">70% to uploader</span>
                </li>
                <li className="flex justify-between">
                  <span>Direct Creator tip fee:</span>
                  <span className="font-mono text-zinc-200">10% commission</span>
                </li>
                <li className="flex justify-between">
                  <span>Subscribers platform fee:</span>
                  <span className="font-mono text-zinc-200">Free/Included</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* ADVERTISEMENT MARKETING HUB SECTION (NEW) */
        <div id="wallet-ads-row" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Create Advertisement Campaign Form - Left 2 Columns */}
          <div className="lg:col-span-2 space-y-5">
            <div className="border border-zinc-900 bg-zinc-950 p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <Megaphone className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="font-sans text-xs font-bold text-zinc-200 uppercase tracking-wider">
                    Compose Interactive Sponsor Advertisement
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-sans font-normal mt-0.5">
                    Design a billboard ad stream that rotates randomly inside our main canvas player view port for all non-premium platform nodes.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateAdCampaign} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Brand name */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 font-bold font-extrabold">
                      Sponsor Brand Name
                    </label>
                    <input
                      type="text"
                      maxLength={32}
                      placeholder="e.g. CICADA ORGANIC SHIELD INC."
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-855 hover:border-zinc-800 focus:border-emerald-500/80 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none transition uppercase"
                      required
                    />
                  </div>

                  {/* Button Action CTA */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 font-bold font-extrabold">
                      Interactive CTA Label
                    </label>
                    <input
                      type="text"
                      maxLength={18}
                      placeholder="e.g. Visit Shop, Claim Discount"
                      value={actionText}
                      onChange={(e) => setActionText(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-855 hover:border-zinc-800 focus:border-emerald-500/80 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none transition"
                      required
                    />
                  </div>
                </div>

                {/* Slogan */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-zinc-500 font-bold font-extrabold">
                    Campaign Catchphrase / Slogan Message
                  </label>
                  <textarea
                    rows={2}
                    maxLength={110}
                    placeholder="Describe your sponsor product or bio-frequency message detail to viewers on Cicada tube..."
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-855 hover:border-zinc-800 focus:border-emerald-500/80 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none transition resize-none leading-relaxed"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Theme Select */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 font-bold font-extrabold">
                      Campaign Visual Theme
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { name: "emerald", color: "bg-emerald-500" },
                        { name: "amber", color: "bg-amber-400" },
                        { name: "crimson", color: "bg-rose-500" },
                        { name: "blue", color: "bg-sky-400" }
                      ].map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setThemeColor(c.name as any)}
                          className={`py-1.5 rounded-lg border text-[10px] font-mono capitalize transition flex flex-col items-center justify-center space-y-1 outline-none cursor-pointer ${
                            themeColor === c.name
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold"
                              : "border-zinc-850 bg-zinc-950 text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full ${c.color}`} />
                          <span className="text-[9px]">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget Allocation */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-mono uppercase text-zinc-550 font-bold font-extrabold">
                        Campaign Budget Allocation
                      </label>
                      <span className="font-mono text-xs font-extrabold text-emerald-400">${budget}.00</span>
                    </div>
                    <div className="flex items-center space-x-3.5">
                      <input
                        type="range"
                        min={5}
                        max={100}
                        step={5}
                        value={budget}
                        onChange={(e) => setBudget(parseInt(e.target.value))}
                        className="w-full accent-emerald-500 outline-none cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-zinc-500 truncate shrink-0">
                        Min $5.00
                      </span>
                    </div>
                  </div>
                </div>

                {adSuccessMsg && (
                  <div className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl px-4 py-2.5 animate-fade-in font-sans flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{adSuccessMsg}</span>
                  </div>
                )}

                {adErrorMsg && (
                  <div className="text-xs bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl px-4 py-2.5 animate-shake font-sans">
                    {adErrorMsg}
                  </div>
                )}

                <div className="border-t border-zinc-900 pt-4 flex items-center justify-between">
                  <div className="text-left font-sans">
                    <span className="text-[10px] text-zinc-500 font-mono block">WALLET LEDGER COST DEDUCTION</span>
                    <span className="text-zinc-400 text-[11px] block mt-0.5">
                      Cost To launch: <strong className="text-emerald-400 font-extrabold">${budget.toFixed(2)}</strong> (Debited from your balance)
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-sans text-xs font-bold hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:scale-[1.02] active:scale-95 transition duration-200 cursor-pointer text-center"
                  >
                    Authorize & Launch Campaign
                  </button>
                </div>
              </form>
            </div>

            {/* Campaign analytics / Active Ads row */}
            <div className="border border-zinc-900 bg-zinc-950 p-4 rounded-2xl space-y-3.5 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-1.5">
                  <BarChart3 className="h-4.5 w-4.5 text-emerald-400" />
                  <h3 className="font-sans text-xs font-bold text-zinc-200 uppercase tracking-wider">
                    Cicada-Wide Ad Distribution Spectrum
                  </h3>
                </div>
                <span className="font-mono text-[9px] text-zinc-650 uppercase">
                  Real-time CTR analytics
                </span>
              </div>

              {/* Loop through active advertisements */}
              {advertisements.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-zinc-900 rounded-xl">
                  <Megaphone className="h-8 w-8 text-zinc-700 mx-auto opacity-40 animate-pulse mb-1.5" />
                  <span className="font-sans text-xs text-zinc-500">No active advertisements. Become the first sponsor!</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {advertisements.map((ad) => {
                    const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0.0;
                    const isOwnAd = ad.creator === currentUsername;
                    const borderBorder = isOwnAd ? "border-emerald-500/40 bg-zinc-900/30" : "border-zinc-900 bg-zinc-950/40";
                    
                    return (
                      <div
                        key={ad.id}
                        className={`border p-3.5 rounded-xl flex flex-col justify-between space-y-3 relative ${borderBorder}`}
                      >
                        {isOwnAd && (
                          <span className="absolute top-2 right-2 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[8px] font-mono font-bold uppercase rounded px-1.5 py-0.2">
                            Your Campaign
                          </span>
                        )}

                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              ad.themeColor === "emerald"
                                ? "bg-emerald-400"
                                : ad.themeColor === "amber"
                                ? "bg-amber-400"
                                : ad.themeColor === "crimson"
                                ? "bg-rose-400"
                                : "bg-sky-455"
                            }`} />
                            <h4 className="font-sans font-bold text-xs text-zinc-200 truncate uppercase tracking-tight pr-14">
                              {ad.brandName}
                            </h4>
                          </div>
                          <p className="text-[11px] text-zinc-400 italic line-clamp-2 leading-relaxed">
                            "{ad.slogan}"
                          </p>
                        </div>

                        <div className="border-t border-zinc-900/60 pt-2.5 grid grid-cols-3 gap-1 grid-flow-row text-[10px] font-mono">
                          <div>
                            <span className="text-zinc-650 block text-[8px] uppercase">IMPRESSIONS</span>
                            <span className="text-zinc-300 font-bold font-mono">{ad.impressions.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-zinc-650 block text-[8px] uppercase">CLICKS</span>
                            <span className="text-zinc-300 font-bold font-mono">{ad.clicks.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-zinc-650 block text-[8px] uppercase">CTR INDEX</span>
                            <span className="text-emerald-400 font-extrabold font-mono">{ctr.toFixed(2)}%</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[8.5px] text-zinc-550 border-t border-zinc-900/40 pt-2">
                          <span>Bidder: @{ad.creator}</span>
                          <span>Funded: ${ad.cost.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Guidelines info card on right */}
          <div className="lg:col-span-1 space-y-4">
            <div className="border border-zinc-900 bg-zinc-950 p-5 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center space-x-1.5">
                <Target className="h-4.5 w-4.5 text-emerald-400" />
                <h3 className="font-sans text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Advertising Guidelines
                </h3>
              </div>

              <div className="space-y-3.5 text-xs text-zinc-400 leading-relaxed font-normal font-sans">
                <p>
                  Welcome to the decentralized Cicada Tube sponsorship spectrum! On this platform, any registered uploader can synthesize custom interactive billboard advertisements.
                </p>
                <p>
                  Your campaigns are delivered over raw binary canvas feeds to standard non-premium user streams.
                </p>

                <hr className="border-zinc-900" />

                <h4 className="font-bold text-zinc-300 font-mono text-[10px] uppercase">HOW CAN I ADVERTISE?</h4>
                <ul className="list-disc list-inside space-y-2 mt-2 text-[11px] text-zinc-400">
                  <li>Minimum funding cap starts at just $5.00 mock dollars.</li>
                  <li>Draft custom slogan catchphrases.</li>
                  <li>Include custom interactive button CTA triggers.</li>
                  <li>Choose visual accents that suit your company aesthetic.</li>
                </ul>

                <hr className="border-zinc-900" />

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] p-3 text-[11px] text-emerald-400 border-dashed">
                  <strong>Did you know?</strong> Every time you hit deposit inside the <button onClick={() => setWalletTab("ledger")} className="underline font-bold text-emerald-350 hover:text-emerald-250 cursor-pointer">ATM Simulator</button>, you receive free test currency to run advertising campaign experiments. Try creating multiple ads and watch them rotate inside the playbacks!
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
