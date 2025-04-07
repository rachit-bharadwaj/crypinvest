import { icons } from "@/public/icons";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex flex-col p-3 bg-[#0a0b0d]">
      <Link href="https://usqfinancial.com/">
        <Image
          src={icons.logo}
          alt="USQ Financial"
          width={500}
          height={500}
          className="h-20 w-auto shrink-0"
        />
      </Link>
    </header>
  );
}
