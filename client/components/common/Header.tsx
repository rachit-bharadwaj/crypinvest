"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { USER_BASE_URL } from "@/constants/api";
import { useWallet } from "@/contexts/Wallet";
import { getDateAndDay } from "@/lib/utils";
import { icons } from "@/public/icons";
import { images } from "@/public/images";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type UserDetails = {
  fullName: string;
  profilePicture: string;
};

export default function Header() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { walletAddress } = useWallet();
  const [userDetails, setUserDetails] = useState<UserDetails>(
    {} as UserDetails
  );

  useEffect(() => {
    setIsHydrated(true);

    const fetchUserDetails = async () => {
      if (!walletAddress) return;

      try {
        const response = await axios.get(
          `${USER_BASE_URL}/wallet/${walletAddress}`
        );
        const resData = await response.data;
        setUserDetails(resData);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [walletAddress]);

  const dayAndDate = getDateAndDay();
  const walletAddressShort = isHydrated
    ? `${walletAddress?.slice(0, 5)}...${walletAddress?.slice(-5)}`
    : "";

  function ProfileImage() {
    return userDetails?.profilePicture ? (
      <img
        src={userDetails.profilePicture || "/placeholder.svg"}
        alt="avatar"
        width={500}
        height={500}
        className="rounded-full h-10 w-10"
      />
    ) : (
      <Image
        src={images.user || "/placeholder.svg"}
        alt="avatar"
        width={40}
        height={40}
        className="rounded-full"
      />
    );
  }

  function UserInfo({
    isHydrated,
    userDetails,
    walletAddressShort,
    walletAddress,
  }: {
    isHydrated: boolean;
    userDetails: any;
    walletAddressShort: string;
    walletAddress: string;
  }) {
    return isHydrated ? (
      <div className="p-3">
        <p title={walletAddress} className="font-bold text-lg text-white">
          {userDetails?.fullName || walletAddressShort}
        </p>
        <p className="text-sm text-[#8A8FB9]">{walletAddressShort}</p>
      </div>
    ) : (
      <p className="text-sm text-[#8A8FB9]">Loading...</p>
    );
  }

  return (
    <header className="pl-14 lg:pl-3 bg-[#0D0E1C] border-b border-[#1A1B2E] p-3 flex justify-between items-center">
      <div className="hidden md:flex flex-col">
        <p className="text-xl font-bold text-white">Dashboard</p>
        <p className="text-[#8A8FB9]">{dayAndDate}</p>
      </div>

      <Link href="/">
        <Image
          src={icons.logoShort || "/placeholder.svg"}
          alt="logo"
          width={500}
          height={500}
          className="h-10 w-fit shrink-0 md:hidden"
        />
      </Link>

      <div className="flex gap-10 items-center">
        {/* Desktop view */}
        <div className="hidden md:flex items-center gap-3">
          <ProfileImage />
          <UserInfo
            isHydrated={isHydrated}
            userDetails={userDetails}
            walletAddressShort={walletAddressShort}
            walletAddress={walletAddress}
          />
        </div>

        {/* Mobile view */}
        <DropdownMenu>
          <DropdownMenuTrigger className="md:hidden outline-none">
            <ProfileImage />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-[#1A1B2E] border-[#2A2D44] text-white"
          >
            <UserInfo
              isHydrated={isHydrated}
              userDetails={userDetails}
              walletAddressShort={walletAddressShort}
              walletAddress={walletAddress}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
