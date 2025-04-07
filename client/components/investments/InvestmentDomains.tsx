"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { dashboardImages } from "@/public/images";
import { Info } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useState } from "react";

interface InvestmentCategory {
  id: string;
  title: string;
  image: string | StaticImageData;
  amountRaised: number;
  totalAmount: number;
  returnRange: string;
  details: string;
}

const categories: InvestmentCategory[] = [
  {
    id: "forex",
    title: "Forex Industry",
    image: dashboardImages.forex,
    amountRaised: 1329604,
    totalAmount: 2000000,
    returnRange: "11-51% returns annually",
    details:
      "USQ Financial specializes in managing pooled funds within the forex market, leveraging expert strategies to deliver performance-based returns. Our team ensures transparency, risk management, and consistent growth opportunities for investors looking to capitalize on the dynamic forex industry.",
  },
  {
    id: "crypto",
    title: "Cryptocurrency - Coming Soon",
    image: dashboardImages.crypto,
    amountRaised: 1778318,
    totalAmount: 2500000,
    returnRange: "10 - 100+% returns annually",
    details:
      "Expanding into the future of finance, USQ Financial will soon introduce cryptocurrency investment services. Our dedicated team is developing robust strategies to provide clients with secure, high-performing opportunities in the rapidly evolving crypto space.",
  },
  {
    id: "realestate",
    title: "Real Estate - Coming Soon",
    image: dashboardImages.realEstate,
    amountRaised: 389852,
    totalAmount: 1000000,
    returnRange: "5-25% returns annually",
    details:
      "USQ Financial offers premium real estate management services, catering exclusively to private clients. With proven expertise in property management and investment, we deliver tailored solutions to maximize returns while maintaining asset value. This service is currently not available to the public.",
  },
];

export default function InvestmentCategories() {
  const [showModal, setShowModal] = useState(false);
  const [modalDetails, setModalDetails] = useState<InvestmentCategory | null>(
    null
  );

  const handleCardClick = (category: InvestmentCategory) => {
    setModalDetails(category);
    setShowModal(true);
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {categories.map((category) => (
        <Card
          key={category.id}
          className={`overflow-hidden relative bg-[#1A1B2E] border-[#2A2D44] ${
            category.id !== "forex" ? "group" : ""
          }`}
          style={{
            animation: "shining-border 3s linear infinite",
          }}
        >
          <div className="relative h-80 w-full">
            <Image
              src={category.image || "/placeholder.svg"}
              alt={category.title}
              fill
              className="object-cover"
            />
          </div>
          {category.id !== "forex" && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0A0B1D] via-[#0A0B1D]/70 to-transparent opacity-0 group-hover:opacity-100 items-center justify-center transition-opacity duration-300 flex flex-col gap-10 p-5">
              <p className="text-white text-7xl font-extrabold tracking-wide animate-pulse">
                Coming Soon
              </p>

              <div className="flex gap-5 w-full">
                {category.id === "crypto" && (
                  <Link
                    target="_blank"
                    href="https://app.crc.club/forixo"
                    className="w-full"
                  >
                    <Button
                      variant="secondary"
                      className="w-full bg-[#00E4FF] text-[#0A0B1D] hover:bg-[#00E4FF]/80"
                    >
                      Visit CRC
                    </Button>
                  </Link>
                )}
                <Button
                  onClick={() => handleCardClick(category)}
                  variant="outline"
                  className="w-full border-[#00E4FF] text-[#00E4FF] hover:text-white hover:bg-[#00E4FF]/90 bg-[#0A0B1D]"
                >
                  <Info className="mr-2" />
                  <span>Know more</span>
                </Button>
              </div>
            </div>
          )}
          <CardContent className="p-6">
            <h3 className="text-2xl font-bold mb-4 text-white">
              {category.title}
            </h3>
            <div className="space-y-2">
              <p className="text-lg font-medium text-center mt-4 text-[#00E4FF]">
                {category.returnRange}
              </p>
            </div>
          </CardContent>
          <CardFooter className="p-6 pt-0 flex gap-5">
            {category.id === "forex" && (
              <>
                <Link href="/plans" className="w-full">
                  <Button
                    variant="secondary"
                    className="w-full text-lg bg-[#00E4FF] text-[#0A0B1D] hover:bg-[#00E4FF]/80"
                  >
                    Let&apos;s Go
                  </Button>
                </Link>
                <Button
                  onClick={() => handleCardClick(category)}
                  variant="outline"
                  className="border-[#00E4FF] text-[#00E4FF] hover:text-white hover:bg-[#00E4FF]/90 bg-[#0A0B1D]"
                >
                  <Info />
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      ))}

      {/* Modal for Coming Soon Categories */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-[#1A1B2E] border-[#2A2D44] text-white">
          <DialogHeader>
            <DialogTitle className="text-[#00E4FF]">
              {modalDetails?.title}
            </DialogTitle>
          </DialogHeader>
          <p className="mt-3 text-[#8A8FB9]">{modalDetails?.details}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
