import { AmountCard } from "@/partials/dashboard";
import { dashboardIcons } from "@/public/icons";

export default function AmountCards() {
  return (
    <section className="flex flex-col gap-5">
      <AmountCard
        title="Capital"
        icon={dashboardIcons.pay}
        amount={240546}
        increasePercent={26.5}
      />

      <AmountCard
        title="You Receive"
        icon={dashboardIcons.receive}
        amount={40546}
        increasePercent={26.5}
      />

      <AmountCard
        title="Total Balance"
        icon={dashboardIcons.balance}
        amount={140546}
        increasePercent={26.5}
        depositedAmount={90576}
        requiredAmount={120000}
      />
    </section>
  );
}
