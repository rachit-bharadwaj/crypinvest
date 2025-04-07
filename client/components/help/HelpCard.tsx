"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, PhoneCall } from "lucide-react";
import Link from "next/link";

export default function HelpCard() {
  return (
    <Card
      className="mt-8 bg-[#1A1B2E] border-[#2A2D44] text-white"
      style={{
        animation: "shining-border 3s linear infinite",
      }}
    >
      <CardHeader>
        <CardTitle className="text-2xl font-semibold flex items-center text-[#00E4FF]">
          <HelpCircle className="mr-2" /> Need Assistance?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-6 text-[#8A8FB9]">
          If you have any questions about cryptocurrency trading or need
          technical support, our team is here to help.
        </p>
        <Link href="tel:+44 7719040996" className="flex items-center">
          <Button
            variant="outline"
            className="bg-transparent border-[#00E4FF] text-[#00E4FF] hover:bg-[#00E4FF] hover:text-[#0A0B1D] transition-colors duration-300"
          >
            <PhoneCall className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
