import { Navbar } from "@/components/common";
import { ReactNode } from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Navbar />

      <div className="p-5 overflow-auto flex-1">{children}</div>
    </div>
  );
}
