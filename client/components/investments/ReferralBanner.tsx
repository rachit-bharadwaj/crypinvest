"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";

export default function ReferralBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section
      className={`relative bg-[#1A1B2E] rounded-lg shadow-lg overflow-hidden border border-[#2A2D44] transition-all duration-500 ease-out transform ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
      style={{
        animation: "shining-border 3s linear infinite",
      }}
    >
      <div className="flex items-center justify-between p-8 flex-col gap-3 lg:flex-row">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="h-12 w-12 rounded-xl bg-[#2A2D44] flex items-center justify-center shrink-0">
            <Users className="h-6 w-6 text-[#00E4FF] shrink-none" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-semibold text-white text-nowrap">
                Referral Program
              </h2>
              <span className="px-2 py-0.5 text-xs font-medium bg-[#00E4FF]/10 text-[#00E4FF] rounded-full">
                Active
              </span>
            </div>

            <p className="text-[#8A8FB9]">
              Earn up to 10% commission on referral investments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8 w-full lg:w-fit">
          <div className="hidden lg:block">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-sm text-[#8A8FB9] mb-1 text-nowrap">
                  Commission Rate
                </p>
                <p className="text-xl font-semibold text-[#00E4FF]">10%</p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setShowModal(true)}
            className="bg-[#00E4FF] text-[#0A0B1D] hover:bg-[#00E4FF]/90 font-medium px-6 h-10 rounded-lg transition-all duration-300 w-full"
          >
            Start Earning
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-[#1A1B2E] border-[#2A2D44] text-white">
          <DialogHeader>
            <DialogTitle className="text-[#00E4FF]">
              Referral Information
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-4">
            <div className="bg-[#2A2D44]/50 p-4 rounded-lg">
              <p className="text-white font-medium mb-1">How it works</p>
              <p className="text-[#8A8FB9]">
                Share your unique referral code with friends. When they invest,
                you&apos;ll earn commission on their investments.
              </p>
            </div>
            <div className="bg-[#2A2D44]/50 p-4 rounded-lg">
              <p className="text-white font-medium mb-1">Rewards</p>
              <p className="text-[#8A8FB9]">
                Earn up to 10% commission on referral investments. The more they
                invest, the more you earn.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Link href="/referrals" className="w-full">
              <Button className="bg-[#00E4FF] text-[#0A0B1D] hover:bg-[#00E4FF]/90 w-full">
                Go to referrals
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
