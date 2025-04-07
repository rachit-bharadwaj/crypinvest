"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { Menu, X } from "lucide-react";
import { navItems } from "@/constants/common";
import { icons } from "@/public/icons";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const currentPath = usePathname();

  const handleLogout = () => {
    localStorage.clear();
    Cookies.remove("walletAddress");
    window.location.reload();
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        isOpen &&
        (event.target as HTMLElement).closest(".sidebar") === null
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isOpen]);

  const mainNavItems = navItems.filter(
    (item) => !["Settings", "Help", "Logout"].includes(item.title)
  );
  const bottomNavItems = navItems.filter((item) =>
    ["Settings", "Help"].includes(item.title)
  );

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 lg:hidden text-[#8A8FB9] hover:text-white focus:outline-none"
        onClick={toggleMenu}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <nav
        className={`sidebar bg-[#0D0E1C] p-6 w-64 lg:min-h-screen
        lg:relative lg:translate-x-0
        fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        z-40 lg:z-auto border-r border-[#1A1B2E] flex flex-col`}
      >
        <button onClick={() => setIsOpen(false)} className="flex shrink-0">
          <Link href="/" className="flex items-center mb-8 shrink-0 w-full">
            <Image
              src={icons.logo || "/placeholder.svg"}
              alt="USQ Financial"
              width={500}
              height={500}
              className="h-fit w-20 shrink-0 lg:h-20 lg:w-fit"
            />
          </Link>
        </button>
        <div className="flex-grow">
          {mainNavItems.map(({ Icon, href, title }) => (
            <Link
              href={href}
              key={title}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 mb-2
                ${
                  currentPath === href
                    ? "bg-[#1A1B2E] text-[#00E4FF]"
                    : "text-[#8A8FB9] hover:bg-[#1A1B2E] hover:text-white"
                }`}
              onClick={() => setIsOpen(false)}
            >
              <Icon className="h-5 w-5" />
              <span>{title}</span>
            </Link>
          ))}
        </div>

        <hr className="mb-5 border-[#1A1B2E]" />

        <div className="mt-auto">
          {bottomNavItems.map(({ Icon, href, title }) => (
            <Link
              href={href}
              key={title}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 mb-2
                ${
                  currentPath === href
                    ? "bg-[#1A1B2E] text-[#00E4FF]"
                    : "text-[#8A8FB9] hover:bg-[#1A1B2E] hover:text-white"
                }`}
              onClick={() => setIsOpen(false)}
            >
              <Icon className="h-5 w-5" />
              <span>{title}</span>
            </Link>
          ))}
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 mt-2"
          >
            Logout
          </Button>
        </div>
      </nav>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
