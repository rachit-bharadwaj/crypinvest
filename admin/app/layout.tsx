import { ReactNode } from "react";
import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";

// styles
import "./globals.css";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "USQ Financial",
    template: "%s | USQ Financial",
  },
  description: "This is a financial app for cryptocurrencies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.className} antialiased bg-blueish`}>
        {children}

        <Toaster />
      </body>
    </html>
  );
}
