import { ReactNode } from "react";

// components
import { Header, Navbar } from "@/components/common";

export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="h-screen overflow-hidden flex bg-[#0A0B1D]/90 text-white relative">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full min-h-screen h-full overflow-y-auto object-cover z-[-1]"
      >
        <source src="/gif/common/bg-lines.mp4" type="video/mp4" />
      </video>

      <Navbar />

      <div className="flex flex-col w-full">
        <Header />

        <section className="p-5 overflow-y-auto">{children}</section>
      </div>
    </div>
  );
}
