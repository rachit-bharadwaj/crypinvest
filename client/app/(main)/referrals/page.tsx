"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2, Users, DollarSign, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { USER_BASE_URL } from "@/constants/api";
import { useWallet } from "@/contexts/Wallet";
import { ReferralData } from "@/types/referral";
import { RefferalTree } from "@/components/referrals";

export default function ReferralPage() {
  const { walletAddress } = useWallet();
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [activeReferrals, setActiveReferrals] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      toast.success("Referral code copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy referral code");
    }
  };

  const shareReferral = async () => {
    try {
      await navigator.share({
        title: "Join USQ Financial",
        text: `Join USQ Financial using my referral code: ${referralCode}`,
      });
    } catch (err) {
      toast.error("Failed to share referral code");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!walletAddress) {
        toast.error("Wallet address is not connected.");
        return;
      }

      try {
        const response = await fetch(
          `${USER_BASE_URL}/wallet/${walletAddress}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();

        setReferralCode(data.referral?.referralCode || "");

        const referralData =
          data.referral?.referrals?.map((ref: any) => ({
            id: ref._id,
            fullName: ref.fullName,
            email: ref.email,
            createdAt: ref.createdAt,
            status: ref.status || "Pending",
            commission: ref.commission || 0,
          })) || [];
        setReferrals(referralData);

        setTotalReferrals(referralData.length);
        setActiveReferrals(
          referralData.filter((ref: ReferralData) => ref.status === "Pending")
            .length
        );
        setTotalCommission(
          referralData.reduce(
            (sum: number, ref: ReferralData) => sum + ref.commission,
            0
          )
        );
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("An error occurred while fetching referral data.");
      }
    };

    fetchUserData();
  }, [walletAddress]);

  return (
    <div className="mx-auto px-4 py-8 bg-[#0A0B1D] text-white">
      {/* Stats Section */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {[
          { title: "Total Referrals", value: totalReferrals, icon: Users },
          { title: "Active Referrals", value: activeReferrals, icon: UserPlus },
          {
            title: "Total Commission",
            value: `$${totalCommission.toLocaleString()}`,
            icon: DollarSign,
          },
        ].map((stat, index) => (
          <Card
            key={index}
            className="p-6 bg-[#1A1B2E] border-[#2A2D44]"
            style={{
              animation: "shining-border 3s linear infinite",
            }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-[#2A2D44]">
                <stat.icon className="h-6 w-6 text-[#00E4FF]" />
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-widest font-medium text-[#8A8FB9]">
                  {stat.title}
                </h3>
                <p className="text-3xl font-bold mt-1 text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Referral Code Section */}
      <Card
        className="mb-8 bg-[#1A1B2E] border-[#2A2D44]"
        style={{
          animation: "shining-border 3s linear infinite",
        }}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Your Referral Code
          </h2>
          <div className="flex gap-2 flex-wrap md:flex-nowrap">
            <Input
              value={referralCode}
              readOnly
              className="bg-[#0D0E1C] border-[#2A2D44] text-[#8A8FB9]"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="border-[#2A2D44] text-[#00E4FF] hover:bg-[#2A2D44] bg-[#0D0E1C]"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button
              onClick={shareReferral}
              variant="outline"
              className="border-[#2A2D44] text-[#00E4FF] hover:bg-[#2A2D44] bg-[#0D0E1C]"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          <p className="text-sm text-[#8A8FB9] mt-2">
            Share this code with your friends and earn commission when they
            join!
          </p>
        </div>
      </Card>

      {/* Referral History Table */}
      <Card
        className="bg-[#1A1B2E] border-[#2A2D44]"
        style={{
          animation: "shining-border 3s linear infinite",
        }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">
              Referral History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#2A2D44] hover:bg-[#2A2D44]/50">
                  <TableHead className="text-[#8A8FB9]">ID</TableHead>
                  <TableHead className="text-[#8A8FB9]">Date</TableHead>
                  <TableHead className="text-[#8A8FB9]">Referee</TableHead>
                  <TableHead className="text-[#8A8FB9]">Status</TableHead>
                  <TableHead className="text-[#8A8FB9]">Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.length > 0 ? (
                  referrals.map((referral) => (
                    <TableRow
                      key={referral.id}
                      className="border-b border-[#2A2D44] hover:bg-[#2A2D44]/50"
                    >
                      <TableCell className="text-white">
                        {referral.id}
                      </TableCell>
                      <TableCell className="text-[#8A8FB9]">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-white">
                        {referral.fullName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            referral.status === "Completed"
                              ? "default"
                              : "destructive"
                          }
                          className={
                            referral.status === "Completed"
                              ? "bg-green-500/20 text-green-500"
                              : "bg-yellow-500/20 text-yellow-500"
                          }
                        >
                          {referral.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#00E4FF]">
                        {referral.commission > 0
                          ? `$ ${referral.commission.toLocaleString()}`
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-4 text-[#8A8FB9]"
                    >
                      No referrals yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      <RefferalTree />
    </div>
  );
}
