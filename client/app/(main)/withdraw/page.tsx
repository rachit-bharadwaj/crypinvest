import { Balance, UpcomingPayments, Withdrawals } from "@/components/withdraw";

export default function WithdrawPage() {
  return (
    <div className="flex justify-between gap-10">
      <div className="flex flex-col gap-5 flex-1">
        <Balance />
        <Withdrawals />
      </div>
    </div>
  );
}
