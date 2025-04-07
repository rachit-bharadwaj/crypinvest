import { NavItem } from "@/types/common";
import { Wallet } from "lucide-react";

// icons
import { FaRegQuestionCircle, FaRoad } from "react-icons/fa";
import { HiOutlineUsers } from "react-icons/hi2";
import {
  IoInformationCircleOutline,
  IoSettingsOutline,
  IoWalletOutline,
} from "react-icons/io5";
import { LuLayoutDashboard } from "react-icons/lu";

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    Icon: IoWalletOutline,
  },
  {
    title: "Investments",
    href: "/investments",
    Icon: LuLayoutDashboard,
  },
  {
    title: "Withdraw",
    href: "/withdraw",
    Icon: Wallet,
  },
  {
    title: "Referrals",
    href: "/referrals",
    Icon: HiOutlineUsers,
  },
  {
    title: "Settings",
    href: "/settings",
    Icon: IoSettingsOutline,
  },
  {
    title: "Roadmap",
    href: "https://usqfinancial.com/roadmap/",
    Icon: FaRoad,
  },
  {
    title: "About Us",
    href: "https://usqfinancial.com/about/",
    Icon: IoInformationCircleOutline,
  },
  {
    title: "Help",
    href: "/help",
    Icon: FaRegQuestionCircle,
  },
];
