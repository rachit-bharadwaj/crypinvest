import { ReactNode } from "react";

// components
import { Header } from "@/components/auth";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="bg-[#0a0b0d] min-h-screen h-full">
      <Header />

      {children}
    </div>
  );
}
