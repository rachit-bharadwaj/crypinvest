import { upcomingPayments } from "@/constants/withdraw";
import { UpcomingCard } from "@/partials/withdraw";

export default function UpcomingPayments() {
  return (
    <div className="flex flex-col gap-7">
      {upcomingPayments.map((payment, index) => (
        <UpcomingCard key={index} {...payment} />
      ))}
    </div>
  );
}
