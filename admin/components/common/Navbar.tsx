"use client";

import { icons } from "@/public/icons";
import { BarChart2, BarChart3, Users, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Users", href: "/users", icon: Users },
    { name: "Withdrawals", href: "/withdrawals", icon: Wallet },
    { name: "Investments", href: "/investments", icon: BarChart2 },
    { name: "Pools", href: "/pools", icon: BarChart2 },
    { name: "Categories", href: "/categories", icon: BarChart2 },
    { name: "Referrals", href: "/referrals", icon: BarChart2 },
  ];

  return (
    <nav className="flex flex-col gap-3 p-5">
      <Link href="/">
        <Image
          src={icons.logo}
          alt="Logo"
          width={500}
          height={500}
          className="h-20 w-fit"
        />
      </Link>
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center w-full gap-2 rounded-lg text-lg px-3 py-2 font-medium transition-colors ${
              isActive
                ? "bg-primary font-bold text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
