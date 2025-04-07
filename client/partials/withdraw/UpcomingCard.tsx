import { addCommasToNumber } from "@/lib/utils";
import { UpcomingCardProps } from "@/types/withdraw";

export default function UpcomingCard({
  amount,
  title,
  date,
  method,
  remainingAmount,
}: UpcomingCardProps) {
  return (
    <div className="bg-white p-5 rounded-lg flex flex-col gap-2 shadow max-w-xs">
      <p className="text-xl font-bold">
        {title}&nbsp;{date.toLocaleDateString()}
      </p>

      <p className="text-2xl font-bold">${addCommasToNumber(amount, "roman")}</p>

      <p> {method}</p>

      <hr />

      <p>Total remaining payment</p>
      <p className="font-semibold">${addCommasToNumber(remainingAmount, "roman")}</p>
    </div>
  );
}
