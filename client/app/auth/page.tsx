"use client";

import axios from "axios";

import Cookies from "js-cookie";

// next
import { useRouter } from "next/navigation";

// react
import { useCallback, useEffect, useState } from "react";

// wallet
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

// components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// locals
import { Card } from "@/components/ui/card";
import { AUTH_BASE_URL } from "@/constants/api";
import { useWallet } from "@/contexts/Wallet";
import { ArrowRight, Shield, Wallet } from "lucide-react";
import Link from "next/link";

const RegisterPage = () => {
  const { publicKey, signMessage } = useSolanaWallet();

  const { walletAddress, setWalletAddress, setStatus, status } = useWallet();
  const [walletVerified, setWalletVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Detect mobile browser
  const isMobileBrowser = () => {
    return /Mobi|Android/i.test(navigator.userAgent);
  };

  useEffect(() => {
    const authenticateWallet = async () => {
      if (!publicKey) {
        setStatus("Wallet not connected.");
        return;
      }

      setLoading(true);

      // try {
      //   // Fetch the nonce from the backend
      //   const nonceResponse = await axios.post(`${AUTH_BASE_URL}/nonce`, {
      //     walletAddress: publicKey.toString(),
      //   });

      //   const nonce = nonceResponse.data.nonce;
      //   if (!nonce) {
      //     setStatus("Failed to fetch nonce.");
      //     return;
      //   }

      //   const message = `Sign this message to authenticate. Nonce: ${nonce}`;
      //   const encodedMessage = new TextEncoder().encode(message);

      //   // Handle message signing differently for mobile vs. desktop
      //   let signature;
      //   if (isMobileBrowser() && signMessage) {
      //     // Mobile: Redirect to wallet for signing
      //     signature = await signMessage(encodedMessage);
      //   } else {
      //     // Desktop: Standard signing flow
      //     if (!signMessage) {
      //       setStatus("Wallet not connected.");
      //       return;
      //     }
      //     signature = await signMessage(encodedMessage);
      //   }

      //   // Send the signed message to the backend for verification
      //   const response = await axios.post(`${AUTH_BASE_URL}/verify-wallet`, {
      //     publicKey: publicKey.toString(),
      //     signature: Buffer.from(signature).toString("base64"),
      //     message,
      //   });

      //   if (response.data.success) {
      //     // Handle success
      setStatus("Authentication successful!");
      setWalletAddress(publicKey.toString());
      setWalletVerified(true);
      setLoading(false);
      //   } else {
      //     setStatus("Authentication failed: " + response.data.error);
      //   }
      // } catch (error) {
      //   if (error instanceof Error && error.message.includes("User rejected")) {
      //     setStatus("Wallet signature rejected by user.");
      //   } else {
      //     console.error("Error during wallet authentication:", error);
      //     setStatus("Failed to authenticate wallet: " + error);
      //   }
      // } finally {
      //   setLoading(false);
      // }
    };

    if (publicKey) {
      setWalletAddress(publicKey.toString());
      setWalletVerified(false);

      authenticateWallet();
    }
  }, [publicKey, setStatus, setWalletAddress, signMessage]);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${AUTH_BASE_URL}/user-exists`, {
        walletAddress,
      });

      const resData = res.data;

      if (res.status === 200 && resData.success) {
        router.push("/");
      } else {
        throw new Error("Unexpected response structure");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        router.push("/auth/kyc");
      } else {
        console.error("Error during authentication:", error);
        setStatus("An error occurred while verifying the wallet.");
      }
    } finally {
      setLoading(false);
    }
  }, [walletAddress, router, setStatus]);

  useEffect(() => {
    if (walletVerified && !loading) {
      handleSubmit();
    }
  }, [walletVerified, handleSubmit]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("walletAddress", walletAddress);
    }
    Cookies.set("walletAddress", walletAddress, { expires: 1 });
  }, [walletAddress]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("status", status);
    }
  }, [status]);

  return (
    <div>
      <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
        <div className="text-center mb-12 px-3">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#3898FF] to-[#00E4FF] bg-clip-text text-transparent">
            Register your wallet
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join our secure platform by connecting your wallet. Start your
            journey into decentralized finance.
          </p>
        </div>

        <Card className="bg-[#1A1B1E] rounded-none w-full border-0 p-6 md:p-8 lg:rounded-3xl">
          <div className="space-y-8">
            <div className="bg-[#00E4FF] rounded-xl flex justify-center items-center lg:w-fit px-10 lg:mx-auto">
              <WalletMultiButton
                className="w-full"
                style={{
                  backgroundColor: "#00E4FF",
                  color: "#1a1b2e",
                  width: "100%",
                  fontSize: "1.25rem",
                }}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#00E4FF]/10 p-3 rounded-full">
                  <Wallet className="w-6 h-6 text-[#00E4FF]" />
                </div>
                <h2 className="text-2xl font-semibold text-white">
                  Connect Wallet
                </h2>
              </div>
              <p className="text-gray-400">
                Connect your wallet to start the registration process. You will
                proceed through secure verification steps.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#00E4FF]/10 p-3 rounded-full">
                  <Shield className="w-6 h-6 text-[#00E4FF]" />
                </div>
                <h2 className="text-2xl font-semibold text-white">
                  Secure Verification
                </h2>
              </div>
              <p className="text-gray-400">
                Your security is our priority. All connections are encrypted and
                verified through blockchain.
              </p>
            </div>

            <div className="flex flex-wrap gap-1 lg:justify-center">
              <p className="text-gray-400 text-nowrap">
                By Connecting, I accept
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="underline text-[#00E4FF] text-nowrap">
                    Terms and Conditions
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-[#1A1B2E]">
                  <DialogHeader>
                    <DialogTitle>Terms and Conditions</DialogTitle>
                  </DialogHeader>
                  <p className="text-gray-400">
                    By using this platform, you agree to abide by all applicable
                    laws and regulations. You also acknowledge the risks
                    associated with investments and take full responsibility for
                    your actions.
                  </p>
                  <Link
                    className="border w-fit px-5 py-2 rounded-lg"
                    href="https://usqfinancial.com/terms-and-conditions/"
                  >
                    Learn more
                  </Link>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
