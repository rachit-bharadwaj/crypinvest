"use client";

import { Card } from "@/components/ui/card";
import { INVESTMENT_BASE_URL, USER_BASE_URL } from "@/constants/api";
import { useWallet } from "@/contexts/Wallet";
import { investmentsImages } from "@/public/images";
import type { StatsCardProps } from "@/types/investments";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function StatsCards() {
  const { walletAddress } = useWallet();
  const [statsCardsItems, setStatsCardsItems] = useState<StatsCardProps[]>([
    {
      title: "Capital Invested",
      amount: 0,
      increase: 0,
      increaseComment: "this month",
      comment: "No investments yet",
      image: investmentsImages.investment,
    },
    {
      title: "Current ROI",
      amount: 0,
      increase: 0,
      increaseComment: "this week",
      comment: "No returns yet",
      image: investmentsImages.roi,
    },
    {
      title: "Referral Earnings",
      amount: 0,
      increase: 0,
      increaseComment: "active referrals",
      comment: "No referrals yet",
      image: investmentsImages.referralImage,
    },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRes = await axios.get(
          `${USER_BASE_URL}/wallet/${walletAddress}`
        );
        const userData = userRes.data;
        setStatsCardsItems((prev) =>
          prev.map((card) => {
            if (card.title === "Capital Invested") {
              return {
                ...card,
                amount: userData.capital || 0,
                comment: userData.capital
                  ? `${userData.capital.toFixed(2)} USD invested`
                  : "No investments yet",
              };
            }
            return card;
          })
        );
      } catch (error) {
        console.error("Error fetching user balances:", error);
        toast.error("Failed to fetch balances.");
      }
    };

    if (walletAddress) {
      fetchUserData();
    }
  }, [walletAddress]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const investmentsResponse = await fetch(
          `${INVESTMENT_BASE_URL}/user/${walletAddress}/total`
        );
        if (!investmentsResponse.ok)
          throw new Error("Failed to fetch investments");
        const investmentsData = await investmentsResponse.json();

        const referralResponse = await fetch(
          `${USER_BASE_URL}/wallet/${walletAddress}`
        );
        if (!referralResponse.ok) throw new Error("Failed to fetch referrals");
        const referralData = await referralResponse.json();

        const referrals = referralData.referral?.referrals || [];
        const totalCommission = referrals.reduce(
          (sum: number, ref: any) => sum + (ref.commission || 0),
          0
        );
        const activeReferrals = referrals.filter(
          (ref: any) => ref.status === "Pending"
        ).length;

        setStatsCardsItems((prev) =>
          prev.map((card) => {
            if (card.title === "Referral Earnings") {
              return {
                ...card,
                amount: totalCommission,
                increase: activeReferrals,
                comment: referrals.length
                  ? `Earned from ${referrals.length} referrals`
                  : "No referrals yet",
              };
            }
            return card;
          })
        );
      } catch (err) {
        toast.error(`Error: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) fetchAllData();
  }, [walletAddress]);

  return (
    <div className="flex flex-col w-full gap-8">
      {statsCardsItems.map((item) => (
        <Card
          key={item.title}
          className="p-8 bg-gradient-to-tr from-[#1A1B2E] to-[#121325] rounded-xl shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl overflow-hidden relative"
          style={{
            animation: "shining-border 3s linear infinite",
          }}
        >
          {/* Circuit Board Pattern Background */}
          <div className="absolute inset-0 opacity-40">
            <svg width="100%" height="100%">
              <pattern
                id="circuit-pattern"
                x="0"
                y="0"
                width="50"
                height="50"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0 0h50v50H0z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
                <circle cx="25" cy="25" r="1" fill="currentColor" />
                <path
                  d="M25 0v25M0 25h25"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </pattern>
              <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
            </svg>
          </div>

          {/* SVG Illustration */}
          <div className="absolute z-50 inset-0 opacity-10 overflow-hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 200 200"
              className="absolute -top-3 right-0 h-48 w-48 animate-pulse text-[#00E4FF]"
            >
              <circle fill="currentColor" cx="100" cy="100" r="70" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 200 200"
              className="absolute top-6 right-5  h-48 w-48 animate-pulse text-[#20b2bd]"
            >
              <circle fill="currentColor" cx="50" cy="100" r="50" />
            </svg>
          </div>

          <div className="relative z-10">
            <h3 className="text-[#8A8FB9] mb-4 uppercase tracking-widest text-sm">
              {item.title}
            </h3>
            <div className="flex items-center gap-3">
              <p className="text-3xl text-white">
                ${item.amount.toLocaleString()}
              </p>
              {item.increase > 0 && (
                <p className="text-[#00E4FF]">
                  +{item.increase} {item.increaseComment}
                </p>
              )}
            </div>
            <p className="text-sm text-[#8A8FB9] mt-4">{item.comment}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
