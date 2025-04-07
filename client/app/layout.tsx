import { ReactNode } from "react";
import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";

// styles
import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import { WalletProvider } from "@/contexts";
import AppWalletProvider from "@/containers/AppWalletProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
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
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.className} antialiased text-gray-300 relative`}
      >
        <AppWalletProvider>
          <WalletProvider>
            {children}
            <Toaster />
          </WalletProvider>
        </AppWalletProvider>
      </body>
    </html>
  );
}
