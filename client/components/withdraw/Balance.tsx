"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { USER_BASE_URL, WITHDRAWAL_BASE_URL } from "@/constants/api";
import { useWallet } from "@/contexts/Wallet";
import axios from "axios";
import { ArrowRight, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function Balance() {
  const { walletAddress } = useWallet();
  const [availableBalance, setAvailableBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("totalCommission");
  const [balances, setBalances] = useState({
    capital: 0,
    roi: 0,
    totalCommission: 0,
  });

  useEffect(() => {
    const fetchUserBalances = async () => {
      try {
        const userRes = await axios.get(
          `${USER_BASE_URL}/wallet/${walletAddress}`
        );
        const userData = userRes.data;
        setBalances({
          capital: userData.capital || 0,
          roi: userData.receivedAmount || 0,
          totalCommission: userData.referral?.totalCommission || 0,
        });
        setAvailableBalance(userData.capital || 0); // Default to capital
      } catch (error) {
        console.error("Error fetching user balances:", error);
        toast.error("Failed to fetch balances.");
      }
    };

    if (walletAddress) {
      fetchUserBalances();
    }
  }, [walletAddress]);

  const handleTypeChange = (value: keyof typeof balances) => {
    setSelectedType(value);
    setAvailableBalance(balances[value]);
  };

  const handleWithdrawRequest = async () => {
    if (!withdrawAmount || Number.parseFloat(withdrawAmount) <= 0) {
      toast.error("Please enter a valid withdrawal amount.");
      return;
    }

    if (Number.parseFloat(withdrawAmount) > availableBalance) {
      toast.error("Withdrawal amount cannot exceed the available balance.");
      return;
    }

    try {
      setLoading(true);

      // Proceed with the withdrawal request
      const response = await fetch(`${WITHDRAWAL_BASE_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress,
          amount: Number.parseFloat(withdrawAmount),
          type: selectedType, // Send the selected type
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to request withdrawal.");
      }

      toast.success("Withdrawal request submitted successfully.");
      setWithdrawAmount("");
    } catch (error) {
      console.error("Error submitting withdrawal request:", error);
      toast.error("Failed to request withdrawal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className="bg-[#1A1B2E] border-[#2A2D44]"
      style={{
        animation: "shining-border 3s linear infinite",
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-2xl font-bold text-white">
          Available Balance
        </CardTitle>
        <Wallet className="h-6 w-6 text-[#00E4FF]" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full bg-[#03d1eb] border-none">
              <SelectValue placeholder="Select Balance Type" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1b2e] text-[#8a8fb9] border-none">
              <SelectItem
                className="hover:bg-[#2a2d44] text-[#03d1eb]"
                value="capital"
              >
                Capital Invested
              </SelectItem>
              <SelectItem
                className="hover:bg-[#2a2d44] text-[#03d1eb]"
                value="roi"
              >
                ROI
              </SelectItem>
              <SelectItem
                className="hover:bg-[#2a2d44] text-[#03d1eb]"
                value="totalCommission"
              >
                Total Commission
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="text-[#00E4FF]">
            <p className="text-3xl font-bold">
              ${availableBalance.toFixed(2).toString()}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mt-4">
          <div className="relative flex-grow">
            <Input
              type="number"
              placeholder="Enter amount to withdraw"
              value={withdrawAmount}
              onChange={(e: any) => {
                const value = e.target.value;
                if (value >= 0 || value === "") {
                  setWithdrawAmount(value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "ArrowDown") {
                  e.preventDefault();
                }
              }}
              onInput={(e: any) => {
                if (e.target.value < 0) {
                  e.target.value = 0;
                }
              }}
              className="bg-[#0D0E1C] border-[#2A2D44] text-white pl-8"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8FB9]">
              $
            </span>
          </div>

          <Button
            onClick={handleWithdrawRequest}
            disabled={loading}
            className="bg-[#00E4FF] text-[#0A0B1D] hover:bg-[#00E4FF]/90"
          >
            {loading ? "Processing..." : "Withdraw Money"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-yellow-500 mt-4">
          10% penalty will be applied if withdrawal is done from the capital
          invested.
        </p>
        <p className="text-sm text-[#8A8FB9] mt-4">
          Money will be credited to your wallet within 48 hours.
        </p>
      </CardContent>
    </Card>
  );
}
