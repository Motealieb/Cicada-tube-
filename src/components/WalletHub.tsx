/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { UserWallet, CreatorAnalytics } from "../types";
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
  Clock
} from "lucide-react";

interface WalletHubProps {
  wallet: UserWallet;
  analytics: CreatorAnalytics;
  onDepositFunds: (amount: number) => void;
  onUpgradePremium: () => void;
  onWithdrawFunds: () => void;
}

export default function WalletHub({
  wallet,
  analytics,
  onDepositFunds,
  onUpgradePremium,
  onWithdrawFunds,
}: WalletHubProps) {
  const [depositAmount, setDepositAmount] = useState<number>(20);
  const [atmSuccessMsg, setAtmSuccessMsg] = useState<string>("");

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
        <div className="border border-zinc-900 bg-zinc-950 p-5 rounded-2xl relative overflow-hidden shadow-md flex flex-col justify-between h-44">
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
            <button
              onClick={onUpgradePremium}
              className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 font-sans text-xs font-bold text-zinc-950 hover:from-emerald-400 hover:to-teal-400 transition"
            >
              Get Premium Access ($9.99)
            </button>
          )}
        </div>
      </div>

      {/* Main split ledger table details & simulated ATM deposits */}
      <div id="wallet-main-row" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
}
