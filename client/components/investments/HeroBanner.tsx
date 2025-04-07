import { dashboardImages } from "@/public/images";
import Image from "next/image";
import Link from "next/link";

export default function HeroBanner() {
  return (
    <section className="bg-primary text-white p-5 rounded-2xl flex gap-5 justify-between items-center">
      <div className="flex flex-col gap-7">
        <p className="text-xl">
          &quot;Join
          <span className="font-bold text-[#08adff]"> USQ Financial </span>
          and download the app today for a safe and secure investment
          experience!&quot;
        </p>

        <div className="flex flex-col gap-3">
          <p>Download the USQ App</p>
          <div className="flex gap-10">
            <Link href="/">
              <Image
                src={dashboardImages.playstore}
                alt="playstore"
                width={500}
                height={500}
                className="h-12 w-fit"
              />
            </Link>
            <Link href="/">
              <Image
                src={dashboardImages.appstore}
                alt="playstore"
                width={500}
                height={500}
                className="h-12 w-fit"
              />
            </Link>
          </div>
        </div>
      </div>
      <Image
        src={dashboardImages.hero}
        alt="hero image"
        width={500}
        height={500}
        className="h-full w-fit"
      />
    </section>
  );
}
