"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

import {
  INVESTMENT_BASE_URL,
  INVESTMENT_REQUEST_BASE_URL,
  REFERRAL_BASE_URL,
} from "@/constants/api";
import { toast } from "sonner";

// images
import { useWallet } from "@/contexts/Wallet";
import { CheckCircleIcon, SparklesIcon } from "lucide-react";

export default function Plans() {
  const [status, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVIPConfirmation, setShowVIPConfirmation] = useState(false);
  const [provider, setProvider] = useState<any>(null);

  const [modalDetails, setModalDetails] = useState({
    plan: "",
    amount: "",
  });

  const [signedTransaction, setSignedTransaction] =
    useState<Transaction | null>(null);

  const { walletAddress } = useWallet();

  useEffect(() => {
    // Client-side only code
    if (typeof window !== "undefined") {
      const phantomProvider = window.solana;
      if (!phantomProvider?.isPhantom) {
        throw new Error("Phantom Wallet not found.");
      }
      setProvider(phantomProvider);
    }
  }, []);

  const connectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const { publicKey } = await window.solana.connect();
        const publicKeyShort = `${publicKey
          ?.toString()
          .slice(0, 5)}...${publicKey?.toString().slice(-5)}`;
        setStatus(`Connected wallet: ${publicKeyShort}`);
        return publicKey.toString();
      } catch (error: any) {
        setStatus("Failed to connect wallet.");
        throw error;
      }
    } else {
      setStatus(
        "Phantom Wallet not found. Please install it: https://phantom.app"
      );
      throw new Error("Phantom Wallet not found.");
    }
  };

  const startInvestment = async (usdAmount: number) => {
    try {
      setIsLoading(true);
      const walletAddress = await connectWallet();
      if (!walletAddress) throw new Error("Wallet address not found.");

      const connection = new Connection(
        "https://twilight-little-smoke.solana-mainnet.quiknode.pro/a26b315af627e37eca9047f40ea862e040df3c00",
        { commitment: "confirmed" }
      );
      const senderPublicKey = new PublicKey(walletAddress);

      // USDC Configuration
      const usdcMintAddress = new PublicKey(
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
      );
      const senderUsdcAccount = getAssociatedTokenAddressSync(
        usdcMintAddress,
        senderPublicKey
      );

      // Ensure USDC account exists
      const senderUsdcAccountInfo = await connection.getAccountInfo(
        senderUsdcAccount
      );
      if (!senderUsdcAccountInfo) {
        toast.error(
          "USDC token account not found. Please ensure you have a USDC account."
        );
        setIsLoading(false);
        return;
      }

      // Get USDC balance
      const balanceResponse = await connection.getTokenAccountBalance(
        senderUsdcAccount
      );
      const usdcBalance = parseInt(balanceResponse.value.amount);
      const usdcAmount = Math.round(usdAmount * 1e6); // USDC has 6 decimals

      if (usdcBalance < usdcAmount) {
        toast.error(
          `Insufficient USDC funds. Your wallet has ${
            usdcBalance / 1e6
          } USDC, but ${usdAmount} USDC is required.`
        );
        setIsLoading(false);
        return;
      }

      // Updated recipient USDC address
      const recipientAddress = "FhSzEMXti3QReqxCMgNT5xrBkafiRcZhDxX7zscuVGKw";
      const recipientPublicKey = new PublicKey(recipientAddress);

      // Create USDC transfer instruction
      const transferInstruction = createTransferInstruction(
        senderUsdcAccount,
        getAssociatedTokenAddressSync(usdcMintAddress, recipientPublicKey),
        senderPublicKey,
        usdcAmount,
        [],
        TOKEN_PROGRAM_ID
      );

      const transaction = new Transaction().add(transferInstruction);
      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(walletAddress);

      if (window && window.solana) {
        const signedTransaction = await provider.signTransaction(transaction);
        const serializedTx = signedTransaction.serialize();

        const signature = await connection.sendRawTransaction(serializedTx);
        await connection.confirmTransaction(signature, "confirmed");

        // Display success toast and update the status
        toast.success(
          `Investment successful! Transaction ID: ${signature.slice(0, 8)}...`
        );
        setStatus(`Investment successful! Transaction ID: ${signature}`);
        setShowModal(false);

        const reqData = {
          walletAddress,
          planName: modalDetails.plan, // Pass the plan name
          amount: usdAmount, // Pass the amount in USD
          status: "Completed", // Set the status to 'Completed'
          transactionId: signature, // Add the transaction ID
        };

        // Create the investment record in the backend
        const response = await fetch(`${INVESTMENT_BASE_URL}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reqData),
        });

        const result = await response.json();
        console.log(reqData);

        if (response.ok) {
          toast.success("Investment record created successfully!");
          console.log("Investment Record:", result.investment);

          // Call Referral API after successful investment
          const referralPayload = {
            walletAddress,
            investmentAmount: usdAmount,
          };

          try {
            const referralResponse = await fetch(
              `${REFERRAL_BASE_URL}/update-by-wallet`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(referralPayload),
              }
            );

            const referralResult = await referralResponse.json();

            console.log(referralResult);
            if (referralResponse.ok) {
              toast.success("Referral commission updated successfully!");
              window.location.reload();
            } else {
              toast.error(`Failed to update referral: ${referralResult.error}`);
              console.error("Referral Update Error:", referralResult.error);
            }
          } catch (error) {
            console.error("Error updating referral:", error);
            toast.error("An error occurred while updating the referral.");
          }
        } else {
          toast.error(`Failed to create investment record: ${result.error}`);
        }
      }
    } catch (error: any) {
      if (error.logs) {
        console.error("Transaction Logs:", error.logs);
      }
      console.error("Error during investment:", error);

      // Display error toast
      toast.error(`Investment failed: ${error.message}`);
      setStatus(`Investment failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvestmentClick = (plan: any) => {
    setModalDetails({ plan, amount: "" });
    setShowDisclaimer(true);
  };

  const validateAmount = () => {
    const amount = parseFloat(modalDetails.amount);
    if (modalDetails.plan === "Standard" && (amount < 1 || amount > 20000)) {
      toast.error("Amount must be between $1, and $20,000 for Standard Plan.");
      return false;
    }
    if (modalDetails.plan === "VIP" && (amount <= 20000 || amount > 2000000)) {
      toast.error(
        "Amount must be between $20,001 and $2,000,000 for VIP Plan."
      );
      return false;
    }
    return true;
  };

  const confirmVIPInvestment = async () => {
    try {
      setIsLoading(true);
      if (!walletAddress) throw new Error("Wallet address not found.");

      const poolName = "VIP";
      const reqBody = { walletAddress, poolName };

      const response = await fetch(`${INVESTMENT_REQUEST_BASE_URL}/wallet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Investment request submitted successfully!");
      } else {
        toast.error(`Failed to submit investment request: ${result.error}`);
      }
    } catch (error) {
      console.error("Error during investment request:", error);
      toast.error("Failed to submit investment request.");
    } finally {
      setIsLoading(false);
      setShowVIPConfirmation(false); // Close the confirmation modal
    }
  };

  const handleRequestInvestment = () => {
    setShowVIPConfirmation(true); // Show confirmation modal
  };

  return (
    <>
      <section className="flex gap-10 flex-wrap justify-evenly p-4 sm:p-6">
        {/* Standard Plan */}
        <div className="relative bg-gradient-to-br from-[#1a1b2e] to-blue-600/30 backdrop-blur-lg border border-cyan-500/30 p-6 rounded-2xl flex flex-col gap-6 w-full max-w-[400px] shadow-2xl shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-300 justify-between">
          <div className="absolute top-0 right-0 bg-cyan-600/20 text-cyan-700 px-4 py-1 rounded-bl-xl rounded-tr-xl text-sm font-semibold">
            Most Popular
          </div>
          <div className="flex flex-col items-center gap-4 mt-5">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-500 bg-clip-text text-transparent">
              Standard Plan
            </h2>
          </div>

          <ul className="space-y-4">
            <li className="flex items-center gap-2 text-gray-300">
              <CheckCircleIcon className="w-5 h-5 text-cyan-600" />
              <span>
                Minimum deposit:{" "}
                <span className="text-cyan-600 font-semibold text-lg">
                  $1,000
                </span>
              </span>
            </li>
            <li className="flex items-center gap-2 text-gray-300">
              <CheckCircleIcon className="w-5 h-5 text-cyan-600" />
              <span>
                Annual ROI:{" "}
                <span className="text-cyan-600 font-semibold text-lg">
                  11% - 51%
                </span>
              </span>
            </li>
            <li className="flex items-center gap-2 text-gray-300">
              <CheckCircleIcon className="w-5 h-5 text-cyan-600" />
              Flexible withdrawals with dynamic yields
            </li>
          </ul>

          <Button
            onClick={() => handleInvestmentClick("Standard")}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-lg font-semibold h-12 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
          >
            Start Investing
          </Button>
        </div>

        {/* VIP Plan */}
        <div className="relative bg-gradient-to-br from-[#1a1b2e] to-yellow-500/30 backdrop-blur-lg border border-orange-500/30 p-6 rounded-2xl flex flex-col gap-6 w-full max-w-[400px] shadow-2xl shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300 group justify-between">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-gray-700 px-6 py-1 rounded-full text-sm font-bold shadow-lg">
            EXCLUSIVE VIP
          </div>
          <div className="flex flex-col items-center gap-4 mt-5">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-orange-700 to-yellow-700 bg-clip-text text-transparent">
              VIP Plan
            </h2>
          </div>

          <ul className="space-y-4">
            <li className="flex items-center gap-2 text-gray-300">
              <SparklesIcon className="w-5 h-5 text-orange-400" />
              <span>
                Minimum deposit:{" "}
                <span className="text-orange-700 font-semibold text-lg">
                  $20,000+
                </span>
              </span>
            </li>
            <li className="flex items-center gap-2 text-gray-300">
              <SparklesIcon className="w-5 h-5 text-orange-400" />
              <span>
                Premium ROI:{" "}
                <span className="text-orange-700 font-semibold text-lg">
                  Up to 89%
                </span>
              </span>
            </li>
            <li className="flex items-center gap-2 text-gray-300">
              <SparklesIcon className="w-5 h-5 text-orange-400" />
              Personalized wealth management
            </li>
            <li className="flex items-center gap-2 text-gray-300">
              <SparklesIcon className="w-5 h-5 text-orange-400" />
              Priority 24/7 support
            </li>
          </ul>

          <Button
            onClick={handleRequestInvestment}
            className="w-full bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-500 hover:to-yellow-400 text-lg font-semibold h-12 rounded-xl relative overflow-hidden transition-all duration-500 hover:shadow-orange-500/40"
          >
            <span className="relative z-10">Request Investment</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </div>
      </section>

      <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <DialogContent className="bg-[#1A1B2E] border-none">
          <DialogHeader>
            <DialogTitle>Disclaimer</DialogTitle>
          </DialogHeader>

          <p className="mt-3">
            USQ financials offers portfolio management services based on
            research and best practices. Investments involve risks, and outcomes
            may vary due to market conditions. USQ is not responsible for any
            losses or decisions made using our services. Use of this site
            implies acceptance of these terms.
          </p>

          <DialogFooter>
            <Button
              onClick={() => {
                setShowDisclaimer(false);
                setShowModal(true);
              }}
              className="bg-[#00E4FF] text-[#1a1b2e] hover:bg-[#00E4FF]/80"
            >
              Agree
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-[#1A1B2E] border-none">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>

          <p className="mt-3">Plan: {modalDetails.plan}</p>
          <div className="mt-3">
            <label htmlFor="amount" className="text-sm text-gray-600">
              Investment Amount (USD):
            </label>
            <input
              type="number"
              id="amount"
              placeholder="Enter amount"
              value={modalDetails.amount}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d*$/.test(value)) {
                  setModalDetails({ ...modalDetails, amount: value });
                }
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "-" ||
                  e.key === "ArrowUp" ||
                  e.key === "ArrowDown"
                ) {
                  e.preventDefault();
                }
              }}
              className="w-full rounded px-3 py-2 mt-1 bg-[#1A1B2E] text-white border-white"
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-gray-400">Status</p>
            <p>{status}</p>
          </div>

          <DialogFooter className="mt-5">
            <Button
              disabled={isLoading}
              onClick={() => {
                if (validateAmount()) {
                  startInvestment(parseFloat(modalDetails.amount));
                }
              }}
              className="bg-[#00E4FF] text-[#1a1b2e] hover:bg-[#00E4FF]/80"
            >
              {isLoading ? <ClipLoader color="white" /> : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showVIPConfirmation} onOpenChange={setShowVIPConfirmation}>
        <DialogContent className="bg-[#1A1B2E] border-none">
          <DialogHeader>
            <DialogTitle>Confirm Investment Request</DialogTitle>
          </DialogHeader>
          <p className="mt-3">
            Are you sure you want to request an investment for the VIP Plan?
            This action cannot be undone.
          </p>
          <DialogFooter className="mt-5">
            <Button
              onClick={confirmVIPInvestment}
              className="bg-[#00E4FF] text-[#1a1b2e] hover:bg-[#00E4FF]/80"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
