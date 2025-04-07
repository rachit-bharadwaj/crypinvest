"use client";

import { addCommasToNumber } from "@/lib/utils";
import { AmountCardProps } from "@/types/dashboard";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function AmountCard({
  amount,
  icon,
  increasePercent,
  title,
  depositedAmount,
  monthlyLimit,
  requiredAmount,
}: AmountCardProps) {
  const [percentCompleted, setPercentCompleted] = useState(0);
  const [depositedAmountFormatted, setDepositedAmountFormatted] = useState("");

  const amountFormatted = addCommasToNumber(amount, "roman");

  useEffect(() => {
    if (depositedAmount && requiredAmount) {
      const percent = (depositedAmount / requiredAmount) * 100;
      setPercentCompleted(percent);
      const amountDepositted = addCommasToNumber(depositedAmount, "roman");
      setDepositedAmountFormatted(amountDepositted);
    }
  }, [depositedAmount, requiredAmount]);

  return (
    <div className="flex flex-col gap-3 justify-between bg-white rounded-2xl p-5 shadow">
      <div className="flex justify-between min-gap-5">
        <div className="flex flex-col gap-1">
          <p className="text-xl font-bold">{title}</p>
          <p className="text-2xl font-bold text-primary">$ {amountFormatted}</p>
        </div>

        <Image
          src={icon}
          alt={title}
          width={500}
          height={500}
          className="h-16 w-fit"
        />
      </div>

      <div className="flex flex-col gap-3">
        {depositedAmount && requiredAmount && (
          <div className="space-y-2">
            <div className="relative h-8">
              <div className="h-full rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full justify-center flex bg-gradient-plan-range-bar relative"
                  style={{ width: `${percentCompleted}%` }}
                >
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-semibold">
                    {depositedAmountFormatted}
                  </span>
                </div>
              </div>
              <div
                className="absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#051C61] flex items-center justify-center text-white font-semibold"
                style={{ left: `calc(${percentCompleted}% - 24px)` }}
              >
                {percentCompleted.toPrecision(2)}%
              </div>
            </div>
          </div>
        )}

        <p className="text-green-600">+ {increasePercent}% year over year</p>
      </div>
    </div>
  );
}
